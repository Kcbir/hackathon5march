"""
twilio_voice.py — Twilio Voice Integration for Mysore Cafe

Uses Twilio <Say> for TTS (no external audio service needed) and <Gather speech>
to capture the caller's responses.

  1. POST /twilio/voice   — webhook on new call; greets caller + opens Gather
  2. POST /twilio/respond — receives SpeechResult; runs LLM; loops or hangs up
  3. POST /twilio/call    — triggers an outbound call to a given number
"""

import uuid
import asyncio
from datetime import datetime

from fastapi import APIRouter, Request, Response
from twilio.twiml.voice_response import VoiceResponse, Gather, Say
from twilio.rest import Client


def _main():
    """Lazy import of main to avoid circular imports at module load time."""
    import main as _m
    return _m

# ── Credentials ──────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID = "AC07d9cd91083115b2f50e1237893a2e6e"
TWILIO_AUTH_TOKEN  = "a253f6aa57f6bf7e5ee66fc5e29393e8"
TWILIO_FROM        = "+19402896502"

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/twilio", tags=["twilio"])


def _build_twiml(text: str, action_url: str, hang_up: bool = False) -> str:
    """
    Build TwiML that speaks `text` via <Say> then either hangs up or opens
    a <Gather> waiting for the caller's next utterance.
    """
    vr = VoiceResponse()

    if hang_up:
        vr.say(text, voice="Polly.Aditi", language="en-IN")
        vr.hangup()
    else:
        gather = Gather(
            input="speech",
            action=action_url,
            method="POST",
            language="en-IN",
            speech_timeout="auto",
            timeout=8,
        )
        gather.say(text, voice="Polly.Aditi", language="en-IN")
        vr.append(gather)
        # If caller says nothing within timeout, re-prompt
        vr.redirect(action_url, method="POST")

    return str(vr)


def _base_url(request: Request) -> str:
    import os
    env = os.getenv("TWILIO_BASE_URL", "").rstrip("/")
    if env:
        return env
    return str(request.base_url).rstrip("/")


# ── 1. Incoming call ──────────────────────────────────────────────────────────
@router.post("/voice")
async def incoming_call(request: Request):
    """
    Twilio hits this endpoint when someone calls the Twilio number.
    Creates a session, generates the greeting TTS, and returns TwiML.
    """
    form = await request.form()
    call_sid = form.get("CallSid") or uuid.uuid4().hex[:8]

    m = _main()
    # Create a new ordering session keyed by CallSid
    m.sessions[call_sid] = {
        "history":          [],
        "name":             form.get("CallerName") or None,
        "fav":              None,
        "order_id":         f"ORD-{uuid.uuid4().hex[:6].upper()}",
        "prompt":           m.build_prompt(),
        "special_requests": [],
    }

    greeting = (
        "Vanakkam! This is Mysore Cafe. Arjun speaking. "
        "What can I get for you today?"
    )
    m.sessions[call_sid]["history"].append({
        "role":    "assistant",
        "content": f'{{"tts_message": "{greeting}", "cart_status": "shopping", "order_data": []}}',
    })

    base = _base_url(request)
    twiml = _build_twiml(greeting, f"{base}/twilio/respond")
    return Response(content=twiml, media_type="application/xml")


# ── 2. Gather response ────────────────────────────────────────────────────────
@router.post("/respond")
async def respond_to_gather(request: Request):
    """
    Twilio posts the caller's SpeechResult here after each Gather.
    Runs it through the LLM pipeline and returns the next TwiML.
    """
    form        = await request.form()
    call_sid    = form.get("CallSid") or ""
    speech_text = (form.get("SpeechResult") or "").strip()
    base        = _base_url(request)

    m = _main()
    # Recover session if missing (e.g. redirect hit before /voice)
    if call_sid not in m.sessions:
        m.sessions[call_sid] = {
            "history":          [],
            "name":             None,
            "fav":              None,
            "order_id":         f"ORD-{uuid.uuid4().hex[:6].upper()}",
            "prompt":           m.build_prompt(),
            "special_requests": [],
        }

    # No speech detected — re-prompt
    if not speech_text:
        msg = "Sorry, I didn't catch that. Could you please say your order again?"
        twiml = _build_twiml(msg, f"{base}/twilio/respond")
        return Response(content=twiml, media_type="application/xml")

    # Run through the LLM pipeline
    data = await asyncio.to_thread(m.process_turn, call_sid, speech_text)

    tts_msg     = data.get("tts_message", "One moment please.")
    cart_status = data.get("cart_status", "shopping")

    # Accumulate special requests across turns
    sr = data.get("special_requests")
    if sr:
        m.sessions[call_sid].setdefault("special_requests", []).append(sr)

    hang_up = (cart_status == "closed")
    twiml   = _build_twiml(tts_msg, f"{base}/twilio/respond", hang_up=hang_up)

    # Persist order when conversation is done
    if hang_up:
        order_data = data.get("order_data", [])
        m.save_order({
            "order_id":         m.sessions[call_sid]["order_id"],
            "customer_name":    m.sessions[call_sid].get("name"),
            "items":            order_data,
            "total":            data.get("order_total", m.calc_total(order_data)),
            "delivery_type":    data.get("delivery_type"),
            "delivery_address": data.get("delivery_address"),
            "special_requests": ", ".join(m.sessions[call_sid].get("special_requests", [])) or None,
            "rating":           data.get("customer_rating"),
            "timestamp":        datetime.now().isoformat(),
        })
        m.save_call_logs(call_sid, m.sessions[call_sid]["history"])

    return Response(content=twiml, media_type="application/xml")


# ── 3. Outbound call trigger ─────────────────────────────────────────────────
@router.post("/call")
async def make_outbound_call(request: Request):
    """
    Triggers an outbound call.

    Body (JSON):
      { "to": "+919825526632" }   ← phone number to call (optional, defaults below)
    """
    body      = await request.json()
    to_number = body.get("to", "+919825526632")
    base      = _base_url(request)
    voice_url = f"{base}/twilio/voice"

    call = twilio_client.calls.create(
        url=voice_url,
        to=to_number,
        from_=TWILIO_FROM,
    )

    return {"call_sid": call.sid, "status": call.status, "to": to_number}

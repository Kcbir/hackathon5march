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
from twilio.twiml.voice_response import VoiceResponse, Gather
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

# ── In-memory audio store (clip_id → MP3 bytes) ──────────────────────────────
_audio_store: dict[str, bytes] = {}


def _store_audio(audio_bytes: bytes) -> str:
    clip_id = uuid.uuid4().hex
    _audio_store[clip_id] = audio_bytes
    return clip_id


def _build_twiml(base_url: str, clip_id: str, hang_up: bool = False) -> str:
    """
    Build TwiML that plays a Sarvam TTS audio clip then either hangs up
    or opens a <Gather> for the caller's next utterance.
    """
    vr = VoiceResponse()
    vr.play(f"{base_url}/twilio/audio/{clip_id}")

    if hang_up:
        vr.hangup()
    else:
        gather = Gather(
            input="speech",
            action=f"{base_url}/twilio/respond",
            method="POST",
            language="en-IN",
            speech_timeout="auto",
            timeout=8,
        )
        vr.append(gather)
        vr.redirect(f"{base_url}/twilio/respond", method="POST")

    return str(vr)


def _base_url(request: Request) -> str:
    import os
    env = os.getenv("TWILIO_BASE_URL", "").rstrip("/")
    if env:
        return env
    return str(request.base_url).rstrip("/")


def send_order_sms(to_number: str, order_id: str, items: list, total: int,
                   delivery_type: str = None, special_requests: str = None):
    """Send an SMS order confirmation to the customer."""
    if not to_number:
        return

    lines = [f"Mysore Cafe - Order Confirmed! ✅",
             f"Order ID: {order_id}", ""]

    for item in items:
        name  = item.get("name", item.get("item_code", "?"))
        qty   = item.get("qty", 1)
        price = item.get("price", 0)
        lines.append(f"{qty}x {name} - Rs.{price * qty}")

    lines.append("")
    lines.append(f"Total: Rs.{total}")

    if delivery_type:
        lines.append(f"Type: {delivery_type.capitalize()}")
    if special_requests:
        lines.append(f"Note: {special_requests}")

    lines.append("Ready in ~16 min. Thank you! 🙏")

    body = "\n".join(lines)

    try:
        msg = twilio_client.messages.create(
            from_=TWILIO_FROM,
            body=body,
            to=to_number,
        )
        print(f"SMS sent to {to_number} | SID: {msg.sid}")
    except Exception as e:
        print(f"SMS failed: {e}")


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
    # For outbound calls To = customer; for inbound From = customer
    caller_number = form.get("To") or form.get("From") or ""
    # Create a new ordering session keyed by CallSid
    m.sessions[call_sid] = {
        "history":          [],
        "name":             form.get("CallerName") or None,
        "fav":              None,
        "order_id":         f"ORD-{uuid.uuid4().hex[:6].upper()}",
        "prompt":           m.build_prompt(),
        "special_requests": [],
        "phone":            caller_number,
    }

    greeting = (
        "Vanakkam! This is Mysore Cafe. Arjun speaking. "
        "How may I help you?"
    )
    m.sessions[call_sid]["history"].append({
        "role":    "assistant",
        "content": f'{{"tts_message": "{greeting}", "cart_status": "shopping", "order_data": []}}',
    })

    audio_bytes = await asyncio.to_thread(m.synthesize, greeting)
    clip_id = _store_audio(audio_bytes)

    base = _base_url(request)
    twiml = _build_twiml(base, clip_id)
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
        audio_bytes = await asyncio.to_thread(m.synthesize, msg)
        clip_id = _store_audio(audio_bytes)
        return Response(content=_build_twiml(base, clip_id), media_type="application/xml")

    # Run through the LLM pipeline
    data = await asyncio.to_thread(m.process_turn, call_sid, speech_text)

    tts_msg     = data.get("tts_message", "One moment please.")
    cart_status = data.get("cart_status", "shopping")

    # Accumulate special requests across turns
    sr = data.get("special_requests")
    if sr:
        m.sessions[call_sid].setdefault("special_requests", []).append(sr)

    audio_bytes = await asyncio.to_thread(m.synthesize, tts_msg)
    clip_id = _store_audio(audio_bytes)

    hang_up = (cart_status == "closed")
    twiml   = _build_twiml(base, clip_id, hang_up=hang_up)

    # Persist order when conversation is done
    if hang_up:
        order_data    = data.get("order_data", [])
        total         = data.get("order_total", m.calc_total(order_data))
        delivery_type = data.get("delivery_type")
        special_reqs  = ", ".join(m.sessions[call_sid].get("special_requests", [])) or None
        order_id      = m.sessions[call_sid]["order_id"]
        phone         = m.sessions[call_sid].get("phone", "")

        m.save_order({
            "order_id":         order_id,
            "customer_name":    m.sessions[call_sid].get("name"),
            "items":            order_data,
            "total":            total,
            "delivery_type":    delivery_type,
            "delivery_address": data.get("delivery_address"),
            "special_requests": special_reqs,
            "rating":           data.get("customer_rating"),
            "timestamp":        datetime.now().isoformat(),
        })
        m.save_call_logs(call_sid, m.sessions[call_sid]["history"])

        # Send SMS confirmation to caller
        send_order_sms(
            to_number=phone,
            order_id=order_id,
            items=order_data,
            total=total,
            delivery_type=delivery_type,
            special_requests=special_reqs,
        )

    return Response(content=twiml, media_type="application/xml")


# ── 3. Audio clip server ─────────────────────────────────────────────────────
@router.get("/audio/{clip_id}")
async def serve_audio(clip_id: str):
    """Serves Sarvam TTS MP3 clips for Twilio <Play>."""
    audio = _audio_store.get(clip_id)
    if audio is None:
        return Response(status_code=404)
    return Response(content=audio, media_type="audio/mpeg")


# ── 4. Outbound call trigger ─────────────────────────────────────────────────
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

"""
Mudigonda Sharma Cafe — AI Voice Ordering Copilot
FastAPI server: STT → LLM → TTS + Live Judge Dashboard
"""

import json, uuid, os, re, base64, asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import requests
import uvicorn

load_dotenv()

# ═══════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════
GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
SARVAM_KEY = os.getenv("SARVAM_API_KEY", "")

groq_client = Groq(api_key=GROQ_KEY)

MENU = {
    "P01": {"name": "Aloo Paratha",        "price": 50},
    "C05": {"name": "Paneer Butter Masala", "price": 150},
    "B02": {"name": "Lassi",               "price": 60},
}

ORDERS_FILE = "orders.json"

app = FastAPI(title="Mudigonda Sharma Cafe — AI Voice Copilot")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# STATE
# ═══════════════════════════════════════════════════════════════
sessions = {}                        # sid → session dict
dashboard_clients: set = set()       # connected dashboard websockets

# ═══════════════════════════════════════════════════════════════
# ORDERS DB (JSON file)
# ═══════════════════════════════════════════════════════════════
def load_orders():
    if Path(ORDERS_FILE).exists():
        with open(ORDERS_FILE) as f:
            return json.load(f)
    return {"orders": []}

def save_order(order):
    db = load_orders()
    db["orders"].append(order)
    with open(ORDERS_FILE, "w") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

def calc_total(items):
    return sum(
        MENU.get(i.get("item_code"), {}).get("price", 0) * i.get("qty", 0)
        for i in items
    )

# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════
def build_prompt(name=None, fav=None):
    caller = ""
    if name:
        caller = f"\nThis is a returning customer: {name}. They've ordered before. Don't make a big deal of it — just be naturally warm.\n"

    return """You are Omkaar, a chill and friendly waiter at Mudigonda Sharma Cafe. You answer phone/voice orders. Talk naturally like a real person — short sentences, no corporate speak, no over-enthusiasm.

YOUR NAME: Omkaar. You work at the cafe.

MENU:
- Aloo Paratha (P01 — Rs.50)
- Paneer Butter Masala (C05 — Rs.150)
- Lassi (B02 — Rs.60)

TODAY'S OFFERS (keep these separate — only mention AFTER the customer has ordered something, and only if relevant):
- Buy 2 Lassi, get Rs.20 off
- Free Lassi with any Paneer Butter Masala order
- Add a second Aloo Paratha for just Rs.30
- Today's Special: Paneer Butter Masala + 2 Paratha combo for Rs.220
""" + caller + """
FLOW (follow this strictly):
1. GREETING: Always start with something like "Hello! This is Mudigonda Sharma Cafe. How can I help you today?" Or something like that but good Keep it natural.
2. TAKE ORDER: Listen, confirm items and quantities. If something is unclear, ask simply. Don't suggest items unprompted.
3. OFFER (only once, only if relevant): After they say what they want, if an offer matches their order, mention it casually. Like "btw we have an offer on that — want me to add it?" If nothing matches, skip it. Don't force.
4. DELIVERY OR TAKEOUT: Ask "Would you like this delivered or is this takeout?" If delivery, ask for their address.
5. CONFIRM: Read back the full order with prices and total. Ask "Shall I confirm this?"
6. RATING: After confirmation, ask "Quick one — how would you rate this ordering experience, 1 to 5?" and wait for their number.
7. CLOSE: Give them the order number and say their order will be ready/delivered in about 16 minutes. Say bye warmly.

RULES:
- Be brief. No long sentences. Talk like a real waiter on the phone.
- Don't say things like "I see you love X" or "Great choice!" — that's cringe.
- If customer sounds rushed, skip offers, skip small talk, just take the order fast.
- Only pitch offers ONCE and only if they match what the customer ordered.

Respond in STRICT JSON only — no markdown, no extra text:
{
  "thought_process": "Brief internal reasoning.",
  "tts_message": "What you say to the customer.",
  "conversation_stage": "greeting | ordering | offer | delivery | confirming | rating | closed",
  "ai_tone": "warm_and_friendly | urgent_and_concise | casual",
  "customer_analysis": {
    "sentiment": "happy | neutral | annoyed | anxious",
    "urgency": "low | medium | high"
  },
  "offer_pitched": "Description of offer mentioned, or null",
  "customer_feedback": "Customer's feedback text, or null",
  "customer_rating": null,
  "delivery_type": "delivery | takeout | null",
  "delivery_address": "Address string, or null",
  "cart_status": "shopping | confirming | closed",
  "order_data": [
    {"item_code": "P01", "qty": 1, "modifiers": "none"}
  ]
}"""

# ═══════════════════════════════════════════════════════════════
# LLM
# ═══════════════════════════════════════════════════════════════
def call_llm(messages):
    completion = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        stream=True,
    )
    full = ""
    for chunk in completion:
        full += chunk.choices[0].delta.content or ""
    return full

def parse_response(raw):
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "thought_process": "",
            "tts_message": raw,
            "conversation_stage": "ordering",
            "ai_tone": "warm_and_friendly",
            "customer_analysis": {"sentiment": "neutral", "urgency": "low"},
            "offer_pitched": None,
            "customer_feedback": None,
            "cart_status": "shopping",
            "order_data": [],
        }

# ═══════════════════════════════════════════════════════════════
# STT (Sarvam)
# ═══════════════════════════════════════════════════════════════
def transcribe(audio_bytes):
    if not SARVAM_KEY:
        return ""
    files   = {"file": ("input.wav", audio_bytes, "audio/wav")}
    headers = {"api-subscription-key": SARVAM_KEY}
    data    = {"model": "saarika:v2.5", "language_code": "en-IN"}
    r = requests.post(
        "https://api.sarvam.ai/speech-to-text",
        headers=headers, files=files, data=data, timeout=30,
    )
    r.raise_for_status()
    return r.json().get("transcript", "")

# ═══════════════════════════════════════════════════════════════
# TTS (Sarvam)
# ═══════════════════════════════════════════════════════════════
def synthesize(text):
    if not SARVAM_KEY:
        return b""
    headers = {"api-subscription-key": SARVAM_KEY, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "target_language_code": "en-IN",
        "speaker": "anushka",
        "model": "bulbul:v2",
        "pace": 1.0,
        "speech_sample_rate": 22050,
        "output_audio_codec": "mp3",
        "enable_preprocessing": True,
    }
    r = requests.post(
        "https://api.sarvam.ai/text-to-speech/stream",
        headers=headers, json=payload, stream=True, timeout=30,
    )
    r.raise_for_status()
    audio = b""
    for chunk in r.iter_content(8192):
        if chunk:
            audio += chunk
    return audio

# ═══════════════════════════════════════════════════════════════
# DASHBOARD BROADCAST
# ═══════════════════════════════════════════════════════════════
async def broadcast(data: dict):
    for ws in list(dashboard_clients):
        try:
            await ws.send_json(data)
        except Exception:
            dashboard_clients.discard(ws)

# ═══════════════════════════════════════════════════════════════
# PROCESS ONE CONVERSATION TURN
# ═══════════════════════════════════════════════════════════════
def process_turn(sid, user_text):
    session = sessions[sid]
    session["history"].append({"role": "user", "content": user_text})

    messages = [{"role": "system", "content": session["prompt"]}] + session["history"]
    raw = call_llm(messages)
    session["history"].append({"role": "assistant", "content": raw})

    data = parse_response(raw)
    data["order_id"]   = session["order_id"]
    data["session_id"] = sid

    # Enrich order_data with names & prices
    enriched = []
    for item in data.get("order_data", []):
        code = item.get("item_code", "")
        menu_item = MENU.get(code, {})
        enriched.append({
            **item,
            "name":  menu_item.get("name", code),
            "price": menu_item.get("price", 0),
        })
    data["order_data"] = enriched
    data["order_total"] = calc_total(enriched)

    return data

# ═══════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════

# ── Dashboard page ────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    return Path("static/dashboard.html").read_text()

# ── Text chat API ─────────────────────────────────────────────
class ChatReq(BaseModel):
    session_id: Optional[str] = None
    message: str
    customer_name: Optional[str] = None
    past_favorite: Optional[str] = None

@app.post("/api/chat")
async def chat_endpoint(req: ChatReq):
    sid = req.session_id or str(uuid.uuid4())[:8]

    if sid not in sessions:
        name = req.customer_name or "Guest"
        sessions[sid] = {
            "history":  [],
            "name":     name,
            "fav":      req.past_favorite,
            "order_id": f"ORD-{uuid.uuid4().hex[:6].upper()}",
            "prompt":   build_prompt(name, req.past_favorite),
        }

    data = await asyncio.to_thread(process_turn, sid, req.message)

    # Broadcast to all dashboards
    await broadcast(data)

    # Save to DB if order closed
    if data.get("cart_status") == "closed":
        save_order({
            "order_id":      data["order_id"],
            "customer_name": sessions[sid].get("name"),
            "items":         data.get("order_data", []),
            "total":         data.get("order_total", 0),
            "feedback":      data.get("customer_feedback"),
            "rating":        data.get("customer_rating"),
            "delivery_type": data.get("delivery_type"),
            "delivery_address": data.get("delivery_address"),
            "timestamp":     datetime.now().isoformat(),
        })

    return JSONResponse(data)

# ── Orders API ────────────────────────────────────────────────
@app.get("/api/orders")
async def get_orders():
    return load_orders()

# ── Voice WebSocket (audio in → STT → LLM → TTS → audio out) ─
@app.websocket("/ws/voice")
async def voice_ws(ws: WebSocket):
    await ws.accept()
    sid = str(uuid.uuid4())[:8]

    # Receive optional init message with customer info
    try:
        init = await asyncio.wait_for(ws.receive_json(), timeout=2.0)
    except Exception:
        init = {}

    name = init.get("customer_name")
    fav  = init.get("past_favorite")

    sessions[sid] = {
        "history":  [],
        "name":     name,
        "fav":      fav,
        "order_id": f"ORD-{uuid.uuid4().hex[:6].upper()}",
        "prompt":   build_prompt(name, fav),
    }

    await ws.send_json({"event": "ready", "session_id": sid, "order_id": sessions[sid]["order_id"]})

    try:
        while True:
            # Receive audio bytes from client
            audio_bytes = await ws.receive_bytes()

            # STT
            transcript = await asyncio.to_thread(transcribe, audio_bytes)
            if not transcript.strip():
                await ws.send_json({"event": "error", "message": "Could not understand audio, try again."})
                continue

            # LLM
            data = await asyncio.to_thread(process_turn, sid, transcript)
            data["transcript"] = transcript

            # TTS
            try:
                audio_out = await asyncio.to_thread(synthesize, data.get("tts_message", ""))
                if audio_out:
                    data["audio_base64"] = base64.b64encode(audio_out).decode()
            except Exception as e:
                data["tts_error"] = str(e)

            # Send full response to client
            await ws.send_json(data)

            # Broadcast AI brain to dashboard
            await broadcast(data)

            # Save & close if done
            if data.get("cart_status") == "closed":
                save_order({
                    "order_id":      data["order_id"],
                    "customer_name": sessions[sid].get("name"),
                    "items":         data.get("order_data", []),
                    "total":         data.get("order_total", 0),
                    "feedback":      data.get("customer_feedback"),
                    "rating":        data.get("customer_rating"),
                    "delivery_type": data.get("delivery_type"),
                    "delivery_address": data.get("delivery_address"),
                    "timestamp":     datetime.now().isoformat(),
                })
                break

    except WebSocketDisconnect:
        pass

# ── Dashboard WebSocket (live feed for judges) ───────────────
@app.websocket("/ws/dashboard")
async def dashboard_ws(ws: WebSocket):
    await ws.accept()
    dashboard_clients.add(ws)
    try:
        while True:
            await ws.receive_text()  # keepalive
    except WebSocketDisconnect:
        dashboard_clients.discard(ws)

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 55)
    print("  🍽️  Mudigonda Sharma Cafe — AI Voice Ordering Copilot")
    print("  📡 Server:    http://localhost:8000")
    print("  📊 Dashboard: http://localhost:8000")
    print("  📝 API Docs:  http://localhost:8000/docs")
    print("  💬 Chat API:  POST http://localhost:8000/api/chat")
    print("=" * 55)
    uvicorn.run(app, host="0.0.0.0", port=8000)

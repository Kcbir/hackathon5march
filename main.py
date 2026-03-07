"""
Mysore  Cafe — AI Voice Ordering Copilot
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
from supabase import create_client

load_dotenv()

# ═══════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════
GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
SARVAM_KEY = os.getenv("SARVAM_API_KEY", "")

groq_client = Groq(api_key=GROQ_KEY)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
supa = create_client(SUPABASE_URL, SUPABASE_KEY)

MENU = {
    "I01": {"name": "Steamed Idli (2 pieces)",       "price": 60},
    "I02": {"name": "Mini Ghee Idli (14 pieces)",    "price": 80},
    "I03": {"name": "Thatte Idli",                "price": 70},
    "D01": {"name": "Classic Masala Dosa",         "price": 70},
    "D02": {"name": "Ghee Roast Dosa",             "price": 90},
    "D03": {"name": "Mysore Masala Dosa",           "price": 90},
    "D04": {"name": "Rava Dosa",                   "price": 80},
    "V01": {"name": "Crispy Medu Vada (2 pieces)",    "price": 60},
    "V02": {"name": "Rasam Vada",                  "price": 70},
    "R01": {"name": "Ven Pongal",                  "price": 70},
    "R02": {"name": "Bisi Bele Bath",               "price": 80},
    "R03": {"name": "Curd Rice",                   "price": 60},
    "R04": {"name": "Lemon Rice",                  "price": 60},
    "S01": {"name": "Onion Uttapam",               "price": 70},
    "S02": {"name": "Appam with Veg Stew",          "price": 90},
    "B01": {"name": "Authentic Filter Coffee",      "price": 50},
    "B02": {"name": "Sweet Kesari Bath",            "price": 60},
}

ORDERS_FILE = "orders.json"

app = FastAPI(title="Mysore Cafe — AI Voice Copilot")
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
    # Local JSON backup
    db = load_orders()
    db["orders"].append(order)
    with open(ORDERS_FILE, "w") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    items = order.get("items", [])
    total_items = sum(i.get("qty", 0) for i in items)

    # Push to Supabase — orders table
    try:
        supa.table("orders").insert({
            "order_id":         order.get("order_id"),
            "total_items":      total_items,
            "total":            order.get("total", 0),
            "delivery_type":    order.get("delivery_type"),
            "special_requests": order.get("special_requests"),
            "rating":           order.get("rating"),
        }).execute()
    except Exception as e:
        print(f"Supabase orders insert failed: {e}")
        return

    # Push order_items rows
    try:
        rows = [
            {
                "order_id":   order.get("order_id"),
                "item_code":  i.get("item_code", ""),
                "item_name":  i.get("name", ""),
                "qty":        i.get("qty", 0),
                "unit_price": i.get("price", 0),
                "line_total": i.get("price", 0) * i.get("qty", 0),
            }
            for i in items
        ]
        if rows:
            supa.table("order_items").insert(rows).execute()
    except Exception as e:
        print(f"Supabase order_items insert failed: {e}")


def save_call_logs(order_id: str, history: list):
    """Save every conversation turn to call_logs table."""
    import re as _re
    rows = []
    for turn_idx, msg in enumerate(history):
        role = msg.get("role", "")
        if role not in ("user", "assistant"):
            continue
        content = msg.get("content", "")
        # For assistant turns, extract just tts_message if JSON
        if role == "assistant":
            m = _re.search(r'"tts_message"\s*:\s*"((?:[^"]|\\")*)"', content)
            display = m.group(1) if m else content
            label = "arjun"
        else:
            display = content
            label = "user"
        rows.append({
            "order_id": order_id,
            "turn":     turn_idx + 1,
            "role":     label,
            "message":  display,
        })
    try:
        if rows:
            supa.table("call_logs").insert(rows).execute()
    except Exception as e:
        print(f"Supabase call_logs insert failed: {e}")

def calc_total(items):
    return sum(
        MENU.get(i.get("item_code"), {}).get("price", 0) * i.get("qty", 0)
        for i in items
    )

# ═══════════════════════════════════════════════════════════════
# SYSTEM PROMPT
# ═══════════════════════════════════════════════════════════════
def build_prompt(name=None, fav=None):
    caller = f"Returning customer: {name}. Greet by name, keep it natural." if name else ""

    return (
        "You are Arjun, a friendly phone waiter at Mysore Cafe. Short sentences, natural speech — no corporate words.\n\n"
        "MENU (use EXACT codes in order_data):\n"
        "I01 Steamed Idli (2 pieces) Rs.60 | I02 Mini Ghee Idli (14 pieces) Rs.80 | I03 Thatte Idli Rs.70\n"
        "D01 Classic Masala Dosa Rs.70 | D02 Ghee Roast Dosa Rs.90 | D03 Mysore Masala Dosa Rs.90 | D04 Rava Dosa Rs.80\n"
        "V01 Medu Vada (2 pieces) Rs.60 | V02 Rasam Vada Rs.70\n"
        "R01 Ven Pongal Rs.70 | R02 Bisi Bele Bath Rs.80 | R03 Curd Rice Rs.60 | R04 Lemon Rice Rs.60\n"
        "S01 Onion Uttapam Rs.70 | S02 Appam with Veg Stew Rs.90\n"
        "B01 Filter Coffee Rs.50 | B02 Sweet Kesari Bath Rs.60\n\n"
        "COMBOS (suggest naturally when relevant, just once):\n"
        "- Dosa + Filter Coffee = perfect pair (mention if they order a dosa without a drink)\n"
        "- Idli / Vada + Filter Coffee = classic South Indian breakfast combo\n"
        "- Any meal + Sweet Kesari Bath = great finish (mention if no dessert in order)\n\n"
        "OFFER: 2 Filter Coffees -> save Rs.20 (mention once, only if relevant)\n"
        + (caller + "\n" if caller else "")
        + "CONVERSATION:\n"
        "- Take order, confirm quantities. Ask if unclear.\n"
        "- Listen for special requests (less spice, extra chutney, etc.) — capture in special_requests field.\n"
        "- After they state their order: if a combo fits, suggest it once naturally. E.g. 'Want a Filter Coffee with that? Goes really well.' Skip if they already have a drink.\n"
        "- If no dessert in order, casually mention Sweet Kesari Bath once. Skip if they decline.\n"
        "- Ask delivery or takeout. Get address if delivery.\n"
        "- Read back full order with each item price and total. Ask to confirm.\n"
        "- Ask for 1-5 rating casually after confirm.\n"
        "- Once rating received: thank them, give order number, say ready in ~16 min, warm bye.\n\n"
        "RULES:\n"
        "- ONLY use items from this exact menu. Never invent items.\n"
        "- If the customer's words sound like a menu item (noisy speech, mispronunciation), assume they mean that item. Don't correct them, just confirm naturally.\n"
        "- NEVER say item codes (I01, D01, etc.) out loud. Use item names only.\n"
        "- Upsell only ONCE per suggestion. If they say no, drop it immediately.\n"
        "- cart_status = closed only AFTER you say the goodbye with order number and time.\n"
        "- Keep responses very short. You are on the phone.\n"
        "- No 'great choice', no 'absolutely', no filler words.\n\n"
        "Respond STRICT JSON only, no markdown:\n"
        "{\n"
        '"tts_message": "What Arjun says.",\n'
        '"offer_pitched": "offer/combo pitched or null",\n'
        '"special_requests": "e.g. less spice, extra chutney — or null",\n'
        '"customer_rating": null,\n'
        '"delivery_type": "delivery | takeout | null",\n'
        '"delivery_address": "address or null",\n'
        '"cart_status": "shopping | confirming | closed",\n'
        '"order_data": [{"item_code": "I01", "qty": 1, "modifiers": "none"}]\n'
        "}"
    )

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
        # Try to salvage tts_message from partial/truncated JSON
        m = re.search(r'"tts_message"\s*:\s*"((?:[^"]|\\")*)', text)
        tts = m.group(1) if m else ""
        # Try to get cart_status and order_data too
        cs = re.search(r'"cart_status"\s*:\s*"(\w+)"', text)
        return {
            "tts_message": tts,
            "offer_pitched": None,
            "customer_feedback": None,
            "customer_rating": None,
            "delivery_type": None,
            "delivery_address": None,
            "cart_status": cs.group(1) if cs else "shopping",
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
        "speaker": "shubh",
        "model": "bulbul:v3",
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
# TWILIO VOICE ROUTES
# ═══════════════════════════════════════════════════════════════
from twilio_voice import router as twilio_router
app.include_router(twilio_router)

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 55)
    print("  🍽️  Mysore  Cafe — AI Voice Ordering Copilot")
    print("  📡 Server:    http://localhost:8000")
    print("  📊 Dashboard: http://localhost:8000")
    print("  📝 API Docs:  http://localhost:8000/docs")
    print("  💬 Chat API:  POST http://localhost:8000/api/chat")
    print("  📞 Twilio:    POST http://localhost:8000/twilio/call")
    print("=" * 55)
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Mudigonda Sharma Cafe — AI Voice Ordering Copilot

An AI-powered voice ordering system for restaurants. Customers call in, speak their order in **English, Hindi, or Hinglish**, and the AI waiter (Omkaar) handles everything — from taking the order, pitching relevant offers, asking delivery/takeout, collecting a rating, and generating a kitchen-ready order ticket (KOT).

Built for a hackathon in under 24 hours.

---

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────┐     ┌──────────────────┐
│  Customer    │────▶│         FastAPI Backend (main.py)     │────▶│  Judge Dashboard  │
│  (Voice/Text)│     │                                      │     │  (Live WebSocket)  │
└─────────────┘     │  ┌─────┐  ┌─────────┐  ┌─────┐      │     └──────────────────┘
                    │  │ STT │─▶│   LLM   │─▶│ TTS │      │
                    │  │Sarvam│  │GPT-OSS  │  │Sarvam│      │
                    │  │     │  │ 120B    │  │     │      │
                    │  └─────┘  └─────────┘  └─────┘      │
                    │                                      │
                    │  Route A: tts_message → Audio out     │
                    │  Route B: AI brain → Dashboard WS     │
                    │  Route C: order_data → Supabase + JSON │
                    └──────────────────────────────────────┘
```

### The Pipeline

1. **STT (Speech-to-Text)** — Sarvam.ai Saarika v2.5 transcribes audio in real-time (supports Hindi, English, Hinglish)
2. **LLM (Brain)** — OpenAI GPT-OSS 120B via Groq processes the transcript with a state-machine prompt
3. **TTS (Text-to-Speech)** — Sarvam.ai Bulbul v2 converts the AI response back to natural speech
4. **Dashboard** — Real-time WebSocket feed shows the AI's `thought_process`, sentiment analysis, cart state, and offers to judges

---

## Features

| Feature | Description |
|---|---|
| **Multi-language** | Handles English, Hindi, Hinglish seamlessly |
| **Sentiment & Urgency Detection** | If customer is rushed/annoyed, skips offers and fast-tracks |
| **Smart Offers** | Pitches relevant deals only once, only after ordering — not pushy |
| **Delivery/Takeout** | Asks preference, collects address for delivery |
| **1-5 Rating** | Collects experience rating after order confirmation |
| **Order Persistence** | Every order saved to Supabase + local JSON with ID, items, total, rating, feedback, timestamp |
| **Live Dashboard** | Judges see AI thinking, sentiment, cart updates in real-time via WebSocket |
| **Structured JSON Output** | Every LLM response is a strict JSON — ready for direct PoS/KOT integration |

### The AI Brain JSON (every single turn)

```json
{
  "thought_process": "Customer wants 2 masala dosas. Low urgency, happy mood. I'll mention the coffee offer.",
  "tts_message": "Sure, 2 Classic Masala Dosa. Btw we have an offer — buy 2 Filter Coffees, get Rs.20 off. Interested?",
  "conversation_stage": "offer",
  "ai_tone": "warm_and_friendly",
  "customer_analysis": { "sentiment": "happy", "urgency": "low" },
  "offer_pitched": "Buy 2 Filter Coffees, get Rs.20 off",
  "customer_rating": null,
  "delivery_type": null,
  "cart_status": "shopping",
  "order_data": [{"item_code": "D01", "qty": 2, "modifiers": "none"}]
}
```

---

## Menu

| Item | Code | Price |
|---|---|---|
| Steamed Idli (2 pcs) | I01 | ₹60 |
| Mini Ghee Idli (14 pcs) | I02 | ₹80 |
| Thatte Idli | I03 | ₹70 |
| Classic Masala Dosa | D01 | ₹70 |
| Ghee Roast Dosa (Owner's Fav) | D02 | ₹90 |
| Mysore Masala Dosa | D03 | ₹90 |
| Rava Dosa | D04 | ₹80 |
| Crispy Medu Vada (2 pcs) | V01 | ₹60 |
| Rasam Vada | V02 | ₹70 |
| Ven Pongal | R01 | ₹70 |
| Bisi Bele Bath | R02 | ₹80 |
| Curd Rice | R03 | ₹60 |
| Lemon Rice | R04 | ₹60 |
| Onion Uttapam | S01 | ₹70 |
| Appam with Veg Stew | S02 | ₹90 |
| Authentic Filter Coffee | B01 | ₹50 |
| Sweet Kesari Bath | B02 | ₹60 |

---

## Conversation Flow

```
Omkaar: "Vanakam Swamy! This is Mudigonda Cafe, how may I help you today?"
Customer: "Ek masala dosa dedo"
Omkaar: "Sure, 1 Classic Masala Dosa. Btw, buy 2 Filter Coffees get Rs.20 off — interested?"
Customer: "Nah just the dosa"
Omkaar: "Delivery ya takeout?"
Customer: "Takeout"
Omkaar: "1 Classic Masala Dosa Rs.70. Total Rs.70. Confirm karun?"
Customer: "Haan"
Omkaar: "Quick one — rate this experience 1 to 5?"
Customer: "5"
Omkaar: "Thanks! Order ORD-A1B2C3, ready in about 16 min. Vanakam!"
```

---

## Quick Start

### 1. Install dependencies

```bash
pip install fastapi uvicorn groq requests python-dotenv sounddevice supabase
```

### 2. Run the server

```bash
python main.py
```

Server starts at `http://localhost:8000`

### 3. Open the dashboard

Open `http://localhost:8000` in your browser — this is the live judge dashboard.

### 4. Test via terminal (text mode)

```bash
python this.py
```

Omkaar greets automatically. Just type your orders.

### 5. Test via API

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Live judge dashboard |
| `POST` | `/api/chat` | Text chat (session-based) |
| `GET` | `/api/orders` | View all saved orders |
| `WS` | `/ws/voice` | Voice pipeline (audio in → audio out) |
| `WS` | `/ws/dashboard` | Real-time AI brain feed for dashboard |
| `GET` | `/docs` | Auto-generated Swagger API docs |

### POST `/api/chat` body

```json
{
  "session_id": "optional-session-id",
  "message": "ek lassi dedo",
  "customer_name": "Omkaar"
}
```

---

## File Structure

```
├── main.py               # FastAPI server — the entire backend brain (single source of truth)
├── this.py               # Terminal test client (text mode)
├── pipeline.py           # Standalone voice demo (mic → STT → LLM → TTS)
├── llm.py                # Standalone LLM module (imports from main.py)
├── setup_supabase.py     # Supabase table setup + menu upload
├── cost_optimization.py  # Menu price optimization (Supabase + gradient descent)
├── menu.csv              # Full South Indian menu dataset
├── final_menu_prices.csv # Optimized menu prices dataset
├── static/
│   └── dashboard.html    # Live judge dashboard (dark theme, WebSocket)
├── orders.json           # Local order backup (auto-generated)
└── README.md
```

---

## Tech Stack

- **LLM**: OpenAI GPT-OSS 120B via Groq (streaming)
- **STT**: Sarvam.ai Saarika v2.5 (Hindi/English/Hinglish)
- **TTS**: Sarvam.ai Bulbul v2
- **Backend**: FastAPI + WebSockets
- **Dashboard**: Vanilla HTML/CSS/JS (no framework needed)
- **Database**: Supabase (PostgreSQL) + local JSON fallback
- **Price Optimization**: Gradient descent on Supabase menu data

---

## Team

Built at Hackathon — March 2026

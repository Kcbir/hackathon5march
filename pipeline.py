import os
import json
import re
import requests
import sounddevice as sd
import numpy as np
import wave
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── API Keys ──────────────────────────────────────────────────────
SARVAM_KEY = os.getenv("SARVAM_API_KEY")
GROQ_KEY   = os.getenv("GROQ_API_KEY", "")

# ── Groq Client ───────────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_KEY)

# ── Config ────────────────────────────────────────────────────────
SAMPLE_RATE = 16000
DURATION    = 5  # seconds to record

# ── Simulated Backend Data ────────────────────────────────────────
CALLER_PROFILES = {
    "9876543210": {"name": "Rahul", "past_favorite": "Cold Coffee", "visits": 12},
    "9123456789": {"name": "Priya", "past_favorite": "Paneer Butter Masala", "visits": 5},
    "default":    {"name": None, "past_favorite": None, "visits": 0},
}

DAILY_REVENUE_CONTEXT = {
    "daily_revenue_goal": 15000,
    "current_revenue": 8200,
    "items_to_push": [
        {"code": "C05", "name": "Paneer Butter Masala", "reason": "High margin, expiring paneer stock"},
        {"code": "B02", "name": "Lassi",                "reason": "High margin, low orders today"},
    ],
}

ACTIVE_OFFERS = [
    {"id": "OFFER1", "text": "Free Lassi with any Paneer order.",   "condition": "paneer_ordered"},
    {"id": "OFFER2", "text": "Add a second Paratha for just ₹30.", "condition": "paratha_ordered"},
]


def build_system_prompt(caller_phone="default"):
    profile = CALLER_PROFILES.get(caller_phone, CALLER_PROFILES["default"])

    caller_block = ""
    if profile["name"]:
        caller_block = f"""
CALLER PROFILE (from CRM):
- Name: {profile['name']}
- Past Favorite: {profile['past_favorite']}
- Total Visits: {profile['visits']}
- Action: Greet them by name and reference their favorite item.
"""

    offers_text = "\n".join([f"  - {o['id']}: '{o['text']}' (trigger: {o['condition']})" for o in ACTIVE_OFFERS])
    push_text   = "\n".join([f"  - {i['code']} ({i['name']}): {i['reason']}" for i in DAILY_REVENUE_CONTEXT["items_to_push"]])

    return f"""You are the AI Voice Copilot for 'Mudigonda Sharma Cafe'. Your goal is to take orders, seamlessly pitch daily offers, collect feedback, and maximize revenue — while reading the customer's emotional state.

MENU & CODES:
- Aloo Paratha   (P01 - ₹50)
- Paneer Butter Masala (C05 - ₹150)
- Lassi          (B02 - ₹60)

ACTIVE OFFERS:
{offers_text}

TODAY'S REVENUE ENGINE (from backend):
- Daily Goal: ₹{DAILY_REVENUE_CONTEXT['daily_revenue_goal']}
- Current Revenue: ₹{DAILY_REVENUE_CONTEXT['current_revenue']}
- Items to Push:
{push_text}
- Action: Dynamically weave these high-margin items into your upsell. Invent natural combos on the fly.
{caller_block}
BEHAVIORAL RULES:
1. GREETING: If the user says 'Hello' or starts the call, respond with: 'Hello, this is Mudigonda Sharma Cafe, how may I help you today?' (If caller profile exists, greet by name and reference their favorite.)
2. UPSELLING: Once the user states their main order, pitch ONE relevant Active Offer or a dynamic combo from the revenue engine naturally — UNLESS the customer shows high urgency or negative sentiment. In that case, SKIP upselling entirely and use a crisp, fast tone.
3. CONFIRMATION: Read back the complete order summary before finalizing.
4. FEEDBACK: After they confirm the order, ask for a quick 1-sentence feedback about their voice ordering experience.
5. SENTIMENT & URGENCY: On EVERY turn, analyze the customer's sentiment (happy, neutral, annoyed, anxious) and urgency (low, medium, high). If urgency is high or sentiment is negative, abort upselling, shorten responses, and rush the order.

CRITICAL: You must output EVERY response in this strict JSON format. No markdown, no extra text.

{{{{
  "thought_process": "Your internal reasoning about the customer's mood, what to pitch, and why.",
  "tts_message": "What you speak to the customer.",
  "conversation_stage": "greeting | ordering | upselling | confirming | feedback | closed",
  "ai_tone": "warm_and_friendly | urgent_and_concise | empathetic | celebratory",
  "customer_analysis": {{{{
    "sentiment": "happy | neutral | annoyed | anxious",
    "urgency": "low | medium | high"
  }}}},
  "revenue_engine": {{{{
    "dynamic_offer_pitched": true or false,
    "offer_details": "Name/description of offer pitched, or null",
    "reason_for_no_offer": "Reason if skipped, or null"
  }}}},
  "customer_feedback": "Summarized feedback from the user, or null",
  "cart_status": "shopping | confirming | closed",
  "order_data": [
    {{{{"item_code": "P01", "qty": 1, "modifiers": "none"}}}}
  ]
}}}}"""


# ── Conversation History ──────────────────────────────────────────
conversation_history = []

# ─────────────────────────────────────────────────────────────────
# STEP 1 — STT: Record mic → text  (Sarvam Saarika)
# ─────────────────────────────────────────────────────────────────
def record_audio(filename="input.wav"):
    print(f"\n🎙️  Recording for {DURATION} seconds... Speak now!")
    audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
    sd.wait()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio.tobytes())

    print(f"✅ Recording saved: {filename}")
    return filename

def transcribe_audio(filename="input.wav"):
    print("📡 Sending to Sarvam STT...")

    with open(filename, "rb") as f:
        files    = {"file": (filename, f, "audio/wav")}
        headers  = {"api-subscription-key": SARVAM_KEY}
        data     = {"model": "saarika:v2.5", "language_code": "en-IN"}
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers=headers, files=files, data=data,
            timeout=30                                  # ← timeout fix
        )

        if not response.ok:
            print(f"STT Error {response.status_code}: {response.text}")
            response.raise_for_status()

    transcript = response.json().get("transcript", "")
    print(f"📝 You said: {transcript}")
    return transcript

# ─────────────────────────────────────────────────────────────────
# STEP 2 — LLM: text → AI reply  (Groq llama-3.3-70b)
# ─────────────────────────────────────────────────────────────────
def get_llm_response(user_text, system_prompt):
    print("🧠 Sending to Groq LLM (openai/gpt-oss-120b)...")

    conversation_history.append({"role": "user", "content": user_text})
    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    completion = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        stream=True,
    )

    full_reply = ""
    for chunk in completion:
        token = chunk.choices[0].delta.content or ""
        full_reply += token

    conversation_history.append({"role": "assistant", "content": full_reply})

    # Parse JSON (handle possible markdown fencing)
    json_str = full_reply.strip()
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", json_str)
    if fence_match:
        json_str = fence_match.group(1).strip()

    try:
        data = json.loads(json_str)
        tts_message = data.get("tts_message", full_reply)
        cart_status = data.get("cart_status", "shopping")
        order_data  = data.get("order_data", [])

        # Dashboard
        print("\n" + "─" * 55)
        print("  🧠 THOUGHT:", data.get("thought_process", "—"))
        print("  🗣️  SPEAK :", tts_message)
        stage = data.get("conversation_stage", "—")
        tone  = data.get("ai_tone", "—")
        print(f"  📍 STAGE  : {stage}  |  🎭 TONE: {tone}")
        ca = data.get("customer_analysis", {})
        print(f"  😊 SENTIMENT: {ca.get('sentiment', '—')}  |  ⏱️  URGENCY: {ca.get('urgency', '—')}")
        re_data = data.get("revenue_engine", {})
        if re_data.get("dynamic_offer_pitched"):
            print(f"  💰 OFFER  : {re_data.get('offer_details', '—')}")
        elif re_data.get("reason_for_no_offer"):
            print(f"  💰 NO OFFER: {re_data.get('reason_for_no_offer')}")
        if order_data:
            print("  🛒 CART   :", ", ".join(
                [f"{i.get('item_code')} x{i.get('qty')} ({i.get('modifiers', 'none')})" for i in order_data]
            ))
        feedback = data.get("customer_feedback")
        if feedback:
            print(f"  📝 FEEDBACK: {feedback}")
        print("─" * 55)

        return tts_message, cart_status, order_data, data
    except json.JSONDecodeError:
        print(f"🤖 Says: {full_reply}")
        return full_reply, "shopping", [], {}

# ─────────────────────────────────────────────────────────────────
# STEP 3 — TTS: AI reply → speech  (Sarvam Bulbul)
# ─────────────────────────────────────────────────────────────────
def speak(text, filename="output.mp3"):
    print("🔊 Sending to Sarvam TTS...")

    headers = {
        "api-subscription-key": SARVAM_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "target_language_code": "en-IN",
        "speaker": "anushka",              # ← fixed speaker
        "model": "bulbul:v2",
        "pace": 1.0,
        "speech_sample_rate": 22050,
        "output_audio_codec": "mp3",
        "enable_preprocessing": True
    }

    with requests.post(
        "https://api.sarvam.ai/text-to-speech/stream",
        headers=headers, json=payload, stream=True,
        timeout=30                                      # ← timeout fix
    ) as response:
        if not response.ok:
            print(f"TTS Error {response.status_code}: {response.text}")
            response.raise_for_status()

        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    print(f"✅ Audio saved: {filename}")

    # Auto play the audio
    if os.name == 'nt':  # Windows
        os.system(f"start {filename}")
    else:                # Mac/Linux
        os.system(f"afplay {filename}" if os.uname().sysname == 'Darwin' else f"mpg123 {filename}")

# ─────────────────────────────────────────────────────────────────
# MAIN PIPELINE (Multi-turn ordering loop)
# ─────────────────────────────────────────────────────────────────
def run_pipeline():
    print("\n" + "="*55)
    print("   🍽️  Mudigonda Sharma Cafe — AI Voice Ordering Copilot")
    print("   Model: openai/gpt-oss-120b via Groq")
    print("="*55)

    conversation_history.clear()

    # Simulate caller ID lookup
    phone = input("Enter caller phone (or press Enter for new customer): ").strip() or "default"
    system_prompt = build_system_prompt(phone)

    profile = CALLER_PROFILES.get(phone, CALLER_PROFILES["default"])
    if profile["name"]:
        print(f"\n📞 Returning customer: {profile['name']} (fav: {profile['past_favorite']})")
    else:
        print("\n📞 New customer — no profile found.")

    while True:
        # Step 1 — STT
        audio_file = record_audio()
        transcript = transcribe_audio(audio_file)

        if not transcript.strip():
            print("⚠️  Could not understand audio. Please try again.")
            continue

        # Step 2 — LLM
        tts_message, cart_status, order_data, full_data = get_llm_response(transcript, system_prompt)

        # Step 3 — TTS
        speak(tts_message)

        print(f"\n   You   : {transcript}")
        print(f"   Bot   : {tts_message}")
        print("="*55)

        if cart_status == "closed":
            print("\n✅ ORDER CLOSED — Sending to kitchen (KOT)!")
            print("Final order_data:", json.dumps(order_data, indent=2, ensure_ascii=False))
            feedback = full_data.get("customer_feedback")
            if feedback:
                print(f"Customer feedback: {feedback}")
            break

    print("\n🎉 Thank you! Pipeline complete.")

if __name__ == "__main__":
    run_pipeline()
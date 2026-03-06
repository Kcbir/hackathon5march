import json
import os
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

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
1. GREETING: If the user says 'Hello' or starts the call, respond with: 'Vanakam Swamy leda Swamini, this is Mudigonda Cafe, how may I help you today?' (If caller profile exists, greet by name and reference their favorite.)
2. UPSELLING: Once the user states their main order, pitch ONE relevant Active Offer or a dynamic combo from the revenue engine naturally — UNLESS the customer shows high urgency or negative sentiment. In that case, SKIP upselling entirely and use a crisp, fast tone.
3. CONFIRMATION: Read back the complete order summary before finalizing.
4. FEEDBACK: After they confirm the order, ask for a quick 1-sentence feedback about their voice ordering experience.
5. SENTIMENT & URGENCY: On EVERY turn, analyze the customer's sentiment (happy, neutral, annoyed, anxious) and urgency (low, medium, high). If urgency is high or sentiment is negative, abort upselling, shorten responses, and rush the order.

CRITICAL: You must output EVERY response in this strict JSON format. No markdown, no extra text.

{{
  "thought_process": "Your internal reasoning about the customer's mood, what to pitch, and why.",
  "tts_message": "What you speak to the customer.",
  "conversation_stage": "greeting | ordering | upselling | confirming | feedback | closed",
  "ai_tone": "warm_and_friendly | urgent_and_concise | empathetic | celebratory",
  "customer_analysis": {{
    "sentiment": "happy | neutral | annoyed | anxious",
    "urgency": "low | medium | high"
  }},
  "revenue_engine": {{
    "dynamic_offer_pitched": true or false,
    "offer_details": "Name/description of offer pitched, or null",
    "reason_for_no_offer": "Reason if skipped, or null"
  }},
  "customer_feedback": "Summarized feedback from the user, or null",
  "cart_status": "shopping | confirming | closed",
  "order_data": [
    {{"item_code": "P01", "qty": 1, "modifiers": "none"}}
  ]
}}"""


conversation_history = []


def get_llm_response(user_text, system_prompt=None):
    """Send user text to LLM with streaming, return parsed JSON data."""
    if system_prompt is None:
        system_prompt = build_system_prompt()

    print(f"User said: {user_text}")
    print("Thinking...")

    conversation_history.append({"role": "user", "content": user_text})
    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    completion = client.chat.completions.create(
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
        print(f"Bot says: {tts_message}")
        print(f"Cart: {cart_status} | Items: {order_data}")
        return tts_message, cart_status, order_data, data
    except json.JSONDecodeError:
        print(f"Bot says: {full_reply}")
        return full_reply, "shopping", [], {}


if __name__ == "__main__":
    get_llm_response("I want 2 aloo paratha and one lassi")
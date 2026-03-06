"""
llm.py — Standalone LLM module for Mudigonda Sharma Cafe
Imports the prompt and LLM logic from main.py (the single source of truth).
Use main.py as the server. This file is for quick standalone testing only.
"""

import json
import re
from main import groq_client, build_prompt, parse_response


conversation_history = []


def get_llm_response(user_text, system_prompt=None):
    """Send user text to LLM, return parsed JSON data."""
    if system_prompt is None:
        system_prompt = build_prompt()

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
        full_reply += chunk.choices[0].delta.content or ""

    conversation_history.append({"role": "assistant", "content": full_reply})

    data = parse_response(full_reply)
    tts_message = data.get("tts_message", full_reply)
    cart_status = data.get("cart_status", "shopping")
    order_data = data.get("order_data", [])

    print(f"Bot says: {tts_message}")
    print(f"Cart: {cart_status} | Items: {order_data}")
    return tts_message, cart_status, order_data, data


if __name__ == "__main__":
    get_llm_response("Hello, what's on your menu?")

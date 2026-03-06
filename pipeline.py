"""
pipeline.py — Standalone voice demo (mic → STT → LLM → TTS → speaker)
Imports prompt + LLM from main.py (single source of truth).
No server needed — runs directly from terminal.
"""

import os
import json
import re
import requests
import sounddevice as sd
import wave
from main import groq_client, build_prompt, parse_response, SARVAM_KEY

# ── Config ────────────────────────────────────────────────────────
SAMPLE_RATE = 16000
DURATION    = 5  # seconds to record

conversation_history = []

# ─────────────────────────────────────────────────────────────────
# STEP 1 — STT: Record mic → text  (Sarvam Saarika)
# ─────────────────────────────────────────────────────────────────
def record_audio(filename="input.wav"):
    print(f"\nRecording for {DURATION} seconds... Speak now!")
    audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
    sd.wait()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio.tobytes())

    print(f"Recording saved: {filename}")
    return filename

def transcribe_audio(filename="input.wav"):
    print("Sending to Sarvam STT...")
    with open(filename, "rb") as f:
        files    = {"file": (filename, f, "audio/wav")}
        headers  = {"api-subscription-key": SARVAM_KEY}
        data     = {"model": "saarika:v2.5", "language_code": "en-IN"}
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers=headers, files=files, data=data, timeout=30,
        )
        response.raise_for_status()

    transcript = response.json().get("transcript", "")
    print(f"You said: {transcript}")
    return transcript

# ─────────────────────────────────────────────────────────────────
# STEP 2 — LLM: text → AI reply  (Groq)
# ─────────────────────────────────────────────────────────────────
def get_llm_response(user_text, system_prompt):
    print("Sending to Groq LLM...")

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

    # Display
    print("\n" + "-" * 55)
    print("  THOUGHT:", data.get("thought_process", "-"))
    print("  SPEAK  :", tts_message)
    print(f"  STAGE  : {data.get('conversation_stage', '-')}  |  TONE: {data.get('ai_tone', '-')}")
    ca = data.get("customer_analysis", {})
    print(f"  MOOD   : {ca.get('sentiment', '-')}  |  RUSH: {ca.get('urgency', '-')}")
    if order_data:
        print("  CART   :", ", ".join(
            f"{i.get('item_code')} x{i.get('qty')}" for i in order_data
        ))
    print("-" * 55)

    return tts_message, cart_status, order_data, data

# ─────────────────────────────────────────────────────────────────
# STEP 3 — TTS: AI reply → speech  (Sarvam Bulbul)
# ─────────────────────────────────────────────────────────────────
def speak(text, filename="output.mp3"):
    print("Sending to Sarvam TTS...")
    headers = {
        "api-subscription-key": SARVAM_KEY,
        "Content-Type": "application/json",
    }
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

    with requests.post(
        "https://api.sarvam.ai/text-to-speech/stream",
        headers=headers, json=payload, stream=True, timeout=30,
    ) as response:
        response.raise_for_status()
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    print(f"Audio saved: {filename}")

    if os.uname().sysname == "Darwin":
        os.system(f"afplay {filename}")
    else:
        os.system(f"mpg123 {filename}")

# ─────────────────────────────────────────────────────────────────
# MAIN PIPELINE (Multi-turn ordering loop)
# ─────────────────────────────────────────────────────────────────
def run_pipeline():
    print("\n" + "=" * 55)
    print("  Mudigonda Sharma Cafe — Voice Pipeline")
    print("  Model: openai/gpt-oss-120b via Groq")
    print("=" * 55)

    conversation_history.clear()
    system_prompt = build_prompt()

    while True:
        audio_file = record_audio()
        transcript = transcribe_audio(audio_file)

        if not transcript.strip():
            print("Could not understand audio. Please try again.")
            continue

        tts_message, cart_status, order_data, full_data = get_llm_response(transcript, system_prompt)
        speak(tts_message)

        if cart_status == "closed":
            print("\nORDER CLOSED!")
            print("Final order:", json.dumps(order_data, indent=2, ensure_ascii=False))
            break

    print("\nPipeline complete.")

if __name__ == "__main__":
    run_pipeline()

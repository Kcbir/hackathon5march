import os
import requests
import sounddevice as sd
import numpy as np
import wave
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── API Keys ──────────────────────────────────────────────────────
SARVAM_KEY = os.getenv("SARVAM_API_KEY")
GROQ_KEY   = os.getenv("GROQ_API_KEY")

# ── Groq Client ───────────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_KEY)

# ── Config ────────────────────────────────────────────────────────
SAMPLE_RATE = 16000
DURATION    = 5  # seconds to record

SYSTEM_PROMPT = """You are Anushka, a warm and friendly voice assistant for Petpooja — India's #1 restaurant management platform.
When a customer greets you, respond with a SHORT, warm greeting — 1-2 sentences max.
Be conversational, not robotic. Keep it under 30 words."""

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
def get_llm_response(user_text):
    print("🧠 Sending to Groq LLM...")

    chat = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_text},
        ],
        model="llama-3.3-70b-versatile",
        max_tokens=100,
        temperature=0.7,
    )

    reply = chat.choices[0].message.content
    print(f"🤖 Anushka says: {reply}")
    return reply

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
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────
def run_pipeline():
    print("\n" + "="*50)
    print("   🍽️  Petpooja Voice Assistant — Anushka")
    print("="*50)

    # Step 1 — STT
    audio_file = record_audio()
    transcript = transcribe_audio(audio_file)

    if not transcript.strip():
        print("⚠️  Could not understand audio. Please try again.")
        return

    # Step 2 — LLM
    reply = get_llm_response(transcript)

    # Step 3 — TTS
    speak(reply)

    print("\n✅ Pipeline complete!")
    print(f"   You     : {transcript}")
    print(f"   Anushka : {reply}")
    print("="*50)

if __name__ == "__main__":
    run_pipeline()
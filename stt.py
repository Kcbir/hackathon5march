import os
import requests
import sounddevice as sd
import numpy as np
import wave
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("SARVAM_API_KEY")
API_URL = "https://api.sarvam.ai/speech-to-text"

SAMPLE_RATE = 16000
DURATION = 5

def record_audio(filename="input.wav"):
    print(f"🎙️ Recording for {DURATION} seconds... Speak now!")
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
        files   = {"file": (filename, f, "audio/wav")}
        headers = {"api-subscription-key": API_KEY}
        data    = {
            "model": "saarika:v2.5",
            "language_code": "en-IN",
        }

        response = requests.post(API_URL, headers=headers, files=files, data=data)

        if not response.ok:
            print(f"❌ Error {response.status_code}: {response.text}")
            response.raise_for_status()

    transcript = response.json().get("transcript", "")
    print(f"📝 You said: {transcript}")
    return transcript

if __name__ == "__main__":
    audio_file = record_audio()
    transcript = transcribe_audio(audio_file)
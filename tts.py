import requests
import os
from dotenv import load_dotenv

load_dotenv()  # loads from .env file

API_KEY = os.getenv("SARVAM_API_KEY")
API_URL = "https://api.sarvam.ai/text-to-speech/stream"

def stream_tts():
    headers = {
        "api-subscription-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": "would you like anything else mam?",
        "target_language_code": "hi-IN",
        "speaker": "shubh",
        "model": "bulbul:v3",
        "pace": 1.1,
        "speech_sample_rate": 22050,
        "output_audio_codec": "mp3",
        "enable_preprocessing": True
    }
    
    print("Calling Sarvam TTS...")
    
    with requests.post(API_URL, headers=headers, json=payload, stream=True) as response:
        response.raise_for_status()
        
        with open("output.mp3", "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    print(f"Received {len(chunk)} bytes")
        
        print("✅ Audio saved to output.mp3")

if __name__ == "__main__":
    stream_tts()
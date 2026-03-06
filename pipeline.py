"""
pipeline.py — Mysore Cafe Voice Ordering Pipeline
VAD-based recording (stops when you stop talking) + parallel LLM/TTS + interruptible playback
"""
import os, sys, json, wave, time, threading, io, struct
import requests
import sounddevice as sd
import webrtcvad
import pygame
from main import groq_client, build_prompt, parse_response, SARVAM_KEY, MENU, save_order, save_call_logs

# ── Config ────────────────────────────────────────────────────────
SAMPLE_RATE     = 16000      # Sarvam needs 16kHz
FRAME_MS        = 20         # VAD frame size in ms (10, 20, or 30)
FRAME_SAMPLES   = int(SAMPLE_RATE * FRAME_MS / 1000)
VAD_MODE        = 3          # 0-3, 3 is most aggressive
SILENCE_FRAMES  = 30         # frames of silence before we stop (~600ms)
MIN_SPEECH_FRAMES = 15       # need at least ~300ms of real speech
MIN_RMS_ENERGY  = 300        # reject audio quieter than this (0-32768 scale)
MAX_RECORD_S    = 12         # safety cap
PRE_ROLL_FRAMES = 5          # frames to keep before speech starts

conversation_history = []

# ─────────────────────────────────────────────────────────────────
# 1. VAD RECORDING
# ─────────────────────────────────────────────────────────────────
def record_until_silence(filename="input.wav") -> str:
    """Record mic until the user stops talking. Returns filename."""
    vad = webrtcvad.Vad(VAD_MODE)
    
    print("  Listening... (speak now, stops when you stop)")

    ring_buf   = []        # pre-roll buffer
    voiced_buf = []        # final audio frames
    triggered  = False
    silence_count = 0
    total_frames  = 0
    max_frames = int(MAX_RECORD_S * 1000 / FRAME_MS)

    with sd.RawInputStream(samplerate=SAMPLE_RATE, channels=1, dtype='int16',
                           blocksize=FRAME_SAMPLES) as stream:
        while total_frames < max_frames:
            raw, _ = stream.read(FRAME_SAMPLES)
            frame = bytes(raw)
            total_frames += 1

            is_speech = vad.is_speech(frame, SAMPLE_RATE)

            if not triggered:
                ring_buf.append(frame)
                if len(ring_buf) > PRE_ROLL_FRAMES:
                    ring_buf.pop(0)
                if is_speech:
                    triggered = True
                    voiced_buf.extend(ring_buf)
                    ring_buf.clear()
            else:
                voiced_buf.append(frame)
                if not is_speech:
                    silence_count += 1
                    if silence_count >= SILENCE_FRAMES:
                        break
                else:
                    silence_count = 0

    # Require minimum real speech frames to avoid sending noise to Sarvam
    if len(voiced_buf) < MIN_SPEECH_FRAMES:
        return ""

    audio_bytes = b"".join(voiced_buf)

    # RMS energy check — reject if audio is too quiet (STT hallucinates on near-silence)
    samples = struct.unpack(f"{len(audio_bytes)//2}h", audio_bytes)
    rms = (sum(s*s for s in samples) / len(samples)) ** 0.5
    if rms < MIN_RMS_ENERGY:
        return ""
    # Pad to at least 1.5s so Sarvam doesn't reject short clips
    min_bytes = int(SAMPLE_RATE * 1.5) * 2  # 16-bit mono
    if len(audio_bytes) < min_bytes:
        audio_bytes += b"\x00" * (min_bytes - len(audio_bytes))

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio_bytes)

    return filename


# ─────────────────────────────────────────────────────────────────
# 2. STT
# ─────────────────────────────────────────────────────────────────
def transcribe(filename="input.wav") -> str:
    with open(filename, "rb") as f:
        files   = {"file": (filename, f, "audio/wav")}
        headers = {"api-subscription-key": SARVAM_KEY}
        data    = {"model": "saarika:v2.5", "language_code": "en-IN"}
        r = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers=headers, files=files, data=data, timeout=30,
        )
        r.raise_for_status()
    return r.json().get("transcript", "").strip()


# ─────────────────────────────────────────────────────────────────
# 3. LLM (streaming, low tokens)
# ─────────────────────────────────────────────────────────────────
def llm_reply(system_prompt) -> dict:
    messages = [{"role": "system", "content": system_prompt}] + conversation_history
    completion = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=0.7,
        max_completion_tokens=600,
        top_p=1,
        stream=True,
    )
    full = ""
    for chunk in completion:
        full += chunk.choices[0].delta.content or ""
    return full


# ─────────────────────────────────────────────────────────────────
# 4. TTS (Sarvam)
# ─────────────────────────────────────────────────────────────────
def tts_to_bytes(text: str) -> bytes:
    headers = {"api-subscription-key": SARVAM_KEY, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "target_language_code": "en-IN",
        "speaker": "shubh",
        "model": "bulbul:v3",
        "pace": 1.1,
        "speech_sample_rate": 22050,
        "output_audio_codec": "mp3",
        "enable_preprocessing": True,
    }
    r = requests.post(
        "https://api.sarvam.ai/text-to-speech/stream",
        headers=headers, json=payload, stream=True, timeout=30,
    )
    r.raise_for_status()
    buf = b""
    for chunk in r.iter_content(8192):
        if chunk:
            buf += chunk
    return buf


# ─────────────────────────────────────────────────────────────────
# 5. PLAYBACK (pygame)
# ─────────────────────────────────────────────────────────────────
_pygame_init_done = False

def play_audio(audio_bytes: bytes):
    """Play MP3 bytes via pygame, blocking until done."""
    global _pygame_init_done
    if not _pygame_init_done:
        pygame.mixer.init(frequency=22050)
        _pygame_init_done = True

    buf = io.BytesIO(audio_bytes)
    pygame.mixer.music.load(buf, "mp3")
    pygame.mixer.music.play()

    while pygame.mixer.music.get_busy():
        time.sleep(0.05)


# ─────────────────────────────────────────────────────────────────
# 6. CALC TOTAL
# ─────────────────────────────────────────────────────────────────
def calc_total(items):
    return sum(
        MENU.get(i.get("item_code"), {}).get("price", 0) * i.get("qty", 0)
        for i in items
    )


# ─────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────
def run_pipeline():
    print("\n" + "=" * 50)
    print("  Mysore Cafe — Voice Ordering")
    print("  Say 'quit' to exit anytime")
    print("=" * 50)

    conversation_history.clear()
    system_prompt = build_prompt()
    order_id = "ORD-" + __import__("uuid").uuid4().hex[:6].upper()
    special_requests_acc = []  # accumulate special requests across turns, save at end

    # Hardcoded greeting — no LLM call, instant start
    greeting = "Vanakkam, this is Mysore Cafe. Arjun speaking. How may I help you?"
    conversation_history.append({"role": "assistant", "content": '{"tts_message": "' + greeting + '", "cart_status": "shopping", "order_data": []}'})
    print(f"\nArjun: {greeting}")

    audio = tts_to_bytes(greeting)
    play_audio(audio)
    time.sleep(0.5)  # brief pause before mic opens

    while True:
        # Record with VAD
        wav_file = record_until_silence()
        if not wav_file:
            continue

        # STT
        transcript = transcribe(wav_file)
        if not transcript:
            continue

        print(f"\nYou: {transcript}")

        if transcript.lower() in ("quit", "exit", "bye"):
            print("Goodbye!")
            break

        conversation_history.append({"role": "user", "content": transcript})

        # LLM then TTS
        llm_result = {}
        tts_audio   = {}

        def run_tts_after_llm():
            raw = llm_reply(system_prompt)
            conversation_history.append({"role": "assistant", "content": raw})
            llm_result["raw"] = raw
            d = parse_response(raw)
            llm_result["data"] = d
            msg = d.get("tts_message", "")
            if msg:
                tts_audio["bytes"] = tts_to_bytes(msg)

        t = threading.Thread(target=run_tts_after_llm, daemon=True)
        t.start()
        t.join()

        data = llm_result.get("data", {})
        tts_msg     = data.get("tts_message", "")
        cart_status = data.get("cart_status", "shopping")
        order_data  = data.get("order_data", [])
        sr = data.get("special_requests")
        if sr:
            special_requests_acc.append(sr)

        # Enrich with names + prices
        enriched = []
        for item in order_data:
            code = item.get("item_code", "")
            m = MENU.get(code, {})
            enriched.append({**item, "name": m.get("name", code), "price": m.get("price", 0)})
        total = calc_total(enriched)

        if not tts_msg:
            continue
        print(f"\nArjun: {tts_msg}")
        if enriched:
            cart_str = ", ".join(f"{i['name']} x{i['qty']} Rs.{i['price']}" for i in enriched)
            print(f"  Cart: {cart_str}  |  Total: Rs.{total}")

        if tts_audio.get("bytes"):
            play_audio(tts_audio["bytes"])
            time.sleep(0.5)  # brief pause before mic opens

        if cart_status == "closed":
            print("\n" + "=" * 50)
            print("  ORDER PLACED!")
            print("=" * 50)
            for item in enriched:
                print(f"  {item['name']} x{item['qty']}  Rs.{item['price'] * item['qty']}")
            print(f"  Total: Rs.{total}")
            print("=" * 50)
            # Save to Supabase
            save_order({
                "order_id":         order_id,
                "items":            enriched,
                "total":            total,
                "delivery_type":    data.get("delivery_type"),
                "special_requests": ", ".join(special_requests_acc) or None,
                "rating":           data.get("customer_rating"),
            })
            save_call_logs(order_id, conversation_history)
            break


if __name__ == "__main__":
    run_pipeline()

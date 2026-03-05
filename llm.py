import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are Priya, a warm and friendly voice assistant for Petpooja — India's #1 restaurant management platform. 
When a customer greets you, respond with a SHORT, warm greeting — 1-2 sentences max. 
Be conversational, not robotic. Keep it under 30 words."""

def get_llm_response(user_text):
    print(f"User said: {user_text}")
    print("Thinking...")

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ],
        model="llama-3.3-70b-versatile",
        max_tokens=100,
        temperature=0.7,
    )

    reply = chat_completion.choices[0].message.content
    print(f"Priya says: {reply}")
    return reply

if __name__ == "__main__":
    get_llm_response("search good coffee for me")
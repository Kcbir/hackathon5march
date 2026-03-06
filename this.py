"""
this.py — Test client for Mudigonda Sharma Cafe API
Talks to the FastAPI server via HTTP. Start main.py first.
"""

import requests
import json

SERVER = "http://localhost:8000"


def call(session_id, msg):
    resp = requests.post(
        f"{SERVER}/api/chat",
        json={
            "session_id": session_id,
            "message": msg,
            "customer_name": "Omkaar",
        },
    )
    return resp.json()


def show(data):
    print()
    print("-" * 50)
    print(f"  THOUGHT : {data.get('thought_process', '-')}")
    print(f"  OMKAAR  : {data.get('tts_message', '-')}")
    stage = data.get("conversation_stage", "-")
    print(f"  STAGE   : {stage}  |  TONE: {data.get('ai_tone', '-')}")

    ca = data.get("customer_analysis", {})
    print(f"  MOOD    : {ca.get('sentiment', '-')}  |  RUSH: {ca.get('urgency', '-')}")

    offer = data.get("offer_pitched")
    if offer:
        print(f"  OFFER   : {offer}")

    items = data.get("order_data", [])
    if items:
        cart_str = ", ".join(
            f"{i.get('name', i.get('item_code'))} x{i.get('qty')}" for i in items
        )
        print(f"  CART    : {cart_str}  |  Total: Rs.{data.get('order_total', 0)}")

    delivery = data.get("delivery_type")
    if delivery:
        addr = data.get("delivery_address")
        print(f"  MODE    : {delivery}" + (f"  |  ADDR: {addr}" if addr else ""))

    rating = data.get("customer_rating")
    if rating:
        print(f"  RATING  : {rating}/5")

    print(f"  ORDER   : {data.get('order_id', '-')}  |  STATUS: {data.get('cart_status', '-')}")

    feedback = data.get("customer_feedback")
    if feedback:
        print(f"  FEEDBACK: {feedback}")

    print("-" * 50)
    print()


def main():
    print("=" * 50)
    print("  Mudigonda Sharma Cafe")
    print("  Make sure main.py is running!")
    print("=" * 50)

    # Auto-initiate — Omkaar greets first
    print("\n  Calling cafe...\n")
    data = call(None, "Hello")
    session_id = data.get("session_id")
    show(data)

    while True:
        msg = input("You: ").strip()
        if msg.lower() in ("quit", "exit"):
            break

        data = call(session_id, msg)
        show(data)

        if data.get("cart_status") == "closed":
            print("ORDER PLACED!")
            print(f"Order ID: {data.get('order_id')}")
            print("Items:", json.dumps(data.get("order_data", []), indent=2, ensure_ascii=False))
            print(f"Total: Rs.{data.get('order_total', 0)}")
            if data.get("delivery_type"):
                print(f"Mode: {data.get('delivery_type')}")
            if data.get("delivery_address"):
                print(f"Address: {data.get('delivery_address')}")
            if data.get("customer_rating"):
                print(f"Rating: {data.get('customer_rating')}/5")
            break


if __name__ == "__main__":
    main()

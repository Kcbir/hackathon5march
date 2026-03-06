"""
setup_supabase.py — Create the 'orders' and 'menu' tables in Supabase.
Run once: python setup_supabase.py
"""
import csv
import json
from supabase import create_client

SUPABASE_URL = "https://rlgerrarssaevbxqpxuz.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ2VycmFyc3NhZXZieHFweHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzE1NjMsImV4cCI6MjA4ODMwNzU2M30."
    "JAX0JUrH5oS2Fl4E53orZNJbxMdJ9Pv7CITJorP4-xM"
)

supa = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_menu():
    """Upload menu.csv to Supabase 'cafe_menu' table."""
    records = []
    with open("menu.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({
                "item_code":   row["Item Code"],
                "item_name":   row["Item Name"],
                "category":    row["Category"],
                "price":       int(row["Price (₹)"]),
                "description": row["Description"],
            })

    try:
        supa.table("cafe_menu").upsert(records, on_conflict="item_code").execute()
        print(f"Uploaded {len(records)} menu items to Supabase 'cafe_menu' table.")
    except Exception as e:
        print(f"Menu upload error: {e}")
        print("Make sure the 'cafe_menu' table exists with columns: item_code (text, PK), item_name, category, price (int), description")


def test_orders_table():
    """Test that we can insert and read from the 'orders' table."""
    test_order = {
        "order_id": "ORD-TEST01",
        "customer_name": "Test User",
        "items": json.dumps([{"item_code": "D01", "qty": 1, "name": "Classic Masala Dosa", "price": 70}]),
        "total": 70,
        "feedback": "test feedback",
        "rating": 5,
        "delivery_type": "takeout",
        "delivery_address": None,
        "created_at": "2026-03-06T10:00:00",
    }

    try:
        supa.table("orders").insert(test_order).execute()
        print("Test order inserted into 'orders' table.")

        res = supa.table("orders").select("*").eq("order_id", "ORD-TEST01").execute()
        print(f"Read back: {json.dumps(res.data, indent=2)}")

        # Clean up test data
        supa.table("orders").delete().eq("order_id", "ORD-TEST01").execute()
        print("Test order cleaned up.")
    except Exception as e:
        print(f"Orders table error: {e}")
        print("""
Please create these tables in your Supabase SQL editor:

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL,
    customer_name TEXT,
    items JSONB,
    total NUMERIC DEFAULT 0,
    feedback TEXT,
    rating INTEGER,
    delivery_type TEXT,
    delivery_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Cafe menu table
CREATE TABLE IF NOT EXISTS cafe_menu (
    item_code TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT,
    price INTEGER DEFAULT 0,
    description TEXT
);

ALTER TABLE cafe_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON cafe_menu FOR ALL USING (true) WITH CHECK (true);
""")


if __name__ == "__main__":
    print("=== Supabase Setup ===")
    print("\n1. Testing orders table...")
    test_orders_table()
    print("\n2. Uploading menu...")
    upload_menu()
    print("\nDone!")

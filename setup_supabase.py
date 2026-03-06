"""
setup_supabase.py — Create/verify all tables in Supabase.
Run once: python setup_supabase.py

SCHEMA (run this in Supabase SQL Editor first):
----------------------------------------------------------------------

-- 1. ORDERS — one row per completed order
CREATE TABLE IF NOT EXISTS orders (
    id              BIGSERIAL PRIMARY KEY,
    order_id        TEXT        NOT NULL UNIQUE,
    total_items     INTEGER     DEFAULT 0,        -- total quantity of all items
    total           NUMERIC     DEFAULT 0,        -- bill total in Rs.
    delivery_type   TEXT,                         -- 'delivery' | 'takeout'
    special_requests TEXT,                        -- e.g. "less spice, extra chutney"
    rating          INTEGER,                      -- 1-5
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON orders FOR ALL USING (true) WITH CHECK (true);

-- 2. ORDER_ITEMS — one row per item line in an order
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    TEXT    NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_code   TEXT    NOT NULL,
    item_name   TEXT    NOT NULL,
    qty         INTEGER NOT NULL,
    unit_price  NUMERIC NOT NULL,
    line_total  NUMERIC NOT NULL
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- 3. CALL_LOGS — every single turn of every conversation
CREATE TABLE IF NOT EXISTS call_logs (
    id          BIGSERIAL PRIMARY KEY,
    order_id    TEXT    NOT NULL,
    turn        INTEGER NOT NULL,   -- 1-indexed turn number in the call
    role        TEXT    NOT NULL,   -- 'user' | 'arjun'
    message     TEXT    NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON call_logs FOR ALL USING (true) WITH CHECK (true);

-- 4. CAFE_MENU
CREATE TABLE IF NOT EXISTS cafe_menu (
    item_code   TEXT PRIMARY KEY,
    item_name   TEXT NOT NULL,
    category    TEXT,
    price       INTEGER DEFAULT 0,
    description TEXT
);
ALTER TABLE cafe_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON cafe_menu FOR ALL USING (true) WITH CHECK (true);

----------------------------------------------------------------------
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
        print(f"Uploaded {len(records)} menu items.")
    except Exception as e:
        print(f"Menu upload error: {e}")


def test_tables():
    """Quick smoke test: insert a row into each table and delete it."""
    oid = "ORD-TEST01"
    try:
        supa.table("orders").insert({
            "order_id": oid, "total_items": 2, "total": 150,
            "delivery_type": "takeout", "special_requests": "less spice", "rating": 5,
        }).execute()
        supa.table("order_items").insert({
            "order_id": oid, "item_code": "D01", "item_name": "Classic Masala Dosa",
            "qty": 2, "unit_price": 70, "line_total": 140,
        }).execute()
        supa.table("call_logs").insert({
            "order_id": oid, "turn": 1, "role": "arjun",
            "message": "Hello, Mysore Cafe, Arjun here.",
        }).execute()
        print("All tables OK — test rows inserted.")
    except Exception as e:
        print(f"Table test failed: {e}")
        print("Make sure you ran the SQL schema from the docstring above in Supabase SQL Editor.")
    finally:
        try:
            supa.table("call_logs").delete().eq("order_id", oid).execute()
            supa.table("order_items").delete().eq("order_id", oid).execute()
            supa.table("orders").delete().eq("order_id", oid).execute()
        except Exception:
            pass


if __name__ == "__main__":
    print("=== Supabase Setup ===")
    test_tables()
    upload_menu()
    print("Done!")

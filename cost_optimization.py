import pandas as pd
from supabase import create_client, Client

# ---------------------------------------------------------
# 1. Supabase Connection Setup
# ---------------------------------------------------------
SUPABASE_URL = "https://rlgerrarssaevbxqpxuz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ2VycmFyc3NhZXZieHFweHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Mz" \
"E1NjMsImV4cCI6MjA4ODMwNzU2M30.JAX0JUrH5oS2Fl4E53orZNJbxMdJ9Pv7CITJorP4-xM"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_optimized_menu_dataset():
    print("Fetching entire menu and recipe data from Supabase...\n")
    
    # Fetch all menu items
    menu_res = supabase.table('menu').select('*').execute()
    
    # Fetch all recipe mappings to calculate ingredient costs
    recipes_res = supabase.table('recipe_mapping') \
        .select('menu_id, quantity_used, ingredients(unit_cost)') \
        .execute()
        
    # Pre-calculate ingredient costs per menu_id
    ingredient_costs = {}
    for mapping in recipes_res.data:
        m_id = mapping['menu_id']
        qty = float(mapping['quantity_used'])
        unit_cost = float(mapping['ingredients']['unit_cost'])
        ingredient_costs[m_id] = ingredient_costs.get(m_id, 0.0) + (qty * unit_cost)

    dataset = []
    
    # ---------------------------------------------------------
    # 2. Batch Optimization Loop
    # ---------------------------------------------------------
    for item in menu_res.data:
        m_id = item['menu_id']
        name = item['name']
        labor_cost = float(item['labor_cost'])
        place_cost = float(item['place_cost'])
        
        # Get actual ingredient cost if mapped, otherwise use ₹15.00 as a mock fallback
        ingred_cost = ingredient_costs.get(m_id, 15.00) 
        total_cost = ingred_cost + labor_cost + place_cost
        
        # Base demand (alpha) and price sensitivity (beta)
        # We'll use slightly broader hyperparameters here to accommodate 
        # both cheap items (Tea) and expensive items (Biryani)
        alpha = 150  
        beta = 1.5   
        
        # Gradient Descent function
        def gradient(price, cost, a, b):
            return (2 * b * price) - a - (b * cost)

        learning_rate = 0.001
        epochs = 1000
        current_price = total_cost + 10 

        # Optimize
        for _ in range(epochs):
            grad = gradient(current_price, total_cost, alpha, beta)
            current_price = current_price - (learning_rate * grad)
            current_price = max(current_price, total_cost) # Cannot sell below cost

        optimal_price = current_price
        projected_demand = max(0, alpha - beta * optimal_price)
        max_profit = projected_demand * (optimal_price - total_cost)
        
        # Append to our dataset list
        dataset.append({
            "Menu ID": m_id,
            "Item Name": name,
            "Base Cost (₹)": round(total_cost, 2),
            "Optimized Price (₹)": round(optimal_price, 2),
            "Est. Daily Orders": int(projected_demand),
            "Est. Daily Profit (₹)": round(max_profit, 2)
        })

    # ---------------------------------------------------------
    # 3. Create Dataset & Export
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # 3. Create Clean Dataset & Export
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # 3. Create Clean Dataset & Push to Database
    # ---------------------------------------------------------
    df = pd.DataFrame(dataset)
    
    # Keep Item Name, Base Cost, and Optimized Price
    df_final = df[['Item Name', 'Base Cost (₹)', 'Optimized Price (₹)']]
    
    # Drop any duplicate rows based on the 'Item Name'
    df_final = df_final.drop_duplicates(subset=['Item Name'])
    
    # Save a local CSV backup just in case
    csv_filename = "final_menu_prices.csv"
    df_final.to_csv(csv_filename, index=False)
    
    print(f"✅ Successfully cleaned {len(df_final)} unique menu items.")
    print("Pushing optimized prices to Supabase 'final_menu_prices' table...\n")
    
    # Format the data for Supabase
    records_to_insert = []
    for index, row in df_final.iterrows():
        records_to_insert.append({
            "item_name": row['Item Name'],
            "base_cost": float(row['Base Cost (₹)']),
            "optimized_price": float(row['Optimized Price (₹)'])
        })
    
    # Perform an upsert (Update if exists, Insert if new)
    try:
        response = supabase.table('final_menu_prices').upsert(records_to_insert).execute()
        print("✅ Database update successful!")
        
        # Print a clean table to the terminal for visual confirmation
        print("\n--- Final Pamphlet Data ---")
        print(df_final.to_string(index=False))
        
    except Exception as e:
        print(f"❌ Failed to push to database. Error: {e}")

if __name__ == "__main__":
    generate_optimized_menu_dataset()

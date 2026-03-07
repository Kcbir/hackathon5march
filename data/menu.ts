export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  inventoryHealth: 'Green' | 'Yellow' | 'Red'
  stockDetails: string
}

export const FIXED_RESTAURANT_MENU: MenuItem[] = [
  { id: 'm1', name: 'Steamed Idli (2 pcs)', category: 'Idli', price: 60, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm2', name: 'Mini Ghee Idli (14 pcs)', category: 'Idli', price: 80, inventoryHealth: 'Yellow', stockDetails: 'Medium' },
  { id: 'm3', name: 'Thatte Idli', category: 'Idli', price: 70, inventoryHealth: 'Green', stockDetails: 'High' },

  { id: 'm4', name: 'Classic Masala Dosa', category: 'Dosa', price: 70, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm5', name: 'Ghee Roast Dosa', category: 'Dosa', price: 90, inventoryHealth: 'Red', stockDetails: 'Urgent Restock (Ghee)' },
  { id: 'm6', name: 'Mysore Masala Dosa', category: 'Dosa', price: 90, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm7', name: 'Rava Dosa', category: 'Dosa', price: 80, inventoryHealth: 'Green', stockDetails: 'High' },

  { id: 'm8', name: 'Crispy Medu Vada (2 pcs)', category: 'Vada', price: 60, inventoryHealth: 'Yellow', stockDetails: 'Medium' },
  { id: 'm9', name: 'Rasam Vada', category: 'Vada', price: 70, inventoryHealth: 'Green', stockDetails: 'High' },

  { id: 'm10', name: 'Ven Pongal', category: 'Rice & Meals', price: 70, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm11', name: 'Bisi Bele Bath', category: 'Rice & Meals', price: 80, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm12', name: 'Curd Rice', category: 'Rice & Meals', price: 60, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm13', name: 'Lemon Rice', category: 'Rice & Meals', price: 60, inventoryHealth: 'Red', stockDetails: 'Urgent Restock (Lemon)' },

  { id: 'm14', name: 'Onion Uttapam', category: 'Specials', price: 70, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm15', name: 'Appam with Veg Stew', category: 'Specials', price: 90, inventoryHealth: 'Yellow', stockDetails: 'Medium' },
  { id: 'm16', name: 'Authentic Filter Coffee', category: 'Specials', price: 50, inventoryHealth: 'Green', stockDetails: 'High' },
  { id: 'm17', name: 'Sweet Kesari Bath', category: 'Specials', price: 60, inventoryHealth: 'Green', stockDetails: 'High' }
]

// Helper to get menu items by category
export function getMenuByCategory(category: string): MenuItem[] {
  return FIXED_RESTAURANT_MENU.filter(item => item.category === category)
}

// Helper to get all categories
export function getCategories(): string[] {
  return [...new Set(FIXED_RESTAURANT_MENU.map(item => item.category))]
}

// Helper to get item by ID
export function getMenuItem(id: string): MenuItem | undefined {
  return FIXED_RESTAURANT_MENU.find(item => item.id === id)
}

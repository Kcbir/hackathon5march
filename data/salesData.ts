export interface SalesItem {
  itemId: string
  itemName: string
  category: string
  currentPrice: number
  costToProduce: number
  unitsSoldLastMonth: number
  unitsSoldThisMonth: number
  avgRating: number
  returnsLastMonth: number
}

export const SALES_DATA: SalesItem[] = [
  { itemId: "m1", itemName: "Steamed Idli (2 pcs)", category: "Idli", currentPrice: 60, costToProduce: 18, unitsSoldLastMonth: 1420, unitsSoldThisMonth: 1385, avgRating: 4.6, returnsLastMonth: 5 },
  { itemId: "m2", itemName: "Mini Ghee Idli (14 pcs)", category: "Idli", currentPrice: 80, costToProduce: 32, unitsSoldLastMonth: 870, unitsSoldThisMonth: 910, avgRating: 4.8, returnsLastMonth: 2 },
  { itemId: "m3", itemName: "Thatte Idli", category: "Idli", currentPrice: 70, costToProduce: 22, unitsSoldLastMonth: 640, unitsSoldThisMonth: 590, avgRating: 4.3, returnsLastMonth: 8 },

  { itemId: "m4", itemName: "Classic Masala Dosa", category: "Dosa", currentPrice: 70, costToProduce: 24, unitsSoldLastMonth: 1680, unitsSoldThisMonth: 1720, avgRating: 4.7, returnsLastMonth: 3 },
  { itemId: "m5", itemName: "Ghee Roast Dosa", category: "Dosa", currentPrice: 90, costToProduce: 38, unitsSoldLastMonth: 980, unitsSoldThisMonth: 1050, avgRating: 4.9, returnsLastMonth: 1 },
  { itemId: "m6", itemName: "Mysore Masala Dosa", category: "Dosa", currentPrice: 90, costToProduce: 30, unitsSoldLastMonth: 1120, unitsSoldThisMonth: 1095, avgRating: 4.5, returnsLastMonth: 4 },
  { itemId: "m7", itemName: "Rava Dosa", category: "Dosa", currentPrice: 80, costToProduce: 26, unitsSoldLastMonth: 760, unitsSoldThisMonth: 710, avgRating: 4.2, returnsLastMonth: 6 },

  { itemId: "m8", itemName: "Crispy Medu Vada (2 pcs)", category: "Vada", currentPrice: 60, costToProduce: 16, unitsSoldLastMonth: 1100, unitsSoldThisMonth: 1060, avgRating: 4.5, returnsLastMonth: 7 },
  { itemId: "m9", itemName: "Rasam Vada", category: "Vada", currentPrice: 70, costToProduce: 22, unitsSoldLastMonth: 520, unitsSoldThisMonth: 480, avgRating: 4.1, returnsLastMonth: 10 },

  { itemId: "m10", itemName: "Ven Pongal", category: "Rice & Meals", currentPrice: 70, costToProduce: 25, unitsSoldLastMonth: 890, unitsSoldThisMonth: 860, avgRating: 4.4, returnsLastMonth: 3 },
  { itemId: "m11", itemName: "Bisi Bele Bath", category: "Rice & Meals", currentPrice: 80, costToProduce: 30, unitsSoldLastMonth: 740, unitsSoldThisMonth: 780, avgRating: 4.6, returnsLastMonth: 2 },
  { itemId: "m12", itemName: "Curd Rice", category: "Rice & Meals", currentPrice: 60, costToProduce: 15, unitsSoldLastMonth: 1050, unitsSoldThisMonth: 1020, avgRating: 4.3, returnsLastMonth: 4 },
  { itemId: "m13", itemName: "Lemon Rice", category: "Rice & Meals", currentPrice: 60, costToProduce: 14, unitsSoldLastMonth: 680, unitsSoldThisMonth: 620, avgRating: 4.0, returnsLastMonth: 12 },

  { itemId: "m14", itemName: "Onion Uttapam", category: "Specials", currentPrice: 70, costToProduce: 20, unitsSoldLastMonth: 560, unitsSoldThisMonth: 540, avgRating: 4.2, returnsLastMonth: 5 },
  { itemId: "m15", itemName: "Appam with Veg Stew", category: "Specials", currentPrice: 90, costToProduce: 35, unitsSoldLastMonth: 410, unitsSoldThisMonth: 380, avgRating: 4.4, returnsLastMonth: 3 },
  { itemId: "m16", itemName: "Authentic Filter Coffee", category: "Specials", currentPrice: 50, costToProduce: 12, unitsSoldLastMonth: 2200, unitsSoldThisMonth: 2340, avgRating: 4.9, returnsLastMonth: 0 },
  { itemId: "m17", itemName: "Sweet Kesari Bath", category: "Specials", currentPrice: 60, costToProduce: 20, unitsSoldLastMonth: 650, unitsSoldThisMonth: 690, avgRating: 4.5, returnsLastMonth: 1 },
]

export function getSalesSummary(): string {
  const totalRevenueLast = SALES_DATA.reduce((sum, i) => sum + i.currentPrice * i.unitsSoldLastMonth, 0)
  const totalRevenueThis = SALES_DATA.reduce((sum, i) => sum + i.currentPrice * i.unitsSoldThisMonth, 0)
  const totalCostLast = SALES_DATA.reduce((sum, i) => sum + i.costToProduce * i.unitsSoldLastMonth, 0)
  const totalProfitLast = totalRevenueLast - totalCostLast

  const rows = SALES_DATA.map(i => {
    const margin = ((i.currentPrice - i.costToProduce) / i.currentPrice * 100).toFixed(1)
    const monthlyRevenue = i.currentPrice * i.unitsSoldLastMonth
    const monthlyProfit = (i.currentPrice - i.costToProduce) * i.unitsSoldLastMonth
    const salesTrend = ((i.unitsSoldThisMonth - i.unitsSoldLastMonth) / i.unitsSoldLastMonth * 100).toFixed(1)
    return `- ${i.itemName} (${i.category}): ₹${i.currentPrice} price, ₹${i.costToProduce} cost, ${margin}% margin, ${i.unitsSoldLastMonth} sold last month, ${i.unitsSoldThisMonth} this month (${salesTrend}% trend), ₹${monthlyRevenue} revenue, ₹${monthlyProfit} profit, rating ${i.avgRating}/5, ${i.returnsLastMonth} returns`
  }).join('\n')

  return `RESTAURANT SALES DATA SUMMARY
================================
Total Revenue Last Month: ₹${totalRevenueLast.toLocaleString()}
Total Revenue This Month: ₹${totalRevenueThis.toLocaleString()}
Total Cost Last Month: ₹${totalCostLast.toLocaleString()}
Total Gross Profit Last Month: ₹${totalProfitLast.toLocaleString()}

ITEM-LEVEL DATA:
${rows}`
}

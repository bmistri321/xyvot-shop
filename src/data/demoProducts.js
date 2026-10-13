// ============================================================
// DEMO DATA — remove before production.
// Placeholder catalog so the mobile UI can be reviewed while the
// Supabase anon key is invalid (no real products load). Every page
// falls back to this data only when the real product fetch returns
// empty. DO NOT PUSH demo data to production.
// ============================================================

const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

// DEMO DATA — remove before production.
export const DEMO_CATEGORIES = [
  "Fresh",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
];

// DEMO DATA — remove before production.
// Shape mirrors the real `products` table fields used by the UI:
// id, title, description, category, unit, selling_price, mrp,
// image_url, rating, reviews, stock.
export const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    title: "Fresh Fuji Apples",
    description:
      "Fuji apples are a popular apple variety prized for their exceptional sweetness, firm crisp texture, and beautiful rosy-red skin. Originally developed in Japan and now grown in the United States.",
    category: "Fresh",
    unit: "/pack",
    selling_price: 189,
    price: 189,
    mrp: 210,
    image_url: img("photo-1560806887-1e4cd0b6cbd6"),
    rating: 4.8,
    reviews: 214,
    stock: 40,
  },
  {
    id: "demo-2",
    title: "Organic Spinach",
    description:
      "Tender organic spinach leaves, hand-picked every morning. Rich in iron and vitamins — perfect for salads, smoothies, and sabzis.",
    category: "Vegetables",
    unit: "/bunch",
    selling_price: 45,
    price: 45,
    mrp: 50,
    image_url: img("photo-1576045057995-568f588f82fb"),
    rating: 4.6,
    reviews: 98,
    stock: 60,
  },
  {
    id: "demo-3",
    title: "Organic Lettuce",
    description:
      "Crisp, fresh organic lettuce with crunchy leaves. Ideal for salads, sandwiches, and wraps.",
    category: "Vegetables",
    unit: "/bunch",
    selling_price: 60,
    price: 60,
    mrp: 60,
    image_url: img("photo-1622206151226-18ca2c9ab4a1"),
    rating: 4.5,
    reviews: 76,
    stock: 35,
  },
  {
    id: "demo-4",
    title: "Robusta Bananas",
    description:
      "Sweet and energy-packed Robusta bananas, ripened naturally. A dozen in every pack.",
    category: "Fruits",
    unit: "/dozen",
    selling_price: 49,
    price: 49,
    mrp: 49,
    image_url: img("photo-1571771894821-ce9b6c11b08e"),
    rating: 4.7,
    reviews: 312,
    stock: 80,
  },
  {
    id: "demo-5",
    title: "Desi Tomatoes",
    description:
      "Juicy, tangy desi tomatoes — the backbone of every Indian curry. Farm fresh, vine ripened.",
    category: "Vegetables",
    unit: "/kg",
    selling_price: 34,
    price: 34,
    mrp: 40,
    image_url: img("photo-1592924357228-91a4daadcfea"),
    rating: 4.4,
    reviews: 187,
    stock: 100,
  },
  {
    id: "demo-6",
    title: "Farm Fresh Milk",
    description:
      "Pure cow's milk, pasteurized and packed within hours of milking. No added preservatives.",
    category: "Dairy",
    unit: "/litre",
    selling_price: 66,
    price: 66,
    mrp: 66,
    image_url: img("photo-1550583724-b2692b85b150"),
    rating: 4.8,
    reviews: 421,
    stock: 50,
  },
  {
    id: "demo-7",
    title: "Whole Wheat Bread",
    description:
      "Soft, freshly baked whole wheat bread. High in fibre, baked daily with no maida.",
    category: "Bakery",
    unit: "/pack",
    selling_price: 45,
    price: 45,
    mrp: 50,
    image_url: img("photo-1509440159596-0249088772ff"),
    rating: 4.5,
    reviews: 156,
    stock: 45,
  },
  {
    id: "demo-8",
    title: "Farm Eggs",
    description:
      "Protein-rich farm eggs from free-range hens. A dozen in every tray.",
    category: "Dairy",
    unit: "/dozen",
    selling_price: 84,
    price: 84,
    mrp: 90,
    image_url: img("photo-1582722872445-44dc5f7e3c8f"),
    rating: 4.7,
    reviews: 289,
    stock: 70,
  },
  {
    id: "demo-9",
    title: "Fresh Strawberries",
    description:
      "Plump, juicy strawberries bursting with sweetness. Hand-picked at peak ripeness.",
    category: "Fresh",
    unit: "/box",
    selling_price: 149,
    price: 149,
    mrp: 199,
    image_url: img("photo-1464965911861-746a04b4bca6"),
    rating: 4.9,
    reviews: 167,
    stock: 25,
  },
  {
    id: "demo-10",
    title: "Nagpur Oranges",
    description:
      "Famous Nagpur mandarins — sweet, juicy, and easy to peel. Loaded with vitamin C.",
    category: "Fruits",
    unit: "/kg",
    selling_price: 79,
    price: 79,
    mrp: 79,
    image_url: img("photo-1547514701-42782101795e"),
    rating: 4.6,
    reviews: 203,
    stock: 55,
  },
  {
    id: "demo-11",
    title: "Red Carrots",
    description:
      "Sweet, crunchy red carrots — great for salads, juices, and gajar ka halwa.",
    category: "Vegetables",
    unit: "/kg",
    selling_price: 39,
    price: 39,
    mrp: 39,
    image_url: img("photo-1598170845058-32b9d6a5da37"),
    rating: 4.3,
    reviews: 88,
    stock: 65,
  },
  {
    id: "demo-12",
    title: "Fresh Broccoli",
    description:
      "Vibrant green broccoli florets, rich in fibre and antioxidants. Farm fresh.",
    category: "Vegetables",
    unit: "/piece",
    selling_price: 75,
    price: 75,
    mrp: 85,
    image_url: img("photo-1459411621453-7b03977f4bfc"),
    rating: 4.5,
    reviews: 94,
    stock: 30,
  },
];

// DEMO DATA — remove before production.
export function getDemoProduct(id) {
  return DEMO_PRODUCTS.find((p) => String(p.id) === String(id)) || null;
}

// DEMO DATA — remove before production.
export function getDemoProductsByCategory(category) {
  if (!category || category === "All") return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === String(category).toLowerCase()
  );
}

// DEMO DATA — remove before production.
export function searchDemoProducts(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  return DEMO_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
  );
}

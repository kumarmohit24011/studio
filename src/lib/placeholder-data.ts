export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: "Rings" | "Necklaces" | "Bracelets" | "Earrings";
  metal: "Gold" | "Silver" | "Platinum";
  gemstone?: "Diamond" | "Ruby" | "Sapphire" | "Emerald";
  sku: string;
  stock: number;
  tags?: ("new" | "sale" | "featured" | "trending")[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Solitaire Diamond Ring",
    description: "An exquisite solitaire diamond ring, crafted in 18k white gold. A timeless symbol of love and commitment.",
    price: 1250.00,
    images: ["https://placehold.co/600x600.png", "https://placehold.co/600x600.png"],
    category: "Rings",
    metal: "Platinum",
    gemstone: "Diamond",
    sku: "RB-RG-001",
    stock: 15,
    tags: ["featured", "new"],
  },
  {
    id: "2",
    name: "Gold Sapphire Necklace",
    description: "A stunning oval sapphire pendant on a 14k gold chain. Perfect for adding a touch of elegance.",
    price: 899.99,
    images: ["https://placehold.co/600x600.png", "https://placehold.co/600x600.png"],
    category: "Necklaces",
    metal: "Gold",
    gemstone: "Sapphire",
    sku: "RB-NK-002",
    stock: 10,
    tags: ["featured"],
  },
  {
    id: "3",
    name: "Silver Tennis Bracelet",
    description: "A classic tennis bracelet featuring shimmering cubic zirconia set in sterling silver.",
    price: 450.00,
    images: ["https://placehold.co/600x600.png"],
    category: "Bracelets",
    metal: "Silver",
    gemstone: "Diamond",
    sku: "RB-BR-003",
    stock: 25,
    tags: ["sale"],
  },
  {
    id: "4",
    name: "Emerald Stud Earrings",
    description: "Vibrant emerald-cut studs set in 14k yellow gold. A perfect pop of color.",
    price: 650.00,
    images: ["https://placehold.co/600x600.png"],
    category: "Earrings",
    metal: "Gold",
    gemstone: "Emerald",
    sku: "RB-ER-004",
    stock: 5,
    tags: ["featured", "trending"],
  },
  {
    id: "5",
    name: "Platinum Wedding Band",
    description: "A simple yet elegant 4mm wedding band crafted from pure platinum with a comfort fit.",
    price: 950.00,
    images: ["https://placehold.co/600x600.png"],
    category: "Rings",
    metal: "Platinum",
    sku: "RB-RG-005",
    stock: 30,
    tags: ["trending"],
  },
  {
    id: "6",
    name: "Ruby Pendant Necklace",
    description: "A passionate heart-shaped ruby pendant suspended from a delicate silver chain.",
    price: 520.00,
    images: ["https://placehold.co/600x600.png"],
    category: "Necklaces",
    metal: "Silver",
    gemstone: "Ruby",
    sku: "RB-NK-006",
    stock: 8,
    tags: ["new", "trending"],
  },
  {
    id: "7",
    name: "Diamond Hoop Earrings",
    description: "Dazzling inside-out diamond hoop earrings set in 18k white gold for maximum sparkle.",
    price: 2100.00,
    images: ["https://placehold.co/600x600.png"],
    category: "Earrings",
    metal: "Platinum",
    gemstone: "Diamond",
    sku: "RB-ER-007",
    stock: 12,
  },
  {
    id: "8",
    name: "Gold Charm Bracelet",
    description: "A beautiful 14k gold link bracelet, ready to be personalized with your favorite charms.",
    price: 780.00,
    images: ["https://placehold.co/600x600.png"],
    category: "Bracelets",
    metal: "Gold",
    sku: "RB-BR-008",
    stock: 0,
    tags: ["sale", "trending"],
  },
];

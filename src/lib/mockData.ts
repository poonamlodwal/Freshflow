export interface ProduceBatch {
  id: string;
  name: string;
  category: "Fruits" | "Vegetables" | "Berries" | "Organics";
  farmName: string;
  location: string;
  harvestDate: string;
  expiryDaysRemaining: number;
  freshnessScore: number; // 0-100
  grade: "Grade A (Pristine)" | "Grade B (Minor Blemish)" | "Grade C (Expiring Soon)";
  quantityKg: number;
  originalPricePerKg: number;
  discountedPricePerKg: number;
  imageUrl: string;
  aiConfidence: number;
  brixLevel?: string;
  co2SavedKg: number;
  status: "Harvested" | "Listed" | "Claimed" | "Delivered";
  farmerAvatar: string;
  certHash: string;
  defects: string[];
}

export interface TimelineEvent {
  id: string;
  step: "scanned" | "listed" | "requested" | "claimed" | "delivered";
  title: string;
  description: string;
  timestamp: string;
  location: string;
  verifiedBy: string;
  tempCelsius: number;
  humidityPercent: number;
  iconName: string;
}

export interface SampleProduce {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  freshnessScore: number;
  grade: "Grade A (Pristine)" | "Grade B (Minor Blemish)" | "Grade C (Expiring Soon)";
  expiryDays: number;
  brix: string;
  defects: string[];
  suggestedDiscount: number;
  boundingBoxes: Array<{ label: string; confidence: number; x: number; y: number; width: number; height: number }>;
}

export interface GlobalProduceItem {
  id: string;
  name: string;
  nativeName?: string;
  category: "Fruit" | "Vegetable" | "Exotic" | "Organic";
  country: string;
  flagEmoji: string;
  region: string;
  seasonality: "Peak Summer" | "Monsoon Harvest" | "Winter Crop" | "All Season";
  annualExportVolumeTons: number;
  freshnessGrade: string;
  brixLevel: string;
  description: string;
  imageUrl: string;
  keyNutrients: string[];
  isTopExporter: boolean;
}

export const MOCK_SAMPLE_PRODUCE: SampleProduce[] = [
  {
    id: "sample-apple",
    name: "Honeycrisp Apples",
    category: "Fruits",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 94,
    grade: "Grade A (Pristine)",
    expiryDays: 8,
    brix: "14.2° Brix",
    defects: ["Minor stem blemish (< 2%)"],
    suggestedDiscount: 0,
    boundingBoxes: [
      { label: "Honeycrisp Apple (Prime)", confidence: 98.4, x: 20, y: 18, width: 60, height: 62 },
      { label: "Stem Attachment", confidence: 94.1, x: 45, y: 12, width: 12, height: 14 }
    ]
  },
  {
    id: "sample-banana",
    name: "Organic Cavendish Bananas",
    category: "Fruits",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 78,
    grade: "Grade B (Minor Blemish)",
    expiryDays: 2,
    brix: "18.5° Brix",
    defects: ["Sugar spots starting", "High ripeness curve"],
    suggestedDiscount: 30,
    boundingBoxes: [
      { label: "Organic Cavendish Cluster", confidence: 96.8, x: 15, y: 22, width: 70, height: 58 },
      { label: "High Sugar Spot Cluster", confidence: 89.2, x: 42, y: 48, width: 22, height: 20 }
    ]
  },
  {
    id: "sample-strawberry",
    name: "Wild California Strawberries",
    category: "Berries",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 96,
    grade: "Grade A (Pristine)",
    expiryDays: 5,
    brix: "11.8° Brix",
    defects: ["Zero fungal indicators", "Optimal hydration"],
    suggestedDiscount: 0,
    boundingBoxes: [
      { label: "Fresh Strawberry Basket", confidence: 99.1, x: 12, y: 15, width: 76, height: 70 },
      { label: "Vibrant Calyx (Leaf)", confidence: 95.6, x: 38, y: 20, width: 25, height: 22 }
    ]
  },
  {
    id: "sample-avocado",
    name: "Hass Avocado Premium",
    category: "Organics",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 88,
    grade: "Grade A (Pristine)",
    expiryDays: 4,
    brix: "Firmness Index 8.2",
    defects: ["Ready-to-eat threshold approaching"],
    suggestedDiscount: 15,
    boundingBoxes: [
      { label: "Hass Avocado", confidence: 97.5, x: 22, y: 20, width: 56, height: 60 }
    ]
  },
  {
    id: "sample-tomato",
    name: "Vine-Ripened Heirloom Tomatoes",
    category: "Vegetables",
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    freshnessScore: 68,
    grade: "Grade C (Expiring Soon)",
    expiryDays: 1,
    brix: "7.1° Brix",
    defects: ["Softening skin density", "Optimal for sauces/purees"],
    suggestedDiscount: 45,
    boundingBoxes: [
      { label: "Heirloom Tomato", confidence: 95.2, x: 18, y: 18, width: 64, height: 64 },
      { label: "Soft skin zone", confidence: 87.9, x: 50, y: 35, width: 20, height: 18 }
    ]
  }
];

export const MOCK_GLOBAL_PRODUCE: GlobalProduceItem[] = [
  // INDIA
  {
    id: "gp-1",
    name: "Alphonso Hapus Mango",
    nativeName: "हापूस आंबा (Ratnagiri)",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Ratnagiri & Devgad, Maharashtra",
    seasonality: "Peak Summer",
    annualExportVolumeTons: 65000,
    freshnessGrade: "Grade A+ GI Tagged",
    brixLevel: "22.5° Brix",
    description: "The undisputed King of Mangoes, renowned worldwide for its saffron-yellow rich pulp, non-fibrous texture, and intense floral aroma.",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Vitamin A", "Vitamin C", "Digestive Enzymes"],
    isTopExporter: true
  },
  {
    id: "gp-4",
    name: "Nagpur Mandarin Orange",
    nativeName: "नागपुरी संत्रा",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Nagpur & Vidarbha, Maharashtra",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 85000,
    freshnessGrade: "Grade A Sweet Citrus",
    brixLevel: "13.4° Brix",
    description: "Famous loose-skinned mandarin oranges possessing a distinct sweet-tart tangy flavor profile and high juice content.",
    imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Vitamin C", "Flavonoids", "Thiamine"],
    isTopExporter: true
  },
  {
    id: "gp-6",
    name: "Kashmiri Red Delicious Apple",
    nativeName: "कश्मीर का सेब (Shopian)",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Shopian & Baramulla, Jammu & Kashmir",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 1800000,
    freshnessGrade: "Grade A Premium Crisp",
    brixLevel: "14.6° Brix",
    description: "High-altitude Himalayan valley crisp apples featuring deep crimson red skin, crunchy flesh, and sweet juice density.",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Pectin Fiber", "Quercetin", "Vitamin C"],
    isTopExporter: true
  },
  {
    id: "gp-9",
    name: "Nashik Crimson Seedless Grapes",
    nativeName: "नाशिक द्राक्षे",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Nashik Grape Capital, Maharashtra",
    seasonality: "Peak Summer",
    annualExportVolumeTons: 260000,
    freshnessGrade: "Grade A GlobalGAP",
    brixLevel: "19.2° Brix",
    description: "Firm seedless grapes with crunchy skin and sweet honey notes, grown in India's premier wine and viticulture valley.",
    imageUrl: "/images/grapes.jpg",
    keyNutrients: ["Resveratrol", "Copper", "Vitamin B6"],
    isTopExporter: true
  },
  {
    id: "gp-12",
    name: "Bhindi (Fresh Tender Okra)",
    nativeName: "हरी भिंडी (Gujarat Organic)",
    category: "Vegetable",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Anand & Vadodara, Gujarat",
    seasonality: "Monsoon Harvest",
    annualExportVolumeTons: 92000,
    freshnessGrade: "Grade A Crisp Pod",
    brixLevel: "Moisture 88%",
    description: "Tender green okra pods harvested at dawn for zero fiber stringiness, rich mucilage fiber, and crisp pan-fry quality.",
    imageUrl: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Mucilage Fiber", "Folate", "Magnesium"],
    isTopExporter: true
  },
  {
    id: "gp-13",
    name: "Mahabaleshwar Strawberry",
    nativeName: "महाबळेश्वर स्ट्रॉबेरी",
    category: "Organic",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Mahabaleshwar, Western Ghats, MH",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 35000,
    freshnessGrade: "Grade A GI Certified",
    brixLevel: "12.4° Brix",
    description: "Cold plateau cultivated sweet strawberries bursting with ruby red color, high floral aroma, and rich antioxidant profile.",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Ellagic Acid", "Vitamin C", "Manganese"],
    isTopExporter: true
  },
  {
    id: "gp-14",
    name: "Idukki Fresh Spiced Ginger",
    nativeName: "इदुक्की अदरक (High Range)",
    category: "Organic",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Idukki High Ranges, Kerala",
    seasonality: "Monsoon Harvest",
    annualExportVolumeTons: 48000,
    freshnessGrade: "Grade A Pungent Prime",
    brixLevel: "Gingerol 4.2%",
    description: "High altitude organic ginger rhizomes possessing sharp pungent aromatic warmth and essential therapeutic gingerol oils.",
    imageUrl: "/images/ginger.jpg" ,
    keyNutrients: ["Gingerols", "Shogaols", "Anti-inflammatory Antioxidants"],
    isTopExporter: true
  },
  {
    id: "gp-15",
    name: "Solapur Bhagwa Pomegranate",
    nativeName: "सोलापूर भगवा डाळिंब",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Solapur & Sangli, Maharashtra",
    seasonality: "All Season",
    annualExportVolumeTons: 115000,
    freshnessGrade: "Grade A Ruby Arils",
    brixLevel: "17.8° Brix",
    description: "Glossy deep-red arils with soft seeds and sweet aromatic juice, celebrated across Europe and Middle East markets.",
    imageUrl: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Punicalagins", "Vitamin C", "Potassium"],
    isTopExporter: true
  },
  {
    id: "gp-16",
    name: "Mysore Yelakki Nanjangud Banana",
    nativeName: "ಏಲಕ್ಕಿ ಬಾಳೆಹಣ್ಣು (Mysuru)",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Nanjangud & Mysuru, Karnataka",
    seasonality: "All Season",
    annualExportVolumeTons: 78000,
    freshnessGrade: "Grade A GI Tagged",
    brixLevel: "21.0° Brix",
    description: "Miniature aromatic bananas possessing a rich honey-cardamom sweetness and distinctive thin golden skin.",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Potassium", "Vitamin B6", "Prebiotic Fiber"],
    isTopExporter: true
  },
  {
    id: "gp-17",
    name: "Malihabadi Dasheri Mango",
    nativeName: "दशहरी आम (Lucknow)",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Malihabad, Uttar Pradesh",
    seasonality: "Peak Summer",
    annualExportVolumeTons: 52000,
    freshnessGrade: "Grade A Royal GI",
    brixLevel: "20.4° Brix",
    description: "Historical royal mango variety cultivated since the 18th century, famous for slender shape and melting sweet aromatic pulp.",
    imageUrl: "/images/dusserimango.jpg",
    keyNutrients: ["Beta-Carotene", "Vitamin C", "Potassium"],
    isTopExporter: true
  },
  {
    id: "gp-18",
    name: "Allahabad Safeda Guava",
    nativeName: "इलाहाबादी सफेदा अमरूद",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Prayagraj, Uttar Pradesh",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 42000,
    freshnessGrade: "Grade A Soft Seed",
    brixLevel: "12.5° Brix",
    description: "Round creamy white pulp guava known for mild sweet flavor, soft seeds, and extraordinarily high Vitamin C content.",
    imageUrl: "/images/guava.jpeg",
    keyNutrients: ["4x Vitamin C of Oranges", "Lycopene", "Pectin"],
    isTopExporter: false
  },
  {
    id: "gp-19",
    name: "Salem Gundu Red Chillies",
    nativeName: "गुंडू सूखी मिर्च (Salem)",
    category: "Vegetable",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Salem & Ramanathapuram, Tamil Nadu",
    seasonality: "Peak Summer",
    annualExportVolumeTons: 64000,
    freshnessGrade: "Grade A High Capsaicin",
    brixLevel: "ASTA Color 120",
    description: "Spherical cherry-red peppers prized for deep crimson oleoresin color and pungent fiery culinary heat.",
    imageUrl: "/images/redchilli.jpg",
    keyNutrients: ["Capsaicin", "Vitamin C", "Carotenoids"],
    isTopExporter: true
  },
  {
    id: "gp-20",
    name: "Himachali Royal Delicious Apple",
    nativeName: "हिमाचली रॉयल सेब (Kotkhai)",
    category: "Fruit",
    country: "India",
    flagEmoji: "🇮🇳",
    region: "Kotkhai & Thanedar, Himachal Pradesh",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 950000,
    freshnessGrade: "Grade A High-Altitude",
    brixLevel: "15.0° Brix",
    description: "Apple orchards situated 7000ft above sea level producing fragrant, juicy apples with dense crisp bite.",
    imageUrl: "/images/himachalapple.webp",
    keyNutrients: ["Quercetin", "Fiber", "Vitamin C"],
    isTopExporter: true
  },

  // INTERNATIONAL (18 ITEMS)
  {
    id: "gp-2",
    name: "Michoacán Hass Avocado",
    nativeName: "Aguacate Hass de Michoacán",
    category: "Organic",
    country: "Mexico",
    flagEmoji: "🇲🇽",
    region: "Uruapan, Michoacán",
    seasonality: "All Season",
    annualExportVolumeTons: 1200000,
    freshnessGrade: "Grade A Export Prime",
    brixLevel: "Fat Density 19%",
    description: "Volcanic soil cultivated avocado boasting nutty creaminess, pebble-textured skin, and world-renowned guacamole flavor.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Healthy Monounsaturated Fats", "Potassium", "Fiber"],
    isTopExporter: true
  },
  {
    id: "gp-3",
    name: "Zespri SunGold Kiwi",
    nativeName: "Gold Kiwi Fruit",
    category: "Exotic",
    country: "New Zealand",
    flagEmoji: "🇳🇿",
    region: "Bay of Plenty, North Island",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 480000,
    freshnessGrade: "Grade A Pristine",
    brixLevel: "16.8° Brix",
    description: "Smooth bronze skin with vibrant golden pulp delivering a sweet tropical burst packed with 3x the Vitamin C of oranges.",
    imageUrl: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["High Vitamin C", "Actinidin Enzyme", "Folate"],
    isTopExporter: true
  },
  {
    id: "gp-5",
    name: "Royal Honey Dragon Fruit",
    nativeName: "แก้วมังกร (Dragonfruit)",
    category: "Exotic",
    country: "Thailand",
    flagEmoji: "🇹🇭",
    region: "Chanthaburi Province",
    seasonality: "Monsoon Harvest",
    annualExportVolumeTons: 210000,
    freshnessGrade: "Grade A Magenta",
    brixLevel: "15.1° Brix",
    description: "Vibrant pink skin enclosing deep ruby-red antioxidants-rich flesh speckled with tiny crunchy black seeds.",
    imageUrl: "/images/dragonfruit.jpeg",
    keyNutrients: ["Betalain Antioxidants", "Prebiotics", "Iron"],
    isTopExporter: true
  },
  {
    id: "gp-7",
    name: "Sicilian Blood Orange",
    nativeName: "Arancia Rossa di Sicilia IGP",
    category: "Exotic",
    country: "Italy",
    flagEmoji: "🇮🇹",
    region: "Catania, Mt. Etna Slopes, Sicily",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 140000,
    freshnessGrade: "Grade A IGP Certified",
    brixLevel: "14.0° Brix",
    description: "Unique citrus nurtured by Mt. Etna volcanic climate, producing dark ruby red pulp with raspberry-citrus undertones.",
    imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Anthocyanins", "Vitamin C", "Potassium"],
    isTopExporter: true
  },
  {
    id: "gp-8",
    name: "Chilean High-Mountain Blueberry",
    nativeName: "Arándanos de Chile",
    category: "Organic",
    country: "Chile",
    flagEmoji: "🇨🇱",
    region: "Central Valley, Chile",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 110000,
    freshnessGrade: "Grade A Superfood",
    brixLevel: "12.8° Brix",
    description: "Plump, dusty-blue superberries harvested in pristine Andes mountain climate, renowned for rich antioxidant punch.",
    imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Anthocyanins", "Vitamin K", "Manganese"],
    isTopExporter: true
  },
  {
    id: "gp-10",
    name: "Aomori Honey Fuji Apple",
    nativeName: "青森ふじりんご (Aomori Fuji)",
    category: "Fruit",
    country: "Japan",
    flagEmoji: "🇯🇵",
    region: "Hirosaki, Aomori Prefecture",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 45000,
    freshnessGrade: "Grade A Artisan Honey Core",
    brixLevel: "16.5° Brix",
    description: "Artisan Japanese hand-bagged apples featuring translucent honeyed sugar cores, firm crisp snap, and intense sweetness.",
    imageUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Dietary Fiber", "Polyphenols", "Potassium"],
    isTopExporter: false
  },
  {
    id: "gp-11",
    name: "Costa Rican MD2 Golden Pineapple",
    nativeName: "Piña Dorada MD2",
    category: "Organic",
    country: "Costa Rica",
    flagEmoji: "🇨🇷",
    region: "Alajuela & San Carlos",
    seasonality: "All Season",
    annualExportVolumeTons: 2200000,
    freshnessGrade: "Grade A Sweet Gold",
    brixLevel: "15.5° Brix",
    description: "Ultra-sweet low acidity golden pineapples featuring juicy vibrant yellow pulp and high natural bromelain content.",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Bromelain Enzyme", "Manganese", "Vitamin C"],
    isTopExporter: true
  },
  {
    id: "gp-21",
    name: "Spanish Sweet Bell Peppers (Pimiento)",
    nativeName: "Pimiento Dulce de Murcia",
    category: "Vegetable",
    country: "Spain",
    flagEmoji: "🇪🇸",
    region: "Murcia & Almería",
    seasonality: "All Season",
    annualExportVolumeTons: 820000,
    freshnessGrade: "Grade A Sweet Crisp",
    brixLevel: "8.2° Brix",
    description: "Thick-walled glossy red and yellow bell peppers with crunchy texture and high natural vitamin C levels.",
    imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Vitamin C", "Vitamin A", "Lutein"],
    isTopExporter: true
  },
  {
    id: "gp-22",
    name: "Egyptian Valencia Sweet Oranges",
    nativeName: "برتقال فالنسيا (Nile Delta)",
    category: "Fruit",
    country: "Egypt",
    flagEmoji: "🇪🇬",
    region: "Nile Delta & Beheira",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 1650000,
    freshnessGrade: "Grade A High Juice Ratio",
    brixLevel: "12.8° Brix",
    description: "Sun-drenched Mediterranean oranges offering exceptional juiciness, vibrant thin peel, and high sugar-acid balance.",
    imageUrl: "/images/oranges.jpeg",
    keyNutrients: ["Vitamin C", "Hesperidin", "Folate"],
    isTopExporter: true
  },
  {
    id: "gp-23",
    name: "Peruvian Red Globe Grapes",
    nativeName: "Uva Red Globe de Ica",
    category: "Fruit",
    country: "Peru",
    flagEmoji: "🇵🇪",
    region: "Ica Valley & Piura",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 540000,
    freshnessGrade: "Grade A Large Seeded",
    brixLevel: "17.2° Brix",
    description: "Jumbo-sized round red grapes with crisp juicy flesh, high firm crunch, and long shelf life.",
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Polyphenols", "Vitamin K", "Potassium"],
    isTopExporter: true
  },
  {
    id: "gp-24",
    name: "Australian Honey Gold Mango",
    nativeName: "Honey Gold Mango (Queensland)",
    category: "Exotic",
    country: "Australia",
    flagEmoji: "🇦🇺",
    region: "Northern Territory & Queensland",
    seasonality: "Peak Summer",
    annualExportVolumeTons: 28000,
    freshnessGrade: "Grade A Gourmet Gold",
    brixLevel: "20.5° Brix",
    description: "Sub-tropical Australian mango possessing smooth fibreless apricot-colored flesh and sweet honey syrup flavor.",
   imageUrl: "/images/goldmango.jpg",
    keyNutrients: ["Beta-Carotene", "Vitamin C", "Fiber"],
    isTopExporter: false
  },
  {
    id: "gp-25",
    name: "Turkish Bursa Black Fig",
    nativeName: "Bursa Siyah İnciri",
    category: "Organic",
    country: "Turkey",
    flagEmoji: "🇹🇷",
    region: "Bursa Province, Marmara",
    seasonality: "Monsoon Harvest",
    annualExportVolumeTons: 38000,
    freshnessGrade: "Grade A PDO Honey Core",
    brixLevel: "24.0° Brix",
    description: "Famous black-purple skin figs filled with jam-like ruby red honey pulp, worshipped by pastry chefs worldwide.",
    imageUrl: "/images/blackfig.jpeg",
    keyNutrients: ["Calcium", "Potassium", "Dietary Fiber"],
    isTopExporter: true
  },
  {
    id: "gp-26",
    name: "Washington Honeycrisp Premium Apple",
    nativeName: "Honeycrisp (Yakima Valley)",
    category: "Fruit",
    country: "USA",
    flagEmoji: "🇺🇸",
    region: "Yakima Valley, Washington",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 1400000,
    freshnessGrade: "Grade A Extra Fancy",
    brixLevel: "14.2° Brix",
    description: "The gold standard in apple crunch technology, engineered for explosive juice bursts and honey sweetness.",
    imageUrl: "/images/apple.jpg",
    keyNutrients: ["Dietary Fiber", "Vitamin C", "Antioxidants"],
    isTopExporter: true
  },
  {
    id: "gp-27",
    name: "Ecuadorian Premium Cavendish Banana",
    nativeName: "Guineo Orgánico de Ecuador",
    category: "Organic",
    country: "Ecuador",
    flagEmoji: "🇪🇨",
    region: "Guayas & Machala",
    seasonality: "All Season",
    annualExportVolumeTons: 6800000,
    freshnessGrade: "Grade A Rainforest Alliance",
    brixLevel: "19.0° Brix",
    description: "The world's leading banana export hub, supplying creamy nutrient-dense bananas grown in equatorial soil.",
    imageUrl: "/images/banana.jpeg",
    keyNutrients: ["Potassium", "Vitamin B6", "Magnesium"],
    isTopExporter: true
  },
  {
    id: "gp-28",
    name: "Brazilian Organic Açaí Berry",
    nativeName: "Açaí do Pará (Amazônia)",
    category: "Exotic",
    country: "Brazil",
    flagEmoji: "🇧🇷",
    region: "Pará, Amazon Rainforest",
    seasonality: "All Season",
    annualExportVolumeTons: 180000,
    freshnessGrade: "Grade A Superfood",
    brixLevel: "Antioxidant ORAC 102,700",
    description: "Wild Amazonian palm berries packed with healthy omegas, deep purple anthocyanins, and rich chocolate-berry notes.",
    imageUrl: "/images/berry.jpeg",
    keyNutrients: ["Omega-3 & 6", "Anthocyanins", "Iron"],
    isTopExporter: true
  },
  {
    id: "gp-29",
    name: "Veracruz Red Papaya",
    nativeName: "Papaya Maradol de Veracruz",
    category: "Fruit",
    country: "Mexico",
    flagEmoji: "🇲🇽",
    region: "Veracruz & Chiapas",
    seasonality: "All Season",
    annualExportVolumeTons: 170000,
    freshnessGrade: "Grade A Sweet Salmon",
    brixLevel: "13.5° Brix",
    description: "Large salmon-red flesh papayas packed with papain digestive enzymes and tropical sweetness.",
    imageUrl: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Papain Enzyme", "Vitamin C", "Folate"],
    isTopExporter: true
  },
  {
    id: "gp-30",
    name: "California Wild Albion Strawberry",
    nativeName: "Watsonville Albion Strawberry",
    category: "Organic",
    country: "USA",
    flagEmoji: "🇺🇸",
    region: "Watsonville & Santa Maria, CA",
    seasonality: "Peak Summer",
    annualExportVolumeTons: 125000,
    freshnessGrade: "Grade A Pristine",
    brixLevel: "11.8° Brix",
    description: "Hyper-aromatic California strawberries cultivated in coastal ocean breeze fields for maximum berry sweetness.",
    imageUrl: "/images/starberry.jpeg",
    keyNutrients: ["Vitamin C", "Ellagic Acid", "Folate"],
    isTopExporter: true
  },
  {
    id: "gp-31",
    name: "Spanish Crisp Romanesco Broccoli",
    nativeName: "Brócoli Romanesco de Murcia",
    category: "Vegetable",
    country: "Spain",
    flagEmoji: "🇪🇸",
    region: "Murcia Valley",
    seasonality: "Winter Crop",
    annualExportVolumeTons: 340000,
    freshnessGrade: "Grade A Fractal Crisp",
    brixLevel: "Sulforaphane High",
    description: "Stunning logarithmic fractal green brassica with mild nutty sweetness and high cellular detoxifying sulforaphane.",
    imageUrl: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=800&q=80",
    keyNutrients: ["Sulforaphane", "Vitamin C", "Vitamin K"],
    isTopExporter: true
  }
];

export const MOCK_MARKETPLACE_BATCHES: ProduceBatch[] = [
  {
    id: "BATCH-8901",
    name: "Organic Cavendish Bananas",
    category: "Fruits",
    farmName: "GreenValley Eco Orchards",
    location: "Salinas Valley, CA",
    harvestDate: "2026-08-05",
    expiryDaysRemaining: 1,
    freshnessScore: 78,
    grade: "Grade B (Minor Blemish)",
    quantityKg: 450,
    originalPricePerKg: 2.80,
    discountedPricePerKg: 1.20,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    aiConfidence: 97.4,
    brixLevel: "18.5° Brix",
    co2SavedKg: 1125,
    status: "Listed",
    farmerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    certHash: "0x8f9b...a4e1",
    defects: ["Ripeness peak achieved", "Ideal for smoothies/bakeries"]
  },
  {
    id: "BATCH-7742",
    name: "Vine-Ripened Heirloom Tomatoes",
    category: "Vegetables",
    farmName: "SunRays Hydroponic Farm",
    location: "Bakersfield, CA",
    harvestDate: "2026-08-04",
    expiryDaysRemaining: 2,
    freshnessScore: 82,
    grade: "Grade B (Minor Blemish)",
    quantityKg: 620,
    originalPricePerKg: 3.50,
    discountedPricePerKg: 1.80,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    aiConfidence: 95.8,
    brixLevel: "7.1° Brix",
    co2SavedKg: 1550,
    status: "Listed",
    farmerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    certHash: "0x3c2a...f902",
    defects: ["Softening skin", "Rich umami profile"]
  },
  {
    id: "BATCH-3091",
    name: "Wild California Strawberries",
    category: "Berries",
    farmName: "Pacific Breeze Berry Co.",
    location: "Watsonville, CA",
    harvestDate: "2026-08-06",
    expiryDaysRemaining: 3,
    freshnessScore: 92,
    grade: "Grade A (Pristine)",
    quantityKg: 280,
    originalPricePerKg: 5.40,
    discountedPricePerKg: 3.10,
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    aiConfidence: 98.9,
    brixLevel: "11.8° Brix",
    co2SavedKg: 700,
    status: "Listed",
    farmerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    certHash: "0x7e1f...d112",
    defects: ["Pristine condition", "Hyper local harvest"]
  },
  {
    id: "BATCH-4410",
    name: "Honeycrisp Apples Premium",
    category: "Fruits",
    farmName: "Highland Crest Farms",
    location: "Yakima Valley, WA",
    harvestDate: "2026-08-02",
    expiryDaysRemaining: 5,
    freshnessScore: 95,
    grade: "Grade A (Pristine)",
    quantityKg: 1200,
    originalPricePerKg: 2.90,
    discountedPricePerKg: 2.10,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    aiConfidence: 99.2,
    brixLevel: "14.2° Brix",
    co2SavedKg: 3000,
    status: "Listed",
    farmerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    certHash: "0x12a8...b771",
    defects: ["Crisp crunch", "Controlled atmosphere storage"]
  },
  {
    id: "BATCH-5982",
    name: "Hass Avocado Crates",
    category: "Organics",
    farmName: "Avocado Grove Estates",
    location: "Fallbrook, CA",
    harvestDate: "2026-08-03",
    expiryDaysRemaining: 2,
    freshnessScore: 76,
    grade: "Grade B (Minor Blemish)",
    quantityKg: 500,
    originalPricePerKg: 4.80,
    discountedPricePerKg: 2.60,
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
    aiConfidence: 94.7,
    brixLevel: "Fat content 18%",
    co2SavedKg: 1250,
    status: "Listed",
    farmerAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    certHash: "0x992b...e431",
    defects: ["Peak creaminess", "Guacamole grade"]
  },
  {
    id: "BATCH-1049",
    name: "Crisp Baby Spinach Crates",
    category: "Vegetables",
    farmName: "Verdant Fields Organic",
    location: "Salinas, CA",
    harvestDate: "2026-08-06",
    expiryDaysRemaining: 4,
    freshnessScore: 89,
    grade: "Grade A (Pristine)",
    quantityKg: 340,
    originalPricePerKg: 3.90,
    discountedPricePerKg: 2.40,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
    aiConfidence: 96.5,
    brixLevel: "Moisture 94%",
    co2SavedKg: 850,
    status: "Listed",
    farmerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    certHash: "0x5511...c339",
    defects: ["Hydro-cooled batch", "Triple washed"]
  }
];

export const MOCK_TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  "BATCH-8901": [
    {
      id: "t1",
      step: "scanned",
      title: "Harvested & AI Quality Scanned",
      description: "Batch harvested at GreenValley Eco Orchards. Hugging Face Vision Transformer model scanned 450kg of bananas.",
      timestamp: "Aug 05, 2026 • 06:30 AM",
      location: "Salinas Valley, CA (Field Station #4)",
      verifiedBy: "FreshFlow AI Vision Bot v4.2",
      tempCelsius: 14.2,
      humidityPercent: 88,
      iconName: "Scan"
    },
    {
      id: "t2",
      step: "listed",
      title: "Auto-Listed on Rescue Marketplace",
      description: "AI detected 1-day shelf life remaining. System auto-discounted batch by 57% to prevent spoilage.",
      timestamp: "Aug 05, 2026 • 09:15 AM",
      location: "FreshFlow ERP Node #12",
      verifiedBy: "Automated Marketplace Engine",
      tempCelsius: 12.8,
      humidityPercent: 84,
      iconName: "Store"
    },
    {
      id: "t3",
      step: "requested",
      title: "Claim Request Received",
      description: "Bay Area Artisan Bakery group submitted instant claim for 450kg banana batch.",
      timestamp: "Aug 06, 2026 • 02:40 PM",
      location: "San Francisco Commercial Kitchen Hub",
      verifiedBy: "Artisan Bakery Procurement",
      tempCelsius: 11.5,
      humidityPercent: 80,
      iconName: "ShoppingBag"
    },
    {
      id: "t4",
      step: "claimed",
      title: "Batch Claimed & Smart Contract Locked",
      description: "Escrow funds locked on chain. Temperature monitoring active during cold chain pickup.",
      timestamp: "Aug 07, 2026 • 08:10 AM",
      location: "Salinas Cold Storage Facility",
      verifiedBy: "Smart Contract #8901-BA",
      tempCelsius: 10.4,
      humidityPercent: 78,
      iconName: "CheckCircle2"
    },
    {
      id: "t5",
      step: "delivered",
      title: "Final Delivery & Carbon Offset Verified",
      description: "Refrigerated EV Van delivered batch. 1,125 kg CO2 emission prevented. 100% food waste averted!",
      timestamp: "Aug 08, 2026 • 11:25 AM",
      location: "San Francisco, CA",
      verifiedBy: "ColdChain IoT Sensor Node #892",
      tempCelsius: 8.5,
      humidityPercent: 75,
      iconName: "Truck"
    }
  ],
  "BATCH-7742": [
    {
      id: "t1",
      step: "scanned",
      title: "Hydroponic Greenhouse Harvest",
      description: "Harvested and scanned with 95.8% AI confidence. Umami profile & soft skin detected.",
      timestamp: "Aug 04, 2026 • 07:00 AM",
      location: "Bakersfield, CA",
      verifiedBy: "SunRays Hydro Bot",
      tempCelsius: 16.0,
      humidityPercent: 82,
      iconName: "Scan"
    },
    {
      id: "t2",
      step: "listed",
      title: "Listed on Near-Expiry Exchange",
      description: "Auto-discounted 48% for quick sauce & puree food service distribution.",
      timestamp: "Aug 04, 2026 • 11:00 AM",
      location: "FreshFlow Central Hub",
      verifiedBy: "System ERP",
      tempCelsius: 14.5,
      humidityPercent: 80,
      iconName: "Store"
    },
    {
      id: "t3",
      step: "requested",
      title: "Culinary School Reserve",
      description: "California Culinary Institute requested full batch for soup prep.",
      timestamp: "Aug 05, 2026 • 01:20 PM",
      location: "Bakersfield Hub",
      verifiedBy: "Chef Procurement",
      tempCelsius: 13.0,
      humidityPercent: 76,
      iconName: "ShoppingBag"
    }
  ]
};

export const MOCK_ERP_STATS = {
  totalBatchesTracked: 1482,
  freshnessRatioPercent: 92.4,
  totalWastePreventedKg: 14250,
  salvagedRevenueUsd: 48920,
  activeAlertsCount: 4,
  huggingFaceModelVersion: "ViT-Produce-v4.2-Precision",
  inferenceLatencyMs: 42
};

export const MOCK_AI_SUGGESTIONS = [
  {
    id: "sug-1",
    severity: "urgent",
    title: "⚡ Urgent Expiry Warning",
    message: "4 Batches of Organic Cavendish Bananas (450kg total) are expiring in 24 hours.",
    recommendation: "Apply 30% instant marketplace discount to clear before end of day.",
    actionText: "Discount 30% & Auto-List",
    batchId: "BATCH-8901"
  },
  {
    id: "sug-2",
    severity: "warning",
    title: "Thermographic Temperature Spike Detected",
    message: "Refrigeration Unit #3 in Salinas Depot registered +2.4°C rise above safety threshold.",
    recommendation: "Reroute 620kg Heirloom Tomatoes to local culinary buyer immediately.",
    actionText: "Trigger Priority Dispatch",
    batchId: "BATCH-7742"
  },
  {
    id: "sug-3",
    severity: "info",
    title: "Peak Demand Opportunity",
    message: "High demand for Wild California Strawberries in SF District (96% fresh grade).",
    recommendation: "Increase direct retail pricing by 8% or offer express 2-hour delivery bundle.",
    actionText: "Optimize Dynamic Price",
    batchId: "BATCH-3091"
  }
];

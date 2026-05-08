export const locations = [
  // --- Temples ---
  { name: "Shri Radharani Temple", lat: 27.650261, lng: 77.373287, image: "https://images.unsplash.com/photo-1544955378-b16260907e5c?w=400", description: "A hilltop temple dedicated to Radha, offering stunning panoramic views of the sacred region.", category: "Temple", points: 20 },
  { name: "Shri Lalita Sakhi Mandir", lat: 27.661866, lng: 77.363891, image: "https://images.unsplash.com/photo-1627850604051-bd1f705a2656?w=400", description: "A temple dedicated to Lalita, the leader of the Ashta Sakhis (eight companions).", category: "Temple", points: 20 },

  // --- Holy Sites ---
  { name: "Pili Pokhar (Priya Kund)", lat: 27.653932, lng: 77.37667, image: "https://images.unsplash.com/photo-1588145229559-69324b104332?w=400", description: "A sacred pond with golden-hued water, deeply associated with Radha's divine pastimes.", category: "Holy Site", points: 25 },
  { name: "Gahvar Van", lat: 27.642648, lng: 77.367327, image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400", description: "A dense forest where Radha and Krishna would meet in secret for their divine plays.", category: "Holy Site", points: 30 },
  { name: "Prem Sarovar", lat: 27.66576, lng: 77.379896, image: "https://images.unsplash.com/photo-1600100397991-3f698dc53216?w=400", description: "The Lake of Love, the sacred site where Radha and Krishna first met.", category: "Holy Site", points: 35 },

  // --- Towns ---
  { name: "Barsana", lat: 27.646118, lng: 77.377712, image: "https://images.unsplash.com/photo-1548013146-72479768bbaa?w=400", description: "The birthplace of Radha Rani, known for the famous Lathmar Holi festival celebrated with great fervor.", category: "Town", points: 15 },
  { name: "Uchagram", lat: 27.66334, lng: 77.364839, image: "https://images.unsplash.com/photo-1596422846543-75c6fc188f67?w=400", description: "The village of Lalita Sakhi, Radha's closest and most beloved companion.", category: "Town", points: 15 },
  { name: "Rankoli", lat: 27.624933, lng: 77.334663, image: "https://images.unsplash.com/photo-1590050752117-23ed9568779b?w=400", description: "A village with scenic hills and ancient temples steeped in history.", category: "Town", points: 15 },
  { name: "Pisawa", lat: 27.672451, lng: 77.441938, image: "https://images.unsplash.com/photo-1590766940511-78210419665d?w=400", description: "Home to the legendary Ashwathama, who is said to still roam these lands.", category: "Town", points: 20 },

  // --- Dining ---
  { name: "Brijwasin Dining", lat: 27.6485, lng: 77.3750, image: "https://images.unsplash.com/photo-1517248135467-4c7ed9d8c47c?w=400", description: "Traditional Vedic dining experience offering pure vegetarian delicacies from the heart of Brij.", category: "Dining", points: 10, phone: "+919876543230", rating: 4.3, priceRange: "₹80 - ₹250", cuisine: "Vedic" },

  // --- Information ---
  { name: "Tourist Info Center", lat: 27.6440, lng: 77.3700, image: "https://images.unsplash.com/photo-1549412658-904aa6600473?w=400", description: "Official information center for pilgrims and tourists visiting Barsana.", category: "Information", points: 5 },

  // --- Hotels ---
  { name: "Radha Krishna Dham", lat: 27.6490, lng: 77.3760, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", description: "Serene temple guesthouse with garden courtyard, minutes from Barsana Mandir. Pure sattvic meals included.", category: "Hotel", points: 10, phone: "+919876543210", rating: 4.6, priceRange: "₹800 - ₹2500", roomTypes: ["Standard", "Deluxe"] },
  { name: "Brij Vasundhara Resort", lat: 27.6430, lng: 77.3820, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400", description: "Modern pilgrim resort with AC rooms, rooftop dining, and Govardhan Hill views.", category: "Hotel", points: 10, phone: "+919876543211", rating: 4.3, priceRange: "₹1200 - ₹4000", roomTypes: ["Standard", "Deluxe", "Suite"] },
  { name: "Pilgrims Inn", lat: 27.6470, lng: 77.3740, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", description: "Budget-friendly stay in main market area with hot meals and 24/7 reception.", category: "Hotel", points: 5, phone: "+919876543212", rating: 4.0, priceRange: "₹500 - ₹1200", roomTypes: ["Standard", "Deluxe"] },
  { name: "Vrinda Heritage Stay", lat: 27.6620, lng: 77.3780, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", description: "Heritage haveli near Prem Sarovar with traditional Brij decor and courtyard.", category: "Hotel", points: 15, phone: "+919876543213", rating: 4.8, priceRange: "₹2000 - ₹5000", roomTypes: ["Deluxe", "Suite"] },

  // --- Restaurants ---
  { name: "Govinda's Kitchen", lat: 27.6480, lng: 77.3755, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", description: "Pure sattvic thali with fresh seasonal sabzi, dal, and hand-made rotis. Peaceful temple-side ambiance.", category: "Restaurant", points: 10, phone: "+919876543220", rating: 4.7, priceRange: "₹100 - ₹300", cuisine: "Sattvic Thali" },
  { name: "Radha Rasoi", lat: 27.6460, lng: 77.3730, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", description: "Iconic street food — crispy kachori, hot jalebi, lassi, and Mathura peda. A must-visit!", category: "Restaurant", points: 10, phone: "+919876543221", rating: 4.5, priceRange: "₹50 - ₹200", cuisine: "Street Food" },
  { name: "Brij Bhoj", lat: 27.6640, lng: 77.3790, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400", description: "Full Brij meal experience near Prem Sarovar — 56 bhog thali with traditional sweets.", category: "Restaurant", points: 15, phone: "+919876543222", rating: 4.4, priceRange: "₹200 - ₹500", cuisine: "Brij Cuisine" },
  { name: "Nand Bhavan Dining", lat: 27.6440, lng: 77.3800, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400", description: "Family-style North Indian restaurant with spacious seating and festive decor.", category: "Restaurant", points: 10, phone: "+919876543223", rating: 4.2, priceRange: "₹150 - ₹400", cuisine: "North Indian" },
];

export const CATEGORIES = [
  { key: 'all', label: 'All Sites', icon: 'Compass' },
  { key: 'Temple', label: 'Temples', icon: 'Landmark' },
  { key: 'Holy Site', label: 'Holy Sites', icon: 'Sparkles' },
  { key: 'Town', label: 'Towns', icon: 'Home' },
  { key: 'Dining', label: 'Dining', icon: 'UtensilsCrossed' },
  { key: 'Information', label: 'Info', icon: 'Info' },
  { key: 'Hotel', label: 'Hotels', icon: 'BedDouble' },
  { key: 'Restaurant', label: 'Restaurants', icon: 'ChefHat' },
];

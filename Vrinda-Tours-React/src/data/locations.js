export const locations = [
  // --- Temples ---
  { name: "Shri Radharani Temple", lat: 27.650261, lng: 77.373287, image: "/vrinda-vihar/radha-rani-temple-barsana.jpg", description: "A hilltop temple dedicated to Radha Rani, offering stunning panoramic views of the sacred Barsana region.", category: "Temple", points: 20 },
  { name: "Shri Bankey Bihari Mandir", lat: 27.580456, lng: 77.701103, image: "/vrinda-vihar/bihari-ji.jpeg", description: "Supreme darshan of Shri Bankey Bihari Ji Maharaj in the sacred alleys of old Vrindavan.", category: "Temple", points: 25 },
  { name: "Shri Radha Raman Mandir", lat: 27.584321, lng: 77.704512, image: "/vrinda-vihar/radha-raman-ji-1.jpeg", description: "Ancient self-manifested Shaligram temple established by Gopal Bhatt Goswami in Vrindavan.", category: "Temple", points: 25 },
  { name: "Shri Radha Vallabh Mandir", lat: 27.582104, lng: 77.703211, image: "/vrinda-vihar/radha-vallabh-ji-temple.jpeg", description: "Historic red sandstone temple founded by Hit Harivansh Mahaprabhu in Vrindavan.", category: "Temple", points: 20 },
  { name: "Shri Priya Kant Ju Mandir", lat: 27.575600, lng: 77.674800, image: "/vrinda-vihar/shri-priya-kaant-ju.jpeg", description: "Grand lotus-architectured temple on Chhatikara Road Vrindavan with serene gardens.", category: "Temple", points: 20 },
  { name: "Shri Gopeshwar Mahadev Mandir", lat: 27.585120, lng: 77.708230, image: "/vrinda-vihar/gopeshwar-ji.jpeg", description: "Lord Shiva in Gopi form, guardian and gatekeeper of sacred Vrindavan Maharaas.", category: "Temple", points: 20 },

  // --- Holy Sites ---
  { name: "Radha Kund & Shyam Kund", lat: 27.525500, lng: 77.495000, image: "/vrinda-vihar/radha-kund-govardhan-2.jpeg", description: "The holiest kund in the universe, consecrated by Srimati Radharani at Govardhan.", category: "Holy Site", points: 35 },
  { name: "Krishna Kund (Govardhan)", lat: 27.526200, lng: 77.496500, image: "/vrinda-vihar/krishn-kund-govardhan.jpeg", description: "Sacred kund created by Lord Krishna's flute during his transcendental pastimes.", category: "Holy Site", points: 30 },
  { name: "Shri Vallabhacharya Baithakji", lat: 27.498500, lng: 77.462300, image: "/vrinda-vihar/shri-vallabhacharya-ji-govardhan.jpeg", description: "Sacred 84 Baithakji seat of Mahaprabhu Vallabhacharya at Jatipura Govardhan.", category: "Holy Site", points: 25 },
  { name: "Govardhan Gau Seva Sanctuary", lat: 27.502000, lng: 77.471000, image: "/vrinda-vihar/gau-dewa-govardhan.jpeg", description: "Sacred sanctuary offering traditional Gau Daan and cow protection at Giriraj foothills.", category: "Holy Site", points: 20 },
  { name: "Gahvar Van", lat: 27.642648, lng: 77.367327, image: "/vrinda-vihar/radha-vallabh-ji-6.png", description: "A dense secret forest in Barsana where Radha and Krishna performed divine leelas.", category: "Holy Site", points: 30 },
  { name: "Prem Sarovar", lat: 27.66576, lng: 77.379896, image: "/vrinda-vihar/krishn-kund-govardhan-2.jpeg", description: "The Lake of Tears of Divine Love between Barsana and Nandgaon.", category: "Holy Site", points: 35 },

  // --- Towns ---
  { name: "Barsana Dham", lat: 27.646118, lng: 77.377712, image: "/vrinda-vihar/radha-rani-temple-barsana.jpg", description: "The divine abode of Shri Radha Rani, famous for hilltop temples and joyful festivals.", category: "Town", points: 15 },
  { name: "Govardhan Dham", lat: 27.498000, lng: 77.465000, image: "/vrinda-vihar/radha-kund-govardhan-2.jpeg", description: "Sacred 21 km Giriraj Parikrama town holding Mansi Ganga, Daan Ghati and Mukharbind.", category: "Town", points: 20 },
  { name: "Old Vrindavan Heritage", lat: 27.582000, lng: 77.702000, image: "/vrinda-vihar/radha-raman-ji-2.jpeg", description: "Historic alleys and ancient Sapta Devalaya temples steeped in divine Bhakti.", category: "Town", points: 20 },

  // --- Dining ---
  { name: "Brijwasin Dining", lat: 27.6485, lng: 77.3750, image: "/vrinda-vihar/gau-dewa-govardhan.jpeg", description: "Traditional Vedic dining experience offering pure sattvic delicacies from the heart of Brij.", category: "Dining", points: 10, phone: "+919876543230", rating: 4.3, priceRange: "₹80 - ₹250", cuisine: "Vedic" },

  // --- Information ---
  { name: "Tourist Info Center", lat: 27.6440, lng: 77.3700, image: "/vrinda-vihar/radha-vallabh-ji-temple.jpeg", description: "Official information center for pilgrims and tourists visiting Brij Dham.", category: "Information", points: 5 },

  // --- Hotels ---
  { name: "Radha Krishna Dham", lat: 27.6490, lng: 77.3760, image: "/vrinda-vihar/radha-raman-ji-1.jpeg", description: "Serene temple guesthouse with garden courtyard, minutes from temple. Pure sattvic meals included.", category: "Hotel", points: 10, phone: "+919876543210", rating: 4.6, priceRange: "₹800 - ₹2500", roomTypes: ["Standard", "Deluxe"] },
  { name: "Brij Vasundhara Resort", lat: 27.6430, lng: 77.3820, image: "/vrinda-vihar/radha-kund-govardhan-2.jpeg", description: "Modern pilgrim resort with AC rooms, rooftop dining, and Govardhan Hill views.", category: "Hotel", points: 10, phone: "+919876543211", rating: 4.3, priceRange: "₹1200 - ₹4000", roomTypes: ["Standard", "Deluxe", "Suite"] },
  { name: "Pilgrims Inn", lat: 27.6470, lng: 77.3740, image: "/vrinda-vihar/bihari-ji.jpeg", description: "Budget-friendly stay in main market area with hot meals and 24/7 reception.", category: "Hotel", points: 5, phone: "+919876543212", rating: 4.0, priceRange: "₹500 - ₹1200", roomTypes: ["Standard", "Deluxe"] },
  { name: "Vrinda Heritage Stay", lat: 27.6620, lng: 77.3780, image: "/vrinda-vihar/radha-vallabh-ji-3.png", description: "Heritage haveli near Prem Sarovar with traditional Brij decor and courtyard.", category: "Hotel", points: 15, phone: "+919876543213", rating: 4.8, priceRange: "₹2000 - ₹5000", roomTypes: ["Deluxe", "Suite"] },

  // --- Restaurants ---
  { name: "Govinda's Kitchen", lat: 27.6480, lng: 77.3755, image: "/vrinda-vihar/radha-raman-ji-prashadi.jpeg", description: "Pure sattvic thali with fresh seasonal sabzi, dal, and hand-made rotis. Peaceful temple-side ambiance.", category: "Restaurant", points: 10, phone: "+919876543220", rating: 4.7, priceRange: "₹100 - ₹300", cuisine: "Sattvic Thali" },
  { name: "Radha Rasoi", lat: 27.6460, lng: 77.3730, image: "/vrinda-vihar/radha-raman-ji-charanamrit.jpeg", description: "Iconic street food — crispy kachori, hot jalebi, lassi, and Mathura peda. A must-visit!", category: "Restaurant", points: 10, phone: "+919876543221", rating: 4.5, priceRange: "₹50 - ₹200", cuisine: "Street Food" },
  { name: "Brij Bhoj", lat: 27.6640, lng: 77.3790, image: "/vrinda-vihar/shri-priya-kaant-ju.jpeg", description: "Full Brij meal experience near Prem Sarovar — 56 bhog thali with traditional sweets.", category: "Restaurant", points: 15, phone: "+919876543222", rating: 4.4, priceRange: "₹200 - ₹500", cuisine: "Brij Cuisine" },
  { name: "Nand Bhavan Dining", lat: 27.6440, lng: 77.3800, image: "/vrinda-vihar/gopeshwar-ji.jpeg", description: "Family-style North Indian restaurant with spacious seating and festive decor.", category: "Restaurant", points: 10, phone: "+919876543223", rating: 4.2, priceRange: "₹150 - ₹400", cuisine: "North Indian" },
];

export const CATEGORIES = [
  { key: 'all', label: 'All Sites', icon: 'Compass' },
  { key: 'favourites', label: 'Favourites', icon: 'Heart' },
  { key: 'Temple', label: 'Temples', icon: 'Landmark' },
  { key: 'Holy Site', label: 'Holy Sites', icon: 'Sparkles' },
  { key: 'Town', label: 'Towns', icon: 'Home' },
  { key: 'Dining', label: 'Dining', icon: 'UtensilsCrossed' },
  { key: 'Information', label: 'Info', icon: 'Info' },
  { key: 'Hotel', label: 'Hotels', icon: 'BedDouble' },
  { key: 'Restaurant', label: 'Restaurants', icon: 'ChefHat' },
];

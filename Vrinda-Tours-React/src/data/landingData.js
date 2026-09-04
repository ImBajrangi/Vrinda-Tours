// Cache helper for local client performance & persistence
export const getCachedData = (key, fallback) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = localStorage.getItem(`vt_tripco_${key}`);
    if (item === null || item === undefined || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'string' && typeof parsed !== 'string') return fallback;
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
};

export const setCachedData = (key, value) => {
  try {
    localStorage.setItem(`vt_tripco_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage cache error:', e);
  }
};

// Hero Slider Steps (1, 2, 3) - Curated High-Definition Sacred Brij Yatra Photography
export const heroSteps = [
  {
    step: 1,
    tagline: 'SACRED BRIJ YATRA & DARSHAN',
    title: 'Experience\nThe Magic Of\nBrij Vibers!',
    bgImage: '/vrinda-vihar/radha-rani-temple-barsana.webp',
    aspectRatio: '16/9',
    ctaText: 'Book A Trip Now'
  },
  {
    step: 2,
    tagline: 'DIVINE PILGRIMAGE CIRCUITS',
    title: 'Sacred \nDhams & Temple Trails!',
    bgImage: '/vrinda-vihar/krishn-kund-govardhan-2.webp',
    aspectRatio: '2.2/1',
    ctaText: 'Explore Packages'
  },
  {
    step: 3,
    tagline: 'PREMIUM CONCIERGE',
    title: 'Brij Vibers In\nPure Luxury &\nDevotion!',
    bgImage: '/vrinda-vihar/radha-kund-govardhan-2.webp',
    aspectRatio: '2.2/1',
    ctaText: 'View Packages'
  }
];

// Awesome Places Thumbnail Avatars for the Know More Card
export const awesomePlaceAvatars = [
  '/vrinda-vihar/radha-raman-ji-smile.webp',
  '/vrinda-vihar/radha-vallabh-ji-1.webp',
  '/vrinda-vihar/bihari-ji.webp'
];

// Partner Brands
export const partnerBrands = [
  { name: 'airbnb', logoType: 'airbnb' },
  { name: 'Booking.com', logoType: 'booking' },
  { name: 'trivago', logoType: 'trivago' },
  { name: 'Expedia', logoType: 'expedia' }
];

// Journey Steps for the Animated Carousel Section ("Journey To Sacred Brij Made Simple!")
export const journeySteps = [
  {
    id: 'step_dest',
    stepNumber: 1,
    title: 'Choose Your\nBrij Package',
    shortTitle: 'Choose Brij Package',
    desc: 'Explore 50+ hand-curated Brij Vibes itineraries across Vrindavan, Mathura & Barsana.',
    photo: '/vrinda-vihar/radha-vallabh-ji-temple.webp',
    aspectRatio: '9/16',
    linkText: 'EXPLORE PACKAGES >',
    iconType: 'pin'
  },
  {
    id: 'step_ticket',
    stepNumber: 2,
    title: 'Book VIP\nDarshan & Stay',
    shortTitle: 'Book Darshan & Stay',
    desc: 'Instant confirmation, temple pass entry, ashrams & cab transfers.',
    photo: '/vrinda-vihar/radha-raman-ji-1.webp',
    aspectRatio: '4/5',
    linkText: 'VIEW DETAILS >',
    iconType: 'grid'
  },
  {
    id: 'step_pay',
    stepNumber: 3,
    title: 'Pray &\nBegin Yatra',
    shortTitle: 'Pray & Begin Yatra',
    desc: 'Zero-hidden fees, WhatsApp instant voucher & 24/7 dedicated Brij guide.',
    photo: '/vrinda-vihar/bihari-ji.webp',
    aspectRatio: '9/16',
    linkText: 'START YATRA >',
    iconType: 'card'
  }
];

// 1. Popular Places (Top 4 Brij Vibers & Highlights)
export const popularPlaces = [
  {
    id: 'pop_vrindavan',
    title: 'Bankey Bihari & Prem Mandir',
    location: 'Vrindavan Dham',
    price: '2.5k/-',
    priceUnit: '/day',
    numericPrice: 2500,
    rating: 5.0,
    image: '/vrinda-vihar/bihari-ji.webp',
    aspectRatio: '9/16',
    objectPosition: 'center 15%',
    description: 'Special Darshan at Shri Bankey Bihari Ji, Nidhivan, and illuminated Prem Mandir.',
    tags: ['Vrindavan', 'Darshan', 'Spiritual']
  },
  {
    id: 'pop_barsana',
    title: 'Shri Radha Rani Temple',
    location: 'Barsana Dham',
    price: '3.5k/-',
    priceUnit: '/day',
    numericPrice: 3500,
    rating: 5.0,
    image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
    aspectRatio: '16/9',
    objectPosition: 'center center',
    description: 'Sacred hilltop darshan of Shriji Mandir, Mor Kuti, Maan Mandir & Rangili Mahal.',
    tags: ['Barsana', 'Radha Rani', 'Yatra']
  },
  {
    id: 'pop_govardhan',
    title: 'Govardhan Parikrama & Radha Kund',
    location: 'Govardhan',
    price: '1.8k/-',
    priceUnit: '/day',
    numericPrice: 1800,
    rating: 4.9,
    image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
    aspectRatio: '2.2/1',
    objectPosition: 'center center',
    description: 'Complete 21 km Govardhan Parikrama with dedicated guide, visiting Radha Kund & Mansi Ganga.',
    tags: ['Govardhan', 'Parikrama', 'Giriraj']
  },
  {
    id: 'pop_radharaman',
    title: 'Shri Radha Raman Ji Darshan',
    location: 'Vrindavan Heritage',
    price: '2.2k/-',
    priceUnit: '/day',
    numericPrice: 2200,
    rating: 5.0,
    image: '/vrinda-vihar/radha-raman-ji-1.webp',
    aspectRatio: '4/5',
    objectPosition: 'center top',
    description: 'Self-manifested Shaligram deity darshan, divine aarti, and old Vrindavan heritage parikrama.',
    tags: ['Radha Raman', 'Darshan', 'Vrindavan']
  }
];

// 1.5. Curated Brij Trip Packages (For "Book Trip" Interactive Selector)
export const tripPackages = [
  {
    id: 'pkg_vrindavan_express',
    title: 'Bankey Bihari & Vrindavan Darshan',
    tagline: 'Darshan • Nidhivan • Prem Mandir',
    location: 'Vrindavan Dham',
    category: '1-day',
    badge: '⭐ Popular',
    duration: '1 Day',
    keyTag: 'Passes & Cab Included',
    price: '₹2,499',
    originalPrice: '₹3,200',
    priceUnit: '/person',
    numericPrice: 2499,
    rating: 5.0,
    reviewsCount: 482,
    image: '/vrinda-vihar/bihari-ji.webp',
    description: 'Complete hassle-free Vrindavan pilgrimage with dedicated Brajwasi guide, darshan passes at Bankey Bihari Ji, historic Nidhivan Parikrama, and evening musical fountain at Prem Mandir.',
    highlights: [
      'Priority Darshan at Shri Bankey Bihari Ji',
      'Guided walkthrough of mystical Nidhivan & Seva Kunj',
      'Illuminated evening darshan & light show at Prem Mandir'
    ],
    features: ['E-Rickshaw/Cab', 'Passes', 'Local Guide', 'Prasadam'],
    pointsReward: 350,
    feasibility: 'Best for First-Time Devotees & Families'
  },
  {
    id: 'pkg_barsana_nandgaon',
    title: 'Barsana Shriji & Nandgaon Yatra',
    tagline: 'Radha Rani Temple • Mor Kuti • Nand Bhawan',
    location: 'Barsana & Nandgaon',
    category: '1-day',
    badge: 'Best Seller',
    duration: '1 Day',
    keyTag: 'Ropeway Assist & AC Cab',
    price: '₹3,499',
    originalPrice: '₹4,500',
    priceUnit: '/person',
    numericPrice: 3499,
    rating: 5.0,
    reviewsCount: 318,
    image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
    description: 'Immerse in the sweet realm of Shri Radha Rani on Bhanugarh Hill, explore Maan Mandir, Rangili Mahal, Mor Kuti, followed by the childhood home of Shri Krishna in Nandgaon.',
    highlights: [
      'Hilltop Darshan at Shri Radha Rani (Laadli Ji) Temple',
      'Ropeway / Stairway assistance for senior pilgrims',
      'Scenic visit to Mor Kuti, Maan Mandir & Prem Sarovar'
    ],
    features: ['AC Cab Transfer', 'Ropeway Assist', 'Brij Storyteller', 'Prasadam'],
    pointsReward: 450,
    feasibility: 'Ideal for Couples, Elders & Devotee Groups'
  },
  {
    id: 'pkg_govardhan_parikrama',
    title: 'Govardhan & Radha Kund Parikrama',
    tagline: '21km Parikrama • Mansi Ganga • Daan Ghati',
    location: 'Govardhan Dham',
    category: 'parikrama',
    badge: 'Parikrama Special',
    duration: '1-2 Days',
    keyTag: 'Silent Eco E-Cart & Guide',
    price: '₹1,899',
    originalPrice: '₹2,500',
    priceUnit: '/person',
    numericPrice: 1899,
    rating: 4.9,
    reviewsCount: 560,
    image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
    description: 'Undertake the auspicious 21 km Giriraj Govardhan Parikrama smoothly by dedicated battery E-Cart or guided walk, visiting holy Radha Kund, Shyam Kund, Kusum Sarovar & Daan Ghati.',
    highlights: [
      'Full 21 km Giriraj Parikrama via silent Eco E-Cart or on foot',
      'Sacred holy dip & aarti at Radha Kund & Shyam Kund',
      'Historic photo-stop at exquisite Kusum Sarovar Chhatris'
    ],
    features: ['Eco E-Cart', 'Abhishek Seva', 'Radha Kund Dip', 'Hydration Pack'],
    pointsReward: 250,
    feasibility: 'High Spiritual Value & Senior-Friendly'
  },
  {
    id: 'pkg_heritage_temples',
    title: 'Old Vrindavan Heritage Temples',
    tagline: 'Radha Raman • Radha Vallabh • Gopeshwar',
    location: 'Old Vrindavan',
    category: '1-day',
    badge: 'Heritage',
    duration: '1 Day',
    keyTag: 'Riverboat Aarti & Heritage Walk',
    price: '₹2,199',
    originalPrice: '₹2,800',
    priceUnit: '/person',
    numericPrice: 2199,
    rating: 5.0,
    reviewsCount: 295,
    image: '/vrinda-vihar/radha-raman-ji-smile.webp',
    description: 'An intimate pilgrimage exploring ancient Goswami temples: Shri Radha Raman Ji, Shri Radha Vallabh Ji, Gopeshwar Mahadev, and historic Yamuna Keshi Ghat Sandhya Aarti.',
    highlights: [
      'Divine Darshan & Charnamrit of Self-Manifested Radha Raman Ji',
      'Samadhi sthals of Six Goswamis and heritage alleys',
      'Mesmerizing Yamuna Riverboat Aarti at sunset at Keshi Ghat'
    ],
    features: ['Riverboat Aarti', 'Goswami Temples', 'Charnamrit', 'Local Guide'],
    pointsReward: 300,
    feasibility: 'Deep Devotional & Photographic Experience'
  },
  {
    id: 'pkg_complete_84kos',
    title: '84 Kos Complete Brij Mahayatra',
    tagline: 'All 5 Dhams • AC Stay • Satvik Meals',
    location: 'All Brij Dhams',
    category: 'multi-day',
    badge: 'All-Inclusive',
    duration: '3D / 2N',
    keyTag: 'AC Luxury Stay & All Meals',
    price: '₹7,999',
    originalPrice: '₹10,500',
    priceUnit: '/person',
    numericPrice: 7999,
    rating: 5.0,
    reviewsCount: 640,
    image: '/vrinda-vihar/radha-vallabh-ji-temple.webp',
    description: 'The all-inclusive pilgrimage across all major Brij Dhams: Mathura, Vrindavan, Govardhan, Barsana, Nandgaon, Gokul & Mahavan with premium AC hotel/ashram accommodation and all meals.',
    highlights: [
      'All Dhams covered: Mathura, Vrindavan, Govardhan, Barsana, Gokul',
      '2 Nights Luxury Ashram / 3-Star AC Hotel Stay included',
      'All satvik meals (Breakfast, Lunch, Dinner) curated by Brij chefs'
    ],
    features: ['3-Star AC Stay', 'All Satvik Meals', 'Dedicated Innova', 'All Passes'],
    pointsReward: 1200,
    feasibility: 'All-in-One Comprehensive Devotional Tour'
  }
];

// 2. Sweet Memories Features
export const sweetMemoryFeatures = [
  {
    number: '01',
    title: 'Find Brij yatras tailored for you',
    desc: 'Spiritual bliss, darshan passes, comfortable stays, and seamless guided pilgrimage.'
  },
  {
    number: '02',
    title: 'Immerse in divine devotion & culture',
    desc: 'Experience sacred kirtans, heritage ghat aartis, and the enchanting leela sthalis of Brij.'
  },
  {
    number: '03',
    title: 'Memories of Brij that last forever',
    desc: 'Every moment in Brij Dham connects your soul to the eternal pastimes of Radha Krishna.'
  }
];

// Floating Reviewers on the Hero Landscape
export const memoryReviewers = [
  {
    name: 'Radhika Sharma',
    rating: '5.0',
    position: 'top-left',
    avatar: '/vrinda-vihar/radha-raman-ji-smile.webp'
  },
  {
    name: 'Anand Gopal',
    rating: '5.0',
    position: 'middle-right',
    avatar: '/vrinda-vihar/radha-vallabh-ji-1.webp'
  },
  {
    name: 'Pooja Verma',
    rating: '4.9',
    position: 'bottom-left',
    avatar: '/vrinda-vihar/bihari-ji.webp'
  }
];

// 3. Top Destination Tabs and Bento Grid Data for Brij Vibers
export const topDestinationTabs = [
  'Vrindavan',
  'Govardhan',
  'Barsana & Nandgaon',
  'Mathura',
  'Gokul & Mahavan'
];

export const topDestinationsByTab = {
  'Vrindavan': [
    {
      id: 'vrn_1',
      region: 'VRINDAVAN',
      title: 'Shri Kunj Bihari Ji Mandir',
      rating: '5.0',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Nidhivan Marg, Vrindavan',
      image: '/vrinda-vihar/kunj-bihari-ji.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 15%',
      gridArea: 'card-1'
    },
    {
      id: 'vrn_2',
      region: 'VRINDAVAN',
      title: 'Gopeshwar Mahadev Mandir',
      rating: '4.9',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Near Vamshi Vat, Vrindavan',
      image: '/vrinda-vihar/gopeshwar-ji.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 20%',
      gridArea: 'card-2'
    },
    {
      id: 'vrn_3',
      region: 'VRINDAVAN',
      title: 'Shri Radha Raman Ji Divine Abhishek',
      rating: '5.0',
      price: '3k/-',
      priceUnit: '/Pax',
      numericPrice: 3000,
      category: 'Top Destination',
      location: 'Radha Raman Mandir, Vrindavan',
      image: '/vrinda-vihar/radha-raman-ji-abhishek.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-3'
    },
    {
      id: 'vrn_4',
      region: 'VRINDAVAN',
      title: 'Shri Radha Vallabh Mandir Heritage',
      rating: '4.9',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Gotam Nagar, Vrindavan',
      image: '/vrinda-vihar/radha-vallabh-ji-temple.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 25%',
      gridArea: 'card-4'
    },
    {
      id: 'vrn_5',
      region: 'VRINDAVAN',
      title: 'Shri Priya Kant Ju Mandir',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Chhatikara Road, Vrindavan',
      image: '/vrinda-vihar/shri-priya-kaant-ju.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-5'
    },
    {
      id: 'vrn_6',
      region: 'VRINDAVAN',
      title: 'Shri Radha Vallabh Ji Divine Shringar',
      rating: '5.0',
      price: '2.2k/-',
      priceUnit: '/Pax',
      numericPrice: 2200,
      category: 'Top Destination',
      location: 'Old Vrindavan',
      image: '/vrinda-vihar/radha-vallabh-ji-4.webp',
      aspectRatio: '4/5',
      objectPosition: 'center top',
      gridArea: 'card-6'
    }
  ],
  'Govardhan': [
    {
      id: 'gov_1',
      region: 'GOVARDHAN',
      title: 'Shri Vallabhacharya Ji Baithakji',
      rating: '5.0',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Jatipura & Govardhan Parikrama',
      image: '/vrinda-vihar/shri-vallabhacharya-ji-govardhan.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 20%',
      gridArea: 'card-1'
    },
    {
      id: 'gov_2',
      region: 'GOVARDHAN',
      title: 'Gau Seva & Giriraj Sanctuary',
      rating: '4.9',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Govardhan Talab & Gaushala',
      image: '/vrinda-vihar/gau-dewa-govardhan.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 20%',
      gridArea: 'card-2'
    },
    {
      id: 'gov_3',
      region: 'GOVARDHAN',
      title: 'Radha Kund & Shyam Kund Holy Snan',
      rating: '5.0',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Radha Kund Dham',
      image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
      aspectRatio: '2.2/1',
      objectPosition: 'center center',
      gridArea: 'card-3'
    },
    {
      id: 'gov_4',
      region: 'GOVARDHAN',
      title: 'Krishna Kund Sacred Ghats',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Govardhan Parikrama Marg',
      image: '/vrinda-vihar/krishn-kund-govardhan.webp',
      aspectRatio: '2.2/1',
      objectPosition: 'center center',
      gridArea: 'card-4'
    },
    {
      id: 'gov_5',
      region: 'GOVARDHAN',
      title: 'Krishna Kund Sunset Parikrama',
      rating: '4.8',
      price: '1.6k/-',
      priceUnit: '/Pax',
      numericPrice: 1600,
      category: 'Top Destination',
      location: 'Govardhan Kund Kshetra',
      image: '/vrinda-vihar/krishn-kund-govardhan-2.webp',
      aspectRatio: '2.2/1',
      objectPosition: 'center center',
      gridArea: 'card-5'
    },
    {
      id: 'gov_6',
      region: 'GOVARDHAN',
      title: 'Shri Radha Raman Ji Charanamrit & Prasad',
      rating: '5.0',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Govardhan Yatra Special',
      image: '/vrinda-vihar/radha-raman-ji-charanamrit.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 15%',
      gridArea: 'card-6'
    }
  ],
  'Barsana & Nandgaon': [
    {
      id: 'bar_1',
      region: 'BARSANA',
      title: 'Shri Radha Rani Mandir Hilltop',
      rating: '5.0',
      price: '3.5k/-',
      priceUnit: '/Pax',
      numericPrice: 3500,
      category: 'Top Destination',
      location: 'Bhanugarh Hill, Barsana',
      image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
      aspectRatio: '16/9',
      objectPosition: 'center center',
      gridArea: 'card-1'
    },
    {
      id: 'bar_2',
      region: 'BARSANA',
      title: 'Shri Radha Vallabh Ji Leela Darshan',
      rating: '4.9',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Barsana Valley',
      image: '/vrinda-vihar/radha-vallabh-ji-5.webp',
      aspectRatio: '2/3',
      objectPosition: 'center top',
      gridArea: 'card-2'
    },
    {
      id: 'bar_3',
      region: 'BARSANA',
      title: 'Shri Radha Vallabh Ji Divine Shringar',
      rating: '5.0',
      price: '2.8k/-',
      priceUnit: '/Pax',
      numericPrice: 2800,
      category: 'Top Destination',
      location: 'Barsana Heritage',
      image: '/vrinda-vihar/radha-vallabh-ji-3.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-3'
    },
    {
      id: 'bar_4',
      region: 'BARSANA',
      title: 'Barsana Holy Parikrama & Kunds',
      rating: '4.9',
      price: '2.2k/-',
      priceUnit: '/Pax',
      numericPrice: 2200,
      category: 'Top Destination',
      location: 'Barsana Circuit',
      image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
      aspectRatio: '16/9',
      objectPosition: 'center center',
      gridArea: 'card-4'
    },
    {
      id: 'bar_5',
      region: 'BARSANA',
      title: 'Sanket Van & Mor Kuti Trail',
      rating: '4.8',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Between Barsana & Nandgaon',
      image: '/vrinda-vihar/radha-vallabh-ji-6.webp',
      aspectRatio: '4/5',
      objectPosition: 'center top',
      gridArea: 'card-5'
    },
    {
      id: 'bar_6',
      region: 'BARSANA',
      title: 'Shri Radha Vallabh Ji Pushpa Shringar',
      rating: '4.9',
      price: '1.9k/-',
      priceUnit: '/Pax',
      numericPrice: 1900,
      category: 'Top Destination',
      location: 'Brij Mandal',
      image: '/vrinda-vihar/radha-vallabh-ji-7.webp',
      aspectRatio: '4/5',
      objectPosition: 'center top',
      gridArea: 'card-6'
    }
  ],
  'Mathura': [
    {
      id: 'mth_1',
      region: 'MATHURA',
      title: 'Shri Bankey Bihari Ji Supreme Darshan',
      rating: '5.0',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Mathura & Vrindavan Kshetra',
      image: '/vrinda-vihar/bihari-ji.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 15%',
      gridArea: 'card-1'
    },
    {
      id: 'mth_2',
      region: 'MATHURA',
      title: 'Vishram Ghat & Holy Kunds',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Yamuna Bank, Mathura',
      image: '/vrinda-vihar/krishn-kund-govardhan-2.webp',
      aspectRatio: '2.2/1',
      objectPosition: 'center center',
      gridArea: 'card-2'
    },
    {
      id: 'mth_3',
      region: 'MATHURA',
      title: 'Shri Radha Raman Ji Maha Darshan',
      rating: '5.0',
      price: '2.8k/-',
      priceUnit: '/Pax',
      numericPrice: 2800,
      category: 'Top Destination',
      location: 'Mathura Heritage',
      image: '/vrinda-vihar/radha-raman-ji-2.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-3'
    },
    {
      id: 'mth_4',
      region: 'MATHURA',
      title: 'Yamuna Riverbank & Sacred Snan',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Mathura Kshetra',
      image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
      aspectRatio: '2.2/1',
      objectPosition: 'center center',
      gridArea: 'card-4'
    },
    {
      id: 'mth_5',
      region: 'MATHURA',
      title: 'Bhuteshwar Mahadev & Gopeshwar',
      rating: '4.8',
      price: '1.4k/-',
      priceUnit: '/Pax',
      numericPrice: 1400,
      category: 'Top Destination',
      location: 'Mathura Kshetra',
      image: '/vrinda-vihar/gopeshwar-ji.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 20%',
      gridArea: 'card-5'
    },
    {
      id: 'mth_6',
      region: 'MATHURA',
      title: 'Shri Priya Kant Ju Grand Mandir',
      rating: '4.9',
      price: '1.6k/-',
      priceUnit: '/Pax',
      numericPrice: 1600,
      category: 'Top Destination',
      location: 'Mathura Vrindavan Marg',
      image: '/vrinda-vihar/shri-priya-kaant-ju.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-6'
    }
  ],
  'Gokul & Mahavan': [
    {
      id: 'gok_1',
      region: 'GOKUL',
      title: 'Raman Reti Holy Sand & Gau Seva',
      rating: '5.0',
      price: '2.2k/-',
      priceUnit: '/Pax',
      numericPrice: 2200,
      category: 'Top Destination',
      location: 'Gokul Dham',
      image: '/vrinda-vihar/gau-dewa-govardhan.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 20%',
      gridArea: 'card-1'
    },
    {
      id: 'gok_2',
      region: 'GOKUL',
      title: 'Chaurasi Khamba & Mahavan Baithak',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Mahavan, Gokul',
      image: '/vrinda-vihar/shri-vallabhacharya-ji-govardhan.webp',
      aspectRatio: '9/16',
      objectPosition: 'center 20%',
      gridArea: 'card-2'
    },
    {
      id: 'gok_3',
      region: 'GOKUL',
      title: 'Shriji & Yashoda Nandan Bal Leela',
      rating: '5.0',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Gokul Dham',
      image: '/vrinda-vihar/radha-raman-ji-shriJi.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-3'
    },
    {
      id: 'gok_4',
      region: 'GOKUL',
      title: 'Brahmand Ghat & Sacred Yamuna Kund',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Gokul Riverbank',
      image: '/vrinda-vihar/krishn-kund-govardhan.webp',
      aspectRatio: '2.2/1',
      objectPosition: 'center center',
      gridArea: 'card-4'
    },
    {
      id: 'gok_5',
      region: 'GOKUL',
      title: 'Gokulnath Ji Mandir & Shringar',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Gokul Bazaar',
      image: '/vrinda-vihar/radha-vallabh-ji-1.webp',
      aspectRatio: '4/5',
      objectPosition: 'center top',
      gridArea: 'card-5'
    },
    {
      id: 'gok_6',
      region: 'MAHAVAN',
      title: 'Ukhal Bandhan Leela Sthali',
      rating: '4.8',
      price: '1.6k/-',
      priceUnit: '/Pax',
      numericPrice: 1600,
      category: 'Top Destination',
      location: 'Mahavan Kshetra',
      image: '/vrinda-vihar/radha-vallabh-ji-2.webp',
      aspectRatio: '3/4',
      objectPosition: 'center top',
      gridArea: 'card-6'
    }
  ]
};

// 4. Explore More Brij Vibers Packages (Categories & Cards Grid)
export const exploreCategories = [
  'Popular Destination',
  'Darshan',
  'Parikrama',
  'Barsana & Nandgaon',
  'Aarti',
  '84 Kos Yatra'
];

export const exploreDestinations = [
  {
    id: 'exp_84_kos',
    title: 'Sampurna 84 Kos Brij Yatra',
    location: 'Complete Brij Mandal',
    price: '12k/-',
    priceUnit: '/Pax',
    numericPrice: 12000,
    rating: 5.0,
    category: '84 Kos Yatra',
    image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
    aspectRatio: '2.2/1'
  },
  {
    id: 'exp_vrindavan_vip',
    title: 'Bankey Bihari & Prem Mandir',
    location: 'Vrindavan Dham',
    price: '2.5k/-',
    priceUnit: '/Pax',
    numericPrice: 2500,
    rating: 5.0,
    category: 'Darshan',
    image: '/vrinda-vihar/bihari-ji.webp',
    aspectRatio: '9/16'
  },
  {
    id: 'exp_govardhan_parikrama',
    title: 'Govardhan & Radha Kund Parikrama',
    location: 'Govardhan',
    price: '3k/-',
    priceUnit: '/Pax',
    numericPrice: 3000,
    rating: 4.9,
    category: 'Parikrama',
    image: '/vrinda-vihar/krishn-kund-govardhan-2.webp',
    aspectRatio: '2.2/1'
  },
  {
    id: 'exp_barsana_nandgaon',
    title: 'Barsana Shriji & Nand Bhawan',
    location: 'Barsana & Nandgaon',
    price: '3.5k/-',
    priceUnit: '/Pax',
    numericPrice: 3500,
    rating: 5.0,
    category: 'Barsana & Nandgaon',
    image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
    aspectRatio: '16/9'
  },
  {
    id: 'exp_mathura_janmabhoomi',
    title: 'Shri Radha Raman Ji Special Darshan',
    location: 'Vrindavan & Mathura',
    price: '2.2k/-',
    priceUnit: '/Pax',
    numericPrice: 2200,
    rating: 5.0,
    category: 'Popular Destination',
    image: '/vrinda-vihar/radha-raman-ji-1.webp',
    aspectRatio: '4/5'
  },
  {
    id: 'exp_gokul_raman_reti',
    title: 'Gokul Raman Reti & Gau Sanctuary',
    location: 'Gokul Dham',
    price: '2k/-',
    priceUnit: '/Pax',
    numericPrice: 2000,
    rating: 4.8,
    category: 'Popular Destination',
    image: '/vrinda-vihar/gau-dewa-govardhan.webp',
    aspectRatio: '9/16'
  },
  {
    id: 'exp_yamuna_boat',
    title: 'Krishna Kund & Yamuna Holy Trail',
    location: 'Sacred Kunds of Brij',
    price: '1.5k/-',
    priceUnit: '/Pax',
    numericPrice: 1500,
    rating: 4.9,
    category: 'Aarti',
    image: '/vrinda-vihar/krishn-kund-govardhan.webp',
    aspectRatio: '2.2/1'
  },
  {
    id: 'exp_3day_brij',
    title: 'Radha Vallabh Ji Heritage Trail',
    location: 'Complete Brij Mandal',
    price: '8.5k/-',
    priceUnit: '/Pax',
    numericPrice: 8500,
    rating: 5.0,
    category: '84 Kos Yatra',
    image: '/vrinda-vihar/radha-vallabh-ji-temple.webp',
    aspectRatio: '9/16'
  },
  {
    id: 'exp_weekend_vrindavan',
    title: 'Shri Priya Kant Ju & Old Vrindavan',
    location: 'Vrindavan Dham',
    price: '4k/-',
    priceUnit: '/Pax',
    numericPrice: 4000,
    rating: 4.9,
    category: 'Darshan',
    image: '/vrinda-vihar/shri-priya-kaant-ju.webp',
    aspectRatio: '3/4'
  }
];

// 5. Postal Stamp Destination Cards ("Let's go on an adventure")
export const stampDestinations = [
  {
    id: 'stamp_vrindavan',
    city: 'VRINDAVAN',
    country: 'Brij Dham',
    image: '/vrinda-vihar/radha-raman-ji-1.webp',
    aspectRatio: '4/5',
    highlight: 'Shri Radha Raman Ji & Bihari Ji'
  },
  {
    id: 'stamp_barsana',
    city: 'BARSANA',
    country: 'Brij Dham',
    image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
    aspectRatio: '16/9',
    highlight: 'Shri Radha Rani Hilltop Mandir'
  },
  {
    id: 'stamp_govardhan',
    city: 'GOVARDHAN',
    country: 'Brij Dham',
    image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
    aspectRatio: '2.2/1',
    highlight: 'Giriraj Parikrama & Radha Kund'
  },
  {
    id: 'stamp_kunjbihari',
    city: 'NIDHIVAN',
    country: 'Brij Dham',
    image: '/vrinda-vihar/kunj-bihari-ji.webp',
    aspectRatio: '9/16',
    highlight: 'Shri Kunj Bihari Ji & Seva Kunj'
  }
];

// 6. Navigation Tabs in Hero Booking Capsule
export const bookingTabs = [
  { id: 'hostelry', label: 'Stays & Ashrams', icon: 'Building' },
  { id: 'flights', label: 'Flights', icon: 'Plane' },
  { id: 'bus_shuttle', label: 'Brij Shuttles', icon: 'Bus' },
  { id: 'cars', label: 'AC Cabs', icon: 'Car' }
];

// 7. Travel Philosophy Section
export const missionData = {
  badge: 'Our Travel Philosophy',
  titlePart1: "Crafting Yatras",
  titleHighlight: 'Of Pure Devotion,',
  titlePart2: 'Comfort & Heritage',
  titlePart3: 'Across Sacred Brij.',
  description: 'Hand-crafted luxury Brij Vibers yatras, temple darshans, and authentic spiritual retreats designed for families and pilgrims worldwide.',
  primaryBtnText: 'Explore Brij Packages',
  secondaryBtnText: 'Custom Yatra Plan',
  pillars: [
    {
      id: 'pillar_luxury',
      title: 'Curated Brij Vibers\nPackages',
      description: 'Private AC transfers, verified ashrams & luxury hotels across Brij Mandal.',
      icon: 'Compass',
      image: '/vrinda-vihar/shri-priya-kaant-ju.webp',
      aspectRatio: '3/4',
      alt: 'Shri Priya Kant Ju Mandir Vrindavan'
    },
    {
      id: 'pillar_culture',
      title: 'Darshan &\nTemple Passes',
      description: 'Skip long queues with our dedicated local guides and darshan assistance.',
      icon: 'MapPin',
      image: '/vrinda-vihar/radha-vallabh-ji-2.webp',
      aspectRatio: '3/4',
      alt: 'Shri Radha Vallabh Ji Divine Darshan'
    },
    {
      id: 'pillar_adventure',
      title: 'Parikrama &\nLeela Sthali Trails',
      description: 'Guided Govardhan parikrama, sacred kund snan, and evening boat aartis.',
      icon: 'Plane',
      image: '/vrinda-vihar/krishn-kund-govardhan.webp',
      aspectRatio: '2.2/1',
      alt: 'Krishna Kund Sacred Snan Ghat Govardhan'
    }
  ],
  trustedBy: [
    { id: 'tb_1', name: 'Vrinda Luxury Stays', symbol: 'globe' },
    { id: 'tb_2', name: 'Brij Darshan Elite', symbol: 'cross' },
    { id: 'tb_3', name: 'Booking.com', symbol: 'cross' },
    { id: 'tb_4', name: 'Brij Vibers Holidays', symbol: 'sphere' },
    { id: 'tb_5', name: 'UP Tourism Approved', symbol: 'globe' },
    { id: 'tb_6', name: 'Radha Krishna Trust', symbol: 'sphere' }
  ]
};

// 8. Featured Signature Tours & Travel Journal Section
export const initiativesData = {
  badge: 'Featured Expeditions',
  title: 'Real Devotion. Unrivaled Heritage.\nSacred Brij Awaits.',
  description: 'From illuminated temple darshans to sacred Yamuna boat aartis, discover handpicked Brij Vibers itineraries designed for lifelong memories.',
  viewAllText: 'View All Packages',
  cards: [
    {
      id: 'init_vrindavan',
      category: 'Vrindavan Yatra',
      title: 'Shri Bankey Bihari &\nNidhivan Darshan',
      description: 'darshan passes, evening fountain show, and sacred Nidhivan trail.',
      image: '/vrinda-vihar/bihari-ji.webp',
      aspectRatio: '9/16',
      linkText: 'Explore Package'
    },
    {
      id: 'init_govardhan',
      category: 'Parikrama Yatra',
      title: 'Giriraj Govardhan\n21km Holy Trail',
      description: 'E-rickshaw or guided walking parikrama with Radha Kund & Mansi Ganga.',
      image: '/vrinda-vihar/krishn-kund-govardhan-2.webp',
      aspectRatio: '2.2/1',
      linkText: 'Explore Package'
    },
    {
      id: 'init_barsana',
      category: 'Brij Dham',
      title: 'Barsana & Nandgaon\nHeritage Leela Tour',
      description: 'Shriji Mandir hilltop visit, Mor Kuti, and Nand Baba royal palace.',
      image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
      aspectRatio: '16/9',
      linkText: 'Explore Package'
    },
    {
      id: 'init_gokul',
      category: 'Sacred Trails',
      title: 'Gokul Raman Reti &\nGau Sanctuary',
      description: 'Rolling in sacred Raman Reti sand, Chaurasi Khamba, and holy Gaushala seva.',
      image: '/vrinda-vihar/gau-dewa-govardhan.webp',
      aspectRatio: '9/16',
      linkText: 'Explore Package'
    },
    {
      id: 'init_84kos',
      category: 'Chaurasi Kos',
      title: 'Complete 84 Kos\nBrij Mahayatra',
      description: 'Comprehensive 7-day divine pilgrimage covering all 12 sacred forests of Brij.',
      image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
      aspectRatio: '2.2/1',
      linkText: 'Explore Package'
    }
  ],
  newsletterCard: {
    title: 'Stay Connected With Brij Dham.',
    description: 'Subscribe to our Brij Yatra journal for festival schedules, darshan timings, and exclusive discounts on Brij Vibers packages.',
    placeholder: 'Enter your email for yatra updates',
    buttonText: 'Subscribe',
    joinText: 'Join 25,000+ blessed devotees'
  }
};

// ============================================================================
// 10. COMPREHENSIVE VRINDA VIHAR DIVINE DARSHAN & LEELA GALLERY DATA
// Categorized collection of all 29 authentic images with aspect ratios & metadata
// ============================================================================
export const vrindaViharGalleryCategories = [
  'All Darshans',
  'Shri Radha Raman Ji',
  'Shri Radha Vallabh Ji',
  'Bankey & Kunj Bihari',
  'Govardhan & Sacred Kunds',
  'Barsana & Sacred Temples'
];

export const vrindaViharGalleryData = [
  // --- Bankey & Kunj Bihari ---
  {
    id: 'g_bihari_1',
    title: 'Shri Bankey Bihari Ji Maharaj',
    category: 'Bankey & Kunj Bihari',
    location: 'Bankey Bihari Mandir, Vrindavan',
    image: '/vrinda-vihar/bihari-ji.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Divine darshan of Shri Bankey Bihari Ji in full floral shringar, the heart of Vrindavan Dham.',
    tags: ['Bankey Bihari', 'Vrindavan', 'Main Deity']
  },
  {
    id: 'g_kunj_bihari',
    title: 'Bankey Bihari Mandir Sabha Mandap',
    category: 'Bankey & Kunj Bihari',
    location: 'Shri Bankey Bihari Mandir, Vrindavan',
    image: '/vrinda-vihar/kunj-bihari-ji.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Devotees gathered inside the ornate temple courtyard and sanctum for holy darshan.',
    tags: ['Bankey Bihari', 'Sabha Mandap', 'Vrindavan']
  },

  // --- Shri Radha Raman Ji Collection ---
  {
    id: 'g_rr_abhishek',
    title: 'Shri Radha Raman Ji Divine Abhishek',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-abhishek.webp',
    aspectRatio: '3/4',
    ratioLabel: '3:4 Portrait',
    dimensions: '2160 × 2870',
    description: 'Sacred milk and panchamrit mahabhishek of self-manifested Shaligram Shri Radha Raman Dev.',
    tags: ['Abhishek', 'Radha Raman', 'High Res']
  },
  {
    id: 'g_rr_smile',
    title: 'Shri Radha Raman Ji Divine Smile',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-smile.webp',
    aspectRatio: '1/1',
    ratioLabel: '1:1 Square',
    dimensions: '1079 × 1081',
    description: 'The mesmerizing, eternal divine smile of Shri Radha Raman Lal Ju.',
    tags: ['Divine Smile', 'Radha Raman', 'Spotlight']
  },
  {
    id: 'g_rr_butterfly',
    title: 'Shri Radha Raman Ji Butterfly Shringar',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-butterfly.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Shringar',
    dimensions: '1280 × 1600',
    description: 'Unique butterfly-themed ornate crown and velvet mukut shringar.',
    tags: ['Butterfly Shringar', 'Crown', 'Radha Raman']
  },
  {
    id: 'g_rr_1',
    title: 'Shri Radha Raman Ji Majestic Shringar',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-1.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Portrait',
    dimensions: '1654 × 2069',
    description: 'Grand royal attire with diamond chandrika and fragrant lotus garland.',
    tags: ['Royal Shringar', 'Radha Raman', 'Vrindavan']
  },
  {
    id: 'g_rr_2',
    title: 'Shri Radha Raman Ji Evening Aarti',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-2.webp',
    aspectRatio: '3/4',
    ratioLabel: '3:4 Portrait',
    dimensions: '1080 × 1440',
    description: 'Evening sandhya darshan with shimmering silks and jewel-studded tilak.',
    tags: ['Sandhya Darshan', 'Radha Raman']
  },
  {
    id: 'g_rr_charanamrit',
    title: 'Shri Radha Raman Ji Charanamrit',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-charanamrit.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '630 × 1120',
    description: 'Auspicious holy charanamrit seva and lotus feet blessings of Thakur Ji.',
    tags: ['Charanamrit', 'Blessings', 'Radha Raman']
  },
  {
    id: 'g_rr_prashadi',
    title: 'Shri Radha Raman Ji Mahaprasadi',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-prashadi.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '630 × 1120',
    description: 'Chappan bhog mahaprasad offered with love at Shri Radha Raman temple.',
    tags: ['Mahaprasad', 'Bhog', 'Radha Raman']
  },
  {
    id: 'g_rr_shriji',
    title: 'Shri Radha Raman Ji with Shriji Crown',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji-shriJi.webp',
    aspectRatio: '3/4',
    ratioLabel: '3:4 Portrait',
    dimensions: '1080 × 1440',
    description: 'Radha Rani throne & crown placed beside Thakur Shri Radha Raman Ji.',
    tags: ['Shriji', 'Divine Throne', 'Radha Raman']
  },
  {
    id: 'g_rr_main',
    title: 'Shri Radha Raman Lal Ju',
    category: 'Shri Radha Raman Ji',
    location: 'Radha Raman Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-raman-ji.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Portrait',
    dimensions: '1279 × 1600',
    description: 'Complete darshan of Gopal Bhatt Goswami’s worshipped Shaligram deity.',
    tags: ['Shaligram', 'Goswami', 'Radha Raman']
  },

  // --- Shri Radha Vallabh Ji Collection ---
  {
    id: 'g_rv_temple',
    title: 'Shri Radha Vallabh Mandir Entrance',
    category: 'Shri Radha Vallabh Ji',
    location: 'Gotam Nagar, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-temple.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Ancient red sandstone temple established by Hit Harivansh Mahaprabhu.',
    tags: ['Temple Architecture', 'Radha Vallabh']
  },
  {
    id: 'g_rv_1',
    title: 'Shri Radha Vallabh Ji Shringar (Series 1)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-1.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Shringar',
    dimensions: '867 × 1083',
    description: 'Brimming with nectar, adorned in gold zardozi vestments and pearl mala.',
    tags: ['Hit Harivansh', 'Radha Vallabh', 'Shringar']
  },
  {
    id: 'g_rv_2',
    title: 'Shri Radha Vallabh Ji Shringar (Series 2)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-2.webp',
    aspectRatio: '3/4',
    ratioLabel: '3:4 Shringar',
    dimensions: '1080 × 1384',
    description: 'Royal emerald robes and divine chandrika crowning Thakur Ji.',
    tags: ['Emerald Robes', 'Radha Vallabh']
  },
  {
    id: 'g_rv_3',
    title: 'Shri Radha Vallabh Ji Shringar (Series 3)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-3.webp',
    aspectRatio: '3/4',
    ratioLabel: '3:4 Shringar',
    dimensions: '1074 × 1388',
    description: 'Radiant festive shringar during auspicious Brij utsav celebrations.',
    tags: ['Utsav', 'Radha Vallabh']
  },
  {
    id: 'g_rv_4',
    title: 'Shri Radha Vallabh Ji Shringar (Series 4)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-4.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Shringar',
    dimensions: '1023 × 1280',
    description: 'Exquisite silk pitambari and peacock feather mukut darshan.',
    tags: ['Pitambari', 'Radha Vallabh']
  },
  {
    id: 'g_rv_5',
    title: 'Shri Radha Vallabh Ji Shringar (Series 5)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-5.webp',
    aspectRatio: '2/3',
    ratioLabel: '2:3 Portrait',
    dimensions: '853 × 1280',
    description: 'Intricate silver filigree work and fresh jasmine garland shringar.',
    tags: ['Filigree', 'Radha Vallabh']
  },
  {
    id: 'g_rv_6',
    title: 'Shri Radha Vallabh Ji Shringar (Series 6)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-6.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Shringar',
    dimensions: '999 × 1251',
    description: 'Golden crown and divine flute adornment of Shri Radha Vallabh Lal.',
    tags: ['Golden Crown', 'Radha Vallabh']
  },
  {
    id: 'g_rv_7',
    title: 'Shri Radha Vallabh Ji Shringar (Series 7)',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji-7.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Shringar',
    dimensions: '916 × 1145',
    description: 'Sublime evening shringar reflecting Radha Rani’s eternal presence.',
    tags: ['Eternal Presence', 'Radha Vallabh']
  },
  {
    id: 'g_rv_full',
    title: 'Shri Radha Vallabh Lal Ju',
    category: 'Shri Radha Vallabh Ji',
    location: 'Radha Vallabh Mandir, Vrindavan',
    image: '/vrinda-vihar/radha-vallabh-ji.webp',
    aspectRatio: '4/5',
    ratioLabel: '4:5 Portrait',
    dimensions: '1280 × 1600',
    description: 'Full altar darshan with Radha Rani’s divine gaddi beside Thakur Ji.',
    tags: ['Full Altar', 'Radha Vallabh']
  },

  // --- Govardhan & Sacred Kunds ---
  {
    id: 'g_radha_kund',
    title: 'Radha Kund & Shyam Kund Ghats',
    category: 'Govardhan & Sacred Kunds',
    location: 'Radha Kund, Govardhan',
    image: '/vrinda-vihar/radha-kund-govardhan-2.webp',
    aspectRatio: '2.2/1',
    ratioLabel: '2.2:1 Panoramic',
    dimensions: '1280 × 582',
    description: 'The most sacred kund in entire universe, consecrated by Srimati Radharani.',
    tags: ['Radha Kund', 'Holy Snan', 'Panoramic']
  },
  {
    id: 'g_krishna_kund_1',
    title: 'Krishna Kund Holy Waterbody',
    category: 'Govardhan & Sacred Kunds',
    location: 'Govardhan Parikrama Marg',
    image: '/vrinda-vihar/krishn-kund-govardhan.webp',
    aspectRatio: '2.2/1',
    ratioLabel: '2.2:1 Panoramic',
    dimensions: '1280 × 582',
    description: 'Sacred Krishna Kund dug by Lord Krishna’s flute during divine leelas.',
    tags: ['Krishna Kund', 'Govardhan', 'Panoramic']
  },
  {
    id: 'g_krishna_kund_2',
    title: 'Krishna Kund Parikrama Vista',
    category: 'Govardhan & Sacred Kunds',
    location: 'Govardhan Parikrama Marg',
    image: '/vrinda-vihar/krishn-kund-govardhan-2.webp',
    aspectRatio: '2.2/1',
    ratioLabel: '2.2:1 Panoramic',
    dimensions: '1280 × 582',
    description: 'Sunset reflections across the holy waters of Krishna Kund in Govardhan.',
    tags: ['Sunset Kund', 'Govardhan', 'Panoramic']
  },
  {
    id: 'g_gau_dewa',
    title: 'Gau Seva & Cow Sanctuary Govardhan',
    category: 'Govardhan & Sacred Kunds',
    location: 'Giriraj Govardhan Foothills',
    image: '/vrinda-vihar/gau-dewa-govardhan.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Traditional Gau Seva and protected cow herds around Giriraj Govardhan.',
    tags: ['Gau Seva', 'Giriraj', 'Govardhan']
  },
  {
    id: 'g_vallabhacharya',
    title: 'Shri Vallabhacharya Ji Baithakji',
    category: 'Govardhan & Sacred Kunds',
    location: 'Jatipura, Govardhan',
    image: '/vrinda-vihar/shri-vallabhacharya-ji-govardhan.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Sacred Baithak of Jagadguru Mahaprabhu Shri Vallabhacharya at Govardhan.',
    tags: ['Vallabhacharya', 'Baithakji', 'Govardhan']
  },

  // --- Barsana & Sacred Temples ---
  {
    id: 'g_barsana_mandir',
    title: 'Shri Radha Rani Mandir (Shriji Mandir)',
    category: 'Barsana & Sacred Temples',
    location: 'Bhanugarh Hill, Barsana',
    image: '/vrinda-vihar/radha-rani-temple-barsana.webp',
    aspectRatio: '16/9',
    ratioLabel: '16:9 Landscape',
    dimensions: '1200 × 708',
    description: 'The iconic hilltop palace temple dedicated to Ladli Ji (Radha Rani) in Barsana.',
    tags: ['Barsana', 'Radha Rani', 'Hilltop Palace']
  },
  {
    id: 'g_priya_kant',
    title: 'Shri Priya Kant Ju Mandir',
    category: 'Barsana & Sacred Temples',
    location: 'Chhatikara Road, Vrindavan',
    image: '/vrinda-vihar/shri-priya-kaant-ju.webp',
    aspectRatio: '3/4',
    ratioLabel: '3:4 Portrait',
    dimensions: '1200 × 1600',
    description: 'Magnificent lotus-shaped temple dedicated to Priya Kant Ju (Radha Krishna).',
    tags: ['Priya Kant Ju', 'Lotus Temple', 'Vrindavan']
  },
  {
    id: 'g_gopeshwar',
    title: 'Shri Gopeshwar Mahadev Mandir',
    category: 'Barsana & Sacred Temples',
    location: 'Near Vamshi Vat, Vrindavan',
    image: '/vrinda-vihar/gopeshwar-ji.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Lord Shiva in Gopi roop to witness the eternal Maharaas of Radha Krishna.',
    tags: ['Gopeshwar Mahadev', 'Shiva in Gopi Roop', 'Vrindavan']
  },
  {
    id: 'g_rv_portrait',
    title: 'Shri Radha Vallabh Temple Sanctum',
    category: 'Barsana & Sacred Temples',
    location: 'Vrindavan Heritage Zone',
    image: '/vrinda-vihar/radha-vallabh-ji.webp',
    aspectRatio: '9/16',
    ratioLabel: '9:16 Portrait',
    dimensions: '720 × 1280',
    description: 'Inner sanctum view of the sacred Radha Vallabh temple in historic Vrindavan.',
    tags: ['Sanctum', 'Radha Vallabh', 'Heritage']
  }
];

// 9. Master Footer Links
export const footerNavigation = {
  brandTagline: 'Vrinda Vihar — Authentic Brij pilgrimage packages, temple darshans, and memorable spiritual yatras across Mathura, Vrindavan, Barsana & Govardhan.',
  columns: [
    {
      title: 'Brij Packages',
      links: [
        { label: 'Popular Brij Yatras', href: '#popular' },
        { label: 'Brij Yatra Packages', href: '#explore' },
        { label: 'Giriraj Parikrama', href: '#initiatives' },
        { label: 'Custom Yatra Plans', href: '#contact' }
      ]
    },
    {
      title: 'Sacred Dhams',
      links: [
        { label: 'Vrindavan Dham', href: '#popular' },
        { label: 'Barsana & Nandgaon', href: '#initiatives' },
        { label: 'Govardhan Parikrama', href: '#mission' },
        { label: 'Mathura & Gokul', href: '#explore' }
      ]
    },
    {
      title: 'Yatra Support',
      links: [
        { label: 'Help Centre & Live Chat', href: '#help' },
        { label: 'Darshan FAQs', href: '#help' },
        { label: '24/7 Brij Concierge', href: '#help' },
        { label: 'Booking Terms', href: '#terms' },
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Admin Console', href: '#admin' }
      ]
    }
  ],
  socials: [
    { name: 'Instagram', icon: 'Instagram', href: 'https://www.instagram.com/vrindopnishad' },
    { name: 'YouTube', icon: 'Youtube', href: 'https://www.youtube.com/@vrindopnishad' },
    { name: 'Facebook', icon: 'Facebook', href: 'https://www.facebook.com/vrindopnishad' },
    { name: 'Pinterest', icon: 'Pinterest', href: 'https://www.pinterest.com/vrindopnishad' }
  ],
  copyright: '© 2026 Vrinda Vihar by Vrindopnishad. All rights reserved.'
};

// Role Taxonomy & Authority Configuration
export const ROLE_CONFIGS = {
  admin: {
    id: 'admin',
    label: 'Super Admin',
    shortLabel: 'Admin',
    navLabel: 'Admin',
    tag: 'Super Admin',
    badgeClass: 'tp-role-admin',
    icon: 'crown',
    authority: 'Full Platform Admin',
    color: '#d97706',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Platform ops & financial audit'
  },
  driver: {
    id: 'driver',
    label: 'Sarathi Driver Partner',
    shortLabel: 'Driver',
    navLabel: 'Driver',
    tag: 'Sarathi Driver',
    badgeClass: 'tp-role-driver',
    icon: 'car',
    authority: 'Ride Dispatch Desk',
    color: '#0f172a',
    accentBg: '#f8fafc',
    borderColor: '#e2e8f0',
    description: 'GPS ride dispatch & earnings'
  },
  restaurant: {
    id: 'restaurant',
    label: 'Restaurant Partner / Owner',
    shortLabel: 'Restaurant',
    navLabel: 'Dining',
    tag: 'Restaurant Owner',
    badgeClass: 'tp-role-restaurant',
    icon: 'utensils',
    authority: 'Dining & Table Bookings',
    color: '#ea580c',
    accentBg: '#fff7ed',
    borderColor: '#fed7aa',
    description: 'Table bookings & prasadam menu'
  },
  restaurant_staff: {
    id: 'restaurant_staff',
    label: 'Restaurant Staff / Kitchen',
    shortLabel: 'Dining Staff',
    navLabel: 'Staff',
    tag: 'Restaurant Staff',
    badgeClass: 'tp-role-restaurant-staff',
    icon: 'chef-hat',
    authority: 'Kitchen Queue',
    color: '#c2410c',
    accentBg: '#ffedd5',
    borderColor: '#fdba74',
    description: 'Kitchen queue & order fulfillment'
  },
  hotel: {
    id: 'hotel',
    label: 'Hotel & Ashram Stay Owner',
    shortLabel: 'Hotel',
    navLabel: 'Hotel',
    tag: 'Hotel Partner',
    badgeClass: 'tp-role-hotel',
    icon: 'bed',
    authority: 'Ashram Stay Desk',
    color: '#2563eb',
    accentBg: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Room inventory & check-ins'
  },
  hotel_staff: {
    id: 'hotel_staff',
    label: 'Ashram / Hotel Desk Staff',
    shortLabel: 'Desk Staff',
    navLabel: 'Staff',
    tag: 'Desk Staff',
    badgeClass: 'tp-role-hotel-staff',
    icon: 'building',
    authority: 'Front Desk',
    color: '#1d4ed8',
    accentBg: '#dbeafe',
    borderColor: '#93c5fd',
    description: 'Front desk & voucher verification'
  },
  agency: {
    id: 'agency',
    label: 'Tour Agency & Yatra Guide',
    shortLabel: 'Tour Agency',
    navLabel: 'Agency',
    tag: 'Tour Agency',
    badgeClass: 'tp-role-agency',
    icon: 'compass',
    authority: 'Yatra Itineraries',
    color: '#7c3aed',
    accentBg: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'Yatra packages & custom tours'
  },
  pilgrim: {
    id: 'pilgrim',
    label: 'Devotee Pilgrim',
    shortLabel: 'Devotee',
    navLabel: 'Devotee',
    tag: 'Devotee Pilgrim',
    badgeClass: 'tp-role-pilgrim',
    icon: 'sparkles',
    authority: 'Pilgrim Hub',
    color: '#0d9488',
    accentBg: '#f0fdfa',
    borderColor: '#99f6e4',
    description: 'Sacred map, darshan & bookings'
  }
};

export const resolveUserRole = (user) => {
  try {
    if (sessionStorage.getItem('vt_is_admin') === 'true' || localStorage.getItem('vt_admin_session') === 'true') {
      return 'admin';
    }
  } catch {}

  if (!user) {
    try {
      const savedRole = localStorage.getItem('vt_user_role');
      if (savedRole && ROLE_CONFIGS[savedRole]) return savedRole;
    } catch {}
    return 'pilgrim';
  }

  const email = (user.email || '').toLowerCase();
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'sakhi@vrindavihar.in,sakhi@vrindatours.com,admin@vrindatours.com,admin@vrinda.tours,admin@vrindavihar.in')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  if (email && (adminEmails.includes(email) || email.endsWith('@vrindatours.com') || email.endsWith('@vrindavihar.in') || email.endsWith('@vrinda.tours'))) {
    return 'admin';
  }
  try {
    const savedRole = localStorage.getItem('vt_user_role');
    if (savedRole && ROLE_CONFIGS[savedRole]) return savedRole;
  } catch { }
  if (user.role && ROLE_CONFIGS[user.role]) return user.role;
  if (user.category && ROLE_CONFIGS[user.category]) return user.category;
  return 'pilgrim';
};

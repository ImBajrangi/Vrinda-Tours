// Cache helper for local client performance & persistence
export const getCachedData = (key, fallback) => {
  try {
    const item = localStorage.getItem(`vt_tripco_${key}`);
    return item ? JSON.parse(item) : fallback;
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

// Hero Slider Steps (1, 2, 3) - Curated High-Definition Aviation & Sacred Brij Yatra Photography
export const heroSteps = [
  {
    step: 1,
    tagline: 'SACRED BRIJ YATRA & FLIGHTS',
    title: 'Experience\nThe Magic Of\nBrij Vibers!',
    bgImage: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Book A Trip Now'
  },
  {
    step: 2,
    tagline: 'DIVINE PILGRIMAGE CIRCUITS',
    title: 'Sacred \nDhams & Temple Trails!',
    bgImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Explore Packages'
  },
  {
    step: 3,
    tagline: 'PREMIUM VIP CONCIERGE',
    title: 'Brij Vibers In\nPure Luxury &\nDevotion!',
    bgImage: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'View VIP Packages'
  }
];

// Awesome Places Thumbnail Avatars for the Know More Card
export const awesomePlaceAvatars = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=85',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=200&q=85'
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
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=85',
    linkText: 'EXPLORE PACKAGES >',
    iconType: 'pin'
  },
  {
    id: 'step_ticket',
    stepNumber: 2,
    title: 'Book VIP\nDarshan & Stay',
    shortTitle: 'Book Darshan & Stay',
    desc: 'Instant confirmation, temple pass entry, ashrams & cab transfers.',
    photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=85',
    linkText: 'VIEW DETAILS >',
    iconType: 'grid'
  },
  {
    id: 'step_pay',
    stepNumber: 3,
    title: 'Pray &\nBegin Yatra',
    shortTitle: 'Pray & Begin Yatra',
    desc: 'Zero-hidden fees, WhatsApp instant voucher & 24/7 dedicated Brij guide.',
    photo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=600&q=85',
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
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
    description: 'Special VIP Darshan at Shri Bankey Bihari Ji, Nidhivan, and illuminated Prem Mandir.',
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
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=85',
    description: 'Sacred hilltop darshan of Shriji Mandir, Mor Kuti, Maan Mandir & Rangili Mahal.',
    tags: ['Barsana', 'Radha Rani', 'Yatra']
  },
  {
    id: 'pop_govardhan',
    title: 'Govardhan Parikrama',
    location: 'Govardhan',
    price: '1.8k/-',
    priceUnit: '/day',
    numericPrice: 1800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=85',
    description: 'Complete 21 km Govardhan Parikrama with dedicated guide, visiting Radha Kund & Mansi Ganga.',
    tags: ['Govardhan', 'Parikrama', 'Giriraj']
  },
  {
    id: 'pop_mathura',
    title: 'Krishna Janmabhoomi & Gokul',
    location: 'Mathura & Gokul',
    price: '2.8k/-',
    priceUnit: '/day',
    numericPrice: 2800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=85',
    description: 'Birthplace of Lord Krishna in Mathura, Vishram Ghat Yamuna Aarti, and Gokul Raman Reti.',
    tags: ['Mathura', 'Janmabhoomi', 'Gokul']
  }
];

// 2. Sweet Memories Features
export const sweetMemoryFeatures = [
  {
    number: '01',
    title: 'Find Brij yatras tailored for you',
    desc: 'Spiritual bliss, VIP darshan passes, comfortable stays, and seamless guided pilgrimage.'
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Anand Gopal',
    rating: '5.0',
    position: 'middle-right',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Pooja Verma',
    rating: '4.9',
    position: 'bottom-left',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
  }
];

// 3. Top Destination Tabs and Bento Grid Data for Brij Vibers
export const topDestinationTabs = [
  'Vrindavan',
  'Mathura',
  'Govardhan',
  'Barsana & Nandgaon',
  'Gokul & Mahavan'
];

export const topDestinationsByTab = {
  'Vrindavan': [
    {
      id: 'vrn_1',
      region: 'VRINDAVAN',
      title: 'Shri Bankey Bihari Mandir',
      rating: '5.0',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Vrindavan',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'vrn_2',
      region: 'VRINDAVAN',
      title: 'Prem Mandir Light & Darshan',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Chhatikara Road, Vrindavan',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'vrn_3',
      region: 'VRINDAVAN',
      title: 'Nidhivan & Seva Kunj',
      rating: '4.9',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Sacred Forest, Vrindavan',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'vrn_4',
      region: 'VRINDAVAN',
      title: 'ISKCON Krishna Balaram Temple',
      rating: '4.9',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Raman Reti, Vrindavan',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'vrn_5',
      region: 'VRINDAVAN',
      title: 'Kesi Ghat Sunset Boat Aarti',
      rating: '4.8',
      price: '1.2k/-',
      priceUnit: '/Pax',
      numericPrice: 1200,
      category: 'Top Destination',
      location: 'Yamuna Riverbank, Vrindavan',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'vrn_6',
      region: 'VRINDAVAN',
      title: 'Shri Radha Vallabh Mandir',
      rating: '4.9',
      price: '1.6k/-',
      priceUnit: '/Pax',
      numericPrice: 1600,
      category: 'Top Destination',
      location: 'Old Vrindavan',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Mathura': [
    {
      id: 'mth_1',
      region: 'MATHURA',
      title: 'Shri Krishna Janmabhoomi',
      rating: '5.0',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Mathura Central',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'mth_2',
      region: 'MATHURA',
      title: 'Vishram Ghat Maha Aarti',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Yamuna Bank, Mathura',
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'mth_3',
      region: 'MATHURA',
      title: 'Dwarkadhish Temple',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Mathura Ghats',
      image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'mth_4',
      region: 'MATHURA',
      title: 'Gita Mandir & Birla Temple',
      rating: '4.7',
      price: '1.2k/-',
      priceUnit: '/Pax',
      numericPrice: 1200,
      category: 'Top Destination',
      location: 'Mathura Vrindavan Road',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'mth_5',
      region: 'MATHURA',
      title: 'Kans Qila & Yamuna View',
      rating: '4.6',
      price: '1k/-',
      priceUnit: '/Pax',
      numericPrice: 1000,
      category: 'Top Destination',
      location: 'Mathura',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'mth_6',
      region: 'MATHURA',
      title: 'Bhuteshwar Mahadev Temple',
      rating: '4.8',
      price: '1.4k/-',
      priceUnit: '/Pax',
      numericPrice: 1400,
      category: 'Top Destination',
      location: 'Mathura Kshetra',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Govardhan': [
    {
      id: 'gov_1',
      region: 'GOVARDHAN',
      title: 'Giriraj Mukharbind Darshan',
      rating: '5.0',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Jatipura & Manasi Ganga',
      image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'gov_2',
      region: 'GOVARDHAN',
      title: 'Radha Kund & Shyam Kund',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Radha Kund Dham',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'gov_3',
      region: 'GOVARDHAN',
      title: 'Kusum Sarovar Heritage',
      rating: '4.9',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Govardhan Parikrama Marg',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'gov_4',
      region: 'GOVARDHAN',
      title: 'Daan Ghati Mandir',
      rating: '4.8',
      price: '1.6k/-',
      priceUnit: '/Pax',
      numericPrice: 1600,
      category: 'Top Destination',
      location: 'Govardhan Town',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'gov_5',
      region: 'GOVARDHAN',
      title: 'Mansi Ganga Holy Snan',
      rating: '4.7',
      price: '1.2k/-',
      priceUnit: '/Pax',
      numericPrice: 1200,
      category: 'Top Destination',
      location: 'Central Govardhan',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'gov_6',
      region: 'GOVARDHAN',
      title: 'Puchhari Ka Lautha',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Govardhan Border',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Barsana & Nandgaon': [
    {
      id: 'bar_1',
      region: 'BARSANA',
      title: 'Shriji Mandir (Radha Rani)',
      rating: '5.0',
      price: '3.5k/-',
      priceUnit: '/Pax',
      numericPrice: 3500,
      category: 'Top Destination',
      location: 'Bhanugarh Hill, Barsana',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'bar_2',
      region: 'BARSANA',
      title: 'Maan Mandir & Mor Kuti',
      rating: '4.9',
      price: '2k/-',
      priceUnit: '/Pax',
      numericPrice: 2000,
      category: 'Top Destination',
      location: 'Barsana Hilltop',
      image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'bar_3',
      region: 'NANDGAON',
      title: 'Nand Bhawan (Nand Baba Temple)',
      rating: '4.9',
      price: '2.5k/-',
      priceUnit: '/Pax',
      numericPrice: 2500,
      category: 'Top Destination',
      location: 'Nandisvara Hill, Nandgaon',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'bar_4',
      region: 'BARSANA',
      title: 'Kirti Mandir & Rangili Mahal',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Barsana Valley',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'bar_5',
      region: 'BARSANA',
      title: 'Sanket Van Leela Sthali',
      rating: '4.7',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Between Barsana & Nandgaon',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'bar_6',
      region: 'NANDGAON',
      title: 'Pavana Sarovar Holy Kund',
      rating: '4.8',
      price: '1.4k/-',
      priceUnit: '/Pax',
      numericPrice: 1400,
      category: 'Top Destination',
      location: 'Nandgaon',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Gokul & Mahavan': [
    {
      id: 'gok_1',
      region: 'GOKUL',
      title: 'Raman Reti Holy Sand Ashram',
      rating: '5.0',
      price: '2.2k/-',
      priceUnit: '/Pax',
      numericPrice: 2200,
      category: 'Top Destination',
      location: 'Gokul Dham',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'gok_2',
      region: 'GOKUL',
      title: 'Chaurasi Khamba (Nand Bhawan)',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Mahavan, Gokul',
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'gok_3',
      region: 'GOKUL',
      title: 'Brahmand Ghat & Yamuna',
      rating: '4.9',
      price: '1.8k/-',
      priceUnit: '/Pax',
      numericPrice: 1800,
      category: 'Top Destination',
      location: 'Gokul Riverbank',
      image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'gok_4',
      region: 'GOKUL',
      title: 'Ukhal Bandhan Leela Sthali',
      rating: '4.7',
      price: '1.4k/-',
      priceUnit: '/Pax',
      numericPrice: 1400,
      category: 'Top Destination',
      location: 'Gokul',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'gok_5',
      region: 'GOKUL',
      title: 'Gokulnath Ji Mandir',
      rating: '4.8',
      price: '1.5k/-',
      priceUnit: '/Pax',
      numericPrice: 1500,
      category: 'Top Destination',
      location: 'Gokul Bazaar',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'gok_6',
      region: 'MAHAVAN',
      title: 'Yashoda Nandan Bal Leela',
      rating: '4.8',
      price: '1.6k/-',
      priceUnit: '/Pax',
      numericPrice: 1600,
      category: 'Top Destination',
      location: 'Mahavan Kshetra',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
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
  'VIP Aarti',
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
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_vrindavan_vip',
    title: 'VIP Bankey Bihari & Prem Mandir',
    location: 'Vrindavan Dham',
    price: '2.5k/-',
    priceUnit: '/Pax',
    numericPrice: 2500,
    rating: 4.9,
    category: 'Darshan',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
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
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_barsana_nandgaon',
    title: 'Barsana Shriji & Nand Bhawan',
    location: 'Barsana & Nandgaon',
    price: '3.5k/-',
    priceUnit: '/Pax',
    numericPrice: 3500,
    rating: 4.9,
    category: 'Barsana & Nandgaon',
    image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_mathura_janmabhoomi',
    title: 'Mathura Janmabhoomi & Yamuna Aarti',
    location: 'Mathura & Vishram Ghat',
    price: '2k/-',
    priceUnit: '/Pax',
    numericPrice: 2000,
    rating: 4.9,
    category: 'Popular Destination',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_gokul_raman_reti',
    title: 'Gokul Raman Reti & Brahmand Ghat',
    location: 'Gokul Dham',
    price: '2.2k/-',
    priceUnit: '/Pax',
    numericPrice: 2200,
    rating: 4.8,
    category: 'Popular Destination',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_yamuna_boat',
    title: 'Yamuna Sunset Private Boat Aarti',
    location: 'Kesi Ghat, Vrindavan',
    price: '1.5k/-',
    priceUnit: '/Pax',
    numericPrice: 1500,
    rating: 4.9,
    category: 'VIP Aarti',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_3day_brij',
    title: 'Luxury 3-Day Complete Brij Vibers',
    location: 'Complete Brij Mandal',
    price: '8.5k/-',
    priceUnit: '/Pax',
    numericPrice: 8500,
    rating: 5.0,
    category: '84 Kos Yatra',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_weekend_vrindavan',
    title: 'Weekend Vrindavan Yatra Package',
    location: 'Vrindavan & Mathura',
    price: '4k/-',
    priceUnit: '/Pax',
    numericPrice: 4000,
    rating: 4.9,
    category: 'Darshan',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80'
  }
];

// 5. Postal Stamp Destination Cards ("Let's go on an adventure")
export const stampDestinations = [
  {
    id: 'stamp_vrindavan',
    city: 'VRINDAVAN',
    country: 'Brij Dham',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80',
    highlight: 'Bankey Bihari & Prem Mandir'
  },
  {
    id: 'stamp_barsana',
    city: 'BARSANA',
    country: 'Brij Dham',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=500&q=80',
    highlight: 'Shri Radha Rani Hilltop Mandir'
  },
  {
    id: 'stamp_govardhan',
    city: 'GOVARDHAN',
    country: 'Brij Dham',
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=500&q=80',
    highlight: 'Giriraj Parikrama & Radha Kund'
  },
  {
    id: 'stamp_mathura',
    city: 'MATHURA',
    country: 'Brij Dham',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500&q=80',
    highlight: 'Krishna Janmabhoomi & Ghats'
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
  badge: 'OUR BRIJ YATRA PHILOSOPHY',
  titlePart1: "Crafting Yatras",
  titleHighlight: 'Of Pure Devotion,',
  titlePart2: 'Comfort & Heritage',
  titlePart3: 'Across Sacred Brij.',
  description: 'Hand-crafted luxury Brij Vibers yatras, VIP temple darshans, and authentic spiritual retreats designed for families and pilgrims worldwide.',
  primaryBtnText: 'Explore Brij Packages',
  secondaryBtnText: 'Custom Yatra Plan',
  pillars: [
    {
      id: 'pillar_luxury',
      title: 'Curated Brij Vibers\nPackages',
      description: 'Private AC transfers, verified ashrams & luxury hotels across Brij Mandal.',
      icon: 'Compass',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      alt: 'Sacred Brij Dham heritage and temple landscape'
    },
    {
      id: 'pillar_culture',
      title: 'Darshan &\nTemple Passes',
      description: 'Skip long queues with our dedicated local guides and darshan assistance.',
      icon: 'MapPin',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      alt: 'Majestic ancient temple and heritage sunrise'
    },
    {
      id: 'pillar_adventure',
      title: 'Parikrama &\nLeela Sthali Trails',
      description: 'Guided Govardhan parikrama, sacred kund snan, and evening boat aartis.',
      icon: 'Plane',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85',
      alt: 'Serene Brij Dham hills under golden sun'
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
  badge: 'FEATURED BRIJ Vibers EXPEDITIONS',
  title: 'Real Devotion. Unrivaled Heritage.\nSacred Brij Awaits.',
  description: 'From illuminated temple darshans to sacred Yamuna boat aartis, discover handpicked Brij Vibers itineraries designed for lifelong memories.',
  viewAllText: 'View All Packages',
  cards: [
    {
      id: 'init_vrindavan',
      category: 'Vrindavan Yatra',
      title: 'Bankey Bihari &\nPrem Mandir Tour',
      description: 'VIP darshan passes, evening fountain show, and sacred Nidhivan trail.',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Package'
    },
    {
      id: 'init_govardhan',
      category: 'Parikrama Yatra',
      title: 'Giriraj Govardhan\n21km Holy Trail',
      description: 'E-rickshaw or guided walking parikrama with Radha Kund & Mansi Ganga.',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Package'
    },
    {
      id: 'init_barsana',
      category: 'Brij Dham',
      title: 'Barsana & Nandgaon\nHeritage Leela Tour',
      description: 'Shriji Mandir hilltop visit, Mor Kuti, and Nand Baba royal palace.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Package'
    },
    {
      id: 'init_gokul',
      category: 'Sacred Trails',
      title: 'Gokul Raman Reti &\nYamuna Boat Aarti',
      description: 'Rolling in sacred Raman Reti sand, Chaurasi Khamba, and sunset Yamuna aarti.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Package'
    },
    {
      id: 'init_84kos',
      category: 'Chaurasi Kos',
      title: 'Complete 84 Kos\nBrij Mahayatra',
      description: 'Comprehensive 7-day divine pilgrimage covering all 12 sacred forests of Brij.',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Package'
    }
  ],
  newsletterCard: {
    title: 'Stay Connected With Brij Dham.',
    description: 'Subscribe to our Brij Yatra journal for VIP festival schedules, darshan timings, and exclusive discounts on Brij Vibers packages.',
    placeholder: 'Enter your email for yatra updates',
    buttonText: 'Subscribe',
    joinText: 'Join 25,000+ blessed devotees'
  }
};

// 9. Master Footer Links
export const footerNavigation = {
  brandTagline: 'Vrinda Tours — Authentic Brij Vibers packages, VIP temple darshans, and memorable spiritual yatras across Mathura, Vrindavan & Barsana.',
  columns: [
    {
      title: 'Brij Packages',
      links: [
        { label: 'Popular Brij Yatras', href: '#popular' },
        { label: 'Brij Vibers Packages', href: '#explore' },
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
        { label: 'Darshan FAQs', href: '#contact' },
        { label: '24/7 Brij Concierge', href: '#contact' },
        { label: 'Booking Terms', href: '#terms' },
        { label: 'Privacy Policy', href: '#privacy' }
      ]
    }
  ],
  socials: [
    { name: 'Instagram', icon: 'Instagram', href: 'https://www.instagram.com/vrindopnishad' },
    { name: 'YouTube', icon: 'Youtube', href: 'https://www.youtube.com/@vrindopnishad' },
    { name: 'Facebook', icon: 'Facebook', href: 'https://www.facebook.com/vrindopnishad' },
    { name: 'Pinterest', icon: 'Pinterest', href: 'https://www.pinterest.com/vrindopnishad' }
  ],
  copyright: '© 2026 Vrinda Tours. All rights reserved.'
};

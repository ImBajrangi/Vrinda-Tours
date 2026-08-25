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

// Hero Slider Steps (1, 2, 3) - Curated High-Definition Commercial Aviation & Sky Photography
export const heroSteps = [
  {
    step: 1,
    tagline: 'ELEVATE YOUR TRAVEL',
    title: 'Experience\nThe Magic Of\nFlight!',
    bgImage: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Book A Trip Now'
  },
  {
    step: 2,
    tagline: 'UNLIMITED DESTINATIONS',
    title: 'Discover\nNew Horizons\nAbove Clouds!',
    bgImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'Explore Flights'
  },
  {
    step: 3,
    tagline: 'PREMIUM IN-FLIGHT',
    title: 'Fly In Pure\nLuxury &\nComfort!',
    bgImage: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=2000&q=90',
    ctaText: 'View First Class'
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

// Journey Steps for the Animated Carousel Section ("Journey To The Skies Made Simple!")
export const journeySteps = [
  {
    id: 'step_dest',
    stepNumber: 1,
    title: 'Find Your\nDestination',
    shortTitle: 'Find Your Destination',
    desc: 'Explore 1,300+ worldwide routes tailored to your wanderlust.',
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=85',
    linkText: 'EXPLORE ROUTES >',
    iconType: 'pin'
  },
  {
    id: 'step_ticket',
    stepNumber: 2,
    title: 'Book\nA Ticket',
    shortTitle: 'Book A Ticket',
    desc: 'Instant confirmation, flexible dates, and premium in-flight comfort.',
    photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=85',
    linkText: 'LEARN MORE >',
    iconType: 'grid'
  },
  {
    id: 'step_pay',
    stepNumber: 3,
    title: 'Pay &\nStart Journey',
    shortTitle: 'Pay & Start Journey',
    desc: 'Zero-fee checkout, mobile e-tickets, and priority airport boarding.',
    photo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=600&q=85',
    linkText: 'START JOURNEY >',
    iconType: 'card'
  }
];



// 1. Popular Places (4 Top Grid Cards)
export const popularPlaces = [
  {
    id: 'pop_mindanao',
    title: 'Mt. Mindanao',
    location: 'Mindanao, Philippines',
    price: '$24/day',
    numericPrice: 24,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Majestic emerald volcanic lakes and pristine tropical rainforest ridges.',
    tags: ['Nature', 'Hiking', 'Lake']
  },
  {
    id: 'pop_tokyo',
    title: 'Disneyland Tokyo',
    location: 'Tokyo, Japan',
    price: '$36/day',
    numericPrice: 36,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    description: 'Enchanting magical kingdom and world-famous fantasy attractions.',
    tags: ['Theme Park', 'Family', 'Attraction']
  },
  {
    id: 'pop_thousand_island',
    title: 'Thousand Island',
    location: 'Jakarta, Indonesia',
    price: '$14/day',
    numericPrice: 14,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Cluster of crystal clear coral islands and powdery white sandbars.',
    tags: ['Beach', 'Snorkeling', 'Islands']
  },
  {
    id: 'pop_basilica',
    title: 'Basilica Santa',
    location: 'Venice, Italy',
    price: '$28/day',
    numericPrice: 28,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
    description: 'Historic Venetian grand basilica and romantic canal-side architectures.',
    tags: ['Culture', 'Heritage', 'Architecture']
  }
];

// 2. Sweet Memories Features
export const sweetMemoryFeatures = [
  {
    number: '01',
    title: 'Find trips that fit your freedom',
    desc: 'Including where freedom and flexibility, minutes and spontaneity meet luxury and purpose.'
  },
  {
    number: '02',
    title: 'Get back to nature by travel',
    desc: 'The world is waiting for you and you can freely experience the best you are and make friends.'
  },
  {
    number: '03',
    title: 'Reignite those travel instincts',
    desc: 'Make everyday count with journeys, trips & memories that last a glorious lifetime.'
  }
];

// Floating Reviewers on the Hero Landscape
export const memoryReviewers = [
  {
    name: 'Verena Levine',
    rating: '4.9',
    position: 'top-left',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Hamal Adam',
    rating: '5.0',
    position: 'middle-right',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Jiye Debang',
    rating: '4.8',
    position: 'bottom-left',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
  }
];

// 3. Top Destination Tabs and Bento Grid Data
export const topDestinationTabs = [
  'Nusa Tenggara Timur',
  'Bali',
  'Papua',
  'Nusa Tenggara Barat',
  'Kalimantan'
];

export const topDestinationsByTab = {
  'Nusa Tenggara Timur': [
    {
      id: 'ntt_1',
      region: 'NTB',
      title: 'Wildlife Experience',
      rating: '4.5',
      price: '$120',
      priceUnit: '/Pax',
      numericPrice: 120,
      category: 'Top Destination',
      location: 'Komodo Island, NTB',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'ntt_2',
      region: 'NTB',
      title: 'Warrior Tradition',
      rating: '4.5',
      price: '$95',
      priceUnit: '/Pax',
      numericPrice: 95,
      category: 'Top Destination',
      location: 'Sumba Village, NTB',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'ntt_3',
      region: 'NTB',
      title: 'Traditional Sumbanese Village',
      rating: '4.5',
      price: '$165',
      priceUnit: '/Pax',
      numericPrice: 165,
      category: 'Top Destination',
      location: 'Waerobo, NTB',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'ntt_4',
      region: 'NTB',
      title: 'Misty Mountain Village',
      rating: '4.5',
      price: '$140',
      priceUnit: '/Pax',
      numericPrice: 140,
      category: 'Top Destination',
      location: 'Flores Highland, NTB',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'ntt_5',
      region: 'NTB',
      title: 'Waterfall',
      rating: '4.5',
      price: '$85',
      priceUnit: '/Pax',
      numericPrice: 85,
      category: 'Top Destination',
      location: 'Tiu Kelep, NTB',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'ntt_6',
      region: 'NTB',
      title: 'Traditional Attire',
      rating: '4.5',
      price: '$90',
      priceUnit: '/Pax',
      numericPrice: 90,
      category: 'Top Destination',
      location: 'Manggaraian, NTB',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Bali': [
    {
      id: 'bali_1',
      region: 'BALI',
      title: 'Sacred Monkey Forest',
      rating: '4.9',
      price: '$110',
      priceUnit: '/Pax',
      numericPrice: 110,
      category: 'Top Destination',
      location: 'Ubud, Bali',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'bali_2',
      region: 'BALI',
      title: 'Kecak Fire Dance',
      rating: '4.8',
      price: '$95',
      priceUnit: '/Pax',
      numericPrice: 95,
      category: 'Top Destination',
      location: 'Uluwatu, Bali',
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'bali_3',
      region: 'BALI',
      title: 'Tegallalang Rice Terrace',
      rating: '4.9',
      price: '$150',
      priceUnit: '/Pax',
      numericPrice: 150,
      category: 'Top Destination',
      location: 'Gianyar, Bali',
      image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'bali_4',
      region: 'BALI',
      title: 'Ulun Danu Beratan Temple',
      rating: '4.9',
      price: '$135',
      priceUnit: '/Pax',
      numericPrice: 135,
      category: 'Top Destination',
      location: 'Bedugul, Bali',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1000&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'bali_5',
      region: 'BALI',
      title: 'Sekumpul Waterfall',
      rating: '4.8',
      price: '$85',
      priceUnit: '/Pax',
      numericPrice: 85,
      category: 'Top Destination',
      location: 'Singaraja, Bali',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'bali_6',
      region: 'BALI',
      title: 'Nusa Penida Kelingking',
      rating: '4.9',
      price: '$125',
      priceUnit: '/Pax',
      numericPrice: 125,
      category: 'Top Destination',
      location: 'Nusa Penida, Bali',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Papua': [
    {
      id: 'papua_1',
      region: 'PAPUA',
      title: 'Birds of Paradise',
      rating: '4.8',
      price: '$145',
      priceUnit: '/Pax',
      numericPrice: 145,
      category: 'Top Destination',
      location: 'Raja Ampat, Papua',
      image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'papua_2',
      region: 'PAPUA',
      title: 'Dani Tribe Heritage',
      rating: '4.7',
      price: '$115',
      priceUnit: '/Pax',
      numericPrice: 115,
      category: 'Top Destination',
      location: 'Baliem Valley, Papua',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'papua_3',
      region: 'PAPUA',
      title: 'Wayag Karst Islands',
      rating: '5.0',
      price: '$220',
      priceUnit: '/Pax',
      numericPrice: 220,
      category: 'Top Destination',
      location: 'Raja Ampat, Papua',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'papua_4',
      region: 'PAPUA',
      title: 'Misty Highland Rainforest',
      rating: '4.9',
      price: '$160',
      priceUnit: '/Pax',
      numericPrice: 160,
      category: 'Top Destination',
      location: 'Jayawijaya, Papua',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'papua_5',
      region: 'PAPUA',
      title: 'Sentani Lake Wonder',
      rating: '4.8',
      price: '$95',
      priceUnit: '/Pax',
      numericPrice: 95,
      category: 'Top Destination',
      location: 'Jayapura, Papua',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'papua_6',
      region: 'PAPUA',
      title: 'Pianemo Lagoon Panorama',
      rating: '4.9',
      price: '$180',
      priceUnit: '/Pax',
      numericPrice: 180,
      category: 'Top Destination',
      location: 'Raja Ampat, Papua',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Nusa Tenggara Barat': [
    {
      id: 'ntb_1',
      region: 'NTB',
      title: 'Mount Rinjani Caldera',
      rating: '4.9',
      price: '$155',
      priceUnit: '/Pax',
      numericPrice: 155,
      category: 'Top Destination',
      location: 'Lombok, NTB',
      image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'ntb_2',
      region: 'NTB',
      title: 'Sasak Village Weaving',
      rating: '4.7',
      price: '$85',
      priceUnit: '/Pax',
      numericPrice: 85,
      category: 'Top Destination',
      location: 'Sade Village, NTB',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'ntb_3',
      region: 'NTB',
      title: 'Pink Beach & Turquoise Bay',
      rating: '4.9',
      price: '$140',
      priceUnit: '/Pax',
      numericPrice: 140,
      category: 'Top Destination',
      location: 'East Lombok, NTB',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'ntb_4',
      region: 'NTB',
      title: 'Sembalun Valley Hills',
      rating: '4.8',
      price: '$130',
      priceUnit: '/Pax',
      numericPrice: 130,
      category: 'Top Destination',
      location: 'Sembalun, NTB',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'ntb_5',
      region: 'NTB',
      title: 'Benang Stokel Cascades',
      rating: '4.7',
      price: '$75',
      priceUnit: '/Pax',
      numericPrice: 75,
      category: 'Top Destination',
      location: 'Central Lombok, NTB',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'ntb_6',
      region: 'NTB',
      title: 'Gili Meno Sea Turtles',
      rating: '4.9',
      price: '$110',
      priceUnit: '/Pax',
      numericPrice: 110,
      category: 'Top Destination',
      location: 'Gili Islands, NTB',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ],
  'Kalimantan': [
    {
      id: 'kal_1',
      region: 'KALIMANTAN',
      title: 'Orangutan Jungle Safari',
      rating: '4.9',
      price: '$175',
      priceUnit: '/Pax',
      numericPrice: 175,
      category: 'Top Destination',
      location: 'Tanjung Puting, Kalimantan',
      image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-1'
    },
    {
      id: 'kal_2',
      region: 'KALIMANTAN',
      title: 'Dayak Longhouse Culture',
      rating: '4.8',
      price: '$105',
      priceUnit: '/Pax',
      numericPrice: 105,
      category: 'Top Destination',
      location: 'Kapuas Hulu, Kalimantan',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-2'
    },
    {
      id: 'kal_3',
      region: 'KALIMANTAN',
      title: 'Derawan Jellyfish Lake',
      rating: '5.0',
      price: '$210',
      priceUnit: '/Pax',
      numericPrice: 210,
      category: 'Top Destination',
      location: 'Berau, Kalimantan',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-3'
    },
    {
      id: 'kal_4',
      region: 'KALIMANTAN',
      title: 'Lok Baintan Floating Market',
      rating: '4.8',
      price: '$90',
      priceUnit: '/Pax',
      numericPrice: 90,
      category: 'Top Destination',
      location: 'Banjarmasin, Kalimantan',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=85',
      gridArea: 'card-4'
    },
    {
      id: 'kal_5',
      region: 'KALIMANTAN',
      title: 'Labuan Cermin Mirror Lake',
      rating: '4.9',
      price: '$135',
      priceUnit: '/Pax',
      numericPrice: 135,
      category: 'Top Destination',
      location: 'Biduk-Biduk, Kalimantan',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-5'
    },
    {
      id: 'kal_6',
      region: 'KALIMANTAN',
      title: 'Borneo Canopy Walkway',
      rating: '4.7',
      price: '$85',
      priceUnit: '/Pax',
      numericPrice: 85,
      category: 'Top Destination',
      location: 'Bukit Bangkirai, Kalimantan',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=85',
      gridArea: 'card-6'
    }
  ]
};

// 3.5 Adventure Categories
export const adventureCategories = [
  'Popular Destination',
  'Islands',
  'Surfing',
  'National parks',
  'Lake',
  'Beach',
  'Camp'
];

// 4. Explore More (6-card Grid)
export const exploreDestinations = [
  {
    id: 'exp_amalfi',
    title: 'Amalfi Coast',
    location: 'Amalfi, Italy',
    price: '$148',
    priceUnit: '/Pax',
    numericPrice: 148,
    rating: 4.9,
    category: 'Popular Destination',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_taj_mahal',
    title: 'Taj Mahal',
    location: 'Agra, India',
    price: '$110',
    priceUnit: '/Pax',
    numericPrice: 110,
    rating: 4.9,
    category: 'Popular Destination',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_lombok',
    title: 'Lombok Island',
    location: 'Bali, Indonesia',
    price: '$138',
    priceUnit: '/Pax',
    numericPrice: 138,
    rating: 4.8,
    category: 'Islands',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_osaka',
    title: 'Osaka Castle',
    location: 'Osaka, Japan',
    price: '$152',
    priceUnit: '/Pax',
    numericPrice: 152,
    rating: 4.9,
    category: 'Popular Destination',
    image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_cape_reinga',
    title: 'Cape Reinga',
    location: 'Northland, New Zealand',
    price: '$164',
    priceUnit: '/Pax',
    numericPrice: 164,
    rating: 4.9,
    category: 'National parks',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_santorini',
    title: 'Santorini Island',
    location: 'Santorini, Greece',
    price: '$172',
    priceUnit: '/Pax',
    numericPrice: 172,
    rating: 4.8,
    category: 'Islands',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
  },
  // Additional items for "Show more" expansion
  {
    id: 'exp_bali_surf',
    title: 'Uluwatu Cliffs',
    location: 'Bali, Indonesia',
    price: '$125',
    priceUnit: '/Pax',
    numericPrice: 125,
    rating: 4.9,
    category: 'Surfing',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_lake_como',
    title: 'Lake Como',
    location: 'Lombardy, Italy',
    price: '$195',
    priceUnit: '/Pax',
    numericPrice: 195,
    rating: 5.0,
    category: 'Lake',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'exp_fuji_camp',
    title: 'Mount Fuji Campsite',
    location: 'Honshu, Japan',
    price: '$89',
    priceUnit: '/Pax',
    numericPrice: 89,
    rating: 4.9,
    category: 'Camp',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80'
  }
];

// 5. Postal Stamp Destination Cards ("Let's go on an adventure")
export const stampDestinations = [
  {
    id: 'stamp_paris',
    city: 'PARIS',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80',
    highlight: 'City of Lights & Eiffel Tower'
  },
  {
    id: 'stamp_nyc',
    city: 'NEW YORK',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=500&q=80',
    highlight: 'Manhattan Skyline & Liberty'
  },
  {
    id: 'stamp_seoul',
    city: 'SEOUL',
    country: 'South Korea',
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=500&q=80',
    highlight: 'Gyeongbokgung Palace & Culture'
  },
  {
    id: 'stamp_bali',
    city: 'BALI',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500&q=80',
    highlight: 'Island of Gods & Sacred Shrines'
  }
];

// 6. Navigation Tabs in Hero Booking Capsule
export const bookingTabs = [
  { id: 'hostelry', label: 'Hostelry', icon: 'Building' },
  { id: 'flights', label: 'Flights', icon: 'Plane' },
  { id: 'bus_shuttle', label: 'Bus & Shuttle', icon: 'Bus' },
  { id: 'cars', label: 'Cars', icon: 'Car' }
];

// 7. Travel Philosophy & Signature Expeditions Section ("Crafting Journeys That Inspire, Transform & Endure.")
export const missionData = {
  badge: 'OUR TRAVEL PHILOSOPHY',
  titlePart1: "Crafting Journeys",
  titleHighlight: 'That Inspire,',
  titlePart2: 'Transform & Endure',
  titlePart3: 'Across The Globe.',
  description: 'Hand-crafted luxury expeditions, immersive cultural retreats, and breathtaking wilderness odysseys designed for the discerning traveler.',
  primaryBtnText: 'Explore Tours',
  secondaryBtnText: 'Custom Itinerary',
  pillars: [
    {
      id: 'pillar_luxury',
      title: 'Curated Luxury\nExpeditions',
      description: 'Private charter voyages and boutique stays across world wonders.',
      icon: 'Compass',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      alt: 'Luxury private tropical resort with turquoise ocean'
    },
    {
      id: 'pillar_culture',
      title: 'Immersive Cultural\nJourneys',
      description: 'Deep heritage trails led by expert local historians and storytellers.',
      icon: 'MapPin',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
      alt: 'Majestic ancient temple and heritage sunrise'
    },
    {
      id: 'pillar_adventure',
      title: 'Alpine & Wilderness\nAdventures',
      description: 'Thrilling mountain treks, safari glamping, and scenic flights.',
      icon: 'Plane',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85',
      alt: 'Majestic high alpine peaks under golden sun'
    }
  ],
  trustedBy: [
    { id: 'tb_1', name: 'Airbnb Luxury', symbol: 'globe' },
    { id: 'tb_2', name: 'Expedia Elite', symbol: 'cross' },
    { id: 'tb_3', name: 'Booking.com', symbol: 'cross' },
    { id: 'tb_4', name: 'Emirates Holidays', symbol: 'sphere' },
    { id: 'tb_5', name: 'National Geographic', symbol: 'globe' },
    { id: 'tb_6', name: 'Relais & Châteaux', symbol: 'sphere' }
  ]
};

// 8. Featured Signature Tours & Travel Journal Section ("Real Journeys. Unrivaled Wonder. A World Awaits.")
export const initiativesData = {
  badge: 'FEATURED EXPEDITIONS',
  title: 'Real Journeys. Unrivaled Wonder.\nA World Awaits.',
  description: 'From secluded tropical archipelagos to historic imperial capitals, discover handpicked tour itineraries designed for unforgettable travel memories.',
  viewAllText: 'View All Tours',
  cards: [
    {
      id: 'init_tropical',
      category: 'Island Escapes',
      title: 'Tropical Island\nOdyssey',
      description: 'Pristine coral atolls, overwater villas, and private lagoon cruises.',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Tour'
    },
    {
      id: 'init_alpine',
      category: 'Mountain Treks',
      title: 'Swiss Alps &\nGlacier Trails',
      description: 'Panoramic mountain railways, historic chalets, and alpine summits.',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Tour'
    },
    {
      id: 'init_heritage',
      category: 'Cultural Odyssey',
      title: 'Royal Palaces &\nHeritage Cities',
      description: 'Centuries of grand architecture, royal forts, and vibrant bazaars.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Tour'
    },
    {
      id: 'init_safari',
      category: 'Wild Safaris',
      title: 'Serengeti Safari &\nWild Plains',
      description: 'The Great Migration, open-air game drives, and luxury glamping.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Tour'
    },
    {
      id: 'init_nordic',
      category: 'Arctic Wonders',
      title: 'Nordic Fjords &\nNorthern Lights',
      description: 'Deep glacial fjords, glass igloo stays, and magical auroras.',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=85',
      linkText: 'Explore Tour'
    }
  ],
  newsletterCard: {
    title: 'Stay Inspired. Travel Farther.',
    description: 'Subscribe to our private travel journal for VIP flight perks, destination insider guides, and early access to signature tours.',
    placeholder: 'Enter your email for travel guides',
    buttonText: 'Subscribe',
    joinText: 'Join 25,000+ passionate travelers'
  }
};

// 9. Master Footer Links
export const footerNavigation = {
  brandTagline: 'Vrinda Tours — Crafting unforgettable global journeys, bespoke luxury expeditions, and authentic travel memories since 2014.',
  columns: [
    {
      title: 'Destinations',
      links: [
        { label: 'Popular Tours', href: '#popular' },
        { label: 'Featured Expeditions', href: '#initiatives' },
        { label: 'Explore Packages', href: '#explore' },
        { label: 'Custom Itineraries', href: '#contact' }
      ]
    },
    {
      title: 'Experiences',
      links: [
        { label: 'Luxury Escapes', href: '#popular' },
        { label: 'Mountain Treks', href: '#initiatives' },
        { label: 'Cultural Trails', href: '#mission' },
        { label: 'Wildlife Safaris', href: '#explore' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Travel FAQs', href: '#contact' },
        { label: '24/7 Concierge', href: '#contact' },
        { label: 'Booking Terms', href: '#terms' },
        { label: 'Privacy Policy', href: '#privacy' }
      ]
    }
  ],
  socials: [
    { name: 'Twitter', icon: 'Twitter', href: '#twitter' },
    { name: 'Instagram', icon: 'Instagram', href: '#instagram' },
    { name: 'Facebook', icon: 'Facebook', href: '#facebook' },
    { name: 'Linkedin', icon: 'Linkedin', href: '#linkedin' }
  ],
  copyright: '© 2026 Vrinda Tours. All rights reserved.'
};



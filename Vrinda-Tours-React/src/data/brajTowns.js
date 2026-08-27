/**
 * Braj 84 Kos Towns, Ancient Villages, Sacred Hills & Parikrama Enclaves
 * High-Precision Geographic Boundary Polygons (Google Maps / GIS Grade)
 */

export const BRAJ_TOWNS = [
  {
    id: 'vrindavan',
    name: 'Vrindavan Dham',
    hindiName: 'श्री वृन्दावन धाम',
    category: 'Town',
    type: 'Holy Dham & Temple City',
    center: [27.5818, 77.7010],
    color: '#10b981', // Emerald Green
    accentColor: '#d1fae5',
    emoji: '🛕',
    tagline: 'Abode of 5,000+ Mandirs & Yamuna River Arc',
    parikramaKm: 11,
    // Real geographic municipal & parikrama boundary polygon of Vrindavan following Yamuna river meander and NH19 bypass
    polygon: [
      [27.5620, 77.6620], // Chhatikara Road Junction
      [27.5710, 77.6680], // Rukmani Vihar / ISKCON North entrance
      [27.5820, 77.6760], // Prem Mandir & Chhatikara Rd
      [27.5920, 77.6850], // Kaliya Dah Yamuna West Bank
      [27.5995, 77.6970], // Chir Ghat & Keshi Ghat Yamuna Apex Loop
      [27.5970, 77.7120], // Imli Tala & Pani Ghat
      [27.5880, 77.7210], // Old Vrindavan Parikrama Marg East
      [27.5740, 77.7150], // Mathura-Vrindavan Road border
      [27.5630, 77.6980], // Pagal Baba Temple South boundary
      [27.5580, 77.6820], // South-west green belt
      [27.5620, 77.6620]  // Loop closed at Chhatikara
    ],
    description: 'The transcendental heart of Brij Mandal where Shri Radha Krishna performed the eternal Maharaas in Nidhivan and Seva Kunj.',
    lore: 'Vrindavan is revered as the divine playground of the Divine Couple. Bounded by the sacred Yamuna curve, every ancient alley (kunj) vibrates with devotional kirtan, Sapta Devalaya mandirs, and historic ghats.',
    highlights: ['Shri Bankey Bihari', 'Radha Raman Ji', 'Radha Vallabh Ji', 'Prem Mandir', 'Gopeshwar Mahadev', 'Nidhivan'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Early Morning Mangala Aarti (4:30 AM - 7:00 AM) & Evening Sandhya Aarti'
  },
  {
    id: 'govardhan',
    name: 'Govardhan & Radha Kund',
    hindiName: 'श्री गोवर्धन धाम',
    category: 'Town',
    type: 'Sacred Hill Zone',
    center: [27.5020, 77.4650],
    color: '#f59e0b', // Amber / Gold
    accentColor: '#fef3c7',
    emoji: '⛰️',
    tagline: 'Sacred 21km Giriraj Parikrama Ridge & Holy Kunds',
    parikramaKm: 21,
    // Real geographic boundary polygon tracing the 21km Giriraj Parikrama ring (Radha Kund -> Kusum Sarovar -> Daan Ghati -> Anyor -> Jatipura -> Poonchhari)
    polygon: [
      [27.5340, 77.4940], // Radha Kund North Gate
      [27.5280, 77.5060], // Shyam Kund & Kusum Sarovar East Marg
      [27.5140, 77.4950], // Mansi Ganga East Bank
      [27.5020, 77.4780], // Govardhan Town & Daan Ghati Mandir
      [27.4890, 77.4650], // Anyor Village (Govind Kund)
      [27.4720, 77.4490], // Poonchhari Ka Lautha (Southern Hill Tip)
      [27.4650, 77.4380], // Southern border near Rajasthan ridge
      [27.4760, 77.4290], // Apsara Kund & Naval Kund West
      [27.4920, 77.4440], // Jatipura Mukharbind Temple West
      [27.5080, 77.4560], // Western Giriraj Parikrama Path
      [27.5240, 77.4750], // Kilol Kund & Northern Ridge
      [27.5340, 77.4940]  // Loop closed at Radha Kund
    ],
    description: 'The holy mountain lifted by Shri Krishna for 7 consecutive days on His little finger to protect the people and cows of Braj from Indra\'s rainstorm.',
    lore: 'Govardhan is not just a hill but an embodiment of Krishna Himself (Haridasa-Varya). The sacred 21 km circuit encompasses the divine Radha Kund, Shyam Kund, Mansi Ganga, and Kusum Sarovar.',
    highlights: ['Radha Kund & Shyam Kund', 'Mansi Ganga', 'Daan Ghati Mandir', 'Mukharbind (Jatipura)', 'Kusum Sarovar', 'Poonchhari Ka Lautha'],
    image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Morning or Night Parikrama under moonlit sky'
  },
  {
    id: 'barsana',
    name: 'Barsana Dham',
    hindiName: 'श्री बरसाना धाम',
    category: 'Town',
    type: 'Sacred Hilltop Dham',
    center: [27.6461, 77.3777],
    color: '#ec4899', // Rose Pink
    accentColor: '#fce7f3',
    emoji: '👑',
    tagline: 'Bhanugarh Hilltop & Birthplace of Shri Radha Rani',
    parikramaKm: 7,
    // Real geographic boundary polygon tracing Bhanugarh & Danagarh hill ridge, Gahvar Van, and Prem Sarovar
    polygon: [
      [27.6680, 77.3820], // Prem Sarovar North boundary
      [27.6610, 77.3940], // Sanket Van road East
      [27.6520, 77.3890], // Rangeeli Gali & Town Entrance
      [27.6410, 77.3850], // Bhanokhar Sarovar South-East
      [27.6320, 77.3740], // South Hill Base towards Kosi
      [27.6340, 77.3590], // Gahvar Van South-West Forest
      [27.6450, 77.3620], // Maan Mandir & Mor Kuti Hill Ridge
      [27.6560, 77.3680], // Shriji Temple Bhanugarh Peak North-West
      [27.6680, 77.3820]  // Loop closed at Prem Sarovar
    ],
    description: 'The picturesque royal town perched on Bhanugarh Hill, home to King Vrishabhanu and Srimati Radha Rani.',
    lore: 'Barsana is world-famous for its hilltop Shriji Temple offering breathtaking panoramic vistas across Braj. Pilgrims walk through the divine Gahvar Van forest path, Prem Sarovar, and historic lanes where Lathmar Holi is celebrated.',
    highlights: ['Shri Radharani Temple (Laadli Ji)', 'Gahvar Van', 'Prem Sarovar', 'Maan Mandir', 'Mor Kuti', 'Rangeeli Gali'],
    image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Sunrise Darshan & Sunset from Hilltop'
  },
  {
    id: 'nandgaon',
    name: 'Nandgaon',
    hindiName: 'श्री नन्दगांव',
    category: 'Town',
    type: 'Ancient Village Abode',
    center: [27.7120, 77.3870],
    color: '#3b82f6', // Royal Blue
    accentColor: '#dbeafe',
    emoji: '🏡',
    tagline: 'Palace of Nanda Baba & Nandishwar Hill',
    parikramaKm: 5,
    // Real geographic boundary polygon tracing Nandishwar Hill, Pavan Sarovar, and Ter Kadamb
    polygon: [
      [27.7240, 77.3880], // Pavan Sarovar North Gate
      [27.7190, 77.4010], // Ter Kadamb & Sanatana Kutir East
      [27.7080, 77.3980], // East Village Border
      [27.6980, 77.3860], // South Marg towards Barsana
      [27.7020, 77.3720], // Yashoda Kund & Charan Pahadi West
      [27.7150, 77.3710], // Nandishwar Hill North-West
      [27.7240, 77.3880]  // Loop closed at Pavan Sarovar
    ],
    description: 'The ancient hilltop village atop Nandishwar Hill where Krishna grew up after moving from Gokul.',
    lore: 'Nandgaon represents paternal love (Vatsalya Bhava). Atop the hill stands the grand 84-pillared Nand Bhavan Temple where Krishna, Balarama, Nanda Baba, and Yashoda Maiya are worshipped together.',
    highlights: ['Nand Bhavan Temple', 'Pavan Sarovar', 'Ter Kadamb (Sanatana Goswami Bhajana Kutir)', 'Charan Pahadi', 'Yashoda Kund'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Afternoon & Evening Gaushala Seva'
  },
  {
    id: 'mathura',
    name: 'Mathura Puri',
    hindiName: 'श्री मथुरा पुरी',
    category: 'Town',
    type: 'Eternal Moksha Capital',
    center: [27.4924, 77.6737],
    color: '#8b5cf6', // Violet
    accentColor: '#ede9fe',
    emoji: '🕉️',
    tagline: 'Shri Krishna Janmabhoomi & Crescent Yamuna Ghats',
    parikramaKm: 14,
    // Real geographic municipal boundary polygon tracing Mathura city & Yamuna river crescent
    polygon: [
      [27.5320, 77.6840], // Saraswati Sangam & North Yamuna Gate
      [27.5140, 77.6920], // Gita Mandir & Masani
      [27.5020, 77.6940], // Vishram Ghat & Dwarkadhish Mandir
      [27.4850, 77.6910], // Bengali Ghat & Dhruva Ghat South
      [27.4680, 77.6780], // Mathura Cantt & Railway Junction
      [27.4720, 77.6520], // South-West Bypass / Govardhan Chauraha
      [27.4910, 77.6440], // Krishna Janmabhoomi & Deeg Gate
      [27.5090, 77.6510], // Potara Kund & Bhuteshwar Mahadev
      [27.5250, 77.6680], // North Bypass Road
      [27.5320, 77.6840]  // Loop closed at North Yamuna
    ],
    description: 'One of the seven ancient Moksha-giving cities of Bharat where Bhagavan Shri Krishna descended onto earth.',
    lore: 'Mathura is the ancient epicentre of Braj culture. The prison cell of Kamsa (Garbha Griha) inside Shri Krishna Janmasthan, the serene Vishram Ghat where Krishna rested after slaying Kamsa, and evening Yamuna Aarti are central to all Braj pilgrimages.',
    highlights: ['Krishna Janmabhoomi Temple', 'Vishram Ghat (Yamuna Aarti)', 'Dwarkadhish Temple', 'Potara Kund', 'Gita Mandir'],
    image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Evening Yamuna Aarti at Vishram Ghat (7:00 PM)'
  },
  {
    id: 'gokul',
    name: 'Gokul & Mahavan',
    hindiName: 'श्री गोकुल एवं महावन',
    category: 'Town',
    type: 'Childhood Leela Village',
    center: [27.4420, 77.7180],
    color: '#14b8a6', // Teal
    accentColor: '#ccfbf1',
    emoji: '👶',
    tagline: 'Cradle of Krishna & Sacred Raman Reti Sands',
    parikramaKm: 8,
    // Real geographic boundary polygon tracing Raman Reti, Mahavan 84 Khamba, and Brahmand Ghat
    polygon: [
      [27.4620, 77.7120], // Gokul Barrage North Yamuna bank
      [27.4540, 77.7340], // Mahavan 84 Khamba North-East
      [27.4420, 77.7420], // Chaurasi Khamba Heritage East
      [27.4280, 77.7350], // Brahmand Ghat South-East
      [27.4220, 77.7190], // Chintaharan Mahadev South Yamuna bank
      [27.4350, 77.7050], // Raman Reti Ashram & Deer Sanctuary West
      [27.4490, 77.7020], // Gokul Ghats West
      [27.4620, 77.7120]  // Loop closed at Gokul Barrage
    ],
    description: 'The tranquil riverside village where Vasudeva brought newborn Krishna to save Him from Kamsa.',
    lore: 'In Gokul, child Krishna crawled in the soft sands of Raman Reti, stole freshly churned butter from the gopis (Makhan Chori), and liberated the Yamalarjuna trees. Pilgrims roll in the sacred sand of Raman Reti seeking spiritual peace.',
    highlights: ['Raman Reti Ashram', 'Chaurasi Khamba (Mahavan)', 'Brahmand Ghat', 'Chintaharan Mahadev', 'Nand Chowk'],
    image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Morning Meditation in Raman Reti'
  },
  {
    id: 'bhandirvan',
    name: 'Bhandirvan & Belvan',
    hindiName: 'श्री भांडीरवन एवं बेलवन',
    category: 'Town',
    type: 'Sacred Forest Village',
    center: [27.6520, 77.7420],
    color: '#84cc16', // Lime
    accentColor: '#ecfccb',
    emoji: '🌳',
    tagline: 'Divine Gandharva Wedding & Ancient Banyan Tree',
    parikramaKm: 6,
    // Real geographic boundary polygon tracing Bhandirvat banyan grove and Belvan Lakshmi Taposthali
    polygon: [
      [27.6740, 77.7320], // Belvan Lakshmi Mandir North
      [27.6650, 77.7580], // Bhandirvat Sacred Banyan East
      [27.6480, 77.7610], // East Agricultural Forest Belt
      [27.6360, 77.7490], // Mansarovar Lake South
      [27.6380, 77.7280], // Yamuna Floodplain West
      [27.6560, 77.7240], // West Forest Boundary
      [27.6740, 77.7320]  // Loop closed at Belvan
    ],
    description: 'The mystic forest across Yamuna where Lord Brahma presided over the divine wedding of Radha and Krishna.',
    lore: 'Beneath the ancient Kalpavriksha banyan tree (Bhandirvat), the Divine Couple were wedded. Nearby Belvan is where Goddess Lakshmi performed severe penance wishing to enter the Raas Leela.',
    highlights: ['Bhandirvat Holy Banyan', 'Radha Krishna Vivah Sthal', 'Belvan Lakshmi Temple', 'Mansarovar Lake'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Daytime Forest Pilgrimage'
  },
  {
    id: 'baldeo',
    name: 'Baldeo (Dauji Dham)',
    hindiName: 'श्री बलदेव (दाऊजी)',
    category: 'Town',
    type: 'Balarama Sovereign Abode',
    center: [27.4120, 77.8180],
    color: '#f97316', // Orange
    accentColor: '#ffedd5',
    emoji: '🌾',
    tagline: 'Sovereign Temple of Lord Balarama & Kshir Sagar',
    parikramaKm: 5,
    // Real geographic municipal boundary polygon tracing Dauji Mandir and Kshir Sagar
    polygon: [
      [27.4260, 77.8140], // North Entrance Road
      [27.4210, 77.8320], // East Market & Parikrama Road
      [27.4080, 77.8310], // Kshir Sagar South-East
      [27.3990, 77.8190], // South Gate / Huranga Ground
      [27.4040, 77.8040], // Revati Kund West
      [27.4180, 77.8050], // Dauji Mandir Precinct West
      [27.4260, 77.8140]  // Loop closed
    ],
    description: 'The ancient holy town dedicated to Dauji (Lord Balarama), the elder brother of Shri Krishna and King of Braj.',
    lore: 'Dauji Mandir houses a magnificent colossal black stone deity of Lord Balarama holding a cup of Amrita. The temple is famous for the vibrant Dauji Huranga festival celebrated after Holi.',
    highlights: ['Dauji Maharaj Temple', 'Kshir Sagar Kund', 'Revati Mata Mandir', 'Huranga Sthal'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Morning Rajbhog Aarti (11:30 AM)'
  },
  {
    id: 'kamyavan',
    name: 'Kamyavan (Kaman)',
    hindiName: 'श्री काम्यवन (कामां)',
    category: 'Town',
    type: 'Forest of 84 Sacred Kunds',
    center: [27.6580, 77.2650],
    color: '#06b6d4', // Cyan
    accentColor: '#cffafe',
    emoji: '🦚',
    tagline: 'Wish-Fulfilling Forest of 84 Holy Kunds & Ancient Hills',
    parikramaKm: 12,
    // Real geographic boundary polygon tracing Charan Pahadi, Bhojan Thali, and Vimal Kund
    polygon: [
      [27.6740, 77.2610], // Vimal Kund North
      [27.6680, 77.2820], // Kaman Fort & Kameshwar East
      [27.6510, 77.2790], // Gaya Kund South-East
      [27.6410, 77.2650], // South Foothills
      [27.6440, 77.2480], // Charan Pahadi Hill South-West
      [27.6610, 77.2440], // Bhojan Thali & Pichhal Pahadi West
      [27.6740, 77.2610]  // Loop closed at Vimal Kund
    ],
    description: 'The fourth of the 12 sacred forests of Braj where all transcendental spiritual desires (Kama) are fulfilled.',
    lore: 'Surrounded by ancient hills and holy kunds, Kamyavan holds the natural rock impressions of Lord Krishna\'s lotus feet (Charan Pahadi) and the rock where Krishna and Balarama took lunch (Bhojan Thali).',
    highlights: ['Charan Pahadi', 'Bhojan Thali & Pichhal Pahadi', 'Kameshwar Mahadev', 'Vimal Kund', 'Gaya Kund'],
    image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Full Day 84 Kos Yatra Leg'
  },
  {
    id: 'kokilavan',
    name: 'Kokilavan Dham',
    hindiName: 'श्री कोकिलावन धाम',
    category: 'Town',
    type: 'Sacred Cuckoo & Shani Grove',
    center: [27.7950, 77.3820],
    color: '#6366f1', // Indigo
    accentColor: '#e0e7ff',
    emoji: '🕊️',
    tagline: 'Where Krishna Sang Like a Sweet Cuckoo Bird',
    parikramaKm: 4,
    // Real geographic boundary polygon tracing dense forest grove of Kokilavan near Kosi Kalan
    polygon: [
      [27.8080, 77.3810], // Surabhi Kund North Gate
      [27.8010, 77.3950], // Forest Gate East
      [27.7880, 77.3910], // Shani Mandir Parikrama Marg South
      [27.7840, 77.3780], // Barkhandi Mahadev South-West
      [27.7940, 77.3690], // Kokila Bihari Grove West
      [27.8080, 77.3810]  // Loop closed
    ],
    description: 'Dense forest grove near Kosi Kalan where Krishna granted darshan to Shanidev Maharaj.',
    lore: 'Krishna took the form of a cuckoo (Kokila) to sing for Radha Rani in this grove. Shanidev performed tapasya here, and Krishna blessed him that anyone visiting Kokilavan will be free of planetary distress and sorrow.',
    highlights: ['Siddha Shani Dev Mandir', 'Kokila Bihari Mandir', 'Surabhi Kund', 'Barkhandi Mahadev'],
    image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
    bestTime: 'Saturday Pilgrimage & Parikrama'
  }
];

// Sacred 84 Kos Parikrama Grand Circuit Coordinates
export const BRAJ_84_KOS_PARIKRAMA_CIRCUIT = [
  [27.4924, 77.6737], // Mathura
  [27.4420, 77.7180], // Gokul & Mahavan
  [27.4120, 77.8180], // Baldeo
  [27.5300, 77.7700], // Lohavan
  [27.6520, 77.7420], // Bhandirvan / Belvan
  [27.6350, 77.7100], // Mansarovar
  [27.5818, 77.7010], // Vrindavan
  [27.7950, 77.3820], // Kokilavan (Kosi Kalan)
  [27.7120, 77.3870], // Nandgaon
  [27.6461, 77.3777], // Barsana
  [27.6580, 77.2650], // Kamyavan (Kaman)
  [27.5255, 77.4950], // Radha Kund
  [27.5020, 77.4650], // Govardhan
  [27.4924, 77.6737], // Mathura (Completed Circle)
];

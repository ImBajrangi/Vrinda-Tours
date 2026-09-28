/**
 * Comprehensive Database of Brij Mandal Areas, Neighborhoods, Towns, Ghats & Landmarks
 * Used for instant autocomplete, route navigation, and area discovery
 */

export const BRAJ_AREAS = [
  // Vrindavan Key Neighborhoods & Areas
  {
    name: "Raman Reti",
    hindiName: "रमण रेती",
    town: "Vrindavan",
    category: "Area",
    lat: 27.5714,
    lng: 77.6756,
    description: "Sacred sandy area where Lord Krishna played with cowherd boys; home to ISKCON and peaceful ashrams.",
    keywords: ["raman reti", "iskcon", "chhatikara road", "ashram"]
  },
  {
    name: "Chhatikara Road",
    hindiName: "छटीकरा रोड",
    town: "Vrindavan",
    category: "Highway / Entry",
    lat: 27.5756,
    lng: 77.6624,
    description: "Main 4-lane entrance corridor connecting NH-19 to Vrindavan, Prem Mandir, and Priya Kant Ju.",
    keywords: ["chhatikara", "nh19", "highway", "entry gate", "vaishno devi mandir"]
  },
  {
    name: "Loi Bazaar",
    hindiName: "लोई बाज़ार",
    town: "Vrindavan",
    category: "Market / Old Town",
    lat: 27.5815,
    lng: 77.7002,
    description: "Historic bustling heritage market famous for devotional clothes, Radha deity dresses, brassware, and sattvic peda.",
    keywords: ["loi bazaar", "market", "shopping", "old vrindavan", "clothes", "sweets"]
  },
  {
    name: "Keshi Ghat",
    hindiName: "केशी घाट",
    town: "Vrindavan",
    category: "Ghat",
    lat: 27.5862,
    lng: 77.7058,
    description: "Most famous Yamuna river ghat where Krishna defeated the Keshi demon; grand evening Yamuna Aarti.",
    keywords: ["keshi ghat", "yamuna", "aarti", "boat ride", "ghat"]
  },
  {
    name: "Vrindavan Parikrama Marg",
    hindiName: "वृंदावन परिक्रमा मार्ग",
    town: "Vrindavan",
    category: "Route / Area",
    lat: 27.5830,
    lng: 77.6910,
    description: "11 km sacred circular pilgrimage path encircling all holy temples and groves of Vrindavan.",
    keywords: ["parikrama marg", "parikrama", "round", "pilgrimage path"]
  },
  {
    name: "Sunrakh",
    hindiName: "सुनरख",
    town: "Vrindavan",
    category: "Village / Area",
    lat: 27.5921,
    lng: 77.6685,
    description: "Ancient village in Vrindavan associated with Sage Saubhari Muni's penance; emerging serene retreat area.",
    keywords: ["sunrakh", "village", "saubhari", "ashram"]
  },
  {
    name: "Pagal Baba Temple Area",
    hindiName: "पागल बाबा आश्रम मार्ग",
    town: "Vrindavan",
    category: "Area",
    lat: 27.5682,
    lng: 77.6845,
    description: "Prominent 9-storey white temple landmark on Mathura-Vrindavan Road with robotic puppet displays of epic leelas.",
    keywords: ["pagal baba", "mathura vrindavan road", "hospital"]
  },
  {
    name: "Gore Dauji & Retia Bazaar",
    hindiName: "गोरे दाऊजी व रेतिए बाजार",
    town: "Vrindavan",
    category: "Market",
    lat: 27.5835,
    lng: 77.7025,
    description: "Traditional core market area leading to Radha Raman Mandir and Seva Kunj.",
    keywords: ["retia bazaar", "gore dauji", "seva kunj"]
  },
  {
    name: "Vrindavan Railway Station",
    hindiName: "वृंदावन रेलवे स्टेशन",
    town: "Vrindavan",
    category: "Transit",
    lat: 27.5755,
    lng: 77.6948,
    description: "Historic heritage rail station connecting to Mathura Junction via rail-bus.",
    keywords: ["vrindavan station", "railway", "train", "transit"]
  },
  {
    name: "Vrindavan Bus Stand (Chhatikara Turn)",
    hindiName: "वृंदावन बस स्टैंड",
    town: "Vrindavan",
    category: "Transit",
    lat: 27.5710,
    lng: 77.6870,
    description: "Central bus terminal for inter-state buses from Delhi, Agra, Mathura, and Jaipur.",
    keywords: ["bus stand", "bus depot", "upsrtc"]
  },
  {
    name: "Vrindavan Chandrodaya Mandir Area",
    hindiName: "चंद्रोदय मंदिर क्षेत्र",
    town: "Vrindavan",
    category: "Area",
    lat: 27.5950,
    lng: 77.6580,
    description: "Modern developing spiritual township along the expressway connecting to Vrindavan.",
    keywords: ["chandrodaya", "iskcon skyscraper", "chhatikara"]
  },

  // Mathura Key Areas
  {
    name: "Krishna Janmabhoomi Complex",
    hindiName: "श्री कृष्ण जन्मभूमि",
    town: "Mathura",
    category: "Holy Site",
    lat: 27.5050,
    lng: 77.6820,
    description: "The supreme sacred birthplace of Bhagavan Shri Krishna with the ancient prison cell and Keshavdev temple.",
    keywords: ["janmabhoomi", "birthplace", "keshavdev", "potra kund", "mathura"]
  },
  {
    name: "Vishram Ghat",
    hindiName: "विश्राम घाट",
    town: "Mathura",
    category: "Ghat",
    lat: 27.5028,
    lng: 77.6912,
    description: "The primary holy ghat where Lord Krishna rested after eliminating Kamsa; central point of 24 Yamuna ghats.",
    keywords: ["vishram ghat", "mathura ghat", "yamuna aarti", "boat", "snan"]
  },
  {
    name: "Dwarkadhish Temple",
    hindiName: "श्री द्वारकाधीश मंदिर",
    town: "Mathura",
    category: "Temple",
    lat: 27.5035,
    lng: 77.6895,
    description: "Grand historic Vaishnava temple near Vishram Ghat known for Rajasthani architecture and Jhulan festival.",
    keywords: ["dwarkadhish", "mathura temple", "seth gokuldas"]
  },
  {
    name: "Mathura Junction Railway Station",
    hindiName: "मथुरा जंक्शन रेलवे स्टेशन",
    town: "Mathura",
    category: "Transit",
    lat: 27.4924,
    lng: 77.6737,
    description: "Major North-Central Railway junction connecting all major Indian metropolises.",
    keywords: ["mathura junction", "train station", "junction", "railway"]
  },
  {
    name: "Mathura Cantt",
    hindiName: "मथुरा कैंट",
    town: "Mathura",
    category: "Transit / Area",
    lat: 27.5085,
    lng: 77.7015,
    description: "Cantonment area and secondary station connecting towards Kasganj and Bareilly.",
    keywords: ["mathura cantt", "cantonment", "station"]
  },
  {
    name: "Dholi Pyau / Highway Plaza",
    hindiName: "धोली प्याऊ / हाईवे प्लाजा",
    town: "Mathura",
    category: "Area",
    lat: 27.4870,
    lng: 77.6650,
    description: "Commercial transit hub on Delhi-Agra National Highway with shopping malls and multi-cuisine dining.",
    keywords: ["dholi pyau", "highway plaza", "nh19"]
  },

  // Govardhan & Radha Kund Areas
  {
    name: "Govardhan Daan Ghati",
    hindiName: "गोवर्धन दान घाटी",
    town: "Govardhan",
    category: "Temple",
    lat: 27.4980,
    lng: 77.4650,
    description: "Famous temple marking the spot where Krishna demanded milk toll (Daan) from the Gopis.",
    keywords: ["daan ghati", "govardhan", "giriraj", "shila", "parikrama"]
  },
  {
    name: "Radha Kund Town",
    hindiName: "राधा कुंड कस्बा",
    town: "Radha Kund",
    category: "Town",
    lat: 27.5255,
    lng: 77.4950,
    description: "Sacred town revered as the transcendental eye of Govardhan; centers around Radha Kund & Shyam Kund.",
    keywords: ["radha kund", "shyam kund", "sangam", "raghunath das goswami"]
  },
  {
    name: "Jatipura Mukharbind",
    hindiName: "जतीपुरा मुखारविंद",
    town: "Govardhan",
    category: "Holy Site",
    lat: 27.4780,
    lng: 77.4480,
    description: "The divine mouth (Mukharbind) of Giriraj Ji where traditional milk abhishekam and Annakut are offered.",
    keywords: ["jatipura", "mukharbind", "abhishek", "vallabh kul"]
  },
  {
    name: "Mansi Ganga",
    hindiName: "मानसी गंगा",
    town: "Govardhan",
    category: "Holy Site",
    lat: 27.5020,
    lng: 77.4680,
    description: "Large sacred lake in Govardhan created by Krishna's mind; starting & closing point of Giriraj Parikrama.",
    keywords: ["mansi ganga", "kund", "snan", "mukharbind"]
  },
  {
    name: "Govardhan Bus Stand",
    hindiName: "गोवर्धन बस स्टैंड",
    town: "Govardhan",
    category: "Transit",
    lat: 27.5010,
    lng: 77.4720,
    description: "Main bus and e-rickshaw dispatch depot for pilgrims arriving for the 21 km Parikrama.",
    keywords: ["govardhan bus stand", "depot", "erickshaw stand"]
  },

  // Barsana & Nandgaon Areas
  {
    name: "Barsana Main Bus Stand",
    hindiName: "बरसाना बस स्टैंड",
    town: "Barsana",
    category: "Transit",
    lat: 27.6445,
    lng: 77.3735,
    description: "Main entrance junction to Barsana at the foot of Bhanugarh hill.",
    keywords: ["barsana bus stand", "barsana entry", "taxi stand"]
  },
  {
    name: "Bhanugarh Hill (Radha Rani Palace)",
    hindiName: "भानुगढ़ पहाड़ी",
    town: "Barsana",
    category: "Holy Site",
    lat: 27.6503,
    lng: 77.3733,
    description: "Sacred hilltop where Vrishbhanu Maharaj's royal palace stands, offering sweeping views of Braj.",
    keywords: ["bhanugarh", "radha rani temple", "palace", "hilltop"]
  },
  {
    name: "Maan Mandir & Mor Kuti",
    hindiName: "मान मंदिर व मोर कुटी",
    town: "Barsana",
    category: "Holy Site",
    lat: 27.6410,
    lng: 77.3620,
    description: "High hilltop retreat where Radha Rani displayed transcendental sweet loving anger (Maan) and Krishna danced as a peacock.",
    keywords: ["maan mandir", "mor kuti", "ramesh baba ashram", "sanket van"]
  },
  {
    name: "Nandgaon Nand Bhavan",
    hindiName: "नंदगांव नंद भवन",
    town: "Nandgaon",
    category: "Temple",
    lat: 27.7120,
    lng: 77.3850,
    description: "Nanda Maharaj's palace perched atop Nandishwar Hill where Krishna grew up as a toddler.",
    keywords: ["nandgaon", "nand bhavan", "nandishwar", "yashoda", "balaram"]
  },
  {
    name: "Pavana Sarovar",
    hindiName: "पावन सरोवर",
    town: "Nandgaon",
    category: "Holy Site",
    lat: 27.7180,
    lng: 77.3890,
    description: "Sacred lake where mother Yashoda bathed child Krishna; peaceful shaded ghats.",
    keywords: ["pavana sarovar", "kund", "nandgaon sarovar"]
  },

  // Gokul, Mahaban & Baldeo Areas
  {
    name: "Gokul Mahavan",
    hindiName: "गोकुल महावन",
    town: "Gokul",
    category: "Town / Holy Site",
    lat: 27.4420,
    lng: 77.7210,
    description: "Ancient town on eastern Yamuna bank where Lord Krishna was safely brought from Mathura prison by Vasudev Ji.",
    keywords: ["gokul", "mahavan", "chauraasi khamba", "brahmand ghat"]
  },
  {
    name: "Brahmand Ghat Gokul",
    hindiName: "ब्रह्मांड घाट",
    town: "Gokul",
    category: "Ghat",
    lat: 27.4390,
    lng: 77.7280,
    description: "Sacred spot on Yamuna bank where toddler Krishna ate mud and revealed the entire cosmic universe inside his mouth to mother Yashoda.",
    keywords: ["brahmand ghat", "gokul ghat", "mud leela"]
  },
  {
    name: "Raman Reti (Gokul)",
    hindiName: "रमण रेती (गोकुल)",
    town: "Gokul",
    category: "Holy Site",
    lat: 27.4350,
    lng: 77.7340,
    description: "Holy sand grounds where devotees roll in the soft sand where Krishna performed bal-leelas.",
    keywords: ["gokul raman reti", "karshni ashram", "deer park"]
  },
  {
    name: "Dauji Mandir (Baldeo)",
    hindiName: "श्री दाऊजी महाराज मंदिर (बलदेव)",
    town: "Baldeo",
    category: "Temple",
    lat: 27.4120,
    lng: 77.8180,
    description: "Supreme seat of Shri Balaram Ji Maharaj (elder brother of Krishna) and Revati Ji, famous for Huranga Holi.",
    keywords: ["dauji", "baldeo", "balaram", "kshir sagar", "huranga"]
  },

  // Expressways & Major Transit Arteries
  {
    name: "Yamuna Expressway Vrindavan Exit",
    hindiName: "यमुना एक्सप्रेसवे कट (वृंदावन)",
    town: "Vrindavan / Expressway",
    category: "Highway / Transit",
    lat: 27.6080,
    lng: 77.7650,
    description: "Major toll exit connecting Greater Noida/Delhi directly to Vrindavan and Raya Road.",
    keywords: ["yamuna expressway", "toll exit", "delhi agra expressway", "raya road"]
  },
  {
    name: "Kosi Kalan",
    hindiName: "कोसी कलां",
    town: "Kosi Kalan",
    category: "Town / Transit",
    lat: 27.7950,
    lng: 77.4320,
    description: "Northern gateway town of Mathura district on NH-19 and Delhi-Mumbai main line.",
    keywords: ["kosi kalan", "kokilavan", "shani dev mandir"]
  },
  {
    name: "Kokilavan Shani Dev Mandir",
    hindiName: "कोकिलावन सिद्ध शनि धाम",
    town: "Kosi Kalan",
    category: "Temple",
    lat: 27.8120,
    lng: 77.4080,
    description: "Miraculous Siddha Peeth where Lord Krishna appeared as a cuckoo (Koyal) to give darshan to Lord Shani Dev.",
    keywords: ["kokilavan", "shani dev", "parikrama", "kosi"]
  }
];

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export interface Scheme {
  id: string;
  name: {
    en: string;
    hi: string;
    te: string;
  };
  description: {
    en: string;
    hi: string;
    te: string;
  };
  eligibility: {
    en: string[];
    hi: string[];
    te: string[];
  };
  documents: {
    en: string[];
    hi: string[];
    te: string[];
  };
  benefits: {
    en: string[];
    hi: string[];
    te: string[];
  };
  category: "farmers" | "senior" | "students" | "women" | "all";
  applicationUrl: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clickCount: number;
}

interface SchemesContextType {
  schemes: Scheme[];
  filteredSchemes: Scheme[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  getScheme: (id: string) => Scheme | undefined;
  trackSchemeClick: (schemeId: string) => void;
  addScheme: (
    scheme: Omit<Scheme, "id" | "createdAt" | "updatedAt" | "clickCount">,
  ) => Promise<boolean>;
  updateScheme: (id: string, updates: Partial<Scheme>) => Promise<boolean>;
  deleteScheme: (id: string) => Promise<boolean>;
}

const SchemesContext = createContext<SchemesContextType | undefined>(undefined);

export const useSchemes = () => {
  const context = useContext(SchemesContext);
  if (!context) {
    throw new Error("useSchemes must be used within a SchemesProvider");
  }
  return context;
};

// Mock schemes data (fallback when Supabase is not configured)
const mockSchemes: Scheme[] = [
  {
    id: "rythu-bandhu",
    name: {
      en: "Rythu Bandhu",
      hi: "रयतु बंधु",
      te: "రైతు బంధు",
    },
    description: {
      en: "Financial assistance to farmers for procurement of inputs for cultivation per season",
      hi: "प्रति सीजन खेती के लिए इनपुट की खरीद के लिए किसानों को वित्तीय सहायता",
      te: "ప్రతి సీజన్‌కు సాగు కోసం ఇన్‌పుట్‌ల సేకరణ కోసం రైతులకు ఆర్థిక సహాయం",
    },
    eligibility: {
      en: [
        "Farmers with land ownership",
        "Tenant farmers with valid documents",
        "Age: 18-70 years",
      ],
      hi: [
        "भूमि स्वामित्व वाले किसान",
        "वैध दस्तावेजों के साथ काश्तकार किसान",
        "आयु: 18-70 वर्ष",
      ],
      te: [
        "భూమి యాజమాన్యం ఉన్న రైతులు",
        "చెల్లుబాటు అయ్యే ప���్రాలతో కౌలు రైతులు",
        "వయస్సు: 18-70 సంవత్సరాలు",
      ],
    },
    documents: {
      en: [
        "Aadhaar Card",
        "Land Records",
        "Bank Account Details",
        "Ration Card",
      ],
      hi: ["आधार कार्ड", "भूमि रिकॉर्ड", "बैंक खाता विवरण", "राशन कार्ड"],
      te: [
        "ఆధార్ కార్డ్",
        "భూమి రికార్డులు",
        "బ్యాంక్ ఖాతా వివరాలు",
        "రేషన్ కార్డ్",
      ],
    },
    benefits: {
      en: [
        "₹10,000 per acre per season",
        "Direct bank transfer",
        "No intermediaries",
      ],
      hi: [
        "₹10,000 प्रति एकड़ प्रति सीजन",
        "प्रत्यक्ष बैंक हस्तांतरण",
        "कोई बिचौलिए नहीं",
      ],
      te: [
        "సీజన్‌కు ఎకరానికి ₹10,000",
        "నేరుగా బ్యాంక్ బదిలీ",
        "మధ్యవర్తులు లేరు",
      ],
    },
    category: "farmers",
    applicationUrl: "https://webland.telangana.gov.in/webland/",
    department: "Agriculture Department",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    clickCount: 1250,
  },
  {
    id: "aasara-pension",
    name: {
      en: "Aasara Pension",
      hi: "आसरा पेंशन",
      te: "ఆసరా పెన్షన్",
    },
    description: {
      en: "Monthly pension for elderly, widows, and disabled persons",
      hi: "बुजुर्गों, विधवाओं और विकलांग व्यक्तियों के लिए मासिक पेंशन",
      te: "వృద్ధులు, వితంతువులు మరియు వికలాంగులకు నెలవారీ పెన్షన్",
    },
    eligibility: {
      en: [
        "Age: 65+ years",
        "Income: Below ₹2 lakh/year",
        "Widow/Disabled: Any age",
      ],
      hi: [
        "आयु: 65+ वर्ष",
        "आय: ₹2 लाख/वर्ष से कम",
        "विधवा/विकलांग: कोई भी आयु",
      ],
      te: [
        "వయస్సు: 65+ సంవత్సరాలు",
        "ఆదాయం: సంవత్సరానికి ₹2 లక్షల కంటే తక్కువ",
        "వితంతువు/వికలాంగుడు: ఏ వయస్సైనా",
      ],
    },
    documents: {
      en: [
        "Aadhaar Card",
        "Age Proof",
        "Income Certificate",
        "Bank Account Details",
      ],
      hi: ["आधार कार्ड", "आयु प्रमाण", "आय प्रमाण पत्र", "बैंक खाता विवरण"],
      te: [
        "ఆధార్ కార్డ్",
        "వయో ధృవీకరణ",
        "ఆదాయ ధృవీకరణ పత్రం",
        "బ్యాంక్ ఖాతా వివరాలు",
      ],
    },
    benefits: {
      en: ["₹2,016 per month", "Free healthcare", "Life insurance coverage"],
      hi: ["₹2,016 प्रति माह", "मुफ्त स्वास्थ्य सेवा", "जीवन बीमा कवरेज"],
      te: ["నెలకు ₹2,016", "ఉచిత ఆరోగ్య సేవ", "జీవిత బీమా కవరేజ్"],
    },
    category: "senior",
    applicationUrl: "https://webland.telangana.gov.in/webland/",
    department: "Social Welfare Department",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    clickCount: 890,
  },
  {
    id: "kalyana-lakshmi",
    name: {
      en: "Kalyana Lakshmi",
      hi: "कल्याण लक्ष्मी",
      te: "కల్యాణ లక్ష్మి",
    },
    description: {
      en: "Financial assistance for marriage of daughters from economically weaker sections",
      hi: "आर्थिक रूप से कमजोर वर्गों की बेटियों की शादी के लिए वित्तीय सहायता",
      te: "ఆర్థికంగా వెనుకబడిన వర్గాల కుమార్తెల వివాహానికి ఆర్థిక సహాయం",
    },
    eligibility: {
      en: [
        "Family income: Below ₹2 lakh/year",
        "Bride age: 18+ years",
        "First marriage",
      ],
      hi: [
        "पारिवारिक आय: ₹2 लाख/वर्ष से कम",
        "दुल्हन की आयु: 18+ वर्ष",
        "पहली शादी",
      ],
      te: [
        "కుటుంబ ఆదాయం: సంవత్సరానికి ₹2 లక్షల కంటే తక్కువ",
        "వధువు వయస్సు: 18+ సంవత్సరాలు",
        "మొదటి వివాహం",
      ],
    },
    documents: {
      en: [
        "Aadhaar Card",
        "Income Certificate",
        "Age Proof",
        "Marriage Invitation",
      ],
      hi: ["आधार कार्ड", "आय प्रमाण पत्र", "आयु प्रमाण", "विवाह निमंत्रण"],
      te: [
        "ఆధార్ కార్డ్",
        "ఆదాయ ధృవీకరణ పత్రం",
        "వయో ధృవీకరణ",
        "వివాహ ఆహ్వానం",
      ],
    },
    benefits: {
      en: [
        "₹1,16,816 financial assistance",
        "Gold worth ₹1 lakh",
        "Wedding saree",
      ],
      hi: ["₹1,16,816 वित्तीय सहायता", "₹1 लाख का सोना", "शादी की साड़ी"],
      te: ["₹1,16,816 ఆర్థిక సహాయం", "₹1 లక్ష విలువైన బంగారం", "పెళ్లి చీర"],
    },
    category: "women",
    applicationUrl: "https://webland.telangana.gov.in/webland/",
    department: "Women and Child Welfare",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    clickCount: 765,
  },
  {
    id: "mission-bhagiratha",
    name: {
      en: "Mission Bhagiratha",
      hi: "मिशन भगीरथ",
      te: "మిషన్ భగీరథ",
    },
    description: {
      en: "Providing safe drinking water to every household in rural and urban areas",
      hi: "ग्रामीण और शहरी क्षेत्रों में हर घर को सुरक्षित पेयजल प्रदान करना",
      te: "గ్రామీణ మరియు పట్టణ ప్రాంతాలలో ప్రతి ఇంటికి సురక్షితమైన తాగునీరు అందించడం",
    },
    eligibility: {
      en: ["All households", "Rural and urban areas", "No income criteria"],
      hi: ["सभी परिवार", "ग्रामीण और शहरी क्षेत्र", "कोई आय मानदंड नहीं"],
      te: [
        "అన్ని గృహాలు",
        "గ్రామీణ మరియు పట్టణ ప్రాంతాలు",
        "ఆదాయ ప్రమాణాలు లేవు",
      ],
    },
    documents: {
      en: [
        "Aadhaar Card",
        "Property Documents",
        "Water Connection Application",
      ],
      hi: ["आधार कार्ड", "संपत्ति दस्तावेज", "पानी कनेक्शन आवेदन"],
      te: ["ఆధార్ కార్డ్", "ఆస్తి పత్రాలు", "నీటి కనెక్షన్ దరఖాస్తు"],
    },
    benefits: {
      en: [
        "24x7 water supply",
        "Quality tested water",
        "Subsidized connections",
      ],
      hi: [
        "24x7 पानी की आपूर्ति",
        "गुणवत्ता परीक्षित पानी",
        "सब्सिडी वाले कनेक्शन",
      ],
      te: ["24x7 నీటి సరఫరా", "నాణ్యత పరీక్షించిన నీరు", "సబ్సిడీ కనెక్షన్లు"],
    },
    category: "all",
    applicationUrl: "https://webland.telangana.gov.in/webland/",
    department: "Panchayat Raj Department",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    clickCount: 1100,
  },
  {
    id: "ts-meeseva",
    name: {
      en: "TS MeeSeva",
      hi: "टीएस मीसेवा",
      te: "టీఎస్ మీసేవ",
    },
    description: {
      en: "One-stop solution for all government services and certificates",
      hi: "सभी सरकारी सेवाओं और प्रमाण पत्रों के लिए वन-स्टॉप समाधान",
      te: "అన్ని ప్రభుత్వ సేవలు మరియు ధృవీకరణ పత్రాలకు వన్-స్టాప్ సొల్యూషన్",
    },
    eligibility: {
      en: [
        "All citizens",
        "Valid ID proof required",
        "Service-specific criteria",
      ],
      hi: ["सभी नागरिक", "वैध पहचान प्रमाण आवश्यक", "सेवा-विशिष्ट मानदंड"],
      te: [
        "అన్ని పౌరులు",
        "చెల్లుబాటు అయ్యే గుర్తింపు రుజువు అవసర��",
        "సేవా-నిర్దిష్ట ప్రమాణాలు",
      ],
    },
    documents: {
      en: ["Aadhaar Card", "Service-specific documents", "Application fee"],
      hi: ["आधार कार्ड", "सेवा-विशिष्ट दस्तावेज", "आवेदन शुल्क"],
      te: ["ఆధార్ కార్డ్", "సేవా-నిర్దిష్ట పత్రాలు", "దరఖాస్తు రుసుము"],
    },
    benefits: {
      en: ["Online application", "Quick processing", "Home delivery option"],
      hi: ["ऑनलाइन आवेदन", "त्वरित प्रसंस्करण", "घर पर डिलीवरी विकल्प"],
      te: ["ఆన్‌లైన్ దరఖాస్తు", "త్వరిత ప్రాసెసింగ్", "ఇంటికి డెలివరీ ఎంపిక"],
    },
    category: "all",
    applicationUrl: "https://meeseva.telangana.gov.in/",
    department: "IT Department",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    clickCount: 2100,
  },
  {
    id: "vidya-deevena",
    name: {
      en: "Vidya Deevena",
      hi: "विद्या दीवेना",
      te: "విద్యా దీవెన",
    },
    description: {
      en: "Financial assistance for higher education for BC/SC/ST students",
      hi: "BC/SC/ST छात्रों के लिए उच्च शिक्षा के लिए वित्तीय सहायता",
      te: "BC/SC/ST విద్యార్థులకు ఉన్నత విద్య కోసం ఆర్థిక సహాయం",
    },
    eligibility: {
      en: [
        "BC/SC/ST category",
        "Family income: Below ₹2 lakh/year",
        "Merit-based selection",
      ],
      hi: [
        "BC/SC/ST श्रेणी",
        "पारिवारिक आय: ₹2 लाख/वर्ष से कम",
        "मेरिट-आधारित चयन",
      ],
      te: [
        "BC/SC/ST వర్గం",
        "కుటుంబ ఆదాయం: సంవత్సరానికి ₹2 లక్షల కంటే తక్కువ",
        "మెరిట్ ఆధారిత ఎంపిక",
      ],
    },
    documents: {
      en: [
        "Caste Certificate",
        "Income Certificate",
        "Academic Records",
        "Bank Details",
      ],
      hi: [
        "जाति प्रमाण पत्र",
        "आय प्रमाण पत्र",
        "शैक्षणिक रिकॉर्ड",
        "बैंक विवरण",
      ],
      te: [
        "కుల ధృవీకరణ పత్రం",
        "ఆదాయ ధృవీకరణ పత్రం",
        "విద్యా రికార్డులు",
        "బ్యాంక్ వివరాలు",
      ],
    },
    benefits: {
      en: [
        "Tuition fee reimbursement",
        "Maintenance allowance",
        "Book allowance",
      ],
      hi: ["ट्यूशन फीस प्रतिपूर्ति", "रखरखाव भत्ता", "पुस्तक भत्ता"],
      te: [
        "ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్",
        "మెయింటెనెన్స్ అలవెన్స్",
        "పుస్తక అలవెన్స్",
      ],
    },
    category: "students",
    applicationUrl: "https://telanganaepass.cgg.gov.in/",
    department: "BC Welfare Department",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    clickCount: 1850,
  },
];

export const SchemesProvider = ({ children }: { children: ReactNode }) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter schemes based on search and category
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesCategory =
      selectedCategory === "all" || scheme.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      scheme.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.name.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.name.te.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.te.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch && scheme.isActive;
  });

  // Load schemes from Supabase or use mock data
  useEffect(() => {
    const loadSchemes = async () => {
      try {
        if (supabase) {
          // Try to load from Supabase
          const { data, error } = await supabase
            .from("schemes")
            .select("*")
            .eq("isActive", true)
            .order("clickCount", { ascending: false });

          if (error) {
            console.error("Error loading schemes:", error);
            setSchemes(mockSchemes);
          } else {
            setSchemes(data || mockSchemes);
          }
        } else {
          // Use mock data
          setSchemes(mockSchemes);
        }
      } catch (error) {
        console.error("Error loading schemes:", error);
        setSchemes(mockSchemes);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchemes();
  }, []);

  const getScheme = (id: string): Scheme | undefined => {
    return schemes.find((scheme) => scheme.id === id);
  };

  const trackSchemeClick = async (schemeId: string) => {
    try {
      if (supabase) {
        await supabase
          .from("schemes")
          .update({
            clickCount: schemes.find((s) => s.id === schemeId)?.clickCount! + 1,
          })
          .eq("id", schemeId);
      }

      // Update local state
      setSchemes((prev) =>
        prev.map((scheme) =>
          scheme.id === schemeId
            ? { ...scheme, clickCount: scheme.clickCount + 1 }
            : scheme,
        ),
      );
    } catch (error) {
      console.error("Error tracking scheme click:", error);
    }
  };

  const addScheme = async (
    newScheme: Omit<Scheme, "id" | "createdAt" | "updatedAt" | "clickCount">,
  ): Promise<boolean> => {
    try {
      const scheme: Scheme = {
        ...newScheme,
        id: `scheme-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clickCount: 0,
      };

      if (supabase) {
        const { error } = await supabase.from("schemes").insert(scheme);
        if (error) {
          console.error("Error adding scheme:", error);
          return false;
        }
      }

      setSchemes((prev) => [...prev, scheme]);
      return true;
    } catch (error) {
      console.error("Error adding scheme:", error);
      return false;
    }
  };

  const updateScheme = async (
    id: string,
    updates: Partial<Scheme>,
  ): Promise<boolean> => {
    try {
      const updatedScheme = { ...updates, updatedAt: new Date().toISOString() };

      if (supabase) {
        const { error } = await supabase
          .from("schemes")
          .update(updatedScheme)
          .eq("id", id);

        if (error) {
          console.error("Error updating scheme:", error);
          return false;
        }
      }

      setSchemes((prev) =>
        prev.map((scheme) =>
          scheme.id === id ? { ...scheme, ...updatedScheme } : scheme,
        ),
      );
      return true;
    } catch (error) {
      console.error("Error updating scheme:", error);
      return false;
    }
  };

  const deleteScheme = async (id: string): Promise<boolean> => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from("schemes")
          .update({ isActive: false })
          .eq("id", id);

        if (error) {
          console.error("Error deleting scheme:", error);
          return false;
        }
      }

      setSchemes((prev) => prev.filter((scheme) => scheme.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting scheme:", error);
      return false;
    }
  };

  const value: SchemesContextType = {
    schemes,
    filteredSchemes,
    isLoading,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    getScheme,
    trackSchemeClick,
    addScheme,
    updateScheme,
    deleteScheme,
  };

  return (
    <SchemesContext.Provider value={value}>{children}</SchemesContext.Provider>
  );
};

-- Supabase Setup for TG Civic Schemes Module
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create schemes table
CREATE TABLE public.schemes (
    id TEXT PRIMARY KEY,
    name JSONB NOT NULL, -- {en: "", hi: "", te: ""}
    description JSONB NOT NULL, -- {en: "", hi: "", te: ""}
    eligibility JSONB NOT NULL, -- {en: [""], hi: [""], te: [""]}
    documents JSONB NOT NULL, -- {en: [""], hi: [""], te: [""]}
    benefits JSONB NOT NULL, -- {en: [""], hi: [""], te: [""]}
    category TEXT NOT NULL CHECK (category IN ('farmers', 'senior', 'students', 'women', 'all')),
    application_url TEXT NOT NULL,
    department TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security on schemes table
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- Create policies for schemes table

-- Everyone can view active schemes
CREATE POLICY "Anyone can view active schemes" ON public.schemes
    FOR SELECT USING (is_active = true);

-- Only admins can insert schemes
CREATE POLICY "Admins can insert schemes" ON public.schemes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update schemes
CREATE POLICY "Admins can update schemes" ON public.schemes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete schemes
CREATE POLICY "Admins can delete schemes" ON public.schemes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_schemes_updated
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample schemes
INSERT INTO public.schemes (id, name, description, eligibility, documents, benefits, category, application_url, department, click_count) VALUES
(
    'rythu-bandhu',
    '{"en": "Rythu Bandhu", "hi": "रयतु बंधु", "te": "రైతు బంధు"}',
    '{"en": "Financial assistance to farmers for procurement of inputs for cultivation per season", "hi": "प्रति सीजन खेती के लिए इनपुट की खरीद के लिए किसानों को वित्तीय सहायता", "te": "ప్రతి సీజన్‌కు సాగు కోసం ఇన్‌పుట్‌ల సేకరణ కోసం రైతులకు ఆర్థిక సహాయం"}',
    '{"en": ["Farmers with land ownership", "Tenant farmers with valid documents", "Age: 18-70 years"], "hi": ["भूमि स्वामित्व वाले किसान", "वैध दस्तावेजों के साथ काश्तकार किसान", "आयु: 18-70 वर्ष"], "te": ["భూమి యాజమాన్యం ఉన్న రైతులు", "చెల్లుబాటు అయ్యే పత్రాలతో కౌలు రైతులు", "వయస్సు: 18-70 సంవత్సరాలు"]}',
    '{"en": ["Aadhaar Card", "Land Records", "Bank Account Details", "Ration Card"], "hi": ["आधार कार्ड", "भूमि रिकॉर्ड", "बैंक खाता विवरण", "राशन कार्ड"], "te": ["ఆధార్ కార్డ్", "భూమి రికార్డులు", "బ్యాంక్ ఖాతా వివరాలు", "రేషన్ కార్డ్"]}',
    '{"en": ["₹10,000 per acre per season", "Direct bank transfer", "No intermediaries"], "hi": ["₹10,000 प्रति एकड़ प्रति सीजन", "प्रत्यक्ष बैंक हस्तांतरण", "कोई बिचौलिए नहीं"], "te": ["సీజన్‌���ు ఎకరానికి ₹10,000", "నేరుగా బ్యాంక్ బదిలీ", "మధ్యవర్తులు లేరు"]}',
    'farmers',
    'https://webland.telangana.gov.in/webland/',
    'Agriculture Department',
    1250
),
(
    'aasara-pension',
    '{"en": "Aasara Pension", "hi": "आसरा पेंशन", "te": "ఆసరా పెన్షన్"}',
    '{"en": "Monthly pension for elderly, widows, and disabled persons", "hi": "बुजुर्गों, विधवाओं और विकलांग व्यक्तियों के लिए मासिक पेंशन", "te": "వృద్ధులు, వితంతువులు మరియు వికలాంగులకు నెలవారీ పెన్షన్"}',
    '{"en": ["Age: 65+ years", "Income: Below ₹2 lakh/year", "Widow/Disabled: Any age"], "hi": ["आयु: 65+ वर्ष", "आय: ₹2 लाख/वर्ष से कम", "विधवा/विकलांग: कोई भी आयु"], "te": ["వయస్సు: 65+ సంవత్సరాలు", "ఆదాయం: సంవత్సరానికి ₹2 లక్షల కంటే తక్కువ", "వితంతువు/వికలాంగుడు: ఏ వయస్సైనా"]}',
    '{"en": ["Aadhaar Card", "Age Proof", "Income Certificate", "Bank Account Details"], "hi": ["आधार कार्ड", "आयु प्रमाण", "आय प्रमाण पत्र", "बैंक खाता विवरण"], "te": ["ఆధార్ కార్డ్", "వయో ధృవీకరణ", "ఆదాయ ధృవీకరణ పత్రం", "బ్యాంక్ ఖాతా వివరాలు"]}',
    '{"en": ["₹2,016 per month", "Free healthcare", "Life insurance coverage"], "hi": ["₹2,016 प्रति माह", "मुफ्त स्वास्थ्य सेवा", "जीवन बीमा कवरेज"], "te": ["నెలకు ₹2,016", "ఉచిత ఆరోగ్య సేవ", "జీవిత బీమా కవరేజ్"]}',
    'senior',
    'https://webland.telangana.gov.in/webland/',
    'Social Welfare Department',
    890
),
(
    'kalyana-lakshmi',
    '{"en": "Kalyana Lakshmi", "hi": "कल्याण लक्ष्मी", "te": "కల్యాణ లక్ష్మి"}',
    '{"en": "Financial assistance for marriage of daughters from economically weaker sections", "hi": "आर्थिक रूप से कमजोर वर्गों की बेटि��ों की शादी के लिए वित्तीय सहायता", "te": "ఆర్థికంగా వెనుకబడిన వర్గాల కుమార్తెల వివాహానికి ఆర్థిక సహాయం"}',
    '{"en": ["Family income: Below ₹2 lakh/year", "Bride age: 18+ years", "First marriage"], "hi": ["पारिवारिक आय: ₹2 लाख/वर्ष से कम", "दुल्हन की आयु: 18+ वर्ष", "पहली शादी"], "te": ["కుటుంబ ఆదాయం: సంవత్సరానికి ₹2 లక్షల కంటే తక్కువ", "వధువు వయస్సు: 18+ సంవత్సరాలు", "మొదటి వివాహం"]}',
    '{"en": ["Aadhaar Card", "Income Certificate", "Age Proof", "Marriage Invitation"], "hi": ["आधार कार्ड", "आय प्रमाण पत्र", "आयु प्रमाण", "विवाह निमंत्रण"], "te": ["ఆధార్ కార్డ్", "ఆదాయ ధృవీకరణ పత్రం", "వయో ధృవీకరణ", "వివాహ ఆహ్వానం"]}',
    '{"en": ["₹1,16,816 financial assistance", "Gold worth ₹1 lakh", "Wedding saree"], "hi": ["₹1,16,816 वित्तीय सहायता", "₹1 लाख का सोना", "शादी की साड़ी"], "te": ["₹1,16,816 ఆర్థిక సహాయం", "₹1 లక్ష విలువైన బంగారం", "పెళ్లి చీర"]}',
    'women',
    'https://webland.telangana.gov.in/webland/',
    'Women and Child Welfare',
    765
),
(
    'mission-bhagiratha',
    '{"en": "Mission Bhagiratha", "hi": "मिशन भगीरथ", "te": "మిషన్ భగీరథ"}',
    '{"en": "Providing safe drinking water to every household in rural and urban areas", "hi": "ग्रामीण और शहरी क्षेत्रों में हर घर को सुरक्षित पेयजल प्रदान करना", "te": "గ్రామీణ మరియు పట్టణ ప్రాంతాలలో ప్రతి ఇంటికి సురక్షితమైన తాగునీరు అందించడం"}',
    '{"en": ["All households", "Rural and urban areas", "No income criteria"], "hi": ["सभी परिवार", "ग्रामीण और शहरी क्षेत्र", "कोई आय मानदंड नहीं"], "te": ["అన్ని గృహాలు", "గ్రామీణ మరియు పట్టణ ప్రాంతాలు", "ఆదాయ ప్రమాణాలు లేవు"]}',
    '{"en": ["Aadhaar Card", "Property Documents", "Water Connection Application"], "hi": ["आधार कार्ड", "संपत्ति दस्तावेज", "पानी कनेक्शन आवेदन"], "te": ["ఆధార్ ��ార్డ్", "ఆస్తి పత్రాలు", "నీటి కనెక్షన్ దరఖాస్తు"]}',
    '{"en": ["24x7 water supply", "Quality tested water", "Subsidized connections"], "hi": ["24x7 पानी की आपूर्ति", "गुणवत्ता परीक्षित पानी", "सब्सिडी वाले कनेक्शन"], "te": ["24x7 నీటి సరఫరా", "నాణ్యత పరీక్షించిన నీరు", "సబ్సిడీ కనెక్షన్లు"]}',
    'all',
    'https://webland.telangana.gov.in/webland/',
    'Panchayat Raj Department',
    1100
),
(
    'ts-meeseva',
    '{"en": "TS MeeSeva", "hi": "टीएस मीसेवा", "te": "టీఎస్ మీసేవ"}',
    '{"en": "One-stop solution for all government services and certificates", "hi": "सभी सरकारी सेवाओं और प्रमाण पत्रों के लिए वन-स्टॉप समाधान", "te": "అన్ని ప్రభుత్వ సేవలు మరియు ధృవీకరణ పత్రాలకు వన్-స్టాప్ సొల్యూషన్"}',
    '{"en": ["All citizens", "Valid ID proof required", "Service-specific criteria"], "hi": ["सभी नागरिक", "वैध पहचान प्रमाण आवश्यक", "सेवा-विशिष्ट मानदंड"], "te": ["అన్ని పౌరులు", "చెల్లుబాటు అయ్యే గుర్తింపు రుజువు అవసరం", "సేవా-నిర్దిష్ట ప్రమాణాలు"]}',
    '{"en": ["Aadhaar Card", "Service-specific documents", "Application fee"], "hi": ["आधार कार्ड", "सेवा-विशिष्ट दस्तावेज", "आवेदन शुल्क"], "te": ["ఆధార్ కార్డ్", "సేవా-నిర్దిష్ట పత్రాలు", "దరఖాస్తు రుసుము"]}',
    '{"en": ["Online application", "Quick processing", "Home delivery option"], "hi": ["ऑनलाइन आवेदन", "त्वरित प्रसंस्करण", "घर पर डिलीवरी विकल्प"], "te": ["ఆన్‌లైన్ దరఖాస్తు", "త్వరిత ప్రాసెసింగ్", "ఇంటికి డెలివరీ ఎంపిక"]}',
    'all',
    'https://meeseva.telangana.gov.in/',
    'IT Department',
    2100
),
(
    'vidya-deevena',
    '{"en": "Vidya Deevena", "hi": "विद्या दीवेना", "te": "విద్యా దీవెన"}',
    '{"en": "Financial assistance for higher education for BC/SC/ST students", "hi": "BC/SC/ST छात्रों के लिए उच्च शिक्षा के लिए वित्तीय सहायता", "te": "BC/SC/ST విద్యార్థులకు ఉన్నత విద్య కోసం ఆర్థిక సహాయం"}',
    '{"en": ["BC/SC/ST category", "Family income: Below ₹2 lakh/year", "Merit-based selection"], "hi": ["BC/SC/ST श्रेणी", "पारिवारिक आय: ₹2 लाख/वर्ष से कम", "मेरिट-आधारित चयन"], "te": ["BC/SC/ST వర్గం", "కుటుంబ ఆదాయం: సంవత్సరానికి ₹2 లక్షల కంటే తక్కువ", "మెరిట్ ఆధారిత ఎంపిక"]}',
    '{"en": ["Caste Certificate", "Income Certificate", "Academic Records", "Bank Details"], "hi": ["जाति प्रमाण पत्र", "आय प्रमाण पत्र", "शैक्षणिक रिकॉर्ड", "बैंक विवरण"], "te": ["కుల ధృవీకరణ పత్రం", "ఆదాయ ధృవీకరణ పత్రం", "విద్యా రికార్డులు", "బ్యాంక్ వివరాలు"]}',
    '{"en": ["Tuition fee reimbursement", "Maintenance allowance", "Book allowance"], "hi": ["ट्यूशन फीस प्रतिपूर्ति", "रखरखाव भत्ता", "पुस्तक भत्ता"], "te": ["ట్యూషన్ ఫీజు రీయింబర్స్‌మెంట్", "మెయింటెనెన్స్ అలవెన్స్", "పుస్తక అలవెన్స్"]}',
    'students',
    'https://telanganaepass.cgg.gov.in/',
    'BC Welfare Department',
    1850
);

-- Create indexes for better performance
CREATE INDEX idx_schemes_category ON public.schemes(category);
CREATE INDEX idx_schemes_active ON public.schemes(is_active);
CREATE INDEX idx_schemes_click_count ON public.schemes(click_count DESC);
CREATE INDEX idx_schemes_created_at ON public.schemes(created_at DESC);

-- Create function to increment click count
CREATE OR REPLACE FUNCTION public.increment_scheme_clicks(scheme_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.schemes 
    SET click_count = click_count + 1 
    WHERE id = scheme_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.increment_scheme_clicks(TEXT) TO authenticated;

COMMENT ON TABLE public.schemes IS 'Government schemes with multilingual support';
COMMENT ON COLUMN public.schemes.name IS 'Scheme name in multiple languages';
COMMENT ON COLUMN public.schemes.description IS 'Scheme description in multiple languages';
COMMENT ON COLUMN public.schemes.eligibility IS 'Eligibility criteria in multiple languages';
COMMENT ON COLUMN public.schemes.documents IS 'Required documents in multiple languages';
COMMENT ON COLUMN public.schemes.benefits IS 'Scheme benefits in multiple languages';
COMMENT ON COLUMN public.schemes.click_count IS 'Number of times Apply Now was clicked';

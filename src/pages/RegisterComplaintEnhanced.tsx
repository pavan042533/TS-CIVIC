import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useComplaints } from "@/context/ComplaintContext";
import { useNotifications } from "@/context/NotificationContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  MapPin,
  Camera,
  Send,
  AlertCircle,
  CheckCircle,
  Building2,
  Droplets,
  Car,
  Trash2,
  Lightbulb,
  Shield,
  Upload,
  X,
  Smartphone,
  Mic,
  MicOff,
  Volume2,
  Navigation as NavigationIcon,
  Loader2,
  Copy,
  Brain,
  Sparkles,
  MapPinIcon,
  CheckCircle2,
} from "lucide-react";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";

const RegisterComplaintEnhanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { addComplaint } = useComplaints();
  const { addNotification } = useNotifications();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    title: "",
    description: "",
    location: "",
    landmark: "",
    priority: "medium" as "low" | "medium" | "high",
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    images: [] as File[],
    coordinates: { lat: 0, lng: 0 },
  });

  // Voice synthesis and recognition
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const {
    listen,
    stop,
    isListening: speechListening,
  } = useSpeechRecognition({
    onResult: (result: string) => {
      setFormData((prev) => ({
        ...prev,
        description: prev.description + " " + result,
      }));
      setIsListening(false);
      // Analyze the description for category suggestions
      analyzeDescription(formData.description + " " + result);
    },
    onError: (error: any) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    },
  });

  const categories = [
    {
      id: "roads",
      icon: <Car className="w-5 h-5" />,
      label: {
        en: "Roads & Transport",
        hi: "सड़कें और परिवहन",
        te: "రోడ్లు మరియు రవాణా",
      },
      subcategories: {
        en: ["Road Damage", "Potholes", "Traffic Signals", "Speed Breakers"],
        hi: ["सड़क की क्षति", "गड्ढे", "ट्रैफिक सिग्नल", "स्पीड ब्रेकर"],
        te: [
          "రోడ్డు దెబ్బతినడం",
          "గుంతలు",
          "ట్రాఫిక్ సిగ్నల్స్",
          "స్పీడ్ బ్రేకర్లు",
        ],
      },
      keywords: ["road", "traffic", "pothole", "signal", "transport"],
    },
    {
      id: "water",
      icon: <Droplets className="w-5 h-5" />,
      label: {
        en: "Water Supply",
        hi: "पानी की आपूर्ति",
        te: "నీటి సరఫరా",
      },
      subcategories: {
        en: [
          "Water Shortage",
          "Pipe Leakage",
          "Water Quality",
          "No Water Supply",
        ],
        hi: [
          "पानी की कमी",
          "पाइप लीकेज",
          "पानी की गुणवत्ता",
          "पानी की आपूर्ति नहीं",
        ],
        te: ["నీటి కొరత", "పైపు లీకేజ్", "నీటి నాణ్యత", "నీటి సరఫరా లేకపోవడం"],
      },
      keywords: ["water", "pipe", "leak", "supply", "quality"],
    },
    {
      id: "sanitation",
      icon: <Trash2 className="w-5 h-5" />,
      label: {
        en: "Sanitation",
        hi: "स्वच्छता",
        te: "పరిశుభ్రత",
      },
      subcategories: {
        en: ["Garbage Collection", "Drainage", "Sewage", "Waste Management"],
        hi: ["कचरा संग्रह", "जल निकासी", "सीवेज", "अपशिष्ट प्रबंधन"],
        te: [
          "చెత్త సేకరణ",
          "డ్రైనేజ్",
          "మురుగునీరు",
          "వ్యర్థ పదార్థాల నిర్వహణ",
        ],
      },
      keywords: ["garbage", "waste", "drainage", "sewage", "clean"],
    },
    {
      id: "electricity",
      icon: <Lightbulb className="w-5 h-5" />,
      label: {
        en: "Electricity",
        hi: "बिजली",
        te: "విద్యుత్",
      },
      subcategories: {
        en: ["Power Cut", "Line Fault", "Transformer Issue", "High Voltage"],
        hi: [
          "बिजली कटौती",
          "लाइन फॉल्ट",
          "ट्रांसफार्मर की समस्या",
          "हाई वोल्टेज",
        ],
        te: [
          "విద్యుత్ కోత",
          "లైన్ ఫాల్ట్",
          "ట్రాన్స్‌ఫార్మర్ సమస్య",
          "అధిక వోల్టేజ్",
        ],
      },
      keywords: ["electricity", "power", "transformer", "voltage", "line"],
    },
    {
      id: "streetlights",
      icon: <Lightbulb className="w-5 h-5" />,
      label: {
        en: "Street Lights",
        hi: "स्ट्रीट लाइट्स",
        te: "వీధి దీపాలు",
      },
      subcategories: {
        en: ["Light Not Working", "Pole Damage", "Installation Request"],
        hi: ["लाइट काम नहीं कर रही", "���ोल की क्षति", "स्थापना अनुरोध"],
        te: [
          "లైట్ పని చేయడం లేదు",
          "పోల్ దెబ్బతినడం",
          "ఇన్‌స్టాలేషన్ అభ్యర్థన",
        ],
      },
      keywords: ["street light", "lamp", "pole", "dark", "illumination"],
    },
    {
      id: "safety",
      icon: <Shield className="w-5 h-5" />,
      label: {
        en: "Public Safety",
        hi: "सार्वजनिक सुरक्षा",
        te: "ప్రజా భద్రత",
      },
      subcategories: {
        en: ["Illegal Parking", "Encroachment", "Anti-social Activities"],
        hi: ["अवैध पार्किंग", "अतिक्रमण", "असामाजिक गतिविधियां"],
        te: ["అక్రమ పార్కింగ్", "ఆక్రమణలు", "సమాజ వ్యతిరేక కార్యకలాపాలు"],
      },
      keywords: ["safety", "parking", "encroachment", "illegal", "security"],
    },
  ];

  // NLP-based category suggestion
  const analyzeDescription = (text: string) => {
    const lowerText = text.toLowerCase();
    const suggestedCategories = categories.filter((category) =>
      category.keywords.some((keyword) => lowerText.includes(keyword)),
    );

    if (suggestedCategories.length > 0 && !formData.category) {
      setSuggestions(suggestedCategories.map((cat) => cat.id));
    }
  };

  // Voice input for description
  const handleVoiceInput = () => {
    if (isListening) {
      stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      listen();
    }
  };

  // Get current location using GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`,
          );

          if (response.ok) {
            const data = await response.json();
            const address =
              data.results[0]?.formatted ||
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            setFormData((prev) => ({
              ...prev,
              location: address,
              coordinates: { lat: latitude, lng: longitude },
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              coordinates: { lat: latitude, lng: longitude },
            }));
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude },
          }));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Unable to get your location. Please enter manually.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  // Camera access for photos
  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Use rear camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, file].slice(0, 5),
        }));
      }
    };
    input.click();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5),
    }));
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Apply suggested category
  const applySuggestion = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, category: categoryId, subcategory: "" }));
    setSuggestions([]);
  };

  // Convert files to base64
  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert images to base64
      const imageBase64 = await convertFilesToBase64(formData.images);

      // Submit complaint with enhanced data
      const id = addComplaint({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        location: formData.location,
        landmark: formData.landmark,
        priority: formData.priority,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        images: imageBase64,
        coordinates: formData.coordinates,
        userId: user?.id,
      });

      // Enhanced notifications with real-time updates
      addNotification({
        type: "complaint_submitted",
        title: "🚨 New Enhanced Complaint",
        message: `${formData.category.toUpperCase()} complaint with GPS location: "${formData.title}" by ${formData.name}. Priority: ${formData.priority.toUpperCase()}`,
        complaintId: id,
        userId: "all-admins",
        userRole: "admin",
        priority: formData.priority === "high" ? "high" : "medium",
        actionUrl: "/dashboard",
        metadata: {
          coordinates: formData.coordinates,
          hasImages: formData.images.length > 0,
          voiceInput: isListening,
        },
      });

      setComplaintId(id);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting complaint:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyComplaintId = () => {
    navigator.clipboard.writeText(complaintId);
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    navigate("/track-complaint");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("register_complaint", "Register Complaint")}
          </h1>
          <p className="text-lg text-gray-600">
            {t(
              "enhanced_complaint_desc",
              "Enhanced with voice input, GPS location, and smart suggestions",
            )}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">
              🎤 {t("voice_enabled", "Voice Enabled")}
            </Badge>
            <Badge variant="secondary">
              📍 {t("gps_enabled", "GPS Enabled")}
            </Badge>
            <Badge variant="secondary">
              🧠 {t("ai_powered", "AI Powered")}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Suggestions Alert */}
          {suggestions.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {t(
                      "ai_suggestions",
                      "AI detected possible categories based on your description",
                    )}
                    :
                  </span>
                  <div className="flex gap-2 ml-4">
                    {suggestions.map((categoryId) => {
                      const category = categories.find(
                        (c) => c.id === categoryId,
                      );
                      return (
                        <Button
                          key={categoryId}
                          variant="outline"
                          size="sm"
                          onClick={() => applySuggestion(categoryId)}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {category?.label[language]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("issue_category", "Issue Category")}
              </CardTitle>
              <CardDescription>
                {t(
                  "choose_category",
                  "Choose the category related to your issue",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.category === category.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: category.id,
                        subcategory: "",
                      }))
                    }
                  >
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <span className="font-medium">
                        {category.label[language]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {formData.category && (
                <div className="mt-4">
                  <Label htmlFor="subcategory">
                    {t("subcategory", "Subcategory")}
                  </Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, subcategory: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "select_subcategory",
                          "Select subcategory",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .find((cat) => cat.id === formData.category)
                        ?.subcategories[language]?.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issue Details with Voice Input */}
          <Card>
            <CardHeader>
              <CardTitle>{t("issue_details", "Issue Details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  {t("issue_title", "Issue Title")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t("brief_title", "Write a brief title")}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">
                    {t("description", "Description")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={isListening ? "destructive" : "outline"}
                          size="sm"
                          onClick={handleVoiceInput}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-4 w-4 mr-1" />
                              {t("stop", "Stop")}
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-1" />
                              {t("speak", "Speak")}
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "voice_input_description",
                            "Use voice input to describe your issue",
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                    analyzeDescription(e.target.value);
                  }}
                  placeholder={t(
                    "describe_issue",
                    "Describe the issue in detail or use voice input",
                  )}
                  rows={4}
                  required
                  className={isListening ? "border-red-300 bg-red-50" : ""}
                />
                {isListening && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {t("listening", "Listening... Speak clearly")}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="priority">{t("priority", "Priority")}</Label>
                <RadioGroup
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label
                      htmlFor="low"
                      className="flex items-center space-x-1"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>{t("low", "Low")}</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label
                      htmlFor="medium"
                      className="flex items-center space-x-1"
                    >
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>{t("medium", "Medium")}</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label
                      htmlFor="high"
                      className="flex items-center space-x-1"
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>{t("high", "High")}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Location with GPS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t("location", "Location")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder={t(
                    "address_placeholder",
                    "Address or GPS coordinates",
                  )}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <NavigationIcon className="w-4 h-4 mr-2" />
                  )}
                  {t("my_location", "My Location")}
                </Button>
              </div>

              {locationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}

              {formData.coordinates.lat !== 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <MapPinIcon className="h-4 w-4" />
                  <AlertDescription>
                    {t("gps_coordinates", "GPS Coordinates")}:{" "}
                    {formData.coordinates.lat.toFixed(6)},{" "}
                    {formData.coordinates.lng.toFixed(6)}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="landmark">
                  {t("nearby_landmark", "Nearby Landmark")}
                </Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      landmark: e.target.value,
                    }))
                  }
                  placeholder={t(
                    "landmark_placeholder",
                    "Nearby shop, park or famous place",
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Photos with Camera Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {t("photos", "Photos")}
              </CardTitle>
              <CardDescription>
                {t(
                  "photos_description",
                  "Upload photos or take pictures (max 5)",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">
                        {t("upload_photos", "Click to select photos")}
                      </p>
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="h-32 px-6"
                  >
                    <div className="flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-sm">
                        {t("take_photo", "Take Photo")}
                      </span>
                    </div>
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                {t("contact_details", "Contact Details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {t("full_name", "Full Name")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    {t("phone_number", "Phone Number")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">
                  {t("email_address", "Email Address")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>
                    {t(
                      "auto_generated_id",
                      "Complaint ID will be auto-generated",
                    )}
                  </span>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("submitting", "Submitting...")}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t("submit_complaint", "Submit Complaint")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              {t("complaint_registered", "Complaint Registered Successfully!")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "complaint_registered_desc",
                "Your enhanced complaint has been registered with GPS location and priority.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <Label className="text-sm font-medium text-gray-700">
                {t("complaint_id", "Your Complaint ID")}
              </Label>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-lg font-bold text-blue-600">
                  {complaintId}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyComplaintId}
                  className="ml-2"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {t("copy", "Copy")}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800">
                    {t("enhanced_features", "Enhanced Features Used")}
                  </h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    {formData.coordinates.lat !== 0 && (
                      <li>• {t("gps_location_saved", "GPS location saved")}</li>
                    )}
                    {formData.images.length > 0 && (
                      <li>
                        • {formData.images.length}{" "}
                        {t("photos_attached", "photos attached")}
                      </li>
                    )}
                    {isListening && (
                      <li>• {t("voice_input_used", "Voice input used")}</li>
                    )}
                    <li>
                      •{" "}
                      {t(
                        "real_time_updates",
                        "Real-time status updates enabled",
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => navigate("/track-complaint")}
                className="flex-1"
              >
                {t("track_complaint", "Track Complaint")}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                {t("go_home", "Go Home")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterComplaintEnhanced;

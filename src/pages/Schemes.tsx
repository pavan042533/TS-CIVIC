import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSchemes } from "@/context/SchemesContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  ExternalLink,
  Users,
  UserCheck,
  GraduationCap,
  Heart,
  Building2,
  Mic,
  MicOff,
  Volume2,
  FileText,
  Gift,
  CheckCircle,
  Eye,
  Share2,
  Download,
  MapPin,
  TrendingUp,
  Star,
  Clock,
} from "lucide-react";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";

const Schemes = () => {
  const { language, t } = useLanguage();
  const {
    filteredSchemes,
    isLoading,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    trackSchemeClick,
  } = useSchemes();

  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  // Voice synthesis and recognition
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const {
    listen,
    stop,
    isListening: speechListening,
  } = useSpeechRecognition({
    onResult: (result: string) => {
      setSearchQuery(result);
      setIsListening(false);
    },
    onError: (error: any) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    },
  });

  const categories = [
    { id: "all", label: t("all"), icon: Building2 },
    { id: "farmers", label: t("farmers"), icon: Users },
    { id: "senior", label: t("senior_citizens"), icon: UserCheck },
    { id: "students", label: t("students"), icon: GraduationCap },
    { id: "women", label: t("women"), icon: Heart },
  ];

  const handleVoiceSearch = () => {
    if (isListening) {
      stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      listen();
    }
  };

  const handleSchemeClick = (scheme: any) => {
    trackSchemeClick(scheme.id);
    setSelectedScheme(scheme);
  };

  const handleApplyNow = (scheme: any) => {
    trackSchemeClick(scheme.id);
    window.open(scheme.applicationUrl, "_blank");
  };

  const speakSchemeInfo = (scheme: any) => {
    const text = `${scheme.name[language]}. ${scheme.description[language]}. 
                  Benefits include: ${scheme.benefits[language].join(", ")}. 
                  Required documents: ${scheme.documents[language].join(", ")}.`;
    speak({ text, voice: getVoiceForLanguage(language) });
  };

  const getVoiceForLanguage = (lang: string) => {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find((voice) =>
        lang === "te"
          ? voice.lang.includes("te")
          : lang === "hi"
            ? voice.lang.includes("hi")
            : voice.lang.includes("en"),
      ) || voices[0]
    );
  };

  const shareScheme = async (scheme: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scheme.name[language],
          text: scheme.description[language],
          url: scheme.applicationUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `${scheme.name[language]}\n${scheme.description[language]}\nApply: ${scheme.applicationUrl}`,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t("government_schemes", "Government Schemes")}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {t(
                "schemes_description",
                "Discover welfare programs and benefits available for Telangana citizens. Apply directly to official portals.",
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t("search_schemes", "Search schemes...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-16"
              />
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                className="absolute right-2 top-1.5"
                onClick={handleVoiceSearch}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full lg:w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue
                  placeholder={t("select_category", "Select Category")}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t("showing_schemes", "Showing")} {filteredSchemes.length}{" "}
            {t("schemes", "schemes")}
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleSchemeClick(scheme)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {scheme.name[language]}
                    </CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {scheme.category === "farmers" && t("farmers")}
                      {scheme.category === "senior" && t("senior_citizens")}
                      {scheme.category === "students" && t("students")}
                      {scheme.category === "women" && t("women")}
                      {scheme.category === "all" && t("all_citizens")}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakSchemeInfo(scheme);
                      }}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareScheme(scheme);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {scheme.description[language]}
                </p>

                <div className="space-y-3 mb-4">
                  {/* Key Benefits */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      {t("key_benefits", "Key Benefits")}
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {scheme.benefits[language]
                        .slice(0, 2)
                        .map((benefit: string, index: number) => (
                          <li key={index} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      {scheme.benefits[language].length > 2 && (
                        <li className="text-blue-600 text-xs">
                          +{scheme.benefits[language].length - 2}{" "}
                          {t("more", "more")}
                        </li>
                      )}
                    </ul>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {scheme.clickCount} {t("views", "views")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {scheme.department}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyNow(scheme);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("apply_now", "Apply Now")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("no_schemes_found", "No schemes found")}
            </h3>
            <p className="text-gray-600">
              {t(
                "try_different_search",
                "Try adjusting your search or filter criteria",
              )}
            </p>
          </div>
        )}
      </div>

      {/* Scheme Detail Modal */}
      <Dialog
        open={!!selectedScheme}
        onOpenChange={() => setSelectedScheme(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedScheme && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">
                      {selectedScheme.name[language]}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedScheme.description[language]}
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {selectedScheme.department}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Eligibility */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    {t("eligibility", "Eligibility")}
                  </h3>
                  <ul className="space-y-2">
                    {selectedScheme.eligibility[language].map(
                      (item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Required Documents */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t("required_documents", "Required Documents")}
                  </h3>
                  <ul className="space-y-2">
                    {selectedScheme.documents[language].map(
                      (doc: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{doc}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-600" />
                    {t("benefits", "Benefits")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedScheme.benefits[language].map(
                      (benefit: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-green-50 rounded-lg"
                        >
                          <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                <Button
                  className="flex-1 min-w-48"
                  onClick={() => handleApplyNow(selectedScheme)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("apply_now", "Apply Now")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => speakSchemeInfo(selectedScheme)}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {t("listen", "Listen")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareScheme(selectedScheme)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t("share", "Share")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schemes;

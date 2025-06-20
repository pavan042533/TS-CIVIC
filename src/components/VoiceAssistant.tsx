import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSchemes } from "@/context/SchemesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  Bot,
  User,
  ExternalLink,
  Search,
  Send,
} from "lucide-react";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  schemes?: any[];
  audioUrl?: string;
}

interface VoiceAssistantProps {
  trigger?: React.ReactNode;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ trigger }) => {
  const { language, t } = useLanguage();
  const { schemes, getScheme } = useSchemes();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { speak, cancel, speaking } = useSpeechSynthesis({
    onEnd: () => setIsSpeaking(false),
  });

  const {
    listen,
    stop,
    isListening: speechListening,
  } = useSpeechRecognition({
    onResult: (result: string) => {
      setCurrentQuery(result);
      handleVoiceQuery(result);
      setIsListening(false);
    },
    onError: (error: any) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    },
  });

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when assistant opens
      const welcomeMessage: Message = {
        id: "welcome",
        text: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      speakMessage(welcomeMessage.text);
    }
  }, [isOpen, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getWelcomeMessage = () => {
    return t(
      "voice_assistant_welcome",
      "Hello! I'm your Telugu voice assistant for government schemes. You can ask me about Rythu Bandhu, Kalyana Lakshmi, Aasara Pension, or any other schemes. How can I help you today?",
    );
  };

  const getVoiceForLanguage = (lang: string) => {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find((voice) =>
        lang === "te"
          ? voice.lang.includes("te") || voice.name.includes("Telugu")
          : lang === "hi"
            ? voice.lang.includes("hi") || voice.name.includes("Hindi")
            : voice.lang.includes("en"),
      ) || voices[0]
    );
  };

  const speakMessage = (text: string) => {
    if (isSpeaking) {
      cancel();
    }
    setIsSpeaking(true);
    speak({
      text,
      voice: getVoiceForLanguage(language),
      rate: 0.9,
      pitch: 1,
    });
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stop();
      setIsListening(false);
    } else {
      cancel(); // Stop any current speech
      setIsListening(true);
      listen();
    }
  };

  const handleVoiceQuery = (query: string) => {
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Process query and generate response
    setTimeout(() => {
      const response = processQuery(query);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        schemes: response.schemes,
      };

      setMessages((prev) => [...prev, botMessage]);
      speakMessage(response.text);
    }, 500);
  };

  const processQuery = (query: string): { text: string; schemes?: any[] } => {
    const lowerQuery = query.toLowerCase();

    // Check for specific scheme names
    const schemeKeywords = {
      "rythu bandhu": ["rythu", "bandhu", "farmer", "agriculture"],
      "kalyana lakshmi": ["kalyana", "lakshmi", "marriage", "wedding"],
      "aasara pension": ["aasara", "pension", "elderly", "senior"],
      "mission bhagiratha": ["mission", "bhagiratha", "water", "drinking"],
      "vidya deevena": ["vidya", "deevena", "education", "student"],
      meeseva: ["meeseva", "certificate", "service"],
    };

    // Find matching schemes
    const matchingSchemes = schemes.filter((scheme) => {
      const schemeName = scheme.name[language].toLowerCase();
      const schemeDesc = scheme.description[language].toLowerCase();

      return (
        schemeName.includes(lowerQuery) ||
        schemeDesc.includes(lowerQuery) ||
        Object.entries(schemeKeywords).some(([key, keywords]) =>
          keywords.some(
            (keyword) =>
              lowerQuery.includes(keyword) && schemeName.includes(key),
          ),
        )
      );
    });

    if (matchingSchemes.length > 0) {
      const scheme = matchingSchemes[0];
      return {
        text: generateSchemeResponse(scheme),
        schemes: matchingSchemes.slice(0, 3),
      };
    }

    // Category-based queries
    if (
      lowerQuery.includes("farmer") ||
      lowerQuery.includes("agriculture") ||
      lowerQuery.includes("crop")
    ) {
      const farmerSchemes = schemes.filter((s) => s.category === "farmers");
      return {
        text: t(
          "farmer_schemes_response",
          "I found several schemes for farmers including Rythu Bandhu which provides ₹10,000 per acre per season. Here are the available farmer schemes:",
        ),
        schemes: farmerSchemes,
      };
    }

    if (
      lowerQuery.includes("pension") ||
      lowerQuery.includes("elderly") ||
      lowerQuery.includes("senior")
    ) {
      const seniorSchemes = schemes.filter((s) => s.category === "senior");
      return {
        text: t(
          "senior_schemes_response",
          "For senior citizens, we have Aasara Pension providing ₹2,016 per month. Here are the pension schemes:",
        ),
        schemes: seniorSchemes,
      };
    }

    if (
      lowerQuery.includes("marriage") ||
      lowerQuery.includes("wedding") ||
      lowerQuery.includes("women")
    ) {
      const womenSchemes = schemes.filter((s) => s.category === "women");
      return {
        text: t(
          "women_schemes_response",
          "For women, Kalyana Lakshmi provides ₹1,16,816 for marriage assistance. Here are the schemes for women:",
        ),
        schemes: womenSchemes,
      };
    }

    if (
      lowerQuery.includes("student") ||
      lowerQuery.includes("education") ||
      lowerQuery.includes("study")
    ) {
      const studentSchemes = schemes.filter((s) => s.category === "students");
      return {
        text: t(
          "student_schemes_response",
          "For students, Vidya Deevena provides fee reimbursement for higher education. Here are the education schemes:",
        ),
        schemes: studentSchemes,
      };
    }

    // Application process queries
    if (
      lowerQuery.includes("apply") ||
      lowerQuery.includes("how to") ||
      lowerQuery.includes("process")
    ) {
      return {
        text: t(
          "application_process_response",
          "To apply for any scheme: 1) Visit the official portal, 2) Fill the application form, 3) Upload required documents, 4) Submit and note your application number. Most schemes are processed through MeeSeva centers or online portals.",
        ),
      };
    }

    // Documents queries
    if (lowerQuery.includes("document") || lowerQuery.includes("papers")) {
      return {
        text: t(
          "documents_response",
          "Common documents needed for most schemes include: Aadhaar Card, Income Certificate, Caste Certificate (if applicable), Bank Account Details, and Ration Card. Specific schemes may require additional documents.",
        ),
      };
    }

    // General help
    return {
      text: t(
        "general_help_response",
        "I can help you with information about government schemes like Rythu Bandhu, Kalyana Lakshmi, Aasara Pension, and others. You can ask about eligibility, benefits, required documents, or application process. What specific scheme would you like to know about?",
      ),
    };
  };

  const generateSchemeResponse = (scheme: any): string => {
    return t(
      "scheme_details_response",
      `${scheme.name[language]} - ${scheme.description[language]}. Benefits include: ${scheme.benefits[language].slice(0, 2).join(", ")}. Required documents: ${scheme.documents[language].slice(0, 3).join(", ")}. You can apply through the official portal.`,
    );
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentQuery("");
    cancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg border-2 border-blue-500 hover:bg-blue-50 z-50"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            {t("voice_assistant", "Voice Assistant")}
            <Badge variant="secondary" className="ml-2">
              {language.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {t(
              "voice_assistant_description",
              "Ask about government schemes in Telugu, Hindi, or English",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col max-h-[60vh]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6 pt-2">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.isBot ? (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.text}</p>
                        {message.schemes && message.schemes.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.schemes.map((scheme) => (
                              <Card
                                key={scheme.id}
                                className="border-gray-200 bg-white"
                              >
                                <CardContent className="p-3">
                                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                                    {scheme.name[language]}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-2">
                                    {scheme.description[language].substring(
                                      0,
                                      100,
                                    )}
                                    ...
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() =>
                                      window.open(
                                        scheme.applicationUrl,
                                        "_blank",
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {t("apply_now", "Apply Now")}
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Controls */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={handleVoiceInput}
                className="flex-1"
                disabled={isSpeaking}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    {t("stop_listening", "Stop Listening")}
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    {t("start_speaking", "Start Speaking")}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  speakMessage(messages[messages.length - 1]?.text || "")
                }
                disabled={!messages.length || isListening}
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {currentQuery && (
              <div className="text-sm text-gray-600 mb-2">
                {t("you_said", "You said")}: "{currentQuery}"
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              {isListening && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {t("listening", "Listening...")}
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  {t("speaking", "Speaking...")}
                </div>
              )}
              {t(
                "voice_assistant_tip",
                "Try asking: 'Tell me about Rythu Bandhu' or 'What schemes are for farmers?'",
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistant;

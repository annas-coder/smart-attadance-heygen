import { useState, useRef, useEffect } from "react";
import { Send, Volume2 } from "lucide-react";
import { motion } from "motion/react";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
};

const initialMessage: Message = {
  id: 0,
  text: "Hello! I'm Ava, your virtual assistant. I can help with event schedules, hall locations, WiFi, parking, dining, and more. How can I assist you today?",
  sender: "bot",
  timestamp: new Date(),
};

export function GenericAvatar() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Simulate bot response
    setIsSpeaking(true);
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage: Message = {
        id: messages.length + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsSpeaking(false);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lower = input.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) {
      return "The WiFi network is 'FutureFin-Guest' and the password is 'Finance2026'. You can connect from anywhere in the venue.";
    } else if (lower.includes("parking")) {
      return "Parking is available in the basement levels B1 and B2. VIP parking is on level B1, and general parking is on B2. All parking is complimentary for registered attendees.";
    } else if (lower.includes("coffee") || lower.includes("food") || lower.includes("dining")) {
      return "There are multiple dining options: The Grand Café on the ground floor, Coffee Corner near Hall B, and the Premium Lounge on the 2nd floor. Complimentary refreshments are available throughout the day.";
    } else if (lower.includes("schedule") || lower.includes("session")) {
      return "The main keynote is at 6 PM in Hall A. You can view the full schedule on the mobile app or at the information desk in the main lobby.";
    } else if (lower.includes("hall") || lower.includes("location")) {
      return "Hall A (Auditorium) is on the ground floor, left from the main lobby. Hall B (Exhibition) is on the right side. Meeting rooms are on the 2nd floor.";
    } else {
      return "I'd be happy to help! You can ask me about WiFi, parking, dining options, event schedules, or hall locations. What would you like to know?";
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <motion.div
            animate={{
              boxShadow: isSpeaking
                ? [
                    "0 0 20px rgba(34, 211, 238, 0.4)",
                    "0 0 40px rgba(139, 92, 246, 0.4)",
                    "0 0 20px rgba(34, 211, 238, 0.4)",
                  ]
                : "0 0 20px rgba(34, 211, 238, 0.2)",
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] p-1"
          >
            <div className="w-full h-full rounded-full bg-[#151D32] flex items-center justify-center">
              <Volume2 className="w-16 h-16 text-[#22D3EE]" />
            </div>
          </motion.div>
        </div>

        {/* Speaking Indicator */}
        <div className="flex items-center gap-1 h-8 mb-2">
          {isSpeaking ? (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["8px", "24px", "8px"],
                  }}
                  transition={{
                    duration: 0.45,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                  className="w-1 bg-[#22D3EE] rounded-full"
                />
              ))}
            </>
          ) : (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-2 bg-[#64748B] rounded-full" />
              ))}
            </>
          )}
        </div>

        <p className="text-[#94A3B8] font-medium">Ava · Virtual Assistant</p>
      </div>

      {/* Chat Area */}
      <div className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-6 mb-6 h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  message.sender === "bot"
                    ? "bg-[#101728] text-white rounded-tl-none"
                    : "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white rounded-tr-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Row */}
      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 px-6 py-4 rounded-full bg-[#151D32] border border-[#1E293B] text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
        />
        <button
          onClick={handleSend}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send
        </button>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Loader2, Globe, Sparkles, Paperclip, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { dataService } from '../services/dataService';

interface AiAssistantProps {
  vendorId: string | null;
  onDataUpdate: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ vendorId, onDataUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    {role: 'model', text: 'Hello! I am your Pharma Assistant. You can upload a photo of a wholesale bill to automatically update your inventory, or ask me any questions!'}
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Convert file to Base64
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !process.env.API_KEY) return;

    const userMsg = input;
    const currentImage = selectedImage;
    
    // Clear inputs immediately
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add user message to UI
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg + (currentImage ? ' [Sent an Image]' : '') 
    }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        You are an intelligent assistant for the "New Kallu Medical Store" app.
        
        **CORE FEATURE: BILL SCANNING**
        If the user uploads an image (a bill/invoice):
        1. Analyze the image to identify columns like Item Name, Quantity, Rate/MRP, Free Qty, etc.
        2. **CRITICAL STEP**: Do NOT automatically generate the final JSON yet. You MUST first ask the user specific questions about pricing.
           - Ask: "I see columns for [List Columns]. Which column should I use as the Selling Price? Or do you want to apply a margin (e.g., +20%) to the Cost Price?"
        3. Once the user answers the pricing question in the NEXT turn, then output a strictly formatted JSON block.
        
        **JSON OUTPUT FORMAT (For Step 3 Only)**:
        If you are confirming inventory updates, output a single JSON code block like this:
        \`\`\`json
        [
          { "name": "Exact Item Name", "stock": 50, "price": 10.5, "usage": "Infer usage (e.g. Fever)", "lowStockThreshold": 2 }
        ]
        \`\`\`
        (Set 'stock' to the quantity bought. Infer 'usage' based on medical knowledge of the drug name).

        **General Capabilities**:
        - Explain App Features (Inventory, POS, AI Manager).
        - Medicine Search: Use 'googleSearch' tool if asked about side effects or generic info.
      `;

      let contents: any = [];
      
      // If image exists, add it to contents
      if (currentImage) {
        // Strip base64 header
        const base64Data = currentImage.split(',')[1];
        contents.push({
            inlineData: {
                mimeType: "image/jpeg", // Assuming jpeg/png
                data: base64Data
            }
        });
      }
      
      if (userMsg) {
        contents.push({ text: userMsg });
      } else if (currentImage && !userMsg) {
          contents.push({ text: "Here is a bill. Please analyze it." });
      }

      // We need to maintain some context history for the "conversation" about the bill
      // Simplified: We send the last few turns + current. 
      // For this demo, we simply send the current request + system instruction + google search tool.
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...contents // Send current image/text
        ],
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "I couldn't process that.";
      
      // --- JSON PARSING LOGIC ---
      // Check if the model returned the JSON block for inventory update
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      let finalText = text;

      if (jsonMatch && jsonMatch[1]) {
        try {
            const items = JSON.parse(jsonMatch[1]);
            if (Array.isArray(items) && vendorId) {
                // Perform the update
                await dataService.bulkUpsertProducts(vendorId, items);
                onDataUpdate(); // Refresh App UI
                finalText = `✅ **Success!** I have added/updated ${items.length} items from the bill to your inventory.\n\n` + text.replace(/```json[\s\S]*```/, '');
            }
        } catch (e) {
            console.error("Failed to parse bill JSON", e);
            finalText += "\n\n(Error: I tried to update the inventory but the data format was incorrect.)";
        }
      }
      
      // Handle Grounding (Links)
      let groundingInfo = "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const uniqueLinks = new Set();
        const links: string[] = [];
        chunks.forEach((chunk: any) => {
            if (chunk.web?.uri && !uniqueLinks.has(chunk.web.uri)) {
                uniqueLinks.add(chunk.web.uri);
                links.push(`- [${chunk.web.title || 'Source'}](${chunk.web.uri})`);
            }
        });
        if (links.length > 0) {
            groundingInfo = "\n\n**Sources:**\n" + links.join("\n");
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: finalText + groundingInfo }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && vendorId && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        >
          <Sparkles className="group-hover:animate-spin" size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                  }`}
                >
                  <ReactMarkdown 
                    components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline font-bold text-inherit hover:text-yellow-200" />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-slate-200 rounded-2xl p-3 rounded-bl-none shadow-sm flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={14} className="animate-spin" /> Analyzing...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <Paperclip size={14} /> Image selected
                </div>
                <button onClick={() => {
                    setSelectedImage(null);
                    if(fileInputRef.current) fileInputRef.current.value = '';
                }} className="text-slate-400 hover:text-red-500">
                    <X size={14} />
                </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handleImageSelect}
            />
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
               title="Upload Bill Image"
            >
               <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type or upload bill..."
              className="flex-1 bg-slate-100 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={loading || (!input.trim() && !selectedImage)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
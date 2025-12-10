import { GoogleGenAI } from "@google/genai";
import { Product, Transaction } from "../types";

const getAiClient = () => {
  // Safe check for process.env to prevent "blank page" crashes in browser previews
  let apiKey = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment variable access failed");
  }
  
  if (!apiKey) {
    // Fallback or warning if key is missing
    console.warn("API Key not found. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  analyzeBusiness: async (products: Product[], transactions: Transaction[]) => {
    try {
      const ai = getAiClient();
      
      // Prepare data summary for the AI
      const inventorySummary = products.map(p => `${p.name} (Stock: ${p.stock})`).join(', ');
      
      // Calculate basic stats to feed the AI
      const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
      const recentTransactions = transactions.slice(-20); // Last 20 for context
      const salesSummary = recentTransactions.map(t => 
        `Date: ${new Date(t.timestamp).toLocaleDateString()}, Items: ${t.items.map(i => i.name).join(', ')}, Total: ${t.total}`
      ).join('; ');

      const prompt = `
        You are an expert pharmacy business consultant. Analyze the following data for a small pharmacy.
        
        Current Inventory:
        ${inventorySummary}

        Recent Sales History (Last 20 transactions):
        ${salesSummary}

        Total Historical Revenue: ${totalRevenue}

        Please provide a response in Markdown format with the following sections:
        1. **Sales Trends**: What is selling well?
        2. **Restock Recommendations**: Which items are critically low or selling fast?
        3. **Business Tip**: A specific piece of advice to improve sales or management based on this data.
        
        Keep it concise, professional, and actionable.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No analysis generated.";
    } catch (error) {
      console.error("Gemini Analysis Failed", error);
      return "Unable to generate insights at this time. Please ensure your API key is configured correctly.";
    }
  }
};
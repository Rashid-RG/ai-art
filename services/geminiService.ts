import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { User, Order } from "../types";

// Helper to check if API key exists safely
const getApiKey = (): string | undefined => {
  try {
    // Check if process is defined to avoid ReferenceError in browser
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("process.env access failed");
  }
  return undefined;
};

// Initialize client if key exists
const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateArtDescription = async (
  prompt: string, 
  history: {role: string, parts: {text: string}[]}[]
): Promise<string> => {
  const client = getClient();
  if (!client) return "AI services are unavailable (API Key missing).";

  try {
    const model = client.models;
    // Using 2.5 flash for quick chat interactions
    const response: GenerateContentResponse = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are Artisha's AI Creative Consultant. Your goal is to help customers articulate their vision for a custom art piece. Ask clarifying questions about style, medium (oil, watercolor, digital), color palette, and mood. Be concise, friendly, and artistic. If the user seems satisfied with the description, summarize it clearly starting with 'FINAL VISUALIZATION:'.",
      }
    });

    return response.text || "I'm having trouble visualizing that right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error connecting to the creative mind.";
  }
};

export const generateArtImage = async (prompt: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: prompt }]
      },
      config: {}
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const generateProductDescription = async (title: string, category: string): Promise<string> => {
  const client = getClient();
  if (!client) return "";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a compelling, artistic, and concise product description (max 2 sentences) for a ${category} art piece titled "${title}". Focus on craftsmanship, visual appeal, and emotional impact.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Description Gen Error:", error);
    return "";
  }
};

export const getSupportResponse = async (message: string, user?: User | null, orders?: Order[]): Promise<string> => {
    const client = getClient();
    if (!client) return "I'm offline right now (API Key missing).";
  
    // Build context about the user
    let systemContext = "You are the support bot for Artisha, a Sri Lankan art marketplace. Answer questions about shipping (island-wide delivery), payments (PayHere, Stripe), and custom orders. Be polite and helpful.";
    
    if (user) {
      systemContext += ` The user's name is ${user.name}.`;
    }
    
    if (orders && orders.length > 0) {
      const orderSummary = orders.slice(0, 3).map(o => `Order #${o.id} (${o.status}, Total: ${o.total})`).join(", ");
      systemContext += ` The user has the following recent orders: ${orderSummary}. If they ask about order status, refer to this data.`;
    } else {
      systemContext += " The user has no recent orders.";
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            systemInstruction: systemContext
        }
      });
      return response.text || "I didn't catch that.";
    } catch (error) {
        console.error("Support Bot Error:", error);
        return "I am currently experiencing technical difficulties.";
    }
}
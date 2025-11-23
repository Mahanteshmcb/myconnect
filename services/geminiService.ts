
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize only if key exists, though we expect it to be there in this environment.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getAIResponse = async (userMessage: string): Promise<string> => {
  if (!ai) {
    return "I'm sorry, I can't connect to the AI service right now. Please check your API key configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: "You are MyConnect AI, a helpful, friendly, and concise assistant integrated into a social media app. You help users with drafting posts, summarizing threads, or general queries. Keep answers short and social-media friendly.",
      }
    });
    
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const generateProductDetails = async (productName: string): Promise<any> => {
  if (!ai) return null;
  try {
    const prompt = `Generate a JSON object for a marketplace product based on the name "${productName}".
    Fields: description (marketing copy, max 2 sentences), category (one word), suggestedPrice (number), tags (array of strings).
    Do not include markdown formatting.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return null;
  }
};

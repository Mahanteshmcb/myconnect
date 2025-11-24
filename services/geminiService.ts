

import { GoogleGenAI, Type } from "@google/genai";

// Safely initialize. The API_KEY is expected to be in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIResponse = async (userMessage: string): Promise<string> => {
  if (!process.env.API_KEY) {
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
  if (!process.env.API_KEY) return null;
  try {
    const prompt = `Generate details for a marketplace product named "${productName}".`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            // FIX: Use responseSchema for more reliable JSON output.
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: {
                        type: Type.STRING,
                        description: 'Marketing copy for the product, maximum 2 sentences.'
                    },
                    category: {
                        type: Type.STRING,
                        description: 'A single-word category for the product.'
                    },
                    suggestedPrice: {
                        type: Type.NUMBER,
                        description: 'A suggested price for the product as a number.'
                    },
                    tags: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: 'An array of relevant string tags for the product.'
                    }
                },
                required: ['description', 'category', 'suggestedPrice', 'tags']
            }
        }
    });
    
    // FIX: The response.text is a string that needs to be parsed.
    const jsonText = response.text?.trim();
    return jsonText ? JSON.parse(jsonText) : {};
  } catch (e) {
    console.error(e);
    return null;
  }
};
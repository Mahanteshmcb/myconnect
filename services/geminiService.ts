
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the Google GenAI client
// FIX: Correctly initialize GoogleGenAI with named apiKey parameter.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

/**
 * Returns an AI-generated response for a given user message.
 * @param userMessage - The user's message.
 * @returns A promise that resolves to an AI-generated string.
 */
export const getAIResponse = async (userMessage: string): Promise<string> => {
  // FIX: Use the recommended `ai.models.generateContent` method.
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Recommended model for basic text tasks.
      contents: userMessage,
    });
    // FIX: Use the `.text` property to extract the string output.
    return response.text ?? "I'm sorry, I couldn't generate a response at this moment.";
  } catch (error) {
    console.error("Gemini API Error in getAIResponse:", error);
    return "I'm sorry, the AI assistant is currently experiencing issues.";
  }
};

/**
 * Returns null as the AI product detail generation is disabled.
 * @param productName - The name of the product (unused).
 * @returns A promise that resolves to null.
 */
export const generateProductDetails = async (productName: string): Promise<any> => {
  // This functionality is currently disabled as per the original file.
  // If implementation is needed, it would follow a pattern similar to getAIResponse
  // potentially with responseSchema for structured JSON output.
  return null;
};

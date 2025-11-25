
/**
 * Returns a static message indicating the AI assistant is disabled.
 * @param userMessage - The user's message (unused).
 * @returns A promise that resolves to a static string.
 */
export const getAIResponse = async (userMessage: string): Promise<string> => {
  // AI functionality is disabled. Return a placeholder response.
  return "I'm sorry, the AI assistant is currently disabled.";
};

/**
 * Returns null as the AI product detail generation is disabled.
 * @param productName - The name of the product (unused).
 * @returns A promise that resolves to null.
 */
export const generateProductDetails = async (productName: string): Promise<any> => {
  // This functionality is disabled.
  return null;
};

import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to convert an image URL to a Base64 string.
 * Note: This relies on the image server allowing CORS.
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to Base64:", error);
    throw new Error("이미지를 변환하는데 실패했습니다.");
  }
};

/**
 * Uses Gemini to interpret a user's natural language query and map it to product IDs.
 * e.g., "데이트할 때 입기 좋은 옷" -> Returns IDs of coats, shirts, slacks.
 */
export const searchProductsWithAI = async (query: string, allProducts: Product[]): Promise<number[]> => {
  try {
    // Create a simplified product catalog string for the model to analyze
    const productCatalog = allProducts.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ${p.price}`
    ).join('\n');

    const prompt = `
      You are a smart fashion shopping assistant. 
      Analyze the User Query and select the Product IDs from the provided Product Catalog that best match the query.
      Consider the occasion, style, weather, and gender implied by the query.
      
      Product Catalog:
      ${productCatalog}

      User Query: "${query}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedIds: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "Array of matching product IDs"
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{ "matchedIds": [] }');
    return result.matchedIds || [];

  } catch (error) {
    console.error("Gemini AI Search Error:", error);
    return []; // Return empty if error
  }
};

/**
 * Generates a fashion image based on a text prompt using Nano Banana (gemini-2.5-flash-image).
 */
export const generateFashionImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Nano Banana Generation Error:", error);
    throw error;
  }
};

/**
 * Edits an existing image based on a text prompt using Nano Banana (gemini-2.5-flash-image).
 */
export const editFashionImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    // Extract pure base64 and mime type
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid image format");

    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Nano Banana Edit Error:", error);
    throw error;
  }
};

/**
 * Combines a user photo and a product image to generate a "Try On" visualization.
 */
export const tryOnFashionItem = async (userImageBase64: string, productImageBase64: string, prompt: string): Promise<string | null> => {
  try {
    // Process User Image
    const userMatches = userImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!userMatches) throw new Error("Invalid user image format");
    
    // Process Product Image (Assuming it might come in as full data URI or needs cleaning)
    // If it's passed from urlToBase64, it is a full Data URI.
    const productMatches = productImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!productMatches) throw new Error("Invalid product image format");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: userMatches[1],
              data: userMatches[2]
            }
          },
          {
            inlineData: {
              mimeType: productMatches[1],
              data: productMatches[2]
            }
          },
          { text: `[Instruction] Generate a high-quality photorealistic fashion image. 
                   The first image is the reference person (User). 
                   The second image is the clothing item (Product). 
                   
                   Task: Visualize the person from the first image wearing the clothing item from the second image. 
                   - Maintain the person's pose, body shape, and facial features from the first image.
                   - Adapt the clothing item to fit the person naturally.
                   - ${prompt}` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Nano Banana Try-On Error:", error);
    throw error;
  }
};
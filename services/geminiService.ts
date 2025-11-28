import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

export const generateShirtConcept = async (): Promise<Partial<Product>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 1. Generate Text Metadata
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a creative, intellectual t-shirt concept based on the philosophy of Ayn Rand (Objectivism). 
      Focus on themes of individualism, reason, capitalism, and the human will.
      Provide a powerful quote, a catchy title for the product, a visual description for the shirt design, and a suggested price in INR (between 800 and 2000).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            quote: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
          },
          required: ["title", "quote", "description", "price"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);

    // 2. Refine Description into Visual Prompt
    const rawConcept = `T-shirt design. Title: ${data.title}. Description: ${data.description}. Text on shirt: "${data.quote}".`;
    const refinedPrompt = await refineDesignPrompt(rawConcept, "Bold, Objectivist, Art Deco, High Contrast, Black Background");

    // 3. Generate Image
    // Pass the quote explicitly to ensure it appears on the shirt. Using 'Art Deco' as default font for auto-gen.
    const imageUrl = await generateMerchImage(refinedPrompt, data.quote, "Art Deco");

    return {
      ...data,
      stock: 50,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error("Error generating concept:", error);
    throw error;
  }
};

export const refineDesignPrompt = async (concept: string, style: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert fashion designer and art director. 
      The user wants to design a t-shirt.
      User Concept: "${concept}"
      User Style Preference: "${style}"

      Your task is to rewrite this into a highly detailed, descriptive image generation prompt. 
      Include specific details about:
      1. The t-shirt color (default to black unless specified).
      2. The exact typography/font style for any text.
      3. The visual graphic elements, patterns, and composition.
      4. The art style (e.g., Art Deco, Bauhaus, Industrial, Minimalist).
      5. Lighting and presentation (e.g., studio lighting, flat lay, or model).
      
      Output ONLY the prompt text to be fed into an image generator. Do not add conversational filler.
      Example Output: "A photorealistic product shot of a black t-shirt featuring the text 'A IS A' in bold gold Art Deco lettering across the chest, surrounded by geometric industrial gear patterns, sharp contrast, studio lighting, 4k."`,
    });
    return response.text || concept;
  } catch (error) {
    console.error("Error refining text:", error);
    return concept;
  }
};

export const generateMerchImage = async (prompt: string, quote?: string, fontStyle?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Append explicit constraints to the prompt to enforce text and font style
  let finalPrompt = prompt;
  if (quote) {
    const cleanQuote = quote.trim().replace(/"/g, "'");
    finalPrompt += `\n\nIMPORTANT: The t-shirt design MUST prominently feature the text "${cleanQuote}".`;
    if (fontStyle) {
      finalPrompt += ` The text must be rendered in a ${fontStyle} typography style.`;
    }
    finalPrompt += " Ensure the text is spelled correctly and legible.";
  }

  // Helper to extract base64 image from response
  const extractImage = (response: any) => {
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  };

  try {
    // Attempt 1: Try High Quality (Nano Banana 2 / Gemini 3 Pro)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: finalPrompt,
    });

    const img = extractImage(response);
    if (img) return img;
    throw new Error("No image data found in Pro response");

  } catch (error: any) {
    const errStr = error.toString();
    // Check for Quota (429) or Auth (403) or generic Permission Denied
    const isQuota = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || error.status === 429;
    const isAuth = errStr.includes('403') || errStr.includes('PERMISSION_DENIED') || error.status === 403;

    // If it's a capacity/auth issue, try the fallback model
    if (isQuota || isAuth) {
      console.warn(`Gemini 3 Pro failed (${isQuota ? 'Quota' : 'Auth'}). Falling back to Flash Image.`);
      
      try {
        // Attempt 2: Fallback to Standard (Nano Banana / Gemini 2.5 Flash Image)
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: finalPrompt,
        });
        
        const img = extractImage(response);
        if (img) return img;
        throw new Error("No image data found in Flash response");

      } catch (fallbackError: any) {
        console.warn("Fallback generation failed. Returning placeholder.", fallbackError);
        
        // Final Fallback: Return a placeholder URL so the app doesn't crash
        // Using placehold.co or picsum as a reliable fallback
        // Encoding the prompt slightly to vary the seed if using picsum
        const seed = finalPrompt.length;
        return `https://picsum.photos/seed/${seed}/400/500?grayscale&blur=2`;
      }
    }
    
    console.error("Error generating image:", error);
    // If it's not a quota/auth error (e.g. invalid request), throw it
    throw error;
  }
};
import { SYSTEM_INSTRUCTION } from "../constants";

const API_URL = "/api/ai";

export class GeminiService {
  async sendMessage(prompt: string, history: { role: 'user' | 'model', text: string }[] = [], customInstruction?: string) {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history, systemInstruction: customInstruction || SYSTEM_INSTRUCTION })
      });
      const data = await response.json();
      return data.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting right now.";
    }
  }

  async analyzeImage(prompt: string, base64Data: string, mimeType: string) {
    try {
      const response = await fetch(`${API_URL}/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, base64Data, mimeType })
      });
      const data = await response.json();
      return data.text || "Analysis failed.";
    } catch (error) {
      console.error("Vision API Error:", error);
      return "Error processing image.";
    }
  }
}

export const geminiService = new GeminiService();

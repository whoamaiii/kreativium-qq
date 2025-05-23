import { GoogleGenerativeAI } from '@google/generative-ai';

let genai: GoogleGenerativeAI | null = null;

export function getGenAI(): GoogleGenerativeAI {
  if (!genai) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    genai = new GoogleGenerativeAI(apiKey);
  }
  
  return genai;
}

export default getGenAI; 
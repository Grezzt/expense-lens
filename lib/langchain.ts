import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { getAllCategories, type Category } from "./supabase";

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
}

// Initialize Gemini model with vision capabilities
const model = new ChatGoogleGenerativeAI({
  apiKey,
  modelName: "gemini-2.5-flash",
  temperature: 0,
});

export interface ExtractedExpenseData {
  merchant_name: string;
  amount: number;
  category: string;
  date: string;
  currency: string;
  items?: string[];
  description?: string;
  confidence: number;
}

/**
 * In-memory cache for categories to avoid repeated database calls
 */
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get categories from cache or database
 */
async function getCategories(): Promise<Category[]> {
  const now = Date.now();

  // Return cached categories if still valid
  if (categoriesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return categoriesCache;
  }

  // Fetch from database and update cache
  categoriesCache = await getAllCategories();
  cacheTimestamp = now;

  return categoriesCache;
}

/**
 * Auto-categorize based on merchant name using database categories
 */
async function autoCategorize(merchantName: string): Promise<string> {
  const lowerMerchant = merchantName.toLowerCase();
  const categories = await getCategories();

  for (const category of categories) {
    if (category.keywords.some(keyword => lowerMerchant.includes(keyword.toLowerCase()))) {
      return category.name;
    }
  }

  return "Lainnya";
}

/**
 * Extract expense data from receipt image using Gemini Vision
 */
export async function extractExpenseFromImage(imageUrl: string): Promise<ExtractedExpenseData> {
  try {
    const prompt = `Analyze this receipt image and extract the following information in JSON format:
{
  "merchant_name": "name of the merchant/store",
  "amount": total amount as a number (without currency symbol),
  "currency": "currency code (e.g., IDR, USD)",
  "date": "date in YYYY-MM-DD format",
  "items": ["list of items purchased with prices"],
  "description": "summary of items purchased with prices (e.g., 'Ayam Goreng 20k, Es Teh 5k')",
  "confidence": confidence score from 0 to 1
}

Rules:
- Extract the TOTAL amount, not individual item prices
- If date is not found, use today's date
- If merchant name is unclear, use "Unknown Merchant"
- Confidence should reflect how clear the receipt is
- Return ONLY valid JSON, no additional text`;

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Determine image type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split('/')[1] || 'jpeg';

    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "image_url",
          image_url: `data:image/${mimeType};base64,${base64Image}`,
        },
      ],
    });

    const response = await model.invoke([message]);

    // Parse the response
    const content = response.content.toString();

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Auto-categorize based on merchant name (now async)
    const category = await autoCategorize(extractedData.merchant_name);

    return {
      merchant_name: extractedData.merchant_name || "Unknown Merchant",
      amount: parseFloat(extractedData.amount) || 0,
      currency: extractedData.currency || "IDR",
      date: extractedData.date || new Date().toISOString().split('T')[0],
      items: extractedData.items || [],
      description: extractedData.description || "",
      category,
      confidence: extractedData.confidence || 0.5,
    };
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error('Failed to extract data from receipt image');
  }
}

/**
 * Validate and correct extracted data
 */
export function validateExtractedData(data: ExtractedExpenseData): ExtractedExpenseData {
  return {
    ...data,
    amount: Math.abs(data.amount), // Ensure positive amount
    date: data.date || new Date().toISOString().split('T')[0],
    merchant_name: data.merchant_name.trim() || "Unknown Merchant",
    description: data.description || "",
    category: data.category || "Lainnya",
    confidence: Math.min(Math.max(data.confidence, 0), 1), // Clamp between 0-1
  };
}

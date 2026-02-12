import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

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
  confidence: number;
}

/**
 * Category mapping for auto-categorization
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Transportasi": ["grab", "gojek", "uber", "taxi", "bensin", "fuel", "parking", "toll", "parkir", "tol"],
  "Makanan & Minuman": ["restaurant", "cafe", "coffee", "food", "makan", "minum", "restoran", "warung", "kfc", "mcd"],
  "Belanja": ["supermarket", "minimarket", "indomaret", "alfamart", "mall", "toko", "shop", "store"],
  "Utilitas": ["listrik", "air", "internet", "wifi", "telepon", "pln", "pdam"],
  "Kesehatan": ["hospital", "klinik", "apotek", "pharmacy", "dokter", "doctor", "rumah sakit"],
  "Hiburan": ["cinema", "bioskop", "game", "gym", "fitness", "sport"],
  "Pendidikan": ["sekolah", "kampus", "university", "course", "training", "buku", "book"],
  "Lainnya": []
};

/**
 * Auto-categorize based on merchant name
 */
function autoCategorize(merchantName: string): string {
  const lowerMerchant = merchantName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
      return category;
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
  "items": ["list of items purchased (optional)"],
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

    // Auto-categorize based on merchant name
    const category = autoCategorize(extractedData.merchant_name);

    return {
      merchant_name: extractedData.merchant_name || "Unknown Merchant",
      amount: parseFloat(extractedData.amount) || 0,
      currency: extractedData.currency || "IDR",
      date: extractedData.date || new Date().toISOString().split('T')[0],
      items: extractedData.items || [],
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
    category: data.category || "Lainnya",
    confidence: Math.min(Math.max(data.confidence, 0), 1), // Clamp between 0-1
  };
}

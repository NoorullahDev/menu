import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const restaurantName = formData.get('restaurantName') as string;

    if (!files || files.length === 0 || !restaurantName) {
      return NextResponse.json(
        { error: 'At least one file (image or PDF) and restaurant name are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `You are a menu extraction AI. Analyze the provided file(s) containing a restaurant menu for "${restaurantName}".

Extract ALL items with their names, descriptions (if available), prices, dietary preferences, and organize them into logical categories.

Also, assign the most appropriate theme for this restaurant from the following exactly 12 options based on its style and food: 
'midnight', 'ivory', 'crimson', 'forest', 'cafe', 'ocean', 'sunset', 'neon', 'minimal', 'vintage', 'rustic', 'bubblegum'.
(e.g., use 'cafe' for coffee shops, 'ocean' for seafood, 'rustic' for steakhouses).

Return ONLY valid JSON in this exact format, no other text:
{
  "restaurant_name": "${restaurantName}",
  "theme": "midnight",
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Item Name",
          "description": "Description if available, otherwise empty string",
          "price": 250,
          "is_veg": true
        }
      ]
    }
  ]
}

Rules:
- Extract EVERY single item visible across ALL pages/images
- If categories are not visible, create logical ones (Starters, Main Course, Beverages, Desserts, etc.)
- Prices should be numbers only, no currency symbols
- If description is not visible, use empty string ""
- If price is not visible for an item, use 0
- Determine if the item is vegetarian. Set "is_veg" to true if it is vegetarian, or false if it contains meat/seafood or if it's explicitly marked as non-vegetarian. If unsure, default to false.
- Be thorough — do not miss any items
- Choose exactly one theme from the 12 options
- Return ONLY the JSON, absolutely no other text before or after`;

    // Process all files into Gemini inlineData format
    const imageParts = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.type // 'application/pdf' or 'image/jpeg' etc.
          }
        };
      })
    );

    const result = await model.generateContent([
      prompt,
      ...imageParts
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const menuData = JSON.parse(text);
    return NextResponse.json({ success: true, data: menuData });

  } catch (error: any) {
    console.error('Menu extraction error:', error);
    
    let errorMessage = 'Failed to extract menu. Please try again with clearer files.';
    
    if (error?.message?.includes('503 Service Unavailable') || error?.message?.includes('high demand')) {
      errorMessage = 'The AI is currently experiencing high demand. Please wait a few seconds and try again!';
    } else if (error?.message) {
      // errorMessage = error.message; 
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

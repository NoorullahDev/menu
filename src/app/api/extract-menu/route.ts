import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, restaurantName } = await request.json();

    if (!image || !restaurantName) {
      return NextResponse.json(
        { error: 'Image and restaurant name are required' },
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

    const prompt = `You are a menu extraction AI. Analyze this image of a restaurant menu for "${restaurantName}".

Extract ALL items with their names, descriptions (if available), prices, dietary preferences, and organize them into logical categories.

Return ONLY valid JSON in this exact format, no other text:
{
  "restaurant_name": "${restaurantName}",
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
- Extract EVERY single item visible in the image
- If categories are not visible, create logical ones (Starters, Main Course, Beverages, Desserts, etc.)
- Prices should be numbers only, no currency symbols
- If description is not visible, use empty string ""
- If price is not visible for an item, use 0
- Determine if the item is vegetarian. Set "is_veg" to true if it is vegetarian, or false if it contains meat/seafood or if it's explicitly marked as non-vegetarian. If unsure, default to false.
- Be thorough — do not miss any items
- Return ONLY the JSON, absolutely no other text before or after`;

    const mimeType = image.split(';')[0].split(':')[1];
    const base64Data = image.split(',')[1];

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const menuData = JSON.parse(text);
    return NextResponse.json({ success: true, data: menuData });

  } catch (error: any) {
    console.error('Menu extraction error:', error);
    
    let errorMessage = 'Failed to extract menu. Please try again with a clearer image.';
    
    if (error?.message?.includes('503 Service Unavailable') || error?.message?.includes('high demand')) {
      errorMessage = 'The AI is currently experiencing high demand. Please wait a few seconds and try again!';
    } else if (error?.message) {
      // For other unexpected errors, it's helpful to see what actually failed during dev
      // errorMessage = error.message; 
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

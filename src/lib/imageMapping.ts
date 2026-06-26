export function getImageForItem(itemName: string, categoryName: string = ''): string {
  // Use Pollinations AI to generate a unique, highly specific, premium food photograph for EVERY exact item!
  const prompt = `${itemName} ${categoryName} delicious premium restaurant food photography high resolution photorealistic`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=400&nologo=true`;
}

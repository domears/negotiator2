// Utility function for parsing smart number inputs
export function parseSmartNumber(input: string): number {
  if (!input || input.trim() === '') return 0;
  
  const sanitized = input
    .trim()
    .replace(/[,_\s]/g, '') // Remove commas, underscores, spaces
    .toLowerCase();
  
  // Handle suffix notation (K, M, B, T)
  const suffixMatch = sanitized.match(/^(\d*\.?\d+)([kmbt])$/);
  if (suffixMatch) {
    const baseValue = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2];
    const multipliers = { k: 1_000, m: 1_000_000, b: 1_000_000_000, t: 1_000_000_000_000 };
    return baseValue * multipliers[suffix as keyof typeof multipliers];
  }
  
  // Handle plain numbers
  const numValue = parseFloat(sanitized);
  return isNaN(numValue) ? 0 : numValue;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

export function adjustHex(
  hex: string,
  amount: number
): string {
  const clean = hex.replace("#", "");

  const num = parseInt(clean, 16);

  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);

  return (
    "#" +
    [r, g, b]
      .map(v => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

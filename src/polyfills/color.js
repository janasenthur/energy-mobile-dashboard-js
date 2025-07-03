// Color module polyfill for web compatibility
// This fixes the "export 'default' was not found in 'color'" warnings

// Simple color manipulation functions
const parseColor = (color) => {
  if (typeof color !== 'string') return { r: 0, g: 0, b: 0, a: 1 };
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    return { r, g, b, a: 1 };
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }
  
  // Default fallback
  return { r: 0, g: 0, b: 0, a: 1 };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Color class that mimics the 'color' library
class Color {
  constructor(input) {
    this.color = parseColor(input);
  }
  
  isLight() {
    const { r, g, b } = this.color;
    const luminance = getLuminance(r, g, b);
    return luminance > 0.5;
  }
  
  isDark() {
    return !this.isLight();
  }
  
  alpha(newAlpha) {
    if (newAlpha === undefined) {
      return this.color.a;
    }
    const newColor = new Color('');
    newColor.color = { ...this.color, a: newAlpha };
    return newColor;
  }
  
  mix(otherColor, ratio = 0.5) {
    const other = otherColor.color;
    const mixed = {
      r: Math.round(this.color.r * (1 - ratio) + other.r * ratio),
      g: Math.round(this.color.g * (1 - ratio) + other.g * ratio),
      b: Math.round(this.color.b * (1 - ratio) + other.b * ratio),
      a: this.color.a * (1 - ratio) + other.a * ratio,
    };
    const newColor = new Color('');
    newColor.color = mixed;
    return newColor;
  }
  
  rgb() {
    return this;
  }
  
  string() {
    const { r, g, b, a } = this.color;
    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  hex() {
    const { r, g, b } = this.color;
    return rgbToHex(r, g, b);
  }
}

// Factory function that creates Color instances
const color = (input) => new Color(input);

// Default export (what most libraries expect)
export default color;

// Named exports for compatibility
export { Color, color };

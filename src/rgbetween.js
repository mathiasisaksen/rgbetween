function RGBetween(colors, stops) {
  this.colors = colors.map(c => RGBetween.hexToRGB(c));
  const n = colors.length;
  this.n = n;
  this.hasCustomStops = stops !== undefined;

  if (this.hasCustomStops) {
    this.validateStops(stops);
    this.stops = stops;
  } else {
    this.stops = Array(n).fill().map((_, i) => i / (n - 1));
  }
}

RGBetween.prototype.validateStops = function(stops) {
  const n = this.n;
  if (stops.length !== n) throw new Error("colors and stops have different lengths");
  if (stops[0] > 0 || stops[n - 1] < 1) throw new Error("The first element of stops cannot be greater than 0, while the last cannot be less than 1");
  for (let i = 1; i < n; i++)
    if (stops[i] < stops[i - 1]) throw new Error("stops must be non-decreasing")
}

RGBetween.hexToRGB = function(hexColor) {
  const l = hexColor.length;
  if (!(l === 7 || l === 9)) throw new Error("Hex color string has invalid length");
  const hasAlpha = l === 9;
  let rgb = Array(3 + hasAlpha).fill().map((_, i) => parseInt(hexColor.substr(1 + 2 * i, 2), 16) / 255);
  return rgb;
}

RGBetween.rgbToHex = function(rgbColor) {
  return "#" + rgbColor.map(v => Math.round(255 * v).toString(16).padStart(2, "0")).join("");
}

RGBetween.interpHelper = function(t, color1, color2, smooth = false) {
  let [a, b] = [1 - t, t];
  if (smooth)[a, b] = [smoothstep(a), smoothstep(b)];
  return color1.map((_, i) => a * color1[i] + b * color2[i]);
}

RGBetween.prototype.computeColorIndex = function(t) {
  //if (t < 0 || t > 1) throw new Error("t must be between 0 and 1");
  t = t < 0 ? 0 : (t > 1 ? 1 : t);
  // If the colors are regularly placed (default), the index of the starting color is easy to compute
  if (!this.hasCustomStops) return Math.min(Math.floor((this.n - 1) * t), this.n - 2);

  for (let i = 1; i < this.n; i++) {
    if (t < this.stops[i]) return i - 1;
  }
  return this.n - 2;

}

RGBetween.prototype.interpolate = function(t, returnHex = true, smooth = false) {
  let ind = this.computeColorIndex(t);
  const [s1, s2] = this.stops.slice(ind, ind + 2);

  const tInterval = (t - s1) / (s2 - s1);

  const [c1, c2] = [this.colors[ind], this.colors[ind + 1]];
  const rgbInterp = RGBetween.interpHelper(tInterval, c1, c2, smooth);
  if (returnHex) {
    return RGBetween.rgbToHex(rgbInterp);
  } else {
    return rgbInterp;
  }
}

module.exports = RGBetween;
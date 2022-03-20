/**
 * Colormap module
 * @module rgbetween
 */

/**
 * RGBetween constructor. 
 * @param {Array|Array[]} colors Either an array of hex strings, or an array of arrays containing the hex color followed by its stop position (for example ["#123456", 0.3])
 * @param {Array} [stops] The positions of the colors along the colormap, defaults to evenly distributed values
 * @constructor
 */
function RGBetween(colors, stops) {
  this.n = colors.length;
  this._processData(colors, stops);
  this.setEasing(0);
}

/**
 * Processes colors and stops.
 * @param {Array|Array[]} colors Color values
 * @param {Array} [stops] Stop values
 */
RGBetween.prototype._processData = function(colors, stops) {
  const n = colors.length;

  if (typeof colors[0] === "string") {
    this.colors = colors.map(c => RGBetween._hexToRGB(c));
    this.hasCustomStops = stops !== undefined;

    if (this.hasCustomStops) {
      if (stops.length !== n) throw new Error("colors and stops must have the same length");
      this.stops = stops;
    } else {
      this.stops = Array(n).fill().map((_, i) => i / (n - 1));
    }

  } else if (Array.isArray(colors[0])) {
    this.colors = Array(n).fill();
    this.stops = Array(n).fill();
    this.hasCustomStops = true;

    colors.forEach((v, i) => {
      this.colors[i] = RGBetween._hexToRGB(v[0]);
      this.stops[i] = v[1];
    });
  } else {
    throw new Error("Invalid specification of color");
  }
}

/**
 * Sets the amount of easing to use.
 * @param {float} value Easing amount, a float between 0 and 1 (it is recommended to use a small value)
 */
RGBetween.prototype.setEasing = function(value) {
  this.easing = value;
  this.hasEasing = value > 0;
}

/**
 * Easing function that is linear except at portions after 0 and before 1, where it instead is quadratic
 * @param {float} value The value to ease
 * @param {float} wStart The width of the start quadratic, defaults to 0.05
 * @param {float} wEnd The width of the end quadratic, defaults to 0.05
 * @returns 
 */
RGBetween._squareEase = function(value, wStart = 0.05, wEnd = 0.05) {
  if (value <= 0) return 0;
  if (value > 1) return 1;
  
  // Value common to every case
  const coeff = 1/(2 - (wStart + wEnd)); 

  // Start quadratic portion
  if (value > 0 && value <= wStart) {
      const a = coeff/wStart; // Coefficient in a*x^2
      return a*value*value;
  }

  // Central linear part
  if (value > wStart && value <= 1 - wEnd) {
      const m = 2*coeff; // Slope
      const k = - wStart*coeff; // Intercept
      return m*value + k;
  }

  // End quadratic portion
  if (value > 1 - wEnd && value <= 1) {
      const a = - coeff/wEnd; // Coefficient in a*(1 - x)^2 + 1
      return a*(1 - value)*(1 - value) + 1;
  }

  // Otherwise, return 1
  return 1;
}

/**
 * Helper function that decodes hex color string into an RGB(A) format.
 * @param {string} hexColor The color to decode, can contain transparency
 * @returns {Array} Array containing the RGB(A) components as values between 0 and 1.
 */
RGBetween._hexToRGB = function(hexColor) {
  if (hexColor[0] !== "#") throw new Error("Hex color string does not start with #");
  const l = hexColor.length;
  if (!(l === 7 || l === 9)) throw new Error("Hex color string has invalid length");
  const hasAlpha = l === 9;
  let rgb = Array(3 + hasAlpha).fill().map((_, i) => parseInt(hexColor.substring(1 + 2 * i, 3 + 2 * i), 16) / 255);
  return rgb;
}

/**
 * Helper function that encodes RGB(A) color into a hex color string.
 * @param {Array} rgbColor Array containing RGB(A) components as values between 0 and 1 
 * @returns {string} The hex color string
 */
RGBetween._rgbToHex = function(rgbColor) {
  return "#" + rgbColor.map(v => Math.round(255 * v).toString(16).padStart(2, "0")).join("");
}

/**
 * Helper function that interpolates between two colors.
 * @param {float} t Interpolation value, should be between 0 and 1
 * @param {Array} color1 The start color
 * @param {Array} color2 The end color
 * @returns {Array} The interpolated color
 */
RGBetween.prototype._interpHelper = function(t, color1, color2) {
  let [a, b] = [1 - t, t];

  if (this.hasEasing) {
    const s = this.easing / 2;
    a = RGBetween._squareEase(a, s, s);
    b = RGBetween._squareEase(b, s, s);
    const sum = a + b;
    [a, b] = [a / sum, b / sum];
  }

  return color1.map((_, i) => a * color1[i] + b * color2[i]);
}

/**
 * Computes the index of the first color that has a stop value less than or equal to the input.
 * @param {float} t The interpolation position
 * @returns {int} The color index
 */
RGBetween.prototype._computeColorIndex = function(t) {
  // If the colors are regularly placed (default), the index of the starting color is easy to compute
  if (!this.hasCustomStops) {
    const ind = Math.floor((this.n - 1)*t);
    return Math.min(ind, this.n - 2);
  }

  // Could be replaced with binary search, faster if the number of colors is large
  for (let i = 1; i < this.n; i++) {
    if (t < this.stops[i]) return i - 1;
  }
  return this.n - 2;
}

/**
 * Evaluates the colormap.
 * @param {float} t The position to interpolate
 * @param {boolean} returnHex If true, the color is returned as a hex string. Otherwise, an array containing RGB(A) values is returned. Defaults to true 
 * @returns {string|Array} The interpolated color
 */
RGBetween.prototype.evaluate = function(t, returnHex = true) {
  const n = this.n;
  const cs = this.colors;
  
  let result;
  // If interpolation value is outside lower/upper bounds set by stops, return closest color
  if (t <= this.stops[0]) {
    result = cs[0];
  } else if (t >= this.stops[n - 1]) {
    result = cs[n - 1]
  } else {
    const ind = this._computeColorIndex(t);
    const [s1, s2] = this.stops.slice(ind, ind + 2);

    const tInterval = (t - s1) / (s2 - s1);

    const [c1, c2] = cs.slice(ind, ind + 2);;
    result = this._interpHelper(tInterval, c1, c2);
  }

  if (returnHex) {
    return RGBetween._rgbToHex(result);
  } else {
    return result;
  }
}

module.exports = RGBetween;
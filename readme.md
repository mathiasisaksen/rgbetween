# rgbetween

[![npm version](https://badge.fury.io/js/rgbetween.svg)](https://badge.fury.io/js/rgbetween)

rgbetween is a compact JavaScript package for creating colormaps using RGB color interpolation.

If more advanced features are needed, the package [culuri](https://github.com/Evercoder/culori) is recommended.

## Installation
The module is available on npm:

```
npm install rgbetween
```

## Examples of use

### **Opaque colors:**

The colors must be encoded in a hexadecimal format.
If stop values are not specified, the colors will be evenly distributed over the interval [0, 1].

``` js
const RGBetween = require("rgbetween");

const cmap = new RGBetween(["#ff0000", "#0000ff"]);
console.log(cmap.evaluate(0.5)); // Color halfway between red and blue
```

<p align="center">
    <img src="./docs/img/red-blue.png" style="display:block;max-width:70%;width:750px"></img>
</p>

### **Custom stops:**

Custom stop values can be specified in the second parameter of the constructor.
These values should generally be increasing, but two consecutive stops can have the same value (leading to sharp transitions).
Values below the first stop, or above the last stop, are mapped to the first and last colors, respectively.

``` js
const colors = ["#000083", "#00ffff", "#ffff00", "#ff0000", "#7f0000"];
const stops = [0.1, 0.5, 0.5, 0.7, 0.9];
const cmap = new RGBetween(colors, stops);

console.log(cmap.evaluate(0.05)); // Prints #000083
```

<p align="center">
    <img src="./docs/img/jet.png" style="display:block;max-width:70%;width:750px"></img>
</p>

### **Custom stops and transparency:**

Alternatively, the colors and stop values can be specified as an array of color-stop pairs.
Transparency is handled by including the alpha channel in the hex format (e.g. #FF000080 is red with 50% transparency).

The method `setEasing` controls the amount of easing to apply during the interpolation, and expects a value between 0 and 1.
By default, easing is disabled.

``` js
const colors = [
    ["#3b3b3b00", 0],
    ["#07564aff", 0.2],
    ["#435fabff", 0.3],
    ["#f901ffff", 0.6],
    ["#fdab0000", 1]
];
const cmap = new RGBetween(colors);
cmap.setEasing(0.2);
```

<p align="center">
    <img src="./docs/img/transparent.png" style="display:block;max-width:70%;width:750px"></img>
</p>

## API

### Constructor

**new RGBetween(colors[, stops])**

- *colors :* The colors to interpolate between. Either an array of colors encoded as hex strings, or an array of arrays containing pairs of colors and stop values (e.g. `[["#ff0000", 0], ["#00ff00", 1]]`), required
- *stops :* The stop positions of the colors

``` js
const cmap = new RGBetween(["#ff0000", "#0000ff"]);
```

``` js
const cmap = new RGBetween([["#ff0000", 0.2], ["#0000ff", 0.8]]);
```

``` js
const cmap = new RGBetween(["#ff0000", "#0000ff"], [0.2, 0.8]);
```

### Method

**cmap.evaluate(t, returnHex = true)**

Evaluates the colormap.
`t` is the position to evaluate, usually a number between 0 and 1.

When `returnHex` is true, the returned color is encoded as a hex color string.
Otherwise, the return value is an array containing RGB(A) values (scaled to the interval [0, 1]).

``` js
const color = cmap.evaluate(0.3);
```

``` js
const [r, g, b] = cmap.evaluate(0.7, false);
```

**cmap.setEasing(value)**

Sets the amount of easing to use when interpolating between two colors.
`value` should be between 0 and 1, where 0 is no easing and 1 is the highest amount possible.

``` js
cmap.setEasing(0.2);
```



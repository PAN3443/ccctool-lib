//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Color Converter Functions
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const colorConverter = require("../../../color/colorConverter.js");
const { checkMathResult } = require("../../../helper/guardClauses.js");

//////////////////////////////////////////////////////////////////
/////////////////////////   rgb2hsv   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: rgb2hsv :: Incorrect Input", () => {
  expect(() => {
    colorConverter.rgb2hsv({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: rgb2hsv :: Incorrect Input", () => {
  expect(() => {
    colorConverter.rgb2hsv({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: rgb2hsv :: Correct Input", () => {
  let result = colorConverter.rgb2hsv({ space: "rgb", c1: 1.0, c2: 0.0, c3: 0.0 });
  expect(result.space).toBe("hsv");
  expect(checkMathResult(result.c1, 0.0)).toBe(true);
  expect(checkMathResult(result.c2, 1.0)).toBe(true);
  expect(checkMathResult(result.c3, 1.0)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   hsv2rgb   ////////////////////////////
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
/////////////////////////   rgb2xyz   ////////////////////////////
//////////////////////////////////////////////////////////////////=
test("Color Converter :: rgb2xyz :: Incorrect Input", () => {
  expect(() => {
    colorConverter.rgb2xyz({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: rgb2xyz :: Incorrect Input", () => {
  expect(() => {
    colorConverter.rgb2xyz({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: rgb2xyz :: Correct Input", () => {
  let result = colorConverter.rgb2xyz({ space: "rgb", c1: 1.0, c2: 0.0, c3: 0.0 });
  expect(result.space).toBe("hsv");
  expect(checkMathResult(result.c1, 0.0)).toBe(true);
  expect(checkMathResult(result.c2, 1.0)).toBe(true);
  expect(checkMathResult(result.c3, 1.0)).toBe(true);
});

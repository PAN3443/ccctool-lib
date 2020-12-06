//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class Color
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { Color } = require("../../../color/class_Color.js");
const properties = require("../../../properties.js");
//////////////////////////////////////////////////////////////////
/////////////////////////  Constructor  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: Constructor :: Correct Input", () => {
  const color = new Color("rgb", 0, 0, 0);
  expect(typeof color).toBe("object");
});

test("Color Class :: Constructor :: Incorrect Input", () => {
  expect(() => {
    const color = new Color();
  }).toThrow();
});

test("Color Class :: Constructor :: Incorrect Input 2", () => {
  expect(() => {
    const color = new Color("rgb_cb", NaN, null, [0]);
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////  setColor  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: setColor :: Incorrect Input", () => {
  expect(() => {
    const color = new Color("rgb", 0, 0, 0);
    color.setColor();
  }).toThrow();
});

test("Color Class :: setColor :: Incorrect Input 2", () => {
  expect(() => {
    const color = new Color("rgb", 0, 0, 0);
    color.setColor("rgb_cb", NaN, null, [0]);
  }).toThrow();
});

test("Color Class :: setColor :: Correct Input", () => {
  const color = new Color("rgb", 0, 0, 0);
  color.setColor("hsv", 0.1, 0.2, 0.3);
  cJSON = color.getColorJSON();
  expect(cJSON.space).toBe("hsv");
  expect(cJSON.c1).toBe(0.1);
  expect(cJSON.c2).toBe(0.2);
  expect(cJSON.c3).toBe(0.3);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  setColorJSON  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: setColorJSON :: Incorrect Input", () => {
  expect(() => {
    const color = new Color("rgb", 0, 0, 0);
    color.setColorJSON();
  }).toThrow();
});

test("Color Class :: setColorJSON :: Incorrect Input", () => {
  const color = new Color("rgb", 0, 0, 0);
  color.setColorJSON({ space: "hsv", c1: 0.1, c2: 0.2, c3: 0.3 });
  cJSON = color.getColorJSON();
  expect(cJSON.space).toBe("hsv");
  expect(cJSON.c1).toBe(0.1);
  expect(cJSON.c2).toBe(0.2);
  expect(cJSON.c3).toBe(0.3);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  test convert properties  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: resetConvertProperties :: Test Convert Properties", () => {
  const color = new Color("rgb", 0, 0, 0);
  let json = color.getConvertProperties();
  expect(json.DIN99KE).toBe(properties.DIN99KE);
  expect(json.DIN99KCH).toBe(properties.DIN99KCH);
  expect(json.REFX).toBe(properties.REFX);
  expect(json.REFY).toBe(properties.REFY);
  expect(json.REFZ).toBe(properties.REFZ);
});

test("Color Class :: setConvertProperties :: Correct Input", () => {
  let newProperties = { DIN99KE: 123, DIN99KCH: 234, REFX: 345, REFY: 456, REFZ: 567, TMRGB2XYZ: "TMRGB2XYZ::sRGB_D50", TMXYZ2LMS: "TMXYZ2LMS::von_Kries" };
  const color = new Color("rgb", 0, 0, 0);
  color.setConvertProperties(newProperties);
  expect(color.DIN99KE).toBe(123);
  expect(color.DIN99KCH).toBe(234);
  expect(color.REFX).toBe(345);
  expect(color.REFY).toBe(456);
  expect(color.REFZ).toBe(567);
  expect(color.TMRGB2XYZ).toBe("TMRGB2XYZ::sRGB_D50");
  expect(color.TMXYZ2LMS).toBe("TMXYZ2LMS::von_Kries");
});

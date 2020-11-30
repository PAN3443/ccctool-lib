//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class CCC_Color
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { CCC_Color } = require("../../../color/class_Color.js");
const properties = require("../../../properties.js");
//////////////////////////////////////////////////////////////////
/////////////////////////  Constructor  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: Constructor :: Correct Input", () => {
  const color = new CCC_Color("rgb", 0, 0, 0);
  expect(typeof color).toBe("object");
});

test("Color Class :: Constructor :: Incorrect Input", () => {
  expect(() => {
    const color = new CCC_Color();
  }).toThrow();
});

test("Color Class :: Constructor :: Incorrect Input 2", () => {
  expect(() => {
    const color = new CCC_Color("rgb_cb", NaN, null, [0]);
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////  setColor  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: setColor :: Incorrect Input", () => {
  expect(() => {
    const color = new CCC_Color("rgb", 0, 0, 0);
    color.setColor();
  }).toThrow();
});

test("Color Class :: setColor :: Incorrect Input 2", () => {
  expect(() => {
    const color = new CCC_Color("rgb", 0, 0, 0);
    color.setColor("rgb_cb", NaN, null, [0]);
  }).toThrow();
});

test("Color Class :: setColor :: Correct Input", () => {
  const color = new CCC_Color("rgb", 0, 0, 0);
  color.setColor("hsv", 0.1, 0.2, 0.3);
  expect(color.space).toBe("hsv");
  expect(color.c1).toBe(0.1);
  expect(color.c2).toBe(0.2);
  expect(color.c3).toBe(0.3);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  setColorJSON  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: setColorJSON :: Incorrect Input", () => {
  expect(() => {
    const color = new CCC_Color("rgb", 0, 0, 0);
    color.setColorJSON();
  }).toThrow();
});

test("Color Class :: setColorJSON :: Incorrect Input", () => {
  const color = new CCC_Color("rgb", 0, 0, 0);
  color.setColorJSON({ space: "hsv", c1: 0.1, c2: 0.2, c3: 0.3 });
  expect(color.space).toBe("hsv");
  expect(color.c1).toBe(0.1);
  expect(color.c2).toBe(0.2);
  expect(color.c3).toBe(0.3);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  test convert properties  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: resetConvertProperties :: Test Convert Properties", () => {
  const color = new CCC_Color("rgb", 0, 0, 0);
  expect(color.DIN99KE).toBe(properties.DIN99KE);
  expect(color.DIN99KCH).toBe(properties.DIN99KCH);
  expect(color.REFX).toBe(properties.REFX);
  expect(color.REFY).toBe(properties.REFY);
  expect(color.REFZ).toBe(properties.REFZ);
});

test("Color Class :: setConvertProperties :: Correct Input", () => {
  let newProperties = { DIN99KE: 123, DIN99KCH: 234, REFX: 345, REFY: 456, REFZ: 567, TMRGB2XYZ: "TMRGB2XYZ::Default", TMXYZ2LMS: "TMXYZ2LMS::Default" };
  const color = new CCC_Color("rgb", 0, 0, 0);
  color.setConvertProperties(newProperties);
  expect(color.DIN99KE).toBe(123);
  expect(color.DIN99KCH).toBe(234);
  expect(color.REFX).toBe(345);
  expect(color.REFY).toBe(456);
  expect(color.REFZ).toBe(567);
  expect(color.TMRGB2XYZ).toBe("TMRGB2XYZ::Default");
  expect(color.TMXYZ2LMS).toBe("TMXYZ2LMS::Default");
});

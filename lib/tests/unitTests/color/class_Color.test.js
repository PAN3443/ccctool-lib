//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class CCC_Color
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { CCC_Color } = require("../../../color/class_Color.js");

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

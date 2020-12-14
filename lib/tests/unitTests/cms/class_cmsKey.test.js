//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class KeyColor
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { KeyColor } = require("../../../cms/class_cmsKey.js");

//////////////////////////////////////////////////////////////////
/////////////////////////  Constructor  //////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Class :: Constructor :: Correct Input", () => {
  const key = new KeyColor({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, 0.3, true, true);
  expect(typeof key).toBe("object");
  let cJSON = key.getCL("rgb");
  expect(cJSON.space).toBe("rgb");
  expect(cJSON.c1).toBe(0.3);
  expect(cJSON.c2).toBe(0.3);
  expect(cJSON.c3).toBe(0.3);
  cJSON = key.getCR("rgb");
  expect(cJSON.space).toBe("rgb");
  expect(cJSON.c1).toBe(0.7);
  expect(cJSON.c2).toBe(0.7);
  expect(cJSON.c3).toBe(0.7);
  expect(key.getRef()).toBe(0.3);
  expect(key.getMoT()).toBe(true);
  expect(key.getBur()).toBe(true);
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////  setCL() & setCR()  //////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

test("Color Class :: setCL :: Correct Input", () => {
  const key = new KeyColor(undefined, undefined, 0, false, false);
  key.setCL({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 });
  let cJSON = key.getCL("rgb");
  expect(cJSON.space).toBe("rgb");
  expect(cJSON.c1).toBe(0.5);
  expect(cJSON.c2).toBe(0.5);
  expect(cJSON.c3).toBe(0.5);
});

test("Color Class :: setCL :: Incorrect Input", () => {
  expect(() => {
    const key = new KeyColor(undefined, undefined, 0, false, false);
    key.setCL("string");
  }).toThrow();
});

test("Color Class :: setCR :: Correct Input", () => {
  const key = new KeyColor(undefined, undefined, 0, false, false);
  key.setCR({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 });
  let cJSON = key.getCR("rgb");
  expect(cJSON.space).toBe("rgb");
  expect(cJSON.c1).toBe(0.5);
  expect(cJSON.c2).toBe(0.5);
  expect(cJSON.c3).toBe(0.5);
});

test("Color Class :: setCR :: Incorrect Input", () => {
  expect(() => {
    const key = new KeyColor(undefined, undefined, 0, false, false);
    key.setCR("string");
  }).toThrow();
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  determineType() & getType()  /////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

test("Color Class :: determineType() & getType() :: Input (Nil Key)", () => {
  const key = new KeyColor(undefined, undefined, 0, false, false);
  expect(key.getType()).toBe("nil");
});

test("Color Class :: determineType() & getType() :: Input (Right Key)", () => {
  const key = new KeyColor(undefined, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0, false, false);
  expect(key.getType()).toBe("right");
});

test("Color Class :: determineType() & getType() :: Input (Left Key)", () => {
  const key = new KeyColor({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, undefined, 0, false, false);
  expect(key.getType()).toBe("left");
});

test("Color Class :: Constructor :: Correct Input", () => {
  const key = new KeyColor({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0, false, false);
  expect(key.getType()).toBe("dual");
});

test("Color Class :: Constructor :: Correct Input", () => {
  const key = new KeyColor({ space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 0, false, false);
  expect(key.getType()).toBe("twin");
});

////////////////////////////////////////////////////////////////
/////////////////////     setRef()    //////////////////////////
////////////////////////////////////////////////////////////////

test("Color Class :: setRef :: Correct Input", () => {
  const key = new KeyColor(undefined, undefined, 0, false, false);
  key.setRef(0.3);
  expect(key.getRef()).toBe(0.3);
});

test("Color Class :: setRef :: Incorrect Input", () => {
  expect(() => {
    const key = new KeyColor(undefined, undefined, 0, false, false);
    key.setRef("string");
  }).toThrow();
});

//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Guard Clauses Functions
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const guardClauses = require("../../../helper/guardClauses.js");

//////////////////////////////////////////////////////////////////
/////////////////////////  isString  /////////////////////////////
//////////////////////////////////////////////////////////////////
test("Guard Clauses :: isString :: Input is String", () => {
  let result = guardClauses.isString("test");
  expect(result).toBe(true);
});

test("Guard Clauses :: isString :: Input is Number", () => {
  let result = guardClauses.isString(3.212);
  expect(result).toBe(false);
});

test("Guard Clauses :: isString :: Input is Undefined", () => {
  let result = guardClauses.isString(undefined);
  expect(result).toBe(false);
  result = guardClauses.isString();
  expect(result).toBe(false);
});

test("Guard Clauses :: isString :: Input is Null", () => {
  let result = guardClauses.isString(null);
  expect(result).toBe(false);
});

test("Guard Clauses :: isString :: Input is Boolean", () => {
  let result = guardClauses.isString(true);
  expect(result).toBe(false);
  result = guardClauses.isString(false);
  expect(result).toBe(false);
});

test("Guard Clauses :: isString :: Input is NaN", () => {
  let result = guardClauses.isString(NaN);
  expect(result).toBe(false);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  isNumber  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: isNumber :: Input is String", () => {
  let result = guardClauses.isNumber("test");
  expect(result).toBe(false);
});

test("Guard Clauses :: isNumber :: Input is Number", () => {
  let result = guardClauses.isNumber(3.212);
  expect(result).toBe(true);
});

test("Guard Clauses :: isNumber :: Input is Undefined", () => {
  let result = guardClauses.isNumber(undefined);
  expect(result).toBe(false);
  result = guardClauses.isNumber();
  expect(result).toBe(false);
});

test("Guard Clauses :: isNumber :: Input is Null", () => {
  let result = guardClauses.isNumber(null);
  expect(result).toBe(false);
});

test("Guard Clauses :: isNumber :: Input is Boolean", () => {
  let result = guardClauses.isNumber(true);
  expect(result).toBe(false);
  result = guardClauses.isNumber(false);
  expect(result).toBe(false);
});

test("Guard Clauses :: isNumber :: Input is NaN", () => {
  let result = guardClauses.isNumber(NaN);
  expect(result).toBe(false);
});

test("Guard Clauses :: isNumber :: Input is Array", () => {
  let result = guardClauses.isNumber([0]);
  expect(result).toBe(false);
});

test("Guard Clauses :: isNumber :: Input is JSON", () => {
  let result = guardClauses.isNumber({ test: 0 });
  expect(result).toBe(false);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  numInRange  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: numInRange :: Incorrect Input (val is NaN)", () => {
  let result = guardClauses.numInRange(NaN, 0, 1, true, true);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Incorrect Input (min is NaN)", () => {
  let result = guardClauses.numInRange(0.5, NaN, 1, true, true);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Incorrect Input (max is NaN)", () => {
  let result = guardClauses.numInRange(0.5, 0, NaN, true, true);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Correct Input && value is in range", () => {
  let result = guardClauses.numInRange(0.5, 0, 1, true, true);
  expect(result).toBe(true);
});

test("Guard Clauses :: numInRange :: Correct Input && value is min", () => {
  let result = guardClauses.numInRange(0, 0, 1, true, true);
  expect(result).toBe(true);
});

test("Guard Clauses :: numInRange :: Correct Input && value is max", () => {
  let result = guardClauses.numInRange(1, 0, 1, true, true);
  expect(result).toBe(true);
});

test("Guard Clauses :: numInRange :: Correct Input && value is min && excluding min", () => {
  let result = guardClauses.numInRange(0, 0, 1, false, true);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Correct Input && value is max && excluding max", () => {
  let result = guardClauses.numInRange(1, 0, 1, true, false);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Correct Input && value is max && excluding min", () => {
  let result = guardClauses.numInRange(1, 0, 1, false, true);
  expect(result).toBe(true);
});

test("Guard Clauses :: numInRange :: Correct Input && value is min && excluding max", () => {
  let result = guardClauses.numInRange(0, 0, 1, true, false);
  expect(result).toBe(true);
});

test("Guard Clauses :: numInRange :: Correct Input && value is min && excluding min and max", () => {
  let result = guardClauses.numInRange(0, 0, 1, false, false);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Correct Input && value is max && excluding max and max", () => {
  let result = guardClauses.numInRange(1, 0, 1, false, false);
  expect(result).toBe(false);
});

test("Guard Clauses :: numInRange :: Correct Input && value is in range && excluding max and max", () => {
  let result = guardClauses.numInRange(0.5, 0, 1, false, false);
  expect(result).toBe(true);
});

//////////////////////////////////////////////////////////////////
////////////////////////////  checkMathResult  ///////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: checkMathResult :: Incorrect Input 1", () => {
  expect(() => {
    guardClauses.checkMathResult();
  }).toThrow();
});

test("Guard Clauses :: checkMathResult :: Incorrect Input 2", () => {
  expect(() => {
    guardClauses.checkMathResult("string", 12);
  }).toThrow();
});

test("Guard Clauses :: checkMathResult :: Incorrect Input 3", () => {
  expect(() => {
    guardClauses.checkMathResult(12, "string");
  }).toThrow();
});

test("Guard Clauses :: checkMathResult :: Correct Input", () => {
  let result = guardClauses.checkMathResult(0.5, 0.5);
  expect(result).toBe(true);
});

test("Guard Clauses :: checkMathResult :: Correct Input", () => {
  let result = guardClauses.checkMathResult(0.5, 0.500000000001);
  expect(result).toBe(true);
});

test("Guard Clauses :: checkMathResult :: Correct Input", () => {
  let result = guardClauses.checkMathResult(0.5, 0.5001);
  expect(result).toBe(false);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  isMathVector  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: isMathVector :: Incorrect Input. (Undefined)", () => {
  expect(() => {
    guardClauses.isMathVector();
  }).toThrow();
});

test("Guard Clauses :: isMathVector :: Incorrect Input. (Empty Array)", () => {
  expect(() => {
    guardClauses.isMathVector([]);
  }).toThrow();
});

test("Guard Clauses :: isMathVector :: Correct Input.", () => {
  var result = guardClauses.isMathVector([3, 5, 7]);
  expect(result).toBe(true);
});

test("Guard Clauses :: isMathVector :: Incorrect Input. (Empty is NaN)", () => {
  expect(() => {
    guardClauses.isMathVector([3, NaN, undefined, "string"]);
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////  isMathMatrix  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: isMathMatrix :: Incorrect Input. (Undefined)", () => {
  expect(() => {
    guardClauses.isMathMatrix();
  }).toThrow();
});

test("Guard Clauses :: isMathMatrix :: Incorrect Input. (Empty Array)", () => {
  expect(() => {
    guardClauses.isMathMatrix([], false);
  }).toThrow();
});

test("Guard Clauses :: isMathMatrix :: Incorrect Input. (Empty Array)", () => {
  expect(() => {
    guardClauses.isMathMatrix([[2], []], false);
  }).toThrow();
});

test("Guard Clauses :: isMathMatrix :: Incorrect Input. (Different Row lengths)", () => {
  expect(() => {
    guardClauses.isMathMatrix([[2, 2], [2]], false);
  }).toThrow();
});

test("Guard Clauses :: isMathMatrix :: Incorrect Input. (Number of rows is different to row lengths. equalColRowSize is true)", () => {
  expect(() => {
    guardClauses.isMathMatrix(
      [
        [2, 2],
        [2, 5],
        [2, 5],
      ],
      true
    );
  }).toThrow();
});

test("Guard Clauses :: isMathMatrix :: Correct Input. (equalColRowSize is false)", () => {
  let result = guardClauses.isMathMatrix(
    [
      [2, 2],
      [2, 5],
      [2, 5],
    ],
    false
  );
  expect(result).toBe(true);
});

test("Guard Clauses :: isMathMatrix :: Correct Input. (equalColRowSize is true)", () => {
  let result = guardClauses.isMathMatrix(
    [
      [2, 2],
      [2, 5],
    ],
    true
  );
  expect(result).toBe(true);
});

test("Guard Clauses :: isMathMatrix :: Incorrect Input. (Entry is NaN)", () => {
  expect(() => {
    guardClauses.isMathMatrix(
      [
        [2, NaN],
        [2, undefined],
        [2, "lala"],
      ],
      false
    );
  }).toThrow();
}); //

//////////////////////////////////////////////////////////////////
/////////////////////////  isJSON  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: isJSON :: Input is emty JSON", () => {
  let result = guardClauses.isJSON({});
  expect(result).toBe(true);
});

test("Guard Clauses :: isJSON :: Input is JSON", () => {
  let result = guardClauses.isJSON({ test: 0 });
  expect(result).toBe(true);
});

test("Guard Clauses :: isJSON :: Input is JSON String", () => {
  let result = guardClauses.isJSON('{ "test": 0 }');
  expect(result).toBe(true);
});

test("Guard Clauses :: isJSON :: Input is String", () => {
  let result = guardClauses.isJSON("test");
  expect(result).toBe(false);
});

test("Guard Clauses :: isJSON :: Input is Number", () => {
  let result = guardClauses.isJSON(3.212);
  expect(result).toBe(false);
});

test("Guard Clauses :: isJSON :: Input is Undefined", () => {
  let result = guardClauses.isJSON(undefined);
  expect(result).toBe(false);
  result = guardClauses.isString();
  expect(result).toBe(false);
});

test("Guard Clauses :: isJSON :: Input is Null", () => {
  let result = guardClauses.isJSON(null);
  expect(result).toBe(false);
});

test("Guard Clauses :: isJSON :: Input is Array", () => {
  let result = guardClauses.isJSON([0, "lala", undefined, 0.5]);
  expect(result).toBe(false);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  isColorJSON  /////////////////////////////
//////////////////////////////////////////////////////////////////

test("Guard Clauses :: isColorJSON :: Input is emty JSON", () => {
  let result = guardClauses.isColorJSON({});
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is JSON, but not a ColorJSON", () => {
  let result = guardClauses.isColorJSON({ test: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a correct ColorJSON", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c1: 0, c2: 0, c3: 0 });
  expect(result).toBe(true);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (space is missing)", () => {
  let result = guardClauses.isColorJSON({ c1: 0, c2: 0, c3: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (c1 is missing)", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c2: 0, c3: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (c2 is missing)", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c1: 0, c3: 0 });
  expect(result).toBe(false);
});
test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (c3 is missing)", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c1: 0, c2: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (incorrect space)", () => {
  let result = guardClauses.isColorJSON({ space: undefined, c1: 0, c2: 0, c3: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (incorrect space)", () => {
  let result = guardClauses.isColorJSON({ space: 0, c1: 0, c2: 0, c3: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (incorrect c1)", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c1: null, c2: 0, c3: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (incorrect c2)", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c1: 0, c2: undefined, c3: 0 });
  expect(result).toBe(false);
});

test("Guard Clauses :: isColorJSON :: Input is a incorrect ColorJSON (incorrect c3)", () => {
  let result = guardClauses.isColorJSON({ space: "rgb", c1: 0, c2: [0], c3: 0 });
  expect(result).toBe(false);
});

////////////////////////////////////////////////////////////////////////////
/////////////////////////  Colorspace Notation  ////////////////////////////
////////////////////////////////////////////////////////////////////////////

test("Guard Clauses :: isString :: Input is Not Colorspace String", () => {
  let result = guardClauses.checkColorSpaceNotation("test", true);
  expect(result[0]).toBe(false);
});

test("Guard Clauses :: isString :: Input is Number", () => {
  let result = guardClauses.checkColorSpaceNotation(3.212, true);
  expect(result[0]).toBe(false);
});

test("Guard Clauses :: isString :: Input is Undefined", () => {
  let result = guardClauses.checkColorSpaceNotation(undefined, true);
  expect(result[0]).toBe(false);
  result = guardClauses.checkColorSpaceNotation();
  expect(result[0]).toBe(false);
});

test("Guard Clauses :: checkColorSpaceNotation :: Input is Null", () => {
  let result = guardClauses.checkColorSpaceNotation(null, true);
  expect(result[0]).toBe(false);
});

///////////////// check normal colorspace notation /////////////////////
test('Guard Clauses :: isString :: Input is "HSV"', () => {
  let result = guardClauses.checkColorSpaceNotation("HSV", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("hsv");
});

test('Guard Clauses :: isString :: Input is "Hsv"', () => {
  let result = guardClauses.checkColorSpaceNotation("Hsv", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("hsv");
});

test('Guard Clauses :: isString :: Input is "hsv"', () => {
  let result = guardClauses.checkColorSpaceNotation("hsv", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("hsv");
});

test('Guard Clauses :: isString :: Input is "hsv_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("hsv_cb", false);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("hsv");
});

test('Guard Clauses :: isString :: Input is "hsv_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("hsv_cb");
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("hsv_cb");
});

test('Guard Clauses :: isString :: Input is "RGB"', () => {
  let result = guardClauses.checkColorSpaceNotation("RGB", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("rgb");
});

test('Guard Clauses :: isString :: Input is "Rgb"', () => {
  let result = guardClauses.checkColorSpaceNotation("Rgb", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("rgb");
});

test('Guard Clauses :: isString :: Input is "rgb"', () => {
  let result = guardClauses.checkColorSpaceNotation("rgb", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("rgb");
});

test('Guard Clauses :: isString :: Input is ("rgb_cb", true, false)', () => {
  let result = guardClauses.checkColorSpaceNotation("rgb_cb", false);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("rgb");
});

test('Guard Clauses :: isString :: Input is "rgb_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("rgb_cb");
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("rgb_cb");
});

test('Guard Clauses :: isString :: Input is "XYZ"', () => {
  let result = guardClauses.checkColorSpaceNotation("XYZ", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("xyz");
});

test('Guard Clauses :: isString :: Input is "Xyz"', () => {
  let result = guardClauses.checkColorSpaceNotation("Xyz", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("xyz");
});

test('Guard Clauses :: isString :: Input is "xyz"', () => {
  let result = guardClauses.checkColorSpaceNotation("xyz", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("xyz");
});

test('Guard Clauses :: isString :: Input is "xyz_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("xyz_cb", false);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("xyz");
});

test('Guard Clauses :: isString :: Input is "xyz_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("xyz_cb");
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("xyz_cb");
});

test('Guard Clauses :: isString :: Input is "LMS"', () => {
  let result = guardClauses.checkColorSpaceNotation("LMS", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("lms");
});

test('Guard Clauses :: isString :: Input is "Lms"', () => {
  let result = guardClauses.checkColorSpaceNotation("Lms", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("lms");
});

test('Guard Clauses :: isString :: Input is "lms"', () => {
  let result = guardClauses.checkColorSpaceNotation("lms", true);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("lms");
});

test('Guard Clauses :: isString :: Input is "lms_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("lms_cb", false);
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("lms");
});

test('Guard Clauses :: isString :: Input is "lms_cb"', () => {
  let result = guardClauses.checkColorSpaceNotation("lms_cb");
  expect(result[0]).toBe(true);
  expect(result[1]).toEqual("lms_cb");
});

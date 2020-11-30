//////////////////////////////////////////////
//////////////       Math       //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Math Functions
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const math = require("../../../helper/math.js");
const { checkMathResult } = require("../../../helper/guardClauses.js");

//////////////////////////////////////////////////////////////////
////////////////////////////  mXv  ///////////////////////////////
//////////////////////////////////////////////////////////////////

test("Math :: mXv :: Incorrect Input 1", () => {
  expect(() => {
    math.mXv(234, "test");
  }).toThrow();
});

test("Math :: mXv :: Incorrect Input 2", () => {
  expect(() => {
    math.mXv(
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]
    );
  }).toThrow();
});

test("Math :: mXv :: Incorrect Input 3", () => {
  expect(() => {
    math.mXv(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      [1, 1, 1, 1]
    );
  }).toThrow();
});

test("Math :: mXv :: Correct Input", () => {
  let result = math.mXv(
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    [1, 1, 1]
  );
  expect(checkMathResult(result[0], 6)).toBe(true);
  expect(checkMathResult(result[1], 15)).toBe(true);
  expect(checkMathResult(result[2], 24)).toBe(true);
});

//////////////////////////////////////////////////////////////////
////////////////////////////  mXm  ///////////////////////////////
//////////////////////////////////////////////////////////////////

test("Math :: mXm :: Incorrect Input 1", () => {
  expect(() => {
    math.mXv(234, "test");
  }).toThrow();
});

test("Math :: mXm :: Incorrect Input 2", () => {
  expect(() => {
    math.mXm(
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [1, 1, 1]
    );
  }).toThrow();
});

test("Math :: mXm :: Incorrect Input 2", () => {
  expect(() => {
    math.mXm(
      [
        [1, 2, 3, 42],
        [4, 5, 6, 42],
        [7, 8, 9, 42],
        [42, 42, 42, 42],
      ],
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]
    );
  }).toThrow();
});

test("Math :: mXm :: Correct Input (3x3 * 3x3)", () => {
  let result = math.mXm(
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
  );
  expect(checkMathResult(result.length, 3)).toBe(true);
  expect(checkMathResult(result[0].length, 3)).toBe(true);
  expect(checkMathResult(result[0][0], 30)).toBe(true);
  expect(checkMathResult(result[0][1], 36)).toBe(true);
  expect(checkMathResult(result[0][2], 42)).toBe(true);
  expect(checkMathResult(result[1][0], 66)).toBe(true);
  expect(checkMathResult(result[1][1], 81)).toBe(true);
  expect(checkMathResult(result[1][2], 96)).toBe(true);
  expect(checkMathResult(result[2][0], 102)).toBe(true);
  expect(checkMathResult(result[2][1], 126)).toBe(true);
  expect(checkMathResult(result[2][2], 150)).toBe(true);
});

test("Math :: mXm :: Correct Input (3x4 * 4x5)", () => {
  let result = math.mXm(
    [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ],
    [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20],
    ]
  );
  expect(checkMathResult(result.length, 3)).toBe(true);
  expect(checkMathResult(result[0].length, 5)).toBe(true);
  expect(checkMathResult(result[0][0], 110)).toBe(true);
  expect(checkMathResult(result[0][1], 120)).toBe(true);
  expect(checkMathResult(result[0][2], 130)).toBe(true);
  expect(checkMathResult(result[0][3], 140)).toBe(true);
  expect(checkMathResult(result[0][4], 150)).toBe(true);
  expect(checkMathResult(result[1][0], 246)).toBe(true);
  expect(checkMathResult(result[1][1], 272)).toBe(true);
  expect(checkMathResult(result[1][2], 298)).toBe(true);
  expect(checkMathResult(result[1][3], 324)).toBe(true);
  expect(checkMathResult(result[1][4], 350)).toBe(true);
  expect(checkMathResult(result[2][0], 382)).toBe(true);
  expect(checkMathResult(result[2][1], 424)).toBe(true);
  expect(checkMathResult(result[2][2], 466)).toBe(true);
  expect(checkMathResult(result[2][3], 508)).toBe(true);
  expect(checkMathResult(result[2][4], 550)).toBe(true);
});

//////////////////////////////////////////////////////////////////
////////////////////////////  invert3x3  ///////////////////////////////
//////////////////////////////////////////////////////////////////

test("Math :: invert3x3 :: Incorrect Input 1", () => {
  expect(() => {
    math.invert3x3(234);
  }).toThrow();
});

test("Math :: invert3x3 :: Incorrect Input (det(m)=0)", () => {
  expect(() => {
    math.invert3x3([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  }).toThrow();
});

test("Math :: invert3x3 :: Correct Input", () => {
  let result = math.invert3x3([
    [1, 2, 1],
    [1, 1, 3],
    [1, 4, 2],
  ]);
  expect(checkMathResult(result.length, 3)).toBe(true);
  expect(checkMathResult(result[0].length, 3)).toBe(true);
  expect(checkMathResult(result[0][0], 2)).toBe(true);
  expect(checkMathResult(result[0][1], 0)).toBe(true);
  expect(checkMathResult(result[0][2], -1)).toBe(true);
  expect(checkMathResult(result[1][0], -0.2)).toBe(true);
  expect(checkMathResult(result[1][1], -0.2)).toBe(true);
  expect(checkMathResult(result[1][2], 0.4)).toBe(true);
  expect(checkMathResult(result[2][0], -0.6)).toBe(true);
  expect(checkMathResult(result[2][1], 0.4)).toBe(true);
  expect(checkMathResult(result[2][2], 0.2)).toBe(true);
});

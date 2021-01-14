//////////////////////////////////////////////
//////////////      Random      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Random Functions
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { isNumber } = require("../../../helper/guardClauses.js");
const random = require("../../../helper/random.js");
const iterations = 50;

//////////////////////////////////////////////////////////////////
///////////////////////  randomArbitrary  ////////////////////////
//////////////////////////////////////////////////////////////////

test("Random :: randomArbitrary :: Incorrect Input", () => {
  expect(() => {
    random.randomArbitrary("string", 0);
  }).toThrow();

  expect(() => {
    random.randomArbitrary(0, "string");
  }).toThrow();

  expect(() => {
    random.randomArbitrary(10, 0);
  }).toThrow();
});

test("Random :: randomArbitrary :: Correct Input", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomArbitrary(50.8452, 80.613546);
    expect(isNumber(rnd)).toBe(true);
    expect(rnd >= 50.8452 && rnd <= 80.613546).toBe(true);
  }
});

test("Random :: randomArbitrary :: Correct Input 2", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomArbitrary(-50.8452, 80.613546);
    expect(isNumber(rnd)).toBe(true);
    expect(rnd >= -50.8452 && rnd <= 80.613546).toBe(true);
  }
});

test("Random :: randomArbitrary :: Correct Input 3", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomArbitrary(-80.613546, -50.8452);
    expect(isNumber(rnd)).toBe(true);
    expect(rnd >= -80.613546 && rnd <= -50.8452).toBe(true);
  }
});

//////////////////////////////////////////////////////////////////
////////////////////////////  randomInt  /////////////////////////
//////////////////////////////////////////////////////////////////

test("Random :: randomInt :: Incorrect Input", () => {
  expect(() => {
    random.randomInt("string", 0);
  }).toThrow();

  expect(() => {
    random.randomInt(0, "string");
  }).toThrow();

  expect(() => {
    random.randomInt(10, 0);
  }).toThrow();
});

test("Random :: randomInt :: Correct Input", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomInt(50.8452, 80.613546);
    expect(Number.isInteger(rnd)).toBe(true);
    expect(rnd >= 50 && rnd <= 80).toBe(true);
  }
});

test("Random :: randomInt :: Correct Input 2", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomInt(50, 80);
    expect(Number.isInteger(rnd)).toBe(true);
    expect(rnd >= 50 && rnd <= 80).toBe(true);
  }
});

test("Random :: randomInt :: Correct Input 3", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomInt(-50, 80);
    expect(Number.isInteger(rnd)).toBe(true);
    expect(rnd >= -50 && rnd <= 80).toBe(true);
  }
});

test("Random :: randomInt :: Correct Input 4", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomInt(-80, -50);
    expect(Number.isInteger(rnd)).toBe(true);
    expect(rnd >= -80 && rnd <= -50).toBe(true);
  }
});

//////////////////////////////////////////////////////////////////
//////////////////////  randomBoxMuller  /////////////////////////
//////////////////////////////////////////////////////////////////

test("Random :: randomBoxMuller :: Correct Input", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomBoxMuller();
    expect(isNumber(rnd)).toBe(true);
    //expect(rnd >= -1 && rnd <= 1).toBe(true);
  }
});

//////////////////////////////////////////////////////////////////
////////////////////////  randomBeta  ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Random :: randomBeta :: Correct Input", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomBeta();
    expect(isNumber(rnd)).toBe(true);
    expect(rnd >= 0 && rnd <= 1).toBe(true);
  }
});

//////////////////////////////////////////////////////////////////
///////////////////////  randomBetaLeft  /////////////////////////
//////////////////////////////////////////////////////////////////

test("Random :: randomBetaLeft :: Correct Input", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomBetaLeft();
    expect(isNumber(rnd)).toBe(true);
    expect(rnd >= 0 && rnd <= 1).toBe(true);
  }
});

//////////////////////////////////////////////////////////////////
//////////////////////  randomBetaRight  /////////////////////////
//////////////////////////////////////////////////////////////////

test("Random :: randomBetaRight :: Correct Input", () => {
  for (let i = 0; i < iterations; i++) {
    let rnd = random.randomBetaRight();
    expect(isNumber(rnd)).toBe(true);
    expect(rnd >= 0 && rnd <= 1).toBe(true);
  }
});

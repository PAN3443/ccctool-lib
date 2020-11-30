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
    colorConverter.rgb2hsv({ space: "rgb", c1: NaN, c2: 30, c3: -30 });
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

test("Color Converter :: hsv2rgb :: Incorrect Input", () => {
  expect(() => {
    colorConverter.hsv2rgb({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: hsv2rgb :: Incorrect Input", () => {
  expect(() => {
    colorConverter.hsv2rgb({ space: "hsv", c1: NaN, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: hsv2rgb :: Correct Input", () => {
  let result = colorConverter.hsv2rgb({ space: "hsv", c1: 0.0, c2: 1.0, c3: 1.0 });
  expect(result.space).toBe("rgb");
  expect(checkMathResult(result.c1, 1.0)).toBe(true);
  expect(checkMathResult(result.c2, 0.0)).toBe(true);
  expect(checkMathResult(result.c3, 0.0)).toBe(true);
});

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
    colorConverter.rgb2xyz({ space: "rgb", c1: NaN, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: rgb2xyz :: Correct Input (Own Transfer Matrix)", () => {
  let result = colorConverter.rgb2xyz({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 100)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

test("Color Converter :: rgb2xyz :: Correct Input (Transfer Matrix Name)", () => {
  let result = colorConverter.rgb2xyz({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, "TMRGB2XYZ::sRGB_D65");
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 95.047)).toBe(true);
  expect(checkMathResult(result.c2, 100, 0.001)).toBe(true);
  expect(checkMathResult(result.c3, 108.883)).toBe(true);
});

test("Color Converter :: rgb2xyz :: Correct Input (Default Transfer Matrix :: TMRGB2XYZ::sRGB_D65)", () => {
  let result = colorConverter.rgb2xyz({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 });
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 95.047)).toBe(true);
  expect(checkMathResult(result.c2, 100, 0.001)).toBe(true);
  expect(checkMathResult(result.c3, 108.883)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   xyz2rgb   ////////////////////////////
//////////////////////////////////////////////////////////////////
test("Color Converter :: xyz2rgb :: Incorrect Input", () => {
  expect(() => {
    colorConverter.xyz2rgb({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: xyz2rgb :: Incorrect Input", () => {
  expect(() => {
    colorConverter.xyz2rgb({ space: "xyz", c1: 50, c2: NaN, c3: -30 });
  }).toThrow();
});

test("Color Converter :: xyz2rgb :: Correct Input (Own Transfer Matrix)", () => {
  let result = colorConverter.xyz2rgb({ space: "xyz", c1: 100, c2: 100, c3: 100 }, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  expect(result.space).toBe("rgb");
  expect(checkMathResult(result.c1, 1, 0.0001)).toBe(true);
  expect(checkMathResult(result.c2, 1, 0.0001)).toBe(true);
  expect(checkMathResult(result.c3, 1, 0.0001)).toBe(true);
});

test("Color Converter :: xyz2rgb :: Correct Input (Transfer Matrix Name)", () => {
  let result = colorConverter.xyz2rgb({ space: "xyz", c1: 95.047, c2: 100, c3: 108.883 }, "TMRGB2XYZ::sRGB_D65");
  expect(result.space).toBe("rgb");
  expect(checkMathResult(result.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(result.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(result.c3, 1.0, 0.0001)).toBe(true);
});

test("Color Converter :: xyz2rgb :: Correct Input (Default Transfer Matrix :: TMRGB2XYZ::sRGB_D65)", () => {
  let result = colorConverter.xyz2rgb({ space: "xyz", c1: 95.047, c2: 100, c3: 108.883 });
  expect(result.space).toBe("rgb");
  expect(checkMathResult(result.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(result.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(result.c3, 1.0, 0.0001)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   xyz2lms   ////////////////////////////
//////////////////////////////////////////////////////////////////
test("Color Converter :: xyz2lms :: Incorrect Input", () => {
  expect(() => {
    colorConverter.xyz2lms({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: xyz2lms :: Incorrect Input", () => {
  expect(() => {
    colorConverter.xyz2lms({ space: "xyz", c1: 50, c2: NaN, c3: -30 });
  }).toThrow();
});

test("Color Converter :: xyz2lms :: Correct Input (Own Transfer Matrix)", () => {
  let result = colorConverter.xyz2lms({ space: "xyz", c1: 100, c2: 100, c3: 100 }, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  expect(result.space).toBe("lms");
  expect(checkMathResult(result.c1, 100)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

test("Color Converter :: xyz2lms :: Correct Input (Transfer Matrix Name)", () => {
  let result = colorConverter.xyz2lms({ space: "xyz", c1: 100, c2: 100, c3: 100 }, "TMXYZ2LMS::von_Kries");
  expect(result.space).toBe("lms");
  expect(checkMathResult(result.c1, 102.7)).toBe(true);
  expect(checkMathResult(result.c2, 98.47)).toBe(true);
  expect(checkMathResult(result.c3, 91.82)).toBe(true);
});

test("Color Converter :: xyz2lms :: Correct Input (Default Transfer Matrix = TMXYZ2LMS::Hunt-Pointer-Estevez)", () => {
  let result = colorConverter.xyz2lms({ space: "xyz", c1: 100, c2: 100, c3: 100 });
  expect(result.space).toBe("lms");
  expect(checkMathResult(result.c1, 100.001)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   lms2xyz   ////////////////////////////
//////////////////////////////////////////////////////////////////
test("Color Converter :: lms2xyz :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lms2xyz({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: lms2xyz :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lms2xyz({ space: "lms", c1: 50, c2: NaN, c3: -30 });
  }).toThrow();
});

test("Color Converter :: lms2xyz :: Correct Input (Own Transfer Matrix)", () => {
  let result = colorConverter.lms2xyz({ space: "lms", c1: 100, c2: 100, c3: 100 }, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 100)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

test("Color Converter :: lms2xyz :: Correct Input (Transfer Matrix Name)", () => {
  let result = colorConverter.lms2xyz({ space: "lms", c1: 102.7, c2: 98.47, c3: 91.82 }, "TMXYZ2LMS::von_Kries");
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 100)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

test("Color Converter :: lms2xyz :: Correct Input (Default Transfer Matrix = TMXYZ2LMS::Hunt-Pointer-Estevez)", () => {
  let result = colorConverter.lms2xyz({ space: "lms", c1: 100.001, c2: 100, c3: 100 });
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 100)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   lms2lms_CB   ////////////////////////////
//////////////////////////////////////////////////////////////////
test("Color Converter :: lms2lms_CB :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lms2lms_CB({ space: "lab", c1: 50, c2: 30, c3: -30 });
  }).toThrow();
});

test("Color Converter :: lms2lms_CB :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lms2lms_CB({ space: "lms", c1: 50, c2: NaN, c3: -30 });
  }).toThrow();
});

test("Color Converter :: lms2lms_CB :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lms2lms_CB({ space: "lms", c1: 100, c2: 100, c3: 100 }, [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ]);
  }).toThrow();
});

test("Color Converter :: lms2lms_CB :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lms2lms_CB({ space: "lms", c1: 100, c2: 100, c3: 100 }, [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }).toThrow();
});

test("Color Converter :: lms2lms_CB :: Correct Input (Own Transfer Matrix)", () => {
  let result = colorConverter.lms2lms_CB({ space: "lms", c1: 100, c2: 100, c3: 100 }, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
  expect(result.space).toBe("lms");
  expect(checkMathResult(result.c1, 100)).toBe(true);
  expect(checkMathResult(result.c2, 100)).toBe(true);
  expect(checkMathResult(result.c3, 100)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   xyz2lab   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: xyz2lab :: Incorrect Input", () => {
  expect(() => {
    colorConverter.xyz2lab({ space: "lab", c1: 50, c2: 30, c3: 30 });
  }).toThrow();
});

test("Color Converter :: xyz2lab :: Incorrect Input", () => {
  expect(() => {
    colorConverter.xyz2lab({ space: "xyz", c1: 50, c2: NaN, c3: 30 });
  }).toThrow();
});

test("Color Converter :: xyz2lab :: Correct Input ", () => {
  let result = colorConverter.xyz2lab({ space: "xyz", c1: 28.38, c2: 18.42, c3: 3.48 });
  expect(result.space).toBe("lab");

  expect(checkMathResult(result.c1, 50, 0.05)).toBe(true);
  expect(checkMathResult(result.c2, 50, 0.05)).toBe(true);
  expect(checkMathResult(result.c3, 50, 0.05)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   lab2xyz   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: lab2xyz :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lab2xyz({ space: "rgb", c1: 50, c2: 30, c3: 30 });
  }).toThrow();
});

test("Color Converter :: lab2xyz :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lab2xyz({ space: "lab", c1: 50, c2: NaN, c3: 30 });
  }).toThrow();
});

test("Color Converter :: lab2xyz :: Correct Input ", () => {
  let result = colorConverter.lab2xyz({ space: "lab", c1: 57.08, c2: 147.44, c3: -51.5 });
  expect(result.space).toBe("xyz");
  expect(checkMathResult(result.c1, 75, 0.05)).toBe(true);
  expect(checkMathResult(result.c2, 25, 0.05)).toBe(true);
  expect(checkMathResult(result.c3, 75, 0.05)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   lab2lch   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: lab2lch :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lab2lch({ space: "rgb", c1: 1, c2: 1, c3: 1 });
  }).toThrow();
});

test("Color Converter :: lab2lch :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lab2lch({ space: "lab", c1: 1, c2: NaN, c3: 1 });
  }).toThrow();
});

test("Color Converter :: lab2lch :: Correct Input ", () => {
  let result = colorConverter.lab2lch({ space: "lab", c1: 50, c2: 50, c3: 50 });
  expect(result.space).toBe("lch");
  expect(checkMathResult(result.c1, 0.5)).toBe(true);
  expect(checkMathResult(result.c2, 0.5524271728019903)).toBe(true);
  expect(checkMathResult(result.c3, 0.125)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   lch2lab   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: lch2lab :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lch2lab({ space: "rgb", c1: 1, c2: 1, c3: 1 });
  }).toThrow();
});

test("Color Converter :: lch2lab :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lch2lab({ space: "lch", c1: 1, c2: NaN, c3: 1 });
  }).toThrow();
});

test("Color Converter :: lch2lab :: Correct Input ", () => {
  let result = colorConverter.lch2lab({ space: "lch", c1: 0.5, c2: 0.5524271728019903, c3: 0.125 });
  expect(result.space).toBe("lab");
  expect(checkMathResult(result.c1, 50)).toBe(true);
  expect(checkMathResult(result.c2, 50)).toBe(true);
  expect(checkMathResult(result.c3, 50)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   lab2din99   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: lab2din99 :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lab2din99({ space: "rgb", c1: 1, c2: 1, c3: 1 });
  }).toThrow();
});

test("Color Converter :: lab2din99 :: Incorrect Input", () => {
  expect(() => {
    colorConverter.lab2din99({ space: "lab", c1: 1, c2: NaN, c3: 1 });
  }).toThrow();
});

test("Color Converter :: lab2din99 :: Correct Input ", () => {
  let result = colorConverter.lab2din99({ space: "lab", c1: 50, c2: 50, c3: 50 });
  expect(result.space).toBe("din99");
  expect(checkMathResult(result.c1, 54.09783123613543)).toBe(true);
  expect(checkMathResult(result.c2, 31.236608118899714)).toBe(true);
  expect(checkMathResult(result.c3, 28.075763499711616)).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////   din992lab   ////////////////////////////
//////////////////////////////////////////////////////////////////

test("Color Converter :: din992lab :: Incorrect Input", () => {
  expect(() => {
    colorConverter.din992lab({ space: "rgb", c1: 1, c2: 1, c3: 1 });
  }).toThrow();
});

test("Color Converter :: din992lab :: Incorrect Input", () => {
  expect(() => {
    colorConverter.din992lab({ space: "din99", c1: 1, c2: NaN, c3: 1 });
  }).toThrow();
});

test("Color Converter :: din992lab :: Correct Input ", () => {
  let result = colorConverter.din992lab({ space: "din99", c1: 54.09783123613543, c2: 31.236608118899714, c3: 28.075763499711616 });
  expect(result.space).toBe("lab");
  expect(checkMathResult(result.c1, 50)).toBe(true);
  expect(checkMathResult(result.c2, 50)).toBe(true);
  expect(checkMathResult(result.c3, 50)).toBe(true);
});

//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Guard Clauses Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////
const { math_error } = require("../properties.js");

exports.isString = (str) => {
  return typeof str !== "string" ? false : true;
};

exports.isNumber = (value) => {
  return typeof value === "number" && isFinite(value);
};

exports.numInRange = (val, min, max, minIn, maxIn) => {
  if (!(typeof minIn === "boolean")) minIn = true;
  if (!(typeof maxIn === "boolean")) maxIn = true;
  if (!this.isNumber(val)) return false;
  if (!this.isNumber(min)) return false;
  if (!this.isNumber(max)) return false;

  switch (true) {
    case minIn && maxIn:
      if (val >= min && val <= max) return true;
      break;
    case !minIn && maxIn:
      if (val > min && val <= max) return true;
      break;
    case minIn && !maxIn:
      if (val >= min && val < max) return true;
      break;
    case !minIn && !maxIn:
      if (val > min && val < max) return true;
      break;
  }
  return false;
};

exports.isJSON = (item) => {
  item = typeof item !== "string" ? JSON.stringify(item) : item;
  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === "object" && item !== null && !Array.isArray(item)) {
    return true;
  }
  return false;
};
///////////////////////////////////
////// Special for Math //////////
///////////////////////////////////

exports.checkMathResult = (shouldVal, isVal, error) => {
  let terror = math_error;
  if (this.isNumber(error)) terror = error;
  if (!this.isNumber(shouldVal)) throw new TypeError('Error (guardClauses) :: Function "checkMathResult" :: First parameter is not a number.');
  if (!this.isNumber(isVal)) throw new TypeError('Error (guardClauses) :: Function "checkMathResult" :: Second parameter is not a number.');
  if (Math.abs(shouldVal - isVal) < terror) return true;
  return false;
};

exports.isMathMatrix = (matrix, equalColRowSize) => {
  if (typeof equalColRowSize !== "boolean") equalColRowSize = false;
  if (!Array.isArray(matrix)) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not an array.');
  if (matrix.length == 0) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! The array is empty.');

  matrix.forEach(function (item, index) {
    if (!Array.isArray(item)) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! The row ' + index + " is not an array.");
    if (item.length == 0) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! The row ' + index + " is empty.");
  });

  let m1NumRows = matrix.length,
    m1NumCols = matrix[0].length;

  for (const row of matrix) {
    if (row.length != m1NumCols)
      // row array length = number of cols
      throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! Inconsistent row lenghts.');
  }

  if (equalColRowSize && m1NumRows != m1NumCols) {
    throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct. Rows and Columns have different sizes.');
  }

  for (var r = 0; r < m1NumRows; r++) {
    for (var c = 0; c < m1NumCols; c++) {
      if (!this.isNumber(matrix[r][c])) {
        throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! Entry [' + r + "][" + c + "] is not a number.");
      }
    }
  }

  return true;
};

exports.isMathVector = (vector) => {
  if (!Array.isArray(vector)) throw new TypeError('Error (guardClauses) :: Function "isMathVector" :: Input vector is not an array.');
  if (vector.length == 0) throw new TypeError('Error (guardClauses) :: Function "isMathVector" :: Input vector is not correct! The array is empty.');

  for (const elm of vector) {
    if (!this.isNumber(elm)) throw new TypeError('Error (guardClauses) :: Function "isMathVector" :: Input vector is not correct! An entry is not a number.');
  }

  return true;
};

///////////////////////////////////
////// Special for Color //////////
///////////////////////////////////

exports.isColorJSON = (colorJSON) => {
  if (!this.isJSON(colorJSON)) return false;

  if (!("space" in colorJSON) || !("c1" in colorJSON) || !("c2" in colorJSON) || !("c3" in colorJSON)) return false;

  return this.checkColorInput(colorJSON.space, colorJSON.c1, colorJSON.c2, colorJSON.c3);
};

exports.checkColorInput = (space, c1, c2, c3) => {
  if (typeof space !== "string") return false;
  if (space.length != 3 && space !== "din99") return false;
  if (!this.checkColorSpaceNotation(space, false)[0]) return false;
  if (!this.isNumber(c1)) return false;
  if (!this.isNumber(c2)) return false;
  if (!this.isNumber(c3)) return false;

  switch (space) {
    case "rgb":
    case "hsv":
      if (!this.numInRange(c1, 0, 1)) return false;
      if (!this.numInRange(c2, 0, 1)) return false;
      if (!this.numInRange(c3, 0, 1)) return false;
      break;
  }

  return true;
};

exports.checkColorSpaceNotation = (space, allowCB) => {
  if (!this.isString(space)) return [false, undefined];

  //if (allowSpecial == undefined) allowSpecial = true;
  if (allowCB == undefined) allowCB = true;

  switch (space) {
    case "rgb_cb":
      return [true, allowCB ? "rgb_cb" : "rgb"];
    /*case "rgb_255":
      return [true, allowSpecial ? "rgb_255" : "rgb"];
    case "rgb_cb_255":
      return [true, allowSpecial && allowCB ? "rgb_cb_255" : "rgb"];
    case "rgb_hex":
      return [true, allowSpecial ? "rgb_hex" : "rgb"];
    case "rgb_cb_hex":
      return [true, allowSpecial && allowCB ? "rgb_cb_hex" : "rgb"];
    case "rgb_string":
      return [true, allowSpecial ? "rgb_string" : "rgb"];
    case "rgb_cb_string":
      return [true, allowSpecial && allowCB ? "rgb_cb_string" : "rgb"];*/
    case "RGB":
    case "rgb":
    case "Rgb":
      return [true, "rgb"];
    case "hsv_cb":
      return [true, allowCB ? "hsv_cb" : "hsv"];
    case "HSV":
    case "hsv":
    case "Hsv":
      return [true, "hsv"];
    case "lab_cb":
      return [true, allowCB ? "lab_cb" : "lab"];
    case "de94-ds":
    case "de2000-ds":
    case "LAB":
    case "lab":
    case "Lab":
      return [true, "lab"];
    case "lch_cb":
      return [true, allowCB ? "lch_cb" : "lch"];
    case "LCH":
    case "lch":
    case "Lch":
      return [true, "lch"];
    case "din99_cb":
      return [true, allowCB ? "din99_cb" : "din99"];
    case "DIN99":
    case "din99":
    case "Din99":
      return [true, "din99"];
    case "xyz_cb":
      return [true, allowCB ? "xyz_cb" : "xyz"];
    case "XYZ":
    case "xyz":
    case "Xyz":
      return [true, "xyz"];
    case "lms_cb":
      return [true, allowCB ? "lms_cb" : "lms"];
    case "LMS":
    case "lms":
    case "Lms":
      return [true, "lms"];
    default:
      return [false, undefined];
  }
};

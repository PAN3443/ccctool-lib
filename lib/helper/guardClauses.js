import { cccToolProperties } from "../properties.js";

export const isString = (_str) => {
  return typeof _str !== "string" ? false : true;
};

export const isNumber = (_value) => {
  return typeof _value === "number" && Number.isFinite(_value);
};

export const checkIndex = (_index, _arrayLength) => {
  if (!Number.isInteger(_index)) return false;
  if (_index < 0) return false;
  if (_index >= _arrayLength) return false;
  return true;
};

export const numInRange = (_val, _min, _max, _minIn, _maxIn) => {
  if (!(typeof _minIn === "boolean")) _minIn = true;
  if (!(typeof _maxIn === "boolean")) _maxIn = true;
  if (!isNumber(_val)) return false;
  if (!isNumber(_min)) return false;
  if (!isNumber(_max)) return false;

  switch (true) {
    case _minIn && _maxIn:
      if (_val >= _min && _val <= _max) return true;
      break;
    case !_minIn && _maxIn:
      if (_val > _min && _val <= _max) return true;
      break;
    case _minIn && !_maxIn:
      if (_val >= _min && _val < _max) return true;
      break;
    case !_minIn && !_maxIn:
      if (_val > _min && _val < _max) return true;
      break;
  }
  return false;
};

export const isJSON = (_item) => {
  _item = typeof _item !== "string" ? JSON.stringify(_item) : _item;
  try {
    _item = JSON.parse(_item);
  } catch (e) {
    return false;
  }

  if (typeof _item === "object" && _item !== null && !Array.isArray(_item)) {
    return true;
  }
  return false;
};
///////////////////////////////////
////// Special for Math //////////
///////////////////////////////////

export const checkMathResult = (_shouldVal, _isVal, _error) => {
  let terror = cccToolProperties.math_error;
  if (isNumber(_error)) terror = _error;
  if (!isNumber(_shouldVal)) throw new TypeError('Error (guardClauses) :: Function "checkMathResult" :: First parameter is not a number.');
  if (!isNumber(_isVal)) throw new TypeError('Error (guardClauses) :: Function "checkMathResult" :: Second parameter is not a number.');
  if (Math.abs(_shouldVal - _isVal) < terror) return true;
  return false;
};

export const isMathMatrix = (_matrix, _equalColRowSize) => {
  if (typeof _equalColRowSize !== "boolean") _equalColRowSize = false;
  if (!Array.isArray(_matrix)) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not an array.');
  if (_matrix.length == 0) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! The array is empty.');

  _matrix.forEach(function (_item, _index) {
    if (!Array.isArray(_item)) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! The row ' + index + " is not an array.");
    if (_item.length == 0) throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! The row ' + index + " is empty.");
  });

  let m1NumRows = _matrix.length,
    m1NumCols = _matrix[0].length;

  for (const row of _matrix) {
    if (row.length != m1NumCols)
      // row array length = number of cols
      throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! Inconsistent row lenghts.');
  }

  if (_equalColRowSize && m1NumRows != m1NumCols) {
    throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct. Rows and Columns have different sizes.');
  }

  for (let r = 0; r < m1NumRows; r++) {
    for (let c = 0; c < m1NumCols; c++) {
      if (!isNumber(_matrix[r][c])) {
        throw new TypeError('Error (guardClauses) :: Function "isMathMatrix" :: Input matrix is not correct! Entry [' + r + "][" + c + "] is not a number.");
      }
    }
  }

  return true;
};

export const isMathVector = (_vector) => {
  if (!Array.isArray(_vector)) throw new TypeError('Error (guardClauses) :: Function "isMathVector" :: Input vector is not an array.');
  if (_vector.length == 0) throw new TypeError('Error (guardClauses) :: Function "isMathVector" :: Input vector is not correct! The array is empty.');

  for (const elm of _vector) {
    if (!isNumber(elm)) throw new TypeError('Error (guardClauses) :: Function "isMathVector" :: Input vector is not correct! An entry is not a number.');
  }

  return true;
};

export const isMathVector_3D = (_vector) => {
  if (isMathVector(_vector)) {
    if (_vector.length == 3) return true;
  }

  return false;
};

///////////////////////////////////
////// Special for Color //////////
///////////////////////////////////

export const isColorJSON = (_colorJSON) => {
  if (!isJSON(_colorJSON)) return false;

  if (!("space" in _colorJSON) || !("c1" in _colorJSON) || !("c2" in _colorJSON) || !("c3" in _colorJSON)) return false;

  return checkColorInput(_colorJSON.space, _colorJSON.c1, _colorJSON.c2, _colorJSON.c3);
};

export const checkColorInput = (_space, _c1, _c2, _c3) => {
  if (_space === undefined && _c1 === undefined && _c2 === undefined && _c3 === undefined) return true;
  if (typeof _space !== "string") return false;
  if (_space.length != 3 && _space !== "din99") return false;
  if (!checkColorSpaceNotation(_space, false)[0]) return false;
  if (!isNumber(_c1)) return false;
  if (!isNumber(_c2)) return false;
  if (!isNumber(_c3)) return false;

  switch (_space) {
    case "rgb":
    case "hsv":
      if (!numInRange(_c1, 0, 1)) return false;
      if (!numInRange(_c2, 0, 1)) return false;
      if (!numInRange(_c3, 0, 1)) return false;
      break;
  }

  return true;
};

export const checkColorSpaceNotation = (_space, _allowCB) => {
  if (!isString(_space)) return [false, undefined];

  //if (allowSpecial == undefined) allowSpecial = true;
  if (_allowCB == undefined) _allowCB = true;

  switch (_space) {
    case "rgb_cb":
      return [true, _allowCB ? "rgb_cb" : "rgb"];
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
      return [true, _allowCB ? "hsv_cb" : "hsv"];
    case "HSV":
    case "hsv":
    case "Hsv":
      return [true, "hsv"];
    case "lab_cb":
      return [true, _allowCB ? "lab_cb" : "lab"];
    case "de94-ds":
    case "de2000-ds":
    case "LAB":
    case "lab":
    case "Lab":
      return [true, "lab"];
    case "lch_cb":
      return [true, _allowCB ? "lch_cb" : "lch"];
    case "LCH":
    case "lch":
    case "Lch":
      return [true, "lch"];
    case "din99_cb":
      return [true, _allowCB ? "din99_cb" : "din99"];
    case "DIN99":
    case "din99":
    case "Din99":
      return [true, "din99"];
    case "xyz_cb":
      return [true, _allowCB ? "xyz_cb" : "xyz"];
    case "XYZ":
    case "xyz":
    case "Xyz":
      return [true, "xyz"];
    case "lms_cb":
      return [true, _allowCB ? "lms_cb" : "lms"];
    case "LMS":
    case "lms":
    case "Lms":
      return [true, "lms"];
    default:
      return [false, undefined];
  }
};

export const checkInterpolationType = (_type) => {
  if (!isString(_type)) return false;
  if (_type === "linear") return true;
  if (_type === "spline") return true;
  return false;
};

export const isCMSKey = (_keyJSON) => {
  if (!isJSON(_keyJSON)) return false;

  if (!("cL" in _keyJSON)) return false;
  if (!("cR" in _keyJSON)) return false;
  if (!("ref" in _keyJSON)) return false;
  if (!("mot" in _keyJSON)) return false;
  if (!("isBur" in _keyJSON)) return false;

  if (!isNumber(_keyJSON.ref)) return false;
  if (!(isJSONEmpty(_keyJSON.cL) || _keyJSON.cL === undefined || isColorJSON(_keyJSON.cL))) return false;
  if (!(isJSONEmpty(_keyJSON.cR) || _keyJSON.cR === undefined || isColorJSON(_keyJSON.cR))) return false;

  return true;
};

export const isJSONEmpty = (_JSON) => {
  if (!isJSON(_JSON)) return false;
  return Object.keys(_JSON).length === 0;
};

export const isCMSJSON = (_cmsJSON) => {
  //// Critical ////
  if (!isJSON(_cmsJSON)) return false;
  if (!("keys" in _cmsJSON)) return false;
  if (!Array.isArray(_cmsJSON.keys)) return false;

  let lastIndex = _cmsJSON.keys.length - 1;
  for (let i = 0; i < _cmsJSON.keys.length; i++) {
    if (!isCMSKey(_cmsJSON.keys[i])) return false;
    // check key type
    switch (i) {
      case 0:
        if (isColorJSON(_cmsJSON.keys[i].cL)) {
          if (_cmsJSON.keys[i].cL.space != undefined && _cmsJSON.keys[i].cL.c1 != undefined && _cmsJSON.keys[i].cL.c2 != undefined && _cmsJSON.keys[i].cL.c3 != undefined) return false;
        } else if (_cmsJSON.keys[i].cL != undefined && !isJSONEmpty(_cmsJSON.keys[i].cL)) return false; // start key is nil or right key, both have a undefined left key color
        break;
      case lastIndex:
        if (isColorJSON(_cmsJSON.keys[i].cR)) {
          if (_cmsJSON.keys[i].cR.space != undefined && _cmsJSON.keys[i].cR.c1 != undefined && _cmsJSON.keys[i].cR.c2 != undefined && _cmsJSON.keys[i].cR.c3 != undefined) return false;
        } else if (_cmsJSON.keys[i].cR != undefined && !isJSONEmpty(_cmsJSON.keys[i].cR)) return false; // end key is left key (=> undefined right key color)
        if (isColorJSON(_cmsJSON.keys[i].cL)) {
          if (_cmsJSON.keys[i].cL.space === undefined || _cmsJSON.keys[i].cL.c1 === undefined || _cmsJSON.keys[i].cL.c2 === undefined || _cmsJSON.keys[i].cL.c3 === undefined) return false;
        } else if (_cmsJSON.keys[i].cL === undefined || isJSONEmpty(_cmsJSON.keys[i].cL)) return false; // end key is left key (=> defined left key color)
        break;
      default:
        if (isColorJSON(_cmsJSON.keys[i].cL)) {
          if (_cmsJSON.keys[i].cL.space === undefined || _cmsJSON.keys[i].cL.c1 === undefined || _cmsJSON.keys[i].cL.c2 === undefined || _cmsJSON.keys[i].cL.c3 === undefined) return false;
        } else if (_cmsJSON.keys[i].cL === undefined || isJSONEmpty(_cmsJSON.keys[i].cL)) return false; // only the start keys are allowed to have a undefined left color.
        break;
    }
  }

  //// Warning ////
  if (!("name" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "name". Use of default settings!');
  if (!("interpolationSpace" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "interpolationSpace". Use of default settings!');
  if (!("interpolationType" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "interpolationType". Use of default settings!');
  if (!("colorNaN" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "colorNaN". Use of default settings!');
  if (!("colorBelow" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "colorBelow". Use of default settings!');
  if (!("colorAbove" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "colorAbove". Use of default settings!');
  if (!("jnd" in _cmsJSON)) console.warn('Warning (CMS) :: Function "isCMSJSON" :: The CMS JSON file has no attribute "jnd". Use of default settings!');

  return true;
};

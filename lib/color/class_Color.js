//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class Color
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { checkColorSpaceNotation, checkColorInput, isColorJSON, isNumber } = require("../helper/guardClauses.js");
const colorConverter = require("./colorConverter.js");
const properties = require("../properties.js");

//////////////////////////////////////////////

class Color {
  //////// Private Varaibles ////////
  // use p_ as placeholder for # (# private variables are not supported by e.g. react)
  /*p_space = undefined;
  p_c1 = undefined;
  p_c2 = undefined;
  p_c3 = undefined;
  p_onlyRGBPossible = true;*/

  constructor(_space, _c1, _c2, _c3) {
    this.p_space = "rgb";
    this.p_c1 = 0;
    this.p_c2 = 0;
    this.p_c3 = 0;
    this.p_onlyRGBPossible = true;
    this.setColor(_space, _c1, _c2, _c3);
    this.resetConvertProperties();
  }

  changeColorSpace(_space) {
    let space = checkColorSpaceNotation(_space, false);
    if (!space[0]) throw new TypeError('Error (CCC_Color) :: Function "changeColorSpace" :: Unknown Colorspace.');
    let newColorJson = convertColorRecursiv({ space: this.p_space, c1: this.p_c1, c2: this.p_c2, c3: this.p_c3 }, space[1], false);
    this.p_space = newColorJson.space;
    this.p_c1 = newColorJson.c1;
    this.p_c2 = newColorJson.c2;
    this.p_c3 = newColorJson.c3;
  }

  resetConvertProperties() {
    this.DIN99KE = properties.DIN99KE;
    this.DIN99KCH = properties.DIN99KCH;
    this.REFX = properties.REFX; // if undefined use default
    this.REFY = properties.REFY; // if undefined use default
    this.REFZ = properties.REFZ; // if undefined use default
    this.TMRGB2XYZ = "TMRGB2XYZ::Default";
    this.TMXYZ2LMS = "TMXYZ2LMS::Default";
  }

  getConvertProperties() {
    let json = {};
    json.DIN99KE = this.DIN99KE;
    json.DIN99KCH = this.DIN99KCH;
    json.REFX = this.REFX;
    json.REFY = this.REFY;
    json.REFZ = this.REFZ;
    json.TMRGB2XYZ = this.TMRGB2XYZ;
    json.TMXYZ2LMS = this.TMXYZ2LMS;
    return json;
  }

  setConvertProperties(_convertProperties) {
    if (typeof _convertProperties !== "object") throw new TypeError('Error (CCC_Color) :: Function "setConvertProperties" :: Incorrect parameter.');

    // loop through
    for (const [key, value] of Object.entries(_convertProperties)) {
      if (this.hasOwnProperty(key)) {
        switch (key) {
          case "TMRGB2XYZ":
          case "TMXYZ2LMS":
            if (typeof value !== "string") {
              console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: The key ' + key + " has to be a number.");
              continue;
            }
            if (value.substring(0, 9) !== key) {
              // the name of the propertie need to be exist and it has to be correct (TMRGB2XYZ::... matrices for TMRGB2XYZ)
              console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: The key ' + key + " has to be a number.");
              continue;
            }
            if (!properties.hasOwnProperty(value)) {
              console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: There is no ' + key + "-Transformation Matrix with the name " + value + "!");
              continue;
            }
            break;
          default:
            if (!isNumber(value)) {
              console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: The key ' + key + " has to be a number.");
              continue;
            }
        }
        this[key] = value;
      } else console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: Unknown key ' + key + ".");
    }
  }

  setColor(_space, _c1, _c2, _c3) {
    if (!checkColorInput(_space, _c1, _c2, _c3)) throw new TypeError('Error (CCC_Color) :: Function "setColor" :: Unknown Color.'); // Reset to previouse values or rather to default {space:"rgb",c1:0,c2:0,c3:0}.');

    if (this.p_onlyRGBPossible && _space !== "lab" && _space !== "hsv") {
      let rgbJSON = convertColorRecursiv({ space: _space, c1: _c1, c2: _c2, c3: _c3 }, "rgb", false);
      let provedColor = convertColorRecursiv(rgbJSON, _space, false);
      this.p_space = provedColor.space;
      this.p_c1 = provedColor.c1;
      this.p_c2 = provedColor.c2;
      this.p_c3 = provedColor.c3;
    } else {
      this.p_space = _space;
      this.p_c1 = _c1;
      this.p_c2 = _c2;
      this.p_c3 = _c3;
    }
  }

  setColorJSON(_colorJSON) {
    if (!isColorJSON(_colorJSON)) throw new TypeError('Error (CCC_Color) :: Function "setColorJSON" :: Incorrect colorJSON.');
    this.setColor(_colorJSON.space, _colorJSON.c1, _colorJSON.c2, _colorJSON.c3);
  }

  getColorJSON(_wishColor, _convertProperties) {
    if (_convertProperties != undefined) this.setConvertProperties(convertProperties);

    if (_wishColor == undefined) _wishColor = this.p_space; // if no wishColor is set we use the p_space propertie of this class. If the wishcolor is set and wrong => throw error
    let newSpace = checkColorSpaceNotation(_wishColor, true);
    if (!newSpace[0]) throw new TypeError('Error (CCC_Color) :: Function "getColorJSON" :: Unknown colorspace.');
    return convertColorRecursiv({ space: this.p_space, c1: this.p_c1, c2: this.p_c2, c3: this.p_c3 }, _wishColor, false);
  }

  getRGBString(_doCB, _alpha) {
    let colorspace = _doCB ? "rgb_cb" : "rgb";
    let rgbJSON = convertColorRecursiv({ space: this.p_space, c1: this.p_c1, c2: this.p_c2, c3: this.p_c3 }, colorspace, false);
    if (_alpha != undefined) return "rgba(" + Math.round(rgbJSON.c1 * 255) + "," + Math.round(rgbJSON.c2 * 255) + "," + Math.round(rgbJSON.c3 * 255) + "," + _alpha + ")";
    else return "rgb(" + Math.round(rgbJSON.c1 * 255) + "," + Math.round(rgbJSON.c2 * 255) + "," + Math.round(rgbJSON.c3 * 255) + ")";
  }

  getRGBHex(_doCB) {
    let colorspace = _doCB ? "rgb_cb" : "rgb";
    let rgbJSON = convertColorRecursiv({ space: this.p_space, c1: this.p_c1, c2: this.p_c2, c3: this.p_c3 }, colorspace, false);
    return "#" + valueToHex(Math.round(rgbJSON.c1 * 255)) + valueToHex(Math.round(rgbJSON.c2 * 255)) + valueToHex(Math.round(rgbJSON.c3 * 255));
  }
}

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////

// Private function, which should only called with prooved parameters
function valueToHex(_val) {
  let hex = Number(_val).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

function convertColorRecursiv(_colorJSON, _wishColor, _isCB) {
  switch (_colorJSON.space) {
    case "rgb":
      switch (_wishColor) {
        case "rgb":
          return _colorJSON;
        case "rgb_cb":
          if (_isCB) return _colorJSON;
          else convertColorRecursiv(colorConverter.rgb2xyz(_colorJSON), _wishColor, _isCB);
        case "hsv":
          return convertColorRecursiv(colorConverter.rgb2hsv(_colorJSON), _wishColor, _isCB);
        case "hsv_cb":
          if (_isCB) return convertColorRecursiv(colorConverter.rgb2hsv(_colorJSON), _wishColor, _isCB); // if not => default
        default:
          return convertColorRecursiv(colorConverter.rgb2xyz(_colorJSON), _wishColor, _isCB);
      }
    case "hsv":
      switch (_wishColor) {
        case "hsv":
          return _colorJSON;
        case "hsv_cb":
          if (_isCB) return _colorJSON;
          else return convertColorRecursiv(colorConverter.hsv2rgb(_colorJSON), _wishColor, _isCB);
        default:
          return convertColorRecursiv(colorConverter.hsv2rgb(_colorJSON), _wishColor, _isCB);
      }
    case "lab":
      switch (_wishColor) {
        case "din99":
          return convertColorRecursiv(colorConverter.lab2din99(_colorJSON), _wishColor, _isCB);
        case "DIN99cb":
          if (_isCB) return convertColorRecursiv(colorConverter.lab2din99(), _wishColor, _isCB);
          else convertColorRecursiv(colorConverter.lab2xyz(_colorJSON), _wishColor, _isCB);
        case "lch":
          return convertColorRecursiv(colorConverter.lab2lch(_colorJSON), _wishColor, _isCB);
        case "lch_cb":
          if (_isCB) return convertColorRecursiv(colorConverter.lab2lch(), _wishColor, _isCB);
          else convertColorRecursiv(colorConverter.lab2xyz(_colorJSON), _wishColor, _isCB);
        case "lab":
          return _colorJSON;
        case "lab_cb":
          if (_isCB) return _colorJSON;
        default:
          return convertColorRecursiv(colorConverter.lab2xyz(_colorJSON), _wishColor, _isCB);
      }
    case "lch":
      switch (_wishColor) {
        case "lch":
          return _colorJSON;
        case "lch_cb":
          if (_isCB) return _colorJSON;
        default:
          return convertColorRecursiv(colorConverter.lch2lab(_colorJSON), _wishColor, _isCB);
      }
    case "din99":
      switch (_wishColor) {
        case "din99":
          return _colorJSON;
        case "DIN99cb":
          if (_isCB) return _colorJSON;
        default:
          return convertColorRecursiv(colorConverter.din992lab(_colorJSON), _wishColor, _isCB);
      }
    case "xyz":
      switch (_wishColor) {
        case "rgb":
        case "hsv":
          return convertColorRecursiv(colorConverter.xyz2rgb(_colorJSON), _wishColor, _isCB);
        case "rgb_cb":
        case "hsv_cb":
          if (_isCB) return convertColorRecursiv(colorConverter.xyz2rgb(_colorJSON), _wishColor, _isCB);
          else return convertColorRecursiv(colorConverter.xyz2lms(_colorJSON), _wishColor, _isCB);
        case "xyz":
          return _colorJSON;
        case "xyz_cb":
          if (_isCB) return _colorJSON;
          else return convertColorRecursiv(colorConverter.xyz2lms(_colorJSON), _wishColor, _isCB);
        case "lab":
        case "lch":
        case "din99":
          return convertColorRecursiv(colorConverter.xyz2lab(_colorJSON), _wishColor, _isCB);
        case "lab_cb":
        case "lch_cb":
        case "DIN99cb":
          if (_isCB) return convertColorRecursiv(colorConverter.xyz2lab(_colorJSON), _wishColor, _isCB);
          else return convertColorRecursiv(colorConverter.xyz2lms(_colorJSON), _wishColor, _isCB);
        default:
          return convertColorRecursiv(colorConverter.xyz2lms(_colorJSON), _wishColor, _isCB);
      }
    case "lms":
      switch (_wishColor) {
        case "lms":
          return _colorJSON;
        case "lms_cb":
        case "rgb_cb":
        case "hsv_cb":
        case "xyz_cb":
        case "lab_cb":
        case "lch_cb":
        case "DIN99cb":
          if (_isCB) return convertColorRecursiv(colorConverter.lms2xyz(_colorJSON), _wishColor, _isCB);
          else return convertColorRecursiv(colorConverter.lms2lms_cb(_colorJSON), _wishColor, true); // here important to set _isCB = true
        default:
          return convertColorRecursiv(colorConverter.lms2xyz(_colorJSON), _wishColor, true);
      }
  }
  // this should never happen. The methods calls itself recursiv until we reached the right colorspace in the switch!
  return undefined;
}

module.exports = {
  Color: Color,
};

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

class Color {
  //////// Private Varaibles ////////
  #space = undefined;
  #c1 = undefined;
  #c2 = undefined;
  #c3 = undefined;
  #onlyRGBPossible = true;

  constructor(_space, _c1, _c2, _c3) {
    this.#space = "rgb";
    this.#c1 = 0;
    this.#c2 = 0;
    this.#c3 = 0;
    this.#onlyRGBPossible = true;
    this.setColor(_space, _c1, _c2, _c3);
    this.resetConvertProperties();
  }

  changeColorSpace(cspace) {
    var space = checkColorSpaceNotation(cspace, false);
    if (!space[0]) throw new TypeError('Error (CCC_Color) :: Function "changeColorSpace" :: Unknown Colorspace.');
    var colorJSON = convertColorRecursiv({ space: this.#space, c1: this.#c1, c2: this.#c2, c3: this.#c3 }, space[1], false);
    this.#space = colorJSON.space;
    this.#c1 = colorJSON.c1;
    this.#c2 = colorJSON.c2;
    this.#c3 = colorJSON.c3;
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

  setConvertProperties(convertProperties) {
    if (typeof convertProperties !== "object") throw new TypeError('Error (CCC_Color) :: Function "setConvertProperties" :: Incorrect parameter.');

    // loop through
    for (const [key, value] of Object.entries(convertProperties)) {
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

    if (this.#onlyRGBPossible && _space !== "lab" && _space !== "hsv") {
      let rgbJSON = convertColorRecursiv({ space: _space, c1: _c1, c2: _c2, c3: _c3 }, "rgb", false);
      let provedColor = convertColorRecursiv(rgbJSON, _space, false);
      this.#space = provedColor.space;
      this.#c1 = provedColor.c1;
      this.#c2 = provedColor.c2;
      this.#c3 = provedColor.c3;
    } else {
      this.#space = _space;
      this.#c1 = _c1;
      this.#c2 = _c2;
      this.#c3 = _c3;
    }
  }

  setColorJSON(colorJSON) {
    if (!isColorJSON(colorJSON)) throw new TypeError('Error (CCC_Color) :: Function "setColorJSON" :: Incorrect colorJSON.');
    this.setColor(colorJSON.space, colorJSON.c1, colorJSON.c2, colorJSON.c3);
  }

  getColorJSON(wishColor, convertProperties) {
    if (convertProperties != undefined) this.setConvertProperties(convertProperties);

    if (wishColor == undefined) wishColor = this.#space; // if no wishColor is set we use the #space propertie of this class. If the wishcolor is set and wrong => throw error
    var newSpace = checkColorSpaceNotation(wishColor, true);
    if (!newSpace[0]) throw new TypeError('Error (CCC_Color) :: Function "getColorJSON" :: Unknown colorspace.');
    return convertColorRecursiv({ space: this.#space, c1: this.#c1, c2: this.#c2, c3: this.#c3 }, wishColor, false);
  }

  getRGBString(doCB) {
    let colorspace = doCB ? "rgb_cb" : "rgb";
    let rgbJSON = convertColorRecursiv({ space: this.#space, c1: this.#c1, c2: this.#c2, c3: this.#c3 }, colorspace, false);
    return "rgb(" + Math.round(rgbJSON.c1 * 255) + "," + Math.round(rgbJSON.c2 * 255) + "," + Math.round(rgbJSON.c3 * 255) + ")";
  }

  getRGBHex(doCB) {
    let colorspace = doCB ? "rgb_cb" : "rgb";
    let rgbJSON = convertColorRecursiv({ space: this.#space, c1: this.#c1, c2: this.#c2, c3: this.#c3 }, colorspace, false);
    return "#" + valueToHex(Math.round(rgbJSON.c1 * 255)) + valueToHex(Math.round(rgbJSON.c2 * 255)) + valueToHex(Math.round(rgbJSON.c3 * 255));
  }
}

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////

// Private function, which should only called with prooved parameters
function valueToHex(val) {
  let hex = Number(val).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

function convertColorRecursiv(colorJSON, wishColor, isCB) {
  switch (colorJSON.space) {
    case "rgb":
      switch (wishColor) {
        case "rgb":
          return colorJSON;
        case "rgb_cb":
          if (isCB) return colorJSON; // if not => default
        default:
        case "hsv":
          return convertColorRecursiv(colorConverter.rgb2hsv(colorJSON), wishColor, isCB);
        case "hsv_cb":
          if (isCB) return convertColorRecursiv(colorConverter.rgb2hsv(colorJSON), wishColor, isCB); // if not => default
          // rgb has onlye the option rgb2hsv and rgb2xyz
          return convertColorRecursiv(colorConverter.rgb2xyz(colorJSON), wishColor, isCB);
      }
    case "hsv":
      switch (wishColor) {
        case "hsv":
          return colorJSON;
        case "hsv_cb":
          if (isCB) return colorJSON; // if not => default
        default:
          return convertColorRecursiv(colorConverter.hsv2rgb(colorJSON), wishColor, isCB);
      }
    case "lab":
      switch (wishColor) {
        case "din99":
          return convertColorRecursiv(colorConverter.lab2din99(colorJSON), wishColor, isCB);
        case "DIN99cb":
          if (isCB) return convertColorRecursiv(colorConverter.lab2din99(), wishColor, isCB);
          else convertColorRecursiv(colorConverter.lab2xyz(colorJSON), wishColor, isCB);
        case "lch":
          return convertColorRecursiv(colorConverter.lab2lch(colorJSON), wishColor, isCB);
        case "lch_cb":
          if (isCB) return convertColorRecursiv(colorConverter.lab2lch(), wishColor, isCB);
          else convertColorRecursiv(colorConverter.lab2xyz(colorJSON), wishColor, isCB);
        case "lab":
          return colorJSON;
        case "lab_cb":
          if (isCB) return colorJSON;
        default:
          return convertColorRecursiv(colorConverter.lab2xyz(colorJSON), wishColor, isCB);
      }
    case "lch":
      switch (wishColor) {
        case "lch":
          return colorJSON;
        case "lch_cb":
          if (isCB) return colorJSON;
        default:
          return convertColorRecursiv(colorConverter.lch2lab(colorJSON), wishColor, isCB);
      }
    case "din99":
      switch (wishColor) {
        case "din99":
          return colorJSON;
        case "DIN99cb":
          if (isCB) return colorJSON;
        default:
          return convertColorRecursiv(colorConverter.din992lab(colorJSON), wishColor, isCB);
      }
    case "xyz":
      switch (wishColor) {
        case "rgb":
        case "hsv":
          return convertColorRecursiv(colorConverter.xyz2rgb(colorJSON), wishColor, isCB);
        case "rgb_cb":
        case "hsv_cb":
          if (isCB) return convertColorRecursiv(colorConverter.xyz2rgb(colorJSON), wishColor, isCB);
          else return convertColorRecursiv(colorConverter.xyz2lms(colorJSON), wishColor, isCB);
        case "xyz":
          return colorJSON;
        case "xyz_cb":
          if (isCB) return colorJSON;
          else return convertColorRecursiv(colorConverter.xyz2lms(colorJSON), wishColor, isCB);
        case "lab":
        case "lch":
        case "din99":
          return convertColorRecursiv(colorConverter.xyz2lab(colorJSON), wishColor, isCB);
        case "lab_cb":
        case "lch_cb":
        case "DIN99cb":
          if (isCB) return convertColorRecursiv(colorConverter.xyz2lab(colorJSON), wishColor, isCB);
          else return convertColorRecursiv(colorConverter.xyz2lms(colorJSON), wishColor, isCB);
        default:
          return convertColorRecursiv(colorConverter.xyz2lms(colorJSON), wishColor, isCB);
      }
    case "lms":
      switch (wishColor) {
        case "lms":
          return colorJSON;
        case "lms_cb":
        case "rgb_cb":
        case "hsv_cb":
        case "xyz_cb":
        case "lab_cb":
        case "lch_cb":
        case "DIN99cb":
          if (isCB) return convertColorRecursiv(colorConverter.lms2xyz(colorJSON), wishColor, isCB);
          else return convertColorRecursiv(colorConverter.lms2lms_cb(colorJSON), wishColor, true); // here important to set isCB = true
        default:
          return convertColorRecursiv(colorConverter.lms2xyz(colorJSON), wishColor, true);
      }
  }
  // this should never happen. The methods calls itself recursiv until we reached the right colorspace in the switch!
  return undefined;
}

module.exports = {
  Color: Color,
};

//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class Color
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { checkColorInput, isColorJSON, isNumber } = require("../helper/guardClauses.js");
const colorConverter = require("./colorConverter.js");
const properties = require("../properties.js");

function CCC_Color(space, c1, c2, c3) {
  this.space = "rgb";
  this.c1 = 0;
  this.c2 = 0;
  this.c3 = 0;
  this.resetConvertProperties();
  this.setColor(space, c1, c2, c3);
  this.onlyRGBPossible = true;
}

CCC_Color.prototype.changeColorSpace = function (cspace) {
  var space = checkColorSpaceNotation(cspace, false);
  if (!space[0]) throw new TypeError('Error (CCC_Color) :: Function "changeColorSpace" :: Unknown Colorspace.');
  var colorJSON = convertColorRecursiv({ space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 }, space[1], false);
  this.space = colorJSON.space;
  this.c1 = colorJSON.c1;
  this.c2 = colorJSON.c2;
  this.c3 = colorJSON.c3;
};

CCC_Color.prototype.resetConvertProperties = function () {
  this.DIN99KE = properties.DIN99KE;
  this.DIN99KCH = properties.DIN99KCH;
  this.REFX = properties.REFX; // if undefined use default
  this.REFY = properties.REFY; // if undefined use default
  this.REFZ = properties.REFZ; // if undefined use default
  this.TMRGB2XYZ = "TMRGB2XYZ::Default";
  this.TMXYZ2LMS = "TMXYZ2LMS::Default";
};

CCC_Color.prototype.setConvertProperties = function (convertProperties) {
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
};

CCC_Color.prototype.setColor = function (space, c1, c2, c3) {
  if (!checkColorInput(space, c1, c2, c3)) throw new TypeError('Error (CCC_Color) :: Function "setColor" :: Unknown Color.'); // Reset to previouse values or rather to default {space:"rgb",c1:0,c2:0,c3:0}.');

  if (this.onlyRGBPossible && space !== "lab" && space !== "hsv") {
    let rgbJSON = convertColorRecursiv({ space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 }, "rgb", false);
    let provedColor = convertColorRecursiv(rgbJSON, space, false);
    this.space = provedColor.space;
    this.c1 = provedColor.c1;
    this.c2 = provedColor.c2;
    this.c3 = provedColor.c3;
  } else {
    this.space = space;
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
  }
};

CCC_Color.prototype.setColorJSON = function (colorJSON) {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (CCC_Color) :: Function "setColorJSON" :: Incorrect colorJSON.');
  this.setColor(colorJSON.space, colorJSON.c1, colorJSON.c2, colorJSON.c3);
};

CCC_Color.prototype.getColorJSON = function (wishColor, convertProperties) {
  if (convertProperties != undefined) this.setConvertProperties(convertProperties);

  var space = checkColorSpaceNotation(wishColor, true);
  if (typeof convertProperties === "object") {
    // check key names
  }
  if (!space[0]) throw new TypeError('Error (CCC_Color) :: Function "getColorJSON" :: Unknown colorspace.');
  return convertColorRecursiv({ space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 }, wishColor, false);
};

CCC_Color.prototype.getRGBString = function (doCB) {
  let colorspace = doCB ? "rgb_cb" : "rgb";
  let rgbJSON = convertColorRecursiv({ space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 }, colorspace, false);
  return "rgb(" + Math.round(rgbJSON.c1 * 255) + "," + Math.round(rgbJSON.c2 * 255) + "," + Math.round(rgbJSON.c3 * 255) + ")";
};

CCC_Color.prototype.getRGBHex = function (doCB) {
  let colorspace = doCB ? "rgb_cb" : "rgb";
  let rgbJSON = convertColorRecursiv({ space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 }, colorspace, false);
  return "#" + valueToHex(Math.round(rgbJSON.c1 * 255)) + valueToHex(Math.round(rgbJSON.c2 * 255)) + valueToHex(Math.round(rgbJSON.c3 * 255));
};

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
  CCC_Color: CCC_Color,
};

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
}

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
  // loop through
  for (const [key, value] of Object.entries(convertProperties)) {
    if (properties.hasOwnProperty(key)) {
      switch (key) {
        case "TMRGB2XYZ":
        case "TMXYZ2LMS":
          if (typeof value !== "string") {
            console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: The key ' + key + " has to be a number.");
            continue;
          }
          if (value.substring(2, 9) !== key) {
            // the name of the propertie need to be exist and it has to be correct (TMRGB2XYZ::... matrices for TMRGB2XYZ)
            console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: The key ' + key + " has to be a number.");
            continue;
          }
          if (properties.hasOwnProperty(value)) {
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
    } else console.warn('Warning (CCC_Color) :: Function "setConvertProperties" :: Unknown key ' + key);
  }
};

CCC_Color.prototype.setColor = function (space, c1, c2, c3) {
  if (!checkColorInput(space, c1, c2, c3)) throw new TypeError('Error (CCC_Color) :: Function "setColor" :: Unknown Color.'); // Reset to previouse values or rather to default {space:"rgb",c1:0,c2:0,c3:0}.');
  this.space = space;
  this.c1 = c1;
  this.c2 = c2;
  this.c3 = c3;
};

CCC_Color.prototype.setColorJSON = function (colorJSON) {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (CCC_Color) :: Function "setColorJSON" :: Incorrect colorJSON.');
  this.setColor(colorJSON.space, colorJSON.c1, colorJSON.c2, colorJSON.c3);
};

CCC_Color.prototype.getColorJSON = function (wishColor, convertProperties) {
  var space = checkColorSpaceNotation(wishColor, true);
  if (typeof convertProperties === "object") {
    // check key names
  }
  if (!space[0]) throw new TypeError('Error (CCC_Color) :: Function "getColorJSON" :: Unknown colorspace.');
  return convertColorRecursiv({ space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 }, wishColor, false);
};

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////

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

/*CCC_Color.prototype.getRGBString = function (doCB) {
  try {
    let colorspace = doCB ? "rgb_cb_string" : "rgb_string";
    return transferColor(colorspace, { space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 });
  } finally {
    console.error('\tError :: CCC_Color :: Function "getRGBString"');
    return undefined;
  }
  // no catch here, because we need to catch it, in the function with called the getColorJSON function.
};

CCC_Color.prototype.getRGBHex = function (doCB) {
  try {
    let colorspace = doCB ? "rgb_hex" : "rgb_cb_hex";
    return transferColor(colorspace, { space: this.space, c1: this.c1, c2: this.c2, c3: this.c3 });
  } finally {
    console.error('\tError :: CCC_Color :: Function "getRGBHex"');
    return undefined;
  }
  // no catch here, because we need to catch it, in the function with called the getColorJSON function.
};

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////

// Private function, which should only called with prooved parameters
function transferColor(newSpace, colorJson) {
  
}

function rgb2rgbHex(c_R, c_G, c_B) {
  return "#" + valueToHex(Math.round(c_R * 255)) + valueToHex(Math.round(c_G * 255)) + valueToHex(Math.round(c_B * 255));
}

function rgb2rgbString(c_R, c_G, c_B) {
  return "rgb(" + Math.round(c_R * 255) + "," + Math.round(c_G * 255) + "," + Math.round(c_B * 255) + ")";
}

function valueToHex(val) {
  let hex = Number(val).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

function checkJSONFormat(colorJSON) {
  let doIt = true;
  doIt = colorJSON.hasOwnProperty("space") === true ? true : false;
  doIt = colorJSON.hasOwnProperty("c1") === true ? true : false;
  doIt = colorJSON.hasOwnProperty("c2") === true ? true : false;
  doIt = colorJSON.hasOwnProperty("c3") === true ? true : false;
  return doIt;
}

function checkColorInput(space, c1, c2, c3) {
  let colorJSON = {};

  // In case of an error -> reset to the current variables.
  new_space = this.space;
  new_c1 = this.c1;
  new_c2 = this.c2;
  new_c3 = this.c3;
  try {
    if (isNaN(c1)) throw new Error("Incorrect Input. Numbers are expected for the CCC_Color parameter c1! Reset to previouse values.");
    if (isNaN(c2)) throw new Error("Incorrect Input. Numbers are expected for the CCC_Color parameter c2! Reset to previouse values.");
    if (isNaN(c3)) throw new Error("Incorrect Input. Numbers are expected for the CCC_Color parameter c3! Reset to previouse values.");

    if (spaceof space !== "string") {
      throw new Error("Incorrect Input. Strings are expected for the CCC_Color parameter space! Reset to previouse values.");
    } else {
      new_space = checkColorspaceNotation(space, false, false);

      let rgbPossibles = getRGBPossible(new_space, c1, c2, c3);
      // first update the three variales to the (changed or unchanged) rgbPossibles
      new_c1 = rgbPossibles.c1;
      new_c2 = rgbPossibles.c2;
      new_c3 = rgbPossibles.c3;

      let statusC1 = rgbPossibles.cc1 ? "unchanged" : "changed (" + c1 + "=>" + new_c1 + ")";
      let statusC2 = rgbPossibles.cc2 ? "unchanged" : "changed (" + c2 + "=>" + new_c2 + ")";
      let statusC3 = rgbPossibles.cc3 ? "unchanged" : "changed (" + c3 + "=>" + new_c3 + ")";
      if (!statusC1 || !statusC2 || !statusC3) throw new Error("Set color is not a RGB-Possible color! Applied Auto Clipping : \nC1===>" + statusC1 + ",\nC2===>" + statusC2 + ",\nC3===>" + statusC3);

      colorJSON.noError = true;
      colorJSON.space = new_space;
      colorJSON.c1 = new_c1;
      colorJSON.c2 = new_c2;
      colorJSON.c3 = new_c3;
      return colorJSON;
    }
  } catch (e) {
    console.error('\tError :: CCC_Color :: Function "checkColorInput" ::', e.message);
    colorJSON.noError = false;
    colorJSON.space = new_space;
    colorJSON.c1 = new_c1;
    colorJSON.c2 = new_c2;
    colorJSON.c3 = new_c3;
    return colorJSON;
  }
}

function getRGBPossible(space, c1, c2, c3) {
  let rgbPossibles = {};
  rgbPossibles.cc1 = true; // correct c1
  rgbPossibles.c1 = c1;
  rgbPossibles.cc2 = true; // correct c2
  rgbPossibles.c2 = c2;
  rgbPossibles.cc3 = true; // correct c3
  rgbPossibles.c3 = c3;
  return rgbPossibles;
}//*/

module.exports = {
  CCC_Color: CCC_Color,
};

//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Class Color
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { checkColorInput, isColorJSON } = require("../helper/guardClauses.js");
//const colorConverter = require("./lib/color/colorConverter.js");

function CCC_Color(space, c1, c2, c3) {
  this.space = "rgb";
  this.c1 = 0;
  this.c2 = 0;
  this.c3 = 0;
  this.setColor(space, c1, c2, c3);
}

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

/*CCC_Color.prototype.getColorJSON = function (colorspace) {
  switch (colorJson.space) {
    case "rgb":
      switch (newSpace) {
        case "rgb":
          return colorJson;
        case "rgb_hex":
          return rgb2rgbHex(c1, c2, c3);
        case "rgb_string":
          return rgb2rgbString(c1, c2, c3);
        case "hsv":
          return transferColor(newSpace, converter.rgb2hsv(colorJson));
        default:
          // rgb has onlye the option rgb2hsv and rgb2xyz
          return transferColor(newSpace, converter.rgb2xyz(colorJson));
      }
    case "rgb_cb":
    // rgb colorblind is the end, -> only check rgb output variations
    case "hsv":

    case "lab":

    case "lch":

    case "din99":

    case "xyz":

    case "lms":
  }
  // this should never happen. The methods calls itself recursiv until we reached the right colorspace in the switch!
  return undefined;
  /*switch (space) {
    case "rgb":
      return ["rgb", this.val_1_rgb, this.val_2_rgb, this.val_3_rgb];
    case "rgb_cb":
      return ["rgb", this.val_1_rgb_cb, this.val_2_rgb_cb, this.val_3_rgb_cb];
    case "HSV":
    case "hsv":
    case "Hsv":
      return ["hsv", this.val_1_hsv, this.val_2_hsv, this.val_3_hsv];
    case "LAB":
    case "lab":
    case "Lab":
    case "de94-ds":
    case "de2000-ds":
      return ["lab", this.val_1_lab, this.val_2_lab, this.val_3_lab];
    case "LCH":
    case "lch":
    case "Lch":
      return ["lch", this.val_1_lch, this.val_2_lch, this.val_3_lch];
    case "DIN99":
    case "din99":
    case "Din99":
      return ["din99", this.val_1_din99, this.val_2_din99, this.val_3_din99];
    case "XYZ":
    case "xyz":
    case "Xyz":
      return ["xyz", this.val_1_xyz, this.val_2_xyz, this.val_3_xyz];
    case "LMS":
    case "lms":
    case "Lms":
      return ["lms", this.val_1_lms, this.val_2_lms, this.val_3_lms];
    case "rgb_string":

    case "rgb_cb_string":
      return "rgb(" + Math.round(this.val_1_rgb_cb * 255) + "," + Math.round(this.val_2_rgb_cb * 255) + "," + Math.round(this.val_3_rgb_cb * 255) + ")";
    case "rgb_hex":
      var rhex = valueToHex(Math.round(this.val_1_rgb * 255));
      var ghex = valueToHex(Math.round(this.val_2_rgb * 255));
      var bhex = valueToHex(Math.round(this.val_3_rgb * 255));
      return "#" + rhex + ghex + bhex;
    case "rgb_cb_hex":
      var rhex = valueToHex(Math.round(this.val_1_rgb_cb * 255));
      var ghex = valueToHex(Math.round(this.val_2_rgb_cb * 255));
      var bhex = valueToHex(Math.round(this.val_3_rgb_cb * 255));
  }* /
  
};

CCC_Color.prototype.getRGBString = function (doCB) {
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

//////////////////////////////////////////////
//-------------- Class Color --------------//
//////////////////////////////////////////////
function CCC_Color(type, c1, c2, c3) {
  this.type = "rgb";
  this.c1 = 0;
  this.c2 = 0;
  this.c3 = 0;
  this.setColor(type, c1, c2, c3);
}

CCC_Color.prototype.setColor = function (type, c1, c2, c3) {
  let provedVars = checkAndSetInput(type, c1, c2, c3);
  this.type = provedVars.type;
  this.c1 = provedVars.c1;
  this.c2 = provedVars.c2;
  this.c3 = provedVars.c3;
  return provedVars.noError;
};

CCC_Color.prototype.setColorJSON = function (colorJSON) {
  let doIt = true;
  doIt = colorJSON.hasOwnProperty("type") === true ? true : false;
  doIt = colorJSON.hasOwnProperty("c1") === true ? true : false;
  doIt = colorJSON.hasOwnProperty("c2") === true ? true : false;
  doIt = colorJSON.hasOwnProperty("c3") === true ? true : false;

  if (doIt) {
    return this.setColor(colorJSON.type, colorJSON.c1, colorJSON.c2, colorJSON.c3);
  } else {
    try {
      throw new Error("Incorrect JSON format.");
    } catch (error) {
      console.error('\tError :: CCC_Color :: Function "setColorJSON" ::', e.message);
      return false;
    }
  }
};

CCC_Color.prototype.getColorJSON = function () {
  let colorJSON = {};
  colorJSON.type = this.type;
  colorJSON.c1 = this.c1;
  colorJSON.c2 = this.c2;
  colorJSON.c3 = this.c3;
};

////////////////////////////////////////////////////
//-------------- Private Functions --------------//
///////////////////////////////////////////////////

function checkAndSetInput(type, c1, c2, c3) {
  let colorJSON = {};

  // In case of an error -> reset to the current variables.
  new_space = this.type;
  new_c1 = this.c1;
  new_c2 = this.c2;
  new_c3 = this.c3;
  try {
    if (isNaN(c1)) throw new Error("Incorrect Input. Numbers are expected for the CCC_Color parameter c1! Reset to previouse values.");
    if (isNaN(c2)) throw new Error("Incorrect Input. Numbers are expected for the CCC_Color parameter c2! Reset to previouse values.");
    if (isNaN(c3)) throw new Error("Incorrect Input. Numbers are expected for the CCC_Color parameter c3! Reset to previouse values.");

    if (typeof type !== "string") {
      throw new Error("Incorrect Input. Strings are expected for the CCC_Color parameter type! Reset to previouse values.");
    } else {
      switch (type) {
        case "RGB":
        case "rgb":
        case "Rgb":
          new_space = "rgb";
          break;
        case "HSV":
        case "hsv":
        case "Hsv":
          new_space = "hsv";
          break;
        case "LAB":
        case "lab":
        case "Lab":
        case "de94-ds":
        case "de2000-ds":
          new_space = "lab";
          break;
        case "LCH":
        case "lch":
        case "Lch":
          new_space = "lch";
          break;
        case "DIN99":
        case "din99":
        case "Din99":
          new_space = "din99";
          break;
        case "XYZ":
        case "xyz":
        case "Xyz":
          new_space = "xyz";
          break;
        case "LMS":
        case "lms":
        case "Lms":
          new_space = "lms";
          break;
        default:
          throw new Error('Unknown color space "' + type + '" for the CCC_Color parameter type! Reset to previouse values.');
      }
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
      colorJSON.type = new_space;
      colorJSON.c1 = new_c1;
      colorJSON.c2 = new_c2;
      colorJSON.c3 = new_c3;
      return colorJSON;
    }
  } catch (e) {
    console.error('\tError :: CCC_Color :: Function "checkAndSetInput" ::', e.message);
    colorJSON.noError = false;
    colorJSON.type = new_space;
    colorJSON.c1 = new_c1;
    colorJSON.c2 = new_c2;
    colorJSON.c3 = new_c3;
    return colorJSON;
  }
}

function getRGBPossible(type, c1, c2, c3) {
  let rgbPossibles = {};
  rgbPossibles.cc1 = true; // correct c1
  rgbPossibles.c1 = c1;
  rgbPossibles.cc2 = true; // correct c2
  rgbPossibles.c2 = c2;
  rgbPossibles.cc3 = true; // correct c3
  rgbPossibles.c3 = c3;
  return rgbPossibles;
}

module.exports = {
  CCC_Color: CCC_Color,
};

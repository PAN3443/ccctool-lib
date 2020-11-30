//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Color Converstion Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isNumber, isColorJSON } = require("../helper/guardClauses.js");
const { mXv } = require("../helper/math.js");

const properties = require("../properties.js");

exports.hsv2rgb = (colorJSON) => {
  checkInput(colorJSON, "hsv", "hsv2rgb");

  let r,
    g,
    b = undefined;
  let i = Math.floor(colorJSON.c1 * 6); // h value of hsv
  let f = colorJSON.c1 * 6 - i;
  let p = colorJSON.c3 * (1 - colorJSON.c2);
  let q = colorJSON.c3 * (1 - f * colorJSON.c2);
  let t = colorJSON.c3 * (1 - (1 - f) * colorJSON.c2);

  switch (i % 6) {
    case 0:
      (r = colorJSON.c3), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = colorJSON.c3), (b = p);
      break;
    case 2:
      (r = p), (g = colorJSON.c3), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = colorJSON.c3);
      break;
    case 4:
      (r = t), (g = p), (b = colorJSON.c3);
      break;
    case 5:
      (r = colorJSON.c3), (g = p), (b = q);
      break;
  }

  return { space: "rgb", c1: r, c2: g, c3: b };
};

exports.rgb2hsv = (colorJSON) => {
  checkInput(colorJSON, "rgb", "rgb2hsv");

  let max = Math.max(colorJSON.c1, colorJSON.c2, colorJSON.c3),
    min = Math.min(colorJSON.c1, colorJSON.c2, colorJSON.c3);
  let h,
    s,
    v = max;

  let d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case colorJSON.c1:
        h = (colorJSON.c2 - colorJSON.c3) / d + (colorJSON.c2 < colorJSON.c3 ? 6 : 0);
        break;
      case colorJSON.c2:
        h = (colorJSON.c3 - colorJSON.c1) / d + 2;
        break;
      case colorJSON.c3:
        h = (colorJSON.c1 - colorJSON.c2) / d + 4;
        break;
    }
    h /= 6;
  }

  return { space: "hsv", c1: h, c2: s, c3: v };
};

exports.rgb2xyz = (colorJSON, tm_name) => {
  checkInput(colorJSON, "rgb", "rgb2xyz");
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "rgb2xyz" :: Incorrect colorJSON.');
  if (colorJSON.space !== "rgb") throw new TypeError('Error (colorConverter) :: Function "rgb2xyz" :: Incorrect format. No RGB color.');

  let tmxyz_Selected = getTransferMatrix("rgb2xyz", tm_name);
  let var_R = colorJSON.c1;
  let var_G = colorJSON.c2;
  let var_B = colorJSON.c3;

  // remove standard gamma correction
  if (var_R > 0.04045) var_R = Math.pow((var_R + 0.055) / 1.055, 2.4);
  else var_R = var_R / 12.92;
  if (var_G > 0.04045) var_G = Math.pow((var_G + 0.055) / 1.055, 2.4);
  else var_G = var_G / 12.92;
  if (var_B > 0.04045) var_B = Math.pow((var_B + 0.055) / 1.055, 2.4);
  else var_B = var_B / 12.92;

  var_R = var_R * 100;
  var_G = var_G * 100;
  var_B = var_B * 100;

  let var_xyz = mXv(tmxyz_Selected, [var_R, var_G, var_B]);

  return { space: "xyz", c1: var_xyz[0], c2: var_xyz[1], c3: var_xyz[2] };
};

exports.xyz2rgb = (colorJSON) => {
  checkInput(colorJSON, "xyz", "xyz2rgb");

  let var_X = colorJSON.c1 / 100.0;
  let var_Y = colorJSON.c2 / 100.0;
  let var_Z = colorJSON.c3 / 100.0;

  let var_rgb = mXv(tmxyz_Selected_Inv, [var_X, var_Y, var_Z]);

  //apply standard gamma correction
  if (var_rgb[0] > 0.0031308) var_rgb[0] = 1.055 * Math.pow(var_rgb[0], 1.0 / 2.4) - 0.055;
  else var_rgb[0] = 12.92 * var_R;
  if (var_rgb[1] > 0.0031308) var_rgb[1] = 1.055 * Math.pow(var_rgb[1], 1.0 / 2.4) - 0.055;
  else var_rgb[1] = 12.92 * var_rgb[1];
  if (var_rgb[2] > 0.0031308) var_rgb[2] = 1.055 * Math.pow(var_rgb[2], 1.0 / 2.4) - 0.055;
  else var_rgb[2] = 12.92 * var_rgb[2];

  // rgb - Clipping
  if (var_rgb[0] > 1.0 || var_rgb[1] > 1.0 || var_rgb[2] > 1.0 || var_rgb[0] < 0.0 || var_rgb[1] < 0.0 || var_rgb[2] < 0.0) {
    // Wrong rgb -Values
    if (var_rgb[0] > 1.0) {
      var_rgb[0] = 1.0;
    }
    if (var_rgb[1] > 1.0) {
      var_rgb[1] = 1.0;
    }
    if (var_rgb[2] > 1.0) {
      var_rgb[2] = 1.0;
    }
    if (var_rgb[0] < 0.0) {
      var_rgb[0] = 0.0;
    }
    if (var_rgb[1] < 0.0) {
      var_rgb[1] = 0.0;
    }
    if (var_rgb[2] < 0.0) {
      var_rgb[2] = 0.0;
    }
  }

  return { space: "rgb", c1: var_rgb[0], c2: var_rgb[1], c3: var_rgb[2] };
};

exports.xyz2lab = (colorJSON, pcielab_ref_X, pcielab_ref_Y, pcielab_ref_Z) => {
  if (!isNumber(pcielab_ref_X)) pcielab_ref_X = properties.cielab_ref_X; // if undefined use default
  if (!isNumber(pcielab_ref_Y)) pcielab_ref_Y = properties.cielab_ref_Y; // if undefined use default
  if (!isNumber(pcielab_ref_Z)) pcielab_ref_Z = properties.cielab_ref_Z; // if undefined use default

  checkInput(colorJSON, "xyz", "xyz2lab");

  let var_X = colorJSON.c3 / pcielab_ref_X;
  let var_Y = colorJSON.c3 / pcielab_ref_Y;
  let var_Z = colorJSON.c3 / pcielab_ref_Z;

  if (var_X > 0.008856) var_X = Math.pow(var_X, 1 / 3);
  else var_X = 7.787 * var_X + 16 / 116;
  if (var_Y > 0.008856) var_Y = Math.pow(var_Y, 1 / 3);
  else var_Y = 7.787 * var_Y + 16 / 116;
  if (var_Z > 0.008856) var_Z = Math.pow(var_Z, 1 / 3);
  else var_Z = 7.787 * var_Z + 16 / 116;

  let var_L = 116 * var_Y - 16;
  let var_a = 500 * (var_X - var_Y);
  let var_b = 200 * (var_Y - var_Z);

  return { space: "lab", c1: var_L, c2: var_a, c3: var_b };
};

exports.xyz2lms = (colorJSON) => {
  checkInput(colorJSON, "xyz", "xyz2lms");
  let var_lms = mXv(tmlms_Selected, [colorJSON.c1, colorJSON.c2, colorJSON.c3]);
  return { space: "lms", c1: var_lms[0], c2: var_lms[1], c3: var_lms[2] };
};

exports.lms2xyz = (colorJSON) => {
  checkInput(colorJSON, "lms", "lms2xyz");
  let var_xyz = mXv(tmlms_Selected_Inv, [colorJSON.c1, colorJSON.c2, colorJSON.c3]);
  return { space: "xyz", c1: var_xyz[0], c2: var_xyz[1], c3: var_xyz[2] };
};

exports.lms2lms_CB = (colorJSON) => {
  checkInput(colorJSON, "lms", "lms2lms_CB");
  let var_lms_cb = mXv(sim_AdaptiveColorblindness, [colorJSON.c1, colorJSON.c2, colorJSON.c3]);
  return { space: "lms", c1: var_lms_cb[0], c2: var_lms_cb[1], c3: var_lms_cb[2] };
};

exports.lab2xyz = (colorJSON, pcielab_ref_X, pcielab_ref_Y, pcielab_ref_Z) => {
  if (!isNumber(pcielab_ref_X)) pcielab_ref_X = properties.cielab_ref_X; // if undefined use default
  if (!isNumber(pcielab_ref_Y)) pcielab_ref_Y = properties.cielab_ref_Y; // if undefined use default
  if (!isNumber(pcielab_ref_Z)) pcielab_ref_Z = properties.cielab_ref_Z; // if undefined use default

  checkInput(colorJSON, "lab", "lab2xyz");
  let var_Y = (colorJSON.c1 + 16.0) / 116.0;
  let var_X = colorJSON.c2 / 500.0 + var_Y;
  let var_Z = var_Y - colorJSON.c3 / 200.0;

  if (Math.pow(var_X, 3.0) > 0.008856) {
    var_X = Math.pow(var_X, 3.0);
  } else {
    var_X = (var_X - 16.0 / 116.0) / 7.787;
  }

  if (Math.pow(var_Y, 3.0) > 0.008856) {
    var_Y = Math.pow(var_Y, 3.0);
  } else {
    var_Y = (var_Y - 16.0 / 116.0) / 7.787;
  }

  if (Math.pow(var_Z, 3.0) > 0.008856) {
    var_Z = Math.pow(var_Z, 3.0);
  } else {
    var_Z = (var_Z - 16.0 / 116.0) / 7.787;
  }

  var_X = var_X * pcielab_ref_X;
  var_Y = var_Y * pcielab_ref_Y;
  var_Z = var_Z * pcielab_ref_Z;

  return { space: "xyz", c1: var_X, c2: var_Y, c3: var_Z };
};

exports.lab2lch = (colorJSON) => {
  checkInput(colorJSON, "lab", "lab2lch");
  let var_l = colorJSON.c1 / 100;
  let normAVal = colorJSON.c2 / 128.0;
  let normBVal = colorJSON.c3 / 128.0;
  let var_c = Math.sqrt(Math.pow(normAVal, 2) + Math.pow(normBVal, 2));
  let var_h = atan2_360Degree(normAVal, normBVal) / 360; // values 0-1
  return { space: "lch", c1: var_l, c2: var_c, c3: var_h };
};

exports.lab2din99 = (colorJSON, pdin99_kE, pdin99_kCH) => {
  if (!isNumber(pdin99_kE)) pdin99_kE = properties.din99_kE; // if undefined use default
  if (!isNumber(pdin99_kCH)) pdin99_kCH = properties.din99_kCH; // if undefined use default

  checkInput(colorJSON, "lab", "lab2din99");
  let valueL99, valueA99, valueB99;
  let lScale = 100 / Math.log(139 / 100.0); // = 303.67
  valueL99 = (lScale / pdin99_kE) * Math.log(1 + 0.0039 * colorJSON.c1);
  if (colorJSON.c2 == 0.0 && colorJSON.c3 == 0.0) {
    valueA99 = 0.0;
    valueB99 = 0.0;
  } else {
    let angle = ((2 * Math.PI) / 360) * 26;
    let e = colorJSON.c2 * Math.cos(angle) + colorJSON.c3 * Math.sin(angle);
    let f = 0.83 * (colorJSON.c3 * Math.cos(angle) - colorJSON.c2 * Math.sin(angle));
    let G = Math.sqrt(Math.pow(e, 2) + Math.pow(f, 2));
    let C99 = Math.log(1 + 0.075 * G) / (0.0435 * pdin99_kCH * din99_kE);
    let hef = Math.atan2(f, e);
    let h99 = hef + angle;
    valueA99 = C99 * Math.cos(h99);
    valueB99 = C99 * Math.sin(h99);
  }
  return { space: "din99", c1: valueL99, c2: valueA99, c3: valueB99 };
};

exports.lch2lab = (colorJSON) => {
  checkInput(colorJSON, "lch", "lch2lab");
  let var_l = colorJSON.c1 * 100;
  let tmpRad = degree360ToRad(colorJSON.c3 * 360);
  let var_a = Math.cos(tmpRad) * colorJSON.c2 * 128;
  let var_b = Math.sin(tmpRad) * colorJSON.c2 * 128;
  return { space: "lab", c1: var_l, c2: var_a, c3: var_b };
};

exports.din992lab = (colorJSON, pdin99_kE, pdin99_kCH) => {
  if (!isNumber(pdin99_kE)) pdin99_kE = properties.din99_kE; // if undefined use default
  if (!isNumber(pdin99_kCH)) pdin99_kCH = properties.din99_kCH; // if undefined use default

  checkInput(colorJSON, "din99", "din992lab");
  let angle = ((2 * Math.PI) / 360) * 26;
  let lScale = 100 / Math.log(139 / 100.0); // = 303.67
  let var_l = (Math.exp((colorJSON.c1 * pdin99_kE) / lScale) - 1.0) / 0.0039;
  let hef = Math.atan2(colorJSON.c3, colorJSON.c2);
  let h99 = hef - angle;
  let C99 = Math.sqrt(Math.pow(colorJSON.c2, 2) + Math.pow(colorJSON.c3, 2));
  let G = (Math.exp(0.0435 * C99 * pdin99_kCH * pdin99_kE) - 1) / 0.075;
  let e = G * Math.cos(h99);
  let f = G * Math.sin(h99);
  let var_a = e * Math.cos(angle) - (f / 0.83) * Math.sin(angle);
  let var_b = e * Math.sin(angle) + (f / 0.83) * Math.cos(angle);
  return { space: "lab", c1: var_l, c2: var_a, c3: var_b };
};

///////
//////////////////////////////////////////////////
///////////////////  Private  ////////////////////
//////////////////////////////////////////////////
function checkInput(colorJSON, space, fctName) {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "' + fctName + '" :: Incorrect colorJSON.');
  if (colorJSON.space !== space) throw new TypeError('Error (colorConverter) :: Function "lms2lms_CB" :: Incorrect format. No "' + space + '" color.');
}

function getTransferMatrix(tm_type, tm_name) {
  defineGlobalConst("RGB2XYZ::Default", "RGB2XYZ::sRGB_D65");
  console.log(Object.keys(properties));
  /*switch (tm_type) {
    case "rgb2xyz":
    case "RGB2XYZ":
      
    break;
  
    default:
      break;
  }*/
}

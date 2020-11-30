//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Color Converstion Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isNumber, isMathMatrix, isColorJSON } = require("../helper/guardClauses.js");
const { mXv, invert3x3, atan2_360Degree, degree360ToRad } = require("../helper/math.js");

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

exports.rgb2xyz = (colorJSON, tm) => {
  checkInput(colorJSON, "rgb", "rgb2xyz");

  let tmxyz_Selected = undefined; // the user can transfer a transfer matrix, a name of a existing transfermatrix or he can let it undefined (use the default)
  try {
    if (isMathMatrix(tm, true)) {
      // is Matrix with number and has equal rows and columns
      if (tm.length != 3) throw new TypeError('Error (colorConverter) :: Function "rgb2xyz" :: Incorrect format. No RGB color.');
    }
    tmxyz_Selected = tm; // the matrix is correct and can be used as tm
  } catch (error) {
    tmxyz_Selected = getTransferMatrix("rgb2xyz", tm); // check if tm is a exisiting tm-name or not (=> use default)
  }

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

exports.xyz2rgb = (colorJSON, tm) => {
  checkInput(colorJSON, "xyz", "xyz2rgb");

  let tmxyz_Selected_Inv = undefined; // the user can transfer a transfer matrix, a name of a existing transfermatrix or he can let it undefined (use the default)
  try {
    if (isMathMatrix(tm, true)) {
      // is Matrix with number and has equal rows and columns
      if (tm.length != 3) throw new TypeError('Error (colorConverter) :: Function "rgb2xyz" :: Incorrect format. No RGB color.');
    }
    tmxyz_Selected_Inv = tm; // the matrix is correct and can be used as tm
  } catch (error) {
    tmxyz_Selected_Inv = invert3x3(getTransferMatrix("xyz2rgb", tm)); // check if tm is a exisiting tm-name or not (=> use default)
  }

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

exports.xyz2lms = (colorJSON, tm) => {
  checkInput(colorJSON, "xyz", "xyz2lms");

  let tmlms_Selected = undefined; // the user can transfer a transfer matrix, a name of a existing transfermatrix or he can let it undefined (use the default)
  try {
    if (isMathMatrix(tm, true)) {
      // is Matrix with number and has equal rows and columns
      if (tm.length != 3) throw new TypeError('Error (colorConverter) :: Function "xyz2lms" :: Incorrect format. No RGB color.');
    }
    tmlms_Selected = tm; // the matrix is correct and can be used as tm
  } catch (error) {
    tmlms_Selected = getTransferMatrix("xyz2lms", tm); // check if tm is a exisiting tm-name or not (=> use default)
  }

  let var_lms = mXv(tmlms_Selected, [colorJSON.c1, colorJSON.c2, colorJSON.c3]);
  return { space: "lms", c1: var_lms[0], c2: var_lms[1], c3: var_lms[2] };
};

exports.lms2xyz = (colorJSON, tm) => {
  checkInput(colorJSON, "lms", "lms2xyz");

  let tmlms_Selected_Inv = undefined; // the user can transfer a transfer matrix, a name of a existing transfermatrix or he can let it undefined (use the default)
  try {
    if (isMathMatrix(tm, true)) {
      // is Matrix with number and has equal rows and columns
      if (tm.length != 3) throw new TypeError('Error (colorConverter) :: Function "xyz2lms" :: Incorrect format. No RGB color.');
    }
    tmlms_Selected_Inv = tm; // the matrix is correct and can be used as tm
  } catch (error) {
    tmlms_Selected_Inv = invert3x3(getTransferMatrix("lms2xyz", tm)); // check if tm is a exisiting tm-name or not (=> use default)
  }

  let var_xyz = mXv(tmlms_Selected_Inv, [colorJSON.c1, colorJSON.c2, colorJSON.c3]);
  return { space: "xyz", c1: var_xyz[0], c2: var_xyz[1], c3: var_xyz[2] };
};

exports.lms2lms_CB = (colorJSON, tm) => {
  checkInput(colorJSON, "lms", "lms2lms_CB");
  if (isMathMatrix(tm, true)) {
    // is Matrix with number and has equal rows and columns
    if (tm.length != 3) throw new TypeError('Error (colorConverter) :: Function "xyz2lms" :: Incorrect format. No RGB color.');
  }
  let var_lms_cb = mXv(tm, [colorJSON.c1, colorJSON.c2, colorJSON.c3]);
  return { space: "lms", c1: var_lms_cb[0], c2: var_lms_cb[1], c3: var_lms_cb[2] };
};

exports.xyz2lab = (colorJSON, pREFX, pREFY, pREFZ) => {
  if (!isNumber(pREFX)) pREFX = properties.REFX; // if undefined use default
  if (!isNumber(pREFY)) pREFY = properties.REFY; // if undefined use default
  if (!isNumber(pREFZ)) pREFZ = properties.REFZ; // if undefined use default

  checkInput(colorJSON, "xyz", "xyz2lab");

  let var_X = colorJSON.c1 / pREFX;
  let var_Y = colorJSON.c2 / pREFY;
  let var_Z = colorJSON.c3 / pREFZ;

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

exports.lab2xyz = (colorJSON, pREFX, pREFY, pREFZ) => {
  if (!isNumber(pREFX)) pREFX = properties.REFX; // if undefined use default
  if (!isNumber(pREFY)) pREFY = properties.REFY; // if undefined use default
  if (!isNumber(pREFZ)) pREFZ = properties.REFZ; // if undefined use default

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

  var_X = var_X * pREFX;
  var_Y = var_Y * pREFY;
  var_Z = var_Z * pREFZ;

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

exports.lch2lab = (colorJSON) => {
  checkInput(colorJSON, "lch", "lch2lab");
  let var_l = colorJSON.c1 * 100;
  let tmpRad = degree360ToRad(colorJSON.c3 * 360);
  let var_a = Math.cos(tmpRad) * colorJSON.c2 * 128;
  let var_b = Math.sin(tmpRad) * colorJSON.c2 * 128;
  return { space: "lab", c1: var_l, c2: var_a, c3: var_b };
};

exports.lab2din99 = (colorJSON, pDIN99KE, pDIN99KCH) => {
  if (!isNumber(pDIN99KE)) pDIN99KE = properties.DIN99KE; // if undefined use default
  if (!isNumber(pDIN99KCH)) pDIN99KCH = properties.DIN99KCH; // if undefined use default

  checkInput(colorJSON, "lab", "lab2din99");
  let valueL99, valueA99, valueB99;
  let lScale = 100 / Math.log(139 / 100.0); // = 303.67
  valueL99 = (lScale / pDIN99KE) * Math.log(1 + 0.0039 * colorJSON.c1);
  if (colorJSON.c2 == 0.0 && colorJSON.c3 == 0.0) {
    valueA99 = 0.0;
    valueB99 = 0.0;
  } else {
    let angle = ((2 * Math.PI) / 360) * 26;
    let e = colorJSON.c2 * Math.cos(angle) + colorJSON.c3 * Math.sin(angle);
    let f = 0.83 * (colorJSON.c3 * Math.cos(angle) - colorJSON.c2 * Math.sin(angle));
    let G = Math.sqrt(Math.pow(e, 2) + Math.pow(f, 2));
    let C99 = Math.log(1 + 0.075 * G) / (0.0435 * pDIN99KCH * pDIN99KE);
    let hef = Math.atan2(f, e);
    let h99 = hef + angle;
    valueA99 = C99 * Math.cos(h99);
    valueB99 = C99 * Math.sin(h99);
  }
  return { space: "din99", c1: valueL99, c2: valueA99, c3: valueB99 };
};

exports.din992lab = (colorJSON, pDIN99KE, pDIN99KCH) => {
  if (!isNumber(pDIN99KE)) pDIN99KE = properties.DIN99KE; // if undefined use default
  if (!isNumber(pDIN99KCH)) pDIN99KCH = properties.DIN99KCH; // if undefined use default

  checkInput(colorJSON, "din99", "din992lab");
  let angle = ((2 * Math.PI) / 360) * 26;
  let lScale = 100 / Math.log(139 / 100.0); // = 303.67
  let var_l = (Math.exp((colorJSON.c1 * pDIN99KE) / lScale) - 1.0) / 0.0039;
  let hef = Math.atan2(colorJSON.c3, colorJSON.c2);
  let h99 = hef - angle;
  let C99 = Math.sqrt(Math.pow(colorJSON.c2, 2) + Math.pow(colorJSON.c3, 2));
  let G = (Math.exp(0.0435 * C99 * pDIN99KCH * pDIN99KE) - 1) / 0.075;
  let e = G * Math.cos(h99);
  let f = G * Math.sin(h99);
  let var_a = e * Math.cos(angle) - (f / 0.83) * Math.sin(angle);
  let var_b = e * Math.sin(angle) + (f / 0.83) * Math.cos(angle);
  return { space: "lab", c1: var_l, c2: var_a, c3: var_b };
};

//////////////////////////////////////////////////
///////////////////  Private  ////////////////////
//////////////////////////////////////////////////
function checkInput(colorJSON, space, fctName) {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "' + fctName + '" :: Incorrect colorJSON.');
  if (colorJSON.space !== space) throw new TypeError('Error (colorConverter) :: Function "' + fctName + '" :: Incorrect format. No "' + space + '" color.');
}

// getTransferMatrix checks if the TransferMatrix exists in the properties and return it or the default.
function getTransferMatrix(fctName, tm_name) {
  if (typeof tm_name !== "string") tm_name = "use_default";
  if (!properties.hasOwnProperty(tm_name)) tm_name = "use_default"; // check if transfer matrix exist; if not => use default

  switch (fctName) {
    case "rgb2xyz":
    case "xyz2rgb":
      if (tm_name.substring(0, 9) !== "TMRGB2XYZ") tm_name = falseTM("TMRGB2XYZ");
      break;

    case "xyz2lms":
    case "lms2xyz":
      if (tm_name.substring(0, 9) !== "TMXYZ2LMS") tm_name = falseTM("TMXYZ2LMS");
      break;

    default:
      throw new TypeError('Error (colorConverter) :: Function "' + fctName + '" :: Incorrect format. Could not find a TM in getTransferMatrix');
  }

  return properties[tm_name];
}

function falseTM(type) {
  console.info('Info (colorConverter) :: Function "' + type + '" :: Undefined, Unknown, or Incorrect Transfer Matrix => Use of the default TM.');
  return properties[type + "::Default"]; // the default properties only include the key name of the default TM. So this return the real TM name and not e.g, "TMRGB2XYZ::Default"
}

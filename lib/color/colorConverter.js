//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Color Converstion Functions
// Author :: Pascal Nardini
// License :: MIT

//////////////////////////////////////////////
//////////////////////////////////////////////

const { isColorJSON } = require("../helper/guardClauses.js");
const { mXv } = require("../helper/math.js");

exports.hsv2rgb = (colorJSON) => {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "hsv2rgb" :: Incorrect colorJSON.');
  if (colorJSON.space !== "hsv") throw new TypeError('Error (colorConverter) :: Function "hsv2rgb" :: Incorrect format. No HSV color.');

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
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "rgb2hsv" :: Incorrect colorJSON.');
  if (colorJSON.space !== "rgb") throw new TypeError('Error (colorConverter) :: Function "rgb2hsv" :: Incorrect format. No RGB color.');

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

exports.rgb2xyz = (colorJSON) => {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "rgb2xyz" :: Incorrect colorJSON.');
  if (colorJSON.space !== "rgb") throw new TypeError('Error (colorConverter) :: Function "rgb2xyz" :: Incorrect format. No RGB color.');

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
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "xyz2rgb" :: Incorrect colorJSON.');
  if (colorJSON.space !== "xyz") throw new TypeError('Error (colorConverter) :: Function "xyz2rgb" :: Incorrect format. No XYZ color.');

  let var_X = colorJSON.c1 / 100.0;
  let var_Y = colorJSON.c2 / 100.0;
  let var_Z = colorJSON.c3 / 100.0;

  let var_R = var_X * tmxyz_Selected_Inv[0][0] + var_Y * tmxyz_Selected_Inv[0][1] + var_Z * tmxyz_Selected_Inv[0][2];
  let var_G = var_X * tmxyz_Selected_Inv[1][0] + var_Y * tmxyz_Selected_Inv[1][1] + var_Z * tmxyz_Selected_Inv[1][2];
  let var_B = var_X * tmxyz_Selected_Inv[2][0] + var_Y * tmxyz_Selected_Inv[2][1] + var_Z * tmxyz_Selected_Inv[2][2];

  //apply standard gamma correction
  if (var_R > 0.0031308) var_R = 1.055 * Math.pow(var_R, 1.0 / 2.4) - 0.055;
  else var_R = 12.92 * var_R;
  if (var_G > 0.0031308) var_G = 1.055 * Math.pow(var_G, 1.0 / 2.4) - 0.055;
  else var_G = 12.92 * var_G;
  if (var_B > 0.0031308) var_B = 1.055 * Math.pow(var_B, 1.0 / 2.4) - 0.055;
  else var_B = 12.92 * var_B;

  // rgb - Clipping
  if (var_R > 1.0 || var_G > 1.0 || var_B > 1.0 || var_R < 0.0 || var_G < 0.0 || var_B < 0.0) {
    // Wrong rgb -Values
    if (var_R > 1.0) {
      var_R = 1.0;
    }
    if (var_G > 1.0) {
      var_G = 1.0;
    }
    if (var_B > 1.0) {
      var_B = 1.0;
    }
    if (var_R < 0.0) {
      var_R = 0.0;
    }
    if (var_G < 0.0) {
      var_G = 0.0;
    }
    if (var_B < 0.0) {
      var_B = 0.0;
    }
  }

  return { space: "rgb", c1: var_R, c2: var_G, c3: var_B };
};

exports.xyz2lab = (colorJSON) => {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "xyz2lab" :: Incorrect colorJSON.');
  if (colorJSON.space !== "xyz") throw new TypeError('Error (colorConverter) :: Function "xyz2lab" :: Incorrect format. No XYZ color.');

  let var_X = colorJSON.c3 / cielab_ref_X;
  let var_Y = colorJSON.c3 / cielab_ref_Y;
  let var_Z = colorJSON.c3 / cielab_ref_Z;

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
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "xyz2lms" :: Incorrect colorJSON.');
  if (colorJSON.space !== "xyz") throw new TypeError('Error (colorConverter) :: Function "xyz2lms" :: Incorrect format. No XYZ color.');

  let var_L = colorJSON.c1 * tmlms_Selected[0][0] + colorJSON.c2 * tmlms_Selected[0][1] + colorJSON.c3 * tmlms_Selected[0][2];
  let var_M = colorJSON.c1 * tmlms_Selected[1][0] + colorJSON.c2 * tmlms_Selected[1][1] + colorJSON.c3 * tmlms_Selected[1][2];
  let var_S = colorJSON.c1 * tmlms_Selected[2][0] + colorJSON.c2 * tmlms_Selected[2][1] + colorJSON.c3 * tmlms_Selected[2][2];

  return { space: "lms", c1: var_L, c2: var_M, c3: var_S };
};

exports.lms2xyz = (colorJSON) => {
  if (!isColorJSON(colorJSON)) throw new TypeError('Error (colorConverter) :: Function "lms2xyz" :: Incorrect colorJSON.');
  if (colorJSON.space !== "lms") throw new TypeError('Error (colorConverter) :: Function "lms2xyz" :: Incorrect format. No LMS color.');

  let var_X = colorJSON.c1 * tmlms_Selected_Inv[0][0] + this.val2lms * tmlms_Selected_Inv[0][1] + this.val_3_lms * tmlms_Selected_Inv[0][2];
  let var_Y = colorJSON.c1 * tmlms_Selected_Inv[1][0] + this.val2lms * tmlms_Selected_Inv[1][1] + this.val_3_lms * tmlms_Selected_Inv[1][2];
  let var_Z = colorJSON.c1 * tmlms_Selected_Inv[2][0] + this.val2lms * tmlms_Selected_Inv[2][1] + this.val_3_lms * tmlms_Selected_Inv[2][2];

  return { space: "xyz", c1: var_X, c2: var_Y, c3: var_Z };
};

exports.lms2rgb_CB = (colorJSON) => {
  var newL = this.val_1_lms * sim_AdaptiveColorblindness[0][0] + this.val2lms * sim_AdaptiveColorblindness[0][1] + this.val_3_lms * sim_AdaptiveColorblindness[0][2];
  var newM = this.val_1_lms * sim_AdaptiveColorblindness[1][0] + this.val2lms * sim_AdaptiveColorblindness[1][1] + this.val_3_lms * sim_AdaptiveColorblindness[1][2];
  var newS = this.val_1_lms * sim_AdaptiveColorblindness[2][0] + this.val2lms * sim_AdaptiveColorblindness[2][1] + this.val_3_lms * sim_AdaptiveColorblindness[2][2];

  var tmp_X = (newL * tmlms_Selected_Inv[0][0] + newM * tmlms_Selected_Inv[0][1] + newS * tmlms_Selected_Inv[0][2]) / 100;
  var tmp_Y = (newL * tmlms_Selected_Inv[1][0] + newM * tmlms_Selected_Inv[1][1] + newS * tmlms_Selected_Inv[1][2]) / 100;
  var tmp_Z = (newL * tmlms_Selected_Inv[2][0] + newM * tmlms_Selected_Inv[2][1] + newS * tmlms_Selected_Inv[2][2]) / 100;

  var var_R = tmp_X * tmxyz_Selected_Inv[0][0] + tmp_Y * tmxyz_Selected_Inv[0][1] + tmp_Z * tmxyz_Selected_Inv[0][2];
  var var_G = tmp_X * tmxyz_Selected_Inv[1][0] + tmp_Y * tmxyz_Selected_Inv[1][1] + tmp_Z * tmxyz_Selected_Inv[1][2];
  var var_B = tmp_X * tmxyz_Selected_Inv[2][0] + tmp_Y * tmxyz_Selected_Inv[2][1] + tmp_Z * tmxyz_Selected_Inv[2][2];

  //apply standard gamma correction
  if (var_R > 0.0031308) var_R = 1.055 * Math.pow(var_R, 1.0 / 2.4) - 0.055;
  else var_R = 12.92 * var_R;
  if (var_G > 0.0031308) var_G = 1.055 * Math.pow(var_G, 1.0 / 2.4) - 0.055;
  else var_G = 12.92 * var_G;
  if (var_B > 0.0031308) var_B = 1.055 * Math.pow(var_B, 1.0 / 2.4) - 0.055;
  else var_B = 12.92 * var_B;

  // rgb - Clipping

  // Wrong rgb -Values
  if (var_R > 1.0) {
    var_R = 1.0;
  }
  if (var_G > 1.0) {
    var_G = 1.0;
  }
  if (var_B > 1.0) {
    var_B = 1.0;
  }
  if (var_R < 0.0) {
    var_R = 0.0;
  }
  if (var_G < 0.0) {
    var_G = 0.0;
  }
  if (var_B < 0.0) {
    var_B = 0.0;
  }

  colorJSON.c1_cb = var_R;
  colorJSON.c2_cb = var_G;
  colorJSON.c3_cb = var_B;
};

exports.lab2xyz = (colorJSON) => {
  var var_Y = (this.val_1_lab + 16.0) / 116.0;
  var var_X = this.val2lab / 500.0 + var_Y;
  var var_Z = var_Y - this.val_3_lab / 200.0;

  if (Math.pow(var_Y, 3.0) > 0.008856) {
    var_Y = Math.pow(var_Y, 3.0);
  } else {
    var_Y = (var_Y - 16.0 / 116.0) / 7.787;
  }

  if (Math.pow(var_X, 3.0) > 0.008856) {
    var_X = Math.pow(var_X, 3.0);
  } else {
    var_X = (var_X - 16.0 / 116.0) / 7.787;
  }

  if (Math.pow(var_Z, 3.0) > 0.008856) {
    var_Z = Math.pow(var_Z, 3.0);
  } else {
    var_Z = (var_Z - 16.0 / 116.0) / 7.787;
  }

  this.val_1_xyz = var_X * cielab_ref_X;
  this.val2xyz = var_Y * cielab_ref_Y;
  this.val_3_xyz = var_Z * cielab_ref_Z;
};

exports.lab2lch = (colorJSON) => {
  this.val_1_lch = this.val_1_lab / 100;
  var normAVal = this.val2lab / 128.0;
  var normBVal = this.val_3_lab / 128.0;
  this.val2lch = Math.sqrt(Math.pow(normAVal, 2) + Math.pow(normBVal, 2));
  this.val_3_lch = atan2_360Degree(normAVal, normBVal) / 360; // values 0-1
};

exports.lab2din99 = (colorJSON) => {
  var valueL99, valueA99, valueB99;
  var lScale = 100 / Math.log(139 / 100.0); // = 303.67
  valueL99 = (lScale / din99_kE) * Math.log(1 + 0.0039 * this.val_1_lab);
  if (this.val2lab == 0.0 && this.val_3_lab == 0.0) {
    valueA99 = 0.0;
    valueB99 = 0.0;
  } else {
    var angle = ((2 * Math.PI) / 360) * 26;
    var e = this.val2lab * Math.cos(angle) + this.val_3_lab * Math.sin(angle);
    var f = 0.83 * (this.val_3_lab * Math.cos(angle) - this.val2lab * Math.sin(angle));
    var G = Math.sqrt(Math.pow(e, 2) + Math.pow(f, 2));
    var C99 = Math.log(1 + 0.075 * G) / (0.0435 * din99_kCH * din99_kE);
    var hef = Math.atan2(f, e);
    var h99 = hef + angle;
    valueA99 = C99 * Math.cos(h99);
    valueB99 = C99 * Math.sin(h99);
  }
  this.val_1_din99 = valueL99;
  this.val2din99 = valueA99;
  this.val_3_din99 = valueB99;
};

exports.lch2lab = (colorJSON) => {
  this.val_1_lab = this.val_1_lch * 100;
  var tmpRad = degree360ToRad(this.val_3_lch * 360);
  this.val2lab = Math.cos(tmpRad) * this.val2lch * 128;
  this.val_3_lab = Math.sin(tmpRad) * this.val2lch * 128;
};

exports.din992lab = (colorJSON) => {
  var angle = ((2 * Math.PI) / 360) * 26;
  var lScale = 100 / Math.log(139 / 100.0); // = 303.67
  this.val_1_lab = (Math.exp((this.val_1_din99 * din99_kE) / lScale) - 1.0) / 0.0039;
  var hef = Math.atan2(this.val_3_din99, this.val2din99);
  var h99 = hef - angle;
  var C99 = Math.sqrt(Math.pow(this.val2din99, 2) + Math.pow(this.val_3_din99, 2));
  var G = (Math.exp(0.0435 * C99 * din99_kCH * din99_kE) - 1) / 0.075;
  var e = G * Math.cos(h99);
  var f = G * Math.sin(h99);
  this.val2lab = e * Math.cos(angle) - (f / 0.83) * Math.sin(angle);
  this.val_3_lab = e * Math.sin(angle) + (f / 0.83) * Math.cos(angle);
};

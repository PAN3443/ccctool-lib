module.exports = {
  hsv2rgb: function (colorJSON) {
    try {
      if (colorJSON.type !== "hsv") throw new Error("Incorrect format. No HSV color.");

      if (isNaN(colorJSON.c1)) throw new Error("Incorrect Input. Numbers are expected for the first component (c1) of the HSV Color!");
      if (isNaN(colorJSON.c2)) throw new Error("Incorrect Input. Numbers are expected for the second component (c2) of the HSV Color!");
      if (isNaN(colorJSON.c3)) throw new Error("Incorrect Input. Numbers are expected for the third component (c3) of the HSV Color!");

      if (colorJSON.c1 < 0.0 || colorJSON.c1 > 1.0) throw new Error("Incorrect Input. Numbers between 0 and 1 are expected for the first component (c1) of the HSV Color!");
      if (colorJSON.c2 < 0.0 || colorJSON.c2 > 1.0) throw new Error("Incorrect Input. Numbers between 0 and 1 are expected for the first component (c1) of the HSV Color!");
      if (colorJSON.c3 < 0.0 || colorJSON.c3 > 1.0) throw new Error("Incorrect Input. Numbers between 0 and 1 are expected for the first component (c1) of the HSV Color!");

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

      return { type: "rgb", c1: r, c2: g, c3: b };
    } catch (e) {
      console.error('\tError :: CCC_Color :: Function "hsv2rgb" ::', e.message);
      throw new Error('\tError :: CCC_Color :: Function "hsv2rgb" :: No Output');
    }
  },

  rgb2hsv: function (colorJSON) {
    try {
      if (colorJSON.type !== "rgb") throw new Error("Incorrect format. No RGB color.");

      if (isNaN(colorJSON.c1)) throw new Error("Incorrect Input. Numbers are expected for the first component (c1) of the RGB Color!");
      if (isNaN(colorJSON.c2)) throw new Error("Incorrect Input. Numbers are expected for the second component (c2) of the RGB Color!");
      if (isNaN(colorJSON.c3)) throw new Error("Incorrect Input. Numbers are expected for the third component (c3) of the RGB Color!");

      if (colorJSON.c1 < 0.0 || colorJSON.c1 > 1.0) throw new Error("Incorrect Input. Numbers between 0 and 1 are expected for the first component (c1) of the RGB Color!");
      if (colorJSON.c2 < 0.0 || colorJSON.c2 > 1.0) throw new Error("Incorrect Input. Numbers between 0 and 1 are expected for the first component (c1) of the RGB Color!");
      if (colorJSON.c3 < 0.0 || colorJSON.c3 > 1.0) throw new Error("Incorrect Input. Numbers between 0 and 1 are expected for the first component (c1) of the RGB Color!");

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

      return { type: "hsv", c1: h, c2: s, c3: v };
    } catch (e) {
      console.error('\tError :: CCC_Color :: Function "hsv2rgb" ::', e.message);
      throw new Error('\tError :: CCC_Color :: Function "hsv2rgb" :: No Output');
    }
  },

  rgb2xyz: function (colorJSON) {
    // For this method we need the rgb Values
    if (this.val_1_rgb == undefined || this.val2rgb == undefined || this.val_3_rgb == undefined) return;

    var var_R = this.val_1_rgb;
    var var_G = this.val2rgb;
    var var_B = this.val_3_rgb;

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

    this.val_1_xyz = var_R * tmxyz_Selected[0][0] + var_G * tmxyz_Selected[0][1] + var_B * tmxyz_Selected[0][2];
    this.val2xyz = var_R * tmxyz_Selected[1][0] + var_G * tmxyz_Selected[1][1] + var_B * tmxyz_Selected[1][2];
    this.val_3_xyz = var_R * tmxyz_Selected[2][0] + var_G * tmxyz_Selected[2][1] + var_B * tmxyz_Selected[2][2];
  },

  xyz2rgb: function (colorJSON) {
    var var_X = this.val_1_xyz / 100.0;
    var var_Y = this.val2xyz / 100.0;
    var var_Z = this.val_3_xyz / 100.0;

    var var_R = var_X * tmxyz_Selected_Inv[0][0] + var_Y * tmxyz_Selected_Inv[0][1] + var_Z * tmxyz_Selected_Inv[0][2];
    var var_G = var_X * tmxyz_Selected_Inv[1][0] + var_Y * tmxyz_Selected_Inv[1][1] + var_Z * tmxyz_Selected_Inv[1][2];
    var var_B = var_X * tmxyz_Selected_Inv[2][0] + var_Y * tmxyz_Selected_Inv[2][1] + var_Z * tmxyz_Selected_Inv[2][2];

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

    this.val_1_rgb = var_R;
    this.val2rgb = var_G;
    this.val_3_rgb = var_B;
  },

  xyz2lab: function (colorJSON) {
    var var_X = this.val_1_xyz / cielab_ref_X;
    var var_Y = this.val2xyz / cielab_ref_Y;
    var var_Z = this.val_3_xyz / cielab_ref_Z;

    if (var_X > 0.008856) var_X = Math.pow(var_X, 1 / 3);
    else var_X = 7.787 * var_X + 16 / 116;
    if (var_Y > 0.008856) var_Y = Math.pow(var_Y, 1 / 3);
    else var_Y = 7.787 * var_Y + 16 / 116;
    if (var_Z > 0.008856) var_Z = Math.pow(var_Z, 1 / 3);
    else var_Z = 7.787 * var_Z + 16 / 116;

    this.val_1_lab = 116 * var_Y - 16;
    this.val2lab = 500 * (var_X - var_Y);
    this.val_3_lab = 200 * (var_Y - var_Z);
  },

  xyz2lms: function (colorJSON) {
    this.val_1_lms = this.val_1_xyz * tmlms_Selected[0][0] + this.val2xyz * tmlms_Selected[0][1] + this.val_3_xyz * tmlms_Selected[0][2];
    this.val2lms = this.val_1_xyz * tmlms_Selected[1][0] + this.val2xyz * tmlms_Selected[1][1] + this.val_3_xyz * tmlms_Selected[1][2];
    this.val_3_lms = this.val_1_xyz * tmlms_Selected[2][0] + this.val2xyz * tmlms_Selected[2][1] + this.val_3_xyz * tmlms_Selected[2][2];
  },

  lms2xyz: function (colorJSON) {
    this.val_1_xyz = this.val_1_lms * tmlms_Selected_Inv[0][0] + this.val2lms * tmlms_Selected_Inv[0][1] + this.val_3_lms * tmlms_Selected_Inv[0][2];
    this.val2xyz = this.val_1_lms * tmlms_Selected_Inv[1][0] + this.val2lms * tmlms_Selected_Inv[1][1] + this.val_3_lms * tmlms_Selected_Inv[1][2];
    this.val_3_xyz = this.val_1_lms * tmlms_Selected_Inv[2][0] + this.val2lms * tmlms_Selected_Inv[2][1] + this.val_3_lms * tmlms_Selected_Inv[2][2];
  },

  lms2rgb_CB: function (colorJSON) {
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

    this.val_1_rgb_cb = var_R;
    this.val2rgb_cb = var_G;
    this.val_3_rgb_cb = var_B;
  },

  lab2xyz: function (colorJSON) {
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
  },

  lab2lch: function (colorJSON) {
    this.val_1_lch = this.val_1_lab / 100;
    var normAVal = this.val2lab / 128.0;
    var normBVal = this.val_3_lab / 128.0;
    this.val2lch = Math.sqrt(Math.pow(normAVal, 2) + Math.pow(normBVal, 2));
    this.val_3_lch = atan2_360Degree(normAVal, normBVal) / 360; // values 0-1
  },

  lab2din99: function (colorJSON) {
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
  },

  lch2lab: function (colorJSON) {
    this.val_1_lab = this.val_1_lch * 100;
    var tmpRad = degree360ToRad(this.val_3_lch * 360);
    this.val2lab = Math.cos(tmpRad) * this.val2lch * 128;
    this.val_3_lab = Math.sin(tmpRad) * this.val2lch * 128;
  },

  din992lab: function (colorJSON) {
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
  },
};

export const cccToolProperties = {};

function defineGlobalConst(name, value) {
  Object.defineProperty(cccToolProperties, name, {
    value: value,
    enumerable: true,
    writable: false,
    configurable: false,
  });
}

function defineGlobalVariables(name, value) {
  Object.defineProperty(cccToolProperties, name, {
    value: value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}

//////////////////////////////////////////////////////
///// Default Color Difference Metric Variables //////
//////////////////////////////////////////////////////

defineGlobalConst("math_error", 1e-12);

//////////////////////////////////////////////////////
///// Default Color Difference Metric Variables //////
//////////////////////////////////////////////////////

defineGlobalConst("de2000_k_L", 1.0);
defineGlobalConst("de2000_k_C", 1.0);
defineGlobalConst("de2000_k_H", 1.0);

defineGlobalConst("de94_k_L", 1.0);
defineGlobalConst("de94_k_C", 1.0);
defineGlobalConst("de94_k_H", 1.0);
defineGlobalConst("de94_k_1", 0.045);
defineGlobalConst("de94_k_2", 0.015); // K1: 0.045 graphic arts  0.048 textiles  K2: 0.015 graphic arts 0.014 textiles

//////////////////////////////////////////////////////
//////// Default Color Conversion Variables //////////
//////////////////////////////////////////////////////
defineGlobalConst("DIN99KE", 1);
defineGlobalConst("DIN99KCH", 1);

defineGlobalConst("REFX", 94.811);
defineGlobalConst("REFY", 100.0);
defineGlobalConst("REFZ", 107.304);

//////////////////////////////////////////////////////
/////////// Default Color Transer Matices ////////////
//////////////////////////////////////////////////////

defineGlobalVariables("TMRGB2XYZ::Default", "TMRGB2XYZ::sRGB_D65");
defineGlobalVariables("TMXYZ2LMS::Default", "TMXYZ2LMS::Hunt-Pointer-Estevez");

// Reference White D65
defineGlobalConst("TMRGB2XYZ::sRGB_D65", [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
]);
// Reference White D50
defineGlobalConst("TMRGB2XYZ::sRGB_D50", [
  [0.4360747, 0.3850649, 0.1430804],
  [0.2225045, 0.7168786, 0.0606169],
  [0.0139322, 0.0971045, 0.7141733],
]);
defineGlobalConst("TMRGB2XYZ::Adobe_D65", [
  [0.5767309, 0.185554, 0.1881852],
  [0.2973769, 0.6273491, 0.0752741],
  [0.0270343, 0.0706872, 0.9911085],
]);
defineGlobalConst("TMRGB2XYZ::Adobe_D50", [
  [0.6097559, 0.2052401, 0.149224],
  [0.3111242, 0.625656, 0.0632197],
  [0.0194811, 0.0608902, 0.7448387],
]);
defineGlobalConst("TMRGB2XYZ::Apple_D65", [
  [0.4497288, 0.3162486, 0.1844926],
  [0.2446525, 0.6720283, 0.0833192],
  [0.0251848, 0.1411824, 0.9224628],
]);
defineGlobalConst("TMRGB2XYZ::Apple_D50", [
  [0.4755678, 0.3396722, 0.14898],
  [0.2551812, 0.6725693, 0.0722496],
  [0.0184697, 0.1133771, 0.6933632],
]);
defineGlobalConst("TMRGB2XYZ::Best_RGB_D50", [
  [0.6326696, 0.2045558, 0.1269946],
  [0.2284569, 0.7373523, 0.0341908],
  [0.0, 0.0095142, 0.8156958],
]);
defineGlobalConst("TMRGB2XYZ::tmXYZ_BetaRGB_D50", [
  [0.6712537, 0.1745834, 0.1183829],
  [0.3032726, 0.6637861, 0.0329413],
  [0.0, 0.040701, 0.784509],
]);
defineGlobalConst("TMRGB2XYZ::tmXYZ_BruceRGB_D65", [
  [0.4674162, 0.2944512, 0.1886026],
  [0.2410115, 0.6835475, 0.075441],
  [0.0219101, 0.0736128, 0.9933071],
]);
defineGlobalConst("TMRGB2XYZ::tmXYZ_BruceRGB_D50", [
  [0.4941816, 0.3204834, 0.149555],
  [0.2521531, 0.6844869, 0.06336],
  [0.0157886, 0.0629304, 0.7464909],
]);
defineGlobalConst("TMRGB2XYZ::CIERGB_E", [
  [0.488718, 0.3106803, 0.2006017],
  [0.1762044, 0.8129847, 0.0108109],
  [0.0, 0.0102048, 0.9897952],
]); // Reference White E
defineGlobalConst("TMRGB2XYZ::CIERGB_D50", [
  [0.486887, 0.3062984, 0.1710347],
  [0.1746583, 0.8247541, 0.0005877],
  [-0.0012563, 0.0169832, 0.8094831],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::ColorMatchRGB_D50", [
  [0.5093439, 0.3209071, 0.1339691],
  [0.274884, 0.6581315, 0.0669845],
  [0.0242545, 0.1087821, 0.6921735],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::DonRGB4_D50", [
  [0.6457711, 0.1933511, 0.1250978],
  [0.2783496, 0.6879702, 0.0336802],
  [0.0037113, 0.0179861, 0.8035125],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::ECIRGB_D50", [
  [0.6502043, 0.1780774, 0.1359384],
  [0.3202499, 0.6020711, 0.0776791],
  [0.0, 0.067839, 0.757371],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::EktaSpacePS5_D50", [
  [0.5938914, 0.2729801, 0.0973485],
  [0.2606286, 0.7349465, 0.0044249],
  [0.0, 0.0419969, 0.7832131],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::NTSC_RGB_C", [
  [0.6068909, 0.1735011, 0.200348],
  [0.2989164, 0.586599, 0.1144845],
  [0.0, 0.0660957, 1.1162243],
]); // Reference White C
defineGlobalConst("TMRGB2XYZ::NTSC_RGB_D50", [
  [0.6343706, 0.1852204, 0.144629],
  [0.3109496, 0.5915984, 0.097452],
  [-0.0011817, 0.0555518, 0.7708399],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::PAL_SECAM_RGB_D65", [
  [0.430619, 0.3415419, 0.1783091],
  [0.2220379, 0.7066384, 0.0713236],
  [0.0201853, 0.1295504, 0.9390944],
]); // Reference White D65
defineGlobalConst("TMRGB2XYZ::PAL_SECAM_RGB_D50", [
  [0.4552773, 0.36755, 0.1413926],
  [0.2323025, 0.7077956, 0.0599019],
  [0.0145457, 0.1049154, 0.7057489],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::ProPhotoRGB_D50", [
  [0.7976749, 0.1351917, 0.0313534],
  [0.2880402, 0.7118741, 0.0000857],
  [0.0, 0.0, 0.82521],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::SMPTE_C_RGB_D65", [
  [0.3935891, 0.3652497, 0.1916313],
  [0.2124132, 0.7010437, 0.0865432],
  [0.0187423, 0.1119313, 0.9581563],
]); // Reference White D65
defineGlobalConst("TMRGB2XYZ::SMPTE_C_RGB_D50", [
  [0.416329, 0.3931464, 0.1547446],
  [0.2216999, 0.7032549, 0.0750452],
  [0.0136576, 0.0913604, 0.720192],
]); // Reference White D50
defineGlobalConst("TMRGB2XYZ::ProPhotoRGB_Wide_Gamut_RGB_D50", [
  [0.7161046, 0.1009296, 0.1471858],
  [0.2581874, 0.7249378, 0.0168748],
  [0.0, 0.0517813, 0.7734287],
]); // Reference White D50

defineGlobalConst("TMXYZ2LMS::Hunt-Pointer-Estevez", [
  [0.38971, 0.68898, -0.07868],
  [-0.22981, 1.1834, 0.04641],
  [0, 0, 1],
]);
defineGlobalConst("TMXYZ2LMS::von_Kries", [
  [0.4002, 0.7076, -0.0808],
  [-0.2263, 1.1653, 0.0457],
  [0, 0, 0.9182],
]);
defineGlobalConst("TMXYZ2LMS::Bradford", [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
]);
defineGlobalConst("TMXYZ2LMS::CIECAM97s (CAT97s)", [
  [0.8562, 0.3372, -0.1934],
  [-0.836, 1.8327, 0.0033],
  [0.0357, -0.0469, 1.0112],
]);
defineGlobalConst("TMXYZ2LMS::CIECAM02 (CAT02)", [
  [0.7328, 0.4296, -0.1624],
  [-0.7036, 1.6975, 0.0061],
  [0.003, 0.0136, 0.9834],
]);

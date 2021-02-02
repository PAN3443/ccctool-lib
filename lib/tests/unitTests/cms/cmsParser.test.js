//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for CMS Parser
// Author :: Pascal Nardini
// License :: MIT

//const { CMS } = require("../../../cms/class_cms.js");
//const { KeyCMS } = require("../../../cms/class_cmsKey.js");
const { cmsParser_JSON, cmsParser_XML, cmsParser_CSV } = require("../../../cms/cmsParser.js");
const { checkMathResult } = require("../../../helper/guardClauses.js");

//////////////////////////////////////////////////////////////////
/////////////////////////  cmsParser_JSON  //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: cmsParser_JSON :: Simple Greyscaled, Check Above, Below and NaN color", () => {
  const cms = cmsParser_JSON(
    '[{"ColorSpace" : "Lab","InterpolationType" : "linear","Creator" : "CCC-Tool","Name" : "Custom CMS","NanColor" : [1,0,0],"AboveColor" : [0,1,0],"BelowColor" : [0,0,1],"RGBPoints" : [0,0.9999999584585605,1,0.9999999896748072,1,0,0,0],"isCMS" : [true,true],"isMoT" : [false,false]}]'
  );
  expect(typeof cms).toBe("object");
  expect(typeof cms.getCMSName()).toBe("string");
  expect(cms.getCMSName()).toBe("Custom CMS");
  expect(cms.getKeyLength()).toBe(2);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);

  let cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  let cN = cms.getNaNColor("rgb");
  expect(cN.space).toBe("rgb");
  expect(checkMathResult(cN.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cN.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cN.c3, 0.0, 0.0001)).toBe(true);

  let cB = cms.getBelowColor("rgb");
  expect(cB.space).toBe("rgb");
  expect(checkMathResult(cB.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cB.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cB.c3, 1.0, 0.0001)).toBe(true);

  let cA = cms.getAboveColor("rgb");
  expect(cA.space).toBe("rgb");
  expect(checkMathResult(cA.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cA.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cA.c3, 0.0, 0.0001)).toBe(true);
});

test("CMS Class :: cmsParser_JSON :: Simple CMS with Red Dual Key", () => {
  const cms = cmsParser_JSON(
    '[{"ColorSpace" : "RGB","InterpolationType" : "linear","Creator" : "CCC-Tool","Name" : "Custom CMS","NanColor" : [0,0,0],"AboveColor" : [0,0,0],"BelowColor" : [0,0,0],"RGBPoints" : [0,0.9999999584585605,1,0.9999999896748072,0.5,1,0,0,1,0,0,0],"isCMS" : [true,true,true],"isMoT" : [false,false,false]}]'
  );
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(3);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  let cl = cms.getKeyCL_JSON(0, "rgb");
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  cr = cms.getKeyCR_JSON(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 0.0, 0.0001)).toBe(true);
  cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  cr = cms.getKeyCR_JSON(2, "rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  cl = cms.getKeyCL_JSON(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.5);
  expect(cms.getKeyRef(2)).toBe(1.0);
});

test("CMS Class :: cmsParser_JSON :: Simple CMS with Red/Blue Twin Key", () => {
  const cms = cmsParser_JSON(
    '[{"ColorSpace" : "RGB","InterpolationType" : "linear","Creator" : "CCC-Tool","Name" : "Custom CMS","NanColor" : [0,0,0],"AboveColor" : [0,0,0],"BelowColor" : [0,0,0],"RGBPoints" : [0,0.9999999584585605,1,0.9999999896748072,0.5,1,0,0,0.5,0,0,1,1,0,0,0],"isCMS" : [true,true,true,true],"isMoT" : [false,true,false,false]}]'
  );
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(3);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  let cl = cms.getKeyCL_JSON(0, "rgb");
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  cr = cms.getKeyCR_JSON(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  cr = cms.getKeyCR_JSON(2, "rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  cl = cms.getKeyCL_JSON(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.5);
  expect(cms.getKeyRef(2)).toBe(1.0);
});

test("CMS Class :: cmsParser_JSON :: Simple CMS with Nil, Left and Twin Key", () => {
  const cms = cmsParser_JSON(
    '[{"ColorSpace":"Lab","InterpolationType":"linear","Creator":"CCC-Tool","Name":"ScaledBlackBrown3","NanColor":[0,0,0],"AboveColor":[0,0,0],"BelowColor":[0,0,0],"RGBPoints":[0,1,1,1,0.25,1,1,1,0.25,0,0,1,0.75,1,0,0,0.75,0,0,0,1,0,0,0],"isCMS":[true,true,true,true,true,true],"isMoT":[false,false,true,true,false,false]}]'
  );
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(4);

  let key = cms.getKey(0);
  let cr = key.getCR_JSON("rgb");
  let cl = key.getCL_JSON("rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  key = cms.getKey(1);
  cr = key.getCR_JSON("rgb");
  cl = key.getCL_JSON("rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 1.0, 0.0001)).toBe(true);

  key = cms.getKey(2);
  cr = key.getCR_JSON("rgb");
  cl = key.getCL_JSON("rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  key = cms.getKey(3);
  cr = key.getCR_JSON("rgb");
  cl = key.getCL_JSON("rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.25);
  expect(cms.getKeyRef(2)).toBe(0.75);
  expect(cms.getKeyRef(3)).toBe(1.0);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  cmsParser_XML  //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: cmsParser_XML :: Simple Greyscaled, Check Above, Below and NaN color", () => {
  const cms = cmsParser_XML(
    '<ColorMaps><ColorMap name="Custom CMS" space="RGB" interpolationspace="lab" interpolationtype="linear" creator="CCC-Tool"><Point x="0" o="1" r="0.9999999584585605" g="1" b="0.9999999896748072" cms="1" isMoT="true"/><Point x="1" o="1" r="0" g="0" b="0" cms="1" isMoT="true"/><NaN r="1" g="0" b="0"/><Above r="0" g="1" b="0"/><Below r="0" g="0" b="1"/></ColorMap></ColorMaps>'
  );
  expect(typeof cms).toBe("object");
  expect(typeof cms.getCMSName()).toBe("string");
  expect(cms.getCMSName()).toBe("Custom CMS");
  expect(cms.getKeyLength()).toBe(2);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);

  let cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  let cN = cms.getNaNColor("rgb");
  expect(cN.space).toBe("rgb");
  expect(checkMathResult(cN.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cN.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cN.c3, 0.0, 0.0001)).toBe(true);

  let cB = cms.getBelowColor("rgb");
  expect(cB.space).toBe("rgb");
  expect(checkMathResult(cB.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cB.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cB.c3, 1.0, 0.0001)).toBe(true);

  let cA = cms.getAboveColor("rgb");
  expect(cA.space).toBe("rgb");
  expect(checkMathResult(cA.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cA.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cA.c3, 0.0, 0.0001)).toBe(true);
});

test("CMS Class :: cmsParser_XML :: Simple CMS with Red Dual Key", () => {
  const cms = cmsParser_XML(
    '<ColorMaps><ColorMap name="Custom CMS" space="RGB" interpolationspace="rgb" interpolationtype="linear" creator="CCC-Tool"><Point x="0" o="1" r="0.9999999584585605" g="1" b="0.9999999896748072" cms="1" isMoT="true"/><Point x="0.5" o="1" r="1" g="0" b="0" cms="1" isMoT="true"/><Point x="1" o="1" r="0" g="0" b="0" cms="1" isMoT="true"/><NaN r="0" g="0" b="0"/><Above r="0" g="0" b="0"/><Below r="0" g="0" b="0"/></ColorMap></ColorMaps>'
  );
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(3);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  let cl = cms.getKeyCL_JSON(0, "rgb");
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  cr = cms.getKeyCR_JSON(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 0.0, 0.0001)).toBe(true);
  cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  cr = cms.getKeyCR_JSON(2, "rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  cl = cms.getKeyCL_JSON(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.5);
  expect(cms.getKeyRef(2)).toBe(1.0);
});

test("CMS Class :: cmsParser_XML :: Simple CMS with Red/Blue Twin Key", () => {
  const cms = cmsParser_XML(
    '<ColorMaps><ColorMap name="Custom CMS" space="RGB" interpolationspace="rgb" interpolationtype="linear" creator="CCC-Tool"><Point x="0" o="1" r="0.9999999584585605" g="1" b="0.9999999896748072" cms="1" isMoT="true"/><Point x="0.5" o="1" r="1" g="0" b="0" cms="1" isMoT="true"/><Point x="0.5" o="1" r="0" g="0" b="1" cms="1" isMoT="true"/><Point x="1" o="1" r="0" g="0" b="0" cms="1" isMoT="true"/><NaN r="0" g="0" b="0"/><Above r="0" g="0" b="0"/><Below r="0" g="0" b="0"/></ColorMap></ColorMaps>'
  );
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(3);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  let cl = cms.getKeyCL_JSON(0, "rgb");
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  cr = cms.getKeyCR_JSON(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  cr = cms.getKeyCR_JSON(2, "rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  cl = cms.getKeyCL_JSON(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.5);
  expect(cms.getKeyRef(2)).toBe(1.0);
});

//////////////////////////////////////////////////////////////////
/////////////////////////  cmsParser_CSV  //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: cmsParser_CSV :: Simple Greyscaled, Check Above, Below and NaN color", () => {
  const cms = cmsParser_CSV("Reference;R;G;B;Opacity;cms;isMoT;NaN;R;1;G;0;B;0;Above;R;0;G;1;B;0;Below;R;0;G;0;B;1\n0;0.9999999584585605;1;0.9999999896748072;1;1;true\n1;0;0;0;1;1;true");
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(2);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);

  let cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  let cN = cms.getNaNColor("rgb");
  expect(cN.space).toBe("rgb");
  expect(checkMathResult(cN.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cN.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cN.c3, 0.0, 0.0001)).toBe(true);

  let cB = cms.getBelowColor("rgb");
  expect(cB.space).toBe("rgb");
  expect(checkMathResult(cB.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cB.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cB.c3, 1.0, 0.0001)).toBe(true);

  let cA = cms.getAboveColor("rgb");
  expect(cA.space).toBe("rgb");
  expect(checkMathResult(cA.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cA.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cA.c3, 0.0, 0.0001)).toBe(true);
});

test("CMS Class :: cmsParser_CSV :: Simple CMS with Red Dual Key", () => {
  const cms = cmsParser_CSV("Reference;R;G;B;Opacity;cms;isMoT;NaN;R;0;G;0;B;0;Above;R;0;G;0;B;0;Below;R;0;G;0;B;0\n0;0.9999999584585605;1;0.9999999896748072;1;1;true\n0.5;1;0;0;1;1;true\n1;0;0;0;1;1;true");
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(3);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  let cl = cms.getKeyCL_JSON(0, "rgb");
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  cr = cms.getKeyCR_JSON(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 0.0, 0.0001)).toBe(true);
  cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  cr = cms.getKeyCR_JSON(2, "rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  cl = cms.getKeyCL_JSON(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.5);
  expect(cms.getKeyRef(2)).toBe(1.0);
});

test("CMS Class :: cmsParser_CSV :: Simple CMS with Red/Blue Twin Key", () => {
  const cms = cmsParser_CSV("Reference;R;G;B;Opacity;cms;isMoT;NaN;R;0;G;0;B;0;Above;R;0;G;0;B;0;Below;R;0;G;0;B;0\n0;0.9999999584585605;1;0.9999999896748072;1;1;true\n0.5;1;0;0;1;1;true\n0.5;0;0;1;1;1;true\n1;0;0;0;1;1;true");
  expect(typeof cms).toBe("object");
  expect(cms.getKeyLength()).toBe(3);

  let cr = cms.getKeyCR_JSON(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  let cl = cms.getKeyCL_JSON(0, "rgb");
  expect(cl.space).toBe(undefined);
  expect(cl.c1).toBe(undefined);
  expect(cl.c2).toBe(undefined);
  expect(cl.c3).toBe(undefined);

  cr = cms.getKeyCR_JSON(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(checkMathResult(cr.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cr.c3, 1.0, 0.0001)).toBe(true);
  cl = cms.getKeyCL_JSON(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  cr = cms.getKeyCR_JSON(2, "rgb");
  expect(cr.space).toBe(undefined);
  expect(cr.c1).toBe(undefined);
  expect(cr.c2).toBe(undefined);
  expect(cr.c3).toBe(undefined);
  cl = cms.getKeyCL_JSON(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(checkMathResult(cl.c1, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c2, 0.0, 0.0001)).toBe(true);
  expect(checkMathResult(cl.c3, 0.0, 0.0001)).toBe(true);

  expect(cms.getKeyRef(0)).toBe(0);
  expect(cms.getKeyRef(1)).toBe(0.5);
  expect(cms.getKeyRef(2)).toBe(1.0);
});

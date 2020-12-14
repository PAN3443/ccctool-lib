//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class CMS
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { CMS } = require("../../../cms/class_cms.js");
const { KeyColor } = require("../../../cms/class_cmsKey.js");

//////////////////////////////////////////////////////////////////
/////////////////////////  Constructor  //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: Constructor :: Correct Input", () => {
  const cms = new CMS();
  expect(typeof cms).toBe("object");
  expect(typeof cms.getCMSName()).toBe("string");
});

//////////////////////////////////////////////////////////////////
/////////////////////////  setCMSName  //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: setCMSName :: Correct Input", () => {
  const cms = new CMS();
  cms.setCMSName("LALALA");
  expect(cms.getCMSName()).toBe("LALALA");
});

test("CMS Class :: setCMSName :: Incorrect Input", () => {
  expect(() => {
    const cms = new CMS();
    cms.setCMSName(654);
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////    pushKey    //////////////////////////
//////////////////////////////////////////////////////////////////
pushKey(_key);

test("CMS Class :: setCMSName :: Correct Input", () => {
  const cms = new CMS();
  cms.setCMSName("LALALA");
  expect(cms.getCMSName()).toBe("LALALA");
});

test("CMS Class :: setCMSName :: Incorrect Input", () => {
  expect(() => {
    const cms = new CMS();
    cms.setCMSName(654);
  }).toThrow();
});

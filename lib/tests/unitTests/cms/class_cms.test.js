//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class CMS
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { CMS } = require("../../../cms/class_cms.js");
const { KeyCMS } = require("../../../cms/class_cmsKey.js");
const { checkMathResult } = require("../../../helper/guardClauses.js");

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
/////////////////////////    addKey    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: addKey :: Correct Input", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  expect(cms.getKeyLength()).toBe(1);
  cms.addKey(key3);
  expect(cms.getKeyLength()).toBe(2);
  cms.addKey(key2);
  expect(cms.getKeyLength()).toBe(3);
});

test("CMS Class :: addKey :: Correct Input (with KeyJsons)", () => {
  const key1 = {
    cL: undefined,
    cR: { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 },
    ref: 0.3,
    mot: false,
    isBur: false,
  };

  const key3 = {
    cL: { space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 },
    cR: undefined,
    ref: 1.0,
    mot: false,
    isBur: false,
  };

  const key2 = {
    cL: { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 },
    cR: { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 },
    ref: 0.5,
    mot: false,
    isBur: false,
  };

  const cms = new CMS();
  cms.addKey(key1);
  expect(cms.getKeyLength()).toBe(1);
  cms.addKey(key3);
  expect(cms.getKeyLength()).toBe(2);
  cms.addKey(key2);
  expect(cms.getKeyLength()).toBe(3);
});

test("CMS Class :: addKey :: Incorrect Input", () => {
  expect(() => {
    const cms = new CMS();
    cms.addKey(654);
  }).toThrow();
});

test("CMS Class :: addKey :: Incorrect Input ()", () => {
  expect(() => {
    const cms = new CMS();
    cms.addKey(654);
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////    getKey    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: getKey", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  let key = cms.getKey(0);
  expect(key instanceof KeyCMS).toBe(true);
  key = cms.getKey(1);
  expect(key instanceof KeyCMS).toBe(true);

  let cl = key.getCL();
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(0.5);
  expect(cl.c2).toBe(0.5);
  expect(cl.c3).toBe(0.5);
  let cr = key.getCR();
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0.5);
  expect(cr.c2).toBe(0.5);
  expect(cr.c3).toBe(0.5);
  expect(key.getRef()).toBe(0.5);
  expect(key.getMoT()).toBe(false);
  expect(key.getBur()).toBe(false);

  key = cms.getKey(2);
  expect(key instanceof KeyCMS).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////    getKeyClone    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: getKeyClone", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  let key = cms.getKeyClone(0);
  expect(key instanceof KeyCMS).toBe(true);
  key = cms.getKeyClone(1);
  expect(key instanceof KeyCMS).toBe(true);

  let cl = key.getCL();
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(0.5);
  expect(cl.c2).toBe(0.5);
  expect(cl.c3).toBe(0.5);
  let cr = key.getCR();
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0.5);
  expect(cr.c2).toBe(0.5);
  expect(cr.c3).toBe(0.5);
  expect(key.getRef()).toBe(0.5);
  expect(key.getMoT()).toBe(false);
  expect(key.getBur()).toBe(false);

  key = cms.getKeyClone(2);
  expect(key instanceof KeyCMS).toBe(true);
});

//////////////////////////////////////////////////////////////////
/////////////////////////    getKeyCR    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: getKeyCR", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  let cr = cms.getKeyCR(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0);
  expect(cr.c2).toBe(0);
  expect(cr.c3).toBe(0);

  cr = cms.getKeyCR(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0.5);
  expect(cr.c2).toBe(0.5);
  expect(cr.c3).toBe(0.5);

  cr = cms.getKeyCR(2, "rgb");
  expect(cr).toBe(undefined);
});

//////////////////////////////////////////////////////////////////
/////////////////////////    getKeyCL    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: getKeyCL", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  let cl = cms.getKeyCL(0, "rgb");
  expect(cl).toBe(undefined);

  cl = cms.getKeyCL(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(0.5);
  expect(cl.c2).toBe(0.5);
  expect(cl.c3).toBe(0.5);

  cl = cms.getKeyCL(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(1.0);
  expect(cl.c2).toBe(1.0);
  expect(cl.c3).toBe(1.0);
});

//////////////////////////////////////////////////////////////////
/////////////////////////    setKeyCR    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: setKeyCR", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  cms.setKeyCR(1, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 });
  expect(cms.getKeyType(1)).toBe("twin");

  let cr = cms.getKeyCR(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0.25);
  expect(cr.c2).toBe(0.25);
  expect(cr.c3).toBe(0.25);

  cms.setKeyCR(0, undefined);
  expect(cms.getKeyType(0)).toBe("nil");
  cr = cms.getKeyCR(0, "rgb");
  expect(cr).toBe(undefined);

  cms.setKeyCR(2, undefined);
  expect(cms.getKeyType(2)).toBe("left");
  cr = cms.getKeyCR(2, "rgb");
  expect(cr).toBe(undefined);
});

test("CMS Class :: setKeyCR :: Incorrect Input (string)", () => {
  expect(() => {
    const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
    const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
    const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);
    const cms = new CMS();
    cms.addKey(key1);
    cms.addKey(key3);
    cms.addKey(key2);
    cms.setKeyCR(1, "string");
  }).toThrow();
});

test("CMS Class :: setKeyCR :: Incorrect Input (no left key at the end)", () => {
  expect(() => {
    const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
    const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
    const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);
    const cms = new CMS();
    cms.addKey(key1);
    cms.addKey(key3);
    cms.addKey(key2);
    cms.setKeyCR(2, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 });
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////    setKeyCL    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: setKeyCL", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  cms.setKeyCL(1, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 });
  expect(cms.getKeyType(1)).toBe("twin");

  let cl = cms.getKeyCL(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(0.25);
  expect(cl.c2).toBe(0.25);
  expect(cl.c3).toBe(0.25);

  cms.setKeyCL(0, undefined);
  expect(cms.getKeyType(0)).toBe("right");
  cl = cms.getKeyCL(0, "rgb");
  expect(cl).toBe(undefined);

  cms.setKeyCL(2, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 });
  expect(cms.getKeyType(2)).toBe("left");
  cl = cms.getKeyCL(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(0.5);
  expect(cl.c2).toBe(0.5);
  expect(cl.c3).toBe(0.5);
});

test("CMS Class :: setKeyCL :: Incorrect Input (string)", () => {
  expect(() => {
    const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
    const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
    const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);
    const cms = new CMS();
    cms.addKey(key1);
    cms.addKey(key3);
    cms.addKey(key2);
    cms.setKeyCL(1, "string");
  }).toThrow();
});

test("CMS Class :: setKeyCL :: Incorrect Input (defined left color at the start of the CMS)", () => {
  expect(() => {
    const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
    const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
    const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);
    const cms = new CMS();
    cms.addKey(key1);
    cms.addKey(key3);
    cms.addKey(key2);
    cms.setKeyCL(0, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 });
  }).toThrow();
});

test("CMS Class :: setKeyCL :: Incorrect Input (undefined left color within the CMS)", () => {
  expect(() => {
    const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
    const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
    const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);
    const cms = new CMS();
    cms.addKey(key1);
    cms.addKey(key3);
    cms.addKey(key2);
    cms.setKeyCL(1, undefined);
  }).toThrow();
});

test("CMS Class :: setKeyCL :: Incorrect Input (undefined left color at the end of the CMS)", () => {
  expect(() => {
    const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
    const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
    const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);
    const cms = new CMS();
    cms.addKey(key1);
    cms.addKey(key3);
    cms.addKey(key2);
    cms.setKeyCL(2, undefined);
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////    getCMSJSON/setByJSON    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: getCMSJSON/setByJSON :: correct Input", () => {
  const key1 = new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false);
  const key3 = new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false);
  const key2 = new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false);

  const cms = new CMS();
  cms.setCMSName("LALALA");
  cms.addKey(key1);
  cms.addKey(key3);
  cms.addKey(key2);

  let tmpCmsJSON = cms.getCMSJSON();

  const cms2 = new CMS();
  cms2.setByJSON(tmpCmsJSON);

  expect(cms2.getCMSName()).toBe("LALALA");

  let cr = cms2.getKeyCR(0, "rgb");
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0);
  expect(cr.c2).toBe(0);
  expect(cr.c3).toBe(0);

  cr = cms2.getKeyCR(1, "rgb");
  expect(cr.space).toBe("rgb");
  expect(cr.c1).toBe(0.5);
  expect(cr.c2).toBe(0.5);
  expect(cr.c3).toBe(0.5);

  cr = cms2.getKeyCR(2, "rgb");
  expect(cr).toBe(undefined);

  let cl = cms2.getKeyCL(0, "rgb");
  expect(cl).toBe(undefined);

  cl = cms2.getKeyCL(1, "rgb");
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(0.5);
  expect(cl.c2).toBe(0.5);
  expect(cl.c3).toBe(0.5);

  cl = cms2.getKeyCL(2, "rgb");
  expect(cl.space).toBe("rgb");
  expect(cl.c1).toBe(1.0);
  expect(cl.c2).toBe(1.0);
  expect(cl.c3).toBe(1.0);
});

test("CMS Class :: setByJSON :: Incorrect Input", () => {
  expect(() => {
    const cms = new CMS();
    cms.setByJSON("string");
  }).toThrow();
});

//////////////////////////////////////////////////////////////////
/////////////////////////    searchForContinuousSections    //////////////////////////
//////////////////////////////////////////////////////////////////

test("CMS Class :: searchForContinuousSections :: one continuouse section", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false));

  let cSections = cms.searchForContinuousSections();
  expect(cSections.length).toBe(1);
  expect(cSections[0][0]).toBe(0);
  expect(cSections[0][1]).toBe(2);
});

test("CMS Class :: searchForContinuousSections :: two continuouse section", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 0.5, false, false));

  let cSections = cms.searchForContinuousSections();
  expect(cSections.length).toBe(2);
  expect(cSections[0][0]).toBe(0);
  expect(cSections[0][1]).toBe(1);
  expect(cSections[1][0]).toBe(1);
  expect(cSections[1][1]).toBe(2);
});

test("CMS Class :: searchForContinuousSections :: two continuouse section with constant section as start", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, undefined, 0.0, false, false)); // nil as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.1, c2: 0.1, c3: 0.1 }, 0.1, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 0.5, false, false));

  let cSections = cms.searchForContinuousSections();
  expect(cSections.length).toBe(2);
  expect(cSections[0][0]).toBe(1);
  expect(cSections[0][1]).toBe(2);
  expect(cSections[1][0]).toBe(2);
  expect(cSections[1][1]).toBe(3);
});

test("CMS Class :: searchForContinuousSections :: three continuouse section with constant section within the CMS", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 0.5, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, undefined, 0.6, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 0.75, false, false)); // twin

  let cSections = cms.searchForContinuousSections();
  expect(cSections.length).toBe(3);
  // from right to first twin
  expect(cSections[0][0]).toBe(0);
  expect(cSections[0][1]).toBe(1);
  // from first twin to left key
  expect(cSections[1][0]).toBe(1);
  expect(cSections[1][1]).toBe(2);
  // from left to twin key => constant section
  // from twin to left key (end)
  expect(cSections[2][0]).toBe(3);
  expect(cSections[2][1]).toBe(4);
});

test("CMS Class :: searchForContinuousSections :: three continuouse section with constant section at the end of the CMS", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 0.5, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, undefined, 0.6, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 0.75, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.9, c2: 0.9, c3: 0.9 }, undefined, 0.9, false, false)); // left key

  let cSections = cms.searchForContinuousSections();
  expect(cSections.length).toBe(3);
  // from right to first twin
  expect(cSections[0][0]).toBe(0);
  expect(cSections[0][1]).toBe(1);
  // from first twin to left key
  expect(cSections[1][0]).toBe(1);
  expect(cSections[1][1]).toBe(2);
  // from left to twin key => constant section
  // from twin to left key
  expect(cSections[2][0]).toBe(3);
  expect(cSections[2][1]).toBe(4);
  // from left to left key (end) => constant section
});

test("CMS Class :: searchForContinuousSections :: complicated CMS with dual keys", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, undefined, 0.0, false, false)); // nil as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.1, c2: 0.1, c3: 0.1 }, 0.1, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, 0.25, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.4, c2: 0.4, c3: 0.4 }, { space: "rgb", c1: 0.4, c2: 0.4, c3: 0.4 }, 0.4, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, undefined, 0.6, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 0.75, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.9, c2: 0.9, c3: 0.9 }, undefined, 0.9, false, false)); // left key

  let cSections = cms.searchForContinuousSections();
  expect(cSections.length).toBe(2);
  // from nil to first twin => constant section
  // from first twin to left key
  expect(cSections[0][0]).toBe(1);
  expect(cSections[0][1]).toBe(5);
  // from left to second twin key => constant section
  // from twin to left key
  expect(cSections[1][0]).toBe(6);
  expect(cSections[1][1]).toBe(7);
  // from left to left key (end) => constant section
});

//////////////////////////////////////////////////////////////////////
/////////////////////////    calcReverse    //////////////////////////
//////////////////////////////////////////////////////////////////////

test("CMS Class :: calcReverse :: simple CMS", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false));

  cms.calcReverse();

  // first key
  let color = cms.getKeyCR(0, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);

  color = cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key
  color = cms.getKeyCL(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  color = cms.getKeyCR(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  // third key
  color = cms.getKeyCL(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.getKeyCR(2, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: calcReverse :: simple CMS (Twin Key)", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.3, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 0.5, false, false));

  cms.calcReverse();

  // first key
  let color = cms.getKeyCR(0, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);

  color = cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key
  color = cms.getKeyCL(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.6, 0.0001)).toBe(true);

  color = cms.getKeyCR(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  // third key
  color = cms.getKeyCL(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.getKeyCR(2, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: calcReverse :: simple CMS (with Nil Key)", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, undefined, 0.0, false, false)); // nil as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.1, c2: 0.1, c3: 0.1 }, 0.1, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 0.5, false, false));

  cms.calcReverse();

  // first key (left to right)
  expect(cms.getKeyType(0)).toBe("right");
  let color = cms.getKeyCR(0, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);

  color = cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key (twin to twin)
  expect(cms.getKeyType(1)).toBe("twin");
  color = cms.getKeyCL(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.6, 0.0001)).toBe(true);

  color = cms.getKeyCR(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  // third key (twin to left)
  expect(cms.getKeyType(2)).toBe("left");
  color = cms.getKeyCL(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.1, 0.0001)).toBe(true);

  color = cms.getKeyCR(2, "rgb");
  expect(color).toBe(undefined);

  // fourth key (nil to left)
  expect(cms.getKeyType(3)).toBe("left");
  color = cms.getKeyCL(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.getKeyCR(3, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: calcReverse :: constant section within the CMS", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 0.5, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, undefined, 0.6, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 0.75, false, false)); // twin

  cms.calcReverse();

  // first key
  let color = cms.getKeyCR(0, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);

  color = cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key (now Left key)
  color = cms.getKeyCL(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.8, 0.0001)).toBe(true);

  color = cms.getKeyCR(1, "rgb");
  expect(color).toBe(undefined);

  // third key (twin )
  color = cms.getKeyCL(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.75, 0.0001)).toBe(true);

  color = cms.getKeyCR(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  // fourth key (twin )
  color = cms.getKeyCL(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.3, 0.0001)).toBe(true);

  color = cms.getKeyCR(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.25, 0.0001)).toBe(true);

  // fifth key
  color = cms.getKeyCL(4, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.getKeyCR(4, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: calcReverse :: constant section at the end of the CMS", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 0.5, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, undefined, 0.6, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 0.75, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.9, c2: 0.9, c3: 0.9 }, undefined, 0.9, false, false)); // left key
  cms.calcReverse();

  // first key (nil key)
  let color = cms.getKeyCR(0, "rgb");
  expect(color).toBe(undefined);

  color = cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key (now twin key)
  color = cms.getKeyCL(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);

  color = cms.getKeyCR(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.9, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.9, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.9, 0.0001)).toBe(true);

  // third key (left )
  color = cms.getKeyCL(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.8, 0.0001)).toBe(true);

  color = cms.getKeyCR(2, "rgb");
  expect(color).toBe(undefined);

  // fourth key (twin )
  color = cms.getKeyCL(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.75, 0.0001)).toBe(true);

  color = cms.getKeyCR(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  // fifth key (twin )
  color = cms.getKeyCL(4, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.3, 0.0001)).toBe(true);

  color = cms.getKeyCR(4, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.25, 0.0001)).toBe(true);

  // sixth key
  color = cms.getKeyCL(5, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.getKeyCR(5, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: calcReverse :: multiple dual keys", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, undefined, 0.0, false, false)); // nil as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.1, c2: 0.1, c3: 0.1 }, 0.1, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, 0.25, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.4, c2: 0.4, c3: 0.4 }, { space: "rgb", c1: 0.4, c2: 0.4, c3: 0.4 }, 0.4, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, undefined, 0.6, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 0.75, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.9, c2: 0.9, c3: 0.9 }, undefined, 0.9, false, false)); // left key
  cms.calcReverse();

  // first key (nil key)
  let color = cms.getKeyCR(0, "rgb");
  expect(color).toBe(undefined);

  color = cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key (now twin key)
  color = cms.getKeyCL(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);

  color = cms.getKeyCR(1, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.9, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.9, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.9, 0.0001)).toBe(true);

  // third key (left )
  color = cms.getKeyCL(2, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.8, 0.0001)).toBe(true);

  color = cms.getKeyCR(2, "rgb");
  expect(color).toBe(undefined);

  // fourth key (twin )
  color = cms.getKeyCL(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.75, 0.0001)).toBe(true);

  color = cms.getKeyCR(3, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.6, 0.0001)).toBe(true);

  // fifth key (dual)
  color = cms.getKeyCL(4, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  color = cms.getKeyCR(4, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.5, 0.0001)).toBe(true);

  // sixth key (dual)
  color = cms.getKeyCL(5, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.4, 0.0001)).toBe(true);

  color = cms.getKeyCR(5, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.4, 0.0001)).toBe(true);

  // seventh key (dual)
  color = cms.getKeyCL(6, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.25, 0.0001)).toBe(true);

  color = cms.getKeyCR(6, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.25, 0.0001)).toBe(true);

  // eigth key (twin )
  color = cms.getKeyCL(7, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.1, 0.0001)).toBe(true);

  color = cms.getKeyCR(7, "rgb");
  expect(color).toBe(undefined);

  // ninth key
  color = cms.getKeyCL(8, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.getKeyCR(8, "rgb");
  expect(color).toBe(undefined);
});

//////////////////////////////////////////////////////////////////////
/////////////////////////    setAutoRange    //////////////////////////
//////////////////////////////////////////////////////////////////////

test("CMS Class :: setAutoRange :: simple Test", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false));

  cms.setAutoRange(0, 100);
  expect(checkMathResult(cms.getKeyRef(0), 0, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), 50, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), 100, 0.0001)).toBe(true);

  cms.setAutoRange(-50, 50);
  expect(checkMathResult(cms.getKeyRef(0), -50, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), 0, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), 50, 0.0001)).toBe(true);

  cms.setAutoRange(-100, 0);
  expect(checkMathResult(cms.getKeyRef(0), -100, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), -50, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), 0, 0.0001)).toBe(true);

  cms.setAutoRange(-200, -100);
  expect(checkMathResult(cms.getKeyRef(0), -200, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), -150, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), -100, 0.0001)).toBe(true);
});

//////////////////////////////////////////////////////////////////////
/////////////////////////    equalKeyIntervals    //////////////////////////
//////////////////////////////////////////////////////////////////////

test("CMS Class :: equalKeyIntervals :: simple Test 1", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0.0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1.0, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 0.1, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.2, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 0.3, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, { space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, 0.4, false, false));

  cms.equalKeyIntervals();
  expect(checkMathResult(cms.getKeyRef(0), 0, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), 0.2, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(3), 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(4), 0.8, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(5), 1.0, 0.0001)).toBe(true);
});

test("CMS Class :: equalKeyIntervals :: simple Test 2", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, -100, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, -50, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, -90, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, -89, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, -88, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, { space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, -87, false, false));

  cms.equalKeyIntervals();
  expect(checkMathResult(cms.getKeyRef(0), -100, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), -90, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), -80, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(3), -70, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(4), -60, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(5), -50, 0.0001)).toBe(true);
});

test("CMS Class :: equalKeyIntervals :: simple Test 3", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, -100, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, -90, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, -89, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, -88, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, { space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, -87, false, false));

  cms.equalKeyIntervals();
  expect(checkMathResult(cms.getKeyRef(0), -100, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), -60, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), -20, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(3), 20, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(4), 60, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(5), 100, 0.0001)).toBe(true);
});

test("CMS Class :: equalKeyIntervals :: simple Test 4", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 50, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, 51, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 52, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 53, false, false));
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, { space: "rgb", c1: 0.7, c2: 0.7, c3: 0.7 }, 57, false, false));

  cms.equalKeyIntervals();
  expect(checkMathResult(cms.getKeyRef(0), 50, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(1), 60, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(2), 70, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(3), 80, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(4), 90, 0.0001)).toBe(true);
  expect(checkMathResult(cms.getKeyRef(5), 100, 0.0001)).toBe(true);
});

//////////////////////////////////////////////////////////////////////
/////////////////////////    insertCMS    //////////////////////////
//////////////////////////////////////////////////////////////////////

test("CMS Class :: insertCMS :: Incorrect Input (string)", () => {
  expect(() => {
    const o_cms = new CMS();
    o_cms.insertCMS("string", 0);
  }).toThrow();
});

test("CMS Class :: insertCMS :: insert CMS in empty CMS", () => {
  const o_cms = new CMS();

  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false));

  o_cms.insertCMS(cms.getCMSJSON(), 0);
  expect(checkMathResult(o_cms.getKeyLength(), 3, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(0), 0, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(1), 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(2), 1, 0.0001)).toBe(true);
});

test("CMS Class :: insertCMS :: insert CMS at beginning of a simple CMS", () => {
  const o_cms = new CMS();
  o_cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1, false, false)); // left as end
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 0.5, false, false));

  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.222, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.777, c2: 0.0, c3: 0.0 }, undefined, 1, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.555, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.555, c2: 0.0, c3: 0.0 }, 0.5, false, false));

  o_cms.insertCMS(cms.getCMSJSON(), 0);
  // Check number of keys
  expect(checkMathResult(o_cms.getKeyLength(), 5, 0.0001)).toBe(true);
  // Check key positions
  expect(checkMathResult(o_cms.getKeyRef(0), 0, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(1), 0.125, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(2), 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(3), 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(4), 1, 0.0001)).toBe(true);
  /////////////////////////////////////////////////////////////////
  //// check key colors /////

  // first key
  let color = o_cms.getKeyCR(0, "rgb");
  expect(checkMathResult(color.c1, 0.222, 0.0001)).toBe(true);
  color = o_cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key
  color = o_cms.getKeyCL(1, "rgb");
  expect(checkMathResult(color.c1, 0.555, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(1, "rgb");
  expect(checkMathResult(color.c1, 0.555, 0.0001)).toBe(true);

  // third key
  color = o_cms.getKeyCL(2, "rgb");
  expect(checkMathResult(color.c1, 0.777, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(2, "rgb");
  expect(checkMathResult(color.c1, 0.0, 0.0001)).toBe(true);

  // fourth key
  color = o_cms.getKeyCL(3, "rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(3, "rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);

  // fifth key
  color = o_cms.getKeyCL(4, "rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(4, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: insertCMS :: insert CMS within of a simple CMS", () => {
  const o_cms = new CMS();
  o_cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1, false, false)); // left as end
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, 0.25, false, false));
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, 0.75, false, false));

  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.222, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.777, c2: 0.0, c3: 0.0 }, undefined, 1, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.555, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.555, c2: 0.0, c3: 0.0 }, 0.5, false, false));

  o_cms.insertCMS(cms.getCMSJSON(), 1);
  // Check number of keys
  expect(checkMathResult(o_cms.getKeyLength(), 6, 0.0001)).toBe(true);
  // Check key positions
  expect(checkMathResult(o_cms.getKeyRef(0), 0, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(1), 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(2), 0.375, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(3), 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(4), 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(5), 1, 0.0001)).toBe(true);
  /////////////////////////////////////////////////////////////////
  //// check key colors /////

  // first key
  let color = o_cms.getKeyCR(0, "rgb");
  expect(checkMathResult(color.c1, 0.0, 0.0001)).toBe(true);
  color = o_cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key
  color = o_cms.getKeyCL(1, "rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(1, "rgb");
  expect(checkMathResult(color.c1, 0.222, 0.0001)).toBe(true);

  // third key
  color = o_cms.getKeyCL(2, "rgb");
  expect(checkMathResult(color.c1, 0.555, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(2, "rgb");
  expect(checkMathResult(color.c1, 0.555, 0.0001)).toBe(true);

  // fourth key
  color = o_cms.getKeyCL(3, "rgb");
  expect(checkMathResult(color.c1, 0.777, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(3, "rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);

  // fifth key
  color = o_cms.getKeyCL(4, "rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(4, "rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);

  // sixth key
  color = o_cms.getKeyCL(5, "rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(5, "rgb");
  expect(color).toBe(undefined);
});

test("CMS Class :: insertCMS :: insert CMS at the end of a simple CMS", () => {
  const o_cms = new CMS();
  o_cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 1, false, false)); // left as end
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, 0.25, false, false));
  o_cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, 0.75, false, false));

  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.222, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.777, c2: 0.0, c3: 0.0 }, undefined, 1, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.555, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.555, c2: 0.0, c3: 0.0 }, 0.5, false, false));

  o_cms.insertCMS(cms.getCMSJSON(), 3);
  // Check number of keys
  expect(checkMathResult(o_cms.getKeyLength(), 6, 0.0001)).toBe(true);
  // Check key positions
  expect(checkMathResult(o_cms.getKeyRef(0), 0, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(1), 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(2), 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(3), 0.875, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(4), 0.9375, 0.0001)).toBe(true);
  expect(checkMathResult(o_cms.getKeyRef(5), 1, 0.0001)).toBe(true);
  /////////////////////////////////////////////////////////////////
  //// check key colors /////

  // first key
  let color = o_cms.getKeyCR(0, "rgb");
  expect(checkMathResult(color.c1, 0.0, 0.0001)).toBe(true);
  color = o_cms.getKeyCL(0, "rgb");
  expect(color).toBe(undefined);

  // second key
  color = o_cms.getKeyCL(1, "rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(1, "rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);

  // third key
  color = o_cms.getKeyCL(2, "rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(2, "rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);

  // fourth key
  color = o_cms.getKeyCL(3, "rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(3, "rgb");
  expect(checkMathResult(color.c1, 0.222, 0.0001)).toBe(true);

  // fifth key
  color = o_cms.getKeyCL(4, "rgb");
  expect(checkMathResult(color.c1, 0.555, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(4, "rgb");
  expect(checkMathResult(color.c1, 0.555, 0.0001)).toBe(true);

  // sixth key
  color = o_cms.getKeyCL(5, "rgb");
  expect(checkMathResult(color.c1, 0.777, 0.0001)).toBe(true);
  color = o_cms.getKeyCR(5, "rgb");
  expect(color).toBe(undefined);
});

//////////////////////////////////////////////////////////////////////
/////////////////////////    calculateColor    //////////////////////////
//////////////////////////////////////////////////////////////////////

test("CMS Class :: calculateColor :: simple CMS (Interpolation between two colors)", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 0.5, c3: 0.25 }, undefined, 100, false, false)); // left as end
  cms.setInterpolationType("linear");

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(50, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.5, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.125, 0.0001)).toBe(true);
});

test("CMS Class :: calculateColor :: simple CMS (get colors of the key positions)", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, 50, false, false)); // dual in the middle
  cms.setInterpolationType("linear");

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(50, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.25, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.25, 0.0001)).toBe(true);

  color = cms.calculateColor(0, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.calculateColor(100, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1, 0.0001)).toBe(true);
});

test("CMS Class :: calculateColor :: CMS with constant sections", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, undefined, 0.0, false, false)); // nil as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, { space: "rgb", c1: 0.1, c2: 0.1, c3: 0.1 }, 10, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, { space: "rgb", c1: 0.25, c2: 0.25, c3: 0.25 }, 25, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.4, c2: 0.4, c3: 0.4 }, { space: "rgb", c1: 0.4, c2: 0.4, c3: 0.4 }, 40, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, { space: "rgb", c1: 0.5, c2: 0.5, c3: 0.5 }, 50, false, false)); // dual
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, undefined, 60, false, false)); // left key
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.75, c2: 0.75, c3: 0.75 }, { space: "rgb", c1: 0.8, c2: 0.8, c3: 0.8 }, 70, false, false)); // twin
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.9, c2: 0.9, c3: 0.9 }, undefined, 90, false, false)); // left key

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(0, "rgb"); // color at the nil key pos
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.calculateColor(5, "rgb"); // color inside the constant section
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0, 0.0001)).toBe(true);

  color = cms.calculateColor(17.5, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.175, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.175, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.175, 0.0001)).toBe(true);

  color = cms.calculateColor(40, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.4, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.4, 0.0001)).toBe(true);

  color = cms.calculateColor(45, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.45, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.45, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.45, 0.0001)).toBe(true);

  color = cms.calculateColor(65, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.75, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.75, 0.0001)).toBe(true);

  color = cms.calculateColor(80, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.85, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.85, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.85, 0.0001)).toBe(true);

  color = cms.calculateColor(95, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1, 0.0001)).toBe(true);

  color = cms.calculateColor(100, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1, 0.0001)).toBe(true);
});

test("CMS Class :: calculateColor :: Twin Keys Mot False", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 50, false, false)); // twin in the middle
  cms.setInterpolationType("linear");

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(50, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.3, 0.0001)).toBe(true);
});

test("CMS Class :: calculateColor :: Twin Keys Mot True", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, { space: "rgb", c1: 0.6, c2: 0.6, c3: 0.6 }, 50, false, true)); // twin in the middle
  cms.setInterpolationType("linear");

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(50, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.6, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.6, 0.0001)).toBe(true);
});

test("CMS Class :: calculateColor :: Left Key Mot False", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, undefined, 50, false, false)); // left in the middle
  cms.setInterpolationType("linear");

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(50, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 0.3, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 0.3, 0.0001)).toBe(true);
});

test("CMS Class :: calculateColor :: Left Key Mot True", () => {
  const cms = new CMS();
  cms.addKey(new KeyCMS(undefined, { space: "rgb", c1: 0.0, c2: 0.0, c3: 0.0 }, 0, false, false)); // right as start
  cms.addKey(new KeyCMS({ space: "rgb", c1: 1.0, c2: 1.0, c3: 1.0 }, undefined, 100, false, false)); // left as end
  cms.addKey(new KeyCMS({ space: "rgb", c1: 0.3, c2: 0.3, c3: 0.3 }, undefined, 50, false, true)); // left in the middle
  cms.setInterpolationType("linear");

  cms.setInterpolationSpace("rgb");
  let color = cms.calculateColor(50, "rgb");
  expect(color.space).toBe("rgb");
  expect(checkMathResult(color.c1, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c2, 1.0, 0.0001)).toBe(true);
  expect(checkMathResult(color.c3, 1.0, 0.0001)).toBe(true);
});

//////////////////////////////////////////////
//////////////      HEADER      //////////////
//////////////////////////////////////////////
// File :: Unit-Tests for Class CMS
// Author :: Pascal Nardini
// License :: MIT
// https://jestjs.io/docs/en/expect

const { CMS } = require("../../../cms/class_cms.js");
const { KeyCMS } = require("../../../cms/class_cmsKey.js");

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
/////////////////////////    getKey    //////////////////////////
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

let Class_Color = require("./lib/color/class_Color");
let CCC_Color = Class_Color.CCC_Color;

////////// Test /////////
/// ->node
/// ->test = require('./index');
/// ->test.testColor();

module.exports = {
  ////////////////////////////
  /////// Color Tests ////////
  ////////////////////////////
  fullTest_Color: function () {
    console.log("***********************************************");
    console.log("************ Start Full Color Test ************");
    console.log("***********************************************\n");

    this.test_Color_CheckInput();
  },

  test_Color_CheckInput: function () {
    testColor = new CCC_Color("rgb", 1, 1, 1);

    console.log("\t***********************************************");
    console.log("\t************      Color Input      ************");
    console.log("\t***********************************************\n");
    logTestResult(testColor.setColor("rgb", 0, 0, 0), true, 'Function "setColor" :: Correct RGB Input');
    logTestResult(testColor.setColor("hsv", 0, 0, 0), true, 'Function "setColor" :: Correct HSV Input');
    logTestResult(testColor.setColor("xyz", 0, 0, 0), true, 'Function "setColor" :: Correct XYZ Input');
    logTestResult(testColor.setColor("lab", 0, 0, 0), true, 'Function "setColor" :: Correct Lab Input');
    logTestResult(testColor.setColor("lch", 0, 0, 0), true, 'Function "setColor" :: Correct LCH Input');
    logTestResult(testColor.setColor("din99", 0, 0, 0), true, 'Function "setColor" :: Correct DIN99 Input');
    logTestResult(testColor.setColor("lms", 0, 0, 0), true, 'Function "setColor" :: Correct LMS Input');
    logTestResult(testColor.setColor("rgb", "NaN", 0, 0), false, 'Function "setColor" :: Recognition C1 is NaN');
    logTestResult(testColor.setColor("rgb", 0, "NaN", 0), false, 'Function "setColor" :: Recognition C2 is NaN');
    logTestResult(testColor.setColor("rgb", 0, 0, "NaN"), false, 'Function "setColor" :: Recognition C3 is NaN');
    logTestResult(testColor.setColor(0, 0, 0, 0), false, 'Function "setColor" :: Type C3 is not a string');

    logTestResult(testColor.setColor("rgb", -50, -50, -50), true, 'Function "setColor" :: RGB-Impossible RGB Input');
    logTestResult(testColor.setColor("hsv", -10, -10, -10), true, 'Function "setColor" :: RGB-Impossible HSV Input');
    logTestResult(testColor.setColor("xyz", -500, -500, -500), true, 'Function "setColor" :: RGB-Impossible XYZ Input');
    logTestResult(testColor.setColor("lab", -500, -500, -500), true, 'Function "setColor" :: RGB-Impossible Lab Input');
    logTestResult(testColor.setColor("lch", -500, -500, -500), true, 'Function "setColor" :: RGB-Impossible LCH Input');
    logTestResult(testColor.setColor("din99", -500, -500, -500), true, 'Function "setColor" :: RGB-Impossible DIN99 Input');
    logTestResult(testColor.setColor("lms", -500, -500, -500), true, 'Function "setColor" :: RGB-Impossible LMS Input');
  },

  ////////////////////////////
  ///////// CMS Tests ////////
  ////////////////////////////
  testCMS: function () {
    console.log("No Test FOR CMS");
  },
};

////////////////////////////
/////////   Other   ////////
////////////////////////////

function logTestResult(checkIs, checkShould, testText) {
  if (checkIs === checkShould) {
    console.log("\tTest :: " + testText + "\n\t----------> Correct\n");
  } else {
    console.log("\tTest :: " + testText + "\n\t----------> Incorrect\n");
    throw new Error("\tIncorrect Test Result. Test :: " + testText);
  }
}

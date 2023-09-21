"use strict";
exports.__esModule = true;
var Checker_1 = require("./Checker");
var GenerateBuildData_1 = require("./GenerateBuildData");
var GenerateClassData_1 = require("./GenerateClassData");
var Utils_NodeJS_1 = require("./Utils_NodeJS");
var main = function () {
    if ((0, Utils_NodeJS_1.IsParamExist)('build')) {
        var res = (0, GenerateBuildData_1.GenerateBuildData)((0, Utils_NodeJS_1.IsParamExist)('beauty'));
        if (typeof res === 'string')
            (0, Utils_NodeJS_1.LogRed)('error: ' + res);
        else
            (0, Utils_NodeJS_1.LogGreen)('Success');
    }
    else if ((0, Utils_NodeJS_1.IsParamExist)('check')) {
        (0, Checker_1.Check)();
    }
    else if ((0, Utils_NodeJS_1.IsParamExist)('class')) {
        (0, GenerateClassData_1.GenerateClassData)();
    }
};
main();

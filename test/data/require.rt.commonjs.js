'use strict';
var React = require('react/addons');
var _ = require('lodash');
var myComp = require('comps/myComp');
var utils = require('utils/utils');
var member = require('module-name').member;
var alias2 = require('module-name').member;
var alias3 = require('module-name');
var alias4 = require('module-name').default;
module.exports = function () {
    return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
};
'use strict';
var React = require('react');
var myComp = require('comps/myComp');
var utils = require('utils/utils');
module.exports = function () {
    return React.createElement(myComp, {}, '\n', utils.translate('Hello', 'es'), '\n');
};

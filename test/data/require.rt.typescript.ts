import React = require('react/addons');
import _ = require('lodash');
import myComp = require('comps/myComp');
import utils = require('utils/utils');


var fn = function() { return React.createElement(myComp,{},"\n",(utils.translate('Hello','es')),"\n") };
export = fn
import React = require('react');
import _ = require('lodash');
import myComp = require('comps/myComp');
import utils = require('utils/utils');
export = function() { return React.createElement(myComp,{},"\n",(utils.translate('Hello','es')),"\n") };


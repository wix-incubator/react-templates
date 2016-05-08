import React = require('react/addons');
import _ = require('lodash');
import myComp = require('comps/myComp');
import utils = require('utils/utils');
import member = require('module-name').member;
import alias2 = require('module-name').member;
import alias3 = require('module-name');
import alias4 = require('module-name').default;


var fn = function() { return React.createElement(myComp,{},"\n",(utils.translate('Hello','es')),"\n") };
export = fn
/**
 * Created by avim on 12/2/2014.
 */
'use strict';
var React = require('react/addons');
var fiddle = require('./fiddle.js');
var intro = require('./intro.js');

window.initFiddle = function () {
    window.fiddle = React.render(fiddle(), document.getElementById('container'));
};

window.initIntro = function () {
    window.intro = React.render(intro(), document.getElementById('container'));
};

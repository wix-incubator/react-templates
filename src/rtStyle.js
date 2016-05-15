'use strict';
const css = require('css');
const _ = require('lodash');
const rtnData = require('./rt-style-support-data.js');


const templateCommonJSTemplate = _.template(
`'use strict';
var style = <%= body %>;
module.exports = style;
`);

function convert(text) {
    return templateCommonJSTemplate({body: convertBody(text)});
}

function convertBody(text) {
    //source
    const obj = css.parse(text, {silent: false});
    const result = _.reduce(obj.stylesheet.rules, processRule2, {});
    return JSON.stringify(result, undefined, 2);
}

function processRule2(result, rule) {
    const name = rule.selectors[0].substring(1);
    result[name] = _.reduce(rule.declarations, processDeclaration, {});
    return result;
}

function processDeclaration(result, dec) {
    const prop = _.camelCase(dec.property);
    result[prop] = convertValue(prop, dec.value);
    return result;
}

function convertValue(p, v) {
    if (rtnData[p] === 'string') {
        return v;
    }
    // TODO remove units
    return parseInt(v.match(/(\d+)/g)[0], 10);
}

module.exports = {
    convert,
    convertBody
};

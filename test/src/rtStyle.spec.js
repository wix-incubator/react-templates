'use strict';
const rtStyle = require('../../src/rtStyle');

module.exports = {
    runTests(test) {
        test('test rtStyle', t => {
            const text = '.text { background-color: #00346E; padding: 3px; }';
            const expected = '{\n  "text": {\n    "backgroundColor": "#00346E",\n    "padding": 3\n  }\n}';
            const actual = rtStyle.convertBody(text);
            t.equal(actual, expected);
            t.end();
        });
    }
};

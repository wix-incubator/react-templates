define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function templateProp1(name, arg1) {
        return React.createElement('div', {}, 'Name: ', name, ' ', arg1);
    }
    function scopeName2() {
        var name = 'boten';
        return React.createElement('div', { 'templateProp': templateProp1.bind(this, name) });
    }
    return function () {
        return scopeName2.apply(this, []);
    };
});

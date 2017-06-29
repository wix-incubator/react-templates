define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        function templateProp1(name) {
            return React.createElement('div', {}, 'Name: ', name, ' some');
        }
        function scopeName2() {
            var name = 'boten';
            return React.createElement('div', { 'templateProp': templateProp1.call(this, name) });
        }
        return scopeName2.apply(this, []);
    };
});
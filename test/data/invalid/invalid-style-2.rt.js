define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        function scopeG1() {
            var g = 'ground';
            return React.createElement('div', {}, React.createElement('span', { 'style': { backG: 'red' } }));
        }
        return scopeG1.apply(this, []);
    };
});
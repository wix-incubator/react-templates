define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function repeatN1(verb, n, nIndex) {
        return [
            React.createElement('div', { 'key': '2211' }, verb, ' ', n, '-a'),
            React.createElement('div', { 'key': '2213' }, verb, ' ', n, '-b')
        ];
    }
    function scopeVerb2() {
        var verb = 'rendered';
        return [
            1 < 0 ? [React.createElement('div', { 'key': '551' }, 'this is not ', verb)] : null,
            1 > 0 ? [React.createElement('div', { 'key': '1401' }, 'this is ', verb)] : null,
            _.map([
                1,
                2
            ], repeatN1.bind(this, verb))
        ];
    }
    return function () {
        return React.createElement('div', {}, scopeVerb2.apply(this, []));
    };
});
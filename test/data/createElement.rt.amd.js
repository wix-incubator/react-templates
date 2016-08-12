define([
    'react',
    'lodash'
], function ($0, _) {
    'use strict';
    var h = $0.createElement;
    return function () {
        return h('div', {}, h('span', {}, 'Hello'));
    };
});
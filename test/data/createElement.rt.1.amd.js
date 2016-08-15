define([
    'preact',
    'lodash'
], function ($0, _) {
    'use strict';
    var h = $0.h;
    return function () {
        return h('div', {}, h('span', {}, 'Hello'));
    };
});
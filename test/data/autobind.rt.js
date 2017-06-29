define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.createElement('div', { 'onKeyDown': this.handleKeyDown.bind(this) });
    };
});


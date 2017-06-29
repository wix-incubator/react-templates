define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.createElement('div', {}, React.createElement('div', {}, ' This is a ', this.props.name, ' example '), React.createElement('div', {}, ' \xA0 '), React.createElement('div', {}, '    aaa    '), React.createElement('pre', {}, '\n        This   is  a\n        ', this.props.name, '\n        example\n    '), React.createElement('textarea', {}, '\n        This   is  a\n        ', this.props.name, '\n        example\n    ', React.createElement('textarea', {}, React.createElement('div', {}, '\n        This   is  a\n        ', this.props.name, '\n        example\n    \n'))));
    };
});
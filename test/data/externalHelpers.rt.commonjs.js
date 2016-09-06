'use strict';
var React = require('react');
var __rtmap = require('react-templates-helpers').__rtmap;
var __rtassign = require('react-templates-helpers').__rtassign;
var __rtmergeprops = require('react-templates-helpers').__rtmergeprops;
var __rtclass = require('react-templates-helpers').__rtclass;
module.exports = function () {
    function repeatA1(a, aIndex) {
        return React.createElement('div', {}, a);
    }
    return React.createElement.apply(this, [
        'div',
        {}    /*  tests __rtmap helper  */,
        __rtmap([
            1,
            2,
            3
        ], repeatA1.bind(this))    /*  tests __rtassign helper  */,
        React.createElement(ChildComp, __rtassign({}, { 'c': '3' }, {
            a: 1,
            b: 2
        }))    /*  tests __rtmergeprops helper  */,
        React.createElement(ChildComp, __rtmergeprops({
            'style': {
                height: '10px',
                width: '3px'
            },
            'className': 'clsA'
        }, {
            style: { width: '5px' },
            type: 'text',
            className: 'clsB'
        }))    /*  tests __rtclass helper  */,
        React.createElement('div', {
            'className': __rtclass({
                a: true,
                b: true
            })
        })
    ]);
};
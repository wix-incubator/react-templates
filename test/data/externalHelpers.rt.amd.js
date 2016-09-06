define([
    'react',
    'react-templates-helpers',
    'react-templates-helpers',
    'react-templates-helpers',
    'react-templates-helpers'
], function (React, $1, $2, $3, $4) {
    'use strict';
    var __rtmap = $1.__rtmap;
    var __rtassign = $2.__rtassign;
    var __rtmergeprops = $3.__rtmergeprops;
    var __rtclass = $4.__rtclass;
    return function () {
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
});
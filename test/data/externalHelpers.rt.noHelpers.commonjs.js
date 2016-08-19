'use strict';
var React = require('react');
var _ = require('lodash');
module.exports = function () {
    function repeatA1(a, aIndex) {
        return React.createElement('div', {}, a);
    }
    function mergeProps(inline, external) {
        var res = _.assign({}, inline, external);
        if (inline.hasOwnProperty('style')) {
            res.style = _.defaults(res.style, inline.style);
        }
        if (inline.hasOwnProperty('className') && external.hasOwnProperty('className')) {
            res.className = external.className + ' ' + inline.className;
        }
        return res;
    }
    return React.createElement.apply(this, [
        'div',
        {}    /*  tests __rtmap helper  */,
        _.map([
            1,
            2,
            3
        ], repeatA1.bind(this))    /*  tests __rtassign helper  */,
        React.createElement(ChildComp, _.assign({}, { 'c': '3' }, {
            a: 1,
            b: 2
        }))    /*  tests __rtmergeprops helper  */,
        React.createElement(ChildComp, mergeProps({
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
            'className': _.transform({
                a: true,
                b: true
            }, function (res, value, key) {
                if (value) {
                    res.push(key);
                }
            }, []).join(' ')
        })
    ]);
};
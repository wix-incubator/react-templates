/*eslint new-cap:0,no-unused-vars:0*/
define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function onClick1(items, itemsIndex, evt) {
        this.happend(evt);
        return false;
    }
    function onMouseDown2(items, itemsIndex) {
        this.happend();
        return false;
    }
    function repeatItems3(items, itemsIndex) {
        return React.DOM.div({}, React.DOM.span({
            'style': {
                width: 'auto',
                lineHeight: '5px'
            },
            'onClick': onClick1.bind(this, items, itemsIndex),
            'onMouseDown': onMouseDown2.bind(this, items, itemsIndex)
        }, 'Mock'));
    }
    return function () {
        return React.DOM.p.apply(this, _.flatten([
            {},
            _.map(this.props.things, repeatItems3.bind(this))
        ]));
    };
});
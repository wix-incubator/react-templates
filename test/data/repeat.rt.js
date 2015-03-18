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
        return React.createElement('div', {}, React.createElement('span', {
            'style': {
                width: 'auto',
                lineHeight: '5px'
            },
            'onClick': onClick1.bind(this, items, itemsIndex),
            'onMouseDown': onMouseDown2.bind(this, items, itemsIndex)
        }, 'Mock'));
    }
    return function () {
        return React.createElement.apply(this, [
            'p',
            {},
            _.map(this.props.things, repeatItems3.bind(this))
        ]);
    };
});
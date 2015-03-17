define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    function onClick1(items, itemsIndex, itemsPos, evt) {
        this.happend(evt);
        return false;
    }
    function onMouseDown2(items, itemsIndex, itemsPos) {
        this.happend();
        return false;
    }
    function repeatItems3(items, itemsIndex, itemsPos) {
        return React.createElement('div', {}, React.createElement('span', {
            'style': {
                width: 'auto',
                lineHeight: '5px'
            },
            'onClick': onClick1.bind(this, items, itemsIndex, itemsPos),
            'onMouseDown': onMouseDown2.bind(this, items, itemsIndex, itemsPos)
        }, 'Mock'));
    }
    return function () {
        return React.createElement.apply(this, _.flatten([
            'p',
            {},
            function (_this, collection) {
                var pos = 0;
                return _.map(collection, function () {
                    var args = Array.prototype.slice.call(arguments, 0, 2);
                    args.push(pos++);
                    return repeatItems3.apply(_this, [].concat(args));
                });
            }.call(null, this, this.props.things)
        ]));
    };
});
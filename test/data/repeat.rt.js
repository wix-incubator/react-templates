define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function onClick1(items, itemsIndex, evt) {
        this.happend(evt);
        return false;
    }
    function repeatItems2(items, itemsIndex) {
        return React.DOM.div.apply(this, _.flatten([{}].concat([React.DOM.span.apply(this, _.flatten([{
                    'style': {
                        width: 'auto',
                        lineHeight: '5px'
                    },
                    'onClick': onClick1.bind(this, items, itemsIndex)
                }].concat(['Mock'])))])));
    }
    return function () {
        return React.DOM.p.apply(this, _.flatten([{}].concat([_.map(this.props.things, repeatItems2.bind(this))])));
    };
});
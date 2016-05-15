define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    function repeatItem1(item, customIndex) {
        return React.createElement('li', {}, item, ' is number ', customIndex);
    }
    return function () {
        return React.createElement.apply(this, [
            'ul',
            {},
            _.map(this.props.collection, repeatItem1.bind(this, customIndex))
        ]);
    };
});

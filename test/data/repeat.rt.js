define([
    'react',
    'lodash'
], function (React, _) {
    function generated1(items, itemsIndex, evt) {
        this.happend(evt);
        return false;
    }
    return function () {
        return React.DOM.p.apply(this, _.flatten([{}].concat([_.map(this.props.things, function (items, itemsIndex) {
                return React.DOM.div.apply(this, _.flatten([{}].concat([React.DOM.span.apply(this, _.flatten([{
                            'style': {
                                width: 'auto',
                                'line-height': '5px'
                            },
                            'onClick': generated1.bind(this, items, itemsIndex)
                        }].concat(['Mock'])))])));
            }, this)])));
    };
});
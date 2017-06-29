define([
    'react',
    'lodash'
], function (React, _) {
    var comp = React.createClass({
        render: function () {
            return React.createElement('div', {}, 'hello world');
        }
    });
    return comp;
});
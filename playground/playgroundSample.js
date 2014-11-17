var React = require('react/addons');
var _ = require('lodash');
var playgroundSample = React.createClass({
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.stateString) {
            try {
                this.setState(JSON.parse(nextProps.stateString));
            } catch (e) {

            }
        }
    },
    render: function () {
        var res = null;
        try {
            res = this.props.renderFunc.apply(this)
        } catch (e) {

        }
        return React.DOM.div.apply(this, _.flatten([
            {},
            res
        ]));
    }
});

module.exports = playgroundSample;
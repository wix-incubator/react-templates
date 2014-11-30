/*eslint new-cap:0,no-unused-vars:0*/
define([
    'react',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.DOM.div({}, React.DOM.div({
            'style': {
                position: 'relative',
                textAlign: 'center',
                top: this.props.config.previewTop,
                height: this.props.config.previewHeight
            }
        }, React.DOM.div({
            'style': {
                margin: 'auto',
                height: '100%',
                width: this.props.config.previewWidth || '100%'
            }
        }, React.DOM.iframe({
            'id': 'preview',
            'src': 'http://localhost/sites/412?ds=true',
            'style': {
                width: '100%',
                height: '100%',
                border: '0'
            }
        }))), React.DOM.div({}, 'editor\n        ', !this.props.editorState.previewMode ? React.DOM.div({}, 'left bar') : null));
    };
});
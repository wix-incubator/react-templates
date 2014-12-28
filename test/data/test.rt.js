define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.createElement('div', {}, React.createElement('div', {
            'style': {
                position: 'relative',
                textAlign: 'center',
                top: this.props.config.previewTop,
                height: this.props.config.previewHeight
            }
        }, React.createElement('div', {
            'style': {
                margin: 'auto',
                height: '100%',
                width: this.props.config.previewWidth || '100%'
            }
        }, React.createElement('iframe', {
            'id': 'preview',
            'src': 'http://localhost/sites/412?ds=true',
            'style': {
                width: '100%',
                height: '100%',
                border: '0'
            }
        }))), React.createElement('div', {}, 'editor\n        ', !this.props.editorState.previewMode ? React.createElement('div', {}, 'left bar') : null));
    };
});
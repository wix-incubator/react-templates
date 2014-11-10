define([
    'react',
    'lodash'
], function (React, _) {
    return React.DOM.div.apply(this, _.flatten([{}].concat([
        React.DOM.div.apply(this, _.flatten([{
                'style': {
                    position: 'relative',
                    textAlign: 'center',
                    top: this.props.config.previewTop,
                    height: this.props.config.previewHeight
                }
            }].concat([React.DOM.div.apply(this, _.flatten([{
                    'style': {
                        margin: 'auto',
                        height: '100%',
                        width: this.props.config.previewWidth || '100%'
                    }
                }].concat([React.DOM.iframe.apply(this, _.flatten([{
                        'id': 'preview',
                        'src': 'http://localhost/sites/412?ds=true',
                        'style': {
                            width: '100%',
                            height: '100%',
                            border: '0'
                        }
                    }].concat([])))])))]))),
        React.DOM.div.apply(this, _.flatten([{}].concat([
            'editor',
            !this.props.editorState.previewMode ? React.DOM.div.apply(this, _.flatten([{}].concat(['left bar']))) : null
        ])))
    ])));
});
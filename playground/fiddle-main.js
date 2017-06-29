requirejs.config({
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
        jquery: '//code.jquery.com/jquery-2.1.4.min',
        firebase: '//cdn.firebase.com/js/client/2.0.5/firebase',
        react: '//cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react-with-addons',
        'react-dom': '//cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react-dom',
        fiddle: './fiddle',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json',
        bootstrap: 'libs/bootstrap/bootstrap.min'
    },
    shim: {
        lodash: {exports: '_'},
        firebase: {exports: 'Firebase'},
        jquery: {exports: '$'},
        react: {exports: 'React'},
        'react-dom': {exports: 'ReactDOM'}
    },
    map: {
        '*': {'react/addons': 'react'}
    }
})

requirejs(['fiddle', 'react', 'react-dom', 'jquery', 'bootstrap'], function (fiddle, React, ReactDOM) {
    'use strict'
    var elem = React.createElement(fiddle)
    window.fiddle = ReactDOM.render(elem, document.getElementById('container'))
})

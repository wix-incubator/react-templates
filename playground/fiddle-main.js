requirejs.config({
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
        jquery: '//code.jquery.com/jquery-2.1.4.min',
        firebase: '//cdn.firebase.com/js/client/2.0.5/firebase',
        react: '//cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons',
        fiddle: './fiddle',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json',
        bootstrap: 'libs/bootstrap/bootstrap.min'
    },
    shim: {
        lodash: {exports: '_'},
        firebase: {exports: 'Firebase'},
        jquery: {exports: '$'},
        react: {exports: 'React'}
    },
    map: {
        '*': {'react/addons': 'react'}
    }
});

requirejs(['fiddle', 'react', 'jquery', 'bootstrap'], function (fiddle, React) {
    'use strict';
    var elem = React.createElement(fiddle);
    window.fiddle = React.render(elem, document.getElementById('container'));
});

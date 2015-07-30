requirejs.config({
    //baseUrl: '.',
    baseUrl: './playground',
    paths: {
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
        jquery: '//code.jquery.com/jquery-2.1.4.min',
        firebase: 'https://cdn.firebase.com/js/client/2.0.5/firebase',
        react: '//cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react-with-addons',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json'
        //examples: './examples'
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

requirejs(['./examples', 'react', 'jquery'], function (Examples, React) {
    'use strict';
    var elem = React.createElement(Examples);
    React.render(elem, document.getElementById('home-section'));
});

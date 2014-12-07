requirejs.config({
//    baseUrl: '/',
    paths: {
        lodash: 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash',
        jquery: 'http://code.jquery.com/jquery-1.11.0.min',
        firebase: 'https://cdn.firebase.com/js/client/2.0.5/firebase',
        react: 'http://fb.me/react-with-addons-0.12.1',
        //ace: '../ace-builds-1.1.8/src-min/ace',
        fiddle: './fiddle'
        //'react/addons': 'http://fb.me/react-with-addons-0.12.1'
    },
    shim: {
        lodash: { exports: '_' },
        firebase: { exports: 'Firebase' },
        //ace: { exports: 'ace' },
        jquery: { exports: '$' },
        react: { exports: 'React' }
    },
    map: {
        '*': {
            'react/addons': 'react'
        }
    }
});

requirejs(['jquery', 'react', 'fiddle'], function ($, React, fiddle) {
    'use strict';
    window.fiddle = React.render(fiddle(), document.getElementById('container'));
});


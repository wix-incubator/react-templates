requirejs.config({
//    baseUrl: '/',
    paths: {
        lodash: 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
        jquery: 'http://code.jquery.com/jquery-1.11.0.min',
        firebase: 'https://cdn.firebase.com/js/client/2.0.5/firebase',
        react: 'http://fb.me/react-with-addons-0.12.2',
        //ace: '../ace-builds-1.1.8/src-min/ace',
        fiddle: './fiddle',
        text: 'libs/requirejs-plugins/text',
        json: 'libs/requirejs-plugins/json'
        //codeMirror: 'libs/codemirror-4.8/lib/codemirror',
        //htmlmixed: 'libs/codemirror-4.8/mode/htmlmixed/htmlmixed',
        //javascript: 'libs/codemirror-4.8/mode/javascript/javascript'
        //'react/addons': 'http://fb.me/react-with-addons-0.12.1'
    },
    shim: {
        lodash: {exports: '_'},
        firebase: {exports: 'Firebase'},
        //ace: { exports: 'ace' },
        jquery: {exports: '$'},
        react: {exports: 'React'}
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
    $(function () {
        //$(window).resize(calcSize);
        //calcSize();
    });

    function calcSize() {
        var contentHeight = $(window).height() - $('#header').height();
        var height = contentHeight / 2 - 10;
        console.log(contentHeight, height);
        $('.code-area').each(function (i, k) {
            $(this).height(height);
            console.log($(this).height());
        });
        window.editorCode.refresh();
        window.editorRT.refresh();
        window.editorGenerated.refresh();
    }
});


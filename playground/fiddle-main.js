requirejs.config({
//    baseUrl: '/',
    paths: {
        lodash: 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
        jquery: 'http://code.jquery.com/jquery-1.11.0.min',
        firebase: 'https://cdn.firebase.com/js/client/2.0.5/firebase',
        react: 'http://fb.me/react-with-addons-0.12.1.min',
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
        $(window).resize(calcSize);
        calcSize();
    });

    function calcSize() {
        var contentHeight = $(document).height() - 48;
        //$('#container').height(contentHeight).width($(document).width());
        //$('.code-area').each(function (i) {
        //    var h = (contentHeight / 2) - 10;
        //    var w = ($(document).width() / 2) - 10;
        //    $(this).height(h).width(w);
        //});


        //var h = (contentHeight / 2) - 10;
        //var w = ($(document).width() / 2) - 10;
        //var size = getWindowSize();
        //$('#editor-rt').css({
        //    top: 50, left: 0, bottom: h, right: w, position: 'absolute'
        //});
        //$('#editor-code').css({
        //    top: 50, left: w, bottom: h, right: 0, position: 'absolute'
        //});
        //$('#editor-generated').css({
        //    top: 50 + h, left: 0, bottom: 0, right: w, position: 'absolute'
        //});
        //$('#result-area').css({
        //    top: 50 + h, left: w, bottom: 0, right: 0, position: 'absolute'
        //});

        //$('.code-area').each(function (i, k) {
        //    //var h = (contentHeight / 2) - 10;
        //    //var w = ($(document).width() / 2) - 10;
        //    //$(this).height(h).width(w);
        //    $(this).css({
        //        top: 50 + h, left: w, bottom: 0, right: 0, position: 'absolute'
        //    });
        //});

        $('.large-text-area').each(function (i, k) {
            //var h = (contentHeight / 2) - 10;
            //var w = ($(document).width() / 2) - 10;
            var $this = $(this);
            $this.height($this.parent().height() - 2).width($this.parent().width() - 2);
            //$this.children().height($this.parent().height() - 2).width($this.parent().width() - 2);
        });
        var $result = $('#result-container');
        $result.height($result.parent().height() - 2).width($result.parent().width() - 2);
    }
});


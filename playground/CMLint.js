define(['react', 'lodash', 'jquery', './libs/codemirror-4.8/lib/codemirror'], function (React, _, $, CodeMirror) {
    'use strict';
    //var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    //    lineNumbers: true,
    //    viewportMargin: Infinity,
    //    gutters: ['CodeMirror-linenumbers', 'GUTTER_ID']
    //});
    //
    //editor.markText({line: 1, ch: 1}, {line: 1, ch: 10}, {className: 'editor-error'});

    function annotationTooltip(ann) {
        var severity = ann.severity;
        if (!severity) {
            severity = 'error';
        }
        var tip = document.createElement('div');
        tip.className = 'CodeMirror-lint-message-' + severity;
        tip.appendChild(document.createTextNode(ann.message));
        return tip;
    }

    var GUTTER_ID = 'rt-annotations';

    function annotate(editor, annot) {
        //if (annot.index) {
        //    //posFromIndex
        //    var pos = editor.findPosH({line: 0, ch: 0}, 25, 'char');
        //    var range = editor.findWordAt(pos);
        //    editor.markText(range.anchor,  range.head, {className: 'editor-error'});
        //}
        var tipLabel = /*state.hasGutter &&*/ document.createDocumentFragment();
        var ann = {severity: 'error', message: annot.message};
        tipLabel.appendChild(annotationTooltip(ann));
        editor.setGutterMarker(Math.max(annot.line, 0), GUTTER_ID, makeMarker(tipLabel, 'error', false, 'state.options.tooltips'));
    }

    function clearMarks(cm) {
        //var state = cm.state.lint;
        //if (state.hasGutter) cm.clearGutter(GUTTER_ID);
        //for (var i = 0; i < state.marked.length; ++i)
        //    state.marked[i].clear();
        //state.marked.length = 0;
        cm.clearGutter(GUTTER_ID);
    }

    function makeMarker(labels, severity, multiple, tooltips) {
        var marker = document.createElement('div'), inner = marker;
        marker.className = 'CodeMirror-lint-marker-' + severity;
        if (multiple) {
            inner = marker.appendChild(document.createElement('div'));
            inner.className = 'CodeMirror-lint-marker-multiple';
        }
        if (tooltips !== false) {
            CodeMirror.on(inner, 'mouseover', function(e) {
                showTooltipFor(e, labels, inner);
            });
        }
        return marker;
    }

    function showTooltip(e, content) {
        var tt = document.createElement('div');
        tt.className = 'CodeMirror-lint-tooltip';
        tt.appendChild(content.cloneNode(true));
        document.body.appendChild(tt);

        function position(e) {
            if (!tt.parentNode) {
                return CodeMirror.off(document, 'mousemove', position);
            }
            tt.style.top = Math.max(0, e.clientY - tt.offsetHeight - 5) + 'px';
            tt.style.left = (e.clientX + 5) + 'px';
        }
        CodeMirror.on(document, 'mousemove', position);
        position(e);
        if (tt.style.opacity !== null) {
            tt.style.opacity = 1;
        }
        return tt;
    }
    function rm(elt) {
        if (elt.parentNode) {
            elt.parentNode.removeChild(elt);
        }
    }
    function hideTooltip(tt) {
        if (!tt.parentNode) {
            return;
        }
        if (tt.style.opacity == null) {
            rm(tt);
        }
        tt.style.opacity = 0;
        setTimeout(function() { rm(tt); }, 600);
    }

    function showTooltipFor(e, content, node) {
        var tooltip = showTooltip(e, content);
        function hide() {
            CodeMirror.off(node, 'mouseout', hide);
            if (tooltip) { hideTooltip(tooltip); tooltip = null; }
        }
        var poll = setInterval(function() {
            if (tooltip) {
                for (var n = node;; n = n.parentNode) {
                    if (n == document.body) {
                        return;
                    }
                    if (!n) { hide(); break; }
                }
            }
            if (!tooltip) {
                return clearInterval(poll);
            }
        }, 400);
        CodeMirror.on(node, 'mouseout', hide);
    }

    return {
        GUTTER_ID: GUTTER_ID,
        annotate: annotate,
        clearMarks: clearMarks
    };
});
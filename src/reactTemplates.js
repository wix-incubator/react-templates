/**
 * Created by avim on 11/9/2014.
 */
'use strict';
var cheerio = require('cheerio');
var _ = require('lodash');
var esprima = require('esprima');
var escodegen = require('escodegen');
var React = require('react');
var fs = require('fs');


var repeatTemplate = _.template("_.map(<%= collection %>,function (<%= item %>,<%= item %>Index) {\n return <%= body %>}, this)");
var ifTemplate = _.template("((<%= condition %>)?(<%= body %>):null)");
var classSetTemplate = _.template("React.addons.classSet(<%= classSet %>)");
var tagTemplate = _.template("<%= name %>.apply(this,_.flatten([<%= props %>].concat([<%= children %>])))");
var commentTemplate = _.template(" /* <%= data %> */ ");
var templateTemplate = _.template("define([<%= requirePaths %>], function (<%= requireNames %>) {\n <%= injectedFunctions %>\nreturn function(){ return <%= body %>};\n});");

var templateProp = "rt-repeat";
var ifProp = "rt-if";
var classSetProp = "rt-class";

var reactSupportedAttributes = ['accept', 'acceptCharset', 'accessKey', 'action', 'allowFullScreen', 'allowTransparency', 'alt', 'async', 'autoComplete', 'autoPlay', 'cellPadding', 'cellSpacing', 'charSet', 'checked', 'classID', 'className', 'cols', 'colSpan', 'content', 'contentEditable', 'contextMenu', 'controls', 'coords', 'crossOrigin', 'data', 'dateTime', 'defer', 'dir', 'disabled', 'download', 'draggable', 'encType', 'form', 'formNoValidate', 'frameBorder', 'height', 'hidden', 'href', 'hrefLang', 'htmlFor', 'httpEquiv', 'icon', 'id', 'label', 'lang', 'list', 'loop', 'manifest', 'max', 'maxLength', 'media', 'mediaGroup', 'method', 'min', 'multiple', 'muted', 'name', 'noValidate', 'open', 'pattern', 'placeholder', 'poster', 'preload', 'radioGroup', 'readOnly', 'rel', 'required', 'role', 'rows', 'rowSpan', 'sandbox', 'scope', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet', 'start', 'step', 'style', 'tabIndex', 'target', 'title', 'type', 'useMap', 'value', 'width', 'wmode'];
var attributesMapping = {'class': 'className', 'rt-class': 'className'};
_.forEach(reactSupportedAttributes,function (attributeReactName) {
    if (attributeReactName !== attributeReactName.toLowerCase()) {
        attributesMapping[attributeReactName.toLowerCase()] = attributeReactName;
    }
});


function concatChildren(children) {
    var res = "";
    var first = true;
    _.forEach(children, function (child) {
        if (child.indexOf(" /*") !== 0 && child) {
            res += (first ? "" : ",") + child;
            first = false;
        } else {
            res += child;
        }
    }, this);
    return res;
}

var curlyMap = {'{': 1, '}': -1};

function convertText(txt) {
    txt = txt.trim();
    var res = "";
    var first = true;
    while (txt.indexOf('{') !== -1) {
        var start = txt.indexOf('{');
        var pre = txt.substr(0,start);
        if (pre) {
            res += (first ? "" : "+") + JSON.stringify(pre);
            first = false;
        }
        var curlyCounter = 1;
        for (var end = start + 1;end < txt.length && curlyCounter > 0;end++) {
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter !== 0) {
            throw "Failed to parse text";
        } else {
            res += (first ? "" : "+") + txt.substr(start + 1, end - start - 2);
            first = false;
            txt = txt.substr(end);
        }
    }
    if (txt) {
        res += (first ? "" : "+") + JSON.stringify(txt);
    }

    return res;
}

function isStringOnlyCode(txt) {
    txt = txt.trim();
    return txt.length && txt.charAt(0) === '{' && txt.charAt(txt.length - 1) === '}';
}

function generateProps(node, context) {
    var props = {};
    _.forOwn(node.attribs, function (val, key) {
        var propKey = attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey)) {
            throw "duplicate definition of " + propKey + " " + JSON.stringify(node.attribs);
        }
        if (key.indexOf("on") === 0 && !isStringOnlyCode(val)) {
            var funcParts = val.split("=>");
            var evtParams = funcParts[0].replace("(", "").replace(")", "").trim();
            var funcBody = funcParts[1].trim();
            var generatedFuncName = "generated" + (context.injectedFunctions.length + 1);
            var params = context.boundParams;
            if (evtParams.trim().length > 0) {
                params = params.concat(evtParams.trim());
            }

            var funcText = "function " + generatedFuncName + "(" + params.join(",");
            funcText += ") {\n" + funcBody + "\n}\n";
            context.injectedFunctions.push(funcText);
            props[propKey] = generatedFuncName + ".bind(" + (["this"].concat(context.boundParams)).join(",") + ")";
        } else if (key === "style" && !isStringOnlyCode(val)) {
            var styleParts = val.trim().split(";");
            styleParts = _.compact(_.map(styleParts, function (str) {
                str = str.trim();
                if (!str || str.indexOf(':') === -1) {
                    return null;

                }
                var res = str.split(":");
                res[0] = res[0].trim();
                res[1] = res[1].trim();
                return res;
            }));
            var styleArray = [];
            _.forEach(styleParts, function (stylePart) {
                styleArray.push(stylePart[0] + " : " + convertText(stylePart[1]))
            });
            props[propKey] = "{" + styleArray.join(",") + "}";
        } else if (key === classSetProp) {
            props[propKey] = classSetTemplate({classSet: val});
        } else if (key.indexOf("rt-") !== 0) {
            props[propKey] = convertText(val);
        }
    });

    return "{" + _.map(props, function (val, key) {
        return JSON.stringify(key) + " : " + val;
    }).join(",") + "}";
}

function convertTagNameToConstructor(tagName) {
    return React.DOM.hasOwnProperty(tagName) ? "React.DOM." + tagName : tagName;
}

function defaultContext() {
    return {
        boundParams: [],
        injectedFunctions: []
    };
}


function convertHtmlToReact(node, context) {
    if (node.type === "tag") {
        context.boundParams = _.clone(context.boundParams);

        var data = {name: convertTagNameToConstructor(node.name)};
        if (node.attribs[templateProp]) {
            data.item = node.attribs[templateProp].split(" in ")[0].trim();
            data.collection = node.attribs[templateProp].split(" in ")[1].trim();
            context.boundParams.push(data.item);
        }
        data.props = generateProps(node,context);
        if (node.attribs[ifProp]) {
            data.condition = node.attribs[ifProp].trim();
        }
        data.children = concatChildren(_.map(node.children,function (child) {
            return convertHtmlToReact(child,context);
        }));

        data.body = tagTemplate(data);

        if (node.attribs[templateProp]) {
            data.body = repeatTemplate(data);
        }
        if (node.attribs[ifProp]) {
            data.body = ifTemplate(data);
        }
        return data.body;
    } else if (node.type === "comment") {
        return (commentTemplate(node));
    } else if (node.type === "text") {
        if (node.data.trim()) {
            return convertText(node.data.trim());
        }
        return "";
    }
}

function extractDefinesFromJSXTag(html, defines) {
    html = html.replace(/\<\!doctype jsx\s*(.*?)\s*\>/, function(full, reqStr) {
        var match = true;
        while (match) {
            match = false;
            reqStr = reqStr.replace(/\s*(\w+)\s*\=\s*\"([^\"]*)\"\s*/, function(full, varName, reqPath) {
                defines[reqPath] = varName;
                match = true;
                return "";
            });
        }
        return "";
    });
    return html;
}

function convertTemplateToReact(html) {
    var defines = {react: "React", lodash: "_"};
    html = extractDefinesFromJSXTag(html, defines);
    var rootNode = cheerio.load(html.trim(), {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true});
    var context = defaultContext();
    var body = convertHtmlToReact(rootNode.root()[0].children[0], context);
    var requirePaths = _(defines).keys().map(function (reqName) {return '"' + reqName + '"'}).value().join(",");
    var requireVars = _(defines).values().value().join(",");
    var data = {body: body, injectedFunctions: "", requireNames: requireVars, requirePaths: requirePaths};
    data.injectedFunctions = context.injectedFunctions.join("\n");
    var code = templateTemplate(data);
    try {
        var tree = esprima.parse(code, {range: true, tokens: true, comment: true});
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        code = escodegen.generate(tree, {comment: true});
    } catch (e) {

    }
    return code;
}

/**
 * @param {string} source
 * @param {string} target
 */
function convertFile(source, target) {
//    if (path.extname(filename) !== ".html") {
//        console.log('invalid file, only handle html files');
//        return;// only handle html files
//    }
    var html = fs.readFileSync(source).toString();
    if (!html.match(/\<\!doctype jsx/)) {
        console.log('invalid file, missing header');
        return;
    }
    var js = convertTemplateToReact(html);
    fs.writeFileSync(target, js);
}

module.exports.convertTemplateToReact = convertTemplateToReact;
module.exports.convertFile = convertFile;
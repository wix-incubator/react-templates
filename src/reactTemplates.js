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
var chalk = require('chalk');

var repeatTemplate = _.template('_.map(<%= collection %>,<%= repeatFunction %>.bind(<%= repeatBinds %>))');
var ifTemplate = _.template('((<%= condition %>)?(<%= body %>):null)');
var classSetTemplate = _.template('React.addons.classSet(<%= classSet %>)');
var simpleTagTemplate = _.template('<%= name %>(<%= props %><%= children %>)');
var tagTemplate = _.template('<%= name %>.apply(this,_.flatten([<%= props %><%= children %>]))');
var commentTemplate = _.template(' /* <%= data %> */ ');
var templateAMDTemplate = _.template("define([<%= requirePaths %>], function (<%= requireNames %>) {\n'use strict';\n <%= injectedFunctions %>\nreturn function(){ return <%= body %>};\n});");
var templateCommonJSTemplate = _.template("<%= vars %>\n\n'use strict';\n <%= injectedFunctions %>\nmodule.exports = function(){ return <%= body %>};\n");
var templateProp = 'rt-repeat';
var ifProp = 'rt-if';
var classSetProp = 'rt-class';
var scopeProp = 'rt-scope';

var reactSupportedAttributes = ['accept', 'acceptCharset', 'accessKey', 'action', 'allowFullScreen', 'allowTransparency', 'alt', 'async', 'autoComplete', 'autoPlay', 'cellPadding', 'cellSpacing', 'charSet', 'checked', 'classID', 'className', 'cols', 'colSpan', 'content', 'contentEditable', 'contextMenu', 'controls', 'coords', 'crossOrigin', 'data', 'dateTime', 'defer', 'dir', 'disabled', 'download', 'draggable', 'encType', 'form', 'formNoValidate', 'frameBorder', 'height', 'hidden', 'href', 'hrefLang', 'htmlFor', 'httpEquiv', 'icon', 'id', 'label', 'lang', 'list', 'loop', 'manifest', 'max', 'maxLength', 'media', 'mediaGroup', 'method', 'min', 'multiple', 'muted', 'name', 'noValidate', 'open', 'pattern', 'placeholder', 'poster', 'preload', 'radioGroup', 'readOnly', 'rel', 'required', 'role', 'rows', 'rowSpan', 'sandbox', 'scope', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet', 'start', 'step', 'style', 'tabIndex', 'target', 'title', 'type', 'useMap', 'value', 'width', 'wmode'];
var attributesMapping = {'class': 'className', 'rt-class': 'className'};
_.forEach(reactSupportedAttributes,function (attributeReactName) {
    if (attributeReactName !== attributeReactName.toLowerCase()) {
        attributesMapping[attributeReactName.toLowerCase()] = attributeReactName;
    }
});


function concatChildren(children) {
    var res = '';
    _.forEach(children, function (child) {
        if (child.indexOf(' /*') !== 0 && child) {
            res += ',' + child;
        } else {
            res += child;
        }
    }, this);
    return res;
}

function convertToCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

var curlyMap = {'{': 1, '}': -1};

function convertText(txt) {
    txt = txt.trim();
    var res = '';
    var first = true;
    while (txt.indexOf('{') !== -1) {
        var start = txt.indexOf('{');
        var pre = txt.substr(0,start);
        if (pre) {
            res += (first ? '' : '+') + JSON.stringify(pre);
            first = false;
        }
        var curlyCounter = 1;
        for (var end = start + 1; end < txt.length && curlyCounter > 0; end++) {
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter !== 0) {
            throw 'Failed to parse text';
        } else {
            res += (first ? '' : '+') + txt.substr(start + 1, end - start - 2);
            first = false;
            txt = txt.substr(end);
        }
    }
    if (txt) {
        res += (first ? '' : '+') + JSON.stringify(txt);
    }
    if (res === '') {
        res = 'true';
    }

    return res;
}

function isStringOnlyCode(txt) {
    txt = txt.trim();
    return txt.length && txt.charAt(0) === '{' && txt.charAt(txt.length - 1) === '}';
}

function generateInjectedFunc(context, namePrefix, body, params) {
    params = params || context.boundParams;
    var generatedFuncName = namePrefix.replace(',','') + (context.injectedFunctions.length + 1);
    var funcText = 'function ' + generatedFuncName + '(' + params.join(',');
    funcText += ') {\n' + body + '\n}\n';
    context.injectedFunctions.push(funcText);
    return generatedFuncName;
}

function generateProps(node, context) {
    var props = {};
    _.forOwn(node.attribs, function (val, key) {
        var propKey = attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey)) {
            throw 'duplicate definition of ' + propKey + ' ' + JSON.stringify(node.attribs);
        }
        if (key.indexOf('on') === 0 && !isStringOnlyCode(val)) {
            var funcParts = val.split('=>');
            if (funcParts.length !== 2) {
                throw 'when using "on" events, use lambda "(p1,p2)=>body" notation or use {} to return a callback function. error: [' + key + '="' + val + '"]';
            }
            var evtParams = funcParts[0].replace('(', '').replace(')', '').trim();
            var funcBody = funcParts[1].trim();
            var params = context.boundParams;
            if (evtParams.trim() !== '') {
                params = params.concat([evtParams.trim()]);
            }
            var generatedFuncName = generateInjectedFunc(context, key, funcBody, params);
            props[propKey] = generatedFuncName + '.bind(' + (['this'].concat(context.boundParams)).join(',') + ')';
        } else if (key === 'style' && !isStringOnlyCode(val)) {
            var styleParts = val.trim().split(';');
            styleParts = _.compact(_.map(styleParts, function (str) {
                str = str.trim();
                if (!str || str.indexOf(':') === -1) {
                    return null;
                }
                var res = str.split(':');
                res[0] = res[0].trim();
                res[1] = res[1].trim();
                return res;
            }));
            var styleArray = [];
            _.forEach(styleParts, function (stylePart) {
                styleArray.push(convertToCamelCase(stylePart[0]) + ' : ' + convertText(stylePart[1]));
            });
            props[propKey] = '{' + styleArray.join(',') + '}';
        } else if (key === classSetProp) {
            props[propKey] = classSetTemplate({classSet: val});
        } else if (key.indexOf('rt-') !== 0) {
            props[propKey] = convertText(val);
        }
    });

    return '{' + _.map(props, function (val, key) {
        return JSON.stringify(key) + ' : ' + val;
    }).join(',') + '}';
}

function convertTagNameToConstructor(tagName) {
    return React.DOM.hasOwnProperty(tagName) ? 'React.DOM.' + tagName : tagName;
}

function defaultContext() {
    return {
        boundParams: [],
        injectedFunctions: []
    };
}

function addIfNotThere(array, obj) {
    if (!_.contains(array, obj)) {
        array.push(obj);
    }
}

function hasNonSimpleChildren(node) {
    return _.any(node.children, function (child) {
        return child.type === 'tag' && child.attribs[templateProp];
    });
}

function convertHtmlToReact(node, context) {
    if (node.type === 'tag') {
        context = {
            boundParams: _.clone(context.boundParams),
            injectedFunctions: context.injectedFunctions
        };

        var data = {name: convertTagNameToConstructor(node.name)};
        if (node.attribs[scopeProp]) {
            data.scopeMapping = {};
            data.scopeName = '';
            _.each(context.boundParams, function (boundParam) {
                data.scopeMapping[boundParam] = boundParam;
            });
            _.each(node.attribs[scopeProp].split(';'), function (scopePart) {
                var scopeSubParts = scopePart.split(' as ');
                var scopeName = scopeSubParts[1].trim();
                addIfNotThere(context.boundParams, scopeName);
                data.scopeName += capitalize(scopeName);
                data.scopeMapping[scopeName] = scopeSubParts[0].trim();
            });
        }

        if (node.attribs[templateProp]) {
            data.item = node.attribs[templateProp].split(' in ')[0].trim();
            data.collection = node.attribs[templateProp].split(' in ')[1].trim();
            addIfNotThere(context.boundParams, data.item);
            addIfNotThere(context.boundParams, data.item + 'Index');
        }
        data.props = generateProps(node, context);
        if (node.attribs[ifProp]) {
            data.condition = node.attribs[ifProp].trim();
        }
        data.children = concatChildren(_.map(node.children, function (child) {
            return convertHtmlToReact(child, context);
        }));

        if (hasNonSimpleChildren(node)) {
          data.body = tagTemplate(data);
        } else {
          data.body = simpleTagTemplate(data);
        }

        if (node.attribs[templateProp]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + capitalize(data.item), 'return ' + data.body);
            data.repeatBinds = ['this'].concat(_.reject(context.boundParams, function (param) {
                return (param === data.item || param === data.item + 'Index');
            }));
            data.body = repeatTemplate(data);
        }
        if (node.attribs[ifProp]) {
            data.body = ifTemplate(data);
        }
        if (node.attribs[scopeProp]) {
            var generatedFuncName = generateInjectedFunc(context, 'scope' + data.scopeName, 'return ' + data.body, _.keys(data.scopeMapping));
            data.body = generatedFuncName + '.apply(this, [' + _.values(data.scopeMapping).join(',') + '])';
        }
        return data.body;
    } else if (node.type === 'comment') {
        return (commentTemplate(node));
    } else if (node.type === 'text') {
        if (node.data.trim()) {
            return convertText(node.data.trim());
        }
        return '';
    }
}

function extractDefinesFromJSXTag(html, defines) {
    html = html.replace(/\<\!doctype rt\s*(.*?)\s*\>/i, function(full, reqStr) {
        var match = true;
        while (match) {
            match = false;
            reqStr = reqStr.replace(/\s*(\w+)\s*\=\s*\"([^\"]*)\"\s*/, function(full, varName, reqPath) {
                defines[reqPath] = varName;
                match = true;
                return '';
            });
        }
        return '';
    });
    return html;
}

/**
 * @param {string} html
 * @return {string}
 */
function convertTemplateToReact(html,options) {
//    var x = cheerio.load(html);
    options = options || {};
    var defines = {react: 'React', lodash: '_'};
    html = extractDefinesFromJSXTag(html, defines);
    var rootNode = cheerio.load(html.trim(), {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true});
    var context = defaultContext();
    var body = convertHtmlToReact(rootNode.root()[0].children[0], context);
    var requirePaths = _(defines).keys().map(function (reqName) { return '"' + reqName + '"'; }).value().join(',');
    var requireVars = _(defines).values().value().join(',');
    var vars = _(defines).map(function (reqVar,reqPath) {return "var "+reqVar+" = require('"+reqPath+"');"}).join("\n");
    var data = {body: body, injectedFunctions: '', requireNames: requireVars, requirePaths: requirePaths, vars:vars};
    data.injectedFunctions = context.injectedFunctions.join('\n');
    var code = options.commonJS ? templateCommonJSTemplate(data) : templateAMDTemplate(data);
    try {
        var tree = esprima.parse(code, {range: true, tokens: true, comment: true});
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        code = escodegen.generate(tree, {comment: true});
    } catch (e) {
        // TODO error handling
        console.log(e);
    }
    return code;
}

/**
 * @param {string} source
 * @param {string} target
 */
function convertFile(source, target, options) {
//    if (path.extname(filename) !== ".html") {
//        console.log('invalid file, only handle html files');
//        return;// only handle html files
//    }
    var util = require('./util');

    if (!util.isStale(source, target)) {
        console.log('target file ' + chalk.cyan(target) + ' is up to date, skipping');
//        return;
    }

    var html = fs.readFileSync(source).toString();
    if (!html.match(/\<\!doctype rt/i)) {
        throw new Error('invalid file, missing header');
    }
    var js = convertTemplateToReact(html, options);
    fs.writeFileSync(target, js);
}

module.exports = {
    convertTemplateToReact: convertTemplateToReact,
    convertFile: convertFile,
    _test: {}
};

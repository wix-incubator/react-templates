/**
 * Created by avim on 11/9/2014.
 */
'use strict';
var cheerio = require('cheerio');
var _ = require('lodash');
var esprima = require('esprima');
var escodegen = require('escodegen');
var reactDOMSupport = require('./reactDOMSupport');
var stringUtils = require('./stringUtils');

var repeatTemplate = _.template('_.map(<%= collection %>,<%= repeatFunction %>.bind(<%= repeatBinds %>))');
var ifTemplate = _.template('((<%= condition %>)?(<%= body %>):null)');
var propsTemplate = _.template('_.merge({}, <%= generatedProps %>, <%= rtProps %>)');
var classSetTemplate = _.template('React.addons.classSet(<%= classSet %>)');
var simpleTagTemplate = _.template('<%= name %>(<%= props %><%= children %>)');
var tagTemplate = _.template('<%= name %>.apply(this,_.flatten([<%= props %><%= children %>]))');
var simpleTagTemplateCreateElement = _.template('React.createElement(<%= name %>,<%= props %><%= children %>)');
var tagTemplateCreateElement = _.template('React.createElement.apply(this,_.flatten([<%= name %>,<%= props %><%= children %>]))');
var commentTemplate = _.template(' /* <%= data %> */ ');
var templateAMDTemplate = _.template("define([<%= requirePaths %>], function (<%= requireNames %>) {\n'use strict';\n <%= injectedFunctions %>\nreturn function(){ return <%= body %>};\n});");
var templateCommonJSTemplate = _.template("<%= vars %>\n\n'use strict';\n <%= injectedFunctions %>\nmodule.exports = function(){ return <%= body %>};\n");
var templatePJSTemplate = _.template('var <%= name %> = function () {\n' +
                                '<%= injectedFunctions %>\n' +
                                'return <%= body %>\n' +
                                '};\n');

var templateProp = 'rt-repeat';
var ifProp = 'rt-if';
var classSetProp = 'rt-class';
var scopeProp = 'rt-scope';
var propsProp = 'rt-props';

var defaultOptions = {modules: 'amd', version: false, force: false, format: 'stylish', targetVersion: '0.12.2'};

function shouldUseCreateElement(context) {
    switch (context.options.targetVersion) {
        case '0.11.2':
        case '0.11.1':
        case '0.11.0':
        case '0.10.0':
            return false;
        default:
            return true;
    }
}

var reactSupportedAttributes = ['accept', 'acceptCharset', 'accessKey', 'action', 'allowFullScreen', 'allowTransparency', 'alt', 'async', 'autoComplete', 'autoPlay', 'cellPadding', 'cellSpacing', 'charSet', 'checked', 'classID', 'className', 'cols', 'colSpan', 'content', 'contentEditable', 'contextMenu', 'controls', 'coords', 'crossOrigin', 'data', 'dateTime', 'defer', 'dir', 'disabled', 'download', 'draggable', 'encType', 'form', 'formNoValidate', 'frameBorder', 'height', 'hidden', 'href', 'hrefLang', 'htmlFor', 'httpEquiv', 'icon', 'id', 'label', 'lang', 'list', 'loop', 'manifest', 'max', 'maxLength', 'media', 'mediaGroup', 'method', 'min', 'multiple', 'muted', 'name', 'noValidate', 'open', 'pattern', 'placeholder', 'poster', 'preload', 'radioGroup', 'readOnly', 'rel', 'required', 'role', 'rows', 'rowSpan', 'sandbox', 'scope', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet', 'start', 'step', 'style', 'tabIndex', 'target', 'title', 'type', 'useMap', 'value', 'width', 'wmode'];
var attributesMapping = {'class': 'className', 'rt-class': 'className'};
_.forEach(reactSupportedAttributes, function (attributeReactName) {
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

var curlyMap = {'{': 1, '}': -1};

function convertText(node, context, txt) {
    var res = '';
    var first = true;
    while (txt.indexOf('{') !== -1) {
        var start = txt.indexOf('{');
        var pre = txt.substr(0, start);
        if (pre) {
            res += (first ? '' : '+') + JSON.stringify(pre);
            first = false;
        }
        var curlyCounter = 1;
        for (var end = start + 1; end < txt.length && curlyCounter > 0; end++) {
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter !== 0) {
            throw buildError("Failed to parse text '" + txt + "'", context, node);
        } else {
            var needsParens = start !== 0 || end !== txt.length - 1;
            res += (first ? '' : '+') + (needsParens ? '(' : '') + txt.substr(start + 1, end - start - 2) + (needsParens ? ')' : '');
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

/**
 * @param {string} txt
 * @return {boolean}
 */
function isStringOnlyCode(txt) {
    txt = txt.trim();
    return txt.length && txt.charAt(0) === '{' && txt.charAt(txt.length - 1) === '}';
}

function generateInjectedFunc(context, namePrefix, body, params) {
    params = params || context.boundParams;
    var generatedFuncName = namePrefix.replace(',', '') + (context.injectedFunctions.length + 1);
    var funcText = 'function ' + generatedFuncName + '(' + params.join(',');
    funcText += ') {\n' + body + '\n}\n';
    context.injectedFunctions.push(funcText);
    return generatedFuncName;
}

/**
 * @param {string} html
 * @param node
 * @return {number}
 */
function getLine(html, node) {
    if (!node) {
        return 0;
    }
    return html.substring(0, node.startIndex).split('\n').length - 1;
}

//function getLine(node) {
//    if (!node) {
//        return 0;
//    }
//    var line = 0;
//    var prev = node.prev;
//    while (prev) {
//        var nl = prev.data.split('\n').length - 1;
//        line += nl;
//        prev = prev.prev;
//    }
//
//    line += getLine(node.parent);
//    return line + 1;
//}

//function RTCodeError(message, line) {
//    this.name = 'RTCodeError';
//    this.message = message || '';
//    this.line = line || -1;
//}
//RTCodeError.prototype = Error.prototype;

// Redefine properties on Error to be enumerable
/*eslint no-extend-native:0*/
Object.defineProperty(Error.prototype, 'message', { configurable: true, enumerable: true });
Object.defineProperty(Error.prototype, 'stack', { configurable: true, enumerable: true });
//Object.defineProperty(Error.prototype, 'line', { configurable: true, enumerable: true });

function RTCodeError(message, index, line) {
    Error.captureStackTrace(this, RTCodeError);
    this.name = 'RTCodeError';
    this.message = message || '';
    this.index = index || -1;
    this.line = line || -1;
}

RTCodeError.prototype = Object.create(Error.prototype);

/**
 * @param {string} msg
 * @param {*} context
 * @param {*} node
 * @return {RTCodeError}
 */
function buildError(msg, context, node) {
    var line = getLine(context.html, node);
    return new RTCodeError(msg, node.startIndex, line);
}


function generateProps(node, context) {
//    console.log(node);
    var props = {};
    _.forOwn(node.attribs, function (val, key) {
        var propKey = attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey)) {
            throw buildError('duplicate definition of ' + propKey + ' ' + JSON.stringify(node.attribs), context, node);
        }
        if (key.indexOf('on') === 0 && !isStringOnlyCode(val)) {
            var funcParts = val.split('=>');
            if (funcParts.length !== 2) {
                throw buildError("when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [" + key + "='" + val + "']", context, node);
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
                res[1] = res.slice(1).join(':').trim();
                return res;
            }));
            var styleArray = [];
            _.forEach(styleParts, function (stylePart) {
                styleArray.push(stringUtils.convertToCamelCase(stylePart[0]) + ' : ' + convertText(node, context, stylePart[1].trim()));
            });
            props[propKey] = '{' + styleArray.join(',') + '}';
        } else if (key === classSetProp) {
            props[propKey] = classSetTemplate({classSet: val});
        } else if (key.indexOf('rt-') !== 0) {
            props[propKey] = convertText(node, context, val.trim());
        }
    });

    return '{' + _.map(props, function (val, key) {
        return JSON.stringify(key) + ' : ' + val;
    }).join(',') + '}';
}

function convertTagNameToConstructor(tagName, context) {
    var isHtmlTag = _.contains(reactDOMSupport[context.options.targetVersion], tagName);
    if (shouldUseCreateElement(context)) {
        return isHtmlTag ? "'" + tagName + "'" : tagName;
    }
    return isHtmlTag ? 'React.DOM.' + tagName : tagName;
}

function defaultContext(html, options) {
    return {
        boundParams: [],
        injectedFunctions: [],
        html: html,
        options: options
    };
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
            injectedFunctions: context.injectedFunctions,
            html: context.html,
            options: context.options
        };

        var data = {name: convertTagNameToConstructor(node.name, context)};
        if (node.attribs[scopeProp]) {
            data.scopeMapping = {};
            data.scopeName = '';
            _.each(context.boundParams, function (boundParam) {
                data.scopeMapping[boundParam] = boundParam;
            });
            _.each(node.attribs[scopeProp].split(';'), function (scopePart) {
                var scopeSubParts = scopePart.split(' as ');
                if (scopeSubParts.length < 2) {
                    throw buildError("invalid scope part '" + scopePart + "'", context, node);
                }
                var scopeName = scopeSubParts[1].trim();
                stringUtils.addIfNotThere(context.boundParams, scopeName);
                data.scopeName += stringUtils.capitalize(scopeName);
                data.scopeMapping[scopeName] = scopeSubParts[0].trim();
            });
        }

        if (node.attribs[templateProp]) {
            var arr = node.attribs[templateProp].split(' in ');
            if (arr.length !== 2) {
                throw buildError("rt-repeat invalid 'in' expression '" + node.attribs[templateProp] + "'", context, node);
            }
            data.item = arr[0].trim();
            data.collection = arr[1].trim();
            stringUtils.addIfNotThere(context.boundParams, data.item);
            stringUtils.addIfNotThere(context.boundParams, data.item + 'Index');
        }
        data.props = generateProps(node, context);
        if (node.attribs[propsProp]) {
            data.props = propsTemplate({generatedProps: data.props, rtProps: node.attribs[propsProp]});
        }
        if (node.attribs[ifProp]) {
            data.condition = node.attribs[ifProp].trim();
        }
        data.children = concatChildren(_.map(node.children, function (child) {
            return convertHtmlToReact(child, context);
        }));

        if (hasNonSimpleChildren(node)) {
            data.body = shouldUseCreateElement(context) ? tagTemplateCreateElement(data) : tagTemplate(data);
        } else {
            data.body = shouldUseCreateElement(context) ? simpleTagTemplateCreateElement(data) : simpleTagTemplate(data);
        }

        if (node.attribs[templateProp]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + stringUtils.capitalize(data.item), 'return ' + data.body);
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
            return convertText(node, context, node.data);
        }
        return '';
    }
}

//function removeDocType(html) {
//  html = html.replace(/^\s*\<\!doctype\s+rt\s*>/mi, function () {
//    return '';
//  });
//  return html;
//}


/**
 * @param {string} html
 * @param {{modules:string}?} options
 * @return {string}
 */
function convertTemplateToReact(html, options) {
    var rootNode = cheerio.load(html, {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true});
    options = _.defaults({}, options, defaultOptions);
    var defines = {'react/addons': 'React', lodash: '_'};
    var context = defaultContext(html, options);
    var rootTags = _.filter(rootNode.root()[0].children, function (i) { return i.type === 'tag'; });
    if (!rootTags || rootTags.length === 0) {
        throw new RTCodeError('Document should have a root element');
    }
    var firstTag = null;
    _.forEach(rootTags, function(tag) {
        if (tag.name === 'rt-require') {
          if (!tag.attribs.dependency || !tag.attribs.as) {
            throw buildError("rt-require needs 'dependency' and 'as' attributes", context, tag);
          } else if (tag.children.length) {
            throw buildError('rt-require may have no children', context, tag);
          } else {
            defines[tag.attribs.dependency] = tag.attribs.as;
          }
        } else if (firstTag === null) {
          firstTag = tag;
        } else {
          throw buildError('Document should have no more than a single root element', context, tag);
        }
    });
    if (firstTag === null) {
      throw buildError('Document should have a single root element', context, rootNode.root()[0]);
    }
    var body = convertHtmlToReact(firstTag, context);
    var requirePaths = _(defines).keys().map(function (reqName) { return '"' + reqName + '"'; }).value().join(',');
    var requireVars = _(defines).values().value().join(',');
    var vars = _(defines).map(function (reqVar, reqPath) { return 'var ' + reqVar + " = require('" + reqPath + "');"; }).join('\n');
    var data = {body: body, injectedFunctions: '', requireNames: requireVars, requirePaths: requirePaths, vars: vars, name: options.name};
    data.injectedFunctions = context.injectedFunctions.join('\n');
    var code = generate(data, options);
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

function generate(data, options) {
    if (options.modules === 'amd') {
        return templateAMDTemplate(data);
    }
    if (options.modules === 'commonjs') {
        return templateCommonJSTemplate(data);
    }
    return templatePJSTemplate(data);
}

/**
 * @param {string} name
 * @return {string}
 */
function normalizeName(name) {
    return name.replace(/-/g, '_');
}

module.exports = {
    convertTemplateToReact: convertTemplateToReact,
    RTCodeError: RTCodeError,
    normalizeName: normalizeName,
    _test: {}
};

/**
 * Created by avim on 11/9/2014.
 */
'use strict';
var cheerio = require('cheerio');
var _ = require('lodash');
var esprima = require('esprima-harmony');
var escodegen = require('escodegen');
var reactDOMSupport = require('./reactDOMSupport');
var stringUtils = require('./stringUtils');
var rtError = require('./RTCodeError');
var RTCodeError = rtError.RTCodeError;

var repeatTemplate = _.template('(function(_<%= repeatBinds %>, collection) {\nvar pos = 0;\n return _.map(collection, function() {\nvar args = Array.prototype.slice.call(arguments, 0, 2);\nargs.push(pos++);\nreturn <%= repeatFunction %>.apply(_this, [<%= baseBinds %>].concat(args));});}).call(null, <%= repeatBinds %>, <%= collection %>)\n');
var ifTemplate = _.template('((<%= condition %>)?(<%= body %>):null)');
var propsTemplateSimple = _.template('_.assign({}, <%= generatedProps %>, <%= rtProps %>)');
var propsTemplate = _.template('mergeProps( <%= generatedProps %>, <%= rtProps %>)');
var propsMergeFunction = 'function mergeProps(inline,external) {\n var res = _.assign({},inline,external)\nif (inline.hasOwnProperty(\'style\')) {\n res.style = _.defaults(res.style, inline.style);\n}\n if (inline.hasOwnProperty(\'className\') && external.hasOwnProperty(\'className\')) {\n res.className = external.className + \' \' + inline.className;\n} return res;\n}\n';
var classSetTemplate = _.template('React.addons.classSet(<%= classSet %>)');
var simpleTagTemplate = _.template('<%= name %>(<%= props %><%= children %>)');
var tagTemplate = _.template('<%= name %>.apply(this,_.flatten([<%= props %><%= children %>]))');
var simpleTagTemplateCreateElement = _.template('React.createElement(<%= name %>,<%= props %><%= children %>)');
var tagTemplateCreateElement = _.template('React.createElement.apply(this,_.flatten([<%= name %>,<%= props %><%= children %>]))');
var commentTemplate = _.template(' /* <%= data %> */ ');

var templateAMDTemplate = _.template("define(<%= name ? '\"'+name + '\", ' : '' %>[<%= requirePaths %>], function (<%= requireNames %>) {\n'use strict';\n <%= injectedFunctions %>\nreturn function(){ return <%= body %>};\n});");
var templateCommonJSTemplate = _.template("'use strict';\n<%= vars %>\n\n<%= injectedFunctions %>\nmodule.exports = function(){ return <%= body %>};\n");
var templateES6Template = _.template('<%= vars %>\n\n<%= injectedFunctions %>\nexport default function(){ return <%= body %>}\n');
var templatePJSTemplate = _.template('var <%= name %> = function () {\n' +
                                '<%= injectedFunctions %>\n' +
                                'return <%= body %>\n' +
                                '};\n');
var templateTypescriptTemplate = _.template('<%= vars %>\n\n<%= injectedFunctions %>\nvar fn = function() { return <%= body %> };\nexport = fn\n');

var templates = {
    amd: templateAMDTemplate,
    commonjs: templateCommonJSTemplate,
    typescript: templateTypescriptTemplate,
    es6: templateES6Template,
    none: templatePJSTemplate
};

var htmlSelfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

var templateProp = 'rt-repeat';
var ifProp = 'rt-if';
var classSetProp = 'rt-class';
var scopeProp = 'rt-scope';
var propsProp = 'rt-props';

var defaultOptions = {modules: 'amd', version: false, force: false, format: 'stylish', targetVersion: '0.12.2'};

/**
 * @param {Context} context
 * @return {boolean}
 */
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

/**
 * @param children
 * @return {string}
 */
function concatChildren(children) {
    var res = '';
    _.forEach(children, function (child) {
        if (child && child.indexOf(' /*') !== 0 ) {
            res += ',' + child;
        } else {
            res += child;
        }
    }, this);
    return res;
}

/**
 * @const
 */
var curlyMap = {'{': 1, '}': -1};

/**
 * @typedef {{boundParams: Array.<string>, injectedFunctions: Array.<string>, html: string, options: *}} Context
 */


/**
 * @param node
 * @param context
 * @param {string} txt
 * @return {string}
 */
function convertText(node, context, txt) {
    var res = '';
    var first = true;
    var concatChar = node.type === 'text' ? ',' : '+';
    while (txt.indexOf('{') !== -1) {
        var start = txt.indexOf('{');
        var pre = txt.substr(0, start);
        if (pre) {
            res += (first ? '' : concatChar) + JSON.stringify(pre);
            first = false;
        }
        var curlyCounter = 1;
        var end;
        for (end = start + 1; end < txt.length && curlyCounter > 0; end++) {
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter !== 0) {
            throw RTCodeError.build("Failed to parse text '" + txt + "'", context, node);
        } else {
            var needsParens = start !== 0 || end !== txt.length - 1;
            res += (first ? '' : concatChar) + (needsParens ? '(' : '') + txt.substr(start + 1, end - start - 2) + (needsParens ? ')' : '');
            first = false;
            txt = txt.substr(end);
        }
    }
    if (txt) {
        res += (first ? '' : concatChar) + JSON.stringify(txt);
    }
    if (res === '') {
        res = 'true';
    }

    //validateJS(res, node, context);
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

/**
 * @param {Context} context
 * @param {string} namePrefix
 * @param {string} body
 * @param {*?} params
 * @return {string}
 */
function generateInjectedFunc(context, namePrefix, body, params) {
    params = params || context.boundParams;
    var generatedFuncName = namePrefix.replace(',', '') + (context.injectedFunctions.length + 1);
    var funcText = 'function ' + generatedFuncName + '(' + params.join(',');
    funcText += ') {\n' + body + '\n}\n';
    context.injectedFunctions.push(funcText);
    return generatedFuncName;
}

/**
 * @param node
 * @param {Context} context
 * @return {string}
 */
function generateProps(node, context) {
//    console.log(node);
    var props = {};
    _.forOwn(node.attribs, function (val, key) {
        var propKey = attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey)) {
            throw RTCodeError.build('duplicate definition of ' + propKey + ' ' + JSON.stringify(node.attribs), context, node);
        }
        if (key.indexOf('on') === 0 && !isStringOnlyCode(val)) {
            var funcParts = val.split('=>');
            if (funcParts.length !== 2) {
                throw RTCodeError.build("when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [" + key + "='" + val + "']", context, node);
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

/**
 * @param {string} tagName
 * @param context
 * @return {string}
 */
function convertTagNameToConstructor(tagName, context) {
    var isHtmlTag = _.contains(reactDOMSupport[context.options.targetVersion], tagName);
    if (shouldUseCreateElement(context)) {
        isHtmlTag = isHtmlTag || tagName.match(/^\w+(-\w+)$/);
        return isHtmlTag ? "'" + tagName + "'" : tagName;
    }
    return isHtmlTag ? 'React.DOM.' + tagName : tagName;
}

/**
 * @param {string} html
 * @param options
 * @return {Context}
 */
function defaultContext(html, options) {
    return {
        boundParams: [],
        injectedFunctions: [],
        html: html,
        options: options
    };
}

/**
 * @param node
 * @return {boolean}
 */
function hasNonSimpleChildren(node) {
    return _.any(node.children, function (child) {
        return child.type === 'tag' && child.attribs[templateProp];
    });
}

/**
 * @param node
 * @param {Context} context
 * @return {string}
 */
function convertHtmlToReact(node, context) {
    if (node.type === 'tag' || node.type === 'style') {
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
                    throw RTCodeError.build("invalid scope part '" + scopePart + "'", context, node);
                }
                var scopeName = scopeSubParts[1].trim();
                validateJS(scopeName, node, context);
                stringUtils.addIfNotThere(context.boundParams, scopeName);
                data.scopeName += stringUtils.capitalize(scopeName);
                data.scopeMapping[scopeName] = scopeSubParts[0].trim();
                validateJS(data.scopeMapping[scopeName], node, context);
            });
        }

        if (node.attribs[templateProp]) {
            var arr = node.attribs[templateProp].split(' in ');
            if (arr.length !== 2) {
                throw RTCodeError.build("rt-repeat invalid 'in' expression '" + node.attribs[templateProp] + "'", context, node);
            }
            data.item = arr[0].trim();
            data.collection = arr[1].trim();
            validateJS(data.item, node, context);
            validateJS(data.collection, node, context);
            stringUtils.addIfNotThere(context.boundParams, data.item);
            stringUtils.addIfNotThere(context.boundParams, data.item + 'Index');
            stringUtils.addIfNotThere(context.boundParams, data.item + 'Pos');
        }
        data.props = generateProps(node, context);
        if (node.attribs[propsProp]) {
            if (data.props === '{}') {
                data.props = node.attribs[propsProp];
            } else if (!node.attribs.style && !node.attribs.class) {
                data.props = propsTemplateSimple({generatedProps: data.props, rtProps: node.attribs[propsProp]});
            } else {
                data.props = propsTemplate({generatedProps: data.props, rtProps: node.attribs[propsProp]});
                if (!_.contains(context.injectedFunctions, propsMergeFunction)) {
                    context.injectedFunctions.push(propsMergeFunction);
                }
            }
        }
        if (node.attribs[ifProp]) {
            data.condition = node.attribs[ifProp].trim();
        }
        data.children = node.children ? concatChildren(_.map(node.children, function (child) {
            var code = convertHtmlToReact(child, context);
            validateJS(code, child, context);
            return code;
        })) : '';

        if (hasNonSimpleChildren(node)) {
            data.body = shouldUseCreateElement(context) ? tagTemplateCreateElement(data) : tagTemplate(data);
        } else {
            data.body = shouldUseCreateElement(context) ? simpleTagTemplateCreateElement(data) : simpleTagTemplate(data);
        }

        if (node.attribs[templateProp]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + stringUtils.capitalize(data.item), 'return ' + data.body);
            var baseBinds = _.reject(context.boundParams, function (param) {
                return (param === data.item || param === data.item + 'Index' || param === data.item + 'Pos');
            });
            data.baseBinds = [].concat(baseBinds);
            data.repeatBinds = ['this'].concat(baseBinds);
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
 * @param node
 * @return {boolean}
 */
function isTag(node) {
    return node.type === 'tag';
}

function handleSelfClosingHtmlTags(nodes) {
    return _(nodes)
        .map(function (node) {
            var externalNodes = [];
            node.children = handleSelfClosingHtmlTags(node.children);
            if (node.type === 'tag' && _.contains(htmlSelfClosingTags, node.name)) {
                externalNodes = _.filter(node.children, isTag);
                _.forEach(externalNodes, function (child) {
                    child.parent = node;
                });
                node.children = _.reject(node.children, isTag);
            }
            return [node].concat(externalNodes);
        })
        .flatten()
        .value();
}

/**
 * @param {string} html
 * @param {{modules:string,defines:*}?} options
 * @return {string}
 */
function convertTemplateToReact(html, options) {
    var rootNode = cheerio.load(html, {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true});
    options = _.defaults({}, options, defaultOptions);
    var defines = options.defines ? options.defines : {'react/addons': 'React', lodash: '_'};
    var context = defaultContext(html, options);
    var rootTags = _.filter(rootNode.root()[0].children, {type: 'tag'});
    rootTags = handleSelfClosingHtmlTags(rootTags);
    if (!rootTags || rootTags.length === 0) {
        throw new RTCodeError('Document should have a root element');
    }
    var firstTag = null;
    _.forEach(rootTags, function (tag) {
        if (tag.name === 'rt-require') {
            if (!tag.attribs.dependency || !tag.attribs.as) {
                throw RTCodeError.build("rt-require needs 'dependency' and 'as' attributes", context, tag);
            } else if (tag.children.length) {
                throw RTCodeError.build('rt-require may have no children', context, tag);
            }
            //if (options.modules === 'typescript') {
            //    defines['./' + tag.attribs.dependency] = tag.attribs.as;
            //} else {
            defines[tag.attribs.dependency] = tag.attribs.as;
            //}
        } else if (firstTag === null) {
            firstTag = tag;
        } else {
            throw RTCodeError.build('Document should have no more than a single root element', context, tag);
        }
    });
    if (firstTag === null) {
        throw RTCodeError.build('Document should have a single root element', context, rootNode.root()[0]);
    }
    var body = convertHtmlToReact(firstTag, context);
    var requirePaths = _(defines).keys().map(function (reqName) { return '"' + reqName + '"'; }).value().join(',');
    var requireVars = _(defines).values().value().join(',');
    var vars;
    if (options.modules === 'typescript') {
        vars = _(defines).map(function (reqVar, reqPath) { return 'import ' + reqVar + " = require('" + reqPath + "');"; }).join('\n');
    } else if (options.modules === 'es6') {
        vars = _(defines).map(function (reqVar, reqPath) { return 'import {' + reqVar + "} from '" + reqPath + "';"; }).join('\n');
    } else {
        vars = _(defines).map(function (reqVar, reqPath) { return 'var ' + reqVar + " = require('" + reqPath + "');"; }).join('\n');
    }
    var data = {body: body, injectedFunctions: '', requireNames: requireVars, requirePaths: requirePaths, vars: vars, name: options.name};
    data.injectedFunctions = context.injectedFunctions.join('\n');
    var code = generate(data, options);
    if (options.modules !== 'typescript') {
        try {
            var tree = esprima.parse(code, {range: true, tokens: true, comment: true});
            tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
            code = escodegen.generate(tree, {comment: true});
        } catch (e) {
            throw new RTCodeError(e.message, e.index, -1);
        }
    }
    return code;
}

function generate(data, options) {
    var template = templates[options.modules];
    return template(data);
}

/**
 * @param {string} code
 * @param node
 * @param {Context} context
 */
function validateJS(code, node, context) {
    try {
        esprima.parse(code);
    } catch (e) {
        throw RTCodeError.build(e.description, context, node);
    }
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
    _test: {
        convertText: convertText
    }
};

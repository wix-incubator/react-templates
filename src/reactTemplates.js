'use strict';
var cheerio = require('cheerio');
var _ = require('lodash');
var esprima = require('esprima-harmony');
var escodegen = require('escodegen');
var reactDOMSupport = require('./reactDOMSupport');
var reactNativeSupport = require('./reactNativeSupport');
var reactPropTemplates = require('./reactPropTemplates');
var stringUtils = require('./stringUtils');
var rtError = require('./RTCodeError');
var reactSupport = require('./reactSupport');
var templates = reactSupport.templates;
var utils = require('./utils');
var util = require('util');
var validateJS = utils.validateJS;
var RTCodeError = rtError.RTCodeError;

var repeatTemplate = _.template('_.map(<%= collection %>,<%= repeatFunction %>.bind(<%= repeatBinds %>))');
var ifTemplate = _.template('((<%= condition %>)?(<%= body %>):null)');
var propsTemplateSimple = _.template('_.assign({}, <%= generatedProps %>, <%= rtProps %>)');
var propsTemplate = _.template('mergeProps( <%= generatedProps %>, <%= rtProps %>)');

//var propsMergeFunction3 = 'function mergeProps(inline,external) {\n var res = _.assign({},inline,external)\nif (inline.hasOwnProperty(\'style\')) {\n res.style = _.defaults(res.style, inline.style);\n}\n' +
//    ' if (inline.hasOwnProperty(\'className\') && external.hasOwnProperty(\'className\')) {\n' +
//    ' res.className = external.className + \' \' + inline.className;\n} return res;\n}\n';

var propsMergeFunction = [
    'function mergeProps(inline,external) {',
    ' var res = _.assign({},inline,external)',
    'if (inline.hasOwnProperty(\'style\')) {',
    ' res.style = _.defaults(res.style, inline.style);',
    '}',
    ' if (inline.hasOwnProperty(\'className\') && external.hasOwnProperty(\'className\')) {',
    ' res.className = external.className + \' \' + inline.className;',
    '} return res;',
    '}',
    ''
].join('\n');

var classSetTemplate = _.template('_.keys(_.pick(<%= classSet %>, _.identity)).join(" ")');
var simpleTagTemplate = _.template('<%= name %>(<%= props %><%= children %>)');
var tagTemplate = _.template('<%= name %>.apply(this, [<%= props %><%= children %>])');
var simpleTagTemplateCreateElement = _.template('React.createElement(<%= name %>,<%= props %><%= children %>)');
var tagTemplateCreateElement = _.template('React.createElement.apply(this, [<%= name %>,<%= props %><%= children %>])');
var commentTemplate = _.template(' /* <%= data %> */ ');

var repeatAttr = 'rt-repeat';
var ifAttr = 'rt-if';
var classSetAttr = 'rt-class';
var classAttr = 'class';
var scopeAttr = 'rt-scope';
var propsAttr = 'rt-props';
var templateNode = 'rt-template';

function getOptions(options) {
    options = options || {};
    var defaultOptions = {
        modules: options.native ? 'commonjs' : 'amd',
        version: false,
        force: false,
        format: 'stylish',
        targetVersion: reactDOMSupport.default,
        reactImportPath: options.native ? 'react-native' : 'react/addons',
        lodashImportPath: 'lodash',
        native: false,
        nativeTargetVersion: reactNativeSupport.default,
        flow: options.flow
    };

    var finalOptions = _.defaults({}, options, defaultOptions);

    var defaultPropTemplates = finalOptions.native ?
        reactPropTemplates.native[finalOptions.nativeTargetVersion] :
        reactPropTemplates.dom[finalOptions.targetVersion];

    finalOptions.propTemplates = _.defaults({}, options.propTemplates, defaultPropTemplates);
    return finalOptions;
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
        if (curlyCounter === 0) {
            var needsParens = start !== 0 || end !== txt.length - 1;
            res += (first ? '' : concatChar) + (needsParens ? '(' : '') + txt.substr(start + 1, end - start - 2) + (needsParens ? ')' : '');
            first = false;
            txt = txt.substr(end);
        } else {
            throw RTCodeError.buildFormat(context, node, "Failed to parse text '%s'", txt);
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
 * @param {Context} context
 * @param {string} namePrefix
 * @param {string} body
 * @param {*?} params
 * @return {string}
 */
function generateInjectedFunc(context, namePrefix, body, params) {
    params = params || context.boundParams;
    var generatedFuncName = namePrefix.replace(',', '') + (context.injectedFunctions.length + 1);
    var funcText = util.format('function %s(%s) {\n%s\n}\n', generatedFuncName, params.join(','), body);
    context.injectedFunctions.push(funcText);
    return generatedFuncName;
}

function generateTemplateProps(node, context) {
    var propTemplateDefinition = context.options.propTemplates[node.name];
    var propertiesTemplates = _(node.children)
        .map(function (child, index) {
            var templateProp = null;
            if (child.name === templateNode) { // Generic explicit template tag
                if (!_.has(child.attribs, 'prop')) {
                    throw RTCodeError.build('rt-template must have a prop attribute', context, child);
                }

                var childTemplate = _.find(context.options.propTemplates, {prop: child.attribs.prop}) || {arguments: []};
                templateProp = {
                    prop: child.attribs.prop,
                    arguments: (child.attribs.arguments ? child.attribs.arguments.split(',') : childTemplate.arguments) || []
                };
            } else if (propTemplateDefinition && propTemplateDefinition[child.name]) { // Implicit child template from configuration
                templateProp = {
                    prop: propTemplateDefinition[child.name].prop,
                    arguments: child.attribs.arguments ? child.attribs.arguments.split(',') : propTemplateDefinition[child.name].arguments
                };
            }

            if (templateProp) {
                _.assign(templateProp, {childIndex: index, content: _.find(child.children, {type: 'tag'})});
            }

            return templateProp;
        })
        .compact()
        .value();

    return _.transform(propertiesTemplates, function (props, templateProp) {
        var functionParams = _.values(context.boundParams).concat(templateProp.arguments);

        var oldBoundParams = context.boundParams;
        context.boundParams = context.boundParams.concat(templateProp.arguments);

        var functionBody = 'return ' + convertHtmlToReact(templateProp.content, context);
        context.boundParams = oldBoundParams;

        var generatedFuncName = generateInjectedFunc(context, templateProp.prop, functionBody, functionParams);
        props[templateProp.prop] = genBind(generatedFuncName, _.values(context.boundParams));

        // Remove the template child from the children definition.
        node.children.splice(templateProp.childIndex, 1);
    }, {});
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
        var propKey = reactSupport.attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey) && propKey !== reactSupport.classNameProp) {
            throw RTCodeError.buildFormat(context, node, 'duplicate definition of %s %s', propKey, JSON.stringify(node.attribs));
        }
        if (key.indexOf('on') === 0 && !utils.isStringOnlyCode(val)) {
            props[propKey] = handleEventHandler(val, context, node, key);
        } else if (key === 'style' && !utils.isStringOnlyCode(val)) {
            props[propKey] = handleStyleProp(val, node, context);
        } else if (propKey === reactSupport.classNameProp) {
            // Processing for both class and rt-class conveniently return strings that
            // represent JS expressions, each evaluating to a space-separated set of class names.
            // We can just join them with another space here.
            var existing = props[propKey] ? props[propKey] + ' + " " + ' : '';
            if (key === classSetAttr) {
                props[propKey] = existing + classSetTemplate({classSet: val});
            } else if (key === classAttr || key === reactSupport.classNameProp) {
                props[propKey] = existing + convertText(node, context, val.trim());
            }
        } else if (key.indexOf('rt-') !== 0) {
            props[propKey] = convertText(node, context, val.trim());
        }
    });
    _.assign(props, generateTemplateProps(node, context));

    return '{' + _.map(props, function (val, key) {
        return JSON.stringify(key) + ' : ' + val;
    }).join(',') + '}';
}

function handleEventHandler(val, context, node, key) {
    var funcParts = val.split('=>');
    if (funcParts.length !== 2) {
        throw RTCodeError.buildFormat(context, node, "when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [%s='%s']", key, val);
    }
    var evtParams = funcParts[0].replace('(', '').replace(')', '').trim();
    var funcBody = funcParts[1].trim();
    var params = context.boundParams;
    if (evtParams.trim() !== '') {
        params = params.concat([evtParams.trim()]);
    }
    var generatedFuncName = generateInjectedFunc(context, key, funcBody, params);
    return genBind(generatedFuncName, context.boundParams);
}

function genBind(func, args) {
    //return util.format('%s.bind(%s)', generatedFuncName, (['this'].concat(context.boundParams)).join(','));
    return util.format('%s.bind(%s)', func, (['this'].concat(args)).join(','));
}

function handleStyleProp(val, node, context) {
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
    var styleArray = _.map(styleParts, function (stylePart) {
        return stringUtils.convertToCamelCase(stylePart[0]) + ' : ' + convertText(node, context, stylePart[1].trim());
    });
    return '{' + styleArray.join(',') + '}';
}

/**
 * @param {string} tagName
 * @param context
 * @return {string}
 */
function convertTagNameToConstructor(tagName, context) {
    if (context.options.native) {
        return _.includes(reactNativeSupport[context.options.nativeTargetVersion], tagName) ? 'React.' + tagName : tagName;
    }

    var isHtmlTag = _.includes(reactDOMSupport[context.options.targetVersion], tagName);
    if (reactSupport.shouldUseCreateElement(context)) {
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
    return _.some(node.children, function (child) {
        return child.type === 'tag' && child.attribs[repeatAttr];
    });
}

/*
interface NodeConversionData {
    innerScopeData:     InnerScopeData;
    repeatChildrenData: RepeatChildrenData;
    ifData:             IfData;
}

interface InnerScopeData {
    scopeName: string;
    // these are variables that were already in scope, unrelated to the ones declared in rt-inner-scope
    innerMapping: {[alias: string]: any};
    // these are variables declared in the rt-inner-scope attribute
    outerMapping: {[alias: string]: any};
}

interface RepeatChildrenData {
    itemAlias:            string;
    collectionExpression: string;
    binds:                string[];
    fn();
}

interface IfData {
    conditionExpression: string;
}
*/

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

        // Order matters. We need to add the item and itemIndex to context.boundParams before
        // the rt-scope directive is processed, lest they are not passed to the child scopes
        if (node.attribs[repeatAttr]) {
            var arr = node.attribs[repeatAttr].split(' in ');
            if (arr.length !== 2) {
                throw RTCodeError.buildFormat(context, node, "rt-repeat invalid 'in' expression '%s'", node.attribs[repeatAttr]);
            }
            data.item = arr[0].trim();
            data.collection = arr[1].trim();
            validateJS(data.item, node, context);
            validateJS(data.collection, node, context);
            stringUtils.addIfMissing(context.boundParams, data.item);
            stringUtils.addIfMissing(context.boundParams, data.item + 'Index');
        }

        if (node.attribs[scopeAttr]) {
            data.innerScope = {
                scopeName: '',
                innerMapping: {},
                outerMapping: {}
            };

            //data.innerScope.outerMapping = _.zipObject(context.boundParams, context.boundParams);
            _.forEach(context.boundParams, function (boundParam) {
                data.innerScope.outerMapping[boundParam] = boundParam;
            });

            //_(node.attribs[scopeAttr]).split(';').invoke('trim').compact().forEach().value()
            _.forEach(node.attribs[scopeAttr].split(';'), function (scopePart) {
                if (scopePart.trim().length === 0) {
                    return;
                }

                var scopeSubParts = scopePart.split(' as ');
                if (scopeSubParts.length < 2) {
                    throw RTCodeError.buildFormat(context, node, "invalid scope part '%s'", scopePart);
                }
                var alias = scopeSubParts[1].trim();
                var value = scopeSubParts[0].trim();

                validateJS(alias, node, context);

                // this adds both parameters to the list of parameters passed further down
                // the scope chain, as well as variables that are locally bound before any
                // function call, as with the ones we generate for rt-scope.
                stringUtils.addIfMissing(context.boundParams, alias);

                data.innerScope.scopeName += stringUtils.capitalize(alias);
                data.innerScope.innerMapping[alias] = 'var ' + alias + ' = ' + value + ';';
                validateJS(data.innerScope.innerMapping[alias], node, context);
            });
        }

        data.props = generateProps(node, context);
        if (node.attribs[propsAttr]) {
            if (data.props === '{}') {
                data.props = node.attribs[propsAttr];
            } else if (!node.attribs.style && !node.attribs.class) {
                data.props = propsTemplateSimple({generatedProps: data.props, rtProps: node.attribs[propsAttr]});
            } else {
                data.props = propsTemplate({generatedProps: data.props, rtProps: node.attribs[propsAttr]});
                if (!_.includes(context.injectedFunctions, propsMergeFunction)) {
                    context.injectedFunctions.push(propsMergeFunction);
                }
            }
        }
        if (node.attribs[ifAttr]) {
            data.condition = node.attribs[ifAttr].trim();
        }
        data.children = utils.concatChildren(_.map(node.children, function (child) {
            var code = convertHtmlToReact(child, context);
            validateJS(code, child, context);
            return code;
        }));

        if (hasNonSimpleChildren(node)) {
            data.body = reactSupport.shouldUseCreateElement(context) ? tagTemplateCreateElement(data) : tagTemplate(data);
        } else {
            data.body = reactSupport.shouldUseCreateElement(context) ? simpleTagTemplateCreateElement(data) : simpleTagTemplate(data);
        }

        if (node.attribs[scopeAttr]) {
            var functionBody = _.values(data.innerScope.innerMapping).join('\n') + 'return ' + data.body;
            var generatedFuncName = generateInjectedFunc(context, 'scope' + data.innerScope.scopeName, functionBody, _.keys(data.innerScope.outerMapping));
            data.body = util.format('%s.apply(this, [%s])', generatedFuncName, _.values(data.innerScope.outerMapping).join(','));
        }

        // Order matters here. Each rt-repeat iteration wraps over the rt-scope, so
        // the scope variables are evaluated in context of the current iteration.
        if (node.attribs[repeatAttr]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + stringUtils.capitalize(data.item), 'return ' + data.body);
            data.repeatBinds = ['this'].concat(_.reject(context.boundParams, function (param) {
                return param === data.item || param === data.item + 'Index' || data.innerScope && param in data.innerScope.innerMapping;
            }));
            data.body = repeatTemplate(data);
        }
        if (node.attribs[ifAttr]) {
            data.body = ifTemplate(data);
        }
        return data.body;
    } else if (node.type === 'comment') {
        return commentTemplate(node);
    } else if (node.type === 'text') {
        if (node.data.trim()) {
            return convertText(node, context, node.data);
        }
        return '';
    }
}

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
            if (node.type === 'tag' && _.includes(reactSupport.htmlSelfClosingTags, node.name)) {
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

function convertTemplateToReact(html, options) {
    var context = require('./context');
    return convertRT(html, context, options);
}

/**
 * @param {string} html
 * @param {CONTEXT} reportContext
 * @param {{modules:string,defines:*}?} options
 * @return {string}
 */
function convertRT(html, reportContext, options) {
    var rootNode = cheerio.load(html, {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true});
    options = getOptions(options);

    var defaultDefines = {};
    defaultDefines[options.reactImportPath] = 'React';
    defaultDefines[options.lodashImportPath] = '_';

    var defines = options.defines ? _.clone(options.defines) : defaultDefines;

    var context = defaultContext(html, options);
    utils.validate(options, context, reportContext, rootNode.root()[0]);
    var rootTags = _.filter(rootNode.root()[0].children, isTag);
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
            defines[tag.attribs.dependency] = tag.attribs.as;
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
    var requirePaths = _(defines)
        .keys()
        .map(function (reqName) { return '"' + reqName + '"'; })
        .value()
        .join(',');
    var requireVars = _.values(defines).join(',');
    var buildImport;
    if (options.modules === 'typescript') {
        buildImport = function (reqVar, reqPath) {
            return 'import ' + reqVar + " = require('" + reqPath + "');";
        };
    } else if (options.modules === 'es6') {
        buildImport = function (reqVar, reqPath) {
            return 'import ' + reqVar + " from '" + reqPath + "';";
        };
    } else {
        buildImport = function (reqVar, reqPath) {
            return 'var ' + reqVar + " = require('" + reqPath + "');";
        };
    }
    var vars = _(defines).map(buildImport).join('\n');

    if (options.flow) {
        vars = '/* @flow */\n' + vars;
    }
    var data = {body: body, injectedFunctions: '', requireNames: requireVars, requirePaths: requirePaths, vars: vars, name: options.name};
    data.injectedFunctions = context.injectedFunctions.join('\n');
    var code = generate(data, options);
    if (options.modules !== 'typescript' && options.modules !== 'jsrt') {
        code = parseJS(code);
    }
    return code;
}

function parseJS(code) {
    try {
        var tree = esprima.parse(code, {range: true, tokens: true, comment: true});
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        return escodegen.generate(tree, {comment: true});
    } catch (e) {
        throw new RTCodeError(e.message, e.index, -1);
    }
}

function convertJSRTToJS(text, reportContext, options) {
    options = getOptions(options);
    options.modules = 'jsrt';
    var templateMatcherJSRT = /<template>([^]*?)<\/template>/gm;
    var code = text.replace(templateMatcherJSRT, function (template, html) {
        return convertRT(html, reportContext, options).replace(/;$/, '');
    });
    code = parseJS(code);
    return code;
}

function generate(data, options) {
    var template = templates[options.modules];
    return template(data);
}

module.exports = {
    convertTemplateToReact: convertTemplateToReact,
    convertRT: convertRT,
    convertJSRTToJS: convertJSRTToJS,
    RTCodeError: RTCodeError,
    normalizeName: utils.normalizeName,
    _test: {
        convertText: convertText
    }
};

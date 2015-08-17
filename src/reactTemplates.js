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

var repeatTemplate = _.template('_.map(<%= collection %>,<%= repeatFunction %>.bind(<%= repeatBinds %>))');
var ifTemplate = _.template('((<%= condition %>)?(<%= body %>):null)');
var propsTemplateSimple = _.template('_.assign({}, <%= generatedProps %>, <%= rtProps %>)');
var propsTemplate = _.template('mergeProps( <%= generatedProps %>, <%= rtProps %>)');
var propsMergeFunction = 'function mergeProps(inline,external) {\n var res = _.assign({},inline,external)\nif (inline.hasOwnProperty(\'style\')) {\n res.style = _.defaults(res.style, inline.style);\n}\n' +
    ' if (inline.hasOwnProperty(\'className\') && external.hasOwnProperty(\'className\')) {\n' +
    ' res.className = external.className + \' \' + inline.className;\n} return res;\n}\n';
var classSetTemplate = _.template('_.keys(_.pick(<%= classSet %>, _.identity)).join(" ")');
var simpleTagTemplate = _.template('<%= name %>(<%= props %><%= children %>)');
var tagTemplate = _.template('<%= name %>.apply(this, [<%= props %><%= children %>])');
var simpleTagTemplateCreateElement = _.template('React.createElement(<%= name %>,<%= props %><%= children %>)');
var tagTemplateCreateElement = _.template('React.createElement.apply(this, [<%= name %>,<%= props %><%= children %>])');
var commentTemplate = _.template(' /* <%= data %> */ ');

var templateAMDTemplate = _.template("define(<%= name ? '\"'+name + '\", ' : '' %>[<%= requirePaths %>], function (<%= requireNames %>) {\n'use strict';\n <%= injectedFunctions %>\nreturn function(){ return <%= body %>};\n});");
var templateCommonJSTemplate = _.template("'use strict';\n<%= vars %>\n\n<%= injectedFunctions %>\nmodule.exports = function(){ return <%= body %>};\n");
var templateES6Template = _.template('<%= vars %>\n\n<%= injectedFunctions %>\nexport default function(){ return <%= body %>}\n');
var templatePJSTemplate = _.template('var <%= name %> = function () {\n' +
                                '<%= injectedFunctions %>\n' +
                                'return <%= body %>\n' +
                                '};\n');
var templateTypescriptTemplate = _.template('<%= vars %>\n\n<%= injectedFunctions %>\nvar fn = function() { return <%= body %> };\nexport = fn\n');
var templateJSRTTemplate = _.template('(function () {\n <%= injectedFunctions %>\n return function(){\nreturn <%= body %>}}\n)()');

var templates = {
    amd: templateAMDTemplate,
    commonjs: templateCommonJSTemplate,
    typescript: templateTypescriptTemplate,
    es6: templateES6Template,
    none: templatePJSTemplate,
    jsrt: templateJSRTTemplate
};


var htmlSelfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

var templateAttr = 'rt-repeat';
var ifAttr = 'rt-if';
var classSetAttr = 'rt-class';
var classAttr = 'class';
var scopeAttr = 'rt-scope';
var propsAttr = 'rt-props';
var templateNode = 'rt-template';

var defaultOptions = {modules: 'amd', version: false, force: false, format: 'stylish', targetVersion: '0.13.1', reactImportPath: 'react/addons', lodashImportPath: 'lodash'};

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

var reactSupportedAttributes = ['accept', 'acceptCharset', 'accessKey', 'action', 'allowFullScreen', 'allowTransparency', 'alt', 'async', 'autoComplete', 'autoPlay', 'cellPadding', 'cellSpacing', 'charSet', 'checked',
                                'classID', 'className', 'cols', 'colSpan', 'content', 'contentEditable', 'contextMenu', 'controls', 'coords', 'crossOrigin', 'data', 'dateTime', 'defer', 'dir', 'disabled', 'download',
                                'draggable', 'encType', 'form', 'formNoValidate', 'frameBorder', 'height', 'hidden', 'href', 'hrefLang', 'htmlFor', 'httpEquiv', 'icon', 'id', 'label', 'lang', 'list', 'loop', 'manifest',
                                'max', 'maxLength', 'media', 'mediaGroup', 'method', 'min', 'multiple', 'muted', 'name', 'noValidate', 'open', 'pattern', 'placeholder', 'poster', 'preload', 'radioGroup', 'readOnly', 'rel',
                                'required', 'role', 'rows', 'rowSpan', 'sandbox', 'scope', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet', 'start', 'step',
                                'style', 'tabIndex', 'target', 'title', 'type', 'useMap', 'value', 'width', 'wmode'];
var classNameProp = 'className';
var attributesMapping = {'class': classNameProp, 'rt-class': classNameProp, 'for': 'htmlFor'}; //eslint-disable-line quote-props
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

function generateTemplateProps(node, context) {
    var propTemplateDefinition = context.options.templates && context.options.templates[node.name];
    var propertiesTemplates = _(node.children)
        .map(function (child, index) {
            var templateProp = null;
            if (child.name === templateNode) { // Generic explicit template tag
                if (!_.has(child.attribs, 'prop')) {
                    throw RTCodeError.build('rt-template must have a prop attribute', context, child);
                }

                var childTemplate = _.find(context.options.templates, {prop: child.attribs.prop}) || {arguments: []};
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
        var boundArguments = _.values(context.boundParams).join(',');
        props[templateProp.prop] = generatedFuncName + '.bind(this' + (boundArguments.length ? ', ' + boundArguments : '') + ')';

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
        var propKey = attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey) && propKey !== classNameProp) {
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
        } else if (propKey === classNameProp) {
            // Processing for both class and rt-class conveniently return strings that
            // represent JS expressions, each evaluating to a space-separated set of class names.
            // We can just join them with another space here.
            var existing = props[propKey] ? props[propKey] + ' + " " + ' : '';
            if (key === classSetAttr) {
                props[propKey] = existing + classSetTemplate({classSet: val});
            } else if (key === classAttr || key === classNameProp) {
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
        return child.type === 'tag' && child.attribs[templateAttr];
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
        if (node.attribs[scopeAttr]) {
            //data.scopeMapping = {};
            data.scopeName = '';

            // these are variables that were already in scope, unrelated to the ones declared in rt-scope
            data.outerScopeMapping = {};
            _.each(context.boundParams, function (boundParam) {
                data.outerScopeMapping[boundParam] = boundParam;
            });

            // these are variables declared in the rt-scope attribute
            data.innerScopeMapping = {};
            _.each(node.attribs[scopeAttr].split(';'), function (scopePart) {
                if (scopePart.trim().length === 0) {
                    return;
                }

                var scopeSubParts = scopePart.split(' as ');
                if (scopeSubParts.length < 2) {
                    throw RTCodeError.build("invalid scope part '" + scopePart + "'", context, node);
                }
                var scopeName = scopeSubParts[1].trim();
                validateJS(scopeName, node, context);

                // this adds both parameters to the list of parameters passed further down
                // the scope chain, as well as variables that are locally bound before any
                // function call, as with the ones we generate for rt-scope.
                stringUtils.addIfMissing(context.boundParams, scopeName);

                data.scopeName += stringUtils.capitalize(scopeName);
                data.innerScopeMapping[scopeName] = scopeSubParts[0].trim();
                validateJS(data.innerScopeMapping[scopeName], node, context);
            });
        }

        if (node.attribs[templateAttr]) {
            var arr = node.attribs[templateAttr].split(' in ');
            if (arr.length !== 2) {
                throw RTCodeError.build("rt-repeat invalid 'in' expression '" + node.attribs[templateAttr] + "'", context, node);
            }
            data.item = arr[0].trim();
            data.collection = arr[1].trim();
            validateJS(data.item, node, context);
            validateJS(data.collection, node, context);
            stringUtils.addIfMissing(context.boundParams, data.item);
            stringUtils.addIfMissing(context.boundParams, data.item + 'Index');
        }
        data.props = generateProps(node, context);
        if (node.attribs[propsAttr]) {
            if (data.props === '{}') {
                data.props = node.attribs[propsAttr];
            } else if (!node.attribs.style && !node.attribs.class) {
                data.props = propsTemplateSimple({generatedProps: data.props, rtProps: node.attribs[propsAttr]});
            } else {
                data.props = propsTemplate({generatedProps: data.props, rtProps: node.attribs[propsAttr]});
                if (!_.contains(context.injectedFunctions, propsMergeFunction)) {
                    context.injectedFunctions.push(propsMergeFunction);
                }
            }
        }
        if (node.attribs[ifAttr]) {
            data.condition = node.attribs[ifAttr].trim();
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


        if (node.attribs[templateAttr]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + stringUtils.capitalize(data.item), 'return ' + data.body);
            data.repeatBinds = ['this'].concat(_.reject(context.boundParams, function (param) {
                return param === data.item || param === data.item + 'Index';
            }));
            data.body = repeatTemplate(data);
        }
        if (node.attribs[ifAttr]) {
            data.body = ifTemplate(data);
        }
        if (node.attribs[scopeAttr]) {
            var scopeVarDeclarations = _.reduce(data.innerScopeMapping, function (acc, rightHandSide, leftHandSide) {
                var declaration = 'var ' + leftHandSide + ' = ' + rightHandSide + ';';
                return acc + declaration;
            }, '');
            var functionBody = scopeVarDeclarations + 'return ' + data.body;
            var generatedFuncName = generateInjectedFunc(context, 'scope' + data.scopeName, functionBody, _.keys(data.outerScopeMapping));
            data.body = generatedFuncName + '.apply(this, [' + _.values(data.outerScopeMapping).join(',') + '])';
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
 * @param options
 * @param {*} context
 * @param {CONTEXT} reportContext
 * @param node
 */
function validate(options, context, reportContext, node) {
    if (node.type === 'tag' && node.attribs['rt-if'] && !node.attribs.key) {
        var loc = rtError.getNodeLoc(context, node);
        reportContext.warn('rt-if without a key', options.fileName, loc.pos.line, loc.pos.col, loc.start, loc.end);
    }
    if (node.children) {
        node.children.forEach(validate.bind(this, options, context, reportContext));
    }
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
    options = _.defaults({}, options, defaultOptions);

    var defaultDefines = {};
    defaultDefines[options.reactImportPath] = 'React';
    defaultDefines[options.lodashImportPath] = '_';

    var defines = options.defines ? _.clone(options.defines) : defaultDefines;

    var context = defaultContext(html, options);
    validate(options, context, reportContext, rootNode.root()[0]);
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
    var requirePaths = _(defines).keys().map(function (reqName) {
        return '"' + reqName + '"';
    }).value().join(',');
    var requireVars = _(defines).values().value().join(',');
    var vars;
    if (options.modules === 'typescript') {
        vars = _(defines).map(function (reqVar, reqPath) {
            return 'import ' + reqVar + " = require('" + reqPath + "');";
        }).join('\n');
    } else if (options.modules === 'es6') {
        vars = _(defines).map(function (reqVar, reqPath) {
            return 'import ' + reqVar + " from '" + reqPath + "';";
        }).join('\n');
    } else {
        vars = _(defines).map(function (reqVar, reqPath) {
            return 'var ' + reqVar + " = require('" + reqPath + "');";
        }).join('\n');
    }
    var data = {body: body, injectedFunctions: '', requireNames: requireVars, requirePaths: requirePaths, vars: vars, name: options.name};
    data.injectedFunctions = context.injectedFunctions.join('\n');
    var code = generate(data, options);
    if (options.modules !== 'typescript' && options.modules !== 'jsrt') {
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

function convertJSRTToJS(text, reportContext, options) {
    options = _.defaults({}, options, defaultOptions);
    options.modules = 'jsrt';
    var templateMatcherJSRT = /<template>([^]*?)<\/template>/gm;
    var code = text.replace(templateMatcherJSRT, function (template, html) {
        return convertRT(html, reportContext, options).replace(/;$/, '');
    });
    try {
        var tree = esprima.parse(code, {range: true, tokens: true, comment: true});
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        code = escodegen.generate(tree, {comment: true});
    } catch (e) {
        throw new RTCodeError(e.message, e.index, -1);
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
    convertRT: convertRT,
    convertJSRTToJS: convertJSRTToJS,
    RTCodeError: RTCodeError,
    normalizeName: normalizeName,
    _test: {
        convertText: convertText
    }
};

'use strict';
var cheerio = require('cheerio');
var _ = require('lodash');
var esprima = require('esprima');
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

const propsMergeFunction = `function mergeProps(inline,external) {
    var res = _.assign({},inline,external)
    if (inline.hasOwnProperty('style')) {
        res.style = _.defaults(res.style, inline.style);
    }
    if (inline.hasOwnProperty('className') && external.hasOwnProperty('className')) {
        res.className = external.className + ' ' + inline.className;
    }
    return res;
}
`;

var classSetTemplate = _.template('_(<%= classSet %>).transform(function(res, value, key){ if(value){ res.push(key); } }, []).join(" ")');

function getTagTemplateString(simpleTagTemplate, shouldCreateElement) {
    if (simpleTagTemplate) {
        return shouldCreateElement ? 'React.createElement(<%= name %>,<%= props %><%= children %>)' : '<%= name %>(<%= props %><%= children %>)';
    }
    return shouldCreateElement ? 'React.createElement.apply(this, [<%= name %>,<%= props %><%= children %>])' : '<%= name %>.apply(this, [<%= props %><%= children %>])';
}


var commentTemplate = _.template(' /* <%= data %> */ ');

var repeatAttr = 'rt-repeat';
var ifAttr = 'rt-if';
var classSetAttr = 'rt-class';
var classAttr = 'class';
var scopeAttr = 'rt-scope';
var propsAttr = 'rt-props';
var templateNode = 'rt-template';
var virtualNode = 'rt-virtual';
var includeNode = 'rt-include';
var includeSrcAttr = 'src';

var reactTemplatesSelfClosingTags = [includeNode];

/**
 * @param {Options} options
 * @return {Options}
 */
function getOptions(options) {
    options = options || {};
    var defaultOptions = {
        modules: options.native ? 'commonjs' : 'amd',
        version: false,
        force: false,
        format: 'stylish',
        targetVersion: reactDOMSupport.default,
        reactImportPath: reactImport(options),
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

function reactImport(options) {
    if (options.native) {
        return 'react-native';
    }
    if (options.targetVersion === '0.14.0') {
        return 'react';
    }
    return 'react/addons';
}

/**
 * @const
 */
const curlyMap = {'{': 1, '}': -1};

/**
 * @typedef {{boundParams: Array.<string>, injectedFunctions: Array.<string>, html: string, options: *}} Context
 */

/**
 * @typedef {{fileName:string,force:boolean,modules:string,defines:*,reactImportPath:string=,lodashImportPath:string=,flow:boolean,name:string,native:boolean,propTemplates:*,format:string,_:*,version:boolean,help:boolean,listTargetVersion:boolean,modules:string, dryRun:boolean}} Options
 */

/**
 * @param node
 * @param {Context} context
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
        for (end = start + 1; end < txt.length && curlyCounter > 0; end++) { //eslint-disable-line no-restricted-syntax
            curlyCounter += curlyMap[txt.charAt(end)] || 0;
        }
        if (curlyCounter === 0) {
            var needsParens = start !== 0 || end !== txt.length - 1;
            res += (first ? '' : concatChar) + (needsParens ? '(' : '') + txt.substr(start + 1, end - start - 2) + (needsParens ? ')' : '');
            first = false;
            txt = txt.substr(end);
        } else {
            throw RTCodeError.build(context, node, `Failed to parse text '${txt}'`);
        }
    }
    if (txt) {
        res += (first ? '' : concatChar) + JSON.stringify(txt);
    }
    if (res === '') {
        res = 'true';
    }
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
    var funcName = namePrefix.replace(',', '') + (context.injectedFunctions.length + 1);
    var funcText = `function ${funcName}(${params.join(',')}) {
        ${body}
        }
        `;
    context.injectedFunctions.push(funcText);
    return funcName;
}

function generateTemplateProps(node, context) {
    var propTemplateDefinition = context.options.propTemplates[node.name];
    var propertiesTemplates = _(node.children)
        .map(function (child, index) {
            var templateProp = null;
            if (child.name === templateNode) { // Generic explicit template tag
                if (!_.has(child.attribs, 'prop')) {
                    throw RTCodeError.build(context, child, 'rt-template must have a prop attribute');
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
    var props = {};
    _.forOwn(node.attribs, function (val, key) {
        var propKey = reactSupport.attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey) && propKey !== reactSupport.classNameProp) {
            throw RTCodeError.build(context, node, `duplicate definition of ${propKey} ${JSON.stringify(node.attribs)}`);
        }
        if (key.indexOf('on') === 0 && !utils.isStringOnlyCode(val)) {
            props[propKey] = handleEventHandler(val, context, node, key);
        } else if (key === 'style' && !utils.isStringOnlyCode(val)) {
            props[propKey] = handleStyleProp(val, node, context);
        } else if (propKey === reactSupport.classNameProp) {
            // Processing for both class and rt-class conveniently return strings that
            // represent JS expressions, each evaluating to a space-separated set of class names.
            // We can just join them with another space here.
            var existing = props[propKey] ? `${props[propKey]} + " " + ` : '';
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

    const propStr = _.map(props, (v, k) => `${JSON.stringify(k)} : ${v}`).join(',');
    return `{${propStr}}`;
}

function handleEventHandler(val, context, node, key) {
    var funcParts = val.split('=>');
    if (funcParts.length !== 2) {
        throw RTCodeError.build(context, node, `when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [${key}='${val}']`);
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
    return util.format('%s.bind(%s)', func, (['this'].concat(args)).join(','));
}

function handleStyleProp(val, node, context) {
    /*eslint lodash/prefer-lodash-chain:0*/
    const styleStr = _(val)
        .split(';')
        .map(_.trim)
        .filter(i => _.includes(i, ':'))
        .map(i => {
            const pair = i.split(':');
            //const val = pair[1];
            const val = pair.slice(1).join(':').trim();
            return _.camelCase(pair[0].trim()) + ' : ' + convertText(node, context, val.trim());
            //return stringUtils.convertToCamelCase(pair[0].trim()) + ' : ' + convertText(node, context, val.trim())
        })
        .join(',');
    return `{${styleStr}}`;
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
        return isHtmlTag ? `'${tagName}'` : tagName;
    }
    return isHtmlTag ? 'React.DOM.' + tagName : tagName;
}

/**
 * @param {string} html
 * @param options
 * @param reportContext
 * @return {Context}
 */
function defaultContext(html, options, reportContext) {
    var defaultDefines = {};
    defaultDefines[options.reactImportPath] = 'React';
    defaultDefines[options.lodashImportPath] = '_';
    return {
        boundParams: [],
        injectedFunctions: [],
        html: html,
        options: options,
        defines: options.defines ? _.clone(options.defines) : defaultDefines,
        reportContext: reportContext
    };
}

/**
 * @param node
 * @return {boolean}
 */
function hasNonSimpleChildren(node) {
    return _.some(node.children, child => child.type === 'tag' && child.attribs[repeatAttr]);
}

/**
 * @param node
 * @param {Context} context
 * @return {string}
 */
function convertHtmlToReact(node, context) {
    if (node.type === 'tag' || node.type === 'style') {
        context = _.defaults({
            boundParams: _.clone(context.boundParams)
        }, context);

        if (node.type === 'tag' && node.name === includeNode) {
            var srcFile = node.attribs[includeSrcAttr];
            if (!srcFile) {
                throw RTCodeError.build(context, node, 'rt-include must supply a source attribute');
            }
            if (!context.options.readFileSync) {
                throw RTCodeError.build(context, node, 'rt-include needs a readFileSync polyfill on options');
            }
            try {
                var newHtml = context.options.readFileSync(srcFile);
            } catch (e) {
                console.error(e);
                throw RTCodeError.build(context, node, `rt-include failed to read file '${srcFile}'`);
            }
            context.html = newHtml;
            return parseAndConvertHtmlToReact(newHtml, context);
        }

        var data = {name: convertTagNameToConstructor(node.name, context)};

        // Order matters. We need to add the item and itemIndex to context.boundParams before
        // the rt-scope directive is processed, lest they are not passed to the child scopes
        if (node.attribs[repeatAttr]) {
            var arr = node.attribs[repeatAttr].split(' in ');
            if (arr.length !== 2) {
                throw RTCodeError.build(context, node, `rt-repeat invalid 'in' expression '${node.attribs[repeatAttr]}'`);
            }
            data.item = arr[0].trim();
            data.collection = arr[1].trim();
            validateJS(data.item, node, context);
            validateJS("(" + data.collection + ")", node, context);
            stringUtils.addIfMissing(context.boundParams, data.item);
            stringUtils.addIfMissing(context.boundParams, `${data.item}Index`);
        }

        if (node.attribs[scopeAttr]) {
            handleScopeAttribute(node, context, data);
        }

        if (node.attribs[ifAttr]) {
            validateIfAttribute(node, context, data);
            data.condition = node.attribs[ifAttr].trim();
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

        var children = _.map(node.children, function (child) {
            var code = convertHtmlToReact(child, context);
            validateJS(code, child, context);
            return code;
        });

        data.children = utils.concatChildren(children);

        if (node.name === virtualNode) { //eslint-disable-line wix-editor/prefer-ternary
            data.body = "[" + _.compact(children).join(',') + "]";
        }
        else {
            data.body = _.template(getTagTemplateString(!hasNonSimpleChildren(node), reactSupport.shouldUseCreateElement(context)))(data);
        }

        if (node.attribs[scopeAttr]) {
            var functionBody = _.values(data.innerScope.innerMapping).join('\n') + `return ${data.body}`;
            var generatedFuncName = generateInjectedFunc(context, 'scope' + data.innerScope.scopeName, functionBody, _.keys(data.innerScope.outerMapping));
            data.body = `${generatedFuncName}.apply(this, [${_.values(data.innerScope.outerMapping).join(',')}])`;
        }

        // Order matters here. Each rt-repeat iteration wraps over the rt-scope, so
        // the scope variables are evaluated in context of the current iteration.
        if (node.attribs[repeatAttr]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + _.capitalize(data.item), 'return ' + data.body);
            data.repeatBinds = ['this'].concat(_.reject(context.boundParams, p => p === data.item || p === data.item + 'Index' || data.innerScope && p in data.innerScope.innerMapping));
            data.body = repeatTemplate(data);
        }
        if (node.attribs[ifAttr]) {
            data.body = ifTemplate(data);
        }
        return data.body;
    } else if (node.type === 'comment') {
        return commentTemplate(node);
    } else if (node.type === 'text') {
        return node.data.trim() ? convertText(node, context, node.data) : '';
    }
}

function handleScopeAttribute(node, context, data) {
    data.innerScope = {
        scopeName: '',
        innerMapping: {},
        outerMapping: {}
    };

    data.innerScope.outerMapping = _.zipObject(context.boundParams, context.boundParams);

    _(node.attribs[scopeAttr]).split(';').invoke('trim').compact().forEach(scopePart => {
        var scopeSubParts = _(scopePart).split(' as ').invoke('trim').value();
        if (scopeSubParts.length < 2) {
            throw RTCodeError.build(context, node, `invalid scope part '${scopePart}'`);
        }
        var alias = scopeSubParts[1];
        var value = scopeSubParts[0];
        validateJS(alias, node, context);

        // this adds both parameters to the list of parameters passed further down
        // the scope chain, as well as variables that are locally bound before any
        // function call, as with the ones we generate for rt-scope.
        stringUtils.addIfMissing(context.boundParams, alias);

        data.innerScope.scopeName += _.capitalize(alias);
        data.innerScope.innerMapping[alias] = `var ${alias} = ${value};`;
        validateJS(data.innerScope.innerMapping[alias], node, context);
    }).value();
}

function validateIfAttribute(node, context, data) {
    var innerMappingKeys = _.keys(data.innerScope && data.innerScope.innerMapping || {});
    var ifAttributeTree = null;
    try {
        ifAttributeTree = esprima.parse(node.attribs[ifAttr]);
    } catch (e) {
        throw new RTCodeError(e.message, e.index, -1);
    }
    if (ifAttributeTree && ifAttributeTree.body && ifAttributeTree.body.length === 1 && ifAttributeTree.body[0].type === 'ExpressionStatement') {
        // make sure that rt-if does not use an inner mapping
        if (ifAttributeTree.body[0].expression && utils.usesScopeName(innerMappingKeys, ifAttributeTree.body[0].expression)) {
            throw RTCodeError.buildFormat(context, node, "invalid scope mapping used in if part '%s'", node.attribs[ifAttr]);
        }
    } else {
        throw RTCodeError.buildFormat(context, node, "invalid if part '%s'", node.attribs[ifAttr]);
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
            if (node.type === 'tag' && (_.includes(reactSupport.htmlSelfClosingTags, node.name) ||
              _.includes(reactTemplatesSelfClosingTags, node.name))) {
                externalNodes = _.filter(node.children, isTag);
                _.forEach(externalNodes, i => i.parent = node);
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

function parseAndConvertHtmlToReact(html, context) {
    var rootNode = cheerio.load(html, {lowerCaseTags: false, lowerCaseAttributeNames: false, xmlMode: true, withStartIndices: true});
    utils.validate(context.options, context, context.reportContext, rootNode.root()[0]);
    var rootTags = _.filter(rootNode.root()[0].children, isTag);
    rootTags = handleSelfClosingHtmlTags(rootTags);
    if (!rootTags || rootTags.length === 0) {
        throw new RTCodeError('Document should have a root element');
    }
    var firstTag = null;
    _.forEach(rootTags, function (tag) {
        if (tag.name === 'rt-require') {
            if (!tag.attribs.dependency || !tag.attribs.as) {
                throw RTCodeError.build(context, tag, "rt-require needs 'dependency' and 'as' attributes");
            } else if (tag.children.length) {
                throw RTCodeError.build(context, tag, 'rt-require may have no children');
            }
            context.defines[tag.attribs.dependency] = tag.attribs.as;
        } else if (firstTag === null) {
            firstTag = tag;
        } else {
            throw RTCodeError.build(context, tag, 'Document should have no more than a single root element');
        }
    });
    if (firstTag === null) {
        throw RTCodeError.build(context, rootNode.root()[0], 'Document should have a single root element');
    } else if (firstTag.name === virtualNode) {
        throw RTCodeError.build(context, firstTag, `Document should not have <${virtualNode}> as root element`);
    }
    return convertHtmlToReact(firstTag, context);
}

/**
 * @param {string} html
 * @param {CONTEXT} reportContext
 * @param {Options?} options
 * @return {string}
 */
function convertRT(html, reportContext, options) {
    options = getOptions(options);

    var context = defaultContext(html, options, reportContext);
    var body = parseAndConvertHtmlToReact(html, context);

    var requirePaths = _(context.defines)
        .keys()
        .map(def => `"${def}"`)
        .join(',');
    var buildImport;
    if (options.modules === 'typescript') {
        buildImport = (v, p) => `import ${v} = require('${p}');`;
    } else if (options.modules === 'es6') { // eslint-disable-line
        buildImport = (v, p) => `import ${v} from '${p}';`;
    } else {
        buildImport = (v, p) => `var ${v} = require('${p}');`;
    }
    const header = options.flow ? '/* @flow */\n' : '';
    const vars = header + _(context.defines).map(buildImport).join('\n');
    var data = {body, injectedFunctions: context.injectedFunctions.join('\n'), requireNames: _.values(context.defines).join(','), requirePaths, vars, name: options.name};
    var code = generate(data, options);
    if (options.modules !== 'typescript' && options.modules !== 'jsrt') {
        code = parseJS(code);
    }
    return code;
}

function parseJS(code) {
    try {
        var tree = esprima.parse(code, {range: true, tokens: true, comment: true, sourceType: 'module'});
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
    var code = text.replace(templateMatcherJSRT, (template, html) => convertRT(html, reportContext, options).replace(/;$/, ''));
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

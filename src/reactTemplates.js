'use strict';
const cheerio = require('cheerio');
const _ = require('lodash');
const esprima = require('esprima');
const escodegen = require('escodegen');
const reactDOMSupport = require('./reactDOMSupport');
const reactNativeSupport = require('./reactNativeSupport');
const reactPropTemplates = require('./reactPropTemplates');
const stringUtils = require('./stringUtils');
const rtError = require('./RTCodeError');
const reactSupport = require('./reactSupport');
const templates = reactSupport.templates;
const utils = require('./utils');
const validateJS = utils.validateJS;
const RTCodeError = rtError.RTCodeError;

const repeatTemplate = _.template('_.map(<%= collection %>,<%= repeatFunction %>.bind(<%= repeatBinds %>))');
const ifTemplate = _.template('((<%= condition %>)?(<%= body %>):null)');
const propsTemplateSimple = _.template('_.assign({}, <%= generatedProps %>, <%= rtProps %>)');
const propsTemplate = _.template('mergeProps( <%= generatedProps %>, <%= rtProps %>)');

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

const classSetTemplate = _.template('_(<%= classSet %>).transform(function(res, value, key){ if(value){ res.push(key); } }, []).join(" ")');

function getTagTemplateString(simpleTagTemplate, shouldCreateElement) {
    if (simpleTagTemplate) {
        return shouldCreateElement ? 'React.createElement(<%= name %>,<%= props %><%= children %>)' : '<%= name %>(<%= props %><%= children %>)';
    }
    return shouldCreateElement ? 'React.createElement.apply(this, [<%= name %>,<%= props %><%= children %>])' : '<%= name %>.apply(this, [<%= props %><%= children %>])';
}


const commentTemplate = _.template(' /* <%= data %> */ ');

const repeatAttr = 'rt-repeat';
const ifAttr = 'rt-if';
const classSetAttr = 'rt-class';
const classAttr = 'class';
const scopeAttr = 'rt-scope';
const propsAttr = 'rt-props';
const templateNode = 'rt-template';
const virtualNode = 'rt-virtual';
const includeNode = 'rt-include';
const includeSrcAttr = 'src';

const reactTemplatesSelfClosingTags = [includeNode];

/**
 * @param {Options} options
 * @return {Options}
 */
function getOptions(options) {
    options = options || {};
    const defaultOptions = {
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

    const finalOptions = _.defaults({}, options, defaultOptions);

    const defaultPropTemplates = finalOptions.native ?
        reactPropTemplates.native[finalOptions.nativeTargetVersion] :
        reactPropTemplates.dom[finalOptions.targetVersion];

    finalOptions.propTemplates = _.defaults({}, options.propTemplates, defaultPropTemplates);
    return finalOptions;
}

function reactImport(options) {
    if (options.native) {
        return 'react-native';
    }
    if (options.targetVersion === '0.14.0' || options.targetVersion === '0.15.0') {
        return 'react';
    }
    return 'react/addons';
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
    const funcName = namePrefix.replace(',', '') + (context.injectedFunctions.length + 1);
    const funcText = `function ${funcName}(${params.join(',')}) {
        ${body}
        }
        `;
    context.injectedFunctions.push(funcText);
    return funcName;
}

function generateTemplateProps(node, context) {
    const propTemplateDefinition = context.options.propTemplates[node.name];
    const propertiesTemplates = _(node.children)
        .map((child, index) => {
            let templateProp = null;
            if (child.name === templateNode) { // Generic explicit template tag
                if (!_.has(child.attribs, 'prop')) {
                    throw RTCodeError.build(context, child, 'rt-template must have a prop attribute');
                }

                const childTemplate = _.find(context.options.propTemplates, {prop: child.attribs.prop}) || {arguments: []};
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

    return _.transform(propertiesTemplates, (props, templateProp) => {
        const functionParams = _.values(context.boundParams).concat(templateProp.arguments);

        const oldBoundParams = context.boundParams;
        context.boundParams = context.boundParams.concat(templateProp.arguments);

        const functionBody = 'return ' + convertHtmlToReact(templateProp.content, context);
        context.boundParams = oldBoundParams;

        const generatedFuncName = generateInjectedFunc(context, templateProp.prop, functionBody, functionParams);
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
    const props = {};
    _.forOwn(node.attribs, (val, key) => {
        const propKey = reactSupport.attributesMapping[key.toLowerCase()] || key;
        if (props.hasOwnProperty(propKey) && propKey !== reactSupport.classNameProp) {
            throw RTCodeError.build(context, node, `duplicate definition of ${propKey} ${JSON.stringify(node.attribs)}`);
        }
        if (_.startsWith(key, 'on') && !utils.isStringOnlyCode(val)) {
            props[propKey] = handleEventHandler(val, context, node, key);
        } else if (key === 'style' && !utils.isStringOnlyCode(val)) {
            props[propKey] = handleStyleProp(val, node, context);
        } else if (propKey === reactSupport.classNameProp) {
            // Processing for both class and rt-class conveniently return strings that
            // represent JS expressions, each evaluating to a space-separated set of class names.
            // We can just join them with another space here.
            const existing = props[propKey] ? `${props[propKey]} + " " + ` : '';
            if (key === classSetAttr) {
                props[propKey] = existing + classSetTemplate({classSet: val});
            } else if (key === classAttr || key === reactSupport.classNameProp) {
                props[propKey] = existing + utils.convertText(node, context, val.trim());
            }
        } else if (!_.startsWith(key, 'rt-')) {
            props[propKey] = utils.convertText(node, context, val.trim());
        }
    });
    _.assign(props, generateTemplateProps(node, context));

    const propStr = _.map(props, (v, k) => `${JSON.stringify(k)} : ${v}`).join(',');
    return `{${propStr}}`;
}

function handleEventHandler(val, context, node, key) {
    const funcParts = val.split('=>');
    if (funcParts.length !== 2) {
        throw RTCodeError.build(context, node, `when using 'on' events, use lambda '(p1,p2)=>body' notation or use {} to return a callback function. error: [${key}='${val}']`);
    }
    const evtParams = funcParts[0].replace('(', '').replace(')', '').trim();
    const funcBody = funcParts[1].trim();
    let params = context.boundParams;
    if (evtParams.trim() !== '') {
        params = params.concat([evtParams.trim()]);
    }
    const generatedFuncName = generateInjectedFunc(context, key, funcBody, params);
    return genBind(generatedFuncName, context.boundParams);
}

function genBind(func, args) {
    const bindArgs = ['this'].concat(args);
    return `${func}.bind(${bindArgs.join(',')})`;
}

function handleStyleProp(val, node, context) {
    const styleStr = _(val)
        .split(';')
        .map(_.trim)
        .filter(i => _.includes(i, ':'))
        .map(i => {
            const pair = i.split(':');

            const value = pair.slice(1).join(':').trim();
            return _.camelCase(pair[0].trim()) + ' : ' + utils.convertText(node, context, value.trim());
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
    let isHtmlTag = _.includes(reactDOMSupport[context.options.targetVersion], tagName);
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
    const defaultDefines = {};
    defaultDefines[options.reactImportPath] = 'React';
    defaultDefines[options.lodashImportPath] = '_';
    return {
        boundParams: [],
        injectedFunctions: [],
        html,
        options,
        defines: options.defines ? _.clone(options.defines) : defaultDefines,
        reportContext
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
            const srcFile = node.attribs[includeSrcAttr];
            if (!srcFile) {
                throw RTCodeError.build(context, node, 'rt-include must supply a source attribute');
            }
            if (!context.options.readFileSync) {
                throw RTCodeError.build(context, node, 'rt-include needs a readFileSync polyfill on options');
            }
            try {
                context.html = context.options.readFileSync(srcFile);
            } catch (e) {
                console.error(e);
                throw RTCodeError.build(context, node, `rt-include failed to read file '${srcFile}'`);
            }
            return parseAndConvertHtmlToReact(context.html, context);
        }

        const data = {name: convertTagNameToConstructor(node.name, context)};

        // Order matters. We need to add the item and itemIndex to context.boundParams before
        // the rt-scope directive is processed, lest they are not passed to the child scopes
        if (node.attribs[repeatAttr]) {
            const arr = node.attribs[repeatAttr].split(' in ');
            if (arr.length !== 2) {
                throw RTCodeError.build(context, node, `rt-repeat invalid 'in' expression '${node.attribs[repeatAttr]}'`);
            }
            data.item = arr[0].trim();
            data.collection = arr[1].trim();
            validateJS(data.item, node, context);
            validateJS(`(${data.collection})`, node, context);
            stringUtils.addIfMissing(context.boundParams, data.item);
            stringUtils.addIfMissing(context.boundParams, `${data.item}Index`);
        }

        if (node.attribs[scopeAttr]) {
            handleScopeAttribute(node, context, data);
        }

        if (node.attribs[ifAttr]) {
            validateIfAttribute(node, context, data);
            data.condition = node.attribs[ifAttr].trim();
            if (!node.attribs.key) {
                _.set(node, ['attribs', 'key'], `${node.startIndex}`);
            }
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

        // provide a key to virtual node children if missing
        if (node.name === virtualNode && node.children.length > 1) {
            _(node.children)
                .reject('attribs.key')
                .forEach((child, i) => {
                    _.set(child, ['attribs', 'key'], `${node.startIndex}${i}`);
                });
        }

        const children = _.map(node.children, child => {
            const code = convertHtmlToReact(child, context);
            validateJS(code, child, context);
            return code;
        });

        data.children = utils.concatChildren(children);

        if (node.name === virtualNode) { //eslint-disable-line wix-editor/prefer-ternary
            data.body = `[${_.compact(children).join(',')}]`;
        } else {
            data.body = _.template(getTagTemplateString(!hasNonSimpleChildren(node), reactSupport.shouldUseCreateElement(context)))(data);
        }

        if (node.attribs[scopeAttr]) {
            const functionBody = _.values(data.innerScope.innerMapping).join('\n') + `return ${data.body}`;
            const generatedFuncName = generateInjectedFunc(context, 'scope' + data.innerScope.scopeName, functionBody, _.keys(data.innerScope.outerMapping));
            data.body = `${generatedFuncName}.apply(this, [${_.values(data.innerScope.outerMapping).join(',')}])`;
        }

        // Order matters here. Each rt-repeat iteration wraps over the rt-scope, so
        // the scope variables are evaluated in context of the current iteration.
        if (node.attribs[repeatAttr]) {
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + stringUtils.capitalize(data.item), 'return ' + data.body);
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
        return node.data.trim() ? utils.convertText(node, context, node.data) : '';
    }
}

function handleScopeAttribute(node, context, data) {
    data.innerScope = {
        scopeName: '',
        innerMapping: {},
        outerMapping: {}
    };

    data.innerScope.outerMapping = _.zipObject(context.boundParams, context.boundParams);

    _(node.attribs[scopeAttr]).split(';').invokeMap('trim').compact().forEach(scopePart => {
        const scopeSubParts = _(scopePart).split(' as ').invokeMap('trim').value();
        if (scopeSubParts.length < 2) {
            throw RTCodeError.build(context, node, `invalid scope part '${scopePart}'`);
        }
        const alias = scopeSubParts[1];
        const value = scopeSubParts[0];
        validateJS(alias, node, context);

        // this adds both parameters to the list of parameters passed further down
        // the scope chain, as well as variables that are locally bound before any
        // function call, as with the ones we generate for rt-scope.
        stringUtils.addIfMissing(context.boundParams, alias);

        data.innerScope.scopeName += stringUtils.capitalize(alias);
        data.innerScope.innerMapping[alias] = `var ${alias} = ${value};`;
        validateJS(data.innerScope.innerMapping[alias], node, context);
    });
}

function validateIfAttribute(node, context, data) {
    const innerMappingKeys = _.keys(data.innerScope && data.innerScope.innerMapping || {});
    let ifAttributeTree = null;
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
    return _.flatMap(nodes, node => {
        let externalNodes = [];
        node.children = handleSelfClosingHtmlTags(node.children);
        if (node.type === 'tag' && (_.includes(reactSupport.htmlSelfClosingTags, node.name) ||
            _.includes(reactTemplatesSelfClosingTags, node.name))) {
            externalNodes = _.filter(node.children, isTag);
            _.forEach(externalNodes, i => {i.parent = node;});
            node.children = _.reject(node.children, isTag);
        }
        return [node].concat(externalNodes);
    });
}

function convertTemplateToReact(html, options) {
    const context = require('./context');
    return convertRT(html, context, options);
}

function parseAndConvertHtmlToReact(html, context) {
    const rootNode = cheerio.load(html, {
        lowerCaseTags: false,
        lowerCaseAttributeNames: false,
        xmlMode: true,
        withStartIndices: true
    });
    utils.validate(context.options, context, context.reportContext, rootNode.root()[0]);
    let rootTags = _.filter(rootNode.root()[0].children, isTag);
    rootTags = handleSelfClosingHtmlTags(rootTags);
    if (!rootTags || rootTags.length === 0) {
        throw new RTCodeError('Document should have a root element');
    }
    let firstTag = null;
    _.forEach(rootTags, tag => {
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

    const context = defaultContext(html, options, reportContext);
    const body = parseAndConvertHtmlToReact(html, context);

    const requirePaths = _(context.defines)
        .keys()
        .map(def => `"${def}"`)
        .join(',');
    let buildImport;
    if (options.modules === 'typescript') {
        buildImport = (v, p) => `import ${v} = require('${p}');`;
    } else if (options.modules === 'es6') { // eslint-disable-line
        buildImport = (v, p) => `import ${v} from '${p}';`;
    } else {
        buildImport = (v, p) => `var ${v} = require('${p}');`;
    }
    const header = options.flow ? '/* @flow */\n' : '';
    const vars = header + _(context.defines).map(buildImport).join('\n');
    const data = {
        body,
        injectedFunctions: context.injectedFunctions.join('\n'),
        requireNames: _.values(context.defines).join(','),
        requirePaths,
        vars,
        name: options.name
    };
    let code = generate(data, options);
    if (options.modules !== 'typescript' && options.modules !== 'jsrt') {
        code = parseJS(code);
    }
    return code;
}

function parseJS(code) {
    try {
        let tree = esprima.parse(code, {range: true, tokens: true, comment: true, sourceType: 'module'});
        tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        return escodegen.generate(tree, {comment: true});
    } catch (e) {
        throw new RTCodeError(e.message, e.index, -1);
    }
}

function convertJSRTToJS(text, reportContext, options) {
    options = getOptions(options);
    options.modules = 'jsrt';
    const templateMatcherJSRT = /<template>([^]*?)<\/template>/gm;
    const code = text.replace(templateMatcherJSRT, (template, html) => convertRT(html, reportContext, options).replace(/;$/, ''));

    return parseJS(code);
}

function generate(data, options) {
    const template = templates[options.modules];
    return template(data);
}

module.exports = {
    convertTemplateToReact,
    convertRT,
    convertJSRTToJS,
    RTCodeError,
    normalizeName: utils.normalizeName
};

'use strict';
const cheerio = require('cheerio');
const _ = require('lodash');
const esprima = require('esprima');
const escodegen = require('escodegen');
const normalizeHtmlWhitespace = require('normalize-html-whitespace');
const reactDOMSupport = require('./reactDOMSupport');
const reactNativeSupport = require('./reactNativeSupport');
const reactPropTemplates = require('./reactPropTemplates');
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
const requireAttr = 'rt-require';
const importAttr = 'rt-import';
const statelessAttr = 'rt-stateless';
const preAttr = 'rt-pre';

const reactTemplatesSelfClosingTags = [includeNode];

/**
 * @param {Options} options
 * @return {Options}
 */
function getOptions(options) {
    options = options || {};
    const defaultOptions = {
        version: false,
        force: false,
        format: 'stylish',
        targetVersion: reactDOMSupport.default,
        lodashImportPath: 'lodash',
        native: false,
        nativeTargetVersion: reactNativeSupport.default
    };

    const finalOptions = _.defaults({}, options, defaultOptions);
    finalOptions.reactImportPath = reactImport(finalOptions);
    finalOptions.modules = finalOptions.modules || (finalOptions.native ? 'commonjs' : 'none');

    const defaultPropTemplates = finalOptions.native ?
        reactPropTemplates.native[finalOptions.nativeTargetVersion] :
        reactPropTemplates.dom[finalOptions.targetVersion];

    finalOptions.propTemplates = _.defaults({}, options.propTemplates, defaultPropTemplates);
    return finalOptions;
}

function reactImport(options) {
    if (options.native) {        
        return reactNativeSupport[options.nativeTargetVersion].react.module;
    }
    if (_.includes(['0.14.0', '0.15.0', '15.0.0', '15.0.1'], options.targetVersion)) {
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
                if (_.filter(child.children, {type: 'tag'}).length !== 1) {
                    throw RTCodeError.build(context, child, "'rt-template' should have a single non-text element as direct child");
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
            const key = pair[0].trim();
            if (/\{|\}/g.test(key)) {
                throw RTCodeError.build(context, node, 'style attribute keys cannot contain { } expressions');
            }
            const value = pair.slice(1).join(':').trim();
            const parsedKey = /(^-moz-)|(^-o-)|(^-webkit-)/ig.test(key) ? _.upperFirst(_.camelCase(key)) : _.camelCase(key);
            return parsedKey + ' : ' + utils.convertText(node, context, value.trim());
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
        const targetSupport = reactNativeSupport[context.options.nativeTargetVersion];
        return _.includes(targetSupport.components, tagName) ? `${targetSupport.reactNative.name}.${tagName}` : tagName;
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
    const defaultDefines = [
        {moduleName: options.reactImportPath, alias: 'React', member: '*'},
        {moduleName: options.lodashImportPath, alias: '_', member: '*'}
    ];
    if (options.native) {
        const targetSupport = reactNativeSupport[options.nativeTargetVersion];
        if (targetSupport.reactNative.module !== targetSupport.react.module) {
            defaultDefines.splice(0, 0, {moduleName: targetSupport.reactNative.module, alias: targetSupport.reactNative.name, member: '*'});
        }
    }
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
 * Trims a string the same way as String.prototype.trim(), but preserving all non breaking spaces ('\xA0') 
 * @param {string} text
 * @return {string}
 */
function trimHtmlText(text) {
    return text.replace(/^[ \f\n\r\t\v\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+|[ \f\n\r\t\v\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+$/g, '');
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

        if (node.type === 'tag' && node.name === importAttr) {
            throw RTCodeError.build(context, node, "'rt-import' must be a toplevel node");
        }

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
            const repeaterParams = arr[0].split(',').map(s => s.trim());
            data.item = repeaterParams[0];
            data.index = repeaterParams[1] || `${data.item}Index`;
            data.collection = arr[1].trim();
            const bindParams = [data.item, data.index];
            _.forEach(bindParams, param => {
                validateJS(param, node, context);
            });
            validateJS(`(${data.collection})`, node, context);
            _.forEach(bindParams, param => {
                if (!_.includes(context.boundParams, param)) {
                    context.boundParams.push(param);
                }
            });
        }

        if (node.attribs[scopeAttr]) {
            handleScopeAttribute(node, context, data);
        }

        if (node.attribs[ifAttr]) {
            validateIfAttribute(node, context, data);
            data.condition = node.attribs[ifAttr].trim();
            if (!node.attribs.key && node.name !== virtualNode) {
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
        
        if (node.name === virtualNode) {                                    
            const invalidAttributes = _.without(_.keys(node.attribs), scopeAttr, ifAttr, repeatAttr);            
            if (invalidAttributes.length > 0) {                                
                throw RTCodeError.build(context, node, "<rt-virtual> may not contain attributes other than 'rt-scope', 'rt-if' and 'rt-repeat'");
            }

            // provide a key to virtual node children if missing
            if (node.children.length > 1) {
                _(node.children)
                    .reject('attribs.key')
                    .forEach((child, i) => {                        
                        if (child.type === 'tag' && child.name !== virtualNode) {                            
                            _.set(child, ['attribs', 'key'], `${node.startIndex}${i}`);
                        }
                    });
            }
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
            data.repeatFunction = generateInjectedFunc(context, 'repeat' + _.upperFirst(data.item), 'return ' + data.body);
            data.repeatBinds = ['this'].concat(_.reject(context.boundParams, p => p === data.item || p === data.index || data.innerScope && p in data.innerScope.innerMapping));
            data.body = repeatTemplate(data);
        }
        if (node.attribs[ifAttr]) {
            data.body = ifTemplate(data);
        }
        return data.body;
    } else if (node.type === 'comment') {
        const sanitizedComment = node.data.split('*/').join('* /');
        return commentTemplate({data: sanitizedComment});
    } else if (node.type === 'text') {
        let text = node.data;
        const parentNode = node.parent;
        if (parentNode !== undefined) {
            const preserveWhitespaces = parentNode.name === 'pre' || parentNode.name === 'textarea' || _.has(parentNode.attribs, preAttr);
            if (context.options.normalizeHtmlWhitespace && !preserveWhitespaces) {
                text = normalizeHtmlWhitespace(text);
            }
        }        
        return trimHtmlText(text) ? utils.convertText(node, context, text) : '';        
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
        if (!_.includes(context.boundParams, alias)) {
            context.boundParams.push(alias);
        }

        data.innerScope.scopeName += _.upperFirst(alias);
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

function handleSelfClosingHtmlTags(nodes) {
    return _.flatMap(nodes, node => {
        let externalNodes = [];
        node.children = handleSelfClosingHtmlTags(node.children);
        if (node.type === 'tag' && (_.includes(reactSupport.htmlSelfClosingTags, node.name) ||
            _.includes(reactTemplatesSelfClosingTags, node.name))) {
            externalNodes = _.filter(node.children, {type: 'tag'});
            _.forEach(externalNodes, i => {i.parent = node;});
            node.children = _.reject(node.children, {type: 'tag'});
        }
        return [node].concat(externalNodes);
    });
}

function handleRequire(tag, context) {
    let moduleName;
    let alias;
    let member;
    if (tag.children.length) {
        throw RTCodeError.build(context, tag, `'${requireAttr}' may have no children`);
    } else if (tag.attribs.dependency && tag.attribs.as) {
        moduleName = tag.attribs.dependency;
        member = '*';
        alias = tag.attribs.as;
    }
    if (!moduleName) {
        throw RTCodeError.build(context, tag, `'${requireAttr}' needs 'dependency' and 'as' attributes`);
    }
    context.defines.push({moduleName, member, alias});
}

function handleImport(tag, context) {
    let moduleName;
    let alias;
    let member;
    if (tag.children.length) {
        throw RTCodeError.build(context, tag, `'${importAttr}' may have no children`);
    } else if (tag.attribs.name && tag.attribs.from) {
        moduleName = tag.attribs.from;
        member = tag.attribs.name;
        alias = tag.attribs.as;
        if (!alias) {
            if (member === '*') {
                throw RTCodeError.build(context, tag, "'*' imports must have an 'as' attribute");
            } else if (member === 'default') {
                throw RTCodeError.build(context, tag, "default imports must have an 'as' attribute");
            }
            alias = member;
        }
    }
    if (!moduleName) {
        throw RTCodeError.build(context, tag, `'${importAttr}' needs 'name' and 'from' attributes`);
    }
    context.defines.push({moduleName, member, alias});
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
    let rootTags = _.filter(rootNode.root()[0].children, {type: 'tag'});
    rootTags = handleSelfClosingHtmlTags(rootTags);
    if (!rootTags || rootTags.length === 0) {
        throw new RTCodeError('Document should have a root element');
    }
    let firstTag = null;
    _.forEach(rootTags, tag => {
        if (tag.name === requireAttr) {
            handleRequire(tag, context);
        } else if (tag.name === importAttr) {
            handleImport(tag, context);
        } else if (firstTag === null) {
            firstTag = tag;
            if (_.hasIn(tag, ['attribs', statelessAttr])) {
                context.stateless = true;
            }
        } else {
            throw RTCodeError.build(context, tag, 'Document should have no more than a single root element');
        }
    });
    if (firstTag === null) {
        throw RTCodeError.build(context, rootNode.root()[0], 'Document should have a single root element');
    } else if (firstTag.name === virtualNode) {
        throw RTCodeError.build(context, firstTag, `Document should not have <${virtualNode}> as root element`);
    } else if (_.includes(_.keys(firstTag.attribs), repeatAttr)) {
        throw RTCodeError.build(context, firstTag, "root element may not have a 'rt-repeat' attribute");
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
    const injectedFunctions = context.injectedFunctions.join('\n');
    const statelessParams = context.stateless ? 'props, context' : '';
    const renderFunction = `function(${statelessParams}) { ${injectedFunctions}return ${body} }`;

    const requirePaths = _.map(context.defines, d => `"${d.moduleName}"`).join(',');
    const requireNames = _.map(context.defines, d => `${d.alias}`).join(',');
    const AMDArguments = _.map(context.defines, (d, i) => (d.member === '*' ? `${d.alias}` : `$${i}`)).join(','); //eslint-disable-line
    const AMDSubstitutions = _.map(context.defines, (d, i) => (d.member === '*' ? null : `var ${d.alias} = $${i}.${d.member};`)).join('\n'); //eslint-disable-line
    const buildImport = reactSupport.buildImport[options.modules] || reactSupport.buildImport.commonjs;
    const requires = _.map(context.defines, buildImport).join('\n');
    const header = options.flow ? '/* @flow */\n' : '';
    const vars = header + requires;
    const data = {
        renderFunction,
        requireNames,
        requirePaths,
        AMDArguments,
        AMDSubstitutions,
        vars,
        name: options.name
    };
    let code = templates[options.modules](data);
    if (options.modules !== 'typescript' && options.modules !== 'jsrt') {
        code = parseJS(code, options);
    }
    return code;
}

function parseJS(code, options) {
    try {
        let tree = esprima.parse(code, {range: true, tokens: true, comment: true, sourceType: 'module'});
        // fix for https://github.com/wix/react-templates/issues/157
        // do not include comments for es6 modules due to bug in dependency "escodegen"
        // to be removed when https://github.com/estools/escodegen/issues/263 will be fixed
        // remove also its test case "test/data/comment.rt.es6.js"
        if (options.modules !== 'es6') {
            tree = escodegen.attachComments(tree, tree.comments, tree.tokens);
        }
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

    return parseJS(code, options);
}

module.exports = {
    convertTemplateToReact,
    convertRT,
    convertJSRTToJS,
    RTCodeError,
    normalizeName: utils.normalizeName
};

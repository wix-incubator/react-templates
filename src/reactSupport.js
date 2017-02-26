'use strict';
const _ = require('lodash');

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

const reactSupportedAttributes = ['accept', 'acceptCharset', 'accessKey', 'action', 'allowFullScreen', 'allowTransparency', 'alt', 'async', 'autoComplete', 'autoPlay', 'cellPadding', 'cellSpacing', 'charSet', 'checked',
    'classID', 'className', 'cols', 'colSpan', 'content', 'contentEditable', 'contextMenu', 'controls', 'coords', 'crossOrigin', 'data', 'dateTime', 'defer', 'dir', 'disabled', 'download',
    'draggable', 'encType', 'form', 'formNoValidate', 'frameBorder', 'height', 'hidden', 'href', 'hrefLang', 'htmlFor', 'httpEquiv', 'icon', 'id', 'label', 'lang', 'list', 'loop', 'manifest',
    'max', 'maxLength', 'media', 'mediaGroup', 'method', 'min', 'multiple', 'muted', 'name', 'noValidate', 'open', 'pattern', 'placeholder', 'poster', 'preload', 'radioGroup', 'readOnly', 'rel',
    'required', 'role', 'rows', 'rowSpan', 'sandbox', 'scope', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet', 'start', 'step',
    'style', 'tabIndex', 'target', 'title', 'type', 'useMap', 'value', 'width', 'wmode'];
const classNameProp = 'className';
const attributesMapping = {'class': classNameProp, 'rt-class': classNameProp, 'for': 'htmlFor'}; //eslint-disable-line quote-props

_.forEach(reactSupportedAttributes, attributeReactName => {
    if (attributeReactName !== attributeReactName.toLowerCase()) {
        attributesMapping[attributeReactName.toLowerCase()] = attributeReactName;
    }
});

const htmlSelfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

const templateAMDTemplate = _.template("define(<%= name ? '\"'+name + '\", ' : '' %>[<%= requirePaths %>], function (<%= AMDArguments %>) {\n'use strict';\n<%= AMDSubstitutions %>return <%= renderFunction %>;\n});");
const templateCommonJSTemplate = _.template("'use strict';\n<%= vars %>\nmodule.exports = <%= renderFunction %>;\n");
const templateES6Template = _.template('<%= vars %>\nexport default <%= renderFunction %>\n');
const templatePJSTemplate = _.template('var <%= name %> = <%= renderFunction %>');
const templateTypescriptTemplate = _.template('<%= vars %>\nexport default <%= renderFunction %>;\n');
const templateJSRTTemplate = _.template('<%= renderFunction %>');

const templates = {
    amd: templateAMDTemplate,
    commonjs: templateCommonJSTemplate,
    typescript: templateTypescriptTemplate,
    es6: templateES6Template,
    none: templatePJSTemplate,
    jsrt: templateJSRTTemplate
};

const isImportAsterisk = _.matches({member: '*'});
const defaultCase = _.constant(true);

const buildImportTypeScript = _.cond([
    [isImportAsterisk, d => `'import * as ' ${d.alias} from ' ${d.moduleName};`],
    [_.matches({member: 'default'}), d => `import ${d.alias} from '${d.moduleName}';`],
    [defaultCase, d => `import { ${d.member} as ${d.alias} } from '${d.moduleName}';`]
]);

const buildImportES6 = _.cond([
    [isImportAsterisk, d => `import * as ${d.alias} from '${d.moduleName}';`],
    [_.matches({member: 'default'}), d => `import ${d.alias} from '${d.moduleName}';`],
    [defaultCase, d => `import { ${d.member} as ${d.alias} } from '${d.moduleName}';`]
]);

const buildImportCommonJS = _.cond([
    [isImportAsterisk, d => `var ${d.alias} = require('${d.moduleName}');`],
    [defaultCase, d => `var ${d.alias} = require('${d.moduleName}').${d.member};`]
]);

const buildImport = {
    typescript: buildImportTypeScript,
    es6: buildImportES6,
    commonjs: buildImportCommonJS,
    amd: buildImportCommonJS,
    none: buildImportCommonJS,
    jsrt: buildImportCommonJS
};

module.exports = {
    htmlSelfClosingTags,
    attributesMapping,
    classNameProp,
    shouldUseCreateElement,
    templates,
    buildImport
};

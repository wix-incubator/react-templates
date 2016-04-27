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

_.forEach(reactSupportedAttributes, function (attributeReactName) {
    if (attributeReactName !== attributeReactName.toLowerCase()) {
        attributesMapping[attributeReactName.toLowerCase()] = attributeReactName;
    }
});

const htmlSelfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];


const templateAMDTemplate = _.template("define(<%= name ? '\"'+name + '\", ' : '' %>[<%= requirePaths %>], function (<%= requireNames %>) {\n'use strict';\n <%= injectedFunctions %>\nreturn function(){ return <%= body %>};\n});");
const templateCommonJSTemplate = _.template("'use strict';\n<%= vars %>\n\n<%= injectedFunctions %>\nmodule.exports = function(){ return <%= body %>};\n");
const templateES6Template = _.template('<%= vars %>\n\n<%= injectedFunctions %>\nexport default function(){ return <%= body %>}\n');
const templatePJSTemplate = _.template(`var <%= name %> = function () {
<%= injectedFunctions %>
return <%= body %>
};
`);
const templateTypescriptTemplate = _.template('<%= vars %>\n\n<%= injectedFunctions %>\nvar fn = function() { return <%= body %> };\nexport = fn\n');
const templateJSRTTemplate = _.template('(function () {\n <%= injectedFunctions %>\n return function(){\nreturn <%= body %>}}\n)()');

const templates = {
    amd: templateAMDTemplate,
    commonjs: templateCommonJSTemplate,
    typescript: templateTypescriptTemplate,
    es6: templateES6Template,
    none: templatePJSTemplate,
    jsrt: templateJSRTTemplate
};

module.exports = {
    htmlSelfClosingTags,
    attributesMapping,
    classNameProp,
    shouldUseCreateElement,
    templates
};

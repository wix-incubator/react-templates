define([
    'react',
    'lodash'
], function (React, _) {
    function generated1() {
        this.props.controller.onQueryItemClicked(entry);
    }
    function generated2() {
        this.props.controller.onTreeItemClicked(entry, node);
    }
    function generated3() {
        this.props.controller.onTreeItemClicked(entry, child);
    }
    function generated4() {
        this.openAddItem(typeInfo.collectionId, typeInfo.typeName);
    }
    return React.DOM.div.apply(this, _.flatten([{ 'className': 'nav' }].concat([React.DOM.div.apply(this, _.flatten([{ 'jsx-repeat': 'category in this.props.model.nav' }].concat([
            React.DOM.div.apply(this, _.flatten([{ 'className': 'category-title' }].concat([category.name]))),
            React.DOM.div.apply(this, _.flatten([{ 'className': 'category-entries' }].concat([React.DOM.div.apply(this, _.flatten([{ 'jsx-if': 'category.items.length > 0' }].concat([React.DOM.div.apply(this, _.flatten([{ 'jsx-repeat': 'entry in category.items' }].concat([
                        React.DOM.div.apply(this, _.flatten([{
                                'jsx-if': 'entry.type == \'query\'',
                                'className': this.cs({
                                    selected: entry.name == this.props.model.selected.name,
                                    navlink: true
                                }),
                                'onClick': generated1.bind(this)
                            }].concat([entry.name]))),
                        React.DOM.div.apply(this, _.flatten([{ 'jsx-if': 'entry.type == \'tree\'' }].concat([React.DOM.ul.apply(this, _.flatten([{}].concat([React.DOM.li.apply(this, _.flatten([{ 'jsx-repeat': 'node in entry.model' }].concat([
                                    React.DOM.div.apply(this, _.flatten([{
                                            'onClick': generated2.bind(this),
                                            'className': this.cs({
                                                selected: this.isNodeSelected(entry, node),
                                                treelink1: true
                                            })
                                        }].concat([node.title]))),
                                    React.DOM.ul.apply(this, _.flatten([{ 'jsx-if': 'node.children.length > 0' }].concat([React.DOM.li.apply(this, _.flatten([{
                                                'jsx-repeat': 'child in node.children',
                                                'onClick': generated3.bind(this)
                                            }].concat([React.DOM.div.apply(this, _.flatten([{
                                                    'className': this.cs({
                                                        selected: this.isNodeSelected(entry, child),
                                                        treelink2: true
                                                    })
                                                }].concat([child.title])))])))])))
                                ])))])))])))
                    ])))])))]))),
            React.DOM.button.apply(this, _.flatten([{
                    'className': 'new-item-btn',
                    'jsx-repeat': 'typeInfo in category.newTypes',
                    'onClick': generated4.bind(this)
                }].concat([React.DOM.span.apply(this, _.flatten([{}].concat(['Add ' + typeInfo.friendlyName])))])))
        ])))])));
});
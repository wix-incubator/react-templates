'use strict'
const map = {
    /*flex*/
    alignItems: 'string', //  "enum('flex-start', 'flex-end', 'center', 'stretch')",
    alignSelf: 'string', //  "enum('auto', 'flex-start', 'flex-end', 'center', 'stretch')",
    borderBottomWidth: 'number',
    borderLeftWidth: 'number',
    borderRightWidth: 'number',
    borderTopWidth: 'number',
    borderWidth: 'number',
    bottom: 'number',
    flex: 'number',
    flexDirection: 'string', // enum('row', 'column')
    flexWrap: 'string', //  enum('wrap', 'nowrap')
    height: 'number',
    justifyContent: 'string', //  enum('flex-start', 'flex-end', 'center', 'space-between', 'space-around')
    left: 'number',
    margin: 'number',
    marginBottom: 'number',
    marginHorizontal: 'number',
    marginLeft: 'number',
    marginRight: 'number',
    marginTop: 'number',
    marginVertical: 'number',
    padding: 'number',
    paddingBottom: 'number',
    paddingHorizontal: 'number',
    paddingLeft: 'number',
    paddingRight: 'number',
    paddingTop: 'number',
    paddingVertical: 'number',
    position: 'string', //  enum('absolute', 'relative')
    right: 'number',
    top: 'number',
    width: 'number',

    /*image*/
    resizeMode: 'string', // Object.keys(ImageResizeMode)
    backgroundColor: 'string',
    borderColor: 'string',
    borderRadius: 'number',
    overflow: 'string', // enum('visible', 'hidden')
    tintColor: 'string',
    opacity: 'number'
}

module.exports = map

'use strict'

const ver0_9_0 = ['ActivityIndicatorIOS', 'DatePickerIOS', 'Image', 'ListView', 'MapView', 'Navigator', 'NavigatorIOS', 'PickerIOS', 'ScrollView', 'SliderIOS', 'SwitchIOS', 'TabBarIOS', 'Text', 'TextInput', 'TouchableHighlight', 'TouchableOpacity', 'TouchableWithoutFeedback', 'View', 'WebView']

const versions = {
    '0.9.0': {
        react: {name: 'React', module: 'react-native'},
        reactNative: {name: 'React', module: 'react-native'},
        components: ver0_9_0
    },
    '0.29.0': {
        react: {name: 'React', module: 'react'},
        reactNative: {name: 'ReactNative', module: 'react-native'},
        components: ver0_9_0
    },
    default: '0.9.0'
}

module.exports = versions

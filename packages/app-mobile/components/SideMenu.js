'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { connect } = require('react-redux');
const SideMenu_ = require('react-native-side-menu-updated').default;
const react_native_1 = require('react-native');
class SideMenuComponent extends SideMenu_ {
	onLayoutChange(e) {
		const { width, height } = e.nativeEvent.layout;
		const openMenuOffsetPercentage = this.props.openMenuOffset / react_native_1.Dimensions.get('window').width;
		const openMenuOffset = width * openMenuOffsetPercentage;
		const hiddenMenuOffset = width * this.state.hiddenMenuOffsetPercentage;
		this.setState({ width, height, openMenuOffset, hiddenMenuOffset });
	}
}
const SideMenu = connect((state) => {
	return {
		isOpen: state.showSideMenu,
	};
})(SideMenuComponent);
exports.default = SideMenu;
// # sourceMappingURL=SideMenu.js.map

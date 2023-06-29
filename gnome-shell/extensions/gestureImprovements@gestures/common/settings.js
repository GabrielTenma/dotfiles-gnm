// define enum
/* exported PinchGestureType, OverviewNavigationState, ForwardBackKeyBinds */
var PinchGestureType;
(function (PinchGestureType) {
	PinchGestureType[PinchGestureType['NONE'] = 0] = 'NONE';
	PinchGestureType[PinchGestureType['SHOW_DESKTOP'] = 1] = 'SHOW_DESKTOP';
	PinchGestureType[PinchGestureType['CLOSE_WINDOW'] = 2] = 'CLOSE_WINDOW';
	PinchGestureType[PinchGestureType['CLOSE_DOCUMENT'] = 3] = 'CLOSE_DOCUMENT';
})(PinchGestureType || (PinchGestureType = {}));

// define enum
var OverviewNavigationState;
(function (OverviewNavigationState) {
	OverviewNavigationState[OverviewNavigationState['CYCLIC'] = 0] = 'CYCLIC';
	OverviewNavigationState[OverviewNavigationState['GNOME'] = 1] = 'GNOME';
	OverviewNavigationState[OverviewNavigationState['WINDOW_PICKER_ONLY'] = 2] = 'WINDOW_PICKER_ONLY';
})(OverviewNavigationState || (OverviewNavigationState = {}));

var ForwardBackKeyBinds;
(function (ForwardBackKeyBinds) {
	ForwardBackKeyBinds[ForwardBackKeyBinds['Default'] = 0] = 'Default';
	ForwardBackKeyBinds[ForwardBackKeyBinds['Forward/Backward'] = 1] = 'Forward/Backward';
	ForwardBackKeyBinds[ForwardBackKeyBinds['Page Up/Down'] = 2] = 'Page Up/Down';
	ForwardBackKeyBinds[ForwardBackKeyBinds['Right/Left'] = 3] = 'Right/Left';
	ForwardBackKeyBinds[ForwardBackKeyBinds['Audio Next/Prev'] = 4] = 'Audio Next/Prev';
	ForwardBackKeyBinds[ForwardBackKeyBinds['Tab Next/Prev'] = 5] = 'Tab Next/Prev';
})(ForwardBackKeyBinds || (ForwardBackKeyBinds = {}));

exports.SelectorButtonClicked = function (name) {
	let wiComboviewCtrl = this.wiComboview;
	wiComboviewCtrl.useSelector(name);
}


exports.EraserButtonClicked = function (name) {
	let wiComboviewCtrl = this.wiComboview;
	wiComboviewCtrl.useEraser(name);
}

exports.EditToolComboboxButtonClicked = function () {
	let wiComboviewCtrl = this.wiComboview;
	wiComboviewCtrl.editTool();
}

exports.CombinedPlotPropertiesButtonClicked = function () {
	console.log('CombinedPlotPropertiesButtonClicked');
	let wiComboviewCtrl = this.wiComboview;
	let wiD3Ctrl = wiComboviewCtrl.getwiD3Ctrl();
	wiD3Ctrl.configCombinedPlotProperties();
}
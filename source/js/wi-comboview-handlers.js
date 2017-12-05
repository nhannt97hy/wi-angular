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

exports.AddLogplotButtonClicked = function () {
	console.log('AddLogplotButtonClicked');
	let wiComboviewCtrl = this.wiComboview;
	let wiD3Ctrl = wiComboviewCtrl.getwiD3Ctrl();
	wiD3Ctrl.addLogplot();
}

exports.AddHistogramButtonClicked = function () {
	console.log('AddHistogramButtonClicked');
	let wiComboviewCtrl = this.wiComboview;
	let wiD3Ctrl = wiComboviewCtrl.getwiD3Ctrl();
	wiD3Ctrl.addHistogram();
}

exports.AddCrossplotButtonClicked = function () {
	console.log('AddCrossplotButtonClicked');
	let wiComboviewCtrl = this.wiComboview;
	let wiD3Ctrl = wiComboviewCtrl.getwiD3Ctrl();
	wiD3Ctrl.addCrossplot();
}
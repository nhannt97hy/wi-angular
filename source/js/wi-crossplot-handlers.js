exports.SaveFormatButtonClicked = function() {
    console.log('SaveFormatButton is clicked');
}

exports.PrintButtonClicked = function() {
    console.log('PrintButton is clicked');
}

exports.EditFormatButtonClicked = function() {
    this.wiCrossplot.getWiD3CrossplotCtrl().propertiesDialog();
}

exports.ActiveZoneButtonClicked = function() {
    console.log('ActiveZoneButton is clicked');
}

exports.FrequencyInfoButtonClicked = function() {
    console.log('FrequencyInfoButton is clicked');
}

exports.DefaultZoomButtonClicked = function() {
    console.log('DefaultZoomButton is clicked');
}

exports.ZoomInButtonClicked = function() {
    console.log('ZoomInButton is clicked');
}

exports.ZoomOutButtonClicked = function() {
    console.log('ZoomOutButton is clicked');
}

exports.ZAxesButtonClicked = function() {
    console.log('ZAxesButton is clicked');
}

exports.OverlayButtonClicked = function() {
    console.log('OverlayButton is clicked');
}

exports.CreatePolygonButtonClicked = function() {
    console.log('CreatePolygonButton is clicked');
}

exports.CreateRectangleButtonClicked = function() {
    console.log('CreateRectangleButton is clicked');
}

exports.DeleteAreaButtonClicked = function() {
    console.log('DeleteAreaButton is clicked');
}

exports.CreateUserLineButtonClicked = function() {
    console.log('CreateUserLineButton is clicked');
}

exports.DeleteUserLineButtonClicked = function() {
    console.log('DeleteUserLineButton is clicked');
}

exports.UserDefineLineButtonClicked = function() {
    console.log('UserDefineLineButton is clicked');
}

exports.PolygonManagerButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.polygonManagerDialog(this.ModalService, wiD3Crossplot, function () {});
}

exports.RegressionLineButtonClicked = function() {
    console.log('RegressionLineButton is clicked');
}

exports.ConfigTernaryDiagramButtonClicked = function() {
    console.log('ConfigTernaryDiagramButton is clicked');
}


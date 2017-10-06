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
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    wiD3Crossplot.drawAreaPolygon();
}

exports.CreateRectangleButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    wiD3Crossplot.drawAreaRectangle();
}

exports.DeleteAreaButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    wiD3Crossplot.deleteArea();
}

exports.CreateUserLineButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    wiD3Crossplot.drawUserLine();
}

exports.DeleteUserLineButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    wiD3Crossplot.deleteUserLine();
}

exports.UserDefineLineButtonClicked = function() {

}

exports.PolygonManagerButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.polygonManagerDialog(this.ModalService, wiD3Crossplot, function () {});
}

exports.RegressionLineButtonClicked = function() {
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.regressionLineDialog(this.ModalService, wiD3Crossplot, function () {});
}

exports.ConfigTernaryDiagramButtonClicked = function() {
    console.log('ConfigTernaryDiagramButton is clicked');
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.ternaryDialog(this.ModalService, wiD3Crossplot, function () {});
}


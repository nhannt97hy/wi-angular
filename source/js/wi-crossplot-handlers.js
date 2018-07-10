exports.SaveFormatButtonClicked = function() {
    console.log('SaveFormatButton is clicked');
    let wiComponentService = this.wiComponentService;
    let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let ModalService = this.ModalService;
    let crossplotD3Ctrl = this.wiCrossplot.getWiD3CrossplotCtrl();
    crossplotD3Ctrl.saveCrossplotNow(function () {
        dialogUtils.warningMessageDialog(ModalService, 'Crossplot is saved');
    });
}

exports.PrintButtonClicked = function() {
    console.log('PrintButton is clicked');
    let self = this;
    let wiComponentService = this.wiComponentService;
    let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let ModalService = this.ModalService;
    let setting = this.wiCrossplot.getWiD3CrossplotCtrl().config.print;
    if (!setting) return;
    if (!setting.size.width || !setting.size.height) return;
    let wiCrossplotArea = d3.select(`wi-crossplot[name=${self.wiCrossplot.name}]`);
    let wiD3CrossplotArea = wiCrossplotArea.select('wi-d3-crossplot')
        .classed('printArea', true);
    let footer = wiD3CrossplotArea.select('.vi-crossplot-footer-container')
        .classed('resizedPane', true);
    let body = d3.select('body');
    let printStyle = body.append('style');
    let paperWidth = setting.orientation == 'Portrait' ? 210 : 297;
    let html = `
        .printArea {
            position: fixed;
            top: 0;
            left: 0;
            width: ${setting.size.width/paperWidth*100}% !important;
            height: ${setting.size.height + 5.5}mm !important;
            z-index: 100;
            background: white;
            margin: 0 !important;
            padding: 0 !important;
            // border: 1px solid red;
        }
        .resizedPane {
            position: fixed;
            top: ${setting.size.height}mm !important;
            left: 0;
            height: auto !important;
            width: ${setting.size.width/paperWidth*100}% !important;
            z-index: 100;
            background: white;
            margin: 0 !important;
            padding: 0 !important;
            // border: 1px solid green;
        }
    `;
    printStyle.html(html);
    wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    let printImg;
    setTimeout(() => {
        domtoimage.toPng(wiD3CrossplotArea.node())
            .then((dataUrl) => {
                printImg = new Image();
                printImg.src = dataUrl;
                d3.select(printImg).classed('printImg', true);
                html += `
                    body * {
                        visibility: hidden !important;
                        margin: 0;
                        padding: 0;
                    }
                    .printImg {
                        position: fixed;
                        top: 0;
                        left: 0;
                        margin: 0;
                        padding: 0;
                        z-index: 1000;
                        visibility: visible !important;
                    }
                    @media print {
                        @page {
                            // size: ${setting.size.width}mm;
                            // margin: 0;
                            // padding: 0;
                            size: A4 ${setting.orientation};
                        }
                        body * {
                            visibility: hidden !important;
                            margin: 0;
                            padding: 0;
                        }
                        .printImg {
                            visibility: visible !important;
                            margin: 0;
                            padding: 0;
                        }
                    }
                `;
                printStyle.html(html);
                document.body.appendChild(printImg);
                setTimeout(() => {
                    window.print();
                }, 500);
            })
            .catch((err) => {
                console.error(err);
            })
    }, 1000);
    window.onafterprint = function () {
        printStyle.remove();
        if (printImg) document.body.removeChild(printImg);
        wiD3CrossplotArea.classed('printArea', false);
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    }
}

exports.EditFormatButtonClicked = function() {
    this.wiCrossplot.getWiD3CrossplotCtrl().propertiesDialog();
}

exports.ActiveZoneButtonClicked = function() {
    console.log('ActiveZoneButton is clicked');
    this.wiCrossplot.getWiD3CrossplotCtrl().switchReferenceZone();
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
    let wiComponentService = this.wiComponentService;
    let wiD3Crossplot = this.wiCrossplot.getWiD3CrossplotCtrl();
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    DialogUtils.userDefineLineDialog(this.ModalService, wiD3Crossplot, function () {});
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
    DialogUtils.ternaryDialog(this.ModalService, wiComponentService, wiD3Crossplot, function () {});
}

exports.ZoneButtonClicked = function() {
    this.wiCrossplot.getWiD3CrossplotCtrl().switchDepthType();
}

exports.CurveButtonClicked = function() {
    this.wiCrossplot.getWiD3CrossplotCtrl().switchDepthType();
}

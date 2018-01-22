let initModal;
function curvePropertiesDialog (ModalService, wiComponentService, wiApiService, DialogUtils, currentCurve, currentTrack, wiLogplotCtrl, callback) {
    let thisModalController = null;

    function ModalController($scope, close, $timeout) {
        let error = null;
        let self = this;
        window.cProps = this;
        console.log("currentCurve", currentCurve);
        wiApiService.curveInfo
        thisModalController = this;
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.well = utils.findWellByLogplot(wiLogplotCtrl.id);
        let dataset = utils.getModel('dataset', currentCurve.idDataset);

        console.log("CURRENTCURVE", currentCurve, currentTrack);

        let extentY = currentCurve.getExtentY();

        if (currentCurve.line && (currentCurve.dislayMode == 'Line' || currentCurve.dislayMode == 'Both')) {
            this.lineOptions = {
                display: true,
                lineStyle: {
                    lineColor: currentCurve.line.color,
                    lineWidth: currentCurve.line.width,
                    lineStyle: currentCurve.line.dash
                }
            }
        } else {
            this.lineOptions = {
                display: false,
                lineStyle: {
                    lineColor: currentCurve.line ? currentCurve.line.color : 'blue',
                    lineWidth: currentCurve.line ? currentCurve.line.width : 1,
                    lineStyle: currentCurve.line ? currentCurve.line.dash : [0]
                }
            }
        }
        if (currentCurve.symbol && (currentCurve.dislayMode == 'Symbol' || currentCurve.dislayMode == 'Both')) {
            this.symbolOptions = {
                display: true,
                symbolStyle: {
                    symbolName: currentCurve.symbol.style, // cross, diamond, star, triangle, dot, plus
                    symbolSize: currentCurve.symbol.size,
                    symbolStrokeStyle: currentCurve.symbol.strokeStyle,
                    symbolFillStyle: currentCurve.symbol.fillStyle,
                    symbolLineWidth: currentCurve.symbol.lineWidth,
                    symbolLineDash: currentCurve.symbol.lineDash
                }
            }
        } else {
            this.symbolOptions = {
                display: false,
                symbolStyle: {
                    symbolName: currentCurve.symbol ? currentCurve.symbol.style : 'circle', // cross, diamond, star, triangle, dot, plus
                    symbolSize: currentCurve.symbol ? currentCurve.symbol.size : 5,
                    symbolStrokeStyle: currentCurve.symbol ? currentCurve.symbol.strokeStyle : 'blue',
                    symbolFillStyle: currentCurve.symbol ? currentCurve.symbol.fillStyle : 'blue',
                    symbolLineWidth: currentCurve.symbol ? currentCurve.symbol.lineWidth : 1,
                    symbolLineDash: currentCurve.symbol ? currentCurve.symbol.lineDash : [10, 0]
                }
            }
        }
        this.lineObjTemplate = {
            minDepth: extentY[0],
            maxDepth: extentY[1],
            name: dataset.properties.name + "." + currentCurve.name
        }

        this.curveOptions = utils.curveOptions(currentTrack, currentCurve);
        console.log("CURVEOPTONS", this.curveOptions);
        this.onToggleShowDataset = function () {
            self.curveOptions.alias = self.curveOptions.showDataset ? self.lineObjTemplate.name : currentCurve.name;
        }

        this.drawSample = function () {
            displayLine(self.lineOptions, self.symbolOptions);
        }
        this.selectData = {
            displayMode: ["Line", "Symbol", "Both", "None"],
            wrapMode: ["None", "Left", "Right", "Both"],
            symbolType: ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"],
            blockPosition: ["Start", "Middle", "End", "None"],
            logLinear: ["Linear", "Logarithmic"],
            displayAs: ["Normal", "Cumulative", "Mirror", "Pid"]
        };

        function displayLine(lineOptions, symbolOptions) {
            let sample = $('#sample')[0];
            let context = sample.getContext('2d');
            context.clearRect(0, 0, sample.width, sample.height);
            var x = [5, 50, 100, 150, 195];
            var y = [180, 40, 20, 40, 180];

            function drawSegment(context, x1, y1, x2, y2) {
                let lineColor = lineOptions.lineStyle.lineColor;
                let lineWidth = lineOptions.lineStyle.lineWidth;
                let lineStyle = lineOptions.lineStyle.lineStyle;
                context.beginPath();
                context.strokeStyle = lineColor;
                context.lineWidth = lineWidth;
                context.setLineDash(lineStyle);
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();
            }

            function drawSymbol(context, x, y, style) {
                switch (style.symbolStyle.symbolName) {
                    case "circle":
                    context.beginPath();
                    context.strokeStyle = style.symbolStyle.symbolFillStyle;
                    context.fillStyle = style.symbolStyle.symbolFillStyle;
                    context.lineWidth = style.symbolStyle.symbolLineWidth;
                    context.setLineDash(style.symbolStyle.symbolLineDash);
                    context.arc(x, y, style.symbolStyle.symbolSize / 2, 0, 2 * Math.PI);
                    context.closePath();
                    context.stroke();
                    context.fill();
                    break;
                    case "square":
                    break;
                }
                console.log('Draw symbol');
            }
            for (let i = 0; i < x.length - 1; i++) {
                if (lineOptions && lineOptions.display)
                    drawSegment(context, x[i], y[i], x[i + 1], y[i + 1]);
            }
            for (let i = 0; i < x.length; i++) {
                if (symbolOptions && symbolOptions.display) {
                    console.log(self.symbolOptions);
                    drawSymbol(context, x[i], y[i], self.symbolOptions);
                }
            }

        }
        this.disabledByLine = function () {
            $('#wrapMode').prop("disabled", false);
            $('#symbolType').prop("disabled", true);
            $("#blockPosition").prop("disabled", false);
            $('#ignore').prop("disabled", false);
            $('#symbolSize').prop("disabled", true);
            $('#editSymbolStyle').prop("disabled", true);
            $('#editLineStyle').prop("disabled", false);
            self.lineOptions.display = true;
            self.symbolOptions.display = false;
        }
        this.disabledBySymbol = function () {
            $('#wrapMode').prop("disabled", false);
            $('#symbolType').prop("disabled", false);
            $('#blockPosition').prop("disabled", true);
            $('#ignore').prop("disabled", false);
            $('#symbolSize').prop("disabled", false);
            $('#editSymbolStyle').prop("disabled", false);
            $('#editLineStyle').prop("disabled", true);
            self.lineOptions.display = false;
            self.symbolOptions.display = true;
        }
        this.disabledByBoth = function () {
            $('#wrapMode').prop("disabled", false);
            $('#symbolType').prop("disabled", false);
            $('#blockPosition').prop("disabled", false);
            $('#ignore').prop("disabled", false);
            $('#symbolSize').prop("disabled", false);
            $('#editSymbolStyle').prop("disabled", false);
            $('#editLineStyle').prop("disabled", false);
            self.lineOptions.display = true;
            self.symbolOptions.display = true;
        }
        this.disabledByNone = function () {
            $('#wrapMode').prop("disabled", true);
            $('#symbolType').prop("disabled", true);
            $('#blockPosition').prop("disabled", true);
            $('#ignore').prop("disabled", true);
            $('#symbolSize').prop("disabled", true);
            $('#editSymbolStyle').prop("disabled", true);
            $('#editLineStyle').prop("disabled", true);
            self.lineOptions.display = false;
            self.symbolOptions.display = false;
        }
        this.changeOther = function () {
            switch (self.curveOptions.displayMode.toLowerCase()) {
                case "line":
                self.disabledByLine();
                break;
                case "symbol":
                self.disabledBySymbol();
                break;
                case "both":
                self.disabledByBoth();
                break;
                case "none":
                self.disabledByNone();
                break;
                default:
                console.log("Error: NULL");
                break;
            }
            self.drawSample();
        };
        this.setValueScale = function() {
            if(!self.curveOptions.autoValueScale) return;
            else {
                let curveInTree = utils.getCurveFromId(currentCurve.idCurve);
                console.log('curveInTree', curveInTree);
                if (curveInTree.properties.idFamily == null) {
                    wiApiService.scaleCurve(curveInTree.id, function (scaleObj) {
                        $timeout(function () {
                            self.curveOptions.minValue = scaleObj.minScale;
                            self.curveOptions.maxValue = scaleObj.maxScale;
                        })
                    });
                } else {
                    self.curveOptions.minValue = curveInTree.lineProperties.minScale;
                    self.curveOptions.maxValue = curveInTree.lineProperties.maxScale;
                }
            }
        }
        function updateLine(callback) {
            let lineObj = utils.mergeLineObj(self.curveOptions, self.lineOptions.lineStyle, self.symbolOptions.symbolStyle);
            console.log(self.curveOptions, self.lineOptions);
            utils.changeLine(lineObj, wiApiService, function () {
                console.log("lineObj", lineObj);
                currentCurve.setProperties(lineObj);
                currentTrack.plotCurve(currentCurve);
                currentTrack.doPlot(true);
                if (callback) callback();
            });
        }
        this.onEditLineStyleButtonClicked = function () {
            DialogUtils.lineStyleDialog(ModalService, wiComponentService, function (options) {
                console.log("options", options);
                self.lineOptions = options;
                self.drawSample();
            }, self.lineOptions);
        };
        this.onEditSymbolStyleButtonClicked = function () {
            DialogUtils.symbolStyleDialog(ModalService, wiComponentService, function (options) {
                self.symbolOptions = options;
                console.log(self.symbolOptions);
                self.drawSample();
            }, self.symbolOptions);
        };
        this.onEditAttributeButtonClicked = function () {
            let lineOptions = null;
            let symbolOptions = null;
            switch (self.curveOptions.displayMode) {
                case "Line":
                lineOptions = self.lineOptions;
                break;
                case "Symbol":
                symbolOptions = self.symbolOptions;
                break;
                case "Both":
                lineOptions = self.lineOptions;
                symbolOptions = self.symbolOptions;
                break;
                default:
                break;
            }
            DialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService, self.lineOptions, self.symbolOptions, function (lineOptions, symbolOptions) {
                if (lineOptions) self.lineOptions = lineOptions;
                if (symbolOptions) self.symbolOptions = symbolOptions;
                self.drawSample();
            });
        };
        this.onApplyButtonClicked = function () {
            updateLine(function () {
                if (callback) callback();
            });
        };
        this.onOkButtonClicked = function () {
            updateLine(function () {
                if (callback) callback();
                close(null, 100);
            });
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        initModal(modal);
        thisModalController.drawSample();
        switch (thisModalController.curveOptions.displayMode) {
            case "Line":
            thisModalController.disabledByLine();
            break;
            case "Symbol":
            thisModalController.disabledBySymbol();
            break;
            case "Both":
            thisModalController.disabledByBoth();
            break;
            case "None":
            thisModalController.disabledByNone();
            break;
            default:
            console.log("Error: NULL");
            break;
        }
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
};
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.curvePropertiesDialog = curvePropertiesDialog;
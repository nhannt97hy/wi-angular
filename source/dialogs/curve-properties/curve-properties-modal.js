let helper = require('./DialogHelper');
// module.exports = function (ModalService, wiComponentService, wiApiService, DialogUtils, currentCurve, viTrack, wiLogplotCtrl, callback) {
module.exports = function (ModalService, trackComponent, callback) {
    let thisModalController = null;

    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let error = null;
        let self = this;
        let viTrack = trackComponent.controller.viTrack;
        let currentCurve = viTrack.getCurrentCurve();
        // window.cProps = this;
        console.log("currentCurve", currentCurve);
        // wiApiService.curveInfo
        thisModalController = this;
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let dataset = utils.getModel('dataset', currentCurve.idDataset);
        self.lineUnit = currentCurve.unit;
        self.units = [];
        self.longList = [];
        self.compatiableUnit = null;
        self.longListSelected = null;
        self.isUnKnown = !self.units.find(u => u.name === self.lineUnit);
        // console.log("CURRENTCURVE", currentCurve, currentTrack);
        $timeout(function () {
            wiApiService.asyncGetListUnit({idCurve: currentCurve.idCurve}).then(r => {
                self.units = r;
                self.compatiableUnit = self.units.find(u=>u.name === self.lineUnit);
            });
        });
        $timeout(function () {
            wiApiService.asyncGetAllUnit({}).then(r=>{
                self.longList = r;
            });
        });
        self.onChangeCompatiableUnit = function () {
            let currentUnit = self.lineUnit;
            let currentUnitObj = self.units.find(u=>u.name === currentUnit);
            let newUnitObj = self.compatiableUnit;
            self.lineUnit = self.compatiableUnit.name;
            self.longListSelected = null;
            self.curveOptions.unit = self.lineUnit;
            if(currentUnitObj && newUnitObj){
                let ratio = newUnitObj.rate / currentUnitObj.rate;
                self.curveOptions.minValue = self.curveOptions.minValue * ratio;
                self.curveOptions.maxValue = self.curveOptions.maxValue * ratio;
            }
            console.log(self.curveOptions.minValue, self.curveOptions.maxValue);
        };
        self.onChangeLineUnit = function () {
            console.log("bbb");
            self.compatiableUnit = self.units.find(u=>u.name === self.lineUnit);
            self.curveOptions.unit = self.lineUnit;
            console.log(self.compatiableUnit);
        };
        self.onChangeLongList = function () {
            self.lineUnit = self.longListSelected.name;
            self.compatiableUnit = null;
            self.curveOptions.unit = self.lineUnit;
        };
        let extentY = currentCurve.getExtentY();
        if (currentCurve.line && (currentCurve.displayMode == 'Line' || currentCurve.displayMode == 'Both')) {
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
        if (currentCurve.symbol && (currentCurve.displayMode == 'Symbol' || currentCurve.displayMode == 'Both')) {
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

        this.curveOptions = utils.curveOptions(viTrack, currentCurve);
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
        this.displayLine = displayLine;

        function displayLine(lineOptions, symbolOptions) {

            let sample = $('#sample')[0];
            let context = sample.getContext('2d');
            context.clearRect(0, 0, sample.width, sample.height);
            var x = [5, 25, 50, 100, 150, 175, 195];
            var y = [180, 100, 40, 20, 40, 110, 180];

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
                let helper = new graph.CanvasHelper(context, {
                    strokeStyle: style.symbolStyle.symbolFillStyle,
                    fillStyle: style.symbolStyle.symbolFillStyle,
                    lineWidth: style.symbolStyle.symbolLineWidth,
                    lineDash: style.symbolStyle.symbolLineDash,
                    size: style.symbolStyle.symbolSize
                });
                switch (style.symbolStyle.symbolName) {
                    case 'circle':
                        helper.circle(x, y);
                        break;
                    case 'cross':
                        helper.cross(x, y);
                        break;
                    case 'diamond':
                        helper.diamond(x, y);
                        break;
                    case 'plus':
                        helper.plus(x, y);
                        break;
                    case 'square':
                        helper.square(x, y);
                        break;
                    case 'star':
                        helper.star(x, y);
                        break;
                    default:
                        break;
                }
            }

            for (let i = 0; i < x.length - 1; i++) {
                if (lineOptions && lineOptions.display)
                    drawSegment(context, x[i], y[i], x[i + 1], y[i + 1]);
            }
            for (let i = 0; i < x.length; i++) {
                if (symbolOptions && symbolOptions.display) {
                    drawSymbol(context, x[i], y[i], symbolOptions);
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
        this.setValueScale = function () {
            if (!self.curveOptions.autoValueScale) return;
            else {
                let curveInTree = utils.getCurveFromId(currentCurve.idCurve);
                wiApiService.scaleCurve(curveInTree.id, function (scaleObj) {
                    self.curveOptions.minValue = scaleObj.minScale;
                    self.curveOptions.maxValue = scaleObj.maxScale;
                });
                /*if (curveInTree.properties.idFamily == null) {
                } else {
                    self.curveOptions.minValue = curveInTree.lineProperties.minScale;
                    self.curveOptions.maxValue = curveInTree.lineProperties.maxScale;
                }*/
            }
        }

        function updateLine(callback) {
            let lineObj = utils.mergeLineObj(self.curveOptions, self.lineOptions.lineStyle, self.symbolOptions.symbolStyle);
            console.log(self.curveOptions, self.lineOptions);
            utils.changeLine(lineObj, wiApiService, function () {
                console.log("lineObj", lineObj);
                currentCurve.setProperties(lineObj);
                viTrack.plotCurve(currentCurve);
                viTrack.doPlot(true);
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
        helper.initModal(modal);
        thisModalController.displayLine(thisModalController.lineOptions, thisModalController.symbolOptions);

        switch (thisModalController.curveOptions.displayMode.toLowerCase()) {
            case "line":
                thisModalController.disabledByLine();
                break;
            case "symbol":
                thisModalController.disabledBySymbol();
                break;
            case "both":
                thisModalController.disabledByBoth();
                break;
            case "none":
                thisModalController.disabledByNone();
                break;
            default:
                console.log("Error: NULL");
                break;
        }
        modal.close.then(function (ret) {
            helper.removeBackdrop();
        });
    });
};

let helper = require('./DialogHelper');
module.exports = function (ModalService, logTracks) {
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        window.cBulk = this;
        this.applyingInProgress = false; 

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
        this.zoomInDialog = function() {
            self.modalSize = {
                "width": "1200px",
            };
            self.maxHeightModal = {
                "max-height": "50em",
            };
        };
        this.setDisableStyle = function (param) {
            if(!param) return {}
            else return {
                "opacity": "0.7",
                "pointer-events": "none"
            }
        }
        this.zoomOutDialog = function() {
            self.modalSize = {};
            self.maxHeightModal = {};
        };
        this.checkAll = true;
        // this.checkAllFunc;
        this.checkAllFunc = function() {
            self.tracks.forEach(function(t) {
                t.use = self.checkAll;
            })
        }
        this.tracks = [];
        this.tracks_edit = [];
        logTracks.forEach(function(lt) {
            let lineArr = [];
            (lt.drawings).filter(d => d.type == 'curve').forEach(function(item) {
                let line = item.getProperties();
                line.lineOptions = {
                    display: (line.displayMode == 'Line' || line.displayMode == 'Both'),
                    lineStyle: {
                        lineColor: line.lineColor ? line.lineColor : "blue",
                        lineStyle: line.lineStyle ? line.lineStyle : [10],
                        lineWidth: line.lineWidth ? line.lineWidth : 1
                    }
                };
                line.symbolOptions = {
                    display: (line.displayMode == 'Symbol' || line.displayMode == 'Both'),
                    symbolStyle: {
                        symbolFillStyle: line.symbolFillStyle ? line.symbolFillStyle : 'blue',
                        symbolLineDash: line.symbolLineDash ? line.symbolLineDash : [10,0],
                        symbolLineWidth: line.symbolLineWidth ? line.symbolLineWidth : 1,
                        symbolName: line.symbolName ? line.symbolName : 'circle',
                        symbolSize: line.symbolSize ? line.symbolSize : 5,
                        symbolStrokeStyle: line.symbolStrokeStyle ? line.symbolStrokeStyle : 'blue'
                    }
                };
                lineArr.push(line);
            });
            self.tracks.push({
                use : true,
                name : lt.name,
                id : lt.id,
                lines : lineArr
            });

            let item_edit = {
                edit: false,
                minValue: null,
                maxValue: null,
                displayMode: "Line",
                displayType: "Linear"
            };
            item_edit.lineOptions = {
                display: (item_edit.displayMode == 'Line' || item_edit.displayMode == 'Both'),
                lineStyle: {
                    lineColor: "blue",
                    lineStyle: [10],
                    lineWidth: 1
                }
            };
            item_edit.symbolOptions = {
                display: (item_edit.displayMode == 'Symbol' || item_edit.displayMode == 'Both'),
                symbolStyle: {
                    symbolFillStyle: 'blue',
                    symbolLineDash: [10,0],
                    symbolLineWidth: 1,
                    symbolName: 'circle',
                    symbolSize: 5,
                    symbolStrokeStyle: 'blue'
                }
            };
            self.tracks_edit.push(item_edit);
        });
        this.onEditStyleButtonClicked = function(line) {
            line.lineOptions.display = false;
            line.symbolOptions.display = false;

            switch (line.displayMode) {
                case "Line":
                    line.lineOptions.display = true;
                break;
                case "Symbol":
                    line.symbolOptions.display = true;
                break;
                case "Both":
                    line.lineOptions.display = true;
                    line.symbolOptions.display = true;
                break;
                default:
                break;
            };
            DialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService,
                                                line.lineOptions,
                                                line.symbolOptions,
                                                function (lineOptions, symbolOptions) {
                if (lineOptions) line.lineOptions = lineOptions;
                if (symbolOptions) line.symbolOptions = symbolOptions;
            });
        }

        this.editStyle = function(index) {
            self.tracks_edit[index].lineOptions.display = false;
            self.tracks_edit[index].symbolOptions.display = false;

            switch (self.tracks_edit[index].displayMode) {
                case "Line":
                    self.tracks_edit[index].lineOptions.display = true;
                break;
                case "Symbol":
                    self.tracks_edit[index].symbolOptions.display = true;
                break;
                case "Both":
                    self.tracks_edit[index].lineOptions.display = true;
                    self.tracks_edit[index].symbolOptions.display = true;
                break;
                default:
                break;
            };
            DialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService,
                                                self.tracks_edit[index].lineOptions,
                                                self.tracks_edit[index].symbolOptions,
                                                function (lineOptions, symbolOptions) {
                if (lineOptions) self.tracks_edit[index].lineOptions = lineOptions;
                if (symbolOptions) self.tracks_edit[index].symbolOptions = symbolOptions;
            });
        }
        function preUpdate (lineProps) {
            let line = lineProps;
            line.lineColor = lineProps.lineOptions.lineStyle.lineColor;
            line.lineStyle = JSON.stringify(lineProps.lineOptions.lineStyle.lineStyle);
            line.lineWidth = lineProps.lineOptions.lineStyle.lineWidth;
            line.symbolFillStyle = lineProps.symbolOptions.symbolStyle.symbolFillStyle;
            line.symbolLineDash = JSON.stringify(lineProps.symbolOptions.symbolStyle.symbolLineDash);
            line.symbolLineWidth = lineProps.symbolOptions.symbolStyle.symbolLineWidth;
            line.symbolName = lineProps.symbolOptions.symbolStyle.symbolName;
            line.symbolSize = lineProps.symbolOptions.symbolStyle.symbolSize;
            line.symbolStrokeStyle = lineProps.symbolOptions.symbolStyle.symbolStrokeStyle;
            return line;
        }
        function getLinesUpdated () {
            let linesUpdated = [];
            self.tracks.forEach(function(t, index) {
                if(self.tracks_edit[index].edit) {
                    t.lines.forEach(function(l) {
                        l.idTrack = t.id;
                        l.minValue = self.tracks_edit[index].minValue;
                        l.maxValue = self.tracks_edit[index].maxValue;
                        l.displayMode = self.tracks_edit[index].displayMode;
                        l.displayType = self.tracks_edit[index].displayType;
                        l.lineOptions = self.tracks_edit[index].lineOptions;
                        l.symbolOptions = self.tracks_edit[index].symbolOptions;
                        linesUpdated.push(preUpdate(l));
                    });
                }
                else {
                    if (t.use) {
                        t.lines.forEach(function(l) {
                            l.idTrack = t.id;
                            linesUpdated.push(preUpdate(l));
                        })
                    }
                }
            });

            return linesUpdated;
        }
        function callAPI (callback) {
            self.applyingInProgress = true;
            async.eachOfSeries(getLinesUpdated(), function(line, idx, cb) {
                wiApiService.editLine(line, function(res) {
                    let currentTrack = logTracks.filter(lt => lt.id == line.idTrack)[0];
                    let currentCurve = currentTrack.drawings.filter(function(d) {
                                        return (d.isCurve() && d.id == line.idLine);
                                    })[0];
                    currentCurve.setProperties(line);

                    currentTrack.plotCurve(currentCurve);
                    currentTrack.doPlot();
                    if (cb) cb();
                })
            }, function(err) {
                if (err) {
                    setTimeout(() => {
                        DialogUtils.errorMessageDialog(ModalService, err);
                    });
                }
                self.applyingInProgress = false;
                if(callback) callback();
            })
        };

        this.onApplyButtonClicked = function(){
            callAPI(function(){});
        };

        this.onOkButtonClicked = function(){
            callAPI(function(){
                close();
            });
        };

        this.onCancelButtonClicked = function() {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "curve-bulk-update-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}
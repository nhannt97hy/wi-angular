let initModal;
function curveBulkUpdateDialog (ModalService, logTracks) {
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

        this.zoomOutDialog = function() {
            self.modalSize = {};
            self.maxHeightModal = {};
        };

        this.unCheck = function(track) {

        }
        this.tracks = [];
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
                use : false,
                name : lt.name,
                id : lt.id,
                lines : lineArr
            });
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
            self.tracks.forEach(function(t) {
                if (t.use) {
                    t.lines.forEach(function(l) {
                        l.idTrack = t.id;
                        linesUpdated.push(preUpdate(l));
                    })
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
        initModal(modal);
        /*$(modal.element).find('.modal-content').resizable({
            minHeight: 300,
            minWidth: 300
        });*/
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}
exports.setInitFunc = function(initFunction) {
    initModal = initFunction;
}
exports.curveBulkUpdateDialog = curveBulkUpdateDialog;
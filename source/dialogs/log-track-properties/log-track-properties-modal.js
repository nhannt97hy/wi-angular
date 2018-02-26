let helper = require('./DialogHelper');
module.exports = function (ModalService, currentTrack, wiLogplotCtrl, wiApiService, callback, options) {
    let wiModal = null;
    function ModalController($scope, wiComponentService, $timeout, close, $compile, $http) {
        let error = null;
        let self = this;
        wiModal = self;

        window.logTrack = this;
        this.groupFnTabCurve = function(item){
            return item.properties.dataset;
        }

        this.groupFnTabShading = function(item){
            return item.datasetName;
        }

        this.applyInProgress = false;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');
        let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();

        console.log("currentTrack", currentTrack);
        this.well = utils.findWellByLogplot(wiLogplotCtrl.id);
        this.tabFlags = options.tabs;

        const changed = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3
        };

        this.logLinear = ["Logarithmic", "Linear"];
        this.displayMode = ["Line", "Symbol", "Both", "None"];
        this.displayAs = ["Normal", "Cumulative", "Mirror", "Pid"];

        this.datasets = new Array();

        this.curves = new Array();
        this.shadings = new Array();
        // general tab
        this.props = {
            general: currentTrack.getProperties()
        }

        let savedZoomFactor = this.props.general.zoomFactor;

        this.props.general.width = utils.pixelToInch(this.props.general.width);
        this.colorTrack = function () {
            DialogUtils.colorPickerDialog(ModalService, self.props.general.color, function (colorStr) {
                self.props.general.color = colorStr;
            });
        };
        this.onRangeValue = function () {
            if (self.props.general.majorTicks != null && !isNaN(self.props.general.majorTicks)) {
                self.props.general.majorTicks = parseInt(self.props.general.majorTicks);
                if (self.props.general.majorTicks < 1 ) self.props.general.majorTicks = 1;
                if (self.props.general.majorTicks > 50) self.props.general.majorTicks = 50;
            }
            if (self.props.general.minorTicks != null && !isNaN(self.props.general.minorTicks)) {
                self.props.general.minorTicks = parseInt(self.props.general.minorTicks);
                if (self.props.general.minorTicks < 1 ) self.props.general.minorTicks = 1;
                if (self.props.general.minorTicks > 50) self.props.general.minorTicks = 50;
            }
        }
        function updateGeneralTab(callback) {
            let temp = true;
            // utils.changeTrack(self.props.general, wiApiService);
            console.log('general', self.props.general);
            if (self.props.general.width < 0 ) self.props.general.width = 0;
            wiApiService.editTrack(self.props.general, function (res) {
                if (!res) return;
                let newProps = angular.copy(self.props);
                newProps.general.width = utils.inchToPixel(self.props.general.width);
                currentTrack.setProperties(newProps.general);

                if (newProps.general.zoomFactor != savedZoomFactor) {
                    savedZoomFactor = newProps.general.zoomFactor;
                    wiD3Ctrl.processZoomFactor();
                    wiD3Ctrl.plotAll();
                }
                else {
                    currentTrack.doPlot(true);
                }
                if (callback) callback();
            })
            return temp;
        }

        // curve tab
        this.datasets = [];
        this.curvesArr = [];
        this.well.children.forEach(function (child) {
            if (child.type == 'dataset') self.datasets.push(child);
        });
        this.datasets.forEach(function (child) {
            child.children.forEach(function (item) {
                if (item.type == 'curve') self.curvesArr.push(item);
            })
        });
        this.curveList = currentTrack.getCurves();
        let curves_bk = [];
        this.curveList.forEach(function (c) {
            self.curves.push(c.getProperties());

            //get id & idCurve to compare in updateCurvesTab function
            curves_bk.push({
                id : c.id,
                idCurve : c.idCurve
            });
        });

        this.curves.forEach(function(c, index) {
            c.changed = changed.unchanged;
            c._index = index;
            c.lineCurve = utils.getCurveFromId(c.idCurve);
            c.lineOptions = {
                display: (c.displayMode == 'Line' || c.displayMode == 'Both'),
                lineStyle: {
                    lineColor: c.lineColor ? c.lineColor : "blue",
                    lineStyle: c.lineStyle ? c.lineStyle : [10],
                    lineWidth: c.lineWidth ? c.lineWidth : 1
                }
            };
            c.symbolOptions = {
                display: (c.displayMode == 'Symbol' || c.displayMode == 'Both'),
                symbolStyle: {
                    symbolFillStyle: c.symbolFillStyle ? c.symbolFillStyle : 'blue',
                    symbolLineDash: c.symbolLineDash ? c.symbolLineDash : [10,0],
                    symbolLineWidth: c.symbolLineWidth ? c.symbolLineWidth : 1,
                    symbolName: c.symbolName ? c.symbolName : 'circle',
                    symbolSize: c.symbolSize ? c.symbolSize : 5,
                    symbolStrokeStyle: c.symbolStrokeStyle ? c.symbolStrokeStyle : 'blue'
                }
            }
        });
        this.onSelectCurve = function () {
            let curve = self.curves.find(c => c._index == self.__idx);
            let idCurveNew = curve.lineCurve.id;
            let curveUnchanged = false;
            if (curve.idLine != null) curveUnchanged = true;
            wiApiService.infoCurve(idCurveNew, function (curveInfo) {
                let lineProps = curveInfo.LineProperty;
                console.log("curveInfo", curveInfo, curve, curveUnchanged);
                if (!lineProps) {
                    console.log("idFamily is not detected!");
                } else {
                    $timeout(function () {
                        self.curves[self.curves.findIndex(c => c._index == self.__idx)] = {
                            _index: self.__idx,
                            alias: curveInfo.name,
                            autoValueScale: curveUnchanged ? curve.autoValueScale : false,
                            blockPosition: lineProps.blockPosition,
                            displayAs: curveUnchanged ? curve.displayAs : 'Normal',
                            displayMode: lineProps.displayMode,
                            displayType: lineProps.displayType,
                            idLine: curveUnchanged ? curve.idLine : null,
                            idTrack: currentTrack.id,
                            idCurve: curveInfo.idCurve,
                            ignoreMissingValues: curveUnchanged ? curve.ignoreMissingValues : true,
                            maxValue: lineProps.maxScale,
                            minValue: lineProps.minScale,
                            showDataset: curveUnchanged ? curve.showDataset : true,
                            showHeader: curveUnchanged ? curve.showHeader : true,
                            wrapMode: curveUnchanged ? curve.wrapMode : 'None',
                            lineOptions: {
                                display: true,
                                lineStyle: {
                                    lineColor: lineProps.lineColor,
                                    lineStyle: eval(lineProps.lineStyle),
                                    lineWidth: lineProps.lineWidth
                                }
                            },
                            symbolOptions: {
                                display: false,
                                symbolStyle: {
                                    symbolFillStyle: lineProps.symbolFillStyle,
                                    symbolLineDash: [10, 0],
                                    symbolLineWidth: 1,
                                    symbolName: "circle",
                                    symbolSize: 4,
                                    symbolStrokeStyle: lineProps.symbolStrokeStyle
                                }
                            },
                            lineCurve: utils.getCurveFromId(curveInfo.idCurve),
                            changed : curveUnchanged ? changed.updated : curve.changed,
                            orderNum: curve.orderNum
                        };
                        console.log("self.curves", self.curves);
                    });
                }
            });
        }
        this.getCurves = function () {
            return self.curves.filter(function (c, index) {
                return (self.curves[index].changed == changed.unchanged ||
                    self.curves[index].changed == changed.updated ||
                    self.curves[index].changed == changed.created);
            }).sort(function (c1, c2) {
                return (c1.orderNum + c1.name).localeCompare(c2.orderNum + c2.name);
            });
        }

        this.setClickedRowCurve = function (index) {
            if (index < 0) return;
            $scope.selectedRowCurve = index;
            self.__idx = self.getCurves()[index]._index;
            console.log(self.curves);
        };
        this.onChangeCurve = function (index) {
            if (self.curves.find(c => c._index == self.__idx).changed == changed.unchanged) self.curves.find(c => c._index == self.__idx).changed = changed.updated;
        }
        this.addRowCurve = function () {
            let orderNums = [];
            let key = null;
            self.getCurves().forEach(function(c) {orderNums.push(c.orderNum)});
            let len = orderNums.length;
            if (!len) key = 'm';
            else key = String.fromCharCode(orderNums[len-1].charCodeAt(0) + 1);
            console.log("orderNums", orderNums);
            self.curves.push({ _index: self.curves.length, changed: changed.created, orderNum: key });
            if(self.getCurves().length) {
                self.setClickedRowCurve(self.getCurves().length-1);
            }
        };
        this.removeRowCurve = function (curve) {
            let index = self.curves.indexOf(curve);
            if(curve.changed == changed.created && !utils.isEmpty(index))
                self.curves.splice(index, 1);
            else
                curve.changed = changed.deleted;
            if (self.getCurves().length <= $scope.selectedRowCurve) self.setClickedRowCurve(self.getCurves().length-1);
            if (!self.getCurves().length) {
                self.addRowCurve();
                self.setClickedRowCurve(0);
            }
        };

        // add blank row
        this.addRowCurve();
        this.setClickedRowCurve(0);

        this.arrowUpCurve = function () {
            let _curves = self.getCurves();
            let i = $scope.selectedRowCurve;
            if (i == 0) return;
            let temp = _curves[i].orderNum;
            _curves[i].orderNum = _curves[i-1].orderNum;
            _curves[i-1].orderNum = temp;
            self.setClickedRowCurve(i-1);
            if (_curves[i].changed == changed.unchanged) _curves[i].changed = changed.updated;
            if (_curves[i-1].changed == changed.unchanged) _curves[i-1].changed = changed.updated;
        }

        this.arrowDownCurve = function () {
            let _curves = self.getCurves();
            let i = $scope.selectedRowCurve;
            if (!_curves[i+1].idCurve) return;
            let temp = _curves[i].orderNum;
            _curves[i].orderNum = _curves[i+1].orderNum;
            _curves[i+1].orderNum = temp;
            self.setClickedRowCurve(i+1);
            if (_curves[i].changed == changed.unchanged) _curves[i].changed = changed.updated;
            if (_curves[i+1].changed == changed.unchanged) _curves[i+1].changed = changed.updated;
        }

        this.onEditStyleButtonClicked = function (index, $event) {
            self.setClickedRowCurve(index);
            let curve = self.curves.find(c => c._index == self.__idx);
            curve.lineOptions.display = false;
            curve.symbolOptions.display = false;

            switch (curve.displayMode) {
                case "Line":
                    curve.lineOptions.display = true;
                break;
                case "Symbol":
                    curve.symbolOptions.display = true;
                break;
                case "Both":
                    curve.lineOptions.display = true;
                    curve.symbolOptions.display = true;
                break;
                default:
                break;
            }
            DialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService,
                                                curve.lineOptions,
                                                curve.symbolOptions,
                                                function (lineOptions, symbolOptions) {
                if (lineOptions) curve.lineOptions = lineOptions;
                if (symbolOptions) curve.symbolOptions = symbolOptions;
                if (curve.changed == changed.unchanged) curve.changed = changed.updated;
            });
            $event.stopPropagation();
        };
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
            delete line.lineCurve._data;
            return line;
        }
        function updateCurvesTab(updateCurvesTabCb) {
            self.curveUpdated = [];
            async.eachOfSeries(self.curves, function(item, idx, callback) {
                switch(item.changed) {
                    case changed.unchanged:
                        callback();
                        break;
                    case changed.created: {
                        if (!item.idCurve) {
                            callback();
                            break;
                        }
                        item = preUpdate(item);
                        wiApiService.createLine(item, function (line) {
                            console.log("CREATE:", line);
                            utils.getCurveData(wiApiService, line.idCurve, function (err, data) {
                                let lineModel = utils.lineToTreeConfig(line);
                                if (!err) {
                                    wiD3Ctrl.addCurveToTrack(currentTrack, data, lineModel.data);
                                    self.curveList = currentTrack.getCurves();
                                    self.curves[idx].idLine = line.idLine;
                                    item.changed = changed.unchanged;
                                    curves_bk.push({ id : line.idLine, idCurve : line.idCurve });
                                } else {
                                    console.error(err);
                                }
                                callback();
                            });
                        });
                        break;
                    }

                    case changed.updated: {
                        item = preUpdate(item);
                        console.log("updateLine", item);
                        wiApiService.editLine(item, function (res) {
                            let _currentCurve = currentTrack.drawings.find(d => (d.isCurve() && d.id == res.idLine));

                            self.curveUpdated.push(_currentCurve);
                            _currentCurve.setProperties(item);

                            currentTrack.plotCurve(_currentCurve);
                            if (callback) callback();
                        });
                        item.changed = changed.unchanged;
                        break;
                    }
                    case changed.deleted:
                        wiApiService.removeLine(item.idLine, function (res) {
                            currentTrack.removeCurveById(item.idLine);
                            if (Array.isArray(res.shadings) && res.shadings.length) {
                                res.shadings.forEach(function(s) {
                                    let shading = utils.getVisualizeShading(currentTrack, s.idShading);
                                    currentTrack.removeDrawing(shading);
                                    self.shadings.find(shading => shading.idShading == s.idShading).changed = changed.deleted;
                                });
                            }
                            callback();
                        });
                        break;
                        default:
                        // break;
                        callback('unknown change code:', item.changed);
                    }
                }, function(err) {
                    if (err) {
                        setTimeout(() => {
                            DialogUtils.errorMessageDialog(ModalService, err);
                        });
                    }
                    self.curves = self.curves.filter(c => { return c.changed != changed.deleted });

                    // idCurve changed
                    let curvesTemp = [];
                    self.curveUpdated.forEach(function (c) {
                        self.shadings.forEach(function (s) {
                            curves_bk.forEach(function(cBk) {
                                // delete shading when select other curve
                                if (cBk.id == c.id && cBk.idCurve != c.idCurve) {
                                    if (s.rightLine.id == c.id || s.leftLine.id == c.id)
                                        s.changed = (s.changed == changed.created) ? s.changed : changed.deleted;
                                }
                            });
                            if (s.rightLine.id == c.id) {
                                s.rightLine = c;
                                s.changed = (s.changed == changed.unchanged) ? changed.updated : s.changed; 
                            }
                            if (s.leftLine.id == c.id) {
                                s.leftLine = c;
                                s.changed = (s.changed == changed.unchanged) ? changed.updated : s.changed; 
                            }

                            s.idLeftLine = s.leftLine.id;
                            if (s.type == 'left') {
                                s.leftFixedValue = s.rightLine.minX;
                                s.changed = (s.changed == changed.unchanged) ? changed.updated : s.changed; 
                            }
                            if (s.type == 'right') {
                                s.leftFixedValue = s.rightLine.maxX;
                                s.changed = (s.changed == changed.unchanged) ? changed.updated : s.changed; 
                            }
                        });
                    });

                    currentTrack.doPlot(true);
                    if (updateCurvesTabCb) updateCurvesTabCb(err);
            });
        }

        // shading tab

        let customLimit = [{"id": -1, "name": "left"}, {"id": -2, "name": "right"}, {"id": -3, "name": "custom"}];
        this.leftLimit = customLimit.concat(self.curveList);
        this.shadingList = currentTrack.getShadings();
        this.shadingList.forEach(function(s) {
            self.shadings.push(s.getProperties());
        });

        this.shadings.forEach(function(s, index) {
            s.changed = changed.unchanged;
            s._index = index;
            s.rightLine = getLine(s.idRightLine);
            if (s.type == 'left') s.leftLine = {"id": -1, "name": "left"}
            if (s.type == 'right') s.leftLine = {"id": -2, "name": "right"}
            if (s.type == 'custom') s.leftLine = {"id": -3, "name": "custom"}
            if (s.type == 'pair') s.leftLine = getLine(s.idLeftLine);
            s.shadingStyle = utils.getShadingStyle(s.isNegPosFill ? s.positiveFill : s.fill);
        });
        this.typeFixedValue = function () {
            if(self.shadings[self.__idx].leftFixedValue == self.shadings[self.__idx].rightLine.minX) {
                self.shadings[self.__idx].leftLine = {"id": -1, "name": "left"};
                self.shadings[self.__idx].idLeftLine = -1;
                self.shadings[self.__idx].type = 'left';
            }
            if(self.shadings[self.__idx].leftFixedValue == self.shadings[self.__idx].rightLine.maxX) {
                self.shadings[self.__idx].leftLine = {"id": -2, "name": "right"};
                self.shadings[self.__idx].idLeftLine = -2;
                self.shadings[self.__idx].type = 'right';
            }
            else  {
                self.shadings[self.__idx].leftLine = {"id": -3, "name": "custom"};
                self.shadings[self.__idx].idLeftLine = -3;
                self.shadings[self.__idx].type = 'custom';

            }
        }
        this.getShadings = function () {
            return self.shadings.filter(function (s, index) {
                return (s.changed == changed.unchanged ||
                    s.changed == changed.updated ||
                    s.changed == changed.created);
            });
        };
        this.setShadingName = function(leftPart, rightPart, idx) {
            if (self.shadings[idx].changed == changed.created && !self.shadings[idx].setName && leftPart && rightPart) {
                let left = null;
                let right = null;
                if(!leftPart) return;
                else {
                    left = leftPart.name;
                    if (rightPart.id == -1) right = 'left';
                    else if (rightPart.id == -2) right = 'right';
                    else if (rightPart.id == -3) {
                        right = self.shadings[idx].leftFixedValue;
                    }
                    else if(rightPart.id > 0) {
                        right = rightPart.name;
                    }
                    self.shadings[idx].name = left + '-' + right;
                }
            }
        }
        function getLine (idLine) {
            let line = null;
            if (idLine != null && !isNaN(idLine)) {
                line = self.curveList.find(c => c.id == idLine);
            };
            return line;
        }
        this.__idx = 0;
        this.setClickedRowShading = function (index) {
            if (index < 0) return;
            $scope.selectedRowShading = index;
            self.__idx = self.getShadings()[index]._index;

        };
        this.onChangeShading = function (index) {
            if (self.shadings.find(s => s._index == self.__idx).changed == changed.unchanged) {
                self.shadings.find(s => s._index == self.__idx).changed = changed.updated;
                self.typeFixedValue();
            }
        }
        this.syncShadingType = function () {
            self.shadings.find(s => s._index == self.__idx).fill.shadingType 
                = self.shadings.find(s => s._index == self.__idx).shadingStyle;
            self.shadings.find(s => s._index == self.__idx).positiveFill.shadingType 
                = self.shadings.find(s => s._index == self.__idx).shadingStyle;
            self.shadings.find(s => s._index == self.__idx).negativeFill.shadingType 
                = self.shadings.find(s => s._index == self.__idx).shadingStyle;
        }
        this.addRowShading = function () {
            self.shadings.push({
                _index: self.shadings.length,
                changed: changed.created,
                setName: false,
                idTrack: currentTrack.id,
                idControlCurve: null,
                name: 'xx_yy',
                shadingStyle: "pattern",
                isNegPosFill: false,
                type: null,
                fill: {
                    display: true,
                    pattern: {
                        name: "none",
                        foreground: "black",
                        background: "blue"
                    },
                    varShading : {
                        varShadingType: 'gradient',
                        gradient : {
                            startColor : 'blue',
                            endColor : 'transparent'
                        },
                        palette : null,
                        palName : 'BarsMap',
                        customFills : {
                            name: null,
                            content: []
                        }
                    },
                    shadingType: 'pattern'
                },
                positiveFill: {
                    display: false,
                    pattern: {
                        name: "none",
                        foreground: "black",
                        background: "blue"
                    },
                    varShading : {
                        varShadingType: 'gradient',
                        gradient : {
                            startColor : 'blue',
                            endColor : 'transparent'
                        },
                        palette : null,
                        palName : 'BarsMap',
                        customFills : {
                            name: null,
                            content: []
                        }
                    },
                    shadingType: 'pattern'
                },
                negativeFill: {
                    display: false,
                    pattern: {
                        name: "none",
                        foreground: "black",
                        background: "blue"
                    },
                    varShading : {
                        varShadingType: 'gradient',
                        gradient : {
                            startColor : 'blue',
                            endColor : 'transparent'
                        },
                        palette : null,
                        palName : 'BarsMap',
                        customFills : {
                            name: null,
                            content: []
                        }
                    },
                    shadingType: 'pattern'
                },
            });
            console.log(self.shadings);
            if(self.getShadings().length) {
                self.setClickedRowShading(self.getShadings().length-1);
            }
        };
        this.removeRowShading = function (shading) {
            let index = self.shadings.indexOf(shading);
            if(shading.changed == changed.created && !utils.isEmpty(index))
                self.shadings.splice(index, 1);
            else
                shading.changed = changed.deleted;
            if (self.getShadings().length <= $scope.selectedRowShading) self.setClickedRowShading(self.getShadings().length-1);
        };

        // blank shading

        this.defineButtonClicked = function (index, $event) {
            self.setClickedRowShading(index);

            DialogUtils.shadingAttributeDialog(ModalService, wiApiService, function(options){
                if(options) self.shadings[self.__idx] = options;
            }, self.shadings[self.__idx], currentTrack, wiLogplotCtrl);
            $event.stopPropagation();
        };
        this.onSelectRightLine = function () {
            self.shadings[self.__idx].idRightLine = self.shadings[self.__idx].rightLine.id;
            if (self.shadings[self.__idx].type == 'left')
                self.shadings[self.__idx].leftFixedValue = self.shadings[self.__idx].rightLine.minX;
            if (self.shadings[self.__idx].type == 'right')
                self.shadings[self.__idx].leftFixedValue = self.shadings[self.__idx].rightLine.maxX;
            if (self.shadings[self.__idx].leftLine) self.onSelectLeftLine();
        };
        this.onSelectLeftLine = function () {
            self.shadings[self.__idx].idLeftLine = self.shadings[self.__idx].leftLine.id;
            if (self.shadings[self.__idx].leftLine.id == -1) {
                self.shadings[self.__idx].leftFixedValue = self.shadings[self.__idx].rightLine.minX;
                self.shadings[self.__idx].type = 'left';
            }
            if (self.shadings[self.__idx].leftLine.id == -2) {
                self.shadings[self.__idx].leftFixedValue = self.shadings[self.__idx].rightLine.maxX;
                self.shadings[self.__idx].type = 'right';
            }
            if (self.shadings[self.__idx].leftLine.id > 0) self.shadings[self.__idx].leftFixedValue = null;
        };
        this.getCurveList = function () {
            self.curveList = currentTrack.getCurves();
            self.leftLimit = customLimit.concat(self.curveList);
        }
        function updateShadingsTab(updateShadingsTabCb) {
            async.eachOfSeries(self.shadings, function(item, idx, callback) {
                if (item.rightLine && item.leftLine) {
                    if (!item.idControlCurve) {
                        item.idControlCurve = (item.leftLine.id > 0) ? 
                                                item.leftLine.idCurve : item.rightLine.idCurve;
                                                let _lineProps = utils.getCurveFromId(item.idControlCurve).lineProperties;
                        item.fill.varShading.startX = _lineProps.minScale;
                        item.fill.varShading.endX = _lineProps.maxScale;
                        item.positiveFill.varShading.startX = _lineProps.minScale;
                        item.positiveFill.varShading.endX = _lineProps.maxScale;
                        item.negativeFill.varShading.startX = _lineProps.minScale;
                        item.negativeFill.varShading.endX = _lineProps.maxScale;
                    }
                    const idLeftLine = item.leftLine.id
                    let leftLineBk = item.leftLine;
                    item.leftLine = null;
                    let rightLineBk = item.rightLine;
                    item.rightLine = null;

                    let request = angular.copy(item);

                    request.leftLine = leftLineBk;
                    request.rightLine = rightLineBk;
                    item.leftLine = leftLineBk;
                    item.rightLine = rightLineBk;

                    if(item.idLeftLine == -3) {
                        item.type = 'custom';
                    };
                    if(item.idLeftLine == -2) {
                        item.type = 'right';
                    };
                    if(item.idLeftLine == -1) {
                        item.type = 'left';
                    };
                    if(item.idLeftLine > 0) {
                        item.type = 'pair';
                    }
                    delete request.changed;
                    delete request.leftLine;
                    delete request.rightLine;

                    if (item.idLeftLine < 0) {
                        request.idLeftLine = null;
                    }
                    else {
                        request.leftFixedValue = null;
                        request.idLeftLine = parseInt(idLeftLine);
                    }
                    request.palette = request.palName;

                    switch(item.changed) {
                        case changed.unchanged:
                            callback();
                            break;
                        case changed.created: {
                            wiApiService.createShading(request, function (shading) {
                                self.shadings[idx].idShading = shading.idShading;
                                callback();
                            });
                            item.changed = changed.unchanged;
                            break;
                        }

                        case changed.updated: {
                            console.log("updated", request, item);
                            wiApiService.editShading(request, function (shading) {
                                callback();
                            });
                            item.changed = changed.unchanged;
                            break;
                        }
                        case changed.deleted:
                            wiApiService.removeShading(item.idShading, function (shading) {
                                callback();
                            });
                            break;
                        default:
                            // break;
                            callback('unknown change code:', item.change);
                        }
                    }
                    else callback();
                }, function(err) {
                    if (err) {
                        setTimeout(() => {
                            DialogUtils.errorMessageDialog(ModalService, err);
                        });
                    }
                    wiD3Ctrl.updateLogTrack(currentTrack);

                    self.shadings = self.shadings.filter(c => { return c.changed != changed.deleted });
                    self.shadingList = currentTrack.getShadings();
                    if (updateShadingsTabCb) updateShadingsTabCb(err);
            });
        }
        function doApply(callback) {
            if( self.applyInProgress) return;
            self.applyInProgress = true;

            async.series([
                        function(callback) {
                            updateGeneralTab(callback);
                        },
                        function(callback) {
                            updateCurvesTab(callback);
                        },
                        function(callback) {
                            updateShadingsTab(callback);
                        }], function(err, results) {
                            console.log(err, results);
                            if (!self.applyInProgress) callback(true);
                        });
            self.applyInProgress = false;
        }
        this.onApplyButtonClicked = function () {
            doApply(function() {});
        };
        this.onOkButtonClicked = function () {
            doApply(function(result) {
                if(result) {
                    close(self.props);
                }
            });

        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "log-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        if (options.shadingOnly) { wiModal.shadingOnly = true };
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
};
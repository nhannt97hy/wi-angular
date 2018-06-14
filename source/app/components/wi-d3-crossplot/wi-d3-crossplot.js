const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    this.crossplotModel = null;
    this.viCrossplot = {};

    var saveCrossplot= _.debounce(function() {
        saveCrossplotNow(function() {console.log('Updated');});
    }, 3000);

    this.saveCrossplot = saveCrossplot;
    function __packProperties(crossplotModelProps) {
        let packedProps = angular.copy(crossplotModelProps);
        // remove unnecessary fields.
        delete packedProps.reference_curves;

        return packedProps;
    }
    this.saveCrossplotNow = saveCrossplotNow;
    function saveCrossplotNow(callback) {
        async.series([ function(cb) {
            let refCurves = self.crossplotModel.properties.reference_curves;
            self.crossplotModel.properties.reference_curves = null;
            let pointsets = self.crossplotModel.properties.pointsets;
            self.crossplotModel.properties.pointsets = null;
            let pointSet = self.crossplotModel.properties.pointSet;
            self.crossplotModel.properties.pointSet = null;

            wiApiService.editCrossplot(self.crossplotModel.properties, function(returnData) {
                self.crossplotModel.properties.reference_curves = refCurves;
                self.crossplotModel.properties.pointsets = pointsets;
                self.crossplotModel.properties.pointSet = pointSet;
                cb();
            });
        }, function(cb) {
            let curveX = self.crossplotModel.properties.pointsets[0].curveX;
            self.crossplotModel.properties.pointsets[0].curveX = 0;
            let curveY = self.crossplotModel.properties.pointsets[0].curveY;
            self.crossplotModel.properties.pointsets[0].curveY = 0;
            let curveZ = self.crossplotModel.properties.pointsets[0].curveZ;
            self.crossplotModel.properties.pointsets[0].curveZ = 0;
            wiApiService.editPointSet(self.crossplotModel.properties.pointsets[0], function(returnData) {
                self.crossplotModel.properties.pointsets[0].curveX = curveX;
                self.crossplotModel.properties.pointsets[0].curveY = curveY;
                self.crossplotModel.properties.pointsets[0].curveZ = curveZ;
                cb();
            });
        }], function(err, result) {
            // console.log('updated', self.crossplotModel.properties);
            if (callback) callback();
        });
    }
    function getPointSet(crossplotProps) {
        if (crossplotProps && crossplotProps.pointsets && crossplotProps.pointsets.length)
            return crossplotProps.pointsets[0];
        return null;
    }
    this.getPointSet = getPointSet;
    function getCrossplotAreaId() {
        return self.name.replace('D3Area', '');
    }
    this.onDelete = function(model){
        console.log('wi-d3-crossplot onDelete', model);
        switch (model.type) {
            case 'curve':
                let idCurve = model.id;
                let wellModel = utils.findWellByCurve(idCurve);
                if(wellModel.id == self.crossplotModel.properties.idWell){
                    let pointSet = self.getPointSet(self.crossplotModel.properties);
                    if (idCurve == pointSet.idCurveX || idCurve == pointSet.idCurveY) {
                        self.removeVisualizeCrossplot();
                    } else if (idCurve == pointSet.idCurveZ) {
                        self.updateAll();
                    }
                }
                break;
            case 'dataset':
            if(model.properties.idWell == self.crossplotModel.properties.idWell){
                let pointSet = self.getPointSet(self.crossplotModel.properties);
                if(model.id == utils.getModel('curve', pointSet.idCurveX).properties.idDataset ||
                model.id == utils.getModel('curve', pointSet.idCurveY).properties.idDataset) {
                    self.removeVisualizeCrossplot();
                }else if (model.id == utils.getModel('curve', pointSet.idCurveZ).properties.idDataset) {
                    self.updateAll();
                }
            }
            break;

            case 'zoneset':
            case 'zone':
            console.log('not now =))');
            break;

            default:
                console.log('not implemented')
                return;
        }
    }
    this.onModifiedCurve = function(curve){
        let idCurve = curve.idCurve;
        let wellModel = utils.findWellByCurve(idCurve);
        if(wellModel.id == self.crossplotModel.properties.idWell){
            let pointSet = self.getPointSet(self.crossplotModel.properties);
            async function updateData(type){
                let curveProps = utils.getModel('curve', idCurve);
                let data;
                if(curve.data) {
                    data = curve.data.map((r,i) => {
                        return {
                            y: i,
                            x: r
                        }
                    });
                }else {
                    data = await new Promise ((resolve) => {
                        wiApiService.dataCurve(idCurve, function (dataCurve) {
                            resolve(dataCurve);
                        })
                    })
                }
                let viCurve = graph.buildCurve(curveProps, data, wellModel.properties);
                let crossProp = {
                    pointSet : {}
                };
                crossProp.pointSet[type] = viCurve;
                self.viCrossplot.setProperties(crossProp);
                self.viCrossplot.doPlot();
            }
            switch(idCurve){
                case pointSet.idCurveX:
                updateData('curveX');
                break;
                case pointSet.idCurveY:
                updateData('curveY');
                break;
                case pointSet.idCurveZ:
                updateData('curveZ');
                break;
                default:
                break;
            }
        }
    }
    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        self.crossplotModel = utils.getModel('crossplot', self.idCrossplot || self.wiCrossplotCtrl.id);
        if (self.containerName == undefined || self.containerName == null) self.containerName = '';
        self.setContextMenu();
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
        wiComponentService.on(wiComponentService.DELETE_MODEL, self.onDelete);
        wiComponentService.on(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
    };

    this.onLoading = function() {
        document.getElementById(self.name + "-spinner").appendChild((new Spinner()).spin().el);
    }

    this.onReady = function () {
        wiApiService.getCrossplot(this.idCrossplot || this.wiCrossplotCtrl.id, function (xplotProps) {
            let crossplotProps = angular.copy(self.crossplotModel.properties);
            self.createVisualizeCrossplot(xplotProps);
            self.switchReferenceZone(crossplotProps.pointSet.depthType == 'zonalDepth');
            self.switchOverLay(crossplotProps.pointSet.idOverlayLine ? false : true);
            let refWindCtrl = self.getWiRefWindCtrl();
            if (refWindCtrl)
                refWindCtrl.update(getWell(),
                    xplotProps.reference_curves,
                    xplotProps.referenceScale,
                    xplotProps.referenceVertLineNumber,
                    xplotProps.referenceTopDepth,
                    xplotProps.referenceBottomDepth,
                    xplotProps.referenceShowDepthGrid);
        });
        function handler () {
            self.viCrossplot && self.viCrossplot.doPlot && self.viCrossplot.doPlot();
        }
        self.resizeHandlerCross = function (event) {
            let model = event.model;
            if (self.containerName) {
                if (model.type == 'crossplot') return;
                let comboviewId = +self.containerName.replace('comboview', '');
                if (model.type == 'comboview' && comboviewId == model.properties.idCombinedBox) handler();
            } else {
                if (model.type != 'crossplot' || model.id != self.crossplotModel.id) return;
                handler();
            }
        }
        document.addEventListener('resize', self.resizeHandlerCross);
    }
    function updateHistogramProps(crossplotModel,xy){
        let histogramProps = xy == 'xCurve' ? self.histogramModelX.properties : self.histogramModelY.properties;
        if (crossplotModel.properties.pointsets && crossplotModel.properties.pointsets.length) {
            let pointSet = crossplotModel.properties.pointsets[0];
            histogramProps.idCurve = (xy == 'xCurve')?pointSet.idCurveX:pointSet.idCurveY;
            histogramProps.leftScale = (xy == 'xCurve')?pointSet.scaleLeft:pointSet.scaleBottom;
            histogramProps.rightScale = (xy == 'xCurve')?pointSet.scaleRight:pointSet.scaleTop;
            histogramProps.idZoneSet = pointSet.depthType == 'intervalDepth' ? null : pointSet.idZoneSet;
            histogramProps.intervalDepthTop = pointSet.intervalDepthTop;
            histogramProps.intervalDepthBottom = pointSet.intervalDepthBottom;
            histogramProps.color = pointSet.pointColor;
            histogramProps.activeZone = pointSet.activeZone;
            histogramProps.loga = (xy == 'xCurve') ? pointSet.logX:pointSet.logY;
        }
    }
    function buildHistogramProps(crossplotModel, xy) {
        var histogramProps = {};
        var pointSet = null;
        if (crossplotModel.properties.pointsets && crossplotModel.properties.pointsets.length) {
            pointSet = crossplotModel.properties.pointsets[0];
            histogramProps.idCurve = (xy == 'xCurve')?pointSet.idCurveX:pointSet.idCurveY;
            histogramProps.leftScale = (xy == 'xCurve')?pointSet.scaleLeft:pointSet.scaleBottom;
            histogramProps.rightScale = (xy == 'xCurve')?pointSet.scaleRight:pointSet.scaleTop;
            histogramProps.idZoneSet = pointSet.depthType == 'intervalDepth' ? null : pointSet.idZoneSet;
            histogramProps.intervalDepthTop = pointSet.intervalDepthTop;
            histogramProps.intervalDepthBottom = pointSet.intervalDepthBottom;
            histogramProps.color = pointSet.pointColor;
            histogramProps.activeZone = pointSet.activeZone;
            histogramProps.divisions = ((xy == 'xCurve')?pointSet.majorX:pointSet.majorY) * 10;
            histogramProps.loga = (xy == 'xCurve') ? pointSet.logX:pointSet.logY;
        }
        histogramProps.showGrid = false;
        histogramProps.showGaussian = true;
        histogramProps.showCumulative = true;
        histogramProps.plotType = 'Frequency';
        histogramProps.plot = 'Bar';
        return histogramProps;
    }
    this.histogramXReady = function() {
        if (!self.viCrossplot.pointSet) return;
        self.histogramModelX = { properties: buildHistogramProps(self.crossplotModel, "xCurve") };
        var elem = document.getElementById(self.name + "HistogramX");
        var well = getWell();
        self.xHistogram = graph.createHistogram(self.histogramModelX, well.step, well.topDepth, well.bottomDepth, elem);

        let zoneCtrl = self.getZoneCtrl();
        if (!zoneCtrl) return;
        let activeZones = zoneCtrl.getActiveZones();
        self.xHistogram.setZoneSet(activeZones);
        self.xHistogram.setCurve(self.viCrossplot.pointSet.curveX.rawData);

        self.xHistogram.doPlot();
    }
    this.histogramYReady = function() {
        if (!self.viCrossplot.pointSet) return;
        self.histogramModelY = { properties: buildHistogramProps(self.crossplotModel, "yCurve") };
        var containerId = "#" + self.name + "HistogramY";
        var elem = $(containerId);
        var innerElem = $(containerId + " .transform-group");
        function handler() {
            innerElem.css("width", elem[0].clientHeight + "px");
            innerElem.css("height", elem[0].clientWidth + "px");
            self.xHistogram.doPlot();
            self.yHistogram.doPlot();
        }
        self.resizeHandlerHis = function(event) {
            let model = event.model;
            if (self.containerName) {
                if (model.type == "crossplot") return;
                let comboviewId = +self.containerName.replace("comboview", "");
                if (model.type == "comboview" && comboviewId == model.properties.idCombinedBox) handler();
            } else {
                if (model.type != "crossplot" || model.id != self.crossplotModel.id) return;
                handler();
            }
        };
        document.addEventListener("resize", self.resizeHandlerHis);
        innerElem.css("width", elem[0].clientHeight + "px");
        innerElem.css("height", elem[0].clientWidth + "px");
        var well = getWell();
        self.yHistogram = graph.createHistogram(self.histogramModelY, well.step, well.topDepth, well.bottomDepth, innerElem[0]);

        let zoneCtrl = self.getZoneCtrl();
        if (!zoneCtrl) return;
        let activeZones = zoneCtrl.getActiveZones();
        self.yHistogram.setZoneSet(activeZones);
        self.yHistogram.setCurve(self.viCrossplot.pointSet.curveY.rawData);

        self.yHistogram.doPlot();
    }
    this.doShowHistogram = function() {
        if (self.crossplotModel && self.crossplotModel.properties) {
            let pointSet = self.crossplotModel.properties.pointsets[0];
            if(pointSet.idCurveX && pointSet.idCurveY){
                self.crossplotModel.properties.showHistogram = !self.crossplotModel.properties.showHistogram;
                saveCrossplot();
                if (self.viCrossplot) $timeout(() => self.viCrossplot.doPlot(), 100);
                $timeout(function(){
                    if(pointSet.idCurveZ){
                        console.log('idCurveZ');
                        $('#' + self.name + "HistogramX").css("margin-right","20px");
                    }else{
                        $('#' + self.name + "HistogramX").css("margin-right","0px");
                    }
                },500);
            }
        }
    }

    this.getWell = getWell;
    function getWell() {
        let _well = utils.findWellByCrossplot(self.idCrossplot || self.wiCrossplotCtrl.id);
        return _well;
    }

    this.getModel = function(){
        return self.crossplotModel;
    }

    this.getZoneCtrl = function () {
        if (self.wiCrossplotCtrl) {
            return self.wiCrossplotCtrl.getWiZoneCtrl();
        }
        return null;
    }

    this.getWiRefWindCtrl = function () {
        if (self.wiCrossplotCtrl) {
            return self.wiCrossplotCtrl.getWiRefWindCtrl();
        }
        return null;
    }

    this.switchDepthType = function() {
        if (self.crossplotModel.properties.pointsets[0].depthType == 'intervalDepth') {
            self.crossplotModel.properties.pointsets[0].depthType = 'zonalDepth';
        }
        else {
            self.crossplotModel.properties.pointsets[0].depthType = 'intervalDepth';
        }
        self.viCrossplot.pointSet.depthType = self.crossplotModel.properties.pointsets[0].depthType;
        updateHistogram();
        self.switchReferenceZone();
    }

    function setWiZoneArr(zoneArray) {
        self.zoneArr = zoneArray;
    }
    function getWiZoneArr() {
        if (!self.wiCrossplotCtrl) return null;
        return self.wiCrossplotCtrl.zoneArr;
    }

    this.linkModels = function () {
        setWiZoneArr(null);
        if (self.crossplotModel && self.crossplotModel.properties.pointsets &&
            self.crossplotModel.properties.pointsets.length &&
            self.crossplotModel.properties.pointsets[0] &&
            self.crossplotModel.properties.pointsets[0].idZoneSet) {
            console.log("idZoneSet:", self.crossplotModel.properties.pointsets[0].idZoneSet);
            self.zoneSetModel = utils.getModel('zoneset', self.crossplotModel.properties.pointsets[0].idZoneSet);
            setWiZoneArr(self.zoneSetModel.children);
            // self.zoneArr.forEach(function (zone) {
            //     zone.handler = function () {}
            // });
            let zoneCtrl = self.getZoneCtrl();
            if (zoneCtrl) {
                zoneCtrl.zones = self.zoneSetModel.children;
                zoneCtrl.zoneUpdate();
            }
            let pointSet = getPointSet(self.crossplotModel.properties);
            if (pointSet) pointSet.zones = self.zoneArr.map(function(zone) {
                return zone.properties;
            });
        }
    }

    this.updateViCrossplotZones = function(data) {
        let zoneCtrl = self.getZoneCtrl();
        if (!zoneCtrl) return;
        let activeZones = zoneCtrl.getActiveZones();
        let _activeZones;
        if (activeZones)
            _activeZones = activeZones.map(function(d) { return d.properties.idZone; });

        if (self.viCrossplot && self.viCrossplot.setProperties) {
            self.viCrossplot.setProperties({
                pointSet: {
                    activeZone: data == 'All' ? data : _activeZones
                }
            });
            self.viCrossplot.doPlot();
        }
        if(self.xHistogram && self.yHistogram){
            self.xHistogram.setZoneSet(activeZones);
            self.yHistogram.setZoneSet(activeZones);
            self.xHistogram.doPlot();
            self.yHistogram.doPlot();
        }
    }
    this.switchOverLay = function(state){
        const menuItem = self.contextMenu.find(c => c.name == 'ShowOverlay');
        if (menuItem) {
            menuItem.disabled = state;
        }
    }

    this.switchReferenceZone = function(state) {
        if (!self.wiCrossplotCtrl) return;
        if (state != undefined || state != null) self.wiCrossplotCtrl.isShowWiZone = state;
        else self.wiCrossplotCtrl.isShowWiZone = !self.wiCrossplotCtrl.isShowWiZone;
        const menuItem = self.contextMenu.find(c => c.name == 'ShowReferenceZone');
        if (menuItem) {
            menuItem.checked = self.wiCrossplotCtrl.isShowWiZone;
        }
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    }

    this.switchReferenceWindow = function(state) {
        if (state != undefined || state != null) self.crossplotModel.properties.referenceDisplay = state;
        else self.crossplotModel.properties.referenceDisplay = !self.crossplotModel.properties.referenceDisplay;
        const menuItem = self.contextMenu.find(c => c.name == 'ShowReferenceWindow');
        if (menuItem) {
            menuItem.checked = self.crossplotModel.properties.referenceDisplay;
        }
        saveCrossplot();
        wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize();
    }

    function updateHistogram(curveZ){
        if (self.histogramModelX) {
            if ($('#' + self.name + "HistogramX").length) {
                if(curveZ){
                    $('#' + self.name + "HistogramX").css("margin-right","20px");
                }else{
                    $('#' + self.name + "HistogramX").css("margin-right","0px");
                }
                updateHistogramProps(self.crossplotModel, 'xCurve');
                self.xHistogram.setHistogramModel(self.histogramModelX);
                let zoneCtrl = self.getZoneCtrl();
                if (!zoneCtrl) return;
                let activeZones = zoneCtrl.getActiveZones();
                self.xHistogram.setZoneSet(activeZones);
                self.xHistogram.setCurve(self.viCrossplot.pointSet.curveX.rawData);

                self.xHistogram.doPlot();
            }
        }
        if (self.histogramModelY) {
            if ($('#' + self.name + "HistogramY").length) {
                updateHistogramProps(self.crossplotModel, 'yCurve');
                self.yHistogram.setHistogramModel(self.histogramModelY);
                let zoneCtrl = self.getZoneCtrl();
                if (!zoneCtrl) return;
                let activeZones = zoneCtrl.getActiveZones();
                self.yHistogram.setZoneSet(activeZones);
                self.yHistogram.setCurve(self.viCrossplot.pointSet.curveY.rawData);

                self.yHistogram.doPlot();
            }
        }
    }

    this.updateAll = function (callback) {
        wiApiService.getCrossplot(self.crossplotModel.properties.idCrossPlot, function (crossplot) {
            self.crossplotModel.properties = crossplot;
            self.pointSet = crossplot.pointSet;
            self.linkModels();
            if (crossplot.pointSet.idZoneSet) {
                crossplot.pointSet.zones = self.pointSet.zones;
            }
            self.viCrossplot.setProperties(crossplot);
            self.viCrossplot.doPlot();
            updateHistogram(crossplot.pointSet.idCurveZ);
            callback && callback();
        });
    }

    this.propertiesDialog = function () {
        function openDialog() {
            if (!self.viCrossplot || !Object.keys(self.viCrossplot).length) {
                console.error("viCrossplot null");
                return;
            }
            console.log("Model", self.crossplotModel);
            DialogUtils.crossplotFormatDialog(ModalService,self.crossplotModel.properties.idCrossPlot, function (xplotProps) {
                self.saveCrossplotNow(function() {
                    let overlayLine;

                    let pointSet = xplotProps.pointsets[0];
                    var xCurveData, yCurveData, zCurveData;
                    async.parallel([
                        function(cb) {
                            if (pointSet.idCurveX) {
                                wiApiService.dataCurve(pointSet.idCurveX, function (curveData) {
                                    xCurveData = curveData;
                                    cb();
                                });
                            }
                            else cb();
                        },
                        function(cb) {
                            if (pointSet.idCurveY) {
                                wiApiService.dataCurve(pointSet.idCurveY, function (curveData) {
                                    yCurveData = curveData;
                                    cb();
                                });
                            }
                            else cb();
                        },
                        function(cb) {
                            if (pointSet.idCurveZ) {
                                wiApiService.dataCurve(pointSet.idCurveZ, function (curveData) {
                                    zCurveData = curveData;
                                    cb();
                                })
                            }
                            else cb();
                        },
                        function(cb) {
                            if (xplotProps.pointsets[0].idOverlayLine) {
                                wiApiService.getOverlayLine(xplotProps.pointsets[0].idOverlayLine, pointSet.idCurveX, pointSet.idCurveY, function(ret) {
                                    overlayLine = (ret || {}).data;
                                    cb();
                                });
                            }
                            else cb();
                        }
                    ], function(result, err) {
                        let crossplotProps = angular.copy(xplotProps);
                        let well = getWell();
                        crossplotProps.pointSet = crossplotProps.pointsets[0];
                        if (xCurveData) {
                            let curveXProps = utils.getModel("curve", crossplotProps.pointSet.idCurveX) || { idCurve: crossplotProps.pointSet.idCurveX };
                            crossplotProps.pointSet.curveX = graph.buildCurve(curveXProps, xCurveData, well.properties);
                        }
                        if (yCurveData) {
                            let curveYProps = utils.getModel("curve", crossplotProps.pointSet.idCurveY) || { idCurve: crossplotProps.pointSet.idCurveY };
                            crossplotProps.pointSet.curveY = graph.buildCurve(curveYProps, yCurveData, well.properties);
                        }
                        if (zCurveData) {
                            let curveZProps = utils.getModel("curve", crossplotProps.pointSet.idCurveZ) || { idCurve: crossplotProps.pointSet.idCurveZ };
                            crossplotProps.pointSet.curveZ = graph.buildCurve(curveZProps, zCurveData, well.properties);
                        }
                        else {
                            delete crossplotProps.pointSet.curveZ;
                        }

                        if (overlayLine) {
                            // overlayLine.isSwap = crossplotProps.pointSet.isOverlayLineSwap;
                            crossplotProps.pointSet.OLLine = overlayLine;
                        }else{
                            crossplotProps.pointSet.OLLine = null;
                        }
                        //if (callback) callback(crossplotProps);

                        self.crossplotModel.properties = crossplotProps;
                        self.linkModels();
                        if (crossplotProps.pointSet.idZoneSet) {
                            crossplotProps.pointSet.zones = self.zoneArr.map(function(zone) {
                                return zone.properties;
                            });;
                        }
                        let depthType = (crossplotProps.pointSet || {}).depthType;

                        delete self.viCrossplot.pointSet;

                        self.viCrossplot.setProperties(crossplotProps);
                        // self.viCrossplot.doPlot();
                        self.switchOverLay(crossplotProps.pointSet.idOverlayLine ? false : true);
                        try {
                            self.switchReferenceZone(depthType == 'zonalDepth');
                        }
                        catch(e) {
                            // Canh - Dont know why error :'(
                        }

                        updateHistogram(crossplotProps.pointSet.idCurveZ);
                    });
                });
            });
        }
        openDialog();
    }

    this.discriminator = function(){
        DialogUtils.discriminatorDialog(ModalService, self, function(data){
            utils.evaluateExpr(self.getWell(), data, function(result){
                self.viCrossplot
                    .setProperties({ discriminatorData: result })
                    .doPlot();
            });
        })
    }

    this.setContextMenu = function (contextMenu) {
        if (!contextMenu) {
            self.contextMenu = [
                {
                    name: "Refresh",
                    label: "Refresh",
                    icon: "reload-16x16",
                    handler: function () {
                    }
                }, {
                    name: "Properties",
                    label: "Properties",
                    icon: "properties2-16x16",
                    handler: function () {
                        self.propertiesDialog();
                    }
                }, {
                    name: "Discriminator",
                    label: "Discriminator",
                    icon: "ti-filter",
                    handler: function () {
                        self.discriminator();
                    }
                }, {
                    name: "ReferenceWindow",
                    label: "Reference Window",
                    icon: "ti-layout-tab-window",
                    handler: function () {
                        DialogUtils.referenceWindowsDialog(ModalService, getWell(), self.crossplotModel, function() {
                            saveCrossplotNow(function() {
                                let refWindCtrl = self.getWiRefWindCtrl();
                                if (refWindCtrl)
                                    self.getWiRefWindCtrl().update(getWell(),
                                        self.crossplotModel.properties.reference_curves,
                                        self.crossplotModel.properties.referenceScale,
                                        self.crossplotModel.properties.referenceVertLineNumber,
                                        self.crossplotModel.properties.referenceTopDepth,
                                        self.crossplotModel.properties.referenceBottomDepth,
                                        self.crossplotModel.properties.referenceShowDepthGrid);
                                        //true);
                            });
                            self.switchReferenceWindow(self.crossplotModel.properties.referenceDisplay);
                        });
                    }
                }, {
                    name: "ShowOverlay",
                    label: "Show Overlay",
                    isCheckType: "true",
                    disabled: ((self.viCrossplot || {}).pointSet || {}).idOverlayLine ? false : true,
                    checked: self.viCrossplot.showOverlay ? self.viCrossplot.showOverlay : true,
                    handler: function (index) {
                        self.viCrossplot.showOverlay = !self.viCrossplot.showOverlay;
                        self.viCrossplot.plotOverlayLines();
                        self.contextMenu[index].checked = self.viCrossplot.showOverlay;
                    }
                }, {
                    name: "ShowReferenceZone",
                    label: "Show Reference Zone",
                    isCheckType: "true",
                    checked: (self.wiCrossplotCtrl || {}).isShowWiZone || false,
                    handler: function (index) {
                        self.switchReferenceZone();
                    }
                }, {
                    name: "ShowReferenceWindow",
                    label: "Show Reference Window",
                    isCheckType: "true",
                    checked: self.crossplotModel ? self.crossplotModel.properties.referenceDisplay : false,
                    handler: function (index) {
                        self.switchReferenceWindow();
                    }
                },{
                    name: "ShowTooltip",
                    label: "Show Tooltip",
                    isCheckType: "true",
                    checked: self.viCrossplot.showTooltip ? self.viCrossplot.showTooltip : true,
                    handler: function (index) {
                        self.viCrossplot.showTooltip = !self.viCrossplot.showTooltip;
                        self.contextMenu[index].checked = self.viCrossplot.showTooltip;
                    }
                }, {
                    name: "ShowHistogram",
                    label: "Show Histogram",
                    isCheckType: "true",
                    checked: (self.crossplotModel && self.crossplotModel.properties)?self.crossplotModel.properties.showHistogram:false,
                    handler: function (index) {
                        self.doShowHistogram();
                        self.contextMenu[index].checked = self.crossplotModel.properties.showHistogram;
                    }
                }, {
                    name: "Function",
                    label: "Function",
                    class: "has-more",
                    childContextMenu: [
                        {
                            name: "CreatePolygon",
                            label: "Create Polygon",
                            handler: function () {
                                self.drawAreaPolygon();
                            }
                        },
                        {
                            name: "CreateRectangle",
                            label: "Create Rectangle",
                            handler: function () {
                                self.drawAreaRectangle();
                            }
                        },
                        {
                            name: "DeleteArea",
                            label: "Delete Area",
                            handler: function () {
                                self.deleteArea();
                            }
                        },
                        {
                            separator: '1'
                        },
                        {
                            name: "CreateUserLine",
                            label: "Create User Line",
                            handler: function () {
                                self.drawUserLine();
                            }
                        },
                        {
                            name: "DeleteUserLine",
                            label: "Delete User Line",
                            handler: function () {
                                self.deleteUserLine();
                            }
                        },
                        {
                            separator: '1'
                        },
                        {
                            name: "UserDefineLine",
                            label: "User Define Line",
                            handler: function () {
                                DialogUtils.userDefineLineDialog(ModalService, self, function () {});
                            }
                        },
                        {
                            name: "PolygonManager",
                            label: "Polygon Manager",
                            handler: function () {
                                DialogUtils.polygonManagerDialog(ModalService, self, function () {});
                            }
                        },
                        {
                            name: "RegessionLine",
                            label: "Regession Line",
                            handler: function () {
                                DialogUtils.regressionLineDialog(ModalService, self, function () {});
                            }
                        }
                    ],
                    handler: function () {

                    }
                }
            ];
        } else {
            self.contextMenu = contextMenu;
        }
    }
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        if (self.containerName && self.viCrossplot.mode == 'UseSelector') {
            let combinedPlotD3Ctrl = wiComponentService.getComponent(self.containerName + 'D3Area');
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        combinedPlotD3Ctrl.endAllSelections();
                    }
                }
            ]);
        }
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }
    this.showHisContextMenu = function(event, xy){
        if (event.button != 2) return;
        let _histogram = xy=='x' ? self.histogramModelX: self.histogramModelY;
        let visHistogram = xy=='x' ? self.xHistogram : self.yHistogram;
        self.hisContextMenu = [{
            name: "ShowAsLine",
            label: "Show As Line",
            "isCheckType": "true",
            checked: _histogram ? (_histogram.properties.plot == "Curve") : false,
            handler: function (index) {
                if (_histogram.properties.plot == "Bar")
                    _histogram.properties.plot = "Curve";
                else _histogram.properties.plot = "Bar";
                index = index || 0;
                self.hisContextMenu[index].checked = _histogram ? (_histogram.properties.plot == "Curve") : false;
                visHistogram.signal('histogram-update', "plot curve/bar");
            }
        },
        {
            name: "ShowGaussian",
            label: "Show Gaussian Line",
            "isCheckType": "true",
            checked: _histogram ? _histogram.properties.showGaussian : false,
            handler: function (index) {
                _histogram.properties.showGaussian = !_histogram.properties.showGaussian;
                self.hisContextMenu[index].checked = _histogram.properties.showGaussian;
                visHistogram.signal('histogram-update', 'show/hide gaussian');
            }
        },
        {
            name: "ShowCumulative",
            label: "Show Cumulative Line",
            "isCheckType": "true",
            checked: _histogram ? _histogram.properties.showCumulative : false,
            handler: function (index) {
                _histogram.properties.showCumulative = !_histogram.properties.showCumulative;
                self.hisContextMenu[index].checked = _histogram.properties.showCumulative;
                visHistogram.signal('histogram-update', "show/hide Cumulative curve");
            }
        },
        {
            name: "DivisionNumber",
            label: "Division Number",
            icon: "fa fa-bar-chart",
            class: "has-more",
            handler: function () {},
            childContextMenu: [
                {
                    name: "DN25",
                    label: "25",
                    handler: function () {
                        _histogram.properties.divisions = 25;
                        visHistogram.signal('histogram-update', "update division");
                    }
                },
                {
                    name: "DN50",
                    label: "50",
                    handler: function () {
                        _histogram.properties.divisions = 50;
                        visHistogram.signal('histogram-update', "update division");
                    }
                },
                {
                    name: "DN75",
                    label: "75",
                    handler: function () {
                        _histogram.properties.divisions = 75;
                        visHistogram.signal('histogram-update', "update division");
                    }
                },
                {
                    name: "DN100",
                    label: "100",
                    handler: function () {
                        _histogram.properties.divisions = 100;
                        visHistogram.signal('histogram-update', "update division");
                    }
                }
            ]
        }];
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.hisContextMenu);
    }

    this.removeVisualizeCrossplot = function() {
        if (self.viCrossplot && self.viCrossplot.destroy) {
            self.viCrossplot.destroy();
            self.viCrossplot = null;

            let crossplotProps = angular.copy(self.crossplotModel.properties);
            if (crossplotProps.pointsets && crossplotProps.pointsets.length) {
                crossplotProps.pointSet = crossplotProps.pointsets[0];
                crossplotProps.pointSet.idCurveX = null;
                crossplotProps.pointSet.idCurveY = null;
            }
            self.createVisualizeCrossplot(null, null, crossplotProps);
            self.xHistogram.setCurve(null);
            self.xHistogram.signal('histogram-update', "refresh");
            self.yHistogram.setCurve(null);
            self.yHistogram.signal('histogram-update', "refresh");
        }
    }

    this.createVisualizeCrossplot = function (props) {
        let self = this;
        let pointSet = {};
        this.pointsets = [];
        if (!this.curvesProperties.length) return;
        async.eachSeries(this.curvesProperties, function (curveProps, next) {
            pointSet = {
                scale: {
                    left: null,
                    right: null,
                    bottom: null,
                    top: null
                },
                curveX: {
                    idCurve: curveProps.x,
                    name: '',
                    data: {}
                },
                curveY: {
                    idCurve: curveProps.y,
                    name: '',
                    data: {}
                },
                options: {}
            }
            async.parallel([
                function (cb) {
                    wiApiService.infoCurve(curveProps.x, function (curveInfo) {
                        pointSet.scale.left = curveInfo.LineProperty.minScale;
                        pointSet.scale.right = curveInfo.LineProperty.maxScale;
                        pointSet.curveX.name = curveInfo.name;
                        wiApiService.dataCurve(curveProps.x, function (curveData) {
                            pointSet.curveX.data = curveData;
                            cb();
                        });
                    });
                },
                function (cb) {
                    wiApiService.infoCurve(curveProps.y, function (curveInfo) {
                        pointSet.scale.bottom = curveInfo.LineProperty.minScale;
                        pointSet.scale.top = curveInfo.LineProperty.maxScale;
                        pointSet.curveY.name = curveInfo.name;
                        wiApiService.dataCurve(curveProps.y, function (curveData) {
                            pointSet.curveY.data = curveData;
                            cb();
                        });
                    });
                }
            ], function (cb) {
                if (!curveProps.options.pointColor) curveProps.options.pointColor = genRandomColor();
                pointSet.options = curveProps.options;
                pointSet.pointSize = 3;
                self.pointsets.push(pointSet);
                next();
            });
        }, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }

            // if (!self.viCrossplot) {
                // test
                if (!self.config.scale.left && !self.config.scale.right
                    && !self.config.scale.bottom && !self.config.scale.top) {
                    self.config.scale = (self.pointsets[0] || {}).scale;
                }
                if (self.config.logX) {
                    if (self.config.scale.left == 0
                        || self.config.scale.right == 0) {
                        self.config.logX = false;
                        toastr.error("Scale can't be 0 in Logarithmic");
                        return;
                    }
                }
                if (self.config.logY) {
                    if (self.config.scale.bottom == 0
                        || self.config.scale.top == 0) {
                        self.config.logY = false;
                        toastr.error("Scale can't be 0 in Logarithmic");
                        return;
                    }
                }
                // end test
                props.pointsets = self.pointsets;
                props.config = self.config;
                props.userDefineLines = props.user_define_lines;
                delete props.user_define_lines;
                self.viCrossplot = graph.createCrossplot(props, document.getElementById(self.crossplotAreaId));
                self.changed = false;
                self.setContextMenu();
            // } else {
            //     self.viCrossplot.pointsets = self.pointsets;
            //     self.viCrossplot.updatePlot(changes);
            // }
            self.viCrossplot.onMouseDown(self.mouseDownCallback);
            self.viCrossplot.bodyContainer.on('mousewheel', function () {
                self.mouseWheelCallback();
            });
            let rootPos = null;
            let currPos = null;
            let rootDis = {
                x: null,
                y: null
            };
            let transformX = self.viCrossplot.getTransformX();
            let transformY = self.viCrossplot.getTransformY();
            self.viCrossplot.bodyContainer.call(d3.drag()
                .filter(function () {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    return d3.event.ctrlKey;
                })
                .on('drag', function () {
                    let mouse = d3.mouse(self.viCrossplot.bodyContainer.node());
                    currPos = {
                        x: transformX.invert(mouse[0]),
                        y: transformY.invert(mouse[1])
                    };
                    if (!rootPos || self.changed) rootPos = currPos;
                    if (!rootDis.x || self.changed) {
                        rootDis.x = Math.abs(self.config.scale.left - self.config.scale.right);
                    }
                    if (!rootDis.y || self.changed) {
                        rootDis.y = Math.abs(self.config.scale.bottom - self.config.scale.top);
                    }
                    if (self.changed) self.changed = false;
                })
                .on('end', function () {
                    let currDis = {
                        x: Math.abs(self.config.scale.left - self.config.scale.right),
                        y: Math.abs(self.config.scale.bottom - self.config.scale.top)
                    };
                    let ratio = {
                        x: currDis.x / rootDis.x,
                        y: currDis.y / rootDis.y
                    };
                    let dragFactor = {
                        x: Math.round((Math.abs(currPos.x - rootPos.x)) * ratio.x),
                        y: Math.round((Math.abs(currPos.y - rootPos.y)) * ratio.y)
                    };
                    if (currPos.x > rootPos.x) {
                        self.config.scale.left -= dragFactor.x;
                        self.config.scale.right -= dragFactor.x;
                    } else {
                        self.config.scale.left += dragFactor.x;
                        self.config.scale.right += dragFactor.x;
                    }
                    if (currPos.y > rootPos.y) {
                        self.config.scale.bottom -= dragFactor.y;
                        self.config.scale.top -= dragFactor.y;
                    } else {
                        self.config.scale.bottom += dragFactor.y;
                        self.config.scale.top += dragFactor.y;
                    }
                    rootPos = currPos;
                    rootDis = currDis;
                    self.viCrossplot.doPlot();
                })
            );
        });
        function genRandomColor() {
            let r = Math.round(Math.random() * 256);
            let g = Math.round(Math.random() * 256);
            let b = Math.round(Math.random() * 256);
            return 'rgb(' + [r, g, b].join(",") + ')';
        }
    }
    this.initPolygons = function (polygons) {
        self.viCrossplot.polygons = [];
        polygons.forEach(function (polygon) {
            self.viCrossplot.polygons.push(polygon);
        })
        self.viCrossplot.doPlot();
    }
    this.initRegressionLines = function(regressionLines) {
        self.viCrossplot.regressionLines = [];
        regressionLines.forEach(function (regressionLines) {
            self.viCrossplot.regressionLines.push(regressionLines);
        })
        self.viCrossplot.doPlot();
    }
    this.getPolygons = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.polygons;
    }
    this.getRegressionLines = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.regressionLines;
    }
    this.getUserDefineLines = function () {
        if (!self.viCrossplot) return [];
        return self.viCrossplot.user_define_lines;
    }
    this.getTernary = function () {
        if (!self.viCrossplot) return {};
        return self.viCrossplot.ternary;
    }
    this.getViCrossplot = function () {
        if (!self.viCrossplot) return {};
        return self.viCrossplot;
    }

    this.updateActiveZone = function (activeZone) {
        if (!self.viCrossplot) return {};
        viCrossplot.setProperties({
            pointSet: {
                activeZone: activeZone
            }
        });
        viCrossplot.doPlot();
    }

    this.drawUserLine = function(callback) {
        self.viCrossplot.startAddUserLine();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let userLine = self.viCrossplot.endAddUserLine();
                    if (callback) callback(userLine);
                    self.setContextMenu();
                }
            }
        ]);
    }

    this.deleteUserLine = function() {
        self.viCrossplot.userLine = null;
        self.viCrossplot.plotUserLine();
    }

    this.drawAreaRectangle = function (callback) {
        self.viCrossplot.startAddAreaRectangle();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viCrossplot.endAddAreaRectangle();
                    if (callback) callback(area);
                    self.setContextMenu();
                    self.updateRefWindCanvas();
                }
            }
        ]);
    }

    this.drawAreaPolygon = function (callback) {
        self.viCrossplot.startAddAreaPolygon();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    let area = self.viCrossplot.endAddAreaPolygon();
                    if (callback) callback(area);
                    self.setContextMenu();
                    self.updateRefWindCanvas();
                }
            }
        ]);
    }

    this.deleteArea = function() {
        self.viCrossplot.area = null;
        self.viCrossplot.plotArea();
        self.updateRefWindCanvas();
    }

    this.pickPoint = function(callback) {
        self.viCrossplot.startAddTernaryPoint();
        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    self.viCrossplot.endAddTernaryPoint();
                    self.setContextMenu();
                    if (callback) callback(null);
                }
            }
        ]);
        self.viCrossplot.onMouseDown(function(point) {
            self.mouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(point);
        })
    }

    this.pickVertex = function(idx, callback) {
        self.viCrossplot.startAddTernaryVertex(idx);

        self.setContextMenu([
            {
                name: "Cancel",
                label: "Cancel",
                icon: "",
                handler: function () {
                    self.viCrossplot.endAddTernaryVertex();
                    self.setContextMenu();
                    if (callback) callback('Canceled');
                }
            }
        ]);
        self.viCrossplot.onMouseDown(function(vertex) {
            self.mouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(vertex);
        })
    }

    this.drawPolygon = function (idPolygon, callback) {
        if (idPolygon) {
            self.viCrossplot.startEditPolygon(idPolygon);
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viCrossplot.endEditPolygon());
                        self.setContextMenu();
                    }
                }
            ])
        } else {
            self.viCrossplot.startAddPolygon();
            self.setContextMenu([
                {
                    name: "End",
                    label: "End",
                    icon: "",
                    handler: function () {
                        callback(self.viCrossplot.endAddPolygon());
                        self.setContextMenu();
                    }
                }
            ])
        }
    }

    this.updateRefWindCanvas = function() {
        if (!self.crossplotModel.properties.referenceDisplay) return;
        let refWindCtrl = this.getWiRefWindCtrl();
        refWindCtrl.updateCanvas();
    }

    this.mouseDownCallback = function() {
        if (d3.event.button == 2) return;
        if (self.viCrossplot.mode == 'PlotAreaRectangle') {
            if (self.viCrossplot.area && self.viCrossplot.area.points.length > 1) {
                self.viCrossplot.endAddAreaRectangle();
                self.setContextMenu();
                self.updateRefWindCanvas();
            }
        }
        else if (self.viCrossplot.mode == 'PlotUserLine') {
            if (self.viCrossplot.userLine && self.viCrossplot.userLine.points.length > 1) {
                self.viCrossplot.endAddUserLine();
                self.setContextMenu();
            }
        }
        else if (self.viCrossplot.mode == 'PlotTernaryVertex') {
            self.viCrossplot.endAddTernaryVertex();
            self.setContextMenu();
        }
        else if (self.viCrossplot.mode == 'PlotTernaryPoint') {
            self.viCrossplot.endAddTernaryPoint();
            self.setContextMenu();
        }
    }

    this.mouseWheelCallback = function () {
        if (!this.viCrossplot || !this.viCrossplot.bodyContainer) return;
        let mouse = d3.mouse(this.viCrossplot.bodyContainer.node());
        let transformX = this.viCrossplot.getTransformX();
        let transformY = this.viCrossplot.getTransformY();
        let posX = transformX.invert(mouse[0]);
        let posY = transformY.invert(mouse[1]);
        let newScale = {};

        if (d3.event.ctrlKey) {
            const zoomFactor = 0.1;
            if (d3.event.deltaY < 0) {
                newScale = {
                    left: this.config.scale.left - Math.abs(this.config.scale.left - posX) * zoomFactor,
                    right: this.config.scale.right + Math.abs(this.config.scale.right - posX) * zoomFactor,
                    bottom: this.config.scale.bottom + Math.abs(this.config.scale.bottom - posY) * zoomFactor,
                    top: this.config.scale.top - Math.abs(this.config.scale.top - posY) * zoomFactor
                };
                // this.viCrossplot.pointsets.forEach(pointSet => {
                //     pointSet.pointSize *= (1 + zoomFactor);
                // });
            } else {
                newScale = {
                    left: this.config.scale.left + Math.abs(this.config.scale.left - posX) * zoomFactor,
                    right: this.config.scale.right - Math.abs(this.config.scale.right - posX) * zoomFactor,
                    bottom: this.config.scale.bottom - Math.abs(this.config.scale.bottom - posY) * zoomFactor,
                    top: this.config.scale.top + Math.abs(this.config.scale.top - posY) * zoomFactor
                };
                // this.viCrossplot.pointsets.forEach(pointSet => {
                //     pointSet.pointSize /= (1 + zoomFactor);
                // });
            }
            this.config.scale = newScale;
            this.viCrossplot.config = this.config;
            this.viCrossplot.doPlot();
            d3.event.preventDefault();
            d3.event.stopPropagation();
        }
    }

	this.$onDestroy = function () {
        wiComponentService.dropComponent(self.name);
        document.removeEventListener('resize', self.resizeHandlerCross);
        document.removeEventListener('resize', self.resizeHandlerHis);
        wiComponentService.removeEvent(wiComponentService.DELETE_MODEL, self.onDelete);
        wiComponentService.removeEvent(wiComponentService.MODIFIED_CURVE_DATA, self.onModifiedCurve);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-d3-crossplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true,
    bindings: {
        name: '@',
        wiCrossplotCtrl: '<',
        idCrossplot: '<',
        selections: '<',
        containerName: '@',
        curvesProperties: '<',
        config: '<'
    }
});
app.filter('toFixed2', function() {
    return function(item) {
        if (item) return item.toFixed(2);
    }
});

exports.name = moduleName;
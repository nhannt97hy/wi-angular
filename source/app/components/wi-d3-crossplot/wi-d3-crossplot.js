const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    let graph = wiComponentService.getComponent('GRAPH');
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    this.crossplotModel = null;
    this.viCrossplot = {};
    let _well = null;

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
    this.$onInit = function () {
        self.crossplotAreaId = self.name.replace('D3Area', '');
        self.crossplotModel = utils.getModel('crossplot', self.idCrossplot || self.wiCrossplotCtrl.id);
        if (self.containerName == undefined || self.containerName == null) self.containerName = '';
        self.setContextMenu();
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

    this.onLoading = function() {
        document.getElementById(self.name + "-spinner").appendChild((new Spinner()).spin().el);
    }

    this.onReady = function () {
        wiApiService.getCrossplot(self.idCrossplot || self.wiCrossplotCtrl.id, function(xplotProps) {
            self.crossplotModel.properties = xplotProps;
            self.linkModels();
            let crossplotProps = angular.copy(self.crossplotModel.properties);

            if (crossplotProps.pointsets && crossplotProps.pointsets.length)
                crossplotProps.pointSet = crossplotProps.pointsets[0];
            self.createVisualizeCrossplot(null, null, crossplotProps);
            self.switchReferenceZone(crossplotProps.pointSet.depthType == 'zonalDepth');
            let refWindCtrl = self.getWiRefWindCtrl();
            if (refWindCtrl) refWindCtrl.update(getWell(),
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
            histogramProps.idZoneSet = pointSet.idZoneSet;
            histogramProps.intervalDepthTop = pointSet.intervalDepthTop;
            histogramProps.intervalDepthBottom = pointSet.intervalDepthBottom;
            histogramProps.color = pointSet.pointColor;
            histogramProps.activeZone = pointSet.activeZone;
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
            histogramProps.idZoneSet = pointSet.idZoneSet;
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
        let time = 0;
        if(!self.viCrossplot.pointSet) time = 1000;
        $timeout(function(){
            self.histogramModelX = {
                properties: buildHistogramProps(self.crossplotModel, 'xCurve')
            };
            var elem = document.getElementById(self.name + 'HistogramX');
            var well = getWell();
            self.xHistogram = graph.createHistogram(self.histogramModelX, well.step,
                    well.topDepth,
                    well.bottomDepth, elem);

            let zoneCtrl = self.getZoneCtrl();
            if (!zoneCtrl) return;
            let activeZones = zoneCtrl.getActiveZones();
            self.xHistogram.setZoneSet(activeZones);
            self.xHistogram.setCurve(self.viCrossplot.pointSet.curveX.rawData);

            self.xHistogram.doPlot();
        },time)
    }
    this.histogramYReady = function() {
        let time = 0;
        if(!self.viCrossplot.pointSet) time = 1000;
        $timeout(function(){
            self.histogramModelY = {
                properties: buildHistogramProps(self.crossplotModel, 'yCurve')
            };
            var containerId = "#" + self.name + 'HistogramY';
            var elem = $(containerId);
            var innerElem = $(containerId + ' .transform-group');
            function handler() {
                innerElem.css('width', elem[0].clientHeight + 'px');
                innerElem.css('height', elem[0].clientWidth + 'px');
                self.xHistogram.doPlot();
                self.yHistogram.doPlot();
            }
            self.resizeHandlerHis = function (event) {
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
            document.addEventListener('resize', self.resizeHandlerHis);
            innerElem.css('width', elem[0].clientHeight + 'px');
            innerElem.css('height', elem[0].clientWidth + 'px');
            var well = getWell();
            self.yHistogram = graph.createHistogram(self.histogramModelY, well.step,
                    well.topDepth,
                    well.bottomDepth, innerElem[0]);

            let zoneCtrl = self.getZoneCtrl();
            if (!zoneCtrl) return;
            let activeZones = zoneCtrl.getActiveZones();
            self.yHistogram.setZoneSet(activeZones);
            self.yHistogram.setCurve(self.viCrossplot.pointSet.curveY.rawData);

            self.yHistogram.doPlot();
        },time)
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
        if (!_well) {
            _well = utils.findWellByCrossplot(self.idCrossplot || self.wiCrossplotCtrl.id);
        }
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
            if (self.histogramModelX) {
                if ($('#' + self.name + "HistogramX").length) {
                    self.histogramModelX.properties = buildHistogramProps(self.crossplotModel, 'xCurve');
                    self.xHistogram.setHistogramModel(self.histogramModelX);
                    let activeZones = self.getZoneCtrl().getActiveZones();
                    self.xHistogram.setZoneSet(activeZones);
                    self.xHistogram.setCurve(self.viCrossplot.pointSet.curveX.rawData);
                    self.xHistogram.doPlot();
                }
            }
            if (self.histogramModelY) {
                if ($('#' + self.name + "HistogramY").length) {
                    self.histogramModelY.properties = buildHistogramProps(self.crossplotModel, 'yCurve');
                    self.yHistogram.setHistogramModel(self.histogramModelY);
                    let activeZones = self.getZoneCtrl().getActiveZones();
                    self.yHistogram.setZoneSet(activeZones);
                    self.yHistogram.setCurve(self.viCrossplot.pointSet.curveY.rawData);
                    self.yHistogram.doPlot();
                }
            }
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
                            crossplotProps.pointSet.overlayLine = overlayLine;
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
                        try {
                            self.switchReferenceZone(depthType == 'zonalDepth');
                        }
                        catch(e) {
                            // Canh - Dont know why error :'(
                        }

                        if (self.histogramModelX) {
                            if ($('#' + self.name + "HistogramX").length) {
                                if(crossplotProps.pointSet.idCurveZ){
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
                    icon: "",
                    handler: function () {

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
        }
    }

    this.createVisualizeCrossplot = function (curveX, curveY, config) {
        if (self.viCrossplot && self.viCrossplot.pointSet) return;
        if (!config) {
            console.error('createVisualizeCrossplot: config is null');
            return;
        }

        let domElem = document.getElementById(self.crossplotAreaId);
        config.well = getWell().properties;

        let viCurveX = curveX, viCurveY = curveY, viCurveZ;

        if (config.pointsets && config.pointsets.length)
            config.pointSet = config.pointsets[0];

        if (config.pointSet) {

            self.loading = true;
            async.parallel([function(callback) {
                if (!viCurveX && config.pointSet.idCurveX) {
                    let curveModel = utils.getModel('curve', config.pointSet.idCurveX);
                    wiApiService.dataCurve(config.pointSet.idCurveX, function(dataX) {
                        viCurveX = graph.buildCurve(curveModel, dataX, config.well);
                        callback();
                    });
                }
                else {
                    callback();
                }
            }, function(callback) {
                if (!viCurveY && config.pointSet.idCurveY) {
                    let curveModel = utils.getModel('curve', config.pointSet.idCurveY);
                    wiApiService.dataCurve(config.pointSet.idCurveY, function(dataY) {
                        viCurveY = graph.buildCurve(curveModel, dataY, config.well);
                        callback();
                    });
                }
                else {
                    callback();
                }

            }, function(callback) {
                if (!viCurveZ && config.pointSet.idCurveZ) {
                    let curveModel = utils.getModel('curve', config.pointSet.idCurveZ);
                    wiApiService.dataCurve(config.pointSet.idCurveZ, function(dataZ) {
                        viCurveZ = graph.buildCurve(curveModel, dataZ, config.well);
                        config.pointSet.curveZ = viCurveZ;
                        callback();
                    });
                }
                else {
                    callback();
                }
            },
            function(callback) {
                if (config.pointSet.idOverlayLine) {
                    wiApiService.getOverlayLine(config.pointSet.idOverlayLine, config.pointSet.idCurveX, config.pointSet.idCurveY, function(ret) {
                        config.pointSet.overlayLine = (ret || {}).data;
                        callback();
                    });
                }
                else {
                    callback();
                }
            }], function(err, result) {
                config = angular.copy(config);
                if (config.ternaries) {
                    let vertices = config.ternaries.map(function(d) {
                        return {
                            x: d.xValue,
                            y: d.yValue,
                            name: d.name,
                            style: d.style,
                            used: d.usedIn,
                            showed: d.show,
                            idVertex: d.idTernary
                        };
                    });
                    config.ternary = { vertices: vertices };
                }
                self.linkModels();
                if (config.pointSet) {
                    if (config.pointSet.idZoneSet) {
                        config.pointSet.zones = self.zoneArr.map(function(zone) {
                            return zone.properties;
                        });
                    }
                }
                self.viCrossplot = graph.createCrossplot(viCurveX, viCurveY, config, domElem);
                self.viCrossplot.onMouseDown(self.viCrossplotMouseDownCallback);
                if (self.containerName) {
                    self.viCrossplot.initSelectionArea(self.viSelections);
                }
                self.loading = false;
            });
        }
        else {
            console.error('createVisualizeCrossplot: config has no pointsets');
        }
        //return self.viCrossplot;
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
        // let polygons = new Array();
        if (!self.viCrossplot) return [];
        // console.log("getP", self.viCrossplot);
        // wiApiService.getCrossplot(self.viCrossplot.idCrossPlot, function(crossplot) {

        // })
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
            self.viCrossplotMouseDownCallback();
            if (d3.event.button == 2) return;
            if (callback) callback(point);
        })
    }

    this.pickVertex = function(idx, callback) {
        self.viCrossplot.startAddTernaryVertex(idx);

        self.setContextMenu([
            {
                name: "End",
                label: "End",
                icon: "",
                handler: function () {
                    self.viCrossplot.endAddTernaryVertex();
                    self.setContextMenu();
                    if (callback) callback(null);
                }
            }
        ]);
        self.viCrossplot.onMouseDown(function(vertex) {
            self.viCrossplotMouseDownCallback();
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

    this.viCrossplotMouseDownCallback = function() {
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

	this.$onDestroy = function () {
        wiComponentService.dropComponent(self.name);
        document.removeEventListener('resize', self.resizeHandlerCross);
        document.removeEventListener('resize', self.resizeHandlerHis);
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
        viSelections: '<',
        containerName: '@'
    }
});
app.filter('toFixed2', function() {
    return function(item) {
        if (item) return item.toFixed(2);
    }
});

exports.name = moduleName;

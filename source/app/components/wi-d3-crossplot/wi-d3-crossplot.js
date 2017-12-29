const componentName = 'wiD3Crossplot';
const moduleName = 'wi-d3-crossplot';

function Controller($scope, wiComponentService, $timeout, ModalService, wiApiService) {
    let self = this;
    window.VISCROSSPLOT = self;
    let graph = wiComponentService.getComponent('GRAPH');
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    this.crossplotModel = null;
    let zoneCtrl = null, refWindCtrl;
    this.viCrossplot = {};
    //this.isShowWiZone = true;
    // this.isShowReferenceWindow = true;
    let _well = null;

    var saveCrossplot= _.debounce(function() {
        wiApiService.editCrossplot(__packedProperties(self.crossplotModel.properties), function(returnData) {
            console.log('updated');
        });
    }, 3000);

    this.saveCrossplot = saveCrossplot;
    function __packProperties(crossplotModelProps) {
        let packedProps = angular.copy(crossplotModelProps);
        // remove unnecessary fields.
        delete packedProps.reference_curves;

        return packedProps;
    }
    function saveCrossplotNow(callback) {
        wiApiService.editCrossplot(__packProperties(self.crossplotModel.properties), function(returnData) {
            console.log('updated', self.crossplotModel.properties);
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
        /*
        if (self.crossplotModel) {
            wiApiService.getCrossplot(self.crossplotModel.properties.idCrossPlot, function (crossplot) {
                self.pointSet = crossplot.pointsets[0];
            });
        }
        */
        if (self.name) {
            wiComponentService.putComponent(self.name, self);
            wiComponentService.emit(self.name);
        }
    };

    this.onLoading = function() {
        document.getElementById(self.name + "-spinner").appendChild((new Spinner()).spin().el);
    }

    this.onReady = function () {
        self.linkModels();

        let crossplotProps = angular.copy(self.crossplotModel.properties);

        if (crossplotProps.pointsets && crossplotProps.pointsets.length)
            crossplotProps.pointSet = crossplotProps.pointsets[0];
        self.createVisualizeCrossplot(null, null, crossplotProps);
    }
    function updateHistogramProps(crossplotModel,xy){
        let histogramProps = xy == 'xCurve' ? self.histogramModelX.properties : self.histogramModelY.properties;
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
        }
    }
    function buildHistogramProps(crossplotModel, xy) {
        var histogramProps = {};
        var pointSet = null;
        //histogramProps = crossplotModel.properties;
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
        }
        histogramProps.loga = false;
        histogramProps.showGrid = false;
        histogramProps.showGaussian = true;
        histogramProps.showCumulative = true;
        histogramProps.plotType = 'Frequency';
        histogramProps.plot = 'Bar';
        return histogramProps;
    }
    this.histogramXReady = function() {
        self.histogramModelX = {
            properties: buildHistogramProps(self.crossplotModel, 'xCurve')
        };
        var elem = document.getElementById(self.name + 'HistogramX');
        var well = getWell();
        self.xHistogram = graph.createHistogram(self.histogramModelX, parseFloat(well.properties.step),
                parseFloat(well.properties.topDepth),
                parseFloat(well.properties.bottomDepth), elem);

        let zoneCtrl = self.getZoneCtrl();
        if (!zoneCtrl) return;
        let activeZones = zoneCtrl.getActiveZones();
        self.xHistogram.setZoneSet(activeZones);
        self.xHistogram.setCurve(self.viCrossplot.pointSet.curveX.rawData);

        self.xHistogram.doPlot();
    }
    this.histogramYReady = function() {
        self.histogramModelY = {
            properties: buildHistogramProps(self.crossplotModel, 'yCurve')
        };
        var containerId = "#" + self.name + 'HistogramY';
        var elem = $(containerId);
        var innerElem = $(containerId + ' .transform-group');
        new ResizeSensor(elem[0], function() {
            innerElem.css('width', elem[0].clientHeight + 'px');
            innerElem.css('height', elem[0].clientWidth + 'px');
        });
        document.addEventListener('resize', function (event) {
            innerElem.css('width', elem[0].clientHeight + 'px');
            innerElem.css('height', elem[0].clientWidth + 'px');
        })
        innerElem.css('width', elem[0].clientHeight + 'px');
        innerElem.css('height', elem[0].clientWidth + 'px');
        var well = getWell();
        self.yHistogram = graph.createHistogram(self.histogramModelY, parseFloat(well.properties.step),
                parseFloat(well.properties.topDepth),
                parseFloat(well.properties.bottomDepth), innerElem[0]);

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
            _well = utils.findWellByCrossplot(self.wiCrossplotCtrl.id);
        }
        return _well;
    }

    this.getModel = function(){
        return self.crossplotModel;
    }
    /*this.CloseZone = function () {
        self.isShowWiZone = false;
        utils.triggerWindowResize();
    }*/
/*
    this.getZoneCtrl = function () {
        if (!zoneCtrl) zoneCtrl = wiComponentService.getComponent(self.getZoneName());
        return zoneCtrl;
    }
    this.getZoneName = function () {
        return self.name + "Zone";
    }
*/
    this.getZoneCtrl = function () {
        if (self.wiCrossplotCtrl) {
            return self.wiCrossplotCtrl.getWiZoneCtrl();
        }
        return null;
    }

//    this.onRefWindCtrlReady = function(refWindCtrl) {
//        console.log('Reference window is ready to update');
//        refWindCtrl.update(
//            getWell(),
//            self.crossplotModel.properties.reference_curves,
//            self.crossplotModel.properties.referenceScale,
//            self.crossplotModel.properties.referenceVertLineNumber,
//            self.crossplotModel.properties.referenceTopDepth,
//            self.crossplotModel.properties.referenceBottomDepth,
//            self.crossplotModel.properties.referenceShowDepthGrid);
//    }
/*
    this.getWiRefWindCtrlName = function () {
        return self.name + "RefWind";
    }

    this.getWiRefWindCtrl = function () {
        if (!refWindCtrl) refWindCtrl =  wiComponentService.getComponent(self.getWiRefWindCtrlName());
        return refWindCtrl;
    }
*/
    this.getWiRefWindCtrl = function () {
        if (self.wiCrossplotCtrl) {
            return self.wiCrossplotCtrl.getWiRefWindCtrl();
        }
        return null;
    }
    function setWiZoneArr(zoneArray) {
        //if (self.wiCrossplotCtrl) self.wiCrossplotCtrl.zoneArr = zoneArray;
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
            //self.zoneArr = self.zoneSetModel.children;

            setWiZoneArr(self.zoneSetModel.children);
            self.zoneArr.forEach(function (zone) {
                zone.handler = function () {}
            });
            let zoneCtrl = self.getZoneCtrl();
            if (zoneCtrl) {
                zoneCtrl.zones = self.zoneSetModel.children;
                zoneCtrl.zoneUpdate();
            }
            /*
            if (!self.pointSet) self.pointSet = self.crossplotModel.properties.pointsets[0];
            self.pointSet.zones = self.zoneArr.map(function(zone) {
                return zone.properties;
            });
            */
            let pointSet = getPointSet(self.crossplotModel.properties);
            if (pointSet) pointSet.zones = self.zoneArr.map(function(zone) {
                return zone.properties;
            });
        }
    }

/*
    this.onZoneCtrlReady = function(zoneCtrl) {
        zoneCtrl.trap('zone-data', function(data) {
            console.log("zone data", data);
            self.updateViCrossplotZones(data);
        });
    }
*/
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

    this.CloseReferenceWindow = function () {
        self.crossplotModel.properties.referenceDisplay = false;
    //    utils.triggerWindowResize();
    }

    this.updateAll = function (callback) {
        wiApiService.getCrossplot(self.crossplotModel.properties.idCrossPlot, function (crossplot) {
            //crossplot.pointSet = crossplot.pointsets[0];
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
                /*
                self.viCrossplot = self.createVisualizeCrossplot(null, null, {
                    name: self.crossplotModel.properties.name,
                    //idPointSet: self.pointSet.idPointSet,
                    idPointSet: getPointSet(self.crossplotModel.properties).idPointSet,
                    idCrossPlot: self.crossplotModel.properties.idCrossPlot,
                    idWell: self.crossplotModel.properties.idWell,
                    //pointSet: self.pointSet
                    pointSet: getPointSet(self.crossplotModel.properties)
                });
                */
            }
            console.log("Model", self.crossplotModel);
            DialogUtils.crossplotFormatDialog(ModalService, self.wiCrossplotCtrl, function (crossplotProps) {
                console.log("ret", crossplotProps);
                self.linkModels();
                if (crossplotProps.pointSet.idZoneSet) {
                    //crossplotProps.pointSet.zones = self.pointSet.zones;
                    crossplotProps.pointSet.zones = self.zoneArr.map(function(zone) {
                        return zone.properties;
                    });;
                }
                delete self.viCrossplot.pointSet;
                console.log('OVERLAY', crossplotProps.pointSet.overlayLine);
                self.viCrossplot.setProperties(crossplotProps);
                self.viCrossplot.doPlot();
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
                        }, self.setContextMenu);
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
                        if (!self.wiCrossplotCtrl) return;
                        self.wiCrossplotCtrl.isShowWiZone = !self.wiCrossplotCtrl.isShowWiZone;
                        utils.triggerWindowResize();
                        self.contextMenu[index].checked = self.wiCrossplotCtrl.isShowWiZone;
                    }
                }, {
                    name: "ShowReferenceWindow",
                    label: "Show Reference Window",
                    isCheckType: "true",
                    checked: self.crossplotModel ? self.crossplotModel.properties.referenceDisplay : false,
                    handler: function (index) {
                        self.crossplotModel.properties.referenceDisplay = !self.crossplotModel.properties.referenceDisplay;
                        self.contextMenu[index].checked = self.crossplotModel.properties.referenceDisplay;
                        console.log(self.crossplotModel);
                        $timeout(function() {
                            self.getWiRefWindCtrl().refresh();
                        }, 100);
                        //utils.triggerWindowResize();
                    }
                },{
                    name: "ShowTooltip",
                    label: "Show Tooltip",
                    handler: function () {

                    }
                }, {
                    name: "ShowHistogram",
                    label: "Show Histogram",
                    isCheckType: "true",
                    checked: (self.crossplotModel && self.crossplotModel.properties)?self.crossplotModel.properties.showHistogram:false,
                    handler: function (index) {
                        self.doShowHistogram();
                        self.contextMenu[index].checked = self.crossplotModel.properties.showHistogram;;
                    }
                }, {
                    name: "Function",
                    label: "Function",
                    childContextMenu: [

                    ],
                    handler: function () {

                    }
                }
            ];
        } else {
            self.contextMenu = contextMenu;
        }
    }
    this.setContextMenu();
    this.showContextMenu = function (event) {
        if (event.button != 2) return;
        event.stopPropagation();
        wiComponentService.getComponent('ContextMenu')
            .open(event.clientX, event.clientY, self.contextMenu);
    }
    this.showHisContextMenu = function(event, xy){
        if (event.button != 2) return;
        _histogram = xy=='x' ? self.histogramModelX: self.histogramModelY;
        visHistogram = xy=='x' ? self.xHistogram : self.yHistogram;
        self.hisContextMenu = [{
            name: "ShowAsLine",
            label: "Show As Line",
            "isCheckType": "true",
            checked: _histogram ? (_histogram.properties.plot == "Curve") : false,
            handler: function (index) {
                if (_histogram.properties.plot == "Bar")
                    _histogram.properties.plot = "Curve";
                else _histogram.properties.plot = "Bar";
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
    this.createVisualizeCrossplot = function (curveX, curveY, config) {
        if (self.viCrossplot && self.viCrossplot.pointSet) return;
        if (!config) {
            console.error('createVisualizeCrossplot: config is null');
            return;
        }

        let domElem = document.getElementById(self.crossplotAreaId);
        config.well = getWell().properties;

        let viCurveX = curveX, viCurveY = curveY, viCurveZ;

//<<<<<<< HEAD
        if (config.pointsets && config.pointsets.length)
            config.pointSet = config.pointsets[0];
//=======
//        let pointSet = null;
//        if (config.pointsets && config.pointsets.length) {
//            pointSet = config.pointsets[0];
//            viCurveZ = pointSet.curveZ;
//        }
//>>>>>>> f01b9621e3df147812e9f3b5c2c4de2e915479ca

        if (config.pointSet) {
            async.parallel([function(callback) {
                if (!viCurveX && config.pointSet.idCurveX) {
                    let curveModel = utils.getModel('curve', config.pointSet.idCurveX);
                    wiApiService.dataCurve(config.pointSet.idCurveX, function(dataX) {
                        viCurveX = graph.buildCurve(curveModel, dataX, config.well);
                        callback();
                    });
                }
                else {
                    async.setImmediate(callback);
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
                    async.setImmediate(callback);
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
                    async.setImmediate(callback);
                }
            },
            function(callback) {
                if (!config.pointSet.overlayLine && config.pointSet.idOverlayLine) {
                    wiApiService.getOverlayLine(config.pointSet.idOverlayLine, function(ret) {
                        config.pointSet.overlayLine = (ret || {}).data;
                        callback();
                    });
                }
                else {
                    async.setImmediate(callback);
                }
            }], function(err, result) {
                self.viCrossplot = graph.createCrossplot(viCurveX, viCurveY, config, domElem);
                self.viCrossplot.onMouseDown(self.viCrossplotMouseDownCallback);
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
        idCrossplot: '<'
    }
});
app.filter('toFixed2', function() {
    return function(item) {
        if (item) return item.toFixed(2);
    }
});

exports.name = moduleName;

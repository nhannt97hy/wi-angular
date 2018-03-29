let helper = require('./DialogHelper');
module.exports = function (ModalService, wiCrossplotId, callback, cancelCallback, options){
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        const CURVE_SYMBOLS = ['X', 'Y', 'Z'];
        window.CrossF = this;
        let self = this;
        this.hideApply = ((options || {}).hideApply || false);

        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');

        let _crossplotModel = utils.getModel('crossplot', wiCrossplotId);
        //let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();

        //this.crossplotModelProps = angular.copy(wiD3CrossplotCtrl.crossplotModel.properties);
        this.crossplotModelProps = angular.copy(_crossplotModel.properties);

        this.selectedCurveX = null;
        this.selectedCurveY = null;
        this.selectedCurveZ = null;
        this.selectedZoneSet = null;
        this.zoneSets = new Array();
        this.datasetsInWell = new Array();
        this.curvesOnDataset = new Array(); //curvesInWell + dataset.curve
        // this.depthType = 'intervalDepth';
        this.lineMode = false;
        this.overlayLines = [];

        this.well = utils.findWellByCrossplot(wiCrossplotId);
        this.selectPointSymbol = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"];

        async.waterfall([
            function(cb) {
                let pointsets = self.crossplotModelProps.pointsets;
                if (!pointsets || !pointsets.length || !pointsets[0].idPointSet ) {
                    wiApiService.getCrossplot(self.crossplotModelProps.idCrossPlot, function (crossplot) {
                        self.crossplotModelProps = crossplot;
                        //wiCrossplotCtrl.crossplotModel.properties = crossplot;
                        _crossplotModel.properties = crossplot;
                        cb();
                    });
                }
                else cb();
            },
            function(cb) {
                let pointSet = self.crossplotModelProps.pointsets[0];
                if (!pointSet.pointSymbol)
                    pointSet.pointSymbol = 'Circle';

                if (!pointSet.numColor)
                    pointSet.numColor = 5;

                pointSet.pointSymbol = utils.upperCaseFirstLetter(pointSet.pointSymbol);

                // self.pointSet = self.crossplotModel.properties.pointSet;
                self.depthType = pointSet.depthType || 'intervalDepth';
                self.lineMode = pointSet.lineMode ? pointSet.lineMode : true;
                pointSet.activeZone = pointSet.activeZone ? pointSet.activeZone : 'All';
                self.selectedZone = pointSet.activeZone ? pointSet.activeZone : 'All'; // To be removed
                async.setImmediate(cb);
            },
            getZonesAndCurvesInDataset,
            function(cb){
                let blankCurve = [{
                    name: '',
                    type: 'curve',
                    id: null,
                    properties: {
                        name: '',
                        idCurve: null,
                        dataset: ''
                    }
                }]
                self.curvesOnDatasetWithBlank = blankCurve.concat(self.curvesOnDataset);
                cb();
            },
            function(cb) {
                CURVE_SYMBOLS.forEach(function(symbol) {
                    autoScaleCurve(symbol, true);
                });
                loadOverlays();
                cb();
            }
        ], function(err) {
            if (err) console.error('ERROR', err);
        });


        function getZonesAndCurvesInDataset(callback) {
            self.well.children.forEach(function (child, i) {
                if (child.type == 'dataset') self.datasetsInWell.push(child);
                // if (child.type == 'zonesets') self.zoneSets = angular.copy(child.children);
                if (child.type == 'zonesets') self.zoneSets = child.children;

                if( i == self.well.children.length - 1) {

                    self.datasetsInWell.forEach(function (dataset) {
                        dataset.children.forEach(function (curve) {
                            if (curve.type == 'curve') {
                                self.curvesOnDataset.push(curve);
                            }
                        })
                    });
                    let pointSet = self.crossplotModelProps.pointsets[0];
                    if (self.zoneSets && self.zoneSets.length > 0) {
                        if (!pointSet.idZoneSet) {
                            self.selectedZoneSet = self.zoneSets[0];
                        }

                        for (let i = self.zoneSets.length - 1; i >= 0; i--) {
                            self.zoneSets[i].idx = i;
                            if (self.zoneSets[i].properties.idZoneSet == pointSet.idZoneSet) {
                                self.selectedZoneSet = self.zoneSets[i];
                            }
                            /*if (!self.zoneSets[i].children || !self.zoneSets[i].children.length) {
                                self.zoneSets.splice(i, 1);
                            }*/
                        }
                    }
                }
            });
            callback();
        }

        function findCurveById (idCurve) {
            curveObjs = self.curvesOnDataset.filter(function (item, index) {
               return (item.id == idCurve);
           });
            return curveObjs[0];
        }

        function getScaleKeys(symbol) {
            return {
                'X': ['scaleLeft', 'scaleRight'],
                'Y': ['scaleBottom', 'scaleTop'],
                'Z': ['scaleMin', 'scaleMax']
            }[symbol];
        }

        function autoScaleCurve(symbol, noForce) {
            let key = 'idCurve' + symbol;
            let scaleKeys = getScaleKeys(symbol);
            let pointSet = self.crossplotModelProps.pointsets[0];
            let idCurve = pointSet[key];
            if (pointSet && pointSet[key]) {
                if (noForce && pointSet[scaleKeys[0]] != null && pointSet[scaleKeys[1]] != null) return;
                let curve = findCurveById(idCurve);
                if (curve.lineProperties) {
                    pointSet[scaleKeys[0]] = curve.lineProperties.minScale;
                    pointSet[scaleKeys[1]] = curve.lineProperties.maxScale;
                }
                else {
                    wiApiService.infoCurve(idCurve, function (info) {
                        $timeout(function () {
                            pointSet[scaleKeys[0]] = info.LineProperty.minScale;
                            pointSet[scaleKeys[1]] = info.LineProperty.maxScale;
                        });
                    })
                }
            }
        }

        function loadOverlays() {
            let pointSet = self.crossplotModelProps.pointsets[0];
            wiApiService.listOverlayLine(pointSet.idCurveX, pointSet.idCurveY, function(ret) {
                if(ret.length){
                    let blank = [{
                        idOverlayLine: null,
                        name: ''
                    }]
                    self.overlayLines = blank.concat(ret);
                }else{
                    self.overlayLines = ret;
                    pointSet.idOverlayLine = null;
                }
            });
        }

        function getTopFromWell() {
            return self.well.topDepth;
        }
        function getBottomFromWell() {
            return self.well.bottomDepth;
        }

        function onSelectedCurveChange(symbol) {
            let idCurve = self.crossplotModelProps.pointsets[0]['idCurve' + symbol];
            if (idCurve) {
                autoScaleCurve(symbol);
                if (symbol != 'Z') loadOverlays();
            }else{
                let scaleKeys = getScaleKeys(symbol);
                let pointSet = self.crossplotModelProps.pointsets[0];
                // pointSet['idCurve' + symbol] = null;
                pointSet[scaleKeys[0]] = null;
                pointSet[scaleKeys[1]] = null;
            }
        }
        // this.onOverLayLineChanged = function(){
        //     if(!crossplotModelProps.pointsets[0].idOverlayLine){

        //     }
        // }

        this.onselectedCurveXChange = function() {
            onSelectedCurveChange('X');
        }
        this.onselectedCurveYChange = function() {
            onSelectedCurveChange('Y');
        }
        this.onselectedCurveZChange = function() {
            onSelectedCurveChange('Z');
        }

        this.onDepthTypeChanged = function(){
            self.crossplotModelProps.pointsets[0].depthType = self.depthType;
            console.log('gg', self.depthType, self.crossplotModelProps.pointsets[0])
            switch (self.depthType) {
                case "intervalDepth":
                self.crossplotModelProps.pointsets[0].intervalDepthTop = self.crossplotModelProps.pointsets[0].intervalDepthTop ? self.crossplotModelProps.pointsets[0].intervalDepthTop: getTopFromWell();
                self.crossplotModelProps.pointsets[0].intervalDepthBottom = self.crossplotModelProps.pointsets[0].intervalDepthBottom ? self.crossplotModelProps.pointsets[0].intervalDepthBottom : getBottomFromWell();
                // self.crossplotModelProps.pointsets[0].idZoneSet = null;
                break;
                case "zonalDepth":
                if(self.selectedZoneSet){
                    self.crossplotModelProps.pointsets[0].idZoneSet = self.selectedZoneSet.properties.idZoneSet;
                }
                break;
            }
        }

        this.onZoneSetChange = function () {
            if(self.selectedZoneSet){
                self.crossplotModelProps.pointsets[0].idZoneSet = self.selectedZoneSet.properties.idZoneSet;
            }
        }

        this.onActiveZoneChange = function(){
            if (self.selectedZone) {
                self.crossplotModelProps.pointsets[0].activeZone = self.selectedZone;
            }
        }

        this.onLineModeChange = function(){
            self.crossplotModelProps.pointsets[0].lineMode = self.lineMode;
        }

        // modal button
        this.colorSymbol = function () {
            DialogUtils.colorPickerDialog(ModalService, self.crossplotModelProps.pointsets[0].pointColor, function (colorStr) {
                self.crossplotModelProps.pointsets[0].pointColor = colorStr;
            });
        };
        this.drawIcon = utils.drawIcon;
        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.checkLogValueX = function (value, label) {
            if (self.crossplotModelProps.pointsets[0].logX) {
                switch (label) {
                    case 'scaleLeft':
                        self.crossplotModelProps.pointsets[0].scaleLeft = value == 0 ? 1 : value;
                        break;
                    case 'scaleRight':
                        self.crossplotModelProps.pointsets[0].scaleRight = value == 0 ? 1 : value;
                        break;
                }
                if(Math.round(value) == 0) {
                    $('#' + label).css('box-shadow', '0px 0px 5px red');
                    $timeout(function () {
                    $('#' + label).css('box-shadow', '');
                    }, 255)
                }
            }
        }
        this.checkLogValueY = function (value, label) {
            switch (label) {
                case 'scaleBottom':
                    self.crossplotModelProps.pointsets[0].scaleBottom = value == 0 ? 1 : value;
                    break;
                case 'scaleTop':
                    self.crossplotModelProps.pointsets[0].scaleTop = value == 0 ? 1 : value;
                    break;
            }
            if (self.crossplotModelProps.pointsets[0].logY) {
                if(Math.round(value) == 0) {
                    $('#' + label).css('box-shadow', '0px 0px 5px red');
                    $timeout(function () {
                    $('#' + label).css('box-shadow', '');
                    }, 255)
                }
            }
        }

        // function buildPayload(crossplotProps) {
        //     let props = crossplotProps;
        //     delete props.pointsets[0].curveX;
        //     delete props.pointsets[0].curveY;
        //     delete props.pointsets[0].curveZ;
        //     return props
        // }

        // AXIS COLORS - START
        $scope.isDefineDepthColors = self.crossplotModelProps.isDefineDepthColors;
        $scope.axisColors = self.crossplotModelProps.axisColors;

        if (!$scope.axisColors || $scope.axisColors == 'null')
            $scope.axisColors = [];
        else if (typeof $scope.axisColors == 'string')
            $scope.axisColors = JSON.parse($scope.axisColors);

        $scope.selectedAxisColorRow = $scope.axisColors.length ? 0 : null;

        $scope.setClickedAxisColorRow = function (indexRow) {
            $scope.selectedAxisColorRow = indexRow;
        };

        $scope.removeAxisColorRow = function (index) {
            // if (!$scope.axisColors[$scope.selectedAxisColorRow]) return;
            $scope.axisColors.splice(index, 1);
            if ($scope.axisColors.length) {
                $scope.setClickedAxisColorRow(index - 1 ||0);
            }
        };

        $scope.selectAxisColor = function(index) {
            let item = $scope.axisColors[index];
            DialogUtils.colorPickerDialog(ModalService, item.color || 'Black', function (colorStr) {
                item.color = colorStr;
            });
        }

        $scope.addAxisColorRow = function () {
            $scope.axisColors.push({
                color: utils.colorGenerator()
            });
            $scope.setClickedAxisColorRow($scope.axisColors.length - 1);
        };

        $scope.toggleDefineDepthColors = function() {
            $scope.isDefineDepthColors = !$scope.isDefineDepthColors;
        }
        // AXIS COLORS - END

        function isOverlapAxisColors(axisColors) {
            axisColors = axisColors.map(function(a) {
                return {
                    minValue: parseFloat(a.minValue),
                    maxValue: parseFloat(a.maxValue)
                }
            }).sort(function(a, b) {
                return a.minValue - b.minValue;
            });
            for (let i = 1; i < axisColors.length; i ++) {
                if (axisColors[i-1].maxValue >  axisColors[i].minValue)
                    return true;
            }
            return false;
        }

        function updateCrossplot() {
            self.crossplotModelProps.isDefineDepthColors = $scope.isDefineDepthColors;
            self.crossplotModelProps.axisColors = JSON.stringify($scope.axisColors);
            if (self.crossplotModelProps.pointsets[0].logX) {
                if (self.crossplotModelProps.pointsets[0].scaleLeft == 0
                    || self.crossplotModelProps.pointsets[0].scaleRight == 0) {
                        toastr.error("Scale can't be 0 in Logarithmic");
                        return;
                    }
            }
            if (self.crossplotModelProps.pointsets[0].logY) {
                if (self.crossplotModelProps.pointsets[0].scaleBottom == 0
                    || self.crossplotModelProps.pointsets[0].scaleTop == 0) {
                        toastr.error("Scale can't be 0 in Logarithmic");
                        return;
                    }
            }
            if ($scope.isDefineDepthColors) {
                for (let c of $scope.axisColors) {
                    if (c.minValue == null || c.maxValue == null || c.color == null) {
                        utils.error("Axis color define value can not be blank");
                        return;
                    }
                    if (parseFloat(c.minValue) > parseFloat(c.maxValue)) {
                        utils.error("Axis color min value can not be greater than max value");
                        return;
                    }
                }
                if (isOverlapAxisColors($scope.axisColors)) {
                    utils.error("Axis color define value is overlap");
                    return;
                }
            }
            // if (self.crossplotModelProps.pointsets[0].idOverlayLine) {
            //     let overlayProps = self.overlayLines.filter(function(o) {
            //         return o.idOverlayLine == self.crossplotModelProps.pointsets[0].idOverlayLine;
            //     })[0];
            //     self.crossplotModelProps.pointsets[0].isOverlayLineSwap = overlayProps.isSwap;
            // }
            _crossplotModel.properties = self.crossplotModelProps; // save change back to the data tree
            self.updating = true;
            self.updating = false;
            if (callback) callback(self.crossplotModelProps);
            /*
            let overlayLine;

            let pointSet = self.crossplotModelProps.pointsets[0];

            let xCurveData, yCurveData, zCurveData;
            async.parallel([
                function(cb) {
                    if (pointSet.idCurveX) {
                        wiApiService.dataCurve(pointSet.idCurveX, function (curveData) {
                            xCurveData = curveData;
                            cb();
                        });
                    }
                    else async.setImmediate(cb);
                },
                function(cb) {
                    if (pointSet.idCurveY) {
                        wiApiService.dataCurve(pointSet.idCurveY, function (curveData) {
                            yCurveData = curveData;
                            cb();
                        });
                    }
                    else async.setImmediate(cb);
                },
                function(cb) {
                    if (pointSet.idCurveZ) {
                        wiApiService.dataCurve(pointSet.idCurveZ, function (curveData) {
                            zCurveData = curveData;
                            cb();
                        })
                    }
                    else async.setImmediate(cb);
                },
                function(cb) {
                    if (self.crossplotModelProps.pointsets[0].idOverlayLine) {
                        wiApiService.getOverlayLine(self.crossplotModelProps.pointsets[0].idOverlayLine, function(ret) {
                            overlayLine = (ret || {}).data;
                            cb();
                        });
                    }
                    else {
                        async.setImmediate(cb);
                    }
                }
            ], function(result, err) {
                let crossplotProps = angular.copy(self.crossplotModelProps);
                crossplotProps.pointSet = crossplotProps.pointsets[0];
                if (xCurveData) {
                    let curveXProps = utils.getModel("curve", crossplotProps.pointSet.idCurveX) || { idCurve: crossplotProps.pointSet.idCurveX };
                    crossplotProps.pointSet.curveX = graph.buildCurve(curveXProps, xCurveData, self.well.properties);
                }
                if (yCurveData) {
                    let curveYProps = utils.getModel("curve", crossplotProps.pointSet.idCurveY) || { idCurve: crossplotProps.pointSet.idCurveY };
                    crossplotProps.pointSet.curveY = graph.buildCurve(curveYProps, yCurveData, self.well.properties);
                }
                if (zCurveData) {
                    let curveZProps = utils.getModel("curve", crossplotProps.pointSet.idCurveZ) || { idCurve: crossplotProps.pointSet.idCurveZ };
                    crossplotProps.pointSet.curveZ = graph.buildCurve(curveZProps, zCurveData, self.well.properties);
                }
                else {
                    delete crossplotProps.pointSet.curveZ;
                }

                if (overlayLine) {
                    crossplotProps.pointSet.overlayLine = overlayLine;
                }
                self.updating = false;
                if (callback) callback(crossplotProps);
            });
            */

            /*
            async.parallel([
                function(cb) {
                    payload = {
                        idCrossPlot: self.crossplotModelProps.idCrossPlot,
                        isDefineDepthColors: $scope.isDefineDepthColors,
                        axisColors: JSON.stringify($scope.axisColors),
                        idWell: self.well.properties.idWell
                    };
                    wiApiService.editCrossplot(payload, function(response){
                        console.log('updateCrossplot', payload, response);
                        cb();
                    });
                },
                function(cb) {
                    wiApiService.editPointSet(self.crossplotModelProps.pointsets[0], function(response) { cb();});
                }
            ], function(err, result) {
                if (err) {
                    console.error(err);
                    utils.error(err);
                }
                else {
                }
            });
            */
        }

        this.onOkButtonClicked = function () {
            updateCrossplot();
            close();
        };
        this.onApplyButtonClicked = function () {
            updateCrossplot();
        };
        this.onCancelButtonClicked = function () {
            if (cancelCallback) cancelCallback();
            close(null);
        };
    };

    ModalService.showModal({
        templateUrl: "crossplot-format-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        // modal.element.find('#spinner-holder')[0].appendChild(new Spinner().spin().el);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (!ret) return;
            callback(ret);
        });
    });
};

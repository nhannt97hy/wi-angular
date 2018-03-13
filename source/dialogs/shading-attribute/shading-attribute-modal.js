let helper = require('./DialogHelper');
module.exports = function (ModalService, wiApiService, callback, shadingOptions, currentTrack, wiLogplotCtrl){
    // let thisModal = null;

    function ModalController($scope, close, wiComponentService, $timeout) {
        let self = this;
        // thisModal = this;
        window.__SA = this;
        this.disabled = false;
        this.error = null;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');
        let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();

        console.log("shadingOptions", shadingOptions);
        this.groupFn = function(item){
            return item.datasetName;
        }
        this.groupFnCtrl = function(item){
            return item.properties.dataset;
        }

        this.paletteList = null;
        this.paletteName = null;
        this.curveList = currentTrack.getCurves();
        let leftCurveBk = shadingOptions.leftCurve;
        shadingOptions.leftCurve = null;
        let rightCurveBk = shadingOptions.rightCurve;
        shadingOptions.rightCurve = null;

        this.shadingOptions = angular.copy(shadingOptions);

        this.shadingOptions.leftCurve = leftCurveBk;
        this.shadingOptions.rightCurve = rightCurveBk;
        shadingOptions.leftCurve = leftCurveBk;
        shadingOptions.rightCurve = rightCurveBk;

        let paletteNameArr = [];
        let paletteValArr = [];

        if (!shadingOptions.shadingStyle)
            this.shadingOptions.shadingStyle = utils.getShadingStyle(this.shadingOptions.isNegPosFill ? this.shadingOptions.positiveFill : this.shadingOptions.fill)
        if (this.shadingOptions.type == 'left') this.shadingOptions.leftCurve = {"id": -1, "name": "left"}
        if (this.shadingOptions.type == 'right') this.shadingOptions.leftCurve = {"id": -2, "name": "right"}
        if (this.shadingOptions.type == 'custom') this.shadingOptions.leftCurve = {"id": -3, "name": "custom"}
        if (this.shadingOptions.type == 'pair') this.shadingOptions.leftCurve = getLine(this.shadingOptions.idLeftLine);
        this.shadingOptions.rightCurve = getLine(this.shadingOptions.idRightLine);

        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];

        let customLimit = [{"id": -1, "name": "left"}, {"id": -2, "name": "right"}, {"id": -3, "name": "custom"}];
        this.leftLimit = customLimit.concat(self.curveList);

        this.well = utils.findWellByLogplot(wiLogplotCtrl.id);
        this.curves = utils.getAllCurvesOfWell(this.well);

        this.fillPatternOptions = {};
        this.variableShadingOptions = {};

        this.fillPatternOptions = {
            fill : {
                display : !this.shadingOptions.isNegPosFill,
                pattern : this.shadingOptions.fill.pattern ? this.shadingOptions.fill.pattern : {
                    name : 'none',
                    foreground : 'black',
                    background : 'blue'
                }
            },
            positiveFill : {
                display : this.shadingOptions.isNegPosFill && this.shadingOptions.positiveFill.display,
                pattern : this.shadingOptions.positiveFill.pattern ? this.shadingOptions.positiveFill.pattern : {
                    name : 'none',
                    foreground : 'black',
                    background : 'blue'
                }
            },
            negativeFill : {
                display : this.shadingOptions.isNegPosFill && this.shadingOptions.negativeFill.display,
                pattern : this.shadingOptions.negativeFill.pattern ? this.shadingOptions.negativeFill.pattern : {
                    name : 'none',
                    foreground : 'black',
                    background : 'blue'
                }
            }
        }
        if (!this.shadingOptions.idControlCurve) {
            this.shadingOptions.idControlCurve = (this.shadingOptions.leftCurve.id > 0) ? 
                                                    this.shadingOptions.leftCurve.idCurve : this.shadingOptions.rightCurve.idCurve;
        }
        let controlCurve = utils.getCurveFromId(this.shadingOptions.idControlCurve);
        
        this.namePals = new Array();
        utils.getPalettes(function(pals){
            self.paletteList = pals;
            self.paletteName = Object.keys(self.paletteList);
        });
        this.checkboxVal = !this.fillPatternOptions.fill.display;

        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];

        this.enableFill = function (idEnable, value) {
            $('#' + idEnable + ":button").attr("disabled", value);
        }
        
        // function
        this.typeFixedValue = function () {
            if(self.shadingOptions.leftFixedValue == self.shadingOptions.rightCurve.minX){
                self.shadingOptions.leftCurve = {"id": -1, "name": "left"};
                self.shadingOptions.idLeftLine = -1;
                self.shadingOptions.type = 'left';
            }
            else if(self.shadingOptions.leftFixedValue == self.shadingOptions.rightCurve.maxX) {
                self.shadingOptions.leftCurve = {"id": -2, "name": "right"};
                self.shadingOptions.idLeftLine = -2;
                self.shadingOptions.type = 'right';
            }
            else {
                self.shadingOptions.leftCurve = {"id": -3, "name": "custom"};
                self.shadingOptions.idLeftLine = -3;
                self.shadingOptions.type = 'custom';
            }
        }

        this.onSelectRightLine = function () {
            self.shadingOptions.idRightLine = self.shadingOptions.rightCurve.id;
            if (self.shadingOptions.type == 'left')
                self.shadingOptions.leftFixedValue = self.shadingOptions.rightCurve.minX;
            if (self.shadingOptions.type == 'right')
                self.shadingOptions.leftFixedValue = self.shadingOptions.rightCurve.maxX;
            if (self.shadingOptions.leftCurve) self.onSelectLeftLine();
        };
        this.onSelectLeftLine = function () {
            self.shadingOptions.idLeftLine = self.shadingOptions.leftCurve.id;
            if (self.shadingOptions.leftCurve.id == -1) {
                self.shadingOptions.leftFixedValue = self.shadingOptions.rightCurve.minX;
                self.shadingOptions.type = 'left';
            }
            if (self.shadingOptions.leftCurve.id == -2) {
                self.shadingOptions.leftFixedValue = self.shadingOptions.rightCurve.maxX;
                self.shadingOptions.type = 'right';
            }
            if (self.shadingOptions.leftCurve.id > 0) self.shadingOptions.leftFixedValue = null;
        };  

        function getLine (idLine) {
            let line = null;
            if (idLine != null && !isNaN(idLine)) {
                line = self.curveList.filter(function(c) {
                    return (c.id == idLine);
                })[0];
            };
            return line;
        }
        this.switchShadingType = function () {
            if (self.shadingOptions.shadingStyle == 'pattern') {
                self.checkboxVal = self.displayType;
                self.fillPatternOptions.fill.display = !self.checkboxVal;
                self.correctFillingStyle();
            }
            if (self.shadingOptions.shadingStyle == 'varShading') {
                self.displayType = self.checkboxVal;
                if (self.displayType == true 
                    && self.variableShadingOptions.fill.varShading.varShadingType == 'customFills') {
                    self.varShadingType = 'gradient';
                    self.variableShadingOptions.fill.varShading.varShadingType = 'gradient';
                    self.variableShadingOptions.positiveFill.varShading.varShadingType = 'gradient';
                    self.variableShadingOptions.negativeFill.varShading.varShadingType = 'gradient';
                }
                self.correctFillingStyleVarShading();
            }
        }
        this.foreground = function () {
            if(!self.fillPatternOptions.fill.pattern.foreground) self.fillPatternOptions.fill.pattern.name = 'basement';
            $timeout(function() {
                DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.fill.pattern.foreground, function (colorStr) {
                    self.fillPatternOptions.fill.pattern.foreground = colorStr;
                });

            })
        }
        this.background = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.fill.pattern.background, function (colorStr) {
                self.fillPatternOptions.fill.pattern.background = colorStr;
            });
        }
        this.posPositiveForeground = function () {
            if(!self.fillPatternOptions.positiveFill.pattern.foreground) self.fillPatternOptions.positiveFill.pattern.name = 'basement';
            $timeout(function() {
                DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.positiveFill.pattern.foreground, function (colorStr) {
                    self.fillPatternOptions.positiveFill.pattern.foreground = colorStr;
                });
            })
        }
        this.posPositiveBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.positiveFill.pattern.background, function (colorStr) {
                self.fillPatternOptions.positiveFill.pattern.background = colorStr;
            });
        }
        this.negPositiveForeground = function () {
            if(!self.fillPatternOptions.negativeFill.pattern.foreground) self.fillPatternOptions.negativeFill.pattern.name = 'basement';
            $timeout(function() {
                DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.negativeFill.pattern.foreground, function (colorStr) {
                    self.fillPatternOptions.negativeFill.pattern.foreground = colorStr;
                });
            });
        }
        this.negPositiveBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.negativeFill.pattern.background, function (colorStr) {
                self.fillPatternOptions.negativeFill.pattern.background = colorStr;
            });
        }
        this.correctFillingStyle = function() {
            self.shadingOptions.isNegPosFill = !self.fillPatternOptions.fill.display;
            self.fillPatternOptions.positiveFill.display = !self.fillPatternOptions.fill.display;
            self.fillPatternOptions.negativeFill.display = self.fillPatternOptions.positiveFill.display;
        }
        // TO REVIEW
        this.selectedControlCurve = function(curve){
            if (curve.lineProperties) onSelect(curve.lineProperties)
            else {
                wiApiService.scaleCurve(self.shadingOptions.idControlCurve, function(scale) {
                    $timeout(function () {
                        onSelect(scale);
                    })
                });
            }
            function onSelect (props) {
                self.variableShadingOptions.fill.varShading.startX = props.minScale;
                self.variableShadingOptions.fill.varShading.endX = props.maxScale;
                self.variableShadingOptions.positiveFill.varShading.startX = props.minScale;
                self.variableShadingOptions.positiveFill.varShading.end = props.maxScale;
                self.variableShadingOptions.negativeFill.varShading.startX = props.minScale;
                self.variableShadingOptions.negativeFill.varShading.end = props.maxScale;
            }

        };

        this.fillStartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.fill.varShading.gradient.startColor, function (colorStr) {
                self.variableShadingOptions.fill.varShading.gradient.startColor = colorStr;
            });
        }
        this.fillEndColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.fill.varShading.gradient.endColor, function (colorStr) {
                self.variableShadingOptions.fill.varShading.gradient.endColor = colorStr;
            });
        }
        this.positiveFillStartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.positiveFill.varShading.gradient.startColor, function (colorStr) {
                self.variableShadingOptions.positiveFill.varShading.gradient.startColor = colorStr;
            });
        }
        this.positiveFillEndColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.positiveFill.varShading.gradient.endColor, function (colorStr) {
                self.variableShadingOptions.positiveFill.varShading.gradient.endColor = colorStr;
            });
        }
        this.negativeFillStartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.negativeFill.varShading.gradient.startColor, function (colorStr) {
                self.variableShadingOptions.negativeFill.varShading.gradient.startColor = colorStr;
            });
        }
        this.negativeFillEndColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.negativeFill.varShading.gradient.endColor, function (colorStr) {
                self.variableShadingOptions.negativeFill.varShading.gradient.endColor = colorStr;
            });
        }
        this.correctFillingStyleVarShading = function() {
            self.shadingOptions.isNegPosFill = self.displayType;
            self.variableShadingOptions.fill.display = !self.displayType;
            self.variableShadingOptions.positiveFill.display = self.displayType;
            self.variableShadingOptions.negativeFill.display = self.displayType;
        }

        this.arrayPaletteToString = function(palette){
            return JSON.stringify(palette);
        }
        this.disablePointer = function (cond) {
            let style = {};
            if (cond) {
                style = {
                    "opacity": "0.5",
                    "pointer-events": "none"
                }
            }
            return style;
        }
        this.onRoundValue = function (){
            if(self.variableShadingOptions.fill.varShading.startX) 
                self.variableShadingOptions.fill.varShading.startX = parseFloat(self.variableShadingOptions.fill.varShading.startX.toFixed(4));
            if(self.variableShadingOptions.fill.varShading.endX) 
                self.variableShadingOptions.fill.varShading.endX = parseFloat(self.variableShadingOptions.fill.varShading.endX.toFixed(4));

            if(self.variableShadingOptions.positiveFill.varShading.startX) 
                self.variableShadingOptions.positiveFill.varShading.startX = parseFloat(self.variableShadingOptions.positiveFill.varShading.startX.toFixed(4));
            if(self.variableShadingOptions.positiveFill.varShading.endX) 
                self.variableShadingOptions.positiveFill.varShading.endX = parseFloat(self.variableShadingOptions.positiveFill.varShading.endX.toFixed(4));

            if(self.variableShadingOptions.negativeFill.varShading.startX) 
                self.variableShadingOptions.negativeFill.varShading.startX = parseFloat(self.variableShadingOptions.negativeFill.varShading.startX.toFixed(4));
            if(self.variableShadingOptions.negativeFill.varShading.endX) 
                self.variableShadingOptions.negativeFill.varShading.endX = parseFloat(self.variableShadingOptions.negativeFill.varShading.endX.toFixed(4));

        }
        
        async.parallel([function (callback) {
            if (!controlCurve.lineProperties) {
                controlCurve.lineProperties = {};
                const scale = wiApiService.scaleCurve(self.shadingOptions.idControlCurve, function(scale) {
                    controlCurve.lineProperties.minScale = scale.minScale;
                    controlCurve.lineProperties.maxScale = scale.maxScale;
                    if (callback) callback();
                });
            }
            else {
                if (callback) callback();
            }

        }, function(callback) {
            utils.getPalettes(function(paletteList){
                paletteNameArr = Object.keys(paletteList);
                paletteValArr = JSON.stringify(Object.values(paletteList));
                callback();

            });
        }], function(err, result) {
            initVariableShadingOptions();
        });

        // Call Backend API

        function initVariableShadingOptions() {
            self.variableShadingOptions = {
                controlCurve : self.shadingOptions.controlCurve ? self.shadingOptions.controlCurve : controlCurve,
                fill : {
                    display : !self.shadingOptions.isNegPosFill,
                    varShading : self.shadingOptions.fill.varShading ? self.shadingOptions.fill.varShading : {
                        startX : controlCurve.lineProperties.minScale,
                        endX : controlCurve.lineProperties.maxScale,
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
                    }
                },
                positiveFill : {
                    display : self.shadingOptions.isNegPosFill && self.shadingOptions.positiveFill.display,
                    varShading : self.shadingOptions.positiveFill.varShading ? self.shadingOptions.positiveFill.varShading : {
                        startX : controlCurve.lineProperties.minScale,
                        endX : controlCurve.lineProperties.maxScale,
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
                    }
                },
                negativeFill : {
                    display : self.shadingOptions.isNegPosFill && self.shadingOptions.negativeFill.display,
                    varShading : self.shadingOptions.negativeFill.varShading ? self.shadingOptions.negativeFill.varShading : {
                        startX : controlCurve.lineProperties.minScale,
                        endX : controlCurve.lineProperties.maxScale,
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
                    }
                }
            };
            //customFills

            if(self.variableShadingOptions.fill.varShading.customFills){
                self.customFillsCurrent = self.variableShadingOptions.fill.varShading.customFills;
            };

            self.varShadingType = self.shadingOptions.isNegPosFill ? 
                                    self.variableShadingOptions.positiveFill.varShading.varShadingType 
                                    : self.variableShadingOptions.fill.varShading.varShadingType;

            // comment Y_Y
            function getPaletteNameByValue(palVal) {
                let idx = paletteValArr.indexOf(JSON.stringify(palVal));
                return paletteNameArr[idx];
            }
            if(self.variableShadingOptions.fill && self.variableShadingOptions.fill.display == true) {
                if(Array.isArray(self.variableShadingOptions.fill.varShading.palette))
                    self.variableShadingOptions.fill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.fill.varShading.palette);
            }
            if(self.variableShadingOptions.positiveFill && self.variableShadingOptions.positiveFill.display == true){
                if(Array.isArray(self.variableShadingOptions.positiveFill.varShading.palette))
                    self.variableShadingOptions.positiveFill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.positiveFill.varShading.palette);
            }
            if(self.variableShadingOptions.negativeFill && self.variableShadingOptions.negativeFill.display == true){
                if(Array.isArray(self.variableShadingOptions.negativeFill.varShading.palette))
                    self.variableShadingOptions.negativeFill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.negativeFill.varShading.palette);
            }

        }

        this.displayType = this.shadingOptions.isNegPosFill;

        this.foregroundCustomFills = function(index){
            $timeout(function() {
                DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.fill.varShading.customFills.content[index].foreground, function (colorStr) {
                    self.variableShadingOptions.fill.varShading.customFills.content[index].foreground = colorStr;
                });
            });
        }
        this.backgroundCustomFills = function(index){
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.fill.varShading.customFills.content[index].background, function (colorStr) {
                self.variableShadingOptions.fill.varShading.customFills.content[index].background = colorStr;
            });
        };

        this.idx = null;
        this.setClickedRow = function(index){
            $scope.selectedRow = index;
            self.idx = index;
        };
        this.removeRow = function() {
            self.variableShadingOptions.fill.varShading.customFills.content.splice(self.idx, 1);
        }
        this.addRow = function(){
            self.variableShadingOptions.fill.varShading.customFills.content.push({
                lowVal: null,
                highVal: null,
                pattern: "none",
                foreground: "black",
                background: "blue",
                description: ""
            });
        }

        this.customFillsList = null;
        let cfEmpty = [{name: '', content: []}];
        wiApiService.getCustomFills(function(customFillsList){
            self.customFillsList = cfEmpty.concat(customFillsList);

        });
        this.setCustomFills = function(){
            self.variableShadingOptions.fill.varShading.customFills = angular.copy(self.customFillsCurrent);
        };
        this.saveCustomFills = function() {
            self.customFillsCurrent = self.variableShadingOptions.fill.varShading.customFills
            if(!self.customFillsCurrent.name) {
                DialogUtils.errorMessageDialog(ModalService, 'Add name CustomFills to save!');
            }
            else {
                wiApiService.getCustomFills(function(customFillsList){
                    let checkName = false;
                    customFillsList.forEach(function(c) {
                        if(self.customFillsCurrent.name == c.name) checkName = true;
                    });
                    if(checkName) {
                        DialogUtils.confirmDialog(ModalService, 'Save CustomFills', 'Template "'+ self.customFillsCurrent.name + '" existed. Do you want to overwrite the existing object?', function(ret) {
                            if(ret) saveCF();
                        });
                    } else saveCF();
                });
            };
            function saveCF() {
                wiApiService.saveCustomFills(self.customFillsCurrent, function(customFills){
                    wiApiService.getCustomFills(function(customFillsList){
                        self.customFillsList = cfEmpty.concat(customFillsList);
                    });
                });
            };
        };
        this.setVarShadingType = function() {
            if(self.varShadingType == 'customFills') {
                self.displayType = false;
                self.shadingOptions.isNegPosFill = false;
                self.variableShadingOptions.fill.display = true;
            }
        }
        this.setCustomFillsIfNull = function() {
            self.displayType = false;
            self.shadingOptions.isNegPosFill = false;
            self.variableShadingOptions.fill.display = true;

            if(!self.variableShadingOptions.fill.varShading.customFills) {
                self.variableShadingOptions.fill.varShading.customFills = {
                    name:null,
                    content: [{
                        lowVal: null,
                        highVal: null,
                        pattern: "none",
                        foreground: "black",
                        background: "blue",
                        description: ""
                    }]
                }
            }
        }
        function validateCustomFills (content) {
            let XValue = [self.variableShadingOptions.fill.varShading.startX, self.variableShadingOptions.fill.varShading.endX];
            XValue.sort(function(a, b) {
                return a - b;
            });

            let lowArr = [];
            let highArr =[];
            let message = null;
            let checkErr = null;
            if (!content.length) {
                message = 'Please add custom fills!';
            }
            content.forEach(function(c, index) {
                lowArr.push(c.lowVal);
                highArr.push(c.highVal);

                if (utils.isEmpty(c.lowVal) 
                    || utils.isEmpty(c.highVal)) checkErr = "invalid";
                if(!checkErr && (c.lowVal < XValue[0] || c.highVal < XValue[0] 
                                || c.lowVal > XValue[1] || c.highVal > XValue[1])) checkErr = "outRange";
                if(!checkErr) {
                    let contentClone = angular.copy(content);
                    contentClone.splice(index, 1);
                    contentClone.forEach(function(ct) {
                        let ctValue = [ct.lowVal, ct.highVal];
                        ctValue.sort(function(a, b) {
                            return a - b;
                        });
                        if ((c.lowVal > ctValue[0] && c.lowVal < ctValue[1]) 
                            || (c.highVal > ctValue[0] && c.highVal < ctValue[1])) checkErr = "overlap";
                    });
                }
            });
            if (checkErr == "invalid") message = 'CustomFills: Low value or High value is invalid!';
            if (checkErr == "outRange") message = 'CustomFills: Please enter a value not above ' 
                                                    + self.variableShadingOptions.fill.varShading.startX + '-' 
                                                    + self.variableShadingOptions.fill.varShading.endX+ '!';
            if (checkErr == "overlap") message = 'CustomFills: Values overlap!';
            return message;
        }
        function isValid() {
            self.errorReason = null;
            if(!self.shadingOptions.idRightLine) {
                self.errorReason = "Right curve is required";
                return false;
            }
            if ( self.shadingOptions.idRightLine == self.shadingOptions.idLeftLine ) {
                self.errorReason = "Right curve and left curve cannot be the same";
                return false;
            }
            if (!self.shadingOptions.idLeftLine && isNaN(parseInt(self.shadingOptions.leftFixedValue))) {
                self.errorReason = "Shading properties is invalid";
                return false;
            }
            return true;

        }
        
        this._options = {};
        function doApply(_callback) {
            self.variableShadingOptions.fill.varShading.varShadingType = self.varShadingType;
            self.variableShadingOptions.positiveFill.varShading.varShadingType = self.varShadingType;
            self.variableShadingOptions.negativeFill.varShading.varShadingType = self.varShadingType;

            let message = null;
            if (self.shadingOptions.shadingStyle == 'varShading' 
                && self.variableShadingOptions.fill.varShading.varShadingType == 'customFills') 
            {
                message = validateCustomFills(self.variableShadingOptions.fill.varShading.customFills.content);
            }
            if(!message) {
                let temp = utils.mergeShadingObj(self.shadingOptions, self.fillPatternOptions, self.variableShadingOptions);
                self._options = {
                    _index : shadingOptions._index,
                    changed : (!utils.isEmpty(shadingOptions.changed) &&  shadingOptions.changed == 0)
                                ? (shadingOptions.changed = 2) : shadingOptions.changed,
                    idControlCurve : self.variableShadingOptions.controlCurve.id,
                    idLeftLine : self.shadingOptions.leftCurve ? self.shadingOptions.leftCurve.id : null,
                    idRightLine : self.shadingOptions.rightCurve.id,
                    leftCurve : self.shadingOptions.leftCurve,
                    rightCurve : self.shadingOptions.rightCurve,
                    idShading : shadingOptions.idShading,
                    idTrack : shadingOptions.idTrack,
                    isNegPosFill : self.shadingOptions.isNegPosFill,
                    leftFixedValue : self.shadingOptions.leftFixedValue,
                    name : self.shadingOptions.name,
                    shadingStyle : self.shadingOptions.shadingStyle,
                    fill : temp.fill,
                    positiveFill : temp.positiveFill,
                    negativeFill : temp.negativeFill
                };
                console.log("_options", self._options);
                _callback();
            } else {
                DialogUtils.warningMessageDialog(ModalService, message);
            };
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
        this.onApplyButtonClicked = function () {
            doApply(function() {
                callback(self._options);
            });
        };
        this.onOkButtonClicked = function () {
            doApply(function() {
                close(self._options, 100);
            });
        };
    }
    ModalService.showModal({
        templateUrl: 'shading-attribute-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (options) {
            helper.removeBackdrop();
            if (options) {
                console.log("callback options" , options);
                callback(options);
            }
        });
    });
}
exports.newProjectDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService) {
        let self = this;
        this.disabled = false;
        this.error = null;

        this.onOkButtonClicked = function () {
            self.error = '';
            self.disabled = true;

            let data = {
                name: $scope.name,
                company: $scope.company,
                department: $scope.department,
                description: $scope.description
            };
            console.log("This data: ", data);


            wiApiService.post('/project/new', data)
                .then(function (response) {
                    console.log('response', response);

                    return close(response, 500);
                })
                .catch(function (err) {
                    self.disabled = false;
                    return self.error = err;
                })
                .then(function () {
                    $scope.$apply();
                });
        };

        this.onCancelButtonClicked = function () {
            console.log('onCancelButtonClicked');
            // close(null, 500);
        }
    }

    ModalService.showModal({
        templateUrl: 'new-project/new-project-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();

        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        });
    });
};

exports.openProjectDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService) {
        let self = this;
        this.error = null;
        this.projects = [];
        this.idProject = null;
        this.disabled = false;
        this.selectedProject = {};

        wiApiService.post('/project/list', null)
            .then(function (projects) {
                console.log('response', projects);

                self.projects = projects;
            })
            .catch(function (err) {
                return self.error = err;
            })
            .then(function () {
                $scope.$apply();
            });

        this.fillInfo = function () {
            self.projects.forEach(function (item) {
                if (self.idProject == item.idProject) {
                    self.selectedProject = item;
                }
            });
        };

        this.onOkButtonClicked = function () {
            self.error = '';
            self.disabled = true;

            let data = {
                idProject: self.idProject
            };

            wiApiService.post('/project/fullinfo', data)
                .then(function (response) {
                    return close(response, 500);
                })
                .catch(function (err) {
                    self.disabled = false;
                    return self.error = err;
                })
                .then(function () {
                    $scope.$apply();
                });
        };

        this.onCancelButtonClicked = function () {
            console.log('onCancelButtonClicked');
        }
    }

    ModalService.showModal({
        templateUrl: 'open-project/open-project-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        })
    });
};

exports.confirmDialog = function (ModalService, titleMessage, confirmMessage, callback) {
    function ModalController($scope, close) {
        this.title = titleMessage;
        this.confirmMsg = confirmMessage;
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "confirm/confirm-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.promptDialog = function (ModalService, titleMessage, input, callback) {
    function ModalController($scope, close) {
        this.error = null;
        this.title = titleMessage;
        this.input = input;
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "prompt/prompt-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.unitSettingDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        this.defaultData = {
            Default: {
                unitSystem: "Default",
                caliper: "in",
                neutron: "v/v",
                gammaRay: "api",
                acoustic: "us/ft",
                pressure: "psi",
                bitSize: "in",
                density: "g/cm3",
                concentration: "v/v",
                permeability: "mD",
                porosity: "v/v",
                angle: "deg",
                resistivity: "ohm.m",
                saturation: "v/v",
                temperature: "degC",
                volume: "v/v",
                sp: "mv",
                length: "m",
                time: "s",
                area: "m2",
                flow: "t",
                speed: "m/s",
                force: "N"
            },
            Canadian: {
                unitSystem: "Canadian",
                caliper: "cm",
                neutron: "%",
                gammaRay: "api",
                acoustic: "us/m",
                pressure: "psi",
                bitSize: "cm",
                density: "kg/m3",
                concentration: "ppm",
                permeability: "mD",
                porosity: "v/v",
                angle: "deg",
                resistivity: "ohm.m",
                saturation: "v/v",
                temperature: "degC",
                volume: "v/v",
                sp: "mv",
                length: "m",
                time: "s",
                area: "m2",
                flow: "t",
                speed: "m/s",
                force: "N"
            },
            English: {
                unitSystem: "English",
                caliper: "in",
                neutron: "%",
                gammaRay: "api",
                acoustic: "us/ft",
                pressure: "psi",
                bitSize: "in",
                density: "g/cm3",
                concentration: "ppm",
                permeability: "mD",
                porosity: "v/v",
                angle: "deg",
                resistivity: "ohm.m",
                saturation: "v/v",
                temperature: "degC",
                volume: "v/v",
                sp: "mv",
                length: "m",
                time: "s",
                area: "m2",
                flow: "t",
                speed: "m/s",
                force: "N"
            },
            Metric: {
                unitSystem: "Metric",
                caliper: "cm",
                neutron: "%",
                gammaRay: "api",
                acoustic: "us/ft",
                pressure: "mBar",
                bitSize: "cm",
                density: "g/cm3",
                concentration: "ppm",
                permeability: "mD",
                porosity: "v/v",
                angle: "deg",
                resistivity: "ohm.m",
                saturation: "v/v",
                temperature: "degC",
                volume: "v/v",
                sp: "mv",
                length: "m",
                time: "s",
                area: "m2",
                flow: "t",
                speed: "m/s",
                force: "N"
            },
            Russian: {
                unitSystem: "Russian",
                caliper: "cm",
                neutron: "%",
                gammaRay: "api",
                acoustic: "us/ft",
                pressure: "mBar",
                bitSize: "cm",
                density: "g/cm3",
                concentration: "ppm",
                permeability: "mD",
                porosity: "v/v",
                angle: "deg",
                resistivity: "ohm.m",
                saturation: "v/v",
                temperature: "degC",
                volume: "v/v",
                sp: "mv",
                length: "m",
                time: "s",
                area: "m2",
                flow: "t",
                speed: "m/s",
                force: "N"
            }
        };
        this.allData = {
            unitSystem: ["Default", "Canadian", "English", "Metric", "Russian"],
            caliper: ["in", "m", "cm", "Ft", "1.Ft", "mm", "um"],
            neutron: ["v/v", "Trac", "%", "pu", "imp/min"],
            gammaRay: ["api", "GAPI", "uR/h", "GAMA"],
            acoustic: ["us/ft", "us/m"],
            pressure: ["psi", "Pa", "kPa", "MPa", "mBar", "Bar", "kg/m2", "atm", "torr"],
            bitSize: ["in", "m", "cm", "Ft", "1.Ft", "mm", "um"],
            density: ["g/cm3", "kg/m3"],
            concentration: ["v/v", "%", "ppm", "kpp", "m", "1/L", "mS/m", "1/kg", "dB/m", "mV", "galUS/min", "mD/cP", "b/elec", "b/cm3", "m3/d", "MV"],
            permeability: ["mD", "D"],
            porosity: ["v/v", "m3/m3", "ft3/ft3", "%", "imp/min", "ratio"],
            angle: ["deg", "dega", "grad", "rad"],
            resistivity: ["ohm.m", "ratio"],
            saturation: ["v/v", "m3/m3", "ft3/ft3", "%", "ratio"],
            temperature: ["degC", "degF"],
            volume: ["v/v", "cm3", "L.m"],
            sp: ["mv"],
            length: ["m"],
            time: ["s"],
            area: ["m2"],
            flow: ["t"],
            speed: ["m/s", "m2", "ft/h", "ratio", "ft/s", "m/min", "rpm", "mn/m"],
            force: ["N"]
        };
        function copyObj(sourceObj, destObj) {
            for (var attr in sourceObj) {
                destObj[attr] = sourceObj[attr];
            }
        }
        this.selectedData = {};
        var self = this;
        copyObj(self.defaultData.Default, self.selectedData);
        this.setDefault = function () {
            copyObj(self.defaultData.Default, self.selectedData);
        };
        this.changeDefault = function () {
            switch (self.selectedData.unitSystem) {
                case "Default":
                    copyObj(self.defaultData.Default, self.selectedData);
                    break;
                case "Canadian":
                    copyObj(self.defaultData.Canadian, self.selectedData);
                    break;
                case "English":
                    copyObj(self.defaultData.English, self.selectedData);
                    break;
                case "Metric":
                    copyObj(self.defaultData.Metric, self.selectedData);
                    break;
                case "Russian":
                    copyObj(self.defaultData.Russian, self.selectedData);
                    break;
                default:
                    console.log("Error: NULL");
                    break;
            }
        };
        console.log(self.selectedData.unitSystem)
        this.close = function (ret) {
            close(ret);

        }
    }

    ModalService.showModal({
        templateUrl: "unit-setting/unit-setting-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });

};
// add new well
exports.addNewDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService) {
        let self = this;
        this.isDisabled = false;

        let projectData = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        this.onOkButtonClicked = function () {
            self.error = '';
            self.isDisabled = true;

            let data = {
                name: self.wellName,
                idProject: projectData.idProject,
                topDepth: self.topDepth,
                bottomDepth: self.bottomDepth,
                step: self.step
            };
            console.log("data new well: ", data);

            wiApiService.post('/project/well/new', data)
                .then(function (response) {
                    console.log('response', response);

                    return close(response, 500);
                })
                .catch(function (err) {
                    console.error('new well', err);
                    self.isDisabled = false;
                    return self.error = err;
                })
                .then(function () {
                    $scope.$apply();
                });
        };

        this.onCancelButtonClicked = function () {
            console.log("oncCancelButtonClicked");
        }
    }

    ModalService.showModal({
        templateUrl: "add-new-well/add-new-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            callback(data);
        });
    });
};

exports.wellHeaderDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        this.wellHeader = ["well1", "well2", "well3"];
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "well-header/well-header-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.depthConversionDialog = function (ModalService, DialogUtils, callback) {
    console.log(DialogUtils);
    function ModalController($scope, close) {
        this.close = function (ret) {
            close(ret);
        };


        this.selectWell = "well1";
        this.selectWellList = ["well1", "well2", "well3"];
        this.originalsDepth = {
            step: 5,
            topDepth: 200,
            bottomDepth: 500
        };

        this.runClick = function () {
            console.log("Click run");
            DialogUtils.confirmDialog(ModalService, "Depth Conversion ", "Change wells depth and step?", function (ret) {
                console.log(ret);
                $scope.newDepth = {
                    step: $scope.step,
                    topDepth: $scope.topDepth,
                    bottomDepth: $scope.bottomDepth,
                    fixed: $scope.fixed
                };
                console.log($scope.newDepth);
            });

        }
    }

    ModalService.showModal({
        templateUrl: "depth-conversion/depth-conversion-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.curveAliasDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        this.addCurveName = function (curveAlias) {

        }
        this.isSelected = function (item) {
            console.log(item);
            return "";
        }


        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-alias/curve-alias-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.familyEditDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "family-edit/family-edit-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.newBlankLogplotDialog = function (ModalService, callback) {
    function ModalController($scope, close, $timeout, wiComponentService, wiApiService) {
        let self = this;
        // self.name = "BlankLogPlot";
        self.error = null;
        self.disabled = false;

        this.onOkButtonClicked = function () {
            close(self.name);
        }

    }

    ModalService.showModal({
        templateUrl: "blank-logplot/blank-logplot-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (newPlot) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (callback) callback(newPlot);
        });
    });
}

exports.tripleComboDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let error = null;
        let self = this;
        $scope.name = "TripleCombo";

        this.onOkButtonClicked = function () {
            self.name = $scope.name;
            console.log(self.name);

        }
    }

    ModalService.showModal({
        templateUrl: "triple-combo/triple-combo-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            callback(ret);
        });
    });
}
exports.densityNeutronDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let error = null;
        let self = this;
        $scope.name = "DensityNeutron";
        this.onOkButtonClicked = function () {
            self.name = $scope.name;
            console.log(self.name);
        }
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "density-neutron/density-neutron-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.resistivitySonicDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let error = null;
        let self = this;
        $scope.name = "ResistivitySonic";
        this.onOkButtonClicked = function () {
            self.name = $scope.name;
            console.log(self.name);
        }
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "resistivity-sonic/resistivity-sonic-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.threeTracksBlankDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let error = null;
        let self = this;
        $scope.name = "3TracksBlank";
        this.onOkButtonClicked = function () {
            self.name = $scope.name;
            console.log(self.name);
        }
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "3-tracks-blank/3-tracks-blank-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.inputCurveDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let error = null;
        let self = this;
        $scope.name = "inputCurve";
        this.onOkButtonClicked = function () {
            self.name = $scope.name;
            console.log(self.name);
        }
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "input-curve/input-curve-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.lithoSynCurveDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let error = null;
        let self = this;
        $scope.name = "lithoSynCurveDialog";
        this.onOkButtonClicked = function () {
            self.name = $scope.name;
            console.log(self.name);
        }
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        templateUrl: "litho-syn-curve/litho-syn-curve-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.addCurveDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService) {
        let error = null;
        let self = this;

        this.onOkButtonClicked = function () {
            let utils = wiComponentService.getComponent('UTILS');
        };

        this.onCancelButtonClicked = function () {
            console.log("onCancelButtonClicked");
        }
    }

    ModalService.showModal({
        templateUrl: "add-curve/add-curve-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.lineStyleDialog = function (ModalService, callback, options) {
    function ModalController($scope, close) {
        var self = this;
        console.log(options);

        this.options = options;

        console.log("Op", this.options);
        this.styles = [[10, 0], [0, 10], [2, 2], [8, 2], [10, 4, 2, 4], [10, 4, 2, 4, 2, 4]];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.onOkButtonClicked = function () {
            console.log("optionsss: ", self.options);
            close(self.options);
        };

        // this.onCancelButtonClicked = function () {
        //     close(null);
        // };
    }

    ModalService.showModal({
        templateUrl: "line-style/line-style-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log(ret);
            callback(ret);
        });
    });
}

exports.symbolStyleDialog = function (ModalService, callback, options) {
    function ModalController($scope, close) {
        var self = this;
        console.log(options);
        this.options = options;
        console.log(this.options);
        // this.options = {
        //     lines: {
        //         color: '#ff0000',
        //         style: {
        //             name: 'solid',
        //             param: [10, 0]
        //         }
        //         ,
        //         width: {
        //             name: "1",
        //             param: 1
        //         }
        //     },
        //     solidFill: '#000',
        //     patternFill: {
        //         pattern: "chert",
        //         background: "#fff",
        //         foreground: "#000"
        //     }
        // };
        /*this.symbolOptions = {
                display: false,
                symbolStyle: {
                    name: "circle", // cross, diamond, star, triangle, dot, plus
                    size: 4,
                    strokeStyle: "black",
                    fillStyle: "transparent",
                    lineWidth : 1,
                    lineDash: [10, 0]
                }
            }*/
        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.styles = [[10, 0], [0, 10], [2, 2], [8, 2], [10, 4, 2, 4], [10, 4, 2, 4, 2, 4]];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.onOkButtonClicked = function () {
            close(self.options);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: "symbol-style/symbol-style-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log(ret);
            callback(ret);
        });
    });
}
exports.curvePropertiesDialog = function (ModalService, wiComponentService, wiApiService, DialogUtils, currentCurve, currentTrack, wiLogplotCtrl, callback) {
    let thisModalController = null;

    function ModalController($scope, close) {
        let error = null;
        let self = this;
        console.log("currentCurve", currentCurve);
        thisModalController = this;
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.well = utils.findWellByLogplot(wiLogplotCtrl.id);

        let extentY = currentCurve.getExtentY();

        if (currentCurve.line) {
            this.lineOptions = {
            display: true,
            lineStyle: {
                lineColor : currentCurve.line.color,
                lineWidth : currentCurve.line.width,
                lineStyle : currentCurve.line.dash
                }
            }
        }
        else {
            this.lineOptions = {
            display: false,
            lineStyle: {
                lineColor : "black",
                lineWidth : 1,
                lineStyle : [0]
                }
            }
        }
        if (currentCurve.symbol) {
            this.symbolOptions = {
                display: true,
                symbolStyle: {
                    symbolName: currentCurve.symbol.style, // cross, diamond, star, triangle, dot, plus
                    symbolSize: currentCurve.symbol.size,
                    symbolStrokeStyle: currentCurve.symbol.strokeStyle,
                    symbolFillStyle: currentCurve.symbol.fillStyle,
                    symbolLineWidth : currentCurve.symbol.lineWidth,
                    symbolLineDash: currentCurve.symbol.lineDash
                }
            }
        }
        else {
            this.symbolOptions = {
                display: false,
                symbolStyle: {
                    symbolName: "circle", // cross, diamond, star, triangle, dot, plus
                    symbolSize: 4,
                    symbolStrokeStyle: "black",
                    symbolFillStyle: "transparent",
                    symbolLineWidth : 1,
                    symbolLineDash: [10, 0]
                }
            }
        }
        this.lineObjTemplate = {
            minDepth: extentY[0],
            maxDepth: extentY[1],
            name : currentCurve.name
        }

        this.curveOptions = utils.curveOptions(currentTrack, currentCurve);


        this.drawSample = function () {
            displayLine(self.lineOptions, self.symbolOptions);
        }
        this.selectData = {
            displayMode: ["Line", "Symbol", "Both", "None"],
            wrapMode: ["None", "Left", "Right", "Both"],
            symbolType: ["circle", "cross", "diamond", "dot", "plus", "square", "star", "triangle"],
            blockPosition: ["None", "Start", "Middle", "End", "None"],
            logLinear: ["Linear", "Logarithmic"],
            displayAs: ["Normal", "Culmulative", "Mirror", "Pid"]
        };

        function displayLine(lineOptions, symbolOptions) {
            let sample = $('#sample')[0];
            let context = sample.getContext('2d');
            context.clearRect(0, 0, sample.width, sample.height);
            var x = [5, 50, 100, 150, 195];
            var y = [180, 40, 20, 40, 180];
            function drawSegment (context, x1, y1, x2, y2) {
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
                        context.strokeStyle = style.symbolStyle.symbolStrokeStyle;
                        context.fillStyle = style.symbolStyle.symbolFillStyle;
                        context.lineWidth = style.symbolStyle.symbolLineWidth;
                        context.setLineDash(style.symbolStyle.symbolLineDash);
                        context.arc(x, y, style.symbolStyle.symbolSize, 0, 2*Math.PI);
                        context.closePath();
                        context.stroke();
                        context.fill();
                        break;
                    case "dot":
                        // context.strokeStyle = style.symbolColor;
                        // context.arc(x, y, 1, 0)
                        break;
                    case "square":
                        break;
                }
                console.log('Draw symbol');
            }
            for (let i = 0; i < x.length-1; i++) {
                if( lineOptions && lineOptions.display )
                    drawSegment(context, x[i], y[i], x[i + 1], y[i + 1]);
            }
            for (let i = 0; i < x.length; i++) {
                if( symbolOptions && symbolOptions.display ) {
                    console.log(self.symbolOptions);
                    drawSymbol(context, x[i], y[i], self.symbolOptions);
                }
            }

        }
        this.disabledByLine = function() {
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
        this.disabledBySymbol =  function() {
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
        this.disabledByBoth = function() {
            $('#wrapMode').prop("disabled", false);
            $('#symbolType').prop("disabled", false);
            $('#blockPosition').prop("disabled", true);
            $('#ignore').prop("disabled", false);
            $('#symbolSize').prop("disabled", false);
            $('#editSymbolStyle').prop("disabled", false);
            $('#editLineStyle').prop("disabled", false);
            self.lineOptions.display = true;
            self.symbolOptions.display = true;
        }
        this.disabledByNone =  function() {
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
            switch (self.curveOptions.displayMode) {
                case "Line":
                    self.disabledByLine();
                    break;
                case "Symbol":
                    self.disabledBySymbol();
                    break;
                case "Both":
                    self.disabledByBoth();
                    break;
                case "None":
                    self.disabledByNone();
                    break;
                default:
                    console.log("Error: NULL");
                    break;
            }
            self.drawSample();
        };
        function updateLine(callback) {
            let lineObj = utils.mergeLineObj(self.curveOptions, self.lineOptions.lineStyle, self.symbolOptions.symbolStyle);
            utils.changeLine(lineObj, wiApiService, function () {
                currentCurve.setProperties(lineObj);
                currentTrack.plotCurve(currentCurve);

                if (callback) callback();
            });
        }
        this.onEditLineStyleButtonClicked = function () {
            DialogUtils.lineStyleDialog(ModalService, function (options) {
                console.log("options", options);
                self.lineOptions = options;
                self.drawSample();
            }, self.lineOptions);
        };
        this.onEditSymbolStyleButtonClicked = function () {
            DialogUtils.symbolStyleDialog(ModalService, function (options) {
                self.symbolOptions = options;
                console.log(self.symbolOptions);
                self.drawSample();
            }, self.symbolOptions);
        };
        this.onApplyButtonClicked = function () {
            updateLine();
        };
        this.onOkButtonClicked = function () {
            updateLine(function() {
              close(null, 100);
            });
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-properties/curve-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
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
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (callback) callback(ret);
        });
    });
};

exports.importLASDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiComponentService, wiApiService) {
        let self = this;
        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        this.selectedWell = null;
        this.selectedDataset = null;
        this.isDisabled = true;

        this.lasFile = null;
        this.transactionId = Date.now();
        this.onUploadButtonClicked = function () {
            let dataRequest = {
                file: self.lasFile,
                transactionId: self.transactionId
            }
            wiApiService.uploadFile(dataRequest, function (lasInfo) {
                self.lasInfo = lasInfo;
                self.lasInput = angular.copy(lasInfo);
                self.curves = lasInfo.curves;
                self.curves.forEach(function(curve) {
                    curve.inputName = curve.lasName;
                    curve.isLoad = true;
                });
                self.isDisabled = false;
            });
        }

        this.isLoadAll = true;
        this.checkAllButtonClicked = function () {
            if (self.isLoadAll) {
                self.curves.forEach(function(curve) {
                    curve.isLoad = true;
                });
            } else {
                self.curves.forEach(function(curve) {
                    curve.isLoad = false;
                });
            }
        }

        this.invertCheckButtonClicked = function () {
            self.curves.forEach(function(curve) {
                curve.isLoad = !curve.isLoad;
            });
        }

        this.onLoadButtonClicked = function () {

        }

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "import-LAS/import-LAS-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(data);
        });
    });
};

exports.importLASDialog1 = function (ModalService, callback) {
    function ModalController($scope, close, wiComponentService, wiApiService) {
        let self = this;

        this.lasFile = null;
        this.selectedWell = null;
        this.selectedDataset = null;
        this.isDisabled = false;

        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        this.onLoadButtonClicked = function () {
            console.log('las file: ', self.lasFile);
            console.log('selectedWell: ', self.selectedWell);
            console.log('selectedDataset: ', self.selectedDataset);

            if (!self.lasFile) return;

            self.isDisabled = true;

            let payloadParams = {
                id_project: self.projectLoaded.idProject
            };

            if (self.selectedWell) {
                payloadParams.id_well = self.selectedWell.idWell;
            }

            if (self.selectedDataset) {
                payloadParams.id_dataset = self.selectedDataset.idDataset;
            }

            payloadParams.file = self.lasFile;

            wiApiService.postWithFile('/file', payloadParams)
                .then(function (well) {
                    console.log('well response', well);

                    return close(well, 500);
                })
                .catch(function (err) {
                    console.log('err', err);
                    self.isDisabled = false;
                })
        };

        this.onCancelButtonClicked = function () {
            console.log("onCancelButtonClicked");
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "import-LAS/import-LAS-modal.1.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            callback(data);
        });
    });
};

exports.importMultiLASDialog = function (ModalService, callback) {
    function ModalController($scope, close, Upload, wiComponentService, wiApiService) {
        let self = this;
        this.disabled = false;
        this.error = null;

        this.lasFiles = [];
        this.selectedWells = [];
        this.selectedDatasets = [];

        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        console.log('projectLoaded', self.projectLoaded);

        $scope.fileIndex = 0;
        this.onFileClick = function($index) {
            $scope.fileIndex = $index;
        }

        this.onRemoveFileClick = function() {
            self.lasFiles.splice($scope.fileIndex,1);
            self.selectedWells.splice($scope.fileIndex,1);
            self.selectedDatasets.splice($scope.fileIndex,1);
        }

        this.onRemoveAllFilesClick = function() {
            this.lasFiles = [];
            this.selectedWells = [];
            this.selectedDatasets = [];
        }

        this.onLoadButtonClicked = function () {
            let payloadParams = {
                id_project: self.projectLoaded.idProject,
                id_wells: [],
                id_datasets: []
            };
            payloadParams.file = self.lasFiles;

            for (let i = 0; i < self.lasFiles.length; i++) {
                if (self.selectedWells[i]) {
                    payloadParams.id_wells[i] = self.selectedWells[i].idWell;
                } else {
                    payloadParams.id_wells[i] = "";
                }
                if (self.selectedDatasets[i]) {
                    payloadParams.id_datasets[i] = self.selectedDatasets[i].idDataset;
                } else {
                    payloadParams.id_datasets[i] = "";
                }
            }
            console.log('payloadParams', payloadParams);
            wiApiService.postMultiFiles('/files', payloadParams)
                .then(function (wells) {
                    console.log('wells response', wells);
                    return close(wells, 100);
                })
                .catch(function (err) {
                    console.log('err', err);
                });
        };

        this.onCancelButtonClicked = function () {
            console.log("onCancelButtonClicked");
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "import-multi-LAS/import-multi-LAS-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            callback(data);
        });
    });
};
exports.fillPatternSettingDialog = function (ModalService, callback, options) {
    function ModalController($scope, close, wiComponentService, $timeout) {
        let self = this;
        this.disabled = false;
        this.error = null;

        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        console.log("$$", graph);

        if (options) {
            this.options = options;
        }
        else {
            this.options = {
                fill: {
                    isFill: false,
                    pattern: "chert",
                    foreground: "#ff0",
                    background: "#f0f"
                },
                positiveFill:{
                    isFill: false,
                    pattern: "chert",
                    foreground: '#000',
                    background: '#fff'
                },
                negativeFill:{
                    isFill: false,
                    pattern: "chert",
                    foreground: '#000',
                    background: '#fff'
                }
            };
        }
        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.enableFill = function (idEnable, value) {
            $('#'+ idEnable + " :input").attr("disabled", value);
        }

        this.onOkButtonClicked = function () {
            self.error = '';
            close(self.options, 200);0

        };

        // this.onCancelButtonClicked = function () {
        //     console.log('onCancelButtonClicked');
        //     close(null, 200);
        // }
    }

    ModalService.showModal({
        templateUrl: 'fill-pattern-setting/fill-pattern-setting-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();

        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        });
    });
};
exports.logTrackPropertiesDialog = function (ModalService, currentTrack, wiLogplotCtrl, wiApiService, callback) {

    function ModalController($scope, wiComponentService, close) {
        let error = null;
        let self = this;

        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.well = utils.findWellByLogplot(wiLogplotCtrl.id);

        this.datasets = new Array();

        this.curves = new Array();
        this.curvesLineOptions = new Array();
        this.curvesSymbolOptions = new Array();
        this.curvesChanged = new Array();


        let curveList = currentTrack.getCurves();
        console.log(curveList);
        let shadingList = currentTrack.getShadings();
        console.log("shading", shadingList);
        curveList.forEach(function (curve, index) {
            curve.change = false;
            let curveOptions = {};
            let lineOptions = {};
            let symbolOptions = {};
            curveOptions = utils.curveOptions(currentTrack, curve);
            self.curves.push(curveOptions);
            if (curve.line) {
                lineOptions = {
                    display : true,
                    lineStyle : {
                        lineColor : curve.line.color,
                        lineWidth : curve.line.width,
                        lineStyle : curve.line.dash
                    }
                }

            } else {
                lineOptions = {
                    display : true,
                    lineStyle :{
                        lineColor : "#0ff",
                        lineWidth : 1,
                        lineStyle : [10, 0]
                    }
                }

            }
            self.curvesLineOptions.push(lineOptions);

            if (curve.symbol) {
                symbolOptions = {
                    display: true,
                    symbolStyle: {
                        symbolName: curve.symbol.style, // cross, diamond, star, triangle, dot, plus
                        symbolSize: curve.symbol.size,
                        symbolStrokeStyle: curve.symbol.strokeStyle,
                        symbolFillStyle: curve.symbol.fillStyle,
                        symbolLineWidth : curve.symbol.lineWidth,
                        symbolLineDash: curve.symbol.lineDash
                    }
                }
            }
            else {
                symbolOptions = {
                    display: false,
                    symbolStyle: {
                        symbolName: "circle", // cross, diamond, star, triangle, dot, plus
                        symbolSize: 4,
                        symbolStrokeStyle: "black",
                        symbolFillStyle: "transparent",
                        symbolLineWidth : 1,
                        symbolLineDash: [10, 0]
                    }
                }
            }
            self.curvesSymbolOptions.push(symbolOptions);
            self.curvesChanged.push(false);
        });


        this.well.children.forEach( function(child) {
            if(child.type == 'dataset') self.datasets.push(child);
        });
        console.log("Current Track", currentTrack);
        this.props = {
            general: currentTrack.getProperties()
        }
        console.log("props", this.props.general);

        function fillShadingAttrArray() {
            return [
                {
                    left : {
                        curveName: "DTCO3",
                        fixedValue : "fixed1"
                    },
                    right : {
                        curveName: "DTCO3-3",
                        fixedValue : "fixed2"
                    },
                    shadingName : "shading1",
                    shadingStyle : "Fill Pattern",
                    fillPattern : "",
                    variableShading : ""
                },
                {
                    left : {
                        curveName: "DTCO3-1",
                        fixedValue : "fixed11"
                    },
                    right : {
                        curveName: "DTCO3-3-1",
                        fixedValue : "fixed21"
                    },
                    shadingName : "shading1",
                    shadingStyle : "Fill Pattern",
                    fillPattern : "",
                    variableShading : ""
                },
                {
                    left : {
                        curveName: "DTCO3-2",
                        fixedValue : "fixed12"
                    },
                    right : {
                        curveName: "DTCO3-3-2",
                        fixedValue : "fixed22"
                    },
                    shadingName : "shading1",
                    shadingStyle : "Fill Pattern",
                    fillPattern : "",
                    variableShading : ""
                }
            ];

        };

         this.fillOptions = {
            fill: {
                foreground: "#0000ff",
                background: "#ffff00",
                pattern : "chert"
            },
            positiveFill:{
                pattern: null,
                foreground: '#00ff00',
                background: '#ffff00'
            },
            negativeFill:{
                pattern: null,
                foreground: '#ff0000',
                background: '#ff0'
            }
        }


        this.logLinear = ["Logarithmic", "Linear"];
        this.displayMode = ["Line", "Symbol", "Both", "None"];
        this.displayAs = ["Normal", "Culmulative", "Mirror", "Pid"];



        //tab Shading
        this.setClickedRowShading = function(index){
            self.selectedRowShading = index;
            self.selectedShading = self.shadingAttr[index];
        };
        this.arrowUpShading = function () {
            let prevIdx = -1;
            let idx = self.shadingAttr.indexOf(self.selectedShading);
            console.log(idx);
            if (idx-1 == prevIdx) {
                prevIdx = idx
            } else if (idx > 0) {
                let moveShading = self.shadingAttr.splice(idx, 1)
                console.log(moveShading[0])
                self.shadingAttr.splice(idx-1, 0, moveShading[0]);
            }
            self.setClickedRowShading(idx-1);

        };
        this.arrowDownShading = function () {
            let prevIdx = self.shadingAttr.length;
            let idx = self.shadingAttr.indexOf(self.selectedShading);
            console.log(idx);
            if (idx+1 == prevIdx) {
                prevIdx = idx
            } else if (idx < self.shadingAttr.length-1) {
                let moveShading = self.shadingAttr.splice(idx, 1)
                console.log(moveShading[0])
                self.shadingAttr.splice(idx+1, 0, moveShading[0]);
            }
            self.setClickedRowShading(idx+1);
        };
        this.addRow = function () {
            self.curves.push({});
            console.log(self.curves);
        };

        // Dialog buttons
        this.definePatternButtonClicked = function () {
            console.log("define");
            DialogUtils.fillPatternSettingDialog(ModalService, function (options) {
                console.log("fillPattern");
                fillOptions = options;

            }, self.fillOptions);
        };

        this.lineStyleButtonClicked = function (index) {
            console.log(index);
            DialogUtils.lineStyleDialog(ModalService, function (options) {
                console.log("lineStyle");
            }, self.curvesLineOptions[index]);
        };
        this.symbolStyleButtonClicked = function (index) {
            console.log(index);
            DialogUtils.symbolStyleDialog(ModalService, function (options) {
                console.log("symbolStyle");

            }, self.curvesSymbolOptions[index]);
        };

        function updateLine(index) {
            let curveOptions = self.curves[index];
            let lineOptions = self.curvesLineOptions[index].lineStyle;
            let symbolOptions = self.curvesSymbolOptions[index].symbolStyle;
            let lineObj = utils.mergeLineObj(curveOptions, lineOptions, symbolOptions);
            console.log("LINE", lineObj);
            utils.changeLine(lineObj, wiApiService);
            curveList[index].setProperties(lineObj);
            currentTrack.plotCurve(curveList[index]);
        }

        function updateGeneralTab() {
            console.log("props---", self.props.general);
            utils.changeTrack(self.props.general, wiApiService)
            currentTrack.setProperties(self.props.general);
        }
        function updateCurvesTab() {
            console.log("Update");
            self.curvesChanged.forEach(function(item, index) {
                // if(item) {
                //     updateLine(index);
                // }
                updateLine(index);
            });
        }

        function updateShadingsTab() {

        }
        this.onApplyButtonClicked = function () {
            updateGeneralTab();
            updateCurvesTab();
            updateShadingsTab();
        };
        this.onOkButtonClicked = function () {
            updateGeneralTab();
            updateCurvesTab();
            updateShadingsTab();
            close(self.props);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "log-track-properties/log-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(data);
        });
    });
};

exports.depthTrackPropertiesDialog = function(ModalService, callback) {
    function ModalController($scope, wiComponentService, close) {
        let self = this;
        let props = {
            isShowTitle: true,
            title : "Depth",
            topJustification: "center",
            bottomJustification: "center",
            trackColor: '#ffffff',
            width: 0.500,
            depthType: null,
            unitType: 'M',
            decimals: 0
        }
        this.isShowTitle = props.isShowTitle;
        this.title = props.title;
        this.topJustification = props.topJustification;
        this.bottomJustification = props.bottomJustification;
        this.trackColor = props.trackColor;
        this.width = props.width;
        this.depthType = props.depthType;
        this.unitType = props.unitType;
        this.decimals = props.decimals;
        // Dialog buttons
        this.onApplyButtonClicked = function () {
            bindProps();
            callback(props);
        };
        this.onOkButtonClicked = function () {
            bindProps();
            close(props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
        function bindProps() {
            props = {
                isShowTitle: self.isShowTitle,
                title : self.title,
                topJustification: self.topJustification,
                bottomJustification: self.bottomJustification,
                trackColor: self.trackColor,
                width: self.width,
                depthType: self.depthType,
                unitType: self.unitType,
                decimals: self.decimals
            }
        }
    }
    ModalService.showModal({
        templateUrl: "depth-track-properties/depth-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(data);
        });
    });
};

exports.zoneTrackPropertiesDialog = function(ModalService, callback) {
    function ModalController($scope, wiComponentService, close) {
        let self = this;
        let props = {
            isShowTitle: true,
            title : "New Zone",
            topJustification: "center",
            bottomJustification: "center",
            trackColor: '#ffffff',
            width: 0.500,
            parameterSet: null,
            zoneSets: [],
            zoneSet: null
        }
        this.isShowTitle = props.isShowTitle;
        this.title = props.title;
        this.topJustification = props.topJustification;
        this.bottomJustification = props.bottomJustification;
        this.trackColor = props.trackColor;
        this.width = props.width;
        this.parameterSet = props.parameterSet;
        this.zoneSets = props.zoneSets;
        this.zoneSet = props.zoneSet;
        // Dialog buttons
        this.onApplyButtonClicked = function () {
            bindProps();
            callback(props);
        };
        this.onOkButtonClicked = function () {
            bindProps();
            close(props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
        function bindProps() {
            props = {
                isShowTitle: self.isShowTitle,
                title : self.title,
                topJustification: self.topJustification,
                bottomJustification: self.bottomJustification,
                trackColor: self.trackColor,
                width: self.width,
                parameterSet: self.parameterSet,
                zoneSets: self.zoneSets,
                zoneSet: self.zoneSet
            }
        }
    }
    ModalService.showModal({
        templateUrl: "zone-track-properties/zone-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(data);
        });
    });
}

exports.errorMessageDialog = function (ModalService, errorMessage) {
    function ModalController($scope, close) {
        let self = this;
        this.error = errorMessage;
        this.onOkButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'error-message/error-message-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
        })
    });
};
exports.aboutDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let self = this;
        this.aboutApp = {
            version : "1.0x",
            build : "2017-08-01"
        }
        this.onCancelButtonClicked = function () {
            console.log('onCancelButtonClicked');
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'about/about-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        modal.element.draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        })
    });
};

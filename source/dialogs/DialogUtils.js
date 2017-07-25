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
            self.disabled = true;
            let utils = wiComponentService.getComponent(wiComponentService.UTILS);

            let newLogplot = null;
            utils.createNewBlankLogPlot(wiComponentService, wiApiService, self.name)
                .then(function(logplot) {
                    newLogplot = logplot;
                    return utils.refreshProjectState(wiComponentService, wiApiService);
                })
                .then(function() {
                    utils.openLogplotTab(wiComponentService, newLogplot);

                    close(newLogplot);
                })
                .catch(function(err) {
                    console.error('newBlankLogplotDialog err', err);

                    self.disabled = false;
                });
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

exports.lineStyleDialog = function (ModalService, options, callback) {
    function ModalController($scope, close) {
        this.lineColor = "#0000ff";
        this.style = {
            name : 'dotted',
            param : '2, 2'
        };
        this.width = {
            name : '1',
            param : 1
        };

        // if(self.options.defaultColor){
        //     this.lineColor = options.defaultColor;
        // };
        // if(options.defaultStyle){
        //     this.style = options.defaultStyle;
        // };
        // if(options.defaultWidth){
        //     this.width = options.defaultWidth;
        // }

        this.styles =[
            {
                name: 'solid',
                param: '10, 0'
            },
            {
                name : 'none',
                param : '0, 10'
            },
            {
                name : 'dotted',
                param : '2, 2'
            },
            {
                name : 'dashed',
                param : '8, 2'
            },
            {
                name : 'dashdot',
                param : '10, 4, 2, 4'
            },
            {
                name : 'dash2dot',
                param : '10, 4, 2, 4, 2, 4'
            }
        ];
        this.widthes = [
            {
                name : "1",
                param : 1
            },
            {
                name : "2",
                param : 2
            },
            {
                name : "3",
                param : 3
            },
            {
                name : "4",
                param : 4
            },
            {
                name : "5",
                param : 5
            },
            {
                name : "6",
                param : 6
            },
            {
                name : "7",
                param : 7
            },
            {
                name : "8",
                param : 8
            },
            {
                name : "9",
                param : 9
            },
            {
                name : "10",
                param : 10
            }
        ];
        this.options = {
        };
        this.onOkButtonClicked = function () {
            console.log("LO: ", self.options);
            close(self.options);
        };
        this.onApplyButtonClicked = function () {
            self.options = {
                lineColor : this.lineColor,
                width : this.width,
                style : this.style
            };
            callback(self.options)
            console.log("Line options: ", self.options);
        };
        this.onCancelButtonClicked = function () {

        };
    }

    ModalService.showModal({
        templateUrl: "line-style/line-style-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log(ret);
            callback(ret);
        });
    });
}

exports.curvePropertiesDialog = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, close) {
        let error = null;
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        // let utils = wiComponentService.getComponent('UTILS');
        // let projectData = utils.openProject;
        // console.log("dataaa ",projectData);

        this.selectData = {
            displayMode: ["Line", "Symbol", "Both", "None"],
            wrapMode: ["None", "Left", "Right", "Both"],
            symbolType: ["Circle", "Cross", "Diamond", "Dot", "Plus", "Square", "Star", "Triangle"],
            blockPosition: ["None", "Start", "Middle", "End", "None"],
            logLinear: ["Linear", "Logarithmic"],
            displayAs: ["Normal", "Culmulative", "Mirror", "Pid"]
        };
        this.defaultElement = {
            displayMode: "Line",
            wrapMode: "None",
            symbolType: "Circle",
            blockPosition: "None",
            logLinear: "Linear",
            displayAs: "Normal"
        };
        this.changeOther = function () {
            switch (self.defaultElement.displayMode) {
                case "Line":
                    $('#wrapMode').prop("disabled", false);
                    $('#symbolType').prop("disabled", true);
                    $('#blockPosition').prop("disabled", false);
                    $('#ignore').prop("disabled", false);
                    $('#symbolSize').prop("disabled", true);
                    $('#editSymbolSize').prop("disabled", true);
                    $('#editLineStyle').prop("disabled", false);
                    $('#sample').text('Line Style');
                    break;
                case "Symbol":
                    $('#wrapMode').prop("disabled", false);
                    $('#symbolType').prop("disabled", false);
                    $('#blockPosition').prop("disabled", true);
                    $('#ignore').prop("disabled", false);
                    $('#symbolSize').prop("disabled", false);
                    $('#editSymbolSize').prop("disabled", false);
                    $('#editLineStyle').prop("disabled", true);
                    $('#sample').text('Symbol Style ');
                    break;
                case "Both":
                    $('#wrapMode').prop("disabled", false);
                    $('#symbolType').prop("disabled", false);
                    $('#blockPosition').prop("disabled", true);
                    $('#ignore').prop("disabled", false);
                    $('#symbolSize').prop("disabled", false);
                    $('#editSymbolSize').prop("disabled", false);
                    $('#editLineStyle').prop("disabled", false);
                    $('#sample').text('Both Style ');
                    break;
                case "None":
                    $('#wrapMode').prop("disabled", true);
                    $('#symbolType').prop("disabled", true);
                    $('#blockPosition').prop("disabled", true);
                    $('#ignore').prop("disabled", true);
                    $('#symbolSize').prop("disabled", true);
                    $('#editSymbolSize').prop("disabled", true);
                    $('#editLineStyle').prop("disabled", true);
                    $('#sample').text(' ');
                    break;
                default:
                    console.log("Error: NULL");
                    break;
            }
        };
        this.onEditLineButtonClicked = function () {
            DialogUtils.lineStyleDialog(ModalService, function () {
                console.log("Line Style");
            });
        };
        this.onApplyButtonClicked = function () {
            callback(self);
        };
        this.onOkButtonClicked = function () {
            close(self, 100);
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
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            $('.modal-dialog').draggable();
            callback(ret);
        });
    });
};
exports.importLASDialog = function (ModalService, callback) {
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

                    return close(wells, 500);
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
exports.fillPatternSettingDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        let self = this;
        this.disabled = false;
        this.error = null;

        this.onOkButtonClicked = function () {
            self.error = '';
            self.disabled = true;


        };

        this.onCancelButtonClicked = function () {
            console.log('onCancelButtonClicked');
            // close(null, 500);
        }
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
exports.logTrackPropertiesDialog = function (ModalService, logplotModel, callback) {
    function ModalController($scope, wiComponentService, close) {
        let error = null;
        let self = this;

        const props = {
            general: {
                isShowTitle: true,
                title : "New Track",
                topJustification: "center",
                bottomJustification: "center",
                isShowLabels: false,
                isShowEndLabels: true,
                format: '',
                isShowValueGrid: true,
                majorTicks: 1,
                minorTicks: 5,
                isShowDepthGrid: true,
                width: 2.000,
                trackColor: '#ffffff'
            },
            curve: {

            },
            shading: {
            }
        }
        console.log("Wi", logplotModel.well);

        // Tab General
        this.isShowTitle = props.general.isShowTitle;
        this.title = props.general.title;
        this.topJustification = props.general.topJustification;
        this.bottomJustification = props.general.bottomJustification;

        this.isShowLabels = props.general.isShowLabels;
        this.isShowEndLabels = props.general.isShowEndLabels;
        this.format = props.general.format;

        this.isShowValueGrid = props.general.isShowValueGrid;
        this.majorTicks = props.general.majorTicks;
        this.minorTicks = props.general.minorTicks;
        this.isShowDepthGrid = props.general.isShowDepthGrid;

        this.width = props.general.width;
        this.trackColor = props.general.trackColor;


        // Tab Curve
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

        }
        this.selectedCurve = [];
        this.currentCurve = getCurrentCurve();

        function getCurrentCurve () {
            return [
                {
                    name : "dataset1",
                    curves : [
                        {
                            name: "DTCO3",
                            alias : "DTCO3",
                            leftScale : 1000,
                            rightScale : 10,
                            logLinear : "Logarithmic",
                            displayMode : "Line",
                            lineStyle : self.lineOptions,
                            displayAs : "Normal"
                        },
                        {
                            name: "ECGR",
                            alias : "ECGR",
                            leftScale : 2000,
                            rightScale : 20,
                            logLinear : "Linear",
                            displayMode : "Line",
                            lineStyle : self.lineOptions,
                            displayAs : "Normal"
                        }
                    ]
                }
            ]

        };
        function getFullData () {
            // return [
            //     {
            //         name : "dataset1",
            //         content : [
            //             {
            //                 curveName: "DTCO3",
            //                 alias : "DTCO3",
            //                 leftScale : 1000,
            //                 rightScale : 10,
            //                 logLinear : "Logarithmic",
            //                 displayMode : "Line",
            //                 lineStyle : self.lineOptions,
            //                 displayAs : "Normal"
            //             },
            //             {
            //                 curveName: "ECGR",
            //                 alias : "ECGR",
            //                 leftScale : 2000,
            //                 rightScale : 20,
            //                 logLinear : "Linear",
            //                 displayMode : "Line",
            //                 lineStyle : self.lineOptions,
            //                 displayAs : "Normal"
            //             }
            //         ]
            //     },
            //     {
            //         name : "dataset2",
            //         content : [
            //             {
            //                 curveName: "DTCO3",
            //                 alias : "DTCO3",
            //                 leftScale : 1000,
            //                 rightScale : 10,
            //                 logLinear : "Logarithmic",
            //                 displayMode : "Line",
            //                 lineStyle : "",
            //                 displayAs : "Normal"
            //             },
            //             {
            //                 curveName: "ECGR",
            //                 alias : "ECGR",
            //                 leftScale : 2000,
            //                 rightScale : 20,
            //                 logLinear : "Linear",
            //                 displayMode : "Line",
            //                 lineStyle : "",
            //                 displayAs : "Normal"
            //             },
            //             {
            //                 curveName: "ECGRRRRR",
            //                 alias : "ECGR",
            //                 leftScale : 2000,
            //                 rightScale : 20,
            //                 logLinear : "Linear",
            //                 displayMode : "Line",
            //                 lineStyle : "",
            //                 displayAs : "Normal"
            //             }
            //         ]
            //     },
            //     {
            //         name : "dataset3",
            //         content : [
            //             {
            //                 curveName: "DTCO3",
            //                 alias : "DTCO3",
            //                 leftScale : 1000,
            //                 rightScale : 10,
            //                 logLinear : "Logarithmic",
            //                 displayMode : "Line",
            //                 lineStyle : "",
            //                 displayAs : "Normal"
            //             }
            //         ]
            //     }
            // ];
            return logplotModel.well.datasets;
        }

        this.logLinear = ["Logarithmic", "Linear"];
        this.displayMode = ["Line", "Symbol", "Both", "None"];
        this.displayAs = ["Normal", "Culmulative", "Mirror", "Pid"];

        this.shadingAttr = fillShadingAttrArray();
        this.fillDataset = getFullData();
        this.lineStyleButtonClicked = function () {
            let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
            DialogUtils.lineStyleDialog(ModalService, self.lineOptions, function () {

            });
        };
        this.setClickedRowCurve = function(index){
            $scope.selectedRow = index;
            self.selectedCurve = self.currentCurve[index];
        };
        this.removeRow = function(){
            console.log("self.selectedCurve.content", self.selectedCurve.content);

            let idx = -1;
            let newCurveAttr = eval( self.currentCurve );
            for( let i = 0; i < newCurveAttr.length; i++ ) {
                if( newCurveAttr[i] === self.selectedCurve ) {
                    idx = i;
                    break;
                }
            }
            self.currentCurve.splice( idx, 1 );
        };
        this.arrowUpCurve = function () {
            let prevIdx = -1;
            let idx = self.currentCurve.indexOf(self.selectedCurve);
            console.log(idx);
            if (idx-1 == prevIdx) {
                prevIdx = idx
            } else if (idx > 0) {
                let moveCurve = self.currentCurve.splice(idx, 1)
                console.log(moveCurve[0])
                self.currentCurve.splice(idx-1, 0, moveCurve[0]);
            }
            self.setClickedRowCurve(idx-1);
        };
        this.arrowDownCurve = function () {
            let prevIdx = self.currentCurve.length;
            let idx = self.currentCurve.indexOf(self.selectedCurve);
            console.log(idx);
            if (idx+1 == prevIdx) {
                prevIdx = idx
            } else if (idx < self.currentCurve.length-1) {
                let moveCurve = self.currentCurve.splice(idx, 1)
                console.log(moveCurve[0])
                self.currentCurve.splice(idx+1, 0, moveCurve[0]);
            }
            self.setClickedRowCurve(idx+1);
        };

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
                self.currentCurve.push({});
        };

        // Dialog buttons
        this.onApplyButtonClicked = function () {
            //close(props, 100);
            callback(props);
        };
        this.onOkButtonClicked = function () {
            close(props, 100);
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

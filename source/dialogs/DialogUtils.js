//const SHADING_STYLES = [{value:"fillPattern", name:"Fill Pattern"}, {value:"variableShading", name:"Variable Shading"}];



exports.authenticationDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService) {
        let self = this;
        this.disabled = false;
        this.error = null;
        this.checkPasswords = function () {
            if (!self.passwordReg || !self.passwordConfirm) {
                self.error = 'Passwords must not be empty.'
            }
            if (self.passwordReg != self.passwordConfirm) {
                self.error = 'Passwords do not match.'
                
            }
        }
        this.onRegisterButtonClicked = function () {
            self.error = null;
            self.checkPasswords();
            if (self.error) return;
            let dataRequest = {
                    userName: self.usernameReg,
                    password: self.passwordReg
            }
            wiApiService.register(dataRequest, function (token) {
                let userInfo = {
                    username: self.usernameReg,
                    password: self.passwordReg,
                    token: token
                }
                close(userInfo);
            })
        }
        this.onLoginButtonClicked = function () {
            self.error = null;
            
            if (self.error) return;           

        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'authentication/authentication-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $('.modal-backdrop').css('opacity', 1).css('background-color', 'white');
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (callback && data) callback(data);
        });
    });
};


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
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'new-project/new-project-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
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

                self.projects = projects;
            })
            .catch(function (err) {
                return self.error = err;
            })
            .then(function () {
                $scope.$apply();
            });
        console.log('response', this.projects);

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
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'open-project/open-project-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.promptDialog1 = function (ModalService, titleMessage, input, callback) {
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
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.promptDialog = function (ModalService, promptConfig, callback) {
    function ModalController($scope, close) {
        this.error = null;
        this.title = promptConfig.title;
        this.inputName = promptConfig.inputName;
        this.input = promptConfig.input;
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
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
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
        $(modal.element[0].children[0]).draggable();
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
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "add-new-well/add-new-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        self.name = "BlankLogPlot";
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
        $(modal.element[0].children[0]).draggable();
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
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "add-curve/add-curve-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (ret) callback(ret);
        });
    });
}

exports.lineStyleDialog = function (ModalService, wiComponentService, callback, options) {
    function ModalController($scope, close) {
        var self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        console.log(options);

        this.options = options;

        console.log("Op", this.options);
        this.styles = [
            [10, 0],
            [0, 10],
            [2, 2],
            [8, 2],
            [10, 4, 2, 4],
            [10, 4, 2, 4, 2, 4]
        ];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.lineColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.lineStyle.lineColor, function (colorStr) {
                self.options.lineStyle.lineColor = colorStr;
            });
        }
        this.onOkButtonClicked = function () {
            console.log("optionsss: ", self.options);
            close(self.options);
        };
    }

    ModalService.showModal({
        templateUrl: "line-style/line-style-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log(ret);
            if (ret) callback(ret);
        });
    });
}

exports.symbolStyleDialog = function (ModalService, wiComponentService, callback, options) {
    function ModalController($scope, close) {
        var self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        console.log(options);
        this.options = options;
        console.log(this.options);

        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.styles = [
            [10, 0],
            [0, 10],
            [2, 2],
            [8, 2],
            [10, 4, 2, 4],
            [10, 4, 2, 4, 2, 4]
        ];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.lineColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.symbolStyle.symbolStrokeStyle, function (colorStr) {
                self.options.symbolStyle.symbolStrokeStyle = colorStr;
            });
        };
        this.solidFillColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.symbolStyle.symbolFillStyle, function (colorStr) {
                self.options.symbolStyle.symbolFillStyle = colorStr;
            });
        }
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
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            console.log(ret);
            if (ret) callback(ret);
        });
    });
}

exports.curveAttributeDialog = function (ModalService, wiComponentService, lineOptions, symbolOptions, callback) {
    function ModalController($scope, close) {
        var self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        console.log("options", lineOptions, symbolOptions);

        this.lineOptions = lineOptions;
        this.symbolOptions = symbolOptions;
        console.log("options", this)
        this.lineStyles = [
            [8, 2, 2, 2, 2, 2],
            [8, 2, 2, 2],
            [2, 2],
            [8, 2],
            [1, 0],
            [0, 1]
        ];
        this.lineWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.symbolPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.symbolStyles = ["circle", "cross", "diamond", "dot", "plus", "square", "star", "triangle"];
        this.symbolWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.lineColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.lineOptions.lineStyle.lineColor, function (colorStr) {
                self.lineOptions.lineStyle.lineColor = colorStr;
            });
        };
        this.borderColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.symbolOptions.symbolStyle.symbolStrokeStyle, function (colorStr) {
                self.symbolOptions.symbolStyle.symbolStrokeStyle = colorStr;
            });
        };
        this.foregroundColor = function () {
            console.log("patternForegroundColor");
            /*DialogUtils.colorPickerDialog(ModalService, self.symbolOptions.patternFill.foreground, function (colorStr) {
                self.symbolOptions.patternFill.foreground = colorStr;
            });*/
        }
        this.backgroundColor = function () {
            console.log("patternBackgroundColor");
            /*DialogUtils.colorPickerDialog(ModalService, self.symbolOptions.patternFill.foreground, function (colorStr) {
                self.symbolOptions.patternFill.foreground = colorStr;
            });*/
        }
        this.onOkButtonClicked = function () {
            close(self.lineOptions, self.symbolOptions);
        };
        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: "curve-attribute/curve-attribute-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (lineOptions, symbolOptions) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (lineOptions || symbolOptions) {
                console.log(lineOptions, symbolOptions);
                callback(lineOptions, symbolOptions);
            }
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
        let dataset = utils.getModel('dataset', currentCurve.idDataset);

        console.log("CURRENTCURVE", currentCurve, currentTrack);

        let extentY = currentCurve.getExtentY();

        if (currentCurve.line) {
            this.lineOptions = {
                display: true,
                lineStyle: {
                    lineColor: currentCurve.line.color,
                    lineWidth: currentCurve.line.width,
                    lineStyle: currentCurve.line.dash
                }
            }
        } else {
            this.lineOptions = {
                display: false,
                lineStyle: {
                    lineColor: "black",
                    lineWidth: 1,
                    lineStyle: [0]
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
                    symbolLineWidth: currentCurve.symbol.lineWidth,
                    symbolLineDash: currentCurve.symbol.lineDash
                }
            }
        } else {
            this.symbolOptions = {
                display: false,
                symbolStyle: {
                    symbolName: "circle", // cross, diamond, star, triangle, dot, plus
                    symbolSize: 4,
                    symbolStrokeStyle: "black",
                    symbolFillStyle: "transparent",
                    symbolLineWidth: 1,
                    symbolLineDash: [10, 0]
                }
            }
        }
        this.lineObjTemplate = {
            minDepth: extentY[0],
            maxDepth: extentY[1],
            name: dataset.properties.name + "." + currentCurve.name
        }

        this.curveOptions = utils.curveOptions(currentTrack, currentCurve);
        console.log("CURVEOPTONS", this.curveOptions, currentCurve);
        this.onToggleShowDataset = function () {
            self.curveOptions.alias = self.curveOptions.showDataset ? self.lineObjTemplate.name : currentCurve.name;
        }

        this.drawSample = function () {
            displayLine(self.lineOptions, self.symbolOptions);
        }
        this.selectData = {
            displayMode: ["Line", "Symbol", "Both", "None"],
            wrapMode: ["None", "Left", "Right", "Both"],
            symbolType: ["Circle", "Cross", "Diamond", "Dot", "Plus", "Square", "Star", "Triangle"],
            blockPosition: ["Start", "Middle", "End", "None"],
            logLinear: ["Linear", "Logarithmic"],
            displayAs: ["Normal", "Culmulative", "Mirror", "Pid"]
        };

        function displayLine(lineOptions, symbolOptions) {
            let sample = $('#sample')[0];
            let context = sample.getContext('2d');
            context.clearRect(0, 0, sample.width, sample.height);
            var x = [5, 50, 100, 150, 195];
            var y = [180, 40, 20, 40, 180];

            function drawSegment(context, x1, y1, x2, y2) {
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
                        context.arc(x, y, style.symbolStyle.symbolSize, 0, 2 * Math.PI);
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
            for (let i = 0; i < x.length - 1; i++) {
                if (lineOptions && lineOptions.display)
                    drawSegment(context, x[i], y[i], x[i + 1], y[i + 1]);
            }
            for (let i = 0; i < x.length; i++) {
                if (symbolOptions && symbolOptions.display) {
                    console.log(self.symbolOptions);
                    drawSymbol(context, x[i], y[i], self.symbolOptions);
                }
            }

        }
        this.disabledByLine = function () {
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
        this.disabledBySymbol = function () {
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
        this.disabledByBoth = function () {
            $('#wrapMode').prop("disabled", false);
            $('#symbolType').prop("disabled", false);
            $('#blockPosition').prop("disabled", false);
            $('#ignore').prop("disabled", false);
            $('#symbolSize').prop("disabled", false);
            $('#editSymbolStyle').prop("disabled", false);
            $('#editLineStyle').prop("disabled", false);
            self.lineOptions.display = true;
            self.symbolOptions.display = true;
        }
        this.disabledByNone = function () {
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
            switch (self.curveOptions.displayMode.toLowerCase()) {
                case "line":
                    self.disabledByLine();
                    break;
                case "symbol":
                    self.disabledBySymbol();
                    break;
                case "both":
                    self.disabledByBoth();
                    break;
                case "none":
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
            console.log(self.curveOptions, self.lineOptions);
            utils.changeLine(lineObj, wiApiService, function () {
                console.log("lineObj", lineObj);
                currentCurve.setProperties(lineObj);
                currentTrack.plotCurve(currentCurve);

                if (callback) callback();
            });
        }
        this.onEditLineStyleButtonClicked = function () {
            DialogUtils.lineStyleDialog(ModalService, wiComponentService, function (options) {
                console.log("options", options);
                self.lineOptions = options;
                self.drawSample();
            }, self.lineOptions);
        };
        this.onEditSymbolStyleButtonClicked = function () {
            DialogUtils.symbolStyleDialog(ModalService, wiComponentService, function (options) {
                self.symbolOptions = options;
                console.log(self.symbolOptions);
                self.drawSample();
            }, self.symbolOptions);
        };
        this.onEditAttributeButtonClicked = function () {
            let lineOptions = null;
            let symbolOptions = null;
            switch (self.curveOptions.displayMode) {
                case "Line":
                    lineOptions = self.lineOptions;
                    break;
                case "Symbol":
                    symbolOptions = self.symbolOptions;
                    break;
                case "Both":
                    lineOptions = self.lineOptions;
                    symbolOptions = self.symbolOptions;
                    break;
                default:
                    break;
            }
            DialogUtils.curveAttributeDialog(ModalService, wiComponentService, self.lineOptions, self.symbolOptions, function (lineOptions, symbolOptions) {
                if (lineOptions) self.lineOptions = lineOptions;
                if (symbolOptions) self.symbolOptions = symbolOptions;
                self.drawSample();
            });
        };
        this.onApplyButtonClicked = function () {
            updateLine();
        };
        this.onOkButtonClicked = function () {
            updateLine(function () {
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
        $(modal.element[0].children[0]).draggable();
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
                self.curves.forEach(function (curve) {
                    curve.inputName = curve.lasName;
                    curve.isLoad = true;
                });
                self.isDisabled = false;
            });
        }

        this.isLoadAll = true;
        this.checkAllButtonClicked = function () {
            if (self.isLoadAll) {
                self.curves.forEach(function (curve) {
                    curve.isLoad = true;
                });
            } else {
                self.curves.forEach(function (curve) {
                    curve.isLoad = false;
                });
            }
        }

        this.invertCheckButtonClicked = function () {
            self.curves.forEach(function (curve) {
                curve.isLoad = !curve.isLoad;
            });
        }

        this.onLoadButtonClicked = function () {
            console.log(self.lasInfo);
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
            if (data) callback(data);
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
            if (data) callback(data);
        });
    });
};

exports.importMultiLASDialog = function (ModalService, callback) {
    function ModalController($scope, close, Upload, wiComponentService, wiApiService) {
        let self = this;
        this.lasInfos = null;
        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        this.isDisabled = true;
        this.lasFiles = null;
        this.selectedWells = [];
        this.selectedDatasets = [];
        this.transactionId = Date.now();


        this.settings = {
            isOverwriteWellHeader: false,
            isCreateNewWellIfDupe: false,
            isCreateNewDatasetIfDupe: false,
            isUseUwiAsWellName: false,
            isLoadAllCurves: true
        };
        this.families = [
            'Gamma Ray',
            'Porosity',
            'Density',
            'Acoustic',
            'Resistivity',
            'Permeability',
            'Saturation',
            'Volume'
        ];
        this.selectedFamilies = {};
        this.families.forEach(function (family) {
            self.selectedFamilies[family] = true;
        });
        this.onUploadButtonClicked = function () {
            let payloadParams = {
                file: self.lasFiles,
                transactionId: self.transactionId
            };
            //console.log(payloadParams);
            wiApiService.uploadMultiFilesPrepare(payloadParams, function (lasInfos) {
                self.lasInfos = lasInfos;
                self.curves = lasInfos[0].curves;
                self.lasInfos.forEach(function (lasInfo) {
                    lasInfo.isLoad = true;
                    lasInfo.LASName = lasInfo.originalname;
                    lasInfo.wellInfo.depthUnit = 'M';
                });
                self.isDisabled = false;
            });
        }
        $scope.fileIndex = 0;
        this.onLasClick = function ($index) {
            $scope.fileIndex = $index;
            self.curves = self.lasInfos[$index].curves;
        }

        this.onRemoveFileClick = function () {
            self.lasInfos.splice($scope.fileIndex, 1);
            if (!self.lasInfos.length) {
                self.isDisabled = true;
            }
        }

        this.onRemoveAllFilesClick = function () {
            self.lasInfos = [];
            self.curves = [];
            self.isDisabled = true;
        }

        this.onLoadButtonClicked = function () {
            let payloadParams = {
                id_project: self.projectLoaded.idProject,
                id_wells: [],
                id_datasets: []
            };
            payloadParams.file = self.lasFiles;
            console.log(self.selectedWell);
            for (let i = 0; i < self.lasFiles.length; i++) {
                if (self.selectedWells[i]) {
                    payloadParams.id_wells[i] = self.selectedWell[i];
                } else {
                    payloadParams.id_wells[i] = "None";
                }
                if (self.selectedDatasets[i]) {
                    payloadParams.id_datasets[i] = self.selectedDatasets[i];
                } else {
                    payloadParams.id_datasets[i] = "None";
                }
            }
            console.log('payloadParams', payloadParams);
            wiApiService.uploadMultiFiles(payloadParams)
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
            if (data) callback(data);
        });
    });
};
exports.fillPatternSettingDialog = function (ModalService, callback, options, shadingOptions) {
    let thisModal = null;

    function ModalController($scope, close, wiComponentService, $timeout) {
        let self = this;
        thisModal = this;
        this.disabled = false;
        this.error = null;

        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        console.log("$$", options);

        this.shadingOptions = shadingOptions;
        if (options) {
            this.options = options;
        } else {
            this.options = {
                fill: {
                    display: false,
                    pattern: {
                        name: "chert",
                        foreground: "#fff",
                        background: "#000"
                    }
                },
                positiveFill: {
                    display: false,
                    pattern: {
                        name: "chert",
                        foreground: "#fff",
                        background: "#000"
                    }
                },
                negativeFill: {
                    display: false,
                    pattern: {
                        name: "chert",
                        foreground: "#fff",
                        background: "#000"
                    }
                }
            };
        }

        this.checkboxVal = !this.options.fill.display;

        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.enableFill = function (idEnable, value) {
            $('#' + idEnable + ":button").attr("disabled", value);
        }
        //button
        this.foreground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.fill.pattern.foreground, function (colorStr) {
                self.options.fill.pattern.foreground = colorStr;
            });
        }
        this.background = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.fill.pattern.background, function (colorStr) {
                self.options.fill.pattern.background = colorStr;
            });
        }
        this.posPositiveForeground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.positiveFill.pattern.foreground, function (colorStr) {
                self.options.positiveFill.pattern.foreground = colorStr;
            });
        }
        this.posPositiveBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.positiveFill.pattern.background, function (colorStr) {
                self.options.positiveFill.pattern.background = colorStr;
            });
        }
        this.negPositiveForeground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.negativeFill.pattern.foreground, function (colorStr) {
                self.options.negativeFill.pattern.foreground = colorStr;
            });
        }
        this.negPositiveBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.negativeFill.pattern.background, function (colorStr) {
                self.options.negativeFill.pattern.background = colorStr;
            });
        }
        this.correctFillingStyle = function() {
            self.shadingOptions.isNegPosFill = !self.options.fill.display;
            self.options.positiveFill.display = !self.options.fill.display;
            self.options.negativeFill.display = self.options.positiveFill.display;
        }

        this.onOkButtonClicked = function () {
            self.error = '';
            console.log(self.options);
            close(self.options, 200);

        };
    }

    ModalService.showModal({
        templateUrl: 'fill-pattern-setting/fill-pattern-setting-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        thisModal.enableFill("positiveNegative", false);
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        });
    });
};
exports.variableShadingDialog = function (ModalService, callback, options, selectCurve) {
    function ModalController($scope, wiComponentService, close) {
        let error = null;
        let self = this;
        this.selectCurve = selectCurve;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        console.log("selectCurve", selectCurve);
        if (options) {
            this.options = options;
        } else {
            this.options = {
                display: true,
                idControlCurve: null,
                gradient: {
                    startX: null,
                    endX: null,
                    startColor: "transparent",
                    endColor: "transparent"
                }
            };
        }
        this.selectedControlCurve = function (idCurve) {
            self.selectCurve.forEach(function (item, index) {
                if (item.idCurve == idCurve) {
                    console.log("find startX endX", item);
                    self.options.gradient.startX = item.minX;
                    self.options.gradient.endX = item.maxX;
                }
            })

        }
        this.startColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.gradient.startColor, function (colorStr) {
                self.options.gradient.startColor = colorStr;
            });
        }
        this.endColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.gradient.endColor, function (colorStr) {
                self.options.gradient.endColor = colorStr;
            });
        }
        this.onOkButtonClicked = function () {
            close(self.options, 200);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "variable-shading/variable-shading-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.shadingAttributeDialog = function(ModalService, wiApiService, callback, fillPatternOptions, variableShadingOptions, shadingOptions, selectCurve, curvesOnDataset){
    let thisModal = null;

    function ModalController($scope, close, wiComponentService, $timeout) {
        let self = this;
        thisModal = this;
        this.disabled = false;
        this.error = null;
        this.paletteList = null;
        this.paletteName = null;
        console.log("options", fillPatternOptions, variableShadingOptions, shadingOptions, selectCurve);
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        //fillPatternOptions
        this.shadingOptions = shadingOptions;
        this.curvesOnDataset = curvesOnDataset;

        this.namePals = new Array();
        wiApiService.getPalettes(function(pals){
            self.paletteList = pals;
            self.paletteName = Object.keys(self.paletteList);
        });
        // this.paletteList = utils.getAllPalettes(wiApiService);
        // this.paletteList = palettes;
        // this.namePals = Object.keys(self.paletteList);
        // console.log("paletteList", this.namePals);
        if (!fillPatternOptions) {  
            fillPatternOptions = {
                fill: {
                    display: false,
                    pattern: {
                        name: "chert",
                        foreground: "#fff",
                        background: "#000"
                    }
                },
                positiveFill: {
                    display: false,
                    pattern: {
                        name: "chert",
                        foreground: "#fff",
                        background: "#000"
                    }
                },
                negativeFill: {
                    display: false,
                    pattern: {
                        name: "chert",
                        foreground: "#fff",
                        background: "#000"
                    }
                }
            };
        }

        this.fillPatternOptions = fillPatternOptions;

        this.checkboxVal = !this.fillPatternOptions.fill.display;

        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];

        // this.getShadingStyles = function() {
        //     return SHADING_STYLES;
        // }

        this.enableFill = function (idEnable, value) {
            $('#' + idEnable + ":button").attr("disabled", value);
        }
        //button
        this.foreground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.fill.pattern.foreground, function (colorStr) {
                self.fillPatternOptions.fill.pattern.foreground = colorStr;
            });
        }
        this.background = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.fill.pattern.background, function (colorStr) {
                self.fillPatternOptions.fill.pattern.background = colorStr;
            });
        }
        this.posPositiveForeground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.positiveFill.pattern.foreground, function (colorStr) {
                self.fillPatternOptions.positiveFill.pattern.foreground = colorStr;
            });
        }
        this.posPositiveBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.positiveFill.pattern.background, function (colorStr) {
                self.fillPatternOptions.positiveFill.pattern.background = colorStr;
            });
        }
        this.negPositiveForeground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.fillPatternOptions.negativeFill.pattern.foreground, function (colorStr) {
                self.fillPatternOptions.negativeFill.pattern.foreground = colorStr;
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
        //variableShadingOptions
        this.selectCurve = selectCurve;
        if (!variableShadingOptions) {
            variableShadingOptions = {
                idControlCurve: null,
                fill: {
                    display: false,
                    variable: {
                        startX: null,
                        endX: null,
                        gradient: {
                            startColor: "transparent",
                            endColor: "transparent"
                        },
                        palette: null,
                        palName: null,
                        customFills: null
                    }
                },
                positiveFill: {
                    display: false,
                    variable: {
                        startX: null,
                        endX: null,
                        gradient: {
                            startColor: "transparent",
                            endColor: "transparent"
                        },
                        palette: null,
                        palName: null,
                        customFills: null
                    }
                },
                negativeFill: {
                    variable: {
                    display: false,
                        startX: null,
                        endX: null,
                        gradient: {
                            startColor: "transparent",
                            endColor: "transparent"
                        },
                        palette: null,
                        palName: null,
                        customFills: null
                    }
                }
            };
        }
        this.variableShadingOptions = variableShadingOptions;
        console.log("varShading", this.variableShadingOptions);
        // this.displayType = !this.variableShadingOptions.fill.display?"posNegSides":"bothSides";
        this.displayType = !this.variableShadingOptions.fill.display;
        this.selectedControlCurve = function(idCurve){
            self.selectCurve.forEach(function(item, index) {
                if(item.idCurve == idCurve) {
                    self.variableShadingOptions.positiveFill.varShading.startX = item.minX;
                    self.variableShadingOptions.positiveFill.varShading.endX = item.maxX;    
                    self.variableShadingOptions.negativeFill.varShading.startX = item.minX;
                    self.variableShadingOptions.negativeFill.varShading.endX = item.maxX;
                
                    self.variableShadingOptions.fill.varShading.startX = item.minX;
                    self.variableShadingOptions.fill.varShading.endX = item.maxX;    
                }
            })
        }

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
            self.shadingOptions.isNegPosFill = !self.variableShadingOptions.fill.display;
            self.variableShadingOptions.positiveFill.display = !self.variableShadingOptions.fill.display;
            self.variableShadingOptions.negativeFill.display = self.variableShadingOptions.positiveFill.display;
        }
        if(this.shadingOptions.idLeftLine) {
            this.shadingOptions.isNegPosFill = false;
            this.fillPatternOptions.fill.display = true;
            this.variableShadingOptions.fill.display = true;
            // this.displayType = 'bothSides';
        }
        wiApiService.getPalettes(function(paletteList){
            let paletteNameArr = Object.keys(paletteList);
            let paletteValArr = JSON.stringify(Object.values(paletteList));
            function getPaletteNameByValue(palVal) {
                let idx = paletteValArr.indexOf(JSON.stringify(palVal));
                return paletteNameArr[idx];
            }

            if(self.variableShadingOptions.fill && self.variableShadingOptions.fill.display == true) {
                if(self.variableShadingOptions.fill.varShading.gradient) self.varShadingType = "gradient";
                else if (self.variableShadingOptions.fill.varShading.palette) {
                    self.varShadingType = "palette";
                    if(Array.isArray(self.variableShadingOptions.fill.varShading.palette)) 
                        self.variableShadingOptions.fill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.fill.varShading.palette);
                    
                }
                else self.varShadingType = "customFills";
            }
            if(self.variableShadingOptions.positiveFill && self.variableShadingOptions.positiveFill.display == true){
                if(self.variableShadingOptions.positiveFill.varShading.gradient) self.varShadingType = "gradient";
                else if (self.variableShadingOptions.positiveFill.varShading.palette) {
                    self.varShadingType = "palette";
                    if(Array.isArray(self.variableShadingOptions.positiveFill.varShading.palette)) 
                        self.variableShadingOptions.positiveFill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.positiveFill.varShading.palette);
                }
                else self.varShadingType = "customFills";
            }
            if(self.variableShadingOptions.negativeFill && self.variableShadingOptions.negativeFill.display == true){
                if(self.variableShadingOptions.negativeFill.varShading.gradient) self.varShadingType = "gradient";
                else if (self.variableShadingOptions.negativeFill.varShading.palette) {
                    self.varShadingType = "palette";
                    if(Array.isArray(self.variableShadingOptions.negativeFill.varShading.palette)) 
                        self.variableShadingOptions.negativeFill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.negativeFill.varShading.palette);
                }
                else self.varShadingType = "customFills";
            }
        })
        this.setGradientIfNull = function(){
            if(self.variableShadingOptions.fill.display && !self.variableShadingOptions.fill.varShading.gradient) self.variableShadingOptions.fill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
            if(self.variableShadingOptions.positiveFill.display && !self.variableShadingOptions.positiveFill.varShading.gradient) self.variableShadingOptions.positiveFill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
            if(self.variableShadingOptions.positiveFill.display && !self.variableShadingOptions.negativeFill.varShading.gradient) self.variableShadingOptions.negativeFill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
            
        }
        // function isValid() {
        //     self.errorReason = null;
        //     if(!self.shadingOptions.idRightLine && !self.shadingOptions.idLeftLine) {
        //         self.errorReason = "Right curve or left curve are required";
        //         return false;
        //     }
        //     if ( self.shadingOptions.idRightLine == self.shadingOptions.idLeftLine ) {
        //         self.errorReason = "Right curve and left curve cannot be the same";
        //         return false;
        //     }

        //     if ( isNaN(parseInt(self.shadingOptions.leftFixedValue)) 
        //         && isNaN(parseInt(self.shadingOptions.rightFixedValue)) 
        //         && (!self.shadingOptions.idRightLine || !self.shadingOptions.idLeftLine) ) {

        //         self.errorReason = "Shading properties is invalid";
        //         return false;
        //     }
        //     return true;
        // }
        this.setShadingName = function(curveId, isRight) {
            var curveName = null;
            var leftPart = null;
            var rightPart = null;
            if( self.shadingOptions.name.indexOf('_') < 0 ) self.shadingOptions.name = "xx_yy";
            if (isRight) {
                if (!curveId) {
                    rightPart = 'right';
                }
                else {
                    for (curve of self.curvesOnDataset) {
                        if (curve.id == parseInt(curveId)) {
                            rightPart = curve.name;
                            break;
                        }
                    }
                }
                self.shadingOptions.name = self.shadingOptions.name.replace(/_.+/g, "_" + rightPart);
            }
            else {
                if (!curveId) {
                    leftPart = 'left';
                }
                else {
                    for (curve of self.curvesOnDataset) {
                        if (curve.id == parseInt(curveId)) {
                            leftPart = curve.name;
                            break;
                        }
                    }
                }
                self.shadingOptions.name = self.shadingOptions.name.replace(/^.+_/g, leftPart + "_");
            }
        }
        this.setLimit2 = function() {
            if(self.shadingOptions.idLeftLine == '-1') {
                self.shadingOptions.leftFixedValue = findInVisCurveListByIdLine(self.shadingOptions.idRightLine).minX;
            }
            if(self.shadingOptions.idLeftLine == '-2') {
                self.shadingOptions.leftFixedValue = findInVisCurveListByIdLine(self.shadingOptions.idRightLine).maxX;
            }
            if(self.shadingOptions.idLeftLine > 0) self.shadingOptions.leftFixedValue = null;
        }
        this.arrayPaletteToString = function(palette){
            return JSON.stringify(palette);
        }
        function findInVisCurveListByIdLine(idLine) {
            for(let line of self.curvesOnDataset) {
                if(line.id == idLine){
                    return line;
                }
            }
            return null;
        }
        //customFills

        // this.customFillsCurrent = {
        //     name: "customFills1",
        //     content: [
        //         {
        //             lowVal: 40, 
        //             highVal: 50, 
        //             pattern: "chert", 
        //             foreground: "black", 
        //             background: "blue", 
        //             description: ""
        //         },{
        //             lowVal: 50, 
        //             highVal: 70, 
        //             pattern: "chert", 
        //             foreground: "yellow", 
        //             background: "blue", 
        //             description: ""
        //         }, {
        //             lowVal: 70, 
        //             highVal: 90, 
        //             pattern: "chert", 
        //             foreground: "white", 
        //             background: "red", 
        //             description: ""
        //         },{
        //             lowVal: 90, 
        //             highVal: 140, 
        //             pattern: "chert", 
        //             foreground: "green", 
        //             background: "orange", 
        //             description: "9879707"
        //         }
        //     ]
        // }
        // this.customFillsCurrent = angular.copy(self.variableShadingOptions.fill.varShading.customFills);
        if(this.variableShadingOptions.fill.varShading.customFills){
            this.customFillsCurrent = this.variableShadingOptions.fill.varShading.customFills;
        };
        this.foregroundCustomFills = function(index){
            DialogUtils.colorPickerDialog(ModalService, self.variableShadingOptions.fill.varShading.customFills.content[index].foreground, function (colorStr) {
                self.variableShadingOptions.fill.varShading.customFills.content[index].foreground = colorStr;
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
            console.log("self", self.variableShadingOptions.fill.varShading.customFills.content, self.idx);
        }
        this.addRow = function(){
            self.variableShadingOptions.fill.varShading.customFills.content.push({});
        }
        this.customFillsList = null;
        wiApiService.getCustomFills(function(customFillsList){
            self.customFillsList = customFillsList;
        });
        this.setCustomFills = function(){
            self.variableShadingOptions.fill.varShading.customFills = self.customFillsCurrent;
            console.log("CF", self.variableShadingOptions.fill.varShading.customFills, self.customFillsCurrent);
        };
        this.saveCustomFills = function() {
            self.customFillsCurrent = self.variableShadingOptions.fill.varShading.customFills
            if(!self.customFillsCurrent.name) {
                DialogUtils.errorMessageDialog(ModalService, "Add name CustomFills to save!");
            }
            else {
                wiApiService.saveCustomFills(self.customFillsCurrent, function(customFills){
                    DialogUtils.errorMessageDialog(ModalService, "CustomFills: " + customFills.name + " saved successfully!");
                });
            }
        };
        this.setCustomFillsIfNull = function(){
            if(self.variableShadingOptions.fill.display && !self.variableShadingOptions.fill.varShading.customFills) {
                self.variableShadingOptions.fill.varShading.customFills = {
                    name:null,
                    content: [
                        {
                            lowVal: null,
                            highVal: null,
                            pattern: "none",
                            foreground: "transparent",
                            background: "transparent",
                            description: ""
                        }
                    ]
                }
            }
           
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
        
        this.onOkButtonClicked = function () {
            switch (self.varShadingType) {
                case "gradient":
                    self.variableShadingOptions.fill.varShading.palette = null;
                    self.variableShadingOptions.positiveFill.varShading.palette = null;
                    self.variableShadingOptions.positiveFill.varShading.palette = null;
                    self.variableShadingOptions.fill.varShading.value = null;
                    self.variableShadingOptions.positiveFill.varShading.customFills = null;
                    self.variableShadingOptions.positiveFill.varShading.customFills = null;
                    break;
                case "palette":
                    self.variableShadingOptions.fill.varShading.gradient = null;
                    self.variableShadingOptions.positiveFill.varShading.gradient = null;
                    self.variableShadingOptions.positiveFill.varShading.gradient = null;
                    self.variableShadingOptions.fill.varShading.customFills = null;
                    self.variableShadingOptions.positiveFill.varShading.customFills = null;
                    self.variableShadingOptions.positiveFill.varShading.customFills = null;

                    self.variableShadingOptions.fill.varShading.palette = self.variableShadingOptions.fill.varShading.palName;
                    self.variableShadingOptions.positiveFill.varShading.palette = self.variableShadingOptions.positiveFill.varShading.palName;
                    self.variableShadingOptions.positiveFill.varShading.palette = self.variableShadingOptions.negativeFill.varShading.palName;
                    break;
                case "customFills":
                    self.variableShadingOptions.fill.varShading.palette = null;
                    self.variableShadingOptions.positiveFill.varShading.palette = null;
                    self.variableShadingOptions.positiveFill.varShading.palette = null;
                    self.variableShadingOptions.fill.varShading.palName = null;
                    self.variableShadingOptions.positiveFill.varShading.palName = null;
                    self.variableShadingOptions.positiveFill.varShading.palName = null;
                    self.variableShadingOptions.fill.varShading.gradient = null;
                    self.variableShadingOptions.positiveFill.varShading.gradient = null;
                    self.variableShadingOptions.positiveFill.varShading.gradient = null;
                    break;
            }
            console.log("onOkShadingAttribute", self.fillPatternOptions, self.variableShadingOptions, self.shadingOptions);
            if (isValid()) {
                close(JSON.stringify({
                    fillPatternOptions:self.fillPatternOptions, 
                    variableShadingOptions:self.variableShadingOptions, 
                    shadingOptions: self.shadingOptions
                }), 200);
            }
            else {
                DialogUtils.errorMessageDialog(ModalService, self.errorReason);
            }

        };
        // this.onCancelButtonClicked = function () {
        //     close(null, 200);
        // }
    }

    ModalService.showModal({
        templateUrl: 'shading-attribute/shading-attribute-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        thisModal.enableFill("positiveNegative", false);
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) {
                var objData = JSON.parse(data);
                callback(objData.fillPatternOptions, objData.variableShadingOptions, objData.shadingOptions);
            }
        });
    });
}
exports.logTrackPropertiesDialog = function (ModalService, currentTrack, wiLogplotCtrl, wiApiService, callback, options) {
    let wiModal = null;
    function ModalController($scope, wiComponentService, $timeout, close, $compile, $http) {
        let error = null;
        let self = this;
        wiModal = self;

        console.log("logPlot", wiLogplotCtrl);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');
        let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();

        this.well = utils.findWellByLogplot(wiLogplotCtrl.id);

        this.tabFlags = options.tabs;
        this.datasets = new Array();

        this.curves = new Array();
        this.curvesLineOptions = new Array();
        this.curvesSymbolOptions = new Array();
        this.curvesChanged = new Array(); // 1: change line, 2: add line
        this.curvesOnDataset = new Array(); // curveList + dataset.Curve
        this.shadingChanged = new Array();

        this.curvesArr = [];
        this.shadingArr = new Array();
        // let shadingList =  new Array();
        let logTrack = {};

        let idCurveNew = null;
        this.well.children.forEach(function (child) {
            if (child.type == 'dataset') self.datasets.push(child);
        });
        this.datasets.forEach(function (child) {
            child.children.forEach(function (item) {
                if (item.type == 'curve') self.curvesArr.push(item);
            })
        });
        console.log("curvesArr", this.curvesArr);
        this.curvesArr.forEach(function (curve, index) {
            let dataset = utils.findDatasetById(curve.properties.idDataset);
            curve.properties.datasetName = dataset.properties.name;
            console.log("curveObj", curve);
        })
        this.curveList = currentTrack.getCurves();
        console.log("curveList", this.curveList);
        this.selectCurveArr = []; // select Curve in all dataset
        this.arr = []; //curvesArr + dataset.curve
        this.lineCurve = [];
        this.fillPatternOptions = new Array();
        this.variableShadingOptions = new Array();
        this.curveList.forEach(function (item) {
            let curvesOnDatasetItem = item;
            curvesOnDatasetItem.datasetCurve = utils.findDatasetById(item.idDataset).properties.name + '.' + item.name;
            self.curvesOnDataset.push(curvesOnDatasetItem);
        })
        this.curvesArr.forEach(function (item) {
            let selectedCurve = item.properties.datasetName + '.' + item.properties.name;
            self.selectCurveArr.push(selectedCurve);
            item.datasetCurve = selectedCurve;
            self.arr.push(item);
        });
        console.log("curveDataset", this.curvesOnDataset, this.arr);
        let customLimit = [{"id": -1, "datasetCurve": "left"}, {"id": -2, "datasetCurve": "right"}, {"id": -3, "datasetCurve": "custom"}];
        this.leftLimit = customLimit.concat(self.curvesOnDataset);
        let shadingList = currentTrack.getShadings();
        console.log("shadingList", shadingList);

        function getShadingStyle(fillObj) {
            if (fillObj.pattern) return "fillPattern";

            if (fillObj.varShading) return "variableShading";

            fillObj.pattern = {
                name: 'none',
                background: "white",
                foreground: 'black'
            };
            return "fillPattern";
        }
        
        shadingList.forEach(function(shading, index){
            var shadingItem = new Object();
            var shadingProp = shading.getProperties();
            var fillPatternItem = new Object();
            var variableShadingItem = new Object();
            var shadingChangedItem = new Object();

            console.log("shadingProp", shadingProp);
            shadingItem.idTrack = shadingProp.idTrack;
            shadingItem.idShading = shadingProp.idShading;
            shadingItem.idLeftLine = shadingProp.idLeftLine;
            shadingItem.leftFixedValue = shadingProp.leftFixedValue;
            shadingItem.idRightLine = shadingProp.idRightLine;
            shadingItem.rightFixedValue = shadingProp.rightFixedValue;
            shadingItem.name = shadingProp.name;
            shadingItem.shadingStyle = getShadingStyle(shadingProp.isNegPosFill ? shading.positiveFill : shading.fill);
            shadingItem.idControlCurve = shadingProp.idControlCurve;
            shadingItem.isNegPosFill = shadingProp.isNegPosFill;
            shadingItem.type = shadingProp.type;
            shadingItem._index = index;

            var condition1 = (shadingItem.shadingStyle == "fillPattern" && !shadingItem.isNegPosFill);
            var condition2 = (shadingItem.shadingStyle == "fillPattern" && shadingItem.isNegPosFill);
            var condition3 = (shadingItem.shadingStyle == "variableShading" && !shadingItem.isNegPosFill);
            var condition4 = (shadingItem.shadingStyle == "variableShading" && shadingItem.isNegPosFill);

            var condition3gradient = condition3 && shadingProp.fill.varShading.gradient;
            var condition4gradient = condition4 && shadingProp.positiveFill.varShading.gradient;

            var condition3palette = condition3 && shadingProp.fill.varShading.palette;
            var condition4palette = condition4 && shadingProp.positiveFill.varShading.palette;

            var condition3customFills = condition3 && shadingProp.fill.varShading.customFills;
            var condition4customFills = condition4 && shadingProp.positiveFill.varShading.customFills;

            fillPatternItem.fill = {
                display: condition1,
                pattern: {
                    name: (condition1 ? shadingProp.fill.pattern.name : "none"),
                    foreground: (condition1 ? shadingProp.fill.pattern.foreground : null),
                    background: (condition1 ? shadingProp.fill.pattern.background : null)
                }
            };
            fillPatternItem.positiveFill = {
                display: condition2,
                pattern: {
                    name: (condition2 ? shadingProp.positiveFill.pattern.name : "none"),
                    foreground: (condition2 ? shadingProp.positiveFill.pattern.foreground : null),
                    background: (condition2 ? shadingProp.positiveFill.pattern.background : null)
                }
            };

            fillPatternItem.negativeFill = {
                display: condition2,
                pattern: {
                    name: (condition2 ? shadingProp.negativeFill.pattern.name : "none"),
                    foreground: (condition2 ? shadingProp.negativeFill.pattern.foreground : null),
                    background: (condition2 ? shadingProp.negativeFill.pattern.background : null)
                }
            }

            fillPatternItem._index = index;
            // variableShadingItem = {
            //     display: condition3,
            //     idControlCurve: shadingProp.idControlCurve,
            //     gradient: {
            //         startX: condition3?shadingProp.fill.gradient.startX:null,
            //         endX: condition3?shadingProp.fill.gradient.endX:null,
            //         startColor: condition3?shadingProp.fill.gradient.startColor:null,
            //         endColor: condition3?shadingProp.fill.gradient.endColor:null
            //     }

            // }
            variableShadingItem.idControlCurve = shadingProp.idControlCurve;

            variableShadingItem.fill = {
                display: condition3,
                varShading: {
                    startX: condition3?shadingProp.fill.varShading.startX:null,
                    endX: condition3?shadingProp.fill.varShading.endX:null,
                    gradient: condition3gradient?{
                        startColor: condition3?shadingProp.fill.varShading.gradient.startColor:null,
                        endColor: condition3?shadingProp.fill.varShading.gradient.endColor:null
                    }:null,
                    palette: condition3palette?(condition3?shadingProp.fill.varShading.palette:null):null,
                    palName: condition3palette?(condition3?shadingProp.fill.varShading.palName:null):null,
                    customFills: condition3customFills?(condition3?shadingProp.fill.varShading.customFills:null):null
                }
            };
            variableShadingItem.positiveFill = {
                display: condition4,
                varShading: {
                    startX: condition4?shadingProp.positiveFill.varShading.startX:null,
                    endX: condition4?shadingProp.positiveFill.varShading.endX:null,
                    gradient: condition4gradient?{
                        startColor: condition4?shadingProp.positiveFill.varShading.gradient.startColor:null,
                        endColor: condition4?shadingProp.positiveFill.varShading.gradient.endColor:null
                    }:null,
                    palette: condition4palette?( condition4?shadingProp.positiveFill.varShading.palette:null):null,
                    palName: condition4palette?(condition3?shadingProp.positiveFill.varShading.palName:null):null,
                    customFills: condition4customFills?( condition4?shadingProp.positiveFill.varShading.customFills:null):null
                }
            };
            variableShadingItem.negativeFill = {
                display: condition4,
                varShading: {
                    startX: condition4?shadingProp.negativeFill.varShading.startX:null,
                    endX: condition4?shadingProp.negativeFill.varShading.endX:null,
                    gradient: condition4gradient?{
                        startColor: condition4?shadingProp.negativeFill.varShading.gradient.startColor:null,
                        endColor: condition4?shadingProp.negativeFill.varShading.gradient.endColor:null
                    }:null,
                    palette: condition4palette?( condition4?shadingProp.negativeFill.varShading.palette:null):null,
                    palName: condition4palette?(condition3?shadingProp.negativeFill.varShading.palName:null):null,
                    customFills: condition4customFills?( condition4?shadingProp.negativeFill.varShading.customFills:null):null
                }
            }
            variableShadingItem._index = index;

            shadingChangedItem = {
                change: "0",
                _index: index
            }
            self.shadingArr.push(shadingItem);
            self.fillPatternOptions.push(fillPatternItem);
            self.variableShadingOptions.push(variableShadingItem);
            self.shadingChanged.push(shadingChangedItem);
            console.log("variableShadingOptions", self.variableShadingOptions);
        });
        this.curveList.forEach(function (curve, index) {
            let curveOptions = {};
            let lineOptions = {};
            let symbolOptions = {};
            curveOptions = utils.curveOptions(currentTrack, curve, index);

            self.arr.forEach(function (item) {
                if (curve.idCurve == item.id) {
                    self.lineCurve.push(item);
                }
            })

            self.curves.push(curveOptions);
            if (curve.line) {
                lineOptions = {
                    _index: index,
                    display: true,
                    lineStyle: {
                        lineColor: curve.line.color,
                        lineWidth: curve.line.width,
                        lineStyle: curve.line.dash
                    }
                }

            } else {
                lineOptions = {
                    _index: index,
                    display: false,
                    lineStyle: {
                        lineColor: "#0ff",
                        lineWidth: 1,
                        lineStyle: [10, 0]
                    }
                }

            }
            self.curvesLineOptions.push(lineOptions);

            if (curve.symbol) {
                symbolOptions = {
                    _index: index,
                    display: true,
                    symbolStyle: {
                        symbolName: curve.symbol.style, // cross, diamond, star, triangle, dot, plus
                        symbolSize: curve.symbol.size,
                        symbolStrokeStyle: curve.symbol.strokeStyle,
                        symbolFillStyle: curve.symbol.fillStyle,
                        symbolLineWidth: curve.symbol.lineWidth,
                        symbolLineDash: curve.symbol.lineDash
                    }
                }
            } else {
                symbolOptions = {
                    _index: index,
                    display: false,
                    symbolStyle: {
                        symbolName: "circle", // cross, diamond, star, triangle, dot, plus
                        symbolSize: 4,
                        symbolStrokeStyle: "black",
                        symbolFillStyle: "transparent",
                        symbolLineWidth: 1,
                        symbolLineDash: [10, 0]
                    }
                }
            }
            self.curvesSymbolOptions.push(symbolOptions);
            self.curvesChanged.push({
                _index: index,
                change: '0'
            });
        });
        console.log("LINECURVE", this.lineCurve);
        console.log("RRRR", this.selectCurveArr, this.arr);
        this.setFillDisplay = function (index) {
            if (self.shadingArr[index].idLeftLine) {
                self.shadingArr[index].isNegPosFill = false;
                self.fillPatternOptions[index].fill.display = true;
                if (self.fillPatternOptions[index].positiveFill) self.fillPatternOptions[index].positiveFill.display = false;
                if (self.fillPatternOptions[index].negativeFill) self.fillPatternOptions[index].negativeFill.display = false;

            }

        };
        this.well.children.forEach(function (child) {
            if (child.type == 'dataset') self.datasets.push(child);
        });
        console.log("Current Track", currentTrack);
        this.props = {
            general: currentTrack.getProperties()
        }
        this.props.general.width = utils.pixelToInch(this.props.general.width);
        console.log("props", this.props.general);

        this.logLinear = ["Logarithmic", "Linear"];
        this.displayMode = ["Line", "Symbol", "Both", "None"];
        this.displayAs = ["Normal", "Culmulative", "Mirror", "Pid"];

        this.__idx = null;
        this.setClickedRowCurve = function (index) {
            $scope.selectedRowCurve = index;
            self.__idx = self.getCurves()[index]._index;

        };
        this.removeRowCurve = function () {
            self.curvesChanged[self.__idx].change = '3';
            console.log("curvesChanged", self.curvesChanged, self.__idx);
        }

        function removeCurve(idLine) {
            wiApiService.removeLine(idLine, function () {
                currentTrack.removeCurveById(idLine);
            });
        }
        this.onSelectCurve = function () {
            if (self.curvesChanged[self.__idx].change == '2') {
                idCurveNew = self.lineCurve[self.__idx].id;
                console.log("idCurveNew", idCurveNew, self.__idx, self.curvesChanged, self.lineCurve[self.__idx]);
                wiApiService.infoCurve(idCurveNew, function (curveInfo) {
                    console.log(curveInfo, self.curves, self.curvesLineOptions, self.curvesSymbolOptions);
                    $timeout(function () {
                        self.curves[self.__idx] = {
                            _index: self.__idx,
                            alias: curveInfo.name,
                            autoValueScale: false,
                            blockPosition: curveInfo.LineProperty.blockPosition,
                            displayAs: "Normal",
                            displayMode: curveInfo.LineProperty.displayMode,
                            displayType: curveInfo.LineProperty.displayType,
                            idLine: null,
                            idTrack: currentTrack.id,
                            ignoreMissingValues: true,
                            maxValue: curveInfo.LineProperty.maxScale,
                            minValue: curveInfo.LineProperty.minScale,
                            showDataset: true,
                            showHeader: true,
                            wrapMode: 'None'
                        };
                        self.curvesLineOptions[self.__idx] = {
                            _index: self.__idx,
                            display: true,
                            lineStyle: {
                                lineColor: curveInfo.LineProperty.lineColor,
                                lineStyle: eval(curveInfo.LineProperty.lineStyle),
                                lineWidth: curveInfo.LineProperty.lineWidth
                            }
                        };
                        self.curvesSymbolOptions[self.__idx] = {
                            _index: self.__idx,
                            display: false,
                            symbolStyle: {
                                symbolFillStyle: "transparent",
                                symbolLineDash: [10, 0],
                                symbolLineWidth: 1,
                                symbolName: "circle",
                                symbolSize: 4,
                                symbolStrokeStyle: "black"
                            }
                        }
                    });
                });
            }
        }
        this.getCurves = function () {
            return self.curves.filter(function (c, index) {
                return self.curvesChanged[index].change != '3';
            });
        }
        this.onChangeCurve = function () {
            if (self.curvesChanged[self.__idx].change == '0') self.curvesChanged[self.__idx].change = '1';
            console.log(self.curvesChanged[self.__idx]);
        }
        this.addRowCurve = function () {
            self.curves.push({ _index: self.curves.length });
            console.log(self.curves);
            self.curvesChanged.push({
                _index: self.curvesChanged.length,
                change: '2'
            });
            console.log("curvesChanged", self.curvesChanged, self.curves, self.lineCurve, self.__idx);
        };

        this.setClickedRowShading = function (index) {
            $scope.selectedRowShading = index;
            self.__idx = self.getShadings()[index]._index;
            console.log("onClickedRow", self.__idx, index, self.getShadings()[index]._index);
        }
        this.onChangeShading = function (index) {
            if (self.shadingChanged[index].change == '0') self.shadingChanged[index].change = '1';
        }
        this.removeRowShading = function () {//TODO
            if (self.shadingChanged[self.__idx].change == '2') self.shadingChanged[self.__idx] = '4';
            else self.shadingChanged[self.__idx].change = '3';
            console.log("removeRowShading", self.shadingChanged[self.__idx], self.__idx);
        }
        this.setShadingName = function (curveId, idx, isRight) {
            var curveName = null;
            var leftPart = null;
            var rightPart = null;
            if (self.shadingArr[idx].name.indexOf('_') < 0) self.shadingArr[idx].name = "xx_yy";
            if (isRight) {
                if (!curveId) {
                    rightPart = 'right';
                } else {
                    for (curve of self.curvesOnDataset) {
                        if (curve.id == parseInt(curveId)) {
                            rightPart = curve.name;
                            break;
                        }
                    }
                }
                self.shadingArr[idx].name = self.shadingArr[idx].name.replace(/_.+/g, "_" + rightPart);
            } else {
                if (!curveId) {
                    leftPart = 'left';
                } else {
                    for (curve of self.curvesOnDataset) {
                        if (curve.id == parseInt(curveId)) {
                            leftPart = curve.name;
                            break;
                        }
                    }
                }
                self.shadingArr[idx].name = self.shadingArr[idx].name.replace(/^.+_/g, leftPart + "_");
            }
        }
        this.addRowShading = function() {
            var shadingItem = {
                idTrack: currentTrack.id,
                name: 'xx_yy',
                shadingStyle: "fillPattern",
                isNegPosFill: false,
                //isNegPosFilling: false,
                type: 'left',
                _index: self.shadingArr.length
            };
            var condition1 = (shadingItem.shadingStyle == "fillPattern" && !shadingItem.isNegPosFill);
            var condition2 = (shadingItem.shadingStyle == "fillPattern" && shadingItem.isNegPosFill);
            var condition3 = (shadingItem.shadingStyle == "variableShading" && !shadingItem.isNegPosFill);
            var condition4 = (shadingItem.shadingStyle == "variableShading" && shadingItem.isNegPosFill);

            var fillPatternItem = {
                fill: {
                    display: condition1,
                    pattern: {
                        name: "none",
                        foreground: "#fff",
                        background: "#000"
                    }
                },
                positiveFill: {
                    display: condition2,
                    pattern: {
                        name: "none",
                        foreground: "#fff",
                        background: "000"
                    }
                },
                negativeFill: {
                    display: condition2,
                    pattern: {
                        name: "none",
                        foreground: "#fff",
                        background: "#000"
                    }
                },
                _index: self.fillPatternOptions.length
            };
            var variableShadingItem = {
                fill: {
                    display: condition3,
                    varShading: {
                        startX: null,
                        endX: null,
                        gradient: {
                            startColor: "#fff",
                            endColor: "#000"
                        },
                        palette: null,
                        palName: null,
                        customFills: null
                    }
                },
                positiveFill: {
                    display: condition4,
                    varShading: {
                        startX: null,
                        endX: null,
                        gradient: {
                            startColor: "#fff",
                            endColor: "#000"
                        },
                        palette: null,
                        palName: null,
                        customFills: null
                    }
                },
                negativeFill: {
                    display: condition4,
                    varShading: {
                        startX: null,
                        endX: null,
                        gradient: {
                            startColor: "#fff",
                            endColor: "#000"
                        },
                        palette: null,
                        palName: null,
                        customFills: null
                    }
                },

                _index: self.variableShadingOptions.length
            };
            var shadingChangedItem = {
                change: '2',
                _index: self.shadingArr.length
            };
            self.shadingArr.push(shadingItem);
            self.fillPatternOptions.push(fillPatternItem);
            self.variableShadingOptions.push(variableShadingItem);
            self.shadingChanged.push(shadingChangedItem);
            console.log(self.shadingArr, self.fillPatternOptions, self.variableShadingOptions, self.shadingChanged);
        }
        this.shadingArr.forEach(function(index, item){
            if(!item.idLeftLine){
                if(item.type == 'left') item.idLeftLine = -1;
                if(item.type == 'right') item.idLeftLine = -2;
                if(item.type == 'custom') item.idLeftLine = -3;
            }
        })
        this.validate = function(index) {
            if(self.shadingArr[index].idLeftLine == self.shadingArr[index].idRightLine) {
                DialogUtils.errorMessageDialog(ModalService, "leftCurve and rightCurve cannot be the same!");
                self.shadingArr[index].idLeftLine = null;
                self.shadingArr[index].leftFixedValue = 0;
            };
        }

        function updateShadings(){
            console.log("update shadings");
            self.shadingChanged.forEach(function(item, index){
                if(item.change == "1") {
                    console.log("111",self.shadingArr[index],
                                                     self.fillPatternOptions[index], 
                                                     self.variableShadingOptions[index]);
                    let shadingObj = utils.mergeShadingObj(self.shadingArr[index], 
                                                     self.fillPatternOptions[index], 
                                                     self.variableShadingOptions[index]);
                    if(shadingObj.idLeftLine < 0) shadingObj.idLeftLine = null;
                    if(shadingObj.idLeftLine > 0) {
                        shadingObj.leftFixedValue = null;
                        shadingObj.idLeftLine = parseInt(shadingObj.idLeftLine);
                    }
                    console.log(shadingObj);
                    console.log('visualize-+-shading', shadingList[index]);
                    wiApiService.editShading(shadingObj, function (result) {
                        console.log(result, shadingObj);
                        let shadingObjToSet = angular.copy(shadingObj);
                        wiApiService.getPalettes(function(paletteList){
                            shadingObjToSet.leftCurve = findInVisCurveListByIdLine(shadingObj.idLeftLine);
                            shadingObjToSet.rightCurve = findInVisCurveListByIdLine(shadingObj.idRightLine);
                            shadingObjToSet.controlCurve = findInVisCurveListByIdCurve(shadingObj.idControlCurve);
                            if(!shadingObj.isNegPosFill) {
                                if(shadingObjToSet.fill.varShading && shadingObjToSet.fill.varShading.palette) 
                                    shadingObjToSet.fill.varShading.palette = paletteList[shadingObjToSet.fill.varShading.palName];
                            }
                            else {
                                if(shadingObjToSet.positiveFill.varShading && shadingObjToSet.positiveFill.varShading.palette) 
                                    shadingObjToSet.positiveFill.varShading.palette = paletteList[shadingObjToSet.positiveFill.varShading.palName];
                                if(shadingObjToSet.negativeFill.varShading && shadingObjToSet.negativeFill.varShading.palette) 
                                    shadingObjToSet.negativeFill.varShading.palette = paletteList[shadingObjToSet.negativeFill.varShading.palName];
                            }
                            console.log("LEFT/RIGHT CURVE", shadingObjToSet);
                            shadingList[index].setProperties(shadingObjToSet);
                            $timeout(function() {
                                currentTrack.plotAllDrawings();
                            });
                        });
                    });
                }
            });
        }

        function findInVisCurveListByIdLine(idLine) {
            for (let line of self.curveList) {
                if (line.id == idLine) {
                    return line;
                }
            }
            return null;
        }

        function findInVisCurveListByIdCurve(idCurve) {
            for (let line of self.curveList) {
                if (line.idCurve == idCurve) {
                    return line;
                }
            }
            return null;
        }

        function createNewShadings() {
            self.shadingChanged.forEach(function (item, index) {
                if (item.change == '2') {
                    let shadingObj = utils.mergeShadingObj(self.shadingArr[index],
                        self.fillPatternOptions[index],
                        self.variableShadingOptions[index]);
                    console.log("shadingObj", shadingObj);
                    if(shadingObj.idLeftLine < 0) shadingObj.idLeftLine = null;
                    if(shadingObj.idLeftLine > 0) shadingObj.leftFixedValue = null;
                    wiApiService.createShading(shadingObj, function(shading) {
                        wiApiService.getPalettes(function(paletteList){

                            let shadingModel = utils.shadingToTreeConfig(shading, paletteList);
                            let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();
                            let lineObj1 = null;
                            let lineObj2 = null;
                            if(!shadingModel.idRightLine) return;
                            if(!shadingModel.idLeftLine) {
                                lineObj1 = findInVisCurveListByIdLine(shading.idRightLine);
                                wiD3Ctrl.addCustomShadingToTrack(currentTrack, lineObj1, shadingModel.data.leftX, shadingModel.data);
                            } else {
                                lineObj1 = findInVisCurveListByIdLine(shading.idLeftLine);
                                lineObj2 = findInVisCurveListByIdLine(shading.idRightLine);
                                if (lineObj1 && lineObj2) 
                                    wiD3Ctrl.addPairShadingToTrack(currentTrack, lineObj2, lineObj1, shadingModel.data);
                                else {
                                    console.error("cannot find lineObj1 or lineObj2:", lineObj1, lineObj2);
                                }
                            }
                        })
                    })
                }
            })
        }
        // Dialog buttons
        this.defineButtonClicked = function (index) {
            var shading = self.shadingArr[index];
            console.log("shadingAttributeOri88888", self.fillPatternOptions[index], self.variableShadingOptions[index], self.shadingArr[index]);

            DialogUtils.shadingAttributeDialog(ModalService, wiApiService, function(fillPatternOptions, variableShadingOptions, shadingOptions, curvesOnDataset){
                console.log("shadingAttribute", fillPatternOptions, variableShadingOptions, shadingOptions);
                // console.log("shadingAttributeOri", self.fillPatternOptions[index], self.variableShadingOptions[index], self.shadingArr[index]);
                if(fillPatternOptions) self.fillPatternOptions[index] = fillPatternOptions;
                if(variableShadingOptions) self.variableShadingOptions[index] = variableShadingOptions;
                if(shadingOptions) self.shadingArr[index] = shadingOptions;

            }, self.fillPatternOptions[index], self.variableShadingOptions[index], self.shadingArr[index], self.curveList, self.curvesOnDataset);

        }
        this.lineStyleButtonClicked = function (index, $event) {
            self.setClickedRowCurve(index);
            DialogUtils.lineStyleDialog(ModalService, wiComponentService, function (options) {}, self.curvesLineOptions[self.__idx]);
            $event.stopPropagation();
        };
        this.symbolStyleButtonClicked = function (index, $event) {
            self.setClickedRowCurve(index);
            DialogUtils.symbolStyleDialog(ModalService, wiComponentService, function (options) {}, self.curvesSymbolOptions[self.__idx]);
            $event.stopPropagation();
        };
        this.colorTrack = function () {
            DialogUtils.colorPickerDialog(ModalService, self.props.general.color, function (colorStr) {
                self.props.general.color = colorStr;
            });
        };

        function getCurveFromCurveListById(idLine) {
            lineObjs = self.curveList.filter(function (item, index) {
                return (item.idCurve == idLine);
            });
            return lineObjs[0];
        }

        function updateLine(index) {
            let curveOptions = self.curves[index];
            let lineOptions = self.curvesLineOptions[index].lineStyle;
            let symbolOptions = self.curvesSymbolOptions[index].symbolStyle;
            let lineObj = utils.mergeLineObj(curveOptions, lineOptions, symbolOptions);
            utils.changeLine(lineObj, wiApiService, function () {
                self.curveList[index].setProperties(lineObj);
                currentTrack.plotCurve(self.curveList[index]);

                if (callback) callback();
            });
        }

        function updateGeneralTab() {
            utils.changeTrack(self.props.general, wiApiService);
            let newProps = angular.copy(self.props);
            newProps.general.width = utils.inchToPixel(self.props.general.width);
            currentTrack.setProperties(newProps.general);
            currentTrack.doPlot(true);
            return true;
        }

        function updateCurvesTab() {

            function roundTwo() {
                self.curvesChanged.forEach(function (item, index) {
                    if (item.change == '1') {
                        updateLine(index);
                        item.change = '0';
                    }
                    if (item.change == '3') {
                        removeCurve(self.curves[index].idLine);
                    }
                });
                // remove all deleted curve from self.curves and self.curvesChanged. IMPORTANT!
                for (let idx = self.curvesChanged.length - 1; idx > -1; idx--) {
                    if (self.curvesChanged[idx].change == "3") {
                        self.curvesChanged.splice(idx, 1);
                        self.curves.splice(idx, 1);
                        self.curvesSymbolOptions.splice(idx, 1);
                        self.curvesLineOptions.splice(idx, 1);
                        self.lineCurve.splice(idx, 1);
                        self.arr.splice(idx, 1);
                    }
                }
            }

            function roundOne() {
                self.curvesChanged.forEach(function (item, index) {
                    if (item.change == '2') {
                        let lineObj = {
                            idCurve: idCurveNew,
                            idTrack: currentTrack.id
                        }
                        wiApiService.createLine(lineObj, function (line) {
                            console.log("CREATE:", line);
                            utils.getCurveData(wiApiService, line.idCurve, function (err, data) {
                                let lineModel = utils.lineToTreeConfig(line);
                                if (!err) {
                                    wiD3Ctrl.addCurveToTrack(currentTrack, data, lineModel.data);
                                    self.curves[index].idLine = line.idLine;
                                    self.curvesChanged[index].change = '1';
                                    eventEmitter.emitEvent("line-created");
                                } else {
                                    console.error(err);
                                }
                            });
                        });
                    }
                });

            }

            var eventEmitter = new EventEmitter();
            var numberberOfNewLines = self.curvesChanged.reduce(function (total, item) {
                if (item.change == '2') return total + 1;
                return total;
            }, 0);
            if (numberberOfNewLines == 0) {
                roundTwo();
            } else {
                let lineCreatedCount = 0;
                eventEmitter.on('line-created', function () {
                    lineCreatedCount = lineCreatedCount + 1;
                    if (lineCreatedCount == numberberOfNewLines) {
                        self.curveList = currentTrack.getCurves();
                        roundTwo();
                    }
                });
                roundOne();
            }

            return true;
        };
        this.getShadings = function () {
            return self.shadingArr.filter(function (c, index) {
                return (self.shadingChanged[index].change < '3');
            });
        }

        function removeShadings() {
            self.shadingChanged.forEach(function (item, index) {
                if (item.change == '3') {
                    wiApiService.removeShading(self.shadingArr[index].idShading, function (result) {
                        console.log("removeShading");
                        let currentShading = currentTrack.findShadingById(result.idShading);
                        wiD3Ctrl.removeShadingFromTrack(currentTrack, currentShading);
                        self.shadingChanged.splice(1, index);
                        self.shadingArr.slice(1, index);
                        self.fillPatternOptions.slice(1, index);
                        self.variableShadingOptions.slice(1, index);
                    });
                };
                if (item.change == '4') {
                    self.shadingChanged.splice(1, index);
                    self.shadingArr.slice(1, index);
                    self.fillPatternOptions.slice(1, index);
                    self.variableShadingOptions.slice(1, index);
                }
            });
        };
        this.setLimit2 = function(index) {
            if(self.shadingArr[index].idLeftLine == -1) {
                self.shadingArr[index].leftFixedValue = findInVisCurveListByIdLine(self.shadingArr[index].idRightLine).minX;
            }
            if(self.shadingArr[index].idLeftLine == -2) {
                self.shadingArr[index].leftFixedValue = findInVisCurveListByIdLine(self.shadingArr[index].idRightLine).maxX;
            }
            if(self.shadingArr[index].idLeftLine > 0) self.shadingArr[index].leftFixedValue = null;
        }
        this.matchIdLeftLine = function(index) {
            if(self.shadingArr[index].idLeftLine > 0) {
                self.shadingArr[index].leftFixedValue = null;
                $('#fixedVal').prop('disabled', true);
            }
        }
        function validateAll() {
            // return true;
            for (var index in self.shadingChanged) {
                if (!self.shadingArr[index].idRightLine) {
                    return false;
                } else if (!self.shadingArr[index].idLeftLine && isNaN(parseInt(self.shadingArr[index].leftFixedValue))) {
                    return false;
                }
            };
            return true;
        }

        function updateShadingsTab() {
            if (validateAll()) {
                updateShadings();
                createNewShadings();
                removeShadings();
            } else {
                DialogUtils.errorMessageDialog(ModalService, "Shading setting is not valid");
                return false;
            }
            return true;
        }
        this.onApplyButtonClicked = function () {
            // if (!updateGeneralTab()) return;
            // if (!updateCurvesTab()) return;
            // if (!updateShadingsTab()) return;
            return updateGeneralTab() && updateCurvesTab() && updateShadingsTab();
        };
        this.onOkButtonClicked = function () {
            // updateGeneralTab();
            // updateCurvesTab();
            // updateShadingsTab();
            if (updateGeneralTab() && updateCurvesTab() && updateShadingsTab()) {
                close(self.props);
            }
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
        if (options.shadingOnly) { wiModal.shadingOnly = true };
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
};

exports.depthTrackPropertiesDialog = function (ModalService, currentTrack, wiApiService, callback) {
    function ModalController($scope, wiComponentService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        console.log("Depth track", currentTrack);
        this.props = currentTrack.getProperties();
        console.log('props1', this.props.geometryWidth, this.props);

        this.props.geometryWidth = utils.pixelToInch(this.props.geometryWidth);
        console.log('props2', this.props.geometryWidth, this.props);
        // Dialog buttons
        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.props.trackBackground, function (colorStr) {
                self.props.trackBackground = colorStr;
            });
        }

        function updateDepthTrack() {
            utils.editDepthTrack(self.props, wiApiService);
            let newProps = angular.copy(self.props);
            newProps.geometryWidth = utils.inchToPixel(self.props.geometryWidth);
            currentTrack.setProperties(newProps);
            currentTrack.doPlot(true);
        };
        this.onApplyButtonClicked = function () {
            updateDepthTrack();

        };
        this.onOkButtonClicked = function () {
            updateDepthTrack();
            close(self.props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "depth-track-properties/depth-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
};

exports.zoneTrackPropertiesDialog = function (ModalService, wiLogplotCtrl, zoneTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let wiLogplotModel = wiLogplotCtrl.getLogplotModel();
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = zoneTrackProperties || {
            showTitle: true,
            title: "New Zone",
            topJustification: "center",
            bottomJustification: "center",
            trackColor: '#ffffff',
            width: utils.inchToPixel(1),
            parameterSet: null
        }
        props.width = utils.pixelToInch(props.width);
        console.log(props);
        this.isShowTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.bottomJustification = props.bottomJustification.toLowerCase();
        this.trackColor = props.trackColor;
        this.width = props.width;
        this.parameterSet = props.parameterSet;
        this.zoneSets = [];

        function refreshZoneSets() {
            wiApiService.zoneSetList(wiLogplotModel.properties.idWell, function (zoneSets) {
                $scope.$apply(function () {
                    self.zoneSets = zoneSets;
                })
            });
        }
        refreshZoneSets();
        this.idZoneSet = props.idZoneSet;
        // Dialog buttons
        this.createZoneSet = function () {
            utils.createZoneSet(wiLogplotModel.properties.idWell, function () {
                refreshZoneSets();
            });
        }
        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.trackColor, function (colorStr) {
                self.trackColor = colorStr;
            });
        }
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
                showTitle: self.isShowTitle,
                title: self.title,
                topJustification: self.topJustification,
                bottomJustification: self.bottomJustification,
                trackColor: self.trackColor,
                width: self.width,
                parameterSet: self.parameterSet,
                idZoneSet: self.idZoneSet
            }
        }
    }
    ModalService.showModal({
        templateUrl: "zone-track-properties/zone-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
}

exports.zonePropertiesDialog = function (ModalService, zoneTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = zoneTrackProperties || {};
        console.log(props);
        this.startDepth = Math.round(props.startDepth * 10000) / 10000;
        this.endDepth = Math.round(props.endDepth * 10000) / 10000;
        this.fill = props.fill;
        this.showName = props.showName;
        this.name = props.name;

        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.foreground = function () {
            dialogUtils.colorPickerDialog(ModalService, self.fill.pattern.foreground, function (colorStr) {
                self.fill.pattern.foreground = colorStr;
            });
        }
        this.background = function () {
            dialogUtils.colorPickerDialog(ModalService, self.fill.pattern.background, function (colorStr) {
                self.fill.pattern.background = colorStr;
            });
        }
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
            props.name = self.name,
                props.showName = self.showName,
                props.startDepth = self.startDepth,
                props.endDepth = self.endDepth,
                props.fill = self.fill
        }
    }
    ModalService.showModal({
        templateUrl: "zone-properties/zone-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
}

exports.errorMessageDialog = function (ModalService, errorMessage) {
    function ModalController($scope, close) {
        let self = this;
        this.error = errorMessage;
        this.onCloseButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'error-message/error-message-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
        })
    });
};

exports.warningMessageDialog = function (ModalService, warningMessage) {
    function ModalController($scope, close) {
        let self = this;
        this.warning = warningMessage;
        this.onCloseButtonClicked = function () {
            close(null);
        };
    }
    ModalService.showModal({
        templateUrl: 'warning-message/warning-message-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
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
            version: "1.0x",
            build: "2017-08-01"
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'about/about-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        })
    });
};
exports.rangeSpecificDialog = function (ModalService, wiLogplot, callback) {
    function ModalController($scope, close) {
        let self = this;
        let wiD3Ctr = wiLogplot.getwiD3Ctrl();
        this.depthRange = wiD3Ctr.getDepthRange();

        this.onOkButtonClicked = function () {
            wiD3Ctr.setDepthRange(self.depthRange);
            close(self);
        }
        this.onCancelButtonClicked = function () {
            wiD3Ctr.setDepthRange(self.depthRange);
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'range-specific/range-specific-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        })
    });
};
exports.newBlankCrossplotDialog = function (ModalService, callback) {
    function ModalController($scope, close, $timeout, wiComponentService, wiApiService) {
        let self = this;
        self.name = "BlankCrossPlot";
        self.error = null;
        self.disabled = false;

        this.onOkButtonClicked = function () {
            close(self.name);
        }

    }

    ModalService.showModal({
        templateUrl: "blank-crossplot/blank-crossplot-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (newPlot) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (callback && newPlot) callback(newPlot);
        });
    });
}
exports.colorPickerDialog1 = function (ModalService, currentColor, callback) {
    let wiModal = null;
    let thisTimeout = null;

    function ModalController($scope, close, $timeout, wiComponentService, wiApiService, $compile) {
        let self = this;
        wiModal = this;
        thisScope = $scope;
        thisTimeout = $timeout;

        function colorToString(colorObj) {
            var colorStr = 'rgba(' + colorObj.r + ',' + colorObj.g + ',' + colorObj.b + ',' + colorObj.a + ')';
            return colorStr;
        }
        this.updateColor = function () {
            var colorStr = colorToString(self.color);
            $('#cp').colorpicker('setValue', colorStr);
        }
        this.color = null;
        this.onOkButtonClicked = function () {
            close(colorToString(self.color));
        }
        this.onCancelButtonClicked = function () {
            close();
        }
    }
    ModalService.showModal({
        templateUrl: "color-picker/color-picker-modal-1.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        $('#cp').colorpicker({
            format: 'rgba',
            inline: true,
            container: '#demo',
            customClass: 'wiColorpicker',
            sliders: {
                saturation: {
                    maxTop: 170,
                    maxLeft: 170
                },
                hue: {
                    maxTop: 170
                },
                alpha: {
                    maxTop: 170
                }
            },
            colorSelectors: {
                'black': '#000000',
                'white': '#ffffff',
                'red': '#FF0000',
                'default': '#777777',
                'primary': '#337ab7',
                'success': '#5cb85c',
                'info': '#5bc0de',
                'warning': '#f0ad4e',
                'danger': '#d9534f',
                'aliceBlue': '#f0f8ff',
                'antiqueWhite': '#faebd7',
                'aqua': '#00ffff',
                'aquamarine': '7fffd4'
            }
        }).on('changeColor', function (evt) {
            var temp = evt.color.toRGB();
            thisTimeout(function () { wiModal.color = temp; });
        });
        $('#cp').colorpicker('setValue', currentColor);
        modal.close.then(function (colorStr) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (callback) if (colorStr) callback(colorStr);
        });
    });
}

exports.colorPickerDialog = function (ModalService, currentColor, callback) {
    if (!currentColor) currentColor = "#fff";

    function colorToString(color) {
        var retArray = [color.r, color.g, color.b, color.a];
        return 'rgba(' + retArray.join(',') + ')';
    }

    const ColorTemps = [
        [
            { name: 'red-dark', color: { r: 150, g: 0, b: 0, a: 1 } },
            { name: 'orange-dark', color: { r: 150, g: 50, b: 0, a: 1 } },
            { name: 'yellow-dark', color: { r: 150, g: 150, b: 0, a: 1 } },
            { name: 'green-dark', color: { r: 0, g: 150, b: 0, a: 1 } },
            { name: 'cyan-dark', color: { r: 0, g: 150, b: 150, a: 1 } },
            { name: 'blue-dark', color: { r: 0, g: 0, b: 150, a: 1 } },
            { name: 'violet-dark', color: { r: 50, g: 0, b: 150, a: 1 } },
            { name: 'pink-dark', color: { r: 150, g: 0, b: 50, a: 1 } },
        ], [
            { name: 'red-lighter', color: { r: 200, g: 0, b: 0, a: 1 } },
            { name: 'orange-lighter', color: { r: 200, g: 100, b: 0, a: 1 } },
            { name: 'yellow-lighter', color: { r: 200, g: 200, b: 0, a: 1 } },
            { name: 'green-lighter', color: { r: 0, g: 200, b: 0, a: 1 } },
            { name: 'cyan-lighter', color: { r: 0, g: 200, b: 200, a: 1 } },
            { name: 'blue-lighter', color: { r: 0, g: 0, b: 200, a: 1 } },
            { name: 'violet-lighter', color: { r: 100, g: 0, b: 200, a: 1 } },
            { name: 'pink-lighter', color: { r: 200, g: 0, b: 100, a: 1 } },
        ], [
            { name: 'red-true', color: { r: 255, g: 0, b: 0, a: 1 } },
            { name: 'orange-true', color: { r: 255, g: 155, b: 0, a: 1 } },
            { name: 'yellow-true', color: { r: 255, g: 255, b: 0, a: 1 } },
            { name: 'green-true', color: { r: 0, g: 255, b: 0, a: 1 } },
            { name: 'cyan-true', color: { r: 0, g: 255, b: 255, a: 1 } },
            { name: 'blue-true', color: { r: 0, g: 0, b: 255, a: 1 } },
            { name: 'violet-true', color: { r: 155, g: 0, b: 255, a: 1 } },
            { name: 'pink-true', color: { r: 255, g: 0, b: 155, a: 1 } },
        ], [
            { name: 'red-lighter', color: { r: 255, g: 50, b: 50, a: 1 } },
            { name: 'orange-lighter', color: { r: 255, g: 155, b: 50, a: 1 } },
            { name: 'yellow-lighter', color: { r: 255, g: 255, b: 50, a: 1 } },
            { name: 'green-lighter', color: { r: 50, g: 255, b: 50, a: 1 } },
            { name: 'cyan-lighter', color: { r: 50, g: 255, b: 255, a: 1 } },
            { name: 'blue-lighter', color: { r: 50, g: 50, b: 255, a: 1 } },
            { name: 'violet-lighter', color: { r: 155, g: 50, b: 255, a: 1 } },
            { name: 'pink-lighter', color: { r: 255, g: 50, b: 155, a: 1 } },
        ], [
            { name: 'red-lighter', color: { r: 255, g: 100, b: 100, a: 1 } },
            { name: 'orange-lighter', color: { r: 255, g: 155, b: 100, a: 1 } },
            { name: 'yellow-lighter', color: { r: 255, g: 255, b: 100, a: 1 } },
            { name: 'green-lighter', color: { r: 100, g: 255, b: 100, a: 1 } },
            { name: 'cyan-lighter', color: { r: 100, g: 255, b: 255, a: 1 } },
            { name: 'blue-lighter', color: { r: 100, g: 100, b: 255, a: 1 } },
            { name: 'violet-lighter', color: { r: 155, g: 100, b: 255, a: 1 } },
            { name: 'pink-lighter', color: { r: 255, g: 100, b: 155, a: 1 } },
        ], [
            { name: 'red-light', color: { r: 255, g: 150, b: 150, a: 1 } },
            { name: 'orange-light', color: { r: 255, g: 155, b: 150, a: 1 } },
            { name: 'yellow-light', color: { r: 255, g: 255, b: 150, a: 1 } },
            { name: 'green-light', color: { r: 150, g: 255, b: 150, a: 1 } },
            { name: 'cyan-light', color: { r: 155, g: 255, b: 255, a: 1 } },
            { name: 'blue-light', color: { r: 150, g: 150, b: 255, a: 1 } },
            { name: 'violet-light', color: { r: 155, g: 150, b: 255, a: 1 } },
            { name: 'pink-light', color: { r: 255, g: 150, b: 155, a: 1 } },
        ], [
            { name: 'black', color: { r: 0, g: 0, b: 0, a: 1 } },
            { name: 'black-gray', color: { r: 37, g: 37, b: 37, a: 1 } },
            { name: 'gray-dark', color: { r: 74, g: 74, b: 74, a: 1 } },
            { name: 'gray', color: { r: 111, g: 111, b: 111, a: 1 } },
            { name: 'gray-light', color: { r: 148, g: 148, b: 148, a: 1 } },
            { name: 'white-gray', color: { r: 187, g: 187, b: 187, a: 1 } },
            { name: 'white', color: { r: 220, g: 220, b: 220, a: 1 } },
            { name: 'white', color: { r: 255, g: 255, b: 255, a: 1 } },
        ],
    ];
    var colorCustoms = [
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 1 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 2 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 3 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 4 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 5 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 6 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 7 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 8 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 9 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 10 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 11 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 12 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 13 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 14 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 15 },
        { color: { r: 255, g: 255, b: 254, a: 1 }, id: 16 },
    ];

    let modalCtrl = null;
    let timeoutFunc = null;

    function Controller($scope, close, $timeout, $window) {
        let self = this;
        modalCtrl = this;
        timeoutFunc = $timeout;
        // self.currentColor = {r: 255, g: 255, b: 255, a: 1};
        self.currentColor = currentColor;
        self.close = function (ret) {
            self.saveColorCustom();
            close(ret);
        };
        self.updateColor = function () {
            var colorString = colorToString(self.currentColor);
            $('#cp').colorpicker('setValue', colorString);
        };
        self.CpSelector = ColorTemps;
        self.toString = function (color) {
            return colorToString(color);
        };
        self.CpCustoms = null;
        self.currentFocus = 0;
        self.BoxBorder = function (id) {
            if (self.currentFocus === id) {
                return '2px solid black';
            } else {
                return 'none';
            }
        };
        self.handleFocus = function (col) {
            self.currentFocus = col.id;
        };
        self.addToCustom = function () {
            if (self.currentFocus > 0) {
                self.CpCustoms[self.CpCustoms.map(function (e) { return e.id; }).indexOf(self.currentFocus)].color = self.currentColor;
            } else {
                console.log('please choose one box');
            }
        };
        self.loadColorCustom = function () {
            let colorString = $window.localStorage.getItem('colorCustoms');
            if (colorString) {
                return JSON.parse(colorString);
            } else {
                return colorCustoms;
            }
        };
        self.saveColorCustom = function () {
            let colorString = JSON.stringify(self.CpCustoms);
            $window.localStorage.setItem('colorCustoms', colorString);
        };
        this.onOkButtonClicked = function () {
            self.saveColorCustom();
            close(colorToString(self.currentColor));
        }
        this.onCancelButtonClicked = function () {
            close();
        }
    };
    ModalService.showModal({
        templateUrl: 'color-picker/color-picker-modal.html',
        controller: Controller,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modalCtrl.CpCustoms = modalCtrl.loadColorCustom();
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        const cpOptions = {
            customClass: 'cp-custom',
            container: '#cp-container',
            format: 'rgba',
            inline: true,
            color: colorToString(modalCtrl.currentColor),
            sliders: {
                saturation: {
                    maxLeft: 160,
                    maxTop: 160
                },
                hue: {
                    maxTop: 160
                },
                alpha: {
                    maxTop: 160
                }
            }
        }
        $('#cp').colorpicker(cpOptions).on('changeColor', function (event) {
            timeoutFunc(function () { modalCtrl.currentColor = event.color.toRGB(); });
        });
        $('#cp').colorpicker('setValue', currentColor);
        modal.close.then(function (colorStr) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (callback) if (colorStr) callback(colorStr);
        });
    })
}


/*
exports.shadingPropertiesDialog = function (ModalService, currentTrack, currentCurve, currentShading, callback) {
    let thisModal = null;
    function ModalController($scope, wiComponentService, close) {
        let error = null;
        let self = this;
        thisModal = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        console.log("Current", currentTrack, currentCurve, currentShading);
        if (currentShading) {
            this.props = currentShading.getProperties();
        }
        if (currentCurve) {
            let fill = {
                color: "black",
                pattern: {
                    name: "none",
                    foreground: "",
                    background: "",
                },
                gradient: {
                    startX: 0,
                    endX: null,
                    startColor: "",
                    endColor: ""
                }
            }
            this.props = {
                idTrack: currentTrack.id,
                name: currentCurve.name,
                isNegPosFill: false,
                //isNegPosFilling: false,
                negativeFill: null,
                positiveFill: fill.pattern,
                idLeftLine: null,
                idRightLine: null,
                leftFixedValue: null,
                rightFixedValue: null,
                idControlCurve: currentCurve.id,
                type: "left"
            }
        }
        this.selectPatterns = ['basement', 'chert', 'dolomite', 'limestone'];
        this.foreground = function(){
            DialogUtils.colorPickerDialog(ModalService, self.props.positiveFill.foreground, function (colorStr) {
                self.props.positiveFill.foreground = colorStr;
            });
        }
        this.background = function(){
            DialogUtils.colorPickerDialog(ModalService, self.props.positiveFill.background, function (colorStr) {
                self.props.positiveFill.background = colorStr;
            });
        }
        this.positiveColor = function(){
            DialogUtils.colorPickerDialog(ModalService, self.props.general.color, function (colorStr) {
                self.props.general.color = colorStr;
            });
        }
        this.negativeColor = function(){
            DialogUtils.colorPickerDialog(ModalService, self.props.general.color, function (colorStr) {
                self.props.general.color = colorStr;
            });
        }
        this.enableFill = function (idEnable, value) {
            $('#'+ idEnable + " :input").prop("disabled", !value);
        }
        this.onOkButtonClicked = function () {
            console.log(self);
            close(self);
        }
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "shading-properties/shading-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        thisModal.enableFill("positiveNegative", false);
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
*/
exports.crossplotFormatDialog = function (ModalService, wiCrossplotCtrl, viCrossplot, callback){
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');

        this.datasetsInWell = new Array();
        this.curvesInWell = new Array();
        this.curvesOnDataset = new Array(); //curvesInWell + dataset.curve
        console.log("viCrossplot", viCrossplot);
        console.log("Crossplot", wiCrossplotCtrl);
        this.cross = viCrossplot.getProperties();
        console.log("Cross", this.cross);
        this.well = utils.findWellByCrossplot(wiCrossplotCtrl.id);
        this.well.children.forEach(function (child) {
            if (child.type == 'dataset') self.datasetsInWell.push(child);
        });
        this.datasetsInWell.forEach(function (child) {
            child.children.forEach(function (item) {
                if (item.type == 'curve') self.curvesInWell.push(item);
            })
        });
        this.curvesInWell.forEach(function (item, index) {
            let curvesOnDatasetItem = item;
            curvesOnDatasetItem.datasetCurve = utils.findDatasetById(item.properties.idDataset).properties.name + '.' + item.properties.name;
            self.curvesOnDataset.push(curvesOnDatasetItem);
        });
        console.log("curve", this.curvesOnDataset);
        let props = viCrossplot.getProperties();
        this.pointSet = props.pointSet;
        this.pointSet.idCurveX = props.pointSet.curveX.idCurve;
        this.pointSet.idCurveY = props.pointSet.curveY.idCurve;
        console.log("pointSet", this.pointSet);
        this.compare = false;
        this.selectPointSymbol = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"];

        // modal button
        this.colorCurve = function () {
            DialogUtils.colorPickerDialog(ModalService, self.props.pointSet.pointColor, function (colorStr) {
                self.props.pointSet.pointColor = colorStr;
            });
        };
        this.colorCrossplot = function () {
            DialogUtils.colorPickerDialog(ModalService, self.props.general.color, function (colorStr) {
                self.props.general.color = colorStr;
            });
        }
        this.removeRow = function () {
            console.log("removeRowClicked");
        };
        this.addRow = function () {
            console.log("addRowClicked");
        };

        function updateScalesTab() {
            let crossplotObj = {};
            let scalesObj = angular.copy(self.props.scales);
            let pointsets = angular.copy(self.props.scales);
            wiApiService.dataCurve(scalesObj.idCurveX, function (xCurveData) {
                wiApiService.dataCurve(scalesObj.idCurveY, function (yCurveData) {
                    if (scalesObj.idCurveZ) {
                        wiApiService.dataCurve(scalesObj.idCurveZ, function (zCurveData) {
                            scalesObj.curveZ = graph.buildCurve({ idCurve: scalesObj.idCurveZ }, zCurveData);
                        })
                    }
                    scalesObj.curveX = graph.buildCurve({ idCurve: scalesObj.idCurveX }, xCurveData);
                    scalesObj.curveY = graph.buildCurve({ idCurve: scalesObj.idCurveY }, yCurveData);
                    scalesObj.idCrossPlot = wiCrossplotCtrl.id;

                    pointsets.curveX = undefined;
                    pointsets.curveY = undefined;
                    pointsets.idCrossPlot = wiCrossplotCtrl.id;
                    console.log(scalesObj);
                    viCrossplot.setProperties(scalesObj);

                    /*wiApiService.editPointSet(pointsets, function(res){
                        console.log("OK:", res);
                        viCrossplot.setProperties(scalesObj);
                    });*/
                });
            });

        };

        this.onOkButtonClicked = function () {
            close(self);
        };
        this.onApplyButtonClicked = function () {
            console.log("onApplyButtonClicked");
            updateScalesTab();
        };
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "crossplot-format/crossplot-format-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
            callback(ret);
        });
    });
};
exports.imagePropertiesDialog = function (ModalService, wiD3Ctrl, config, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.imageFile = null;
        this.src = config.src || '';
        this.top = config.top;
        this.bottom = config.bottom;
        this.left = config.left;
        this.width = config.width;

        this.onUploadButtonClicked = function () {
            wiApiService.uploadImage({
                file: self.imageFile
            }, function (imageUrl) {
                $scope.$apply(function () {
                    self.src = imageUrl;
                    self.onImageUrlChange();
                });
            })
        }

        // current track dimensions
        let currentTrack = wiD3Ctrl.getCurrentTrack();
        let trackHeight = $(`wi-d3[name=${wiD3Ctrl.name}] .vi-track-container[data-order-num=${currentTrack.orderNum}] .vi-track-plot-container`).height();
        let trackWidth = $(`wi-d3[name=${wiD3Ctrl.name}] .vi-track-container[data-order-num=${currentTrack.orderNum}] .vi-track-plot-container`).width();

        let [trackTop, trackBottom] = wiD3Ctrl.getDepthRangeFromSlidingBar(); // top & bottom track in meter
        let mPerPx = (trackBottom - trackTop) / trackHeight;
        this.onImageUrlChange = utils.debounce(function () {
            let img = new Image();
            img.onload = function () {
                let imageWidth = this.width;
                let imageHeight = this.height;
                $scope.$apply(function () {
                    self.left = 50;
                    self.width = 50;
                    let imageScaleRatio = trackWidth / imageWidth;
                    let imageScaleHeight = imageHeight * imageScaleRatio * (self.width / 100); // image height in pixel
                    console.log(mPerPx, imageScaleRatio, imageScaleHeight);
                    self.bottom = (mPerPx * imageScaleHeight) + self.top;
                });
            };
            img.src = self.src;
        }, 500)

        function getConfig() {
            return {
                src: self.src,
                top: self.top,
                bottom: self.bottom,
                left: self.left,
                width: self.width
            }
        }
        this.onApplyButtonClicked = function () {
            callback(getConfig());
        }
        this.onOkButtonClicked = function () {
            close(getConfig(), 200);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "image-properties/image-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
            callback(ret);
        });
    });
}
exports.polygonManagerDialog = function (ModalService, wiD3Crossplot, callback){
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        let change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4,
        }
        $scope.change = change;
        function init() {
            self.polygons = new Array();        
            angular.copy(wiD3Crossplot.getPolygons()).forEach(function (polygonItem, index) {
                polygonItem.points = JSON.stringify(polygonItem.points);
                polygonItem.change = change.unchanged;
                polygonItem.index = index;
                self.polygons.push(polygonItem);
            });
        }
        init();
        this.getPolygons = function () {
            return self.polygons.filter(function (item, index) {
               return (item.change != change.deleted && item.change != change.uncreated);
           });
        }
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getPolygons()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.polygons[index].change == change.unchanged) self.polygons[index].change = change.updated;
        }
        // modal buttons
        this.removeRow = function () {
            if (!self.polygons[self.__idx]) return;
            if(self.polygons[self.__idx].change == change.created) {
                self.polygons[self.__idx].change = change.uncreated;
            } else {
                self.polygons[self.__idx].change = change.deleted;
            }
            if (self.getPolygons().length) {
                self.setClickedRow(0);
            }
        };
        this.addRow = function () {
            // self.polygonsCreated.push({index: self.polygonsCreated.length});
            self.polygons.push({
                change: change.created,
                index: self.polygons.length,
                display: true
            });
        };
        this.drawPolygon = function (index) {
            $('#polygon-modal').modal('hide');
            wiD3Crossplot.drawPolygon(self.polygons[index].idPolygon, function (drawingPolygon) {
                $('#polygon-modal').modal('show');
                if (self.polygons[index].change == change.unchanged) {
                    self.polygons[index].change = change.updated;
                }
                self.polygons[index].lineStyle = drawingPolygon.lineStyle;
                self.polygons[index].points = JSON.stringify(drawingPolygon.points);
            });
        }
        this.polygonLineColor = function (index) {
            dialogUtils.colorPickerDialog(ModalService, self.polygons[index].lineStyle, function (colorStr) {
                self.polygons[index].lineStyle = colorStr;
            });
        }
        function sendPolygonsAPIs() {
            const idCrossPlot = wiD3Crossplot.wiCrossplotCtrl.id;
            const unchangedPolygons = self.polygons.filter(polygon => polygon.change == change.unchanged).map(unchangedPolygon => {
                unchangedPolygon.points = JSON.parse(unchangedPolygon.points);
                return unchangedPolygon;
            });
            const createdPolygons = self.polygons.filter((polygon) => polygon.change == change.created).map(createdPolygon => {
                createdPolygon.points = JSON.parse(createdPolygon.points);
                createdPolygon.idCrossPlot = idCrossPlot;
                createdPolygon.change = change.unchanged;
                wiApiService.createPolygon(createdPolygon);
                return createdPolygon;
            });
            const updatedPolygons = self.polygons.filter((polygon) => polygon.change == change.updated).map(updatedPolygon => {
                updatedPolygon.points = JSON.parse(updatedPolygon.points);
                updatedPolygon.idCrossPlot = idCrossPlot;
                updatedPolygon.change = change.unchanged;
                wiApiService.editPolygon(updatedPolygon);
                return updatedPolygon;
            });
            self.polygons.filter((polygon) => polygon.change == change.deleted).map(deletedPolygon => {
                deletedPolygon.idCrossPlot = idCrossPlot;
                deletedPolygon.change = change.deleted;
                wiApiService.removePolygon(deletedPolygon.idPolygon);
            });
            wiD3Crossplot.initPolygons(unchangedPolygons.concat(createdPolygons, updatedPolygons));
            init();
        }
        this.onOkButtonClicked = function () {
            sendPolygonsAPIs();
            close(null);
        };
        this.onApplyButtonClicked = function() {
            sendPolygonsAPIs();
        };
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "polygon-manager/polygon-manager-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('.modal').remove();
            $('body').removeClass('modal-open');
            if (ret && callback) callback(ret);
        });
    });
};

exports.newBlankHistogramDialog = function(ModalService, callback){
    function ModalController($scope, close, $timeout, wiComponentService, wiApiService) {
        let self = this;
        self.name = "BlankHistogram";
        self.error = null;
        self.disabled = false;

        this.onOkButtonClicked = function () {
            close(self.name);
        }

        this.onCancelButtonClicked = function () {
            close(null);
        }

    }

    ModalService.showModal({
        templateUrl: "blank-histogram/blank-histogram-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (newPlot) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (callback) callback(newPlot);
        });
    });
}

exports.histogramFormatDialog = function (ModalService, wiHistogramCtrl, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let self = this;
        var utils = wiComponentService.getComponent(wiComponentService.UTILS);
        var histogramModel = utils.getModel('histogram', wiHistogramCtrl.id);
        this.histogramProps = angular.copy(histogramModel.properties);
        console.log(this.histogramProps);
        this.depthType = histogramModel.properties.idZoneSet != null ? "zonalDepth" : "intervalDepth";

        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.selectedZoneSet = null;
        this.SelectedActiveZone = self.histogramProps.activeZone != null ? self.histogramProps.activeZone : "All";
        this.zoneSetList = [];
        this.well = utils.findWellByHistogram(wiHistogramCtrl.id);
        this.datasets = [];
        this.curvesArr = [];
        this.SelectedCurve = {};

        this.well.children.forEach(function (child) {
            if (child.type == 'dataset') self.datasets.push(child);
        });
        this.datasets.forEach(function (child) {
            child.children.forEach(function (item) {
                if (item.type == 'curve') {
                    var d = item;
                    d.datasetCurve = child.properties.name + "." + item.properties.name;
                    self.curvesArr.push(d);
                    if (d.id == self.histogramProps.idCurve) {
                        self.SelectedCurve = d;
                    }
                }
            })
        });

        wiApiService.listZoneSet(this.histogramProps.idWell, function (ZoneSets) {
            self.zoneSetList = ZoneSets;
            if (self.zoneSetList.length > 0 && !self.histogramProps.idZoneSet) {
                self.selectedZoneSet = self.zoneSetList[0];
                self.histogramProps.idZoneSet = self.selectedZoneSet.idZoneSet;
            }

            self.zoneSetList.forEach(function (z, i) {
                z.id = i;
                wiApiService.getZoneSet(z.idZoneSet, function (ret) {
                    z.zones = ret.zones;
                    if (z.idZoneSet == self.histogramProps.idZoneSet) {
                        $timeout(function() {
                            self.selectedZoneSet = z;
                            self.histogramProps.idZoneSet = self.selectedZoneSet.idZoneSet;
                        },0);
                    }
                })
            })
        })

        this.onZoneSetChange = function () {
            if (self.selectedZoneSet) {
                self.histogramProps.idZoneSet = self.selectedZoneSet.idZoneSet;
            }
        }

        this.onActiveZoneChange = function () {
            if (self.SelectedActiveZone) {
                self.histogramProps.activeZone = self.SelectedActiveZone;
            }
        }

        this.onSelectCurveChange = function () {
            self.histogramProps.idCurve = self.SelectedCurve.id;
            self.histogramProps.leftScale = self.SelectedCurve.properties.minScale;
            self.histogramProps.rightScale = self.SelectedCurve.properties.maxScale;
        }

        function getTopFromWell() {
            return parseFloat(self.well.properties.topDepth);
        }
        function getBottomFromWell() {
            return parseFloat(self.well.properties.bottomDepth);
        }
        this.onDepthTypeChanged = function () {
            switch (self.depthType) {
                case "intervalDepth":
                    self.histogramProps.intervalDepthTop = self.histogramProps.intervalDepthTop ? self.histogramProps.intervalDepthTop: getTopFromWell();
                    self.histogramProps.intervalDepthBottom = self.histogramProps.intervalDepthBottom ? self.histogramProps.intervalDepthBottom : getBottomFromWell();
                    self.histogramProps.idZoneSet = null;
                    break;
                case "zonalDepth":
                    // DO NOTHING
                    break;
            }
        }
        this.chooseChartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.histogramProps.color, function (colorStr) {
                self.histogramProps.color = colorStr;
            });
        }
        this.onCloseButtonClicked = function () {
            console.log("on OK clicked");
            histogramModel.properties = self.histogramProps;
            close(histogramModel.properties);
        }
        this.onCancelButtonClicked = function () {
            close(null);
            
        }
    }
    ModalService.showModal({
        templateUrl: "histogram-format/histogram-format-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
            callback(ret);
        })
    });
};

exports.histogramFrequencyInfoDialog = function (ModalService, callback) {
    function ModalController($scope, close) {
        var self = this;

        this.onCancelButtonClicked = function () {
            console.log("on cancel clicked");
            close(null);
        }
        this.onCloseButtonClicked = function () {
            console.log("on Close clicked");
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "histogram-frequency-info/histogram-frequency-info-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    })
}
exports.markerPropertiesDialog = function (ModalService, markerProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = markerProperties || {};
        console.log(props);
        this.name = props.name;
        this.nameHAlign = props.nameHAlign.toLowerCase();
        this.nameVAlign = props.nameVAlign.toLowerCase();
        this.precision = props.precision;
        this.onPrecisionChange = function () {
            self.pow = Math.pow(10, self.precision);
            this.depth = Math.round(props.depth * this.pow) / this.pow;
        }
        this.onPrecisionChange();
        this.depthHAlign = props.depthHAlign.toLowerCase();
        this.depthVAlign = props.depthVAlign.toLowerCase();
        this.showSymbol = props.showSymbol;
        this.symbolSize = props.symbolSize;
        this.symbolType = props.symbolName.toLowerCase(); // TODO: refactor
        this.styles = {
            lineStyle: {
                lineWidth: props.lineWidth,
                lineDash: props.lineDash,
                lineColor: props.lineColor
            },
            symbolStyle: {
                symbolStrokeStyle: props.symbolStrokeStyle,
                symbolFillStyle: props.symbolFillStyle,
                symbolLineWidth: props.symbolLineWidth,
                symbolLineDash: props.symbolLineDash,
            }
        }

        this.onLineStyleButtonClicked = function () {
            dialogUtils.lineStyleDialog(ModalService, wiComponentService, function (styles) {
                self.styles = styles || self.styles;
            }, self.styles);
        }
        this.onSymbolStyleButtonClicked = function () {
            dialogUtils.symbolStyleDialog(ModalService, wiComponentService, function (styles) {
                self.styles = styles || self.styles;
            }, self.styles);
        }

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
            props.name = self.name;
            props.nameHAlign = self.nameHAlign;
            props.nameVAlign = self.nameVAlign;
            props.depth = self.depth;
            props.precision = self.precision;
            props.depthHAlign = self.depthHAlign;
            props.depthVAlign = self.depthVAlign;
            props.lineWidth = self.styles.lineStyle.lineWidth;
            props.lineDash = self.styles.lineStyle.lineDash;
            props.lineColor = self.styles.lineStyle.lineColor;
            props.showSymbol = self.showSymbol;
            props.symbolSize = self.symbolSize;
            props.symbolName = self.symbolType; // TODO: refactor
            props.symbolStrokeStyle = self.styles.symbolStyle.symbolStrokeStyle;
            props.symbolFillStyle = self.styles.symbolStyle.symbolFillStyle;
            props.symbolLineWidth = self.styles.symbolStyle.symbolLineWidth;
            props.symbolLineDash = self.styles.symbolStyle.symbolLineDash;
        }
    }
    ModalService.showModal({
        templateUrl: "marker-properties/marker-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
}

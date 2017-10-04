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
                    username: self.usernameReg,
                    password: self.passwordReg
            }
            wiApiService.register(dataRequest, function (token) {
                let userInfo = {
                    username: self.usernameReg,
                    password: self.passwordReg,
                    token: token
                }
                wiApiService.setAuthenticationInfo(userInfo);
                close(userInfo);
            });
        }
        this.onLoginButtonClicked = function () {
            self.error = null;
            let dataRequest = {
                username: self.username,
                password: self.password
            }
            wiApiService.login(dataRequest, function(token) {
                let userInfo = {
                    username: self.username,
                    password: self.password,
                    token: token,
                    remember: self.remember
                };
                wiApiService.setAuthenticationInfo(userInfo);
                close(userInfo);
            });

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
    function ModalController($scope, close, wiApiService, $timeout) {
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


            wiApiService.createProject(data, function (response) {
                    console.log('response', response);
                    
                    close(response, 500);
                    /*$timeout(function(){
                        $scope.$apply();
                    })*/
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
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        this.error = null;
        this.projects = [];
        this.idProject = null;
        this.disabled = false;
        this.selectedProject = {};

        wiApiService.getProjectList(null, function (projects) {
                self.projects = projects;
                /*$timeout(function(){
                    $scope.$apply();
                });*/
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

            wiApiService.getProject(data, function (response) {
                    close(response, 500);
                    $timeout(function(){
                        $scope.$apply();
                    });
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

exports.promptDialog = function (ModalService, promptConfig, callback) {
    function ModalController($scope, close) {
        const self = this;
        this.title = promptConfig.title;
        this.inputName = promptConfig.inputName;
        this.input = promptConfig.input;
        this.type = promptConfig.type;
        this.options = promptConfig.options;
        this.onBlur = function(args) {
            console.log('onBlur', args);
        }
        this.onOkButtonClicked = function () {
            close(self.input);            
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "prompt/prompt-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal('show');
        $(modal.element[0].children[0]).draggable();
        window.TESTMODAL = modal.element;
        setTimeout(function() {
            $(modal.element[0]).find('input').focus();
        }, 500);
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
    function ModalController($scope, close, wiApiService, wiComponentService, $timeout) {
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

            wiApiService.createWell(data, function (response) {
                    console.log('response', response);
                    close(response, 500);

                    $timeout(function(){
                        $scope.$apply();
                    });
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
        this.onBlur = function(args) {
            console.log('onBlur', args);
        }
        this.onOkButtonClicked = function () {
            close(self.name);
        }
        this.onCancelButtonClicked = function () {
            close();
        }
    }

    ModalService.showModal({
        templateUrl: "blank-logplot/blank-logplot-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        setTimeout(function() {
            $(modal.element[0]).find('input').focus();
        }, 500);
        modal.close.then(function (newPlot) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');

            if (callback && newPlot) callback(newPlot);
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
        this.onCancelButtonClicked = function () {
            close();
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
            [0, 10],
            [10, 0],
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
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        console.log(options);
        this.options = options;
        console.log(this.options);
        this.options.symbolStyle.symbolName = utils.upperCaseFirstLetter(this.options.symbolStyle.symbolName);
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        this.styles = [
            [10, 0],
            [0, 10],
            [2, 2],
            [8, 2],
            [10, 4, 2, 4],
            [10, 4, 2, 4, 2, 4]
        ];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.symbolType = ["Circle", "Cross", "Diamond", "Dot", "Plus", "Square", "Star", "Triangle"];  

        this.lineColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.symbolStyle.symbolStrokeStyle, function (colorStr) {
                self.options.symbolStyle.symbolStrokeStyle = colorStr;
            });
        };
        this.fillColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.options.symbolStyle.symbolFillStyle, function (colorStr) {
                self.options.symbolStyle.symbolFillStyle = colorStr;
                self.options.symbolStyle.symbolStrokeStyle = colorStr;
            });
        };
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

exports.lineSymbolAttributeDialog = function (ModalService, wiComponentService, lineOptions, symbolOptions, callback) {
    function ModalController($scope, close) {
        var self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        console.log("options", lineOptions, symbolOptions);

        this.lineOptions = lineOptions;
        this.symbolOptions = symbolOptions;
        console.log("options", this)
        this.lineStyles = [
            [0, 1],
            [8, 2, 2, 2, 2, 2],
            [8, 2, 2, 2],
            [2, 2],
            [8, 2],
            [1, 0]
        ];

        this.symbolOptions.symbolStyle.symbolName = utils.upperCaseFirstLetter(this.symbolOptions.symbolStyle.symbolName);
        
        this.lineWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.symbolPatterns = ['basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'sandstone', 'shale', 'siltstone'];
        this.symbolType = ["Circle", "Cross", "Diamond", "Dot", "Plus", "Square", "Star", "Triangle"];
        this.symbolWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.lineColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.lineOptions.lineStyle.lineColor, function (colorStr) {
                self.lineOptions.lineStyle.lineColor = colorStr;
            });
        };
        this.fillColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.symbolOptions.symbolStyle.symbolFillStyle, function (colorStr) {
                self.symbolOptions.symbolStyle.symbolFillStyle = colorStr;
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
            self.symbolOptions.symbolStyle.symbolName = self.symbolOptions.symbolStyle.symbolName.toLowerCase();
            self.symbolOptions.symbolStyle.symbolStrokeStyle = self.symbolOptions.symbolStyle.symbolFillStyle; 
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

    function ModalController($scope, close, $timeout) {
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
                    lineColor: "transparent",
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
                    symbolStrokeStyle: "blue",
                    symbolFillStyle: "blue",
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
            displayAs: ["Normal", "Cumulative", "Mirror", "Pid"]
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
                        context.strokeStyle = style.symbolStyle.symbolFillStyle;
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
        this.setValueScale = function() {
            if(!self.curveOptions.autoValueScale) return;
            else {
                let curveInTree = utils.getCurveFromId(currentCurve.idCurve);
                console.log('curveInTree', curveInTree);
                wiApiService.scaleCurve(curveInTree.id, function (scaleObj) {
                    $timeout(function () {
                        if (curveInTree.properties.idFamily == null) {
                            self.curveOptions.minValue = scaleObj.minScale;
                            self.curveOptions.maxValue = scaleObj.maxScale;
                        } else {
                            self.curveOptions.minValue = curveInTree.properties.minScale;
                            self.curveOptions.maxValue = curveInTree.properties.maxScale;
                        }
                    })
                });
            }
        }
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
            DialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService, self.lineOptions, self.symbolOptions, function (lineOptions, symbolOptions) {
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

exports.importLASDialog = function (ModalService) {
    function ModalController($scope, close, wiComponentService, wiApiService) {
        let self = this;
        this.error = null;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        const utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.lasFile = null;
        this.selectedWell = null;
        this.selectedDataset = null;
        this.isDisabled = false;
        this.wellName = null;
        this.datasetName = null;

        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);

        this.onWellNameChange = function () {
            self.error = null;
            if (self.wellName != null) {
                self.projectLoaded.wells.forEach(function (well) {
                    if (well.name.toLowerCase() == self.wellName.toLowerCase()) {
                        self.error = 'Well name already existed!';
                    }
                });
            }
        }
        this.onDatasetNameChange = function() {
            self.error = null;
            if (self.datasetName != null) {
                self.selectedWell.datasets.forEach(function (dataset) {
                    if (dataset.name.toLowerCase() == self.datasetName.toLowerCase()) {
                        self.error = 'Dataset name already existed';
                    }
                })
            }
        }
        this.onLoadButtonClicked = function () {
            if (self.error) return;

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
            if (self.wellName) {
                payloadParams.well_name = self.wellName;
            }
            if (self.datasetName) {
                payloadParams.dataset_name = self.datasetName;
            }
            payloadParams.file = self.lasFile;

            if(self.selectedDataset){
                DialogUtils.confirmDialog(ModalService, "WARNING!", "Importing data to dataset existed! Do you want to continue?", function(yes){
                    if(!yes){
                        self.isDisabled = false;
                    } else {
                        wiApiService.postWithFile('/file', payloadParams)
                        .then(function (well) {
                            console.log('well response', well);
                            if (well) {
                                utils.refreshProjectState()
                                    .then(function () {
                                        close(well, 500);
                                    })
                                    .catch(function () {
                                        self.isDisabled = false;
                                        utils.error(err);
                                    });
                            }
                        })
                        .catch(function (err) {
                            console.log('err', err);
                            self.isDisabled = false;
                            utils.error(err);
                        })
                    }
                });
            } else {
                if(self.selectedWell){
                    DialogUtils.confirmDialog(ModalService, "WARNING!", "Importing data to well existed! Do you want to continue?", function(yes){
                        if(!yes){
                            self.isDisabled = false;
                        } else {
                            wiApiService.postWithFile('/file', payloadParams)
                            .then(function (well) {
                                console.log('well response', well);
                                if (well) {
                                    utils.refreshProjectState()
                                        .then(function () {
                                            close(well, 500);
                                        })
                                        .catch(function () {
                                            self.isDisabled = false;
                                            utils.error(err);
                                        });
                                }
                            })
                            .catch(function (err) {
                                console.log('err', err);
                                self.isDisabled = false;
                                utils.error(err);
                            })
                        }
                    });
                } else {
                    wiApiService.postWithFile('/file', payloadParams)
                    .then(function (well) {
                        console.log('well response', well);
                        if (well) {
                            utils.refreshProjectState()
                                .then(function () {
                                    close(well, 500);
                                })
                                .catch(function () {
                                    self.isDisabled = false;
                                    utils.error(err);
                                });
                        }
                    })
                    .catch(function (err) {
                        console.log('err', err);
                        self.isDisabled = false;
                        utils.error(err);
                    })
                }
            }
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
            if (data) console.log("imported", data);
        });
    });
};

exports.importMultiLASDialog = function (ModalService, callback) {
    function ModalController($scope, close, Upload, wiComponentService, wiApiService) {
        let self = this;
        this.lasInfos = null;
        this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        this.wells = this.projectLoaded.wells
        this.isDisabled = true;
        this.lasFiles = null;
        this.selectedWells = [];
        this.selectedDatasets = [];
        this.selectedCurves = [];
        this.transactionId = Date.now();
        window.iml = this;
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
                families: self.selectedFamilies,
                isLoadAllCurves : self.settings.isLoadAllCurves,
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
                    lasInfo.curves.forEach(function (curve) {
                        curve.isLoad = true;
                    });
                });
                self.isDisabled = false;
                self.lasInfos.sort(function (a,b){
                    let originalnameA = a.originalname.toUpperCase();
                    let originalnameB = b.originalname.toUpperCase();
                    return (originalnameA == originalnameB ? 0 : originalnameA > originalnameB ? 1 : -1);
                });
                self.lasFiles.sort(function (a,b){
                    let nameA = a.name.toUpperCase();
                    let nameB = b.name.toUpperCase();
                    return (nameA == nameB ? 0 : nameA > nameB ? 1 : -1);
                });
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
        this.updateLasFiles = function () {
            // self.lasInfos.forEach(function(lasInfo, i){
            //     self.lasFiles[i].isLoad = lasInfo.isLoad;
            // });
        }
        this.updateWells = function () {
            self.selectedWells = [];
            self.lasInfos.forEach(function (lasInfo) {
                let well = self.wells.find(well => well.name == lasInfo.selectedWellName) || lasInfo.selectedWellName;
                if(well){
                    self.selectedWells.push(well);
                } else {
                    self.selectedWells.push("");
                }
                lasInfo.selectedWell = well ? well : {datasets: []};
                console.log(lasInfo.selectedWell);
            });
        }
        this.updateDatasets = function () {
            self.selectedDatasets = [];
            self.lasInfos.forEach(function (lasInfo) {
                let dataset = lasInfo.selectedDatasetName;
                if(dataset){
                    self.selectedDatasets.push(dataset);
                } else {
                    self.selectedDatasets.push("");
                }
            });
        }
        this.onLoadButtonClicked = function () {
            let selectedWellNames = [];
            let selectedDatasetNames = [];
            let selectedCurves = [];
            let wellHeaders = [];
            let isLoadFile = [];
            //console.log(self.selectedWells);
            self.selectedWells.forEach(function (well) {
                selectedWellNames.push(well.idWell ? well.name : well);
            })
            self.selectedDatasets.forEach(function (dataset) {    
                selectedDatasetNames.push(dataset.idDataset ? dataset.name : dataset);
            })
            self.lasInfos.forEach(function (each, i) {
                isLoadFile.push(each.isLoad);
                wellHeaders.push(each.wellInfo);
                let curveIsLoaded = {
                    data : [],
                    length : 0
                }
                each.curves.forEach(function (c,i) {
                    if (c.isLoad) {
                        curveIsLoaded.data.push(c.name);
                        curveIsLoaded.length ++;
                    }

                });
                selectedCurves.push(curveIsLoaded);
                curveIsLoaded = {
                    data : [],
                    length : 0
                };

            });
            let payloadParams = {
                id_project: self.projectLoaded.idProject,
                settings: self.settings,
                families: self.selectedFamilies,
                file: self.lasFiles,
                id_wells: selectedWellNames,
                id_datasets: selectedDatasetNames,
                curves : selectedCurves,
                wellHeaders: wellHeaders,
                isLoad : isLoadFile
            };
            console.log('payloadParams', payloadParams);
            wiApiService.uploadMultiFiles(payloadParams)
                .then(function (wells) {
                    console.log('wells response', wells);
                    utils.refreshProjectState();
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
        templateUrl: 'import-multi-LAS/import-multi-LAS-modal.html',
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
// exports.importMultiLASDialog = function (ModalService, callback) {
    // function ModalController($scope, close, Upload, wiComponentService, wiApiService) {
        // let self = this;
        // this.lasInfos = null;
        // this.projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        // this.isDisabled = true;
        // this.lasFiles = null;
        // this.selectedWells = [];
        // this.selectedDatasets = [];
        // this.transactionId = Date.now();


        // this.settings = {
            // isOverwriteWellHeader: false,
            // isCreateNewWellIfDupe: false,
            // isCreateNewDatasetIfDupe: false,
            // isUseUwiAsWellName: false,
            // isLoadAllCurves: true
        // };
        // this.families = [
            // 'Gamma Ray',
            // 'Porosity',
            // 'Density',
            // 'Acoustic',
            // 'Resistivity',
            // 'Permeability',
            // 'Saturation',
            // 'Volume'
        // ];
        // this.selectedFamilies = {};
        // this.families.forEach(function (family) {
            // self.selectedFamilies[family] = true;
        // });
        // this.onUploadButtonClicked = function () {
            // let payloadParams = {
                // file: self.lasFiles,
                // transactionId: self.transactionId
            // };
            // console.log(payloadParams);
            // wiApiService.uploadMultiFilesPrepare(payloadParams, function (lasInfos) {
                // self.lasInfos = lasInfos;
                // self.curves = lasInfos[0].curves;
                // self.lasInfos.forEach(function (lasInfo) {
                    // lasInfo.isLoad = true;
                    // lasInfo.LASName = lasInfo.originalname;
                    // lasInfo.wellInfo.depthUnit = 'M';
                // });
                // self.isDisabled = false;
            // });
        // }
        // $scope.fileIndex = 0;
        // this.onLasClick = function ($index) {
            // $scope.fileIndex = $index;
            // self.curves = self.lasInfos[$index].curves;
        // }

        // this.onRemoveFileClick = function () {
            // self.lasInfos.splice($scope.fileIndex, 1);
            // if (!self.lasInfos.length) {
                // self.isDisabled = true;
            // }
        // }

        // this.onRemoveAllFilesClick = function () {
            // self.lasInfos = [];
            // self.curves = [];
            // self.isDisabled = true;
        // }

        // this.onLoadButtonClicked = function () {
            // let payloadParams = {
                // id_project: self.projectLoaded.idProject,
                // id_wells: [],
                // id_datasets: []
            // };
            // payloadParams.file = self.lasFiles;
            // console.log(self.selectedWell);
            // for (let i = 0; i < self.lasFiles.length; i++) {
                // if (self.selectedWells[i]) {
                    // payloadParams.id_wells[i] = self.selectedWell[i];
                // } else {
                    // payloadParams.id_wells[i] = "None";
                // }
                // if (self.selectedDatasets[i]) {
                    // payloadParams.id_datasets[i] = self.selectedDatasets[i];
                // } else {
                    // payloadParams.id_datasets[i] = "None";
                // }
            // }
            // console.log('payloadParams', payloadParams);
            // wiApiService.uploadMultiFiles(payloadParams)
                // .then(function (wells) {
                    // console.log('wells response', wells);
                    // return close(wells, 500);
                // })
                // .catch(function (err) {
                    // console.log('err', err);
                // });

        // };

        // this.onCancelButtonClicked = function () {
            // console.log("onCancelButtonClicked");
            // close(null, 100);
        // };
    // }

    // ModalService.showModal({
        // templateUrl: "import-multi-LAS/import-multi-LAS-modal.html",
        // controller: ModalController,
        // controllerAs: "wiModal"
    // }).then(function (modal) {
        // modal.element.modal();
        // modal.close.then(function (data) {
            // $('.modal-backdrop').remove();
            // $('body').removeClass('modal-open');
            // if (data) callback(data);
        // });
    // });
// };
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

        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
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
exports.shadingAttributeDialog = function(ModalService, wiApiService, callback, fillPatternOptions, variableShadingOptions, shadingOptions, selectCurve, curvesOnDataset, leftLimit){
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
        this.leftLimit = leftLimit;
        this.curvesOnDataset = curvesOnDataset;

        this.namePals = new Array();
        wiApiService.getPalettes(function(pals){
            self.paletteList = pals;
            self.paletteName = Object.keys(self.paletteList);
        });
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

        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];

        this.enableFill = function (idEnable, value) {
            $('#' + idEnable + ":button").attr("disabled", value);
        }
        //button
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
        //variableShadingOptions
        this.selectCurve = selectCurve;
        console.log("selectedCurve", this.selectCurve);
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

        this.displayType = this.shadingOptions.isNegPosFill;
        this.selectedControlCurve = function(idCurve){
            self.selectCurve.forEach(function(item, index) {
                if(item.id == idCurve) {
                    self.variableShadingOptions.positiveFill.varShading.startX = item.properties.minScale;
                    self.variableShadingOptions.positiveFill.varShading.endX = item.properties.maxScale;    
                    self.variableShadingOptions.negativeFill.varShading.startX = item.properties.minScale;
                    self.variableShadingOptions.negativeFill.varShading.endX = item.properties.maxScale;
                
                    self.variableShadingOptions.fill.varShading.startX = item.properties.minScale;
                    self.variableShadingOptions.fill.varShading.endX = item.properties.maxScale;    
                }
            })
        };
        this.selectedControlCurve(self.shadingOptions.idControlCurve);

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
            console.log("DISPLAYTYPE", self.displayType);
            self.shadingOptions.isNegPosFill = self.displayType;
            self.variableShadingOptions.fill.display = !self.displayType;
            self.variableShadingOptions.positiveFill.display = self.displayType;
            self.variableShadingOptions.negativeFill.display = self.displayType;
            console.log("fill", self.variableShadingOptions.fill.display, self.variableShadingOptions.positiveFill.display);
            if(self.displayType) {
                if(self.varShadingType == 'gradient') {
                    if(!self.variableShadingOptions.positiveFill.varShading.gradient) 
                        self.variableShadingOptions.positiveFill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
                    if(!self.variableShadingOptions.negativeFill.varShading.gradient) 
                        self.variableShadingOptions.negativeFill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
                }
            }else{
                if(self.varShadingType == 'gradient') {
                    if(!self.variableShadingOptions.fill.varShading.gradient) 
                        self.variableShadingOptions.fill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
                    
                }
            }
        }
        /*if(this.shadingOptions.idLeftLine) {
            this.shadingOptions.isNegPosFill = false;
            this.fillPatternOptions.fill.display = true;
            this.variableShadingOptions.fill.display = true;
        }*/
        wiApiService.getPalettes(function(paletteList){
            let paletteNameArr = Object.keys(paletteList);
            let paletteValArr = JSON.stringify(Object.values(paletteList));
            console.log("getPalettes");
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
                else if(self.variableShadingOptions.fill.varShading.customFills) self.varShadingType = "customFills";
            }
            if(self.variableShadingOptions.positiveFill && self.variableShadingOptions.positiveFill.display == true){
                if(self.variableShadingOptions.positiveFill.varShading.gradient) self.varShadingType = "gradient";
                else if (self.variableShadingOptions.positiveFill.varShading.palette) {
                    self.varShadingType = "palette";
                    if(Array.isArray(self.variableShadingOptions.positiveFill.varShading.palette)) 
                        self.variableShadingOptions.positiveFill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.positiveFill.varShading.palette);
                }
                else if(self.variableShadingOptions.positiveFill.varShading.customFills) self.varShadingType = "customFills";
            }
            if(self.variableShadingOptions.negativeFill && self.variableShadingOptions.negativeFill.display == true){
                if(self.variableShadingOptions.negativeFill.varShading.gradient) self.varShadingType = "gradient";
                else if (self.variableShadingOptions.negativeFill.varShading.palette) {
                    self.varShadingType = "palette";
                    if(Array.isArray(self.variableShadingOptions.negativeFill.varShading.palette)) 
                        self.variableShadingOptions.negativeFill.varShading.palette = getPaletteNameByValue(self.variableShadingOptions.negativeFill.varShading.palette);
                }
                else if(self.variableShadingOptions.negativeFill.varShading.customFills) self.varShadingType = "customFills";
            }
        })
        this.setGradientIfNull = function(){
            if(self.displayType) {
                self.variableShadingOptions.positiveFill.display = true;
                self.variableShadingOptions.negativeFill.display = true;
                self.variableShadingOptions.fill.display = false;
                self.shadingOptions.isNegPosFill = true;
                if(!self.variableShadingOptions.positiveFill.varShading.gradient) 
                    self.variableShadingOptions.positiveFill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
                if(!self.variableShadingOptions.negativeFill.varShading.gradient) 
                    self.variableShadingOptions.negativeFill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};

            }
            else {
                self.variableShadingOptions.positiveFill.display = false;
                self.variableShadingOptions.negativeFill.display = false;
                self.variableShadingOptions.fill.display = true;
                self.shadingOptions.isNegPosFill = false;
                if(!self.variableShadingOptions.fill.varShading.gradient) 
                    self.variableShadingOptions.fill.varShading.gradient = {startColor: "transparent", endColor: "transparent"};
            }
            
            
            
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
        this.setShadingName = function(leftPart, rightPart) {
            let left = null;
            let right = null;
            if(!leftPart) return;
            else {
                for (curve of self.curvesOnDataset) {
                    if (curve.id == parseInt(leftPart)) {
                        left = curve.name;
                        break;
                    }
                }
                if (rightPart == -1) right = 'left';
                else if (rightPart == -2) right = 'right';
                else if (rightPart == -3) {
                    right = self.shadingOptions.leftFixedValue;
                }
                else if(rightPart > 0) {
                    for (curve of self.curvesOnDataset) {
                        if (curve.id == parseInt(rightPart)) {
                            right = curve.name;
                            break;
                        }
                    }
                }
                self.shadingOptions.name = left + '-' + right;
            }
        }
        this.setLimit2 = function() {
            if(self.shadingOptions.idLeftLine == -1) {
                self.shadingOptions.leftFixedValue = findInVisCurveListByIdLine(self.shadingOptions.idRightLine).minX;
            }
            if(self.shadingOptions.idLeftLine == -2) {
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

        if(this.variableShadingOptions.fill.varShading.customFills){
            this.customFillsCurrent = this.variableShadingOptions.fill.varShading.customFills;
        };
        this.foregroundCustomFills = function(index){
            if(!self.variableShadingOptions.fill.varShading.customFills.content[index].foreground) self.variableShadingOptions.fill.varShading.customFills.content[index].pattern = 'basement';
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
            self.variableShadingOptions.fill.varShading.customFills = angular.copy(self.customFillsCurrent);
        };
        this.saveCustomFills = function() {
            self.customFillsCurrent = self.variableShadingOptions.fill.varShading.customFills
            if(!self.customFillsCurrent.name) {
                DialogUtils.errorMessageDialog(ModalService, "Add name CustomFills to save!");                
            }
            else {
                wiApiService.saveCustomFills(self.customFillsCurrent, function(customFills){
                    DialogUtils.confirmDialog(ModalService, "Save CustomFills", "CustomFills: " + customFills.name + " saved successfully!", function(){});
                });
            }
        };
        // TO CHANGE: set this.displayType = false
        this.setCustomFillsIfNull = function(){
            self.displayType = false;
            self.shadingOptions.isNegPosFill = false;
            self.variableShadingOptions.fill.display = true;

            if(!self.variableShadingOptions.fill.varShading.customFills) {
                self.variableShadingOptions.fill.varShading.customFills = {
                    name:null,
                    content: [
                        {
                            lowVal: null,
                            highVal: null,
                            pattern: "none",
                            // foreground: "transparent",
                            background: "blue",
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
                    self.variableShadingOptions.negativeFill.varShading.palette = null;
                    self.variableShadingOptions.fill.varShading.customFills = null;
                    self.variableShadingOptions.positiveFill.varShading.customFills = null;
                    self.variableShadingOptions.negativeFill.varShading.customFills = null;
                    break;
                case "palette":
                    self.variableShadingOptions.fill.varShading.gradient = null;
                    self.variableShadingOptions.positiveFill.varShading.gradient = null;
                    self.variableShadingOptions.negativeFill.varShading.gradient = null;
                    self.variableShadingOptions.fill.varShading.customFills = null;
                    self.variableShadingOptions.positiveFill.varShading.customFills = null;
                    self.variableShadingOptions.negativeFill.varShading.customFills = null;

                    self.variableShadingOptions.fill.varShading.palette = self.variableShadingOptions.fill.varShading.palName;
                    self.variableShadingOptions.positiveFill.varShading.palette = self.variableShadingOptions.positiveFill.varShading.palName;
                    self.variableShadingOptions.negativeFill.varShading.palette = self.variableShadingOptions.negativeFill.varShading.palName;
                    break;
                case "customFills":
                    self.variableShadingOptions.fill.varShading.palette = null;
                    self.variableShadingOptions.positiveFill.varShading.palette = null;
                    self.variableShadingOptions.negativeFill.varShading.palette = null;
                    self.variableShadingOptions.fill.varShading.palName = null;
                    self.variableShadingOptions.positiveFill.varShading.palName = null;
                    self.variableShadingOptions.negativeFill.varShading.palName = null;
                    self.variableShadingOptions.fill.varShading.gradient = null;
                    self.variableShadingOptions.positiveFill.varShading.gradient = null;
                    self.variableShadingOptions.negativeFill.varShading.gradient = null;
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
        window.dbg = this;
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
        this.curvesChanged = new Array(); // 1: change line, 2: add line, 3: delete line, 4: uncreate line
        this.curvesOnDataset = new Array(); // curveList + dataset.Curve
        this.shadingChanged = new Array();

        this.curvesArr = [];
        this.shadingArr = new Array();

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
            item.datasetCurve = selectedCurve;
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
            var shadingProps = shading.getProperties();
            var fillPatternItem = new Object();
            var variableShadingItem = new Object();
            var shadingChangedItem = new Object();

            console.log("shadingProps", shadingProps);
            shadingItem.idTrack = shadingProps.idTrack;
            shadingItem.idShading = shadingProps.idShading;
            shadingItem.idLeftLine = shadingProps.idLeftLine?shadingProps.idLeftLine:setIdLeftLineIfNull(shadingProps.type);
            shadingItem.leftFixedValue = shadingProps.leftFixedValue;
            shadingItem.idRightLine = shadingProps.idRightLine;
            // shadingItem.rightFixedValue = shadingProps.rightFixedValue;
            shadingItem.rightFixedValue = null;

            shadingItem.name = shadingProps.name;
            shadingItem.shadingStyle = getShadingStyle(shadingProps.isNegPosFill ? shading.positiveFill : shading.fill);
            shadingItem.idControlCurve = shadingProps.idControlCurve;
            shadingItem.isNegPosFill = shadingProps.isNegPosFill;
            shadingItem.type = shadingProps.type;
            shadingItem._index = index;

            var condition1 = (shadingItem.shadingStyle == "fillPattern" && !shadingItem.isNegPosFill);
            var condition2 = (shadingItem.shadingStyle == "fillPattern" && shadingItem.isNegPosFill);
            var condition3 = (shadingItem.shadingStyle == "variableShading" && !shadingItem.isNegPosFill);
            var condition4 = (shadingItem.shadingStyle == "variableShading" && shadingItem.isNegPosFill);

            var condition3gradient = condition3 && shadingProps.fill.varShading.gradient;
            var condition4gradient = condition4 && shadingProps.positiveFill.varShading.gradient;

            var condition3palette = condition3 && shadingProps.fill.varShading.palette;
            var condition4palette = condition4 && shadingProps.positiveFill.varShading.palette;

            var condition3customFills = condition3 && shadingProps.fill.varShading.customFills;
            var condition4customFills = condition4 && shadingProps.positiveFill.varShading.customFills;

            fillPatternItem.fill = {
                display: (shadingProps.fill && shadingProps.fill.display != null)?shadingProps.fill.display:condition1,
                pattern: {
                    name: (condition1 ? shadingProps.fill.pattern.name : "none"),
                    foreground: (condition1 ? shadingProps.fill.pattern.foreground : null),
                    background: (condition1 ? shadingProps.fill.pattern.background : null)
                }
            };
            fillPatternItem.positiveFill = {
                display: (shadingProps.positiveFill && shadingProps.positiveFill.display != null)?shadingProps.positiveFill.display:condition2,
                pattern: {
                    name: (condition2 ? shadingProps.positiveFill.pattern.name : "none"),
                    foreground: (condition2 ? shadingProps.positiveFill.pattern.foreground : null),
                    background: (condition2 ? shadingProps.positiveFill.pattern.background : null)
                }
            };

            fillPatternItem.negativeFill = {
                display: (shadingProps.negativeFill && shadingProps.negativeFill.display != null)?shadingProps.negativeFill.display:condition2,
                pattern: {
                    name: (condition2 ? shadingProps.negativeFill.pattern.name : "none"),
                    foreground: (condition2 ? shadingProps.negativeFill.pattern.foreground : null),
                    background: (condition2 ? shadingProps.negativeFill.pattern.background : null)
                }
            }

            fillPatternItem._index = index;
            variableShadingItem.idControlCurve = shadingProps.idControlCurve;

            variableShadingItem.fill = {
                display: (shadingProps.fill && shadingProps.fill.display != null)?shadingProps.fill.display:condition3,
                varShading: {
                    startX: condition3?shadingProps.fill.varShading.startX:null,
                    endX: condition3?shadingProps.fill.varShading.endX:null,
                    gradient: condition3gradient?{
                        startColor: condition3?shadingProps.fill.varShading.gradient.startColor:null,
                        endColor: condition3?shadingProps.fill.varShading.gradient.endColor:null
                    }:null,
                    palette: condition3palette?(condition3?shadingProps.fill.varShading.palette:null):null,
                    palName: condition3palette?(condition3?shadingProps.fill.varShading.palName:null):null,
                    customFills: condition3customFills?(condition3?shadingProps.fill.varShading.customFills:null):null
                }
            };
            variableShadingItem.positiveFill = {
                display: (shadingProps.positiveFill && shadingProps.positiveFill.display != null)?shadingProps.positiveFill.display:condition4,
                varShading: {
                    startX: condition4?shadingProps.positiveFill.varShading.startX:null,
                    endX: condition4?shadingProps.positiveFill.varShading.endX:null,
                    gradient: condition4gradient?{
                        startColor: condition4?shadingProps.positiveFill.varShading.gradient.startColor:null,
                        endColor: condition4?shadingProps.positiveFill.varShading.gradient.endColor:null
                    }:null,
                    palette: condition4palette?( condition4?shadingProps.positiveFill.varShading.palette:null):null,
                    palName: condition4palette?(condition4?shadingProps.positiveFill.varShading.palName:null):null,
                    customFills: condition4customFills?( condition4?shadingProps.positiveFill.varShading.customFills:null):null
                }
            };
            variableShadingItem.negativeFill = {
                display: (shadingProps.negativeFill && shadingProps.negativeFill.display != null)?shadingProps.negativeFill.display:condition4,
                varShading: {
                    startX: condition4?shadingProps.negativeFill.varShading.startX:null,
                    endX: condition4?shadingProps.negativeFill.varShading.endX:null,
                    gradient: condition4gradient?{
                        startColor: condition4?shadingProps.negativeFill.varShading.gradient.startColor:null,
                        endColor: condition4?shadingProps.negativeFill.varShading.gradient.endColor:null
                    }:null,
                    palette: condition4palette?( condition4?shadingProps.negativeFill.varShading.palette:null):null,
                    palName: condition4palette?(condition4?shadingProps.negativeFill.varShading.palName:null):null,
                    customFills: condition4customFills?( condition4?shadingProps.negativeFill.varShading.customFills:null):null
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
            console.log("variableShadingOptions", self.variableShadingOptions, self.shadingArr);
        });
        function setIdLeftLineIfNull(type) {
            var temp = null;
            if (type == 'left') temp = -1;
            if(type == 'right') temp = -2;
            if(type == 'custom') temp = -3;
            return temp;
        }
        this.curveList.forEach(function (curve, index) {
            let curveOptions = {};
            let lineOptions = {};
            let symbolOptions = {};
            curveOptions = utils.curveOptions(currentTrack, curve, index);

            self.curvesArr.forEach(function (item) {
                if (curve.idCurve == item.id) {
                    self.lineCurve.push(item);
                }
            })
            self.curvesChanged.push({
                _index: index,
                change: 0
            });
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
            
        });
        console.log("LINECURVE", this.lineCurve, this.curves, this.curvesLineOptions, this.curvesSymbolOptions);

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

        this.__idx = 0;
        this.setClickedRowCurve = function (index) {
            $scope.selectedRowCurve = index;
            self.__idx = self.getCurves()[index]._index;

        };
        this.removeRowCurve = function () {
            if (!self.curvesChanged[self.__idx]) return;
            if (self.curvesChanged[self.__idx].change == 2) {
                self.curvesChanged[self.__idx] = 4;
            } else {
                self.curvesChanged[self.__idx].change = 3;
            }
        }

        function removeCurve(idLine) {
            wiApiService.removeLine(idLine, function () {
                currentTrack.removeCurveById(idLine);
            });
        };

        this.setDisabledCurve = function(index) {
            let temp = true;
            if(self.curvesChanged[index].change == 2) temp = false;
            return temp; 
        }
        this.onSelectCurve = function () {
            if (self.curvesChanged[self.__idx].change == 2) {
                idCurveNew = self.lineCurve[self.__idx].id;
                console.log("idCurveNew", idCurveNew, self.__idx, self.curvesChanged, self.lineCurve[self.__idx]);
                wiApiService.infoCurve(idCurveNew, function (curveInfo) {
                    console.log("curveInfo", curveInfo);
                    let lineProps = curveInfo.LineProperty;
                    $timeout(function () {
                        self.curves[self.__idx] = {
                            _index: self.__idx,
                            alias: curveInfo.name,
                            autoValueScale: false,
                            blockPosition: lineProps.blockPosition,
                            displayAs: 'Normal',
                            displayMode: lineProps.displayMode,
                            displayType: lineProps.displayType,
                            idLine: null,
                            idTrack: currentTrack.id,
                            ignoreMissingValues: true,
                            maxValue: lineProps.maxScale,
                            minValue: lineProps.minScale,
                            showDataset: true,
                            showHeader: true,
                            wrapMode: 'None'
                        };
                        self.curvesLineOptions[self.__idx] = {
                            _index: self.__idx,
                            display: true,
                            lineStyle: {
                                lineColor: lineProps.lineColor,
                                lineStyle: eval(lineProps.lineStyle),
                                lineWidth: lineProps.lineWidth
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
                return self.curvesChanged[index].change < 3;
            });
        }
        this.onChangeCurve = function () {
            if (self.curvesChanged[self.__idx].change == 0) self.curvesChanged[self.__idx].change = 1;
            console.log(self.curvesChanged[self.__idx]);
        }
        this.addRowCurve = function () {
            self.curves.push({ _index: self.curves.length });
            console.log(self.curves);
            let item = {
                _index: self.curvesChanged.length,
                change: 2
            }
            self.curvesChanged.push(item);
            if(self.getCurves().length) {
                self.setClickedRowCurve(item._index);
            }
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
        this.removeRowShading = function () {
            if (!self.shadingChanged[self.__idx]) return;
            if (self.shadingChanged[self.__idx].change == 2) {
                self.shadingChanged[self.__idx] = 4;
            } else {
                self.shadingChanged[self.__idx].change = 3;
            }
        }
        this.setShadingName = function(leftPart, rightPart, idx) {
            let left = null;
            let right = null;
            if(!leftPart) return;
            else {
                for (curve of self.curvesOnDataset) {
                    if (curve.id == parseInt(leftPart)) {
                        left = curve.name;
                        break;
                    }
                }
                if (rightPart == -1) right = 'left';
                else if (rightPart == -2) right = 'right';
                else if (rightPart == -3) {
                    right = self.shadingArr[idx].leftFixedValue;
                }
                else if(rightPart > 0) {
                    for (curve of self.curvesOnDataset) {
                        if (curve.id == parseInt(rightPart)) {
                            right = curve.name;
                            break;
                        }
                    }
                }
                self.shadingArr[idx].name = left + '-' + right;
            }
        }

        this.addRowShading = function() {
            var shadingItem = {
                idTrack: currentTrack.id,
                name: 'xx_yy',
                shadingStyle: "fillPattern",
                isNegPosFill: false,
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
                        background: "blue"
                    }
                },
                positiveFill: {
                    display: condition2,
                    pattern: {
                        name: "none",
                        background: "blue"
                    }
                },
                negativeFill: {
                    display: condition2,
                    pattern: {
                        name: "none",
                        background: "blue"
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
                            startColor: "transparent",
                            endColor: "transparent"
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
                            startColor: "transparent",
                            endColor: "transparent"
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
                            startColor: "transparent",
                            endColor: "transparent"
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
                    if(shadingObj.idLeftLine == -3) {
                        shadingObj.type = 'custom';
                        shadingObj.idLeftLine = null;
                    };
                    if(shadingObj.idLeftLine == -2) {
                        shadingObj.type = 'right';
                        shadingObj.idLeftLine = null;
                    };
                    if(shadingObj.idLeftLine == -1) {
                        shadingObj.type = 'left';
                        shadingObj.idLeftLine = null;
                    };
                    if(shadingObj.idLeftLine > 0) {
                        shadingObj.type = 'pair';
                        shadingObj.leftFixedValue = null;
                        shadingObj.idLeftLine = parseInt(shadingObj.idLeftLine);
                    }
                    console.log(shadingObj);
                    console.log('visualize-+-shading', shadingList[index]);
                    wiApiService.editShading(shadingObj, function (result) {
                        console.log(result, shadingObj);
                        let shadingObjToSet = angular.copy(shadingObj);
                        wiApiService.getPalettes(function(paletteList){
                            wiApiService.dataCurve(shadingObj.idControlCurve, function (curveData) {
                                shadingObjToSet.leftCurve = findInVisCurveListByIdLine(shadingObj.idLeftLine);
                                shadingObjToSet.rightCurve = findInVisCurveListByIdLine(shadingObj.idRightLine);
                                shadingObjToSet.controlCurve = graph.buildCurve({ idCurve: shadingObj.idControlCurve }, curveData, self.well.properties);
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

            DialogUtils.shadingAttributeDialog(ModalService, wiApiService, function(fillPatternOptions, variableShadingOptions, shadingOptions, curvesOnDataset, leftLimit){
                console.log("shadingAttribute", fillPatternOptions, variableShadingOptions, shadingOptions);
                // console.log("shadingAttributeOri", self.fillPatternOptions[index], self.variableShadingOptions[index], self.shadingArr[index]);
                if(fillPatternOptions) self.fillPatternOptions[index] = fillPatternOptions;
                if(variableShadingOptions) self.variableShadingOptions[index] = variableShadingOptions;
                if(shadingOptions) self.shadingArr[index] = shadingOptions;

            }, self.fillPatternOptions[index], self.variableShadingOptions[index], self.shadingArr[index], self.curvesArr, self.curvesOnDataset, self.leftLimit);

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
                    if (item.change == 1) {
                        updateLine(index);
                        item.change = 0;
                    }
                    if (item.change == 3) {
                        removeCurve(self.curves[index].idLine);
                    }
                });
                // remove all deleted curve from self.curves and self.curvesChanged. IMPORTANT!
                for (let idx = self.curvesChanged.length - 1; idx > -1; idx--) {
                    if (self.curvesChanged[idx].change > 2) {
                        self.curvesChanged.splice(idx, 1);
                        self.curves.splice(idx, 1);
                        self.curvesSymbolOptions.splice(idx, 1);
                        self.curvesLineOptions.splice(idx, 1);
                        self.lineCurve.splice(idx, 1); 
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
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let wiLogplotModel = wiLogplotCtrl.getLogplotModel();
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = zoneTrackProperties || {
            showTitle: true,
            title: "New Zone",
            topJustification: "center",
            trackColor: '#ffffff',
            width: utils.inchToPixel(2),
            parameterSet: null
        }
        props.width = utils.pixelToInch(props.width);
        console.log(props);
        this.isShowTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.trackColor = props.trackColor;
        this.width = props.width;
        this.parameterSet = props.parameterSet;
        this.zoneSets = [];

        function refreshZoneSets() {
            wiApiService.listZoneSet(wiLogplotModel.properties.idWell, function (zoneSets) {
                $timeout(function(){
                    $scope.$apply(function () {
                        self.zoneSets = zoneSets;
                    });    
                });
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
        this.onOkButtonClicked = function () {
            self.error = null;
            if (!self.idZoneSet) {
                self.error = "Zone Set is required";
                return;
            }
            props = {
                showTitle: self.isShowTitle,
                title: self.title,
                topJustification: self.topJustification,
                trackColor: self.trackColor,
                width: self.width,
                parameterSet: self.parameterSet,
                idZoneSet: self.idZoneSet
            }
            if (self.error) return;
            close(props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
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

        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
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
            console.log(self.depthRange);
            wiD3Ctr.setDepthRange(self.depthRange);
            wiD3Ctr.adjustSlidingBarFromDepthRange(self.depthRange);
            close(self);
        }
        this.onCancelButtonClicked = function () {
            //wiD3Ctr.setDepthRange(self.depthRange);
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
        self.currentFocus = 1;
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
            self.CpCustoms[self.currentFocus-1].color = self.currentColor;
            self.currentFocus = (self.currentFocus + 1);
            if(self.currentFocus > 16) self.currentFocus = 1;
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
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
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
exports.crossplotFormatDialog = function (ModalService, wiCrossplotCtrl, callback){
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');
        let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();
        this.props = wiD3CrossplotCtrl.crossplotModel.properties;
        this.refCurves = [];
        this.selectedCurveX = null;
        this.selectedCurveY = null;
        this.selectedCurveZ = null;
        this.selectedZoneSet = null;

        this.pointSet = wiD3CrossplotCtrl.pointSet;
        this.pointSet.pointSymbol = utils.upperCaseFirstLetter(this.pointSet.pointSymbol);
        // this.pointSet = new Object();
        // DEBUG
        window.crossplotDialog = this;
        console.log("pointSet", this.pointSet, this.props);

        function findCurveById (idCurve) {
            curveObjs = self.curvesOnDataset.filter(function (item, index) {
               return (item.id == idCurve);
           });
            return curveObjs[0];
        }
        if (this.pointSet.idCurveX && this.pointSet.idCurveY) {
            wiApiService.scaleCurve(this.pointSet.idCurveX, function(scaleX) {
                wiApiService.scaleCurve(self.pointSet.idCurveX, function(scaleY) {
                    self.pointSet.scaleLeft = (findCurveById(self.pointSet.idCurveX).properties.idFamily == null)? scaleX.minScale:self.pointSet.scaleLeft;
                    self.pointSet.scaleRight = (findCurveById(self.pointSet.idCurveX).properties.idFamily == null)? scaleX.maxScale:self.pointSet.scaleRight;
                    self.pointSet.scaleBottom = (findCurveById(self.pointSet.idCurveY).properties.idFamily == null)? scaleY.minScale:self.pointSet.scaleBottom;
                    self.pointSet.scaleTop = (findCurveById(self.pointSet.idCurveY).properties.idFamily == null)? scaleY.maxScale:self.pointSet.scaleTop;
                })
            });     
        }
        if(this.pointSet.idCurveZ) {
            console.log("idCurveZ", this.pointSet.idCurveZ);
            wiApiService.scaleCurve(this.pointSet.idCurveZ, function(scaleZ) {
                self.pointSet.scaleMin = (findCurveById(self.pointSet.idCurveZ).properties.idFamily == null)? scaleX.minScale:self.pointSet.scaleMin;
                self.pointSet.scaleMax = (findCurveById(self.pointSet.idCurveZ).properties.idFamily == null)? scaleX.maxScale:self.pointSet.scaleMax;
            })
        }
        this.viCrossplot = wiD3CrossplotCtrl.viCrossplot;
        this.well = utils.findWellByCrossplot(wiCrossplotCtrl.id);
        this.depthType = (self.pointSet && self.pointSet.idZoneSet != null) ? "zonalDepth" : "intervalDepth";
        this.lineMode = self.pointSet.lineMode ? self.pointSet.lineMode : true; 
        this.zoneSets = new Array();
        this.datasetsInWell = new Array();
        this.curvesOnDataset = new Array(); //curvesInWell + dataset.curve

        this.selectedZone = self.pointSet.activeZone ? self.pointSet.activeZone : 'All';
        

        this.well.children.forEach(function (child, i) {
            if (child.type == 'dataset') self.datasetsInWell.push(child);
            if (child.type == 'zonesets') self.zoneSets = angular.copy(child.children);

            if( i == self.well.children.length - 1){

                self.datasetsInWell.forEach(function (dataset) {
                    dataset.children.forEach(function (curve) {
                        if (curve.type == 'curve') {
                            let d = curve;
                            d.datasetCurve = dataset.properties.name + "." + curve.properties.name;
                            self.curvesOnDataset.push(d);
                            if(d.id == self.pointSet.idCurveX){
                                self.selectedCurveX = self.pointSet.idCurveX;
                                // self.pointSet.idCurveX = self.selectedCurveX;
                            }
                            if(d.id == self.pointSet.idCurveY){
                                self.selectedCurveY = self.pointSet.idCurveY;
                                // self.pointSet.idCurveY = self.selectedCurveY;
                            }
                            if(d.id == self.pointSet.idCurveZ){
                                self.selectedCurveZ = self.pointSet.idCurveZ;
                                // self.pointSet.idCurveY = self.selectedCurveY;
                            }
                        }
                    })
                });

                if (self.zoneSets && self.zoneSets.length > 0) {
                    if (!self.pointSet.idZoneSet) {
                        self.selectedZoneSet = self.zoneSets[0];
                    }
        
                    for (let i = self.zoneSets.length - 1; i >= 0; i--) {
                        self.zoneSets[i].idx = i;
                        if (self.zoneSets[i].properties.idZoneSet == self.pointSet.idZoneSet) {
                            self.selectedZoneSet = self.zoneSets[i];
                        }
                        if (!self.zoneSets[i].children || !self.zoneSets[i].children.length) {
                            self.zoneSets.splice(i, 1);
                        }
                    }
                }
            }
        });

        this.compare = false;
        this.selectPointSymbol = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"];
        console.log("curvesOnDataset", this.curvesOnDataset);
        function getTopFromWell() {
            return parseFloat(self.well.properties.topDepth);
        }
        function getBottomFromWell() {
            return parseFloat(self.well.properties.bottomDepth);
        }

        this.onDepthTypeChanged = function(){
            switch (self.depthType) {
                case "intervalDepth":
                    self.pointSet.intervalDepthTop = self.pointSet.intervalDepthTop ? self.pointSet.intervalDepthTop: getTopFromWell();
                    self.pointSet.intervalDepthBottom = self.pointSet.intervalDepthBottom ? self.pointSet.intervalDepthBottom : getBottomFromWell();
                    self.pointSet.idZoneSet = null;
                    break;
                case "zonalDepth":
                    if(self.selectedZoneSet){
                        self.pointSet.idZoneSet = self.selectedZoneSet.properties.idZoneSet;
                    }
                    break;
            }
        }

        this.onselectedCurveXChange = function () {
            if (self.selectedCurveX) {
                self.pointSet.idCurveX = self.selectedCurveX;
            }
            wiApiService.scaleCurve(self.selectedCurveX, function (scaleObj) {
                $timeout(function () {
                    let curveX = findCurveById(self.selectedCurveX);
                    if (curveX.properties.idFamily == null) {
                        self.pointSet.scaleLeft = scaleObj.minScale;
                        self.pointSet.scaleRight = scaleObj.maxScale;
                    } else {
                        self.pointSet.scaleLeft = curveX.properties.minScale;
                        self.pointSet.scaleRight = curveX.properties.maxScale;
                    }
                })
            });
        }

        this.onselectedCurveYChange = function () {
            if (self.selectedCurveY) {
                self.pointSet.idCurveY = self.selectedCurveY;
            }
            wiApiService.scaleCurve(self.selectedCurveY, function (scaleObj) {
                $timeout(function () {
                    let curveY = findCurveById(self.selectedCurveY);
                    if (curveY.properties.idFamily == null) {
                        self.pointSet.scaleBottom = scaleObj.minScale;
                        self.pointSet.scaleTop = scaleObj.maxScale;
                    } else {
                        self.pointSet.scaleBottom = curveY.properties.minScale;
                        self.pointSet.scaleTop = curveY.properties.maxScale;
                    }
                })
            });
        }

        this.onselectedCurveZChange = function () {
            if (self.selectedCurveZ) {
                self.pointSet.idCurveZ = self.selectedCurveZ;
            }
            wiApiService.scaleCurve(self.selectedCurveZ, function (scaleObj) {
                $timeout(function () {
                    let curveZ = findCurveById(self.selectedCurveZ);
                    if (curveZ.properties.idFamily == null) {
                        self.pointSet.scaleMin = scaleObj.minScale;
                        self.pointSet.scaleMax = scaleObj.maxScale;
                    } else {
                        self.pointSet.scaleMin = curveZ.properties.minScale;
                        self.pointSet.scaleMax = curveZ.properties.maxScale;
                    }
                })
            });
        }
        this.onZoneSetChange = function () {
            if(self.selectedZoneSet){
                self.pointSet.idZoneSet = self.selectedZoneSet.properties.idZoneSet;
            }
        }

        this.onActiveZoneChange = function(){
            if (self.selectedZone) {
                self.pointSet.activeZone = self.selectedZone;
            }
        }

        this.onLineModeChange = function(){
            self.pointSet.lineMode = self.lineMode;
        }

        // modal button
        this.colorSymbol = function () {
            DialogUtils.colorPickerDialog(ModalService, self.pointSet.pointColor, function (colorStr) {
                self.pointSet.pointColor = colorStr;
            });
        };
        (this.props.referenceCurves).forEach(function(curve, index){
            curve.change = 0,
            curve.index = index,
            self.refCurves.push(curve);
        });
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getRefCurves()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.refCurves[index].change == 0) self.refCurves[index].change = 1;
        }
        this.getRefCurves = function () {
            return self.refCurves.filter(function (c, index) {
                return (self.refCurves[index].change < '3');
            });
        };
        this.removeRow = function () {
            console.log("removeRowClicked");
            if (!self.refCurves[self.__idx]) return;
            if(self.refCurves[self.__idx].change == 2) {
                self.refCurves[self.__idx].change = 4;
            } else {
                self.refCurves[self.__idx].change = 3;
            }
        };
        this.addRow = function () {
            let curve = {
                vis: true,
                log: false,
                color: 'blue',
                change: 2,
                index: (self.refCurves).length
            }
            self.refCurves.push(curve);
            console.log("addRow", self.refCurves);
        };
        this.curveColor = function(index) {
            DialogUtils.colorPickerDialog(ModalService, self.refCurves[index].color, function (colorStr) {
                self.refCurves[index].color = colorStr;
            });
        }
        function updateScalesTab(callback) {
            let crossplotObj = {};
            let pointSet = angular.copy(self.pointSet);
            wiApiService.dataCurve(pointSet.idCurveX, function (xCurveData) {
                wiApiService.dataCurve(pointSet.idCurveY, function (yCurveData) {
                    if (pointSet.idCurveZ) {
                        wiApiService.dataCurve(pointSet.idCurveZ, function (zCurveData) {
                            pointSet.curveZ = graph.buildCurve({ idCurve: pointSet.idCurveZ }, zCurveData, self.well.properties);
                        })
                    }
                    pointSet.curveX = graph.buildCurve({ idCurve: pointSet.idCurveX }, xCurveData, self.well.properties);
                    pointSet.curveY = graph.buildCurve({ idCurve: pointSet.idCurveY }, yCurveData, self.well.properties);
                    pointSet.idCrossPlot = wiCrossplotCtrl.id;
                    pointSet.activeZone = self.selectedZone;
                    console.log(pointSet);
                    self.props.pointSet = pointSet;
                    let scalesObj = angular.copy(self.pointSet);                        
                    scalesObj.curveX = undefined;
                    scalesObj.curveY = undefined;
                    scalesObj.curveZ = undefined;
                    wiApiService.getCrossplot(pointSet.idCrossPlot, function (crossplot) {
                        if (crossplot.pointsets && crossplot.pointsets.length) {
                            scalesObj.idPointSet = crossplot.pointsets[0].idPointSet;
                            wiApiService.editPointSet(scalesObj, function(res){
                                self.viCrossplot.setProperties(self.props);
                                self.viCrossplot.doPlot();
                            });
                        }
                    });
                    
                    if (callback) {
                        callback();
                    }
                });
            });
        };
        function updateCrossplot () {
            let refCurves = self.refCurves.filter(function (c, index) {
                return (self.refCurves[index].change < '3');
            });
            self.props.reference_curves = refCurves;
            console.log("ref", self.props);
        }
        this.onOkButtonClicked = function () {
            updateScalesTab(function () {
                close(self.pointSet);
            });
        };
        this.onApplyButtonClicked = function () {
            updateCrossplot();
            updateScalesTab(function () {
                if (callback) callback(self.pointSet);
            });
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
        this.done = false;        

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
            self.done = false;
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
                    self.done = true;                    
                });
            };
            img.src = self.src;
        }, 500)

        function getConfig() {
            console.log(config);
            return {
                idImage: config.id || null,
                src: self.src,
                top: self.top,
                bottom: self.bottom,
                left: self.left,
                width: self.width
            }
        }
        this.onOkButtonClicked = function () {
            if (!self.done) return;
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
                if (drawingPolygon) {
                    self.polygons[index].lineStyle = drawingPolygon.lineStyle;
                    self.polygons[index].points = JSON.stringify(drawingPolygon.points);
                }
            });
        }
        this.polygonLineColor = function (index) {
            dialogUtils.colorPickerDialog(ModalService, self.polygons[index].lineStyle, function (colorStr) {
                self.polygons[index].lineStyle = colorStr;
            });
        }
        function sendPolygonsAPIs() {
            const idCrossPlot = wiD3Crossplot.wiCrossplotCtrl.id;
            const unchangedPolygons = self.polygons.filter(polygon => polygon.change == change.unchanged && polygon.points).map(unchangedPolygon => {
                unchangedPolygon.points = JSON.parse(unchangedPolygon.points);
                return unchangedPolygon;
            });
            const createdPolygons = self.polygons.filter((polygon) => polygon.change == change.created && polygon.points).map(createdPolygon => {
                createdPolygon.points = JSON.parse(createdPolygon.points);
                createdPolygon.idCrossPlot = idCrossPlot;
                createdPolygon.change = change.unchanged;
                wiApiService.createPolygon(createdPolygon);
                return createdPolygon;
            });
            const updatedPolygons = self.polygons.filter((polygon) => polygon.change == change.updated && polygon.points).map(updatedPolygon => {
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
        this.onBlur = function(args) {
            console.log('onBlur', args);
        }
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
        setTimeout(function() {
            $(modal.element[0]).find('input').focus();
        }, 500);
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
        window.hisFormat = this;
        this._FNEW = 1;
        this._FEDIT = 2;
        this._FDEL = 3;
        var utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        var histogramModel = utils.getModel('histogram', wiHistogramCtrl.id);
        this.histogramProps = angular.copy(histogramModel.properties);
        this.depthType = histogramModel.properties.idZoneSet != null ? "zonalDepth" : "intervalDepth";
        this.ref_Curves_Arr = angular.copy(histogramModel.properties.reference_curves);
        this.SelectedRefCurve = self.ref_Curves_Arr && self.ref_Curves_Arr.length ? 0: -1;
        this.selectedZoneSet = null;
        this.SelectedActiveZone = self.histogramProps.activeZone != null ? self.histogramProps.activeZone : "All";
        this.well = utils.findWellByHistogram(wiHistogramCtrl.id);
        this.datasets = [];
        this.zoneSetList = [];
        this.curvesArr = [];
        this.SelectedCurve = {};
        console.log("histofram", this.histogramProps);
        this.well.children.forEach(function(child, i){
            switch (child.type){
            case 'dataset':
                self.datasets.push(child);
                break;

            case 'zonesets':
                self.zoneSetList = angular.copy(child.children);
                break;
            }

            if (i == self.well.children.length - 1) {
                // set default curve
                self.datasets.forEach(function (child) {
                    child.children.forEach(function (item) {
                        if (item.type == 'curve') {
                            var d = item;
                            d.datasetName = child.properties.name;
                            self.curvesArr.push(d);
                            if (d.id == self.histogramProps.idCurve) {
                                self.SelectedCurve = d;
                            }
                        }
                    })
                });
                
                // set default zone && activezone
                if (self.zoneSetList && self.zoneSetList.length > 0) {
                    if (!self.histogramProps.idZoneSet) {
                        self.selectedZoneSet = self.zoneSetList[0];
                    }
                    
                    for (let i = self.zoneSetList.length - 1; i >= 0; i--) {
                        self.zoneSetList[i].idx = i;
                        if (self.zoneSetList[i].properties.idZoneSet == self.histogramProps.idZoneSet) {
                            self.selectedZoneSet = self.zoneSetList[i];
                        }
                        if ( !self.zoneSetList[i].children || !self.zoneSetList[i].children.length ) {
                            self.zoneSetList.splice(i, 1);
                        }
                    }
                }
            }
        })

        this.onZoneSetChange = function () {
            if (self.selectedZoneSet) {
                self.histogramProps.idZoneSet = self.selectedZoneSet.properties.idZoneSet;
            }
        }

        this.onActiveZoneChange = function () {
            if (self.SelectedActiveZone) {
                self.histogramProps.activeZone = self.SelectedActiveZone;
            }
        }

        this.onSelectCurveChange = function () {
            self.histogramProps.idCurve = self.SelectedCurve.id;
            console.log(self.SelectedCurve);
            if(self.SelectedCurve.properties.minScale != null && self.SelectedCurve.properties.maxScale != null){
                self.histogramProps.leftScale = self.SelectedCurve.properties.minScale;
                self.histogramProps.rightScale = self.SelectedCurve.properties.maxScale;
            }else{
                wiApiService.scaleCurve(self.SelectedCurve.id, function(scale){
                    console.log('scale curve');
                    $timeout(function(){
                        self.histogramProps.leftScale = scale.minScale;
                        self.histogramProps.rightScale = scale.maxScale;
                    });
                })        
            }
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
                    if(self.selectedZoneSet){
                        self.histogramProps.idZoneSet = self.selectedZoneSet.properties.idZoneSet;
                    }
                    break;
            }
        }

        this.defaultDepthButtonClick = function(){
            self.histogramProps.referenceTopDepth = getTopFromWell();
            self.histogramProps.referenceBottomDepth = getBottomFromWell();
        }

        this.chooseChartColor = function () {
            DialogUtils.colorPickerDialog(ModalService, self.histogramProps.color, function (colorStr) {
                self.histogramProps.color = colorStr;
            });
        }

        this.chooseRefCurveColor = function(index){
            DialogUtils.colorPickerDialog(ModalService, self.ref_Curves_Arr[index].color, function (colorStr) {
                self.ref_Curves_Arr[index].color = colorStr;
            });
        }

        this.setClickedRow = function(index){
            self.SelectedRefCurve = index;
        }

        this.onRefCurveChange = function(index, curve){
            self.ref_Curves_Arr[index].idCurve = self.ref_Curves_Arr[index].curve.idCurve;
            if(typeof self.ref_Curves_Arr[index].flag === 'undefined') {
                self.ref_Curves_Arr[index].flag = self._FEDIT;
            }
            if(curve) {
                if(self.ref_Curves_Arr[index].curve.minScale != null && self.ref_Curves_Arr[index].curve.maxScale != null){
                    self.ref_Curves_Arr[index].left = self.ref_Curves_Arr[index].curve.minScale;
                    self.ref_Curves_Arr[index].right = self.ref_Curves_Arr[index].curve.maxScale;
                }else{
                    wiApiService.scaleCurve(self.ref_Curves_Arr[index].curve.idCurve, function(scale){
                        console.log('scale curve');
                        $timeout(function(){
                            self.ref_Curves_Arr[index].left = scale.minScale;
                            self.ref_Curves_Arr[index].right = scale.maxScale;
                        });
                    })        
                }
            }
        }

        this.AddRefCurve = function(){
            let newRefCurve = {
                color: "rgb(0,0,0)",
                idHistogram: self.histogramProps.idHistogram,
                left: 0,
                right: 0,
                visiable: true,
                log: true,
                flag: self._FNEW
            }

            self.ref_Curves_Arr.push(newRefCurve);
        }

        this.DeleteRefCurve = function(){
            if(self.ref_Curves_Arr[self.SelectedRefCurve].flag != self._FNEW){
                self.ref_Curves_Arr[self.SelectedRefCurve].flag = self._FDEL;
            }else{
                self.ref_Curves_Arr.splice(self.SelectedRefCurve, 1);
            }
            self.SelectedRefCurve = self.SelectedRefCurve > 0 ? self.SelectedRefCurve - 1 : -1;
        }

        this.IsNotValid = function () {
            var inValid = false;
            if (!self.histogramProps.idZoneSet) {
                if (self.histogramProps.intervalDepthTop == null || self.histogramProps.intervalDepthBottom == null || self.histogramProps.intervalDepthTop > self.histogramProps.intervalDepthBottom) {
                    inValid = true;
                }
            }

            if (self.histogramProps.leftScale == null || self.histogramProps.rightScale == null || self.histogramProps.leftScale == self.histogramProps.rightScale) {
                inValid = true;
            }

            return inValid;
        }

        this.onApplyButtonClicked = function(){
            console.log("on Apply clicked");
            if(self.ref_Curves_Arr && self.ref_Curves_Arr.length){
                for (let i = self.ref_Curves_Arr.length - 1; i >= 0; i--){
                switch(self.ref_Curves_Arr[i].flag){
                    case self._FDEL:
                        wiApiService.removeRefCurve(self.ref_Curves_Arr[i].idReferenceCurve, function(){
                            self.ref_Curves_Arr.splice(i, 1);
                            console.log('removeRefCurve');
                        })
                        break;

                    case self._FNEW:
                        wiApiService.createRefCurve(self.ref_Curves_Arr[i], function(data){
                            delete self.ref_Curves_Arr[i].flag;
                            self.ref_Curves_Arr[i].idReferenceCurve = data.idReferenceCurve;
                            console.log('createRefCurve');
                        })
                        break;

                    case self._FEDIT:
                        wiApiService.editRefCurve(self.ref_Curves_Arr[i], function(){
                            delete self.ref_Curves_Arr[i].flag;
                            console.log('editRefCurve');
                        })
                        break;

                    default:
                        break;
                }

                // if(i == 0){
                    
                // }
            }
            }

            self.histogramProps.reference_curves = self.ref_Curves_Arr;
            histogramModel.properties = self.histogramProps;
            wiApiService.editHistogram(histogramModel.properties, function(returnData) {
                console.log('Return Data', returnData);
                if (callback) callback(histogramModel.properties);
                //let wiD3Ctrl = wiHistogramCtrl.getwiD3Ctrl();
                //wiD3Ctrl.linkModels();
                //wiD3Ctrl.getZoneCtrl().zoneUpdate();
            })
            
            
        }

        this.onOKButtonClicked = function () {
            self.onApplyButtonClicked();
            console.log("on OK clicked");
            // histogramModel.properties = self.histogramProps;
            // wiApiService.editHistogram(histogramModel.properties, function(returnData){
            //     console.log('Return Data', returnData);
            //     if (callback) callback(histogramModel.properties);
                //let wiD3Ctrl = wiHistogramCtrl.getwiD3Ctrl();
                //wiD3Ctrl.linkModels();
                //wiD3Ctrl.getZoneCtrl().zoneUpdate();
            // });
            close(null);
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
        })
    });
};

exports.histogramFrequencyInfoDialog = function (ModalService, wiD3Ctrl) {
    function ModalController($scope, close) {
        var self = this;
        let visHistogram = wiD3Ctrl.visHistogram;
        if(wiD3Ctrl.histogramModel.properties.idZoneSet){
            this.bins = visHistogram.fullBins;
        }else{
            this.bins = visHistogram.intervalBins;
        }

        this.SelectedBinNum = null;

        this.getLength = function(b){
            return b.length;
        }

        this.getValueRange = function(b){
            return b.x0 + '<-->' + b.x1;
        }

        this.maxValueRange = getMaxValueRange();
        function getMaxValueRange(){
            var max = -99999999;
            var max_idx = -1;
            var val = null;

            self.bins.forEach(function(b, i){
                if(max < self.getLength(b)){
                    max = self.getLength(b);
                    max_idx = i;
                    val = self.getValueRange(b);
                }
            })

            return {
                id: max_idx,
                value: val
            }
        };

        this.onSearchButtonClick = function () {
            self.Point_Num = self.getLength(self.bins[self.SelectedBinNum - 1]);
            self.Max_Value = self.bins[self.SelectedBinNum - 1][self.Point_Num - 1];
        }

        this.onCloseButtonClicked = function () {
            console.log("on Close clicked");
            close();
        }
    }

    ModalService.showModal({
        templateUrl: "histogram-frequency-info/histogram-frequency-info-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
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
        this.styles = {
            lineStyle: {
                lineWidth: props.lineWidth,
                lineDash: props.lineDash,
                lineColor: props.lineColor
            },
            symbolStyle: {
                symbolName: props.symbolName.toLowerCase(), // TODO: refactor
                symbolSize: props.symbolSize,
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
            // dialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService, function (styles) {
            //     self.styles = styles || self.styles;
            // }, self.styles);
            self.styles.display = true;
            dialogUtils.lineSymbolAttributeDialog(ModalService, wiComponentService, null, self.styles, function (lineStyle, symbolStyle) {
                if (symbolStyle) self.styles = symbolStyle;
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
exports.regressionLineDialog = function (ModalService, wiD3Crossplot, callback){
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        let change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4
        }
        $scope.selectDataSetting = {
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'id',
            checkBoxes: true
        };
        // this.example13model=[{id: 2}];
        let polygons = angular.copy(wiD3Crossplot.getPolygons());
        console.log("polygons", polygons);
        this.polygonList = new Array();
        polygons.forEach(function(polygonItem, index) {
            polygonItem.id = index;
            polygonItem.label = index;
            self.polygonList.push(polygonItem);
        });
        let viCrossplot = wiD3Crossplot.getViCrossplot();
        this.regressionLines = [];
        this.viCross = viCrossplot.getProperties()
        console.log("vi111", this.viCross, this.polygonList);
        let regressionLinesProps = this.viCross.regressionLines;
        
        regressionLinesProps.forEach(function(regLineItem, index) {
            regLineItem.change = change.unchanged;
            regLineItem.index = index;
            self.regressionLines.push(regLineItem);
        });

        $scope.change = change; 
        console.log("wiD3Crossplot", wiD3Crossplot, viCrossplot, self.regressionLines);
        this.getRegressionLines = function () {
            return self.regressionLines.filter(function (item, index) {
               return (item.change != change.deleted && item.change != change.uncreated);
           });
        }
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getRegressionLines()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.regressionLines[index].change == change.unchanged) self.regressionLines[index].change = change.updated;
        }
        // modal buttons
        this.removeRow = function () {
            if (!self.regressionLines[self.__idx]) return;
            if(self.regressionLines[self.__idx].change == change.created) {
                self.regressionLines[self.__idx].change = change.uncreated;
            } else {
                self.regressionLines[self.__idx].change = change.deleted;
            }
            if (self.getRegressionLines().length) {
                self.setClickedRow(0);
            }
        };
        this.addRow = function () {
            self.regressionLines.push({
                change: change.created,
                index: self.regressionLines.length,
                lineStyle: {
                    lineColor: "blue",
                    lineWidth: 1,
                    lineStyle: [10, 0]
                },
                exclude: true,
                polygons: [],
                fitX: 0,
                fitY: 0
            });
            console.log("addRow", self.regressionLines);
        };
        console.log("regressionLines", this.regressionLines);
        this.onselectedPolygonsChange = function(){
            if(self.selectedCurveX) self.pointSet.idCurveX = self.selectedCurveX;
        }
        this.onEditLineStyleButtonClicked = function(index) {
            console.log("onEditLineStyleButtonClicked", self.regressionLines);

            DialogUtils.lineStyleDialog(ModalService, wiComponentService,function (lineStyleObj){
                self.regressionLines[index].lineStyle = lineStyleObj.lineStyle;
            }, self.regressionLines[index]);
        };
        function setRegressionLines(callback) {
            let regressionLinesIdx = [];
            self.regressionLines.forEach(function(item, index){
                item.idCrossPlot = self.viCross.idCrossPlot;
                switch (item.change) {
                    case 0:
                        console.log("unchange:", item);
                        break;
                    case 1:
                        wiApiService.createRegressionLines(item, function(res) {
                            console.log("create", item);
                            item.change = 0;
                        });
                        break;
                    case 2:
                        wiApiService.editRegressionLines(item, function(res) {
                            console.log("edit", res);
                            item.change = 0;
                        });
                        break;
                    case 3:
                        wiApiService.removeRegressionLines(item.idRegressionLine, function(res){
                            console.log("remove", res);
                            // self.regressionLines.splice(item, 1);
                            regressionLinesIdx.push(index);
                        });
                        break;
                    case 4:
                        console.log("uncreated", item);
                        // self.regressionLines.splice(item, 1);
                        regressionLinesIdx.push(index);
                        break;
                    default:
                        console.log('Something went wrong!');
                        break;
                }
            });
            console.log('regressionLinesObj', self.regressionLines, regressionLinesIdx);
            regressionLinesIdx.forEach(function(item) {
                self.regressionLines.splice(item, 1);
            })
            if (callback) {
                callback();
            }
        }
        this.onOkButtonClicked = function () {
            setRegressionLines(function() {
                self.viCross.regressionLines = self.regressionLines;
                viCrossplot.setProperties(self.viCross);
                viCrossplot.doPlot();
                close();
            });
        };
        this.onApplyButtonClicked = function() {
            setRegressionLines(function() {
                console.log("okii", self.viCross);
                self.viCross.regressionLines = self.regressionLines;
                viCrossplot.setProperties(self.viCross);
                viCrossplot.doPlot();
            });
        };
        this.onCancelButtonClicked = function () {
            console.log("cancel", self.regressionLines);

            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "regression-line/regression-line-modal.html",
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

exports.zoneManagerDialog = function (ModalService, item) {
    const _FNEW = 1;
    const _FEDIT = 2;
    const _FDEL = 3;
    function ModalController(close, wiComponentService, wiApiService, $timeout, $scope) {
        let self = this;
        let _currentZoneSetId = null;
        this.applyingInProgress = false;
        let errorMessage = 'Zones are invalid!';

        window.zoneMng = this;
        this._FNEW = _FNEW;
        this._FEDIT = _FEDIT;
        this._FDEL = _FDEL;
        var utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.project = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
        this.wellArr = this.project.children;

        this.SelectedWell = this.wellArr[0];
        this.zonesetsArr = self.SelectedWell.children.find(function (child) {
            return child.name == 'zonesets';
        }).children;
        this.SelectedZoneSet = self.zonesetsArr.length ? self.zonesetsArr[0] : null;

        this.zoneArr = this.SelectedZoneSet ? angular.copy(this.SelectedZoneSet.children) : null;
        
        this.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                self.refreshZoneSets();
                setSelectedZoneSet(_currentZoneSetId);
            }, 0);
        });
        switch (item.name) {
            case 'well':
                self.wellArr.forEach(function(well, i){
                    if(well.id == item.id){
                        self.SelectedWell = self.wellArr[i];
                        self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                            return child.name == 'zonesets';
                        }).children;
                        self.SelectedZoneSet = self.zonesetsArr.length ? self.zonesetsArr[0] : null;
                        self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
                        self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
                    }
                })
                break;

            case 'zonesets':
                self.wellArr.forEach(function(well, i){
                    if(well.id == item.properties.idWell){
                        self.SelectedWell = self.wellArr[i];
                        self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                            return child.name == 'zonesets';
                        }).children;
                        self.SelectedZoneSet = self.zonesetsArr.length ? self.zonesetsArr[0] : null;
                        _currentZoneSetId = self.zonesetsArr[0].properties.idZoneSet;
                        self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
                        self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
                    }
                })
                break;

            case 'zoneset':
                self.wellArr.forEach(function(well, i){
                    if(well.id == item.properties.idWell){
                        self.SelectedWell = self.wellArr[i];
                        self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                            return child.name == 'zonesets';
                        }).children;

                        _currentZoneSetId = item.id;
                        setSelectedZoneSet(_currentZoneSetId);
                        
                    }
                })
                break;

            case 'zone':
                self.wellArr.forEach(function(well, i){
                    var zonesetsArr = well.children.find(function (child) {
                        return child.name == 'zonesets';
                    }).children;

                    zonesetsArr.forEach(function(zoneset, j){
                        if(zoneset.id == item.properties.idZoneSet){
                            self.SelectedWell = self.wellArr[i];
                            self.zonesetsArr = zonesetsArr;
                            self.SelectedZoneSet = self.zonesetsArr[j];
                            self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;

                            self.zoneArr.forEach(function(zone, k){
                                if(zone.id == item.id){
                                    self.SelectedZone = k;
                                }
                            });
                        }
                    })
                })
                break;
        }

        buildDisplayZoneArr();
        
        // METHOD Section begins
        function setSelectedZoneSet(cZonesetId) {
            self.SelectedZone = null;
            self.zonesetsArr.forEach(function(zoneset, j){
                if(zoneset.id == cZonesetId){
                    self.SelectedZoneSet = self.zonesetsArr[j];
                    self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
                    self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
                }
            });
        }
        function buildDisplayZoneArr() {
            if(self.zoneArr && self.zoneArr.length){
                self.zoneArr.sort(function(z1, z2) {
                    return z1.properties.startDepth > z2.properties.startDepth;
                });
            }
        }

        this.setClickedRow = function (indexRow) {
            self.SelectedZone = indexRow;
        }
        this.onZoneChanged = function(index, attr) {
            if(typeof self.zoneArr[index].flag === 'undefined'){
                self.zoneArr[index].flag = _FEDIT;
            }
        }
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        this.foregroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zoneArr[index].properties.foreground, function (colorStr) {
                self.zoneArr[index].properties.fill.pattern.foreground = colorStr;
                self.onZoneChanged(index);                
            });
        };
        this.backgroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zoneArr[index].properties.background, function (colorStr) {
                self.zoneArr[index].properties.fill.pattern.background = colorStr;
                self.onZoneChanged(index);
            });
        };

        this.onRenameZoneSet = function(){
            utils.renameZoneSet(self.SelectedZoneSet);
        }

        this.refreshZoneSets = function(){
            self.project = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
            self.wellArr = self.project.children;
            var tmp = self.SelectedWell.id;
            self.SelectedWell = self.wellArr.find(function(well){
                return well.id == tmp;
            })
            self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                return child.name == 'zonesets';
            }).children;
            buildDisplayZoneArr();
        }
        this.onAddZoneSet = function(){
            utils.createZoneSet(self.SelectedWell.id, function (dataReturn) {
                console.log('zoneSet created', dataReturn);
                _currentZoneSetId = dataReturn.idZoneSet;
            });
        }

        this.onChangeWell = function () {
            self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                return child.name == 'zonesets';
            }).children;

            self.SelectedZoneSet = self.zonesetsArr[0];
        }

        this.onChangeZoneSet = function () {
            _currentZoneSetId = self.SelectedZoneSet.id;
            self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
            buildDisplayZoneArr();
            self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
        }

        this.genColor = function () {
            var rand = function () {
                return Math.floor(Math.random() * 255);
            }
            return "rgb(" + rand() + "," + rand() + "," + rand() + ")";
        }

        this.addZone = function (index, top, bottom) {
            let newZone = {
                name: 'zone',
                properties: {
                    fill: {
                        pattern: {
                            background: self.genColor(),
                            foreground: 'white',
                            name: 'none'
                        }
                    },
                    startDepth: parseFloat(top.toFixed(2)),
                    endDepth: parseFloat(bottom.toFixed(2)),
                    idZoneSet: self.SelectedZoneSet.id,
                    name: parseInt(top)
                },
                flag: _FNEW
            };

            self.zoneArr.splice(index, 0, newZone);
            self.SelectedZone = self.SelectedZone + 1;
        }

        this.onAddAboveButtonClicked = function () {
            if (self.zoneArr.length && self.SelectedZone >= 0) {
                var zone = self.zoneArr[self.SelectedZone];
                var pre_zone = null;

                for(let i = self.SelectedZone - 1; i >=0; i--){
                    if(self.zoneArr[i].flag != _FDEL){
                        pre_zone = self.zoneArr[i];
                        i = -1;
                    }
                }
                var free = 0;
                if (pre_zone) {
                    free = zone.properties.startDepth - pre_zone.properties.endDepth >= 50 ? 50 : zone.properties.startDepth - pre_zone.properties.endDepth;
                } else {
                    free = zone.properties.startDepth - parseFloat(self.SelectedWell.properties.topDepth) >= 50 ? 50 : zone.properties.startDepth - parseFloat(self.SelectedWell.properties.topDepth);
                }

                if (parseInt(free) > 0) {
                    self.addZone(self.SelectedZone, zone.properties.startDepth - free, zone.properties.startDepth);
                } else {
                    utils.error("Can't add row above");
                }

            } else {
                var top = parseFloat(self.SelectedWell.properties.topDepth);
                var bottom = parseFloat(self.SelectedWell.properties.bottomDepth) > top + 50 ? top + 50 : parseFloat(self.SelectedWell.properties.bottomDepth);
                self.addZone(0, top, bottom);
            }
        }

        this.onAddBelowButtonClicked = function () {
            if (self.zoneArr.length && self.SelectedZone >= 0) {
                var zone = self.zoneArr[self.SelectedZone];
                var next_zone = null;

                for(let i = self.SelectedZone + 1; i < self.zoneArr.length; i++){
                    if(self.zoneArr[i].flag != _FDEL){
                        next_zone = self.zoneArr[i];
                        i = self.zoneArr.length;
                    }
                }
                var free = 0;
                if (next_zone) {
                    free = next_zone.properties.startDepth - zone.properties.endDepth >= 50 ? 50 : next_zone.properties.startDepth - zone.properties.endDepth;
                } else {
                    free = parseFloat(self.SelectedWell.properties.bottomDepth) - zone.properties.endDepth >= 50 ? 50 : parseFloat(self.SelectedWell.properties.bottomDepth) - zone.properties.endDepth;

                }

                if (parseInt(free) > 0) {
                    self.addZone(self.SelectedZone + 1, zone.properties.endDepth, zone.properties.endDepth + free);
                } else {
                    utils.error("Can't add row below");
                }

            } else {
                var top = parseFloat(self.SelectedWell.properties.topDepth);
                var bottom = parseFloat(self.SelectedWell.properties.bottomDepth) > top + 50 ? top + 50 : parseFloat(self.SelectedWell.properties.bottomDepth);
                self.addZone(0, top, bottom);
            }
        }

        this.onDeleteButtonClicked = function () {
            if(self.zoneArr[self.SelectedZone].flag != _FNEW){
                self.zoneArr[self.SelectedZone].flag = _FDEL;
            }else{
                self.zoneArr.splice(self.SelectedZone, 1);
            }
            self.SelectedZone = self.SelectedZone > 0 ? self.SelectedZone - 1 : -1;
        }

        this.onClearAllButtonClicked = function () {
            self.zoneArr.map(function(z){
                z.flag = _FDEL;
            })
            self.SelectedZone = -1;
        }
        this.verify = function(){
            if(self.zoneArr && self.zoneArr.length){
                var unique = [...new Set(self.zoneArr.map(a => a.properties.name))];
                if(unique.length < self.zoneArr.length) {
                    return false; // check unique zone name
                }
                
                if( self.zoneArr[0].properties.startDepth < self.SelectedWell.properties.topDepth){
                    self.zoneArr[0].err = true;
                    return false;
                }
                for (let i = 0; i < self.zoneArr.length - 1; i++){
                    self.zoneArr[i].err = false;
                    if(self.zoneArr[i].properties.startDepth >= self.zoneArr[i].properties.endDepth){
                        self.zoneArr[i].err = true;
                        return false;
                    }
                    
                    if(self.zoneArr[i].properties.endDepth > self.zoneArr[i+1].properties.startDepth){
                        self.zoneArr[i].err = true;
                        self.zoneArr[i+1].err = true;                                            
                        return false;
                    }
                    let last = self.zoneArr[self.zoneArr.length - 1];
                    if(last.properties.startDepth >= last.properties.endDepth || last.properties.endDepth > self.SelectedWell.properties.bottomDepth){
                        self.zoneArr[self.zoneArr.length - 1].err = true;                
                        return false;
                    }
                    
                }
                return true;
            }else{
                return true;
            }
        }

        function doApply(callback){
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.zoneArr && self.zoneArr.length){
                wiComponentService.getComponent("SPINNER").show();
                for (let i = self.zoneArr.length - 1; i >= 0; i--){
                    switch (self.zoneArr[i].flag) {
                        case _FDEL:
                            wiApiService.removeZone(self.zoneArr[i].id, function(){
                                self.zoneArr.splice(i, 1);
                                console.log('removeZone');
                            });
                            break;
                        
                        case _FNEW:
                            wiApiService.createZone(self.zoneArr[i].properties, function(data){
                                delete self.zoneArr[i].flag;
                                self.zoneArr[i].id = data.idZone;
                                self.zoneArr[i].properties.idZone = data.idZone;
                                console.log('createZone');
                            });
                            break;
                        
                        case _FEDIT:
                            wiApiService.editZone(self.zoneArr[i].properties, function(){
                                delete self.zoneArr[i].flag;
                                console.log('editZone');
                            });
                            break;
                        
                        default:
                            break;
                    }
                }
                utils.refreshProjectState().then(function(){
                    if(callback) callback();
                });      
            }else{
                if(callback) callback();                
            }
            
        }
        this.onApplyButtonClicked = function () {
            console.log('Apply');
            if(self.verify()) {
                doApply();
            }else{
                utils.error(errorMessage);
                return;
            }
        }

        this.onOkButtonClicked = function(){
             console.log('Ok');
            if(self.verify()) {
                doApply(function(){
                    close(null);
                });
            }else{
                utils.error(errorMessage);                
                return;
            }   
        }
                   
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'zone-manager/zone-manager-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
        })
    })
}


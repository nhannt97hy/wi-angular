exports.authenticationDialog = function (ModalService, wiComponentService,callback) {
    function ModalController($scope, close, wiApiService) {
        let self = this;
        this.disabled = false;
        this.error = null;
        this.captchaPNG = wiApiService.getCaptcha();
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
                password: self.passwordReg,
                email: self.useremailReg,
                fullname: self.userfullnameReg,
                captcha: self.captcha
            }
            wiApiService.register(dataRequest, function (response) {
                if(response == "USER_EXISTED"){
                    // alert("User existed");
                    authenticationMessage(ModalService, "Registration", "User already exists!", function () {
                    });
                } else if(response == "WRONG_CAPTCHA"){
                    //alert("Wrong captcha");
                    authenticationMessage(ModalService, "Registration", "Captcha was not correct!", function () {
                    });
                } else {
                    authenticationMessage(ModalService, "Registration", "Register successfully. Please wait for account activation.", function () {
                        location.reload();
                    });
                }
                // let userInfo = {
                //     username: self.usernameReg,
                //     password: self.passwordReg,
                //     token: token
                // }
                // wiApiService.setAuthenticationInfo(userInfo);
                // close(100);
                // if(token != "CAPTCHA"){
                //     setTimeout(function () {
                //         warningMessageDialog(ModalService, "Register Successfully! Wait for active", function () {
                //             location.reload();
                //         });
                //     }, 200);
                // } else {
                //     alert("Captcha is not correct!");
                // }
            });
        }
        this.onLoginButtonClicked = function () {
            self.error = null;
            if (!self.username || !self.password) return;
            let dataRequest = {
                username: self.username,
                password: self.password,
                whoami: 'main-service'
            }
            wiApiService.login(dataRequest, function(response) {
                if(response == "USER_NOT_EXISTS"){
                    authenticationMessage(ModalService, "Login", "User is not exists.", function () {
                    });
                } else if (response == "WRONG_PASSWORD") {
                    authenticationMessage(ModalService, "Login", "Password is not correct.", function () {
                    });
                } else if (response == "NOT_ACTIVATED"){
                    authenticationMessage(ModalService, "Login", "You are not activated. Please wait for account activation.", function () {
                    });
                } else if(response == "DATABASE_CREATION_FAIL"){
                    authenticationMessage(ModalService, "Login", "Backend Service problem.", function () {
                    });
                } else {
                    let userInfo = {
                        username: self.username,
                        password: self.password,
                        token: response,
                        remember: self.remember
                    };
                    wiApiService.setAuthenticationInfo(userInfo);
                    close(userInfo);
                }
            });

        }
    }

    ModalService.showModal({
        templateUrl: 'authentication/authentication-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $('.modal-backdrop').css({'opacity': 1, 'background-color': '#ffffff'});
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (callback && data) callback(data);
        });
    });
};
exports.authenticationMessage = authenticationMessage;
function authenticationMessage(ModalService, type, message, callback) {
    function ModalController($scope, close) {
        let self = this;
        this.title = type;
        this.message = message;
        this.onCloseButtonClicked = function () {
            close(null);
        };
    }
    ModalService.showModal({
        templateUrl: 'authentication-message/authentication-message-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            if (callback) callback();
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        })
    });
}

exports.newProjectDialog = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout) {
        let self = this;
        this.disabled = false;
        // this.error = null;

        this.onOkButtonClicked = function () {
            // self.error = '';
            self.disabled = true;

            let data = {
                name: $scope.name,
                company: $scope.company,
                department: $scope.department,
                description: $scope.description
            };
            close(data);
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
        this.type = promptConfig.type ? promptConfig.type : 'text';
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
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
            $('.modal-backdrop').last().remove();
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
        this.drawIcon = utils.drawIcon;

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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            console.log(ret);
            if (ret) callback(ret);
        });
    });
}

exports.lineSymbolAttributeDialog = function (ModalService, wiComponentService, lineOptions, symbolOptions, callback) {
    function ModalController($scope, close, $timeout) {
        var self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
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
        this.symbolType = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star"];
        this.symbolWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let type = 'Circle';

        this.drawIcon = utils.drawIcon;

        this.onSelectSymbol = function () {
            console.log("choossss");
        }
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
            $('.modal-backdrop').last().remove();
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
            symbolType: ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"],
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');

            if (callback) callback(ret);
        });
    });
};

exports.OpenTemplateDialog = function (ModalService, selectedNode) {
    function ModalController($scope, close, wiComponentService, wiApiService) {
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        const utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let payloadParams = new Object();
        this.plotName = "PlotTemplate";
        payloadParams.idWell = selectedNode.properties.idWell;
        this.error = null;
        this.tplFile = null;
        let self = this;
        window.iml = this;
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
        this.onOkButtonClicked = function () {
            payloadParams.file = self.tplFile;
            payloadParams.plotName = self.plotName;
            wiApiService.postWithTemplateFile(payloadParams)
                .then(function (response) {
                    if (response.length == 0) {
                        utils.refreshProjectState()
                            .then(function () {
                                close(null, 500);
                            })
                            .catch(function (err) {
                                utils.error(err);
                                close(null, 500);
                            });
                    } else {
                        utils.refreshProjectState().then(function(){
                            close(null, 500);
                            let message = "";
                            response.forEach(function(r){
                                message += "Curve: " + r.dataset + "." + r.curve + " Not exist! <br>";
                            });
                            setTimeout(function(){
                                DialogUtils.warningMessageDialog(ModalService, message);
                            }, 1000);
                        });
                    }
                })
                .catch(function (err) {
                    utils.error(err);
                })
        };
    }

    ModalService.showModal({
        templateUrl: "open-plot-template/open-plot-template.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (data) console.log("imported", data);
        });
    });
}


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
                                setTimeout(function() {
                                    utils.refreshProjectState()
                                        .then(function () {
                                            close(well, 500);
                                        })
                                        .catch(function () {
                                            self.isDisabled = false;
                                            utils.error(err);
                                        });
                                }, 1000);
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
                                    setTimeout(function() {
                                        utils.refreshProjectState()
                                            .then(function () {
                                                close(well, 500);
                                            })
                                            .catch(function () {
                                                self.isDisabled = false;
                                                utils.error(err);
                                            });
                                    }, 1000);
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            // $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
        // wiApiService.getPalettes(function(pals){
        utils.getPalettes(function(pals){
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
        // wiApiService.getPalettes(function(paletteList){
        utils.getPalettes(function(paletteList){

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
            $('.modal-backdrop').last().remove();
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
        this.applyInProgress = false;
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

        this.curveList = currentTrack.getCurves();
        console.log("curveList", this.curveList);

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
        // this.curvesArr.forEach(function (curve, index) {
        //     let dataset = utils.findDatasetById(curve.properties.idDataset);
        //     curve.properties.datasetName = dataset.properties.name;
        //     console.log("curveObj", curve);
        // })

        this.lineCurve = [];
        this.fillPatternOptions = new Array();
        this.variableShadingOptions = new Array();
        this.curveList.forEach(function (item) {
            let curvesOnDatasetItem = item;
            curvesOnDatasetItem.datasetCurve = utils.findDatasetById(item.idDataset).properties.name + '.' + item.name;
            self.curvesOnDataset.push(curvesOnDatasetItem);
        })
        this.curvesArr.forEach(function (item) {
            let selectedCurve = item.datasetName + '.' + item.properties.name;
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
                change: '0'
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

        let savedZoomFactor = this.props.general.zoomFactor;

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
            if (self.curvesChanged[self.__idx].change == '2') {
                _removeRowFromCurvesTable(self.__idx);
            } else {
                self.curvesChanged[self.__idx].change = '3';
            }
        }

        function removeCurve(idLine) {
            wiApiService.removeLine(idLine, function () {
                currentTrack.removeCurveById(idLine);
            });
        };

        this.setDisabledCurve = function(index) {
            let temp = true;
            if(self.curvesChanged[index].change == '2') temp = false;
            return temp;
        }
        function _removeRowFromCurvesTable(idx) {
            self.curvesChanged.splice(idx, 1);
            self.curves.splice(idx, 1);
            self.curvesSymbolOptions.splice(idx, 1);
            self.curvesLineOptions.splice(idx, 1);
            self.lineCurve.splice(idx, 1);
        }
        function _cleanUpCurvesTable() {
            for (let idx = self.curvesChanged.length - 1; idx >= 0; idx--) {
                if (self.curvesChanged[idx].change == "3") {
                    _removeRowFromCurvesTable(idx);
                }
            }
        }
        this.onSelectCurve = function () {
            if (self.curvesChanged[self.__idx].change == '2') {
                idCurveNew = self.lineCurve[self.__idx].id;
                console.log("idCurveNew", idCurveNew, self.__idx, self.curvesChanged, self.lineCurve[self.__idx]);
                wiApiService.infoCurve(idCurveNew, function (curveInfo) {
                    let lineProps = curveInfo.LineProperty;
                    console.log("curveInfo", curveInfo, lineProps);
                    if (!lineProps) {
                        console.log("idFamily is not detected!");
                    } else {
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
                    }
                });
            }
        }
        this.getCurves = function () {
            return self.curves.filter(function (c, index) {
                return (self.curvesChanged[index].change == '0' ||
                        self.curvesChanged[index].change == '1' ||
                        self.curvesChanged[index].change == '2');
            });
        }
        this.onChangeCurve = function () {
            if (self.curvesChanged[self.__idx].change == '0') self.curvesChanged[self.__idx].change = '1';
            console.log(self.curvesChanged[self.__idx]);
        }
        this.addRowCurve = function () {
            self.curves.push({ _index: self.curves.length });
            console.log(self.curves);
            let item = {
                _index: self.curvesChanged.length,
                change: '2'
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
            switch (self.shadingChanged[self.__idx].change) {
                case '0':
                case '1':
                    self.shadingChanged[self.__idx].change = '3';
                    break;
                case '2':
                    self.shadingChanged[self.__idx].change = '-1'; // xoa
                    _removeRowFromShadingsTable(self.__idx);
                    break;
            }

/*
            if (!self.shadingChanged[self.__idx]) return;
            if (self.shadingChanged[self.__idx].change == 2) {
                self.shadingChanged[self.__idx] = 4;
            } else {
                self.shadingChanged[self.__idx].change = 3;
            }
*/
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

        function updateShading(idx) {
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
            console.log('visualize-+-shading', shadingList[idx]);
            wiApiService.editShading(shadingObj, function (result) {
                console.log(result, shadingObj);
                let shadingObjToSet = angular.copy(shadingObj);
                // wiApiService.getPalettes(function(paletteList){
                utils.getPalettes(function(paletteList){

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
                        shadingList[idx].setProperties(shadingObjToSet);
                        $timeout(function() {
                            currentTrack.plotAllDrawings();
                        });
                    });
                });
            });
        }
        function updateShadings(){
            console.log("update shadings");
            self.shadingChanged.forEach(function(item, index){
                if(item.change == "1") {
                    updateShading(index);
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
                        // wiApiService.getPalettes(function(paletteList){
                        utils.getPalettes(function(paletteList){
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

        function updateGeneralTab(callback) {
            let temp = true;
            // utils.changeTrack(self.props.general, wiApiService);
            console.log('general', self.props.general);
            if(self.props.general.width >= 0.5 ) {
                wiApiService.editTrack(self.props.general, function(res) {
                    console.log("res", res);
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
            } else {
                console.log("temp");
                temp = false;
                DialogUtils.errorMessageDialog(ModalService, "LogTrack's width must be greater than 0.5 inch!");
                callback();
            }
            return temp;
        }

        function updateCurvesTab(updateCurvesTabCb) {
            console.log("updateCurvesTab");
            async.eachOfSeries(self.curvesChanged, function(item, idx, callback) {
                switch(item.change) {
                    case '0':
                        callback();
                        break;
                    case '1': {
                        let curveOptions = self.curves[idx];
                        let lineOptions = self.curvesLineOptions[idx].lineStyle;
                        let symbolOptions = self.curvesSymbolOptions[idx].symbolStyle;
                        let lineObj = utils.mergeLineObj(curveOptions, lineOptions, symbolOptions);
                        utils.changeLine(lineObj, wiApiService, function () {
                            self.curveList[idx].setProperties(lineObj);
                            currentTrack.plotCurve(self.curveList[idx]);
                            callback();
                        });
                        item.change = 0;
                        break;
                    }

                    case '2': {
                        let lineObj = {
                            idCurve: self.lineCurve[idx].id,
                            idTrack: currentTrack.id
                        }
                        console.log("new curves", lineObj);
                        wiApiService.createLine(lineObj, function (line) {
                            console.log("CREATE:", line);
                            utils.getCurveData(wiApiService, line.idCurve, function (err, data) {
                                let lineModel = utils.lineToTreeConfig(line);
                                if (!err) {
                                    wiD3Ctrl.addCurveToTrack(currentTrack, data, lineModel.data);
                                    self.curveList = currentTrack.getCurves();
                                    self.curves[idx].idLine = line.idLine;
                                    item.change = '1';
                                } else {
                                    console.error(err);
                                }

                                callback();
                            });
                        });
                        break;
                    }
                    case '3':
                        wiApiService.removeLine(self.curves[idx].idLine, function () {
                            currentTrack.removeCurveById(self.curves[idx].idLine);
                            self.curveList = currentTrack.getCurves();
                            callback();
                        });
                        break;
                    default:
                        // break;
                        callback('unknown change code:', item.change);

                }
            }, function(err) {
                if (err) {
                    DialogUtils.errorMessageDialog(ModalService, err);
                }
                //_cleanUpCurvesTable();
                if (updateCurvesTabCb) updateCurvesTabCb(err);
            });
        }


        this.getShadings = function () {
            return self.shadingArr.filter(function (c, index) {
                return (self.shadingChanged[index].change == '0' ||
                        self.shadingChanged[index].change == '1' ||
                        self.shadingChanged[index].change == '2');
            });
        }
        function _removeRowFromShadingsTable (index) {
            self.shadingChanged.splice(index, 1);
            self.shadingArr.splice(index, 1);
            self.fillPatternOptions.splice(index, 1);
            self.variableShadingOptions.splice(index, 1);
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
                    _removeRowFromShadingsTable(index);
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
        function updateShadingsTab(updateShadingsTabCb) {
            console.log("updateShadingTab");
            async.eachOfSeries(self.shadingChanged, function(item, idx, callback) {
                switch(item.change) {
                    case '0':
                        callback();
                        break;
                    case '1': {
                        console.log("111",self.shadingArr[idx],
                        self.fillPatternOptions[idx],
                        self.variableShadingOptions[idx]);
                        let shadingObj = utils.mergeShadingObj(self.shadingArr[idx],
                                        self.fillPatternOptions[idx],
                                        self.variableShadingOptions[idx]);
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
                        console.log('visualize-+-shading', shadingList[idx]);
                        wiApiService.editShading(shadingObj, function (result) {
                            console.log(result, shadingObj);
                            let shadingObjToSet = angular.copy(shadingObj);
                            // wiApiService.getPalettes(function(paletteList){
                            utils.getPalettes(function(paletteList){
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
                                    shadingList[idx].setProperties(shadingObjToSet);
                                    $timeout(function() {
                                        currentTrack.plotAllDrawings();
                                    });

                                    callback();
                                });
                            });
                        });
                        item.change = '0';
                        break;
                    }
                    case '2': {
                        let shadingObj = utils.mergeShadingObj(self.shadingArr[idx],
                            self.fillPatternOptions[idx],
                            self.variableShadingOptions[idx]);
                        console.log("shadingObj", shadingObj);
                        if(shadingObj.idLeftLine < 0) shadingObj.idLeftLine = null;
                        if(shadingObj.idLeftLine > 0) shadingObj.leftFixedValue = null;
                        wiApiService.createShading(shadingObj, function(shading) {
                            // wiApiService.getPalettes(function(paletteList){
                            utils.getPalettes(function(paletteList){
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
                                callback();
                            })
                        });
                        item.change = '1';
                        break;
                    }
                    case '3':
                        wiApiService.removeShading(self.shadingArr[idx].idShading, function (result) {
                            console.log("removeShading");
                            let currentShading = currentTrack.findShadingById(result.idShading);
                            wiD3Ctrl.removeShadingFromTrack(currentTrack, currentShading);
                            // _removeRowFromShadingsTable(idx);
                            callback();
                        });
                        break;
                    default:
                        callback('unknown change code:', item.change);
                }
            }, function(err) {
                if (err) {
                    DialogUtils.errorMessageDialog(ModalService, err);
                }
                if (updateShadingsTabCb) updateShadingsTabCb(err);
            });
        }
        function doApply(callback) {
            if( self.applyInProgress) return;
            self.applyInProgress = true;

            if (!validateAll()) {
                DialogUtils.errorMessageDialog(ModalService, "Shading setting is not valid");
                return;
            }
            async.series([
                function(callback) {
                    updateGeneralTab(function (err) {
                        callback();
                    });
                    // async.setImmediate(function() {
                    //     callback();
                    // });
                },
                function(callback) {
                    updateCurvesTab(function(err) {
                        callback(err);
                    });
                },
                function(callback) {
                    updateShadingsTab(function(err) {
                        callback(err);
                    });
                }
            ], function(err, results) {
                console.log(err, results);
                console.log("applyInProgress", self.applyInProgress);
                if (!self.applyInProgress) callback(true);
            });
            self.applyInProgress = false;
        }
        this.onApplyButtonClicked = function () {
            doApply(function(){});
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
        templateUrl: "log-track-properties/log-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        if (options.shadingOnly) { wiModal.shadingOnly = true };
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            utils.createZoneSet(wiLogplotModel.properties.idWell, function (zoneSetReturn) {
                refreshZoneSets();
                self.idZoneSet = zoneSetReturn.idZoneSet;
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
}

exports.imageTrackPropertiesDialog = function (ModalService, wiLogplotCtrl, imageTrackProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let wiLogplotModel = wiLogplotCtrl.getLogplotModel();
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = imageTrackProperties || {
            showTitle: true,
            title: "New Image Track",
            topJustification: "center",
            trackColor: '#ffffff',
            width: utils.inchToPixel(2)
            // parameterSet: null
        }
        props.width = utils.pixelToInch(props.width);
        console.log(props);
        this.showTitle = props.showTitle;
        this.title = props.title;
        this.topJustification = props.topJustification.toLowerCase();
        this.trackColor = props.trackColor;
        this.width = props.width;

        this.trackBackground = function () {
            DialogUtils.colorPickerDialog(ModalService, self.trackColor, function (colorStr) {
                self.trackColor = colorStr;
            });
        }
        this.onOkButtonClicked = function () {
            props = {
                showTitle: self.showTitle,
                title: self.title,
                topJustification: self.topJustification,
                trackColor: self.trackColor,
                width: self.width,
                parameterSet: self.parameterSet
            }
            // if (self.error) return;
            close(props, 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "image-track-properties/image-track-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (data) callback(data);
        });
    });
}

exports.imageZonePropertiesDialog = function (ModalService, config, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let props = config || {};

        this.idImageOfTrack = props.idImageOfTrack;

        this.imageFile = null;
        this.done = props.done || false;
        this.imageUrl = props.imageUrl || "";
        this.name = props.name;
        this.showName = props.showName;
        this.fill = props.fill || 'white';

        this.uploadedImages = [];

        wiApiService.getImageGallery(function (images) {
            self.uploadedImages = images.map(function(item) {
                return {
                    name: item.match(/\/([^\/]+)\/?$/)[1],
                    imageUrl: wiApiService.BASE_URL + item
                }
            });
        });

        this.isGalleryOpening = false;

        this.selectedImage = null;
        this.selected = false;

        this.onUploadButtonClicked = function () {
            wiApiService.uploadImage({
                file: self.imageFile
            }, function (imageUrl) {
                $scope.$apply(function () {
                    self.imageUrl = imageUrl;
                    self.onImageUrlChange();
                    self.done = true;
                    let latestImage = {
                        name: self.imageUrl.match(/\/([^\/]+)\/?$/)[1],
                        imageUrl: self.imageUrl
                    }
                    self.uploadedImages.push(latestImage);
                });
            });
        }

        this.background = function () {
            dialogUtils.colorPickerDialog(ModalService, self.fill, function (colorStr) {
                self.fill = colorStr;
                console.log(colorStr);
            });
        }

        this.openGallery = function () {
            this.isGalleryOpening = !this.isGalleryOpening;
            console.log("open gallery");
        }

        this.deleteUploadedImage = function (image) {
            console.log('image was deleted');
            console.warn(image);
        }

        this.selectImage = function (image) {
            self.selectedImage = image;
            self.selected = true;
            self.imageUrl = image.imageUrl;
            self.done = true;
        }

        function validateUrl (str) {
            var regex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
            if (!(regex.test(str)))
                return false;
            return true;
        }

        this.onImageUrlChange = utils.debounce(function () {
            if (validateUrl(self.imageUrl))
                this.done = true;
            else
                this.done = false;
        }, 500)

        function bindProps() {
            props.idImageOfTrack = self.idImageOfTrack;
            props.imageUrl = self.imageUrl;
            props.name = self.name;
            props.showName = self.showName;
            props.fill = self.fill;
            props.done = self.done;
        }

        this.onOkButtonClicked = function () {
            bindProps();
            close(props, 100);
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
            callback(ret);
        });
    });
}

exports.showImageDialog = function (ModalService, image, callback) {
    function ModalController ($scope, wiComponentService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let currentImage = image;

        this.currentImageUrl = currentImage.imageUrl;
        this.currentImageName = currentImage.name;

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }
    ModalService.showModal({
        templateUrl: "image-view/image-view-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            callback();
        });
    });
}

exports.errorMessageDialog = errorMessageDialog;

function errorMessageDialog(ModalService, errorMessage, callback) {
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (callback) callback();
        })
    });
};

exports.warningMessageDialog = warningMessageDialog;
function warningMessageDialog (ModalService, warningMessage, callback) {
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
            if (callback) callback();
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');

            if (data) {
                callback(data);
            }
        })
    });
};
/* exports.newBlankCrossplotDialog = function (ModalService, callback) {
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');

            if (callback && newPlot) callback(newPlot);
        });
    });
} */
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
*/

exports.crossplotFormatDialog = function (ModalService, wiCrossplotCtrl, callback){
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        const CURVE_SYMBOLS = ['X', 'Y', 'Z'];

        let self = this;

        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');

        let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();
        this.crossplotModel = angular.copy(wiD3CrossplotCtrl.crossplotModel);
        this.viCrossplot = wiD3CrossplotCtrl.viCrossplot.getProperties();
        // this.props = crossplotModel.properties;
        this.selectedCurveX = null;
        this.selectedCurveY = null;
        this.selectedCurveZ = null;
        this.selectedZoneSet = null;
        this.zoneSets = new Array();
        this.datasetsInWell = new Array();
        this.curvesOnDataset = new Array(); //curvesInWell + dataset.curve
        this.depthType = 'intervalDepth';
        this.lineMode = false;

        this.well = utils.findWellByCrossplot(wiCrossplotCtrl.id);
        this.selectPointSymbol = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"];

        async.waterfall([
            function(cb) {
                var pointsets = self.crossplotModel.properties.pointsets;
                if (!pointsets || !pointsets.length || !pointsets[0].idPointSet ) {
                    wiApiService.getCrossplot(self.crossplotModel.properties.idCrossPlot, function (crossplot) {
                        // self.crossplotModel.properties.pointSet = crossplot.pointsets[0];
                        self.crossplotModel.properties = crossplot;
                        cb();
                    });
                }
                else cb();
            },
            function(cb) {
                let pointSet = self.crossplotModel.properties.pointsets[0];
                if (!pointSet.pointSymbol)
                    pointSet.pointSymbol = 'Circle';

                if (!pointSet.numColor)
                    pointSet.numColor = 5;

                pointSet.pointSymbol = utils.upperCaseFirstLetter(pointSet.pointSymbol);

                // self.pointSet = self.crossplotModel.properties.pointSet;
                self.depthType = (pointSet && pointSet.idZoneSet != null) ? "zonalDepth" : "intervalDepth";

                self.lineMode = pointSet.lineMode ? pointSet.lineMode : true;
                pointSet.activeZone = pointSet.activeZone ? pointSet.activeZone : 'All';
                self.selectedZone = pointSet.activeZone ? pointSet.activeZone : 'All'; // To be removed
                async.setImmediate(cb);
            },
            getZonesAndCurvesInDataset,
            function(cb) {
                CURVE_SYMBOLS.forEach(function(symbol) {
                    autoScaleCurve(symbol, true);
                });
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
                                let d = curve;
                                d.datasetCurve = dataset.properties.name + "." + curve.properties.name;
                                self.curvesOnDataset.push(d);
                            }
                        })
                    });
                    let pointSet = self.crossplotModel.properties.pointsets[0];
                    if (self.zoneSets && self.zoneSets.length > 0) {
                        if (!pointSet.idZoneSet) {
                            self.selectedZoneSet = self.zoneSets[0];
                        }

                        for (let i = self.zoneSets.length - 1; i >= 0; i--) {
                            self.zoneSets[i].idx = i;
                            if (self.zoneSets[i].properties.idZoneSet == pointSet.idZoneSet) {
                                self.selectedZoneSet = self.zoneSets[i];
                            }
                            if (!self.zoneSets[i].children || !self.zoneSets[i].children.length) {
                                self.zoneSets.splice(i, 1);
                            }
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
            let pointSet = self.crossplotModel.properties.pointsets[0];
            let idCurve = pointSet[key];
            if (pointSet && pointSet[key]) {
                if (noForce && pointSet[scaleKeys[0]] != null && pointSet[scaleKeys[1]] != null) return;

                let curve = findCurveById(idCurve).properties;

                let family = utils.findFamilyById(curve.idFamily);
                if (family) {
                    pointSet[scaleKeys[0]] = family.minScale;
                    pointSet[scaleKeys[1]] = family.maxScale;
                }
                else {
                    wiApiService.scaleCurve(idCurve, function (scaleObj) {
                        $timeout(function () {
                            pointSet[scaleKeys[0]] = scaleObj.minScale;
                            pointSet[scaleKeys[1]] = scaleObj.maxScale;
                        });
                    });
                }
            }
        }

        function getTopFromWell() {
            return parseFloat(self.well.properties.topDepth);
        }
        function getBottomFromWell() {
            return parseFloat(self.well.properties.bottomDepth);
        }

        function onSelectedCurveChange(symbol) {
            // let idCurve = self['selectedCurve' + symbol]
            let idCurve = self.crossplotModel.properties.pointsets[0]['idCurve' + symbol];
            if (idCurve) {
                let scaleKeys = getScaleKeys(symbol);
                let key1 = scaleKeys[0], key2 = scaleKeys[1];

                // self.crossplotModel.properties.pointsets[0]['idCurve' + symbol] = idCurve;
                autoScaleCurve(symbol);
            }
        }

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
            switch (self.depthType) {
                case "intervalDepth":
                    self.crossplotModel.properties.pointsets[0].intervalDepthTop = self.crossplotModel.properties.pointsets[0].intervalDepthTop ? self.crossplotModel.properties.pointsets[0].intervalDepthTop: getTopFromWell();
                    self.crossplotModel.properties.pointsets[0].intervalDepthBottom = self.crossplotModel.properties.pointsets[0].intervalDepthBottom ? self.crossplotModel.properties.pointsets[0].intervalDepthBottom : getBottomFromWell();
                    self.crossplotModel.properties.pointsets[0].idZoneSet = null;
                    break;
                case "zonalDepth":
                    if(self.selectedZoneSet){
                        self.crossplotModel.properties.pointsets[0].idZoneSet = self.selectedZoneSet.properties.idZoneSet;
                    }
                    break;
            }
        }

        this.onZoneSetChange = function () {
            if(self.selectedZoneSet){
                self.crossplotModel.properties.pointsets[0].idZoneSet = self.selectedZoneSet.properties.idZoneSet;
            }
        }

        this.onActiveZoneChange = function(){
            if (self.selectedZone) {
                self.crossplotModel.properties.pointsets[0].activeZone = self.selectedZone;
            }
        }

        this.onLineModeChange = function(){
            self.crossplotModel.properties.pointsets[0].lineMode = self.lineMode;
        }

        // modal button
        this.colorSymbol = function () {
            DialogUtils.colorPickerDialog(ModalService, self.crossplotModel.properties.pointsets[0].pointColor, function (colorStr) {
                self.crossplotModel.properties.pointsets[0].pointColor = colorStr;
            });
        };
        this.drawIcon = utils.drawIcon;

        // function buildPayload(crossplotProps) {
        //     let props = crossplotProps;
        //     delete props.pointsets[0].curveX;
        //     delete props.pointsets[0].curveY;
        //     delete props.pointsets[0].curveZ;
        //     return props
        // }

        // AXIS COLORS - START
        $scope.isDefineDepthColors = self.crossplotModel.properties.isDefineDepthColors;
        $scope.axisColors = self.crossplotModel.properties.axisColors;

        if (!$scope.axisColors || $scope.axisColors == 'null')
            $scope.axisColors = [];
        else if (typeof $scope.axisColors == 'string')
            $scope.axisColors = JSON.parse($scope.axisColors);

        $scope.selectedAxisColorRow = $scope.axisColors.length ? 0 : null;

        $scope.setClickedAxisColorRow = function (indexRow) {
            $scope.selectedAxisColorRow = indexRow;
        };

        $scope.removeAxisColorRow = function () {
            if (!$scope.axisColors[$scope.selectedAxisColorRow]) return;
            $scope.axisColors.splice($scope.selectedAxisColorRow, 1);
            if ($scope.axisColors.length) {
                $scope.setClickedAxisColorRow(0);
            }
        };

        $scope.selectAxisColor = function(index) {
            let item = $scope.axisColors[index];
            DialogUtils.colorPickerDialog(ModalService, item.color || 'Black', function (colorStr) {
                item.color = colorStr;
            });
        }

        $scope.addAxisColorRow = function () {
            $scope.axisColors.push({});
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

        function updateCrossplot(callback) {
            // var payload = buildPayload(self.crossplotModel.properties);

            self.crossplotModel.properties.isDefineDepthColors = $scope.isDefineDepthColors;
            self.crossplotModel.properties.axisColors = $scope.axisColors;

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

            self.updating = true;
            async.parallel([
                function(cb) {
                    payload = {
                        idCrossPlot: self.crossplotModel.properties.idCrossPlot,
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
                    wiApiService.editPointSet(self.crossplotModel.properties.pointsets[0], function(){
                        cb();
                    });
                }
            ], function(err, result) {
                if (err) {
                    console.error(err);
                    utils.error(err);
                }
                else {
                    wiD3CrossplotCtrl.crossplotModel.properties = self.crossplotModel.properties;
                    let pointSet = self.crossplotModel.properties.pointsets[0];

                    // let crossplotProps = angular.copy(self.crossplotModel.properties);
                    // crossplotProps.pointSet = crossplotProps.pointsets[0];
                    var xCurveData, yCurveData, zCurveData;
                    async.parallel([
                        function(cb) {
                            if (pointSet.idCurveX) {
                                wiApiService.dataCurve(pointSet.idCurveX, function (curveData) {
                                    xCurveData = curveData;
                                    cb();
                                })
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
                        }
                    ], function(result, err) {
                        console.log(result, err);
                        let crossplotProps = angular.copy(self.crossplotModel.properties);
                        crossplotProps.pointSet = crossplotProps.pointsets[0];
                        if (xCurveData) {
                            let curveXProps = utils.getModel("curve", crossplotProps.pointSet.idCurveX) || { idCurve: crossplotProps.pointSet.idCurveX };
                            crossplotProps.pointSet.curveX
                                = graph.buildCurve(curveXProps, xCurveData, self.well.properties);
                        }
                        if (yCurveData) {
                            let curveYProps = utils.getModel("curve", crossplotProps.pointSet.idCurveY) || { idCurve: crossplotProps.pointSet.idCurveY };
                            crossplotProps.pointSet.curveY
                                = graph.buildCurve(curveYProps, yCurveData, self.well.properties);
                        }
                        if (zCurveData) {
                            let curveZProps = utils.getModel("curve", crossplotProps.pointSet.idCurveZ) || { idCurve: crossplotProps.pointSet.idCurveZ };
                            crossplotProps.pointSet.curveZ
                                = graph.buildCurve(curveZProps, zCurveData, self.well.properties);
                        }

                        //wiD3CrossplotCtrl.viCrossplot.setProperties(crossplotProps);
                        //wiD3CrossplotCtrl.viCrossplot.doPlot();
                        self.updating = false;
                        if (callback) callback(crossplotProps);

                    });
                }
            });


        };
        this.onOkButtonClicked = function () {
            updateCrossplot(function (crossplotProps) {
                close(crossplotProps);
            });
        };
        this.onApplyButtonClicked = function () {
            // updateCrossplot();
            updateCrossplot(function (crossplotProps) {
                if (callback) callback(crossplotProps);
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
        modal.element.modal({backdrop:'static', keyboard:false});
        $(modal.element[0].children[0]).draggable();
        modal.element.find('#spinner-holder')[0].appendChild(new Spinner().spin().el);
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
            callback(ret);
        });
    });
};
/*
exports.crossplotFormatDialog1 = function (ModalService, wiCrossplotCtrl, callback){
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        const CURVE_SYMBOLS = ['X', 'Y', 'Z'];

        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent('GRAPH');

        let wiD3CrossplotCtrl = wiCrossplotCtrl.getWiD3CrossplotCtrl();
        let crossplotModel = wiD3CrossplotCtrl.crossplotModel;
        this.viCrossplot = wiD3CrossplotCtrl.viCrossplot;

        this.props = crossplotModel.properties;
        this.refCurves = [];
        this.selectedCurveX = null;
        this.selectedCurveY = null;
        this.selectedCurveZ = null;
        this.selectedZoneSet = null;
        this.zoneSets = new Array();
        this.datasetsInWell = new Array();
        this.curvesOnDataset = new Array(); //curvesInWell + dataset.curve

        this.well = utils.findWellByCrossplot(wiCrossplotCtrl.id);
        this.compare = false;
        this.selectPointSymbol = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"];

        async.waterfall([
            preparePointSet,
            getZonesAndCurvesInDataset,
            function(cb) {
                CURVE_SYMBOLS.forEach(function(symbol) {
                    autoScaleCurve(symbol);
                });
                cb();
            }
        ], function(err) {
            console.log('ERROR', err);
        });

        function getZonesAndCurvesInDataset(callback) {
            self.well.children.forEach(function (child, i) {
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
            callback();
        }

        function preparePointSet(callback) {
            async.waterfall([
                function(cb) {
                    if (!self.props.pointSet || self.props.pointSet == {} || !self.props.pointSet.idPointSet) {
                        wiApiService.getCrossplot(self.props.idCrossPlot, function (crossplot) {
                            self.props.pointSet = crossplot.pointsets[0];
                            cb();
                        });
                    }
                    else cb();
                },
                function(cb) {
                    if (!self.props.pointSet.pointSymbol) self.props.pointSet.pointSymbol = 'Circle';
                    if (!self.props.pointSet.numColor) self.props.pointSet.numColor = 5;
                    self.props.pointSet.pointSymbol = utils.upperCaseFirstLetter(self.props.pointSet.pointSymbol);
                    self.pointSet = self.props.pointSet;
                    self.depthType = (self.pointSet && self.pointSet.idZoneSet != null) ? "zonalDepth" : "intervalDepth";
                    self.lineMode = self.pointSet.lineMode ? self.pointSet.lineMode : true;
                    self.selectedZone = self.pointSet.activeZone ? self.pointSet.activeZone : 'All';
                    cb();
                }
            ], function(err) {
                if (err) {
                    console.log('ERROR', error);
                }
                else if (callback) callback();
            });
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

        function autoScaleCurve(symbol) {
            let key = 'idCurve' + symbol;
            let scaleKeys = getScaleKeys(symbol);
            let idCurve = self.pointSet[key];
            if (self.pointSet && self.pointSet[key]) {
                let curve = findCurveById(idCurve).properties;
                if (curve.idFamily == null) {
                    wiApiService.scaleCurve(idCurve, function (scaleObj) {
                        $timeout(function () {
                            self.pointSet[scaleKeys[0]] = scaleObj.minScale;
                            self.pointSet[scaleKeys[1]] = scaleObj.maxScale;
                        });
                    });
                }
                else {
                    let scaleObj = utils.getListFamily().filter(function(f) { return f.idFamily == curve.idFamily; })[0] || {};
                    self.pointSet[scaleKeys[0]] = scaleObj.minScale;
                    self.pointSet[scaleKeys[1]] = scaleObj.maxScale;
                }
            }
        }

        function getTopFromWell() {
            return parseFloat(self.well.properties.topDepth);
        }
        function getBottomFromWell() {
            return parseFloat(self.well.properties.bottomDepth);
        }

        function onSelectedCurveChange(symbol) {
            return function() {
                let idCurve = self['selectedCurve' + symbol]
                if (idCurve) {
                    let scaleKeys = getScaleKeys(symbol);
                    let key1 = scaleKeys[0], key2 = scaleKeys[1];

                    self.pointSet['idCurve' + symbol] = idCurve;
                    autoScaleCurve(symbol);
                }
            }
        }

        this.onselectedCurveXChange = onSelectedCurveChange('X');
        this.onselectedCurveYChange = onSelectedCurveChange('Y');
        this.onselectedCurveZChange = onSelectedCurveChange('Z');

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
        // (this.props.reference_curves).forEach(function(curve, index){
        //     curve.change = 0,
        //     curve.index = index,
        //     self.refCurves.push(curve);
        // });
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
                self.refCurves.splice([self.__idx], 1);
            } else {
                self.refCurves[self.__idx].change = 3;
            }
        };
        this.addRow = function () {
            let curve = {
                idCrossPlot: self.props.idCrossPlot,
                visiable: true,
                log: false,
                color: 'blue',
                change: '2',
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

        function updateCrossplot(callback) {
            let updateBackend = function(callback) {
                async.waterfall([
                    function(cb) {
                        wiApiService.editCrossplot(self.props, function() {
                            cb();
                        });
                    },
                    function(cb) {
                        wiApiService.editPointSet(self.props.pointSet, function() {
                            cb();
                        });
                    },
                ], function(err) {
                    if (err) {
                        console.log('ERROR', err);
                        utils.error(err);
                    }
                    else if (callback) callback();
                });
            }

            let updateVisualize = function(callback) {
                let findCurveData = function(cb) {
                    let props = angular.copy(self.props);
                    let pointSet = props.pointSet;

                    async.eachOfSeries(CURVE_SYMBOLS, function(symbol, idx, callback) {
                        let idKey = 'idCurve' + symbol;
                        let objKey = 'curve' + symbol;
                        if (pointSet[idKey] != null && pointSet[objKey] == null) {
                            wiApiService.dataCurve(pointSet[idKey], function (data) {
                                let curve = utils.getModel('curve', pointSet[idKey]).properties;
                                pointSet[objKey] = graph.buildCurve(curve, data, self.well.properties);
                                callback();
                            });
                        }
                        else
                            callback();
                    }, function() {
                        cb(null, props);
                    });
                }
                let rePlot = function(props, cb) {
                    self.viCrossplot.setProperties(props);
                    self.viCrossplot.doPlot();
                    cb();
                }

                async.waterfall([
                    findCurveData,
                    rePlot
                ], function(err) {
                    if (err) {
                        console.log('ERROR', err);
                        utils.error(err);
                    }
                    else if (callback) callback();
                });
            }

            async.waterfall([
                updateBackend,
                updateVisualize
            ], callback);
            // if(self.refCurves && self.refCurves.length) {
            //     async.eachOfSeries(self.refCurves, function(curve, idx, callback) {
            //         switch(self.refCurves[idx].change){
            //             case 3:
            //                 wiApiService.removeRefCurve(self.refCurves[idx].idReferenceCurve, function(){
            //                     console.log('removeRefCurve');
            //                     callback();
            //                 });
            //                 break;

            //             case 2:
            //                 wiApiService.createRefCurve(self.refCurves[idx], function(data){
            //                     //delete self.ref_Curves_Arr[idx].flag;
            //                     self.refCurves[idx].idReferenceCurve = data.idReferenceCurve;
            //                     console.log('createRefCurve');
            //                     callback();
            //                 });
            //                 break;

            //             case 1:
            //                 wiApiService.editRefCurve(self.refCurves[idx], function(){
            //                     //delete self.ref_Curves_Arr[idx].flag;
            //                     console.log('editRefCurve');
            //                     callback();
            //                 })
            //                 break;

            //             default:
            //                 callback();
            //                 break;
            //         }
            //     }, function(err) {
            //         for (let i = self.refCurves.length - 1; i >= 0; i--) {
            //             switch(self.refCurves[i].change){
            //                 case 3:
            //                     self.refCurves.splice(i, 1);
            //                     break;
            //                 case 2:
            //                 case 1:
            //                     delete self.refCurves[i].change;
            //                     break;
            //             }
            //         }
            //         setProps();
            //     });
            // }
            // else {
            //     setProps();
            // }
            // let crossplotObj = {};
            // let pointSet = angular.copy(self.pointSet);
            // wiApiService.dataCurve(pointSet.idCurveX, function (xCurveData) {
            //     wiApiService.dataCurve(pointSet.idCurveY, function (yCurveData) {
            //         if (pointSet.idCurveZ) {
            //             wiApiService.dataCurve(pointSet.idCurveZ, function (zCurveData) {
            //                 pointSet.curveZ = graph.buildCurve({ idCurve: pointSet.idCurveZ }, zCurveData, self.well.properties);
            //             })
            //         }
            //         pointSet.curveX = graph.buildCurve({ idCurve: pointSet.idCurveX }, xCurveData, self.well.properties);
            //         pointSet.curveY = graph.buildCurve({ idCurve: pointSet.idCurveY }, yCurveData, self.well.properties);
            //         pointSet.idCrossPlot = wiCrossplotCtrl.id;
            //         pointSet.activeZone = self.selectedZone;
            //         console.log(pointSet);
            //         self.props.pointSet = pointSet;
            //         let scalesObj = angular.copy(self.pointSet);
            //         scalesObj.curveX = undefined;
            //         scalesObj.curveY = undefined;
            //         scalesObj.curveZ = undefined;
            //         wiApiService.getCrossplot(pointSet.idCrossPlot, function (crossplot) {
            //             if (crossplot.pointsets && crossplot.pointsets.length) {
            //                 scalesObj.idPointSet = crossplot.pointsets[0].idPointSet;
            //                 wiApiService.editPointSet(scalesObj, function(res){
            //                     self.viCrossplot.setProperties(self.props);
            //                     self.viCrossplot.doPlot();
            //                 });
            //             }
            //         });

            //         if (callback) {
            //             callback();
            //         }
            //     });
            // });
        };
        this.onOkButtonClicked = function () {
            updateCrossplot(function () {
                close(self.pointSet);
            });
        };
        this.onApplyButtonClicked = function () {
            // updateCrossplot();
            updateCrossplot(function () {
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
            callback(ret);
        });
    });
};
*/
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
            $('.modal-backdrop').last().remove();
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
/*
            const unchangedPolygons = self.polygons.filter(function(polygon) {
                polygon.change == change.unchanged && polygon.points;
            })
            .map(function(unchangedPolygon) {
                unchangedPolygon.points = JSON.parse(unchangedPolygon.points);
                return unchangedPolygon;
            });

            const createdPolygons = self.polygons.filter(function(polygon){
                polygon.change == change.created && polygon.points
            })
            .map(function(createdPolygon) {
                createdPolygon.points = JSON.parse(createdPolygon.points);
                createdPolygon.idCrossPlot = idCrossPlot;
                createdPolygon.change = change.unchanged;
                wiApiService.createPolygon(createdPolygon);
                return createdPolygon;
            });

            const updatedPolygons = self.polygons.filter(function(polygon) {
                polygon.change == change.updated && polygon.points
            })
            .map(function(updatedPolygon) {
                updatedPolygon.points = JSON.parse(updatedPolygon.points);
                updatedPolygon.idCrossPlot = idCrossPlot;
                updatedPolygon.change = change.unchanged;
                wiApiService.editPolygon(updatedPolygon);
                return updatedPolygon;
            });

            self.polygons.filter((polygon) => polygon.change == change.deleted).map(deletedPolygon => {
                deletedPolygon.idCrossPlot = idCrossPlot;
                deletedPolygon.change = change.deleted;
                wiApiService.removePolygon(deletedPolygon.idPolygon, function(ret){
                    console.log("polygonRemove", ret);
                });
            });
*/
            async.eachOf(self.polygons, function(polygon, idx, callback) {
                if (polygon.change == change.created && polygon.points) {
                    polygon.points = JSON.parse(polygon.points);
                    polygon.idCrossPlot = idCrossPlot;
                    polygon.change = change.unchanged;
                    wiApiService.createPolygon(polygon, function(ret) {
                        polygon.idPolygon = ret.idPolygon;
                        callback();
                    });
                }
                else if (polygon.change == change.updated && polygon.points) {
                    polygon.points = JSON.parse(polygon.points);
                    polygon.idCrossPlot = idCrossPlot;
                    polygon.change = change.unchanged;
                    wiApiService.editPolygon(polygon, callback);
                }
                else if (polygon.change == change.deleted) {
                    polygon.idCrossPlot = idCrossPlot;
                    polygon.change = change.deleted;
                    wiApiService.removePolygon(polygon.idPolygon, callback);
                }
                else if (polygon.change == change.unchanged && polygon.points) {
                    polygon.points = JSON.parse(polygon.points);
                    async.setImmediate(callback);
                }
                else {
                    async.setImmediate(callback);
                }

            }, function(err){
                wiD3Crossplot.initPolygons(self.polygons.filter(p => {return p.change == change.unchanged && p.points}));
                init();
            });

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
            $('.modal-backdrop').last().remove();
            $('.modal').remove();
            $('body').removeClass('modal-open');
            if (ret && callback) callback(ret);
        });
    });
};

/* exports.newBlankHistogramDialog = function(ModalService, callback){
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');

            if (callback) callback(newPlot);
        });
    });
} */

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
        this.ref_Curves_Arr = histogramModel.properties.reference_curves?angular.copy(histogramModel.properties.reference_curves):[];
        this.SelectedRefCurve = self.ref_Curves_Arr && self.ref_Curves_Arr.length ? 0: -1;
        this.selectedZoneSet = null;
        this.SelectedActiveZone = self.histogramProps.activeZone != null ? self.histogramProps.activeZone : "All";
        this.well = utils.findWellByHistogram(wiHistogramCtrl.id);
        this.datasets = [];
        this.zoneSetList = [];
        this.curvesArr = [];
        this.SelectedCurve = {};
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
            let family = utils.findFamilyById(self.SelectedCurve.properties.idFamily);
            console.log(self.SelectedCurve, family);
            if (family) {
                self.histogramProps.leftScale = family.minScale;
                self.histogramProps.rightScale = family.maxScale;
            }
            else if(self.SelectedCurve.properties.minScale != null &&
                    self.SelectedCurve.properties.maxScale != null ) {
                self.histogramProps.leftScale = self.SelectedCurve.properties.minScale;
                self.histogramProps.rightScale = self.SelectedCurve.properties.maxScale;
            }
            else {
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
        this.isNotValid = function () {
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

        this.onApplyButtonClicked = function() {
            console.log("on Apply clicked");
            histogramModel.properties = self.histogramProps;
            wiApiService.editHistogram(histogramModel.properties, function(returnData) {
                console.log('Return Data', returnData);
                if (callback) callback(histogramModel.properties);
            });
        }

        this.onOKButtonClicked = function () {
            self.onApplyButtonClicked();
            console.log("on OK clicked");
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
            $('.modal-backdrop').last().remove();
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
            $('.modal-backdrop').last().remove();
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
            self.depth = +self.depth.toFixed(self.precision);
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
            $('.modal-backdrop').last().remove();
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
        console.log("wiD3Crossplot", wiD3Crossplot);
        let change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4
        }
        // let polygons = angular.copy(wiD3Crossplot.getPolygons());
        // this.polygonList = new Array();
        // polygons.forEach(function(polygonItem, index) {
        //     let pItem = {
        //         idPolygon: polygonItem.idPolygon,
        //         idx: index
        //     }
        //     self.polygonList.push(pItem);
        // });
        let polygons = angular.copy(wiD3Crossplot.getPolygons());
        this.polygonList = new Array();
        polygons.forEach(function(polygonItem, index) {
            self.polygonList.push({
                idx: index + 1,
                value:polygonItem.idPolygon,
                bgColor: polygonItem.lineStyle
            });
        });
        // this.polygonList = angular.copy(wiD3Crossplot.getPolygons());

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
        this.polygonsArr = new Array();
        // this.regressionLines.forEach(function(regLine, index){
        //     let pArr = [];
        //     console.log("reggg", regLine.polygons);
        //     self.polygonList.forEach(function(polygon) {
        //         for( let i = 0; i < regLine.polygons; i++){
        //             if( regLine.polygons[i] == polygon.idPolygon) pArr.push(polygon);
        //             console.log("pArr", pArr);
        //         }
        //     })
        //     self.polygonsArr.push(pArr);
        // });
        // this.setPolygonArr = function (index) {
        //     self.regressionLines[index].polygons = self.polygonsArr[index];
        // }
        // this.polygonsArr = [[{"idPolygon":5,"idx":0},{"idPolygon":6,"idx":1}]]
        console.log("TTTT", this.regressionLines);
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
                self.regressionLines.splice(self.__idx, 1);
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
                displayLine: true,
                displayEquation: true,
                regType: "Linear",
                lineStyle: {
                    lineColor: "blue",
                    lineWidth: 1,
                    lineStyle: [10, 0]
                },
                exclude: true,
                polygons: [],
                idCrossPlot: self.viCross.idCrossPlot
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
            if(self.regressionLines && self.regressionLines.length) {
                async.eachOfSeries(self.regressionLines, function(regLine, idx, callback){
                    // let pArr = [];
                    // regLine.polygons.forEach(function(p, index){
                    //     console.log("ppp", p);
                    //     pArr.push(p.idPolygon);
                    // });
                    // regLine.polygons = pArr;
                    // console.log("regLine", regLine, self.polygonList);
                    switch(regLine.change) {
                        case change.created:
                            wiApiService.createRegressionLines(regLine, function(res){
                                console.log("create", res, regLine);
                                regLine.idRegressionLine = res.idRegressionLine;
                                callback();
                            });
                            break;
                        case change.updated:
                            wiApiService.editRegressionLines(regLine, function(res){
                                console.log("update", res, regLine);
                                callback();
                            });
                            break;
                        case change.deleted:
                            wiApiService.removeRegressionLines(regLine.idRegressionLine, function(res){
                                console.log("delete", res);
                                callback();
                            });
                            break;
                        default:
                            callback();
                            break;
                    }
                }, function(err) {
                    for (let i = self.regressionLines.length - 1; i >= 0; i--){
                        switch(self.regressionLines[i].change) {
                            case change.created:
                            case change.updated:
                                self.regressionLines[i].change = change.unchanged;
                                break;
                            case change.deleted:
                                self.regressionLines.splice(i, 1);
                                break;
                        }
                    }
                    self.viCross.regressionLines = self.regressionLines;
                    viCrossplot.setProperties({ regressionLines: self.regressionLines });
                    viCrossplot.plotRegressionLines();
                    if(callback) callback();
                });
            } else {
                self.viCross.regressionLines = self.regressionLines;
                viCrossplot.setProperties(self.viCross)
                viCrossplot.doPlot();
                if(callback) callback();
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
            $('.modal-backdrop').last().remove();
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
                        _currentZoneSetId = self.SelectedZoneSet?self.SelectedZoneSet.properties.idZoneSet:null;
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
                    async.eachOfSeries(self.zoneArr, function(zone, i, callback){
                        switch (self.zoneArr[i].flag) {
                            case _FDEL:
                                wiApiService.removeZone(self.zoneArr[i].id, function(){
                                    console.log('removeZone');
                                    callback();
                                });
                                break;

                            case _FNEW:
                                wiApiService.createZone(self.zoneArr[i].properties, function(data){
                                    self.zoneArr[i].id = data.idZone;
                                    self.zoneArr[i].properties.idZone = data.idZone;
                                    console.log('createZone');
                                    callback();
                                });
                                break;

                            case _FEDIT:
                                wiApiService.editZone(self.zoneArr[i].properties, function(){
                                    console.log('editZone');
                                    callback();
                                });
                                break;

                            default:
                                callback();
                                break;
                        }

                    },function(err){
                        for (let i = self.zoneArr.length - 1; i >= 0; i--){
                            switch (self.zoneArr[i].flag) {
                                case _FDEL:
                                        self.zoneArr.splice(i, 1);
                                    break;

                                case _FNEW:
                                case _FEDIT:
                                    delete self.zoneArr[i].flag;
                                    break;
                            }
                        }
                        utils.refreshProjectState().then(function(){
                            if(callback) callback();
                        });
                    })
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
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
        })
    })
};

exports.discriminatorDialog = function (ModalService, plotCtrl, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        window.DISC = this;

        this.well = plotCtrl.getWell();
        this.datasets = [];
        this.curvesArr = [];
        this.props = plotCtrl.getModel().properties;
        if (!self.props.discriminator || this.conditionTree == 'null'){
            this.conditionTree = null;
        }
        else if (typeof self.props.discriminator == 'string') {
            this.conditionTree = JSON.parse(self.props.discriminator)
        }
        else {
            this.conditionTree = angular.copy(self.props.discriminator);
        }

        wiComponentService.on('discriminator-update', function(){
            self.conditionExpr = parse(self.conditionTree);
        })

        this.well.children.forEach(function(child, i){
            switch (child.type){
                case 'dataset':
                    self.datasets.push(child);
                    break;
            }
            if (i == self.well.children.length - 1) {
                self.datasets.forEach(function (child) {
                    child.children.forEach(function (item) {
                        if (item.type == 'curve') {
                            self.curvesArr.push(item);
                        }
                    })
                });
            }
        })

        this.conditionExpr = parse(this.conditionTree);

        function parse(tree) {
            let str = "";
            if (!tree) return "";
            if (tree.children && tree.children.length) {
                return "( " + parse(tree.children[0]) + " " + tree.operator.toUpperCase() + " " + parse(tree.children[1]) + " )";
            }
            else if (tree.left && tree.right && tree.comparison) {
                let left = getCurveName(tree.left.value);
                let right = tree.right.type=='value'? tree.right.value: getCurveName(tree.right.value);
                return "( " + left + " " + tree.comparison + " " + right + " )";
            }

            return str;
        }

        function getCurveName(idCurve){
            let model = utils.getModel('curve', idCurve);
            if( model ) return model.properties.name;
            return;
        }
        function visit(node, visitedPath, matchFunc) {
            if (!node) return false;
            visitedPath.unshift(node);
            // visitedPath.push(node);
            if (matchFunc(node)) {
                return true;
            }
            else {
                if (node.children && node.children.length) {
                    for (let childNode of node.children) {
                        if (visit(childNode, visitedPath, matchFunc)) {
                            return true;
                        }
                        // visitedPath.pop();
                        visitedPath.shift();
                    }
                }
            }
            return false;
        }
        function getFirstCurve() {
            return self.curvesArr[0].id;
        }
        this.addCondition = function() {
            let path = new Array();
            let retVal = visit(self.conditionTree, path, function(aNode) {
                return aNode.selected;
            });
            let selectedNode;
            let parentNode = null;

            if (!self.conditionTree) {
                self.conditionTree = {
                    comparison: '>',
                    left: {
                        type: 'curve',
                        value:getFirstCurve()
                    },
                    right: {
                        type: 'value',
                        value: 0
                    }
                };
                self.conditionExpr = parse(self.conditionTree);
                return;
            }

            if (!retVal) selectedNode = self.conditionTree;

            if (retVal) selectedNode = path[0];

            let newNode = {
                operator: 'and',
                children: [
                    selectedNode,
                    {
                        comparison: '>',
                        left: {
                            type: 'curve',
                            value: getFirstCurve()
                        },
                        right: {
                            type: 'value',
                            value: 0
                        }
                    }
                ]
            };
            if (path.length > 1) {
                parentNode = path[1];
                let selectedIdx = parentNode.children.indexOf(selectedNode);
                parentNode.children[selectedIdx] = newNode;
            }
            else {
                self.conditionTree = newNode;
            }
            self.conditionExpr = parse(self.conditionTree);

        }
        this.deleteCondition = function() {
            let path = new Array();
            let retVal = visit(self.conditionTree, path, function(aNode) {
                return aNode.selected;
            });
            if (retVal) {
                if (path.length >= 3) {
                    let selectedNode = path[0];
                    let parentNode = path[1];
                    let gParentNode = path[2];

                    let parentIdx = gParentNode.children.indexOf(parentNode);
                    let selectedIdx = parentNode.children.indexOf(selectedNode);
                    let theOtherNode = parentNode.children[(selectedIdx + 1) % 2];
                    gParentNode.children[parentIdx] = theOtherNode;
                }
                else if (path.length === 2) {
                    let selectedNode = path[0];
                    let parentNode = path[1];
                    let selectedIdx = parentNode.children.indexOf(selectedNode);
                    let theOtherNode = parentNode.children[(selectedIdx + 1) % 2];
                    self.conditionTree = theOtherNode;
                }
                else if (path.length === 1) {
                    self.conditionTree = null;
                }
                else {
                    errorMessageDialog(ModalService, "Never happen!!");
                }
                self.conditionExpr = parse(self.conditionTree);
            }
        }

        this.onApplyButtonClicked = function () {
            console.log('Apply');
            if(self.props.idHistogram){
                let payload = {
                    discriminator: self.conditionTree,
                    idHistogram: self.props.idHistogram
                }
                wiApiService.editHistogram(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                })
            }else if (self.props.idCrossPlot){
                let payload = {
                    discriminator: self.conditionTree,
                    idCrossPlot: self.props.idCrossPlot,
                    idWell: self.props.idWell
                }
                wiApiService.editCrossplot(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                })
            }else{
                errorMessageDialog(ModalService, 'LOI ROI');
            }
        }

        this.onOKButtonClicked = function () {
            console.log('OK');
            if(self.props.idHistogram){
                let payload = {
                    discriminator: self.conditionTree,
                    idHistogram: self.props.idHistogram
                }
                wiApiService.editHistogram(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                    close(null);
                })
            }else if (self.props.idCrossPlot){
                let payload = {
                    discriminator: self.conditionTree,
                    idCrossPlot: self.props.idCrossPlot,
                    idWell: self.props.idWell
                }
                wiApiService.editCrossplot(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                    close(null);
                })
            }else{
                errorMessageDialog(ModalService, 'LOI ROI');
            }
        }

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'discriminator/discriminator-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
        })
    })
}


exports.ternaryDialog = function (ModalService, wiD3CrossplotCtrl, callback){

    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        let change = $scope.change = {
            unchanged: 0,
            created: 1,
            updated: 2,
            deleted: 3,
            uncreated: 4
        };

        $scope.selectDataSetting = {
            showCheckAll: false,
            showUncheckAll: false,
            displayProp: 'id',
            checkBoxes: true
        };
        $scope.result = {}
        this.idPolygonTest = [];
        let viCrossplot = wiD3CrossplotCtrl.getViCrossplot();
        let props = angular.copy(viCrossplot.getProperties());
        let ternary = this.ternary = props.ternary;

        this.vertices = ternary.vertices.map(function(vertex, index) {
            vertex.change = change.unchanged;
            vertex.index = index;
            return vertex;
        });
        this.modelData = [];
        this.optionsData = [1, 2, 3];
        let savedTernary = angular.copy(ternary);

        if (!this.vertices || !this.vertices.length) {
            this.__idx = null;
            $scope.selectedRow = null;
        }
        else {
            this.__idx = 0;
            $scope.selectedRow = 0;
        }
        let calculateOptions = $scope.calculateOptions = ternary.calculate;

        this.polygonList = new Array();
        props.polygons.forEach(function(polygonItem, index) {
            self.polygonList.push({
                idx: index + 1,
                value: polygonItem.idPolygon,
                bgColor: polygonItem.lineStyle
            });
        });

        this.getVertices = function () {
            return self.vertices.filter(function (item, index) {
               return (item.change != change.deleted && item.change != change.uncreated);
           });
        };

        this.getTernaryVertices = function() {
            return self.getVertices().filter(function(item) {
                return item.used;
            })
        }

        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getVertices()[indexRow].index;
        };

        this.onChange = function (index) {
            if(self.vertices[index] && self.vertices[index].change == change.unchanged)
                self.vertices[index].change = change.updated;
        };

        this.removeRow = function () {
            if (!self.vertices[self.__idx]) return;
            if (self.vertices[self.__idx].change == change.created) {
                self.vertices[self.__idx].change = change.uncreated;
            }
            else {
                self.vertices[self.__idx].change = change.deleted;
            }
            if (self.getVertices().length) {
                self.setClickedRow(0);
            }
            viCrossplot.setProperties({
                ternary: { vertices: self.getVertices() }
            });
            viCrossplot.plotTernary();
        };

        this.addRow = function () {
            self.vertices.push({
                change: change.created,
                index: self.vertices.length,
                style: 'Circle',
                showed: true,
                name: 'Material_' + (self.vertices.length + 1),
            });
            self.setClickedRow(self.getVertices().length - 1);
        };

        this.pickVertex = function () {
            $('#ternary-modal').modal('hide');
            let idx = $scope.selectedRow;
            viCrossplot.setProperties({
                ternary: {
                    vertices: self.getVertices()
                }
            })
            wiD3CrossplotCtrl.pickVertex(idx, function(vertex) {
                $('#ternary-modal').modal('show');
                vertex = angular.copy(vertex);

                if (idx == null) {
                    vertex.name = 'Material_' + (self.vertices.length + 1);
                    viCrossplot.plotTernary();
                    vertex.change = change.created;
                    vertex.index = self.vertices.length;
                    self.vertices.push(vertex);
                }
                else {
                    if (self.vertices[self.__idx].change == change.unchanged)
                        vertex.change = change.updated;
                    else
                        vertex.change = change.created;
                    vertex.index = self.vertices[self.__idx].index;
                    self.vertices[self.__idx] = vertex;
                }
                $scope.$apply();
                viCrossplot.onMouseDown(wiD3CrossplotCtrl.viCrossplotMouseDownCallback);
            });
        };

        this.pickPoint = function () {
            $('#ternary-modal').modal('hide');
            wiD3CrossplotCtrl.pickPoint(function(point) {
                $('#ternary-modal').modal('show');
                if (point) {
                    calculateOptions.point = point;
                    $scope.$apply();
                }
                viCrossplot.onMouseDown(wiD3CrossplotCtrl.viCrossplotMouseDownCallback);
            });
        };

        this.importVertices = function () {
            utils.error('Not yet implemented')
        };

        this.exportVertices = function () {
            utils.error('Not yet implemented')
        };

        function setVertices(callback) {
            async.eachOfSeries(self.vertices, function(vertex, idx, cb){
                vertex = self.vertices[idx];
                let data = {
                    xValue: vertex.x,
                    yValue: vertex.y,
                    name: vertex.name,
                    style: vertex.style,
                    usedIn: vertex.used,
                    show: vertex.showed,
                    idTernary: vertex.idVertex,
                    idCrossPlot: props.idCrossPlot
                };

                switch(self.vertices[idx].change) {
                    case change.created:
                        wiApiService.createTernary(data, function(response) {
                            self.vertices[idx].change = change.unchanged;
                            self.vertices[idx].idVertex = response.idTernary;
                            cb();
                        });
                        break;
                    case change.updated:
                        wiApiService.editTernary(data, function(response) {
                            self.vertices[idx].change = change.unchanged;
                            cb();
                        });
                        break;
                    case change.deleted:
                        wiApiService.removeTernary(self.vertices[idx].idVertex, function(response) {
                            cb();
                        });
                        break;
                    default:
                        cb();
                }
            }, function() {
                for (let i = self.vertices.length - 1; i >= 0; i--){
                    if (self.vertices[i].change == change.deleted) {
                        self.vertices.splice(i, 1);
                    }
                }
                savedTernary.vertices = self.getVertices();
                savedTernary.calculate = calculateOptions;
                viCrossplot.setProperties({ ternary: savedTernary });
                viCrossplot.plotTernary();
                if (callback) callback();
            });
        }

        this.onCalculateButtonClicked = function () {
            let tmpTernary = {
                idTernary: savedTernary.idTernary,
                vertices: self.getVertices(),
                calculate: calculateOptions
            };
            viCrossplot.setProperties({ ternary: tmpTernary });
            let result = viCrossplot.calculateTernary();
            if (result.error)
                utils.error(result.error);
            else
                $scope.result = result;
        }

        this.onOkButtonClicked = function () {
            setVertices(function() {
                close(null);
            })
        };
        this.onApplyButtonClicked = function(callback) {
            setVertices();
        };
        this.onCancelButtonClicked = function () {
            viCrossplot.setProperties({ ternary: savedTernary });
            viCrossplot.plotTernary();
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: "ternary/ternary-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('.modal').remove();
            $('body').removeClass('modal-open');
            if (ret && callback) callback(ret);
        });
    });
};
exports.referenceWindowsDialog = function (ModalService, well, plotModel, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let self = this;
        this._FNEW = 1;
        this._FEDIT = 2;
        this._FDEL = 3;
        var utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.props = angular.copy(plotModel.properties);
        this.ref_Curves_Arr = plotModel.properties.reference_curves?angular.copy(plotModel.properties.reference_curves):[];
        this.SelectedRefCurve = self.ref_Curves_Arr && self.ref_Curves_Arr.length ? 0: -1;
        this.well = well;
        this.datasets = [];
        this.curvesArr = [];

        this.scaleOpt = [
            {
                value: 20,
                label: '1:20'
            },
            {
                value: 50,
                label: '1:50'
            },
            {
                value: 100,
                label: '1:100'
            },
            {
                value: 200,
                label: '1:200'
            },
            {
                value: 300,
                label: '1:300'
            },
            {
                value: 500,
                label: '1:500'
            },
            {
                value: 1000,
                label: '1:1000'
            },
            {
                value: 2000,
                label: '1:2000'
            },
            {
                value: 3000,
                label: '1:3000'
            },
            {
                value: 5000,
                label: '1:5000'
            },
            {
                value: -1,
                label: 'Full'
            },
        ]
        this.well.children.forEach(function(child, i){
            switch (child.type){
                case 'dataset':
                    self.datasets.push(child);
                    break;
            }
            if (i == self.well.children.length - 1) {
                self.datasets.forEach(function (child) {
                    child.children.forEach(function (item) {
                        if (item.type == 'curve') {
                            self.curvesArr.push(item);
                        }
                    })
                });
            }
        })
        function getTopFromWell() {
            return parseFloat(self.well.properties.topDepth);
        }
        function getBottomFromWell() {
            return parseFloat(self.well.properties.bottomDepth);
        }

        this.defaultDepthButtonClick = function(){
            self.props.referenceTopDepth = getTopFromWell();
            self.props.referenceBottomDepth = getBottomFromWell();
        }

        this.chooseRefCurveColor = function(index){
            DialogUtils.colorPickerDialog(ModalService, self.ref_Curves_Arr[index].color, function (colorStr) {
                self.ref_Curves_Arr[index].color = colorStr;
            });
        }

        this.setClickedRow = function(index){
            self.SelectedRefCurve = index;
        }

        this.onRefCurveChange = function(index) {
            if(typeof self.ref_Curves_Arr[index].flag === 'undefined') {
                self.ref_Curves_Arr[index].flag = self._FEDIT;
            }
        }
        this.onSelectRefCurve = function(index, curve){
            self.ref_Curves_Arr[index].idCurve = self.ref_Curves_Arr[index].curve.idCurve;
            if(typeof self.ref_Curves_Arr[index].flag === 'undefined') {
                self.ref_Curves_Arr[index].flag = self._FEDIT;
            }
            if(curve) {
                let family = utils.findFamilyById(self.ref_Curves_Arr[index].curve.idFamily);
                if (family) {
                    self.ref_Curves_Arr[index].left = family.minScale;
                    self.ref_Curves_Arr[index].right = family.maxScale;
                    self.ref_Curves_Arr[index].color = family.lineColor;
                }
                else if(!self.ref_Curves_Arr[index].curve.minScale
                    && !self.ref_Curves_Arr[index].curve.maxScale != null ) {
                    self.ref_Curves_Arr[index].left = self.ref_Curves_Arr[index].curve.minScale;
                    self.ref_Curves_Arr[index].right = self.ref_Curves_Arr[index].curve.maxScale;
                    self.ref_Curves_Arr[index].color = 'black';
                }
                else {
                    wiApiService.scaleCurve(self.ref_Curves_Arr[index].curve.idCurve, function(scale){
                        console.log('scale curve');
                        $timeout(function(){
                            self.ref_Curves_Arr[index].left = scale.minScale;
                            self.ref_Curves_Arr[index].right = scale.maxScale;
                            self.ref_Curves_Arr[index].right = 'black';
                        });
                    })
                }

            }
        }

        this.AddRefCurve = function(){
            let newRefCurve = {
                color: "rgb(0,0,0)",
                idHistogram: self.props.idHistogram ? self.props.idHistogram : null,
                idCrossPlot: self.props.idCrossPlot ? self.props.idCrossPlot : null,
                left: 0,
                right: 0,
                visiable: true,
                log: true,
                flag: self._FNEW
            }

            self.ref_Curves_Arr.push(newRefCurve);
        }

        this.DeleteRefCurve = function($event){
            if(self.ref_Curves_Arr[self.SelectedRefCurve].flag != self._FNEW){
                self.ref_Curves_Arr[self.SelectedRefCurve].flag = self._FDEL;
            }else{
                self.ref_Curves_Arr.splice(self.SelectedRefCurve, 1);
            }
            self.SelectedRefCurve = self.SelectedRefCurve > 0 ? self.SelectedRefCurve - 1 : -1;
            $event.stopPropagation();
        }

        this.onApplyButtonClicked = function() {
            console.log("on Apply clicked");
            if(self.ref_Curves_Arr && self.ref_Curves_Arr.length) {
                async.eachOfSeries(self.ref_Curves_Arr, function(curve, idx, callback) {
                    switch(self.ref_Curves_Arr[idx].flag){
                        case self._FDEL:
                            wiApiService.removeRefCurve(self.ref_Curves_Arr[idx].idReferenceCurve, function(){
                                console.log('removeRefCurve');
                                callback();
                            });
                            break;

                        case self._FNEW:
                            wiApiService.createRefCurve(self.ref_Curves_Arr[idx], function(data){
                                self.ref_Curves_Arr[idx].idReferenceCurve = data.idReferenceCurve;
                                console.log('createRefCurve');
                                callback();
                            });
                            break;

                        case self._FEDIT:
                            wiApiService.editRefCurve(self.ref_Curves_Arr[idx], function(){
                                console.log('editRefCurve');
                                callback();
                            })
                            break;

                        default:
                            callback();
                            break;
                    }
                }, function(err) {
                    for (let i = self.ref_Curves_Arr.length - 1; i >= 0; i--) {
                        switch(self.ref_Curves_Arr[i].flag){
                            case self._FDEL:
                                self.ref_Curves_Arr.splice(i, 1);
                                break;
                            case self._FNEW:
                            case self._FEDIT:
                                delete self.ref_Curves_Arr[i].flag;
                                break;
                        }
                    }
                    console.log("plotModel:", plotModel.properties);
                    self.props.reference_curves = self.ref_Curves_Arr;
                    plotModel.properties = self.props;
                    if (callback) callback();
                });
            }
            else {
                self.props.reference_curves = self.ref_Curves_Arr;
                plotModel.properties = self.props;
            }

        }

        this.onOKButtonClicked = function () {
            self.onApplyButtonClicked();
            console.log("on OK clicked");
            close(null);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "reference-windows/reference-windows-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (!ret) return;
        })
    });
};
exports.userDefineLineDialog = function (ModalService, wiD3Crossplot, callback){
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

        let viCrossplot = wiD3Crossplot.getViCrossplot();
        this.userDefineLines = [];
        this.viCross = viCrossplot.getProperties()
        console.log("vi111", this.viCross);
        let udLinesProps = this.viCross.userDefineLines;

        udLinesProps.forEach(function(udLineItem, index) {
            udLineItem.change = change.unchanged;
            udLineItem.index = index;
            self.userDefineLines.push(udLineItem);
        });

        $scope.change = change;
        this.getUDLines = function () {
            return self.userDefineLines.filter(function (item, index) {
               return (item.change != change.deleted && item.change != change.uncreated);
           });
        }
        this.__idx = 0;
        $scope.selectedRow = 0;
        this.setClickedRow = function (indexRow) {
            $scope.selectedRow = indexRow;
            self.__idx = self.getUDLines()[indexRow].index;
        }
        this.onChange = function(index) {
            if(self.userDefineLines[index].change == change.unchanged) self.userDefineLines[index].change = change.updated;
        }
        // modal buttons
        this.removeRow = function () {
            if (!self.userDefineLines[self.__idx]) return;
            if(self.userDefineLines[self.__idx].change == change.created) {
                self.userDefineLines.splice(self.__idx, 1);
            } else {
                self.userDefineLines[self.__idx].change = change.deleted;
            }
            if (self.getUDLines().length) {
                self.setClickedRow(0);
            }
        };
        this.addRow = function () {
            self.userDefineLines.push({
                change: change.created,
                index: self.userDefineLines.length,
                lineStyle: {
                    lineColor: "blue",
                    lineWidth: 1,
                    lineStyle: [10, 0]
                },
                displayLine: true,
                displayEquation: true,
                idCrossPlot: self.viCross.idCrossPlot
            });
            console.log("addRow", self.userDefineLines);
        };
        console.log("userDefineLines", this.userDefineLines);

        this.onEditLineStyleButtonClicked = function(index) {
            console.log("onEditLineStyleButtonClicked", self.userDefineLines);

            DialogUtils.lineStyleDialog(ModalService, wiComponentService,function (lineStyleObj){
                self.userDefineLines[index].lineStyle = lineStyleObj.lineStyle;
            }, self.userDefineLines[index]);
        };
        function setUDLines(callback) {
            if(self.userDefineLines && self.userDefineLines.length) {
                async.eachOfSeries(self.userDefineLines, function(udLine, idx, callback){
                    switch(self.userDefineLines[idx].change) {
                        case change.created:
                            wiApiService.createUserDefineLine(self.userDefineLines[idx], function(response){
                                self.userDefineLines[idx].idUserDefineLine = response.idUserDefineLine;
                                console.log("create UDL", response.idUserDefineLine);
                                callback();
                            });
                            break;
                        case change.updated:
                            wiApiService.editUserDefineLine(self.userDefineLines[idx], function(){
                                console.log("update UDL");
                                callback();
                            });
                            break;
                        case change.deleted:
                            wiApiService.removeUserDefineLine(self.userDefineLines[idx].idUserDefineLine, function(){
                                console.log("delete UDL");
                                callback();
                            });
                            break;
                        default:
                            callback();
                            break;
                    }
                }, function(err) {
                    for (let i = self.userDefineLines.length - 1; i >= 0; i--){
                        switch(self.userDefineLines[i].change) {
                            case change.created:
                            case change.updated:
                                self.userDefineLines[i].change = change.unchanged;
                                break;
                            case change.deleted:
                                self.userDefineLines.splice(i, 1);
                                break;
                        }
                    }
                    self.viCross.userDefineLines = self.userDefineLines;
                    viCrossplot.setProperties({ userDefineLines: self.userDefineLines });
                    viCrossplot.plotUserDefineLines();
                    if(callback) callback();
                });
            } else {
                self.viCross.userDefineLines = self.userDefineLines;
                viCrossplot.setProperties(self.viCross)
                viCrossplot.doPlot();
                if(callback) callback();
            }
        }
        this.onOkButtonClicked = function () {
            setUDLines(function(){
                close();
            })
        };
        this.onApplyButtonClicked = function() {
            setUDLines();
        };
        this.onCancelButtonClicked = function () {
            console.log("cancel", self.regressionLines);

            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "user-define-line/user-define-line-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('.modal').remove();
            $('body').removeClass('modal-open');
            if (ret && callback) callback(ret);
        });
    });
};

exports.annotationPropertiesDialog = function (ModalService, annotationProperties, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        self.props = annotationProperties;
        this.props.left = +this.props.left.toFixed(2);
        this.props.top = +this.props.top.toFixed(2);
        this.props.bottom = +this.props.bottom.toFixed(2);
        this.props.width = +this.props.width.toFixed(2);

        this.onApplyButtonClicked = function () {
            callback(self.returnProps());
        };
        this.onOkButtonClicked = function () {
            close(self.returnProps(), 100);
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
        this.returnProps = function () {
            let props = angular.copy(self.props);
            props.textStyle = JSON.stringify(props.textStyle);
            return props;
        }
    }
    ModalService.showModal({
        templateUrl: "annotation-properties/annotation-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (data) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            if (data && callback) callback(data);
        });
    });
}

exports.curveAverageDialog = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.curveAvg = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.wells = wiExplorer.treeConfig[0].children;
        this.applyingInProgress = false;

        this.availableCurves = [];
        this.selectedCurves = [];
        this.datasets = [];
        this.calcMethod = "lateral";
        this.selectedDataset = {};
        this.idSelectedDataset = null;
        this.desCurve = null;
        self.wells = wiExplorer.treeConfig[0].children;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if( selectedNodes && selectedNodes[0].type == 'well') self.wellModel = selectedNodes[0];
        else self.wellModel = angular.copy(self.wells[0]);
        self.idWell = self.wellModel.id;
        refresh();
        this.defaultDepth = defaultDepth;
        function defaultDepth () {
            self.topDepth = parseFloat(self.wellModel.properties.topDepth);
            self.bottomDepth = parseFloat(self.wellModel.properties.bottomDepth);
        }

        this.selectWell = function(idWell) {
            self.wellModel = utils.findWellById(idWell);
            defaultDepth();
            self.availableCurves = [];
            self.datasets = [];
            getAllCurvesOnSelectWell(self.wellModel);
        };
        function getAllCurvesOnSelectWell(well) {
            well.children.forEach(function (child) {
                if (child.type == 'dataset') self.datasets.push(child);
            });
            self.datasets.forEach(function (child) {
                child.children.forEach(function (item) {
                    if (item.type == 'curve') {
                        item.properties.dataset = child.properties.name;
                        item.flag = false;
                        self.availableCurves.push(item);
                    }
                })
            });
            self.selectedDataset = self.datasets[0];
            self.desCurve = {
                idDataset: self.availableCurves[0].properties.idDataset,
                curveName: self.availableCurves[0].name,
                idDesCurve: self.availableCurves[0].id,
                data: []
            };
            console.log("curves", self.availableCurves);
        }
        this.select = function (curve) {
            curve.flag = !curve.flag;
        }

        function refresh (cb) {
            self.datasets = [];
            self.availableCurves = [];
            self.wellModel = utils.findWellById(self.idWell);
            defaultDepth();
            getAllCurvesOnSelectWell(self.wellModel);
            if(cb) cb();
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                refresh(function(){
                });
            }, 100);
        });
        function curveAverageCacl () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.topDepth < self.wellModel.properties.topDepth || self.bottomDepth > self.wellModel.properties.bottomDepth)
                dialogUtils.errorMessageDialog(ModalService, "Input invalid [" + self.wellModel.properties.topDepth + "," + self.wellModel.properties.bottomDepth+ "]" );
            let selectedCurves = [];
            let allData = [];
            let dataAvg = [];
            selectedCurves = self.availableCurves.filter(function(curve, index) {
                return (curve.flag == true);
            });
            let yTop = Math.round((
                            self.topDepth - parseFloat(self.wellModel.properties.topDepth))
                                        /parseFloat(self.wellModel.properties.step));
            let yBottom = Math.round((
                            self.bottomDepth - parseFloat(self.wellModel.properties.topDepth))
                                        /parseFloat(self.wellModel.properties.step));
            console.log("yy", yTop, yBottom);
            if(selectedCurves.length > 0){
                async.eachOfSeries(selectedCurves, function(item, idx, callback) {
                    wiApiService.dataCurve(item.id, function (dataCurve){
                        allData.push(dataCurve.map(d => d.x));
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        DialogUtils.errorMessageDialog(ModalService, err);
                    }
                    let meanData = [];
                    if(self.calcMethod == 'lateral') {
                        let len = allData[0].length;
                        for( var i = 0; i < len; i++){
                            let sum = 0;
                            let count = 0;
                            for ( let j = 0; j < allData.length; j++) {
                                if (allData[j][i] == null || isNaN(allData[j][i])) count += 1;
                                else sum += parseFloat(allData[j][i]);
                            }
                            if (count > 0) meanData.push(null);
                            else meanData.push(sum / allData.length);
                        }
                        self.desCurve.data = utils.getDataTopBottomRange(meanData, yTop, yBottom);
                    } else if (self.calcMethod == 'arithmetic') {
                        for( var i = 0; i < allData[0].length; i++){
                            let sum = 0;
                            for ( let j = 0; j < allData.length; j++) {
                                if (allData[j][i] == null || isNaN(allData[j][i])) count += 1;
                                else sum += parseFloat(allData[j][i]);
                            }
                            meanData.push(sum / (allData.length - count));
                        }
                        self.desCurve.data = utils.getDataTopBottomRange(meanData, yTop, yBottom);
                    }
                    console.log("desCurve", self.desCurve);
                    let request = {};
                    if(self.desCurve.idDesCurve) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                let request = self.desCurve;
                                delete request.curveName;
                                console.log(request);
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        console.log(request);
                        wiApiService.processingDataCurve(self.desCurve, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyInProgress = false;
                        })
                    }
                });
            } else {
                utils.refreshProjectState();
                self.applyInProgress = false;
            }
        };

        this.onRunButtonClicked = function () {
            curveAverageCacl();
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "curve-average/curve-average-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.curveRescaleDialog = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.curveRe = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
        this.curves = [];
        this.wells = wiExplorer.treeConfig[0].children;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        console.log("selectedNodes", selectedNodes);
        if( selectedNodes && selectedNodes[0].type == 'well') this.wellModel = selectedNodes[0];
        else this.wellModel = angular.copy(self.wells[0]);
        this.datasets = this.wellModel.children;
        this.curves = this.wellModel.children[0].children;
        if( selectedNodes && selectedNodes[0].type == 'curve') {
            console.log("SELECTED_NODES");
            this.curveModel = setLinePropertiesIfNull(selectedNodes[0]);
            this.wellModel = utils.findWellByCurve(self.curveModel.id);
        }
        else this.curveModel = setLinePropertiesIfNull(angular.copy(self.curves[0]));

        this.idWell = this.wellModel.id;

        self.logInput = false;


        defaultDepth();

        this.defaultDepth = defaultDepth;
        function defaultDepth () {
            self.topDepth = parseFloat(self.wellModel.properties.topDepth);
            self.bottomDepth = parseFloat(self.wellModel.properties.bottomDepth);
        }

        function setLinePropertiesIfNull (curve) {
            let resCurve = curve;
            if(resCurve.lineProperties == null) {
                let lineProperties = {
                    minScale: 0,
                    maxScale: 1
                }
                resCurve.lineProperties = lineProperties;
            }
            return resCurve;
        };

        this.outputObj = getOutput(this.curveModel);
        function getOutput (curveModel) {
            return {
                idDataset: curveModel.properties.idDataset,
                curve: curveModel.properties.name,
                unit: curveModel.properties.unit,
                leftScale: curveModel.lineProperties.minScale,
                rightScale: curveModel.lineProperties.maxScale,
                logOutput: false
            }
        }
        this.selectedWell = selectedWell;
        function selectedWell (idWell) {
            self.wellModel = utils.findWellById(idWell);
            defaultDepth();
            self.curves = self.wellModel.children[0].children;
            self.curveModel = setLinePropertiesIfNull(self.curves[0]);
            self.datasets = self.wellModel.children;
            self.logInput = false;
            self.outputObj = getOutput(self.curveModel);
        }
        this.onChangeCurve = function (curveModel) {
            self.curveModel = setLinePropertiesIfNull(curveModel);
            $timeout(function(){
                self.outputObj = getOutput(self.curveModel);
            }, 100);
        }
        this.defaultDepth = function () {
            self.topDepth = parseFloat(self.wellModel.properties.topDepth);
            self.bottomDepth = parseFloat(self.wellModel.properties.bottomDepth);
        }
        function refresh (cb) {
            self.datasets = [];
            self.availableCurves = [];
            self.wellModel = utils.findWellById(self.idWell);
            selectedWell(self.idWell);
            if(cb) cb();
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                refresh(function(){
                });
            }, 100);
        });
        function run () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.topDepth < self.wellModel.properties.topDepth ||
                self.bottomDepth > self.wellModel.properties.bottomDepth)
                dialogUtils.errorMessageDialog(ModalService, "Input invalid [" + self.wellModel.properties.topDepth + "," + self.wellModel.properties.bottomDepth+ "]" );
            let inputData = [];
            let outputData = [];
            let yTop = Math.round((
                            self.topDepth - parseFloat(self.wellModel.properties.topDepth))
                                        /parseFloat(self.wellModel.properties.step));
            let yBottom = Math.round((
                            self.bottomDepth - parseFloat(self.wellModel.properties.topDepth))
                                        /parseFloat(self.wellModel.properties.step));

            function linearToLinearX (a, b, c, y, z) {
                return (c - a) * (z - y) / (b - a) + y;
            }
            function linearToLogarithmX (a, b, c, y, z) {
                return Math.pow(Math.E, (c - a) * (Math.log(z) - Math.log(y)) / ( b- a) + Math.log(y));
            }
            function logarithmToLinearX (a, b, c, y, z) {
                return (Math.log(c) - Math.log(a)) * (z - y) / (Math.log(b) - Math.log(a)) + y
            }
            function logarithmToLogarithmX (a, b, c, y, z) {
                return Math.pow(Math.E, (Math.log(c) - Math.log(a)) * (Math.log(z) - Math.log(y)) / (Math.log(b) - Math.log(a)) + log(y));

            }
            async.parallel([
                function(callback){
                    wiApiService.dataCurve(self.curveModel.id, function (dataCurve){
                        inputData = dataCurve.map(d => parseFloat(d.x));
                        callback();
                    });
                }],
                function(err, results) {
                    let len = inputData.length;

                    for(let i = 0; i < len; i++) {
                        if (inputData[i] == null || isNaN(inputData[i])) outputData.push(NaN);
                        if (!self.logInput && !self.outputObj.logOutput) {
                            outputData.push(linearToLinearX(self.curveModel.lineProperties.minScale,
                                                            self.curveModel.lineProperties.maxScale,
                                                            inputData[i],
                                                            self.outputObj.leftScale,
                                                            self.outputObj.rightScale));
                        } else if (!self.logInput && self.outputObj.logOutput) {
                            outputData.push(linearToLogarithmX(self.curveModel.lineProperties.minScale,
                                                                self.curveModel.lineProperties.maxScale,
                                                                inputData[i],
                                                                self.outputObj.leftScale,
                                                                self.outputObj.rightScale));
                        } else if (self.logInput && !self.outputObj.logOutput) {
                            outputData.push(logarithmToLinearX(self.curveModel.lineProperties.minScale,
                                                                self.curveModel.lineProperties.maxScale,
                                                                inputData[i],
                                                                self.outputObj.leftScale,
                                                                self.outputObj.rightScale));
                        } else if (self.logInput && self.outputObj.logOutput) {
                            outputData.push(logarithmToLogarithmX(self.curveModel.lineProperties.minScale,
                                                                    self.curveModel.lineProperties.maxScale,
                                                                    inputData[i],
                                                                    self.outputObj.leftScale,
                                                                    self.outputObj.rightScale));
                        };
                    };
                    console.log("outputData", inputData, outputData);
                    let request = {
                        idDataset: self.outputObj.idDataset,
                        curveName: self.outputObj.curve,
                        unit: self.outputObj.unit,
                        idDesCurve: self.curveModel.id,
                        data: utils.getDataTopBottomRange(outputData, yTop, yBottom)
                    }
                    if(self.outputObj.curve == self.curveModel.properties.name) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                delete request.curveName;
                                delete request.unit;
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyingInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        delete request.idDesCurve;
                        if (self.curveModel.properties.idFamily)
                            request.idFamily = self.curveModel.properties.idFamily;
                        wiApiService.processingDataCurve(request, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyingInProgress = false;
                        })
                    }
                })
        }
        this.onRunButtonClicked = function () {
            run();
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "curve-rescale/curve-rescale-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.curveComrarisonDialog = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close) {
        let self = this;
        window.compa = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
        this.wells = wiExplorer.treeConfig[0].children;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.applyingInProgress = false;

        let zoneSetParaModel = {};
        let zoneArr = [];
        this.zoneSetPara = [];
        this.zones = [];
        this.curves = [];
        if( selectedNodes && selectedNodes[0].type == 'well') this.wellModel = selectedNodes[0];
        else if( selectedNodes && selectedNodes[0].type == 'zoneset') {
            this.wellModel = utils.findWellById(selectedNodes[0].properties.idWell);
            zoneSetParaModel = selectedNodes[0];
        }
        else if ( selectedNodes && selectedNodes[0].type == 'zone' ) {
            zoneSetParaModel = utils.findZoneSetById(selectedNodes[0].properties.idZoneSet);
            this.wellModel = utils.findWellById(zoneSetParaModel.properties.idWell);
        }
        else this.wellModel = angular.copy(self.wells[0]);

        this.idWell = this.wellModel.id;
        defaultDepth();
        getAllCurvesOnSelectWell(this.wellModel);
        this.checked = false;
        let style = {
            "opacity": "0.7",
            "pointer-events": "none"
        }
        this.style = style;

        this.checkUseZone = function (check) {
            self.style = check ? {} : style;
            self.zoneSetPara = self.wellModel.children[1].children;
            if (self.zoneSetPara.length) {
                self.zoneSetParaModel = Object.keys(zoneSetParaModel).length ? zoneSetParaModel : self.zoneSetPara[0];
                selectZoneSetPara(self.zoneSetParaModel);
            }
        }
        function selectZoneSetPara (zoneSetParaModel) {
            self.zones = [];
            if(Object.keys(zoneSetParaModel).length) zoneArr = zoneSetParaModel.children;
            if(Array.isArray(zoneArr) && zoneArr.length) {
                zoneArr.forEach(function(z, index) {
                    z.use = false;
                    self.zones.push(z);
                })
            }
        }
        this.selectZoneSetPara = selectZoneSetPara;
        this.defaultDepth = defaultDepth;
        function defaultDepth () {
            self.topDepth = parseFloat(self.wellModel.properties.topDepth);
            self.bottomDepth = parseFloat(self.wellModel.properties.bottomDepth);
        }

        this.selectedWell = function (idWell) {
            self.curves = [];
            self.wellModel = utils.findWellById(idWell);
            defaultDepth();
            self.idWell = self.wellModel.id;
            self.zoneSetPara = self.wellModel.children[1].children;
            self.zoneSetParaModel = self.zoneSetPara.length ? self.zoneSetPara[0] : {};
            selectZoneSetPara(self.zoneSetParaModel);
            getAllCurvesOnSelectWell(self.wellModel);
        }

        function getAllCurvesOnSelectWell(well) {
            let datasets = [];
            well.children.forEach(function (child) {
                if (child.type == 'dataset') datasets.push(child);
            });
            datasets.forEach(function (child) {
                child.children.forEach(function (item) {
                    if (item.type == 'curve') {
                        self.curves.push(item);
                    }
                })
            });
        }
        this.curvesComparison = new Array();
        for (let i = 0; i < 15; i++) {
            this.curvesComparison.push({
                curve1: null,
                curve2: null,
                difference: null,
                correlation: null
            });
        };
        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
                self.applyingInProgress = true;
            if(!self.checked && (self.topDepth < self.wellModel.properties.topDepth ||
                                self.bottomDepth > self.wellModel.properties.bottomDepth))
            {
                dialogUtils.errorMessageDialog(ModalService,
                                    "Input invalid [" + self.wellModel.properties.topDepth + "," +
                                    self.wellModel.properties.bottomDepth+ "]" );
            }


            async.each(self.curvesComparison, function(comparison, callback){
                if (comparison.curve1 && comparison.curve2) {
                    wiApiService.dataCurve(comparison.curve1.id, function(dataCurve1){
                        wiApiService.dataCurve(comparison.curve2.id, function(dataCurve2){
                            let data1 = dataCurve1.map(d => parseFloat(d.x));
                            let data2 = dataCurve2.map(d => parseFloat(d.x));
                            // console.log("data", data1);
                            function comparisonParam (start, end) {
                                let S = null;
                                let Sx = null;
                                let Sy = null;
                                let Sxy = null;
                                let Sx2 = null;
                                let Sy2 = null;
                                let yStart = Math.round((
                                                start - parseFloat(self.wellModel.properties.topDepth))
                                                        /parseFloat(self.wellModel.properties.step));
                                let yEnd = Math.round((
                                                end - parseFloat(self.wellModel.properties.topDepth))
                                                        /parseFloat(self.wellModel.properties.step));
                                let N = yEnd - yStart + 1;
                                for (let i = yStart; i <= yEnd; i++){
                                    if (data1[i] != null && !isNaN(data1[i]) &&
                                        data2[i] != null && !isNaN(data2[i])) {
                                            S += (data1[i] - data2[i]) * (data1[i] - data2[i]);
                                            Sxy += (data1[i] * data2[i]);
                                    };
                                    if (data1[i] != null && !isNaN(data1[i]) ){
                                        Sx += data1[i];
                                        Sx2 += Math.pow(data1[i], 2);
                                    };
                                    if (data2[i] != null && !isNaN(data2[i]) ){
                                        Sy += data2[i];
                                        Sy2 += Math.pow(data2[i], 2);
                                    };
                                };
                                return { S : S, Sx : Sx, Sy : Sy, Sxy : Sxy, Sx2 : Sx2, Sy2 : Sy2, N : N }
                            }
                            let len = data1.length;
                            if(!self.checked) {
                                let param = comparisonParam(self.topDepth, self.bottomDepth);
                                console.log("cpm", param, len);
                                comparison.difference = (param.S / param.N).toFixed(4);
                                comparison.correlation = ((param.N * param.Sxy - param.Sx * param.Sy) /
                                                            Math.pow((param.N * param.Sx2 - param.Sx * param.Sx) * (param.N * param.Sy2 - param.Sy * param.Sy), 0.5)).toFixed(4);
                            } else {
                                let S = null;
                                let Sx = null;
                                let Sy = null;
                                let Sxy = null;
                                let Sx2 = null;
                                let Sy2 = null;
                                let N = null;
                                let temp = 0;
                                self.zones.forEach(function (z) {
                                    if(z.use) {
                                        let p = comparisonParam(z.properties.startDepth, z.properties.endDepth);
                                        S += p.S ; Sx += p.Sx ; Sy += p.Sy ; Sxy += p.Sxy ; Sx2 += p.Sx2 ; Sy2 += p.Sy2; N += p.N;
                                        temp += 1;
                                    }
                                });
                                if(temp) {
                                    comparison.difference = (S / N).toFixed(4);
                                    comparison.correlation = ((N * Sxy - Sx * Sy) /
                                                                Math.pow((N * Sx2 - Sx * Sx) * (N * Sy2 - Sy * Sy), 0.5)).toFixed(4);
                                } else {
                                    comparison.difference = 0;
                                    comparison.correlation = 0;
                                }
                            }
                            self.applyingInProgress = false;
                            callback();
                        });
                    });
                } else {
                    self.applyingInProgress = false;
                    callback();
                };
            }, function(err){
                console.log(err);
            });
        };
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }

    ModalService.showModal({
        templateUrl: "curve-comparison/curve-comparison-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}

exports.curveConvolutionDialog = function(ModalService, isDeconvolution){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.curveCov = this;
        this.isDeconvolution = isDeconvolution;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.refresh = function(cb){
            self.project = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
            self.wellArr = self.project.children.length ? self.project.children.filter(well => { return well.children.length > 4}) : null;
            if(!self.SelectedWell){
                self.SelectedWell = self.wellArr && self.wellArr.length ? self.wellArr[0]: null;
            }else{
                self.SelectedWell = self.wellArr.find(function(well){
                    return well.id == self.SelectedWell.id;
                })
            }
            if(cb) cb();
        }
        this.refresh();
        this.datasets = [];
        this.curvesArr = [];
        this.curveData = [];
        this.onWellChanged = function(){
            if(self.SelectedWell){
                self.datasets.length = 0;
                self.curvesArr.length = 0;
                self.SelectedWell.children.forEach(function(child, i){
                    if(child.type == 'dataset')
                        self.datasets.push(child);

                    if(i == self.SelectedWell.children.length - 1){
                        async.each(self.datasets, function(child, callback){
                            async.each(child.children, function(item, cb){
                                if (item.type == 'curve') {
                                    self.curvesArr.push(item);
                                }
                                cb();
                            }, function(err){
                                callback();
                            })
                        }, function(err){
                            if(self.curvesArr.length){
                                self.inputCurve = self.curvesArr[0];
                                self.stdCurve = self.curvesArr[0];
                                self.ResultCurve = {
                                    idDataset: self.datasets[0].id,
                                    curveName: self.inputCurve.name,
                                    idDesCurve: self.inputCurve.id,
                                    unit: self.inputCurve.properties.unit,
                                    data: []
                                }
                            }else {
                                delete self.inputCurve;
                                delete self.stdCurve;
                                delete self.ResultCurve;
                            }
                        })
                    }
                })
            }
        }

        this.onWellChanged();

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                self.refresh(function(){
                    self.onWellChanged();
                });
            }, 0);
        });

        function convolution(input, kernel, out, callback){
            // check validity of params
            if(!input || !out || !kernel) callback(false);
            if(input.length < 1 || kernel.length < 1) callback(false);

            let inputF = input.filter(d => {return !isNaN(d);});
            let inputSize = input.length;
            let kernelF = kernel.filter(d => {return !isNaN(d);});
            let Size = Math.max(kernelF.length, inputF.length);
            out.length = inputSize;
            out.fill(NaN);

            async.eachOfSeries(input, (data, n, done)=>{
                if(!isNaN(input[n])){
                        out[n] = 0;
                    for(let k = 0; k < Size; k++){
                        out[n] += (inputF[k] || 0) * (kernelF[(n - k + Size)%Size] || 0);
                    }
                }
                async.setImmediate(done);
            }, function(err){
                callback(true);
            })
        }
        function calDFT(input) {
            var N = input.length;
            var arr = new Array(N);
            for (var k = 0; k < N; k++) {
                arr[k] = new math.complex(0,0);
                if(!isNaN(input[k])){
                    for (var n = 0; n < N; n++) {
                            let tmp = (-1) * ((2 * Math.PI * n * k) / N);
                            arr[k].re += Math.cos(tmp) * (input[n] || 0);
                            arr[k].im += Math.sin(tmp) * (input[n] || 0);
                        }
                }

                arr[k].re = Math.round(arr[k].re);
                arr[k].im = Math.round(arr[k].im);
            }
            return arr;
        }
        function calIDFT(input, out) {
            var N = input.length;
            var arr = new Array(N);
            for (var k = 0; k < N; k++) {
                arr[k] = new math.complex(0,0);
                for (var n = 0; n < N; n++) {
                        let tmp = ((2 * Math.PI * n * k) / N);
                        arr[k].re += Math.cos(tmp) * input[n].re;
                        arr[k].im += Math.sin(tmp) * input[n].im;
                    }

                arr[k].re = Math.round(arr[k].re)/ N;
                arr[k].im = Math.round(arr[k].im) / N;
            }
            out = arr.map(d => {return d.re + d.im * (-1)} );
        }
        function deconvolution(input, kernel, out, callback){ // need update
            // check validity of params
            if(!input || !out || !kernel) callback(false);
            if(input.length < 1 || kernel.length < 1) callback(false);

            let a_dft = calDFT(input);
            // console.log(a_dft);
            let b_dft = calDFT(kernel);
            // console.log(b_dft);
            let c = new Array(input.length);
            async.eachOfSeries(input,(data, i, done)=>{
                c[i] = math.divide(a_dft[i], b_dft[i]);
                async.setImmediate(done);
            }, function(err){
                console.log(c);
                calIDFT(c, out);
                console.log(out);
                callback(true);
            })
        }

        function saveCurve(curve){
            let payload = angular.copy(curve);
            if(curve.idDesCurve) delete payload.curveName;
            wiApiService.processingDataCurve(payload, function(){
                console.log('Curve Saved!');
                utils.refreshProjectState();
            })
        }

        function run() {
            self.curveData.length = 0;
            let curveSet = new Set();
            curveSet.add(self.inputCurve.id);
            curveSet.add(self.stdCurve.id);
            async.eachOfSeries(Array.from(curveSet), function (curve, i, done) {
                wiApiService.dataCurve(curve, function (data) {
                    let dataF = data.map(function (d) {
                        return parseFloat(d.x);
                    })
                    self.curveData.push(dataF);
                    done();
                })
            }, function (err) {
                let input = angular.copy(self.curveData[0]);
                let kernel = self.curveData.length == 1 ? angular.copy(self.curveData[0]) : angular.copy(self.curveData[1]);
                if (self.isDeconvolution) {
                    deconvolution(input, kernel, self.ResultCurve.data, function (err) {
                        if (err) {
                            // console.log(self.ResultCurve.data);
                            self.applyingInProgress = false;
                            // saveCurve(self.ResultCurve);
                        } else {
                            console.log("Deconvolution Error!");
                            self.applyingInProgress = false;
                        }
                    })
                } else {
                    convolution(input, kernel, self.ResultCurve.data, function (err) {
                        if (err) {
                            console.log(self.ResultCurve.data);
                            // self.applyingInProgress = false;
                            saveCurve(self.ResultCurve);
                        } else {
                            console.log("Convolution Error!");
                            self.applyingInProgress = false;
                        }
                    })
                }
            })
        }

        this.onRunButtonClicked = function(){
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;

            if(self.ResultCurve.idDesCurve){
                DialogUtils.confirmDialog(ModalService, "Save Curve", "Overwrite?", function(ret){
                    if(ret){
                        run();
                    }else{
                        self.applyingInProgress = false;
                    }
                })
            }else{
                run();
            }
        }

        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-convolution/curve-convolution-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.splitCurveDialog = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.split = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.process = false;

        this.disable = true;
        this.wells = wiExplorer.treeConfig[0].children;
        this.idWell; this.idCurve; this.idDataset;
        this.datasetModel;
        this.curves = [];
        this.datasets = [];
        this.topDepth; this.bottomDepth;
        this.numberSplit = 1;
        this.number = this.numberSplit;
        this.data;
        this.arrayCurve = [];
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if( selectedNodes && selectedNodes[0].type == 'well')
            this.wellModel = selectedNodes[0];
        else if( selectedNodes && selectedNodes[0].type == 'curve' ) {
            this.curveModel = selectedNodes[0];
            this.wellModel = utils.findWellByCurve(this.curveModel.id);
        }
        else {
            this.wellModel = angular.copy(self.wells[0]);
        }

        getInfo();
        pushArrayCurve();
        function getAllCurve() {
            self.datasets = [];
            self.curves = [];
            self.wellModel.children.forEach(function(child) {
                if(child.type == 'dataset') {
                    self.datasets.push(child);
                    child.children.forEach(function(item) {
                        if(item.type == 'curve')
                            self.curves.push(item);
                    });
                }
            });
        }
        function getInfo() {
            getAllCurve();
            self.idWell = self.wellModel.id;
            self.datasetModel = self.datasets[0];
            self.idDataset = self.datasetModel.id;
            self.curveModel = self.curves[0];
            self.idCurve = self.curveModel.id;
            self.topDepth = parseFloat(self.wellModel.properties.topDepth);
            self.bottomDepth = parseFloat(self.wellModel.properties.bottomDepth);
        };
        this.selectWell = function (idWell) {
            self.wellModel = utils.findWellById(idWell);
            self.curveModel = self.wellModel.children[0].children[0];
            getInfo();
            self.arrayCurve.forEach(function( curve ) {
                curve.start = self.topDepth;
                curve.end = self.bottomDepth;
            });
        }
        this.selectCurve = function (idCurve) {
            self.curveModel = utils.getCurveFromId(idCurve);
        }
        this.selectDataset = function (idDataset) {
            self.datasetModel = utils.findDatasetById(idDataset);
            self.idDataset = self.datasetModel.id;
        }
        this.changeNumberSplit = changeNumberSplit;
        function pushArrayCurve() {
            self.arrayCurve.push({
                name: null,
                start: self.topDepth,
                end: self.bottomDepth,
                data: []
            });
        }
        function changeNumberSplit (numberSplit) {
            if(self.number <= numberSplit) {
                for(var i = self.number + 1; i <= numberSplit; i++)
                    pushArrayCurve();
            } else {
                self.arrayCurve.splice(numberSplit, self.number - numberSplit);
            }
            self.number = numberSplit;
        }
        function refresh() {
            self.wellModel = utils.findWellById(self.idWell);
            getInfo();
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.process = false;
            $timeout(function(){
                refresh();
            }, 100);
        });

        function check() {
            let valid = true;
            self.arrayCurve.forEach(function(curve){
                if(curve.start > curve.end ||
                    curve.start < self.topDepth ||
                    curve.end > self.bottomDepth) valid = false;
            });
            console.log("vvv", valid);
            return valid;
        }
        this.onRunButtonClicked = function () {
            if(self.process)
                return;
            self.process = true;
            let temp = check();
            if (!temp) {
                dialogUtils.errorMessageDialog(ModalService, "Depth Start or Depth End is invalid!", function(){
                    self.process = true;
                });
            } else {
                self.arrayCurve = self.arrayCurve.filter(function(c){
                    return (c.name);
                })
                wiApiService.dataCurve(self.curveModel.id, function(dataCurve) {
                    console.log(dataCurve);

                    async.each(self.arrayCurve,function(curve, cb) {
                        dataCurve.forEach(function(data, y) {
                            let currentDept = y*parseFloat(self.wellModel.properties.step) + parseFloat(self.wellModel.properties.topDepth);

                            if(currentDept >= curve.start && currentDept <= curve.end) {
                                curve.data[y] = parseFloat(data.x);
                            }else {
                                curve.data[y] = NaN;
                            }
                        });
                        cb();
                    }, function (err) {
                        async.each(self.arrayCurve, function(curve, cb) {
                            let payload = {
                                idDataset: self.idDataset,
                                curveName: curve.name,
                                unit: self.curveModel.properties.unit,
                                data: curve.data
                            };
                            wiApiService.processingDataCurve(payload, cb);
                        }, function(err) {
                            console.log('done');
                            utils.refreshProjectState();
                            self.numberSplit = self.arrayCurve.length;
                        });
                    });
                });
            }

        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        "templateUrl": "curve-split/curve-split-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.mergeCurveDialog = function (ModalService) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.merge = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.wells = wiExplorer.treeConfig[0].children;
        this.applyingInProgress = false;

        this.availableCurves = [];
        this.selectedCurves = [];
        this.datasets = [];
        this.method = "average";
        this.selectedDataset = {};
        this.idSelectedDataset = null;
        this.desCurve = null;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if( selectedNodes && selectedNodes[0].type == 'well')
            this.wellModel = selectedNodes[0];
        else if( selectedNodes && selectedNodes[0].type == 'curve' ) {
            this.wellModel = utils.findWellByCurve(selectedNodes[0].id);
        }
        else {
            this.wellModel = angular.copy(self.wells[0]);
        }

        self.idWell = self.wellModel.id;
        refresh();
        this.defaultDepth = defaultDepth;
        function defaultDepth () {
            self.topDepth = parseFloat(self.wellModel.properties.topDepth);
            self.bottomDepth = parseFloat(self.wellModel.properties.bottomDepth);
        }

        this.selectWell = function(idWell) {
            self.wellModel = utils.findWellById(idWell);
            defaultDepth();
            self.availableCurves = [];
            self.datasets = [];
            getAllCurvesOnSelectWell(self.wellModel);
        };
        function getAllCurvesOnSelectWell(well) {
            well.children.forEach(function (child) {
                if (child.type == 'dataset') self.datasets.push(child);
            });
            self.datasets.forEach(function (child) {
                child.children.forEach(function (item) {
                    if (item.type == 'curve') {
                        item.properties.dataset = child.properties.name;
                        item.flag = false;
                        self.availableCurves.push(item);
                    }
                })
            });
            self.selectedDataset = self.datasets[0];
            self.desCurve = {
                idDataset: self.availableCurves[0].properties.idDataset,
                curveName: self.availableCurves[0].name,
                idDesCurve: self.availableCurves[0].id,
                data: []
            };
            console.log("curves", self.availableCurves);
        }
        this.select = function (curve) {
            curve.flag = !curve.flag;
        }

        function refresh () {
            self.datasets = [];
            self.availableCurves = [];
            self.wellModel = utils.findWellById(self.idWell);
            defaultDepth();
            getAllCurvesOnSelectWell(self.wellModel);
        }
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                refresh(function(){
                });
            }, 100);
        });
        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.topDepth < self.wellModel.properties.topDepth || self.bottomDepth > self.wellModel.properties.bottomDepth)
                dialogUtils.errorMessageDialog(ModalService, "Input invalid [" + self.wellModel.properties.topDepth + "," + self.wellModel.properties.bottomDepth+ "]" );
            let allData = [];
            self.selectedCurves = self.availableCurves.filter(function(curve, index) {
                return (curve.flag == true);
            });
            let yTop = Math.round((
                self.topDepth - parseFloat(self.wellModel.properties.topDepth))
                /parseFloat(self.wellModel.properties.step));
            let yBottom = Math.round((
                self.bottomDepth - parseFloat(self.wellModel.properties.topDepth))
                /parseFloat(self.wellModel.properties.step));
            console.log("yy", yTop, yBottom);
            if(self.selectedCurves.length > 0){
                async.eachOfSeries(self.selectedCurves, function(item, idx, callback) {
                    wiApiService.dataCurve(item.id, function (dataCurve){
                        allData.push(dataCurve.map(d => parseFloat(d.x)));
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        DialogUtils.errorMessageDialog(ModalService, err);
                    }
                    let dataRes = [];
                    let N = allData.length;
                    let len = allData[0].length;
                    for( var i = 0; i < len; i++){

                        function getAllX (allData) {
                            let tempArr = [];
                            let count = 0;
                            for ( let j = 0; j < N; j++) {
                                if (allData[j][i] == null || isNaN(allData[j][i])) count += 1;
                                else tempArr.push((allData[j][i]));
                            }
                            return {tempArr: tempArr, count: count };
                        }

                        switch (self.method) {
                            case "min":
                                if(!getAllX(allData).count) dataRes.push(NaN);
                                else dataRes.push(Math.min.apply(null, getAllX(allData).tempArr));
                                break;
                            case "max":
                                if(!getAllX(allData).count) dataRes.push(NaN);
                                else dataRes.push(Math.max.apply(null, getAllX(allData).tempArr));
                                break;
                            case "average":
                                if(!getAllX(allData).count) dataRes.push(NaN);
                                else dataRes.push(((getAllX(allData).tempArr).reduce((a, b) => a + b, 0)) / N);
                                break;
                            case "sum":
                                if(!getAllX(allData).count) dataRes.push(NaN);
                                else dataRes.push((getAllX(allData).tempArr).reduce((a, b) => a + b, 0));
                                break;
                            default:
                                break;
                        }
                    }
                    console.log("desCurve", dataRes );
                    self.desCurve.data = utils.getDataTopBottomRange(dataRes, yTop, yBottom);
                    let request = {};
                    if(self.desCurve.idDesCurve) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                let request = self.desCurve;
                                delete request.curveName;
                                console.log("req", request);
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        let request = self.desCurve;
                        delete request.idDesCurve;
                        console.log("req", request);
                        wiApiService.processingDataCurve(request, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyInProgress = false;
                        })
                    }
                });
            } else {
                utils.refreshProjectState();
                self.applyInProgress = false;
            }
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };
    }
    ModalService.showModal({
        templateUrl: "curve-merge/curve-merge-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.fillDataGapsDialog = function(ModalService){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.filldata = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        function refresh(cb) {
            self.project = angular.copy(wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0]);
            self.wells = self.project.children.length ? self.project.children.filter(well => { return well.children.length > 4}) : null;
            if(!self.selectedWell){
                self.selectedWell = self.wells && self.wells.length ? self.wells[0]: null;

            }else {
                self.selectedWell = self.wells.find(function (well) {
                    return well.id == self.selectedWell.id;
                })
            }
            self.CurvesData = new Array();
            if(cb) cb();
        }
        refresh();
        this.gapsMaximum = 3;
        this.calcMethod = 'sample';
        this.suffix = '_fg';
        this.datasets =[];
        this.curves = [];
        this.getCurveData = function () {
            let curveModel = self.CurvesData.find(curve => {return curve.id == self.SelectedCurve.id;});
            if(curveModel){
                self.Nullnumber = curveModel.data.filter(d => {return isNaN(d.x);}).length;
            }else{
                wiApiService.dataCurve(self.SelectedCurve.id,function (data) {
                    self.CurvesData.push({
                        id: self.SelectedCurve.id,
                        data: data
                    });
                    self.Nullnumber = data.filter(d => { return isNaN(d.x);}).length;
                })
            }
             self.curveName = self.SelectedCurve.properties.name;
         }
        this.onWellChange = function () {
            self.datasets.length = 0;
            self.curves.length = 0;
            if(self.selectedWell){
                this.selectedWell.children.forEach(function(child,i) {
                    if(child.type == 'dataset')
                       self.datasets.push(child);
                   if(i == self.selectedWell.children.length - 1){
                       self.datasets.forEach(function (child) {
                           child.children.forEach(function (item) {
                               if (item.type == 'curve') {
                                   let d = item;
                                   d.flag = false;
                                   d.overwrite = false;
                                   self.curves.push(d);
                               }
                           })
                       });
                   }
                })
                self.topDepth = parseFloat(self.selectedWell.properties.topDepth);
                self.bottomDepth = parseFloat(self.selectedWell.properties.bottomDepth);
                self.SelectedCurve = self.curves[0];
                self.selectedDataset = self.datasets[0];
                this.getCurveData();
                self.curveName = self.SelectedCurve.properties.name;
            }
        }

        this.onWellChange();
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                refresh(function(){
                    self.onWellChange();
                });
            }, 0);
        });
        this.clickDefault = function () {
            self.topDepth = parseFloat(self.selectedWell.properties.topDepth);
            self.bottomDepth = parseFloat(self.selectedWell.properties.bottomDepth);
        }

        this.checked = false;
        this.select = function (curve) {
            curve.flag = !curve.flag;
        }
        this.checkAll = function () {
            self.checked = !self.checked;
            self.curves.forEach(function (curve) {
               curve.flag = self.checked;
            })
        }
        this.CurveF = function(curve){
            return !(curve.name == self.SelectedCurve.name && curve.datasetName == self.SelectedCurve.datasetName);
        }

        function visit(node, data, start, visitedPath, max){
            if(!node || isNaN(start.x)) return false;
            visitedPath.push(node);

            if(!isNaN(node.x)){
                return true;
            }else{
                let i = parseInt(node.y) - parseInt(start.y) + 1;
                while(i <= max){
                    if(visit(data[parseInt(start.y) + i], data, start,visitedPath, max)){
                        return true;
                    }
                    visitedPath.pop();
                    i++;
                }
            }
            return false;
        }
        function processing(data, callback){
            async.eachOf(data, function(d, i, cb){
                if(isNaN(data[i].x) && i != 0 && i != data.length - 1){
                    let start = data[i - 1];
                    let path = new Array();
                    let retVal = visit(data[i], data, start, path, self.maxgaps);
                    if(retVal){
                        let end = path[path.length - 1];
                        let mean = (parseFloat(end.x) - parseFloat(start.x))/path.length;
                        for(let j = 0; j < path.length - 1; j++){
                            index = parseInt(path[j].y);
                            data[index].x = (parseFloat(data[index - 1].x) + mean).toString();
                        }
                    }
                }
                cb();
            }, function(err){
                if(callback) callback();
            })
        }

        function processing2(curve, data, callback){
            processing(data, function(){
                let payload = {
                    idDataset: self.selectedDataset.id,
                    curveName: curve.name + self.suffix,
                    unit: curve.properties.unit,
                    idDesCurve: curve.id,
                    data: data.map(d => {return parseFloat(d.x);})
                }
                if(curve.overwrite) delete payload.curveName;
                wiApiService.processingDataCurve(payload, function(){
                    console.log("Save curve: ", payload.curveName);
                    callback();
                })
            })
        }
        function run(){
            let step = parseFloat(self.selectedWell.properties.step);
            self.maxgaps = self.calcMethod == 'sample' ? self.gapsMaximum : (self.gapsMaximum/step);
            let data = self.CurvesData.find(d => {return d.id == self.SelectedCurve.id;}).data;
            processing(data, function(){
                let payload = {
                    idDataset: self.selectedDataset.id,
                    curveName: self.curveName + self.suffix,
                    unit: self.SelectedCurve.properties.unit,
                    idDesCurve: self.SelectedCurve.id,
                    data: data.map(d => {return parseFloat(d.x);})
                }
                if(self.overwriteSelCurve){
                    delete payload.curveName;
                }
                wiApiService.processingDataCurve(payload, function(){
                    console.log("Save curve: ", payload.curveName);
                    if(self.otherCurves.length){
                        async.each(self.otherCurves, function(curve, cb){
                            let curveModel = self.CurvesData.find(d => {return d.id == curve.id;});
                            if(curveModel){
                                let data = curveModel.data;
                                processing2(curve, data, cb);
                            }else{
                                wiApiService.dataCurve(curve.id, function(dataCurve){
                                    let data = dataCurve;
                                    processing2(curve, data, cb);
                                })
                            }
                        }, function(err){
                            console.log('Done processing other curves');
                            utils.refreshProjectState();
                        })

                    }else{
                        console.log('No other curves!');
                        utils.refreshProjectState();
                    }
                })

            });
        }
        function validate(){
            self.otherCurves = self.curves.filter(curve => {return curve.flag == true;});
            if(self.otherCurves.length){
                async.each(self.otherCurves, (curve, cb) => {
                    let newName = curve.name + self.suffix;
                    let curveModel = self.otherCurves.find(c => {
                        return c.name == newName && self.selectedDataset.id == curve.properties.idDataset;
                    })
                    if(curveModel) {
                        curve.overwrite = true;
                    }
                    cb();
                }, function(err){
                    let ovw = self.otherCurves.filter(curve => {
                        return curve.overwrite == true;
                    })
                    if(ovw.length) return true;
                })
            }
            self.overwriteSelCurve = self.curves.find(c => {
                return c.name == self.curveName + self.suffix && self.selectedDataset.id == c.properties.idDataset;
            })
            if(self.overwriteSelCurve){
                return true;
            }
            return false;
        }

        this.onRunButtonClicked = function(){
            if(self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(validate()){
                DialogUtils.confirmDialog(ModalService, "Save Curves", "Overwrite?", function(ret){
                    if(ret){
                        run();
                    }else{
                        self.applyingInProgress = false;
                    }
                })
            }else{
                run();
            }
        }
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "fill-data-gaps/fill-data-gaps-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.curveDerivativeDialog = function(ModalService){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.DERI = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.refresh = function (cb) {
            self.project = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
            self.wells = self.project.children.length ? self.project.children.filter(well => { return well.children.length > 4}) : null;
            if(!self.selectedWell){
                self.selectedWell = self.wells && self.wells.length ? self.wells[0]: null;

            }else {
                self.selectedWell = self.wells.find(function (well) {
                    return well.id == self.selectedWell.id;
                })
            }
            if(cb) cb();
        }
        this.refresh();
        this.datasets =[];
        this.curves = [];
        this.checked = false;
        this.curveData = [];
        this.onWellChange = function () {
            self.datasets.length = 0;
            self.curves.length = 0;
            if(self.selectedWell){
                this.selectedWell.children.forEach(function (child, i) {
                    if (child.type == 'dataset')
                        self.datasets.push(child);
                    if (i == self.selectedWell.children.length - 1) {
                        self.datasets.forEach(function (child) {
                            child.children.forEach(function (item) {
                                if (item.type == 'curve') {
                                    self.curves.push(item);
                                }
                            })
                        });
                    }
                })
                self.topDepth = parseFloat(self.selectedWell.properties.topDepth);
                self.bottomDepth = parseFloat(self.selectedWell.properties.bottomDepth);
                if (self.curves.length) {
                    self.SelectedCurve = self.curves[0];
                    self.selectedDataset = self.datasets[0].id;
                    self.firstCurve = {
                        idDataset: self.selectedDataset,
                        curveName: self.SelectedCurve.name,
                        idDesCurve: self.SelectedCurve.properties.idDataset != self.selectedDataset ? null: self.SelectedCurve.id,
                        unit: self.SelectedCurve.properties.unit,
                        data: []
                    }
                    self.secondCurve = {
                        idDataset: self.selectedDataset,
                        curveName: self.SelectedCurve.name,
                        idDesCurve: self.SelectedCurve.properties.idDataset != self.selectedDataset ? null: self.SelectedCurve.id,
                        unit: self.SelectedCurve.properties.unit,
                        data: []
                    }
                }else {
                    delete self.firstCurve;
                    delete self.secondCurve;
                    delete self.SelectedCurve;
                    delete self.selectedDataset;
                }
            }
        }
        this.onWellChange();
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                self.refresh(function(){
                    self.onWellChange();
                });
            }, 0);
        });

        this.onDatasetChange = function(){
            self.firstCurve.idDataset = self.selectedDataset;
            self.secondCurve.idDataset = self.selectedDataset;
        }

        function saveCurve(curve, reload, cb){
            let payload = angular.copy(curve);
            if(curve.idDesCurve) delete payload.curveName;
                wiApiService.processingDataCurve(payload, function(){
                    console.log('Curve Saved!');
                    if(reload) utils.refreshProjectState();
                    if(cb) cb();
                })
        }

        this.validate = function(){
            if(self.applyingInProgress) return true;

            if(self.topDepth == null || self.bottomDepth == null || self.topDepth > self.bottomDepth){
                return true;
            }
            if ((self.firstCurve && self.firstCurve.curveName == '') || typeof self.firstCurve == 'undefined') {
                return true;
            }

            if (self.checked) {
                if ((self.secondCurve && self.secondCurve.curveName == '') || typeof self.secondCurve == 'undefined') {
                    return true;
                }
                if(self.firstCurve.curveName == self.secondCurve.curveName) return true;
            }
        }
        this.clickDefault = function () {
            self.topDepth = parseFloat(self.selectedWell.properties.topDepth);
            self.bottomDepth = parseFloat(self.selectedWell.properties.bottomDepth);
        }

        function derivative(input){
            let out = new Array(input.length).fill(NaN);
            for(let i = 0; i < input.length - 1; i++){
                let step = parseFloat(self.selectedWell.properties.step);
                let currentDepth = i * step + parseFloat(self.selectedWell.properties.topDepth);
                if(currentDepth >= self.topDepth && currentDepth <= self.bottomDepth)
                    out[i] = (input[i + 1] - input[i])/step;
            }
            return out;
        }

        function processing(){
            self.firstCurve.data = derivative(self.curveData);
            if(self.checked){
                saveCurve(self.firstCurve, false, processing2);
            }else{
                saveCurve(self.firstCurve, true);
            }
        }

        function processing2(){
            self.secondCurve.data = derivative(self.firstCurve.data);
            saveCurve(self.secondCurve, true);
        }

        function run(){
            if(!self.lastCurve || self.lastCurve != self.SelectedCurve.id){
                self.lastCurve = self.SelectedCurve.id;
                wiApiService.dataCurve(self.SelectedCurve.id, function(data){
                    self.curveData = data.map(d => {return d.x;});
                    processing();
                })
            }else{
                processing();
            }
        }

        this.onRunButtonClicked = function(){
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;

            if(self.firstCurve.idDesCurve || (self.checked && self.secondCurve.idDesCurve)){
                DialogUtils.confirmDialog(ModalService, "Save Curves", "Overwrite?", function(ret){
                    if(ret){
                        run();
                    }else{
                        self.applyingInProgress = false;
                    }
                })
            }else{
                run();
            }
        }

        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-derivative/curve-derivative-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.TVDConversionDialog = function (ModalService) {
    function ModalController(wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.tvd = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        this.wells = angular.copy(wiExplorer.treeConfig[0].children);
        this.datasets = [];
        this.curvesArr = [];
        this.step;this.topDepth; this.bottomDepth;
        this.SelectedWell; this.SelectedDataset;
        this.useType = 'file';
        this.startData = 2, this.colDepth = 1, this.colDev = 2, this.colAzi = 3;
        this.tvdMethod = 'off', this.calMethod = '1';
        this.elevation = 0, this.xRef = 0, this.yRef = 0;
        this.input = [];
        this.curvesData = [];

        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
        if(selectedNodes && selectedNodes.length){
            switch (selectedNodes[0].type){
                case 'well':
                self.SelectedWell = selectedNodes[0];
                break;

                case 'dataset':
                self.SelectedWell = utils.findWellById(selectedNodes[0].properties.idWell);
                break;

                case 'curve':
                self.SelectedWell = utils.findWellByCurve(selectedNodes[0].id);
                break;

                default:
                self.SelectedWell = self.wells && self.wells.length ? self.wells[0] : null;
            }
        }
        else {
            self.SelectedWell = self.wells && self.wells.length ? self.wells[0] : null;
        }

        function getDatasets() {
            self.datasets.length = 0;
            self.curvesArr.length = 0;
            if(self.SelectedWell && self.SelectedWell.children.length){
                self.SelectedWell.children.forEach(function (child, i) {
                    if (child.type == 'dataset')
                        self.datasets.push(child);
                    if(i == self.SelectedWell.children.length - 1){
                        if(self.datasets.length){
                            self.SelectedDataset = self.datasets[0];
                            self.datasets.forEach(child => {
                                child.children.forEach(function (item) {
                                    if (item.type == 'curve') {
                                        self.curvesArr.push(item);
                                    }
                                })
                            })
                        }
                    }
                });
            }
        }

        this.onChangeWell = function () {
            getDatasets();
            // if(self.curvesArr.length){
                self.DevCurve = null;
                self.AziCurve = null;
            // }
            self.step = parseFloat(self.SelectedWell.properties.step);
            self.topDepth = parseFloat(self.SelectedWell.properties.topDepth);
            self.bottomDepth = parseFloat(self.SelectedWell.properties.bottomDepth);
            self.tvdRef = parseFloat(self.SelectedWell.properties.topDepth);
            let length = Math.round((self.bottomDepth - self.topDepth)/self.step) + 1;
            self.FullSize = new Array(length);
            for(let i = 0; i < length; i++){
                self.FullSize[i] = parseFloat((self.step * i + self.topDepth).toFixed(4));
            }
            self.outdevArr = new Array(length);
            self.outaziArr = new Array(length);
            self.outtvdArr = new Array(length);
            self.outtvdssArr = new Array(length);
            self.outnorthArr = new Array(length);
            self.outeastArr = new Array(length);
            self.outxArr = new Array(length);
            self.outyArr = new Array(length);
        }
        this.onChangeWell();
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                self.wells = angular.copy(wiExplorer.treeConfig[0].children);
                self.onChangeWell();
            }, 0);
        });
        this.loadFile = function(){
            if(self.SurveyFile){
                self.input.length = 0;
                if(self.SurveyFile.type.match('text')){
                    let reader = new FileReader();
                    reader.onload = function(event){
                        let lines = this.result.split('\n');
                        let max = -1;
                        for(let i = 0; i < lines.length; i++){
                            let ele = lines[i].replace(/\(|\)/g,'').replace(/ /g, '').split(/\s+/);
                            if(i > 0) ele.pop();
                            max = max > ele.length ? max : ele.length;
                            if(ele.length) self.input.push(ele);
                        }
                        self.input.forEach(function(d){
                            d.length = max;
                        })
                    }
                    reader.readAsText(self.SurveyFile);
                }else{
                    utils.error('Supported text file(.txt) only!');
                    delete self.SurveyFile;
                }
            }
        }
        this.loadCurves = function(){
            function loadAzi(){
                if(self.AziCurve){
                    let azi = self.curvesData.find(curve => {return curve.id == self.AziCurve.id});
                    if(azi){
                        self.aziArr = azi.data;
                    }else{
                        wiApiService.dataCurve(self.AziCurve.id, function(dataCurve){
                            let data = dataCurve.map(d => {return parseFloat(d.x);});
                            self.curvesData.push({
                                id: self.AziCurve.id,
                                data: data
                            })
                            self.aziArr = data;
                        })
                    }
                }
            }
            if(self.DevCurve){
                let dev = self.curvesData.find(curve => {return curve.id == self.DevCurve.id});
                if(dev){
                    self.devArr = dev.data;
                    loadAzi();
                }else{
                    wiApiService.dataCurve(self.DevCurve.id, function(dataCurve){
                        let data = dataCurve.map(d => {return parseFloat(d.x);});
                        self.curvesData.push({
                            id: self.DevCurve.id,
                            data: data
                        })
                        self.devArr = data;
                        loadAzi();
                    })
                }
            }
        }

        function calcOutput(){
            if(self.useType == 'file'){
                console.log('interpolation begin');
                for(let i = 0; i < self.Size.length - 1; i++){
                    let top = self.depthArr[i];
                    let bottom = self.depthArr[i + 1];
                    for(let j = 0; j < self.FullSize.length; j++){
                        if(self.FullSize[j] == top){
                            self.outtvdArr[j] = self.tvdArr[i];
                            self.outtvdssArr[j] = self.tvdssArr[i];
                            self.outdevArr[j] = self.devArr[i];
                            self.outaziArr[j] = self.aziArr[i];
                            self.outnorthArr[j] = self.northArr[i];
                            self.outeastArr[j] = self.eastArr[i];
                            self.outxArr[j] = self.xArr[i];
                            self.outyArr[j] = self.yArr[i];
                        }else if (self.FullSize[j] == bottom){
                            self.outtvdArr[j] = self.tvdArr[i + 1];
                            self.outtvdssArr[j] = self.tvdssArr[i + 1];
                            self.outdevArr[j] = self.devArr[i + 1];
                            self.outaziArr[j] = self.aziArr[i + 1];
                            self.outnorthArr[j] = self.northArr[i + 1];
                            self.outeastArr[j] = self.eastArr[i + 1];
                            self.outxArr[j] = self.xArr[i + 1];
                            self.outyArr[j] = self.yArr[i + 1];
                        }else if(self.FullSize[j] > top && self.FullSize[j] < bottom){
                            let y = (self.FullSize[j] - top)/(bottom - top);
                            self.outtvdArr[j] = parseFloat((self.tvdArr[i] + (self.tvdArr[i + 1] - self.tvdArr[i]) * y).toFixed(6));
                            self.outtvdssArr[j] = parseFloat((self.tvdssArr[i] + (self.tvdssArr[i + 1] - self.tvdssArr[i]) * y).toFixed(6));
                            self.outdevArr[j] = parseFloat((self.devArr[i] + (self.devArr[i + 1] - self.devArr[i]) * y).toFixed(6));
                            self.outaziArr[j] = parseFloat((self.aziArr[i] + (self.aziArr[i + 1] - self.aziArr[i]) * y).toFixed(6));
                            self.outnorthArr[j] = parseFloat((self.northArr[i] + (self.northArr[i + 1] - self.northArr[i]) * y).toFixed(6));
                            self.outeastArr[j] = parseFloat((self.eastArr[i] + (self.eastArr[i + 1] - self.eastArr[i]) * y).toFixed(6));
                            self.outxArr[j] = parseFloat((self.xArr[i] + (self.xArr[i + 1] - self.xArr[i]) * y).toFixed(6));
                            self.outyArr[j] = parseFloat((self.yArr[i] + (self.yArr[i + 1] - self.yArr[i]) * y).toFixed(6));
                        }
                    }
                }
                if(self.depthArr[self.depthArr.length - 1] < self.FullSize[self.FullSize.length - 1]){
                    let top = self.depthArr.length - 2;
                    let bottom = self.depthArr.length - 1;
                    let init = parseInt(self.depthArr[self.depthArr.length - 1] - self.topDepth/self.step);
                    for(let j = init + 1; j < self.FullSize.length; j++){
                        let y = (self.FullSize[j] - self.depthArr[top])/(self.depthArr[bottom] - self.depthArr[top]);
                        self.outtvdArr[j] = parseFloat((self.tvdArr[top] + (self.tvdArr[bottom] - self.tvdArr[top]) * y).toFixed(6));
                        self.outtvdssArr[j] = parseFloat((self.tvdssArr[top] + (self.tvdssArr[bottom] - self.tvdssArr[top]) * y).toFixed(6));
                        self.outdevArr[j] = parseFloat((self.devArr[top] + (self.devArr[bottom] - self.devArr[top]) * y).toFixed(6));
                        self.outaziArr[j] = parseFloat((self.aziArr[top] + (self.aziArr[bottom] - self.aziArr[top]) * y).toFixed(6));
                        self.outnorthArr[j] = parseFloat((self.northArr[top] + (self.northArr[bottom] - self.northArr[top]) * y).toFixed(6));
                        self.outeastArr[j] = parseFloat((self.eastArr[top] + (self.eastArr[bottom] - self.eastArr[top]) * y).toFixed(6));
                        self.outxArr[j] = parseFloat((self.xArr[top] + (self.xArr[bottom] - self.xArr[top]) * y).toFixed(6));
                        self.outyArr[j] = parseFloat((self.yArr[top] + (self.yArr[bottom] - self.yArr[top]) * y).toFixed(6));
                    }
                }
            }else{
                self.outtvdArr = self.tvdArr;
                self.outtvdssArr = self.tvdssArr;
                self.outdevArr = self.devArr;
                self.outaziArr = self.aziArr;
                self.outnorthArr = self.northArr;
                self.outeastArr = self.eastArr;
                self.outxArr = self.xArr;
                self.outyArr = self.yArr;
            }
        }

        function formula1(){
            console.log('Average Angle');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev = ((self.devArr[i - 1] + self.devArr[i])/2) * Math.PI / 180 ;
                let azi = ((self.aziArr[i - 1] + self.aziArr[i])/2) * Math.PI / 180;
                let n = md * Math.sin(dev) * Math.cos(azi);
                let e = md * Math.sin(dev) * Math.sin(azi);
                let tvd = md * Math.cos(dev);

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});                
            }
            calcOutput();
        }
        function formula2(){
            console.log('Balanced Tangential');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev1 = self.devArr[i - 1] * Math.PI / 180 ;
                let dev2 = self.devArr[i] * Math.PI / 180 ;
                let azi1 = self.aziArr[i - 1] * Math.PI / 180;
                let azi2 = self.aziArr[i] * Math.PI / 180;
                let n = md/2 * (Math.sin(dev1) * Math.cos(azi1) + Math.sin(dev2) * Math.cos(azi2));
                let e = md/2 * (Math.sin(dev1) * Math.sin(azi1) + Math.sin(dev2) * Math.sin(azi2));
                let tvd = md/2 * (Math.cos(dev1) + Math.cos(dev2));

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});                
            }
            calcOutput();            
        }
        function formula3(){
            console.log('Radius Curvature');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev1 = self.devArr[i - 1] * Math.PI / 180 ;
                let dev2 = self.devArr[i] * Math.PI / 180 ;
                let azi1 = self.aziArr[i - 1] * Math.PI / 180;
                let azi2 = self.aziArr[i] * Math.PI / 180;
                let n = md * (Math.cos(dev1) - Math.cos(dev2)) * (Math.sin(azi2) - Math.sin(azi1)) * Math.pow(180/Math.PI, 2)/((self.devArr[i] - self.devArr[i - 1])*(self.aziArr[i] - self.aziArr[i - 1]));
                let e = md * (Math.cos(dev1) - Math.cos(dev2)) * (Math.cos(azi1) - Math.cos(azi2)) * Math.pow(180/Math.PI, 2)/((self.devArr[i] - self.devArr[i - 1])*(self.aziArr[i] - self.aziArr[i - 1]));
                let tvd = md * (Math.sin(dev2) - Math.sin(dev1)) * (180/Math.PI) /(self.devArr[i] - self.devArr[i - 1]);

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});                
            }
            calcOutput();            
        }
        function formula4(){
            console.log('Minimum Curvature');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev1 = self.devArr[i - 1] * Math.PI / 180 ;
                let dev2 = self.devArr[i] * Math.PI / 180 ;
                let azi1 = self.aziArr[i - 1] * Math.PI / 180;
                let azi2 = self.aziArr[i] * Math.PI / 180;
                let b = Math.acos((Math.cos(dev2 - dev1) - Math.sin(dev1) * Math.sin(dev2) * (1 - Math.cos(azi2-azi1))) * Math.PI / 180);
                let RF = 2/b * Math.tan(b/2 * Math.PI / 180);
                let n = md/2 * (Math.sin(dev1) * Math.cos(azi1) + Math.sin(dev2) * Math.cos(azi2)) * RF;
                let e = md/2 * (Math.sin(dev1) * Math.sin(azi1) + Math.sin(dev2) * Math.sin(azi2)) * RF;
                let tvd = md/2 * (Math.cos(dev1) + Math.cos(dev2)) * RF;

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});
            }
            calcOutput();            
        }

        function processing(){
            self.tvdArr[0] = self.depthArr[0];
            self.northArr[0] = 0;
            self.eastArr[0] = 0;
            self.xArr[0] = self.xRef;
            self.yArr[0] = self.yRef;
            // self.radiusArr[0] = 0;

            switch (self.calMethod){
                case '1':
                formula1();
                break;

                case '2':
                formula2();
                break;

                case '3':
                formula3();
                break;

                case '4':
                formula4();
                break;
            }
        }

        function saveCurves(){
            let names = ['TVD', 'TVDSS', 'X', 'Y', 'North', 'East', 'Deviation', 'Azimuth'];
            let curvesExist = [];
            self.curvesArr.forEach(curve => {
                if(names.indexOf(curve.name) != -1 && curve.properties.idDataset == self.SelectedDataset.id){
                    curvesExist.push(curve.name);
                }
            })

            function save(){
                let payloads = [
                    {
                        curveName: 'TVD',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outtvdArr
                },
                    {
                        curveName: 'TVDSS',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outtvdssArr
                },
                    {
                        curveName: 'X',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outxArr
                },
                    {
                        curveName: 'Y',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outyArr
                },
                    {
                        curveName: 'North',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outnorthArr
                },
                    {
                        curveName: 'East',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outeastArr
                },
                    {
                        curveName: 'Deviation',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outdevArr
                },
                    {
                        curveName: 'Azimuth',
                        idDataset: self.SelectedDataset.id,
                        isDesCurve: null,
                        data: self.outaziArr
                }
            ];
            async.eachOfSeries(payloads, (payload, i, callback) => {
                let overwrite = self.curvesArr.find(curve => {return curve.name == payload.curveName && curve.properties.idDataset == payload.idDataset;});
                if(overwrite) {
                    delete payload.curveName;
                    payload.idDesCurve = overwrite.id;
                }
                wiApiService.processingDataCurve(payload, function(){
                    console.log('Saved', payload.curveName);
                    callback();
                })
            }, function(err){
                utils.refreshProjectState();
                console.log('Save successfull!');
            })
            }

            if(curvesExist.length){
                let html  = curvesExist.map(c => {return '</br>' + c;});
                
                dialogUtils.confirmDialog(ModalService, "Save Curves", "Curve Exist:" + html,function(ret){
                    if(ret){
                        console.log('overwrite');
                        save();
                    }else{
                        self.applyingInProgress = false;
                        console.log('Cancel Overwrite!');
                    }
                })
            }else{
                console.log('not exist');
                save();
            }
        }
        
        this.onRunButtonClicked = function(save){
            if(self.applyingInProgress) return;
            self.applyingInProgress = true;
            
            if(self.useType == 'file'){
                if(self.SurveyFile){
                    let length = self.input.length - self.startData;
                    self.Size = new Array(length);
                    self.depthArr = new Array(length);
                    self.devArr = new Array(length);
                    self.aziArr = new Array(length);
                    self.tvdArr = new Array(length);
                    self.tvdssArr = new Array(length);
                    self.northArr = new Array(length);
                    self.eastArr = new Array(length);
                    self.xArr = new Array(length);
                    self.yArr = new Array(length);
                    // self.radiusArr = new Array(length);

                    let first = parseFloat(isNaN(self.input[self.startData][self.colDepth - 1]) ? 0 : self.input[self.startData][self.colDepth - 1]);
                    self.depthArr[0] = self.tvdRef <  first ? self.tvdRef : first;
                    for(let i = 1; i < length; i++){
                        let d = self.input[i + self.startData][self.colDepth - 1];
                        self.depthArr[i] = parseFloat(d == undefined || isNaN(d) ? 0 : d);
                    }
                    for(let j = 0; j < length; j++){
                        let d = self.input[j + self.startData][self.colDev - 1];
                        let a = self.input[j + self.startData][self.colAzi - 1];
                        self.devArr[j] = parseFloat(d == undefined || isNaN(d) ? 0 : d);
                        self.aziArr[j] = parseFloat(a == undefined || isNaN(a) ? 0 : a);
                    }
                    async.series([function(cb){
                        processing();
                        cb();
                    }], function(err, ret){
                        console.log('Done Processing!');
                        if(save){
                            saveCurves();
                        }else{
                            self.applyingInProgress = false;
                        }
                    })
                }else{
                    utils.error('Please open supported survey file!');
                    self.applyingInProgress = false;
                }
            }else{
                if(self.DevCurve && self.AziCurve){
                    let length = self.FullSize.length;
                    self.Size = new Array(length);                
                    self.depthArr = new Array(length);
                    self.tvdArr = new Array(length);
                    self.tvdssArr = new Array(length);
                    self.northArr = new Array(length);
                    self.eastArr = new Array(length);
                    self.xArr = new Array(length);
                    self.yArr = new Array(length);
                    // self.radiusArr = new Array(length);
                    self.depthArr[0] = self.tvdRef < self.topDepth ? self.tvdRef : self.topDepth;
                    for(let i = 1; i < length; i++){
                        self.depthArr[i] = i * self.step + self.topDepth;
                    }
                    async.series([function(cb){
                        processing();
                        cb();
                    }], function(err, ret){
                        console.log('Done Processing!');
                        if(save){
                            saveCurves();
                        }else{
                            self.applyingInProgress = false;
                        }
                    })
                }else{
                    utils.error('Please choose Deviation and Azimuth Curve!');
                    self.applyingInProgress = false;
                }
            }
            
        }

        this.onCancelButtonClicked = function(){
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "tvd-conversion/tvd-conversion-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}
exports.addCurveDialog = function (ModalService) {
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.addcurve = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.project = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
        this.wellArr = self.project.children.length ? self.project.children.filter(well => { return well.children.length > 4}) : null;
        if(!self.SelectedWell){
            self.SelectedWell = self.wellArr && self.wellArr.length ? self.wellArr[0]: null;
        }else{
            self.SelectedWell = self.wellArr.find(function(well){
                return well.id == self.SelectedWell.id;
            })
        }
        this.datasets = [];
        this.curves = [];
        this.families = utils.getListFamily();
        this.selectedFamily = this.families[0];
        this.onWellChanged = function(){
            self.datasets.length = 0;
            self.curves.length = 0;
            if(self.SelectedWell){
                self.SelectedWell.children.forEach(function(child, i){
                    if(child.type == 'dataset')
                        self.datasets.push(child);
                    if(i== self.SelectedWell.children.length -1){
                        if(self.datasets && self.datasets.length!= 0){
                            self.datasetName = self.datasets[0].id;
                            self.datasets.forEach(function(child){
                                child.children.forEach(function (curve) {
                                    if (curve.type == 'curve') {
                                       self.curves.push(curve);
                                    }
                                })
                            })
                        }
                    }
                })
            }
        }

        this.onWellChanged();
        this.onFamilyChanged = function () {
            self.unit = self.selectedFamily.unit;
        }
        this.onFamilyChanged();
        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            let curve = self.curves.find(curve=> {
                return curve.name == self.curveName && curve.properties.idDataset == self.datasetName;
            })
            if(curve){
                utils.error('Curve exsisted!');
                self.applyingInProgress = false;
             }else {
                let bottomDepth = self.SelectedWell.properties.bottomDepth;
                let topDepth = self.SelectedWell.properties.topDepth;
                let step = self.SelectedWell.properties.step;
                let length = Math.ceil((bottomDepth - topDepth)/step)+1;
                let initValue = self.initValue?self.initValue:100;
                let payload = {
                    curveName : self.curveName,
                    idDataset : self.datasetName,
                    data : new Array(length).fill(initValue),
                    unit : self.unit,
                    idFamily : self.selectedFamily.idFamily
                 }
                wiApiService.processingDataCurve(payload,function(){
                    utils.refreshProjectState();
                    self.applyingInProgress = false;
                })
             }
        }
            this.onCancelButtonClicked = function(){
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
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.autoSizeTrackDialog = function (ModalService, wiLogplotCtrl) {
    function ModalController(wiComponentService, wiApiService, close) {
        let self = this;
        window.auto = this;

        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);

        let wiD3Ctrl = wiLogplotCtrl.getwiD3Ctrl();

        let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
        let depthTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'depth-track');
        let imageTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'image-track');
        let zoneTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'zone-track');

        this.unit = "inch";
        if (Array.isArray(logTracks) && logTracks.length) {
            this.width = utils.pixelToInch(logTracks[0].width);
            this.log = true;
        } else if (Array.isArray(depthTracks) && depthTracks.length) {
            this.width = utils.pixelToInch(depthTracks[0].width);
            this.depth = true;
        } else if (Array.isArray(zoneTracks) && zoneTracks.length) {
            this.width = utils.pixelToInch(zoneTracks[0].width);
            this.zone = true;
        } else if (Array.isArray(imageTracks) && imageTracks.length) {
            this.width = utils.pixelToInch(imageTracks[0].width);
            this.image = true;
        } else {
            this.width = 0;
        }
        function update() {
            if(self.depth && Array.isArray(depthTracks) && depthTracks.length) {
                depthTracks.forEach(function(d){
                    let request = {
                        idDepthAxis : d.id,
                        width: self.width
                    }
                    wiApiService.editDepthTrack(request, function(res){
                        d.width = utils.inchToPixel(self.width);
                        d.doPlot();
                    });
                })
            };
            if(self.log && Array.isArray(logTracks) && logTracks.length) {
                logTracks.forEach(function(l){
                    let request = {
                        idTrack : l.id,
                        width: self.width
                    }
                    wiApiService.editTrack(request, function(res){
                        l.width = utils.inchToPixel(self.width);
                        l.doPlot();
                    });
                })
            };
            if(self.image && Array.isArray(imageTracks) && imageTracks.length) {
                imageTracks.forEach(function(i){
                    let request = {
                        idImageTrack : i.id,
                        width: self.width
                    }
                    wiApiService.editImageTrack(request, function(res){
                        i.width = utils.inchToPixel(self.width);
                        i.doPlot();
                    });
                })
            };
            if(self.zone && Array.isArray(zoneTracks) && zoneTracks.length) {
                zoneTracks.forEach(function(z){
                    let request = {
                        idZoneTrack : z.id,
                        width: self.width
                    }
                    wiApiService.editZoneTrack(request, function(res){
                        z.width = utils.inchToPixel(self.width);
                        z.doPlot();
                    });
                })
            }
        }
        this.onApplyButtonClicked = function(){
            update();
        };
        this.onOkButtonClicked = function(){
            update();
            close(self);
        };
        this.onCancelButtonClicked = function(){
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: "auto-size-track/auto-size-track-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}

exports.formationResistivityDialog = function (ModalService, callback) {
    function ModalController($scope, wiComponentService, wiApiService, close, $timeout) {

        let self = this;
        window.fr = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let wiExplorer = wiComponentService.getComponent(wiComponentService.WI_EXPLORER);
        this.wells = wiExplorer.treeConfig[0].children;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);

        this.applyingInProgress = false;

        this.zoneSets = [];
        this.zones = [];
        this.curves = [];

        this.zoneSetModel = {};
        this.curveModel = {};
        this.unit = 'DEGC';
        this.desCurve = {
            curveName: 'Rw'
        };

        if( selectedNodes && selectedNodes[0].type == 'well') this.wellModel = selectedNodes[0];
        else if( selectedNodes && selectedNodes[0].type == 'zoneset') {
            this.wellModel = utils.findWellById(selectedNodes[0].properties.idWell);
            this.zoneSetModel = selectedNodes[0];
        }
        else if ( selectedNodes && selectedNodes[0].type == 'zone' ) {
            this.zoneSetModel = utils.findZoneSetById(selectedNodes[0].properties.idZoneSet);
            this.wellModel = utils.findWellById(this.zoneSetModel.properties.idWell);
        }
        else if ( selectedNodes && selectedNodes[0].type == 'curve' ) {
            this.curveModel = selectedNodes[0];
            this.wellModel = utils.findWellByCurve(this.curveModel.id);
        }
        else this.wellModel = angular.copy(self.wells[0]);

        this.idWell = this.wellModel.id;
        selectWell (this.idWell);
        this.selectWell = selectWell;
        function selectWell (idWell) {
            self.wellModel = utils.findWellById(idWell);
            self.curves = self.wellModel.children[0].children;
            self.curveModel = getCurveModel(self.curves).curveModel;
            self.unit = getCurveModel(self.curves).unit;
            self.datasets = self.wellModel.children;
            self.datasetModel = self.datasets[0];
            // self.zones = [];
            self.zoneSets = angular.copy(self.wellModel.children[1].children);
            if (!self.zoneSetModel || !Object.keys(self.zoneSetModel).length) self.zoneSetModel = self.zoneSets[0];
            selectZoneSet (self.zoneSetModel);
        }
        this.selectZoneSet = selectZoneSet;
        function selectZoneSet (zoneSetModel) {
            self.zones = [];
            if (zoneSetModel && Object.keys(zoneSetModel).length) self.zones = zoneSetModel.children;
        }
        function getCurveModel (curves) {
            let curveModel = {};
            let unit = 'DEGC';
            curves.forEach(function(c) {
                if (c.properties.name == 'TEMP') {
                    curveModel = c;
                    unit = c.properties.unit;
                }
            });
            let frCurves = curves.filter(function (c) {
                return (c.lineProperties && 
                            (c.lineProperties.name == 'Formation Temperature'  || 
                            c.lineProperties.name == 'Temperature'))
            });
            if ((!curveModel || !Object.keys(curveModel).length) && frCurves.length) {
                curveModel = frCurves[0];
                unit = frCurves[0].properties.unit;
            }
            return {curveModel : curveModel, unit : unit};
        }

        this.onRunButtonClicked = function () {
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            
            let inputData = [];
            let outputData = [];
            let yTop = Math.round((
                            self.topDepth - parseFloat(self.wellModel.properties.topDepth))
                                        /parseFloat(self.wellModel.properties.step));
            let yBottom = Math.round((
                            self.bottomDepth - parseFloat(self.wellModel.properties.topDepth))
                                        /parseFloat(self.wellModel.properties.step));
            function tempF(unit, temp) {
                let t = null; 
                if (temp != null || !isNaN(temp)) {
                    if (unit == 'DEGC') t = 1.8 * temp + 32;
                    else if (unit == 'DEGF') t = temp;
                }
                return t;
            }
            // function rWF (cSP, temp) {
            //     let t = tempF (self.unit, temp);
            //     return ( ((1 : (2.74 * Math.pow(10, -4) * Math.pow(cSP, 0.955))) + 0.0123 ) * (81.77 : (t + 6.77)));
            // }
            async.parallel([
                function(callback){
                    wiApiService.dataCurve(self.curveModel.id, function (dataCurve){
                        inputData = dataCurve.map(d => parseFloat(d.x));
                        callback();
                    });
                }],
                function(err, results) {
                    let len = inputData.length;

                    for(let i = 0; i < len; i++) {
                        
                    };
                    console.log("outputData", inputData, outputData);
                    let request = {
                        idDataset: self.outputObj.idDataset,
                        curveName: self.outputObj.curve,
                        unit: self.outputObj.unit,
                        idDesCurve: self.curveModel.id,
                        data: utils.getDataTopBottomRange(outputData, yTop, yBottom)
                    }
                    if(self.outputObj.curve == self.curveModel.properties.name) {
                        dialogUtils.confirmDialog(ModalService, "WARNING", "OverWrite!", function (ret) {
                            if(ret) {
                                delete request.curveName;
                                delete request.unit;
                                wiApiService.processingDataCurve(request, function(res) {
                                    console.log("processingDataCurve", res);
                                    utils.refreshProjectState();
                                    self.applyingInProgress = false;
                                })
                            }
                        });
                    }
                    else {
                        delete request.idDesCurve;
                        if (self.curveModel.properties.idFamily)
                            request.idFamily = self.curveModel.properties.idFamily;
                        wiApiService.processingDataCurve(request, function(res) {
                            console.log("processingDataCurve", res);
                            utils.refreshProjectState();
                            self.applyingInProgress = false;
                        })
                    }
                })
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "formation-resistivity/formation-resistivity-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (ret) {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
            callback(ret);
        });
    });
}
exports.groupManagerDialog = function (ModalService, callback) {
    function createRootNode() {
        let rootNode = {};
        rootNode.type = 'rootGroup';
        rootNode.data = {
            childExpanded: true,
            icon: 'well-insight-16x16',
            label: 'Project',
            selected: true
        };
        rootNode.properties = {
            idGroup: null
        }
        rootNode.children = [];
        return rootNode;
    }
    const states = {
        unchanged: '0',
        created: '1',
        changed: '2',
        deleted: '3',
        uncreated: '4'
    }
    function ModalController(wiComponentService, wiApiService, close, $timeout) {
        window.groupdialog = this;
        let self = this;
        let projectLoaded = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let groupToTreeConfig = utils.groupToTreeConfig;
        let rootNode = createRootNode();
        this.treeConfig = [rootNode];
        let groups = projectLoaded.groups;
        groups.forEach(function (group) {
            let groupModel = utils.getGroupModel(group.idGroup, groups, rootNode);
            groupModel.data.childExpanded = true;
        })
        let selectedGroup = rootNode;
        this.onSelectGroup = function ($index, $event, groupModel) {
            selectedGroup.data.selected = false;
            groupModel.data.selected = true;
            selectedGroup = groupModel;
        }
        this.selectGroup = function (groupModel) {
            self.onSelectGroup(null, null, groupModel);
        }
        this.getItemTreeviewCtxMenu = function (nodeType, treeviewCtrl) {
            switch (nodeType) {
                case 'rootGroup':
                    return [
                        {
                            name: "Add",
                            label: "Add",
                            icon: "plus-16x16",
                            handler: function () {
                                self.onAddButtonClicked();
                            }
                        }
                    ]
                    break;
                case 'group':
                    return [
                        {
                            name: "Add",
                            label: "Add",
                            icon: "plus-16x16",
                            handler: function () {
                                self.onAddButtonClicked();
                            }
                        }, {
                            name: "Delete",
                            label: "Delete",
                            icon: "close-16x16-edit",
                            handler: function () {
                                self.onRemoveButtonClicked();
                            }
                        }, {
                            name: "Rename",
                            label: "Rename",
                            icon: "annotation-16x16-edit",
                            handler: function () {
                                // doing
                            }
                        }
                    ]
                    break;
                default:
                    break;
            }
        }
        function isGroupNameValid(groupName, groupModel) {
            if (!groupModel) groupModel = rootNode;
            let isValid = true;
            if (groupModel.properties.name == groupName) isValid = false;
            if (Array.isArray(groupModel.children) && groupModel.children.length) {
                groupModel.children.forEach(child => {
                    if (child.data.deleted) return;
                    if (!isGroupNameValid(groupName, child)) isValid = false;
                });
            }
            return isValid;
        }
        function groupNameDialog(groupName, callback) {
            let promptConfig = { title: 'New Group', inputName: 'Group Name', input: groupName || 'new_group' }
            dialogUtils.promptDialog(ModalService, promptConfig, function (newGroupName) {
                if (isGroupNameValid(newGroupName)) callback(newGroupName);
                else {
                    utils.error('Group name is existed!', function () {
                        groupNameDialog(groupName, callback);
                    })
                }
            })
        }
        this.onAddButtonClicked = function () {
            groupNameDialog('new_group', function (groupName) {
                let newGroup = {
                    idProject: projectLoaded.idProject,
                    idParent: selectedGroup.properties.idGroup,
                    name: groupName
                }
                let newGroupModel = groupToTreeConfig(newGroup);
                newGroupModel.data.childExpanded = true;
                newGroupModel.state = states.created;
                selectedGroup.children.push(newGroupModel);
                self.selectGroup(newGroupModel);
            });
        }
        this.onRemoveButtonClicked = function () {
            if (selectedGroup.type == 'rootGroup') return;
            if (selectedGroup.state == states.created) {
                selectedGroup.state = states.uncreated;
            } else {
                selectedGroup.state = states.deleted;
            }
            selectedGroup.data.deleted = true;
            self.selectGroup(rootNode);
        }
        function handleGroupApi(groupModel) {
            let promises = [];
            switch (groupModel.state) {
                case states.created:
                    promises.push(new Promise(function (resolve, reject) {
                        wiApiService.createGroup(groupModel.properties, function (groupRes) {
                            groupModel.properties = groupRes;
                            if (Array.isArray(groupModel.children)) {
                                groupModel.children.forEach(function (child) {
                                    child.properties.idParent = groupModel.properties.idGroup;
                                    let childPromises = handleGroupApi(child);
                                    promises.push.apply(promises, childPromises);
                                })
                            }
                            resolve();
                        })
                    }));
                    break;
                case states.changed:
                    promises.push(new Promise(function (resolve, reject) {
                        wiApiService.editGroup(groupModel.properties, function (groupRes) {
                            groupModel.properties = groupRes;
                            if (Array.isArray(groupModel.children)) {
                                groupModel.children.forEach(function (child) {
                                    child.properties.idParent = groupModel.properties.idGroup;
                                    let childPromises = handleGroupApi(child);
                                    promises.push.apply(promises, childPromises);
                                })
                            }
                            resolve();
                        })
                    }));
                    break;
                case states.deleted:
                    promises.push(new Promise(function (resolve, reject) {
                        wiApiService.removeGroup(groupModel.properties.idGroup, function () {
                            if (Array.isArray(groupModel.children)) {
                                groupModel.children.forEach(function (child) {
                                    let childPromises = handleGroupApi(child);
                                    promises.push.apply(promises, childPromises);
                                })
                            }
                            resolve();
                        })
                    }));
                    break;
                case states.uncreated:
                    break;
                case states.unchanged:
                default:
                    if (Array.isArray(groupModel.children)) {
                        groupModel.children.forEach(function (child) {
                            let childPromises = handleGroupApi(child);
                            promises.push.apply(promises, childPromises);
                        })
                    }
                    break;
            }
            return promises;
        }
        function handleWellApi () {
            let selectedWells = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
            let promises = [];
            if (Array.isArray(selectedWells) && selectedWells[0].type == 'well') {
                selectedWells.forEach(wellModel => {
                    if (wellModel.properties.idGroup != selectedGroup.properties.idGroup) {
                        wellModel.properties.idGroup = selectedGroup.properties.idGroup;
                        promises.push(new Promise((resolve, reject) => {
                            wiApiService.editWell(wellModel.properties, () => {
                                resolve();
                            })
                        }));
                    }
                });
            }
            return promises;
        }
        this.onOkButtonClicked = function () {
            let groupPromises = handleGroupApi(rootNode);
            if (groupPromises.length){
                Promise.all(groupPromises)
                    .then(function () {
                        let wellPromises = handleWellApi();
                        Promise.all(wellPromises).then(() => {
                            close(true);
                        })
                    })
                    .catch(function (err) {
                        console.error(err);
                    })
            } else {
                let wellPromises = handleWellApi();
                if (wellPromises.length) {
                    Promise.all(wellPromises).then(() => {
                        close(true);
                    });
                } else {
                    close(false);
                }
            }
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "group-manager/group-manager-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function (updated) {
            updated && callback && callback();
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}
exports.curveFilterDialog = function(ModalService){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.CFilter = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

        this.onCancelButtonClicked = function(){
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: "curve-filter/curve-filter-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        modal.element.modal();
        $(modal.element[0].children[0]).draggable();
        modal.close.then(function () {
            $('.modal-backdrop').last().remove();
            $('body').removeClass('modal-open');
        });
    });
}
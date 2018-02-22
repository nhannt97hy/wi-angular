let helper = require('./DialogHelper');
module.exports = function (ModalService, callback, options, shadingOptions) {
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
        templateUrl: 'fill-pattern-setting-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        thisModal.enableFill("positiveNegative", false);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};
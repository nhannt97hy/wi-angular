let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService, lineOptions, symbolOptions, callback) {
    function ModalController($scope, close, $timeout) {
        let self = this;
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
        console.log("options", lineOptions, symbolOptions);

        this.lineOptions = lineOptions;
        this.symbolOptions = symbolOptions;
        console.log("options", lineOptions, symbolOptions);
        this.lineStyles = [
            [0, 1],
            [8, 2, 2, 2, 2, 2],
            [8, 2, 2, 2],
            [2, 2],
            [8, 2],
            [1, 0]
        ];
        if (this.symbolOptions.symbolStyle.symbolName)
            this.symbolOptions.symbolStyle.symbolName = utils.upperCaseFirstLetter(this.symbolOptions.symbolStyle.symbolName);

        this.lineWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.symbolPatterns = ['basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'sandstone', 'shale', 'siltstone'];
        this.symbolType = ["Circle", "Cross", "Diamond", "Plus", "Square", "Star"];
        this.symbolWidthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let type = 'Circle';

        this.drawIcon = utils.drawIcon;

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
        this.checkSize = function () {
            if (this.lineOptions.lineStyle.lineWidth < 1) this.lineOptions.lineStyle.lineWidth = 1;
            if (this.lineOptions.lineStyle.lineWidth > 10) this.lineOptions.lineStyle.lineWidth = 10;
            if (this.symbolOptions.symbolStyle.symbolSize < 1) this.symbolOptions.symbolStyle.symbolSize = 1;
            if (this.symbolOptions.symbolStyle.symbolSize > 30) this.symbolOptions.symbolStyle.symbolSize = 30;
        }
        this.onOkButtonClicked = function () {
            if (self.symbolOptions.symbolStyle.symbolName)
                self.symbolOptions.symbolStyle.symbolName = self.symbolOptions.symbolStyle.symbolName.toLowerCase();
            self.symbolOptions.symbolStyle.symbolStrokeStyle = self.symbolOptions.symbolStyle.symbolFillStyle;
            console.log("arr string", self.lineOptions, self.symbolOptions);
            close(self.lineOptions, self.symbolOptions);

        };
        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: "line-symbol-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (lineOptions, symbolOptions) {
            helper.removeBackdrop();
            if (lineOptions || symbolOptions) {
                console.log(lineOptions, symbolOptions);
                callback(lineOptions, symbolOptions);
            }
        });
    });
}
let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService, callback, options) {
    function ModalController($scope, close) {
        let self = this;
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
        templateUrl: "symbol-style-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (ret) callback(ret);
        });
    });
}
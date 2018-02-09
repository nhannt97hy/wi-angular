let helper = require('./DialogHelper');
module.exports = function (ModalService, markerProperties, callback) {
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
        this.depth = props.depth;
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
        templateUrl: "marker-properties-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) callback(data);
        });
    });
}
let helper = require('./DialogHelper');
module.exports = function (ModalService, curves, callback) {
    function ModalController($scope, wiApiService, wiComponentService, close) {
        let self = this;
        this.onCancelButtonClicked = function () {
            close(null);
        };
        self.curves = curves;
        self.changed = [];
        this.onApplyButtonClick = function () {

            async.each(self.curves, function (curve, next) {
                if (curve.convertUnit && curve.properties.unit !== curve.convertUnit.name) {
                    self.changed.push(curve);
                    let payload = {};
                    payload.srcUnit = curve.units.find(u => u.name === curve.properties.unit);
                    payload.desUnit = curve.convertUnit;
                    payload.idCurve = curve.id;
                    wiApiService.convertCurveUnit(payload, function (response) {
                        next();
                    });
                } else {
                    next();
                }
            }, function () {
                close(self.changed);
            });
        }
    }

    ModalService.showModal({
        templateUrl: 'convert-curve-unit-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            callback(data);
        })
    });
};
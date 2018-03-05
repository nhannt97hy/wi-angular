let helper = require('./DialogHelper');

let token = window.localStorage.getItem('token');
let username;
if(token)
    username = JSON.parse(atob(token.split('.')[1])).username;

module.exports = predictModelDialog;

function predictModelDialog(ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout, wiComponentService) {
        
        this.onOkButtonClicked = function () {
            
        };
        this.onCancelButtonClicked = function() {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'predict-model-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};


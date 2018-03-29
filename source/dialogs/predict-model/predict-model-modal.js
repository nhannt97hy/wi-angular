let helper = require('./DialogHelper');
const HOST = '54.169.13.92';
const PORT = 3002;
let token = window.localStorage.getItem('token');
let username;
if(token)
    username = JSON.parse(atob(token.split('.')[1])).username;

module.exports = predictModelDialog;

function predictModelDialog(ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout, $http, wiComponentService) {
        let self = this;
        wiComponentService.getComponent('SPINNER').show();
        $http({
            method: 'GET',
            url: 'http://'+HOST+':'+PORT + '/store/api/model/list/' + username
        }).then(function(response){
            var res = response.data;
            if(res.statusCode == 400){
                wiComponentService.getComponent('SPINNER').hide();
                toastr.error(res.body + '\n Load page again!', '');
            }else{
                self.models = res;
                self.model = self.models[0];
                wiComponentService.getComponent('SPINNER').hide();
                self.onOkButtonClicked = function(){
                    payload = {
                        model_id: self.model.id,
                        model_type: self.model.type,
                        data: self.data
                    }
                    callback(payload);
                    close(null);    
                }
            }
            return;
        }, function(error){
            wiComponentService.getComponent('SPINNER').hide();
            toastr.error('Call store api get list model error', '');
            return;
        })
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


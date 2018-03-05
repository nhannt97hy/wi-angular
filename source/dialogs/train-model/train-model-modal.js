let helper = require('./DialogHelper');

let token = window.localStorage.getItem('token');
let username;
if(token)
    username = JSON.parse(atob(token.split('.')[1])).username;

module.exports = trainModelDialog;

function trainModelDialog(ModalService, callback) {
    function ModalController($scope, close, wiApiService, $timeout, wiComponentService) {
        let self = this;
        self.data = [];
        self.target = [];
        this.changeWell = function(){
            self.datasets = self.well.datasets;
            self.dataset = self.datasets[0];
            self.curves = self.dataset.curves;
            self.curve = self.curves[0];
        }
        this.changeDataset = function(){
            self.curves = self.dataset.curves;
            self.curve = self.curves[0];
        }
        this.changeCurve = function(){
            getData(self, wiApiService);
        }
        this.name = "Model";
        this.description = "Description"
        this.types = [{
            type: 'rnd',
            name: 'Random Forest'
        }, {
            type: 'lnr',
            name: 'Linear Regression'
        }, {
            type: 'dnn',
            name: 'Multi Perceptron'
        }];
        this.type = 'rnd';
        this.lnr = this.dnn = false;
        this.changeType = function(type){
            if(type == 'rnd'){
                self.lnr = self.dnn = false;
            }else if(type == 'lnr'){
                self.lnr = true;
                self.dnn = false;
            }else{
                self.lnr = self.dnn = true;
            }
        }
        this.units = [{n_nodes: 8, activate: "sigmoid"}];
        this.params = {n_epochs: 10, learning_rate: 0.001, feature_range: [0,1], batch_size: 10};
        this.add_layer = function(){
            self.units.push({n_nodes: 8, activate: "sigmoid"});
        }
        this.remove_layer = function(x){
            self.units.splice(x, 1);
        }
        this.onOkButtonClicked = function () {
            if(self.name && self.type && self.description){
                
                payload = {
                    name: self.name,
                    type: self.type,
                    params: "",
                    units: "",
                    data: self.data,
                    target: self.target,
                    description: self.description,
                    user_created: username
                }
                if (payload.type == 'dnn'){
                    payload.units = self.units;
                    payload.params = self.params;
                }else{
                    if(payload.type == 'lnr'){
                        payload.params = self.params;
                    }
                }
                callback(payload);
                close(null);
            }
        };
        this.onCancelButtonClicked = function() {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'train-model-modal.html',
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


const HOST = '54.169.13.92';
const PORT = 3002;

const componentName = 'wiPredictModel';
const moduleName = 'wi-predict-model';

const moduleCreateModel = 'create-model';
const componentCreateModel = 'createModel';
const moduleRetrainModel = 'retrain-model';
const componentRetrainModel = 'retrainModel';
const modulePredict = 'predict';
const componentPredict = 'predict';
const moduleListModel = 'list-model';
const componentListModel = 'listModel';

let token = window.localStorage.getItem('token');
let username;
if(token)
    username = JSON.parse(atob(token.split('.')[1])).username;

function WipmController(wiComponentService, wiApiService){
    let self = this;
    this.create = true;
    this.retrain = this.predict = this.list = false;
}

let app = angular.module(moduleName, [
    moduleCreateModel,
    moduleRetrainModel,
    modulePredict,
    moduleListModel
]);

app.component(componentName, {
    templateUrl: 'wi-predict-model.html',
    controller: WipmController,
    controllerAs: 'wipmCtrl'
});

exports.name = moduleName;

/* Create */
function createModelCtrl($http, wiApiService, wiComponentService){
    let self = this;
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
    this.create_model = function(){
        if(self.name && self.type && self.data && self.target && self.description){
            wiComponentService.getComponent('SPINNER').show();
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
            $http({
                method: 'POST',
                url: 'http://'+HOST+':'+PORT + '/store/api/model/new',
                data: payload
            }).then(function(response){
                    console.log('create model:', response.data);
                    wiComponentService.getComponent('SPINNER').hide();
                    var res = response.data;
                    if(res.statusCode == 200){
                        toastr.success('Create model success!', '');
                    }else{
                        toastr.error(res.body.message, '');
                    }
                return;
            }, function(error){
                toastr.error('Call store api create model error!', '');
                return;
            })
        }
    }
}

angular.module(moduleCreateModel, []);

app.component(componentCreateModel, {
    templateUrl: 'template/create-model.html', 
    controller: createModelCtrl,
    controllerAs: 'createCtrl'
});

/* Retrain */
function retrainModelCtrl($http, wiApiService, wiComponentService){
    let self = this;
    wiComponentService.getComponent('SPINNER').show();   
    $http({
        method: 'GET',
        url: 'http://' + HOST+':'+PORT+ '/store/api/model/list/' + username
    }).then(function(response){
            var res = response.data;
            console.log('retrain: ', res);
            wiComponentService.getComponent('SPINNER').hide();
            if(res.statusCode == 400){
                toastr.error(res.body + '\n Load page again!', 'danger');
            }else{
                self.models = res;
                self.model = self.models[0];
                self.params = {n_epochs: 10, learning_rate: 0.001};
                if(self.model.type == 'rnd'){
                    self.rnd = true;
                }else{
                    self.rnd = false;
                }
                self.changeModel = function(type){
                    if(type == 'rnd'){
                        self.rnd = true;
                    }else{
                        self.rnd = false;
                    }
                }
                
                self.retrain = function(){
                    if(self.data && self.target){
                        wiComponentService.getComponent('SPINNER').show();
                        payload = {
                            model_id: self.model.id,
                            model_type: self.model.type,
                            n_epochs: self.params['n_epochs'],
                            data: self.data,
                            target: self.target
                        }
                        $http({
                            method: 'PUT',
                            url: 'http://'+HOST+':'+PORT +'/store/api/model/retrain/' + self.model.id,
                            data: payload
                        }).then(function(response){
                            wiComponentService.getComponent('SPINNER').hide();
                                var res = response.data;
                                console.log(res);
                                if(res.statusCode == 200){
                                    toastr.success('Retrain model success!', '');
                                }else{
                                    toastr.error(res.body.message, '');
                                }
                            return;
                        }, function(error){
                            toastr.error('Call store api retrain error', '');
                            return;
                        })
                    }
                }
            }
            return;
    }, function(error){
            toastr.error('Call store api get list model error', '');
            return;
    })
}

angular.module(moduleRetrainModel, []);

app.component(componentRetrainModel, {
    templateUrl: 'template/retrain-model.html', 
    controller: retrainModelCtrl,
    controllerAs: 'retrainCtrl'
});

/* List */
function listModelCtrl($http, wiComponentService){
    let self = this;
    wiComponentService.getComponent('SPINNER').show();
    $http({
        method: 'GET',
        url: 'http://'+HOST+':'+PORT + '/store/api/model/list/' + username
    }).then(function(response){
            var res = response.data;
            wiComponentService.getComponent('SPINNER').hide();
            console.log('delete: ', res);
            if(res.statusCode == 400){
                toastr.error(res.body + '\n Load page again!', '');
            }else{
                self.models = res;
                self.delete = function(index, id){
                    wiComponentService.getComponent('SPINNER').show();
                    $http({
                        method: 'DELETE',
                        url: 'http://'+HOST+':'+PORT + '/store/api/model/delete/' + id,
                    }).then(function(response){
                        wiComponentService.getComponent('SPINNER').hide();
                            var res = response.data;
                            if(res.statusCode == 200){
                                self.models.splice(index, 1);
                                toastr.success('Delete model success!', '');
                            }else{
                                toastr.error(res.body.message, '');
                            }
                        return;
                    }, function(error){
                        toastr.error('Call store api delete model error', '');
                        return;
                    })
                }
            }
            return;
        }, function(error){
            toastr.error('Call store api get list model error', '');
            return;
    })
}

angular.module(moduleListModel, []);

app.component(componentListModel, {
    templateUrl: 'template/list-model.html', 
    controller: listModelCtrl,
    controllerAs: 'listCtrl'
});

/* predict */
function predictCtrl($http,  wiApiService, wiComponentService){
    let self = this;
    this.project;
    wiApiService.getProjectInfo(1, function(projectInfo){
        wiApiService.getProject(projectInfo, function(project){
            self.project = project;
            self.wells = self.project.wells;
            self.well = self.wells[0];
            self.datasets = self.well.datasets;
            self.dataset = self.datasets[0];
            self.curves = self.dataset.curves;
            self.curve = self.curves[0];
        })
    });  
    wiApiService.dataCurve(2, function(data){
        console.log('dataCurve: ', data);
    })
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
        console.log('change curve: ', self.curve);
    }
    wiComponentService.getComponent('SPINNER').show();
    $http({
        method: 'GET',
        url: 'http://'+HOST+':'+PORT + '/store/api/model/list/' + username
    }).then(function(response){
            var res = response.data;
            wiComponentService.getComponent('SPINNER').hide();
            if(res.statusCode == 400){
                toastr.error(res.body + '\n Load page again!', '');
            }else{
                self.models = res;
                self.model = self.models[0];
                
                self.predict = function(){
                    if(self.curve){
                        wiComponentService.getComponent('SPINNER').show();
                        payload = {
                            model_id: self.model.id,
                            model_type: self.model.type,
                            data: self.curve
                        }
                        $http({
                            method: 'POST',
                            url: 'http://'+HOST+':'+PORT + '/store/api/predict',
                            data: payload
                        }).then(function(response){
                            wiComponentService.getComponent('SPINNER').hide();
                                var res = response.data;
                                console.log('predict:', res);
                                if(res.statusCode == 200){
                                    toastr.success('Predict observation success!', '');
                                }else{
                                    console.log('fail');
                                    toastr.error(res.body.message, '');
                                }
                            return;
                        }, function(error){
                            toastr.error("Call store api predict error", '');
                            return;
                        })
                    }
                }
            }
            return;
    }, function(error){
            toastr.error('Call store api get list model error', '');
            return;
    })
}

angular.module(modulePredict, []);

app.component(componentPredict, {
    templateUrl: 'template/predict.html', 
    controller: predictCtrl,
    controllerAs: 'predictCtrl'
});

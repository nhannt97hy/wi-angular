const storeApi = 'http://54.169.13.92:3002/store/api';
const moduleName = 'wipm';
const controllerName = 'wipmController';
const createFormCtrlName = 'createFormController';
const retrainFormCtrlName = 'retrainFormController';
const predictFormCtrlName = 'predictFormController';
const listModelFormCtrlName = 'listModelController';
// let username = window.localStorage.getItem('username');

let wipm = angular.module(moduleName, []);

wipm.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);
            element.on('change', function(onChangeEvent) {
                var reader = new FileReader();
                reader.onload = function(onLoadEvent) {
                    scope.$apply(function() {
                        fn(scope, {$fileContent:onLoadEvent.target.result});
                    });
                };
                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
});

wipm.controller(controllerName, function($scope){
    $scope.create = true;
    $scope.retrain = $scope.predict = $scope.list = $scope.result = false;
})

wipm.controller(createFormCtrlName, function($http){
    var self = this;
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
    this.read_data = function($fileContent){
        var string = $fileContent.split('\n');
        self.data = [];
        for( let i=0; i < string.length - 1; i++){
            let str = string[i].split(',');
            var arr = [];
            for( let j=0; j < str.length; j++){
                arr.push(parseFloat(str[j]))
            }
            self.data.push(arr);
        }
    }
    this.read_target = function($fileContent){
        var string = $fileContent.split('\n');
        self.target = [];
        for( let i=0; i < string.length - 1; i++){
            let str = string[i].split(',');
            var arr = [];
            for( let j=0; j < str.length; j++){
                arr.push(parseFloat(str[j]))
            }
            self.target.push(arr);
        }
    }
    this.create_model = function(){
        
        if(self.name && self.type && self.data && self.target && self.description){
            $("form").append("<div class='load' style='position: absolute; z-index: 1000; top: 300px; left: 500px;'></div>");
            $("form").css('opacity', '0.5');
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
                url: storeApi + '/model/new',
                data: payload
            }).then(function(response){
                    console.log('create model:', response.data);
                    $(".load").remove();
                    $("form").css('opacity', '1');
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
})
wipm.controller(retrainFormCtrlName, function($http){
    var self = this;    
    $http({
        method: 'GET',
        url: storeApi + '/model/list/' + username
    }).then(function(response){
            var res = response.data;
            console.log('retrain: ', res);
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
                self.read_data = function($fileContent){
                    var string = $fileContent.split('\n');
                    self.data = [];
                    for( let i=0; i < string.length - 1; i++){
                        let str = string[i].split(',');
                        var arr = [];
                        for( let j=0; j < str.length; j++){
                            arr.push(parseFloat(str[j]))
                        }
                        self.data.push(arr);
                    }
                }
                self.read_target = function($fileContent){
                    var string = $fileContent.split('\n');
                    self.target = [];
                    for( let i=0; i < string.length - 1; i++){
                        let str = string[i].split(',');
                        var arr = [];
                        for( let j=0; j < str.length; j++){
                            arr.push(parseFloat(str[j]))
                        }
                        self.target.push(arr);
                    }
                }
                self.retrain = function(){
                    if(self.data && self.target){
                        $("form").append("<div class='load' style='position: absolute; z-index: 1000; top: 300px; left: 500px;'></div>");
                        $("form").css('opacity', '0.5');
                        payload = {
                            model_id: self.model.id,
                            model_type: self.model.type,
                            n_epochs: self.params['n_epochs'],
                            data: self.data,
                            target: self.target
                        }
                        $http({
                            method: 'PUT',
                            url: storeApi + '/model/retrain/' + self.model.id,
                            data: payload
                        }).then(function(response){
                                $(".load").remove();
                                $("form").css('opacity', '1');
                                var res = response.data;
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
})
wipm.controller(predictFormCtrlName, function($http,  wiApiService){
    var self = this; 
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
    $http({
        method: 'GET',
        url: storeApi + '/model/list/' + username
    }).then(function(response){
            var res = response.data;
            if(res.statusCode == 400){
                toastr.error(res.body + '\n Load page again!', '');
            }else{
                self.models = res;
                self.model = self.models[0];
                // self.read_data = function($fileContent){
                //     var string = $fileContent.split('\n');
                //     self.data = [];
                //     for( let i=0; i < string.length - 1; i++){
                //         let str = string[i].split(',');
                //         var arr = [];
                //         for( let j=0; j < str.length; j++){
                //             arr.push(parseFloat(str[j]))
                //         }
                //         self.data.push(arr);
                //     }
                // }
                self.predict = function(){
                    if(self.curve){
                        $("form").append("<div class='load' style='position: absolute; z-index: 1000; top: 300px; left: 500px;'></div>");
                        $("form").css('opacity', '0.5');
                        payload = {
                            model_id: self.model.id,
                            model_type: self.model.type,
                            data: self.curve
                        }
                        $http({
                            method: 'POST',
                            url: storeApi + '/predict',
                            data: payload
                        }).then(function(response){
                                $(".load").remove();
                                $("form").css('opacity', '1');
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
})
wipm.controller(listModelFormCtrlName, function($http){
    var self = this;
    $http({
        method: 'GET',
        url: storeApi + '/model/list/' + username
    }).then(function(response){
            var res = response.data;
            console.log('delete: ', res);
            if(res.statusCode == 400){
                toastr.error(res.body + '\n Load page again!', '');
            }else{
                self.models = res;
                self.delete = function(index, id){
                    $("table").append("<div class='load' style='position: absolute; z-index: 1000; top: 300px; left: 500px;'></div>");
                    $("table").css('opacity', '0.5');
                    $http({
                        method: 'DELETE',
                        url: storeApi + '/model/delete/' + id,
                    }).then(function(response){
                            $(".load").remove();
                            $("table").css('opacity', '1');
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
});
exports.name = moduleName;
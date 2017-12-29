const componentName = 'wiCurveListing';
const moduleName = 'wi-curve-listing';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout, $scope) {
    let self = this;
    this.applyingInProgress = false;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    function getDatasets() {
        self.datasets.length = 0;
        self.curvesArr.length = 0;
        if(self.SelectedWell && self.SelectedWell.children.length){
            self.SelectedWell.children.forEach(function (child, i) {
                if (child.type == 'dataset')
                    self.datasets.push(child);
                if(i == self.SelectedWell.children.length - 1){
                    if(self.datasets.length){
                        self.SelectedDataset = self.datasets[0];
                        self.datasets.forEach(child => {
                            child.children.forEach(function (item) {
                                if (item.type == 'curve') {
                                    let d = item;
                                    d.selected = false;
                                    self.curvesArr.push(d);
                                }
                            })
                        })
                    }
                }
            });
        }
    }
    this.onChangeWell = function () {
        getDatasets();
        self.currentIndex = self.wells.findIndex(w => { return w.id == self.SelectedWell.id});
        let step = self.SelectedWell.properties.step;
        let topDepth = self.SelectedWell.properties.topDepth;
        let bottomDepth = self.SelectedWell.properties.bottomDepth;
        let length = Math.round((bottomDepth - topDepth)/step) + 1;
        self.depthArr = new Array(length);
        for(let i = 0; i < length; i++){
            self.depthArr[i] = parseFloat((step * i + topDepth).toFixed(4));
        }
        self.loaded = self.depthArr.slice(0,15);
        self.curvesData[self.currentIndex].forEach(curve => {
            curve.show = false;
        })
        $scope.$emit('list:changeWell');
    }
    
    this.$onInit = function () {
        // wiComponentService.putComponent('wiCurveListing',self);
        self.isShowRefWin = false;
        self.datasets = [];
        self.curvesArr = [];
        self.wells = utils.findWells();
        self.curvesData = new Array(self.wells.length).fill().map(u => {return new Array()});
        if(selectedNodes && selectedNodes.length){
            switch (selectedNodes[0].type){
                case 'well':
                self.SelectedWell = selectedNodes[0];
                break;

                case 'dataset':
                self.SelectedWell = utils.findWellById(selectedNodes[0].properties.idWell);
                break;

                case 'curve':
                self.SelectedWell = utils.findWellByCurve(selectedNodes[0].id);
                break;

                default:
                self.SelectedWell = self.wells && self.wells.length ? self.wells[0] : null;
            }
        }
        else {
            self.SelectedWell = self.wells && self.wells.length ? self.wells[0] : null;
        }
        self.currentIndex = self.wells.findIndex(w => { return w.id == self.SelectedWell.id});

        this.onChangeWell();
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                self.wells = utils.findWells();
                self.onChangeWell();
            }, 0);
        });
    };

    this.toggleRefWin = function(){
        self.isShowRefWin = !self.isShowRefWin;
    }
    this.LoadMoreOutPut = function(){
        let len = self.loaded.length;
        console.log('Load more',len);
        self.loaded.push(...self.depthArr.slice(len, len + 15));
    }

    this.onCurveSelectClick = function(name, dataset, id, selected){
        if(selected){
            let curve = self.curvesData[self.currentIndex].find(curve => {
                return curve.id == id;
            })
            if(!curve){
                wiApiService.dataCurve(id, function(data){
                    let dataF = data.map(d => parseFloat(d.x));
                    self.curvesData[self.currentIndex].push({
                        datasetCurve: dataset + '.' + name,
                        id:id,
                        data: dataF,
                        show: true
                    })
                })
            }else{
                let index = self.curvesData[self.currentIndex].findIndex(c => {return c.id == id});
                self.curvesData[self.currentIndex][index].show = true;
            }
        }else{
            let index = self.curvesData[self.currentIndex].findIndex(c => {return c.id == id});
            self.curvesData[self.currentIndex][index].show = false;
        }
    }

    this.onAddCurveButtonClicked = function(){
        console.log('onAddCurveButtonClicked');
    }
    this.onSaveButtonClicked = function(){
        console.log('onSaveButtonClicked');
    }
    this.onRefWinBtnClicked = function(){
        console.log('onRefWinBtnClicked');
    }
    this.isNaN = function(val){
        return isNaN(val);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-curve-listing.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true
    // bindings: {
    //     name: '@'
    // }
});

exports.name = moduleName;

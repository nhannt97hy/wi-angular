const componentName = 'wiCurveListing';
const moduleName = 'wi-curve-listing';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.applyingInProgress = false;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    let spinner = wiComponentService.getComponent('SPINNER');

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
                                    let d = angular.copy(item);
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
    this.onChangeWell = function (clear) {
        getDatasets();
        self.currentIndex = self.wells.findIndex(w => { return w.id == self.SelectedWell.id});
        if(!self.depthArr[self.currentIndex].length){
            spinner.show();
            let step = self.SelectedWell.step;
            let topDepth = self.SelectedWell.topDepth;
            let bottomDepth = self.SelectedWell.bottomDepth;
            let length = Math.round((bottomDepth - topDepth)/step) + 1;
            self.depthArr[self.currentIndex] = new Array(length);
            async.eachOf(self.depthArr[self.currentIndex], function(depth, i, callback){
                self.depthArr[self.currentIndex][i] = parseFloat((step * i + topDepth).toFixed(4));
                async.setImmediate(callback);
            }, function(err){
                $timeout(function(){spinner.hide();});  
            })
        }

        if(clear){
            self.curvesData[self.currentIndex].forEach(curve => {
                curve.show = false;
            })
        }
        self.curvesData[self.currentIndex].forEach(curve => {
            if(curve.show){
                self.curvesArr.find(c => {
                    return c.id == curve.id;
                }).selected = true;
            }
            if(curve.edit){
                self.curvesArr.find(c => {
                    return c.id == curve.id;
                }).modified = true;
            }
        })
    }
    
    this.$onInit = function () {
        wiComponentService.putComponent('WCL', self);
        self.isShowRefWin = false;
        self.datasets = [];
        self.curvesArr = [];
        self.wells = utils.findWells();
        self.curvesData = new Array(self.wells.length).fill().map(u => {return new Array()});
        self.depthArr = new Array(self.wells.length).fill().map(u => {return new Array()});
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

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                async.series([function(callback){
                    self.wells = utils.findWells();
                    self.SelectedWell = self.wells.find(w => {return w.id == self.SelectedWell.id});
                    if(!self.SelectedWell){
                        self.curvesData.splice(self.currentIndex,1);
                        self.SelectedWell = self.wells[0];
                    }
                    callback();
                }], function(err, ret){
                    self.onChangeWell();
                })
                
            }, 0);
        });

        angular.element(document).ready(function(){
            self.onChangeWell(true);
            
            let fcBody = $(".fix-column > .tbody");
            let rcBody = $(".rest-columns > .tbody");
            let rcHead = $(".rest-columns > .thead");

            let onScroll = function(){
                fcBody.scrollTop(rcBody.scrollTop());
                rcHead.scrollLeft(rcBody.scrollLeft());
            }
            rcBody.scroll(_.throttle(onScroll, 100));
        })
    };

    this.toggleRefWin = function(){
        self.isShowRefWin = !self.isShowRefWin;
    }

    this.goToDepth = function(){
        let index;
        let rcBody = $(".rest-columns > .tbody");
        
        if(self.depthInput <= self.SelectedWell.topDepth){
            index = 0;
        }else if(self.depthInput >= self.SelectedWell.bottomDepth){
            index = self.depthArr[self.currentIndex].length - 1;
        }else{
            index = Math.round((self.depthInput - self.SelectedWell.topDepth)/self.SelectedWell.step);
        }

        rcBody.scrollTop(index * 30);

    }

    this.onCurveSelectClick = function(SelCurve){
        if(SelCurve.selected){
            let curve = self.curvesData[self.currentIndex].find(curve => {
                return curve.id == SelCurve.id;
            })
            if(!curve){
                wiApiService.dataCurve(SelCurve.id, function(data){
                    let dataF = data.map(d => parseFloat(d.x));
                    self.curvesData[self.currentIndex].push({
                        name: SelCurve.name,
                        datasetName: SelCurve.datasetName,
                        idDataset: SelCurve.properties.idDataset,
                        id: SelCurve.id,
                        data: dataF,
                        dataBK: angular.copy(dataF),
                        show: true
                    })
                })
            }else{
                let index = self.curvesData[self.currentIndex].findIndex(c => {return c.id == SelCurve.id});
                self.curvesData[self.currentIndex][index].show = true;
            }
        }else{
            let index = self.curvesData[self.currentIndex].findIndex(c => {return c.id == SelCurve.id});
            self.curvesData[self.currentIndex][index].show = false;
        }
    }

    this.onModifyCurve = function(id){
        self.curvesArr.find(c => {
            return c.id == id;
        }).modified = true;
    }

    this.reverseModified = function(id){
        let curve = self.curvesData[self.currentIndex].find(c => {
            return c.id == id;
        })
        $timeout(function(){
            curve.data = angular.copy(curve.dataBK);
            self.curvesArr.find(c => {return c.id == id;}).modified = false;
        })
    }

    this.onAddCurveButtonClicked = function(){
        console.log('onAddCurveButtonClicked');
        DialogUtils.addCurveDialog(ModalService);
    }
    this.onSaveButtonClicked = function(){
        console.log('onSaveButtonClicked');
        let modifiedCurves = [];
        modifiedCurves = self.curvesData[self.currentIndex].filter(c => {
                return c.edit;
            });
        
        if(modifiedCurves.length){
            DialogUtils.saveCurvesDialog(ModalService, modifiedCurves, function(){
                console.log('save curves successed!');
                $timeout(function(){
                    self.curvesArr.forEach(curve => {
                        delete curve.modified;
                    })
                })
            })
        }
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
    controllerAs: componentName
});

exports.name = moduleName;

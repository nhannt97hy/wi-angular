let helper = require('./DialogHelper');
module.exports = function(ModalService, wiComponentService){
    function ModalController(wiComponentService, wiApiService, close, $timeout){
        let self = this;
        window.CFilter = this;
        let _top = 0, _bottom;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.percent = 0;

        this.createOp = 'backup';
        this.filterOp = '5';
        this.numLevel = 5;this.polyOder = 2;this.devOrder = 0;this.numPoints = 5;this.cutoff = 100;
        this.table = new Array(5).fill(0.2).map(d => {return parseFloat(d.toFixed(4))});
        this.wells = utils.findWells();
        this.datasets = [];
        this.curvesArr = [];
        this.curveData = null;
        let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
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
                                        self.curvesArr.push(item);
                                    }
                                })
                            })
                        }
                    }
                });
            }
        }

        this.defaultDepthButtonClick = function(){
            self.topDepth = self.SelectedWell.topDepth;
            self.bottomDepth = self.SelectedWell.bottomDepth;
        }
        this.onChangeWell = function () {
            getDatasets();
            self.defaultDepthButtonClick();
            self.SelectedCurve = self.curvesArr[0];
        }
        this.onChangeWell();
        this.onRefresh = function() {
            self.applyingInProgress = false;
            self.percent = 0;
            $timeout(function(){
                self.wells = utils.findWells();
                self.SelectedWell = self.wells.find(w => {return w.id == self.SelectedWell.id});
                self.onChangeWell();
            }, 0);
        };
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);

        this.onCancelButtonClicked = function(){
            wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
            close(null);
        }
        this.groupFn = function(item){
            return item.properties.dataset;
        }

        this.onChangeCurve = function(){
            if(self.createOp == 'new') self.curveName = self.SelectedCurve.name;
        }

        this.validate = function(){
            if(self.applyingInProgress) return true;
            if(self.filterOp == '2'){
                return !self.polyOder || self.devOrder == null || ! self.numPoints;
            }else if (self.filterOp == '4'){
                let range = Math.floor((self.bottomDepth - self.topDepth)/self.SelectedWell.step);
                return !self.cutoff || self.cutoff > range;
            }
            else{
                return !self.numLevel;
            }
            if(self.createOp == 'new') return !self.curveName;
        }
        this.onNumLevelChange = function(){
            if(self.numLevel %2 == 0) self.numLevel = self.numLevel + 1;
            if(self.filterOp == '6'){
                self.table = new Array(self.numLevel).fill(1/self.numLevel).map(d => {return parseFloat(d.toFixed(4))});
            }
        }
        function isExisted(curveName, dataset){
            return self.curvesArr.find(curve => {
                return curve.name.toUpperCase() == curveName.toUpperCase() && curve.properties.idDataset == dataset;
            })
        }
        function getData(callback){
            delete self.curveData;
            wiApiService.dataCurve(self.SelectedCurve.id, function(data){
                self.curveData = data.map(d => {return parseFloat(d.x)});
                if(callback) callback();
            })
        }

        function saveCurve(data){
            let payload = null;
            switch(self.createOp){
                case 'backup':
                    let backup = angular.copy(self.SelectedCurve.properties);
                    let i = isExisted(backup.name, backup.idDataset);
                    while(i){
                        backup.name = backup.name + '_BK';
                        i = isExisted(backup.name, backup.idDataset);
                    }
                    $timeout(function(){
                        console.log('do backup curve');
                        wiApiService.editCurve(backup, function(res, err){
                            if(!err){
                                payload = {
                                    idDataset: self.SelectedCurve.properties.idDataset,
                                    curveName: self.SelectedCurve.properties.name,
                                    unit: self.SelectedCurve.properties.unit,
                                    data: data
                                };
                                wiApiService.processingDataCurve(payload, function(){
                                    utils.refreshProjectState();
                                },function(percent){
                                    self.percent = percent;
                                })
                            }
                        })

                    },500)
                    break;

                case 'new':
                    payload = {
                        idDataset: self.SelectedDataset.id,
                        curveName: self.curveName,
                        unit: self.SelectedCurve.properties.unit,
                        idDesCurve: self.SelectedCurve.id,
                        data: data
                    };
                    if(isExisted(payload.curveName, payload.idDataset)){
                        delete payload.curveName;
                    } else{
                        delete payload.idDesCurve;
                    }

                    wiApiService.processingDataCurve(payload, function(res){
                        if(!res.idCurve) {
                            wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {
                                idCurve: payload.idDesCurve,
                                data: payload.data
                            })
                        }
                        utils.refreshProjectState();
                    },function(percent){
                        self.percent = percent;
                    })
                    break;
            }
        }

        function squareFilter(){
            console.log('squareFilter');
            async.eachOfSeries(self.curveData, (depth, idx, callback) => {
                if(idx >= _top && idx <= _bottom){
                    let len = (self.numLevel - 1)/2;
                    let start = idx - len;
                    start = start > 0 ? start : 0;
                    let end = idx + len;
                    let range = self.curveData.slice(start, end + 1).filter(d => !isNaN(d));
                    let weight = 1/range.length;
                    let out = range.reduce((acc, cur) => {
                        return acc + cur * weight;
                    },0);
                    self.curveData[idx] = parseFloat(out.toFixed(4));
                    async.setImmediate(callback);
                }else{
                    async.setImmediate(callback);
                }
            },function(err){
                console.log('Done!');
                saveCurve(self.curveData);
            })
        }
        function savgoFilter(){
            console.log('savgoFilter');
            let lstIndex = new Array();
            let inputF = new Array();
            for(let i = 0; i < self.curveData.length; i++){
                if(!isNaN(self.curveData[i]) && i <= _bottom && i >= _top){
                    inputF.push(self.curveData[i]);
                    lstIndex.push(i);
                }
            }
            let out = new Array(self.curveData.length).fill(NaN);

            wiApiService.savgolfil({input: inputF, length: self.numPoints, poly: self.polyOder, deriv: self.devOrder}, (result) => {
                let retArr = result.curve;
                let len = Math.min(lstIndex.length, retArr.length);
                for(let j = 0; j < len; j++){
                    out[lstIndex[j]] = retArr[j];
                    if(j == len - 1) {
                        console.log('Done!');
                        saveCurve(out);
                    }
                }
            })
        }
        function bellFilter(){
            console.log('bellFilter');
            async.eachOfSeries(self.curveData, (depth, idx, callback) => {
                if(idx >= _top && idx <= _bottom){
                    let len = (self.numLevel - 1)/2;
                    let start = idx - len;
                    start = start > 0 ? start : 0;
                    let end = idx + len;
                    let range = self.curveData.slice(start, end + 1);
                    let out = range.reduce((acc, curVal, curIdx) => {
                        let curW = (1 - Math.cos(2 * Math.PI * (curIdx + 1)/(range.length + 1)))/(range.length + 1);
                        return acc + (curVal || 0) * curW;
                    },0);
                    self.curveData[idx] = parseFloat(out.toFixed(4));
                    async.setImmediate(callback);
                }else{
                    async.setImmediate(callback);
                }
            },function(err){
                console.log('Done!');
                saveCurve(self.curveData);
            })
        }
        function fftFilter(){
            console.log('fftFilter');
            let lstIndex = new Array();
            let inputF = new Array();
            for(let i = 0; i < self.curveData.length; i++){
                if(!isNaN(self.curveData[i]) && i >= _top && i <= _bottom){
                    inputF.push(self.curveData[i]);
                    lstIndex.push(i);
                }
            }
            let out = new Array(self.curveData.length).fill(NaN);

            wiApiService.fftfil({input: inputF, length: self.cutoff}, (result) => {
                let retArr = result.curve;
                let len = Math.min(lstIndex.length, retArr.length);
                for(let j = 0; j < len; j++){
                    out[lstIndex[j]] = retArr[j];
                    if(j == len - 1) {
                        console.log('Done!');
                        saveCurve(out);
                    }
                }
            })
        }
        function medianFilter(){
            console.log('medianFilter');
            let lstIndex = new Array();
            let inputF = new Array();
            for(let i = 0; i < self.curveData.length; i++){
                if(!isNaN(self.curveData[i]) && i >= _top && i <= _bottom){
                    inputF.push(self.curveData[i]);
                    lstIndex.push(i);
                }
            }
            let out = new Array(self.curveData.length).fill(NaN);

            wiApiService.medfil({input: inputF, length: self.numLevel}, (result) => {
                let retArr = result.curve;
                let len = Math.min(lstIndex.length, retArr.length);
                for(let j = 0; j < len; j++){
                    out[lstIndex[j]] = retArr[j];
                    if(j == len - 1) {
                        console.log('Done!');
                        saveCurve(out);
                    }
                }
            })
        }
        function customFilter(){
            console.log('customFilter');
            async.eachOfSeries(self.curveData, (depth, idx, callback) => {
                if(idx >= _top && idx <= _bottom){
                    let len = (self.numLevel - 1)/2;
                    let start = idx - len;
                    start = start > 0 ? start : 0;
                    let end = idx + len;
                    let range = self.curveData.slice(start, end + 1);
                    if(range.length < self.numLevel){
                        let add = new Array(self.numLevel - range.length).fill(0);
                        if(start == 0){
                            range = add.concat(range);
                        }else{
                            range = range.concat(add);
                        }
                    }
                    console.log(range);
                    let out = range.reduce((acc, curVal, curIdx) => {
                        return acc + (curVal || 0) * self.table[curIdx];
                    },0);
                    self.curveData[idx] = parseFloat(out.toFixed(4));
                    async.setImmediate(callback);
                }else{
                    async.setImmediate(callback);
                }
            },function(err){
                console.log('Done!');
                saveCurve(self.curveData);
            })
        }

        function run(){
            _top = Math.round((self.topDepth - self.SelectedWell.topDepth)/self.SelectedWell.step);
            _bottom = Math.round((self.bottomDepth - self.SelectedWell.topDepth)/self.SelectedWell.step);
            getData(function(){
                switch(self.filterOp){
                    case '1':
                    squareFilter();
                    break;

                    case '2':
                    savgoFilter();
                    break;

                    case '3':
                    bellFilter();
                    break;

                    case '4':
                    fftFilter();
                    break;

                    case '5':
                    medianFilter();
                    break;

                    case '6':
                    customFilter();
                    break;
                }
            })
        }
        this.onRunButtonClicked = function(){
            self.applyingInProgress = true;
            if(self.createOp == 'new'){
                if(isExisted(self.curveName, self.SelectedDataset.id)){
                    DialogUtils.confirmDialog(ModalService, "Save Curve", "OverWrite?", function (ret) {
                        if(ret){
                            run();
                        }else{
                            self.applyingInProgress = false;
                        }
                    })
                }else{
                    run();
                }
            }else{
                run();
            }
        }
    }

    ModalService.showModal({
        templateUrl: "curve-filter-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}
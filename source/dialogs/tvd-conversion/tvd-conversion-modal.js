let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService) {
    function ModalController(wiComponentService, wiApiService, close, $timeout) {
        let self = this;
        window.tvd = this;
        this.applyingInProgress = false;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let dialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

        this.wells = utils.findWells();
        this.datasets = [];
        this.curvesArr = [];
        this.step;this.topDepth; this.bottomDepth;
        this.SelectedWell; this.SelectedDataset;
        this.useType = 'file';
        this.startData = 2, this.colDepth = 1, this.colDev = 2, this.colAzi = 3;
        this.tvdMethod = 'off', this.calMethod = '1';
        this.elevation = 0, this.xRef = 0, this.yRef = 0;
        this.input = [];
        this.curvesData = [];
        this.groupFn = function(item){
            return item.parent;
        }

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

        this.onChangeWell = function () {
            getDatasets();
            // if(self.curvesArr.length){
                self.DevCurve = null;
                self.AziCurve = null;
            // }
            self.step = self.SelectedWell.step;
            self.topDepth = self.SelectedWell.topDepth;
            self.bottomDepth = self.SelectedWell.bottomDepth;
            self.tvdRef = self.SelectedWell.topDepth;
            let length = Math.round((self.bottomDepth - self.topDepth)/self.step) + 1;
            self.FullSize = new Array(length);
            for(let i = 0; i < length; i++){
                self.FullSize[i] = parseFloat((self.step * i + self.topDepth).toFixed(4));
            }
            self.FullSizeLoaded = self.FullSize.slice(0,10);
            self.FullSizeCurve = self.FullSize.slice(0,10);
            self.outdevArr = new Array(length);
            self.outaziArr = new Array(length);
            self.outtvdArr = new Array(length);
            self.outtvdssArr = new Array(length);
            self.outnorthArr = new Array(length);
            self.outeastArr = new Array(length);
            self.outxArr = new Array(length);
            self.outyArr = new Array(length);
        }
        this.onChangeWell();
        this.onRefresh = function() {
            self.applyingInProgress = false;
            self.curvesData.length = 0;
            $timeout(function(){
                self.wells = angular.copy(utils.findWells());
                self.onChangeWell();
            }, 0);
        };

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        this.LoadMoreInputCurve = () => {
            let len = self.FullSizeCurve.length;
            self.FullSizeCurve.push(...self.FullSize.slice(len, len + 10));
        }
        this.LoadMorePreview = () => {
            if(self.SizeLoaded){
                let len = self.SizeLoaded.length;
                self.SizeLoaded.push(...self.Size.slice(len, len + 10));
            }
        }
        this.LoadMoreOutPut = () => {
            let len = self.FullSizeLoaded.length;
            self.FullSizeLoaded.push(...self.FullSize.slice(len, len + 10));
        }
        this.loadFile = function(){
            if(self.SurveyFile){
                self.input.length = 0;
                if(self.SurveyFile.type.match('text')){
                    let reader = new FileReader();
                    reader.onload = function(event){
                        let lines = this.result.split('\n');
                        let max = -1;
                        for(let i = 0; i < lines.length; i++){
                            let ele = lines[i].replace(/\(|\)/g,'').replace(/ /g, '').split(/\s+/);
                            if(i > 0) ele.pop();
                            max = max > ele.length ? max : ele.length;
                            if(ele.length) self.input.push(ele);
                        }
                        self.input.forEach(function(d){
                            d.length = max;
                        })
                    }
                    reader.readAsText(self.SurveyFile);
                }else{
                    utils.error('Supported text file(.txt) only!');
                    delete self.SurveyFile;
                }
            }
        }
        this.loadCurves = function(){
            function loadAzi(){
                if(self.AziCurve){
                    let azi = self.curvesData.find(curve => {return curve.id == self.AziCurve.id});
                    if(azi){
                        self.aziArr = azi.data;
                    }else{
                        wiApiService.dataCurve(self.AziCurve.id, function(dataCurve){
                            let data = dataCurve.map(d => {return parseFloat(d.x);});
                            self.curvesData.push({
                                id: self.AziCurve.id,
                                data: data
                            })
                            self.aziArr = data;
                        })
                    }
                }
            }
            if(self.DevCurve){
                let dev = self.curvesData.find(curve => {return curve.id == self.DevCurve.id});
                if(dev){
                    self.devArr = dev.data;
                    loadAzi();
                }else{
                    wiApiService.dataCurve(self.DevCurve.id, function(dataCurve){
                        let data = dataCurve.map(d => {return parseFloat(d.x);});
                        self.curvesData.push({
                            id: self.DevCurve.id,
                            data: data
                        })
                        self.devArr = data;
                        loadAzi();
                    })
                }
            }
        }

        function calcOutput(){
            if(self.useType == 'file'){
                console.log('interpolation begin');
                for(let i = 0; i < self.Size.length - 1; i++){
                    let top = self.depthArr[i];
                    let bottom = self.depthArr[i + 1];
                    for(let j = 0; j < self.FullSize.length; j++){
                        if(self.FullSize[j] == top){
                            self.outtvdArr[j] = self.tvdArr[i];
                            self.outtvdssArr[j] = self.tvdssArr[i];
                            self.outdevArr[j] = self.devArr[i];
                            self.outaziArr[j] = self.aziArr[i];
                            self.outnorthArr[j] = self.northArr[i];
                            self.outeastArr[j] = self.eastArr[i];
                            self.outxArr[j] = self.xArr[i];
                            self.outyArr[j] = self.yArr[i];
                        }else if (self.FullSize[j] == bottom){
                            self.outtvdArr[j] = self.tvdArr[i + 1];
                            self.outtvdssArr[j] = self.tvdssArr[i + 1];
                            self.outdevArr[j] = self.devArr[i + 1];
                            self.outaziArr[j] = self.aziArr[i + 1];
                            self.outnorthArr[j] = self.northArr[i + 1];
                            self.outeastArr[j] = self.eastArr[i + 1];
                            self.outxArr[j] = self.xArr[i + 1];
                            self.outyArr[j] = self.yArr[i + 1];
                        }else if(self.FullSize[j] > top && self.FullSize[j] < bottom){
                            let y = (self.FullSize[j] - top)/(bottom - top);
                            self.outtvdArr[j] = parseFloat((self.tvdArr[i] + (self.tvdArr[i + 1] - self.tvdArr[i]) * y).toFixed(6));
                            self.outtvdssArr[j] = parseFloat((self.tvdssArr[i] + (self.tvdssArr[i + 1] - self.tvdssArr[i]) * y).toFixed(6));
                            self.outdevArr[j] = parseFloat((self.devArr[i] + (self.devArr[i + 1] - self.devArr[i]) * y).toFixed(6));
                            self.outaziArr[j] = parseFloat((self.aziArr[i] + (self.aziArr[i + 1] - self.aziArr[i]) * y).toFixed(6));
                            self.outnorthArr[j] = parseFloat((self.northArr[i] + (self.northArr[i + 1] - self.northArr[i]) * y).toFixed(6));
                            self.outeastArr[j] = parseFloat((self.eastArr[i] + (self.eastArr[i + 1] - self.eastArr[i]) * y).toFixed(6));
                            self.outxArr[j] = parseFloat((self.xArr[i] + (self.xArr[i + 1] - self.xArr[i]) * y).toFixed(6));
                            self.outyArr[j] = parseFloat((self.yArr[i] + (self.yArr[i + 1] - self.yArr[i]) * y).toFixed(6));
                        }
                    }
                }
                if(self.depthArr[self.depthArr.length - 1] < self.FullSize[self.FullSize.length - 1]){
                    let top = self.depthArr.length - 2;
                    let bottom = self.depthArr.length - 1;
                    let init = parseInt(self.depthArr[self.depthArr.length - 1] - self.topDepth/self.step);
                    for(let j = init + 1; j < self.FullSize.length; j++){
                        let y = (self.FullSize[j] - self.depthArr[top])/(self.depthArr[bottom] - self.depthArr[top]);
                        self.outtvdArr[j] = parseFloat((self.tvdArr[top] + (self.tvdArr[bottom] - self.tvdArr[top]) * y).toFixed(6));
                        self.outtvdssArr[j] = parseFloat((self.tvdssArr[top] + (self.tvdssArr[bottom] - self.tvdssArr[top]) * y).toFixed(6));
                        self.outdevArr[j] = parseFloat((self.devArr[top] + (self.devArr[bottom] - self.devArr[top]) * y).toFixed(6));
                        self.outaziArr[j] = parseFloat((self.aziArr[top] + (self.aziArr[bottom] - self.aziArr[top]) * y).toFixed(6));
                        self.outnorthArr[j] = parseFloat((self.northArr[top] + (self.northArr[bottom] - self.northArr[top]) * y).toFixed(6));
                        self.outeastArr[j] = parseFloat((self.eastArr[top] + (self.eastArr[bottom] - self.eastArr[top]) * y).toFixed(6));
                        self.outxArr[j] = parseFloat((self.xArr[top] + (self.xArr[bottom] - self.xArr[top]) * y).toFixed(6));
                        self.outyArr[j] = parseFloat((self.yArr[top] + (self.yArr[bottom] - self.yArr[top]) * y).toFixed(6));
                    }
                }
            }else{
                self.outtvdArr = self.tvdArr;
                self.outtvdssArr = self.tvdssArr;
                self.outdevArr = self.devArr;
                self.outaziArr = self.aziArr;
                self.outnorthArr = self.northArr;
                self.outeastArr = self.eastArr;
                self.outxArr = self.xArr;
                self.outyArr = self.yArr;
            }
        }

        function formula1(){
            console.log('Average Angle');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev = ((self.devArr[i - 1] + self.devArr[i])/2) * Math.PI / 180 ;
                let azi = ((self.aziArr[i - 1] + self.aziArr[i])/2) * Math.PI / 180;
                let n = md * Math.sin(dev) * Math.cos(azi);
                let e = md * Math.sin(dev) * Math.sin(azi);
                let tvd = md * Math.cos(dev);

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});
            }
            calcOutput();
        }
        function formula2(){
            console.log('Balanced Tangential');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev1 = self.devArr[i - 1] * Math.PI / 180 ;
                let dev2 = self.devArr[i] * Math.PI / 180 ;
                let azi1 = self.aziArr[i - 1] * Math.PI / 180;
                let azi2 = self.aziArr[i] * Math.PI / 180;
                let n = md/2 * (Math.sin(dev1) * Math.cos(azi1) + Math.sin(dev2) * Math.cos(azi2));
                let e = md/2 * (Math.sin(dev1) * Math.sin(azi1) + Math.sin(dev2) * Math.sin(azi2));
                let tvd = md/2 * (Math.cos(dev1) + Math.cos(dev2));

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});
            }
            calcOutput();
        }
        function formula3(){
            console.log('Radius Curvature');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev1 = self.devArr[i - 1] * Math.PI / 180 ;
                let dev2 = self.devArr[i] * Math.PI / 180 ;
                let azi1 = self.aziArr[i - 1] * Math.PI / 180;
                let azi2 = self.aziArr[i] * Math.PI / 180;
                let n = md * (Math.cos(dev1) - Math.cos(dev2)) * (Math.sin(azi2) - Math.sin(azi1)) * Math.pow(180/Math.PI, 2)/((self.devArr[i] - self.devArr[i - 1])*(self.aziArr[i] - self.aziArr[i - 1]));
                let e = md * (Math.cos(dev1) - Math.cos(dev2)) * (Math.cos(azi1) - Math.cos(azi2)) * Math.pow(180/Math.PI, 2)/((self.devArr[i] - self.devArr[i - 1])*(self.aziArr[i] - self.aziArr[i - 1]));
                let tvd = md * (Math.sin(dev2) - Math.sin(dev1)) * (180/Math.PI) /(self.devArr[i] - self.devArr[i - 1]);

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});
            }
            calcOutput();
        }
        function formula4(){
            console.log('Minimum Curvature');
            for(let i = 1; i < self.Size.length; i++){
                let md;
                if(self.useType == 'file'){
                    md = self.depthArr[i] - self.depthArr[i - 1];
                }else{
                    md = self.step;
                }
                let dev1 = self.devArr[i - 1] * Math.PI / 180 ;
                let dev2 = self.devArr[i] * Math.PI / 180 ;
                let azi1 = self.aziArr[i - 1] * Math.PI / 180;
                let azi2 = self.aziArr[i] * Math.PI / 180;
                let b = Math.acos((Math.cos(dev2 - dev1) - Math.sin(dev1) * Math.sin(dev2) * (1 - Math.cos(azi2-azi1))) * Math.PI / 180);
                let RF = 2/b * Math.tan(b/2 * Math.PI / 180);
                let n = md/2 * (Math.sin(dev1) * Math.cos(azi1) + Math.sin(dev2) * Math.cos(azi2)) * RF;
                let e = md/2 * (Math.sin(dev1) * Math.sin(azi1) + Math.sin(dev2) * Math.sin(azi2)) * RF;
                let tvd = md/2 * (Math.cos(dev1) + Math.cos(dev2)) * RF;

                self.tvdArr[i] = self.tvdArr[i - 1] + tvd;
                self.northArr[i] = self.northArr[i - 1] + n;
                self.eastArr[i] = self.eastArr[i - 1] + e;
                self.xArr[i] = self.xArr[i - 1] + e;
                self.yArr[i] = self.yArr[i - 1] + n;
            }
            if(self.tvdMethod == 'off'){
                self.tvdssArr = self.tvdArr.map(d => {return d - self.elevation;});
            }else{
                self.tvdssArr = self.tvdArr.map(d => {return self.elevation - d;});
            }
            calcOutput();
        }

        function processing(){
            self.tvdArr[0] = self.depthArr[0];
            self.northArr[0] = 0;
            self.eastArr[0] = 0;
            self.xArr[0] = self.xRef;
            self.yArr[0] = self.yRef;
            // self.radiusArr[0] = 0;

            switch (self.calMethod){
                case '1':
                formula1();
                break;

                case '2':
                formula2();
                break;

                case '3':
                formula3();
                break;

                case '4':
                formula4();
                break;
            }
        }

        function saveCurves(){
            let names = ['TVD', 'TVDSS', 'X', 'Y', 'North', 'East', 'Deviation', 'Azimuth'];
            let curvesExist = [];
            self.curvesArr.forEach(curve => {
                if(names.indexOf(curve.name.toUpperCase()) != -1 && curve.properties.idDataset == self.SelectedDataset.id){
                    curvesExist.push(curve.name);
                }
            })

            function save(){
                let payloads = [
                {
                    curveName: 'TVD',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outtvdArr
                },
                {
                    curveName: 'TVDSS',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outtvdssArr
                },
                {
                    curveName: 'X',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outxArr
                },
                {
                    curveName: 'Y',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outyArr
                },
                {
                    curveName: 'North',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outnorthArr
                },
                {
                    curveName: 'East',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outeastArr
                },
                {
                    curveName: 'Deviation',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outdevArr
                },
                {
                    curveName: 'Azimuth',
                    idDataset: self.SelectedDataset.id,
                    isDesCurve: null,
                    data: self.outaziArr
                }
                ];
                async.each(payloads, (payload, callback) => {
                    let overwrite = self.curvesArr.find(curve => {return curve.name == payload.curveName && curve.properties.idDataset == payload.idDataset;});
                    if(overwrite) {
                        delete payload.curveName;
                        payload.idDesCurve = overwrite.id;
                    }
                    wiApiService.processingDataCurve(payload, function(res){
                        if(!res.idCurve) {
                            wiComponentService.emit(wiComponentService.MODIFIED_CURVE_DATA, {
                                idCurve: payload.idDesCurve,
                                data: payload.data
                            })
                        }
                        console.log('Saved', payload.curveName);
                        callback();
                    })
                }, function(err){
                    utils.refreshProjectState();
                    console.log('Save successfull!');
                })
            }

            if(curvesExist.length){
                let html  = curvesExist.map(c => {return '</br>' + c;});

                dialogUtils.confirmDialog(ModalService, "Save Curves", "Curve Exist:" + html,function(ret){
                    if(ret){
                        console.log('overwrite');
                        save();
                    }else{
                        self.applyingInProgress = false;
                        console.log('Cancel Overwrite!');
                    }
                })
            }else{
                console.log('not exist');
                save();
            }
        }

        this.onRunButtonClicked = function(save){
            if(self.applyingInProgress) return;
            self.applyingInProgress = true;

            if(self.useType == 'file'){
                if(self.SurveyFile){
                    let length = self.input.length - self.startData;
                    self.Size = new Array(length);
                    self.depthArr = new Array(length);
                    self.devArr = new Array(length);
                    self.aziArr = new Array(length);
                    self.tvdArr = new Array(length);
                    self.tvdssArr = new Array(length);
                    self.northArr = new Array(length);
                    self.eastArr = new Array(length);
                    self.xArr = new Array(length);
                    self.yArr = new Array(length);
                    // self.radiusArr = new Array(length);

                    let first = parseFloat(isNaN(self.input[self.startData][self.colDepth - 1]) ? 0 : self.input[self.startData][self.colDepth - 1]);
                    self.depthArr[0] = self.tvdRef <  first ? self.tvdRef : first;
                    for(let i = 1; i < length; i++){
                        let d = self.input[i + self.startData][self.colDepth - 1];
                        self.depthArr[i] = parseFloat(d == undefined || isNaN(d) ? 0 : d);
                    }
                    for(let j = 0; j < length; j++){
                        let d = self.input[j + self.startData][self.colDev - 1];
                        let a = self.input[j + self.startData][self.colAzi - 1];
                        self.devArr[j] = parseFloat(d == undefined || isNaN(d) ? 0 : d);
                        self.aziArr[j] = parseFloat(a == undefined || isNaN(a) ? 0 : a);
                    }
                    async.series([function(cb){
                        processing();
                        cb();
                    }], function(err, ret){
                        console.log('Done Processing!');
                        self.SizeLoaded = self.Size.slice(0,10);
                        if(save){
                            saveCurves();
                        }else{
                            self.applyingInProgress = false;
                        }
                    })
                }else{
                    utils.error('Please open supported survey file!');
                    self.applyingInProgress = false;
                }
            }else{
                if(self.DevCurve && self.AziCurve){
                    let length = self.FullSize.length;
                    self.Size = new Array(length);
                    self.depthArr = new Array(length);
                    self.tvdArr = new Array(length);
                    self.tvdssArr = new Array(length);
                    self.northArr = new Array(length);
                    self.eastArr = new Array(length);
                    self.xArr = new Array(length);
                    self.yArr = new Array(length);
                    // self.radiusArr = new Array(length);
                    self.depthArr[0] = self.tvdRef < self.topDepth ? self.tvdRef : self.topDepth;
                    for(let i = 1; i < length; i++){
                        self.depthArr[i] = i * self.step + self.topDepth;
                    }
                    async.series([function(cb){
                        processing();
                        cb();
                    }], function(err, ret){
                        console.log('Done Processing!');
                        if(save){
                            saveCurves();
                        }else{
                            self.applyingInProgress = false;
                        }
                    })
                }else{
                    utils.error('Please choose Deviation and Azimuth Curve!');
                    self.applyingInProgress = false;
                }
            }

        }

        this.onCancelButtonClicked = function(){
                close(null);
                wiComponentService.removeEvent(wiComponentService.PROJECT_REFRESH_EVENT, self.onRefresh);
        }
    }
    ModalService.showModal({
        templateUrl: "tvd-conversion-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function () {
            helper.removeBackdrop();
        });
    });
}
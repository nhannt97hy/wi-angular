let helper = require('./DialogHelper');
module.exports = function (ModalService, item) {
    const _FNEW = 1;
    const _FEDIT = 2;
    const _FDEL = 3;
    function ModalController(close, wiComponentService, wiApiService, $timeout, $scope) {
        let self = this;
        let _currentZoneSetId = null;
        this.applyingInProgress = false;
        let errorMessage = 'Zones are invalid!';

        window.zoneMng = this;
        this._FNEW = _FNEW;
        this._FEDIT = _FEDIT;
        this._FDEL = _FDEL;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
        this.project = wiComponentService.getComponent(wiComponentService.WI_EXPLORER).treeConfig[0];
        //this.wellArr = this.project.children;
        this.wellArr = utils.findWells();
/*
        let selectedNode = utils.getSelectedNode();
        let idWell = null;
        if (selectedNode && selectedNode.type == 'user_defined') {
            idWell = selectedNode.properties.idWell;
        }
        if (!idWell) return;
*/
        this.SelectedWell = this.wellArr[0];
        //this.SelectedWell = utils.findWellById(idWell);
        this.zonesetsArr = self.SelectedWell.children.find(function (child) {
            return child.type == 'user_defined';
        }).children.filter(c => c.type == 'zoneset');
        this.SelectedZoneSet = self.zonesetsArr.length ? self.zonesetsArr[0] : null;

        this.zoneArr = this.SelectedZoneSet ? angular.copy(this.SelectedZoneSet.children) : null;

        this.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function() {
            self.applyingInProgress = false;
            $timeout(function(){
                self.refreshZoneSets();
                setSelectedZoneSet(_currentZoneSetId);
            }, 0);
        });
        switch (item.type) {
            case 'well':
                self.wellArr.forEach(function(well, i){
                    if(well.id == item.id){
                        self.SelectedWell = self.wellArr[i];
                        self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                            return child.type == 'user_defined';
                        }).children.filter(c => c.type == 'zoneset');
                        self.SelectedZoneSet = self.zonesetsArr.length ? self.zonesetsArr[0] : null;
                        self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
                        self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
                    }
                })
                break;

            case 'user_defined':
                self.wellArr.forEach(function(well, i){
                    if(well.id == item.properties.idWell){
                        self.SelectedWell = self.wellArr[i];
                        self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                            return child.type == 'user_defined';
                        }).children.filter(c => c.type == 'zoneset');
                        self.SelectedZoneSet = self.zonesetsArr.length ? self.zonesetsArr[0] : null;
                        _currentZoneSetId = self.SelectedZoneSet?self.SelectedZoneSet.properties.idZoneSet:null;
                        self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
                        self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
                    }
                })
                break;

            case 'zoneset':
                self.wellArr.forEach(function(well, i){
                    if(well.id == item.properties.idWell){
                        self.SelectedWell = self.wellArr[i];
                        self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                            return child.type == 'user_defined';
                        }).children.filter(c => c.type == 'zoneset');

                        _currentZoneSetId = item.id;
                        setSelectedZoneSet(_currentZoneSetId);

                    }
                })
                break;

            case 'zone':
                self.wellArr.forEach(function(well, i){
                    let zonesetsArr = well.children.find(function (child) {
                        return child.type == 'user_defined';
                    }).children.filter(c => c.type == 'zoneset');

                    zonesetsArr.forEach(function(zoneset, j){
                        if(zoneset.id == item.properties.idZoneSet){
                            self.SelectedWell = self.wellArr[i];
                            self.zonesetsArr = zonesetsArr;
                            self.SelectedZoneSet = self.zonesetsArr[j];
                            self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;

                            self.zoneArr.forEach(function(zone, k){
                                if(zone.id == item.id){
                                    self.SelectedZone = k;
                                }
                            });
                        }
                    })
                })
                break;
        }

        buildDisplayZoneArr();

        // METHOD Section begins
        function setSelectedZoneSet(cZonesetId) {
            self.SelectedZone = null;
            self.zonesetsArr.forEach(function(zoneset, j){
                if(zoneset.id == cZonesetId){
                    self.SelectedZoneSet = self.zonesetsArr[j];
                    self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
                    self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
                }
            });
        }
        function buildDisplayZoneArr() {
            if(self.zoneArr && self.zoneArr.length){
                self.zoneArr.sort(function(z1, z2) {
                    return z1.properties.startDepth > z2.properties.startDepth;
                });
            }
        }

        this.setClickedRow = function (indexRow) {
            self.SelectedZone = indexRow;
        }
        this.onZoneChanged = function(index, attr) {
            if(typeof self.zoneArr[index].flag === 'undefined'){
                self.zoneArr[index].flag = _FEDIT;
            }
        }
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        this.foregroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zoneArr[index].properties.foreground, function (colorStr) {
                self.zoneArr[index].properties.fill.pattern.foreground = colorStr;
                self.onZoneChanged(index);
            });
        };
        this.backgroundZone = function (index) {
            DialogUtils.colorPickerDialog(ModalService, self.zoneArr[index].properties.background, function (colorStr) {
                self.zoneArr[index].properties.fill.pattern.background = colorStr;
                self.onZoneChanged(index);
            });
        };

        this.onRenameZoneSet = function(){
            utils.renameZoneSet(self.SelectedZoneSet);
        }

        this.refreshZoneSets = function(){
            self.wellArr = utils.findWells();
            let tmp = self.SelectedWell.id;
            self.SelectedWell = self.wellArr.find(function(well){
                return well.id == tmp;
            })
            self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                return child.name == 'user_defined';
            }).children.filter(c => c.type == 'zoneset');
            buildDisplayZoneArr();
        }
        this.onAddZoneSet = function(){
            utils.createZoneSet(self.SelectedWell.id, function (dataReturn) {
                console.log('zoneSet created', dataReturn);
                _currentZoneSetId = dataReturn.idZoneSet;
            });
        }

        this.onChangeWell = function () {
            self.zonesetsArr = self.SelectedWell.children.find(function (child) {
                return child.name == 'user_defined';
            }).children.filter(c => c.type == 'zoneset');

            self.SelectedZoneSet = self.zonesetsArr[0];
        }

        this.onChangeZoneSet = function () {
            _currentZoneSetId = self.SelectedZoneSet.id;
            self.zoneArr = self.SelectedZoneSet ? angular.copy(self.SelectedZoneSet.children) : null;
            buildDisplayZoneArr();
            self.SelectedZone = self.zoneArr && self.zoneArr.length ? 0 : -1;
        }

        // this.genColor = function () {
        //     let rand = function () {
        //         return Math.floor(Math.random() * 255);
        //     }
        //     return "rgb(" + rand() + "," + rand() + "," + rand() + ")";
        // }

        this.addZone = function (index, top, bottom) {
            let newZone = {
                name: 'zone',
                properties: {
                    fill: {
                        pattern: {
                            background: utils.colorGenerator(),
                            foreground: 'white',
                            name: 'none'
                        }
                    },
                    startDepth: parseFloat(top.toFixed(4)),
                    endDepth: parseFloat(bottom.toFixed(4)),
                    idZoneSet: self.SelectedZoneSet.id,
                    name: Math.round(top)
                },
                flag: _FNEW
            };

            self.zoneArr.splice(index, 0, newZone);
            self.SelectedZone = self.SelectedZone + 1;
        }

        this.onAddAboveButtonClicked = function () {
            if (self.zoneArr.length && self.SelectedZone >= 0) {
                let zone = self.zoneArr[self.SelectedZone];
                let pre_zone = null;

                for(let i = self.SelectedZone - 1; i >=0; i--){
                    if(self.zoneArr[i].flag != _FDEL){
                        pre_zone = self.zoneArr[i];
                        i = -1;
                    }
                }
                let free = 0;
                if (pre_zone) {
                    free = zone.properties.startDepth - pre_zone.properties.endDepth >= 50 ? 50 : zone.properties.startDepth - pre_zone.properties.endDepth;
                } else {
                    free = zone.properties.startDepth - self.SelectedWell.topDepth >= 50 ? 50 : zone.properties.startDepth - self.SelectedWell.topDepth;
                }

                if (parseInt(free) > 0) {
                    self.addZone(self.SelectedZone, zone.properties.startDepth - free, zone.properties.startDepth);
                } else {
                    utils.error("Can't add row above");
                }

            } else {
                let top = self.SelectedWell.topDepth;
                let bottom = self.SelectedWell.bottomDepth > top + 50 ? top + 50 : self.SelectedWell.bottomDepth;
                self.addZone(0, top, bottom);
            }
        }

        this.onAddBelowButtonClicked = function () {
            if (self.zoneArr.length && self.SelectedZone >= 0) {
                let zone = self.zoneArr[self.SelectedZone];
                let next_zone = null;

                for(let i = self.SelectedZone + 1; i < self.zoneArr.length; i++){
                    if(self.zoneArr[i].flag != _FDEL){
                        next_zone = self.zoneArr[i];
                        i = self.zoneArr.length;
                    }
                }
                let free = 0;
                if (next_zone) {
                    free = next_zone.properties.startDepth - zone.properties.endDepth >= 50 ? 50 : next_zone.properties.startDepth - zone.properties.endDepth;
                } else {
                    free = self.SelectedWell.bottomDepth - zone.properties.endDepth >= 50 ? 50 : self.SelectedWell.bottomDepth - zone.properties.endDepth;

                }

                if (parseInt(free) > 0) {
                    self.addZone(self.SelectedZone + 1, zone.properties.endDepth, zone.properties.endDepth + free);
                } else {
                    utils.error("Can't add row below");
                }

            } else {
                let top = self.SelectedWell.topDepth;
                let bottom = self.SelectedWell.bottomDepth > top + 50 ? top + 50 : self.SelectedWell.bottomDepth;
                self.addZone(0, top, bottom);
            }
        }

        this.onDeleteButtonClicked = function () {
            if(self.zoneArr[self.SelectedZone].flag != _FNEW){
                self.zoneArr[self.SelectedZone].flag = _FDEL;
            }else{
                self.zoneArr.splice(self.SelectedZone, 1);
            }
            self.SelectedZone = self.SelectedZone > 0 ? self.SelectedZone - 1 : -1;
        }

        this.onClearAllButtonClicked = function () {
            self.zoneArr.map(function(z){
                z.flag = _FDEL;
            })
            self.SelectedZone = -1;
        }
        this.verify = function(){
            if(self.zoneArr && self.zoneArr.length){
                let unique = [...new Set(self.zoneArr.map(a => a.properties.name))];
                if(unique.length < self.zoneArr.length) {
                    return false; // check unique zone name
                }

                if( self.zoneArr[0].properties.startDepth < self.SelectedWell.topDepth){
                    self.zoneArr[0].err = true;
                    return false;
                }
                for (let i = 0; i < self.zoneArr.length - 1; i++){
                    self.zoneArr[i].err = false;
                    if(self.zoneArr[i].properties.startDepth >= self.zoneArr[i].properties.endDepth){
                        self.zoneArr[i].err = true;
                        return false;
                    }

                    if(self.zoneArr[i].properties.endDepth > self.zoneArr[i+1].properties.startDepth){
                        self.zoneArr[i].err = true;
                        self.zoneArr[i+1].err = true;
                        return false;
                    }
                    let last = self.zoneArr[self.zoneArr.length - 1];
                    if(last.properties.startDepth >= last.properties.endDepth || last.properties.endDepth > self.SelectedWell.bottomDepth){
                        self.zoneArr[self.zoneArr.length - 1].err = true;
                        return false;
                    }

                }
                return true;
            }else{
                return true;
            }
        }

        function doApply(callback){
            if (self.applyingInProgress) return;
            self.applyingInProgress = true;
            if(self.zoneArr && self.zoneArr.length){
                async.eachOfSeries(self.zoneArr, function(zone, i, callback){
                    switch (self.zoneArr[i].flag) {
                        case _FDEL:
                            wiApiService.removeZone(self.zoneArr[i].id, function(){
                                console.log('removeZone');
                                callback();
                            });
                            break;

                        case _FNEW:
                            wiApiService.createZone(self.zoneArr[i].properties, function(data){
                                self.zoneArr[i].id = data.idZone;
                                self.zoneArr[i].properties.idZone = data.idZone;
                                console.log('createZone');
                                callback();
                            });
                            break;

                        case _FEDIT:
                            wiApiService.editZone(self.zoneArr[i].properties, function(){
                                console.log('editZone');
                                callback();
                            });
                            break;

                        default:
                            callback();
                            break;
                    }

                },function(err){
                    for (let i = self.zoneArr.length - 1; i >= 0; i--){
                        switch (self.zoneArr[i].flag) {
                            case _FDEL:
                                self.zoneArr.splice(i, 1);
                                break;

                            case _FNEW:
                            case _FEDIT:
                                delete self.zoneArr[i].flag;
                                break;
                        }
                    }
                    utils.refreshProjectState().then(function(){
                        if(callback) callback();
                    });
                })
            }else{
                if(callback) callback();
            }

        }
        this.onApplyButtonClicked = function () {
            console.log('Apply');
            if(self.verify()) {
                doApply(function() {
                    wiComponentService.emit('zone-updated');
                });
            }else{
                utils.error(errorMessage);
                return;
            }
        }

        this.onOkButtonClicked = function(){
            console.log('Ok');
            if(self.verify()) {
                doApply(function(){
                    wiComponentService.emit('zone-updated');
                    close(null);
                });
            }else{
                utils.error(errorMessage);
                return;
            }
        }

        this.onCancelButtonClicked = function () {
            console.log('OnCancelButtonClicked');
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'zone-manager-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (!ret) return;
        })
    });
};

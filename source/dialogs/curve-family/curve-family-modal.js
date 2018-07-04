let helper = require('./DialogHelper');
module.exports = function (ModalService, wiComponentService, idFamily, listFamily, callback) {
    function ModalController(close) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        if(!listFamily) {
            listFamily = utils.getListFamily();
        }

        let topIdx = 0;
        let selectionLength = 30;
        let delta = 10;
        this.groupConfig = [];
        this.familyGroups = {};
        this.selectedGroup = {};
        this.familySelection = [];
        this.familyConfig = [];
        this.selectedFamily = listFamily.find(f => f.idFamily === idFamily);

        for(let i = 0; i < listFamily.length; i++) {
            // const groupKey = _.snakeCase(family.familyGroup);
            const groupKey = listFamily[i].familyGroup;

            if (!this.familyGroups[groupKey]) this.familyGroups[groupKey] = [];
            this.familyGroups[groupKey].push(listFamily[i]);
            if (listFamily[i] === this.selectedFamily) {
                this.selectedGroup[groupKey] = this.familyGroups[groupKey];
                this.familySelection = this.familyGroups[groupKey];
            }
        }
        this.getGroupName = function(group) {
            return Object.keys(group)[0];
        }
        function addNodeGroup(g, sourceData) {
            let node = {
                name: g,
                type: "family",
                data: {
                    childExpanded: true,
                    label: g,
                    tooltip: g,
                    icon: 'zone-table-16x16',
                    selected : (g == self.selectedFamily.familyGroup) ? true : false
                }, 
                properties : sourceData[g]
            }
            return node;
        };

        function initGroupConfig (treeConfig, sourceData) {
            let idx = 0;
            for (let g in sourceData){
                treeConfig.push(addNodeGroup(g, sourceData));
                idx += 1;
                if(idx >= selectionLength) break;
            };
        };
        initGroupConfig(this.groupConfig, this.familyGroups);
        this.upTriggerGroup = function(cb) {
            let groupList = self.groupConfig;
            let newList = [];
            if(groupList.length) {
                if(topIdx > 0) {
                    if(topIdx > delta) {
                        let idx = 0;
                        for(let g in self.familyGroups) {
                            if(Object.keys(self.familyGroups).indexOf(g) > (topIdx - delta)) {
                                newList.push(addNodeGroup(g, self.familyGroups));
                                idx += 1;
                                if(idx >= delta) break;
                            }
                        }
                        newList.reverse();
                        topIdx = topIdx - delta;
                        if(cb) cb(newList, groupList);
                    } else {
                        for(let g in self.familyGroups) {
                            newList.push(addNodeGroup(g, self.familyGroups));
                            if(Object.keys(self.familyGroups).indexOf(g) == topIdx) break;
                        }
                        newList.reverse();
                        topIdx = 0;
                        if(cb) cb(newList, groupList);
                    }
                } else if (cb) cb([]);
            }
            else if (cb) cb([]);
        }

        this.downTriggerGroup = function(cb) {
            let groupList = self.groupConfig;
            let newList = [];
            if(groupList.length) {
                let bottomIdx = topIdx + selectionLength;
                let objectLen = Object.keys(self.familyGroups).length;
                if(bottomIdx < objectLen) {
                    if(objectLen - bottomIdx > delta) {
                        let idx = 0;
                        for(let g in self.familyGroups) {
                            if(Object.keys(self.familyGroups).indexOf(g) >= bottomIdx) {
                                newList.push(addNodeGroup(g, self.familyGroups));
                                idx += 1;
                                if(idx >= delta) break;
                            }
                        }
                        topIdx = topIdx + delta;
                        if(cb) cb(newList, groupList);
                    } else {
                        for(let g in self.familyGroups) {
                            if(Object.keys(self.familyGroups).indexOf(g) >= bottomIdx) newList.push(addNodeGroup(g, self.familyGroups));
                        }
                        topIdx = topIdx + objectLen - bottomIdx;
                        if(cb) cb(newList, groupList);
                    }
                } else if (cb) cb([]);
            }
            else if (cb) cb([]);
        }
        this.onClickGroupFunction = function($event, $index, node) {
            setSelectedGroupNode(node);
            self.selectedGroup[node.name] = node.properties;
            self.familySelection = node.properties;
            initFamilyConfig(self.familySelection);
        }
        function setSelectedGroupNode(node) {
            self.groupConfig.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }
        function addFamilyNode (f) {
            let node = {
                name: f.name,
                type: "family",
                data: {
                    childExpanded: true,
                    label: f.name,
                    tooltip: f.name,
                    icon: 'user-define-16x16',
                    selected: (f == self.selectedFamily) ? true : false
                },
                properties: f
            }
            return node;
        }
        function initFamilyConfig (familySelection) {
            let cutFamilies = familySelection.slice(0, selectionLength);
            self.familyConfig = cutFamilies.map(f => addFamilyNode(f));
        }
        initFamilyConfig(this.familySelection);

        this.upTriggerFamily = function(cb) {
            if(topIdx > 0) {
                if(topIdx > delta) {
                    let newSource = self.familySelection.slice(topIdx - delta, topIdx).reverse();
                    let newList = newSource.map(f => addFamilyNode(f));
                    topIdx = topIdx - delta;
                    cb(newList, self.familyConfig);
                } else {
                    let newSource = self.familySelection.slice(0, topIdx).reverse();
                    let newList = newSource.map(f => addFamilyNode(f));
                    topIdx = 0;
                    cb(newList, self.familyConfig);
                }
            } else cb([]);
        };

        this.downTriggerFamily = function (cb) {
            let bottomIdx = topIdx + selectionLength;
            if(bottomIdx < self.familySelection.length) {
                if(self.familySelection.length - bottomIdx > delta) {
                    let newSource = self.familySelection.slice(bottomIdx, delta + bottomIdx);
                    let newList = newSource.map(f => addFamilyNode(f));
                    topIdx = topIdx + delta;
                    cb(newList, self.familyConfig);
                } else {
                    let newSource = self.familySelection.slice(bottomIdx, self.familySelection.length);
                    let newList = newSource.map(f => addFamilyNode(f));
                    topIdx = topIdx + self.familySelection.length - bottomIdx;
                    cb(newList, self.familyConfig);
                }
            } else cb([]);
        }
        
        this.onClickFamilyFunction = function($event, $index, node) {
            setSelectedFamilyNode(node);
            self.selectedFamily = node.properties;
        }
        function setSelectedFamilyNode(node) {
            self.familyConfig.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }

        this.onOkButtonClicked = function () {
            close(self.selectedFamily);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }
    ModalService.showModal({
        templateUrl: 'curve-family-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        })
    })
}
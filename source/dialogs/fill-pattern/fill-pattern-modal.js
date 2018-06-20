let helper = require('./DialogHelper');
module.exports = function (ModalService, name, foreground, background, callback) {
    function ModalController($scope, wiComponentService, wiApiService, wiPatternService, close, $timeout) {
        let self = this;
        window.PT = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.name = name;
        this.foreground = foreground;
        this.background = background;
        let selectPatterns = wiComponentService.getComponent(wiComponentService.PATTERN);
        this.filter = '';
        
        let topIdx = 0;
        let selectionLength = 30;
        let delta = 10;

        let solidPattern = {
            Solid: {
                full_name: "None",
                src: ""
            }
        }
        this.selectPatterns = Object.assign({}, solidPattern, selectPatterns);

        function addNode(p) {
            let node;
            if (p == "None") {
                node = {
                    name: p,
                    type: "pattern",
                    data: {
                        childExpanded: true,
                        label: "None",
                        tooltip: "None",
                        selected : ((self.name).toLowerCase() === "solid" || (self.name).toLowerCase() === "none") ? true : false
                    }, 
                    properties: self.selectPatterns[p]
                }
            } else {
                node = {
                    name: p,
                    type: "pattern",
                    data: {
                        childExpanded: true,
                        label: self.selectPatterns[p].full_name,
                        tooltip: self.selectPatterns[p].full_name,
                        selected : (self.name == p) ? true : false,
                        imageBg : 'url(' + self.selectPatterns[p].src + ')'
                    }, 
                    properties: self.selectPatterns[p]
                }
            }
            return node;
        }
        this.config = [];
        function initConfig (treeConfig, sourceData) {
            let idx = 0;
            for (let p in sourceData){
                treeConfig.push(addNode(p));
                idx += 1;
                if(idx >= selectionLength) break;
            };
        }
        initConfig(this.config, this.selectPatterns);
        let selectedNode = null;
        this.onClickFunction = function($event, $index, node) {
            setSelectedNode(node);
            self.name = node.name;
            selectedNode = node;
        }
        function setSelectedNode(node) {
            self.config.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }
        this.upTrigger = function(cb) {
            let patternList = self.config;
            let newList = [];
            if(patternList.length) {
                if(topIdx > 0) {
                    if(topIdx > delta) {
                        let idx = 0;
                        for(let p in self.selectPatterns) {
                            if(Object.keys(self.selectPatterns).indexOf(p) > (topIdx - delta)) {
                                newList.push(addNode(p));
                                idx += 1;
                                if(idx >= delta) break;
                            }
                        }
                        newList.reverse();
                        topIdx = topIdx - delta;
                        if(cb) cb(newList, patternList);
                    } else {
                        for(let p in self.selectPatterns) {
                            newList.push(addNode(p));
                            if(Object.keys(self.selectPatterns).indexOf(p) == topIdx) break;
                        }
                        newList.reverse();
                        topIdx = 0;
                        if(cb) cb(newList, patternList);
                    }
                } else if (cb) cb([]);
            }
            else if (cb) cb([]);
        }
        this.downTrigger = function(cb) {
            let patternList = self.config;
            let newList = [];
            if(patternList.length) {
                let bottomIdx = topIdx + selectionLength;
                let objectLen = Object.keys(self.selectPatterns).length;
                if(bottomIdx < objectLen) {
                    if(objectLen - bottomIdx > delta) {
                        let idx = 0;
                        for(let p in self.selectPatterns) {
                            if(Object.keys(self.selectPatterns).indexOf(p) >= bottomIdx) {
                                newList.push(addNode(p));
                                idx += 1;
                                if(idx >= delta) break;
                            }
                        }
                        topIdx = topIdx + delta;
                        if(cb) cb(newList, patternList);
                    } else {
                        for(let p in self.selectPatterns) {
                            if(Object.keys(self.selectPatterns).indexOf(p) >= bottomIdx) newList.push(addNode(p));
                        }
                        topIdx = topIdx + objectLen - bottomIdx;
                        if(cb) cb(newList, patternList);
                    }
                } else if (cb) cb([]);
            }
            else if (cb) cb([]);
        }
        
        this.onOkButtonClicked = function() {
            close(self.name);
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "fill-pattern-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        setTimeout(function() {
            $('#focus').focus();
        }, 1000);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            callback(ret);
        });
    });
}
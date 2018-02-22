let helper = require('./DialogHelper');
module.exports = function (ModalService, plotCtrl, callback) {
    function ModalController(close, wiComponentService, wiApiService, $timeout) {
        let self = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        window.DISC = this;

        this.well = plotCtrl.getWell();
        this.datasets = [];
        this.curvesArr = [];
        this.props = plotCtrl.getModel().properties;
        if (!self.props.discriminator || this.conditionTree == 'null'){
            this.conditionTree = null;
        }
        else if (typeof self.props.discriminator == 'string') {
            this.conditionTree = JSON.parse(self.props.discriminator)
        }
        else {
            this.conditionTree = angular.copy(self.props.discriminator);
        }

        wiComponentService.on('discriminator-update', function(){
            self.conditionExpr = parse(self.conditionTree);
        })

        this.well.children.forEach(function(child, i){
            switch (child.type){
                case 'dataset':
                self.datasets.push(child);
                break;
            }
            if (i == self.well.children.length - 1) {
                self.datasets.forEach(function (child) {
                    child.children.forEach(function (item) {
                        if (item.type == 'curve') {
                            self.curvesArr.push(item);
                        }
                    })
                });
            }
        })

        this.conditionExpr = parse(this.conditionTree);

        function parse(tree) {
            let str = "";
            if (!tree) return "";
            if (tree.children && tree.children.length) {
                return "( " + parse(tree.children[0]) + " " + tree.operator.toUpperCase() + " " + parse(tree.children[1]) + " )";
            }
            else if (tree.left && tree.right && tree.comparison) {
                let left = getCurveName(tree.left.value);
                let right = tree.right.type=='value'? tree.right.value: getCurveName(tree.right.value);
                return "( " + left + " " + tree.comparison + " " + right + " )";
            }

            return str;
        }

        function getCurveName(idCurve){
            if(idCurve == 0) return "Depth";
            let model = utils.getModel('curve', idCurve);
            if( model ) return model.properties.name;
            return;
        }
        function visit(node, visitedPath, matchFunc) {
            if (!node) return false;
            visitedPath.unshift(node);
            // visitedPath.push(node);
            if (matchFunc(node)) {
                return true;
            }
            else {
                if (node.children && node.children.length) {
                    for (let childNode of node.children) {
                        if (visit(childNode, visitedPath, matchFunc)) {
                            return true;
                        }
                        // visitedPath.pop();
                        visitedPath.shift();
                    }
                }
            }
            return false;
        }
        function getFirstCurve() {
            return self.curvesArr[0].id;
        }
        this.addCondition = function() {
            let path = new Array();
            let retVal = visit(self.conditionTree, path, function(aNode) {
                return aNode.selected;
            });
            let selectedNode;
            let parentNode = null;

            if (!self.conditionTree) {
                self.conditionTree = {
                    comparison: '>',
                    left: {
                        type: 'curve',
                        value:getFirstCurve()
                    },
                    right: {
                        type: 'value',
                        value: 0
                    }
                };
                self.conditionExpr = parse(self.conditionTree);
                return;
            }

            if (!retVal) selectedNode = self.conditionTree;

            if (retVal) selectedNode = path[0];

            let newNode = {
                operator: 'and',
                children: [
                selectedNode,
                {
                    comparison: '>',
                    left: {
                        type: 'curve',
                        value: getFirstCurve()
                    },
                    right: {
                        type: 'value',
                        value: 0
                    }
                }
                ]
            };
            if (path.length > 1) {
                parentNode = path[1];
                let selectedIdx = parentNode.children.indexOf(selectedNode);
                parentNode.children[selectedIdx] = newNode;
            }
            else {
                self.conditionTree = newNode;
            }
            self.conditionExpr = parse(self.conditionTree);

        }
        this.deleteCondition = function() {
            let path = new Array();
            let retVal = visit(self.conditionTree, path, function(aNode) {
                return aNode.selected;
            });
            if (retVal) {
                if (path.length >= 3) {
                    let selectedNode = path[0];
                    let parentNode = path[1];
                    let gParentNode = path[2];

                    let parentIdx = gParentNode.children.indexOf(parentNode);
                    let selectedIdx = parentNode.children.indexOf(selectedNode);
                    let theOtherNode = parentNode.children[(selectedIdx + 1) % 2];
                    gParentNode.children[parentIdx] = theOtherNode;
                }
                else if (path.length === 2) {
                    let selectedNode = path[0];
                    let parentNode = path[1];
                    let selectedIdx = parentNode.children.indexOf(selectedNode);
                    let theOtherNode = parentNode.children[(selectedIdx + 1) % 2];
                    self.conditionTree = theOtherNode;
                }
                else if (path.length === 1) {
                    self.conditionTree = null;
                }
                else {
                    errorMessageDialog(ModalService, "Never happen!!");
                }
                self.conditionExpr = parse(self.conditionTree);
            }
        }

        this.onApplyButtonClicked = function () {
            console.log('Apply');
            if(self.props.idHistogram){
                let payload = {
                    discriminator: self.conditionTree,
                    idHistogram: self.props.idHistogram
                }
                wiApiService.editHistogram(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                })
            }else if (self.props.idCrossPlot){
                let payload = {
                    discriminator: self.conditionTree,
                    idCrossPlot: self.props.idCrossPlot,
                    idWell: self.props.idWell
                }
                wiApiService.editCrossplot(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                })
            }else{
                errorMessageDialog(ModalService, 'LOI ROI');
            }
        }

        this.onOKButtonClicked = function () {
            console.log('OK');
            if(self.props.idHistogram){
                let payload = {
                    discriminator: self.conditionTree,
                    idHistogram: self.props.idHistogram
                }
                wiApiService.editHistogram(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                    close(null);
                })
            }else if (self.props.idCrossPlot){
                let payload = {
                    discriminator: self.conditionTree,
                    idCrossPlot: self.props.idCrossPlot,
                    idWell: self.props.idWell
                }
                wiApiService.editCrossplot(payload, function(){
                    self.props.discriminator = self.conditionTree;
                    if (callback) callback(self.conditionTree);
                    close(null);
                })
            }else{
                errorMessageDialog(ModalService, 'LOI ROI');
            }
        }

        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        templateUrl: 'discriminator-modal.html',
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (!ret) return;
        })
    })
}
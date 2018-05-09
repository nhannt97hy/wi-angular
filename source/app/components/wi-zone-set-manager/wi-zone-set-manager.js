const componentName = 'wiZoneSetManager';
const moduleName = 'wi-zone-set-manager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    
    this.$onInit = function () {
        wiComponentService.putComponent('wiZoneSetManager', self);
    }
    
    this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
    
    this.exportZoneSet = function () {
        console.log('export');
    }
    this.createZoneSet = function () {
        console.log('create zone set');
        let promptConfig = {
            title: '<span class="zone-edit-16x16"></span> Create New Zone Set',
            inputName: 'Name',
            input: ''
        }
        DialogUtils.promptDialog(ModalService, promptConfig, function (ret) {
            if (!ret) return;
            else {
                if(!self.zoneSetConfig.find(function(node){return node.name == ret})){
                    console.log('new');
                    if(self.newZoneSet){
                        self.zoneSetConfig.splice(self.zoneSetConfig.indexOf(self.newZoneSet), 1);
                    } 
                    let newNode = {
                        name: ret,
                        type: 'template',
                        data: {
                            icon: 'zone-properties-16x16',
                            label: ret,
                            childExpanded: true
                        },
                        children: []
                    }
                    self.newZoneSet = newNode;
                    self.zoneSetConfig.push(newNode);
                    unselectAllNodes(self.zoneSetConfig);
                    selectHandler(newNode, self.zoneSetConfig);                    
                    this.refreshZoneList()                 
                } else {
                    // alert('template name existed');
                    unselectAllNodes(self.zoneSetConfig);
                    selectHandler(self.zoneSetConfig.find(function(node){
                        return node.name == ret
                    }), self.zoneSetConfig);
                    this.refreshZoneList();
                }
            }
        });
    }
    this.deleteZoneSet = function () {
        console.log('create zone set');
    }
    this.refreshZoneSetList = function () {
        // wiApiService.listWells
        console.log('refresh zone set');
        self.zoneSetConfig = [{
            name: 'ret',
            type: 'template',
            data: {
                icon: 'zone-properties-16x16',
                label: 'ret',
                childExpanded: true
            },
            children: []
        }];
        self.zoneSets = [];
        self.zones = [];
        self.selectedZones = [];
        self.newZoneSet = false;
    }
    this.refreshZoneSetList();
    this.zoneSetClickFunction = function () {
        console.log('zoneSet Click func');
    }
    this.refreshZoneList = function() {
        console.log('refresh zone list');
    }
    this.editZone = function() {
        console.log('edit zone')
    }
    this.createZone = function() {
        console.log('create zone')
    }
    this.deleteZone = function() {
        console.log('delete zone')
    }
    this.onZoneChanged = function(index) {
        self.zoneEditted = true;
        self.zones[index].zoneEditted = true;
    }
    
    this.backgroundZone = function (index) {
        DialogUtils.colorPickerDialog(ModalService, self.zones[index].background, function (colorStr) {
            self.zones[index].background = colorStr;
            self.onZoneChanged(index);
        });
    };
    this.foregroundZone = function (index) {
        DialogUtils.colorPickerDialog(ModalService, self.zones[index].foreground, function (colorStr) {
            self.zones[index].foreground = colorStr;
            self.onZoneChanged(index);
        });
    };

    this.unselectAllNodes = unselectAllNodes;
    function unselectAllNodes(rootNode) {
        rootNode.forEach(function (item) {
            utils.visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
        rootNode.__SELECTED_NODES = [];
    }

    function selectHandler(currentNode, rootNode, callback) {
        console.log('handler', currentNode);
        if (currentNode.data) {
            $timeout(function () { currentNode.data.selected = true; });
            let selectedNodes = rootNode.__SELECTED_NODES;
            if (!Array.isArray(selectedNodes))
                selectedNodes = [];
            if (!selectedNodes.includes(currentNode)) {
                selectedNodes.push(currentNode);
            }
            rootNode.__SELECTED_NODES = selectedNodes;
            self.selectedTemplate = currentNode;
        } 
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-zone-set-manager.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        options: '<',
        configs: '<',
        idwell: '<',
    }
});

exports.name = moduleName;
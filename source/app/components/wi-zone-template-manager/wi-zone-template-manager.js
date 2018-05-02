const componentName = 'wiZoneTemplateManager';
const moduleName = 'wi-zone-template-manager';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    
    this.$onInit = function () {
        console.log('wi zone template manager: ', self.idwell);
        wiComponentService.putComponent('wiZoneTemplateManager', self);
    }
    this.refreshTemplateList = function () {
        self.config =[];
        self.zones = [];
        this.selectedZoneSets = [];
        this.selectedTemplate = false;
        wiApiService.listZoneTemplate({}, function(templates){
            if(templates){
                for(template of templates){
                    self.config.push({
                        name: template.template,
                        type: 'template',
                        data: {
                            icon: 'mineral-zone-16x16',
                            label: template.template,
                            childExpanded: true
                        },
                        children: []
                    })
                }            
            }
        })
    }
    this.refreshTemplateList();

    this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
    
    this.onZoneChanged = function(index) {
        self.editted = true;
        self.zones[index].editted = true;
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

    function refreshZoneList() {
        self.selectedZoneSets = [];
        wiApiService.listAllZoneByTemplate({template: self.selectedTemplate.name}, function(zones){
            self.zones = zones;
        })
    };
    this.clickFunction = function ($index, $event, node) {
        self.zones = [];
        self.editted = false;
        self.selectedTemplate = node;
        if(self.newZoneTemplate && node != self.newZoneTemplate){
            self.config.splice(self.config.indexOf(self.newZoneTemplate), 1);
            self.newZoneTemplate = false;
        }
        console.log('selectedTemplate', self.selectedTemplate);
        refreshZoneList();
        clickFunction($index, $event, node, self.config, true);
    }
    function clickFunction($index, $event, node, rootNode, multiNodeFetch = false){
        node.$index = $index;
        if (!node) {
            unselectAllNodes(rootNode);
            return;
        }
        let selectedNodes = rootNode.__SELECTED_NODES;
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (!$event.shiftKey) {
            if (selectedNodes.length) {
                if (!$event.ctrlKey || node.type != selectedNodes[0].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                }
            }
            selectHandler(node, rootNode);
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (node.type != selectedNodes[selectedNodes.length - 1].type || node.parent != selectedNodes[0].parent) {
                    unselectAllNodes(rootNode);
                    selectHandler(node, rootNode);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode)){
                                selectHandler(rootNode[i], rootNode);
                            } 
                            else{
                                selectHandler(rootNode.children[i], rootNode);
                            }  
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        unselectAllNodes(rootNode);
                        for (let i = fromIndex; i <= toIndex; i++) {
                            if (Array.isArray(rootNode)){
                                selectHandler(rootNode[i], rootNode);
                            }
                            else{
                                selectHandler(rootNode.children[i], rootNode);
                            }
                        }
                    }
                }
            }
        }
    }
    this.exportTemplate = function () {
        console.log("exportTemplate", self.config.__SELECTED_NODES);
        
    }
    this.createTemplate = function () {
        let promptConfig = {
            title: '<span class="zone-edit-16x16"></span> Create New Zone Template',
            inputName: 'Name',
            input: ''
        }
        DialogUtils.promptDialog(ModalService, promptConfig, function (ret) {
            if (!ret) return;
            else {
                if(!self.config.find(function(node){return node.name == ret})){
                    if(self.newZoneTemplate){
                        self.config.splice(self.config.indexOf(self.newZoneTemplate), 1);
                    } 
                    let newNode = {
                        name: ret,
                        type: 'template',
                        data: {
                            icon: 'mineral-zone-16x16',
                            label: ret,
                            childExpanded: true
                        },
                        children: []
                    }
                    self.newZoneTemplate =newNode;
                    self.config.push(newNode);
                    unselectAllNodes(self.config);
                    selectHandler(newNode, self.config);  
                    refreshZoneList()                 
                } else {
                    // alert('template name existed');
                    unselectAllNodes(self.config);
                    selectHandler(self.config.find(function(node){
                        return node.name ==ret
                    }), self.config);
                    refreshZoneList();
                }
            }
        });
    }
    this.deleteTemplate = function () {
        deleteTemplate(function(){})
    }
    function deleteTemplate (callback){
        for(node of self.config.__SELECTED_NODES){
            self.zones = [];
            let nodeName = node.name;
            let index = self.config.indexOf(node);
            self.config.splice(index, 1);
            wiApiService.listAllZoneByTemplate({template: nodeName}, function(zones){
                for(z of zones) {
                    wiApiService.deleteZoneTemplate({
                        idZoneTemplate: z.idZoneTemplate
                    },function(){
                        callback();
                    })
                }
            })
        }
    }
    this.createZone = function () {
        console.log('createZoneSet', self.selectedTemplate);
        DialogUtils.createNewZoneDialog(ModalService, function (data) {
            if(data){
                data.template = self.selectedTemplate.name;
                if(self.zones.length!==0){
                    wiApiService.createZoneTemplate(data, function(zone){
                        self.zones.push(data);
                    }) 
                } else {
                    self.newZoneTemplate = true;
                    self.zones.push(data);
                }
            }
        });
    }
    this.deleteZone = function () {
        if(self.newZoneTemplate) {
            self.zones = [];
            let newTemplateIndex =  self.config.indexOf(self.config.__SELECTED_NODES);
            self.config.splice(newTemplateIndex, 1);   
            self.newZoneTemplate = false;
        } else {
            for(z in self.zones) {
                console.log(z);
                if(self.zones[z].flag) {
                    let idZoneTemplate = self.zones[z].idZoneTemplate;
                    self.zones.splice(z,1);
                    wiApiService.deleteZoneTemplate({idZoneTemplate: idZoneTemplate}, function(){})
                    self.selectedZoneSets = [];
                }
            }
        }
    }

    this.selectZoneToggle =  function (zone){
        if(!zone.flag){
            zone.flag = true;
            self.selectedZoneSets.push(zone);
            console.log('===', self.selectedZoneSets);
        } else {
            zone.flag = false;
            let index = self.selectedZoneSets.indexOf(zone);
            self.selectedZoneSets.splice(index, 1);
            console.log('===', self.selectedZoneSets);
        }
    }
    this.editZone = function () {
        console.log('edit zone set');
        if(self.newZoneTemplate){
            for(zone of self.zones){
                zone.template = self.selectedTemplate.name;
                wiApiService.createZoneTemplate(zone, function(){
                    console.log('create zone template success');
                    self.newZoneTemplate = false;
                })
            }
        } else {
            for(zone of self.zones){
                if(zone.editted){
                    wiApiService.editZoneTemplate({
                        idZoneTemplate: zone.idZoneTemplate,
                        name: zone.name,
                        background: zone.background,
                        foreground: zone.foreground,
                        pattern: zone.pattern
                    }, function(){
                        wiApiService.listAllZoneByTemplate({template: self.selectedTemplate.name}, function(zones){
                            console.log('zones', zones);
                            self.zones = zones;
                        })
                    })
                }
            }
        }
    }
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
    templateUrl: 'wi-zone-template-manager.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        options: '<',
        configs: '<',
        idwell: '<',
    }
});

exports.name = moduleName;

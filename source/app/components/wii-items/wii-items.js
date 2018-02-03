const wiiItems = 'wiiItems';
const moduleName = 'wii-items';

function Controller($scope, $timeout, wiComponentService, wiOnlineInvService) {
    let self = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let oUtils = require('./oinv-utils.js');
    oUtils.setGlobalObj({
        wiComponentService, wiOnlineInvService, $timeout
    });
    this.items = [];

    this.$onInit = function () {
        wiComponentService.on(wiComponentService.UPDATE_ITEMS_EVENT, function (currentNode) {
            // if select different node
            // console.log('------',currentNode);
            let curves = oUtils.getAllChildrenCurves(currentNode)
            if (JSON.stringify(self.items) != JSON.stringify(curves)) {
                self.items = curves;
                self.unselectAllItems();
            }
        });
        wiComponentService.putComponent(self.name, self);
    }

    this.onItemClick = function ($index, $event) {
        let item = self.items[$index];
        item.$index = $index;
        if (!item) {
            self.container.unselectAllNodes();
            return;
        }
        if (!$event.shiftKey) {
            if (self.selectedItems.length && !$event.ctrlKey) {
                self.unselectAllItems();
            }
            self.selectHandler(item);
        } else {
            // shift key
            if (self.selectedItems.length) {
                if (self.selectedItems.includes(item)) return;
                if (item.$index < self.selectedItems[0].$index) {
                    let fromIndex = item.$index;
                    let toIndex = self.selectedItems[0].$index;
                    self.unselectAllItems();
                    for (let i = fromIndex; i <= toIndex; i++) {
                        self.selectHandler(self.items[i]);
                    }
                } else {
                    let fromIndex = self.selectedItems[0].$index;
                    let toIndex = item.$index;
                    self.unselectAllItems();
                    for (let i = fromIndex; i <= toIndex; i++) {
                        self.selectHandler(self.items[i]);
                    }
                }
            }
        }
    }

    this.unselectAllItems = function () {
        if (!Array.isArray(self.items)) return;
        self.items.forEach(function (i) {
            if (i.data.selected) i.data.selected = false;
        });
        self.selectedItems = [];
        wiComponentService.putComponent(wiComponentService.SELECTED_CURVES, self.selectedItems);
    }

    this.selectHandler = function (item) {
        wiComponentService.emit(wiComponentService.UPDATE_PROPERTIES_EVENT, item);
        item.data.selected = true;
        if (!Array.isArray(self.selectedItems)) self.selectedItems = [];
        if (!self.selectedItems.includes(item)) {
            self.selectedItems.push(item);
        }
        wiComponentService.putComponent(wiComponentService.SELECTED_CURVES, self.selectedItems);
    }

    this.deleteItem = function (item) {
        if (!item) return;
        wiOnlineInvService.deleteCurve(item.properties.idCurve, function () {
            utils.updateCurves(item.properties.idDataset).then(function () {
                wiComponentService.emit(wiComponentService.UPDATE_ITEMS_EVENT, utils.getSelectedNode());
                self.getWiiProperties().emptyList();
                $scope.$apply();
            })
        })
    }

    this.showContextMenu = function ($index, $event) {
        let item = self.items[$index]
        console.log('item', item);
        let contextMenu = [{
            label: "Delete",
            icon: "delete-16x16",
            handler: function () {
                self.deleteItem(item);
            }
        }]
        wiComponentService.getComponent('ContextMenu').open($event.clientX, $event.clientY, contextMenu);
    }
    this.getWiiExplorer = function () {
        return wiComponentService.getComponent('wiiExplorer');
    }
    this.getWiiProperties = function () {
        return wiComponentService.getComponent('wiiProperties');
    }

    this.emptyItems = function () {
        self.items = [];
        self.getWiiProperties().emptyList();
    }

    this.onChange = function (item) {
        if (!item.changed) return;
        if (item.type == 'curve') {
            wiOnlineInvService.editCurve(item.properties, function () {
                item.changed = false;
                console.log('edited', item);
                self.selectHandler(item);
            })
        }
    }
}


let app = angular.module(moduleName, []);

app.component(wiiItems, {
    templateUrl: 'wii-items.html',
    controller: Controller,
    controllerAs: wiiItems,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;

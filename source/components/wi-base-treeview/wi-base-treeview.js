const componentName = 'wiBaseTreeview';
const moduleName = 'wi-base-treeview';

function WiBaseTreeController() {
    let self = this;

    this.$onInit = function () {
        console.log('WiBaseTreeController oninit self', self);    
    };

    this.onReady = function () {
    };  

    this.onCollapse = function ($index) {
        console.log('collapse');
        this.config[$index].data.childExpanded = !this.config[$index].data.childExpanded;
    };

    // this.onDoubleClick = function ($index) {
    //     console.log('double click');
    //     this.config[$index].data.childExpanded = !this.config[$index].data.childExpanded;
    // };

    this.addItem = function (parentName, item) {
        let parentItem = this.getItemByName(parentName);

        if (parentItem) parentItem.children.push(item);
    };

    this.addItemToFirst = function (parentName, item) {
        console.log('addItemToFirst self', self);
        let parentItem = this.getItemByName(parentName);
        if (parentItem) {
            parentItem.children.unshift(item);
        }
    };

    this.updateWellItem = function (well) {
        let wellSelected = this.findWellById(well.idWell);

        let newWell = new WiWell(well);

        if (wellSelected) {
            angular.copy(newWell, wellSelected);
        } else {
            let wells = this.getItemByName('wells');

            if (wells) wells.children.unshift(newWell);
        }
    };

    this.updateWellsItem = function(wells) {
        for(let well of wells) {
            this.updateWellItem(well);
        }
    };

    this.updateLogplotItem = function (logplot) {
        let plotSelected = this.findWellById(logplot.idPlot);

        let newPlotItem = new WiLogplotModel();

        let newWell = new WiWell(well);

        if (wellSelected) {
            angular.copy(newWell, wellSelected);
        } else {
            let wells = this.getItemByName('wells');

            if (wells) wells.children.unshift(newWell);
        }
    };

    // item has id to identify
    this.updateChildItem = function (parentItemName, item) {

    };

    this.findWellById = function (idWell) {
        let wells = this.getItemByName('wells');
        let wellName = idWell + 'well';

        if (!wells) return null;

        for (let itemTree of wells.children) {
            if (itemTree.type === 'well' && itemTree.name === wellName) {
                return itemTree;
            }
        }

        return null;
    };
    
    this.getItemByName = function (name) {
        let itemSelect = null;
        console.log('getItemByName this', this);
        console.log('getItemByName this.config', this.config);
        for (let item of this.config) {
            if (item.name === name) {
                return item;
            }

            itemSelect = this.findChildItemByName(item, name);
            if (itemSelect) {
                return itemSelect;
            }
        }

        return itemSelect;
    }

    this.findChildItemByName = function (item, name) {
        if (!item || !item.children) return;

        let childSelect = null;
        for (let child of item.children) {
            if (child.name === name) {
                return child;
            } else if (child.children.length !== 0) {
                childSelect = this.findChildItemByName(child, name);
                if (childSelect) {
                    return childSelect;
                }
            }
        }
        return childSelect;
    }

    this.expand = function ($index) {
        this.config[$index].data.childExpanded = true;
        for (let child of this.config[$index].children) {
            child.data.childExpanded = true;
        }
    };

    this.collapse = function ($index) {
        this.config[$index].data.childExpanded = false;
        for (let child of this.config[$index].children) {
            child.data.childExpanded = false;
        }
    };

    this.expandAll = expandAll;

    function expandAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            child.data.childExpanded = true;
            expandAll(child.children);
        }
    }

    this.collapseAll = collapseAll;

    function collapseAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            child.data.childExpanded = false;
            collapseAll(child.children);
        }
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-base-treeview.html',
    controller: WiBaseTreeController,
    controllerAs: componentName,
    bindings: {
        name: '@',
        config: '<',
        contextmenuholder: '@',
        onclickfunction: '<', 
        container: '<',
        showcontextmenufunction: '<',
        ondoubleclickfunction: '<',
        getitemactivenamefunction: '<',
        isShowParentName: '<'
    }
});
exports.controller = WiBaseTreeController;
exports.name = moduleName;

const name = 'wiItemDropdown';
const moduleName = 'wi-item-dropdown';

function Controller($timeout, $scope) {
    let self = this;
    this.baseIndex = 0;
    let selectedIndex = -1;
    this.isShown = function(item) {
        if (!self.filter || !self.filter.length) return true;
        return self.filterRegExp.test(item.data.label);
    }
    this.filterChange = function() {
        self.filterRegExp = new RegExp(self.filter);
    }
    this.$onInit = function() {
        $timeout(function() {
            self.onWiDropdownInit && self.onWiDropdownInit(self);
            if (self.items && self.items.length)
                self.selectedItem = self.items[0];
        }, 500);
    }
    this.onChange = function() {
        self.onItemChanged && self.onItemChanged(self.selectedItem.properties);
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-item-dropdown.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        icon: "<",
        items: "<",
        onWiDropdownInit: "<",
        onItemChanged: "<",
        placeHolder: "@",
        ctrlBtnIcon: "@",
        onCtrlBtnClick: "<",
        choiceStyles: '@'
    }
});

exports.name = moduleName;

const name = 'wiItemList';
const moduleName = 'wi-item-list';

function Controller() {
    let self = this;
    this.baseIndex = 0;
    let selectedIndex = -1;
    this.isShown = function(item) {
        if (!self.filter || !self.filter.length) return true;
        return self.filterRegExp.test(item.data.label);
    }
    this.filterChange = function() {
        self.filterRegExp = new RegExp(self.filter, 'i');
    }
    this.selectItem = function(viewIndex, modelIndex, $event) {
        console.log(viewIndex, modelIndex);
        $event.preventDefault();
        $event.stopPropagation();
        if ($event.shiftKey) {
            let minIndex = Math.min(modelIndex, selectedIndex);
            let maxIndex = Math.max(modelIndex, selectedIndex);
            for (let i = minIndex; i <= maxIndex; i++) {
                if (self.isShown(self.items[i])) self.items[i].data.checked = true;
            }
            if ((selectedIndex >= 0) && (selectedIndex < self.items.length)) {
                self.items[selectedIndex].data.selected = false;
            }
            selectedIndex = modelIndex;
            self.items[selectedIndex].data.selected = true;
        }
        else if ($event.altKey){
            if ((selectedIndex >= 0) && (selectedIndex < self.items.length)) {
                self.items[selectedIndex].data.selected = false;
            }
            selectedIndex = modelIndex;
            self.items[selectedIndex].data.selected = true;
            self.items[selectedIndex].data.checked = !self.items[selectedIndex].data.checked;
        }
        else {
            deselectAll();
            if ((selectedIndex >= 0) && (selectedIndex < self.items.length)) {
                self.items[selectedIndex].data.selected = false;
            }
            selectedIndex = modelIndex;
            self.items[selectedIndex].data.selected = true;
            self.items[selectedIndex].data.checked = !self.items[selectedIndex].data.checked;
        }
        self.onSelect && self.onSelect(viewIndex, modelIndex, self.items[modelIndex]);
    }
    this.$onInit = function() {
        self.onWiListInit && self.onWiListInit(self);
    }

    this.upTrigger = function(cb) {
        console.log("upTrigger");
        if (!self.onScrollTop) return cb(0);
        self.onScrollTop(self.items).then(cb);
    }

    this.downTrigger = function(cb) {
        console.log("downTrigger");
        if (!self.onScrollBottom) return cb(0);
        self.onScrollBottom(self.items).then(cb);
    }
    function deselectAll() {
        for (let item of self.items) {
            item.data.checked = false;
        }
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-item-list.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        showIndex: "<",
        showCheck: "<",
        icon: "<",
        items: "<",
        onSelect: "<",
        onWiListInit: "<",
        onScrollTop: "<",
        onScrollBottom: "<"
    }
});

exports.name = moduleName;

const tabsetComponentName = 'wiTabset';
const tabComponentName = 'wiTab';
const moduleName = 'wi-tabs';

function TabsetController() {
    var self = this;

    this.tabs = [];

    this.selectTab = function (tab) {
        for(var i=0; i < self.tabs.length; i++){
            self.tabs[i].active = false;
        }

        self.tabs[tab.index].active = true;
    };

    this.addTab = function (tab) {
        self.tabs.push(tab);
        self.tabs[self.tabs.length - 1].active = (self.tabs.length === 1);
    }
}

var app = angular.module(moduleName, []);
app.component(tabsetComponentName, {
    templateUrl: 'wi-tabset.html',
    controller: TabsetController,
    controllerAs: tabsetComponentName,
    transclude: true
});


function TabController() {
    var self = this;

    this.$onInit = function () {
        self.wiTabsetCtrl.addTab(self);
    };
}

app.component(tabComponentName, {
    templateUrl: 'wi-tab.html',
    controller: TabController,
    controllerAs: tabComponentName,
    transclude: true,
    require: {
        'wiTabsetCtrl': '^wiTabset'
    },
    bindings: {
        index: '@',
        heading: '@',
        closable: '@'
    }
});


exports.name = moduleName;

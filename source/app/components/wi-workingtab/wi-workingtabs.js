const tabsetComponentName = 'wiWorkingtabset';
const tabComponentName = 'wiWorkingtab';
const moduleName = 'wi-workingtabs';

function TabsetController() {
    var self = this;

    this.tabs = [];

    this.selectTab = function (index) {
        deactiveAllTabs(self.tabs);
        deactiveAllTabs(self.tabConfigs);

        self.tabs[index].active = true;
        self.tabConfigs[index].active = true;
    };

    this.closeTab = function (index) {
        deactiveAllTabs(self.tabs);
        deactiveAllTabs(self.tabConfigs);

        self.tabs.splice(index, 1);
        self.tabConfigs.splice(index, 1);

        if (self.tabs.length !== 0) {
            if (index < self.tabs.length) {
                self.tabs[index].active = true;
                self.tabConfigs[index].active = true;
            } else {
                self.tabs[self.tabs.length - 1].active = true;
                self.tabConfigs[self.tabs.length - 1].active = true;
            }
        }
    };

    this.addTab = function (tab) {
        self.tabs.push(tab);
        self.tabs[self.tabs.length - 1].active = (self.tabs.length === 1);
        self.tabConfigs[self.tabConfigs.length - 1].active = (self.tabConfigs.length === 1);
    };

    function deactiveAllTabs(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].active = false;
        }
    }
}

var app = angular.module(moduleName, []);
app.component(tabsetComponentName, {
    templateUrl: 'wi-workingtabset.html',
    controller: TabsetController,
    controllerAs: tabsetComponentName,
    transclude: true,
    bindings: {
        tabConfigs: '<'
    }
});


function TabController() {
    var self = this;

    this.$onInit = function () {
        self.wiTabsetCtrl.addTab(self);
    };
}

app.component(tabComponentName, {
    templateUrl: 'wi-workingtab.html',
    controller: TabController,
    controllerAs: tabComponentName,
    transclude: true,
    require: {
        'wiTabsetCtrl': '^wiWorkingtabset'
    },
    bindings: {
        heading: '@',
        closable: '@'
    }
});


exports.name = moduleName;

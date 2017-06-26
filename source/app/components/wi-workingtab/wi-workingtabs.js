const tabsetComponentName = 'wiWorkingtabset';
const tabComponentName = 'wiWorkingtab';
const moduleName = 'wi-workingtabs';

function TabsetController($timeout, wiComponentService) {
    let self = this;

    this.tabs = [];

    this.selectTab = function (index) {
        deactiveAllTabs(self.tabs);
        deactiveAllTabs(self.tabConfigs);

        self.tabs[index].active = true;
        self.tabConfigs[index].active = true;

        let tabSelectCtrl = wiComponentService.getComponent(self.tabs[index].name);
        if (tabSelectCtrl.type === 'logplot') {
            $timeout(wiComponentService.getComponent(tabSelectCtrl.name + 'Logplot').getSlidingbarCtrl().setSlidingHandleHeight);
        }
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
        deactiveAllTabs(self.tabs);
        deactiveAllTabs(self.tabConfigs);

        tab.active = true;
        self.tabs.push(tab);

        self.tabConfigs[self.tabConfigs.length - 1].active = true;
    };

    function deactiveAllTabs(tabs) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].active = false;
        }
    }
}

let app = angular.module(moduleName, []);
app.component(tabsetComponentName, {
    templateUrl: 'wi-workingtabset.html',
    controller: TabsetController,
    controllerAs: tabsetComponentName,
    transclude: true,
    bindings: {
        tabConfigs: '<'
    }
});


function TabController(wiComponentService) {
    let self = this;

    this.$onInit = function () {
        self.wiTabsetCtrl.addTab(self);

        if (self.name) wiComponentService.putComponent(self.name, self);
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
        name: '@',
        type: '@',
        heading: '@',
        closable: '@'
    }
});


exports.name = moduleName;

const tabsetComponentName = 'wiTabset';
const tabComponentName = 'wiTab';
const moduleName = 'wi-tabs';

function TabsetController($timeout) {
    let self = this;

    this.tabs = [];
    this.isExpand = true;
    this.icon = 'fa fa-chevron-up';

    this.toggleRibbon = function(){
        self.isExpand = !self.isExpand;
        if(self.icon == 'fa fa-chevron-down'){
            self.icon = 'fa fa-chevron-up';
            if (self.onToggle) self.onToggle(false);
        }else{
            self.icon = 'fa fa-chevron-down';
            if (self.onToggle) self.onToggle(true);
        }
    }

    this.selectTab = function (index) {
        deactiveAllTabs(self.tabs);

        self.tabs[index].active = true;
        self.tabs[index].onShow && self.tabs[index].onShow();
    };

    this.closeTab = function (index) {
        deactiveAllTabs(self.tabs);

        console.log(self.tabs);

        self.tabs.splice(index, 1);
        if (self.tabs.length !== 0) {
            if (index < self.tabs.length) {
                self.tabs[index].active = true;
            } else {
                self.tabs[self.tabs.length - 1].active = true;
            }
        }
    };

    this.addTab = function (tab) {
        self.tabs.push(tab);
        $timeout(function() {
            self.tabs[0].active = true;
         //   self.tabs[self.tabs.length - 1].active = self.tabs[self.tabs.length - 1].active || (self.tabs.length === 1);
        });
        //self.tabs[self.tabs.length - 1].active = self.tabs[self.tabs.length - 1].active || (self.tabs.length === 1);
    };

    function deactiveAllTabs(tabs) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].active = false;
        }
    }
}

let app = angular.module(moduleName, []);
app.component(tabsetComponentName, {
    templateUrl: 'wi-tabset.html',
    controller: TabsetController,
    controllerAs: tabsetComponentName,
    transclude: true,
    bindings: {
        toggle: "<",
        onToggle: "<",
        position: "@",
        navAlign: "@"
    }
});


function TabController() {
    let self = this;

    this.$onInit = function () {
        if (!self.enabled) self.enabled = 'true';
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
        heading: '@',
        closable: '@',
        active: '<',
        enabled: '<',
        onShow: '<'
    }
});


exports.name = moduleName;

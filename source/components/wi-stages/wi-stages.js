const moduleName = 'wi-stages';
const name = 'wiStages';

const stageComponentName = 'wiStage';

function MasterController($scope, $timeout, wiChunkedUploadService) {
    let self = this;
    $scope.ctrl = self;
    this.stages = [];
    this.isExpand = true;
    this.icon = 'fa fa-chevron-up';
    
    this.navigatable = function() {
        return !wiChunkedUploadService.uploadUrl;
    }

    /*
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
    this.selectStage = function (index) {
        deactiveAllStages(self.stages);

        self.stages[index].active = true;
    };
    */

    this.addStage = function(stage) {
        self.stages.push(stage);
        self.stages[self.stages.length - 1].active = self.stages[self.stages.length - 1].active || (self.stages.length === 1);
        return self.stages.length - 1;
    };

    this.currentStageIndex = 0;
    this.skip = function() {
        if (self.stages.length <= 1) return;
        let activeStage = self.stages.find(function(stage){
            return stage.active;
        });
        let activeIndex = activeStage.stageIndex;
        if (activeIndex < self.stages.length - 1) {
            $timeout(function() {
                self.stages[activeIndex + 1].active = true;
                self.currentStageIndex = activeIndex + 1;
                activeStage.active = false;
                autoScroll(self.stages.length, self.currentStageIndex);
            });
        }
    }

    function autoScroll(total, pos) {
        let scrollContainer = $('wi-stages .scroll-container');
        let totalOffset = scrollContainer[0].scrollHeight - scrollContainer.height();
        if (totalOffset>0);
        scrollContainer.scrollTop(totalOffset/total * (pos+1));
    }
    this.back = function() {
        if (self.stages.length <= 1) return;
        let activeStage = self.stages.find(function(stage){
            return stage.active;
        });
        let activeIndex = activeStage.stageIndex;
        if (activeIndex > 0) {
            $timeout(function() {
                self.stages[activeIndex - 1].active = true;
                self.currentStageIndex = activeIndex - 1;
                activeStage.active = false;
                autoScroll(self.stages.length, self.currentStageIndex);
            });
        }
    }

    function deactiveAllStages(stages) {
        for (let i = 0; i < stages.length; i++) {
            stages[i].active = false;
        }
    }
}

let app = angular.module(moduleName, []);
app.component(name, {
    templateUrl: 'wi-stages.html',
    controller: MasterController,
    controllerAs: name,
    transclude: true
});


function StageController() {
    let self = this;
    this.$onInit = function () {
        self.stageIndex = self.wiStagesCtrl.addStage(self);
    };
}

app.component(stageComponentName, {
    templateUrl: 'wi-stage.html',
    controller: StageController,
    controllerAs: stageComponentName,
    transclude: true,
    require: {
        'wiStagesCtrl': '^wiStages'
    },
    bindings: {
        label: '@',
        icon: '@',
        active: '<'
    }
});


exports.name = moduleName;

let helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        let self = this;
        self.template = {template: ''};
        this.zone = {
            name: "",
            startDepth: "",
            endDepth: "",
            fill: {
                pattern: {
                    name: "none",
                    background: "rgb(0, 0, 0)",
                    foreground: "rgb(220, 220, 220)"
                }
            }
        }
        let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);        
        this.selectPatterns = ['none', 'basement', 'chert', 'dolomite', 'limestone', 'sandstone', 'shale', 'siltstone'];
        
        this.backgroundZone = function () {
            DialogUtils.colorPickerDialog(ModalService, self.zone.fill.pattern.background, function (colorStr) {
                self.zone.fill.pattern.background = colorStr;
                console.log('bg', self.zone.background);
            });
        };

        this.foregroundZone = function () {
            DialogUtils.colorPickerDialog(ModalService, self.zone.fill.pattern.foreground, function (colorStr) {
                self.zone.fill.pattern.foreground = colorStr;
            });
        };
        this.choosePattern = function() {
            DialogUtils.fillPatternDialog(ModalService, 
                                        self.zone.fill.pattern.name, 
                                        self.zone.fill.pattern.foreground, 
                                        self.zone.fill.pattern.background, 
                                        function(_name) {
                if(_name) {
                    self.zone.fill.pattern.name = _name;
                }
            });
        }
        this.chooseTemplate = function(){
            console.log('chooseTemplateFunction called');
            DialogUtils.chooseTemplateDialog(ModalService, function (template){
                if(template){
                    self.zone.name = template.name;
                    self.zone.fill.pattern.name = template.fill.pattern.name;
                    self.zone.fill.pattern.background = template.fill.pattern.background;
                    self.zone.fill.pattern.foreground = template.fill.pattern.foreground;
                    console.log('data got from chooseTemlateDialog', self.zone);
                }
            })
        }
        this.onOkButtonClicked = function () {
           close(self.zone);
        };

        this.onCancelButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        templateUrl: 'create-new-zone-modal.html',
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};
let helper = require('./DialogHelper');
module.exports = function (ModalService, name, foreground, background, callback) {
    function ModalController($scope, wiComponentService, wiApiService, wiPatternService, close, $timeout) {
        let self = this;
        window.PT = this;
        let utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.name = name;
        this.foreground = foreground;
        this.background = background;
        this.selectPatterns = wiComponentService.getComponent(wiComponentService.PATTERN);
        this.filter = '';
        // $('.list-pattern-style').scrollTop(1000);
        $('.list-pattern-style').scroll(function() {
            console.log("scroll");
        });

        this.config = [];
        for (let p in this.selectPatterns){
            let node = {
                name: p,
                type: "pattern",
                data: {
                    childExpanded: true,
                    label: this.selectPatterns[p].full_name,
                    tooltip: this.selectPatterns[p].full_name,
                    selected : (this.name == p) ? true : false,
                    imageBg : 'url(' + this.selectPatterns[p].src + ')'
                }, 
                properties: this.selectPatterns[p]
            }
            this.config.push(node);
        };
        this.onClickFunction = function($event, $index, node) {
            setSelectedNode(node);
            self.name = node.name;
        }
        function setSelectedNode(node) {
            self.config.forEach(function (item) {
                utils.visit(item, function (n) {
                    if (n.data) n.data.selected = false;
                    if (n.name == node.name) n.data.selected = true;
                });
            });
        }
        this.onOkButtonClicked = function() {
            close(self.name);
        }
        this.onCancelButtonClicked = function () {
            close(null, 100);
        };

    }

    ModalService.showModal({
        templateUrl: "fill-pattern-modal.html",
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            callback(ret);
        });
    });
}
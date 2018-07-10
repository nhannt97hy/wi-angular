const helper = require('./DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, ModalService, $timeout) {
        const self = this;
        const Utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.treeConfig = [];
        this.marker = {
            depth: null,
            idMarkerTemplate: null
        }

        this.refreshTree = function () {
            self.treeConfig;
            wiApiService.listMarkerTemplate((listTemplate, err) => {
                if (err) return;
                const markerTemplateGroups = _.groupBy(listTemplate, 'template');
                const mstNames = Object.keys(markerTemplateGroups).filter(mstName => {
                    return true;
                });
                _.merge(self.treeConfig, mstNames.map(name => ({
                    name,
                    type: 'marker-set-template',
                    data: {
                        icon: 'marker-properties-16x16',
                        label: name,
                        childExpanded: true
                    },
                    properties: { template: name },
                    children: markerTemplateGroups[name].map(mt => ({
                        name: mt.name,
                        type: 'marker-template',
                        id: mt.idMarkerTemplate,
                        data: {
                            icon: 'marker-properties-16x16',
                            label: mt.name,
                            childExpanded: true
                        },
                        properties: Object.assign(mt, { lineStyle: mt.lineStyle }),
                    }))
                })))

                self.onTreeSelect(self.treeConfig[0].children[Math.floor(Math.random() * (self.treeConfig[0].children.length-1))]);

            })
        }
        this.refreshTree();

        this.onTreeSelect = function (node) {
            _unselectAllNodes(self.treeConfig);
            if (node.type === 'marker-template') {
                self.selectedTemplate = node.properties;
            }
            node.data.selected = true;
        }

        // buttons
        this.onOkButtonClicked = function () {
            if (!self.selectedTemplate) return toastr.error('Marker template must be selected');
            close(Object.assign(self.marker, { idMarkerTemplate: self.selectedTemplate.idMarkerTemplate, markerTemplate: self.selectedTemplate }));
        };
        this.onCancelButtonClicked = function () {
            close(null);
        };

        // private
        function _unselectAllNodes(rootNode) {
            rootNode.forEach(function (node) {
                Utils.visit(node, function (_node) {
                    if (_node.data) _node.data.selected = false;
                });
            });
        }
    }

    ModalService.showModal({
        templateUrl: 'choose-marker-template-modal.html',
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

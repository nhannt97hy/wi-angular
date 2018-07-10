const helper = require('./DialogHelper');
const markerLineHelper = require('./markerLineHelper');

module.exports = function (ModalService, markerSetTemplate, depth, callback) {
    function ModalController($scope, close, wiApiService, wiComponentService, $sce) {
        const self = this;
        const Utils = wiComponentService.getComponent(wiComponentService.UTILS);

        this.treeConfig = [];
        this.marker = {
            depth: +depth,
            idMarkerTemplate: null
        }

        this.refreshTree = function () {
            self.treeConfig;
            wiApiService.listMarkerTemplate((listTemplate, err) => {
                if (err) return;
                const markerTemplateGroups = _.groupBy(listTemplate, 'template');
                const mstNames = Object.keys(markerTemplateGroups).filter(mstName => {
                    if (!markerSetTemplate) return true;
                    else return mstName === markerSetTemplate;
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
                    children: markerTemplateGroups[name].map(mt => {
                        mt.lineStyle = JSON.parse(mt.lineStyle);
                        mt.lineStyle.dashArray = JSON.parse(mt.lineStyle.dashArray);
                        return {
                            name: mt.name,
                            type: 'marker-template',
                            id: mt.idMarkerTemplate,
                            data: {
                                icon: 'marker-properties-16x16',
                                label: mt.name,
                                childExpanded: true
                            },
                            properties: mt,
                        }
                    })
                })))
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

        this.getLineHtml = function ({ color, lineWidth, lineStyle }) {
            let dashArray = lineStyle.dashArray;
            if (typeof markerLineHelper[lineStyle.shape] === 'function') {
                const func = markerLineHelper[lineStyle.shape];
                let width = 200, height, stepWidth;
                switch (lineStyle.shape) {
                    case 'sin':
                        height = 16;
                        stepWidth = 16;
                        break;
                    case 'fault':
                        height = Math.sqrt((dashArray[0] ** 2) / 2);
                        stepWidth = Math.sqrt((dashArray[0] ** 2) / 2);
                        break;
                    default: break;
                }
                const elem = func({ width, height, stepWidth }).node();
                $(elem).css({
                    'stroke': color,
                    'stroke-width': lineWidth,
                    'stroke-dasharray': lineStyle.dashArray,
                    transform: `translateY(${(16-height)/2}px)`,
                })
                return $sce.trustAsHtml(elem.outerHTML);
            } else return null;
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
        templateUrl: 'create-new-marker-modal.html',
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

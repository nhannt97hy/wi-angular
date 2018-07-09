const componentName = 'wiMarkerManager';
const moduleName = 'wi-marker-manager';

function Controller(wiComponentService, wiApiService, ModalService) {
    const self = this;
    const Utils = wiComponentService.getComponent(wiComponentService.UTILS);
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    const idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
    let refreshMarkerSets = false;
    this.treeConfig = [];

    this.$onInit = function () {
        wiComponentService.putComponent(self.name, self);
        this.getMarkerSetList();
    }

    // marker sets
    this.getMarkerSetList = function () {
        refreshMarkerSets = true;
        wiApiService.listWells({ idProject }, function (wells) {
            const wellModels = [];
            for (const well of wells) {
                wellModels.push(_createWellModel(well));
            }
            _.merge(self.treeConfig, wellModels);
            for (const wellModel of self.treeConfig) {
                const well = wells.find(w => w.idWell === wellModel.id);
                if (!well) wellModel.data.deleted = true;
            }
            self.getSelectedMarkerSet() && self.selectMarkerSet(self.selectedIdMarkerSet);
            self.getSelectedWell() && self.onTreeSelect(self.getSelectedWell());
        });
    }
    this.onTreeSelect = function (node) {
        _unselectAllNodes(self.treeConfig);
        if (node.type === 'well') {
            if (refreshMarkerSets) {
                refreshMarkerSets = false;
                wiApiService.listMarkerSet(node.properties.idWell, function (markerSets) {
                    node.data.childExpanded = true;
                    const markerSetModels = [];
                    for (const markerSet of markerSets) {
                        markerSetModels.push(_createMarkerSetModel(markerSet));
                    }
                    _.merge(node.children, markerSetModels);
                    for (const markerSetModel of node.children) {
                        const markerSet = markerSets.find(ms => ms.idMarkerSet === markerSetModel.id);
                        if (!markerSet) markerSetModel.data.deleted = true;
                    }
                });
            }
        }
        if (node.type === 'marker-set') {
            self.selectMarkerSet(node.id);
        }
        node.data.selected = true;
    }
    this.selectMarkerSet = function (idMarkerSet) {
        if (!idMarkerSet) return;
        this.selectedIdMarkerSet = idMarkerSet;
        wiApiService.getMarkerSet(idMarkerSet, (markerSet, err) => {
            if (err) return;
            if (_.get(self.selectedMarkerSet, '0, idMarkerSet') !== markerSet.idMarkerSet) self.selectedMarkerSet = [];
            const newMarkers = self.selectedMarkerSet.filter(m => {
                m.flag = false;
                return m.new;
            });
            self.selectedMarkerSet = markerSet.markers.map(m => {
                Object.assign(m, { markerTemplate: m.marker_template })
                m.markerTemplate.lineStyle = JSON.parse(m.markerTemplate.lineStyle);
                m.markerTemplate.lineStyle.dashArray = JSON.parse(m.markerTemplate.lineStyle.dashArray);
                return m;
            }).concat(newMarkers);
            _sortByDepth(self.selectedMarkerSet);
        })
    }
    this.getSelectedMarkerSet = function () {
        const selectedNode = _getSelectedNode(this.treeConfig) || {};
        return selectedNode.type === 'marker-set' ? selectedNode : null;
    }
    this.getSelectedWell = function () {
        const selectedNode = _getSelectedNode(this.treeConfig) || {};
        return selectedNode.type === 'well' ? selectedNode : null;
    }
    this.createMarkerSet = function () {
        const well = this.getSelectedWell();
        if (!well) return;
        DialogUtils.newMarkerSetDialog(ModalService, function ({ name, template }) {
            wiApiService.createMarkerSet({
                name: name,
                template: template,
                idWell: well.id
            }, () => self.getMarkerSetList());
        });
    }

    // markers
    this.onSelect = function (marker, $event) {
        if ($event.shiftKey) {
            const markIndex = this.selectedMarkerSet.indexOf(this.mark || this.current);
            const currIndex = this.selectedMarkerSet.indexOf(marker);
            let minIndex = Math.min(markIndex, currIndex);
            let maxIndex = Math.max(markIndex, currIndex);
            if (!this.mark) {
                marker.flag = !marker.flag;
                this.mark = marker;
            }
            for (let i = minIndex; i <= maxIndex; i++) {
                this.selectedMarkerSet[i].flag = this.selectedMarkerSet[markIndex].flag;
            }
        } else {
            marker.flag = !marker.flag;
            this.mark = null;
        }
        this.current = marker;
    }
    this.markerEdited = function (marker) {
        this.hasChanges = true;
        marker.edited = true;
    }
    Object.defineProperty(self, 'selectedMarkers', {
        get: function () {
            if (!this.selectedMarkerSet) return [];
            return this.selectedMarkerSet.filter(t => t.flag);
        }
    });
    this.saveChanges = async function () {
        if (!this.hasChanges) return;
        const promises = [];
        for (const marker of this.selectedMarkerSet) {
            if (marker.new) {
                promises.push(new Promise(resolve => {
                    const payload = Object.assign({}, marker, { markerTemplate: null, marker_template: null });
                    wiApiService.createMarker(payload, resolve);
                }));
                continue;
            }
            if (marker.edited) {
                promises.push(new Promise(resolve => {
                    const payload = Object.assign({}, marker, { markerTemplate: null, marker_template: null });
                    wiApiService.editMarker(payload, resolve);
                }));
                continue;
            }
        }
        await Promise.all(promises);
        this.hasChanges = false;
        this.selectedMarkerSet.length = 0;
        this.getMarkerSetList();
    }
    this.deleteMarker = function (marker) {
        if (marker.new) {
            marker.flag = false;
            marker.deleted = true;
            self.selectedMarkerSet = self.selectedMarkerSet.filter(m => !m.deleted);
        }
        else wiApiService.removeMarker(marker.idMarker, () => {
            marker.flag = false;
            marker.deleted = true;
            self.selectedMarkerSet = self.selectedMarkerSet.filter(m => !m.deleted);
        });
    }
    this.deleteSelectedMarkers = function () {
        for (const marker of this.selectedMarkers) {
            self.deleteMarker(marker);
        }
    }
    this.addMarker = function (isAbove) {
        const selectedMarker = this.selectedMarkers.length === 1 ? this.selectedMarkers[0] : null;
        let depth, markerSetModel;
        if (!selectedMarker) {
            markerSetModel = this.getSelectedMarkerSet();
            if (this.selectedMarkerSet.length || !markerSetModel) return;
            // marker set empty
            const wellModel = Utils.getModel('well', markerSetModel.properties.idWell, self.treeConfig);
            depth = wellModel.properties.topDepth;
        }
        else {
            markerSetModel = Utils.getModel('marker-set', selectedMarker.idMarkerSet, self.treeConfig);
            const wellModel = Utils.getModel('well', markerSetModel.properties.idWell, self.treeConfig);
            const aboveMarker = this.selectedMarkerSet[this.selectedMarkerSet.indexOf(selectedMarker)-1];
            const belowMarker = this.selectedMarkerSet[this.selectedMarkerSet.indexOf(selectedMarker)+1];
            const { topDepth, bottomDepth } = wellModel.properties;
            depth = isAbove ? selectedMarker.depth - 50 : selectedMarker.depth + 50;
            if (aboveMarker && depth <= aboveMarker.depth) depth = (aboveMarker.depth + selectedMarker.depth) / 2;
            if (belowMarker && depth >= belowMarker.depth) depth = (belowMarker.depth + selectedMarker.depth) / 2;
            depth = Math.max(topDepth, depth);
            depth = Math.min(bottomDepth, depth);
        }
        const markerSetTemplate = this.selectedMarkerSet.length ? this.selectedMarkerSet[0].markerTemplate.template : null;
        DialogUtils.createNewMarkerDialog(ModalService, markerSetTemplate, depth, (newMarker) => {
            self.selectedMarkerSet.forEach(m => m.flag = false);
            Object.assign(newMarker, { new: true, flag: true, idMarkerSet: markerSetModel.id });
            self.selectedMarkerSet.push(newMarker);
            self.markerEdited(newMarker);
            _sortByDepth(self.selectedMarkerSet);
        });
    }
    this.swapTwoMarkers = function () {
        const markers = this.selectedMarkers;
        if (markers.length !== 2) return;

    }


    // private
    function _createWellModel(well) {
        return {
            name: well.name,
            type: 'well',
            id: well.idWell,
            data: {
                icon: 'well-16x16',
                label: well.name,
            },
            properties: well,
            children: []
        }
    }
    function _createMarkerSetModel(markerSet) {
        return {
            name: markerSet.name,
            type: 'marker-set',
            id: markerSet.idMarkerSet,
            data: {
                icon: 'marker-properties-16x16',
                label: markerSet.name,
            },
            properties: markerSet,
        }
    }
    function _unselectAllNodes(rootNode) {
        rootNode.forEach(function (node) {
            Utils.visit(node, function (_node) {
                if (_node.data) _node.data.selected = false;
            });
        });
    }
    function _getSelectedNode(rootNode) {
        let selectedNode = null;
        rootNode.forEach(function (node) {
            Utils.visit(node, function (_node) {
                if (_node.data.selected) {
                    selectedNode = _node;
                    return true;
                }
            });
        });
        return selectedNode;
    }
    function _sortByDepth(markers) {
        markers.sort((a, b) => a.depth - b.depth);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-marker-manager.html',
    controller: Controller,
    // controllerAs: componentName,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;
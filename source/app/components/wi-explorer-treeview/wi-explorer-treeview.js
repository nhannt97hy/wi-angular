const componentName = "wiExplorerTreeview";
const moduleName = "wi-explorer-treeview";
const wiBaseTreeview = require("./wi-base-treeview");

function WiExpTreeController(
    $controller,
    wiComponentService,
    wiApiService,
    $timeout,
    $scope
) {
    let self = this;
    const utils = wiComponentService.getComponent(wiComponentService.UTILS);

    this.$onInit = function() {
        window.__WIEXPTREE = self;
    };

    function setupCurveDraggable (element) {
        let dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        let selectedObjs;
        element.draggable({
            helper: function (event) {
                selectedObjs = $(`#WiExplorertreeview .wi-parent-node[type='curve']`).filter('.item-active').clone();
                let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
                let dom = null;
                if (!selectedNodes || selectedNodes.find(n => n.type != 'curve')) {
                    dom = $(event.currentTarget).find('div:nth-child(2)').clone();
                    dom.css('pointer-events', 'none');
                } else {
                    dom = $('<div/>');
                    dom.css('pointer-events', 'none');
                    dom.append(selectedObjs.find('.wi-parent-content div:nth-child(2)'));
                }
                return dom;
            },
            start: function (event, ui) {
                dragMan.dragging = true;
                // d3.selectAll('.vi-track-container').style('z-index', 1);
            },
            stop: function (event, ui) {
                dragMan.dragging = false;
                const idDataset = dragMan.idDataset;
                let wiD3Ctrl = dragMan.wiD3Ctrl;
                let trackCtrl = dragMan.track;
                trackCtrl = (trackCtrl && trackCtrl.verifyDroppedIdCurve) ? trackCtrl : null;
                let wiSlidingBarCtrl = dragMan.wiSlidingBarCtrl;
                dragMan.idDataset = null;
                dragMan.wiD3Ctrl = null;
                dragMan.track = null;
                dragMan.wiSlidingBarCtrl = null;
                // d3.selectAll('.vi-track-container').style('z-index', 'unset');
                let idCurves = selectedObjs.map(function () { return parseInt($(this).attr('data')) }).get();
                if (idCurves.length) {
                    handleDrop(idCurves);
                } else {
                    let idCurve = parseInt($(event.target).attr('data'));
                    handleDrop([idCurve]);
                }
                async function handleDrop(idCurves) {
                    if (idDataset) {
                        const curveModels = idCurves.map(idCurve => getModel('curve', idCurve));
                        copyCurve(curveModels);
                        const datasetModel = getModel('dataset', idDataset)
                            pasteCurve(datasetModel);
                        return;
                    }
                    if (wiSlidingBarCtrl) {
                        let idCurve = idCurves[0];
                        let errorCode = wiSlidingBarCtrl.verifyDroppedIdCurve(idCurve);
                        console.log('drop curve into slidingBar', errorCode);
                        if (errorCode > 0) {
                            wiSlidingBarCtrl.createPreview(idCurve);
                            let logplotModel = wiSlidingBarCtrl.wiLogplotCtrl.getLogplotModelAsync();
                            let logplotRequest = angular.copy(logplotModel.properties);
                            logplotRequest.referenceCurve = idCurve;
                            apiService.editLogplot(logplotRequest, function () {
                                logplotModel.properties.referenceCurve = idCurve;
                            });
                        }
                        else if (errorCode === 0) {
                            toastr.error("Cannot drop curve from another well");
                        }
                        return;
                    }
                    if (wiD3Ctrl && !trackCtrl) {
                        // const errorCode = wiD3Ctrl.verifyDroppedIdCurve(idCurves[0]);
                        // if (errorCode > 0) {
                        let logTrackProps = await wiD3Ctrl.addLogTrack();
                        async.each(idCurves, (idCurve, next) => {
                            apiService.createLine({
                                idTrack: logTrackProps.idTrack,
                                idCurve: idCurve,
                                orderNum: 'm'
                            }, function (line) {
                                next();
                            });
                        }, (err) => {
                            wiD3Ctrl.reloadTrack(logTrackProps);
                        });
                        // } else if (errorCode === 0) {
                        //     toastr.error("Cannot drop curve from another well");
                        // }
                        return;
                    }
                    if (wiD3Ctrl && trackCtrl) {
                        async.eachSeries(idCurves, (idCurve, next) => {
                            // let errorCode = wiD3Ctrl.verifyDroppedIdCurve(idCurve);
                            let errorCode = trackCtrl.verifyDroppedIdCurve(idCurve);
                            if (errorCode > 0) {
                                apiService.createLine({
                                    // idTrack: track.id,
                                    idTrack: trackCtrl.viTrack.id,
                                    idCurve: idCurve,
                                    orderNum: trackCtrl.viTrack.getCurveOrderKey()
                                }, function (line) {
                                    let lineModel = lineToTreeConfig(line);
                                    trackCtrl.update();
                                    next();
                                    // TO BE REMOVED
                                    // getCurveData(apiService, idCurve, function (err, data) {
                                    //     trackCtrl.addCurveToTrack(trackCtrl.viTrack, data, lineModel.data);
                                    //     next(err);
                                    // });
                                });
                            }
                            else if (errorCode === 0) {
                                toastr.error("Cannot drop curve from another well");
                            }
                            return;
                        })
                    }
                }
            },
            appendTo: 'body',
            revert: false,
            scroll: false,
            containment: 'document',
            cursorAt: {
                top: 5,
                left: 10
            }
        });
    };

    function handleKey(event) {
        switch (event.key) {
            case 'F2':
                const selectedNode = utils.getSelectedNode();
                switch (selectedNode.type) {
                    case 'well':
                        utils.renameWell();
                        break;
                    case 'dataset':
                        utils.renameDataset();
                        break;
                    case 'curve':
                        utils.renameCurve();
                        break;
                    case 'zoneset':
                        utils.renameZoneSet(selectedNode);
                        break;
                    default:
                        break;
                }
                break;
            case 'Delete':
                const isPermanently = !!event.shiftKey;
                self.container.handlers.DeleteItemButtonClicked(isPermanently);
                break;
            default:
                break;
        }
    }

    this.onReady = _.debounce(function () {
        let typeItemDragable = "curve";
        const curveElements = $("wi-base-treeview#" + self.name + " .wi-parent-node" + `[type='${typeItemDragable}']`);
        setupCurveDraggable(curveElements, wiComponentService, wiApiService);
        curveElements.click(function() {
            this.focus();
        });
        // dataset droppable
        const dragMan = wiComponentService.getComponent(wiComponentService.DRAG_MAN);
        $(`wi-base-treeview#${self.name} .wi-parent-node[type=dataset]`).droppable({
            accept: '.wi-parent-node[type=curve]',
            addClasses: false,
            tolerance: 'pointer',
            over: function (event, ui) {
                if (event.ctrlKey) {
                    ui.helper.css('cursor', 'copy');
                }
            },
            out: function (event, ui) {
                ui.helper.css('cursor', '');
            },
            drop: function (event, ui) {
                if (event.ctrlKey) {
                    // console.log('copying to', event, ui);
                    dragMan.idDataset = +$(event.target).attr('data');
                }
            },
            cursor: 'copy'
        });
        const nodeElements = $(`wi-base-treeview#${self.name} .wi-parent-node`);
        nodeElements.off('focusin');
        nodeElements.off('focusout');
        nodeElements.focusin(function() {
            $(this).on('keyup', handleKey);
        });
        nodeElements.focusout(function() {
            $(this).off('keyup', handleKey);
        });
    }, 100)

    this.onClick = function($index, $event) {
        if (!this.container && this.container.selectHandler) return;
        let node = this.config[$index];
        node.$index = $index;
        if (!node) {
            this.container.unselectAllNodes();
            return;
        }
        wiComponentService.emit("update-properties", node);
        let selectedNodes = wiComponentService.getComponent(
            wiComponentService.SELECTED_NODES
        );
        if (!Array.isArray(selectedNodes)) selectedNodes = [];
        if (!$event.shiftKey) {
            if (
                !$event.ctrlKey ||
                node.type != selectedNodes[0].type ||
                node.parent != selectedNodes[0].parent
            ) {
                if (
                    $event.type == "contextmenu" &&
                    selectedNodes.includes(node)
                )
                    return this.container.selectHandler(node);
                this.container.unselectAllNodes();
            }
            this.container.selectHandler(node);
        } else {
            // shift key
            if (selectedNodes.length) {
                if (selectedNodes.includes(node)) return;
                if (
                    node.type != selectedNodes[selectedNodes.length - 1].type ||
                    node.parent != selectedNodes[0].parent
                ) {
                    this.container.unselectAllNodes();
                    this.container.selectHandler(node);
                } else {
                    if (node.$index < selectedNodes[0].$index) {
                        let fromIndex = node.$index;
                        let toIndex = selectedNodes[0].$index;
                        this.container.unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            this.container.selectHandler(this.config[i]);
                        }
                    } else {
                        let fromIndex = selectedNodes[0].$index;
                        let toIndex = node.$index;
                        this.container.unselectAllNodes();
                        for (let i = fromIndex; i <= toIndex; i++) {
                            this.container.selectHandler(this.config[i]);
                        }
                    }
                }
            }
        }
    };

    this.showContextMenu = function($event, $index) {
        console.log(this.config[$index]);
        let nodeType = this.config[$index].type;
        let container = this.container;
        let defaultContextMenu = container.getDefaultTreeviewCtxMenu(
            $index,
            this
        );
        let itemContextMenu = container.getItemTreeviewCtxMenu(nodeType, this);
        let contextMenu = itemContextMenu.concat(defaultContextMenu);
        wiComponentService
            .getComponent("ContextMenu")
            .open($event.clientX, $event.clientY, contextMenu);
    };
}

let app = angular.module(moduleName, [wiBaseTreeview.name]);
app.component(componentName, {
    templateUrl: "wi-explorer-treeview.html",
    controller: WiExpTreeController,
    controllerAs: componentName,
    bindings: {
        name: "@",
        config: "<",
        container: "<",
        filter: "@",
        filterBy: "@"
    }
});
exports.name = moduleName;

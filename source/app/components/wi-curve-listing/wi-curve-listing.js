const componentName = 'wiCurveListing';
const moduleName = 'wi-curve-listing';

function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    let self = this;
    this.applyingInProgress = false;
    let buffer = 100;
    let threshold = 200;
    let currentScroll;
    let padding = 5;
    let _dom;
    let _x;
    let minWidth = 100;

    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let selectedNodes = wiComponentService.getComponent(wiComponentService.SELECTED_NODES);
    let spinner = wiComponentService.getComponent('SPINNER');

    function getDatasets() {
        self.datasets.length = 0;
        self.curvesArr.length = 0;
        if (self.SelectedWell && self.SelectedWell.children.length) {
            self.SelectedWell.children.forEach(function (child, i) {
                if (child.type == 'dataset')
                    self.datasets.push(child);
                if (i == self.SelectedWell.children.length - 1) {
                    if (self.datasets.length) {
                        self.SelectedDataset = self.datasets[0];
                        self.datasets.forEach(child => {
                            child.children.forEach(function (item) {
                                if (item.type == 'curve') {
                                    let d = angular.copy(item);
                                    d.selected = false;
                                    self.curvesArr.push(d);
                                }
                            })
                        })
                    }
                }
            });
        }
    }

    function getData() {
        let len = self.depthArr[self.currentIndex].length;
        if (self.first < 0) self.first = 0;
        if (self.first + threshold > len) self.first = len - threshold;
        console.log('getData', self.first);
        self.loaded = self.depthArr[self.currentIndex].slice(self.first, self.first + threshold);
    }

    function loadUp(cb) {
        if (self.first > 0) {
            self.first -= buffer;
            $timeout(function () {
                getData();
                if (cb) cb();
            })
        }
    }

    function loadDown(cb) {
        let len = self.depthArr[self.currentIndex].length;
        if (self.first + threshold != len) {
            self.first += buffer;
            $timeout(function () {
                getData()
                if (cb) cb();
            })
        }
    }
    this.onChangeWell = function (clear) {
        getDatasets();
        self.focus = null;
        self.currentIndex = self.wells.findIndex(w => { return w.id == self.SelectedWell.id });
        if (!self.depthArr[self.currentIndex].length) {
            spinner.show();
            let step = self.SelectedWell.step;
            let topDepth = self.SelectedWell.topDepth;
            let bottomDepth = self.SelectedWell.bottomDepth;
            let length = Math.round((bottomDepth - topDepth) / step) + 1;
            self.depthArr[self.currentIndex] = new Array(length);
            async.eachOf(self.depthArr[self.currentIndex], function (depth, i, callback) {
                self.depthArr[self.currentIndex][i] = parseFloat((step * i + topDepth).toFixed(4));
                async.setImmediate(callback);
            }, function (err) {
                $timeout(function () {
                    spinner.hide();
                    self.loaded = self.depthArr[self.currentIndex].slice(0, threshold);
                    self.first = 0;
                });
            })
        } else {
            self.loaded = self.depthArr[self.currentIndex].slice(0, threshold);
            self.first = 0;
        }

        if (clear) {
            self.curvesData[self.currentIndex].forEach(curve => {
                curve.show = false;
            })
        }
        self.curvesData[self.currentIndex].forEach(curve => {
            if (curve.show) {
                self.curvesArr.find(c => {
                    return c.id == curve.id;
                }).selected = true;
            }
            if (curve.edit) {
                self.curvesArr.find(c => {
                    return c.id == curve.id;
                }).modified = true;
            }
        })
    }

    this.$onInit = function () {
        wiComponentService.putComponent('WCL', self);
        self.isShowRefWin = false;
        self.datasets = [];
        self.curvesArr = [];
        self.wells = utils.findWells();
        self.curvesData = new Array(self.wells.length).fill().map(u => { return new Array() });
        self.depthArr = new Array(self.wells.length).fill().map(u => { return new Array() });
        if (selectedNodes && selectedNodes.length) {
            switch (selectedNodes[0].type) {
                case 'well':
                    self.SelectedWell = selectedNodes[0];
                    break;

                case 'dataset':
                    self.SelectedWell = utils.findWellById(selectedNodes[0].properties.idWell);
                    break;

                case 'curve':
                    self.SelectedWell = utils.findWellByCurve(selectedNodes[0].id);
                    break;

                default:
                    self.SelectedWell = self.wells && self.wells.length ? self.wells[0] : null;
            }
        }
        else {
            self.SelectedWell = self.wells && self.wells.length ? self.wells[0] : null;
        }
        self.currentIndex = self.wells.findIndex(w => { return w.id == self.SelectedWell.id });

        wiComponentService.on(wiComponentService.PROJECT_REFRESH_EVENT, function () {
            self.applyingInProgress = false;
            $timeout(function () {
                async.series([function (callback) {
                    self.wells = utils.findWells();
                    self.curvesData = new Array(self.wells.length).fill().map(u => { return new Array() });
                    self.depthArr = new Array(self.wells.length).fill().map(u => { return new Array() });
                    self.SelectedWell = self.wells.find(w => { return w.id == self.SelectedWell.id });
                    if (!self.SelectedWell) {
                        self.curvesData.splice(self.currentIndex, 1);
                        self.SelectedWell = self.wells[0];
                    }
                    callback();
                }], function (err, ret) {
                    self.onChangeWell();
                })
            }, 0);
        });

        angular.element(document).ready(function () {
            self.onChangeWell(true);
            let fcBody = $(".fix-column > .tbody");
            let rcBody = $(".rest-columns > .tbody");
            let rcHead = $(".rest-columns > .thead");

            let onScroll = function () {
                if (rcBody.scrollTop() < (padding * 30) && rcBody.scrollTop() < currentScroll) {
                    console.log('up');
                    loadUp(function () {
                        self.focus = null;
                        rcBody.scrollTop(buffer * 30);
                    });
                }
                if (rcBody[0].scrollHeight - Math.round(rcBody.scrollTop() + rcBody.innerHeight()) < (padding * 30) && rcBody.scrollTop() > currentScroll) {
                    console.log('Down');
                    loadDown(function () {
                        self.focus = null;
                        rcBody.scrollTop(rcBody[0].scrollHeight - rcBody.innerHeight() - buffer * 30);
                    });
                }
                currentScroll = rcBody.scrollTop();
                fcBody.scrollTop(rcBody.scrollTop());
                rcHead.scrollLeft(rcBody.scrollLeft());
            }
            rcBody.scroll(_.debounce(onScroll, 100));
            document.addEventListener('keydown', function (event) {
                if (event.ctrlKey && event.keyCode == 71) {
                    event.preventDefault();
                    $("#depthInput").focus();
                }
            })
        })
    };

    this.toggleRefWin = function () {
        self.isShowRefWin = !self.isShowRefWin;
    }

    this.goToIndex = function () {
        let rcBody = $(".rest-columns > .tbody");
        let scroll = padding + 1;
        self.indexInput = Math.round(self.indexInput);
        if (self.indexInput <= 0) {
            self.first = 0;
            scroll = 0;
            self.focus = scroll;
        } else if (self.indexInput >= self.depthArr[self.currentIndex].length - 1) {
            self.first = self.depthArr[self.currentIndex].length - threshold;
            scroll = threshold;
            self.focus = scroll - 1;
        } else {
            self.first = self.indexInput < padding * 2 ? 0 : self.indexInput - padding * 2;
            scroll = self.indexInput < padding * 2 ? 0 : padding * 2;
            self.focus = self.indexInput < padding * 2 ? self.indexInput : padding * 2;
        }

        $timeout(function () {
            getData();
            if (self.first < self.indexInput - padding * 2 && self.indexInput < self.depthArr[self.currentIndex].length - 1) {
                scroll = self.indexInput - self.first;
                self.focus = scroll;
            }
            rcBody.scrollTop(scroll * 30);
            self.indexInput = null;
        })
    }

    this.goToDepth = function () {
        let rcBody = $(".rest-columns > .tbody");
        let scroll = padding + 1;
        let indexInput = Math.round((self.depthInput - self.SelectedWell.topDepth) / self.SelectedWell.step);
        if (indexInput <= 0) {
            self.first = 0;
            scroll = 0;
            self.focus = scroll;
        } else if (indexInput >= self.depthArr[self.currentIndex].length - 1) {
            self.first = self.depthArr[self.currentIndex].length - threshold;
            scroll = threshold;
            self.focus = scroll - 1;
        } else {
            self.first = indexInput < padding * 2 ? 0 : indexInput - padding * 2;
            scroll = indexInput < padding * 2 ? 0 : padding * 2;
            self.focus = indexInput < padding * 2 ? indexInput : padding * 2;
        }

        $timeout(function () {
            getData();
            if (self.first < indexInput - padding * 2 && indexInput < self.depthArr[self.currentIndex].length - 1) {
                scroll = indexInput - self.first;
                self.focus = scroll;
            }
            rcBody.scrollTop(scroll * 30);
            self.depthInput = null;
        })
    }

    this.onResizeStart = function ($event, dom) {
        console.log('mousedown', $event);
        _x = $event.clientX;
        _dom = $('.' + dom);
        _dom.css('border-right', '3px solid gray');
    }
    this.onResizing = function ($event) {
        if ($event.buttons && _dom) {
            var offsetX = $event.clientX - _x;
            _x = $event.clientX;
            let newW = _dom.width() + offsetX;
            newW = (newW < minWidth) ? minWidth : newW;
            _dom.width(newW);
        }
    }
    this.onResizeEnd = function ($event) {
        console.log('mouse up');
        if (_dom) {
            var offsetX = $event.clientX - _x;
            _x = $event.clientX;
            let newW = _dom.width() + offsetX;
            newW = (newW < minWidth) ? minWidth : newW;
            _dom.width(newW);
            _dom.css('border-right', '1px solid #ddd');
            _dom = null;
        }
    }

    this.onCurveSelectClick = function (SelCurve) {
        if (SelCurve.selected) {
            let curve = self.curvesData[self.currentIndex].find(curve => {
                return curve.id == SelCurve.id;
            })
            if (!curve) {
                wiApiService.dataCurve(SelCurve.id, function (data) {
                    let dataF = data.map(d => parseFloat(d.x));
                    self.curvesData[self.currentIndex].push({
                        name: SelCurve.name,
                        datasetName: SelCurve.properties.dataset,
                        idDataset: SelCurve.properties.idDataset,
                        id: SelCurve.id,
                        data: dataF,
                        dataBK: angular.copy(dataF),
                        show: true
                    })
                })
            } else {
                let index = self.curvesData[self.currentIndex].findIndex(c => { return c.id == SelCurve.id });
                self.curvesData[self.currentIndex][index].show = true;
            }
        } else {
            let index = self.curvesData[self.currentIndex].findIndex(c => { return c.id == SelCurve.id });
            self.curvesData[self.currentIndex][index].show = false;
        }
    }

    this.onModifyCurve = function (id) {
        self.curvesArr.find(c => {
            return c.id == id;
        }).modified = true;
    }

    this.reverseModified = function (id) {
        let curve = self.curvesData[self.currentIndex].find(c => {
            return c.id == id;
        })
        $timeout(function () {
            curve.data = angular.copy(curve.dataBK);
            self.curvesArr.find(c => { return c.id == id; }).modified = false;
        })
    }

    this.onAddCurveButtonClicked = function () {
        console.log('onAddCurveButtonClicked');
        DialogUtils.addCurveDialog(ModalService, self.SelectedWell);
    }
    this.onSaveButtonClicked = function () {
        console.log('onSaveButtonClicked');
        let modifiedCurves = [];
        modifiedCurves = self.curvesData[self.currentIndex].filter(c => {
            return c.edit;
        });
        if (modifiedCurves.length) {
            DialogUtils.saveCurvesDialog(ModalService, modifiedCurves, function () {
                console.log('save curves successed!');
                $timeout(function () {
                    self.curvesArr.forEach(curve => {
                        delete curve.modified;
                    })
                })
            })
        }
    }
    this.onRefWinBtnClicked = function () {
        console.log('onRefWinBtnClicked');
    }
    this.isNaN = function (val) {
        return isNaN(val);
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-curve-listing.html',
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;

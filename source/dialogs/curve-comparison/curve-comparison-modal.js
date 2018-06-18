let helper = require("./DialogHelper");
module.exports = function(ModalService, callback) {
  function ModalController($scope, wiComponentService, wiApiService, close) {
    let self = this;
    window.compa = this;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    let dialogUtils = wiComponentService.getComponent(
      wiComponentService.DIALOG_UTILS
    );
    this.wells = utils.findWells();
    let selectedNodes = wiComponentService.getComponent(
      wiComponentService.SELECTED_NODES
    );

    this.applyingInProgress = false;

    let zoneSetParaModel = {};
    let zoneArr = [];
    this.zoneSetPara = [];
    this.zones = [];
    this.curves = [];
    if (selectedNodes && selectedNodes.length) {
      switch (selectedNodes[0].type) {
        case "well":
          self.wellModel = selectedNodes[0];
          break;

        case "dataset":
          self.wellModel = utils.findWellById(
            selectedNodes[0].properties.idWell
          );
          break;

        case "curve":
          self.wellModel = utils.findWellByCurve(selectedNodes[0].id);
          break;

        case "zoneset":
          self.wellModel = utils.findWellById(
            selectedNodes[0].properties.idWell
          );
          zoneSetParaModel = selectedNodes[0];
          break;

        case "zone":
          zoneSetParaModel = utils.findZoneSetById(
            selectedNodes[0].properties.idZoneSet
          );
          self.wellModel = utils.findWellById(
            zoneSetParaModel.properties.idWell
          );
          break;

        default:
          self.wellModel =
            self.wells && self.wells.length
              ? angular.copy(self.wells[0])
              : null;
          break;
      }
    } else {
      self.wellModel =
        self.wells && self.wells.length ? angular.copy(self.wells[0]) : null;
    }

    this.idWell = this.wellModel.id;
    defaultDepth();
    getAllCurvesOnSelectWell(this.wellModel);
    this.checked = false;
    let style = {
      opacity: "0.7",
      "pointer-events": "none"
    };
    this.style = style;

    this.checkUseZone = function(check) {
      self.style = check ? {} : style;
      self.zoneSetPara = utils.getZoneSetsInWell(self.wellModel);
      if (self.zoneSetPara.length) {
        self.zoneSetParaModel = Object.keys(zoneSetParaModel).length
          ? zoneSetParaModel
          : self.zoneSetPara[0];
        selectZoneSetPara(self.zoneSetParaModel);
      }
    };
    function selectZoneSetPara(zoneSetParaModel) {
      self.zones = [];
      if (Object.keys(zoneSetParaModel).length)
        zoneArr = zoneSetParaModel.children;
      if (Array.isArray(zoneArr) && zoneArr.length) {
        zoneArr.forEach(function(z, index) {
          z.use = false;
          self.zones.push(z);
        });
      }
    }
    this.selectZoneSetPara = selectZoneSetPara;
    this.defaultDepth = defaultDepth;
    function defaultDepth() {
      self.topDepth = self.wellModel.topDepth;
      self.bottomDepth = self.wellModel.bottomDepth;
    }

    this.selectedWell = function(idWell) {
      self.curves = [];
      self.wellModel = utils.findWellById(idWell);
      defaultDepth();
      self.idWell = self.wellModel.id;
      self.zoneSetPara = utils.getZoneSetsInWell(self.wellModel);
      self.zoneSetParaModel = self.zoneSetPara.length
        ? self.zoneSetPara[0]
        : {};
      selectZoneSetPara(self.zoneSetParaModel);
      getAllCurvesOnSelectWell(self.wellModel);
    };

    function getAllCurvesOnSelectWell(well) {
      let datasets = [];
      well.children.forEach(function(child) {
        if (child.type == "dataset") datasets.push(child);
      });
      datasets.forEach(function(child) {
        child.children.forEach(function(item) {
          if (item.type == "curve") {
            self.curves.push(item);
          }
        });
      });
    }
    this.curvesComparison = new Array();
    for (let i = 0; i < 15; i++) {
      this.curvesComparison.push({
        curve1: null,
        curve2: null,
        difference: null,
        correlation: null
      });
    }
    this.groupFn = function(item) {
      return item.parent;
    };
    this.onRunButtonClicked = function() {
      if (self.applyingInProgress) return;
      self.applyingInProgress = true;
      if (
        !self.checked &&
        (self.topDepth < self.wellModel.topDepth ||
          self.bottomDepth > self.wellModel.bottomDepth)
      ) {
        dialogUtils.errorMessageDialog(
          ModalService,
          "Input invalid [" +
            self.wellModel.topDepth +
            "," +
            self.wellModel.bottomDepth +
            "]"
        );
      }

      async.each(
        self.curvesComparison,
        function(comparison, callback) {
          if (comparison.curve1 && comparison.curve2) {
            wiApiService.dataCurve(comparison.curve1.id, function(dataCurve1) {
              wiApiService.dataCurve(comparison.curve2.id, function(
                dataCurve2
              ) {
                let data1 = dataCurve1.map(d => parseFloat(d.x));
                let data2 = dataCurve2.map(d => parseFloat(d.x));
                // console.log("data", data1);
                function comparisonParam(start, end) {
                  let S = null;
                  let Sx = null;
                  let Sy = null;
                  let Sxy = null;
                  let Sx2 = null;
                  let Sy2 = null;
                  let yStart = Math.round(
                    (start - self.wellModel.topDepth) / self.wellModel.step
                  );
                  let yEnd = Math.round(
                    (end - self.wellModel.topDepth) / self.wellModel.step
                  );
                  let N = yEnd - yStart + 1;
                  for (let i = yStart; i <= yEnd; i++) {
                    if (
                      data1[i] != null &&
                      !isNaN(data1[i]) &&
                      data2[i] != null &&
                      !isNaN(data2[i])
                    ) {
                      S += (data1[i] - data2[i]) * (data1[i] - data2[i]);
                      Sxy += data1[i] * data2[i];
                    }
                    if (data1[i] != null && !isNaN(data1[i])) {
                      Sx += data1[i];
                      Sx2 += Math.pow(data1[i], 2);
                    }
                    if (data2[i] != null && !isNaN(data2[i])) {
                      Sy += data2[i];
                      Sy2 += Math.pow(data2[i], 2);
                    }
                  }
                  return {
                    S: S,
                    Sx: Sx,
                    Sy: Sy,
                    Sxy: Sxy,
                    Sx2: Sx2,
                    Sy2: Sy2,
                    N: N
                  };
                }
                let len = data1.length;
                if (!self.checked) {
                  let param = comparisonParam(self.topDepth, self.bottomDepth);
                  console.log("cpm", param, len);
                  comparison.difference = (param.S / param.N).toFixed(4);
                  comparison.correlation = (
                    (param.N * param.Sxy - param.Sx * param.Sy) /
                    Math.pow(
                      (param.N * param.Sx2 - param.Sx * param.Sx) *
                        (param.N * param.Sy2 - param.Sy * param.Sy),
                      0.5
                    )
                  ).toFixed(4);
                } else {
                  let S = null;
                  let Sx = null;
                  let Sy = null;
                  let Sxy = null;
                  let Sx2 = null;
                  let Sy2 = null;
                  let N = null;
                  let temp = 0;
                  self.zones.forEach(function(z) {
                    if (z.use) {
                      let p = comparisonParam(
                        z.properties.startDepth,
                        z.properties.endDepth
                      );
                      S += p.S;
                      Sx += p.Sx;
                      Sy += p.Sy;
                      Sxy += p.Sxy;
                      Sx2 += p.Sx2;
                      Sy2 += p.Sy2;
                      N += p.N;
                      temp += 1;
                    }
                  });
                  if (temp) {
                    comparison.difference = (S / N).toFixed(4);
                    comparison.correlation = (
                      (N * Sxy - Sx * Sy) /
                      Math.pow((N * Sx2 - Sx * Sx) * (N * Sy2 - Sy * Sy), 0.5)
                    ).toFixed(4);
                  } else {
                    comparison.difference = 0;
                    comparison.correlation = 0;
                  }
                }
                self.applyingInProgress = false;
                callback();
              });
            });
          } else {
            self.applyingInProgress = false;
            callback();
          }
        },
        function(err) {
          console.log(err);
        }
      );
    };
    this.onCancelButtonClicked = function() {
      close(null, 100);
    };
  }

  ModalService.showModal({
    templateUrl: "curve-comparison-modal.html",
    controller: ModalController,
    controllerAs: "wiModal"
  }).then(function(modal) {
    helper.initModal(modal);
    modal.close.then(function(ret) {
      helper.removeBackdrop();
      callback(ret);
    });
  });
};

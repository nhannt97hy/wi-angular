const name = "wiStep";
const moduleName = "wi-step";

function Controller(wiComponentService, wiApiService, $timeout, $scope) {
  let self = this;
  let utils = wiComponentService.getComponent(wiComponentService.UTILS);
  let DialogUtils = wiComponentService.getComponent(
    wiComponentService.DIALOG_UTILS
  );
  let __selectionTop = 0;
  let __selectionLength = 50;
  let __selectionDelta = 10;
  let __familyList = undefined;
  self.filterText = "";
  self.filterText1 = "";
  const CURVE_SELECTION = "1";
  const FAMILY_SELECTION = "2";
  const FAMILY_GROUP_SELECTION = "3";
  self.CURVE_SELECTION = CURVE_SELECTION;
  self.FAMILY_SELECTION = FAMILY_SELECTION;
  self.FAMILY_GROUP_SELECTION = FAMILY_GROUP_SELECTION;

  this.$onInit = function() {
    angular.element(document).ready(function() {
      let dragMan = wiComponentService.getComponent(
        wiComponentService.DRAG_MAN
      );
      let domElement = $(`wi-tabset[name=stepInputs]`);
      $timeout(() => {
        domElement.on("mouseover", function() {
          if (!dragMan.dragging) return;
          dragMan.wiStep = self;
          console.log("overr", dragMan);
        });
        domElement.on("mouseleave", function() {
          dragMan.wiStep = null;
        });
      });
    });
    self.selectionType = "3";
    onSelectionTypeChanged();
  };

  this.onClick = function($index, $event, node) {
    switch (self.selectionType) {
      case CURVE_SELECTION:
        onCurveClick($index, $event, node);
        break;
      case FAMILY_SELECTION:
        onFamilyClick($index, $event, node);
        break;
      case FAMILY_GROUP_SELECTION:
        onFamilyGroupClick($index, $event, node);
        break;
      default:
        break;
    }
  };
  function selectHandler(node) {
    self.selectionList.forEach(function(item) {
      item.data.selected = false;
    });
    node.data.selected = true;
  }
  function onFamilyClick($index, $event, node) {
    selectHandler(node);
  }
  function onFamilyGroupClick($index, $event, node) {
    selectHandler(node);
  }
  function onCurveClick($index, $event, node) {
    selectHandler(node);
  }
  function getFamilyList() {
    if (!self.filterText) {
      if (!__familyList) {
        __familyList = utils.getListFamily().map(function(family) {
          return {
            id: family.idFamily,
            data: {
              label: family.name,
              icon: "user-define-16x16",
              selected: false
            },
            children: [],
            properties: family
          };
        });
      }
      return __familyList;
    } else {
      if (!__familyList) {
        __familyList = utils.getListFamily().map(function(family) {
          return {
            id: family.idFamily,
            data: {
              label: family.name,
              icon: "user-define-16x16",
              selected: false
            },
            children: [],
            properties: family
          };
        });
      }
      let list = __familyList;
      return list.filter(item =>
        item.data.label.toLowerCase().includes(self.filterText.toLowerCase())
      );
    }
  }

  this.template = new Object();
  this.inputs = [];
  this.onSelectionTypeChanged = onSelectionTypeChanged;
  function onSelectionTypeChanged() {
    self.filterText1 = "";
    self.filterText = "";
    switch (self.selectionType) {
      case FAMILY_GROUP_SELECTION:
        let temp = utils.getListFamily();
        let groups = new Set();
        temp.forEach(t => {
          groups.add(t.familyGroup);
        });
        self.selectionList = Array.from(groups).map(g => {
          return {
            id: -1,
            data: {
              label: g,
              icon: "zone-table-16x16",
              selected: false
            },
            children: [],
            properties: {}
          };
        });
        break;
      case FAMILY_SELECTION:
        let tempArray = getFamilyList();
        self.selectionList = tempArray.slice(0, __selectionLength);
        __selectionTop = 0;
        break;
      case CURVE_SELECTION:
        let hash = new Object();
        let root = wiComponentService.getComponent(
          wiComponentService.WI_EXPLORER
        ).treeConfig[0];
        utils.visit(
          root,
          function(node, _hash) {
            if (node.type == "curve") {
              _hash[node.data.label] = 1;
            }
            return false;
          },
          hash
        );
        self.selectionList = Object.keys(hash).map(function(key) {
          return {
            id: -1,
            data: {
              label: key,
              icon: "curve-16x16",
              selected: false
            },
            children: [],
            properties: {}
          };
        });
        break;
      default:
        break;
    }
  }

  this.onSelectTemplate = function(type) {
    if (self.selTemplate) {
      self.template[type] = {
        type: self.filterBy,
        name: self.selTemplate
      };
    } else {
      toastr.error("please select data type!");
    }
  };

  this.addMoreInput = function(option) {
    console.log("Add more");
    function filterCurveByTpl(type, dataset) {
      return dataset.children.filter(d => {
        switch (self.template[type].type) {
          case "group":
            return (
              d.lineProperties &&
              d.lineProperties.familyGroup == self.template[type].name
            );
            break;

          case "family":
            return (
              d.lineProperties &&
              d.lineProperties.name == self.template[type].name
            );
            break;

          case "curve":
            return d.name == self.template[type].name;
            break;
        }
      });
    }
    function addMore(dataset) {
      let existed = self.inputs.find(d => d.idDataset == dataset.id);
      if (!existed) {
        let FRArr = filterCurveByTpl("FR", dataset);
        let PRArr = filterCurveByTpl("PR", dataset);
        if (FRArr.length && PRArr.length) {
          self.inputs.push({
            idDataset: dataset.id,
            dataset: dataset.name,
            well: dataset.parentData.label,
            FRArr: FRArr,
            PRArr: PRArr,
            Fr: FRArr[0],
            Pr: PRArr[0],
            a: 1,
            m: 2,
            n: 2,
            Rw: 0.03
          });
        } else {
          toastr.error("Dataset" + dataset.name + " doesn't match data type!");
        }
      } else {
        toastr.error("Dataset" + dataset.name + " already added!");
      }
    }
    if (self.template.FR && self.template.PR) {
      switch (option.type) {
        case "dataset":
          addMore(option);
          break;

        case "well":
          option.children
            .filter(c => {
              return c.type == "dataset";
            })
            .forEach(c => {
              addMore(c);
            });
          break;
      }
    } else {
      toastr.error("Please select data type!");
    }
  };

  this.onDeleteInput = function(idx) {
    self.inputs.splice(idx, 1);
  };
  this.upTrigger = function(cb) {
    let familyList = getFamilyList();
    if (self.selectionType == FAMILY_SELECTION) {
      if (__selectionTop > 0) {
        if (__selectionTop > __selectionDelta) {
          let newItems = familyList
            .slice(__selectionTop - __selectionDelta, __selectionTop)
            .reverse();
          __selectionTop = __selectionTop - __selectionDelta;
          cb(newItems, self.selectionList);
        } else {
          let newItems = familyList.slice(0, __selectionTop).reverse();
          __selectionTop = 0;
          cb(newItems, self.selectionList);
        }
      } else cb([]);
    } else cb([]);
  };
  this.downTrigger = function(cb) {
    let familyList = getFamilyList();
    if (self.selectionType == FAMILY_SELECTION) {
      let __selectionBottom = __selectionTop + __selectionLength;
      if (__selectionBottom < familyList.length) {
        if (familyList.length - __selectionBottom > __selectionDelta) {
          let newItems = familyList.slice(
            __selectionBottom + 1,
            __selectionDelta + __selectionBottom + 1
          );
          __selectionTop = __selectionTop + __selectionDelta;
          cb(newItems, self.selectionList);
        } else {
          let newItems = familyList.slice(
            __selectionBottom + 1,
            familyList.length
          );
          __selectionTop =
            __selectionTop + (familyList.length - __selectionBottom);
          cb(newItems, self.selectionList);
        }
      } else cb([]);
    } else cb([]);
  };
  this.onFilterEnterKey = function(filterText) {
    self.filterText = filterText;
    if (self.selectionType == FAMILY_SELECTION) {
      __selectionTop = 0;
      $timeout(function() {
        self.selectionList = getFamilyList().slice(0, __selectionLength);
      });
    }
  };
}

let app = angular.module(moduleName, []);

app.component(name, {
  templateUrl: "wi-step.html",
  controller: Controller,
  controllerAs: name,
  transclude: true,
  bindings: {
    inputConfig: "<" // Array of {name, value}
  }
});

exports.name = moduleName;

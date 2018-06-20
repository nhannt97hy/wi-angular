let helper = require('./DialogHelper');

module.exports = function(ModalService, callback, additionalFlows = []) {
  function ModalController($scope, close, wiComponentService, wiApiService) {
    const project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    const self = this;
    this.flows = [];
    this.selectedFlow = null;
    this.getFlowList = function(wiItemDropdownCtrl) {
      wiApiService.getFlowList({ idProject: project.idProject }, function(flows, err) {
        if (err) return;
        self.flows = additionalFlows;
        wiItemDropdownCtrl.items = self.flows.concat(flows).map((flow) => ({
          data: {
            label: flow.name,
          },
          properties: flow,
        }));
      });
    };
    this.flowChanged = function(flow) {
      self.selectedFlow = flow;
    };
    this.deleteFlow = function(flowItem, $event, wiItemDropdownCtrl) {
      $event.stopPropagation();
      $event.preventDefault();
      if (flowItem.properties.new) {
        wiComponentService.emit('flow.deleted', flowItem.properties.idFlow);
      } else {
        wiApiService.removeFlow(flowItem.properties.idFlow, function(resFlow, err) {
          if (err) return;
          wiComponentService.emit('flow.deleted', resFlow.idFlow);
          self.getFlowList(wiItemDropdownCtrl);
        });
      }
    };
    this.newFlow = function() {
      const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
      const now = Date.now();
      layoutManager.putTabRight({
        id: 'flow' + now,
        title: 'New Flow',
        tabIcon: 'workflow-16x16',
        componentState: {
          html: `<wi-flow-designer new="true" id="${now}"></wi-flow-designer>`,
          model: {
            type: 'flow',
            id: now,
          },
        },
      });
      setTimeout(() => {
        const flowCtrl = wiComponentService.getComponent('flow' + now);
        close(flowCtrl.flow);
      }, 100);
    };
    this.close = function (flow) {
      if (!flow) return close();
      if (flow.new) {
        close(flow);
      } else {
        wiApiService.getFlow(flow.idFlow, function (resFlow, err) {
          if (err) close();
          else close(resFlow);
        })
      }
    };
  }

  ModalService.showModal({
    templateUrl: 'open-flow-modal.html',
    controller: ModalController,
    controllerAs: 'wiModal',
  }).then(function(modal) {
    helper.initModal(modal);
    modal.close.then(function(ret) {
      helper.removeBackdrop();
      ret && callback && callback(ret);
    });
  });
};

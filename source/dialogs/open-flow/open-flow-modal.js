let helper = require('./DialogHelper');

module.exports = function(ModalService, callback, additionalFlows = []) {
  function ModalController($scope, close, wiComponentService, wiApiService) {
    const project = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED);
    const self = this;
    this.flows = [];
    this.selectedFlow = null;
    this.getFlowList = function(wiItemDropdownCtrl) {
      wiApiService.getFlowList({ idProject: project.idProject }, function (flows, err) {
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
      wiApiService.removeFlow(flowItem.properties.idFlow, function (resFlow, err) {
        if (err) return;
        wiComponentService.emit('flow.deleted', resFlow.idFlow);
        self.getFlowList(wiItemDropdownCtrl);
      });
    };
    this.close = function (flow) {
      close(flow);
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

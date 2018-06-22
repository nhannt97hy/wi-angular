const name = 'wiFlowDesigner';
const moduleName = 'wi-flow-designer';

const BpmnModeler = require('bpmn-js/lib/Modeler');
const BpmnModelUtil = require('bpmn-js/lib/util/ModelUtil');
const is = BpmnModelUtil.is;
const getBusinessObject = BpmnModelUtil.getBusinessObject;

const initDiagram = `
  <?xml version="1.0" encoding="UTF-8"?>
  <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="diagram" targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn2:process id="Process_1" isExecutable="true">
      <bpmn2:startEvent id="StartEvent_1"/>
      </bpmn2:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
          <dc:Bounds height="36.0" width="36.0" x="200.0" y="350.0"/>
          </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
  </bpmn2:definitions>
`;

const Action = Object.freeze({
  CREATE_TASK: Symbol('create-task'),
  EDIT_TASK: Symbol('edit-task'),
  DELETE_TASK: Symbol('delete-task'),
});

class Pending {
  /**
   *Creates an instance of Pending.
   * @param {Action} action
   * @param {*} payload
   * @param {function} callback
   */
  constructor(action, payload, callback) {
    if (!Object.values(Action).includes(action)) throw Error('action is not valid');
    this.action = action;
    this.payload = payload;
    this.callback = callback;
  }
}

function Controller($scope, $timeout, wiApiService, wiComponentService, ModalService, wiFlowEngine) {
  window.WFD = this;
  const self = this;
  const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
  const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
  const pendings = [];

  this.$onInit = function() {
    wiComponentService.putComponent('flow' + self.id, self);
    $timeout(() => {
      _initModeler();
      self.modeler.importXML(self.flow.content, _importDiagramCb);
      $timeout(() => {
        self.flow.tasks.forEach(task => {
          _updateTaskLabel(task);
        });
      });
    });
    wiComponentService.on('task.changed', _updateTaskLabel);
    wiComponentService.on('flow.deleted', _closeTab);
  };
  this.$onDestroy = function() {
    wiComponentService.removeEvent('task.changed', _updateTaskLabel);
    wiComponentService.removeEvent('flow.deleted', _closeTab);
    wiComponentService.dropComponent('flow' + self.id);
  };
  function _updateTaskLabel(task) {
    if (task.idFlow != self.flow.idFlow) return;
    const serviceTaskElems = getServiceTasks();
    serviceTaskElems.some(sTaskElem => {
      const bo = getBusinessObject(sTaskElem);
      const isMatch = bo.get('idTask') == task.idTask;
      if (!isMatch) return;
      if (bo.get('name') != task.name) self.modeling.updateLabel(sTaskElem, task.name);
      return isMatch;
    })
  }
  function _closeTab(idFlow) {
    if (self.flow.idFlow === idFlow) {
      $scope.$parent.tabComponent.remove();
    }
  }
  function _registerFileDrop(container, callback) {
    function handleDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
    function handleFileDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file.name.includes('.bpmn')) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const xml = e.target.result;
        callback(xml);
      };
      reader.readAsText(file);
    }
    container.get(0).addEventListener('dragover', handleDragOver, false);
    container.get(0).addEventListener('drop', handleFileDrop, false);
  }
  function _importDiagramCb(err) {
    const CONTAINER_ELEMENT = '#flow' + self.id;
    if (err) {
      $(CONTAINER_ELEMENT)
        .removeClass('with-diagram')
        .addClass('with-error');
      $(CONTAINER_ELEMENT)
        .find('.error pre')
        .text(err.message);
      console.error(err);
    } else {
      $(CONTAINER_ELEMENT)
        .removeClass('with-error')
        .addClass('with-diagram');
    }
  }

  function _initModeler() {
    const _modeler = new BpmnModeler({
      container: `#flow${self.id} > #bpmn-modeler`,
      additionalModules: [
        require('./WiPaletteProvider'),
        require('./WiContextPadProvider'),
        require('./WiReplaceMenuProvider'),
      ].concat([
        {
          __init__: ['wiFlowDesigner'],
          wiFlowDesigner: ['value', self],
        },
      ]),
      moddleExtensions: {
        wi: require('./wi-moddle-descriptor'),
      },
    });
    self.modeler = _modeler;
    self.modeling = _modeler.get('modeling');
    self.eventBus = _modeler.get('eventBus');
    self.moddle = _modeler.get('moddle');
    self.canvas = _modeler.get('canvas');
    self.elementRegistry = _modeler.get('elementRegistry');

    const CONTAINER_ELEMENT = '#flow' + self.id;
    _registerFileDrop($(CONTAINER_ELEMENT), (xml) => {
      _modeler.importXML(xml, _importDiagramCb);
    });
    self.eventBus.on('element.dblclick', 1500, function(event, { element }) {
      if (isServiceTask(element)) {
        const idTask = getBusinessObject(element).get('idTask');
        !!idTask && self.openTask(idTask, element);
      }
      event.stopPropagation();
    });
    _modeler.on(
      'element.changed',
      _.debounce(function(event, { element }) {
        self.modeler.saveXML({ format: true }, function(err, xml) {
          $timeout(() => (self.flow.content = xml));
        });
      }, 500)
    );
    _modeler.on(
      'element.changed',
      _.debounce(function(event, { element }) {
        if (!self.new) self.saveFlow();
      }, 2000)
    );
    _modeler.on('selection.changed', function(event, { newSelection }) {
      const selectedElement = newSelection[0] || self.canvas.getRootElement();
      console.log(selectedElement);
    });
  }

  function isServiceTask(element) {
    return is(element, 'bpmn:ServiceTask');
  }
  function getServiceTasks() {
    return self.elementRegistry.filter(e => isServiceTask(e));
  }
  function updateProp(element, props) {
    self.modeling.updateProperties(element, props);
  }
  function removeElements(elements) {
    if (!Array.isArray(elements)) elements = [elements];
    self.modeling.removeElements(elements);
  }

  function _executePending(callback) {
    async.each(
      pendings,
      function(pending, next) {
        if (typeof pending.payload === 'function') pending.payload = pending.payload();
        function apiCb(res, err) {
          pending.callback && pending.callback(res, err);
          next(err, res);
        }
        switch (pending.action) {
          case Action.CREATE_TASK:
            wiApiService.createTask(pending.payload, apiCb);
            break;
          case Action.EDIT_TASK:
            wiApiService.editTask(pending.payload, apiCb);
            break;
          case Action.DELETE_TASK:
            wiApiService.removeTask(pending.payload, apiCb);
            break;
          default:
            next('pending action is not valid');
        }
      },
      function(err) {
        if (err) return console.error(err);
        pendings.length = 0;
        setTimeout(callback);
      }
    );
  }
  // public
  this.createTask = function ({ taskConfig, name }) {
    taskConfig.expression = taskConfig.function;
    const create = self.modeler.get('create');
    const elementFactory = self.modeler.get('elementFactory');
    const shape = elementFactory.createShape(Object.assign({ type: 'bpmn:ServiceTask' }));
    const bo = getBusinessObject(shape);
    bo.set('name', name);
    bo.set('expression', 'execute');
    create.start(new MouseEvent('click'), shape);
    const eventBus = self.modeler.get('eventBus');
    eventBus.once('create.end', function(event) {
      const shape = event.context.shape;
      console.log('created', shape);
      pendings.push(
        new Pending(
          Action.CREATE_TASK,
          { idFlow: self.flow.idFlow, idTaskSpec: 1, content: taskConfig, name },
          function(res, err) {
            if (err) return;
            updateProp(shape, { idTask: res.idTask });
          }
        )
      );
    });
  };
  this.openTask = function(idTask, element) {
    if (!idTask) return;
    wiApiService.getTask(idTask, function(task, err) {
      if (err) return;
      const bo = getBusinessObject(element);
      layoutManager.putTabRight({
        id: 'wiTask' + idTask,
        title: task.name,
        tabIcon: 'workflow-16x16',
        componentState: {
          html: `<wi-task name="${task.name}" id="${idTask}" task-config="task.content"></wi-task>`,
          name: 'wiTask' + idTask,
          task: task,
        },
      });
    });
  };
  this.deleteTask = function(idTask, element) {
    pendings.push(new Pending(Action.DELETE_TASK, idTask));
  };

  // buttons
  this.saveFlow = function(notice) {
    _executePending(function() {
      wiApiService.editFlow(
        Object.assign({}, self.flow, {tasks: null}),
        () => {
          !!notice && toastr.success(`Flow ${self.flow.name} saved`, null, { timeOut: 1000, progressBar: false });
        },
        { silent: true }
      );
    });
  };
  this.clearDiagram = function () {
    DialogUtils.confirmDialog(ModalService, 'Clear Diagram', 'Are you sure to clear diagram?', function (yes) {
      if (!yes) return;
      this.modeler && this.modeler.importXML(initDiagram, _importDiagramCb);
      self.flow.content = initDiagram;
    })
  };
  this.downloadDiagram = function () {
    const a = document.createElement('a');
    const encodedData = encodeURIComponent(self.flow.content);
    a.download = self.flow.name + '.bpmn';
    a.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  }
  this.execute = async function() {
    try {
      const xml = await new Promise((resolve, reject) => {
        self.modeler.saveXML(function(err, xml) {
          if (err) return reject(err);
          resolve(xml);
        });
      });
      const outputObj = await wiFlowEngine.execute({ diagram: xml });
      console.log(outputObj);
    } catch (error) {
      console.error(error);
    }
  };
}

const app = angular.module(moduleName, []);

app.component(name, {
  templateUrl: 'wi-flow-designer.html',
  controller: Controller,
  controllerAs: name,
  bindings: {
    id: '@',
    flow: '<',
  },
});

exports.name = moduleName;

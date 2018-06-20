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

function Controller($timeout, wiApiService, wiComponentService, ModalService, wiFlowEngine) {
  window.WFD = this;
  const self = this;
  const layoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
  const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
  const pendings = [];

  this.$onInit = function() {
    self.flow = self.flow || {
      name: 'New Flow',
      content: initDiagram,
    };
    wiComponentService.putComponent('flow' + self.id, self);
    $timeout(() => {
      if (!self.new) {
        _initModeler();
        self.modeler.importXML(self.flow.content, importDiagramCb);
      } else {
        self.flow.idFlow = self.id;
        _initModeler();
        self.modeler.importXML(initDiagram, importDiagramCb);
      }
    });
    wiComponentService.on('flow.deleted', _onFlowDeleted);
  };
  this.$onDestroy = function() {
    wiComponentService.removeEvent('flow.deleted', _onFlowDeleted);
    wiComponentService.dropComponent('flow' + self.id);
  };
  function _onFlowDeleted(idFlow) {
    if (self.flow.idFlow === idFlow) {
      layoutManager.getItemById('flow' + idFlow).remove();
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

  function importDiagramCb(err) {
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

  function _setEncoded(button, fileName, data) {
    const encodedData = encodeURIComponent(data);
    if (data) {
      button.removeClass('disabled').attr({
        href: 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        download: fileName,
      });
    } else {
      button.addClass('disabled');
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
    window.modeler = self.modeler;
    window.moddle = self.moddle;

    const CONTAINER_ELEMENT = '#flow' + self.id;
    _registerFileDrop($(CONTAINER_ELEMENT), (xml) => {
      _modeler.importXML(xml, importDiagramCb);
    });
    self.eventBus.on('element.dblclick', 1500, function(event, { element }) {
      if (is(element, 'bpmn:ServiceTask')) {
        const idTask = getBusinessObject(element).get('idTask');
        !!idTask && self.openTask(idTask, element);
      }
      event.stopPropagation();
    });
    _modeler.on(
      'element.changed',
      _.debounce(function(event, { element }) {
        self.modeler.saveXML({ format: true }, function(err, xml) {
          // _setEncoded($(DOWNLOAD_DIAGRAM), 'diagram.bpmn', err ? null : xml);
          console.warn(xml);
          $timeout(() => (self.flow.content = xml));
        });
      }, 100)
    );
    _modeler.on(
      'element.changed',
      _.debounce(function(event, { element }) {
        if (!self.new) self.saveFlow();
      }, 3000)
    );
    _modeler.on('selection.changed', function(event, { newSelection }) {
      const selectedElement = newSelection[0] || self.canvas.getRootElement();
      console.log(selectedElement);
    });
  }

  function updateProp(element, props) {
    self.modeling.updateProperties(element, props);
    self.eventBus.fire('element.changed', { element });
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
  this.createTask = function(taskConfig) {
    taskConfig.expression = taskConfig.function;
    const create = self.modeler.get('create');
    const elementFactory = self.modeler.get('elementFactory');
    const shape = elementFactory.createShape(Object.assign({ type: 'bpmn:ServiceTask' }));
    const bo = getBusinessObject(shape);
    bo.set('name', 'Untitled Task');
    create.start(new MouseEvent('click'), shape);
    const eventBus = self.modeler.get('eventBus');
    eventBus.once('create.end', function(event) {
      const shape = event.context.shape;
      console.log('created', shape);
      pendings.push(
        new Pending(
          Action.CREATE_TASK,
          () => ({ idFlow: self.flow.idFlow, idTaskSpec: 1, content: taskConfig }),
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
      const name = `${bo.name || ''}(VCL-GR)`;
      layoutManager.putTabRight({
        id: 'wiTask' + idTask,
        title: name,
        tabIcon: 'workflow-16x16',
        componentState: {
          html: `<wi-task name="${name}" id="${idTask}" task-config="task"></wi-task>`,
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
    if (self.new) {
      DialogUtils.promptDialog(
        ModalService,
        {
          title: 'Save Flow',
          inputName: 'Flow Name',
          input: 'New Flow',
        },
        function(flowName) {
          if (!flowName) return;
          self.flow.name = flowName;
          self.flow.idProject = wiComponentService.getComponent(wiComponentService.PROJECT_LOADED).idProject;
          wiApiService.createFlow(Object.assign({}, self.flow, { idFlow: null }), function(resFlow, err) {
            if (err) {
              self.saveFlow();
              return;
            }
            const tabElement = layoutManager.getItemById('flow' + self.flow.idFlow);
            tabElement.addId('flow' + resFlow.idFlow);
            tabElement.setTitle(tabElement.config.title.replace('New Flow', resFlow.name));
            wiComponentService.dropComponent('flow' + self.id);
            wiComponentService.putComponent('flow' + resFlow.idFlow, self);
            self.id = resFlow.idFlow;
            self.flow = resFlow;
            self.new = false;
            _executePending(function() {
              setTimeout(() => {
                wiApiService.editFlow(self.flow, function(resFlow, err) {
                  if (err) return;
                  toastr.success(`Flow ${self.flow.name} saved`, null, { timeOut: 1000, progressBar: false });
                });
              }, 100);
            });
          });
        }
      );
    } else {
      _executePending(function() {
        wiApiService.editFlow(
          self.flow,
          () => {
            !!notice && toastr.success(`Flow ${self.flow.name} saved`, null, { timeOut: 1000, progressBar: false });
          },
          { silent: true }
        );
      });
    }
  };
  this.clearDiagram = function () {
    DialogUtils.confirmDialog(ModalService, 'Clear Diagram', 'Are you sure to clear diagram?', function (yes) {
      if (!yes) return;
      this.modeler && this.modeler.importXML(initDiagram, importDiagramCb);
      self.flow.content = initDiagram;
    })
  };
  this.execute = async function() {
    try {
      const xml = await new Promise((resolve, reject) => {
        self.modeler.saveXML({ format: true }, function(err, xml) {
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
    new: '<',
    flow: '<',
  },
});

exports.name = moduleName;

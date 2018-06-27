'use strict';
const inherits = require('inherits');
const BpmnContextPadProvider = require('bpmn-js/lib/features/context-pad/ContextPadProvider');
const BpmnModelUtil = require('bpmn-js/lib/util/ModelUtil');
const is = BpmnModelUtil.is;
const getBusinessObject = BpmnModelUtil.getBusinessObject;

function WiContextPadProvider(injector, wiFlowDesigner, modeling) {
  injector.invoke(BpmnContextPadProvider, this);
  const bpmnGetContextPadEntries = this.getContextPadEntries.bind(this);
  this.getContextPadEntries = function(element) {
    const create = this._create;
    const autoPlace = this._autoPlace;
    const elementFactory = this._elementFactory;
    /**
     * Create an append action
     *
     * @param {String} type
     * @param {String} className
     * @param {String} [title]
     * @param {Object} [options]
     *
     * @return {Object} descriptor
     */
    function appendAction(type, className, title, options) {
      if (typeof title !== 'string') {
        options = title;
        title = `Append ${type.replace(/^bpmn:/, '')}`;
      }
      function appendStart(event, element) {
        const shape = elementFactory.createShape(Object.assign({ type: type }, options));
        create.start(event, shape, element);
      }
      const append = autoPlace
        ? function(event, element) {
            var shape = elementFactory.createShape(Object.assign({ type: type }, options));
            autoPlace.append(element, shape);
          }
        : appendStart;
      return {
        group: 'model',
        className: className,
        title: title,
        action: {
          dragstart: appendStart,
          click: append,
        },
      };
    }

    const actions = bpmnGetContextPadEntries(element);
    ['append.intermediate-event', 'append.append-task', 'append.text-annotation', 'replace', 'append.gateway'].forEach((action) => {
      delete actions[action];
    });
    if (is(element, 'bpmn:FlowNode')) {
      // flownode
      if (is(element, 'bpmn:EndEvent')) {
        delete actions['connect'];
      } else {
        // !endevent
        actions['append.append-service-task'] = appendAction('bpmn:ServiceTask', 'bpmn-icon-service-task');
        const idTask = getBusinessObject(element).get('idTask');
        if (idTask) {
          actions['edit-task'] = {
            group: 'edit',
            className: 'bpmn-icon-service',
            title: 'Edit Task',
            action: {
              click: function(event, element) {
                wiFlowDesigner.openTask(idTask, element);
              },
            },
          };
          // actions['delete'] = Object.assign(actions['delete'], {
          //   action: {
          //     click: function (event, element) {
          //       modeling.removeElements([element]);
          //       wiFlowDesigner.deleteTask(idTask, element);
          //     },
          //   },
          // })
        }
      }
    }
    const actionsOrder = ['append.append-service-task', 'edit-task'];
    const sortedObj = actionsOrder.reduce((obj, key) => {
      if (actions[key]) obj[key] = actions[key];
      return obj;
    }, {});
    return Object.assign(sortedObj, actions);
  };
}

inherits(WiContextPadProvider, BpmnContextPadProvider);

module.exports = {
  contextPadProvider: ['type', WiContextPadProvider],
};

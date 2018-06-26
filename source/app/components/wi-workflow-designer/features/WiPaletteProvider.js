'use strict';
const inherits = require('inherits');
const BpmnPaletteProvider = require('bpmn-js/lib/features/palette/PaletteProvider');

function WiPaletteProvider(injector) {
  injector.invoke(BpmnPaletteProvider, this);
  const elementFactory = this._elementFactory;
  const create = this._create;

  function createAction(type, group, className, title, options) {
    function createListener(event) {
      const shape = elementFactory.createShape(Object.assign({ type: type }, options));
      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }
      create.start(event, shape);
    }
    const shortType = type.replace(/^bpmn:/, '');
    return {
      group: group,
      className: className,
      title: title || `Create ${shortType}`,
      action: {
        dragstart: createListener,
        click: createListener,
      },
    };
  }

  const bpmnGetPaletteEntries = this.getPaletteEntries.bind(this);
  const actionsToKeep = [
    'hand-tool',
    'lasso-tool',
    'space-tool',
    'global-connect-tool',
    'tool-separator',
    'create.start-event',
    'create.end-event',
    // 'create.exclusive-gateway',
    'append.text-annotation',
  ];
  this.getPaletteEntries = function(element) {
    const actions = bpmnGetPaletteEntries(element);
    for (const key of Object.keys(actions)) {
      if (!actionsToKeep.includes(key)) delete actions[key];
    }
    actions['create.serviceTask'] = createAction(
      'bpmn:ServiceTask',
      'activity',
      'bpmn-icon-service-task',
      'Create Service Task',
    );
    return actions;
  };
}

inherits(WiPaletteProvider, BpmnPaletteProvider);

module.exports = {
  paletteProvider: ['type', WiPaletteProvider],
};

'use strict';
const inherits = require('inherits');
const BpmnReplaceMenuProvider = require('bpmn-js/lib/features/popup-menu/ReplaceMenuProvider');

const is = require('bpmn-js/lib/util/ModelUtil').is;
const isExpanded = require('bpmn-js/lib/util/DiUtil').isExpanded;
// const isDifferentType = require('bpmn-js/lib/features/popup-menu/util/TypeUtil').isDifferentType;

WiReplaceMenuProvider.$inject = ['injector'];

const replaceOptions = {
  TASK: ['Service Task', 'Sub Process (expanded)'],
  SUBPROCESS_COLLAPSED: ['Service Task', 'Sub Process (expanded)'],
  SUBPROCESS_EXPANDED: ['Sub Process (collapsed)'],
};
const wiEntriesFor = elementType => entry => replaceOptions[elementType].includes(entry.label);
function WiReplaceMenuProvider(injector) {
  injector.invoke(BpmnReplaceMenuProvider, this);
  const bpmnGetEntries = this.getEntries.bind(this);
  this.getEntries = function(element) {
    let entries = bpmnGetEntries(element);
    // const differentType = isDifferentType(element);
    // sub processes
    if (is(element, 'bpmn:SubProcess')) {
      // expanded
      if (isExpanded(element)) return entries.filter(wiEntriesFor('SUBPROCESS_EXPANDED'));
      else if (!element.children.length)
        // collapsed with no child
        return entries.filter(wiEntriesFor('SUBPROCESS_COLLAPSED'));
    }
    // task
    if (is(element, 'bpmn:FlowNode')) {
      return entries.filter(wiEntriesFor('TASK'));
    }
    return [];
  };
  // header entries
  const bpmnGetHeaderEntries = this.getHeaderEntries.bind(this);
  this.getHeaderEntries = function(element) {
    let headerEntries = bpmnGetHeaderEntries(element);
    if (is(element, 'bpmn:SubProcess')) {
      headerEntries = headerEntries.filter(h => h.title !== 'Ad-hoc');
    }
    return headerEntries;
  };
}

inherits(WiReplaceMenuProvider, BpmnReplaceMenuProvider);

module.exports = {
  replaceMenuProvider: ['type', WiReplaceMenuProvider],
};

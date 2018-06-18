window.setImmediate = async.setImmediate;
const BpmnEngine = require('./bpmn-engine');
const petrophysics = require('./petrophysics');
const fns = petrophysics;

const transformFn = (fn, data = {}) => {
  return (element, context, next) => {
    const moddleElement = element.activity;
    const idTask = moddleElement.get('idTask');
    if (!idTask) return;
    // const inputModdles = moddleElement.get('inputs') || [];
    // const args = fnObj.inputs.map((requiredInput) => {
    //   const inputModdle = inputModdles.find((i) => i.name === requiredInput.name) || {};
    //   const inputName = inputModdle.get('name');
    //   let arg = inputModdle.get('value');
    //   if (requiredInput.type === 'curve') {
    //     const elementData = data[element.id] || {};
    //     arg = elementData[inputName];
    //   }
    //   if (inputModdle.get('type') === 'result') {
    //     const taskId = inputModdle.get('value');
    //     const taskResults = _.get(context, `variables.taskInput.${taskId}`, []);
    //     arg = taskResults[0];
    //   }
    //   if (requiredInput.type === 'number') arg = +arg;
    //   return arg;
    // });
    try {
      fn([], [], (results) => next(null, ...results));
    } catch (error) {
      console.error(error.stack);
      next();
    }
  };
};

const getFunctions = (fns, data) => {
  const transformedFns = {};
  const fnNames = Object.keys(fns);
  fnNames.forEach((key) => {
    transformedFns[key] = transformFn(fns[key], data);
  });
  return transformedFns;
};


async function execute({ diagram, data }) {
  const engine = new BpmnEngine.Engine({
    source: diagram,
    moddleOptions: {
      wi: require('./wi-moddle-descriptor'),
    },
  });
  // const listener = new EventEmitter();
  return new Promise((resolve, reject) => {
    engine.execute(
      {
        // listener: listener,
        services: getFunctions(fns, data),
      },
      (err, definition) => {
        if (err) {
          reject(err);
        }
        definition.once('end', () => {
          resolve(definition.variables.taskInput);
        });
      }
    );
  });
}

const moduleName = 'wi-flow-engine';
angular.module(moduleName, []).factory('wiFlowEngine', function () {
  return {
    execute,
    fns
  }
})

module.exports.name = moduleName;

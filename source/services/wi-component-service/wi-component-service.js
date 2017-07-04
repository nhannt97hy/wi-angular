const wiServiceName = 'wiComponentService';
const moduleName = 'wi-component-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    let __Controllers = {};
    let handlers = {};

    return {
        treeFunctions: {},

        getComponent: function (componentName) {
            return __Controllers[componentName];
        },
        getD3Area: function(wiLogplotName) {
            return __Controllers[wiLogplotName + 'D3Area'];
        },
        getSlidingBar: function(wiLogplotName) {
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        getSlidingBarForD3Area: function(wiD3AreaName) {
            var wiLogplotName = wiD3AreaName.replace('D3Area', '');
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        putComponent: function (componentName, controller) {
            console.log('put component');
            console.log('componentName', componentName)

            __Controllers[componentName] = controller;
        },

        on: function (eventName, handlerCb) {
            let eventHandlers = handlers[eventName];
            if (!Array.isArray(eventHandlers)) {
                handlers[eventName] = [];
            }

            handlers[eventName].push(handlerCb);
        },
        emit: function (eventName, data) {
            let eventHandlers = handlers[eventName];
            if (Array.isArray(eventHandlers)) {
                eventHandlers.forEach(function (handler) {
                    handler(data);
                })
            }
        }
    };
});

exports.name = moduleName;

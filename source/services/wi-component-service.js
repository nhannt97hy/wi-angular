const wiServiceName = 'wiComponentService';
const moduleName = 'wi-component-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    let __Controllers = {};
    let handlers = {};
    let _state = {};

    return {
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
            let wiLogplotName = wiD3AreaName.replace('D3Area', '');
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        putComponent: function (componentName, controller) {
            // console.log('put component');
            // console.log('componentName', componentName);

            __Controllers[componentName] = controller;
        },

        setState: function (stateName, state) {
            _state[stateName] = state;
        },
        getState: function (stateName) {
            return _state[stateName];
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
        },

        // state name
        ITEM_ACTIVE_STATE: 'item-active-state'
    };
});

exports.name = moduleName;


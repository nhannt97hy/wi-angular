const wiServiceName = 'wiComponentService';
const moduleName = 'wi-component-service';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    let __Controllers = {};
    let handlers = {};
    let _state = {};
    window.__CPNTS = __Controllers;
    window.__HANDLERS = handlers;
    function EventHandler(handler, once = false) {
        this.handler = handler;
        this.once = once;
    }
    return {
        getComponent: function (componentName) {
            return __Controllers[componentName];
        },
        filterComponents: function (filter) {
            const components = [];
            for (const key in __Controllers) {
                const component = __Controllers[key];
                if (!component) {
                    delete __Controllers[key];
                    continue;
                }
                if (filter(component, key)) components.push(component);
            }
            return components;
        },
        getD3Area: function (wiLogplotName) {
            return __Controllers[wiLogplotName + 'D3Area'];
        },
        getSlidingBar: function (wiLogplotName) {
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        getSlidingBarForD3Area: function (wiD3AreaName) {
            let wiLogplotName = wiD3AreaName.replace('D3Area', '');
            return __Controllers[wiLogplotName + 'Slidingbar'];
        },
        getD3AreaForSlidingBar: function (wiSlidingbarName) {
            let wiLogplotName = wiSlidingbarName.replace('Slidingbar', '');
            return __Controllers[wiLogplotName + 'D3Area'];
        },
        putComponent: function (componentName, controller) {
            if (componentName) __Controllers[componentName] = controller;
        },
        dropComponent: function (componentName) {
            delete __Controllers[componentName];
        },

        setState: function (stateName, state) {
            _state[stateName] = state;
        },
        getState: function (stateName) {
            return _state[stateName];
        },

        on: function (eventName, handlerCb) {
            if (!Array.isArray(handlers[eventName])) {
                handlers[eventName] = [];
            }
            handlers[eventName].push(new EventHandler(handlerCb));
        },
        once: function (eventName, handlerCb) {
            if (!Array.isArray(handlers[eventName])) {
                handlers[eventName] = [];
            }
            handlers[eventName].push(new EventHandler(handlerCb, true));
        },
        emit: function (eventName, data) {
            let eventHandlers = handlers[eventName];
            if (Array.isArray(eventHandlers)) {
                const onces = [];
                eventHandlers.forEach(function (eventHandler) {
                    eventHandler.once && onces.push(eventHandler);
                    eventHandler.handler(data);
                });
                if (onces.length) handlers[eventName] = eventHandlers.filter((eventHandler => !onces.includes(eventHandler)));
            }
        },
        // remove 1 handler or all handlers
        removeEvent: function (eventName, handler) {
            const eventHandlers = handlers[eventName];
            if (typeof handler != 'function') delete handlers[eventName];
            else if (Array.isArray(eventHandlers)) {
                for (let i = 0; i < eventHandlers.length; i++) {
                    if (handler == eventHandlers[i].handler) eventHandlers.splice(i, 1);
                }
            }
        },

        // component
        LOGPLOT_HANDLERS: 'LOGPLOT_HANDLERS',
        HISTOGRAM_HANDLERS: 'HISTOGRAM_HANDLERS',
        // TREE_FUNCTIONS: 'tree-functions',
        GLOBAL_HANDLERS: 'GLOBAL_HANDLERS',
        WI_EXPLORER_HANDLERS: 'wi-explorer-handlers',
        WI_EXPLORER: 'WiExplorer',
        GRAPH: 'GRAPH',
        DRAG_MAN: 'DRAG_MAN',
        DIALOG_UTILS: 'DIALOG_UTILS',
        LAYOUT_MANAGER: 'LAYOUT_MANAGER',
        UTILS: 'UTILS',
        COPYING_CURVE: 'copying-curve',
        CUTTING_CURVE: 'cutting-curve',
        CROSSPLOT_HANDLERS: 'CROSSPLOT_HANDLERS',
        HISTORYSTATE: 'HISTORY_STATE',
        TASKSPEC: "TASKSPEC",

        COMBOVIEW_HANDLERS: 'COMBOVIEW_HANDLERS',
        PROJECT_LOADED: 'project-loaded',
        ITEM_ACTIVE_PAYLOAD: 'item-active-payload',
        LIST_FAMILY: 'list-family',
        SELECTED_NODES: 'selected-nodes',

        // PROJECT_LOGPLOTS: 'project-logplots',
        // PROJECT_CROSSPLOTS: 'project-crossplots',
        // PROJECT_HISTOGRAMS: 'project-histograms',

        // state name
        ITEM_ACTIVE_STATE: 'item-active-state',

        // event
        ADD_LOGPLOT_EVENT: 'add-logplot-event',
        PROJECT_LOADED_EVENT: 'project-loaded-event',
        PROJECT_UNLOADED_EVENT: 'project-unloaded-event',
        PROJECT_REFRESH_EVENT: 'project-refresh-event',
        DUSTBIN_REFRESH_EVENT: 'dustbin-refresh-event',
        PALETTES: 'PALETTES',
        LOGPLOT_LOADED_EVENT: 'logplot-loaded-event',
        UPDATE_ITEMS_EVENT: 'UPDATE_ITEMS_EVENT',
        RENAME_MODEL: 'rename-model',
        DELETE_MODEL: 'delete-model',
        MODIFIED_CURVE_DATA: 'modified-curve-data',
        PATTERN: 'PATTERN',
        LIST_CONFIG_PROPERTIES: 'LIST_CONFIG_PROPERTIES'
    };
});

exports.name = moduleName;

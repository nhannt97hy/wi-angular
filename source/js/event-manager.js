module.exports = EventManager;

function EventManager() {
    this.handlers = {};
}

EventManager.prototype.on = function(eventName, handlerCb) {
    if (!Array.isArray(this.handlers[eventName])) {
        this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handlerCb);
}

EventManager.prototype.emit = function(eventName, data) {
    let eventHandlers = this.handlers[eventName];
    if (Array.isArray(eventHandlers)) {
        eventHandlers.forEach(function (handler) {
            handler(data);
        })
    }
}
EventManager.prototype.removeHandler = function(eventName, handler) {
    const eventHandlers = this.handlers[eventName];
    if (typeof handler != 'function') delete this.handlers[eventName];
    else if (Array.isArray(eventHandlers)) {
        for (let i = eventHandlers.length - 1; i >=0; i--) {
            if (handler == eventHandlers[i]) eventHandlers.splice(i, 1);
        }
    }
}

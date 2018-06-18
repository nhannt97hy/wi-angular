'use strict';

const BaseTask = require('../activities/BaseTask');

function Task() {
  BaseTask.apply(this, arguments);
}

Task.prototype = Object.create(BaseTask.prototype);

Task.prototype.execute = function(message) {
  this.emit('start', this);
  this.complete(message);
};

module.exports = Task;

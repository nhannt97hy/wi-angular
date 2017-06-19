const componentName = 'wiLogplot';
const moduleName = 'wi-logplot';

wiButton = require('./wi-button.js');
wiToolbar = require('./wi-toolbar.js');
wiSlidingbar = require('./wi-slidingbar.js');

function Controller(wiSlidingbar) {
    var self = this;
    this.wiSlidingbar = wiSlidingbar;
}

var app = angular.module(moduleName, [wiButton.name, wiToolbar.name, wiSlidingbar.name]);
app.component(componentName, {
    templateUrl: 'wi-logplot.html',
    controller: Controller,
    controllerAs: componentName,
    transclude: true
});

exports.name = moduleName;

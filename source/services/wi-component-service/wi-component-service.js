const wiServiceName = 'wiComponentService';
const moduleName = 'wi-component-service';

var app = angular.module(moduleName, []);
app.factory(wiServiceName, function() {
    var __Controllers = new Object();
    return { 
        getComponent: function(componentName){
            console.log("Do you want " + componentName + "'s controller?");
            return __Controllers[componentName];
        },
        putComponent: function(componentName, controller) {
            console.log("put component:" + componentName + " - ", controller); 
            __Controllers[componentName] = controller;
        }
    };
});

exports.name = moduleName;

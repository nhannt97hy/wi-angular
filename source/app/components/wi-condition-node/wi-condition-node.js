const name = 'wiConditionNode';
const moduleName = 'wi-condition-node';

function Controller(wiComponentService) {
    let self = this;

    this.comparisons = ['<', '>', '=', '<=', '>='];
    this.operators = ['and', 'or'];

    this.update = function () {
        wiComponentService.emit('discriminator-update');
    }

    this.isNull = function(){
        return !self.item || Object.keys(self.item).length == 0;
    }
    function clearSelectedItem(node) {
        if (!node) return;
        node.selected = false;
        if (node.children && node.children.length ) {
            for (let childNode of node.children) {
                clearSelectedItem(childNode);
            }
        }

    }
    this.doSelect = function($event) {
        $event.stopPropagation();
        clearSelectedItem(self.root);
        if (self.item) 
            self.item.selected = true;
    }
}

let app = angular.module(moduleName, []);

app.component(name, {
    templateUrl: 'wi-condition-node.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        item: '<',
        curveOptions: '<',
        onDelete: '<',
        root: '<'
    }
});

exports.name = moduleName;

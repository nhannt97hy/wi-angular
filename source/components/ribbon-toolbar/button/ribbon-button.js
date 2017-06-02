var name = 'ribbonButton';

function Controller() {
    var self = this;
    this.imgUrl = 'img/ic_folder.png';
    this.label = 'item name';

    this.$onInit = function() {
        console.log(self.data);
    };

    this.onClick = function () {
        console.log('click');
    }
}

app.component(name, {
    templateUrl: 'ribbon-button.html',
    controller: Controller,
    controllerAs: name,
    bindings: {
        data: '<'
    }
});

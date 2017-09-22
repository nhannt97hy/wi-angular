const wiUserName = 'wiUser';
const moduleName = 'wi-user';

function UserController(wiComponentService){
    let self = this;
    this.username = 'guest';
    this.imgUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSltja4_xSMl15fBqZg_rcCH87_XgDcygy3w06dmb7d8ef1tGyKzqRX3Q3K';
    this.$onInit = function(){
        if (self.name) wiComponentService.putComponent(self.name, self);
        self.username = window.localStorage.getItem('username');
        // self.imgUrl = window.localStorage.getItem('imgUrl');        
    }

    this.userUpdate = function(){
        self.username = window.localStorage.getItem('username');
        // self.imgUrl = window.localStorage.getItem('imgUrl');
    }
}


let app = angular.module(moduleName, []);

app.component(wiUserName, {
    templateUrl: 'wi-user.html',
    controller: UserController,
    controllerAs: wiUserName,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;


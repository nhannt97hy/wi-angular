/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../components/chat-group/chat-group.html":
/*!************************************************!*\
  !*** ../components/chat-group/chat-group.html ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div style=\"height:{{chatGroup.listMessageHeight}}px\" class=\"list-message\" ngf-drop=\"chatGroup.upload($files)\" class=\"drop-box\"\r\n    ngf-drag-over-class=\"'dragover'\" ngf-multiple=\"true\">\r\n    <div class=\"row\" ng-repeat=\"message in chatGroup.conver.Messages track by $index\">\r\n        <div ng-if=\"message.User.username!=chatGroup.user.username\" class=\"row\" style=\"color: gray; text-align: center\">---{{message.sendAt}}---</div>\r\n        <div ng-if=\"message.User.username!=chatGroup.user.username\" style=\"width: 70%; float: left;margin-bottom: 2px\">\r\n            <p ng-if=\"chatGroup.conver.name.indexOf('Help_Desk')==-1\" style=\"font-weight: bold; margin-top: 3px; margin-bottom: 3px\">{{message.User.username}}</p>\r\n            <p ng-if=\"chatGroup.conver.name.indexOf('Help_Desk')!=-1\" style=\"font-weight: bold; margin-top: 3px; margin-bottom: 3px\">Admin</p>\r\n            <div ng-if=\"message.type!='image'\" style=\"background: #e6e6e6; border-radius: 10px; display: inline-block; padding: 6px 8px ;max-width: 100%\">\r\n                <p class=\"message\" ng-bind-html=\"message.content\" style=\" display: inline;\" ng-if=\"message.type=='text'\">\r\n                </p>\r\n                <p class=\"message\" style=\" display: inline;\" ng-if=\"message.type=='file'\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <i class=\"glyphicon glyphicon-circle-arrow-down\"></i>\r\n                        {{chatGroup.fileName(message.content)}}\r\n                    </a>\r\n                </p>\r\n            </div>\r\n            <div ng-if=\"message.type=='image'\" style=\" display: inline-block;max-width: 100%\">\r\n                <p class=\"message\" style=\" display: inline;\" >\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <img src=\"{{chatGroup.thumb(message.content)}}\" style=\"max-width: 70%; max-height: 40%;;border: 1px solid #ddd;border-radius: 4px;\">\r\n                    </a>\r\n                </p>\r\n            </div>\r\n        </div>\r\n        <div ng-if=\"message.User.username==chatGroup.user.username\" style=\"width: 70%; float: right;margin-bottom: 2px\">\r\n            <div ng-if=\"message.type!='image'\" style=\"background: {{chatGroup.color}}; border-radius: 10px; float: right; display: inline-block;padding: 6px 8px;max-width: 100%\">\r\n                <p class=\"message\" ng-bind-html=\"message.content\" style=\"color: #fff;display: inline; \" ng-if=\"message.type=='text'\">\r\n                </p>\r\n                <p class=\"message\" style=\" display: inline;\" ng-if=\"message.type=='file'\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\" style=\"color: #fff\">\r\n                        <i class=\"glyphicon glyphicon-circle-arrow-down\"></i>\r\n                        {{chatGroup.fileName(message.content)}}\r\n                    </a>\r\n                </p>\r\n            </div>\r\n            <div ng-if=\"message.type=='image'\" style=\" text-align: right; float: right; display: inline-block;padding: 6px 8px;max-width: 100%\">\r\n                <p class=\"message\" style=\" display: inline;\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <img src=\"{{chatGroup.thumb(message.content)}}\" style=\"max-width: 70%; max-height: 40%;border: 1px solid #ddd;border-radius: 4px;\">\r\n                    </a>\r\n                </p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div style=\"position:relative;\">\r\n    <textarea class=\"text-message\" rows=\"2\"></textarea>\r\n    <div style=\"position: absolute;bottom: 5px;right: 5px;\">\r\n        <span class=\"glyphicon glyphicon-picture cursor-pointer\" ngf-select=\"chatGroup.upload($files)\" multiple=\"multiple\" ngf-accept=\"'image/*'\"></span>\r\n        <span class=\"glyphicon glyphicon-paperclip cursor-pointer\" ngf-select=\"chatGroup.upload($files)\" multiple=\"multiple\"></span>\r\n    </div>  \r\n</div>";

/***/ }),

/***/ "../components/chat-group/chat-group.js":
/*!**********************************************!*\
  !*** ../components/chat-group/chat-group.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const componentName = 'chatGroup';
const moduleName = 'chat-group';

function Controller(apiService, $timeout, $element){
    const WIDTH_IMAGE_THUMB = 130;
    let self = this;
    this.listMessageHeight = 300;
    let textMessage = $element.find('.text-message');
    let listMessage = $element.find('.list-message');
    textMessage.keypress(function (e) {
        if (e.which == 13 && !e.shiftKey) {
            let content = textMessage.val().split('\n').join('<br/>');
            let message = {
                content: content,
                type: 'text',
                idSender: self.user.id,
                idConversation: self.conver.id,
                User: self.user,
                sendAt: new Date((new Date()).getTime())
            };
            apiService.postMessage(message, self.token, function (res) {
            });
            e.preventDefault();
            textMessage.val('');
        }
    });
    this.upload = function (files) {
        async.forEachOfSeries(files, (file, i, _done) => {
            let type = file.type.substring(0, 5);
            apiService.upload({
                file: file,
                fields: {'name': self.conver.name, 'width': WIDTH_IMAGE_THUMB}
            }, self.token, (res) => {
                if(res) {
                    let message = {
                        content: res,
                        type: type=='image'?'image':'file',
                        idSender: self.user.id,
                        idConversation: self.conver.id,
                        User: self.user,
                        sendAt: new Date((new Date()).getTime())
                    }
                    apiService.postMessage(message, self.token, (res) => {
                        _done();
                    });
                }
            })
        }, (err) => {

        });
    }
    this.download = function(path) {
        let p = path.slice(27);
        return apiService.url + '/api/download/'+p+'?token='+self.token;
    }
    this.thumb = function(path) {
        let p = path.slice(27);
        return apiService.url + '/api/thumb/'+p+'?token='+self.token;
    }
    this.fileName = function(path) {
        return path.substring(61+self.conver.name.length, path.length);
    }
    socket.on('sendMessage', function (data) {
        if(self.conver.id == data.idConversation) {
            self.conver.Messages = self.conver.Messages?self.conver.Messages:[];
            $timeout(function() {
                self.conver.Messages.push(data);
                $timeout(function(){
                    listMessage.scrollTop(listMessage[0].scrollHeight);
                }, 500);
            });
    
            
        }
    });
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    template: __webpack_require__(/*! ../chat-group/chat-group.html */ "../components/chat-group/chat-group.html"),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        conver: "<",
        user: "<",
        token: "<",
        color: "<"
    }
});

exports.name = moduleName;

/***/ }),

/***/ "../components/help-desk/help-desk.html":
/*!**********************************************!*\
  !*** ../components/help-desk/help-desk.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h3>HELP DESK</h3>";

/***/ }),

/***/ "../components/help-desk/help-desk.js":
/*!********************************************!*\
  !*** ../components/help-desk/help-desk.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const componentName = 'helpDesk';
const moduleName = 'help-desk';

function Controller(apiService){
    let self = this;
    
    window.HELP_DEV = self;
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    template: __webpack_require__(/*! ../help-desk/help-desk.html */ "../components/help-desk/help-desk.html"),
    controller: Controller,
    controllerAs: componentName
});

exports.name = moduleName;

/***/ }),

/***/ "../components/list-user/list-user.html":
/*!**********************************************!*\
  !*** ../components/list-user/list-user.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ul style=\"overflow-y: overlay; height:{{chatGroup.listMemberHeight}}px; padding: 0px 8px;\">\r\n    <li class=\"online\" ng-repeat=\"user in listUser.listUser\">\r\n        <i class=\"fa fa-circle\" style=\"font-size: 10px\" ng-style=\"listUser.active(user)\"></i>\r\n        <span class=\"user\" style=\"cursor: pointer;\" ng-click=\"listUser.chatPersonal(user)\">{{user.username}}</span>\r\n    </li>\r\n</ul>";

/***/ }),

/***/ "../components/list-user/list-user.js":
/*!********************************************!*\
  !*** ../components/list-user/list-user.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const componentName = 'listUser';
const moduleName = 'list-user';

function Controller($timeout){
    let self = this;
    this.listMemberHeight = 300;
    this.active = function(user) {
        return user.active;
    }
    
    this.chatPersonal = function(user) {
    }
    socket.on('send-members-online', function(data) {
        if(self.listUser)
        $timeout(function(){
            for(x of data) {
                self.listUser.forEach(function(user) {
                    if(user.username==x) user.active ={"color": "blue"};
                })
            }
        })
    })
    socket.on('disconnected', function(data) {
        if(self.listUser)
        $timeout(function() {
            self.listUser.forEach(function(user) {
                if(user.username==data) user.active ={"color": ""};
            })
        })
    })
    socket.on('off-project', function(data) {
        if(self.listUser)
        $timeout(function() {
            self.listUser.forEach(function(user) {
                if(user.username==data.username) user.active ={"color": ""};
            })
        })
    })
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    template: __webpack_require__(/*! ../list-user/list-user.html */ "../components/list-user/list-user.html"),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        listUser: "<",
        user: "<",
        idConversation: "<",
        token: "<"
    }
});

exports.name = moduleName;

/***/ }),

/***/ "../css/style.css":
/*!************************!*\
  !*** ../css/style.css ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../node_modules/css-loader!./style.css */ "../node_modules/css-loader/index.js!../css/style.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../node_modules/style-loader/lib/addStyles.js */ "../node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "../index.html":
/*!*********************!*\
  !*** ../index.html ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<script>\r\n    var socket = io('http://54.169.149.206:5001');\r\n</script>\r\n<div ng-init=\"cm.draggable()\" ng-mousedown=\"cm.onMouseDown()\"\r\n    class=\"chat-module\" style=\"right: {{cm.right}};bottom: {{cm.bottom}}; width: {{cm.width}}px\" ng-if=\"cm.initChatGroup || cm.initHelpDesk\">\r\n    <div id=\"chat-frame\" ng-show=\"cm.showChatFrame()\">\r\n        <div class=\"panel with-nav-tabs panel-{{cm.class}}\">\r\n            <div class=\"panel-heading title-bar\">\r\n                <ul class=\"nav nav-tabs\">\r\n                    <li class=\"active tab-chat\" id=\"pill-active\" style=\"max-width: 100px\">\r\n                        <a href=\"#chat-{{cm.groupName}}\" data-toggle=\"tab\" style=\"white-space: nowrap;overflow-x: hidden;text-overflow: ellipsis;\">\r\n                            {{cm.groupName}}\r\n                        </a>\r\n                    </li>\r\n                    <li id=\"pill-active\" ng-if=\"cm.groupName!='Help_Desk'\" class=\"members\">\r\n                        <a href=\"#members-{{cm.groupName}}\" data-toggle=\"tab\">Members({{cm.groupName}})</a>\r\n                    </li>\r\n                    <li style=\"float: right\" class=\"cursor-pointer\" ng-click=\"cm.hideChatFrame()\">\r\n                        <i class=\"fa fa-minus config\"></i>\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n            <div class=\"panel-body\">\r\n                <div class=\"tab-content\">\r\n                    <div class=\"tab-pane fade in active\" id=\"chat-{{cm.groupName}}\">\r\n                        <chat-group conver=\"cm.conver\" user=\"cm.user\" token=\"cm.token\" color=\"cm.color\"></chat-group>\r\n                    </div>\r\n                    <div class=\"tab-pane fade\" id=\"members-{{cm.groupName}}\" ng-if=\"cm.groupName!='Help_Desk'\">\r\n                        <list-user list-user=\"cm.listUser\" user=\"cm.user\" id-conversation=\"cm.conver.id\" token=\"cm.token\"></list-user>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

/***/ }),

/***/ "../js/app.js":
/*!********************!*\
  !*** ../js/app.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../css/style.css */ "../css/style.css");
let chatService = __webpack_require__(/*! ../services/api-service.js */ "../services/api-service.js");
let chatGroup = __webpack_require__(/*! ../components/chat-group/chat-group.js */ "../components/chat-group/chat-group.js");
let helpDesk = __webpack_require__(/*! ../components/help-desk/help-desk.js */ "../components/help-desk/help-desk.js");
let listUser = __webpack_require__(/*! ../components/list-user/list-user.js */ "../components/list-user/list-user.js");
let moduleName = componentName = 'chatModule';

angular.module(moduleName, [chatService.name, chatGroup.name, helpDesk.name, listUser.name, 'ngFileUpload'])
        .component(componentName, {
                template: __webpack_require__(/*! ../index.html */ "../index.html"),
                controller: Controller,
                controllerAs: 'cm',
                bindings: {
                        groupName: '<',
                        groupOwner: '<',
                        token: '<',
                        username: '<',
                        width: '<',
                        showChatGroup: '=',
                        showHelpDesk: '='
                }
        });

function Controller(apiService, $scope, $element, $timeout) {
        let self = this;
        this.conver = {};
        this.token = '';
        const HELP_DESK = 'Help_Desk';
        const HELP_DESK_COLOR = '#3c763d';
        const HELP_DESK_CLASS = 'success';
        const GROUP_COLOR = '#428bca';
        const GROUP_CLASS = 'primary';
        let cm = $('chat-module');
        if ($element.is($(cm[0]))) {
                $(cm[0]).css('z-index', '100');
        } else {
                $(cm[1]).css('z-index', '100');
        }
        this.$onInit = function () {
                if (self.groupName == HELP_DESK) {
                        self.color = HELP_DESK_COLOR;
                        self.listUser = [];
                        self.initHelpDesk = true;
                        self.class = HELP_DESK_CLASS;
                }
                else {
                        self.class = GROUP_CLASS;
                        self.color = GROUP_COLOR;
                }
                initChat(self.token, self.groupName, self.groupOwner);
        }
        $scope.$watch(function() { return self.showChatGroup; }, function(newValue, oldValue) {
                if(!newValue) {
                        let cm = $('chat-module');
                        console.log('chat');
                        if ($element.is($(cm[0]))) {
                                $(cm[0].children[1]).css('z-index', '-1');
                        } else {
                                $(cm[1].children[1]).css('z-index', '-1');
                        }
                } else {
                        let cm = $('chat-module');
                        console.log('chat');
                        if ($element.is($(cm[0]))) {
                                $(cm[0].children[1]).css('z-index', '100');
                        } else {
                                $(cm[1].children[1]).css('z-index', '100');
                        }
                }
        })
        $scope.$watch(function() { return self.showHelpDesk; }, function(newValue, oldValue) {
                if(!newValue) {
                        let cm = $('chat-module');
                        console.log('help dev');
                        if ($element.is($(cm[0]))) {
                                $(cm[0].children[1]).css('z-index', '-1');
                        } else {
                                $(cm[1].children[1]).css('z-index', '-1');
                        }
                }else {
                        let cm = $('chat-module');
                        console.log('help dev');
                        if ($element.is($(cm[0]))) {
                                $(cm[0].children[1]).css('z-index', '100');
                        } else {
                                $(cm[1].children[1]).css('z-index', '100');
                        }
                }
        })
        $scope.$watch(function () { return self.groupName == HELP_DESK ? self.showHelpDesk : self.showChatGroup; }, function (newValue, oldValue) {

                if (newValue) {
                        if (self.groupName != HELP_DESK && self.listUser && self.listUser.length <= 2) {
                                self.showChatGroup = false;
                                toastr.error('No shared project is opening');
                        }
                        let cm = $element.find('.chat-module');
                        $(cm).css('left', 'auto');
                        $(cm).css('top', 'auto');
                }
        })

        $scope.$watch(function () { return self.groupName }, function handleChange(newValue, oldValue) {
                if (oldValue != newValue) {
                        if (!newValue) {
                                self.initChatGroup = false;
                                self.showChatGroup = false;
                                self.showHelpDesk = false;
                                self.user = {};
                                self.user.username = window.localStorage.getItem('username');
                                socket.emit('off-project', { idConversation: self.conver.id, username: self.user.username });
                        }
                        initChat(self.token, self.groupName, self.groupOwner);
                }
        });
        $scope.$watch(function () { return self.token }, function handleChange(newValue, oldValue) {
                if (oldValue != newValue) {
                        if (!newValue) {
                                self.initChatGroup = false;
                                self.showChatGroup = false;
                                self.showHelpDesk = false;
                                self.user = {};
                                self.user.username = window.localStorage.getItem('username');
                                socket.emit('off-project', { idConversation: self.conver.id, username: self.user.username });
                        }
                        initChat(self.token, self.groupName, self.groupOwner);
                }
        });

        function getListUser(projectName, projectOwner, cb) {
                apiService.getListUserOfProject({
                        project_name: projectName,
                        owner: projectOwner
                }, self.token, (res) => {
                        cb(res);
                })
        }
        function getChatGroup(projectName, users) {
                self.initChatGroup = true;
                apiService.getConver({
                        name: projectName,
                        users: users
                }, self.token, (res) => {
                        if (res) {
                                self.conver = res.conver;
                                self.user = res.user;
                                socket.emit('join-room', { username: self.user.username, idConversation: self.conver.id });
                        }
                        else
                                self.conver = {};
                })
        }

        function initChat(token, projectName, projectOwner) {
                if (!token)
                        toastr.error('Authentization fail');
                else {
                        if (projectName == HELP_DESK) {
                                getChatGroup(projectName + '-' + self.username);
                        }
                        else {
                                if (projectName) {
                                        if (self.conver.id) socket.emit('off-project', { idConversation: self.conver.id, username: self.user.username });
                                        getListUser(projectName, projectOwner, function (res) {
                                                if (res) {
                                                        self.listUser = res;
                                                        if (self.listUser.length >= 2) {
                                                                getChatGroup(projectName);
                                                        }
                                                        else {
                                                                self.showChatGroup = false;
                                                                self.showHelpDesk = false;
                                                        }
                                                } else {
                                                        self.listUser = [];
                                                        self.showChatGroup = false;
                                                        self.showHelpDesk = false;
                                                }
                                        });
                                } else {
                                        self.projectName = '';
                                        if (self.conver.id)
                                                socket.emit('off-project', { idConversation: self.conver.id, username: self.user.username });
                                }
                        }
                }
        }
        this.showChatGroup = function () {
                return self.groupName == HELP_DESK || self.listUser.length >= 2;
        }

        this.draggable = function () {
                $element.find(".chat-module").draggable({
                        start: function () {
                                self.moving = true;
                                swapChatModule();
                        },
                        drag: function () {

                        },
                        stop: function () {
                                self.moving = false;
                        }
                });
        }
        this.onMouseDown = function ($event) {
                swapChatModule();
        }
        function swapChatModule() {
                let cms = $('chat-module');
                if ($element.is($(cms[0]))) {
                        $element.insertAfter($(cms[1]));
                }
        }
        this.hideChatFrame = function () {
                if (self.groupName == HELP_DESK) self.showHelpDesk = false;
                else self.showChatGroup = false;
                return false;
        }
        this.showChatFrame = function () {
                if (self.groupName == HELP_DESK) return self.showHelpDesk;
                return self.showChatGroup;
        }
};


/***/ }),

/***/ "../node_modules/css-loader/index.js!../css/style.css":
/*!***************************************************!*\
  !*** ../node_modules/css-loader!../css/style.css ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../node_modules/css-loader/lib/css-base.js */ "../node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "\r\n/*** PANEL primary ***/\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:focus {\r\n    color: #fff;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > .open > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > .open > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > .open > a:focus,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:focus {\r\n\tcolor: #fff;\r\n\tbackground-color: #3071a9;\r\n\tborder-color: transparent;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.active > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.active > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.active > a:focus {\r\n\tcolor: #428bca;\r\n\tbackground-color: #fff;\r\n\tborder-color: #428bca;\r\n\tborder-bottom-color: transparent;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu {\r\n    background-color: #428bca;\r\n    border-color: #3071a9;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > li > a {\r\n    color: #fff;   \r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > li > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > li > a:focus {\r\n    background-color: #3071a9;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > .active > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > .active > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > .active > a:focus {\r\n    background-color: #4a9fe9;\r\n}\r\n/*** PANEL success ***/\r\nchat-module .panel-success {\r\n    border-color: #3c763d;\r\n}\r\nchat-module .panel-success>.panel-heading {\r\n    color: #3c763d;\r\n    background-color: #3c763d;\r\n    border-color: #3c763d;\r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li > a,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li > a:hover,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li > a:focus {\r\n    color: #fff;\r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > .open > a,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > .open > a:hover,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > .open > a:focus,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li > a:hover,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li > a:focus {\r\n\tcolor: #fff;\r\n\tbackground-color: #3c763d;\r\n\tborder-color: transparent;\r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.active > a,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.active > a:hover,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.active > a:focus {\r\n\tcolor: #3c763d;\r\n\tbackground-color: #fff;\r\n\tborder-color: #3c763d;\r\n\tborder-bottom-color: transparent;\r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu {\r\n    background-color: #3c763d;\r\n    border-color: #3c763d;\r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu > li > a {\r\n    color: #fff;   \r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu > li > a:hover,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu > li > a:focus {\r\n    background-color: #3c763d;\r\n}\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu > .active > a,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu > .active > a:hover,\r\nchat-module .with-nav-tabs.panel-success .nav-tabs > li.dropdown .dropdown-menu > .active > a:focus {\r\n    background-color: #3c763d;\r\n}\r\nchat-module .nav>li>a {\r\n    padding: 5px 8px;\r\n    font-weight: bold;\r\n}\r\nchat-module .panel-heading {\r\n    padding: 0px;\r\n    border-bottom: none;\r\n}\r\nchat-module .panel-body {\r\n    padding: 0px;\r\n}\r\nchat-module .tab-pane {\r\n    /* height: 100%; */\r\n}\r\n/***************************************************************************************************/\r\n\r\nchat-module .chat-module {\r\n    font-size: 12px;\r\n    position: absolute;\r\n    bottom: -19px;\r\n    right: 0px;\r\n}\r\n\r\nchat-module #chat-frame {\r\n    width: 100%;\r\n    /* height: 350px; */\r\n    background: #fff;\r\n}\r\nchat-module .config {\r\n    color: #fff;\r\n    padding: 5px 6px;\r\n    font-size: 14px;\r\n}\r\nchat-module .list-message {\r\n    padding: 10px;\r\n    overflow-y: overlay;\r\n}\r\nchat-module .message {\r\n    width: 80%;\r\n    word-break: keep-all;\r\n    word-wrap: break-word;\r\n}\r\nchat-module .text-message {\r\n    border: 1px solid green;\r\n    /* height: 100%; */\r\n    width: 100% !important;\r\n    padding-right: 40px;\r\n    min-height:40px;\r\n    /* height: 50px; */\r\n    /* padding: 0px; */\r\n}\r\n\r\nchat-module span {\r\n    margin-right: 10px;\r\n}\r\n/***********************************/\r\nchat-module .online {\r\n    margin: 8px;\r\n    font-size: 15px;\r\n    white-space: nowrap;\r\n    overflow-x: hidden;\r\n    text-overflow: ellipsis;\r\n}\r\nchat-module .fa.fa-circle {\r\n    font-size: 5px;\r\n    margin: 5px;\r\n}\r\nchat-module .cursor-pointer {\r\n    cursor: pointer;\r\n}\r\nchat-module .cursor-move {\r\n    cursor: move;\r\n}\r\nchat-module .row {\r\n    margin: 0px;\r\n}\r\nchat-module li {\r\n    list-style: none;\r\n}\r\n/* width */\r\nchat-module ::-webkit-scrollbar {\r\n    width: 5px;\r\n}\r\n\r\n/* Track */\r\n::-webkit-scrollbar-track {\r\n    box-shadow: inset 0 0 1px rgb(202, 202, 202); \r\n    border-radius: 2px;\r\n}\r\n \r\n/* Handle */\r\n::-webkit-scrollbar-thumb {\r\n    background: rgb(207, 207, 207); \r\n    border-radius: 10px;\r\n}", ""]);

// exports


/***/ }),

/***/ "../node_modules/css-loader/lib/css-base.js":
/*!**************************************************!*\
  !*** ../node_modules/css-loader/lib/css-base.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "../node_modules/style-loader/lib/addStyles.js":
/*!*****************************************************!*\
  !*** ../node_modules/style-loader/lib/addStyles.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "../node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "../node_modules/style-loader/lib/urls.js":
/*!************************************************!*\
  !*** ../node_modules/style-loader/lib/urls.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "../services/api-service.js":
/*!**********************************!*\
  !*** ../services/api-service.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

const moduleName = 'apiServiceModule';
const serviceName = 'apiService';
const GET_LIST_USER_OF_PROJECT = 'http://login.sflow.me/user/list';
const wiMessengerUrl = 'http://54.169.149.206:5001';

const GET_CONVERSATION = wiMessengerUrl + '/api/conversation';
const POST_MESSAGE = wiMessengerUrl + '/api/message/new';
const UPLOAD = wiMessengerUrl + '/api/upload';
const GET_USER = wiMessengerUrl + '/getUser';
angular.module(moduleName, []).service(serviceName, function ($http, Upload) {
    
    let doPost = function(URL, token, data, cb) {
        $http({
            method: 'POST',
            url: URL,
            headers: {
                'Authorization': token
            },
            data: data
        }).then(function successCallback(response) {
                if (response.data.code != 200) {
                    console.error(response.data.reason);
                    cb();
                } else {
                    cb(response.data.content);
                }
        }, function errorCallback(response) {
            console.error(response);
            if(toastr) toastr.error(response);
            cb();
        });
    }
    
    this.getConver = (data, token, cb) => {
        doPost(GET_CONVERSATION, token, data, cb);
    }
    this.getUser = (data, token, cb) => {
        doPost(GET_USER, token, data, cb);
    }
    this.postMessage = (data, token, cb) => {
        doPost(POST_MESSAGE, token, data, cb);
    }
    this.getListUserOfProject = (data, token, cb) => {
        doPost(GET_LIST_USER_OF_PROJECT, token, data, cb);
    }
    this.upload = (data, token, cb) => {
        Upload.upload({
            url: UPLOAD,
            headers: {
                'Authorization': token
            },
            file: data.file,
            fields: data.fields
        }).then(
            (response) => {
                if (response.data.code != 200) {
                    console.error(response.data.reason);
                    cb();
                } else {
                    cb(response.data.content);
                }
            },
            (error) => {
                console.error(error);
                cb();
            });
    }
    this.url = wiMessengerUrl;
    return this;
});
module.exports.name = moduleName;

/***/ }),

/***/ 0:
/*!**************************!*\
  !*** multi ../js/app.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ../js/app.js */"../js/app.js");


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmh0bWwiLCJ3ZWJwYWNrOi8vLy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmpzIiwid2VicGFjazovLy8uLi9jb21wb25lbnRzL2hlbHAtZGVzay9oZWxwLWRlc2suaHRtbCIsIndlYnBhY2s6Ly8vLi4vY29tcG9uZW50cy9oZWxwLWRlc2svaGVscC1kZXNrLmpzIiwid2VicGFjazovLy8uLi9jb21wb25lbnRzL2xpc3QtdXNlci9saXN0LXVzZXIuaHRtbCIsIndlYnBhY2s6Ly8vLi4vY29tcG9uZW50cy9saXN0LXVzZXIvbGlzdC11c2VyLmpzIiwid2VicGFjazovLy8uLi9jc3Mvc3R5bGUuY3NzPzRlNzciLCJ3ZWJwYWNrOi8vLy4uL2luZGV4Lmh0bWwiLCJ3ZWJwYWNrOi8vLy4uL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4uL3NlcnZpY2VzL2FwaS1zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNM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Q0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGlDIiwiZmlsZSI6ImNoYXQtbW9kdWxlLndlYnBhY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgc3R5bGU9XFxcImhlaWdodDp7e2NoYXRHcm91cC5saXN0TWVzc2FnZUhlaWdodH19cHhcXFwiIGNsYXNzPVxcXCJsaXN0LW1lc3NhZ2VcXFwiIG5nZi1kcm9wPVxcXCJjaGF0R3JvdXAudXBsb2FkKCRmaWxlcylcXFwiIGNsYXNzPVxcXCJkcm9wLWJveFxcXCJcXHJcXG4gICAgbmdmLWRyYWctb3Zlci1jbGFzcz1cXFwiJ2RyYWdvdmVyJ1xcXCIgbmdmLW11bHRpcGxlPVxcXCJ0cnVlXFxcIj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwicm93XFxcIiBuZy1yZXBlYXQ9XFxcIm1lc3NhZ2UgaW4gY2hhdEdyb3VwLmNvbnZlci5NZXNzYWdlcyB0cmFjayBieSAkaW5kZXhcXFwiPlxcclxcbiAgICAgICAgPGRpdiBuZy1pZj1cXFwibWVzc2FnZS5Vc2VyLnVzZXJuYW1lIT1jaGF0R3JvdXAudXNlci51c2VybmFtZVxcXCIgY2xhc3M9XFxcInJvd1xcXCIgc3R5bGU9XFxcImNvbG9yOiBncmF5OyB0ZXh0LWFsaWduOiBjZW50ZXJcXFwiPi0tLXt7bWVzc2FnZS5zZW5kQXR9fS0tLTwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBuZy1pZj1cXFwibWVzc2FnZS5Vc2VyLnVzZXJuYW1lIT1jaGF0R3JvdXAudXNlci51c2VybmFtZVxcXCIgc3R5bGU9XFxcIndpZHRoOiA3MCU7IGZsb2F0OiBsZWZ0O21hcmdpbi1ib3R0b206IDJweFxcXCI+XFxyXFxuICAgICAgICAgICAgPHAgbmctaWY9XFxcImNoYXRHcm91cC5jb252ZXIubmFtZS5pbmRleE9mKCdIZWxwX0Rlc2snKT09LTFcXFwiIHN0eWxlPVxcXCJmb250LXdlaWdodDogYm9sZDsgbWFyZ2luLXRvcDogM3B4OyBtYXJnaW4tYm90dG9tOiAzcHhcXFwiPnt7bWVzc2FnZS5Vc2VyLnVzZXJuYW1lfX08L3A+XFxyXFxuICAgICAgICAgICAgPHAgbmctaWY9XFxcImNoYXRHcm91cC5jb252ZXIubmFtZS5pbmRleE9mKCdIZWxwX0Rlc2snKSE9LTFcXFwiIHN0eWxlPVxcXCJmb250LXdlaWdodDogYm9sZDsgbWFyZ2luLXRvcDogM3B4OyBtYXJnaW4tYm90dG9tOiAzcHhcXFwiPkFkbWluPC9wPlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZSE9J2ltYWdlJ1xcXCIgc3R5bGU9XFxcImJhY2tncm91bmQ6ICNlNmU2ZTY7IGJvcmRlci1yYWRpdXM6IDEwcHg7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgcGFkZGluZzogNnB4IDhweCA7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIG5nLWJpbmQtaHRtbD1cXFwibWVzc2FnZS5jb250ZW50XFxcIiBzdHlsZT1cXFwiIGRpc3BsYXk6IGlubGluZTtcXFwiIG5nLWlmPVxcXCJtZXNzYWdlLnR5cGU9PSd0ZXh0J1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ZpbGUnXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcInt7Y2hhdEdyb3VwLmRvd25sb2FkKG1lc3NhZ2UuY29udGVudCl9fVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2lyY2xlLWFycm93LWRvd25cXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e2NoYXRHcm91cC5maWxlTmFtZShtZXNzYWdlLmNvbnRlbnQpfX1cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9wPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ltYWdlJ1xcXCIgc3R5bGU9XFxcIiBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwie3tjaGF0R3JvdXAuZG93bmxvYWQobWVzc2FnZS5jb250ZW50KX19XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3tjaGF0R3JvdXAudGh1bWIobWVzc2FnZS5jb250ZW50KX19XFxcIiBzdHlsZT1cXFwibWF4LXdpZHRoOiA3MCU7IG1heC1oZWlnaHQ6IDQwJTs7Ym9yZGVyOiAxcHggc29saWQgI2RkZDtib3JkZXItcmFkaXVzOiA0cHg7XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9wPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLlVzZXIudXNlcm5hbWU9PWNoYXRHcm91cC51c2VyLnVzZXJuYW1lXFxcIiBzdHlsZT1cXFwid2lkdGg6IDcwJTsgZmxvYXQ6IHJpZ2h0O21hcmdpbi1ib3R0b206IDJweFxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBuZy1pZj1cXFwibWVzc2FnZS50eXBlIT0naW1hZ2UnXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZDoge3tjaGF0R3JvdXAuY29sb3J9fTsgYm9yZGVyLXJhZGl1czogMTBweDsgZmxvYXQ6IHJpZ2h0OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7cGFkZGluZzogNnB4IDhweDttYXgtd2lkdGg6IDEwMCVcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cXFwibWVzc2FnZVxcXCIgbmctYmluZC1odG1sPVxcXCJtZXNzYWdlLmNvbnRlbnRcXFwiIHN0eWxlPVxcXCJjb2xvcjogI2ZmZjtkaXNwbGF5OiBpbmxpbmU7IFxcXCIgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J3RleHQnXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPC9wPlxcclxcbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cXFwibWVzc2FnZVxcXCIgc3R5bGU9XFxcIiBkaXNwbGF5OiBpbmxpbmU7XFxcIiBuZy1pZj1cXFwibWVzc2FnZS50eXBlPT0nZmlsZSdcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwie3tjaGF0R3JvdXAuZG93bmxvYWQobWVzc2FnZS5jb250ZW50KX19XFxcIiBzdHlsZT1cXFwiY29sb3I6ICNmZmZcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNpcmNsZS1hcnJvdy1kb3duXFxcIj48L2k+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAge3tjaGF0R3JvdXAuZmlsZU5hbWUobWVzc2FnZS5jb250ZW50KX19XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2E+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLnR5cGU9PSdpbWFnZSdcXFwiIHN0eWxlPVxcXCIgdGV4dC1hbGlnbjogcmlnaHQ7IGZsb2F0OiByaWdodDsgZGlzcGxheTogaW5saW5lLWJsb2NrO3BhZGRpbmc6IDZweCA4cHg7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCJ7e2NoYXRHcm91cC5kb3dubG9hZChtZXNzYWdlLmNvbnRlbnQpfX1cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCJ7e2NoYXRHcm91cC50aHVtYihtZXNzYWdlLmNvbnRlbnQpfX1cXFwiIHN0eWxlPVxcXCJtYXgtd2lkdGg6IDcwJTsgbWF4LWhlaWdodDogNDAlO2JvcmRlcjogMXB4IHNvbGlkICNkZGQ7Ym9yZGVyLXJhZGl1czogNHB4O1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2E+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cXHJcXG48ZGl2IHN0eWxlPVxcXCJwb3NpdGlvbjpyZWxhdGl2ZTtcXFwiPlxcclxcbiAgICA8dGV4dGFyZWEgY2xhc3M9XFxcInRleHQtbWVzc2FnZVxcXCIgcm93cz1cXFwiMlxcXCI+PC90ZXh0YXJlYT5cXHJcXG4gICAgPGRpdiBzdHlsZT1cXFwicG9zaXRpb246IGFic29sdXRlO2JvdHRvbTogNXB4O3JpZ2h0OiA1cHg7XFxcIj5cXHJcXG4gICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBpY3R1cmUgY3Vyc29yLXBvaW50ZXJcXFwiIG5nZi1zZWxlY3Q9XFxcImNoYXRHcm91cC51cGxvYWQoJGZpbGVzKVxcXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBuZ2YtYWNjZXB0PVxcXCInaW1hZ2UvKidcXFwiPjwvc3Bhbj5cXHJcXG4gICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBhcGVyY2xpcCBjdXJzb3ItcG9pbnRlclxcXCIgbmdmLXNlbGVjdD1cXFwiY2hhdEdyb3VwLnVwbG9hZCgkZmlsZXMpXFxcIiBtdWx0aXBsZT1cXFwibXVsdGlwbGVcXFwiPjwvc3Bhbj5cXHJcXG4gICAgPC9kaXY+ICBcXHJcXG48L2Rpdj5cIjsiLCJjb25zdCBjb21wb25lbnROYW1lID0gJ2NoYXRHcm91cCc7XHJcbmNvbnN0IG1vZHVsZU5hbWUgPSAnY2hhdC1ncm91cCc7XHJcblxyXG5mdW5jdGlvbiBDb250cm9sbGVyKGFwaVNlcnZpY2UsICR0aW1lb3V0LCAkZWxlbWVudCl7XHJcbiAgICBjb25zdCBXSURUSF9JTUFHRV9USFVNQiA9IDEzMDtcclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMubGlzdE1lc3NhZ2VIZWlnaHQgPSAzMDA7XHJcbiAgICBsZXQgdGV4dE1lc3NhZ2UgPSAkZWxlbWVudC5maW5kKCcudGV4dC1tZXNzYWdlJyk7XHJcbiAgICBsZXQgbGlzdE1lc3NhZ2UgPSAkZWxlbWVudC5maW5kKCcubGlzdC1tZXNzYWdlJyk7XHJcbiAgICB0ZXh0TWVzc2FnZS5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09IDEzICYmICFlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50ID0gdGV4dE1lc3NhZ2UudmFsKCkuc3BsaXQoJ1xcbicpLmpvaW4oJzxici8+Jyk7XHJcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIGlkU2VuZGVyOiBzZWxmLnVzZXIuaWQsXHJcbiAgICAgICAgICAgICAgICBpZENvbnZlcnNhdGlvbjogc2VsZi5jb252ZXIuaWQsXHJcbiAgICAgICAgICAgICAgICBVc2VyOiBzZWxmLnVzZXIsXHJcbiAgICAgICAgICAgICAgICBzZW5kQXQ6IG5ldyBEYXRlKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGFwaVNlcnZpY2UucG9zdE1lc3NhZ2UobWVzc2FnZSwgc2VsZi50b2tlbiwgZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB0ZXh0TWVzc2FnZS52YWwoJycpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy51cGxvYWQgPSBmdW5jdGlvbiAoZmlsZXMpIHtcclxuICAgICAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMoZmlsZXMsIChmaWxlLCBpLCBfZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdHlwZSA9IGZpbGUudHlwZS5zdWJzdHJpbmcoMCwgNSk7XHJcbiAgICAgICAgICAgIGFwaVNlcnZpY2UudXBsb2FkKHtcclxuICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IHsnbmFtZSc6IHNlbGYuY29udmVyLm5hbWUsICd3aWR0aCc6IFdJRFRIX0lNQUdFX1RIVU1CfVxyXG4gICAgICAgICAgICB9LCBzZWxmLnRva2VuLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcmVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlPT0naW1hZ2UnPydpbWFnZSc6J2ZpbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZFNlbmRlcjogc2VsZi51c2VyLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZENvbnZlcnNhdGlvbjogc2VsZi5jb252ZXIuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXI6IHNlbGYudXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZEF0OiBuZXcgRGF0ZSgobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhcGlTZXJ2aWNlLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIHNlbGYudG9rZW4sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2RvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LCAoZXJyKSA9PiB7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kb3dubG9hZCA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuICAgICAgICBsZXQgcCA9IHBhdGguc2xpY2UoMjcpO1xyXG4gICAgICAgIHJldHVybiBhcGlTZXJ2aWNlLnVybCArICcvYXBpL2Rvd25sb2FkLycrcCsnP3Rva2VuPScrc2VsZi50b2tlbjtcclxuICAgIH1cclxuICAgIHRoaXMudGh1bWIgPSBmdW5jdGlvbihwYXRoKSB7XHJcbiAgICAgICAgbGV0IHAgPSBwYXRoLnNsaWNlKDI3KTtcclxuICAgICAgICByZXR1cm4gYXBpU2VydmljZS51cmwgKyAnL2FwaS90aHVtYi8nK3ArJz90b2tlbj0nK3NlbGYudG9rZW47XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbGVOYW1lID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgIHJldHVybiBwYXRoLnN1YnN0cmluZyg2MStzZWxmLmNvbnZlci5uYW1lLmxlbmd0aCwgcGF0aC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgc29ja2V0Lm9uKCdzZW5kTWVzc2FnZScsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYoc2VsZi5jb252ZXIuaWQgPT0gZGF0YS5pZENvbnZlcnNhdGlvbikge1xyXG4gICAgICAgICAgICBzZWxmLmNvbnZlci5NZXNzYWdlcyA9IHNlbGYuY29udmVyLk1lc3NhZ2VzP3NlbGYuY29udmVyLk1lc3NhZ2VzOltdO1xyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29udmVyLk1lc3NhZ2VzLnB1c2goZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RNZXNzYWdlLnNjcm9sbFRvcChsaXN0TWVzc2FnZVswXS5zY3JvbGxIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmxldCBhcHAgPSBhbmd1bGFyLm1vZHVsZShtb2R1bGVOYW1lLCBbXSk7XHJcbmFwcC5jb21wb25lbnQoY29tcG9uZW50TmFtZSwge1xyXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL2NoYXQtZ3JvdXAvY2hhdC1ncm91cC5odG1sJyksXHJcbiAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLFxyXG4gICAgY29udHJvbGxlckFzOiBjb21wb25lbnROYW1lLFxyXG4gICAgYmluZGluZ3M6IHtcclxuICAgICAgICBjb252ZXI6IFwiPFwiLFxyXG4gICAgICAgIHVzZXI6IFwiPFwiLFxyXG4gICAgICAgIHRva2VuOiBcIjxcIixcclxuICAgICAgICBjb2xvcjogXCI8XCJcclxuICAgIH1cclxufSk7XHJcblxyXG5leHBvcnRzLm5hbWUgPSBtb2R1bGVOYW1lOyIsIm1vZHVsZS5leHBvcnRzID0gXCI8aDM+SEVMUCBERVNLPC9oMz5cIjsiLCJjb25zdCBjb21wb25lbnROYW1lID0gJ2hlbHBEZXNrJztcclxuY29uc3QgbW9kdWxlTmFtZSA9ICdoZWxwLWRlc2snO1xyXG5cclxuZnVuY3Rpb24gQ29udHJvbGxlcihhcGlTZXJ2aWNlKXtcclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgIFxyXG4gICAgd2luZG93LkhFTFBfREVWID0gc2VsZjtcclxufVxyXG5cclxubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKG1vZHVsZU5hbWUsIFtdKTtcclxuYXBwLmNvbXBvbmVudChjb21wb25lbnROYW1lLCB7XHJcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vaGVscC1kZXNrL2hlbHAtZGVzay5odG1sJyksXHJcbiAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLFxyXG4gICAgY29udHJvbGxlckFzOiBjb21wb25lbnROYW1lXHJcbn0pO1xyXG5cclxuZXhwb3J0cy5uYW1lID0gbW9kdWxlTmFtZTsiLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHVsIHN0eWxlPVxcXCJvdmVyZmxvdy15OiBvdmVybGF5OyBoZWlnaHQ6e3tjaGF0R3JvdXAubGlzdE1lbWJlckhlaWdodH19cHg7IHBhZGRpbmc6IDBweCA4cHg7XFxcIj5cXHJcXG4gICAgPGxpIGNsYXNzPVxcXCJvbmxpbmVcXFwiIG5nLXJlcGVhdD1cXFwidXNlciBpbiBsaXN0VXNlci5saXN0VXNlclxcXCI+XFxyXFxuICAgICAgICA8aSBjbGFzcz1cXFwiZmEgZmEtY2lyY2xlXFxcIiBzdHlsZT1cXFwiZm9udC1zaXplOiAxMHB4XFxcIiBuZy1zdHlsZT1cXFwibGlzdFVzZXIuYWN0aXZlKHVzZXIpXFxcIj48L2k+XFxyXFxuICAgICAgICA8c3BhbiBjbGFzcz1cXFwidXNlclxcXCIgc3R5bGU9XFxcImN1cnNvcjogcG9pbnRlcjtcXFwiIG5nLWNsaWNrPVxcXCJsaXN0VXNlci5jaGF0UGVyc29uYWwodXNlcilcXFwiPnt7dXNlci51c2VybmFtZX19PC9zcGFuPlxcclxcbiAgICA8L2xpPlxcclxcbjwvdWw+XCI7IiwiY29uc3QgY29tcG9uZW50TmFtZSA9ICdsaXN0VXNlcic7XHJcbmNvbnN0IG1vZHVsZU5hbWUgPSAnbGlzdC11c2VyJztcclxuXHJcbmZ1bmN0aW9uIENvbnRyb2xsZXIoJHRpbWVvdXQpe1xyXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5saXN0TWVtYmVySGVpZ2h0ID0gMzAwO1xyXG4gICAgdGhpcy5hY3RpdmUgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHVzZXIuYWN0aXZlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmNoYXRQZXJzb25hbCA9IGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgIH1cclxuICAgIHNvY2tldC5vbignc2VuZC1tZW1iZXJzLW9ubGluZScsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBpZihzZWxmLmxpc3RVc2VyKVxyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGZvcih4IG9mIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYubGlzdFVzZXIuZm9yRWFjaChmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodXNlci51c2VybmFtZT09eCkgdXNlci5hY3RpdmUgPXtcImNvbG9yXCI6IFwiYmx1ZVwifTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxuICAgIHNvY2tldC5vbignZGlzY29ubmVjdGVkJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGlmKHNlbGYubGlzdFVzZXIpXHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNlbGYubGlzdFVzZXIuZm9yRWFjaChmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICBpZih1c2VyLnVzZXJuYW1lPT1kYXRhKSB1c2VyLmFjdGl2ZSA9e1wiY29sb3JcIjogXCJcIn07XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbiAgICBzb2NrZXQub24oJ29mZi1wcm9qZWN0JywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGlmKHNlbGYubGlzdFVzZXIpXHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNlbGYubGlzdFVzZXIuZm9yRWFjaChmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICBpZih1c2VyLnVzZXJuYW1lPT1kYXRhLnVzZXJuYW1lKSB1c2VyLmFjdGl2ZSA9e1wiY29sb3JcIjogXCJcIn07XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmxldCBhcHAgPSBhbmd1bGFyLm1vZHVsZShtb2R1bGVOYW1lLCBbXSk7XHJcbmFwcC5jb21wb25lbnQoY29tcG9uZW50TmFtZSwge1xyXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL2xpc3QtdXNlci9saXN0LXVzZXIuaHRtbCcpLFxyXG4gICAgY29udHJvbGxlcjogQ29udHJvbGxlcixcclxuICAgIGNvbnRyb2xsZXJBczogY29tcG9uZW50TmFtZSxcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgbGlzdFVzZXI6IFwiPFwiLFxyXG4gICAgICAgIHVzZXI6IFwiPFwiLFxyXG4gICAgICAgIGlkQ29udmVyc2F0aW9uOiBcIjxcIixcclxuICAgICAgICB0b2tlbjogXCI8XCJcclxuICAgIH1cclxufSk7XHJcblxyXG5leHBvcnRzLm5hbWUgPSBtb2R1bGVOYW1lOyIsIlxudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3N0eWxlLmNzc1wiKTtcblxuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG5cbnZhciB0cmFuc2Zvcm07XG52YXIgaW5zZXJ0SW50bztcblxuXG5cbnZhciBvcHRpb25zID0ge1wiaG1yXCI6dHJ1ZX1cblxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbm9wdGlvbnMuaW5zZXJ0SW50byA9IHVuZGVmaW5lZDtcblxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2FscztcblxuaWYobW9kdWxlLmhvdCkge1xuXHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9zdHlsZS5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3N0eWxlLmNzc1wiKTtcblxuXHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXG5cdFx0dmFyIGxvY2FscyA9IChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHR2YXIga2V5LCBpZHggPSAwO1xuXG5cdFx0XHRmb3Ioa2V5IGluIGEpIHtcblx0XHRcdFx0aWYoIWIgfHwgYVtrZXldICE9PSBiW2tleV0pIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWR4Kys7XG5cdFx0XHR9XG5cblx0XHRcdGZvcihrZXkgaW4gYikgaWR4LS07XG5cblx0XHRcdHJldHVybiBpZHggPT09IDA7XG5cdFx0fShjb250ZW50LmxvY2FscywgbmV3Q29udGVudC5sb2NhbHMpKTtcblxuXHRcdGlmKCFsb2NhbHMpIHRocm93IG5ldyBFcnJvcignQWJvcnRpbmcgQ1NTIEhNUiBkdWUgdG8gY2hhbmdlZCBjc3MtbW9kdWxlcyBsb2NhbHMuJyk7XG5cblx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdH0pO1xuXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufSIsIm1vZHVsZS5leHBvcnRzID0gXCI8c2NyaXB0PlxcclxcbiAgICB2YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly81NC4xNjkuMTQ5LjIwNjo1MDAxJyk7XFxyXFxuPC9zY3JpcHQ+XFxyXFxuPGRpdiBuZy1pbml0PVxcXCJjbS5kcmFnZ2FibGUoKVxcXCIgbmctbW91c2Vkb3duPVxcXCJjbS5vbk1vdXNlRG93bigpXFxcIlxcclxcbiAgICBjbGFzcz1cXFwiY2hhdC1tb2R1bGVcXFwiIHN0eWxlPVxcXCJyaWdodDoge3tjbS5yaWdodH19O2JvdHRvbToge3tjbS5ib3R0b219fTsgd2lkdGg6IHt7Y20ud2lkdGh9fXB4XFxcIiBuZy1pZj1cXFwiY20uaW5pdENoYXRHcm91cCB8fCBjbS5pbml0SGVscERlc2tcXFwiPlxcclxcbiAgICA8ZGl2IGlkPVxcXCJjaGF0LWZyYW1lXFxcIiBuZy1zaG93PVxcXCJjbS5zaG93Q2hhdEZyYW1lKClcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicGFuZWwgd2l0aC1uYXYtdGFicyBwYW5lbC17e2NtLmNsYXNzfX1cXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInBhbmVsLWhlYWRpbmcgdGl0bGUtYmFyXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVxcXCJuYXYgbmF2LXRhYnNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVxcXCJhY3RpdmUgdGFiLWNoYXRcXFwiIGlkPVxcXCJwaWxsLWFjdGl2ZVxcXCIgc3R5bGU9XFxcIm1heC13aWR0aDogMTAwcHhcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcIiNjaGF0LXt7Y20uZ3JvdXBOYW1lfX1cXFwiIGRhdGEtdG9nZ2xlPVxcXCJ0YWJcXFwiIHN0eWxlPVxcXCJ3aGl0ZS1zcGFjZTogbm93cmFwO292ZXJmbG93LXg6IGhpZGRlbjt0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e2NtLmdyb3VwTmFtZX19XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9saT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsaSBpZD1cXFwicGlsbC1hY3RpdmVcXFwiIG5nLWlmPVxcXCJjbS5ncm91cE5hbWUhPSdIZWxwX0Rlc2snXFxcIiBjbGFzcz1cXFwibWVtYmVyc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiI21lbWJlcnMte3tjbS5ncm91cE5hbWV9fVxcXCIgZGF0YS10b2dnbGU9XFxcInRhYlxcXCI+TWVtYmVycyh7e2NtLmdyb3VwTmFtZX19KTwvYT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8bGkgc3R5bGU9XFxcImZsb2F0OiByaWdodFxcXCIgY2xhc3M9XFxcImN1cnNvci1wb2ludGVyXFxcIiBuZy1jbGljaz1cXFwiY20uaGlkZUNoYXRGcmFtZSgpXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwiZmEgZmEtbWludXMgY29uZmlnXFxcIj48L2k+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxcclxcbiAgICAgICAgICAgICAgICA8L3VsPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInBhbmVsLWJvZHlcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBmYWRlIGluIGFjdGl2ZVxcXCIgaWQ9XFxcImNoYXQte3tjbS5ncm91cE5hbWV9fVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGNoYXQtZ3JvdXAgY29udmVyPVxcXCJjbS5jb252ZXJcXFwiIHVzZXI9XFxcImNtLnVzZXJcXFwiIHRva2VuPVxcXCJjbS50b2tlblxcXCIgY29sb3I9XFxcImNtLmNvbG9yXFxcIj48L2NoYXQtZ3JvdXA+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lIGZhZGVcXFwiIGlkPVxcXCJtZW1iZXJzLXt7Y20uZ3JvdXBOYW1lfX1cXFwiIG5nLWlmPVxcXCJjbS5ncm91cE5hbWUhPSdIZWxwX0Rlc2snXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGlzdC11c2VyIGxpc3QtdXNlcj1cXFwiY20ubGlzdFVzZXJcXFwiIHVzZXI9XFxcImNtLnVzZXJcXFwiIGlkLWNvbnZlcnNhdGlvbj1cXFwiY20uY29udmVyLmlkXFxcIiB0b2tlbj1cXFwiY20udG9rZW5cXFwiPjwvbGlzdC11c2VyPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlwiOyIsInJlcXVpcmUoJy4uL2Nzcy9zdHlsZS5jc3MnKTtcclxubGV0IGNoYXRTZXJ2aWNlID0gcmVxdWlyZSgnLi4vc2VydmljZXMvYXBpLXNlcnZpY2UuanMnKTtcclxubGV0IGNoYXRHcm91cCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmpzJyk7XHJcbmxldCBoZWxwRGVzayA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvaGVscC1kZXNrL2hlbHAtZGVzay5qcycpO1xyXG5sZXQgbGlzdFVzZXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2xpc3QtdXNlci9saXN0LXVzZXIuanMnKTtcclxubGV0IG1vZHVsZU5hbWUgPSBjb21wb25lbnROYW1lID0gJ2NoYXRNb2R1bGUnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUobW9kdWxlTmFtZSwgW2NoYXRTZXJ2aWNlLm5hbWUsIGNoYXRHcm91cC5uYW1lLCBoZWxwRGVzay5uYW1lLCBsaXN0VXNlci5uYW1lLCAnbmdGaWxlVXBsb2FkJ10pXHJcbiAgICAgICAgLmNvbXBvbmVudChjb21wb25lbnROYW1lLCB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2NtJyxcclxuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZTogJzwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cE93bmVyOiAnPCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiAnPCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnPCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnPCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dDaGF0R3JvdXA6ICc9JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0hlbHBEZXNrOiAnPSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbmZ1bmN0aW9uIENvbnRyb2xsZXIoYXBpU2VydmljZSwgJHNjb3BlLCAkZWxlbWVudCwgJHRpbWVvdXQpIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jb252ZXIgPSB7fTtcclxuICAgICAgICB0aGlzLnRva2VuID0gJyc7XHJcbiAgICAgICAgY29uc3QgSEVMUF9ERVNLID0gJ0hlbHBfRGVzayc7XHJcbiAgICAgICAgY29uc3QgSEVMUF9ERVNLX0NPTE9SID0gJyMzYzc2M2QnO1xyXG4gICAgICAgIGNvbnN0IEhFTFBfREVTS19DTEFTUyA9ICdzdWNjZXNzJztcclxuICAgICAgICBjb25zdCBHUk9VUF9DT0xPUiA9ICcjNDI4YmNhJztcclxuICAgICAgICBjb25zdCBHUk9VUF9DTEFTUyA9ICdwcmltYXJ5JztcclxuICAgICAgICBsZXQgY20gPSAkKCdjaGF0LW1vZHVsZScpO1xyXG4gICAgICAgIGlmICgkZWxlbWVudC5pcygkKGNtWzBdKSkpIHtcclxuICAgICAgICAgICAgICAgICQoY21bMF0pLmNzcygnei1pbmRleCcsICcxMDAnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChjbVsxXSkuY3NzKCd6LWluZGV4JywgJzEwMCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5ncm91cE5hbWUgPT0gSEVMUF9ERVNLKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY29sb3IgPSBIRUxQX0RFU0tfQ09MT1I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubGlzdFVzZXIgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pbml0SGVscERlc2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsYXNzID0gSEVMUF9ERVNLX0NMQVNTO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xhc3MgPSBHUk9VUF9DTEFTUztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb2xvciA9IEdST1VQX0NPTE9SO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5pdENoYXQoc2VsZi50b2tlbiwgc2VsZi5ncm91cE5hbWUsIHNlbGYuZ3JvdXBPd25lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLnNob3dDaGF0R3JvdXA7IH0sIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYoIW5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbSA9ICQoJ2NoYXQtbW9kdWxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGF0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5pcygkKGNtWzBdKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGNtWzBdLmNoaWxkcmVuWzFdKS5jc3MoJ3otaW5kZXgnLCAnLTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGNtWzFdLmNoaWxkcmVuWzFdKS5jc3MoJ3otaW5kZXgnLCAnLTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNtID0gJCgnY2hhdC1tb2R1bGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoYXQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmlzKCQoY21bMF0pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoY21bMF0uY2hpbGRyZW5bMV0pLmNzcygnei1pbmRleCcsICcxMDAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGNtWzFdLmNoaWxkcmVuWzFdKS5jc3MoJ3otaW5kZXgnLCAnMTAwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLnNob3dIZWxwRGVzazsgfSwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZighbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNtID0gJCgnY2hhdC1tb2R1bGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlbHAgZGV2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5pcygkKGNtWzBdKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGNtWzBdLmNoaWxkcmVuWzFdKS5jc3MoJ3otaW5kZXgnLCAnLTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGNtWzFdLmNoaWxkcmVuWzFdKS5jc3MoJ3otaW5kZXgnLCAnLTEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY20gPSAkKCdjaGF0LW1vZHVsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVscCBkZXYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmlzKCQoY21bMF0pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoY21bMF0uY2hpbGRyZW5bMV0pLmNzcygnei1pbmRleCcsICcxMDAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGNtWzFdLmNoaWxkcmVuWzFdKS5jc3MoJ3otaW5kZXgnLCAnMTAwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24gKCkgeyByZXR1cm4gc2VsZi5ncm91cE5hbWUgPT0gSEVMUF9ERVNLID8gc2VsZi5zaG93SGVscERlc2sgOiBzZWxmLnNob3dDaGF0R3JvdXA7IH0sIGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuZ3JvdXBOYW1lICE9IEhFTFBfREVTSyAmJiBzZWxmLmxpc3RVc2VyICYmIHNlbGYubGlzdFVzZXIubGVuZ3RoIDw9IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoJ05vIHNoYXJlZCBwcm9qZWN0IGlzIG9wZW5pbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY20gPSAkZWxlbWVudC5maW5kKCcuY2hhdC1tb2R1bGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChjbSkuY3NzKCdsZWZ0JywgJ2F1dG8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChjbSkuY3NzKCd0b3AnLCAnYXV0bycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24gKCkgeyByZXR1cm4gc2VsZi5ncm91cE5hbWUgfSwgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbHVlICE9IG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXRDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dIZWxwRGVzayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXNlciA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXNlci51c2VybmFtZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdCgnb2ZmLXByb2plY3QnLCB7IGlkQ29udmVyc2F0aW9uOiBzZWxmLmNvbnZlci5pZCwgdXNlcm5hbWU6IHNlbGYudXNlci51c2VybmFtZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0Q2hhdChzZWxmLnRva2VuLCBzZWxmLmdyb3VwTmFtZSwgc2VsZi5ncm91cE93bmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHNlbGYudG9rZW4gfSwgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbHVlICE9IG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmluaXRDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dIZWxwRGVzayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXNlciA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudXNlci51c2VybmFtZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdCgnb2ZmLXByb2plY3QnLCB7IGlkQ29udmVyc2F0aW9uOiBzZWxmLmNvbnZlci5pZCwgdXNlcm5hbWU6IHNlbGYudXNlci51c2VybmFtZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0Q2hhdChzZWxmLnRva2VuLCBzZWxmLmdyb3VwTmFtZSwgc2VsZi5ncm91cE93bmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0TGlzdFVzZXIocHJvamVjdE5hbWUsIHByb2plY3RPd25lciwgY2IpIHtcclxuICAgICAgICAgICAgICAgIGFwaVNlcnZpY2UuZ2V0TGlzdFVzZXJPZlByb2plY3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X25hbWU6IHByb2plY3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogcHJvamVjdE93bmVyXHJcbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRva2VuLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKHJlcyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBnZXRDaGF0R3JvdXAocHJvamVjdE5hbWUsIHVzZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRDaGF0R3JvdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXBpU2VydmljZS5nZXRDb252ZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9qZWN0TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcnM6IHVzZXJzXHJcbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRva2VuLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbnZlciA9IHJlcy5jb252ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi51c2VyID0gcmVzLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ja2V0LmVtaXQoJ2pvaW4tcm9vbScsIHsgdXNlcm5hbWU6IHNlbGYudXNlci51c2VybmFtZSwgaWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbnZlciA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRDaGF0KHRva2VuLCBwcm9qZWN0TmFtZSwgcHJvamVjdE93bmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoJ0F1dGhlbnRpemF0aW9uIGZhaWwnKTtcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdE5hbWUgPT0gSEVMUF9ERVNLKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2hhdEdyb3VwKHByb2plY3ROYW1lICsgJy0nICsgc2VsZi51c2VybmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3ROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5jb252ZXIuaWQpIHNvY2tldC5lbWl0KCdvZmYtcHJvamVjdCcsIHsgaWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkLCB1c2VybmFtZTogc2VsZi51c2VyLnVzZXJuYW1lIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TGlzdFVzZXIocHJvamVjdE5hbWUsIHByb2plY3RPd25lciwgZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5saXN0VXNlciA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5saXN0VXNlci5sZW5ndGggPj0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2hhdEdyb3VwKHByb2plY3ROYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvd0hlbHBEZXNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubGlzdFVzZXIgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dIZWxwRGVzayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5wcm9qZWN0TmFtZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuY29udmVyLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdCgnb2ZmLXByb2plY3QnLCB7IGlkQ29udmVyc2F0aW9uOiBzZWxmLmNvbnZlci5pZCwgdXNlcm5hbWU6IHNlbGYudXNlci51c2VybmFtZSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93Q2hhdEdyb3VwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ3JvdXBOYW1lID09IEhFTFBfREVTSyB8fCBzZWxmLmxpc3RVc2VyLmxlbmd0aCA+PSAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kcmFnZ2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKFwiLmNoYXQtbW9kdWxlXCIpLmRyYWdnYWJsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5tb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3YXBDaGF0TW9kdWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm1vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbk1vdXNlRG93biA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHN3YXBDaGF0TW9kdWxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN3YXBDaGF0TW9kdWxlKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNtcyA9ICQoJ2NoYXQtbW9kdWxlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJGVsZW1lbnQuaXMoJChjbXNbMF0pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5pbnNlcnRBZnRlcigkKGNtc1sxXSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVDaGF0RnJhbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5ncm91cE5hbWUgPT0gSEVMUF9ERVNLKSBzZWxmLnNob3dIZWxwRGVzayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93Q2hhdEZyYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZ3JvdXBOYW1lID09IEhFTFBfREVTSykgcmV0dXJuIHNlbGYuc2hvd0hlbHBEZXNrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2hvd0NoYXRHcm91cDtcclxuICAgICAgICB9XHJcbn07XHJcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiXFxyXFxuLyoqKiBQQU5FTCBwcmltYXJ5ICoqKi9cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYSxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpmb2N1cyB7XFxyXFxuICAgIGNvbG9yOiAjZmZmO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IC5vcGVuID4gYSxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IC5vcGVuID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IC5vcGVuID4gYTpmb2N1cyxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpmb2N1cyB7XFxyXFxuXFx0Y29sb3I6ICNmZmY7XFxyXFxuXFx0YmFja2dyb3VuZC1jb2xvcjogIzMwNzFhOTtcXHJcXG5cXHRib3JkZXItY29sb3I6IHRyYW5zcGFyZW50O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmFjdGl2ZSA+IGEsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5hY3RpdmUgPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuYWN0aXZlID4gYTpmb2N1cyB7XFxyXFxuXFx0Y29sb3I6ICM0MjhiY2E7XFxyXFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG5cXHRib3JkZXItY29sb3I6ICM0MjhiY2E7XFxyXFxuXFx0Ym9yZGVyLWJvdHRvbS1jb2xvcjogdHJhbnNwYXJlbnQ7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDI4YmNhO1xcclxcbiAgICBib3JkZXItY29sb3I6ICMzMDcxYTk7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiBsaSA+IGEge1xcclxcbiAgICBjb2xvcjogI2ZmZjsgICBcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IGxpID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gbGkgPiBhOmZvY3VzIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzMwNzFhOTtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUgPiBhLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZSA+IGE6Zm9jdXMge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNGE5ZmU5O1xcclxcbn1cXHJcXG4vKioqIFBBTkVMIHN1Y2Nlc3MgKioqL1xcclxcbmNoYXQtbW9kdWxlIC5wYW5lbC1zdWNjZXNzIHtcXHJcXG4gICAgYm9yZGVyLWNvbG9yOiAjM2M3NjNkO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAucGFuZWwtc3VjY2Vzcz4ucGFuZWwtaGVhZGluZyB7XFxyXFxuICAgIGNvbG9yOiAjM2M3NjNkO1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2M3NjNkO1xcclxcbiAgICBib3JkZXItY29sb3I6ICMzYzc2M2Q7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkgPiBhLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkgPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkgPiBhOmZvY3VzIHtcXHJcXG4gICAgY29sb3I6ICNmZmY7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gLm9wZW4gPiBhLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gLm9wZW4gPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gLm9wZW4gPiBhOmZvY3VzLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkgPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkgPiBhOmZvY3VzIHtcXHJcXG5cXHRjb2xvcjogI2ZmZjtcXHJcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjM2M3NjNkO1xcclxcblxcdGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkuYWN0aXZlID4gYSxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1zdWNjZXNzIC5uYXYtdGFicyA+IGxpLmFjdGl2ZSA+IGE6aG92ZXIsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtc3VjY2VzcyAubmF2LXRhYnMgPiBsaS5hY3RpdmUgPiBhOmZvY3VzIHtcXHJcXG5cXHRjb2xvcjogIzNjNzYzZDtcXHJcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcclxcblxcdGJvcmRlci1jb2xvcjogIzNjNzYzZDtcXHJcXG5cXHRib3JkZXItYm90dG9tLWNvbG9yOiB0cmFuc3BhcmVudDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtc3VjY2VzcyAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSB7XFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYzc2M2Q7XFxyXFxuICAgIGJvcmRlci1jb2xvcjogIzNjNzYzZDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtc3VjY2VzcyAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IGxpID4gYSB7XFxyXFxuICAgIGNvbG9yOiAjZmZmOyAgIFxcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1zdWNjZXNzIC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gbGkgPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiBsaSA+IGE6Zm9jdXMge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2M3NjNkO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1zdWNjZXNzIC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZSA+IGEsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtc3VjY2VzcyAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUgPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXN1Y2Nlc3MgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlID4gYTpmb2N1cyB7XFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYzc2M2Q7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5uYXY+bGk+YSB7XFxyXFxuICAgIHBhZGRpbmc6IDVweCA4cHg7XFxyXFxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAucGFuZWwtaGVhZGluZyB7XFxyXFxuICAgIHBhZGRpbmc6IDBweDtcXHJcXG4gICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLnBhbmVsLWJvZHkge1xcclxcbiAgICBwYWRkaW5nOiAwcHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC50YWItcGFuZSB7XFxyXFxuICAgIC8qIGhlaWdodDogMTAwJTsgKi9cXHJcXG59XFxyXFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cXHJcXG5cXHJcXG5jaGF0LW1vZHVsZSAuY2hhdC1tb2R1bGUge1xcclxcbiAgICBmb250LXNpemU6IDEycHg7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgYm90dG9tOiAtMTlweDtcXHJcXG4gICAgcmlnaHQ6IDBweDtcXHJcXG59XFxyXFxuXFxyXFxuY2hhdC1tb2R1bGUgI2NoYXQtZnJhbWUge1xcclxcbiAgICB3aWR0aDogMTAwJTtcXHJcXG4gICAgLyogaGVpZ2h0OiAzNTBweDsgKi9cXHJcXG4gICAgYmFja2dyb3VuZDogI2ZmZjtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLmNvbmZpZyB7XFxyXFxuICAgIGNvbG9yOiAjZmZmO1xcclxcbiAgICBwYWRkaW5nOiA1cHggNnB4O1xcclxcbiAgICBmb250LXNpemU6IDE0cHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5saXN0LW1lc3NhZ2Uge1xcclxcbiAgICBwYWRkaW5nOiAxMHB4O1xcclxcbiAgICBvdmVyZmxvdy15OiBvdmVybGF5O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAubWVzc2FnZSB7XFxyXFxuICAgIHdpZHRoOiA4MCU7XFxyXFxuICAgIHdvcmQtYnJlYWs6IGtlZXAtYWxsO1xcclxcbiAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC50ZXh0LW1lc3NhZ2Uge1xcclxcbiAgICBib3JkZXI6IDFweCBzb2xpZCBncmVlbjtcXHJcXG4gICAgLyogaGVpZ2h0OiAxMDAlOyAqL1xcclxcbiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcclxcbiAgICBwYWRkaW5nLXJpZ2h0OiA0MHB4O1xcclxcbiAgICBtaW4taGVpZ2h0OjQwcHg7XFxyXFxuICAgIC8qIGhlaWdodDogNTBweDsgKi9cXHJcXG4gICAgLyogcGFkZGluZzogMHB4OyAqL1xcclxcbn1cXHJcXG5cXHJcXG5jaGF0LW1vZHVsZSBzcGFuIHtcXHJcXG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xcclxcbn1cXHJcXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXFxyXFxuY2hhdC1tb2R1bGUgLm9ubGluZSB7XFxyXFxuICAgIG1hcmdpbjogOHB4O1xcclxcbiAgICBmb250LXNpemU6IDE1cHg7XFxyXFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxyXFxuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcXHJcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5mYS5mYS1jaXJjbGUge1xcclxcbiAgICBmb250LXNpemU6IDVweDtcXHJcXG4gICAgbWFyZ2luOiA1cHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5jdXJzb3ItcG9pbnRlciB7XFxyXFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLmN1cnNvci1tb3ZlIHtcXHJcXG4gICAgY3Vyc29yOiBtb3ZlO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAucm93IHtcXHJcXG4gICAgbWFyZ2luOiAwcHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIGxpIHtcXHJcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXHJcXG59XFxyXFxuLyogd2lkdGggKi9cXHJcXG5jaGF0LW1vZHVsZSA6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXHJcXG4gICAgd2lkdGg6IDVweDtcXHJcXG59XFxyXFxuXFxyXFxuLyogVHJhY2sgKi9cXHJcXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcXHJcXG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDFweCByZ2IoMjAyLCAyMDIsIDIwMik7IFxcclxcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxyXFxufVxcclxcbiBcXHJcXG4vKiBIYW5kbGUgKi9cXHJcXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcXHJcXG4gICAgYmFja2dyb3VuZDogcmdiKDIwNywgMjA3LCAyMDcpOyBcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogMTBweDtcXHJcXG59XCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0ge307XG5cbnZhclx0bWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbztcblxuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIG1lbW87XG5cdH07XG59O1xuXG52YXIgaXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xuXHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcblx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG59KTtcblxudmFyIGdldFRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcbn07XG5cbnZhciBnZXRFbGVtZW50ID0gKGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbyA9IHt9O1xuXG5cdHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBwYXNzaW5nIGZ1bmN0aW9uIGluIG9wdGlvbnMsIHRoZW4gdXNlIGl0IGZvciByZXNvbHZlIFwiaGVhZFwiIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gVXNlZnVsIGZvciBTaGFkb3cgUm9vdCBzdHlsZSBpLmVcbiAgICAgICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAgICAgLy8gICBpbnNlcnRJbnRvOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvb1wiKS5zaGFkb3dSb290IH1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdHZhciBzdHlsZVRhcmdldCA9IGdldFRhcmdldC5jYWxsKHRoaXMsIHRhcmdldCk7XG5cdFx0XHQvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXHRcdFx0aWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG5cdFx0XHRcdFx0Ly8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuXHRcdH1cblx0XHRyZXR1cm4gbWVtb1t0YXJnZXRdXG5cdH07XG59KSgpO1xuXG52YXIgc2luZ2xldG9uID0gbnVsbDtcbnZhclx0c2luZ2xldG9uQ291bnRlciA9IDA7XG52YXJcdHN0eWxlc0luc2VydGVkQXRUb3AgPSBbXTtcblxudmFyXHRmaXhVcmxzID0gcmVxdWlyZShcIi4vdXJsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0LCBvcHRpb25zKSB7XG5cdGlmICh0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3R5bGUtbG9hZGVyIGNhbm5vdCBiZSB1c2VkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIik7XG5cdH1cblxuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09IFwiYm9vbGVhblwiKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuICAgICAgICBpZiAoIW9wdGlvbnMuaW5zZXJ0SW50bykgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKCFvcHRpb25zLmluc2VydEF0KSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZSAobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSBkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20gKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzIChsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblxuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKSBzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2UgbmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50IChvcHRpb25zLCBzdHlsZSkge1xuXHR2YXIgdGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cblx0aWYgKCF0YXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlc0luc2VydGVkQXRUb3Bbc3R5bGVzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIHRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYgKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdFx0fVxuXHRcdHN0eWxlc0luc2VydGVkQXRUb3AucHVzaChzdHlsZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwib2JqZWN0XCIgJiYgb3B0aW9ucy5pbnNlcnRBdC5iZWZvcmUpIHtcblx0XHR2YXIgbmV4dFNpYmxpbmcgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50byArIFwiIFwiICsgb3B0aW9ucy5pbnNlcnRBdC5iZWZvcmUpO1xuXHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIG5leHRTaWJsaW5nKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbU3R5bGUgTG9hZGVyXVxcblxcbiBJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0JyAoJ29wdGlvbnMuaW5zZXJ0QXQnKSBmb3VuZC5cXG4gTXVzdCBiZSAndG9wJywgJ2JvdHRvbScsIG9yIE9iamVjdC5cXG4gKGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyI2luc2VydGF0KVxcblwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQgKHN0eWxlKSB7XG5cdGlmIChzdHlsZS5wYXJlbnROb2RlID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG5cdHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xuXG5cdHZhciBpZHggPSBzdHlsZXNJbnNlcnRlZEF0VG9wLmluZGV4T2Yoc3R5bGUpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlc0luc2VydGVkQXRUb3Auc3BsaWNlKGlkeCwgMSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGVFbGVtZW50IChvcHRpb25zKSB7XG5cdHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblxuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cblx0YWRkQXR0cnMoc3R5bGUsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGUpO1xuXG5cdHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblxuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cdG9wdGlvbnMuYXR0cnMucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cblx0YWRkQXR0cnMobGluaywgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBsaW5rKTtcblxuXHRyZXR1cm4gbGluaztcbn1cblxuZnVuY3Rpb24gYWRkQXR0cnMgKGVsLCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBhZGRTdHlsZSAob2JqLCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZSwgdXBkYXRlLCByZW1vdmUsIHJlc3VsdDtcblxuXHQvLyBJZiBhIHRyYW5zZm9ybSBmdW5jdGlvbiB3YXMgZGVmaW5lZCwgcnVuIGl0IG9uIHRoZSBjc3Ncblx0aWYgKG9wdGlvbnMudHJhbnNmb3JtICYmIG9iai5jc3MpIHtcblx0ICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtKG9iai5jc3MpO1xuXG5cdCAgICBpZiAocmVzdWx0KSB7XG5cdCAgICBcdC8vIElmIHRyYW5zZm9ybSByZXR1cm5zIGEgdmFsdWUsIHVzZSB0aGF0IGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgcnVubmluZyBydW50aW1lIHRyYW5zZm9ybWF0aW9ucyBvbiB0aGUgY3NzLlxuXHQgICAgXHRvYmouY3NzID0gcmVzdWx0O1xuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gSWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiByZXR1cm5zIGEgZmFsc3kgdmFsdWUsIGRvbid0IGFkZCB0aGlzIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXG5cdFx0c3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XG5cblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIHRydWUpO1xuXG5cdH0gZWxzZSBpZiAoXG5cdFx0b2JqLnNvdXJjZU1hcCAmJlxuXHRcdHR5cGVvZiBVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIEJsb2IgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCJcblx0KSB7XG5cdFx0c3R5bGUgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSB1cGRhdGVMaW5rLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG5cblx0XHRcdGlmKHN0eWxlLmhyZWYpIFVSTC5yZXZva2VPYmplY3RVUkwoc3R5bGUuaHJlZik7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRzdHlsZSA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG5cdFx0fTtcblx0fVxuXG5cdHVwZGF0ZShvYmopO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZSAobmV3T2JqKSB7XG5cdFx0aWYgKG5ld09iaikge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRuZXdPYmouY3NzID09PSBvYmouY3NzICYmXG5cdFx0XHRcdG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmXG5cdFx0XHRcdG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXBcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblxuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXHR9O1xufSkoKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyAoc3R5bGUsIGluZGV4LCByZW1vdmUsIG9iaikge1xuXHR2YXIgY3NzID0gcmVtb3ZlID8gXCJcIiA6IG9iai5jc3M7XG5cblx0aWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZS5jaGlsZE5vZGVzO1xuXG5cdFx0aWYgKGNoaWxkTm9kZXNbaW5kZXhdKSBzdHlsZS5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cblx0XHRpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcblx0XHRcdHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnIChzdHlsZSwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZS5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLCBtZWRpYSlcblx0fVxuXG5cdGlmKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGUuZmlyc3RDaGlsZCkge1xuXHRcdFx0c3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXG5cdFx0c3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTGluayAobGluaywgb3B0aW9ucywgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuXHQvKlxuXHRcdElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRcdGFuZCB0aGVyZSBpcyBubyBwdWJsaWNQYXRoIGRlZmluZWQgdGhlbiBsZXRzIHR1cm4gY29udmVydFRvQWJzb2x1dGVVcmxzXG5cdFx0b24gYnkgZGVmYXVsdC4gIE90aGVyd2lzZSBkZWZhdWx0IHRvIHRoZSBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgb3B0aW9uXG5cdFx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKSB7XG5cdFx0Y3NzID0gZml4VXJscyhjc3MpO1xuXHR9XG5cblx0aWYgKHNvdXJjZU1hcCkge1xuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2NjAzODc1XG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xuXHR9XG5cblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XG5cblx0dmFyIG9sZFNyYyA9IGxpbmsuaHJlZjtcblxuXHRsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYykgVVJMLnJldm9rZU9iamVjdFVSTChvbGRTcmMpO1xufVxuIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC98XFxzKiQpL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG4iLCJjb25zdCBtb2R1bGVOYW1lID0gJ2FwaVNlcnZpY2VNb2R1bGUnO1xyXG5jb25zdCBzZXJ2aWNlTmFtZSA9ICdhcGlTZXJ2aWNlJztcclxuY29uc3QgR0VUX0xJU1RfVVNFUl9PRl9QUk9KRUNUID0gJ2h0dHA6Ly9sb2dpbi5zZmxvdy5tZS91c2VyL2xpc3QnO1xyXG5jb25zdCB3aU1lc3NlbmdlclVybCA9ICdodHRwOi8vNTQuMTY5LjE0OS4yMDY6NTAwMSc7XHJcblxyXG5jb25zdCBHRVRfQ09OVkVSU0FUSU9OID0gd2lNZXNzZW5nZXJVcmwgKyAnL2FwaS9jb252ZXJzYXRpb24nO1xyXG5jb25zdCBQT1NUX01FU1NBR0UgPSB3aU1lc3NlbmdlclVybCArICcvYXBpL21lc3NhZ2UvbmV3JztcclxuY29uc3QgVVBMT0FEID0gd2lNZXNzZW5nZXJVcmwgKyAnL2FwaS91cGxvYWQnO1xyXG5jb25zdCBHRVRfVVNFUiA9IHdpTWVzc2VuZ2VyVXJsICsgJy9nZXRVc2VyJztcclxuYW5ndWxhci5tb2R1bGUobW9kdWxlTmFtZSwgW10pLnNlcnZpY2Uoc2VydmljZU5hbWUsIGZ1bmN0aW9uICgkaHR0cCwgVXBsb2FkKSB7XHJcbiAgICBcclxuICAgIGxldCBkb1Bvc3QgPSBmdW5jdGlvbihVUkwsIHRva2VuLCBkYXRhLCBjYikge1xyXG4gICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIHVybDogVVJMLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IHRva2VuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuY29kZSAhPSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlLmRhdGEucmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICBjYigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjYihyZXNwb25zZS5kYXRhLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmKHRvYXN0cikgdG9hc3RyLmVycm9yKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5nZXRDb252ZXIgPSAoZGF0YSwgdG9rZW4sIGNiKSA9PiB7XHJcbiAgICAgICAgZG9Qb3N0KEdFVF9DT05WRVJTQVRJT04sIHRva2VuLCBkYXRhLCBjYik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmdldFVzZXIgPSAoZGF0YSwgdG9rZW4sIGNiKSA9PiB7XHJcbiAgICAgICAgZG9Qb3N0KEdFVF9VU0VSLCB0b2tlbiwgZGF0YSwgY2IpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wb3N0TWVzc2FnZSA9IChkYXRhLCB0b2tlbiwgY2IpID0+IHtcclxuICAgICAgICBkb1Bvc3QoUE9TVF9NRVNTQUdFLCB0b2tlbiwgZGF0YSwgY2IpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5nZXRMaXN0VXNlck9mUHJvamVjdCA9IChkYXRhLCB0b2tlbiwgY2IpID0+IHtcclxuICAgICAgICBkb1Bvc3QoR0VUX0xJU1RfVVNFUl9PRl9QUk9KRUNULCB0b2tlbiwgZGF0YSwgY2IpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGxvYWQgPSAoZGF0YSwgdG9rZW4sIGNiKSA9PiB7XHJcbiAgICAgICAgVXBsb2FkLnVwbG9hZCh7XHJcbiAgICAgICAgICAgIHVybDogVVBMT0FELFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IHRva2VuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbGU6IGRhdGEuZmlsZSxcclxuICAgICAgICAgICAgZmllbGRzOiBkYXRhLmZpZWxkc1xyXG4gICAgICAgIH0pLnRoZW4oXHJcbiAgICAgICAgICAgIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuY29kZSAhPSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlLmRhdGEucmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICBjYigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjYihyZXNwb25zZS5kYXRhLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVybCA9IHdpTWVzc2VuZ2VyVXJsO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cy5uYW1lID0gbW9kdWxlTmFtZTsiXSwic291cmNlUm9vdCI6IiJ9
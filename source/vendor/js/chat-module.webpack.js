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

module.exports = "<div style=\"height:{{chatGroup.listMessageHeight}}px\" class=\"list-message\" ngf-drop=\"chatGroup.upload($files)\" class=\"drop-box\"\r\n    ngf-drag-over-class=\"'dragover'\" ngf-multiple=\"true\">\r\n    <div class=\"row\" ng-repeat=\"message in chatGroup.conver.Messages | orderBy : 'createdAt' track by $index\">\r\n        <div ng-if=\"message.User.username!=chatGroup.user.username\" class=\"row\" style=\"color: gray; text-align: center\">---{{message.createdAt}}---</div>\r\n        <div ng-if=\"message.User.username!=chatGroup.user.username\" style=\"width: 70%; float: left;margin-bottom: 2px\">\r\n            <p style=\"font-weight: bold; margin-top: 3px; margin-bottom: 3px\">{{message.User.username}}</p>\r\n            <div ng-if=\"message.type!='image'\" style=\"background: #e6e6e6; border-radius: 10px; display: inline-block; padding: 6px 8px ;max-width: 100%\">\r\n                <p class=\"message\" ng-bind-html=\"message.content\" style=\" display: inline;\" ng-if=\"message.type=='text'\">\r\n                </p>\r\n                <p class=\"message\" style=\" display: inline;\" ng-if=\"message.type=='file'\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <i class=\"glyphicon glyphicon-circle-arrow-down\"></i>\r\n                        {{chatGroup.fileName(message.content)}}\r\n                    </a>\r\n                </p>\r\n            </div>\r\n            <div ng-if=\"message.type=='image'\" style=\" display: inline-block;max-width: 100%\">\r\n                <p class=\"message\" style=\" display: inline;\" >\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <img src=\"{{message.content}}\" style=\"max-width: 60%; max-height: 40%;;border: 1px solid #ddd;border-radius: 4px;\">\r\n                    </a>\r\n                </p>\r\n            </div>\r\n        </div>\r\n        <div ng-if=\"message.User.username==chatGroup.user.username\" style=\"width: 70%; float: right;margin-bottom: 2px\">\r\n            <div ng-if=\"message.type!='image'\" style=\"background: #428bca; border-radius: 10px; float: right; display: inline-block;padding: 6px 8px;max-width: 100%\">\r\n                <p class=\"message\" ng-bind-html=\"message.content\" style=\"color: #fff;display: inline; \" ng-if=\"message.type=='text'\">\r\n                </p>\r\n                <p class=\"message\" style=\" display: inline;\" ng-if=\"message.type=='file'\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\" style=\"color: #fff\">\r\n                        <i class=\"glyphicon glyphicon-circle-arrow-down\"></i>\r\n                        {{chatGroup.fileName(message.content)}}\r\n                    </a>\r\n                </p>\r\n            </div>\r\n            <div ng-if=\"message.type=='image'\" style=\" float: right; display: inline-block;padding: 6px 8px;max-width: 100%\">\r\n                <p class=\"message\" style=\" display: inline;\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <img src=\"{{message.content}}\" style=\"max-width: 70%; max-height: 40%;border: 1px solid #ddd;border-radius: 4px;\">\r\n                    </a>\r\n                </p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div style=\"position:relative;\">\r\n    <textarea class=\"text-message\" rows=\"2\"></textarea>\r\n    <div style=\"position: absolute;bottom: 5px;right: 5px;\">\r\n        <span class=\"glyphicon glyphicon-picture cursor-pointer\" ngf-select=\"chatGroup.upload($files)\" multiple=\"multiple\" ngf-accept=\"'image/*'\"></span>\r\n        <span class=\"glyphicon glyphicon-paperclip cursor-pointer\" ngf-select=\"chatGroup.upload($files)\" multiple=\"multiple\"></span>\r\n    </div>  \r\n</div>";

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
                        createdAt: new Date()
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
                        fields: {'name': self.conver.name}
                }, self.token, (res) => {
                        let message = {
                                content: res,
                                type: type=='image'?'image':'file',
                                idSender: self.user.id,
                                idConversation: self.conver.id,
                                User: self.user,
                                createdAt: new Date()
                        }
                        // socket.emit('sendMessage', message);
                        apiService.postMessage(message, self.token, (res) => {
                                _done();
                        });
                })
        }, (err) => {

        });
    }
    this.download = function(path) {
        let p = path.slice(25);
        return 'http://13.251.24.65:5000/api/download/'+p+'?token='+self.token;
    }
    this.fileName = function(path) {
        return path.substring(59+self.conver.name.length, path.length);
    }
    socket.on('sendMessage', function (data) {
        self.conver.Messages = self.conver.Messages?self.conver.Messages:[];
        self.conver.Messages.push(data);

        $timeout(function(){
            listMessage.scrollTop(listMessage[0].scrollHeight);
        }, 600);
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
        token: "<"
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

module.exports = "<ul style=\"overflow-y: overlay; height: 100%; padding: 0px 8px;\">\r\n    <li class=\"online\" ng-repeat=\"user in listUser.listUser\">\r\n        <i class=\"fa fa-circle\" ng-style=\"listUser.active(user)\"></i>\r\n        <span class=\"user\">{{user.username}}</span>\r\n    </li>\r\n</ul>";

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
    
    this.active = function(user) {
        return user.active;
    }
    
    socket.on('send-members-online', function(data) {
        $timeout(function(){
            for(x of data) {
                console.log(x);
                self.listUser.filter(function(user) {return user.username == x})[0].active = {
                    "color": "blue"
                };
            }
        })
    })
    socket.on('disconnected', function(data) {
        $timeout(function() {
            self.listUser.filter(function(user) {return user.username == data})[0].active = {
                "color": ""
            };
        })
    })
    socket.on('off-project', function(data) {
        $timeout(function() {
            self.listUser.filter(function(user) {return user.username == data.username})[0].active = {
                "color": ""
            };
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

module.exports = "<script>\r\n    var socket = io('http://13.251.24.65:5000');\r\n    // var socket = io('http://localhost:5000');\r\n</script>\r\n<div id=\"chat-module\">\r\n    <i id=\"icon\" class=\"fa fa-comments cursor-pointer\" ng-show=\"!cm.show\" ng-mouseup=\"cm.showChat()\">\r\n    </i>\r\n    <div id=\"chat-frame\" ng-show=\"cm.show\">\r\n        <div class=\"panel with-nav-tabs panel-primary\">\r\n            <div class=\"panel-heading\" id=\"title-bar\">\r\n                <ul class=\"nav nav-tabs\">\r\n                    <li class=\"active tab-chat\" id=\"pill-chat\" style=\"max-width: 100px\" ng-show=\"cm.showChatGroup\">\r\n                        <a href=\"#tab-chat\" data-toggle=\"tab\" style=\"white-space: nowrap;overflow-x: hidden;text-overflow: ellipsis;\">\r\n                            {{cm.chatGroupName}}\r\n                        </a>\r\n                    </li>\r\n                    <li id=\"pill-active\" ng-click=\"cm.refreshActive()\" ng-show=\"cm.showChatGroup\" class=\"members\">\r\n                        <a href=\"#tab-members\" data-toggle=\"tab\">Members</a>\r\n                    </li>\r\n                    <!-- <li id=\"pill-active\" ng-click=\"cm.refreshActive()\" class=\"HelpDesk\">\r\n                        <a href=\"#tab-helpdesk\" data-toggle=\"tab\">HelpDesk</a>\r\n                    </li> -->\r\n                    <li style=\"float: right\" class=\"cursor-pointer\" ng-click=\"cm.show=false\">\r\n                        <i class=\"fa fa-minus config\"></i>\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n            <div class=\"panel-body\">\r\n                <div class=\"tab-content\">\r\n                    <div class=\"tab-pane fade in active\" id=\"tab-chat\"  ng-show=\"cm.showChatGroup\">\r\n                        <chat-group conver=\"cm.conver\" user=\"cm.user\" token=\"cm.token\"></chat-group>\r\n                    </div>\r\n                    <div class=\"tab-pane fade\" id=\"tab-members\" ng-show=\"cm.showChatGroup\">\r\n                        <list-user list-user=\"cm.listUser\" user=\"cm.user\" id-conversation=\"cm.conver.id\" token=\"cm.token\"></list-user>\r\n                    </div>\r\n                    <!-- <div class=\"tab-pane fade height-100\" id=\"tab-helpdesk\">\r\n                        <help-desk></help-desk>\r\n                    </div> -->\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

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
                bindings : {
                        
                }
        });
function Controller(apiService, $timeout, $element) {
        let self = this;
        this.show = false;
        this.projectName = '';
        this.conver = {};
        this.token = '';
        
        function getListUser(projectName, projectOwner, cb) {
                apiService.getListUserOfProject({
                        project_name: projectName,
                        owner: projectOwner
                }, self.token, (res) => {
                        cb(res);
                })
        }
        function getChatGroup(projectName) {
                apiService.getConver({
                        name: projectName
                }, self.token, (res) => {
                if(res) {
                        self.conver = res.conver;
                        self.chatGroupName = res.conver.name;
                        self.user = res.user;
                        socket.emit('join-room', {username: self.user.username, idConversation: self.conver.id});
                }
                else
                        self.conver = {};
                })
        }
        
        this.initChat = function(token, projectName, projectOwner) {
                if(!token)
                        toastr.error('Authentization fail');
                else {
                        self.token = token;
                        if(projectName) {
                                if(self.projectName != projectName) {
                                        if(self.conver.id) socket.emit('off-project', {idConversation: self.conver.id, username: self.user.username});
                                        getListUser(projectName, projectOwner, function(res) {
                                                if(res) {
                                                        self.listUser = res;
                                                        if(self.listUser.length >= 2) {
                                                                self.showChatGroup = true;
                                                                getChatGroup(projectName);
                                                        } 
                                                        else {
                                                                self.showChatGroup = false;
                                                                self.show = false;
                                                        }
                                                }else {
                                                        self.listUser = [];
                                                        self.show = false;
                                                }
                                        });
                                }
                        } else {
                                self.projectName = '';
                                if(self.conver.id)
                                        socket.emit('off-project', {idConversation: self.conver.id, username: self.user.username});
                                self.showChatGroup = false;
                        }
                }
                
        }
        this.closeChat = function() {
                socket.emit('off-project', {idConversation: self.conver.id, username: self.user.username});
                self.show = false;
        }
        this.showChat = function() {
                if(self.showChatGroup)
                        self.show=self.moving?false:true;
                else
                        console.error('No shared-project is opening')
        }
        dragChatModule(self);
        window.CHAT_MODULE = self;
        
};
function dragChatModule(cm) {
        let selected = null, x_pos = 0, y_pos = 0, x_elem = 0, y_elem = 0, x_old=0, y_old=0;
        function _drag_init(elem) {
                selected = elem;
                x_old = selected.offsetLeft;
                y_old = selected.offsetTop;
                x_elem = x_pos - selected.offsetLeft;
                y_elem = y_pos - selected.offsetTop;
        }
        function _move_elem(e) {
                x_pos = document.all ? window.event.clientX : e.pageX;
                y_pos = document.all ? window.event.clientY : e.pageY;
                if (selected !== null) {
                        if(x_old!=selected.offsetLeft || y_old!=selected.offsetTop)
                                cm.moving = true;
                        selected.style.left = (x_pos - x_elem) + 'px';
                        selected.style.top = (y_pos - y_elem) + 'px';
                }
        }
        function _destroy(evt) {
                selected = null;
                cm.moving = false;
        }
        $('#title-bar')[0].onmousedown = function (evt) {
                _drag_init($('#chat-module')[0]);
                return false;
        };
        $('#icon')[0].onmousedown = function (evt) {
                _drag_init($('#chat-module')[0]);
                return false;
        };
        document.onmousemove = _move_elem;
        document.onmouseup = _destroy;
}

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
exports.push([module.i, "\r\n/*** PANEL PRIMARY ***/\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:focus {\r\n    color: #fff;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > .open > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > .open > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > .open > a:focus,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li > a:focus {\r\n\tcolor: #fff;\r\n\tbackground-color: #3071a9;\r\n\tborder-color: transparent;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.active > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.active > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.active > a:focus {\r\n\tcolor: #428bca;\r\n\tbackground-color: #fff;\r\n\tborder-color: #428bca;\r\n\tborder-bottom-color: transparent;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu {\r\n    background-color: #428bca;\r\n    border-color: #3071a9;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > li > a {\r\n    color: #fff;   \r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > li > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > li > a:focus {\r\n    background-color: #3071a9;\r\n}\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > .active > a,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > .active > a:hover,\r\nchat-module .with-nav-tabs.panel-primary .nav-tabs > li.dropdown .dropdown-menu > .active > a:focus {\r\n    background-color: #4a9fe9;\r\n}\r\nchat-module .nav>li>a {\r\n    padding: 5px 8px;\r\n    font-weight: bold;\r\n}\r\nchat-module .panel-heading {\r\n    padding: 0px;\r\n    border-bottom: none;\r\n}\r\nchat-module .panel-body {\r\n    padding: 0px;\r\n}\r\nchat-module .tab-pane {\r\n    /* height: 100%; */\r\n}\r\n/***************************************************************************************************/\r\n\r\nchat-module #chat-module {\r\n    font-size: 12px;\r\n    position: absolute;\r\n    z-index: 100;\r\n    top: 26px;\r\n    right: 5px;\r\n}\r\n\r\nchat-module #icon {\r\n    color: #428bca;\r\n    font-size: 50px;\r\n}\r\nchat-module #chat-frame {\r\n    width: 320px;\r\n    /* height: 350px; */\r\n    background: #fff;\r\n}\r\nchat-module .config {\r\n    color: #fff;\r\n    padding: 5px 6px;\r\n    font-size: 14px;\r\n}\r\nchat-module .list-message {\r\n    padding: 10px;\r\n    overflow-y: overlay;\r\n}\r\nchat-module .message {\r\n    width: 80%;\r\n    word-break: keep-all;\r\n    word-wrap: break-word;\r\n}\r\nchat-module .text-message {\r\n    border: 1px solid green;\r\n    /* height: 100%; */\r\n    width: 100% !important;\r\n    padding-right: 40px;\r\n    min-height:40px;\r\n    /* height: 50px; */\r\n    /* padding: 0px; */\r\n}\r\n\r\nchat-module span {\r\n    margin-right: 10px;\r\n}\r\n/***********************************/\r\nchat-module .online {\r\n    margin: 8px;\r\n    font-size: 15px;\r\n    white-space: nowrap;\r\n    overflow-x: hidden;\r\n    text-overflow: ellipsis;\r\n}\r\nchat-module .fa.fa-circle {\r\n    font-size: 10px;\r\n    margin: 5px;\r\n}\r\nchat-module .cursor-pointer {\r\n    cursor: pointer;\r\n}\r\nchat-module .cursor-move {\r\n    cursor: move;\r\n}\r\nchat-module .row {\r\n    margin: 0px;\r\n}\r\nchat-module li {\r\n    list-style: none;\r\n}\r\n/* width */\r\nchat-module ::-webkit-scrollbar {\r\n    width: 5px;\r\n}\r\n\r\n/* Track */\r\n::-webkit-scrollbar-track {\r\n    box-shadow: inset 0 0 1px rgb(202, 202, 202); \r\n    border-radius: 2px;\r\n}\r\n \r\n/* Handle */\r\n::-webkit-scrollbar-thumb {\r\n    background: rgb(207, 207, 207); \r\n    border-radius: 10px;\r\n}", ""]);

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
const wiMessengerUrl = 'http://13.251.24.65:5000/api';
// const wiMessengerUrl = 'http://localhost:5000/api';

const GET_CONVERSATION = wiMessengerUrl + '/conversation';
const POST_MESSAGE = wiMessengerUrl + '/message/new';
const UPLOAD = wiMessengerUrl + '/upload';
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
    this.postMessage = (data, token, cb) => {
        doPost(POST_MESSAGE, token, data, cb);
    }
    this.getListUserOfProject = (data, token, cb) => {
        console.log(data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmh0bWwiLCJ3ZWJwYWNrOi8vLy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmpzIiwid2VicGFjazovLy8uLi9jb21wb25lbnRzL2hlbHAtZGVzay9oZWxwLWRlc2suaHRtbCIsIndlYnBhY2s6Ly8vLi4vY29tcG9uZW50cy9oZWxwLWRlc2svaGVscC1kZXNrLmpzIiwid2VicGFjazovLy8uLi9jb21wb25lbnRzL2xpc3QtdXNlci9saXN0LXVzZXIuaHRtbCIsIndlYnBhY2s6Ly8vLi4vY29tcG9uZW50cy9saXN0LXVzZXIvbGlzdC11c2VyLmpzIiwid2VicGFjazovLy8uLi9jc3Mvc3R5bGUuY3NzPzRlNzciLCJ3ZWJwYWNrOi8vLy4uL2luZGV4Lmh0bWwiLCJ3ZWJwYWNrOi8vLy4uL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4uL3NlcnZpY2VzL2FwaS1zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNM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LGtEQUFrRCxzQkFBc0I7QUFDeEU7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FBRUEsNkJBQTZCLG1CQUFtQjs7QUFFaEQ7O0FBRUE7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsV0FBVyxFQUFFO0FBQ3JELHdDQUF3QyxXQUFXLEVBQUU7O0FBRXJEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esc0NBQXNDO0FBQ3RDLEdBQUc7QUFDSDtBQUNBLDhEQUE4RDtBQUM5RDs7QUFFQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxDQUFDO0FBQ0QsaUMiLCJmaWxlIjoiY2hhdC1tb2R1bGUud2VicGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBzdHlsZT1cXFwiaGVpZ2h0Ont7Y2hhdEdyb3VwLmxpc3RNZXNzYWdlSGVpZ2h0fX1weFxcXCIgY2xhc3M9XFxcImxpc3QtbWVzc2FnZVxcXCIgbmdmLWRyb3A9XFxcImNoYXRHcm91cC51cGxvYWQoJGZpbGVzKVxcXCIgY2xhc3M9XFxcImRyb3AtYm94XFxcIlxcclxcbiAgICBuZ2YtZHJhZy1vdmVyLWNsYXNzPVxcXCInZHJhZ292ZXInXFxcIiBuZ2YtbXVsdGlwbGU9XFxcInRydWVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiIG5nLXJlcGVhdD1cXFwibWVzc2FnZSBpbiBjaGF0R3JvdXAuY29udmVyLk1lc3NhZ2VzIHwgb3JkZXJCeSA6ICdjcmVhdGVkQXQnIHRyYWNrIGJ5ICRpbmRleFxcXCI+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLlVzZXIudXNlcm5hbWUhPWNoYXRHcm91cC51c2VyLnVzZXJuYW1lXFxcIiBjbGFzcz1cXFwicm93XFxcIiBzdHlsZT1cXFwiY29sb3I6IGdyYXk7IHRleHQtYWxpZ246IGNlbnRlclxcXCI+LS0te3ttZXNzYWdlLmNyZWF0ZWRBdH19LS0tPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLlVzZXIudXNlcm5hbWUhPWNoYXRHcm91cC51c2VyLnVzZXJuYW1lXFxcIiBzdHlsZT1cXFwid2lkdGg6IDcwJTsgZmxvYXQ6IGxlZnQ7bWFyZ2luLWJvdHRvbTogMnB4XFxcIj5cXHJcXG4gICAgICAgICAgICA8cCBzdHlsZT1cXFwiZm9udC13ZWlnaHQ6IGJvbGQ7IG1hcmdpbi10b3A6IDNweDsgbWFyZ2luLWJvdHRvbTogM3B4XFxcIj57e21lc3NhZ2UuVXNlci51c2VybmFtZX19PC9wPlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZSE9J2ltYWdlJ1xcXCIgc3R5bGU9XFxcImJhY2tncm91bmQ6ICNlNmU2ZTY7IGJvcmRlci1yYWRpdXM6IDEwcHg7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgcGFkZGluZzogNnB4IDhweCA7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIG5nLWJpbmQtaHRtbD1cXFwibWVzc2FnZS5jb250ZW50XFxcIiBzdHlsZT1cXFwiIGRpc3BsYXk6IGlubGluZTtcXFwiIG5nLWlmPVxcXCJtZXNzYWdlLnR5cGU9PSd0ZXh0J1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ZpbGUnXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcInt7Y2hhdEdyb3VwLmRvd25sb2FkKG1lc3NhZ2UuY29udGVudCl9fVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2lyY2xlLWFycm93LWRvd25cXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e2NoYXRHcm91cC5maWxlTmFtZShtZXNzYWdlLmNvbnRlbnQpfX1cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9wPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ltYWdlJ1xcXCIgc3R5bGU9XFxcIiBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwie3tjaGF0R3JvdXAuZG93bmxvYWQobWVzc2FnZS5jb250ZW50KX19XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3ttZXNzYWdlLmNvbnRlbnR9fVxcXCIgc3R5bGU9XFxcIm1heC13aWR0aDogNjAlOyBtYXgtaGVpZ2h0OiA0MCU7O2JvcmRlcjogMXB4IHNvbGlkICNkZGQ7Ym9yZGVyLXJhZGl1czogNHB4O1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2E+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBuZy1pZj1cXFwibWVzc2FnZS5Vc2VyLnVzZXJuYW1lPT1jaGF0R3JvdXAudXNlci51c2VybmFtZVxcXCIgc3R5bGU9XFxcIndpZHRoOiA3MCU7IGZsb2F0OiByaWdodDttYXJnaW4tYm90dG9tOiAycHhcXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZSE9J2ltYWdlJ1xcXCIgc3R5bGU9XFxcImJhY2tncm91bmQ6ICM0MjhiY2E7IGJvcmRlci1yYWRpdXM6IDEwcHg7IGZsb2F0OiByaWdodDsgZGlzcGxheTogaW5saW5lLWJsb2NrO3BhZGRpbmc6IDZweCA4cHg7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIG5nLWJpbmQtaHRtbD1cXFwibWVzc2FnZS5jb250ZW50XFxcIiBzdHlsZT1cXFwiY29sb3I6ICNmZmY7ZGlzcGxheTogaW5saW5lOyBcXFwiIG5nLWlmPVxcXCJtZXNzYWdlLnR5cGU9PSd0ZXh0J1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ZpbGUnXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcInt7Y2hhdEdyb3VwLmRvd25sb2FkKG1lc3NhZ2UuY29udGVudCl9fVxcXCIgc3R5bGU9XFxcImNvbG9yOiAjZmZmXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaXJjbGUtYXJyb3ctZG93blxcXCI+PC9pPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt7Y2hhdEdyb3VwLmZpbGVOYW1lKG1lc3NhZ2UuY29udGVudCl9fVxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxcclxcbiAgICAgICAgICAgICAgICA8L3A+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgPGRpdiBuZy1pZj1cXFwibWVzc2FnZS50eXBlPT0naW1hZ2UnXFxcIiBzdHlsZT1cXFwiIGZsb2F0OiByaWdodDsgZGlzcGxheTogaW5saW5lLWJsb2NrO3BhZGRpbmc6IDZweCA4cHg7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCJ7e2NoYXRHcm91cC5kb3dubG9hZChtZXNzYWdlLmNvbnRlbnQpfX1cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCJ7e21lc3NhZ2UuY29udGVudH19XFxcIiBzdHlsZT1cXFwibWF4LXdpZHRoOiA3MCU7IG1heC1oZWlnaHQ6IDQwJTtib3JkZXI6IDFweCBzb2xpZCAjZGRkO2JvcmRlci1yYWRpdXM6IDRweDtcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxcclxcbiAgICAgICAgICAgICAgICA8L3A+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9kaXY+XFxyXFxuPGRpdiBzdHlsZT1cXFwicG9zaXRpb246cmVsYXRpdmU7XFxcIj5cXHJcXG4gICAgPHRleHRhcmVhIGNsYXNzPVxcXCJ0ZXh0LW1lc3NhZ2VcXFwiIHJvd3M9XFxcIjJcXFwiPjwvdGV4dGFyZWE+XFxyXFxuICAgIDxkaXYgc3R5bGU9XFxcInBvc2l0aW9uOiBhYnNvbHV0ZTtib3R0b206IDVweDtyaWdodDogNXB4O1xcXCI+XFxyXFxuICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1waWN0dXJlIGN1cnNvci1wb2ludGVyXFxcIiBuZ2Ytc2VsZWN0PVxcXCJjaGF0R3JvdXAudXBsb2FkKCRmaWxlcylcXFwiIG11bHRpcGxlPVxcXCJtdWx0aXBsZVxcXCIgbmdmLWFjY2VwdD1cXFwiJ2ltYWdlLyonXFxcIj48L3NwYW4+XFxyXFxuICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wYXBlcmNsaXAgY3Vyc29yLXBvaW50ZXJcXFwiIG5nZi1zZWxlY3Q9XFxcImNoYXRHcm91cC51cGxvYWQoJGZpbGVzKVxcXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIj48L3NwYW4+XFxyXFxuICAgIDwvZGl2PiAgXFxyXFxuPC9kaXY+XCI7IiwiY29uc3QgY29tcG9uZW50TmFtZSA9ICdjaGF0R3JvdXAnO1xyXG5jb25zdCBtb2R1bGVOYW1lID0gJ2NoYXQtZ3JvdXAnO1xyXG5cclxuZnVuY3Rpb24gQ29udHJvbGxlcihhcGlTZXJ2aWNlLCAkdGltZW91dCwgJGVsZW1lbnQpe1xyXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5saXN0TWVzc2FnZUhlaWdodCA9IDMwMDtcclxuICAgIGxldCB0ZXh0TWVzc2FnZSA9ICRlbGVtZW50LmZpbmQoJy50ZXh0LW1lc3NhZ2UnKTtcclxuICAgIGxldCBsaXN0TWVzc2FnZSA9ICRlbGVtZW50LmZpbmQoJy5saXN0LW1lc3NhZ2UnKTtcclxuICAgIHRleHRNZXNzYWdlLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMgJiYgIWUuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gdGV4dE1lc3NhZ2UudmFsKCkuc3BsaXQoJ1xcbicpLmpvaW4oJzxici8+Jyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZFNlbmRlcjogc2VsZi51c2VyLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZENvbnZlcnNhdGlvbjogc2VsZi5jb252ZXIuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXI6IHNlbGYudXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYXBpU2VydmljZS5wb3N0TWVzc2FnZShtZXNzYWdlLCBzZWxmLnRva2VuLCBmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRleHRNZXNzYWdlLnZhbCgnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnVwbG9hZCA9IGZ1bmN0aW9uIChmaWxlcykge1xyXG4gICAgICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyhmaWxlcywgKGZpbGUsIGksIF9kb25lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IGZpbGUudHlwZS5zdWJzdHJpbmcoMCwgNSk7XHJcbiAgICAgICAgICAgICAgICBhcGlTZXJ2aWNlLnVwbG9hZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkczogeyduYW1lJzogc2VsZi5jb252ZXIubmFtZX1cclxuICAgICAgICAgICAgICAgIH0sIHNlbGYudG9rZW4sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogcmVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGU9PSdpbWFnZSc/J2ltYWdlJzonZmlsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRTZW5kZXI6IHNlbGYudXNlci5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZENvbnZlcnNhdGlvbjogc2VsZi5jb252ZXIuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXNlcjogc2VsZi51c2VyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvY2tldC5lbWl0KCdzZW5kTWVzc2FnZScsIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcGlTZXJ2aWNlLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIHNlbGYudG9rZW4sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfZG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSwgKGVycikgPT4ge1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHRoaXMuZG93bmxvYWQgPSBmdW5jdGlvbihwYXRoKSB7XHJcbiAgICAgICAgbGV0IHAgPSBwYXRoLnNsaWNlKDI1KTtcclxuICAgICAgICByZXR1cm4gJ2h0dHA6Ly8xMy4yNTEuMjQuNjU6NTAwMC9hcGkvZG93bmxvYWQvJytwKyc/dG9rZW49JytzZWxmLnRva2VuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWxlTmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuICAgICAgICByZXR1cm4gcGF0aC5zdWJzdHJpbmcoNTkrc2VsZi5jb252ZXIubmFtZS5sZW5ndGgsIHBhdGgubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIHNvY2tldC5vbignc2VuZE1lc3NhZ2UnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHNlbGYuY29udmVyLk1lc3NhZ2VzID0gc2VsZi5jb252ZXIuTWVzc2FnZXM/c2VsZi5jb252ZXIuTWVzc2FnZXM6W107XHJcbiAgICAgICAgc2VsZi5jb252ZXIuTWVzc2FnZXMucHVzaChkYXRhKTtcclxuXHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbGlzdE1lc3NhZ2Uuc2Nyb2xsVG9wKGxpc3RNZXNzYWdlWzBdLnNjcm9sbEhlaWdodCk7XHJcbiAgICAgICAgfSwgNjAwKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5sZXQgYXBwID0gYW5ndWxhci5tb2R1bGUobW9kdWxlTmFtZSwgW10pO1xyXG5hcHAuY29tcG9uZW50KGNvbXBvbmVudE5hbWUsIHtcclxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuLi9jaGF0LWdyb3VwL2NoYXQtZ3JvdXAuaHRtbCcpLFxyXG4gICAgY29udHJvbGxlcjogQ29udHJvbGxlcixcclxuICAgIGNvbnRyb2xsZXJBczogY29tcG9uZW50TmFtZSxcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgY29udmVyOiBcIjxcIixcclxuICAgICAgICB1c2VyOiBcIjxcIixcclxuICAgICAgICB0b2tlbjogXCI8XCJcclxuICAgIH1cclxufSk7XHJcblxyXG5leHBvcnRzLm5hbWUgPSBtb2R1bGVOYW1lOyIsIm1vZHVsZS5leHBvcnRzID0gXCI8aDM+SEVMUCBERVNLPC9oMz5cIjsiLCJjb25zdCBjb21wb25lbnROYW1lID0gJ2hlbHBEZXNrJztcclxuY29uc3QgbW9kdWxlTmFtZSA9ICdoZWxwLWRlc2snO1xyXG5cclxuZnVuY3Rpb24gQ29udHJvbGxlcihhcGlTZXJ2aWNlKXtcclxuICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgIFxyXG4gICAgd2luZG93LkhFTFBfREVWID0gc2VsZjtcclxufVxyXG5cclxubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKG1vZHVsZU5hbWUsIFtdKTtcclxuYXBwLmNvbXBvbmVudChjb21wb25lbnROYW1lLCB7XHJcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vaGVscC1kZXNrL2hlbHAtZGVzay5odG1sJyksXHJcbiAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLFxyXG4gICAgY29udHJvbGxlckFzOiBjb21wb25lbnROYW1lXHJcbn0pO1xyXG5cclxuZXhwb3J0cy5uYW1lID0gbW9kdWxlTmFtZTsiLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHVsIHN0eWxlPVxcXCJvdmVyZmxvdy15OiBvdmVybGF5OyBoZWlnaHQ6IDEwMCU7IHBhZGRpbmc6IDBweCA4cHg7XFxcIj5cXHJcXG4gICAgPGxpIGNsYXNzPVxcXCJvbmxpbmVcXFwiIG5nLXJlcGVhdD1cXFwidXNlciBpbiBsaXN0VXNlci5saXN0VXNlclxcXCI+XFxyXFxuICAgICAgICA8aSBjbGFzcz1cXFwiZmEgZmEtY2lyY2xlXFxcIiBuZy1zdHlsZT1cXFwibGlzdFVzZXIuYWN0aXZlKHVzZXIpXFxcIj48L2k+XFxyXFxuICAgICAgICA8c3BhbiBjbGFzcz1cXFwidXNlclxcXCI+e3t1c2VyLnVzZXJuYW1lfX08L3NwYW4+XFxyXFxuICAgIDwvbGk+XFxyXFxuPC91bD5cIjsiLCJjb25zdCBjb21wb25lbnROYW1lID0gJ2xpc3RVc2VyJztcclxuY29uc3QgbW9kdWxlTmFtZSA9ICdsaXN0LXVzZXInO1xyXG5cclxuZnVuY3Rpb24gQ29udHJvbGxlcigkdGltZW91dCl7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICBcclxuICAgIHRoaXMuYWN0aXZlID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIHJldHVybiB1c2VyLmFjdGl2ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc29ja2V0Lm9uKCdzZW5kLW1lbWJlcnMtb25saW5lJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGZvcih4IG9mIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHgpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5saXN0VXNlci5maWx0ZXIoZnVuY3Rpb24odXNlcikge3JldHVybiB1c2VyLnVzZXJuYW1lID09IHh9KVswXS5hY3RpdmUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcImJsdWVcIlxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgc29ja2V0Lm9uKCdkaXNjb25uZWN0ZWQnLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNlbGYubGlzdFVzZXIuZmlsdGVyKGZ1bmN0aW9uKHVzZXIpIHtyZXR1cm4gdXNlci51c2VybmFtZSA9PSBkYXRhfSlbMF0uYWN0aXZlID0ge1xyXG4gICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIlwiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbiAgICBzb2NrZXQub24oJ29mZi1wcm9qZWN0JywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZWxmLmxpc3RVc2VyLmZpbHRlcihmdW5jdGlvbih1c2VyKSB7cmV0dXJuIHVzZXIudXNlcm5hbWUgPT0gZGF0YS51c2VybmFtZX0pWzBdLmFjdGl2ZSA9IHtcclxuICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCJcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5sZXQgYXBwID0gYW5ndWxhci5tb2R1bGUobW9kdWxlTmFtZSwgW10pO1xyXG5hcHAuY29tcG9uZW50KGNvbXBvbmVudE5hbWUsIHtcclxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuLi9saXN0LXVzZXIvbGlzdC11c2VyLmh0bWwnKSxcclxuICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIsXHJcbiAgICBjb250cm9sbGVyQXM6IGNvbXBvbmVudE5hbWUsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGxpc3RVc2VyOiBcIjxcIixcclxuICAgICAgICB1c2VyOiBcIjxcIixcclxuICAgICAgICBpZENvbnZlcnNhdGlvbjogXCI8XCIsXHJcbiAgICAgICAgdG9rZW46IFwiPFwiXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZXhwb3J0cy5uYW1lID0gbW9kdWxlTmFtZTsiLCJcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9zdHlsZS5jc3NcIik7XG5cbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuXG52YXIgdHJhbnNmb3JtO1xudmFyIGluc2VydEludG87XG5cblxuXG52YXIgb3B0aW9ucyA9IHtcImhtclwiOnRydWV9XG5cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG5vcHRpb25zLmluc2VydEludG8gPSB1bmRlZmluZWQ7XG5cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcblxuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG5cbmlmKG1vZHVsZS5ob3QpIHtcblx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4vc3R5bGUuY3NzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9zdHlsZS5jc3NcIik7XG5cblx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblxuXHRcdHZhciBsb2NhbHMgPSAoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0dmFyIGtleSwgaWR4ID0gMDtcblxuXHRcdFx0Zm9yKGtleSBpbiBhKSB7XG5cdFx0XHRcdGlmKCFiIHx8IGFba2V5XSAhPT0gYltrZXldKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlkeCsrO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3Ioa2V5IGluIGIpIGlkeC0tO1xuXG5cdFx0XHRyZXR1cm4gaWR4ID09PSAwO1xuXHRcdH0oY29udGVudC5sb2NhbHMsIG5ld0NvbnRlbnQubG9jYWxzKSk7XG5cblx0XHRpZighbG9jYWxzKSB0aHJvdyBuZXcgRXJyb3IoJ0Fib3J0aW5nIENTUyBITVIgZHVlIHRvIGNoYW5nZWQgY3NzLW1vZHVsZXMgbG9jYWxzLicpO1xuXG5cdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHR9KTtcblxuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHNjcmlwdD5cXHJcXG4gICAgdmFyIHNvY2tldCA9IGlvKCdodHRwOi8vMTMuMjUxLjI0LjY1OjUwMDAnKTtcXHJcXG4gICAgLy8gdmFyIHNvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0OjUwMDAnKTtcXHJcXG48L3NjcmlwdD5cXHJcXG48ZGl2IGlkPVxcXCJjaGF0LW1vZHVsZVxcXCI+XFxyXFxuICAgIDxpIGlkPVxcXCJpY29uXFxcIiBjbGFzcz1cXFwiZmEgZmEtY29tbWVudHMgY3Vyc29yLXBvaW50ZXJcXFwiIG5nLXNob3c9XFxcIiFjbS5zaG93XFxcIiBuZy1tb3VzZXVwPVxcXCJjbS5zaG93Q2hhdCgpXFxcIj5cXHJcXG4gICAgPC9pPlxcclxcbiAgICA8ZGl2IGlkPVxcXCJjaGF0LWZyYW1lXFxcIiBuZy1zaG93PVxcXCJjbS5zaG93XFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInBhbmVsIHdpdGgtbmF2LXRhYnMgcGFuZWwtcHJpbWFyeVxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicGFuZWwtaGVhZGluZ1xcXCIgaWQ9XFxcInRpdGxlLWJhclxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cXFwibmF2IG5hdi10YWJzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cXFwiYWN0aXZlIHRhYi1jaGF0XFxcIiBpZD1cXFwicGlsbC1jaGF0XFxcIiBzdHlsZT1cXFwibWF4LXdpZHRoOiAxMDBweFxcXCIgbmctc2hvdz1cXFwiY20uc2hvd0NoYXRHcm91cFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiI3RhYi1jaGF0XFxcIiBkYXRhLXRvZ2dsZT1cXFwidGFiXFxcIiBzdHlsZT1cXFwid2hpdGUtc3BhY2U6IG5vd3JhcDtvdmVyZmxvdy14OiBoaWRkZW47dGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3tjbS5jaGF0R3JvdXBOYW1lfX1cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxpIGlkPVxcXCJwaWxsLWFjdGl2ZVxcXCIgbmctY2xpY2s9XFxcImNtLnJlZnJlc2hBY3RpdmUoKVxcXCIgbmctc2hvdz1cXFwiY20uc2hvd0NoYXRHcm91cFxcXCIgY2xhc3M9XFxcIm1lbWJlcnNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcIiN0YWItbWVtYmVyc1xcXCIgZGF0YS10b2dnbGU9XFxcInRhYlxcXCI+TWVtYmVyczwvYT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8IS0tIDxsaSBpZD1cXFwicGlsbC1hY3RpdmVcXFwiIG5nLWNsaWNrPVxcXCJjbS5yZWZyZXNoQWN0aXZlKClcXFwiIGNsYXNzPVxcXCJIZWxwRGVza1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiI3RhYi1oZWxwZGVza1xcXCIgZGF0YS10b2dnbGU9XFxcInRhYlxcXCI+SGVscERlc2s8L2E+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2xpPiAtLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsaSBzdHlsZT1cXFwiZmxvYXQ6IHJpZ2h0XFxcIiBjbGFzcz1cXFwiY3Vyc29yLXBvaW50ZXJcXFwiIG5nLWNsaWNrPVxcXCJjbS5zaG93PWZhbHNlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwiZmEgZmEtbWludXMgY29uZmlnXFxcIj48L2k+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxcclxcbiAgICAgICAgICAgICAgICA8L3VsPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInBhbmVsLWJvZHlcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBmYWRlIGluIGFjdGl2ZVxcXCIgaWQ9XFxcInRhYi1jaGF0XFxcIiAgbmctc2hvdz1cXFwiY20uc2hvd0NoYXRHcm91cFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGNoYXQtZ3JvdXAgY29udmVyPVxcXCJjbS5jb252ZXJcXFwiIHVzZXI9XFxcImNtLnVzZXJcXFwiIHRva2VuPVxcXCJjbS50b2tlblxcXCI+PC9jaGF0LWdyb3VwPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBmYWRlXFxcIiBpZD1cXFwidGFiLW1lbWJlcnNcXFwiIG5nLXNob3c9XFxcImNtLnNob3dDaGF0R3JvdXBcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaXN0LXVzZXIgbGlzdC11c2VyPVxcXCJjbS5saXN0VXNlclxcXCIgdXNlcj1cXFwiY20udXNlclxcXCIgaWQtY29udmVyc2F0aW9uPVxcXCJjbS5jb252ZXIuaWRcXFwiIHRva2VuPVxcXCJjbS50b2tlblxcXCI+PC9saXN0LXVzZXI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwhLS0gPGRpdiBjbGFzcz1cXFwidGFiLXBhbmUgZmFkZSBoZWlnaHQtMTAwXFxcIiBpZD1cXFwidGFiLWhlbHBkZXNrXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aGVscC1kZXNrPjwvaGVscC1kZXNrPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IC0tPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cIjsiLCJyZXF1aXJlKCcuLi9jc3Mvc3R5bGUuY3NzJyk7XHJcbmxldCBjaGF0U2VydmljZSA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2FwaS1zZXJ2aWNlLmpzJyk7XHJcbmxldCBjaGF0R3JvdXAgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2NoYXQtZ3JvdXAvY2hhdC1ncm91cC5qcycpO1xyXG5sZXQgaGVscERlc2sgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2hlbHAtZGVzay9oZWxwLWRlc2suanMnKTtcclxubGV0IGxpc3RVc2VyID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9saXN0LXVzZXIvbGlzdC11c2VyLmpzJyk7XHJcbmxldCBtb2R1bGVOYW1lID0gY29tcG9uZW50TmFtZSA9ICdjaGF0TW9kdWxlJztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKG1vZHVsZU5hbWUsIFtjaGF0U2VydmljZS5uYW1lLCBjaGF0R3JvdXAubmFtZSwgaGVscERlc2submFtZSwgbGlzdFVzZXIubmFtZSwgJ25nRmlsZVVwbG9hZCddKVxyXG4gICAgICAgIC5jb21wb25lbnQoY29tcG9uZW50TmFtZSwge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL2luZGV4Lmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjbScsIFxyXG4gICAgICAgICAgICAgICAgYmluZGluZ3MgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5mdW5jdGlvbiBDb250cm9sbGVyKGFwaVNlcnZpY2UsICR0aW1lb3V0LCAkZWxlbWVudCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLnNob3cgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnByb2plY3ROYW1lID0gJyc7XHJcbiAgICAgICAgdGhpcy5jb252ZXIgPSB7fTtcclxuICAgICAgICB0aGlzLnRva2VuID0gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0TGlzdFVzZXIocHJvamVjdE5hbWUsIHByb2plY3RPd25lciwgY2IpIHtcclxuICAgICAgICAgICAgICAgIGFwaVNlcnZpY2UuZ2V0TGlzdFVzZXJPZlByb2plY3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X25hbWU6IHByb2plY3ROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogcHJvamVjdE93bmVyXHJcbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRva2VuLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKHJlcyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBnZXRDaGF0R3JvdXAocHJvamVjdE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGFwaVNlcnZpY2UuZ2V0Q29udmVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvamVjdE5hbWVcclxuICAgICAgICAgICAgICAgIH0sIHNlbGYudG9rZW4sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbnZlciA9IHJlcy5jb252ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2hhdEdyb3VwTmFtZSA9IHJlcy5jb252ZXIubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi51c2VyID0gcmVzLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldC5lbWl0KCdqb2luLXJvb20nLCB7dXNlcm5hbWU6IHNlbGYudXNlci51c2VybmFtZSwgaWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY29udmVyID0ge307XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluaXRDaGF0ID0gZnVuY3Rpb24odG9rZW4sIHByb2plY3ROYW1lLCBwcm9qZWN0T3duZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmKCF0b2tlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKCdBdXRoZW50aXphdGlvbiBmYWlsJyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50b2tlbiA9IHRva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwcm9qZWN0TmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNlbGYucHJvamVjdE5hbWUgIT0gcHJvamVjdE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNlbGYuY29udmVyLmlkKSBzb2NrZXQuZW1pdCgnb2ZmLXByb2plY3QnLCB7aWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkLCB1c2VybmFtZTogc2VsZi51c2VyLnVzZXJuYW1lfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRMaXN0VXNlcihwcm9qZWN0TmFtZSwgcHJvamVjdE93bmVyLCBmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5saXN0VXNlciA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzZWxmLmxpc3RVc2VyLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2hhdEdyb3VwKHByb2plY3ROYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93Q2hhdEdyb3VwID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3cgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxpc3RVc2VyID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnByb2plY3ROYW1lID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5jb252ZXIuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdCgnb2ZmLXByb2plY3QnLCB7aWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkLCB1c2VybmFtZTogc2VsZi51c2VyLnVzZXJuYW1lfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93Q2hhdEdyb3VwID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNsb3NlQ2hhdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc29ja2V0LmVtaXQoJ29mZi1wcm9qZWN0Jywge2lkQ29udmVyc2F0aW9uOiBzZWxmLmNvbnZlci5pZCwgdXNlcm5hbWU6IHNlbGYudXNlci51c2VybmFtZX0pO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hvd0NoYXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmKHNlbGYuc2hvd0NoYXRHcm91cClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93PXNlbGYubW92aW5nP2ZhbHNlOnRydWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIHNoYXJlZC1wcm9qZWN0IGlzIG9wZW5pbmcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBkcmFnQ2hhdE1vZHVsZShzZWxmKTtcclxuICAgICAgICB3aW5kb3cuQ0hBVF9NT0RVTEUgPSBzZWxmO1xyXG4gICAgICAgIFxyXG59O1xyXG5mdW5jdGlvbiBkcmFnQ2hhdE1vZHVsZShjbSkge1xyXG4gICAgICAgIGxldCBzZWxlY3RlZCA9IG51bGwsIHhfcG9zID0gMCwgeV9wb3MgPSAwLCB4X2VsZW0gPSAwLCB5X2VsZW0gPSAwLCB4X29sZD0wLCB5X29sZD0wO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9kcmFnX2luaXQoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBlbGVtO1xyXG4gICAgICAgICAgICAgICAgeF9vbGQgPSBzZWxlY3RlZC5vZmZzZXRMZWZ0O1xyXG4gICAgICAgICAgICAgICAgeV9vbGQgPSBzZWxlY3RlZC5vZmZzZXRUb3A7XHJcbiAgICAgICAgICAgICAgICB4X2VsZW0gPSB4X3BvcyAtIHNlbGVjdGVkLm9mZnNldExlZnQ7XHJcbiAgICAgICAgICAgICAgICB5X2VsZW0gPSB5X3BvcyAtIHNlbGVjdGVkLm9mZnNldFRvcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gX21vdmVfZWxlbShlKSB7XHJcbiAgICAgICAgICAgICAgICB4X3BvcyA9IGRvY3VtZW50LmFsbCA/IHdpbmRvdy5ldmVudC5jbGllbnRYIDogZS5wYWdlWDtcclxuICAgICAgICAgICAgICAgIHlfcG9zID0gZG9jdW1lbnQuYWxsID8gd2luZG93LmV2ZW50LmNsaWVudFkgOiBlLnBhZ2VZO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHhfb2xkIT1zZWxlY3RlZC5vZmZzZXRMZWZ0IHx8IHlfb2xkIT1zZWxlY3RlZC5vZmZzZXRUb3ApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY20ubW92aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQuc3R5bGUubGVmdCA9ICh4X3BvcyAtIHhfZWxlbSkgKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZC5zdHlsZS50b3AgPSAoeV9wb3MgLSB5X2VsZW0pICsgJ3B4JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gX2Rlc3Ryb3koZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBjbS5tb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnI3RpdGxlLWJhcicpWzBdLm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgX2RyYWdfaW5pdCgkKCcjY2hhdC1tb2R1bGUnKVswXSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcjaWNvbicpWzBdLm9ubW91c2Vkb3duID0gZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgX2RyYWdfaW5pdCgkKCcjY2hhdC1tb2R1bGUnKVswXSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBkb2N1bWVudC5vbm1vdXNlbW92ZSA9IF9tb3ZlX2VsZW07XHJcbiAgICAgICAgZG9jdW1lbnQub25tb3VzZXVwID0gX2Rlc3Ryb3k7XHJcbn0iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKGZhbHNlKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIlxcclxcbi8qKiogUEFORUwgUFJJTUFSWSAqKiovXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaSA+IGEsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaSA+IGE6aG92ZXIsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaSA+IGE6Zm9jdXMge1xcclxcbiAgICBjb2xvcjogI2ZmZjtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiAub3BlbiA+IGEsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiAub3BlbiA+IGE6aG92ZXIsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiAub3BlbiA+IGE6Zm9jdXMsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaSA+IGE6aG92ZXIsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaSA+IGE6Zm9jdXMge1xcclxcblxcdGNvbG9yOiAjZmZmO1xcclxcblxcdGJhY2tncm91bmQtY29sb3I6ICMzMDcxYTk7XFxyXFxuXFx0Ym9yZGVyLWNvbG9yOiB0cmFuc3BhcmVudDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5hY3RpdmUgPiBhLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuYWN0aXZlID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmFjdGl2ZSA+IGE6Zm9jdXMge1xcclxcblxcdGNvbG9yOiAjNDI4YmNhO1xcclxcblxcdGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxyXFxuXFx0Ym9yZGVyLWNvbG9yOiAjNDI4YmNhO1xcclxcblxcdGJvcmRlci1ib3R0b20tY29sb3I6IHRyYW5zcGFyZW50O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51IHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzQyOGJjYTtcXHJcXG4gICAgYm9yZGVyLWNvbG9yOiAjMzA3MWE5O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gbGkgPiBhIHtcXHJcXG4gICAgY29sb3I6ICNmZmY7ICAgXFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiBsaSA+IGE6aG92ZXIsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IGxpID4gYTpmb2N1cyB7XFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzMDcxYTk7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlID4gYSxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZSA+IGE6aG92ZXIsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUgPiBhOmZvY3VzIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzRhOWZlOTtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLm5hdj5saT5hIHtcXHJcXG4gICAgcGFkZGluZzogNXB4IDhweDtcXHJcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5wYW5lbC1oZWFkaW5nIHtcXHJcXG4gICAgcGFkZGluZzogMHB4O1xcclxcbiAgICBib3JkZXItYm90dG9tOiBub25lO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAucGFuZWwtYm9keSB7XFxyXFxuICAgIHBhZGRpbmc6IDBweDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLnRhYi1wYW5lIHtcXHJcXG4gICAgLyogaGVpZ2h0OiAxMDAlOyAqL1xcclxcbn1cXHJcXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xcclxcblxcclxcbmNoYXQtbW9kdWxlICNjaGF0LW1vZHVsZSB7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTJweDtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICB6LWluZGV4OiAxMDA7XFxyXFxuICAgIHRvcDogMjZweDtcXHJcXG4gICAgcmlnaHQ6IDVweDtcXHJcXG59XFxyXFxuXFxyXFxuY2hhdC1tb2R1bGUgI2ljb24ge1xcclxcbiAgICBjb2xvcjogIzQyOGJjYTtcXHJcXG4gICAgZm9udC1zaXplOiA1MHB4O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAjY2hhdC1mcmFtZSB7XFxyXFxuICAgIHdpZHRoOiAzMjBweDtcXHJcXG4gICAgLyogaGVpZ2h0OiAzNTBweDsgKi9cXHJcXG4gICAgYmFja2dyb3VuZDogI2ZmZjtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLmNvbmZpZyB7XFxyXFxuICAgIGNvbG9yOiAjZmZmO1xcclxcbiAgICBwYWRkaW5nOiA1cHggNnB4O1xcclxcbiAgICBmb250LXNpemU6IDE0cHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5saXN0LW1lc3NhZ2Uge1xcclxcbiAgICBwYWRkaW5nOiAxMHB4O1xcclxcbiAgICBvdmVyZmxvdy15OiBvdmVybGF5O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAubWVzc2FnZSB7XFxyXFxuICAgIHdpZHRoOiA4MCU7XFxyXFxuICAgIHdvcmQtYnJlYWs6IGtlZXAtYWxsO1xcclxcbiAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC50ZXh0LW1lc3NhZ2Uge1xcclxcbiAgICBib3JkZXI6IDFweCBzb2xpZCBncmVlbjtcXHJcXG4gICAgLyogaGVpZ2h0OiAxMDAlOyAqL1xcclxcbiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcclxcbiAgICBwYWRkaW5nLXJpZ2h0OiA0MHB4O1xcclxcbiAgICBtaW4taGVpZ2h0OjQwcHg7XFxyXFxuICAgIC8qIGhlaWdodDogNTBweDsgKi9cXHJcXG4gICAgLyogcGFkZGluZzogMHB4OyAqL1xcclxcbn1cXHJcXG5cXHJcXG5jaGF0LW1vZHVsZSBzcGFuIHtcXHJcXG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xcclxcbn1cXHJcXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXFxyXFxuY2hhdC1tb2R1bGUgLm9ubGluZSB7XFxyXFxuICAgIG1hcmdpbjogOHB4O1xcclxcbiAgICBmb250LXNpemU6IDE1cHg7XFxyXFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxyXFxuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcXHJcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5mYS5mYS1jaXJjbGUge1xcclxcbiAgICBmb250LXNpemU6IDEwcHg7XFxyXFxuICAgIG1hcmdpbjogNXB4O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAuY3Vyc29yLXBvaW50ZXIge1xcclxcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5jdXJzb3ItbW92ZSB7XFxyXFxuICAgIGN1cnNvcjogbW92ZTtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLnJvdyB7XFxyXFxuICAgIG1hcmdpbjogMHB4O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSBsaSB7XFxyXFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxyXFxufVxcclxcbi8qIHdpZHRoICovXFxyXFxuY2hhdC1tb2R1bGUgOjotd2Via2l0LXNjcm9sbGJhciB7XFxyXFxuICAgIHdpZHRoOiA1cHg7XFxyXFxufVxcclxcblxcclxcbi8qIFRyYWNrICovXFxyXFxuOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XFxyXFxuICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMCAxcHggcmdiKDIwMiwgMjAyLCAyMDIpOyBcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcclxcbn1cXHJcXG4gXFxyXFxuLyogSGFuZGxlICovXFxyXFxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XFxyXFxuICAgIGJhY2tncm91bmQ6IHJnYigyMDcsIDIwNywgMjA3KTsgXFxyXFxuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxyXFxufVwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcbiIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cbiIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5cbnZhciBzdHlsZXNJbkRvbSA9IHt9O1xuXG52YXJcdG1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcblx0dmFyIG1lbW87XG5cblx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBtZW1vO1xuXHR9O1xufTtcblxudmFyIGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uICgpIHtcblx0Ly8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3Ncblx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHQvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG5cdC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuXHQvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcblx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xufSk7XG5cbnZhciBnZXRUYXJnZXQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG59O1xuXG52YXIgZ2V0RWxlbWVudCA9IChmdW5jdGlvbiAoZm4pIHtcblx0dmFyIG1lbW8gPSB7fTtcblxuXHRyZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgcGFzc2luZyBmdW5jdGlvbiBpbiBvcHRpb25zLCB0aGVuIHVzZSBpdCBmb3IgcmVzb2x2ZSBcImhlYWRcIiBlbGVtZW50LlxuICAgICAgICAgICAgICAgIC8vIFVzZWZ1bCBmb3IgU2hhZG93IFJvb3Qgc3R5bGUgaS5lXG4gICAgICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgICAgIC8vICAgaW5zZXJ0SW50bzogZnVuY3Rpb24gKCkgeyByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb29cIikuc2hhZG93Um9vdCB9XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHR2YXIgc3R5bGVUYXJnZXQgPSBnZXRUYXJnZXQuY2FsbCh0aGlzLCB0YXJnZXQpO1xuXHRcdFx0Ly8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblx0XHRcdGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHQvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuXHRcdFx0XHRcdC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG5cdFx0XHRcdFx0c3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcblx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0c3R5bGVUYXJnZXQgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcblx0XHR9XG5cdFx0cmV0dXJuIG1lbW9bdGFyZ2V0XVxuXHR9O1xufSkoKTtcblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXJcdHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xudmFyXHRzdHlsZXNJbnNlcnRlZEF0VG9wID0gW107XG5cbnZhclx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL3VybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZiAodHlwZW9mIERFQlVHICE9PSBcInVuZGVmaW5lZFwiICYmIERFQlVHKSB7XG5cdFx0aWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0b3B0aW9ucy5hdHRycyA9IHR5cGVvZiBvcHRpb25zLmF0dHJzID09PSBcIm9iamVjdFwiID8gb3B0aW9ucy5hdHRycyA6IHt9O1xuXG5cdC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuXHQvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cdGlmICghb3B0aW9ucy5zaW5nbGV0b24gJiYgdHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uICE9PSBcImJvb2xlYW5cIikgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgPGhlYWQ+IGVsZW1lbnRcbiAgICAgICAgaWYgKCFvcHRpb25zLmluc2VydEludG8pIG9wdGlvbnMuaW5zZXJ0SW50byA9IFwiaGVhZFwiO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdGFyZ2V0XG5cdGlmICghb3B0aW9ucy5pbnNlcnRBdCkgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XG5cblx0dmFyIHN0eWxlcyA9IGxpc3RUb1N0eWxlcyhsaXN0LCBvcHRpb25zKTtcblxuXHRhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGUgKG5ld0xpc3QpIHtcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblxuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xuXHRcdFx0bWF5UmVtb3ZlLnB1c2goZG9tU3R5bGUpO1xuXHRcdH1cblxuXHRcdGlmKG5ld0xpc3QpIHtcblx0XHRcdHZhciBuZXdTdHlsZXMgPSBsaXN0VG9TdHlsZXMobmV3TGlzdCwgb3B0aW9ucyk7XG5cdFx0XHRhZGRTdHlsZXNUb0RvbShuZXdTdHlsZXMsIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF5UmVtb3ZlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBtYXlSZW1vdmVbaV07XG5cblx0XHRcdGlmKGRvbVN0eWxlLnJlZnMgPT09IDApIHtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykgZG9tU3R5bGUucGFydHNbal0oKTtcblxuXHRcdFx0XHRkZWxldGUgc3R5bGVzSW5Eb21bZG9tU3R5bGUuaWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn07XG5cbmZ1bmN0aW9uIGFkZFN0eWxlc1RvRG9tIChzdHlsZXMsIG9wdGlvbnMpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblxuXHRcdGlmKGRvbVN0eWxlKSB7XG5cdFx0XHRkb21TdHlsZS5yZWZzKys7XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0c1tqXShpdGVtLnBhcnRzW2pdKTtcblx0XHRcdH1cblxuXHRcdFx0Zm9yKDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xuXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblxuXHRcdFx0c3R5bGVzSW5Eb21baXRlbS5pZF0gPSB7aWQ6IGl0ZW0uaWQsIHJlZnM6IDEsIHBhcnRzOiBwYXJ0c307XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGxpc3RUb1N0eWxlcyAobGlzdCwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVzID0gW107XG5cdHZhciBuZXdTdHlsZXMgPSB7fTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XG5cdFx0dmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG5cdFx0dmFyIGNzcyA9IGl0ZW1bMV07XG5cdFx0dmFyIG1lZGlhID0gaXRlbVsyXTtcblx0XHR2YXIgc291cmNlTWFwID0gaXRlbVszXTtcblx0XHR2YXIgcGFydCA9IHtjc3M6IGNzcywgbWVkaWE6IG1lZGlhLCBzb3VyY2VNYXA6IHNvdXJjZU1hcH07XG5cblx0XHRpZighbmV3U3R5bGVzW2lkXSkgc3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcblx0XHRlbHNlIG5ld1N0eWxlc1tpZF0ucGFydHMucHVzaChwYXJ0KTtcblx0fVxuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudCAob3B0aW9ucywgc3R5bGUpIHtcblx0dmFyIHRhcmdldCA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvKVxuXG5cdGlmICghdGFyZ2V0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnRJbnRvJyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG5cdH1cblxuXHR2YXIgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AgPSBzdHlsZXNJbnNlcnRlZEF0VG9wW3N0eWxlc0luc2VydGVkQXRUb3AubGVuZ3RoIC0gMV07XG5cblx0aWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwidG9wXCIpIHtcblx0XHRpZiAoIWxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCB0YXJnZXQuZmlyc3RDaGlsZCk7XG5cdFx0fSBlbHNlIGlmIChsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZykge1xuXHRcdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXHRcdH1cblx0XHRzdHlsZXNJbnNlcnRlZEF0VG9wLnB1c2goc3R5bGUpO1xuXHR9IGVsc2UgaWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwiYm90dG9tXCIpIHtcblx0XHR0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEF0ID09PSBcIm9iamVjdFwiICYmIG9wdGlvbnMuaW5zZXJ0QXQuYmVmb3JlKSB7XG5cdFx0dmFyIG5leHRTaWJsaW5nID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8gKyBcIiBcIiArIG9wdGlvbnMuaW5zZXJ0QXQuYmVmb3JlKTtcblx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBuZXh0U2libGluZyk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiW1N0eWxlIExvYWRlcl1cXG5cXG4gSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcgKCdvcHRpb25zLmluc2VydEF0JykgZm91bmQuXFxuIE11c3QgYmUgJ3RvcCcsICdib3R0b20nLCBvciBPYmplY3QuXFxuIChodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlciNpbnNlcnRhdClcXG5cIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50IChzdHlsZSkge1xuXHRpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXHRzdHlsZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlKTtcblxuXHR2YXIgaWR4ID0gc3R5bGVzSW5zZXJ0ZWRBdFRvcC5pbmRleE9mKHN0eWxlKTtcblx0aWYoaWR4ID49IDApIHtcblx0XHRzdHlsZXNJbnNlcnRlZEF0VG9wLnNwbGljZShpZHgsIDEpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudCAob3B0aW9ucykge1xuXHR2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXG5cdGFkZEF0dHJzKHN0eWxlLCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlKTtcblxuXHRyZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmtFbGVtZW50IChvcHRpb25zKSB7XG5cdHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG5cblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGFkZEF0dHJzKGxpbmssIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGluayk7XG5cblx0cmV0dXJuIGxpbms7XG59XG5cbmZ1bmN0aW9uIGFkZEF0dHJzIChlbCwgYXR0cnMpIHtcblx0T2JqZWN0LmtleXMoYXR0cnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUgKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGUsIHVwZGF0ZSwgcmVtb3ZlLCByZXN1bHQ7XG5cblx0Ly8gSWYgYSB0cmFuc2Zvcm0gZnVuY3Rpb24gd2FzIGRlZmluZWQsIHJ1biBpdCBvbiB0aGUgY3NzXG5cdGlmIChvcHRpb25zLnRyYW5zZm9ybSAmJiBvYmouY3NzKSB7XG5cdCAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybShvYmouY3NzKTtcblxuXHQgICAgaWYgKHJlc3VsdCkge1xuXHQgICAgXHQvLyBJZiB0cmFuc2Zvcm0gcmV0dXJucyBhIHZhbHVlLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIHJ1bm5pbmcgcnVudGltZSB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIGNzcy5cblx0ICAgIFx0b2JqLmNzcyA9IHJlc3VsdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIElmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCBkb24ndCBhZGQgdGhpcyBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIGNvbmRpdGlvbmFsIGxvYWRpbmcgb2YgY3NzXG5cdCAgICBcdHJldHVybiBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHQvLyBub29wXG5cdCAgICBcdH07XG5cdCAgICB9XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcblx0XHR2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcblxuXHRcdHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXG5cdFx0dXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG5cdFx0cmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcblxuXHR9IGVsc2UgaWYgKFxuXHRcdG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiXG5cdCkge1xuXHRcdHN0eWxlID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuXG5cdFx0XHRpZihzdHlsZS5ocmVmKSBVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlLmhyZWYpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0c3R5bGUgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUgKG5ld09iaikge1xuXHRcdGlmIChuZXdPYmopIHtcblx0XHRcdGlmIChcblx0XHRcdFx0bmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJlxuXHRcdFx0XHRuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJlxuXHRcdFx0XHRuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGUob2JqID0gbmV3T2JqKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVtb3ZlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgdGV4dFN0b3JlID0gW107XG5cblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcblx0XHR0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG5cblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcgKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuXHRcdHZhciBjaGlsZE5vZGVzID0gc3R5bGUuY2hpbGROb2RlcztcblxuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGUucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuXG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZS5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZS5hcHBlbmRDaGlsZChjc3NOb2RlKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyAoc3R5bGUsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuXG5cdGlmKG1lZGlhKSB7XG5cdFx0c3R5bGUuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuXHR9IGVsc2Uge1xuXHRcdHdoaWxlKHN0eWxlLmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuXHRcdH1cblxuXHRcdHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmsgKGxpbmssIG9wdGlvbnMsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cblx0Lypcblx0XHRJZiBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgaXNuJ3QgZGVmaW5lZCwgYnV0IHNvdXJjZW1hcHMgYXJlIGVuYWJsZWRcblx0XHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRcdG9uIGJ5IGRlZmF1bHQuICBPdGhlcndpc2UgZGVmYXVsdCB0byB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvblxuXHRcdGRpcmVjdGx5XG5cdCovXG5cdHZhciBhdXRvRml4VXJscyA9IG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzID09PSB1bmRlZmluZWQgJiYgc291cmNlTWFwO1xuXG5cdGlmIChvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyB8fCBhdXRvRml4VXJscykge1xuXHRcdGNzcyA9IGZpeFVybHMoY3NzKTtcblx0fVxuXG5cdGlmIChzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rLmhyZWY7XG5cblx0bGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblxuXHRpZihvbGRTcmMpIFVSTC5yZXZva2VPYmplY3RVUkwob2xkU3JjKTtcbn1cbiIsIlxuLyoqXG4gKiBXaGVuIHNvdXJjZSBtYXBzIGFyZSBlbmFibGVkLCBgc3R5bGUtbG9hZGVyYCB1c2VzIGEgbGluayBlbGVtZW50IHdpdGggYSBkYXRhLXVyaSB0b1xuICogZW1iZWQgdGhlIGNzcyBvbiB0aGUgcGFnZS4gVGhpcyBicmVha3MgYWxsIHJlbGF0aXZlIHVybHMgYmVjYXVzZSBub3cgdGhleSBhcmUgcmVsYXRpdmUgdG8gYVxuICogYnVuZGxlIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBPbmUgc29sdXRpb24gaXMgdG8gb25seSB1c2UgZnVsbCB1cmxzLCBidXQgdGhhdCBtYXkgYmUgaW1wb3NzaWJsZS5cbiAqXG4gKiBJbnN0ZWFkLCB0aGlzIGZ1bmN0aW9uIFwiZml4ZXNcIiB0aGUgcmVsYXRpdmUgdXJscyB0byBiZSBhYnNvbHV0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgcGFnZSBsb2NhdGlvbi5cbiAqXG4gKiBBIHJ1ZGltZW50YXJ5IHRlc3Qgc3VpdGUgaXMgbG9jYXRlZCBhdCBgdGVzdC9maXhVcmxzLmpzYCBhbmQgY2FuIGJlIHJ1biB2aWEgdGhlIGBucG0gdGVzdGAgY29tbWFuZC5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIC8vIGdldCBjdXJyZW50IGxvY2F0aW9uXG4gIHZhciBsb2NhdGlvbiA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmxvY2F0aW9uO1xuXG4gIGlmICghbG9jYXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaXhVcmxzIHJlcXVpcmVzIHdpbmRvdy5sb2NhdGlvblwiKTtcbiAgfVxuXG5cdC8vIGJsYW5rIG9yIG51bGw/XG5cdGlmICghY3NzIHx8IHR5cGVvZiBjc3MgIT09IFwic3RyaW5nXCIpIHtcblx0ICByZXR1cm4gY3NzO1xuICB9XG5cbiAgdmFyIGJhc2VVcmwgPSBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3Q7XG4gIHZhciBjdXJyZW50RGlyID0gYmFzZVVybCArIGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSokLywgXCIvXCIpO1xuXG5cdC8vIGNvbnZlcnQgZWFjaCB1cmwoLi4uKVxuXHQvKlxuXHRUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBqdXN0IGEgd2F5IHRvIHJlY3Vyc2l2ZWx5IG1hdGNoIGJyYWNrZXRzIHdpdGhpblxuXHRhIHN0cmluZy5cblxuXHQgL3VybFxccypcXCggID0gTWF0Y2ggb24gdGhlIHdvcmQgXCJ1cmxcIiB3aXRoIGFueSB3aGl0ZXNwYWNlIGFmdGVyIGl0IGFuZCB0aGVuIGEgcGFyZW5zXG5cdCAgICggID0gU3RhcnQgYSBjYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAoPzogID0gU3RhcnQgYSBub24tY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgICAgIFteKShdICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAoPzogID0gU3RhcnQgYW5vdGhlciBub24tY2FwdHVyaW5nIGdyb3Vwc1xuXHQgICAgICAgICAgICAgICAgIFteKShdKyAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICAgICAgW14pKF0qICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIFxcKSAgPSBNYXRjaCBhIGVuZCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKSAgPSBFbmQgR3JvdXBcbiAgICAgICAgICAgICAgKlxcKSA9IE1hdGNoIGFueXRoaW5nIGFuZCB0aGVuIGEgY2xvc2UgcGFyZW5zXG4gICAgICAgICAgKSAgPSBDbG9zZSBub24tY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgKiAgPSBNYXRjaCBhbnl0aGluZ1xuICAgICAgICkgID0gQ2xvc2UgY2FwdHVyaW5nIGdyb3VwXG5cdCBcXCkgID0gTWF0Y2ggYSBjbG9zZSBwYXJlbnNcblxuXHQgL2dpICA9IEdldCBhbGwgbWF0Y2hlcywgbm90IHRoZSBmaXJzdC4gIEJlIGNhc2UgaW5zZW5zaXRpdmUuXG5cdCAqL1xuXHR2YXIgZml4ZWRDc3MgPSBjc3MucmVwbGFjZSgvdXJsXFxzKlxcKCgoPzpbXikoXXxcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ2ksIGZ1bmN0aW9uKGZ1bGxNYXRjaCwgb3JpZ1VybCkge1xuXHRcdC8vIHN0cmlwIHF1b3RlcyAoaWYgdGhleSBleGlzdClcblx0XHR2YXIgdW5xdW90ZWRPcmlnVXJsID0gb3JpZ1VybFxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoL15cIiguKilcIiQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSlcblx0XHRcdC5yZXBsYWNlKC9eJyguKiknJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KTtcblxuXHRcdC8vIGFscmVhZHkgYSBmdWxsIHVybD8gbm8gY2hhbmdlXG5cdFx0aWYgKC9eKCN8ZGF0YTp8aHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvfGZpbGU6XFwvXFwvXFwvfFxccyokKS9pLnRlc3QodW5xdW90ZWRPcmlnVXJsKSkge1xuXHRcdCAgcmV0dXJuIGZ1bGxNYXRjaDtcblx0XHR9XG5cblx0XHQvLyBjb252ZXJ0IHRoZSB1cmwgdG8gYSBmdWxsIHVybFxuXHRcdHZhciBuZXdVcmw7XG5cblx0XHRpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuXHRcdCAgXHQvL1RPRE86IHNob3VsZCB3ZSBhZGQgcHJvdG9jb2w/XG5cdFx0XHRuZXdVcmwgPSB1bnF1b3RlZE9yaWdVcmw7XG5cdFx0fSBlbHNlIGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBiYXNlIHVybFxuXHRcdFx0bmV3VXJsID0gYmFzZVVybCArIHVucXVvdGVkT3JpZ1VybDsgLy8gYWxyZWFkeSBzdGFydHMgd2l0aCAnLydcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gY3VycmVudCBkaXJlY3Rvcnlcblx0XHRcdG5ld1VybCA9IGN1cnJlbnREaXIgKyB1bnF1b3RlZE9yaWdVcmwucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpOyAvLyBTdHJpcCBsZWFkaW5nICcuLydcblx0XHR9XG5cblx0XHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIHVybCguLi4pXG5cdFx0cmV0dXJuIFwidXJsKFwiICsgSlNPTi5zdHJpbmdpZnkobmV3VXJsKSArIFwiKVwiO1xuXHR9KTtcblxuXHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIGNzc1xuXHRyZXR1cm4gZml4ZWRDc3M7XG59O1xuIiwiY29uc3QgbW9kdWxlTmFtZSA9ICdhcGlTZXJ2aWNlTW9kdWxlJztcclxuY29uc3Qgc2VydmljZU5hbWUgPSAnYXBpU2VydmljZSc7XHJcbmNvbnN0IEdFVF9MSVNUX1VTRVJfT0ZfUFJPSkVDVCA9ICdodHRwOi8vbG9naW4uc2Zsb3cubWUvdXNlci9saXN0JztcclxuY29uc3Qgd2lNZXNzZW5nZXJVcmwgPSAnaHR0cDovLzEzLjI1MS4yNC42NTo1MDAwL2FwaSc7XHJcbi8vIGNvbnN0IHdpTWVzc2VuZ2VyVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9hcGknO1xyXG5cclxuY29uc3QgR0VUX0NPTlZFUlNBVElPTiA9IHdpTWVzc2VuZ2VyVXJsICsgJy9jb252ZXJzYXRpb24nO1xyXG5jb25zdCBQT1NUX01FU1NBR0UgPSB3aU1lc3NlbmdlclVybCArICcvbWVzc2FnZS9uZXcnO1xyXG5jb25zdCBVUExPQUQgPSB3aU1lc3NlbmdlclVybCArICcvdXBsb2FkJztcclxuYW5ndWxhci5tb2R1bGUobW9kdWxlTmFtZSwgW10pLnNlcnZpY2Uoc2VydmljZU5hbWUsIGZ1bmN0aW9uICgkaHR0cCwgVXBsb2FkKSB7XHJcbiAgICBcclxuICAgIGxldCBkb1Bvc3QgPSBmdW5jdGlvbihVUkwsIHRva2VuLCBkYXRhLCBjYikge1xyXG4gICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIHVybDogVVJMLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IHRva2VuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuY29kZSAhPSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlLmRhdGEucmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICBjYigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjYihyZXNwb25zZS5kYXRhLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2socmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmKHRvYXN0cikgdG9hc3RyLmVycm9yKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5nZXRDb252ZXIgPSAoZGF0YSwgdG9rZW4sIGNiKSA9PiB7XHJcbiAgICAgICAgZG9Qb3N0KEdFVF9DT05WRVJTQVRJT04sIHRva2VuLCBkYXRhLCBjYik7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvc3RNZXNzYWdlID0gKGRhdGEsIHRva2VuLCBjYikgPT4ge1xyXG4gICAgICAgIGRvUG9zdChQT1NUX01FU1NBR0UsIHRva2VuLCBkYXRhLCBjYik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmdldExpc3RVc2VyT2ZQcm9qZWN0ID0gKGRhdGEsIHRva2VuLCBjYikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgIGRvUG9zdChHRVRfTElTVF9VU0VSX09GX1BST0pFQ1QsIHRva2VuLCBkYXRhLCBjYik7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwbG9hZCA9IChkYXRhLCB0b2tlbiwgY2IpID0+IHtcclxuICAgICAgICBVcGxvYWQudXBsb2FkKHtcclxuICAgICAgICAgICAgdXJsOiBVUExPQUQsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogdG9rZW5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmlsZTogZGF0YS5maWxlLFxyXG4gICAgICAgICAgICBmaWVsZHM6IGRhdGEuZmllbGRzXHJcbiAgICAgICAgfSkudGhlbihcclxuICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5jb2RlICE9IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVzcG9uc2UuZGF0YS5yZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKHJlc3BvbnNlLmRhdGEuY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBjYigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cy5uYW1lID0gbW9kdWxlTmFtZTsiXSwic291cmNlUm9vdCI6IiJ9
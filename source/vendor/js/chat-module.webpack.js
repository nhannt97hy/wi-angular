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

module.exports = "<div style=\"height:{{chatGroup.listMessageHeight}}px\" class=\"list-message\" ngf-drop=\"chatGroup.upload($files)\" class=\"drop-box\"\r\n    ngf-drag-over-class=\"'dragover'\" ngf-multiple=\"true\">\r\n    <div class=\"row\" ng-repeat=\"message in chatGroup.conver.Messages | orderBy : 'createdAt' track by $index\">\r\n        <div ng-if=\"message.User.username!=chatGroup.user.username\" class=\"row\" style=\"color: gray; text-align: center\">---{{message.createdAt}}---</div>\r\n        <div ng-if=\"message.User.username!=chatGroup.user.username\" style=\"width: 70%; float: left;margin-bottom: 2px\">\r\n            <p style=\"font-weight: bold; margin-top: 3px; margin-bottom: 3px\">{{message.User.username}}</p>\r\n            <div ng-if=\"message.type!='image'\" style=\"background: #e6e6e6; border-radius: 10px; display: inline-block; padding: 6px 8px ;max-width: 100%\">\r\n                <p class=\"message\" ng-bind-html=\"message.content\" style=\" display: inline;\" ng-if=\"message.type=='text'\">\r\n                </p>\r\n                <p class=\"message\" style=\" display: inline;\" ng-if=\"message.type=='file'\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <i class=\"glyphicon glyphicon-circle-arrow-down\"></i>\r\n                        {{chatGroup.fileName(message.content)}}\r\n                    </a>\r\n                </p>\r\n            </div>\r\n            <div ng-if=\"message.type=='image'\" style=\" display: inline-block;max-width: 100%\">\r\n                <p class=\"message\" style=\" display: inline;\" >\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <img src=\"{{message.content}}\" style=\"max-width: 100%; max-height: 70%;;border: 1px solid #ddd;border-radius: 4px;\">\r\n                    </a>\r\n                </p>\r\n            </div>\r\n        </div>\r\n        <div ng-if=\"message.User.username==chatGroup.user.username\" style=\"width: 70%; float: right;margin-bottom: 2px\">\r\n            <div ng-if=\"message.type!='image'\" style=\"background: #428bca; border-radius: 10px; float: right; display: inline-block;padding: 6px 8px;max-width: 100%\">\r\n                <p class=\"message\" ng-bind-html=\"message.content\" style=\"color: #fff;display: inline; \" ng-if=\"message.type=='text'\">\r\n                </p>\r\n                <p class=\"message\" style=\" display: inline;\" ng-if=\"message.type=='file'\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\" style=\"color: #fff\">\r\n                        <i class=\"glyphicon glyphicon-circle-arrow-down\"></i>\r\n                        {{chatGroup.fileName(message.content)}}\r\n                    </a>\r\n                </p>\r\n            </div>\r\n            <div ng-if=\"message.type=='image'\" style=\" float: right; display: inline-block;padding: 6px 8px;max-width: 100%\">\r\n                <p class=\"message\" style=\" display: inline;\">\r\n                    <a href=\"{{chatGroup.download(message.content)}}\">\r\n                        <img src=\"{{message.content}}\" style=\"max-width: 100%; max-height: 70%;border: 1px solid #ddd;border-radius: 4px;\">\r\n                    </a>\r\n                </p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div style=\"position:relative;\">\r\n    <textarea class=\"text-message\" rows=\"2\"></textarea>\r\n    <div style=\"position: absolute;bottom: 5px;right: 5px;\">\r\n        <span class=\"glyphicon glyphicon-picture cursor-pointer\" ngf-select=\"chatGroup.upload($files)\" multiple=\"multiple\" ngf-accept=\"'image/*'\"></span>\r\n        <span class=\"glyphicon glyphicon-paperclip cursor-pointer\" ngf-select=\"chatGroup.upload($files)\" multiple=\"multiple\"></span>\r\n    </div>  \r\n</div>";

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
                // socket.emit('sendMessage', message);
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
                        socket.emit('sendMessage', message);
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
        console.log(data);
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
        console.log(data);
        $timeout(function() {
            self.listUser.filter(function(user) {return user.username == data})[0].active = {
                "color": ""
            };
        })
    })
    socket.on('off-project', function(data) {
        if(self.idConversation==data.idConversation) {
            $timeout(function() {
                self.listUser.filter(function(user) {return user.username == data.username})[0].active = {
                    "color": ""
                };
            })
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmh0bWwiLCJ3ZWJwYWNrOi8vLy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmpzIiwid2VicGFjazovLy8uLi9jb21wb25lbnRzL2hlbHAtZGVzay9oZWxwLWRlc2suaHRtbCIsIndlYnBhY2s6Ly8vLi4vY29tcG9uZW50cy9oZWxwLWRlc2svaGVscC1kZXNrLmpzIiwid2VicGFjazovLy8uLi9jb21wb25lbnRzL2xpc3QtdXNlci9saXN0LXVzZXIuaHRtbCIsIndlYnBhY2s6Ly8vLi4vY29tcG9uZW50cy9saXN0LXVzZXIvbGlzdC11c2VyLmpzIiwid2VicGFjazovLy8uLi9jc3Mvc3R5bGUuY3NzPzRlNzciLCJ3ZWJwYWNrOi8vLy4uL2luZGV4Lmh0bWwiLCJ3ZWJwYWNrOi8vLy4uL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly8vLi4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4uL3NlcnZpY2VzL2FwaS1zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNM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OztBQUVkLGtEQUFrRCxzQkFBc0I7QUFDeEU7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FBRUEsNkJBQTZCLG1CQUFtQjs7QUFFaEQ7O0FBRUE7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsV0FBVyxFQUFFO0FBQ3JELHdDQUF3QyxXQUFXLEVBQUU7O0FBRXJEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esc0NBQXNDO0FBQ3RDLEdBQUc7QUFDSDtBQUNBLDhEQUE4RDtBQUM5RDs7QUFFQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxDQUFDO0FBQ0QsaUMiLCJmaWxlIjoiY2hhdC1tb2R1bGUud2VicGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBzdHlsZT1cXFwiaGVpZ2h0Ont7Y2hhdEdyb3VwLmxpc3RNZXNzYWdlSGVpZ2h0fX1weFxcXCIgY2xhc3M9XFxcImxpc3QtbWVzc2FnZVxcXCIgbmdmLWRyb3A9XFxcImNoYXRHcm91cC51cGxvYWQoJGZpbGVzKVxcXCIgY2xhc3M9XFxcImRyb3AtYm94XFxcIlxcclxcbiAgICBuZ2YtZHJhZy1vdmVyLWNsYXNzPVxcXCInZHJhZ292ZXInXFxcIiBuZ2YtbXVsdGlwbGU9XFxcInRydWVcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiIG5nLXJlcGVhdD1cXFwibWVzc2FnZSBpbiBjaGF0R3JvdXAuY29udmVyLk1lc3NhZ2VzIHwgb3JkZXJCeSA6ICdjcmVhdGVkQXQnIHRyYWNrIGJ5ICRpbmRleFxcXCI+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLlVzZXIudXNlcm5hbWUhPWNoYXRHcm91cC51c2VyLnVzZXJuYW1lXFxcIiBjbGFzcz1cXFwicm93XFxcIiBzdHlsZT1cXFwiY29sb3I6IGdyYXk7IHRleHQtYWxpZ246IGNlbnRlclxcXCI+LS0te3ttZXNzYWdlLmNyZWF0ZWRBdH19LS0tPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLlVzZXIudXNlcm5hbWUhPWNoYXRHcm91cC51c2VyLnVzZXJuYW1lXFxcIiBzdHlsZT1cXFwid2lkdGg6IDcwJTsgZmxvYXQ6IGxlZnQ7bWFyZ2luLWJvdHRvbTogMnB4XFxcIj5cXHJcXG4gICAgICAgICAgICA8cCBzdHlsZT1cXFwiZm9udC13ZWlnaHQ6IGJvbGQ7IG1hcmdpbi10b3A6IDNweDsgbWFyZ2luLWJvdHRvbTogM3B4XFxcIj57e21lc3NhZ2UuVXNlci51c2VybmFtZX19PC9wPlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZSE9J2ltYWdlJ1xcXCIgc3R5bGU9XFxcImJhY2tncm91bmQ6ICNlNmU2ZTY7IGJvcmRlci1yYWRpdXM6IDEwcHg7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgcGFkZGluZzogNnB4IDhweCA7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIG5nLWJpbmQtaHRtbD1cXFwibWVzc2FnZS5jb250ZW50XFxcIiBzdHlsZT1cXFwiIGRpc3BsYXk6IGlubGluZTtcXFwiIG5nLWlmPVxcXCJtZXNzYWdlLnR5cGU9PSd0ZXh0J1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ZpbGUnXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcInt7Y2hhdEdyb3VwLmRvd25sb2FkKG1lc3NhZ2UuY29udGVudCl9fVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2lyY2xlLWFycm93LWRvd25cXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e2NoYXRHcm91cC5maWxlTmFtZShtZXNzYWdlLmNvbnRlbnQpfX1cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9wPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ltYWdlJ1xcXCIgc3R5bGU9XFxcIiBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7bWF4LXdpZHRoOiAxMDAlXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XFxcIm1lc3NhZ2VcXFwiIHN0eWxlPVxcXCIgZGlzcGxheTogaW5saW5lO1xcXCIgPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwie3tjaGF0R3JvdXAuZG93bmxvYWQobWVzc2FnZS5jb250ZW50KX19XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3ttZXNzYWdlLmNvbnRlbnR9fVxcXCIgc3R5bGU9XFxcIm1heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogNzAlOztib3JkZXI6IDFweCBzb2xpZCAjZGRkO2JvcmRlci1yYWRpdXM6IDRweDtcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxcclxcbiAgICAgICAgICAgICAgICA8L3A+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UuVXNlci51c2VybmFtZT09Y2hhdEdyb3VwLnVzZXIudXNlcm5hbWVcXFwiIHN0eWxlPVxcXCJ3aWR0aDogNzAlOyBmbG9hdDogcmlnaHQ7bWFyZ2luLWJvdHRvbTogMnB4XFxcIj5cXHJcXG4gICAgICAgICAgICA8ZGl2IG5nLWlmPVxcXCJtZXNzYWdlLnR5cGUhPSdpbWFnZSdcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kOiAjNDI4YmNhOyBib3JkZXItcmFkaXVzOiAxMHB4OyBmbG9hdDogcmlnaHQ7IGRpc3BsYXk6IGlubGluZS1ibG9jaztwYWRkaW5nOiA2cHggOHB4O21heC13aWR0aDogMTAwJVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVxcXCJtZXNzYWdlXFxcIiBuZy1iaW5kLWh0bWw9XFxcIm1lc3NhZ2UuY29udGVudFxcXCIgc3R5bGU9XFxcImNvbG9yOiAjZmZmO2Rpc3BsYXk6IGlubGluZTsgXFxcIiBuZy1pZj1cXFwibWVzc2FnZS50eXBlPT0ndGV4dCdcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8L3A+XFxyXFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVxcXCJtZXNzYWdlXFxcIiBzdHlsZT1cXFwiIGRpc3BsYXk6IGlubGluZTtcXFwiIG5nLWlmPVxcXCJtZXNzYWdlLnR5cGU9PSdmaWxlJ1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCJ7e2NoYXRHcm91cC5kb3dubG9hZChtZXNzYWdlLmNvbnRlbnQpfX1cXFwiIHN0eWxlPVxcXCJjb2xvcjogI2ZmZlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2lyY2xlLWFycm93LWRvd25cXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICB7e2NoYXRHcm91cC5maWxlTmFtZShtZXNzYWdlLmNvbnRlbnQpfX1cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9wPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDxkaXYgbmctaWY9XFxcIm1lc3NhZ2UudHlwZT09J2ltYWdlJ1xcXCIgc3R5bGU9XFxcIiBmbG9hdDogcmlnaHQ7IGRpc3BsYXk6IGlubGluZS1ibG9jaztwYWRkaW5nOiA2cHggOHB4O21heC13aWR0aDogMTAwJVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVxcXCJtZXNzYWdlXFxcIiBzdHlsZT1cXFwiIGRpc3BsYXk6IGlubGluZTtcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwie3tjaGF0R3JvdXAuZG93bmxvYWQobWVzc2FnZS5jb250ZW50KX19XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3ttZXNzYWdlLmNvbnRlbnR9fVxcXCIgc3R5bGU9XFxcIm1heC13aWR0aDogMTAwJTsgbWF4LWhlaWdodDogNzAlO2JvcmRlcjogMXB4IHNvbGlkICNkZGQ7Ym9yZGVyLXJhZGl1czogNHB4O1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2E+XFxyXFxuICAgICAgICAgICAgICAgIDwvcD5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cXHJcXG48ZGl2IHN0eWxlPVxcXCJwb3NpdGlvbjpyZWxhdGl2ZTtcXFwiPlxcclxcbiAgICA8dGV4dGFyZWEgY2xhc3M9XFxcInRleHQtbWVzc2FnZVxcXCIgcm93cz1cXFwiMlxcXCI+PC90ZXh0YXJlYT5cXHJcXG4gICAgPGRpdiBzdHlsZT1cXFwicG9zaXRpb246IGFic29sdXRlO2JvdHRvbTogNXB4O3JpZ2h0OiA1cHg7XFxcIj5cXHJcXG4gICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBpY3R1cmUgY3Vyc29yLXBvaW50ZXJcXFwiIG5nZi1zZWxlY3Q9XFxcImNoYXRHcm91cC51cGxvYWQoJGZpbGVzKVxcXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBuZ2YtYWNjZXB0PVxcXCInaW1hZ2UvKidcXFwiPjwvc3Bhbj5cXHJcXG4gICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBhcGVyY2xpcCBjdXJzb3ItcG9pbnRlclxcXCIgbmdmLXNlbGVjdD1cXFwiY2hhdEdyb3VwLnVwbG9hZCgkZmlsZXMpXFxcIiBtdWx0aXBsZT1cXFwibXVsdGlwbGVcXFwiPjwvc3Bhbj5cXHJcXG4gICAgPC9kaXY+ICBcXHJcXG48L2Rpdj5cIjsiLCJjb25zdCBjb21wb25lbnROYW1lID0gJ2NoYXRHcm91cCc7XHJcbmNvbnN0IG1vZHVsZU5hbWUgPSAnY2hhdC1ncm91cCc7XHJcblxyXG5mdW5jdGlvbiBDb250cm9sbGVyKGFwaVNlcnZpY2UsICR0aW1lb3V0LCAkZWxlbWVudCl7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICB0aGlzLmxpc3RNZXNzYWdlSGVpZ2h0ID0gMzAwO1xyXG4gICAgbGV0IHRleHRNZXNzYWdlID0gJGVsZW1lbnQuZmluZCgnLnRleHQtbWVzc2FnZScpO1xyXG4gICAgbGV0IGxpc3RNZXNzYWdlID0gJGVsZW1lbnQuZmluZCgnLmxpc3QtbWVzc2FnZScpO1xyXG4gICAgdGV4dE1lc3NhZ2Uua2V5cHJlc3MoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoZS53aGljaCA9PSAxMyAmJiAhZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSB0ZXh0TWVzc2FnZS52YWwoKS5zcGxpdCgnXFxuJykuam9pbignPGJyLz4nKTtcclxuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkU2VuZGVyOiBzZWxmLnVzZXIuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkQ29udmVyc2F0aW9uOiBzZWxmLmNvbnZlci5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXNlcjogc2VsZi51c2VyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyBzb2NrZXQuZW1pdCgnc2VuZE1lc3NhZ2UnLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIGFwaVNlcnZpY2UucG9zdE1lc3NhZ2UobWVzc2FnZSwgc2VsZi50b2tlbiwgZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0TWVzc2FnZS52YWwoJycpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy51cGxvYWQgPSBmdW5jdGlvbiAoZmlsZXMpIHtcclxuICAgICAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMoZmlsZXMsIChmaWxlLCBpLCBfZG9uZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSBmaWxlLnR5cGUuc3Vic3RyaW5nKDAsIDUpO1xyXG4gICAgICAgICAgICAgICAgYXBpU2VydmljZS51cGxvYWQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IHsnbmFtZSc6IHNlbGYuY29udmVyLm5hbWV9XHJcbiAgICAgICAgICAgICAgICB9LCBzZWxmLnRva2VuLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHJlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlPT0naW1hZ2UnPydpbWFnZSc6J2ZpbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkU2VuZGVyOiBzZWxmLnVzZXIuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZXI6IHNlbGYudXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdCgnc2VuZE1lc3NhZ2UnLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBpU2VydmljZS5wb3N0TWVzc2FnZShtZXNzYWdlLCBzZWxmLnRva2VuLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2RvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sIChlcnIpID0+IHtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRvd25sb2FkID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgIGxldCBwID0gcGF0aC5zbGljZSgyNSk7XHJcbiAgICAgICAgcmV0dXJuICdodHRwOi8vMTMuMjUxLjI0LjY1OjUwMDAvYXBpL2Rvd25sb2FkLycrcCsnP3Rva2VuPScrc2VsZi50b2tlbjtcclxuICAgIH1cclxuICAgIHRoaXMuZmlsZU5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGguc3Vic3RyaW5nKDU5K3NlbGYuY29udmVyLm5hbWUubGVuZ3RoLCBwYXRoLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBzb2NrZXQub24oJ3NlbmRNZXNzYWdlJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBzZWxmLmNvbnZlci5NZXNzYWdlcyA9IHNlbGYuY29udmVyLk1lc3NhZ2VzP3NlbGYuY29udmVyLk1lc3NhZ2VzOltdO1xyXG4gICAgICAgIHNlbGYuY29udmVyLk1lc3NhZ2VzLnB1c2goZGF0YSk7XHJcblxyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGxpc3RNZXNzYWdlLnNjcm9sbFRvcChsaXN0TWVzc2FnZVswXS5zY3JvbGxIZWlnaHQpO1xyXG4gICAgICAgIH0sIDYwMCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKG1vZHVsZU5hbWUsIFtdKTtcclxuYXBwLmNvbXBvbmVudChjb21wb25lbnROYW1lLCB7XHJcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vY2hhdC1ncm91cC9jaGF0LWdyb3VwLmh0bWwnKSxcclxuICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIsXHJcbiAgICBjb250cm9sbGVyQXM6IGNvbXBvbmVudE5hbWUsXHJcbiAgICBiaW5kaW5nczoge1xyXG4gICAgICAgIGNvbnZlcjogXCI8XCIsXHJcbiAgICAgICAgdXNlcjogXCI8XCIsXHJcbiAgICAgICAgdG9rZW46IFwiPFwiXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuZXhwb3J0cy5uYW1lID0gbW9kdWxlTmFtZTsiLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGgzPkhFTFAgREVTSzwvaDM+XCI7IiwiY29uc3QgY29tcG9uZW50TmFtZSA9ICdoZWxwRGVzayc7XHJcbmNvbnN0IG1vZHVsZU5hbWUgPSAnaGVscC1kZXNrJztcclxuXHJcbmZ1bmN0aW9uIENvbnRyb2xsZXIoYXBpU2VydmljZSl7XHJcbiAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICBcclxuICAgIHdpbmRvdy5IRUxQX0RFViA9IHNlbGY7XHJcbn1cclxuXHJcbmxldCBhcHAgPSBhbmd1bGFyLm1vZHVsZShtb2R1bGVOYW1lLCBbXSk7XHJcbmFwcC5jb21wb25lbnQoY29tcG9uZW50TmFtZSwge1xyXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL2hlbHAtZGVzay9oZWxwLWRlc2suaHRtbCcpLFxyXG4gICAgY29udHJvbGxlcjogQ29udHJvbGxlcixcclxuICAgIGNvbnRyb2xsZXJBczogY29tcG9uZW50TmFtZVxyXG59KTtcclxuXHJcbmV4cG9ydHMubmFtZSA9IG1vZHVsZU5hbWU7IiwibW9kdWxlLmV4cG9ydHMgPSBcIjx1bCBzdHlsZT1cXFwib3ZlcmZsb3cteTogb3ZlcmxheTsgaGVpZ2h0OiAxMDAlOyBwYWRkaW5nOiAwcHggOHB4O1xcXCI+XFxyXFxuICAgIDxsaSBjbGFzcz1cXFwib25saW5lXFxcIiBuZy1yZXBlYXQ9XFxcInVzZXIgaW4gbGlzdFVzZXIubGlzdFVzZXJcXFwiPlxcclxcbiAgICAgICAgPGkgY2xhc3M9XFxcImZhIGZhLWNpcmNsZVxcXCIgbmctc3R5bGU9XFxcImxpc3RVc2VyLmFjdGl2ZSh1c2VyKVxcXCI+PC9pPlxcclxcbiAgICAgICAgPHNwYW4gY2xhc3M9XFxcInVzZXJcXFwiPnt7dXNlci51c2VybmFtZX19PC9zcGFuPlxcclxcbiAgICA8L2xpPlxcclxcbjwvdWw+XCI7IiwiY29uc3QgY29tcG9uZW50TmFtZSA9ICdsaXN0VXNlcic7XHJcbmNvbnN0IG1vZHVsZU5hbWUgPSAnbGlzdC11c2VyJztcclxuXHJcbmZ1bmN0aW9uIENvbnRyb2xsZXIoJHRpbWVvdXQpe1xyXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgXHJcbiAgICB0aGlzLmFjdGl2ZSA9IGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICByZXR1cm4gdXNlci5hY3RpdmU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNvY2tldC5vbignc2VuZC1tZW1iZXJzLW9ubGluZScsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBmb3IoeCBvZiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh4KTtcclxuICAgICAgICAgICAgICAgIHNlbGYubGlzdFVzZXIuZmlsdGVyKGZ1bmN0aW9uKHVzZXIpIHtyZXR1cm4gdXNlci51c2VybmFtZSA9PSB4fSlbMF0uYWN0aXZlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCJibHVlXCJcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxuICAgIHNvY2tldC5vbignZGlzY29ubmVjdGVkJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZWxmLmxpc3RVc2VyLmZpbHRlcihmdW5jdGlvbih1c2VyKSB7cmV0dXJuIHVzZXIudXNlcm5hbWUgPT0gZGF0YX0pWzBdLmFjdGl2ZSA9IHtcclxuICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCJcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgc29ja2V0Lm9uKCdvZmYtcHJvamVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBpZihzZWxmLmlkQ29udmVyc2F0aW9uPT1kYXRhLmlkQ29udmVyc2F0aW9uKSB7XHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5saXN0VXNlci5maWx0ZXIoZnVuY3Rpb24odXNlcikge3JldHVybiB1c2VyLnVzZXJuYW1lID09IGRhdGEudXNlcm5hbWV9KVswXS5hY3RpdmUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbmxldCBhcHAgPSBhbmd1bGFyLm1vZHVsZShtb2R1bGVOYW1lLCBbXSk7XHJcbmFwcC5jb21wb25lbnQoY29tcG9uZW50TmFtZSwge1xyXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL2xpc3QtdXNlci9saXN0LXVzZXIuaHRtbCcpLFxyXG4gICAgY29udHJvbGxlcjogQ29udHJvbGxlcixcclxuICAgIGNvbnRyb2xsZXJBczogY29tcG9uZW50TmFtZSxcclxuICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgbGlzdFVzZXI6IFwiPFwiLFxyXG4gICAgICAgIHVzZXI6IFwiPFwiLFxyXG4gICAgICAgIGlkQ29udmVyc2F0aW9uOiBcIjxcIixcclxuICAgICAgICB0b2tlbjogXCI8XCJcclxuICAgIH1cclxufSk7XHJcblxyXG5leHBvcnRzLm5hbWUgPSBtb2R1bGVOYW1lOyIsIlxudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3N0eWxlLmNzc1wiKTtcblxuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG5cbnZhciB0cmFuc2Zvcm07XG52YXIgaW5zZXJ0SW50bztcblxuXG5cbnZhciBvcHRpb25zID0ge1wiaG1yXCI6dHJ1ZX1cblxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbm9wdGlvbnMuaW5zZXJ0SW50byA9IHVuZGVmaW5lZDtcblxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2FscztcblxuaWYobW9kdWxlLmhvdCkge1xuXHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi9zdHlsZS5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuL3N0eWxlLmNzc1wiKTtcblxuXHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXG5cdFx0dmFyIGxvY2FscyA9IChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHR2YXIga2V5LCBpZHggPSAwO1xuXG5cdFx0XHRmb3Ioa2V5IGluIGEpIHtcblx0XHRcdFx0aWYoIWIgfHwgYVtrZXldICE9PSBiW2tleV0pIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWR4Kys7XG5cdFx0XHR9XG5cblx0XHRcdGZvcihrZXkgaW4gYikgaWR4LS07XG5cblx0XHRcdHJldHVybiBpZHggPT09IDA7XG5cdFx0fShjb250ZW50LmxvY2FscywgbmV3Q29udGVudC5sb2NhbHMpKTtcblxuXHRcdGlmKCFsb2NhbHMpIHRocm93IG5ldyBFcnJvcignQWJvcnRpbmcgQ1NTIEhNUiBkdWUgdG8gY2hhbmdlZCBjc3MtbW9kdWxlcyBsb2NhbHMuJyk7XG5cblx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdH0pO1xuXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufSIsIm1vZHVsZS5leHBvcnRzID0gXCI8c2NyaXB0PlxcclxcbiAgICB2YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly8xMy4yNTEuMjQuNjU6NTAwMCcpO1xcclxcbiAgICAvLyB2YXIgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcpO1xcclxcbjwvc2NyaXB0PlxcclxcbjxkaXYgaWQ9XFxcImNoYXQtbW9kdWxlXFxcIj5cXHJcXG4gICAgPGkgaWQ9XFxcImljb25cXFwiIGNsYXNzPVxcXCJmYSBmYS1jb21tZW50cyBjdXJzb3ItcG9pbnRlclxcXCIgbmctc2hvdz1cXFwiIWNtLnNob3dcXFwiIG5nLW1vdXNldXA9XFxcImNtLnNob3dDaGF0KClcXFwiPlxcclxcbiAgICA8L2k+XFxyXFxuICAgIDxkaXYgaWQ9XFxcImNoYXQtZnJhbWVcXFwiIG5nLXNob3c9XFxcImNtLnNob3dcXFwiPlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicGFuZWwgd2l0aC1uYXYtdGFicyBwYW5lbC1wcmltYXJ5XFxcIj5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJwYW5lbC1oZWFkaW5nXFxcIiBpZD1cXFwidGl0bGUtYmFyXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVxcXCJuYXYgbmF2LXRhYnNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVxcXCJhY3RpdmUgdGFiLWNoYXRcXFwiIGlkPVxcXCJwaWxsLWNoYXRcXFwiIHN0eWxlPVxcXCJtYXgtd2lkdGg6IDEwMHB4XFxcIiBuZy1zaG93PVxcXCJjbS5zaG93Q2hhdEdyb3VwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCIjdGFiLWNoYXRcXFwiIGRhdGEtdG9nZ2xlPVxcXCJ0YWJcXFwiIHN0eWxlPVxcXCJ3aGl0ZS1zcGFjZTogbm93cmFwO292ZXJmbG93LXg6IGhpZGRlbjt0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e2NtLmNoYXRHcm91cE5hbWV9fVxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8bGkgaWQ9XFxcInBpbGwtYWN0aXZlXFxcIiBuZy1jbGljaz1cXFwiY20ucmVmcmVzaEFjdGl2ZSgpXFxcIiBuZy1zaG93PVxcXCJjbS5zaG93Q2hhdEdyb3VwXFxcIiBjbGFzcz1cXFwibWVtYmVyc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiI3RhYi1tZW1iZXJzXFxcIiBkYXRhLXRvZ2dsZT1cXFwidGFiXFxcIj5NZW1iZXJzPC9hPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9saT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwhLS0gPGxpIGlkPVxcXCJwaWxsLWFjdGl2ZVxcXCIgbmctY2xpY2s9XFxcImNtLnJlZnJlc2hBY3RpdmUoKVxcXCIgY2xhc3M9XFxcIkhlbHBEZXNrXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCIjdGFiLWhlbHBkZXNrXFxcIiBkYXRhLXRvZ2dsZT1cXFwidGFiXFxcIj5IZWxwRGVzazwvYT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvbGk+IC0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxpIHN0eWxlPVxcXCJmbG9hdDogcmlnaHRcXFwiIGNsYXNzPVxcXCJjdXJzb3ItcG9pbnRlclxcXCIgbmctY2xpY2s9XFxcImNtLnNob3c9ZmFsc2VcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJmYSBmYS1taW51cyBjb25maWdcXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XFxyXFxuICAgICAgICAgICAgICAgIDwvdWw+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicGFuZWwtYm9keVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lIGZhZGUgaW4gYWN0aXZlXFxcIiBpZD1cXFwidGFiLWNoYXRcXFwiICBuZy1zaG93PVxcXCJjbS5zaG93Q2hhdEdyb3VwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8Y2hhdC1ncm91cCBjb252ZXI9XFxcImNtLmNvbnZlclxcXCIgdXNlcj1cXFwiY20udXNlclxcXCIgdG9rZW49XFxcImNtLnRva2VuXFxcIj48L2NoYXQtZ3JvdXA+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInRhYi1wYW5lIGZhZGVcXFwiIGlkPVxcXCJ0YWItbWVtYmVyc1xcXCIgbmctc2hvdz1cXFwiY20uc2hvd0NoYXRHcm91cFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpc3QtdXNlciBsaXN0LXVzZXI9XFxcImNtLmxpc3RVc2VyXFxcIiB1c2VyPVxcXCJjbS51c2VyXFxcIiBpZC1jb252ZXJzYXRpb249XFxcImNtLmNvbnZlci5pZFxcXCIgdG9rZW49XFxcImNtLnRva2VuXFxcIj48L2xpc3QtdXNlcj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPCEtLSA8ZGl2IGNsYXNzPVxcXCJ0YWItcGFuZSBmYWRlIGhlaWdodC0xMDBcXFwiIGlkPVxcXCJ0YWItaGVscGRlc2tcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxoZWxwLWRlc2s+PC9oZWxwLWRlc2s+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gLS0+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlwiOyIsInJlcXVpcmUoJy4uL2Nzcy9zdHlsZS5jc3MnKTtcclxubGV0IGNoYXRTZXJ2aWNlID0gcmVxdWlyZSgnLi4vc2VydmljZXMvYXBpLXNlcnZpY2UuanMnKTtcclxubGV0IGNoYXRHcm91cCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvY2hhdC1ncm91cC9jaGF0LWdyb3VwLmpzJyk7XHJcbmxldCBoZWxwRGVzayA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvaGVscC1kZXNrL2hlbHAtZGVzay5qcycpO1xyXG5sZXQgbGlzdFVzZXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2xpc3QtdXNlci9saXN0LXVzZXIuanMnKTtcclxubGV0IG1vZHVsZU5hbWUgPSBjb21wb25lbnROYW1lID0gJ2NoYXRNb2R1bGUnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUobW9kdWxlTmFtZSwgW2NoYXRTZXJ2aWNlLm5hbWUsIGNoYXRHcm91cC5uYW1lLCBoZWxwRGVzay5uYW1lLCBsaXN0VXNlci5uYW1lLCAnbmdGaWxlVXBsb2FkJ10pXHJcbiAgICAgICAgLmNvbXBvbmVudChjb21wb25lbnROYW1lLCB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2NtJywgXHJcbiAgICAgICAgICAgICAgICBiaW5kaW5ncyA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbmZ1bmN0aW9uIENvbnRyb2xsZXIoYXBpU2VydmljZSwgJHRpbWVvdXQsICRlbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucHJvamVjdE5hbWUgPSAnJztcclxuICAgICAgICB0aGlzLmNvbnZlciA9IHt9O1xyXG4gICAgICAgIHRoaXMudG9rZW4gPSAnJztcclxuICAgICAgICBcclxuICAgICAgICBmdW5jdGlvbiBnZXRMaXN0VXNlcihwcm9qZWN0TmFtZSwgcHJvamVjdE93bmVyLCBjYikge1xyXG4gICAgICAgICAgICAgICAgYXBpU2VydmljZS5nZXRMaXN0VXNlck9mUHJvamVjdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RfbmFtZTogcHJvamVjdE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiBwcm9qZWN0T3duZXJcclxuICAgICAgICAgICAgICAgIH0sIHNlbGYudG9rZW4sIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2IocmVzKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGdldENoYXRHcm91cChwcm9qZWN0TmFtZSkge1xyXG4gICAgICAgICAgICAgICAgYXBpU2VydmljZS5nZXRDb252ZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9qZWN0TmFtZVxyXG4gICAgICAgICAgICAgICAgfSwgc2VsZi50b2tlbiwgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY29udmVyID0gcmVzLmNvbnZlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jaGF0R3JvdXBOYW1lID0gcmVzLmNvbnZlci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnVzZXIgPSByZXMudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ja2V0LmVtaXQoJ2pvaW4tcm9vbScsIHt1c2VybmFtZTogc2VsZi51c2VyLnVzZXJuYW1lLCBpZENvbnZlcnNhdGlvbjogc2VsZi5jb252ZXIuaWR9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb252ZXIgPSB7fTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5pdENoYXQgPSBmdW5jdGlvbih0b2tlbiwgcHJvamVjdE5hbWUsIHByb2plY3RPd25lcikge1xyXG4gICAgICAgICAgICAgICAgaWYoIXRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoJ0F1dGhlbnRpemF0aW9uIGZhaWwnKTtcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRva2VuID0gdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByb2plY3ROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5wcm9qZWN0TmFtZSAhPSBwcm9qZWN0TmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldExpc3RVc2VyKHByb2plY3ROYW1lLCBwcm9qZWN0T3duZXIsIGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxpc3RVc2VyID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNlbGYubGlzdFVzZXIubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvd0NoYXRHcm91cCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRDaGF0R3JvdXAocHJvamVjdE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubGlzdFVzZXIgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3cgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucHJvamVjdE5hbWUgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzZWxmLmNvbnZlci5pZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldC5lbWl0KCdvZmYtcHJvamVjdCcsIHtpZENvbnZlcnNhdGlvbjogc2VsZi5jb252ZXIuaWQsIHVzZXJuYW1lOiBzZWxmLnVzZXIudXNlcm5hbWV9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dDaGF0R3JvdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2xvc2VDaGF0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdCgnb2ZmLXByb2plY3QnLCB7aWRDb252ZXJzYXRpb246IHNlbGYuY29udmVyLmlkLCB1c2VybmFtZTogc2VsZi51c2VyLnVzZXJuYW1lfSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3cgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93Q2hhdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYoc2VsZi5zaG93Q2hhdEdyb3VwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3c9c2VsZi5tb3Zpbmc/ZmFsc2U6dHJ1ZTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gc2hhcmVkLXByb2plY3QgaXMgb3BlbmluZycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYWdDaGF0TW9kdWxlKHNlbGYpO1xyXG4gICAgICAgIHdpbmRvdy5DSEFUX01PRFVMRSA9IHNlbGY7XHJcbiAgICAgICAgXHJcbn07XHJcbmZ1bmN0aW9uIGRyYWdDaGF0TW9kdWxlKGNtKSB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkID0gbnVsbCwgeF9wb3MgPSAwLCB5X3BvcyA9IDAsIHhfZWxlbSA9IDAsIHlfZWxlbSA9IDAsIHhfb2xkPTAsIHlfb2xkPTA7XHJcbiAgICAgICAgZnVuY3Rpb24gX2RyYWdfaW5pdChlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IGVsZW07XHJcbiAgICAgICAgICAgICAgICB4X29sZCA9IHNlbGVjdGVkLm9mZnNldExlZnQ7XHJcbiAgICAgICAgICAgICAgICB5X29sZCA9IHNlbGVjdGVkLm9mZnNldFRvcDtcclxuICAgICAgICAgICAgICAgIHhfZWxlbSA9IHhfcG9zIC0gc2VsZWN0ZWQub2Zmc2V0TGVmdDtcclxuICAgICAgICAgICAgICAgIHlfZWxlbSA9IHlfcG9zIC0gc2VsZWN0ZWQub2Zmc2V0VG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBfbW92ZV9lbGVtKGUpIHtcclxuICAgICAgICAgICAgICAgIHhfcG9zID0gZG9jdW1lbnQuYWxsID8gd2luZG93LmV2ZW50LmNsaWVudFggOiBlLnBhZ2VYO1xyXG4gICAgICAgICAgICAgICAgeV9wb3MgPSBkb2N1bWVudC5hbGwgPyB3aW5kb3cuZXZlbnQuY2xpZW50WSA6IGUucGFnZVk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoeF9vbGQhPXNlbGVjdGVkLm9mZnNldExlZnQgfHwgeV9vbGQhPXNlbGVjdGVkLm9mZnNldFRvcClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbS5tb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZC5zdHlsZS5sZWZ0ID0gKHhfcG9zIC0geF9lbGVtKSArICdweCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkLnN0eWxlLnRvcCA9ICh5X3BvcyAtIHlfZWxlbSkgKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBfZGVzdHJveShldnQpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGNtLm1vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcjdGl0bGUtYmFyJylbMF0ub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICBfZHJhZ19pbml0KCQoJyNjaGF0LW1vZHVsZScpWzBdKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNpY29uJylbMF0ub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICBfZHJhZ19pbml0KCQoJyNjaGF0LW1vZHVsZScpWzBdKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gX21vdmVfZWxlbTtcclxuICAgICAgICBkb2N1bWVudC5vbm1vdXNldXAgPSBfZGVzdHJveTtcclxufSIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiXFxyXFxuLyoqKiBQQU5FTCBQUklNQVJZICoqKi9cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYSxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpmb2N1cyB7XFxyXFxuICAgIGNvbG9yOiAjZmZmO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IC5vcGVuID4gYSxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IC5vcGVuID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IC5vcGVuID4gYTpmb2N1cyxcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpID4gYTpmb2N1cyB7XFxyXFxuXFx0Y29sb3I6ICNmZmY7XFxyXFxuXFx0YmFja2dyb3VuZC1jb2xvcjogIzMwNzFhOTtcXHJcXG5cXHRib3JkZXItY29sb3I6IHRyYW5zcGFyZW50O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmFjdGl2ZSA+IGEsXFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5hY3RpdmUgPiBhOmhvdmVyLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuYWN0aXZlID4gYTpmb2N1cyB7XFxyXFxuXFx0Y29sb3I6ICM0MjhiY2E7XFxyXFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG5cXHRib3JkZXItY29sb3I6ICM0MjhiY2E7XFxyXFxuXFx0Ym9yZGVyLWJvdHRvbS1jb2xvcjogdHJhbnNwYXJlbnQ7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDI4YmNhO1xcclxcbiAgICBib3JkZXItY29sb3I6ICMzMDcxYTk7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiBsaSA+IGEge1xcclxcbiAgICBjb2xvcjogI2ZmZjsgICBcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IGxpID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gbGkgPiBhOmZvY3VzIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzMwNzFhOTtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLndpdGgtbmF2LXRhYnMucGFuZWwtcHJpbWFyeSAubmF2LXRhYnMgPiBsaS5kcm9wZG93biAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUgPiBhLFxcclxcbmNoYXQtbW9kdWxlIC53aXRoLW5hdi10YWJzLnBhbmVsLXByaW1hcnkgLm5hdi10YWJzID4gbGkuZHJvcGRvd24gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlID4gYTpob3ZlcixcXHJcXG5jaGF0LW1vZHVsZSAud2l0aC1uYXYtdGFicy5wYW5lbC1wcmltYXJ5IC5uYXYtdGFicyA+IGxpLmRyb3Bkb3duIC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZSA+IGE6Zm9jdXMge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNGE5ZmU5O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAubmF2PmxpPmEge1xcclxcbiAgICBwYWRkaW5nOiA1cHggOHB4O1xcclxcbiAgICBmb250LXdlaWdodDogYm9sZDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLnBhbmVsLWhlYWRpbmcge1xcclxcbiAgICBwYWRkaW5nOiAwcHg7XFxyXFxuICAgIGJvcmRlci1ib3R0b206IG5vbmU7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5wYW5lbC1ib2R5IHtcXHJcXG4gICAgcGFkZGluZzogMHB4O1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAudGFiLXBhbmUge1xcclxcbiAgICAvKiBoZWlnaHQ6IDEwMCU7ICovXFxyXFxufVxcclxcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXFxyXFxuXFxyXFxuY2hhdC1tb2R1bGUgI2NoYXQtbW9kdWxlIHtcXHJcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcclxcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIHotaW5kZXg6IDEwMDtcXHJcXG4gICAgdG9wOiAyNnB4O1xcclxcbiAgICByaWdodDogNXB4O1xcclxcbn1cXHJcXG5cXHJcXG5jaGF0LW1vZHVsZSAjaWNvbiB7XFxyXFxuICAgIGNvbG9yOiAjNDI4YmNhO1xcclxcbiAgICBmb250LXNpemU6IDUwcHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlICNjaGF0LWZyYW1lIHtcXHJcXG4gICAgd2lkdGg6IDMyMHB4O1xcclxcbiAgICAvKiBoZWlnaHQ6IDM1MHB4OyAqL1xcclxcbiAgICBiYWNrZ3JvdW5kOiAjZmZmO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAuY29uZmlnIHtcXHJcXG4gICAgY29sb3I6ICNmZmY7XFxyXFxuICAgIHBhZGRpbmc6IDVweCA2cHg7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLmxpc3QtbWVzc2FnZSB7XFxyXFxuICAgIHBhZGRpbmc6IDEwcHg7XFxyXFxuICAgIG92ZXJmbG93LXk6IG92ZXJsYXk7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5tZXNzYWdlIHtcXHJcXG4gICAgd2lkdGg6IDgwJTtcXHJcXG4gICAgd29yZC1icmVhazoga2VlcC1hbGw7XFxyXFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLnRleHQtbWVzc2FnZSB7XFxyXFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGdyZWVuO1xcclxcbiAgICAvKiBoZWlnaHQ6IDEwMCU7ICovXFxyXFxuICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxyXFxuICAgIHBhZGRpbmctcmlnaHQ6IDQwcHg7XFxyXFxuICAgIG1pbi1oZWlnaHQ6NDBweDtcXHJcXG4gICAgLyogaGVpZ2h0OiA1MHB4OyAqL1xcclxcbiAgICAvKiBwYWRkaW5nOiAwcHg7ICovXFxyXFxufVxcclxcblxcclxcbmNoYXQtbW9kdWxlIHNwYW4ge1xcclxcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcHg7XFxyXFxufVxcclxcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cXHJcXG5jaGF0LW1vZHVsZSAub25saW5lIHtcXHJcXG4gICAgbWFyZ2luOiA4cHg7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTVweDtcXHJcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXHJcXG4gICAgb3ZlcmZsb3cteDogaGlkZGVuO1xcclxcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLmZhLmZhLWNpcmNsZSB7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTBweDtcXHJcXG4gICAgbWFyZ2luOiA1cHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIC5jdXJzb3ItcG9pbnRlciB7XFxyXFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXHJcXG59XFxyXFxuY2hhdC1tb2R1bGUgLmN1cnNvci1tb3ZlIHtcXHJcXG4gICAgY3Vyc29yOiBtb3ZlO1xcclxcbn1cXHJcXG5jaGF0LW1vZHVsZSAucm93IHtcXHJcXG4gICAgbWFyZ2luOiAwcHg7XFxyXFxufVxcclxcbmNoYXQtbW9kdWxlIGxpIHtcXHJcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXHJcXG59XFxyXFxuLyogd2lkdGggKi9cXHJcXG5jaGF0LW1vZHVsZSA6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXHJcXG4gICAgd2lkdGg6IDVweDtcXHJcXG59XFxyXFxuXFxyXFxuLyogVHJhY2sgKi9cXHJcXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcXHJcXG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDFweCByZ2IoMjAyLCAyMDIsIDIwMik7IFxcclxcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxyXFxufVxcclxcbiBcXHJcXG4vKiBIYW5kbGUgKi9cXHJcXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcXHJcXG4gICAgYmFja2dyb3VuZDogcmdiKDIwNywgMjA3LCAyMDcpOyBcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogMTBweDtcXHJcXG59XCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0ge307XG5cbnZhclx0bWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbztcblxuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIG1lbW87XG5cdH07XG59O1xuXG52YXIgaXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xuXHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcblx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG59KTtcblxudmFyIGdldFRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcbn07XG5cbnZhciBnZXRFbGVtZW50ID0gKGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbyA9IHt9O1xuXG5cdHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBwYXNzaW5nIGZ1bmN0aW9uIGluIG9wdGlvbnMsIHRoZW4gdXNlIGl0IGZvciByZXNvbHZlIFwiaGVhZFwiIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gVXNlZnVsIGZvciBTaGFkb3cgUm9vdCBzdHlsZSBpLmVcbiAgICAgICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAgICAgLy8gICBpbnNlcnRJbnRvOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvb1wiKS5zaGFkb3dSb290IH1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdHZhciBzdHlsZVRhcmdldCA9IGdldFRhcmdldC5jYWxsKHRoaXMsIHRhcmdldCk7XG5cdFx0XHQvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXHRcdFx0aWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG5cdFx0XHRcdFx0Ly8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuXHRcdH1cblx0XHRyZXR1cm4gbWVtb1t0YXJnZXRdXG5cdH07XG59KSgpO1xuXG52YXIgc2luZ2xldG9uID0gbnVsbDtcbnZhclx0c2luZ2xldG9uQ291bnRlciA9IDA7XG52YXJcdHN0eWxlc0luc2VydGVkQXRUb3AgPSBbXTtcblxudmFyXHRmaXhVcmxzID0gcmVxdWlyZShcIi4vdXJsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0LCBvcHRpb25zKSB7XG5cdGlmICh0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3R5bGUtbG9hZGVyIGNhbm5vdCBiZSB1c2VkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIik7XG5cdH1cblxuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09IFwiYm9vbGVhblwiKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuICAgICAgICBpZiAoIW9wdGlvbnMuaW5zZXJ0SW50bykgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKCFvcHRpb25zLmluc2VydEF0KSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZSAobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSBkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20gKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzIChsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblxuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKSBzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2UgbmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50IChvcHRpb25zLCBzdHlsZSkge1xuXHR2YXIgdGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cblx0aWYgKCF0YXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlc0luc2VydGVkQXRUb3Bbc3R5bGVzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIHRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYgKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdFx0fVxuXHRcdHN0eWxlc0luc2VydGVkQXRUb3AucHVzaChzdHlsZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwib2JqZWN0XCIgJiYgb3B0aW9ucy5pbnNlcnRBdC5iZWZvcmUpIHtcblx0XHR2YXIgbmV4dFNpYmxpbmcgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50byArIFwiIFwiICsgb3B0aW9ucy5pbnNlcnRBdC5iZWZvcmUpO1xuXHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIG5leHRTaWJsaW5nKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbU3R5bGUgTG9hZGVyXVxcblxcbiBJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0JyAoJ29wdGlvbnMuaW5zZXJ0QXQnKSBmb3VuZC5cXG4gTXVzdCBiZSAndG9wJywgJ2JvdHRvbScsIG9yIE9iamVjdC5cXG4gKGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyI2luc2VydGF0KVxcblwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQgKHN0eWxlKSB7XG5cdGlmIChzdHlsZS5wYXJlbnROb2RlID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG5cdHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xuXG5cdHZhciBpZHggPSBzdHlsZXNJbnNlcnRlZEF0VG9wLmluZGV4T2Yoc3R5bGUpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlc0luc2VydGVkQXRUb3Auc3BsaWNlKGlkeCwgMSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGVFbGVtZW50IChvcHRpb25zKSB7XG5cdHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblxuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cblx0YWRkQXR0cnMoc3R5bGUsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGUpO1xuXG5cdHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblxuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cdG9wdGlvbnMuYXR0cnMucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cblx0YWRkQXR0cnMobGluaywgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBsaW5rKTtcblxuXHRyZXR1cm4gbGluaztcbn1cblxuZnVuY3Rpb24gYWRkQXR0cnMgKGVsLCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBhZGRTdHlsZSAob2JqLCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZSwgdXBkYXRlLCByZW1vdmUsIHJlc3VsdDtcblxuXHQvLyBJZiBhIHRyYW5zZm9ybSBmdW5jdGlvbiB3YXMgZGVmaW5lZCwgcnVuIGl0IG9uIHRoZSBjc3Ncblx0aWYgKG9wdGlvbnMudHJhbnNmb3JtICYmIG9iai5jc3MpIHtcblx0ICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtKG9iai5jc3MpO1xuXG5cdCAgICBpZiAocmVzdWx0KSB7XG5cdCAgICBcdC8vIElmIHRyYW5zZm9ybSByZXR1cm5zIGEgdmFsdWUsIHVzZSB0aGF0IGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgcnVubmluZyBydW50aW1lIHRyYW5zZm9ybWF0aW9ucyBvbiB0aGUgY3NzLlxuXHQgICAgXHRvYmouY3NzID0gcmVzdWx0O1xuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gSWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiByZXR1cm5zIGEgZmFsc3kgdmFsdWUsIGRvbid0IGFkZCB0aGlzIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXG5cdFx0c3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XG5cblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIHRydWUpO1xuXG5cdH0gZWxzZSBpZiAoXG5cdFx0b2JqLnNvdXJjZU1hcCAmJlxuXHRcdHR5cGVvZiBVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIEJsb2IgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCJcblx0KSB7XG5cdFx0c3R5bGUgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSB1cGRhdGVMaW5rLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG5cblx0XHRcdGlmKHN0eWxlLmhyZWYpIFVSTC5yZXZva2VPYmplY3RVUkwoc3R5bGUuaHJlZik7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRzdHlsZSA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG5cdFx0fTtcblx0fVxuXG5cdHVwZGF0ZShvYmopO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZSAobmV3T2JqKSB7XG5cdFx0aWYgKG5ld09iaikge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRuZXdPYmouY3NzID09PSBvYmouY3NzICYmXG5cdFx0XHRcdG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmXG5cdFx0XHRcdG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXBcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblxuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXHR9O1xufSkoKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyAoc3R5bGUsIGluZGV4LCByZW1vdmUsIG9iaikge1xuXHR2YXIgY3NzID0gcmVtb3ZlID8gXCJcIiA6IG9iai5jc3M7XG5cblx0aWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZS5jaGlsZE5vZGVzO1xuXG5cdFx0aWYgKGNoaWxkTm9kZXNbaW5kZXhdKSBzdHlsZS5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cblx0XHRpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcblx0XHRcdHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnIChzdHlsZSwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZS5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLCBtZWRpYSlcblx0fVxuXG5cdGlmKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGUuZmlyc3RDaGlsZCkge1xuXHRcdFx0c3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXG5cdFx0c3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTGluayAobGluaywgb3B0aW9ucywgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuXHQvKlxuXHRcdElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRcdGFuZCB0aGVyZSBpcyBubyBwdWJsaWNQYXRoIGRlZmluZWQgdGhlbiBsZXRzIHR1cm4gY29udmVydFRvQWJzb2x1dGVVcmxzXG5cdFx0b24gYnkgZGVmYXVsdC4gIE90aGVyd2lzZSBkZWZhdWx0IHRvIHRoZSBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgb3B0aW9uXG5cdFx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKSB7XG5cdFx0Y3NzID0gZml4VXJscyhjc3MpO1xuXHR9XG5cblx0aWYgKHNvdXJjZU1hcCkge1xuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2NjAzODc1XG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xuXHR9XG5cblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XG5cblx0dmFyIG9sZFNyYyA9IGxpbmsuaHJlZjtcblxuXHRsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYykgVVJMLnJldm9rZU9iamVjdFVSTChvbGRTcmMpO1xufVxuIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC98XFxzKiQpL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG4iLCJjb25zdCBtb2R1bGVOYW1lID0gJ2FwaVNlcnZpY2VNb2R1bGUnO1xyXG5jb25zdCBzZXJ2aWNlTmFtZSA9ICdhcGlTZXJ2aWNlJztcclxuY29uc3QgR0VUX0xJU1RfVVNFUl9PRl9QUk9KRUNUID0gJ2h0dHA6Ly9sb2dpbi5zZmxvdy5tZS91c2VyL2xpc3QnO1xyXG5jb25zdCB3aU1lc3NlbmdlclVybCA9ICdodHRwOi8vMTMuMjUxLjI0LjY1OjUwMDAvYXBpJztcclxuLy8gY29uc3Qgd2lNZXNzZW5nZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDo1MDAwL2FwaSc7XHJcblxyXG5jb25zdCBHRVRfQ09OVkVSU0FUSU9OID0gd2lNZXNzZW5nZXJVcmwgKyAnL2NvbnZlcnNhdGlvbic7XHJcbmNvbnN0IFBPU1RfTUVTU0FHRSA9IHdpTWVzc2VuZ2VyVXJsICsgJy9tZXNzYWdlL25ldyc7XHJcbmNvbnN0IFVQTE9BRCA9IHdpTWVzc2VuZ2VyVXJsICsgJy91cGxvYWQnO1xyXG5hbmd1bGFyLm1vZHVsZShtb2R1bGVOYW1lLCBbXSkuc2VydmljZShzZXJ2aWNlTmFtZSwgZnVuY3Rpb24gKCRodHRwLCBVcGxvYWQpIHtcclxuICAgIFxyXG4gICAgbGV0IGRvUG9zdCA9IGZ1bmN0aW9uKFVSTCwgdG9rZW4sIGRhdGEsIGNiKSB7XHJcbiAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgdXJsOiBVUkwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogdG9rZW5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gc3VjY2Vzc0NhbGxiYWNrKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5jb2RlICE9IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVzcG9uc2UuZGF0YS5yZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNiKHJlc3BvbnNlLmRhdGEuY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gZXJyb3JDYWxsYmFjayhyZXNwb25zZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYodG9hc3RyKSB0b2FzdHIuZXJyb3IocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBjYigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmdldENvbnZlciA9IChkYXRhLCB0b2tlbiwgY2IpID0+IHtcclxuICAgICAgICBkb1Bvc3QoR0VUX0NPTlZFUlNBVElPTiwgdG9rZW4sIGRhdGEsIGNiKTtcclxuICAgIH1cclxuICAgIHRoaXMucG9zdE1lc3NhZ2UgPSAoZGF0YSwgdG9rZW4sIGNiKSA9PiB7XHJcbiAgICAgICAgZG9Qb3N0KFBPU1RfTUVTU0FHRSwgdG9rZW4sIGRhdGEsIGNiKTtcclxuICAgIH1cclxuICAgIHRoaXMuZ2V0TGlzdFVzZXJPZlByb2plY3QgPSAoZGF0YSwgdG9rZW4sIGNiKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgZG9Qb3N0KEdFVF9MSVNUX1VTRVJfT0ZfUFJPSkVDVCwgdG9rZW4sIGRhdGEsIGNiKTtcclxuICAgIH1cclxuICAgIHRoaXMudXBsb2FkID0gKGRhdGEsIHRva2VuLCBjYikgPT4ge1xyXG4gICAgICAgIFVwbG9hZC51cGxvYWQoe1xyXG4gICAgICAgICAgICB1cmw6IFVQTE9BRCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiB0b2tlblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaWxlOiBkYXRhLmZpbGUsXHJcbiAgICAgICAgICAgIGZpZWxkczogZGF0YS5maWVsZHNcclxuICAgICAgICB9KS50aGVuKFxyXG4gICAgICAgICAgICAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLmNvZGUgIT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZS5kYXRhLnJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2IocmVzcG9uc2UuZGF0YS5jb250ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGNiKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdGhpcztcclxufSk7XHJcbm1vZHVsZS5leHBvcnRzLm5hbWUgPSBtb2R1bGVOYW1lOyJdLCJzb3VyY2VSb290IjoiIn0=
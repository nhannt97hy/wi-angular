var moduleName = 'wi-chunked-upload';
//var basePath = (__BASE_PATH || "") + moduleName + "/";
angular.module(moduleName, [])
    .component('wiChunkedUpload', {
        templateUrl: "wi-chunked-upload.html",
        controller: Controller,
        controllerAs: 'wiChunkedUpload',
        bindings: {
            idInput: "<",
            uploadUrl: "<",
            onDone: "<",
            onError: "<"
        }
    });

function Controller($scope, $http, $timeout) {
    const chunkSize = 3*1024*1024; // 8KByte
    //const chunkSize = 24; // 8KByte
    var _start = 0;
    let self = this;
    //console.log("Large file upload");
    this.startUpload = startUpload;
    this.reset = function() {
        self.progress = 0;
    }

    var reader = new FileReader();
    var file;
    var transactionId;
    reader.onloadend = function(event) {
        //console.log(event.target);
        let read = event.total;
        let data = event.target.result.slice(13);
        $http({
            method: 'POST',
            url: self.uploadUrl,
            data: {
                fileName: file.name,
                fileType: file.type,
                fileData: data,
                fileEnd: ((_start + read) >= file.size),
                transactionId: transactionId
            }
        }).then(function(response) {
            if (response.status == 200) {
                //console.log('success', response.data);
                transactionId = response.data.transactionId;
                _start += read;
                self.progress = (_start / file.size * 100).toFixed(0);
                if (_start < file.size) {
                    sendChunk(_start);
                }
                else {
                    transactionId = null;
                    $("#" + self.idInput)[0].value = "";
                    self.fileName += " uploaded";
                    if (self.onDone) self.onDone();
                }
            }
            else {
                if (self.onError) self.onError(response);
            }
        }, function(err) {
            if (self.onError) self.onError(err);
        });
    }
    function sendChunk(start) {
        //console.log('sendChunk');
        var blob = file.slice(start, start + chunkSize);
        reader.readAsDataURL(blob);
    }
    function startUpload() {
        file = $("#" + self.idInput)[0].files[0];
        //console.log(file);
        _start = 0;
        sendChunk(null, _start);
    }
    $scope.fileNameChanged = fileNameChanged;
    this.fileName = "Click to choose";

    function fileNameChanged() {
        console.log('File name changed');
        var fileInput = $("#" + self.idInput)[0];
        $timeout(function() {
            if (fileInput && fileInput.files && fileInput.files.length) {
                startUpload();
                self.fileName = fileInput.files[0].name;
            }
            else self.fileName += 'Click to choose';
        });
    }

    this.selectFile = function() {
        $("#" + self.idInput).trigger('click');
    }
}
exports.name = moduleName;

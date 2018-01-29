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

function Controller($scope, $http, $timeout, wiChunkedUploadService) {
    let self = this;
    self.uploadService = wiChunkedUploadService;

    $scope.fileNameChanged = fileNameChanged;

    function fileNameChanged() {
        console.log('File name changed');
        var fileInput = $("#" + self.idInput)[0];
        $timeout(function() {
            if (fileInput && fileInput.files && fileInput.files.length) {
                let file = $("#" + self.idInput)[0].files[0];
                wiChunkedUploadService.startUpload(file, self.uploadUrl, function(err) {
                    if (err) self.onError(err);
                    else self.onDone();
                });
            }
        });
    }

    this.selectFile = function() {
        $("#" + self.idInput).trigger('click');
    }
    this.cancelUpload = function() {
        wiChunkedUploadService.cancelUpload();
    }
}
exports.name = moduleName;

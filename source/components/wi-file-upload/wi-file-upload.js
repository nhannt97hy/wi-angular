const componentName = 'wiFileUpload';
const moduleName = 'wi-file-upload';

function Controller(Upload) {
    let self = this;

    this.uploadPic = function (file) {
        console.log('file', file);

        file.upload = Upload.upload({
            url: 'http://localhost:3000/file',
            data: {file: file}
        });

        file.upload.then(
            function (responseSuccess) {
                file.result = responseSuccess.data;
                if(self.successHandler) self.successHandler(responseSuccess);
            },
            function (responseError) {
                self.errorMsg = responseError.status + ': ' + responseError.data;
                if(self.errorHandler) self.errorHandler(responseError)
            },
            function (evt) {
                file.progress = Math.round(100.0 * evt.loaded / evt.total);
                if(self.progressHandler) self.progressHandler(evt);
            }
        );
    };

    // this.$onInit = function() {
    //     if (self.name) wiComponentService.putComponent(self.name, this);
    // }
}

let app = angular.module(moduleName, ['ngFileUpload']);
app.component('wiFileUpload', {
    templateUrl: 'wi-file-upload.html',
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        name: '<',
        successHandler: '<',
        errorHandler: '<',
        progressHandler: '<'
    }
});

module.exports.name = moduleName;
const wiServiceName = 'wiChunkedUploadService';
const moduleName = 'wi-chunked-upload-service';

const chunkSize = 3*1024*1024; // 8KByte
let app = angular.module(moduleName, []);
app.factory(wiServiceName, function ($http) {
    return new ChunkedUpload($http);
});

exports.name = moduleName;

function ChunkedUpload($http) {
    this.$http = $http;
    this.file = null;
    this.reader = null;
    this._start = 0;
    this.progress = 0;
    this.transactionId = null;
    this.uploadUrl = null;
    this.cancel = false;
}

ChunkedUpload.prototype.reset = function() {
    delete this.file;
    delete this.reader;
    this._start = 0;
    this.progress = 0;
    delete this.transactionId;
    delete this.uploadUrl;
    this.cancel = false;
}

ChunkedUpload.prototype.startUpload = function(blob, uploadUrl, onEndCallback) {
    if (this.uploadUrl) return false;
    let self = this;
    this.file = blob;
    this.uploadUrl = uploadUrl;
    this.reader = new FileReader();
    this.reader.onloadend = function(event) {
        let read = event.total;
        let data = event.target.result.slice(13);
        self.$http({
            method: 'POST',
            url: self.uploadUrl,
            headers: {
                Authorization: window.localStorage.getItem('token')
            },
            data: {
                fileName: self.file.name,
                fileType: self.file.type,
                fileData: data,
                fileEnd: ((self._start + read) >= self.file.size),
                transactionId: self.transactionId
            }
        }).then(function(response) {
            if (self.cancel) {
                self.reset();
                if (onEndCallback) onEndCallback({code:-1, reason:"Upload canceled"});
                return;
            }
            if (response.status == 200) {
                self.transactionId = response.data.transactionId;
                self._start += read;
                self.progress = (self._start / self.file.size * 100);
                if (self._start < self.file.size) {
                    sendChunk(self._start);
                }
                else {
                    self.reset();
                    if (onEndCallback) onEndCallback();
                }
            }
            else {
                self.reset();
                if (onEndCallback) onEndCallback(response.data || response);
            }
        }, function(err) {
            self.reset();
            if (onEndCallback) onEndCallback(err.data || err);
        });
    }
    self._start = 0;
    sendChunk(self._start);
    function sendChunk(start) {
        var blob = self.file.slice(start, start + chunkSize);
        self.reader.readAsDataURL(blob);
    }
    return true;
}
ChunkedUpload.prototype.cancelUpload = function() {
    this.cancel = true;
}

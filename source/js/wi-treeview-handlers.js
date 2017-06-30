exports.item11000 = function () {
    console.log('item11000');
};

exports.item11 = function () {
    console.log('item11');
};
exports.item121 = function () {
    console.log('item121');
};
exports.item12 = function () {
    console.log('item12');
};
exports.item2 = function () {
    console.log('item2');
};
exports.newitem = function () {
    console.log('newitem');
};
exports.logplot = function () {
    console.log('$scope ', this.$scope);
    this.wiComponentService.emit('add-logplot-event', 'new logplot');
};
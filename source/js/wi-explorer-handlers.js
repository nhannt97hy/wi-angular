exports.ItemLogplot = function() {
    console.log('ItemLogplot is clicked');

    this.wiComponentService.emit('new-logplot-tab', 'Blank Logplot tab');
}
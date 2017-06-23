var layoutManager;
var compileFunc;
var scopeObj;
var layoutConfig = {
    settings: {
        hasHeaders: true,
        showCloseIcon: false,
        showPopoutIcon: false
    },
    content: [
        {
            type: "row",
            content: [
                {
                    type: 'column',
                    id: 'left',
                    isClosable: false,
                    width: 30,
                    content: [
                    ]
                },
                {
                    type: 'stack',
                    id: 'right',
                    isClosable: false,
                    content:[]
                }
            ]
        }
    ]
};
function createLayout(domId, $scope, $compile) {
    scopeObj = $scope;
    compileFunc = $compile;
    layoutManager = new GoldenLayout(layoutConfig, document.getElementById(domId));
    layoutManager.registerComponent('wi-block', function(container, componentState) {
        var templateHtml = $('template#' + componentState.templateId).html();
        console.log('template#' + componentState.templateId, templateHtml);
        container.getElement().html( compileFunc(templateHtml)(scopeObj) );
    });
    layoutManager.init();
}
function putLeft(templateId, title) {
    //layoutManager.root.contentItems[0].contentItems[0].addChild({
    layoutManager.root.getItemsById('left')[0].addChild({
        type:'component',
        componentName: 'wi-block',
        componentState: {
            templateId: templateId
        },
        title: title
    });
}
function putRight(templateId, title) {
    //layoutManager.root.contentItems[0].contentItems[1].addChild({
    layoutManager.root.getItemsById('right')[0].addChild({
        type:'component',
        componentName: 'wi-block', 
        componentState: {
            templateId: templateId
        },
        title: title
    });
}

exports.createLayout = createLayout;
exports.putLeft = putLeft;
exports.putRight = putRight;

let layoutManager;
let compileFunc;
let scopeObj;
let layoutConfig = {
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
                    content: []
                },
                {
                    type: 'stack',
                    id: 'right',
                    isClosable: false,
                    content: []
                }
            ]
        }
    ]
};
function createLayout(domId, $scope, $compile) {
    scopeObj = $scope;
    compileFunc = $compile;
    layoutManager = new GoldenLayout(layoutConfig, document.getElementById(domId));

    layoutManager.registerComponent('wi-block', function (container, componentState) {
        let templateHtml = $('template#' + componentState.templateId).html();
        //console.log('template#' + componentState.templateId, templateHtml);
        container.getElement().html(compileFunc(templateHtml)(scopeObj));
    });

    layoutManager.registerComponent('html-block', function (container, componentState) {
        let html = componentState.html;
        container.getElement().html(compileFunc(html)(scopeObj));

        container.on('shown', function (e) {
            console.log('componentState', componentState)
        })
    });

    layoutManager.init();
}
function putLeft(templateId, title) {
    //layoutManager.root.contentItems[0].contentItems[0].addChild({
    layoutManager.root.getItemsById('left')[0].addChild({
        type: 'component',
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
        type: 'component',
        componentName: 'wi-block',
        componentState: {
            templateId: templateId
        },
        title: title
    });
}
function putWiLogPlotRight(logPlotName, title) {
    layoutManager.root.getItemsById('right')[0].addChild({
        type: 'component',
        componentName: 'html-block',
        componentState: {
            html: '<wi-logplot name="' + logPlotName + '"></wi-logplot>'
        },
        title: title
    });
}
function putWiLogPlotLeft(logPlotName, title) {
    layoutManager.root.getItemsById('left')[0].addChild({
        type: 'component',
        componentName: 'html-block',
        componentState: {
            html: '<wi-logplot name="' + logPlotName + '"></wi-logplot>'
        },
        title: title
    });
}

exports.createLayout = createLayout;
exports.putLeft = putLeft;
exports.putRight = putRight;
exports.putWiLogPlotRight = putWiLogPlotRight;
exports.putWiLogPlotLeft = putWiLogPlotLeft;

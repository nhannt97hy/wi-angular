let layoutManager;
let compileFunc;
let scopeObj;
let layoutConfig = {
    settings: {
        hasHeaders: true,
        showMaximiseIcon: false,
        showCloseIcon: false,
        showPopoutIcon: false
    },
    dimensions: {
        borderWidth: 5
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
        container.getElement().html(compileFunc(templateHtml)(scopeObj));
    });

    layoutManager.registerComponent('html-block', function (container, componentState) {
        let html = componentState.html;
        container.getElement().html(compileFunc(html)(scopeObj));
    });

    layoutManager.init();
}
function putLeft(templateId, title) {
    layoutManager.root.getItemsById('left')[0].addChild({
        type: 'component',
        id: templateId,
        componentName: 'wi-block',
        componentState: {
            templateId: templateId
        },
        title: title
    });
}
function putRight(templateId, title) {
    layoutManager.root.getItemsById('right')[0].addChild({
        type: 'component',
        id: templateId,
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
function removeAllRightTabs() {
    let childItems = getChildContentItems('right');
    let childItemsLength = childItems.length;
    for (let i = 0; i < childItemsLength; i++) {
        let childItem = childItems[0];
        layoutManager.root.getItemsById('right')[0].removeChild(childItem);
    }
}
function getChildContentItems(itemId) {
    return layoutManager.root.getItemsById(itemId)[0].contentItems;
}

function isComponentExist(templateId) {
    return (layoutManager.root.getItemsById(templateId).length ? true : false);
}

exports.createLayout = createLayout;
exports.putLeft = putLeft;
exports.putRight = putRight;
exports.putWiLogPlotRight = putWiLogPlotRight;
exports.putWiLogPlotLeft = putWiLogPlotLeft;
exports.removeAllRightTabs = removeAllRightTabs;
exports.isComponentExist = isComponentExist;
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

module.exports.createLayout = function(domId, $scope, $compile) {
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

module.exports.putLeft = function(templateId, title) {
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

module.exports.putRight = function(templateId, title) {
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

module.exports.putWiLogPlotRight = function(logPlotName, logplotModel) {
    layoutManager.root.getItemsById('right')[0].addChild({
        type: 'component',
        componentName: 'html-block',
        componentState: {
            html: '<wi-logplot name="' + logPlotName + '"' + 'id="' + logplotModel.idLogplot + '"></wi-logplot>'
        },
        title: logplotModel.name
    });
}

module.exports.removeAllRightTabs = function() {
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

module.exports.isComponentExist = function(templateId) {
    return (layoutManager.root.getItemsById(templateId).length ? true : false);
}

module.exports.updateSize = function() {
    layoutManager.updateSize();
}

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

    let wiComponentService = this.wiComponentService;
    layoutManager.registerComponent('html-block', function (container, componentState) {
        let html = componentState.html;
        container.getElement().html(compileFunc(html)(scopeObj));
        container.on('destroy', function() {
            let plotId = container.tab.contentItem.config.id.replace('logplot','');
            wiComponentService.emit('logplot-tab-closed', plotId);
        })
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

module.exports.putWiLogPlotRight = function(logplotModel) {
    let itemId = 'logplot' + logplotModel.id;
    console.log(itemId);
    LAYOUT = layoutManager;
    let rightContainer = layoutManager.root.getItemsById('right')[0];
    let logplotItem = rightContainer.getItemsById(itemId)[0];
    if (logplotItem) {
        rightContainer.setActiveContentItem(logplotItem);
        return;
    }
    let wiComponentService = this.wiComponentService;
    let well = wiComponentService.getComponent(wiComponentService.UTILS).findWellById(logplotModel.properties.idWell);
    let tabTitle = '<img class="logplot-blank-16x16"> &nbsp;' + logplotModel.properties.name + ' - (' + well.properties.name + ')';
    rightContainer.addChild({
        type: 'component',
        id: itemId,
        componentName: 'html-block',
        componentState: {
            html: '<wi-logplot name="' + logplotModel.properties.name + '" id="' + logplotModel.properties.idPlot + '"></wi-logplot>'
        },
        title: tabTitle
    });
}

module.exports.removeWiLogPlot = function(logplotId) {
    let item = layoutManager.root.getItemsById('logplot'+logplotId)[0];
    if (!item) return;
    layoutManager.root.getItemsById('right')[0].removeChild(item);
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

module.exports.isComponentExist = function(id) {
    return (layoutManager.root.getItemsById(id).length ? true : false);
}

module.exports.updateSize = function() {
    layoutManager.updateSize();
}

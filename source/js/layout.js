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
            id: "layout",
            content: [
                {
                    type: 'column',
                    id: 'left',
                    isClosable: false,
                    width: 15,
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

module.exports.createLayout = function (domId, $scope, $compile) {
    scopeObj = $scope;
    compileFunc = $compile;
    layoutManager = new GoldenLayout(layoutConfig, document.getElementById(domId));
    layoutManager.init();
    LAYOUT = layoutManager;

    layoutManager.registerComponent('wi-block', function (container, componentState) {
        let templateHtml = $('template#' + componentState.templateId).html();
        container.getElement().html(compileFunc(templateHtml)(scopeObj));
    });

    let wiComponentService = this.wiComponentService;
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);
    layoutManager.registerComponent('html-block', function (container, componentState) {
        let html = componentState.html;
        container.getElement().html(compileFunc(html)(scopeObj));
        let modelRef = componentState.model;
        container.on('destroy', function () {
            if(modelRef){
                let model = utils.getModel(modelRef.type, modelRef.id);
                if (!model) return;
                model.data.opened = false;
                if (model.isReady) model.isReady = false;
            }
        })
    });

    layoutManager.root.getItemsById('right')[0].on('activeContentItemChanged', function (activeContentItem) {
        if (activeContentItem.config.componentState.model) {
            wiComponentService.emit('tab-changed', activeContentItem.config.componentState.model);
        }
    });
}

module.exports.putLeft = function (templateId, title) {
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

/*
module.exports.putRight = function (templateId, title) {
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
module.exports.putComponentRight = function (text, title) {
    layoutManager.root.getItemsById('layout')[0].addChild(
        {
            title: title,
            width: 5,
            type: 'component',
            componentName: 'wi-block',
            componentState: { text: text }
        });
};
*/
module.exports.putTabRight = function (config) {
    let rightContainer = layoutManager.root.getItemsById('right')[0];
    let tabItem = rightContainer.getItemsById(config.id)[0];
    if (tabItem) {
        rightContainer.setActiveContentItem(tabItem);
        return;
    }
    let childConfig = {
        type: 'component',
        componentName: 'html-block',
        componentState: {},
        title: 'Title'
    }
    Object.assign(childConfig, config);
    layoutManager.root.getItemsById('right')[0].addChild(childConfig);
}

module.exports.putTabRightWithModel = function (model) {
    let wiComponentService = this.wiComponentService;
    let well = wiComponentService.getComponent(wiComponentService.UTILS).findWellById(model.properties.idWell);
    let itemType, itemId, tabIcon, name, htmlTemplate;
    console.log(model);
    switch (model.type) {
        case 'logplot':
            itemId = 'logplot' + model.id;
            tabIcon = 'logplot-blank-16x16';
            name = 'logplot' + model.properties.idPlot;
            htmlTemplate = '<wi-logplot name="' + name + '" id="' + model.properties.idPlot + '"></wi-logplot>'
            break;
        case 'crossplot':
            itemId = 'crossplot' + model.id;
            tabIcon = 'crossplot-blank-16x16';
            name = 'crossplot' + model.properties.idCrossPlot;
            htmlTemplate = '<wi-crossplot name="' + name + '" id="' + model.properties.idCrossPlot + '"></wi-crossplot>'
            break;
        case 'histogram':
            itemId = 'histogram' + model.id;
            tabIcon = 'histogram-blank-16x16';
            name = 'histogram' + model.properties.idHistogram;
            htmlTemplate = '<wi-histogram name="' + name + '" id="' + model.properties.idHistogram + '"></wi-histogram>'
            break;
        case 'comboview':
            itemId = 'comboview' + model.id;
            tabIcon = 'link-view-16x16';
            name = 'comboview' + model.id;
            htmlTemplate = '<wi-comboview name="' + name + '" id="' + model.properties.idCombinedBox + '"></wi-comboview>'
            break;
        default:
            console.error('model type is not valid');
            return;
    }

    let rightContainer = layoutManager.root.getItemsById('right')[0];
    let tabItem = rightContainer.getItemsById(itemId)[0];
    if (tabItem) {
        rightContainer.setActiveContentItem(tabItem);
        return;
    }
    rightContainer.addChild({
        type: 'component',
        id: itemId,
        componentName: 'html-block',
        componentState: {
            html: htmlTemplate,
            model: model
        },
        title:  `<span class="${tabIcon}"></span> <span> ${model.properties.name} - (${well.properties.name})</span>`
    });
    let tabContainer = rightContainer.getItemsById(itemId)[0];
    switch (model.type) {
        case 'crossplot':
            console.log(tabContainer);
            break;
        case 'histogram':
            console.log(tabContainer);
            break;
        case 'comboview':
            console.log(tabContainer);
            break;
        default:
            return;
    }
}

module.exports.removeTabWithModel = function (model) {
    let item;
    let wiComponentService = this.wiComponentService;
    switch (model.type) {
        case 'logplot':
            item = layoutManager.root.getItemsById('logplot' + model.id)[0];
            wiComponentService.dropComponent('logplot' + model.id);
            break;
        case 'crossplot':
            item = layoutManager.root.getItemsById('crossplot' + model.id)[0];
            wiComponentService.dropComponent('crossplot' + model.id);
            break;
        case 'histogram':
            item = layoutManager.root.getItemsById('histogram' + model.id)[0];
            wiComponentService.dropComponent('histogram' + model.id);
            break;
        case 'comboview':
            item = layoutManager.root.getItemsById('comboview' + model.id)[0];
            wiComponentService.dropComponent('comboview' + model.id);
            break;
        default:
            return;
    }
    if (!item) return;
    layoutManager.root.getItemsById('right')[0].removeChild(item);
}

module.exports.removeAllRightTabs = function () {
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

module.exports.isComponentExist = function (id) {
    return (layoutManager.root.getItemsById(id).length ? true : false);
}

module.exports.updateSize = function () {
    layoutManager.updateSize();
}

module.exports.getItemById = function (itemId) {
    return layoutManager.root.getItemsById(itemId)[0];
}

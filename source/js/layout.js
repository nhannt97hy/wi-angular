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
                }, {
                    type: 'stack',
                    id: 'right',
                    isClosable: false,
                    content: []
                }
            ]
        }
    ]
};
module.exports.setLayoutConfig = function(newLayoutConfig) {
    layoutConfig = newLayoutConfig;
}

let tabComponents = {};
window.TABCPNTS = tabComponents;
let resizeEvent = new Event('resize');
resizeEvent.model = {};
const triggerResize = _.debounce(function () {
    for (const id in tabComponents) {
        const component = tabComponents[id];
        if (component.tab.isActive) {
            resizeEvent.model = component.config.componentState.model || {};
            document.dispatchEvent(resizeEvent);
            console.log('refresh ' + resizeEvent.model.type + ' ' + resizeEvent.model.id);
        }
    }
}, 200);
module.exports.triggerResize = triggerResize;

module.exports.createLayout = function (domId, $scope, $compile) {
    scopeObj = $scope;
    compileFunc = $compile;
    layoutManager = new GoldenLayout(layoutConfig, document.getElementById(domId));
    layoutManager.on("stackCreated", function(stack){
        // console.log('stack created', stack);
        let projectItem = stack.getItemsById("explorer-block");
        let propertiesItem = stack.getItemsById("property-block");
        if(projectItem.length || propertiesItem.length){
            // console.log('do nothing');
        }else{
            // console.log('add more control');
            let control = $($("#stack-header-control").html()),
            previousBtn = control.find("#previousBtn"),
            nextBtn = control.find("#nextBtn");

            let previous = function(){
                let current = stack.getActiveContentItem().config.id;
                let currentIdx = stack.contentItems.findIndex(d => d.config.id == current);
                if(currentIdx){
                    let preIdx = currentIdx - 1;
                    stack.setActiveContentItem(stack.contentItems[preIdx]);
                }
            }

            let next = function(){
                let current = stack.getActiveContentItem().config.id;
                let currentIdx = stack.contentItems.findIndex(d => d.config.id == current);
                if(currentIdx < stack.contentItems.length - 1){
                    let nextIdx = currentIdx + 1;
                    stack.setActiveContentItem(stack.contentItems[nextIdx]);
                }
            }

            previousBtn.click(previous);
            nextBtn.click(next);

            // Add the colorDropdown to the header
            stack.header.controlsContainer.prepend( control );
            stack.on("stateChanged", function(){
                if(stack.contentItems.length){
                    previousBtn.css("display","inline");
                    nextBtn.css("display","inline");
                    let current = stack.getActiveContentItem().config.id;
                    let currentIdx = stack.contentItems.findIndex(d => d.config.id == current);
                    if(currentIdx == 0){
                        previousBtn.css("cursor","not-allowed");
                    }else{
                        previousBtn.css("cursor","pointer");
                    }
                    if(currentIdx == stack.contentItems.length - 1){
                        nextBtn.css("cursor","not-allowed");
                    }else{
                        nextBtn.css("cursor","pointer");
                    }
                }else{
                    previousBtn.css("display","none");
                    nextBtn.css("display","none");
                }
            })
        }
    })
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
        let newScope = scopeObj.$new(false);
        newScope.model = componentState.model;
        container.getElement().html(compileFunc(html)(newScope));
        let modelRef = componentState.model;
        if (componentState.model) tabComponents[container.parent.config.id] = container.parent;
        container.on('destroy', function (component) {
            delete tabComponents[component.config.id];
            if(modelRef){
                let model = utils.getModel(modelRef.type, modelRef.id);
                if (!model) return;
                model.data.opened = false;
                if (model.isReady) model.isReady = false;
                wiComponentService.dropComponent(model.type + model.id);
                let historyState = wiComponentService.getComponent(wiComponentService.HISTORYSTATE);
                historyState.removePlotFromHistory(model.type, model.id);
            }
            if (componentState.name) wiComponentService.dropComponent(componentState.name);
            newScope.$destroy();
        });
        container.on('resize', triggerResize);
    });
    scopeObj.$on("angular-resizable.resizeEnd", triggerResize);
    let rightContainer = layoutManager.root.getItemsById('right');
    if (rightContainer && rightContainer.length)
        layoutManager.root.getItemsById('right')[0].on('activeContentItemChanged', function (activeContentItem) {
            triggerResize();
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

// module.exports.putRight = function (templateId, title) {
//     layoutManager.root.getItemsById('right')[0].addChild({
//         type: 'component',
//         id: templateId,
//         componentName: 'wi-block',
//         componentState: {
//             templateId: templateId
//         },
//         title: title
//     });
// }
/*
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
    childConfig.title = `<span class="${config.tabIcon}"></span> <span>${config.title}</span>`
    layoutManager.root.getItemsById('right')[0].addChild(childConfig);
}

module.exports.putTabRightWithModel = function (model, isClosable = true) {
    let wiComponentService = this.wiComponentService;
    let well = wiComponentService.getComponent(wiComponentService.UTILS).findWellById(model.properties.idWell);
    let itemId, tabIcon, htmlTemplate;
    console.log(model);
    switch (model.type) {
        case 'logplot':
            itemId = 'logplot' + model.properties.idPlot;
            tabIcon = 'logplot-blank-16x16';
            htmlTemplate = '<wi-logplot name="' + itemId + '" id="' + model.properties.idPlot + '"></wi-logplot>'
            break;
        case 'crossplot':
            itemId = 'crossplot' + model.properties.idCrossPlot;
            tabIcon = 'crossplot-blank-16x16';
            htmlTemplate = '<wi-crossplot name="' + itemId + '" id="' + model.properties.idCrossPlot + '"></wi-crossplot>'
            break;
        case 'histogram':
            itemId = 'histogram' + model.properties.idHistogram;
            tabIcon = 'histogram-blank-16x16';
            htmlTemplate = '<wi-histogram name="' + itemId + '" id="' + model.properties.idHistogram + '"></wi-histogram>'
            break;
        case 'comboview':
            itemId = 'comboview' + model.properties.idCombinedBox;
            tabIcon = 'link-view-16x16';
            htmlTemplate = `
                <wi-comboview
                    name="${itemId}" id="${model.properties.idCombinedBox}"
                    model="model">
                </wi-comboview>
            `;
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
        isClosable: isClosable,
        componentName: 'html-block',
        componentState: {
            html: htmlTemplate,
            model: model
        },
        title:  `<span class="${tabIcon}"></span> <span> ${model.properties.name}${well ? ' - ( ' + well.properties.name + ')':''}</span>`
    });
    let historyState = wiComponentService.getComponent(wiComponentService.HISTORYSTATE);
    historyState.putPlotToHistory(model.type, model.id);
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
    item = layoutManager.root.getItemsById(model.type + model.id)[0];
    if (!item) return;
    layoutManager.root.getItemsById('right')[0].removeChild(item);
    let historyState = wiComponentService.getComponent(wiComponentService.HISTORYSTATE);
    historyState.removePlotFromHistory(model.type, model.id);
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
    // triggerResize();
}

module.exports.getItemById = function (itemId) {
    return layoutManager.root.getItemsById(itemId)[0];
}

module.exports.getRoot = function() {
    return layoutManager.root;
}

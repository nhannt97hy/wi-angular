var layoutManager;
var compileFunc;
var scopeObj;
var layoutConfig = {
    settings: {
        hasHeaders: true
    },
    content: [
        {
            type: "row",
            content: [
                {
                    type: 'column',
                    content: [
                        /*
                        {
                            type: 'component',
                            componentName: "wi-block",
                            componentState: {
                                templateId: 'explorer-block'
                            }
                        }
                        , {
                            type: 'component',
                            componentName: 'wi-block',
                            componentState: {
                                templateId: 'property-block'
                            }
                        }
                        */
                    ]
                },
                {
                    type: 'stack',
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
function putLeft(templateId) {
    layoutManager.root.contentItems[0].contentItems[0].addChild({
        type:'component',
        componentName: 'wi-block', 
        componentState: {
            templateId: templateId
        }
    });
}
function putRight(templateId) {
    layoutManager.root.contentItems[0].contentItems[1].addChild({
        type:'component',
        componentName: 'wi-block', 
        componentState: {
            templateId: templateId
        }
    });
}

exports.createLayout = createLayout;
exports.putLeft = putLeft;
exports.putRight = putRight;

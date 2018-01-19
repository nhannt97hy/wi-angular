const componentName = 'wiD3Comboview';
const moduleName = 'wi-d3-comboview';

function Controller($scope, $controller, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
	let self = this;

	let utils = wiComponentService.getComponent(wiComponentService.UTILS);
	let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

	this.layoutManager;
	this.layoutConfig = {
		settings: {
			hasHeaders: false
		},
		content: [
			{
				type: 'row',
				isClosable: false,
				id: 'blank',
				componentName: 'blank',
				content: []
			}
		]
	};

	this.createLayout = function (domId) {
		self.layoutManager = new GoldenLayout(self.layoutConfig, document.getElementById(domId));
		self.layoutManager.registerComponent('blank', function(container, state) {
			container.getElement().html($compile(state.html)($scope));
			let modelRef = state.model;
	        container.on('destroy', function () {
	        	if (modelRef) {
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
		});
		self.layoutManager.init();
	}

	this.onReady = function () {
		self.createLayout(self.comboviewAreaId);
		$('wi-d3-comboview').on('click', function() {
			console.log($('wi-d3-comboview'));
		});
	}

	this.getModel = function () {
		return self.wiComboviewCtrl.getModel();
	}

	this.$onInit = function () {
		self.comboviewAreaId = self.name + 'ComboviewArea';
		// self.suffix = self.wiComboviewCtrl.name;
		self.suffix = self.wiComboviewCtrl.name;
		self.comboviewModel = self.getModel();
		if (self.name) {
			wiComponentService.putComponent(self.name, self);
			wiComponentService.emit(self.name);
		}
	}

	this.putObjectComponent = function (model) {
	    let well = wiComponentService.getComponent(wiComponentService.UTILS).findWellById(model.properties.idWell);
	    let itemType, itemId, tabTitle, name, htmlTemplate;

	    switch (model.type) {
	    	case 'logplot':
	            itemId = 'logplot' + model.id;
	            tabTitle = '<span class="logplot-blank-16x16"></span> &nbsp;' + model.properties.name + ' - (' + model.parentData.label + ')';
	            name = 'logplot' + model.properties.idPlot + self.suffix;
	            htmlTemplate = '<wi-logplot container-name="' + self.suffix + '" show-toolbar="false" name="' + name + '" id="' + model.properties.idPlot + '"></wi-logplot>'
	            break;
	        case 'crossplot':
	            itemId = 'crossplot' + model.id;
	            tabTitle = '<span class="crossplot-blank-16x16"></span> &nbsp;' + model.properties.name + ' - (' + model.parentData.label + ')';
	            name = 'crossplot' + model.properties.idCrossPlot + self.suffix;
	            htmlTemplate = '<wi-crossplot container-name="' + self.suffix + '" show-toolbar="false" name="' + name + '" id="' + model.properties.idCrossPlot + '"></wi-crossplot>'
	            break;
	        case 'histogram':
	            itemId = 'histogram' + model.id;
	            tabTitle = '<span class="histogram-blank-16x16"></span> &nbsp;' + model.properties.name + ' - (' + model.parentData.label + ')';
	            name = 'histogram' + model.properties.idHistogram + self.suffix;
	            htmlTemplate = '<wi-histogram container-name="' + self.suffix + '" show-toolbar="false" name="' + name + '" id="' + model.properties.idHistogram + '"></wi-histogram>'
	            break;
	    }

	    let container = self.layoutManager.root.getItemsById('blank')[0];
	    container.addChild({
	    	title: tabTitle,
			id: itemId,
			type: 'component',
			componentName: 'blank',
			isClosable: false,
			componentState: {
				html: htmlTemplate,
				model: model
			}
	    });
	}

	this.configCombinedPlotProperties = function() {
		// wiApiService.getCombinedBox(self.wiComboviewCtrl.id, function(returnedCombinedBox) {
			// $timeout(function() {
			let returnedCombinedBox = '';
				DialogUtils.combinedPlotPropertiesDialog(ModalService, returnedCombinedBox, function(props) {
					// let dataRequest = {
					// 	idWell: returnedCombinedBox.idWell,
					// 	idCombinedBox: returnedCombinedBox.idCombinedBox,
					// 	idLogPlots: props.logplot.idPlot,
					// 	idHistograms: props.histogram.idHistogram,
					// 	idCrossPlots: props.crossplot.idCrossPlot
					// }
					// wiApiService.editCombinedBox(dataRequest, function() {
						// $timeout(function() {
							self.addLogplot(props.logplot);
							self.addHistogram(props.histogram);
							self.addCrossplot(props.crossplot);
						// });
					// });
				});
			// });
		// });
	}

	this.addLogplot = function (logplotProps) {
		if(!logplotProps || !logplotProps.idPlot) return;
		let logplotModel = utils.getModel('logplot', logplotProps.idPlot);

		self.putObjectComponent(logplotModel);
	}

	this.addHistogram = function (histogramProps) {
		if(!histogramProps || !histogramProps.idHistogram) return;
		let histogramModel = utils.getModel('histogram', histogramProps.idHistogram);

		self.putObjectComponent(histogramModel);
	}

	this.addCrossplot = function (crossplotProps) {
		if(!crossplotProps || !crossplotProps.idCrossPlot) return;
		let crossplotModel = utils.getModel('crossplot', crossplotProps.idCrossPlot);

		self.putObjectComponent(crossplotModel);
	}

	this.showContextMenu = function (event) {
		if (event.button != 2) return;
		self.contextMenu = [{
			name: "Refresh",
			label: "Refresh",
			icon: "reload-16x16",
			handler: function () {
				console.log('Refresh');
			}
		}, {
			name: "Properties",
			label: "Properties",
			icon: "properties2-16x16",
			handler: function () {
				self.configCombinedPlotProperties();
			}
		}];
		event.stopPropagation();
		wiComponentService.getComponent('ContextMenu')
			.open(event.clientX, event.clientY, self.contextMenu);
	}

	this.$onDestroy = function () {
		wiComponentService.dropComponent(self.name);
	}
}

let app = angular.module(moduleName, []);
app.component(componentName, {
	templateUrl: 'wi-d3-comboview.html',
	controller: Controller,
	controllerAs: componentName,
	transclude: true,
	bindings: {
		name: '@',
		wiComboviewCtrl: '<'
	}
});

exports.name = moduleName;
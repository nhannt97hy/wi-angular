const componentName = 'wiD3Comboview';
const moduleName = 'wi-d3-comboview';

function Controller($scope, $controller, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
	let self = this;

	const utils = wiComponentService.getComponent(wiComponentService.UTILS);

	// let mainLayoutManager = wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER);
	// this.prefix = mainLayoutManager.prefix + this.name;

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
			// let modelRef = state.model;
	  //       container.on('destroy', function () {
	  //           let model = utils.getModel(modelRef.type, modelRef.id);
	  //           if (!model) return;
	  //           model.data.opened = false;
	  //       });
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
		self.prefix = self.name
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
	            tabTitle = '<span class="logplot-blank-16x16"></span> &nbsp;' + model.properties.name + ' - (' + well.properties.name + ')';
	            name = 'logplot' + model.properties.idPlot;
	            htmlTemplate = '<wi-logplot name="' + name + '" id="' + model.properties.idPlot + '"></wi-logplot>'
	            break;
	        case 'crossplot':
	            itemId = 'crossplot' + model.id;
	            tabTitle = '<span class="crossplot-blank-16x16"></span> &nbsp;' + model.properties.name + ' - (' + well.properties.name + ')';
	            name = 'crossplot' + model.properties.idCrossPlot;
	            htmlTemplate = '<wi-crossplot name="' + name + '" id="' + model.properties.idCrossPlot + '"></wi-crossplot>'
	            break;
	        case 'histogram':
	            itemId = 'histogram' + model.id;
	            tabTitle = '<span class="histogram-blank-16x16"></span> &nbsp;' + model.properties.name + ' - (' + well.properties.name + ')';
	            name = 'histogram' + model.properties.idHistogram;
	            htmlTemplate = '<wi-histogram name="' + name + '" id="' + model.properties.idHistogram + '"></wi-histogram>'
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

	this.addLogplot = function () {
		let logplotModel = utils.getModel('logplot', 3);

		let tempId = logplotModel.id;
		let tempIdPlot = logplotModel.properties.idPlot;

		logplotModel.id = logplotModel.id + self.prefix;
		logplotModel.properties.idPlot = logplotModel.properties.idPlot + self.prefix;

		console.log(logplotModel);

		// let logplotName = 'logplot' + tempIdPlot;
	 //    let logplotCtrl = wiComponentService.getComponent(logplotName);
	 //    let wiD3Ctrl = logplotCtrl.getwiD3Ctrl();
	 //    let slidingBarCtrl = logplotCtrl.getSlidingbarCtrl();

		self.putObjectComponent(logplotModel);

		logplotModel.id = tempId;
		logplotModel.properties.idPlot = tempIdPlot;
	}

	this.addHistogram = function () {
		let histogramModel = utils.getModel('histogram', 1);

		console.log(histogramModel);

		let tempId = histogramModel.id;
		let tempIdHistogram = histogramModel.properties.idHistogram;

		histogramModel.id = histogramModel.id + self.prefix;
		histogramModel.properties.idHistogram = histogramModel.properties.idHistogram + self.prefix;

		self.putObjectComponent(histogramModel);

		histogramModel.id = tempId;
		histogramModel.properties.idCrossPlot = tempIdCrossPlot;
	}

	this.addCrossplot = function () {
		let crossplotModel = utils.getModel('crossplot', 8);

		console.log(crossplotModel);

		let tempId = crossplotModel.id;
		let tempIdCrossPlot = crossplotModel.properties.idCrossPlot;

		crossplotModel.id = crossplotModel.id + self.prefix;
		crossplotModel.properties.idCrossPlot = crossplotModel.properties.idCrossPlot + self.prefix;

		self.putObjectComponent(crossplotModel);

		crossplotModel.id = tempId;
		crossplotModel.properties.idCrossPlot = tempIdCrossPlot;
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
				console.log('Properties');
			}
		}];
		event.stopPropagation();
		wiComponentService.getComponent('ContextMenu')
			.open(event.clientX, event.clientY, self.contextMenu);
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
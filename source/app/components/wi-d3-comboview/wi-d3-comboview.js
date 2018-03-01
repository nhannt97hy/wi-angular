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
		self.layoutManager.registerComponent('blank', function (container, state) {
			let newScope = $scope.$new(true);
			newScope.selectionMasks = self.wiComboviewCtrl.toolBox;
			container.getElement().html($compile(state.html)(newScope));
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
			container.on('resize', wiComponentService.getComponent(wiComponentService.LAYOUT_MANAGER).triggerResize);
		});
		self.layoutManager.init();
	}

	this.onReady = function () {
		self.createLayout(self.comboviewAreaId);
		$(document).on('resize', function () {
			self.layoutManager.updateSize();
		});
	}

	this.getModel = function () {
		return self.wiComboviewCtrl.getModel();
	}

	this.$onInit = function () {
		self.comboviewAreaId = self.name + 'ComboviewArea';
		self.suffix = self.wiComboviewCtrl.name;
		self.plotModels = {
			logplot: null,
			histogram: null,
			crossplot: null
		};
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

	this.configCombinedPlotProperties = function () {
		// wiApiService.getCombinedBox(self.wiComboviewCtrl.id, function(returnedCombinedBox) {
		// $timeout(function() {
		let returnedCombinedBox = '';
		DialogUtils.combinedPlotPropertiesDialog(ModalService, returnedCombinedBox, function (props) {
			// let dataRequest = {
			// 	idWell: returnedCombinedBox.idWell,
			// 	idCombinedBox: returnedCombinedBox.idCombinedBox,
			// 	idLogPlots: props.logplot.idPlot,
			// 	idHistograms: props.histogram.idHistogram,
			// 	idCrossPlots: props.crossplot.idCrossPlot
			// }
			// wiApiService.editCombinedBox(dataRequest, function() {
			// $timeout(function() {
			if (props.logplot) self.addLogplot(props.logplot);
			if (props.histogram) self.addHistogram(props.histogram);
			if (props.crossplot) self.addCrossplot(props.crossplot);
			// });
			// });
		});
		// });
		// });
	}

	this.addLogplot = function (logplotProps) {
		if (!logplotProps || !logplotProps.idPlot) return;
		let logplotModel = utils.getModel('logplot', logplotProps.idPlot);
		self.plotModels.logplot = logplotModel;

		self.putObjectComponent(logplotModel);
	}

	this.addHistogram = function (histogramProps) {
		if (!histogramProps || !histogramProps.idHistogram) return;
		let histogramModel = utils.getModel('histogram', histogramProps.idHistogram);
		self.plotModels.histogram = histogramModel;

		self.putObjectComponent(histogramModel);
	}

	this.addCrossplot = function (crossplotProps) {
		if (!crossplotProps || !crossplotProps.idCrossPlot) return;
		let crossplotModel = utils.getModel('crossplot', crossplotProps.idCrossPlot);
		self.plotModels.crossplot = crossplotModel;

		self.putObjectComponent(crossplotModel);
	}

	this.drawSelectionOnLogplot = function (selector) {
		if (!self.plotModels) return;
		let createdLogplotId = self.plotModels.logplot.properties.idPlot;
		let wiD3Ctrl = wiComponentService.getComponent('logplot' + createdLogplotId + self.suffix).getwiD3Ctrl();
		let graph = wiComponentService.getComponent(wiComponentService.GRAPH);
		let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
		logTracks.forEach(function (track) {
			track.setMode('UseSelector');
			let transformY = track.getTransformY();
			let startDepth, endDepth, maskData = {};
			// let selection = track.getSelection(selector.id);
			// let rect = track.plotContainer.node().getBoundingClientRect();
			track.plotContainer.call(d3.drag()
				.on('drag', function () {
					if (track.mode != 'UseSelector') return;
					// console.log('drawing selection in log track');
					let y = d3.mouse(track.plotContainer.node())[1];
					let depth = Math.round(transformY.invert(y));
					if (!startDepth) startDepth = depth;
					endDepth = depth;
					if (startDepth < endDepth) {
						for (let y = startDepth; y <= endDepth; y++) {
							maskData[y] = true;
						}
					} else {
						for (let y = endDepth; y <= startDepth; y++) {
							maskData[y] = true;
						}
					}
					graph.plotSelection(wiD3Ctrl, selector.id, maskData);
				})
				.on('end', function () {
					if (track.mode != 'UseSelector') return;
					wiComponentService.dropComponent('selector');
					logTracks.forEach(function (tr) {
						tr.setMode(null);
						tr.plotContainer.on('.drag', null)
					});
					maskData = track.getSelection(selector.id).maskData;
					let selectionData = track.getSelection(selector.id).updateSelectionData();

					if (self.plotModels.histogram) {
						let createdHistogramId = self.plotModels.histogram.properties.idHistogram;
						let createdHistogramComponent = 'histogram' + createdHistogramId + 'comboview' + self.wiComboviewCtrl.id;
						let createdHistogram = wiComponentService.getComponent(createdHistogramComponent);
						let createdHistogramD3Area = wiComponentService.getComponent(createdHistogramComponent + 'D3Area');
						let visHistogram = createdHistogramD3Area.visHistogram;
						visHistogram.setSelectionData(selectionData, selector);
						visHistogram._doPlot();
					}
					if (self.plotModels.crossplot) {
						let createdCrossplotId = self.plotModels.crossplot.properties.idCrossPlot;
						let createdCrossplotComponent = 'crossplot' + createdCrossplotId + 'comboview' + self.wiComboviewCtrl.id;
						let createdCrossplot = wiComponentService.getComponent(createdCrossplotComponent);
						let createdCrossplotD3Area = wiComponentService.getComponent(createdCrossplotComponent + 'D3Area');
						let viCrossplot = createdCrossplotD3Area.viCrossplot;
						viCrossplot.setSelectionData(selectionData, selector);
						viCrossplot._doPlot();
					}
				})
			);
		});
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
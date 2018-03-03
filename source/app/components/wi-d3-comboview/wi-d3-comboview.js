const componentName = 'wiD3Comboview';
const moduleName = 'wi-d3-comboview';

function Controller($scope, $controller, wiComponentService, $timeout, ModalService, wiApiService, $compile) {
	let self = this;

	let utils = wiComponentService.getComponent(wiComponentService.UTILS);
	let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
	let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

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
			// newScope.viSelections = self.wiComboviewCtrl.selections;
			newScope.viSelections = self.viSelections;
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
		// let selections = self.wiComboviewCtrl.selections;
		// selections.forEach(function(selectionConfig) {
		// 	let viSelection = graph.createSelection(selectionConfig);
		// 	self.viSelections.push(viSelection);
		// });
		self.createLayout(self.comboviewAreaId);
		$(document).on('resize', function () {
			self.layoutManager.updateSize();
		});
		configCombinedPlotProperties(self.plotModels);
	}

	this.getModel = function () {
		return self.wiComboviewCtrl.getModel();
	}

	this.$onInit = function () {
		self.comboviewAreaId = self.name + 'ComboviewArea';
		self.suffix = self.wiComboviewCtrl.name;
		self.viSelections = [];
		let selections = self.wiComboviewModel.properties.selections;
		selections.forEach(function(selectionConfig) {
			let viSelection = graph.createSelection(selectionConfig);
			self.viSelections.push(viSelection);
		});
		self.plotModels = {
			logplot: self.wiComboviewModel.properties.plots[0],
			histogram: self.wiComboviewModel.properties.histograms[0],
			crossplot: self.wiComboviewModel.properties.crossplots[0]
		};
		// self.comboviewModel = self.getModel();
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

	this.configCombinedPlotProperties = configCombinedPlotProperties;

	function configCombinedPlotProperties(combinedPlotProps = {}) {
		const {logplot, histogram, crossplot} = combinedPlotProps;
		if (logplot || histogram || crossplot) {
			if (logplot) self.addLogplot(logplot);
			if (histogram) self.addHistogram(histogram);
			if (crossplot) self.addCrossplot(crossplot);
			let dataRequest = {
				idWell: self.wiComboviewModel.properties.idWell,
				name: self.wiComboviewModel.properties.name,
				idCombinedBox: self.wiComboviewCtrl.id,
				idLogPlots: logplot.idPlot,
				idCrossPlots: crossplot.idCrossPlot,
				idHistograms: histogram.idHistogram
			};
			wiApiService.editCombinedBox(dataRequest);
		}
		else {
			DialogUtils.combinedPlotPropertiesDialog(ModalService, configCombinedPlotProperties);
		}
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
		let selection = self.viSelections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		let createdLogplotId = self.plotModels.logplot.properties.idPlot;
		let wiD3Ctrl = wiComponentService.getComponent('logplot' + createdLogplotId + self.suffix).getwiD3Ctrl();
		let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
		logTracks.forEach(function (track) {
			track.setMode('UseSelector');
			let transformY = track.getTransformY();
			let startDepth, stopDepth, maskData = {};
			track.plotContainer.call(d3.drag()
				.on('drag', function () {
					if (track.mode != 'UseSelector') return;
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
					graph.plotSelection(wiD3Ctrl, selection.idSelectionTool, maskData);
				})
				.on('end', function () {
					if (track.mode != 'UseSelector') return;
					wiComponentService.dropComponent('selector');
					logTracks.forEach(function (tr) {
						tr.setMode(null);
						tr.plotContainer.on('.drag', null);
					});
					selection.setData(maskData);
					selection.data = calculateData(selection.data);

					let reqSelection = {
						idCombinedBox: selection.idCombinedBox,
						idCombinedBoxTool: selection.idCombinedBoxTool,
						idSelectionTool: selection.idSelectionTool,
						data: selection.data
					};

					wiApiService.editSelectionTool(reqSelection, function (returnedSelection) {
						if (!returnedSelection) return;
						let selectionProps = returnedSelection;
						selectionProps.name = selection.name;
						selectionProps.color = selection.color;
					if (self.plotModels.histogram) {
						let createdHistogramId = self.plotModels.histogram.properties.idHistogram;
						let createdHistogramComponent = 'histogram' + createdHistogramId + 'comboview' + self.wiComboviewCtrl.id;
						let createdHistogram = wiComponentService.getComponent(createdHistogramComponent);
						let createdHistogramD3Area = wiComponentService.getComponent(createdHistogramComponent + 'D3Area');
						let visHistogram = createdHistogramD3Area.visHistogram;
							visHistogram.setSelection(selectionProps);
						visHistogram._doPlot();
					}
					if (self.plotModels.crossplot) {
						let createdCrossplotId = self.plotModels.crossplot.properties.idCrossPlot;
						let createdCrossplotComponent = 'crossplot' + createdCrossplotId + 'comboview' + self.wiComboviewCtrl.id;
						let createdCrossplot = wiComponentService.getComponent(createdCrossplotComponent);
						let createdCrossplotD3Area = wiComponentService.getComponent(createdCrossplotComponent + 'D3Area');
						let viCrossplot = createdCrossplotD3Area.viCrossplot;
							viCrossplot.setSelection(selectionProps);
						viCrossplot._doPlot();
					}
					});
				})
			);
		});
	}

	function calculateData(data) {
		const mask = new Set();
		data.forEach(d => {
			const startDepth = Math.min(+d.startDepth, +d.stopDepth);
			const stopDepth = Math.max(+d.startDepth, +d.stopDepth);
			for (let i = startDepth; i <= stopDepth; i++) mask.add(i);
		})
		const newData = [];
		const depths = Array.from(mask.values()).sort((a, b) => a - b);
		if (!depths.length) return data;
		let c = depths[0];
		for (let i = 0; i < depths.length; i++) {
			if (depths[i + 1] !== depths[i] + 1 || i === length - 1) {
				newData.push({ startDepth: c, stopDepth: depths[i] });
				c = depths[i + 1];
			}
		}
		return newData;
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
		wiComboviewCtrl: '<',
		wiComboviewModel: '<'
	}
});

exports.name = moduleName;
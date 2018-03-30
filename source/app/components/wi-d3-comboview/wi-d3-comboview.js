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
				if (state.name) wiComponentService.dropComponent(state.name);
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
			let dataRequest = {
				idWell: self.wiComboviewModel.properties.idWell,
				name: self.wiComboviewModel.properties.name,
				idCombinedBox: self.wiComboviewCtrl.id
			};
			if (logplot) {
				if (logplot.properties) logplot.idPlot = logplot.properties.idPlot;
				let wells = wiComponentService.getComponent('project-loaded').wells;
				for (let i = 0; i < wells.length; i++) {
					wells[i].idWell = logplot.idWell;
					for (let j = 0; j < self.viSelections.length; j++) {
						self.viSelections[j].wellForLogplot = wells[i];
					}
					break;
				}
				self.addLogplot(logplot);
				dataRequest.idLogPlots = logplot.idPlot;
			}
			if (histogram) {
				if (histogram.properties) histogram.idHistogram = histogram.properties.idHistogram;
				self.addHistogram(histogram);
				dataRequest.idHistograms = histogram.idHistogram;
			}
			if (crossplot) {
				if (crossplot.properties) crossplot.idCrossPlot = crossplot.properties.idCrossPlot;
				self.addCrossplot(crossplot);
				dataRequest.idCrossPlots = crossplot.idCrossPlot;
			}
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

	this.drawSelectionOnLogplot = function (selector, type) {
		if (!self.plotModels.logplot || !selector) return;
		let selection = self.viSelections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		let createdLogplotId = self.plotModels.logplot.properties.idPlot;
		let wiD3Ctrl = wiComponentService.getComponent('logplot' + createdLogplotId + self.suffix).getwiD3Ctrl();
		let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
		logTracks.forEach(function (track) {
			track.setMode('UseSelector');
			selection.canvasLogtrack.raise();
			let transformY = track.getTransformY();
			let startDepth, endDepth, maskData = {};
			track.plotContainer.call(d3.drag()
				.on('drag', function () {
					if (track.mode != 'UseSelector') return;
					switch (type) {
						case 'select':
							selection.color = selector.color;
							break;
						case 'erase':
							selection.color = 'white';
							break;
					}
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
					logTracks.forEach(function (tr) {
						tr.setMode(null);
						tr.plotContainer.on('.drag', null);
					});
					selection.setMode(null, 'crossplot');
					selection.setMode(null, 'histogram');
					selection.setMode(null, 'logplot');
					selection.color = selector.color;
					const well = wiD3Ctrl.wiLogplotCtrl.wellModel;
					const topDepth = well.topDepth;
					const step = well.step;
					let newSelectionData = [];
					for (let depth in maskData) {
						newSelectionData.push(Math.round((depth - topDepth) / step));
					}
					console.log('newSelectionData', newSelectionData);

					selection.well = well;
					selection.data = selection.data.concat(newSelectionData).sort();
					selection.data = [ ...new Set(selection.data) ];
					selection.maskData = [];
					resolveSelectionData(selection.idSelectionTool, newSelectionData, type);

					console.log('selection.data', selection.data);
					// selection.setData(maskData);
					// selection.data = calculateData(selection.data);

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

	this.drawSelectionOnCrossplot = function (selector, type) {
		if (!self.plotModels.crossplot || !selector) return;
		let selection = self.viSelections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		let createdCrossplotId = self.plotModels.crossplot.properties.idCrossPlot;
		let createdCrossplotComponent = 'crossplot' + createdCrossplotId + 'comboview' + self.wiComboviewCtrl.id;
		let createdCrossplot = wiComponentService.getComponent(createdCrossplotComponent);
		let createdCrossplotD3Area = wiComponentService.getComponent(createdCrossplotComponent + 'D3Area');
		let viCrossplot = createdCrossplotD3Area.viCrossplot;
		let viSelection = viCrossplot.getSelection(selection.idSelectionTool);
		let ctx = viSelection.canvas.node().getContext('2d');
		let transformX = viCrossplot.getTransformX();
		let transformY = viCrossplot.getTransformY();
		let drawnPoints = [];
		let rootData = viCrossplot.data;
		viSelection.setMode('UseSelector', 'crossplot');
		ctx.fillStyle = viSelection.color;
		viSelection.canvas.call(d3.drag()
			.on('drag', function() {
				if (viSelection.mode != 'UseSelector') return;
				switch (type) {
					case 'select':
						viSelection.color = selector.color;
						break;
					case 'erase':
						viSelection.color = viCrossplot.pointSet.pointColor;
						break;
				}
				let pointer = d3.mouse(viSelection.canvas.node());
				let pointerX = pointer[0];
				let pointerY = pointer[1];

				if (nearPoint(pointerX, pointerY, viCrossplot.ctx)) {
					ctx.beginPath();
					ctx.fillStyle = viSelection.color;
					switch (type) {
						case 'select':
							ctx.arc(pointerX, pointerY, 1.5, 0, Math.PI*2, true);
							break;
						case 'erase':
							ctx.arc(pointerX, pointerY, 2.5, 0, Math.PI*2, true);
							break;
					}
					ctx.fill();
					let x = Math.round(transformX.invert(pointerX));
					let y = Math.round(transformY.invert(pointerY));
					drawnPoints.push({x, y});
				}
			})
			.on('end', function() {
				if (viSelection.mode != 'UseSelector') return;
				viSelection.setMode(null, 'crossplot');
				viSelection.setMode(null, 'histogram');
				viSelection.setMode(null, 'logplot');
				viSelection.canvas.on('.drag', null);
				viSelection.color = selector.color;
				if (drawnPoints.length) {
					const well = viCrossplot.well;
					const topDepth = well.topDepth;
					const step = well.step;
					let newSelectionData = [];
					let epsilon;
					switch (type) {
						case 'select':
							epsilon = 1;
							break;
						case 'erase':
							epsilon = 1.5;
							break;
					}
					newSelectionData = rootData.filter(d => {
						let objPoint = drawnPoints.find(p => Math.abs(p.x - d.x) <= epsilon && Math.abs(p.y - d.y) <= epsilon);
						return objPoint;
					}).map(function(d) {
						return Math.round((d.depth - topDepth) / step);
					});
					console.log('newSelectionData', newSelectionData);

					selection.data = selection.data.concat(newSelectionData).sort();
					selection.data = [ ...new Set(selection.data) ];

					resolveSelectionData(selection.idSelectionTool, newSelectionData, type);
					console.log('selection.data', selection.data);

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
						viCrossplot._doPlot();
						if (self.plotModels.logplot) {
							let createdLogplotId = self.plotModels.logplot.properties.idPlot;
							let wiD3Ctrl = wiComponentService.getComponent('logplot' + createdLogplotId + self.suffix).getwiD3Ctrl();
							let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
							logTracks.forEach(function (tr) {
								tr.setMode(null);
								tr.plotContainer.on('.drag', null);
							});
							viSelection.doPlot();
						}
						if (self.plotModels.histogram) {
							let createdHistogramId = self.plotModels.histogram.properties.idHistogram;
							let createdHistogramComponent = 'histogram' + createdHistogramId + 'comboview' + self.wiComboviewCtrl.id;
							let createdHistogram = wiComponentService.getComponent(createdHistogramComponent);
							let createdHistogramD3Area = wiComponentService.getComponent(createdHistogramComponent + 'D3Area');
							let visHistogram = createdHistogramD3Area.visHistogram;
							visHistogram.setSelection(selectionProps);
							visHistogram._doPlot();
						}
					});
				}
			})
		);
	}

	this.drawSelectionOnHistogram = function (selector, type) {
		if (!self.plotModels.histogram || !selector) return;
		let selection = self.viSelections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		let createdHistogramId = self.plotModels.histogram.properties.idHistogram;
		let createdHistogramComponent = 'histogram' + createdHistogramId + 'comboview' + self.wiComboviewCtrl.id;
		let createdHistogram = wiComponentService.getComponent(createdHistogramComponent);
		let createdHistogramD3Area = wiComponentService.getComponent(createdHistogramComponent + 'D3Area');
		let visHistogram = createdHistogramD3Area.visHistogram;
		let viSelection = visHistogram.getSelection(selection.idSelectionTool);
		let transformX = visHistogram.getTransformX();
		let transformY = visHistogram.getTransformY();
		let discriminatorData = visHistogram.discriminatorData;
		let fullBins = visHistogram.fullBins;
		let fullBars = d3.select('.vi-histogram-svg').selectAll('rect');
		let selectionBins = viSelection.selectionBins;
		console.log('full and selection', fullBins, selectionBins);
		let selectionBars = d3.select('#histogram' + viSelection.idSelectionTool + viSelection.name.replace(/\s+/g, '')).selectAll('rect');
		let drawnBins = [];
		viSelection.setMode('UseSelector', 'histogram');
		viSelection.svg.call(d3.drag()
			.on('drag', function() {
				if (viSelection.mode != 'UseSelector') return;
				let pointer = d3.mouse(viSelection.svg.node());
				let pointerX = pointer[0];
				let x = Math.round(transformX.invert(pointerX));
				let idx, bin;
				switch (type) {
					case 'select':
						viSelection.color = selector.color;
						idx = fullBins.indexOf(fullBins.find(b => Math.min(b.x0, b.x1) <= x && x <= Math.max(b.x0, b.x1)));
						bin = fullBins[idx];
						if (drawnBins.indexOf(bin) == -1) drawnBins.push(bin);
						d3.select(fullBars._groups[0][idx]).attr('fill', viSelection.color);
						break;
					case 'erase':
						viSelection.color = visHistogram.histogramModel.properties.color;
						for (let i = 0; i < selectionBins.length; i++) {
							idx = selectionBins[i].indexOf(selectionBins[i].find(b => Math.min(b.x0, b.x1) <= x && x <= Math.max(b.x0, b.x1)));
							bin = selectionBins[i][idx];
							if (drawnBins.indexOf(bin) == -1) drawnBins.push(bin);
							d3.select(selectionBars._groups[0][i][idx]).attr('fill', viSelection.color);
						}
						break;
					}
			})
			.on('end', function() {
				if (viSelection.mode != 'UseSelector') return;
				viSelection.setMode(null, 'histogram');
				viSelection.setMode(null, 'crossplot');
				viSelection.setMode(null, 'logplot');
				viSelection.svg.on('.drag', null);
				viSelection.color = selector.color;
				console.log('drawnBins', drawnBins);
				let dataY = new Set();
				drawnBins.forEach(bin => {
					let x0 = bin.x0;
					let x1 = bin.x1;
					let discriminatorArr = discriminatorData.filter(d => Math.min(x0, x1) <= +d.x && +d.x <= Math.max(x0, x1));
					discriminatorArr.forEach(d => dataY.add(+d.y));
				});
				console.log('dataY', dataY);
				let newSelectionData = Array.from(dataY.values()).sort((a, b) => a - b);

				selection.data = selection.data.concat(newSelectionData).sort();
				selection.data = [ ...new Set(selection.data) ];

				resolveSelectionData(selection.idSelectionTool, newSelectionData, type);

				let reqSelection = {
					idCombinedBox: selection.idCombinedBox,
					idCombinedBoxTool: selection.idCombinedBoxTool,
					idSelectionTool: selection.idSelectionTool,
					data: selection.data
				};

				wiApiService.editSelectionTool(reqSelection, function (returnedSelection) {
					let selectionProps = returnedSelection;
					selectionProps.name = selection.name;
					selectionProps.color = selection.color;
					visHistogram._doPlot();

					if (self.plotModels.logplot) {
						let createdLogplotId = self.plotModels.logplot.properties.idPlot;
						let wiD3Ctrl = wiComponentService.getComponent('logplot' + createdLogplotId + self.suffix).getwiD3Ctrl();
						let logTracks = wiD3Ctrl.getTracks().filter(track => track.type == 'log-track');
						logTracks.forEach(function (tr) {
							tr.setMode(null);
							tr.plotContainer.on('.drag', null);
							tr.plotAllDrawings();
						});
						// viSelection.doPlot();
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
		)
	}

	function resolveSelectionData(idSelectionTool, data, type) {
		switch (type) {
			case 'select':
				self.viSelections.forEach(selection => {
					if (selection.idSelectionTool != idSelectionTool) {
						if (!selection.data.length) return;
						selection.data = selection.data.filter(d => !data.includes(d));
						selection.newSelectionData = selection.newSelectionData.filter(d => !data.includes(d));
					}
				});
				break;
			case 'erase':
				let selection = self.viSelections.find(s => s.idSelectionTool == idSelectionTool);
				selection.data = selection.data.filter(d => !data.includes(d));
				selection.newSelectionData = [];
		}
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

	function nearPoint(x, y, ctx) {
		const e = 0.5;
		let imgData = ctx.getImageData(x-e, y-e, e*2, e*2);
		let r, g, b, a;
		for (let i = 0; i < imgData.width * imgData.height; i ++) {
			r = imgData.data[i * 4];
			g = imgData.data[i * 4 + 1];
			b = imgData.data[i * 4 + 2];
			a = imgData.data[i * 4 + 3];

			if (r > 0 || g > 0 || b > 0 || a > 0)
				return true;
		}
		return false;
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
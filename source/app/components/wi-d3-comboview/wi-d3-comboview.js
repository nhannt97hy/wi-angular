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
			newScope.selections = self.selections;
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
		self.selections = self.wiComboviewModel.properties.selections;
		self.selections.forEach(selection => selection.newSelectionData = []);
		const props = self.wiComboviewModel.properties;
		const _logplots = props.plots || [];
		const _histograms = props.histograms || [];
		const _crossplots = props.crossplots || [];
		self.plotModels = {
			logplots: _logplots,
			histograms: _histograms,
			crossplots: _crossplots
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

	function configCombinedPlotProperties(plotModels = {}) {
		const {logplots, histograms, crossplots} = plotModels;
		if (logplots || histograms || crossplots) {
			let dataRequest = {
				idWell: self.wiComboviewModel.properties.idWell,
				name: self.wiComboviewModel.properties.name,
				idCombinedBox: self.wiComboviewCtrl.id,
				idLogPlots: [],
				idHistograms: [],
				idCrossPlots: []
			};
			async.series([function (next) {
				if (logplots && logplots.length) {
					logplots.forEach(logplot => {
						if (logplot.properties) logplot.idPlot = logplot.properties.idPlot;
						self.addLogplot(logplot);
						dataRequest.idLogPlots.push(logplot.idPlot);
						dataRequest.idLogPlots = [ ...new Set(dataRequest.idLogPlots) ];
					});
					if (!self.plotModels.logplots.length) self.plotModels.logplots = logplots;
					next();
				} else {
					next();
				}
			}, function (next) {
				if (histograms && histograms.length) {
					histograms.forEach(histogram => {
						if (histogram.properties) histogram.idHistogram = histogram.properties.idHistogram;
						self.addHistogram(histogram);
						dataRequest.idHistograms.push(histogram.idHistogram);
						dataRequest.idHistograms = [ ...new Set(dataRequest.idHistograms) ];
					});
					if (!self.plotModels.histograms.length) self.plotModels.histograms = histograms;
					next();
				} else {
					next();
				}
			}, function (next) {
				if (crossplots && crossplots.length) {
					crossplots.forEach(crossplot => {
						if (crossplot.properties) crossplot.idCrossPlot = crossplot.properties.idCrossPlot;
						self.addCrossplot(crossplot);
						dataRequest.idCrossPlots.push(crossplot.idCrossPlot);
						dataRequest.idCrossPlots = [ ...new Set(dataRequest.idCrossPlots) ];
					});
					if (!self.plotModels.crossplots.length) self.plotModels.crossplots = crossplots;
					next();
				} else {
					next();
				}
			}, function () {
				wiApiService.editCombinedBox(dataRequest, async function(callback) {
					self.viLogTracks = await getAllViLogtracks();
					self.viHistograms = await getAllViHistograms();
					self.viCrossplots = await getAllViCrossplots();
				});
			}]);
		}
		else {
			// fixing
			DialogUtils.combinedPlotPropertiesDialog(ModalService, self.plotModels, configCombinedPlotProperties);
		}
	}

	this.addLogplot = function (logplotProps) {
		if (!logplotProps || !logplotProps.idPlot) return;
		let logplotModel = utils.getModel('logplot', logplotProps.idPlot);

		self.putObjectComponent(logplotModel);
	}

	this.addHistogram = function (histogramProps) {
		if (!histogramProps || !histogramProps.idHistogram) return;
		let histogramModel = utils.getModel('histogram', histogramProps.idHistogram);

		self.putObjectComponent(histogramModel);
	}

	this.addCrossplot = function (crossplotProps) {
		if (!crossplotProps || !crossplotProps.idCrossPlot) return;
		let crossplotModel = utils.getModel('crossplot', crossplotProps.idCrossPlot);

		self.putObjectComponent(crossplotModel);
	}

	this.drawSelectionOnLogplot = function (selector, type) {
		if (!self.plotModels.logplots.length || !selector) return;
		let selection = self.selections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		self.viLogTracks.forEach(track => {
			let viSelection = track.getSelection(selection.idSelectionTool);
			track.setMode('UseSelector');
			viSelection.canvasLogtrack.raise();
			let transformY = track.getTransformY();
			let startDepth, endDepth, maskData = {};
			track.plotContainer.call(d3.drag()
				.on('drag', function () {
					if (track.mode != 'UseSelector') return;
					let color;
					switch (type) {
						case 'select':
							color = selector.color;
							break;
						case 'erase':
							color = '#ffffe0';
							break;
					}
					let y = d3.mouse(track.plotContainer.node())[1];
					let depth = Math.round(transformY.invert(y));
					if (!startDepth) startDepth = depth;
					endDepth = depth;
					maskData = {startDepth, endDepth};
					graph.plotSelection(self.viLogTracks, viSelection.idSelectionTool, color, maskData);
				})
				.on('end', function () {
					if (track.mode != 'UseSelector') return;
					self.viLogTracks.forEach(function (tr) {
						tr.getSelection(viSelection.idSelectionTool).color = selector.color;
					});
					startDepth = 0;
					const offsetY = track.offsetY;
					const yStep = track.yStep;
					let newSelectionData = [];
					console.log('mask data', maskData);
					const startD = Math.min(maskData.startDepth, maskData.endDepth);
					const endD = Math.max(maskData.startDepth, maskData.endDepth);
					const startY = Math.round((startD - offsetY) / yStep);
					const endY = Math.round((endD - offsetY) / yStep);
					for (let y = startY; y <= endY; y++)
						newSelectionData.push(y);
					console.log('newSelectionData', newSelectionData);

					selection.data = selection.data.concat(newSelectionData).sort();
					selection.data = [ ...new Set(selection.data) ];
					selection.maskData = {};
					resolveSelectionData(selection.idSelectionTool, newSelectionData, type);
					let data = self.selections.find(s => s.idSelectionTool == selection.idSelectionTool).data;
					if (selection.newSelectionData === undefined) selection.newSelectionData = newSelectionData;

					console.log('data', data);

					let reqSelection = {
						idSelectionTool: selection.idSelectionTool,
						data: data
					};

					wiApiService.editSelectionTool(reqSelection, function (returnedSelection) {
						if (!returnedSelection) return;
						let selectionProps = returnedSelection;
						selectionProps.name = selection.name;
						selectionProps.color = selection.color;
						self.viLogTracks.forEach(function (tr) {
							self.selections.forEach(selection => {
								tr.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
								tr.getSelection(selection.idSelectionTool).data = selection.data;
							});
							tr.plotAllDrawings();
						});
						if (self.plotModels.histograms.length) {
							self.viHistograms.forEach(visHistogram => {
								self.selections.forEach(selection => {
									visHistogram.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
									visHistogram.getSelection(selection.idSelectionTool).data = selection.data;
									visHistogram.setSelection(selectionProps);
								});
								let viSelection = visHistogram.getSelection(returnedSelection.idSelectionTool);
								visHistogram._doPlot();
								viSelection.svg.raise();
							});
						}
						if (self.plotModels.crossplots.length) {
							self.viCrossplots.forEach(viCrossplot => {
								self.selections.forEach(selection => {
									viCrossplot.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
									viCrossplot.getSelection(selection.idSelectionTool).data = selection.data;
									viCrossplot.setSelection(selectionProps);
								});
								let viSelection = viCrossplot.getSelection(returnedSelection.idSelectionTool);
								viCrossplot._doPlot();
								viSelection.canvas.raise();
							});
						}
					});
				})
			);
		});
	}

	this.drawSelectionOnCrossplot = function (selector, type) {
		if (!self.plotModels.crossplots.length || !selector) return;
		let selection = self.selections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		self.viCrossplots.forEach(viCrossplot => {
			let viSelection = viCrossplot.getSelection(selection.idSelectionTool);
			let ctx = viSelection.canvas.node().getContext('2d');
			let transformX = viCrossplot.getTransformX();
			let transformY = viCrossplot.getTransformY();
			let drawnPoints = [];
			let rootData = viCrossplot.data;
			viCrossplot.mode = 'UseSelector';
			viSelection.setMode('UseSelector', 'crossplot');
			ctx.fillStyle = viSelection.color;
			viSelection.canvas.call(d3.drag()
				.on('drag', function () {
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
								ctx.arc(pointerX, pointerY, 2, 0, Math.PI * 2, true);
								break;
							case 'erase':
								ctx.arc(pointerX, pointerY, 2.5, 0, Math.PI * 2, true);
								break;
						}
						ctx.fill();
						let x = Math.round(transformX.invert(pointerX));
						let y = Math.round(transformY.invert(pointerY));
						drawnPoints.push({ x, y });
					}
				})
				.on('end', function () {
					if (viSelection.mode != 'UseSelector') return;
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
								epsilon = 2;
								break;
						}
						newSelectionData = rootData.filter(d => {
							let objPoint = drawnPoints.find(p => Math.abs(p.x - d.x) <= epsilon && Math.abs(p.y - d.y) <= epsilon);
							return objPoint;
						}).map(function (d) {
							return Math.round((d.depth - topDepth) / step);
						});
						console.log('newSelectionData', newSelectionData);

						selection.data = selection.data.concat(newSelectionData).sort();
						selection.data = [...new Set(selection.data)];
						resolveSelectionData(selection.idSelectionTool, newSelectionData, type);
						let data = self.selections.find(s => s.idSelectionTool == selection.idSelectionTool).data;
						if (selection.newSelectionData === undefined) selection.newSelectionData = newSelectionData;

						console.log('data', data);

						let reqSelection = {
							idSelectionTool: selection.idSelectionTool,
							data: data
						};

						wiApiService.editSelectionTool(reqSelection, function (returnedSelection) {
							if (!returnedSelection) return;
							let selectionProps = returnedSelection;
							selectionProps.name = selection.name;
							selectionProps.color = selection.color;
							self.selections.forEach(selection => {
								viCrossplot.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
								viCrossplot.getSelection(selection.idSelectionTool).data = selection.data;
							});
							viCrossplot._doPlot();
							viSelection.canvas.raise();
							if (self.plotModels.logplots.length) {
								self.viLogTracks.forEach(tr => {
									self.selections.forEach(selection => {
										tr.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
										tr.getSelection(selection.idSelectionTool).data = selection.data;
									});
									tr.plotAllDrawings();
								});
							}
							if (self.plotModels.histograms.length) {
								self.viHistograms.forEach(visHistogram => {
									self.selections.forEach(selection => {
										visHistogram.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
										visHistogram.getSelection(selection.idSelectionTool).data = selection.data;
										visHistogram.setSelection(selectionProps);
									});
									let viSelection = visHistogram.getSelection(returnedSelection.idSelectionTool);
									visHistogram._doPlot();
									viSelection.svg.raise();
								});
							}
						});
					}
				})
			);
		});
	}

	this.drawSelectionOnHistogram = function (selector, type) {
		if (!self.plotModels.histograms.length || !selector) return;
		let selection = self.selections.find(s => s.idCombinedBoxTool == selector.idCombinedBoxTool);
		self.viHistograms.forEach(visHistogram => {
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
			visHistogram.mode = 'UseSelector';
			viSelection.setMode('UseSelector', 'histogram');
			viSelection.svg.call(d3.drag()
				.on('drag', function () {
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
				.on('end', function () {
					if (viSelection.mode != 'UseSelector') return;
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
					selection.data = [...new Set(selection.data)];
					resolveSelectionData(selection.idSelectionTool, newSelectionData, type);
					let data = self.selections.find(s => s.idSelectionTool == selection.idSelectionTool).data;
					if (selection.newSelectionData === undefined) selection.newSelectionData = newSelectionData;

					let reqSelection = {
						idSelectionTool: selection.idSelectionTool,
						data: data
					};

					wiApiService.editSelectionTool(reqSelection, function (returnedSelection) {
						let selectionProps = returnedSelection;
						selectionProps.name = selection.name;
						selectionProps.color = selection.color;
						self.selections.forEach(selection => {
							visHistogram.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
							visHistogram.getSelection(selection.idSelectionTool).data = selection.data;
						});
						visHistogram._doPlot();
						viSelection.svg.raise();

						if (self.plotModels.logplots.length) {
							self.viLogTracks.forEach(tr => {
								self.selections.forEach(selection => {
									tr.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
									tr.getSelection(selection.idSelectionTool).data = selection.data;
								});
								tr.plotAllDrawings();
							});
						}
						if (self.plotModels.crossplots.length) {
							self.viCrossplots.forEach(viCrossplot => {
								self.selections.forEach(selection => {
									viCrossplot.getSelection(selection.idSelectionTool).newSelectionData = selection.newSelectionData;
									viCrossplot.getSelection(selection.idSelectionTool).data = selection.data;
									viCrossplot.setSelection(selectionProps);
								});
								let viSelection = viCrossplot.getSelection(returnedSelection.idSelectionTool);
								viCrossplot._doPlot();
								viSelection.canvas.raise();
							});
						}
					});
				})
			)
		});
	}

	this.updateSelections = function () {
		self.selections.forEach(selection => {
			switch (selection.status) {
				case 'NEW':
					delete selection.status;
					self.viLogTracks.forEach(viLogtrack => {
						selection.wellForLogplot = {
							topDepth: viLogtrack.offsetY,
							step: viLogtrack.yStep
						};
						selection.newSelectionData = [];
						let viSelection = viLogtrack.addSelection(selection);
						viSelection.newSelectionData = [];
						viSelection.color = selection.color;
						viSelection.name = selection.name;
						viLogtrack.plotAllDrawings();
					});
					self.viHistograms.forEach(viHistogram => {
						selection.newSelectionData = [];
						let viSelection = viHistogram.addViSelectionToHistogram(selection);
						viSelection.newSelectionData = [];
						viSelection.color = selection.color;
						viSelection.name = selection.name;
						viHistogram._doPlot();
					});
					self.viCrossplots.forEach(viCrossplot => {
						selection.newSelectionData = [];
						let viSelection = viCrossplot.addViSelectionToCrossplot(selection);
						viSelection.newSelectionData = [];
						viSelection.color = selection.color;
						viSelection.name = selection.name;
						viCrossplot._doPlot();
					});
					break;
				case 'EDIT':
					delete selection.status;
					self.viLogTracks.forEach(viLogtrack => {
						let viSelection = viLogtrack.getSelection(selection.idSelectionTool);
						viSelection.color = selection.color;
						viSelection.name = selection.name;
						viLogtrack.plotAllDrawings();
					});
					self.viHistograms.forEach(viHistogram => {
						let viSelection = viHistogram.getSelection(selection.idSelectionTool);
						viSelection.color = selection.color;
						viSelection.name = selection.name;
						viHistogram._doPlot();
					});
					self.viCrossplots.forEach(viCrossplot => {
						let viSelection = viCrossplot.getSelection(selection.idSelectionTool);
						viSelection.color = selection.color;
						viSelection.name = selection.name;
						viCrossplot._doPlot();
					});
					break;
				case 'DEFAULT':
					delete selection.status;
					break;
				default:
					self.viLogTracks.forEach(viLogtrack => {
						let viSelection = viLogtrack.getSelection(selection.idSelectionTool);
						viLogtrack.removeDrawing(viSelection);
						viLogtrack.plotAllDrawings();
					});
					self.viHistograms.forEach(viHistogram => {
						let viSelection = viHistogram.getSelection(selection.idSelectionTool);
						viHistogram.removeViSelection(viSelection);
						viHistogram._doPlot();
					});
					self.viCrossplots.forEach(viCrossplot => {
						let viSelection = viCrossplot.getSelection(selection.idSelectionTool);
						viCrossplot.removeViSelection(viSelection);
						viCrossplot._doPlot();
					});
					self.selections.splice(self.selections.indexOf(selection), 1);
					break;
			}
		});
	}

	this.endAllSelections = function () {
		console.log('ended');
		self.viLogTracks.forEach(tr => {
			tr.setMode(null);
			tr.plotContainer.on('.drag', null);
		});
		self.viHistograms.forEach(visHistogram => {
			self.selections.forEach(selection => {
				let viSelection = visHistogram.getSelection(selection.idSelectionTool);
				viSelection.setMode(null, 'histogram');
				viSelection.svg.on('.drag', null);
			});
			visHistogram.setMode(null);
		});
		self.viCrossplots.forEach(viCrossplot => {
			self.selections.forEach(selection => {
				let viSelection = viCrossplot.getSelection(selection.idSelectionTool);
				viSelection.setMode(null, 'crossplot');
				viSelection.canvas.on('.drag', null);
			});
			viCrossplot.setMode(null);
		});
	}

	function resolveSelectionData(idSelectionTool, data, type) {
		switch (type) {
			case 'select':
				self.selections.forEach(selection => {
					if (selection.idSelectionTool != idSelectionTool) {
						if (!selection.data.length) return;
						selection.data = selection.data.filter(d => !data.includes(d));
						selection.newSelectionData = selection.newSelectionData.filter(d => !data.includes(d));
						let reqSelection = {
							idSelectionTool: selection.idSelectionTool,
							data: selection.data
						};
						wiApiService.editSelectionTool(reqSelection);
					}
				});
				break;
			case 'erase':
				self.selections.forEach(selection => {
					if (selection.idSelectionTool == idSelectionTool) {
						if (!selection.data.length) return;
						selection.data = selection.data.filter(d => !data.includes(d));
						selection.newSelectionData = [];
						return;
					}
				});
				break;
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

	function getAllViLogtracks () {
		function getViLogtracks (d3Ctrl) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if (!d3Ctrl.isReady) resolve(getViLogtracks(d3Ctrl));
					else {
						const viLogTracks = [];
						d3Ctrl.trackComponents.filter(tc => tc.idTrack).forEach(tc => {
							viLogTracks.push(tc.controller.viTrack);
						});
						resolve(viLogTracks);
					}
				}, 200);
			})
		}
		return new Promise(resolve => {
			let viLogTracks = [];
			async.each(self.plotModels.logplots, async (logplot, next) => {
				let createdLogplotId = logplot.idPlot;
				let wiD3Ctrl = wiComponentService.getComponent('logplot' + createdLogplotId + self.suffix).getwiD3Ctrl();
				let thisViLogTracks = await getViLogtracks(wiD3Ctrl);
				viLogTracks = viLogTracks.concat(thisViLogTracks);
				next();
			}, (err, results) => {
				resolve(viLogTracks);
			})
		})
	}
	function getAllViHistograms () {
		function getViHistogram (d3Ctrl) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					const viHistogram = d3Ctrl.visHistogram;
					if (viHistogram.constructor.name === 'Object') resolve(getViHistogram(d3Ctrl));
					else resolve(viHistogram);
				}, 200);
			})
		}
		return new Promise(resolve => {
			let viHistograms = [];
			async.each(self.plotModels.histograms, async (histogram, next) => {
				let createdHistogramId = histogram.idHistogram;
				let createdHistogramComponent = 'histogram' + createdHistogramId + 'comboview' + self.wiComboviewCtrl.id;
				let createdHistogramD3Area = wiComponentService.getComponent(createdHistogramComponent + 'D3Area');
				let viHistogram = await getViHistogram(createdHistogramD3Area);
				viHistograms.push(viHistogram);
				next();
			}, (err, results) => {
				resolve(viHistograms);
			})
		})
	}
	function getAllViCrossplots () {
		function getViCrossplot (d3Ctrl) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					const viCrossplot = d3Ctrl.viCrossplot;
					if (viCrossplot.constructor.name === 'Object') resolve(getViCrossplot(d3Ctrl));
					else resolve(viCrossplot);
				}, 200);
			})
		}
		return new Promise(resolve => {
			let viCrossplots = [];
			async.each(self.plotModels.crossplots, async (crossplot, next) => {
				let createdCrossplotId = crossplot.idCrossPlot;
				let createdCrossplotComponent = 'crossplot' + createdCrossplotId + 'comboview' + self.wiComboviewCtrl.id;
				let createdCrossplotD3Area = wiComponentService.getComponent(createdCrossplotComponent + 'D3Area');
				let viCrossplot = await getViCrossplot(createdCrossplotD3Area);
				viCrossplots.push(viCrossplot);
				next();
			}, (err, results) => {
				resolve(viCrossplots);
			})
		})
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

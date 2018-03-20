const componentName = 'wiComboview';
const moduleName = 'wi-comboview';

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout, $compile) {
	let self = this;
	let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
	let comboviewHandlers = wiComponentService.getComponent('COMBOVIEW_HANDLERS');
	let utils = wiComponentService.getComponent(wiComponentService.UTILS);
	let graph = wiComponentService.getComponent(wiComponentService.GRAPH);

	this.$onInit = function () {
		self.wiD3AreaName = self.name + 'D3Area';
		self.idD3Area = self.id + self.name;
		self.toolBox = self.model.properties.toolBox;

		if (self.name) wiComponentService.putComponent(self.name, self);

		$scope.handlers = {};
		utils.bindFunctions($scope.handlers, comboviewHandlers, {
		    $scope: $scope,
		    wiComponentService: wiComponentService,
		    wiApiService: wiApiService,
		    ModalService: ModalService,
		    $timeout: $timeout,
		    wiComboview: self
		});
	}

	this.getwiD3Ctrl = function () {
		return wiComponentService.getComponent(self.wiD3AreaName);
	}

	this.getModel = function () {
		return utils.findComboviewModelById(self.id);
	}

	this.editTool = function () {
		DialogUtils.editToolComboboxPropertiesDialog(ModalService, self.toolBox, self.id, function(data) {
			if (!data) return;
			self.toolBox = data;
			if (!self.toolBox.length) {
				self.getwiD3Ctrl().viSelections = [];
				return;
			}
			const _NEW = 'created';
			self.toolBox.forEach(function(tool) {
				switch (tool.status) {
					case _NEW:
						delete tool.status;
						tool.data = [];
						wiApiService.createSelectionTool(tool, function(selection) {
							let viSelection = graph.createSelection(selection);
							self.getwiD3Ctrl().viSelections.push(viSelection);
						});
						break;
				}
			});
		});
	}

	this.useSelector = function (selector) {
		console.log(selector);
		let wiD3Comboview = self.getwiD3Ctrl();
		wiD3Comboview.drawSelectionOnLogplot(selector, 'select');
		wiD3Comboview.drawSelectionOnCrossplot(selector, 'select');
		wiD3Comboview.drawSelectionOnHistogram(selector, 'select');
	}

	this.useEraser = function (eraser) {
		console.log(eraser);
		let wiD3Comboview = self.getwiD3Ctrl();
		wiD3Comboview.drawSelectionOnLogplot(eraser, 'erase');
		wiD3Comboview.drawSelectionOnCrossplot(eraser, 'erase');
		wiD3Comboview.drawSelectionOnHistogram(eraser, 'erase');
	}

	this.$onDestroy = function () {
		wiComponentService.dropComponent(self.name);
	}
}

let app = angular.module(moduleName, []);
app.component(componentName, {
	templateUrl: 'wi-comboview.html',
	controller: Controller,
	controllerAs: componentName,
	transclude: true,
	bindings: {
		name: '@',
		id: '@',
		model: '<'
	}
});

exports.name = moduleName;
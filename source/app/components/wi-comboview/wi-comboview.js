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
		let selections = self.getwiD3Ctrl().selections;
		let selection = {};
		DialogUtils.editToolComboboxPropertiesDialog(ModalService, self.toolBox, self.id, function(data) {
			if (!data) return;
			self.toolBox = data;

			const _NEW = 'created';
			const _EDIT = 'edited';
			async.eachSeries(self.toolBox, (tool, next) => {
				console.log('tool', tool.status);
				switch (tool.status) {
					case _NEW:
						delete tool.status;
						tool.data = [];
						wiApiService.createSelectionTool(tool, (s) => {
							s.color = tool.color;
							s.name = tool.name;
							s.status = 'NEW';
							selections.push(s);
							next();
						});
						break;
					case _EDIT:
						delete tool.status;
						selection = selections.find(s => s.idCombinedBoxTool == tool.idCombinedBoxTool);
						selection.color = tool.color;
						selection.name = tool.name;
						wiApiService.editSelectionTool(selection, (s) => {
							s.status = 'EDIT';
							selections[selections.indexOf(selection)] = s;
							next();
						});
						break;
					default:
						selection = selections.find(s => s.idCombinedBoxTool == tool.idCombinedBoxTool);
						selection.status = 'DEFAULT';
						next();
						break;
				}
			}, (next) => {
				console.log('selections', selections);
				self.getwiD3Ctrl().updateSelections();
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
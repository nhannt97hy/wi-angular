const componentName = 'wiComboview';
const moduleName = 'wi-comboview';

function Controller ($scope, wiComponentService, wiApiService, ModalService, $timeout, $compile) {
	let self = this;
	let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
	let comboviewHandlers = wiComponentService.getComponent('COMBOVIEW_HANDLERS');
	let utils = wiComponentService.getComponent(wiComponentService.UTILS);

	this.$onInit = function () {
		self.wiD3AreaName = self.name + 'D3Area';
		self.idD3Area = self.id + self.name;

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
		});
	}

	this.useSelector = function (selector) {
		console.log(selector);
		let wiD3Comboview = self.getwiD3Ctrl();
		wiD3Comboview.drawSelectionOnLogplot(selector);
	}

	this.useEraser = function (eraser) {
		console.log(eraser);
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
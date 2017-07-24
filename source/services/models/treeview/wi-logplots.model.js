const wiServiceName = 'WiLogplotsModel';
const moduleName = 'wi-logplots-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem) {
    function WiLogplotsModel(well) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'logplots';
            self.name = 'logplots';
            self.data.icon = 'logplot-blank-16x16';
            self.data.label = 'Logplot';

            angular.copy(well, self.data.payload);
        } catch (err) {
            console.error('Parse logplots model has error', err);
        }
    }

    return WiLogplotsModel;
});

exports.name = moduleName;
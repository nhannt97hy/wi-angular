const wiServiceName = 'WiLogplotModel';
const moduleName = 'wi-logplot-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem, WiProperty) {

    function WiLogplotModel(logplot) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'logplot';
            self.name = logplot['idPlot'] + 'logplot';
            self.data.icon = 'logplot-blank-16x16';
            self.data.label = logplot['name'];

            angular.copy(logplot, self.data.payload);
            // self.data.properties = parsePropertiesList(depth, dataset);
        } catch (err) {
            console.error('Parse logplot model has error', err);
        }
    }

    function parsePropertiesList(depth, dataset) {
        let property = new WiProperty();
        property.addNewItemListview('depths', 'Depths', {
            'End Depth': '',
            'Start Depth': '',
        });
        property.addNewItemListview('informations', 'Informations', {
            'Alias': '',
            'Curve Set Name': '',
            'Data File Path': "",
            'DataType' : '',
            'ExportName': '',
            'Family': '',
            'Name': 'Depth',
            'Unit': '',
            'Well Name': '',
        });
        property.addNewItemListview('values', 'Values', {
            'Max Value': '',
            'Mean Value': '',
            'Min Value': '',
        });

        return property;
    }

    return WiLogplotModel;
});

exports.name = moduleName;

const wiServiceName = 'WiCurve';
const moduleName = 'wi-curve-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem, WiProperty) {

    function WiCurve(curve, dataset) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'curve';
            self.name = curve['idCurve'] + 'curve';
            self.id = curve['idCurve'];
            // self.data.icon = 'curve-data-16x16';
            self.data.label = curve['name'];
            self.data.properties = parsePropertiesList(curve, dataset);

        } catch (err) {
            console.error('Parse curve model has error', err);
        }
    }

    function parsePropertiesList(curve, dataset) {
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

    return WiCurve;
});

exports.name = moduleName;
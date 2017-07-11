const wiServiceName = 'WiDepth';
const moduleName = 'wi-depth-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem, WiProperty) {
    /**
     * Sample item from server
     createdAt:"2017-07-10T10:17:30.000Z"
     curves:[]
     idDataset:7
     idWell:4
     name:"dataset-test"
     updatedAt:"2017-07-10T10:17:30.000Z"
     */

    function WiDepth(depth, dataset) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'depth';
            self.name = depth['idDepth'] + 'depth';
            self.data.icon = 'depth-blank-16x16';
            self.data.label = 'Depth';
            self.data.unit = 'M';
            self.data.properties = parsePropertiesList(depth, dataset);
        } catch (err) {
            console.error('Parse depth model has error', err);
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

    return WiDepth;
});

exports.name = moduleName;
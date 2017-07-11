const wiServiceName = 'WiCurve';
const moduleName = 'wi-curve-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem) {
    /**
     * Sample item from server
     createdAt:"2017-07-10T10:17:30.000Z"
     curves:[]
     idDataset:7
     idWell:4
     name:"dataset-test"
     updatedAt:"2017-07-10T10:17:30.000Z"
     */

    function WiCurve(curve) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'curve';
            self.name = curve['idCurve'] + 'curve';
            self.data.icon = 'curve-data-16x16';
            self.data.label = curve['name'];
        } catch (err) {
            console.error('Parse curve model has error', err);
        }
    }

    return WiCurve;
});

exports.name = moduleName;
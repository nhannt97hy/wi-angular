const wiServiceName = 'WiDataset';
const moduleName = 'wi-dataset-model';

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

    function WiDataset(dataset) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'dataset';
            self.name = dataset['idDataset'];
            self.data.icon = 'curve-data-16x16';
            self.data.label = dataset['name'];
        } catch (err) {
            console.error('Parse dataset model has error', err);
        }
    }

    return WiDataset;
});

exports.name = moduleName;
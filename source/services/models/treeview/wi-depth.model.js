const wiServiceName = 'WiDepth';
const moduleName = 'wi-depth-model';

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

    function WiDepth(depth) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();
        angular.copy(defaultTreeItem, self);

        try {
            self.type = 'depth';
            self.name = depth['idDepth'] + 'depth';
            self.data.icon = 'depth-blank-16x16';
            self.data.label = 'Depth';
        } catch (err) {
            console.error('Parse depth model has error', err);
        }
    }

    return WiDepth;
});

exports.name = moduleName;
const wiServiceName = 'WiWell';
const moduleName = 'wi-well';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiTreeItem) {
    /**
     * Sample item from server
     bottomDepth:"50"
     createdAt:"2017-07-05T10:26:47.000Z"
     idProject:1
     idWell:2
     name:"Well22"
     step:"30"
     topDepth:"10"
     updatedAt: "2017-07-05T10:26:47.000Z"
     */

    function WiWell(well) {
        let self = this;
        let defaultTreeItem = new WiTreeItem();

        try {
            defaultTreeItem.type = 'well';
            defaultTreeItem.name = well['idWell'];
            defaultTreeItem.data.icon = 'well-16x16';
            defaultTreeItem.data.label = well['name'];
        } catch (err) {
            console.error('Parse well model has error', err);
        }

        angular.extend(self, defaultTreeItem);
    }

    return WiWell;
});

exports.name = moduleName;
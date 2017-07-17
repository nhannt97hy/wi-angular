const wiServiceName = 'WiProperty';
const moduleName = 'wi-property-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function (WiListview) {

    function WiProperty() {
        this.listConfig = [];
        let self = this;

        // angular.copy(DEFAULT_PROPERTY_LISTVIEW, self);
    }

    WiProperty.prototype = {
        addListview : function (wiListview) {
            // let newList = {};
            // angular.copy(DEFAULT_PROPERTY_LISTVIEW, newList);
            //
            // newList.name = heading;
            // newList.heading = heading;
            // for (let item of items) {
            //     newList.data.push(item);
            // }

            this.listConfig.push(wiListview);
        },

        addNewItemListview: function (name, heading, items) {
            let newListview = new WiListview(name, heading, items);

            this.listConfig.push(newListview);
        }
    };

    return WiProperty;
});

exports.name = moduleName;
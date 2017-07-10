const wiServiceName = 'WiListview';
const moduleName = 'wi-listview-model';

let app = angular.module(moduleName, []);
app.factory(wiServiceName, function () {
    // const DEFAULT_LISTVIEW_ITEM = {
    //     name: '',
    //     heading: '',
    //     data: [
    //         // {
    //         //     key: 'key1',
    //         //     value: 'value'
    //         // }
    //     ]
    // };

    function WiListview(name, heading, items) {
        this.name = name;
        this.heading = heading;
        this.data = [];

        for(let item in items) {
            let newItemListview = {
                key: item,
                value: items[item]
            };

            this.data.push(newItemListview);
        }
    }

    return WiListview;
});

exports.name = moduleName;
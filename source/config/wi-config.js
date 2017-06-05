RIBBON_TAB_DATA_CONFIG = [
    {
        type: 'tab',
        name: 'project',
        active: true,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'New Project',
                handler: 'project-new-project'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Open Project',
                handler: 'project-open-project'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Close Project',
                handler: 'project-close-project'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Unit Settings',
                handler: 'project-unit-settings'
            }
        ]
    },
    {
        type: 'tab',
        name: 'well',
        active: false,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Add New',
                handler: 'well-add-new'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Well Header',
                handler: 'well-well-header'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Depth Conversion',
                handler: 'well-depth-conversion'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Curve Alias',
                handler: 'well-curve-alias'
            }
        ]
    }
];

HANDLER_FUNCTION = {
    'project-new-project': function () {
        console.log('new-project');
    },
    'project-open-project': function () {
        console.log('open-project');
    },
    'project-close-project': function () {
        console.log('close-project');
    },
    'project-unit-settings': function () {
        console.log('unit-settings');
    },
    'well-add-new': function () {
        console.log('add-new');
    },
    'well-well-header': function () {
        console.log('well-header');
    },
    'well-depth-conversion': function () {
        console.log('depth-conversion');
    },
    'well-curve-alias': function () {
        console.log('curve-alias');
    }
};
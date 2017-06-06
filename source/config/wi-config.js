RIBBON_TAB_DATA_CONFIG = [
    {
        type: 'tab',
        name: 'project',
        active: true,
        buttons: [
            {
                type: 'button',
                imgUrl: 'img/32x32/project_new_32x32.png',
                label: 'New Project',
                layout: 'icon-left',
                //layout: 'icon-top',
                handler: function(thisButton) {console.log(thisButton.label);}
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/project_open_32x32.png',
                label: 'Open Project',
                layout: 'icon-left',
                handler: 'project-open-project'
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/project_close_32x32.png',
                label: 'Close Project',
                handler: 'project-close-project'
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/properties_32x32.png',
                label: 'Unit Settings',
                handler: 'project-unit-settings'
            },
            {
                type: 'dropdown-button',
                imgUrl: 'img/32x32/properties_32x32.png',
                label: 'Save Project',
                subButton: [
                    {
                        type: 'sub-button',
                        imgUrl: 'img/32x32/properties_32x32.png',
                        label: 'Save Project',
                        handler: ''
                    },
                    {
                        type: 'sub-button',
                        imgUrl: 'img/32x32/properties_32x32.png',
                        label: 'Save Project As',
                        handler: ''
                    }

                ]
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/properties_32x32.png',
                label: 'Project',
                handler: 'project-project'
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/properties_32x32.png',
                label: 'Workflows',
                handler: 'project-workflows'
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/properties_32x32.png',
                label: 'Property Grid',
                handler: 'project-property-grid'
            },
            {
                type: 'button',
                imgUrl: 'img/32x32/properties_32x32.png',
                label: 'Exit',
                handler: 'project-exit'
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
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Family Edit',
                handler: 'well-family-edit'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Import',
                handler: 'well-import'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Export',
                handler: 'well-export'
            }
        ]
    },
    {
        type: 'tab',
        name: 'Data Analysis',
        active: false,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Blank Logplot',
                handler: 'data-analysis-blank-logplot'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Triple Combo',
                handler: 'data-analysis-triple-combo'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Density Neutron',
                handler: 'data-analysis-density-neutron'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-analysis-blank-logplot'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Blank Crossplot',
                handler: 'data-analysis-blank-crossplot'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Sonic PHI_TOTAL',
                handler: 'data-analysis-sonic-phi_total'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Neutron Density',
                handler: 'data-analysis-blank-logplot'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-analysis-blank-logplot'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Blank Histogram',
                handler: 'data-analysis-blank-histogram'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'PHI_TOTAL',
                handler: 'data-analysis-phi_total'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Gamma Ray',
                handler: 'data-analysis-gamma-ray'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-analysis-blank-logplot'
            }
        ]
    },
    {
        type: 'tab',
        name: 'Data Processing',
        active: false,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Add Curve',
                handler: 'data-processing-add-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Edit Text Curve',
                handler: 'data-processing-edit-text-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Edit Curve',
                handler: 'data-processing-edit-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Split Curve',
                handler: 'data-processing-split-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Merge Curves',
                handler: 'data-processing-merge-curves'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-processing-edit-text-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-processing-edit-text-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-processing-edit-text-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Group',
                handler: 'data-processing-edit-text-curve'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'User Formula',
                handler: 'data-processing-user-formula'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'User Program',
                handler: 'data-processing-user-program'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Python Program',
                handler: 'data-processing-python-program'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'TVD Conversion',
                handler: 'data-processing-tvd-conversion'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'PCA Analysis',
                handler: 'data-processing-pca-analysis'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Multi-Linear Regression',
                handler: 'data-processing-multi-linear-regression'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Neural Network',
                handler: 'data-processing-neural-network'
            }
        ]
    },
    {
        type: 'tab',
        name: 'Petrophysics',
        active: false,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Edit Zones',
                handler: 'petrophysics-edit-zones'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Input Curves',
                handler: 'petrophysics-input-curves'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Input Fluid',
                handler: 'petrophysics-input-fluid'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Build Mineral Parameters',
                handler: 'petrophysics-build-mineral-parameters'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Input Mineral Zones',
                handler: 'petrophysics-input-mineral-zones'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Multi-Mineral Solver',
                handler: 'petrophysics-multi-mineral-solver'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Clay Minerals Volume',
                handler: 'petrophysics-clay-minerals-volume'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Fracture-Vug Porosity',
                handler: 'petrophysics-Fracture-vug-porosity'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Open Porosity',
                handler: 'petrophysics-open-porosity'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Secondary Porosity',
                handler: 'petrophysics-secondary-porosity'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Fracture Porosity',
                handler: 'petrophysics-fracture-porosity'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Filtering Fracture',
                handler: 'petrophysics-filtering-fracture'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Micro & Macro Porosity',
                handler: 'petrophysics-micro-macro-porosity'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Water Saturation',
                handler: 'petrophysics-water-saturation'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Permeability',
                handler: 'petrophysics-permeability'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Cutoff and Summation',
                handler: 'petrophysics-cutoff-and-summation'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Filtering',
                handler: 'petrophysics-filtering'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Water Saturation',
                handler: 'petrophysics-water-saturation'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Basic Analysis',
                handler: 'petrophysics-basic-analysis'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Clay Volume',
                handler: 'petrophysics-clay-volume'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Porosity & Water Saturation',
                handler: 'petrophysics-porosity-water-saturation'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Cutoff and Summation',
                handler: 'petrophysics-cutoff-and-summation'
            }

        ]
    },
    {
        type: 'tab',
        name: 'Tools',
        active: false,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Themes',
                handler: 'tools-themes'
            }

        ]
    },
    {
        type: 'tab',
        name: 'Help',
        active: false,
        buttons: [
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Help Topics',
                handler: 'help-help-topics'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'About',
                handler: 'help-about'
            },
            {
                imgUrl: 'img/ic_folder.png',
                label: 'Unlock',
                handler: 'help-unlock'
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
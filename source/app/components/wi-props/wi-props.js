const componentName = 'wiProps';
const moduleName = 'wi-props';

function Controller ($scope, $http, $timeout, wiComponentService, wiApiService, ModalService) {
    let self = this;
    window.wi = this;
    let DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);
    let utils = wiComponentService.getComponent(wiComponentService.UTILS);

    this.fields = null;
    this.curveUnits = null;
    this.$onInit = function() {
        wiComponentService.putComponent(self.name, self);
    }
    this.$onChanges = function(changeObj) {
        if(changeObj.input || changeObj.config || changeObj.typeprops) {
            self.fields = obj2Array(self.input, self.config);
            self.section = sectionObj(self.config);
            self.shown =  self.getSections(self.section).map(s => true);
            if(self.typeprops == 'curve') {
                $timeout(function() {
                    wiApiService.asyncGetListUnit({idCurve: self.input.idCurve}).then(r => {
                        self.curveUnits = r;
                    });
                })
            }
        }
    }
    this.doChange = function(field) {
        if( self.typeprops == 'well' || 
            self.typeprops == 'dataset' || 
            self.typeprops == 'curve' ) {
            onChangeDefault({key: field.name, value: field.value}, function() {
                self.input[field.name] = field.value;
            });
        } else self.input[field.name] = field.value;
    }
    function onChangeDefault(item, cb) {
        utils.editProperty(item, _.debounce(function () {
            cb && cb();
        }, 200));
    }
    function obj2Array(obj, config) {

        let array = new Array();
        if(!obj || !config) return [];
        for (let key of Object.keys(config)) {
            let item = {
                name: key,
                value: obj[key] || config[key].defaultValue,
                type: (config[key] && config[key].typeSpec) ? config[key].typeSpec : toType(obj[key]),
                label: (config[key] && config[key].translation) ? config[key].translation : key,
                use: false,
                readOnly: false,
                section: ""
            }
            if (config[key] && config[key].option && config[key].option == "use") item.use = true;
            if (config[key] && config[key].option && config[key].option == "readonly") {
                item.readOnly = true;
                item.use = true;
            }
            if (config[key] && config[key].section && config[key].section != undefined) item.section = config[key].section;
            array.push(item);
        }
        return array;
    }

    function sectionObj (config) {
        let section = new Object();
        if(!config) return {};
        for(let key of Object.keys(config)) {
            section[key] = config[key].section;
        };
        return section;
    };

    this.getSections = function(sectionObj) {
        let sectionHash = new Object();
        for (let key of Object.keys(sectionObj)){
            sectionHash[sectionObj[key]] = true;
        };
        let ret = Object.keys(sectionHash).filter(sh => (sh!='undefined' || sh!='null'));
        return ret;
    };

    this.getShown = function(sectionName, section) {
        return self.shown[section.indexOf(sectionName)];
    };

    this.getFieldsOfSection = function(sectionName, fields) {
        return fields.filter(f => f.section == sectionName);
    };
    
    function toType(obj) {
        var typeName = ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        return typeName.replace("string", "text");;
    };
    this.changeColor = function(field, fields) {
        DialogUtils.colorPickerDialog(ModalService, field, function (colorStr) {
            fields[fields.indexOf(field)].value = colorStr;
            self.doChange(field);
        });
    };

    this.changePattern = function(field, fields) {
        DialogUtils.fillPatternDialog(ModalService, 
            field.value.name, 
            field.value.foreground, 
            field.value.background, 
            function(_name) {
                if(_name) {
                    fields[fields.indexOf(field)].value.name = _name;
                    self.doChange(field);
                }
        });
    }
    this.changeFamily = function(field, fields) {
        let listFamily = utils.getListFamily();
        DialogUtils.curveFamilyDialog(ModalService, wiComponentService, field.value.idFamily, listFamily, function (newFamily) {
            if (!newFamily) return;
            field.value = newFamily;
            utils.editProperty({key: 'idFamily', value: newFamily.idFamily}, function() {
                if(self.typeprops == 'curve') {
                    $timeout(function() {
                        wiApiService.asyncGetListUnit({idCurve: self.input.idCurve}).then(r => {
                            self.curveUnits = r;
                            /*let temp = fields.find(f => f.name == 'unit');
                            let unit_temp = self.curveUnits.find(c => c.name == temp.value);*/
                        });
                    })
                }
            });
        });
    }
    this.changeZoneSet = function(field, fields) {
        DialogUtils.zoneSetEditDialog(ModalService, wiComponentService, field.value, self.input.wellProps, function (newZoneSet) {
            if (!newZoneSet) return;
            field.value = newZoneSet;
        });
    }
    this.onChangeUnit = function(field, fields) {
        let temp = fields.find(f => f.name == 'unit');
        // self.fields[self.fields.indexOf(temp)].value = field.value;
        let payload = {};
        payload.srcUnit = self.curveUnits.find(u => u.name == temp.value);
        payload.desUnit = self.curveUnits.find(u => u.name == field.value);
        payload.idCurve = self.input.idCurve;
        if( !payload.srcUnit || !payload.desUnit ) {
            fields[fields.indexOf(temp)].value = field.value || self.curveUnits[0].name;
            self.doChange(temp);
            return;
        }
        wiApiService.convertCurveUnit(payload, function (response) {
            utils.refreshProjectState().then(() => {
                fields[fields.indexOf(temp)].value = field.value;
            });
        });
    }
    
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-props.html',
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        name: "@",
        input: "<",
        config: "<",
        typeprops: "<"
    }
});

exports.name = moduleName;

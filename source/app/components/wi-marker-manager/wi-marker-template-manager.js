const componentName = 'wiMarkerTemplateManager';
const moduleName = 'wi-marker-template-manager';
window.sin = ''; // temporary fix
function Controller($scope, wiComponentService, wiApiService, ModalService, $timeout) {
    const self = this;
    const DialogUtils = wiComponentService.getComponent(wiComponentService.DIALOG_UTILS);

    const newMstNames = [];

    this.lineStyles = [
        [0],
        [2, 2],
        [7, 2],
        [7, 2, 2, 2],
        [10, 0],
        [8, 2],
        [10, 4, 2, 4],
        [10, 4, 2, 4, 2, 4]
    ]

    // marker set template
    this.$onInit = function () {
        wiComponentService.putComponent(self.name, self);
        this.getTemplateList();
    }

    this.getTemplateList = function () {
        wiApiService.listMarkerTemplate((listTemplate, err) => {
            if (err) return;
            const markerTemplateGroups = _.groupBy(listTemplate, 'template');
            self.markerSetTemplates = markerTemplateGroups;
            self.markerSetTemplateNames = Object.keys(markerTemplateGroups);
            self.selectMst(self.selectedMstName);
        })
    }
    this.selectMst = function (mstName) {
        if (mstName && this.markerSetTemplates) {
            this.selectedMstName = mstName;
            this.selectedMst = this.markerSetTemplates[mstName].map(mt => Object.assign(mt, { lineStyle: eval(mt.lineStyle) }));
        }
    }
    this.createTemplate = function () {
        const promptConfig = {
            title: '<span class="marker-properties-16x16"></span> New Template',
            inputName: 'Template name'
        }
        DialogUtils.promptDialog(ModalService, promptConfig, function (templateName) {
            if (!templateName) return;
            newMstNames.push(templateName);
            self.getTemplateList();
        });
    }

    // marker template
    this.onSelect = function (markerTemplate, $event) {
        if ($event.shiftKey) {
            const markIndex = this.selectedMst.indexOf(this.mark || this.current);
            const currIndex = this.selectedMst.indexOf(markerTemplate);
            let minIndex = Math.min(markIndex, currIndex);
            let maxIndex = Math.max(markIndex, currIndex);
            if (!this.mark) {
                markerTemplate.flag = !markerTemplate.flag;
                this.mark = markerTemplate;
            }
            for (let i = minIndex; i <= maxIndex; i++) {
                this.selectedMst[i].flag = this.selectedMst[markIndex].flag;
            }
        } else {
            markerTemplate.flag = !markerTemplate.flag;
            this.mark = null;
        }
        this.current = markerTemplate;
    }
    this.markerTemplateEdited = function (markerTemplate) {
        this.hasChanges = true;
        markerTemplate.edited = true;
    }
    this.colorMarkerTemplate = function (markerTemplate) {
        DialogUtils.colorPickerDialog(ModalService, markerTemplate.color, function (colorStr) {
            markerTemplate.color = colorStr;
            self.markerTemplateEdited(markerTemplate);
        });
    }
    this.getSelectedMarkerTemplates = function () {
        if (!this.selectedMst) return [];
        return this.selectedMst.filter(t => t.flag);
    }
    this.saveChanges = async function () {
        if (!this.hasChanges) return;
        const promises = [];
        for (const mstName of this.markerSetTemplateNames) {
            const markerSetTemplate = this.markerSetTemplates[mstName];
            for (const markerTemplate of markerSetTemplate) {
                if (markerTemplate.deleted) continue;
                if (markerTemplate.new) {
                    promises.push(new Promise(resolve => {
                        const payload = Object.assign({}, markerTemplate, { idMarkerTemplate: null, lineStyle: JSON.stringify(markerTemplate.lineStyle) });
                        wiApiService.createMarkerTemplate(payload, resolve);
                    }))
                    continue;
                }
                if (markerTemplate.edited) {
                    promises.push(new Promise(resolve => {
                        const payload = Object.assign({}, markerTemplate, { lineStyle: JSON.stringify(markerTemplate.lineStyle) });
                        wiApiService.editMarkerTemplate(payload, resolve);
                    }));
                    continue;
                }
            }
        }
        await Promise.all(promises);
        this.selectedMst = this.selectedMst.filter(t => !t.deleted);
        self.hasChanges = false;
        self.getTemplateList();
    }
    this.deleteMarkerTemplate = function (markerTemplate) {
        if (markerTemplate.new) {
            markerTemplate.flag = false;
            markerTemplate.deleted = true;
        }
        else wiApiService.removeMarkerTemplate(markerTemplate.idMarkerTemplate, () => {
            markerTemplate.flag = false;
            markerTemplate.deleted = true
        });
    }
    this.deleteSelectedMarkerTemplates = function () {
        const selectedTemplates = this.getSelectedMarkerTemplates();
        for (const template of selectedTemplates) {
            self.deleteMarkerTemplate(template);
        }
    }
    let newCount = 1;
    this.addMarkerTemplate = function () {
        const newTemplate = {
            new: true,
            idMarkerTemplate: Date.now(),
            template: this.selectedMstName,
            color: "#000",
            lineWidth: 1,
            lineStyle: [0],
            name: 'marker_template_' + newCount++,
            description: '',
        };
        this.selectedMst.push(newTemplate);
        self.markerTemplateEdited(newTemplate);
        setTimeout(() => {
            const templateListElem = document.querySelector('wi-marker-template-manager .right-side .content-area');
            templateListElem.scrollTop = templateListElem.scrollHeight;
        });
    }

}

let app = angular.module(moduleName, []);
app.component(componentName, {
    templateUrl: 'wi-marker-template-manager.html',
    controller: Controller,
    // controllerAs: componentName,
    bindings: {
        name: '@'
    }
});

exports.name = moduleName;
let historyState = window.localStorage;
let init = {
        plots:{
            logplot: [],
            crossplot: [],
            histogram: [],
            comboview: []
            },
        dialogs: []
};

module.exports.getHistory = getHistory;
function getHistory(){
    return JSON.parse(historyState.getItem('historyState'));
}

module.exports.getPlotsFromHistory = getPlotsFromHistory;
function getPlotsFromHistory(type){
    let history = getHistory();
    if(!history) return {};
    if(!type) return history.plots;
    return history.plots[type];
}

module.exports.getDialogFromHistory = getDialogFromHistory;
function getDialogFromHistory(dialog){
    let history = getHistory();
    if(!history) return;    
    return history.dialogs[dialog];
}

module.exports.createHistory = function(){
    let history = getHistory();
    if(!history) saveHistory(init);
}

module.exports.saveHistory = saveHistory;
function saveHistory(history){
    historyState.setItem('historyState', JSON.stringify(history));
}

module.exports.removeHistory = function(){
    historyState.removeItem('historyState');
}

module.exports.putPlotToHistory = putPlotToHistory;
function putPlotToHistory(type, id){
    let history = getHistory();
    if(!history) return;    
    let set = new Set(history.plots[type]);
    set.add(id);
    history.plots[type] = Array.from(set);
    saveHistory(history);
}

module.exports.removePlotFromHistory = removePlotFromHistory;
function removePlotFromHistory(type, id){
    let history = getHistory();
    if(!history) return;    
    let idx = history.plots[type].findIndex(i => i==id);
    history.plots[type].splice(idx,1);
    saveHistory(history);
}

module.exports.putDialogToHistory = putDialogToHistory;
function putDialogToHistory(dialog, content){
    let history = getHistory();
    if(!history) return;    
    history.dialogs[dialogs] = content;
    saveHistory(history);
}

module.exports.getPlotsLengthFromHistory = getPlotsLengthFromHistory;
function getPlotsLengthFromHistory(){
    let history = getHistory();
    if(!history) return 0;
    let types = ['logplot', 'crossplot', 'histogram', 'comboview'];
    let len = 0;
    types.forEach(t => {
        len = len + history.plots[t].length;
    })
    return len;
}
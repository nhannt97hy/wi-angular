function initModal(modal) {
    modal.element.modal();
    $(modal.element).prop('tabindex', 1);
    const elem = $(modal.element).find('.modal-content');
    setTimeout(() => {
        elem.find('.modal-header').css('cursor', 'move');
        const offsetWidth = elem.width()/3;
        const offsetHeight = elem.height()/3;
        elem.draggable({
            containment:[-2*offsetWidth, -10, $(window).width()-offsetWidth, $(window).height()-offsetHeight],
            handle: '.modal-header'
        });
    }, 700);
    $(modal.element).keyup(function (e) {
        if (e.keyCode == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ESCAPE) {
            let okButton, cancelButton;
            let buttonElems = $(modal.element).find('.modal-footer > button');
            for (let i = 0; i < buttonElems.length; i++) {
                if (buttonElems[i].innerText.toLowerCase().trim() == 'ok') {
                    okButton = buttonElems[i];
                }
                if (buttonElems[i].innerText.toLowerCase().trim() == 'cancel' || buttonElems[i].innerText.toLowerCase().trim() == 'close') {
                    cancelButton = buttonElems[i];
                }
            }
            if (e.keyCode == $.ui.keyCode.ENTER && okButton) okButton.click();
            if (e.keyCode == $.ui.keyCode.ENTER && !okButton && cancelButton) cancelButton.click();
            if (e.keyCode == $.ui.keyCode.ESCAPE && cancelButton) cancelButton.click();
            e.stopPropagation();
        }
    });
}
exports.initModal = initModal;

exports.removeBackdrop = function () {
    $('.modal-backdrop').last().remove();
    $('body').removeClass('modal-open');
}
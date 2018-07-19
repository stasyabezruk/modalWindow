var mainWrapper = document.querySelector(".frame-wrapper");
var modal = new Modal();


mainWrapper.addEventListener("click", function (e) {
    var target = e.target;

    if ( target.hasAttribute("data-modal") ) {
        modal.open(target);
    } else if ( target.parentElement.hasAttribute("data-modal") ) {
        modal.open(target.parentElement);
    }

});
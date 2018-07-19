var Modal = function () {
    function Modal(options) {
        this.modal = null;
        this.transitionEvent = typeTransitionEvent();

        var defaults = {
            onClose: null,
            onOpen: null,
            beforeOpen: null,
            beforeClose: null,
            cssClass: [],
            closeLabel: 'Close',
            closeMethods: ['overlay', 'button', 'escape']
        };

        // extends config
        this.params = extend({}, defaults, options);

        this.events = {};

        this.init();
    }

    Modal.prototype.init = function() {
        if (this.modal) {
            return;
        }

        this.build();
        this.addEvents();

        // insert modal in dom
        document.body.insertBefore(this.modal, document.body.firstChild);

    };

    Modal.prototype.build = function() {

        // wrapper
        this.modal = document.createElement('div');
        this.modal.classList.add('frame-modal');

        this.modal.style.display = 'none';

        // custom class
        this.params.cssClass.forEach(function(item) {
            if (typeof item === 'string') {
                this.modal.classList.add(item);
            }
        }, this);

        // close btn
        if (this.params.closeMethods.indexOf('button') !== -1) {
            this.modalCloseBtn = document.createElement('button');
            this.modalCloseBtn.classList.add('frame-modal__close');

            this.modalCloseBtnIcon = document.createElement('span');
            this.modalCloseBtnIcon.classList.add('frame-modal__closeIcon');
            this.modalCloseBtnIcon.innerHTML = '×';

            this.modalCloseBtnLabel = document.createElement('span');
            this.modalCloseBtnLabel.classList.add('frame-modal__closeLabel');
            this.modalCloseBtnLabel.innerHTML = this.params.closeLabel;

            this.modalCloseBtn.appendChild(this.modalCloseBtnIcon);
            this.modalCloseBtn.appendChild(this.modalCloseBtnLabel);
            this.modal.appendChild(this.modalCloseBtn);
        }

        // modal
        this.modalBox = document.createElement('div');
        this.modalBox.classList.add('frame-modal-box');

        // modal box content
        this.modalBoxContent = document.createElement('div');
        this.modalBoxContent.classList.add('frame-modal__content');

        this.modalBox.appendChild(this.modalBoxContent);

        this.modal.appendChild(this.modalBox);

    };

    Modal.prototype.open = function (el) {
        var self = this;

        this.setModalContent(el);

        // before open callback
        if (typeof self.params.beforeOpen === 'function') {
            self.params.beforeOpen();
        }

        if (this.modal.style.removeProperty) {
            this.modal.style.removeProperty('display');
        } else {
            this.modal.style.removeAttribute('display');
        }

        // prevent double scroll
        this._scrollPosition = window.pageYOffset;
        document.body.classList.add('noScroll');
        document.body.style.top = -this._scrollPosition + 'px';


        // show modal
        this.modal.classList.add('frame-modal__visible');

        if (this.transitionEvent) {
            this.modal.addEventListener(self.transitionEvent, function handler() {
                if (typeof self.params.onOpen === 'function') {
                    self.params.onOpen.call(self);
                }

                // detach event after transition end (so it doesn't fire multiple onOpen)
                self.modal.removeEventListener(self.transitionEvent, handler, false);

            }, false);
        } else {
            if (typeof self.params.onOpen === 'function') {
                self.params.onOpen.call(self);
            }
        }

        // check if modal is bigger than screen height
        this.checkOverflow();
    };

    Modal.prototype.setModalContent = function(el) {
        this.modalHeader = document.createElement('header');
        this.modalHeaderSpan = document.createElement('span');
        var titleEl = el.querySelector('h1') || el.querySelector('h2') || el.querySelector('h3');
        this.modalHeaderSpan.innerHTML = titleEl.innerHTML;
        this.modalHeader.appendChild(this.modalHeaderSpan);
        this.modalBoxContent.appendChild(this.modalHeader);


        this.modalImgBox = document.createElement('div');
        this.modalImgBox.classList.add('frame-modal__img-box');
        this.modalBoxContent.appendChild(this.modalImgBox);

        var style = el.currentStyle || window.getComputedStyle(el, false);
        var imgURL = style.backgroundImage.slice(4, -1).replace(/"/g, "");

        this.modalImage = document.createElement("img");
        this.modalImage.setAttribute('src', imgURL);
        this.modalImgBox.appendChild(this.modalImage);

    };

    Modal.prototype.close = function() {
        //  before close
        if (typeof this.params.beforeClose === "function") {
            var close = this.params.beforeClose.call(this);
            if (!close) return;
        }

        document.body.classList.remove('noScroll');
        window.scrollTo(0, this._scrollPosition);
        document.body.style.top = null;

        this.modal.classList.remove('frame-modal__visible');
        this.modalBoxContent.innerHTML = "";

        var self = this;

        if (this.transitionEvent) {
            //Track when transition is happening then run onClose on complete
            this.modal.addEventListener(this.transitionEvent, function handler() {
                // detach event after transition end (so it doesn't fire multiple onClose)
                self.modal.removeEventListener(self.transitionEvent, handler, false);

                self.modal.style.display = 'none';

                // on close callback
                if (typeof self.params.onClose === "function") {
                    self.params.onClose.call(this);
                }

            }, false);
        } else {
            self.modal.style.display = 'none';
            // on close callback
            if (typeof self.params.onClose === "function") {
                self.params.onClose.call(this);
            }
        }

        if (this.modal.classList.contains('frame-modal__overflow')) {
            this.modal.classList.remove('frame-modal__overflow');
        }
    };

    Modal.prototype.addEvents = function () {
        this.events = {
            clickCloseBtn: this.close.bind(this),
            clickOverlay: this.clickOutside.bind(this),
            keyboardNav: this.keyboardEvent.bind(this)
        };

        if (this.params.closeMethods.indexOf('button') !== -1) {
            this.modalCloseBtn.addEventListener('click', this.events.clickCloseBtn);
        }

        this.modal.addEventListener('mousedown', this.events.clickOverlay);
        document.addEventListener("keydown", this.events.keyboardNav);
    };

    Modal.prototype.clickOutside = function(e) {
        // if click is outside the modal
        if (this.params.closeMethods.indexOf('overlay') !== -1 && !this.findParentEl(e.target, 'frame-modal') &&  e.clientX < this.modal.clientWidth) {
            this.close();
        }
    };

    Modal.prototype.findParentEl = function(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    };

    Modal.prototype.keyboardEvent = function(e) {
        // escape key
        if (this.params.closeMethods.indexOf('escape') !== -1 && e.which === 27 && this.isOpen()) {
            this.close();
        }
    };

    Modal.prototype.isOpen = function() {
        return this.modal.classList.contains("frame-modal__visible");
    };

    Modal.prototype.isOverflow = function() {
        var viewportHeight = window.innerHeight;
        var modalHeight = this.modalBox.clientHeight;

        return modalHeight >= viewportHeight;
    };

    Modal.prototype.checkOverflow = function() {
        // only if the modal is currently shown
        if (this.modal.classList.contains('frame-modal__visible')) {
            if (this.isOverflow()) {
                this.modal.classList.add('frame-modal__overflow');
            } else {
                this.modal.classList.remove('frame-modal__overflow');
            }
        }
    };

    function extend() {
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
    }

    function typeTransitionEvent() {
        var t;
        var el = document.createElement('frame-test-transition');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }

    return Modal;
}();
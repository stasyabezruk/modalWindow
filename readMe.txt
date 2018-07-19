Modal window has options 

onClose: callback to execute when modal widnow is closed
onOpen: callback to execute when tingle is closed
beforeOpen: callback to execute before opening the modal
beforeClose: callback to execute before closing the modal
cssClass: custom css classes,
closeLabel: 'Close',
closeMethods: [
	'overlay' - close on the dark background
	'button' - close by clicing on cross icon 
	'escape' - close by keyboard with key ESC

Also when the height of screen is bigger than modal, the content of modal window can be scrolled.

App was tested on all browsers (Windows 10: Chrome, Firefox, Opera, IE, Edge + Mac: Safari - browserstack emulation)
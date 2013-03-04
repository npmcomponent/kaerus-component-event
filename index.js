var Emitter = require('emitter');

// Event /////////////////////////////////////////////////////////////////////////////
// Code inspired from Secrets of the Javascript Ninja by John Resig 
// Reference http://www.quirksmode.org/dom/events/ 


var Event = {
    normalize: function(event) {
        function returnTrue() { return true; } 
        function returnFalse() { return false; }

        if (!event || !event.stopPropagation) { 
            var old = event || window.event;
            // Clone the old object so that we can modify the values 
            event = {};
            for (var prop in old) { 
                event[prop] = old[prop];
            }
            // The event occurred on this element 
            if (!event.target) {
                event.target = event.srcElement || document;
            }
            // Handle which other element the event is related to 
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
            // Stop the default browser action 
            event.preventDefault = function () {
                event.returnValue = false; 
                event.isDefaultPrevented = returnTrue;
            }; 
            event.isDefaultPrevented = returnFalse;
            // Stop the event from bubbling 
            event.stopPropagation = function () {
                event.cancelBubble = true; 
                event.isPropagationStopped = returnTrue;
            }; 
            event.isPropagationStopped = returnFalse;
            // Stop the event from bubbling and executing other handlers 
            event.stopImmediatePropagation = function () {
                this.isImmediatePropagationStopped = returnTrue; 
                this.stopPropagation();
            }; 
            event.isImmediatePropagationStopped = returnFalse;
            // Handle mouse position 
            if (event.clientX != null) {
                var doc = document.documentElement, 
                    body = document.body;

                event.pageX = event.clientX + (doc && 
                        doc.scrollLeft || body && 
                        body.scrollLeft || 0) - (doc && 
                        doc.clientLeft || body && 
                        body.clientLeft || 0);

                event.pageY = event.clientY + (doc && 
                        doc.scrollTop || body && 
                        body.scrollTop || 0) - (doc && 
                        doc.clientTop || body && 
                        body.clientTop || 0);
            }
            // Handle key presses 
            event.which = event.charCode || event.keyCode;
            // Fix button for mouse clicks: // 0 == left; 1 == middle; 2 == 
            if (event.button != null) {
                event.keyCode;
                event.button = (event.button & 1 ? 0 : (event.button & 4 ? 1 : (event.button & 2 ? 2 : 0)));
            } 
        }    
        return event;
    },
    add: function(el,ev,fn){

        if(!el._event) {
            el._event = new Emitter();
            addEventListener(el, ev, onEvent);
        }    
        
        el._event.on(ev,fn);

        return el;
    },
    remove: function(el,ev,fn){

        if(el._event) {
            el._event.off(ev,fn);
            if(!el._event.hasListeners(ev))
                removeEventListener(el, ev, onEvent);
        }

        return this; 
    }   
}


function addEventListener(elm, eType, fn){
    if(elm.addEventListener){
        elm.addEventListener(eType, fn, false);
    } else if (elm.attachEvent){
        elm.attachEvent('on' + eType, fn);
    }
}

function removeEventListener(elm, eType, fn){
    if(elm.removeEventListener){
        elm.removeEventListener(eType, fn, false);
    } else if (elm.detachEvent){
        elm.detachEvent('on' + eType, fn);
    }
}

function onEvent(event) {
    event = Event.normalize(event);
    this._event.emit(event.type,event);
} 

module.exports = Event; 

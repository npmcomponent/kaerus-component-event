var Emitter = require('kaerus-component-emitter');

var augments;

// Event /////////////////////////////////////////////////////////////////////////////
var Event = new Emitter({
    normalize: function(event) {
        // normalize 'inspired' from Secrets of the Javascript Ninja by John Resig 
        // Reference http://www.quirksmode.org/dom/events/ 
        function returnTrue() { return true; } 
        function returnFalse() { return false; }

        if (!event || !event.stopPropagation) { 
            // Clone the old object so that we can modify the values 
            event = clone(event || window.event);

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
            // Fix button for mouse clicks: // 0 == left; 1 == middle; 2 == right
            if (event.button != null) {
                event.button = (event.button & 1 ? 0 : (event.button & 4 ? 1 : (event.button & 2 ? 2 : 0)));
            }
            // mouse scroll
            event.wheelDelta = event.wheelDelta || -event.Detail * 40; 
        }    
        // note: Use Event.augment(...); to add user defined event attributes/methods
        return augments ? extend(event,augments) : event; 
    },
    add: function(el,ev,fn,cap){
        if(el.addEventListener){
            el.addEventListener(ev, fn, !!cap);
        } else if (el.attachEvent){
            el.attachEvent('on' + ev, fn);
        }  else el['on' + ev] = fn;

        return el;
    },
    remove: function(el,ev,fn){
        if(el.removeEventListener){
            el.removeEventListener(ev, fn, false);
        } else if (el.detachEvent){
            el.detachEvent('on' + ev, fn);
        } else el['on' + ev] = null;

        return el;
    }
});

Object.defineProperty(Event,'augment',{
    get: function(){
        return augments;
    },
    set: function(o,r){
        if(typeof o === 'string' && r) {
            if(augments && augments.hasOwnProperty(o))
                delete augments[o];
        }

        if(typeof o === 'function' && o.name){
           r = {};
           r[o.name] = o;
           o = r; 
        }

        if(typeof o !== 'object') return;

        if(!augments) augments = Object.create(null);

        return extend(augments,o);
    }
});

function extend(e,o) {
    for(var k in o) if(!e[k]) e[k] = o[k];

    return e;
}

function clone(ev,o) {
    o = o ? o : Object.create(null);

    for (var p in ev) o[p] = ev[p];

    return o;
}

module.exports = Event; 

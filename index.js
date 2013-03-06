var Emitter = require('emitter');

// Event /////////////////////////////////////////////////////////////////////////////

var Event = {
    normalize: function(event) {
        // normalize 'inspired' from Secrets of the Javascript Ninja by John Resig 
        // Reference http://www.quirksmode.org/dom/events/ 
        function returnTrue() { return true; } 
        function returnFalse() { return false; }

        if (!event || !event.stopPropagation) { 
            // Clone the old object so that we can modify the values 
            event = this.clone(event || window.event);

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
                event.keyCode;
                event.button = (event.button & 1 ? 0 : (event.button & 4 ? 1 : (event.button & 2 ? 2 : 0)));
            }
            // mouse scroll
            event.wheelDelta = event.wheelDelta || -event.Detail * 40; 
        }    

        return this.extend(event,this.methods);
    },
    methods: {
        /* augment all events with these methods */
    },
    extend: function(event,obj) {
        for(var o in obj) {
            if(!event[o]) event[o] = obj[o];
        }

        return event;
    },
    capture: function(ev,handler) {

    },
    clone: function(event,obj) {
        obj = obj ? obj : {};

        for (var p in event) { 
            obj[p] = event[p];
        }
        return obj;
    },
    bind: function(el,ev,fn){

        if(el.addEventListener){
            el.addEventListener(ev, fn, false);
        } else if (elm.attachEvent){
            el.attachEvent('on' + ev, fn);
        }  else el['on' + ev] = fn;

        return el;
    },
    unbind: function(el,ev,fn){
        if(el.removeEventListener){
            el.removeEventListener(ev, fn, false);
        } else if (el.detachEvent){
            el.detachEvent('on' + ev, fn);
        } else el['on' + ev] = null;

        return el;
    },
    add: function(el,ev,fn){

        if(!el._event) {
            el._event = new Emitter();
            this.bind(el,ev,onEvent);
        }    
        
        el._event.on(ev,fn);

        return el;
    }, 
    remove: function(el,ev,fn){

        if(el._event) {
            el._event.off(ev,fn);
            if(!el._event.hasListeners(ev))
                this.unbind(el,ev,onEvent);
        }

        return el; 
    }, 
    delegate: function(el,ev,fn){
        var self = this,
            delegates = ['click','mouseup','mousedown','keyup','keydown','keypress'];

        if(delegates.indexOf(ev) < 0) throw "Can not delegate " + ev;

        if(!document._delegate) {
            document._delegate = new Emitter();
            delegates.forEach(function(type){
                self.bind(document,type,onDelegate);
            });
        }
        document._delegate.on(ev+'>'+el.id,fn);

        return el;
    },
    undelegate: function(el,ev,fn){
        if(document._delegate){
            document._delegate.off(ev+'>'+el.id,fn);
        }
        return el;
    }   
}

function onDelegate(event) {
    event = Event.normalize(event);
    if(!this._delegate) throw "event has no emitter";
    this._delegate.emit(event.type+'>'+event.target.id,event);
}

function onEvent(event) {
    event = Event.normalize(event);
    if(!this._event) throw "event has no emitter";
    this._event.emit(event.type,event);
} 

module.exports = Event; 

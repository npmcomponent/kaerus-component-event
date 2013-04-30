var Emitter = require('emitter');

// Event /////////////////////////////////////////////////////////////////////////////

var Event = {
    emitter: new Emitter(),
    store: {},
    guid: 'data' + (new Date().getTime()),
    guidCounter: 1,
    normalize: function(event) {
        // normalize 'inspired' from Secrets of the Javascript Ninja by John Resig 
        // Reference http://www.quirksmode.org/dom/events/ 
        function returnTrue() { return true; } 
        function returnFalse() { return false; }

        if (!event || !event.stopPropagation) { 
            // Clone the old object so that we can modify the values 
            event = Event.clone(event || window.event);

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

        return Event.extend(event,Event.methods);
    },
    methods: {
        data: function(key,val){
            var store = Event.getData(this.target);

            if(val !== undefined) store[key] = val;

            return store[key];
        }
    },
    extend: function(event,obj) {
        for(var o in obj) {
            if(!event[o]) event[o] = obj[o];
        }

        return event;
    },
    clone: function(event,obj) {
        obj = obj ? obj : {};

        for (var p in event) { 
            obj[p] = event[p];
        }
        return obj;
    },
    bind: function(el,ev,fn,cap){
        if(el.addEventListener){
            el.addEventListener(ev, fn, !!cap);
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
        ev = ev.split(' ');
        
        var i = ev.length;
        
        while(1 < i--) Event.add(el,ev[i],fn);
        
        ev = ev[0];

        var data = Event.getData(el);

        if(!data.emitter) {
            data.emitter = new Emitter();
        }    
        
        Event.bind(el,ev,onEvent);

        data.emitter.on(ev,fn);

        return data.emitter;
    }, 
    remove: function(el,ev,fn){
        ev = ev.split(' ');

        var i = ev.length;
        
        while(1 < i--) Event.remove(el,ev[i],fn);
        
        ev = ev[0];

        var data = Event.getData(el);

        if(data.emitter) {
            data.emitter.off(ev,fn);
            if(!data.emitter.hasListeners(ev))
                Event.unbind(el,ev,onEvent);
        }

        return data.emitter; 
    }, 
    delegate: function(el,ev,fn){

        Event.bind(document,ev,onDelegate,true);

        var guid = el[Event.guid];

        if(!guid){
            /* creates a guid */
            Event.getData(el);
            guid = el[Event.guid];
        }

        Event.emitter.on(ev+'>'+guid,fn);

        return el;
    },
    undelegate: function(el,ev,fn){
        var guid = el[Event.guid];

        if(guid) {
            Event.emitter.off(ev+'>'+guid,fn);
        }

        return el;
    },
    getData: function(el){
        var guid = el[Event.guid];
        
        if(!guid){
            guid = el[Event.guid] = Event.guidCounter++;
            Event.store[guid] = {};
        }

        return Event.store[guid];
    },
    removedata: function(el){
        var guid = el[Event.guid];

        if(!guid) return;

        delete Event.store[guid];

        try {
            delete el[Event.guid];
        } catch (e) {
            if(el.removeAttribute){
                el.removeAttribute(Event.guid);
            }
        }
    }   
}

function onEvent(event) {
    event = Event.normalize(event);

    var data = Event.getData(event.target);

    if(!data.emitter) throw "event has no emitter";

    data.emitter.emit(event.type,event);
} 

function onDelegate(event) {
    Event.emitter.emit(event.type+'>'+event.target[Event.guid],event);
}

module.exports = Event; 

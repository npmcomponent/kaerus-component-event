var Event = require('event');


function event(o) {
  return Object.create(Event);
}

function click(el){
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}

describe("Event",function(){
	it('exist',function(){
		expect(Event).to.exist;
		expect(window['Event']).to.exist;
	})

	describe('normalize',function(){
		it('exist',function(){
			var o = {};
			expect(Event.normalize).to.be.a('function');
		})

		
	})
})
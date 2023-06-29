/* eslint-disable @typescript-eslint/no-explicit-any */
/* exported easeActor, easeAdjustment */
function easeActor(actor, params) {
	actor.ease(params);
}

function easeAdjustment(actor, value, params) {
	actor.ease(value, params);
}

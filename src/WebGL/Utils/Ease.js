/**
 * @param {number} t
 */
export function easeOut(t) {
	return t * (2 - t)
}
/**
 * @param {number} t
 */
export function power4Out(t) {
	return 1 - --t * t * t * t
}
/**
 * @param {number} t
 */
export function power4In(t) {
	return t * t * t * t
}

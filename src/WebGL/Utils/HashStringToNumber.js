export default function hashStringToNumber(string, length = 10) {
	let hash = 0,
		char,
		max = Math.pow(10, length) // specify max hash length
	for (let i = 0; i < string.length; i++) {
		char = string.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash % max // Ensure the hash does not exceed the desired length
		hash |= 0 // Convert to 32bit integer
	}
	hash = Math.abs(hash)
	return hash.toString().padStart(length, '1') // This ensures the resulting string is at least "length" long
}

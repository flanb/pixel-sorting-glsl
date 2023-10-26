import EventEmitter from 'utils/EventEmitter.js'
import hashStringToNumber from 'utils/HashStringToNumber.js'

export default class SeedManager extends EventEmitter {
	constructor() {
		super()

		this.seedLength = 10
		this.url = new URL(window.location.href)

		if (!this.getUrlSeed()) this.setUrlSeed(this.getRandomSeed())

		this.setEventListeners()
	}

	setUrlSeed(seed) {
		this.url.searchParams.set('seed', seed.toString())
		window.history.replaceState({}, '', this.url)
	}

	getUrlSeed() {
		return parseInt(this.url.searchParams.get('seed'), this.seedLength)
	}

	getRandomSeed(length = this.seedLength) {
		return Math.floor(Math.random() * Math.pow(10, length))
	}

	requestSeed() {
		const response = prompt('Enter a seed (preferably 10 digits):')
		const seed = hashStringToNumber(response, this.seedLength)

		this.setUrlSeed(seed)
	}

	setEventListeners() {
		addEventListener('keypress', ({ key }) => {
			if (key.toLowerCase() === 'r') {
				this.setUrlSeed(this.getRandomSeed())
				this.trigger('reload')
			}
			if (key.toLowerCase() === 's') {
				this.requestSeed()
				this.trigger('reload')
			}
		})
	}
}

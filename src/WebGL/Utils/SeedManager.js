import EventEmitter from 'utils/EventEmitter.js'

export default class SeedManager extends EventEmitter {
	constructor() {
		super()

		this.seedLength = 10
		this.url = new URL(window.location.href)

		if (!this.getUrlSeed()) this.setUrlSeed(this.getUrlSeed())

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
		const response = prompt('Enter a seed')

		const seed = response.charCodeAt(0)
		console.log(seed)

		this.setUrlSeed(parseInt(seed, this.seedLength))
	}

	setEventListeners() {
		addEventListener('keypress', ({ key }) => {
			if (key.toLowerCase() === 'r') {
				this.trigger('reload')
				this.setUrlSeed(this.getRandomSeed())
			}
			if (key.toLowerCase() === 's') {
				this.requestSeed()
			}
		})
	}
}

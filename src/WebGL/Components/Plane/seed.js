export default class SeedManager {
	constructor() {
		this.currentSeed = null
		this.initializeSeed()
		this.addKeyListener()
	}

	initializeSeed() {
		const urlParams = new URLSearchParams(window.location.search)

		if (urlParams.has('seed') && !isNaN(urlParams.get('seed'))) {
			this.currentSeed = parseInt(urlParams.get('seed'), 10)
		} else {
			this.generateSeed()
			this.updateURLWithSeed()
		}
	}

	generateSeed() {
		this.currentSeed = Math.floor(Math.random() * 1000000000)
	}

	updateURLWithSeed() {
		const newURL =
			window.location.protocol + '//' + window.location.host + window.location.pathname + '?seed=' + this.currentSeed
		window.history.pushState({ path: newURL }, '', newURL)
	}

	addKeyListener() {
		document.addEventListener('keypress', (event) => {
			if (event.key === 'r' || event.key === 'R') {
				this.generateSeed()
				window.location.href =
					window.location.protocol +
					'//' +
					window.location.host +
					window.location.pathname +
					'?seed=' +
					this.currentSeed
			}
		})
	}

	getSeed() {
		return this.currentSeed
	}
}

import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter {
	constructor() {
		super()

		const canvas = document.querySelector('canvas.webgl')

		// Setup
		this.width = window.innerWidth
		this.height = window.innerWidth / 1.5

		this.pixelRatio = Math.min(devicePixelRatio, 2)

		// Resize event
		addEventListener('resize', () => {
			this.width = window.innerWidth
			this.height = window.innerWidth / 1.5
			this.pixelRatio = Math.min(devicePixelRatio, 2)

			this.trigger('resize')
		})
	}
}

import Experience from '../Experience.js'
import PixelSorter from 'components/PixelSorter'

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		// Wait for resources
		this.resources.on('ready', () => {
			// Setup
			this.pixelSorter = new PixelSorter()
		})
	}

	update() {
		if (this.pixelSorter) this.pixelSorter.update()
	}
}

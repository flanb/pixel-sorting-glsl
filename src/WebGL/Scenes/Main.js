import Experience from '../Experience.js'
import Plane from 'components/Plane/index.js'

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		// Wait for resources
		this.resources.on('ready', () => {
			// Setup
			this.plane = new Plane()
		})
	}

	update() {
		if (this.plane) this.plane.update()
	}
}

import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OrthographicCamera, PerspectiveCamera } from 'three'

export default class Camera {
	constructor() {
		this.experience = new Experience()
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.canvas = this.experience.canvas
		this.debug = this.experience.debug

		this.options = {
			fov: 35,
			near: 1,
			far: 100,
			position: {
				x: 0,
				y: 0,
				z: 4,
			},
			target: {
				x: 0,
				y: 0,
				z: 0,
			},
		}

		this.setInstance()
		// this.setControls()
		this.applySavedSettings()
		// if (this.debug.active) this.setDebug()
	}

	setInstance() {
		this.instance = new OrthographicCamera(-1.5, 1.5, 1, -1, this.options.near, this.options.far)
		this.instance.name = 'camera'
		this.scene.add(this.instance)
	}

	applySavedSettings() {
		const cameraPosition = JSON.parse(sessionStorage.getItem('cameraPosition'))
		const cameraTarget = JSON.parse(sessionStorage.getItem('cameraTarget'))

		if (cameraPosition) {
			this.instance.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
		} else {
			this.instance.position.set(this.options.position.x, this.options.position.y, this.options.position.z)
		}

		if (this.controls) {
			if (cameraTarget) {
				this.controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)
			} else {
				this.controls.target.set(this.options.target.x, this.options.target.y, this.options.target.z)
			}
		}
	}

	setControls() {
		this.controls = new OrbitControls(this.instance, this.canvas)
		this.controls.addEventListener('change', () => {
			sessionStorage.setItem('cameraPosition', JSON.stringify(this.instance.position))
			sessionStorage.setItem('cameraTarget', JSON.stringify(this.controls.target))
		})
	}
	resetControls() {
		sessionStorage.removeItem('cameraPosition')
		sessionStorage.removeItem('cameraTarget')

		this.controls.reset()
		this.instance.position.set(this.options.position.x, this.options.position.y, this.options.position.z)
		this.controls.target.set(this.options.target.x, this.options.target.y, this.options.target.z)
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height
		this.instance.updateProjectionMatrix()
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({
			title: 'Camera',
			expanded: false,
		})

		this.debugFolder
			.addButton({
				title: 'Reset Camera',
			})
			.on('click', this.resetControls.bind(this))

		if (this.controls)
			this.debugFolder
				.addBinding(this.controls, 'enabled', {
					label: 'Orbit Controls',
				})
				.on('change', this.resetControls.bind(this))
	}

	update() {
		if (this.controls) this.controls.update()
	}
}

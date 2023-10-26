import Experience from 'webgl/Experience.js'
import fragmentShader from './PixelSorter.frag'
import vertexShader from './PixelSorter.vert'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import initDebug from './PixelSorter.debug.js'
import { PARAMS, state } from './PixelSorter.state.js'
import initGPUCompute from 'components/PixelSorter/PixelSorter.fbo.js'
import { easeOut } from 'utils/Ease.js'

export default class PixelSorter {
	constructor(position = new Vector3(0, 0, 0)) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.seedManager = this.experience.seedManager

		this.position = position
		this.timeElapsed = 0
		PARAMS.image = this.experience.resources.items.image1Texture.image
		PARAMS.mask = this.experience.resources.items.mask1Texture

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		initGPUCompute(PARAMS.image, PARAMS.size)
		initDebug()

		this.seedManager.on('reload', () => {
			initGPUCompute(PARAMS.image, PARAMS.size, true)

			const seed = this.seedManager.getUrlSeed().toString()

			//DirectionSeed
			const x = (seed % 3) - 1
			const y = (Math.floor(seed / 3) % 3) - 1
			PARAMS.direction = { x, y }
			if (x === 0 && y === 0) PARAMS.direction = { x: 1, y: 0 }
			if (!(x === 0 || y === 0)) PARAMS.direction = { x: 0, y: 1 }

			this.experience.debug.ui.refresh()
		})
	}

	setGeometry() {
		state.geometry = new PlaneGeometry(3, 2)
	}

	setMaterial() {
		state.material = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTexture: { value: null },
				uTextureRatio: { value: PARAMS.image.width / PARAMS.image.height },
				uHue: { value: PARAMS.hue },
			},
		})
	}

	setMesh() {
		state.mesh = new Mesh(state.geometry, state.material)
		state.mesh.position.copy(this.position)
		state.mesh.name = 'PixelSorter'
		this.scene.add(state.mesh)
	}

	update() {
		if (!state.variableSorted) return
		if (state.variableSorted.material.uniforms.uIteration.value >= PARAMS.size + state.lastUpdate) return

		state.gpuCompute.compute()
		const { uTexture, uHue } = state.material.uniforms
		uTexture.value = state.gpuCompute.getCurrentRenderTarget(state.variableSorted).texture

		const { uThreshold, uDirection, uIteration } = state.variableSorted.material.uniforms

		const maxDuration = 5000
		const initialValue = 1

		if (uThreshold.value >= 0) {
			this.timeElapsed += this.experience.time.delta
			let progress = this.timeElapsed / maxDuration // Calculate progress as a percentage (0 to 1)

			if (progress > 1) progress = 1 // Cap progress to 1

			const easedProgress = easeOut(progress)
			PARAMS.threshold = initialValue - initialValue * easedProgress // Assuming we're reducing from initialValue to 0
			uThreshold.value = PARAMS.threshold

			this.experience.debug.ui.refresh()
		}

		uDirection.value = PARAMS.direction
		uIteration.value += 1
	}
}

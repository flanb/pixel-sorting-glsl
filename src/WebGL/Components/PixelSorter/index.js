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
		this.thresholdProgress = 0
		this.thresholdProgressMaxDuration = 5000
		PARAMS.image = this.experience.resources.items.image1Texture.image
		PARAMS.mask = this.experience.resources.items.mask1Texture

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		initGPUCompute(PARAMS.image, PARAMS.size)
		initDebug()

		this.seedManager.on('reload', () => {
			initGPUCompute(PARAMS.image, PARAMS.size, true)
			this.timeElapsed = 0

			const seed = this.seedManager.getUrlSeed()

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
		const { uTexture } = state.material.uniforms
		uTexture.value = state.gpuCompute.getCurrentRenderTarget(state.variableSorted).texture

		const { uThreshold, uDirection, uIteration } = state.variableSorted.material.uniforms

		this.timeElapsed += this.experience.time.delta
		this.thresholdProgress = this.timeElapsed / this.thresholdProgressMaxDuration
		if (this.thresholdProgress < 1) {
			PARAMS.threshold = 1 - easeOut(this.thresholdProgress)
			this.experience.debug.ui.refresh()
		}

		uThreshold.value = PARAMS.threshold
		uDirection.value = PARAMS.direction
		uIteration.value += 1
	}
}

import Experience from 'webgl/Experience.js'
import fragmentShader from './PixelSorter.frag'
import vertexShader from './PixelSorter.vert'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import initDebug from './PixelSorter.debug.js'
import { PARAMS, state } from './PixelSorter.state.js'
import initGPUCompute from 'components/PixelSorter/PixelSorter.fbo.js'

export default class PixelSorter {
	constructor(position = new Vector3(0, 0, 0)) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.seedManager = this.experience.seedManager

		this.position = position
		PARAMS.image = this.experience.resources.items.testTexture3.image
		PARAMS.mask = this.experience.resources.items.maskTexture

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		initGPUCompute(PARAMS.image, PARAMS.size)
		initDebug()

		this.seedManager.on('reload', () => {
			initGPUCompute(PARAMS.image, PARAMS.size, true)

			const seed = this.seedManager.getUrlSeed().toString()

			//HueSeed
			let hueSeed = Number(seed.slice(1, 3))
			hueSeed = String(hueSeed).padStart(2, '0')

			PARAMS.hue = hueSeed / 100
			state.material.uniforms.uHue.value = PARAMS.hue

			//DirectionSeed
			const directionSeed = Number(seed.slice(-2, -1))
			const x = (directionSeed % 3) - 1
			const y = (Math.floor(directionSeed / 3) % 3) - 1
			PARAMS.direction = { x, y }
			if (x === 0 && y === 0) PARAMS.direction = { x: 1, y: 0 }

			//ThresholdSeed
			const thresholdSeed = Number(seed.slice(-3, -2))
			PARAMS.threshold = thresholdSeed / 10

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
		uThreshold.value = PARAMS.threshold
		uDirection.value = PARAMS.direction
		uIteration.value += 1
	}
}

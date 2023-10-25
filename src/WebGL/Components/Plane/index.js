import Experience from 'webgl/Experience.js'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'
import fragmentSimulation from './fragmentSimulation.frag'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import getImageData from 'utils/getImageData.js'

export default class Plane {
	constructor(position = new Vector3(0, 0, 0)) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.debug = this.experience.debug
		this.renderer = this.experience.renderer.instance
		this.debug = this.experience.debug
		this.seedManager = this.experience.seedManager

		this.PARAMS = {
			size: 2048,
			threshold: 0.2,
			position,
			image: this.experience.resources.items.testTexture3.image,
			lastUpdate: 0,
			direction: { x: 1, y: 0 },
			hue: 1,
		}

		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		this.initGPUCompute(this.PARAMS.image, this.PARAMS.size)
		this.seedManager.on('reload', () => {
			this.handleReset()
		})

		if (this.debug.active) this.setDebug()
	}

	setGeometry() {
		this.geometry = new PlaneGeometry(3, 2)
	}

	setMaterial() {
		this.material = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTexture: { value: null },
				uTextureRatio: { value: this.PARAMS.image.width / this.PARAMS.image.height },
			},
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.position.copy(this.PARAMS.position)
		this.mesh.name = 'plane'
		this.scene.add(this.mesh)
	}

	initGPUCompute(image, size, disposePrevious = false) {
		if (disposePrevious) {
			this.variableSorted.renderTargets.forEach((rt) => rt.dispose())
			this.variableSorted.material.dispose()
			this.textureSorted.dispose()
			this.gpuCompute.dispose()
		}

		const initialTextureData = new Float32Array(getImageData(image, size)).map((n) => n / 255)

		this.gpuCompute = new GPUComputationRenderer(this.PARAMS.size, this.PARAMS.size, this.renderer)
		this.textureSorted = this.gpuCompute.createTexture()

		this.textureSorted.image.data.set(initialTextureData)

		this.variableSorted = this.gpuCompute.addVariable('uTexture', fragmentSimulation, this.textureSorted)
		this.gpuCompute.setVariableDependencies(this.variableSorted, [this.variableSorted])

		const gpuComputeCompileError = this.gpuCompute.init()

		this.variableSorted.material.uniforms.uIteration = { value: 0 }
		this.variableSorted.material.uniforms.uThreshold = { value: this.PARAMS.threshold }
		this.variableSorted.material.uniforms.uDirection = { value: this.PARAMS.direction }
		this.variableSorted.material.uniforms.uHue = { value: this.PARAMS.hue }

		if (gpuComputeCompileError !== null) {
			console.error(gpuComputeCompileError)
		}
	}

	setDebug() {
		this.debug.ui.addButton({ title: 'Reset', label: '' }).on('click', () => {
			this.handleReset()
		})
		this.debug.ui
			.addBinding(this.PARAMS, 'image', {
				label: 'Image',
				view: 'image',
				height: 100,
				objectFit: 'cover',
			})
			.on('change', () => {
				this.initGPUCompute(this.PARAMS.image, this.PARAMS.size, true)
				this.material.uniforms.uTextureRatio.value = this.PARAMS.image.width / this.PARAMS.image.height
			})
		this.debug.ui
			.addBinding(this.PARAMS, 'size', { label: 'Size', min: 1, max: 4096, step: 2 })
			.on('change', (event) => {
				if (!event.last) return
				this.PARAMS.size = event.value
				this.initGPUCompute(this.PARAMS.image, this.PARAMS.size, true)
			})
		this.debug.ui
			.addBinding(this.PARAMS, 'threshold', {
				label: 'Threshold',
				min: 0,
				max: 1,
				step: 0.01,
			})
			.on('change', () => {
				this.PARAMS.lastUpdate = this.variableSorted.material.uniforms.uIteration.value
			})
		this.debug.ui
			.addBinding(this.PARAMS, 'direction', {
				x: { min: -1, max: 1, step: 1 },
				y: { min: -1, max: 1, step: 1, inverted: true },
			})
			.on('change', () => {
				this.mesh.position.copy(this.PARAMS.position)
				this.PARAMS.lastUpdate = this.variableSorted.material.uniforms.uIteration.value
			})
		this.debug.ui.addBinding(this.PARAMS, 'hue', { min: 1, max: 4, step: 0.01 })
	}

	handleReset() {
		this.initGPUCompute(this.PARAMS.image, this.PARAMS.size, true)
	}

	update() {
		if (!this.variableSorted) return
		if (this.variableSorted.material.uniforms.uIteration.value >= this.PARAMS.size + this.PARAMS.lastUpdate) return

		this.gpuCompute.compute()
		this.material.uniforms.uTexture.value = this.gpuCompute.getCurrentRenderTarget(this.variableSorted).texture

		this.variableSorted.material.uniforms.uThreshold.value = this.PARAMS.threshold
		this.variableSorted.material.uniforms.uDirection.value = this.PARAMS.direction
		this.variableSorted.material.uniforms.uHue.value = this.PARAMS.hue
		this.variableSorted.material.uniforms.uIteration.value += 1
	}
}

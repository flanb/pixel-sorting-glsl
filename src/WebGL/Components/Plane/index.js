import Experience from 'webgl/Experience.js'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'
import fragmentSimulation from './fragmentSimulation.frag'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import getImageData from 'utils/getImageData.js'

export default class Plane {
	constructor(_position = new Vector3(0, 0, 0)) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.debug = this.experience.debug
		this.time = this.experience.time
		this.renderer = this.experience.renderer.instance
		this.debug = this.experience.debug

		this.position = _position

		this.PARAMS = {
			size: 4096,
			threshold: 0.5,
		}

		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		const initialTextureData = new Float32Array(
			getImageData(this.experience.resources.items.testTexture3.image, this.PARAMS.size)
		).map((n) => n / 255)
		this.initGPUCompute(initialTextureData)

		if (this.debug.active) this.setDebug()
	}

	setGeometry() {
		this.geometry = new PlaneGeometry(2, 2, 1)
	}

	setMaterial() {
		this.material = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTexture: { value: null },
			},
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.position.copy(this.position)
		this.mesh.name = 'plane'
		this.scene.add(this.mesh)
	}

	initGPUCompute(initialTextureData, disposePrevious = false) {
		if (disposePrevious) {
			this.variableSorted.renderTargets.forEach((rt) => rt.dispose())
			this.textureSorted.dispose()
		}

		this.gpuCompute = new GPUComputationRenderer(this.PARAMS.size, this.PARAMS.size, this.renderer)
		this.textureSorted = this.gpuCompute.createTexture()

		this.textureSorted.image.data.set(initialTextureData)

		this.variableSorted = this.gpuCompute.addVariable('uTexture', fragmentSimulation, this.textureSorted)
		this.gpuCompute.setVariableDependencies(this.variableSorted, [this.variableSorted])

		const gpuComputeCompileError = this.gpuCompute.init()

		this.variableSorted.material.uniforms.uIteration = { value: 0 }
		this.variableSorted.material.uniforms.uThreshold = { value: 0.5 }

		if (gpuComputeCompileError !== null) {
			console.error(gpuComputeCompileError)
		}
	}

	setDebug() {
		this.debug.ui
			.addBinding({ image: this.experience.resources.items.testTexture3.image }, 'image', {
				label: 'Image',
				view: 'image',
				height: 100,
				objectFit: 'cover',
				showMonitor: true,
			})
			.on('change', (ev) => {
				const initialTextureData = new Float32Array(getImageData(ev.value, this.PARAMS.size)).map((n) => n / 255)
				this.initGPUCompute(initialTextureData, true)
			})
		this.debug.ui.addBinding(this.PARAMS, 'size', { label: 'Size', min: 1, max: 4096, step: 1 }).on('change', () => {
			const initialTextureData = new Float32Array(
				getImageData(this.experience.resources.items.testTexture3.image, this.PARAMS.size)
			).map((n) => n / 255)
			this.initGPUCompute(initialTextureData, true)
		})
		this.debug.ui.addBinding(this.PARAMS, 'threshold', { label: 'Threshold', min: 0, max: 1, step: 0.01 })
	}

	update() {
		if (this.variableSorted.material.uniforms.uIteration.value === this.PARAMS.size) return

		this.gpuCompute.compute()

		const texture = this.gpuCompute.getCurrentRenderTarget(this.variableSorted).texture
		this.material.uniforms.uTexture.value = texture

		this.variableSorted.material.uniforms.uThreshold.value = this.PARAMS.threshold
		this.variableSorted.material.uniforms.uIteration.value += 1
	}
}

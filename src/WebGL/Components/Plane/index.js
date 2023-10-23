import Experience from 'webgl/Experience.js'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'
import fragmentSimulation from './fragmentSimulation.frag'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

export default class Plane {
	constructor(_position = new Vector3(0, 0, 0)) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.debug = this.experience.debug
		this.time = this.experience.time
		this.renderer = this.experience.renderer.instance

		this.position = _position

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		this.initGPUCompute()
	}

	setGeometry() {
		this.geometry = new PlaneGeometry(2, 2, 1)
	}

	setMaterial() {
		this.material = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms: {
				uTexture: { value: this.experience.resources.items.testTexture3 },
			},
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.position.copy(this.position)
		this.mesh.name = 'plane'
		this.scene.add(this.mesh)
	}

	initGPUCompute(dispose = false) {
		const gpuComputeTextureSize = 512
		if (dispose) {
			this.variableSorted.renderTargets.forEach((rt) => rt.dispose())
			textureSorted.dispose()
		}

		this.experience.resources.items.testTexture3.image.src
		const getImageData = (image, size = 1) => {
			const canvas = document.createElement('canvas')
			canvas.height = size
			canvas.width = size

			const context = canvas.getContext('2d')
			context.scale(1, -1)
			context.drawImage(image, 0, 0, size, -size)

			return context.getImageData(0, 0, size, size).data
		}

		const initialTextureData = new Float32Array(
			getImageData(this.experience.resources.items.testTexture3.image, gpuComputeTextureSize)
		).map((n) => n / 255)

		this.gpuCompute = new GPUComputationRenderer(gpuComputeTextureSize, gpuComputeTextureSize, this.renderer)
		const textureSorted = this.gpuCompute.createTexture()

		textureSorted.image.data.set(initialTextureData)

		this.variableSorted = this.gpuCompute.addVariable('uTexture', fragmentSimulation, textureSorted)
		this.gpuCompute.setVariableDependencies(this.variableSorted, [this.variableSorted])

		const gpuComputeCompileError = this.gpuCompute.init()

		this.variableSorted.material.uniforms.uIteration = { value: 0 }

		if (gpuComputeCompileError !== null) {
			console.error(gpuComputeCompileError)
		}
	}

	update() {
		if (this.variableSorted.material.uniforms.uIteration.value === 2048) return

		this.gpuCompute.compute()

		const texture = this.gpuCompute.getCurrentRenderTarget(this.variableSorted).texture
		this.material.uniforms.uTexture.value = texture

		this.variableSorted.material.uniforms.uIteration.value += 1
	}
}

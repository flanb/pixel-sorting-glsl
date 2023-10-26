import { PARAMS, state } from 'components/PixelSorter/PixelSorter.state.js'
import getImageData from 'utils/getImageData.js'
import fragmentSimulation from 'components/PixelSorter/PixelSorter.simulation.frag'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import Experience from 'webgl/Experience.js'

let textureSorted
export default function initGPUCompute(image, size, disposePrevious = false) {
	const experience = new Experience()
	const renderer = experience.renderer.instance
	if (disposePrevious) {
		state.variableSorted.renderTargets.forEach((rt) => rt.dispose())
		state.variableSorted.material.dispose()
		textureSorted.dispose()
		state.gpuCompute.dispose()
	}

	const initialTextureData = new Float32Array(getImageData(image, size)).map((n) => n / 255)

	state.gpuCompute = new GPUComputationRenderer(PARAMS.size, PARAMS.size, renderer)
	textureSorted = state.gpuCompute.createTexture()

	textureSorted.image.data.set(initialTextureData)

	state.variableSorted = state.gpuCompute.addVariable('uTexture', fragmentSimulation, textureSorted)
	state.gpuCompute.setVariableDependencies(state.variableSorted, [state.variableSorted])

	const gpuComputeCompileError = state.gpuCompute.init()

	state.variableSorted.material.uniforms.uIteration = { value: 0 }
	state.variableSorted.material.uniforms.uThreshold = { value: PARAMS.threshold }
	state.variableSorted.material.uniforms.uDirection = { value: PARAMS.direction }
	state.variableSorted.material.uniforms.uHue = { value: PARAMS.hue }
	if (PARAMS.mask !== null) state.variableSorted.material.uniforms.uMaskTexture = { value: PARAMS.mask }

	if (gpuComputeCompileError !== null) {
		console.error(gpuComputeCompileError)
	}
}

import Experience from 'webgl/Experience.js'
import { PARAMS, state } from 'components/PixelSorter/PixelSorter.state.js'
import initGPUCompute from 'components/PixelSorter/PixelSorter.fbo.js'
import { Texture, TextureLoader } from 'three'

export default function initDebug() {
	const experience = new Experience()
	const debug = experience.debug
	if (!debug.active) return

	//Reset
	debug.ui.addButton({ title: 'Reset', label: '' }).on('click', () => {
		initGPUCompute(PARAMS.image, PARAMS.size, true)
	})

	//Image
	debug.ui
		.addBinding(PARAMS, 'image', {
			label: 'Image',
			view: 'image',
		})
		.on('change', () => {
			initGPUCompute(PARAMS.image, PARAMS.size, true)
			state.material.uniforms.uTextureRatio.value = PARAMS.image.width / PARAMS.image.height
		})

	//Mask
	debug.ui
		.addBinding(PARAMS.mask, 'image', {
			label: 'Mask',
			view: 'image',
		})
		.on('change', ({ value }) => {
			const textureLoader = experience.resources.loaders.textureLoader
			textureLoader.load(value.src, (texture) => {
				PARAMS.mask = texture
				state.variableSorted.material.uniforms.uMaskTexture.value = PARAMS.mask
				state.lastUpdate = state.variableSorted.material.uniforms.uIteration.value
			})
		})

	//Size
	debug.ui.addBinding(PARAMS, 'size', { label: 'Size', min: 1, max: 4096, step: 2 }).on('change', (event) => {
		if (!event.last) return
		PARAMS.size = event.value
		initGPUCompute(PARAMS.image, PARAMS.size, true)
	})

	//Threshold
	debug.ui
		.addBinding(PARAMS, 'threshold', {
			label: 'Threshold',
			min: 0,
			max: 1,
			step: 0.01,
		})
		.on('change', () => {
			state.lastUpdate = state.variableSorted.material.uniforms.uIteration.value
		})

	//Direction
	debug.ui
		.addBinding(PARAMS, 'direction', {
			x: { min: -1, max: 1, step: 1 },
			y: { min: -1, max: 1, step: 1, inverted: true },
		})
		.on('change', () => {
			state.lastUpdate = state.variableSorted.material.uniforms.uIteration.value
		})
}

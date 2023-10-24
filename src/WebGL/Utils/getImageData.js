const getImageData = (image, size = 1) => {
	if (!(image instanceof HTMLImageElement)) throw new Error('image is not an instance of HTMLImageElement' + image)
	const canvas = document.createElement('canvas')
	canvas.height = size
	canvas.width = size

	const context = canvas.getContext('2d')
	context.scale(1, -1)
	context.drawImage(image, 0, 0, size, -size)

	const imageData = context.getImageData(0, 0, size, size).data

	canvas.remove()

	return imageData
}

export default getImageData

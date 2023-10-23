const getImageData = (image, size = 1) => {
	const canvas = document.createElement('canvas')
	canvas.height = size
	canvas.width = size

	const context = canvas.getContext('2d')
	context.scale(1, -1)
	context.drawImage(image, 0, 0, size, -size)

	return context.getImageData(0, 0, size, size).data
}

export default getImageData

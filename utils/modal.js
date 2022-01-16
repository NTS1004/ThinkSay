let default_props = {
	title: '提示',
	content: '提示我些什么?',
	isCancel: false,
	confirmText: '确定',
	confirmColor: '#52acff',
	src: '',
	ok: () => {},
	cancel: () => {}
}

export default function modal(props) {
	props = Object.assign({}, default_props, props)
	let footer_height_value = 60
	let footer_height = `${footer_height_value}px`
	let horn_width = '10px'
	let horn_height = '10px'
	let radius = '8px'
	let btn_fontSize = '17px'
	let hover_color = '#E4E4E1'
	let space_count = 0
	let ti = null
	let eventStart = true
	let drawFunc = {}

	if (props.content) {
		space_count = props.content.split('\n').length - 1
	}

	drawFunc.drawOkBtn = (color) => {
		okBtn.draw([{
				tag: 'rect',
				id: 'ok_box',
				position: {
					width: '100%',
					height: '100%'
				},
				rectStyles: {
					color,
					radius
				}
			},
			{
				tag: 'rect',
				id: 'ok_left_horn',
				position: {
					width: horn_width,
					height: horn_height,
					top: '0px'
				},
				rectStyles: {
					color
				}
			},
			{
				tag: 'rect',
				id: 'right_horn',
				position: Object.assign({
					width: horn_width,
					height: horn_height,
					top: '0px'
				}, props.isCancel ? {
					left: '94%'
				} : {
					right: '0px'
				}),
				rectStyles: {
					color
				}
			},
			props.isCancel ? {
				tag: 'rect',
				id: 'ok_lower_left_horn',
				position: {
					width: horn_width,
					height: horn_height,
					bottom: '0px',
					left: '0px'
				},
				rectStyles: {
					color
				}
			} : {},
			{
				tag: 'font',
				id: 'ok_text',
				text: props.confirmText,
				position: {
					width: '100%',
					height: '100%'
				},
				textStyles: {
					align: 'center',
					size: btn_fontSize,
					color: props.confirmColor
				}
			}
		])
	}

	drawFunc.drawCancelBtn = (color) => {
		cancelBtn.draw([{
				tag: 'rect',
				id: 'cancel_box',
				position: {
					width: '100%',
					height: '100%'
				},
				rectStyles: {
					color,
					radius
				}
			},
			{
				tag: 'rect',
				id: 'cancel_left_horn',
				position: {
					width: horn_width,
					height: horn_height,
					top: '0px'
				},
				rectStyles: {
					color
				}
			},
			{
				tag: 'rect',
				id: 'cancel_right_horn',
				position: {
					width: horn_width,
					height: horn_height,
					top: '0px',
					right: '0px'
				},
				rectStyles: {
					color
				}
			},
			{
				tag: 'rect',
				id: 'cancel_lower_right_horn',
				position: {
					width: horn_width,
					height: horn_height,
					bottom: '0px',
					right: '0px'
				},
				rectStyles: {
					color
				}
			},
			{
				tag: 'font',
				id: 'cancel_text',
				text: '取消',
				position: {
					width: '100%',
					height: '100%'
				},
				textStyles: {
					align: 'center',
					size: btn_fontSize
				}
			}
		])
	}

	let close = () => {
		model.close()
		setTimeout(() => {
			mask.close('fade-out')
			box.close()
			okBtn.close()
			if (props.isCancel) cancelBtn.close()
			if (props.src) image.close()
			getApp().model = undefined
		}, 150)
	}

	let touchstart = (func) => {
		eventStart = true
		drawFunc[func](hover_color)
	}

	let touchmove = (e, func) => {
		if (!eventStart) return
		const {
			clientX,
			clientY
		} = e
		let screen_width = plus.screen.resolutionWidth
		let max_x = (screen_width * 0.8) / 2
		let limit_x = clientX <= 0 || clientX >= max_x
		let limit_y = clientY <= 0 || clientY >= footer_height_value
		drawFunc[func](hover_color)
		if (limit_x || limit_y) {
			if (ti) clearTimeout(ti)
			if (eventStart) {
				ti = setTimeout(() => {
					drawFunc[func]('#fff')
					eventStart = false
				}, 100)
			}
		}
	}

	let touchend = (func) => {
		props[func]()
		close()
	}
	let mask = plus.webview.create('', 'mask', {
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		background: 'transparent'
	})
	mask.setStyle({
		mask: 'rgba(0, 0, 0, .5)'
	})
	let model = plus.webview.create('', 'model', {
		width: '80%',
		height: `${props.src ? 250 : 170 + space_count * 20 }px`,
		margin: 'auto',
		background: 'transparent',
		hardwareAccelerated: true
	})
	let box = new plus.nativeObj.View('box', {
		width: '100%',
		height: '100%'
	})
	box.draw([{
			tag: 'rect',
			id: 'rect',
			position: {
				width: '100%',
				height: '100%'
			},
			rectStyles: {
				color: '#fff',
				radius
			}
		},
		{
			tag: 'font',
			id: 'title',
			text: props.title,
			position: {
				width: '100%',
				height: 'wrap_content',
				top: '25px'
			},
			textStyles: {
				align: 'center',
				size: '18px'
			}
		},
		props.src ? {} : {
			tag: 'font',
			id: 'content',
			text: props.content,
			position: {
				width: '100%',
				height: 'wrap_content',
				top: '60px'
			},
			textStyles: {
				align: 'center',
				color: '#888',
				whiteSpace: 'normal',
				lineSpacing: '5px'
			}
		},
		{
			tag: 'rect',
			id: 'line',
			position: {
				width: '100%',
				height: '1px',
				bottom: footer_height
			},
			rectStyles: {
				color: '#EAEAEC'
			}
		}
	])
	let image
	if (props.src) {
		let image_width = 115
		let image_left = (plus.screen.resolutionWidth * 0.8) / 2 - (image_width / 2)
		image = new plus.nativeObj.View('image', {
			width: `${image_width}px`,
			height: '100px',
			top: '60px',
			left: `${image_left}px`
		})
		image.draw([{
			id: 'img',
			tag: 'richtext',
			position: {
				width: '100%',
				height: '100%'
			},
			text: `<img src="${props.src}" width="100%" height="100%"></img>`,
			richTextStyles: {
				align: 'center'
			}
		}])
	}
	let okBtn = new plus.nativeObj.View('ok', {
		width: props.isCancel ? '50%' : '100%',
		height: footer_height,
		bottom: '0px',
		left: props.isCancel ? '50%' : '0px'
	})
	okBtn.addEventListener('touchstart', () => touchstart('drawOkBtn'), false)
	okBtn.addEventListener('touchmove', (e) => touchmove(e, 'drawOkBtn'), false)
	okBtn.addEventListener('touchend', () => touchend('ok'), false)
	drawFunc.drawOkBtn('#fff')

	let cancelBtn
	if (props.isCancel) {
		cancelBtn = new plus.nativeObj.View('cancel', {
			width: '50%',
			height: footer_height,
			bottom: '0px'
		})
		cancelBtn.addEventListener('touchstart', () => touchstart('drawCancelBtn'), false)
		cancelBtn.addEventListener('touchmove', (e) => touchmove(e, 'drawCancelBtn'), false)
		cancelBtn.addEventListener('touchend', () => touchend('cancel'), false)
		drawFunc.drawCancelBtn('#fff')
	}

	model.append(box)
	if (props.src) model.append(image)
	model.append(okBtn)
	if (props.isCancel) model.append(cancelBtn)
	mask.show('fade-in', 120)
	model.show('zoom-fade-out', 120)
	model.allClose = close
	getApp().model = model
}

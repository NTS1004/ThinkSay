import store from "@/store/index.js"
if (!alert) {
	let main = plus.android.runtimeMainActivity()

	plus.runtime.quitApp = plus.runtime.quit
	plus.runtime.quit = () => {
		main.moveTaskToBack(false)
	}

	plus.nativeUI.toast = (str) => {
		if (str == "再按一次退出應用") {
			main.moveTaskToBack(false)
			return false
		}
	}

	plus.key.addEventListener(
		"backbutton",
		() => {
			if (store.state.App.lastPage && !getApp().model) {
				main.moveTaskToBack(false)
			}
		},
		false
	)
}

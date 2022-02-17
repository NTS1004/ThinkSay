let top = 0
let start_y = 0
let start_x = 0
let screenWidth = 0
let screenHeight = 0
let x = 0
let ti = null
let move = false

uni.getSystemInfo({
  success: (res) => {
    screenWidth = res.screenWidth
    screenHeight = res.screenHeight
  }
})

export default function createWindow() {
  let window = new plus.nativeObj.View("window", {
    top: "50px",
    left: "0px",
    height: "100px",
    width: "100px"
  })

  window.drawRect(
    {
      color: "#FFF",
      borderWidth: "1px",
      borderColor: "rgba(0,0,0,.4)",
      radius: "8px"
    },
    {
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%"
    }
  )
  window.show()
  window.addEventListener(
    "click",
    (e) => {
      if (move) return
    },
    false
  )
  window.addEventListener(
    "touchstart",
    (e) => {
      const { clientX, clientY } = e
      start_x = clientX
      start_y = clientY
    },
    false
  )
  window.addEventListener(
    "touchmove",
    (e) => {
      move = true
      const { pageX, pageY } = e
      let moveX = pageX - start_x
      let moveY = pageY - start_y
      let maxX = screenWidth - 100
      let maxY = screenHeight - 100
      if (moveX < 0) {
        moveX = 0
      } else if (moveX > maxX) {
        moveX = maxX
      }
      if (moveY < 0) {
        moveY = 0
      } else if (moveY >= maxY) {
        moveY = maxY
      }
      window.setStyle({
        top: `${moveY}px`,
        left: `${moveX}px`
      })
      x = moveX
    },
    false
  )
  window.addEventListener(
    "touchend",
    (e) => {
      let target
      if (x > screenWidth / 2 - 100 / 2) {
        target = screenWidth - 100
        ti = setInterval(() => {
          x += 30
          if (x >= target) {
            x = target
            clearInterval(ti)
          }
          window.setStyle({
            left: `${x}px`
          })
        }, 30)
      } else {
        target = 0
        ti = setInterval(() => {
          x -= 30
          if (x <= 0) {
            x = 0
            clearInterval(ti)
          }
          window.setStyle({
            left: `${x}px`
          })
        }, 30)
      }
      x = target
      $nextTick(() => {
        move = false
      })
    },
    false
  )
}

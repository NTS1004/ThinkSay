const router = require("koa-router")
const routers = new router()
const { pinyin: PinYin } = require("pinyin-pro")

let field = `id, account, name, avatar, background, initials, pinyin`
let msgText = {
  name: "修改",
  avatar: "更换",
  background: "设置"
}
let emitTi = {}

routers.put("init", async (ctx) => {
  const { id } = ctx.params
  const { info } = ctx.request.body
  try {
    let { clientId, quiet = [], ...reset } = info
    if (!global.user[id]) global.user[id] = {}
    global.user[id].info = reset
    global.user[id].clientId = clientId
    global.user[id].quiet = quiet
    ctx.body = ctx.echo("success")
  } catch (err) {
    console.log(err)
    ctx.body = ctx.echo("error")
  }
})

routers.put("edit", async (ctx) => {
  const { id } = ctx.params
  const { type, name, background } = ctx.request.body
  if (emitTi[id]) {
    clearTimeout(emitTi[id])
  }
  try {
    if (type === "name") {
      if (!name) {
        return (ctx.body = ctx.echo("error", {
          content: "昵称不能为空"
        }))
      } else {
        let data = await ctx.db.execute(`SELECT account, name FROM think_user WHERE name = '${name}'`)
        if (data.length > 0) {
          return (ctx.body = ctx.echo("error", {
            content: "昵称已被注册"
          }))
        } else {
          let initials = PinYin(name, {
            pattern: "first"
          })[0].toLocaleUpperCase()
          let pinyin = PinYin(name, {
            toneType: "none"
          }).replace(/\s*/g, "")
          pinyin = `${pinyin.toLocaleLowerCase()}/${pinyin.toLocaleUpperCase()}`
          await ctx.db.execute(
            `UPDATE think_user SET name = '${name}', initials = '${initials}', pinyin = '${pinyin}' WHERE id = ${id}`
          )
        }
      }
    } else if (type === "avatar") {
      let num = parseInt(Math.random() * 22)
      let avatar = `https://www.cjh1004.vip/user/${num}.jpg`
      await ctx.db.execute(`UPDATE think_user SET avatar = '${avatar}' WHERE id = ${id}`)
    } else {
      await ctx.db.execute(`UPDATE think_user SET background = '${background}' WHERE id = ${id}`)
    }
    let [info] = await ctx.db.execute(`SELECT ${field} FROM think_user WHERE id = ${id}`)
    const { background: backgroundStyle } = info
    info.background = JSON.parse(backgroundStyle)
    global.user[id].info = info
    ctx.body = ctx.echo("success", `${msgText[type]}成功`, {
      data: info
    })
    emitTi[id] = setTimeout(async () => {
      let friends_data = await ctx.db.execute(
        `SELECT ${field} FROM think_user WHERE FIND_IN_SET(${id}, friends) ORDER BY CONVERT( initials USING gbk ) COLLATE gbk_chinese_ci ASC`
      )
      friends_data.forEach((item) => {
        if (global.user[item.id]?.channel) {
          global.user[item.id].channel.push({
            type: "update",
            friendId: id,
            info
          })
        }
      })
    }, 10000)
  } catch (err) {
    ctx.body = ctx.echo("error", {
      content: `${msgText[type]}失败`
    })
  }
})

module.exports = routers.routes()

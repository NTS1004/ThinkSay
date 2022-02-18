const router = require("koa-router")
const routers = new router()
const { pinyin: PinYin } = require("pinyin-pro")
const jwt = require("jsonwebtoken")
const backgroundList = require("./utils/background")

let field = `id, account, password, name, avatar, background, initials, pinyin, friends, quiet, annoyed`

routers.get("login", async (ctx) => {
  let { account, password } = ctx.query
  if (!account || !password) {
    return (ctx.body = ctx.echo("error", {
      title: "登录失败",
      content: "账号或密码不能为空"
    }))
  } else {
    try {
      let data = await ctx.db.execute(`SELECT ${field} FROM think_user WHERE account = "${account}"`)
      if (data.length === 0) {
        return (ctx.body = ctx.echo("error", {
          title: "登录失败",
          content: "账号不存在"
        }))
      } else if (password !== data[0].password) {
        return (ctx.body = ctx.echo("error", {
          title: "登录失败",
          content: "密码错误"
        }))
      } else {
        let info = data[0]
        info.background = JSON.parse(info.background)
        info.quiet = info.quiet ? info.quiet.split(",") : []
        delete info.password
        const payload = {
          id: info.id
        }
        const token = jwt.sign(payload, global.secret)
        return (ctx.body = ctx.echo("success", "登录成功", {
          data: info,
          token
        }))
      }
    } catch (err) {
      console.log(err)
      ctx.body = ctx.echo("error", {
        title: "登录失败",
        content: "服务器出错"
      })
    }
  }
})

routers.get("register", async (ctx) => {
  const { account, name, password } = ctx.query
  if (!account || !password || !name) {
    return (ctx.body = ctx.echo("error", {
      title: "注册失败",
      content: "注册信息填写不完全"
    }))
  } else {
    try {
      let data = await ctx.db.execute(
        `SELECT account, name FROM think_user WHERE account = '${account}' OR name = '${name}'`
      )
      if (data.length > 0) {
        ctx.body = ctx.echo("error", {
          title: "注册失败",
          content: "账号或昵称已被注册"
        })
      } else {
        let num = parseInt(Math.random() * 22)
        let avatar = "https://www.cjh1004.vip/user/" + num + ".jpg"
        let background_url = backgroundList[parseInt(Math.random() * backgroundList.length)]
        let background = {
          url: background_url
        }
        background = JSON.stringify(background)
        let initials = PinYin(name, {
          pattern: "first"
        })[0].toLocaleUpperCase()
        let pinyin = PinYin(name, {
          toneType: "none"
        }).replace(/\s*/g, "")
        pinyin = `${pinyin.toLocaleLowerCase()}/${pinyin.toLocaleUpperCase()}`
        await ctx.db.execute(
          `INSERT INTO think_user (account, name, password, avatar, background, initials, pinyin, friends, black) VALUES ('${account}', '${name}', '${password}', '${avatar}', '${background}', '${initials}', '${pinyin}', '', '')`
        )
        ctx.body = ctx.echo("success", "注册成功")
      }
    } catch (err) {
      console.log(err)
      ctx.body = ctx.echo("error", {
        title: "注册失败",
        content: "服务器出错"
      })
    }
  }
})

module.exports = routers.routes()

const router = require("koa-router")
const routers = new router()
const _ = require("lodash")

let filed = `a.*, concat_ws(',', b.account, b.name, b.avatar, b.background, b.initials, b.pinyin) info`

routers.get("chat/:id/list", async (ctx) => {
  const { id } = ctx.params
  try {
    let record_data = await ctx.db.execute(
      `SELECT ${filed} FROM think_record AS a LEFT JOIN think_user AS b ON a.userId = b.id WHERE a.friendId = ${id} AND a.status = 'unread' GROUP BY a.id`
    )
    let data = {}
    for (let i = 0; i < record_data.length; i++) {
      let { userId: key, msg, image_src, image_width, image_height, tips = "", chatTime, info } = record_data[i]
      if (tips) tips = tips.split(",")
      if (!data[key]) {
        data[key] = {}
        let [account, name, avatar, url, top, initials, pinyin] = info.split(",")
        let background = `${url},${top}`
        background = JSON.parse(background)
        data[key].info = { id: key, account, name, avatar, background, initials, pinyin }
        data[key].record = []
        data[key].badge_count = 0
      }
      data[key].record.push(
        _.pickBy({
          key,
          msg,
          image_src,
          image_width,
          image_height,
          tips,
          chatTime
        })
      )
      data[key].badge_count += 1
    }
    ctx.body = ctx.echo("success", "", {
      data
    })
    if (Object.keys(data).length > 0) {
      await ctx.db.execute(`UPDATE think_record SET status = 'read' WHERE friendId = ${id}`)
    }
  } catch (err) {
    ctx.body = ctx.echo("error")
  }
})

routers.post("chat/:friendId/save", async (ctx) => {
  let { friendId } = ctx.params
  let { key, msg = "", chatTime, image_src = "", image_width = "", image_height = "", tips = [] } = ctx.request.body
  try {
    await ctx.db.execute(
      `INSERT INTO think_record (userId, friendId, msg, chatTime, image_src, image_width, image_height, tips, status ) VALUES (${key}, ${friendId}, "${msg}", "${chatTime}", "${image_src}", "${image_width}", "${image_height}", "${tips.join(
        ","
      )}", "unread")`
    )
    ctx.body = ctx.echo("success")
  } catch (err) {
    ctx.body = ctx.echo("error", err)
  }
})

routers.get("apply/:id/list", async (ctx) => {
  const { user, push } = global
  const { id } = ctx.params
  try {
    let data = await ctx.db.execute(
      `SELECT ${filed} FROM think_apply a LEFT JOIN think_user b ON a.userId = b.id WHERE status = 'unread' AND friendId = ${id}`
    )
    for (let i = 0; i < data.length; i++) {
      const { userId, info, source } = data[i]
      let [account, name, avatar, url, top, initials, pinyin] = info.split(",")
      let background = `${url},${top}`
      background = JSON.parse(background)
      data[i].info = { id: userId, account, name, avatar, background, initials, pinyin, source }
    }
    ctx.body = ctx.echo("success", "", {
      data
    })
    if (data.length > 0) {
      const {
        info: { id: friendId, name, avatar }
      } = data[data.length - 1]
      const { clientId, shield } = user[id]
      if (!shield.includes(friendId)) {
        push.send({
          notify_id: friendId,
          info: { name, avatar },
          msg: "请求添加你为好友",
          payload: {
            page: "/pages/new-friends/index"
          },
          cid: [clientId]
        })
      }
      await ctx.db.execute(`UPDATE think_apply SET status = 'read' WHERE friendId = ${id}`)
    }
  } catch (err) {
    ctx.body = ctx.echo("error", {
      content: "获取添加申请列表失败"
    })
  }
})

module.exports = routers.routes()

const router = require("koa-router")
const routers = new router()

let field = `id, account, name, avatar, background, initials, pinyin, quiet, annoyed`

routers.get("list", async (ctx) => {
  const { id } = ctx.params
  try {
    let data = await ctx.db.execute(
      `SELECT ${field}, FIND_IN_SET('${id}', friends) friend, FIND_IN_SET('${id}', annoyed) annoyed  FROM think_user WHERE FIND_IN_SET(${id}, friends) ORDER BY CONVERT( initials USING gbk ) COLLATE gbk_chinese_ci ASC`
    )
    ctx.body = ctx.echo("success", "", {
      data
    })
    if (!global.user[id]) global.user[id] = {}
    global.user[id].load = true
  } catch (err) {
    console.log(err)
    ctx.body = ctx.echo("error", {
      content: "获取好友列表失败"
    })
  }
})

routers.get("search", async (ctx) => {
  const { id } = ctx.params
  const { key, id: friendId } = ctx.query
  try {
    let data = await ctx.db.execute(
      `SELECT ${field}, FIND_IN_SET('${id}', friends) friend, FIND_IN_SET('${id}', annoyed) annoyed FROM think_user WHERE account = '${key}' OR name = '${key}' ${
        friendId ? `OR id = ${friendId}` : ""
      } ORDER BY id ASC`
    )
    let status = data.length > 0 ? "success" : "error"
    let msg =
      data.length > 0
        ? ""
        : {
            content: "未搜索到用户"
          }
    if (data.length > 0) {
      if (Number(id) === Number(data[0].id)) {
        status = "error"
        msg = {
          content: "你搜自己干嘛(ˉ▽ˉ；)..."
        }
        data = []
      } else {
        msg = ""
      }
    } else {
      msg = {
        content: "未搜索到用户"
      }
    }
    ctx.body = ctx.echo(status, msg, {
      data
    })
  } catch (err) {
    ctx.body = ctx.echo("error", {
      content: "搜索失败"
    })
  }
})

routers.delete("delete", async (ctx) => {
  const { id } = ctx.params
  const { friendId } = ctx.request.body
  try {
    await ctx.db.execute(
      `UPDATE think_user SET friends = TRIM(BOTH ',' FROM replace(concat(',',friends,','), ',${id},', '')) WHERE id = ${friendId}`
    )
    if (global.user[friendId]?.channel) {
      global.user[friendId].channel.push({
        type: "update",
        friendId: id,
        info: { friend: 0 }
      })
    }
    ctx.body = ctx.echo("success", "删除成功")
  } catch (err) {
    ctx.body = ctx.echo("error", {
      content: "删除失败"
    })
  }
})

routers.put("apply", async (ctx) => {
  const { user, push, axios } = global
  const { id } = ctx.params
  const { friendId, info: friend_info, source } = ctx.request.body
  const { info, clientId } = user[id]
  const { name, avatar } = info
  try {
    let data = await ctx.db.execute(
      `SELECT ${field}, friends FROM think_user WHERE FIND_IN_SET(${friendId}, friends) AND id = ${id}`
    )
    if (data.length === 0) {
      if (user[friendId]?.channel) {
        const { clientId: friend_clientId, shield: friend_shield } = user[friendId]
        global.user[friendId].channel.push({
          type: "apply",
          friendId: id,
          info: Object.assign({}, info, { source })
        })
        if (!friend_shield.includes(id)) {
          push.send({
            notify_id: id,
            info: { name, avatar },
            msg: `请求添加你为好友`,
            payload: {
              page: "/pages/new-friends/index"
            },
            cid: [friend_clientId]
          })
        }
      } else {
        let [apply_data] = await ctx.db.execute(
          `SELECT * FROM think_apply WHERE userId = ${id} AND friendId = ${friendId}`
        )
        if (apply_data) {
          const { status, source: apply_source } = apply_data
          if (status !== "unread" || apply_source !== source) {
            await ctx.db.execute(
              `UPDATE think_apply SET source = '${source}', status = 'unread' WHERE userId = ${id} AND friendId = ${friendId}`
            )
          }
        } else {
          await ctx.db.execute(
            `INSERT INTO think_apply (userId, friendId, source, status) VALUES (${id}, ${friendId}, '${source}', 'unread')`
          )
        }
      }
    } else {
      await ctx.db.execute(
        `UPDATE think_user SET friends = CONCAT(friends, IF(friends,",${id}","${id}")) WHERE id = ${friendId}`
      )
      let record = {
        msg: `你好, 我是${name}`,
        tips: [`${name}把你删了又把你加了回来 ╮(╯-╰)╭`],
        chatTime: ctx.moment().format("YYYY-MM-DD HH:mm:ss")
      }
      if (!user[friendId]?.channel) {
        await axios.post(`https://localhost:1437/record/chat/${friendId}/save`, {
          key: id,
          ...record
        })
      } else {
        const { clientId: friend_clientId, shield: friend_shield } = user[friendId]
        global.user[friendId].channel.push({
          type: "chat",
          record: {
            [id]: {
              info,
              record: [record]
            }
          }
        })
        global.user[friendId].channel.push({
          type: "update",
          friendId: id,
          info: { friend: 1 }
        })
        if (!friend_shield.includes(id)) {
          push.send({
            notify_id: id,
            info: { name, avatar },
            msg: `${name}把你删了又把你加了回来 ╮(╯-╰)╭`,
            payload: {
              page: "/pages/chat/index",
              params: { friendId: id }
            },
            cid: [friend_clientId]
          })
        }
      }
      global.user[id].channel.push({
        type: "chat",
        record: {
          [friendId]: {
            info: friend_info,
            record: [
              {
                tips: [`你已添加了${friend_info.name}，现在可以开始聊天了。`],
                chatTime: ctx.moment().format("YYYY-MM-DD HH:mm:ss")
              }
            ],
            badge_count: 0,
            update: true
          }
        }
      })
      push.send({
        notify_id: friendId,
        info: { name: friend_info.name, avatar: friend_info.avatar },
        msg: `你已添加了${friend_info.name}，现在可以开始聊天了。`,
        payload: {
          page: "/pages/chat/index",
          params: { friendId }
        },
        cid: [clientId]
      })
    }
    ctx.body = ctx.echo("success", "已发送")
  } catch (err) {
    ctx.body = ctx.echo("error", {
      content: "发送失败"
    })
  }
})

routers.put("accept", async (ctx) => {
  const { user, push, axios } = global
  const { id } = ctx.params
  let { friendId, msg, info: friend_info } = ctx.request.body
  const { info, clientId } = user[id]
  const { name, avatar } = info
  try {
    let sql = [
      `UPDATE think_user SET friends = CONCAT(friends, IF(friends,",${friendId}","${friendId}")) WHERE id = ${id}`,
      `UPDATE think_user SET friends = CONCAT(friends, IF(friends,",${id}","${id}")) WHERE id = ${friendId}`
    ]
    await ctx.db.execute(sql)
    let record = {
      msg: "我通过了你的朋友申请，现在我们可以开始聊天了。",
      chatTime: ctx.moment().format("YYYY-MM-DD HH:mm:ss")
    }
    if (global.user[friendId]?.channel) {
      const { clientId: friend_clientId, shield: friend_shield } = user[friendId]
      global.user[friendId].channel.push({
        type: "chat",
        record: {
          [id]: {
            info,
            record: [record],
            update: true
          }
        }
      })
      if (!friend_shield.includes(id)) {
        push.send({
          notify_id: id,
          info: { name, avatar },
          msg: "我通过了你的朋友申请，现在我们可以开始聊天了。",
          payload: {
            page: "/pages/chat/index",
            params: { friendId: id }
          },
          cid: [friend_clientId]
        })
      }
    } else {
      await axios.post(`https://localhost:1437/record/chat/${friendId}/save`, {
        key: id,
        ...record
      })
    }
    global.user[id].channel.push({
      type: "chat",
      record: {
        [friendId]: {
          record: [
            {
              info: friend_info,
              msg,
              tips: ["以上是打招呼的内容", `你已添加了${friend_info.name}，现在可以开始聊天了。`],
              chatTime: ctx.moment().format("YYYY-MM-DD HH:mm:ss")
            }
          ],
          badge_count: 0,
          update: true
        }
      }
    })
    push.send({
      notify_id: friendId,
      info: { name: friend_info.name, avatar: friend_info.avatar },
      msg: `你已添加了${friend_info.name}，现在可以开始聊天了。`,
      payload: {
        page: "/pages/chat/index",
        params: { friendId }
      },
      cid: [clientId]
    })
    ctx.body = ctx.echo("success", "已发送")
  } catch (err) {
    ctx.body = ctx.echo("error", {
      content: "发送失败"
    })
  }
})

routers.put("set/:shield", async (ctx) => {
  const { id, shield } = ctx.params
  const { friendId, status } = ctx.request.body
  try {
    let sql = [
      `SELECT id, account, name, avatar, background, initials, pinyin, friends, quiet, annoyed FROM think_user WHERE id = ${id}`
    ]
    if (status) {
      sql.unshift(
        `UPDATE think_user SET ${shield} = CONCAT(${shield}, IF(${shield}, ",${friendId}", "${friendId}")) WHERE id = ${id}`
      )
    } else {
      sql.unshift(
        `UPDATE think_user SET ${shield} = TRIM(BOTH ',' FROM replace(concat(',',${shield},','), ',${friendId},', '')) WHERE id = ${id}`
      )
    }
    const [_, info] = await ctx.db.execute(sql, [1])
    info.background = JSON.parse(info.background)
    info.quiet = info.quiet ? info.quiet.split(",") : []
    info.annoyed = info.annoyed ? info.annoyed.split(",") : []
    if (global.user[friendId]?.channel && shield !== "quiet") {
      global.user[friendId].channel.push({
        type: "update",
        friendId: id,
        info: {
          [shield]: status
        }
      })
    }
    ctx.body = ctx.echo("success", shield === "quiet" ? "" : `已${status ? "加入" : "移除"}黑名单`, {
      data: info
    })
  } catch (err) {
    console.log(err)
    ctx.body = ctx.echo("error", {
      content: shield === "quiet" ? "设置失败" : `${status ? "加入" : "移除"}黑名单失败`
    })
  }
})

module.exports = routers.routes()

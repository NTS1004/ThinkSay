module.exports = (wss, global) => {
  const { axios } = global
  wss.on("connection", async (ws, req) => {
    let id = req.url.split("=")[1]
    if (!global.user[id]) global.user[id] = {}
    if (!global.user[id].channel) global.user[id].channel = []
    global.user[id].ws = ws
    global.user[id].load = false

    ws.on("message", async (message) => {
      const { channel } = global.user[id]
      let data = JSON.parse(message.toString())
      const { type, friendId, record, extend_error } = data
      if (type === "ping") {
        ws.send(
          JSON.stringify({
            type
          })
        )
      } else if (type === "chat") {
        let send_err
        if (!global.user[id].load) {
          const {
            data: [friend_info]
          } = await axios.get(`http://localhost:1437/friend/${id}/search`, {
            params: { id: friendId }
          })
          const { friend, annoyed } = friend_info
          if (!friend) {
            send_err = "friend"
          } else if (annoyed) {
            send_err = "annoyed"
          }
        }
        if (!send_err) {
          if (global.user[friendId]?.channel) {
            const { ws: friend_ws } = global.user[friendId]
            friend_ws.send(
              JSON.stringify({
                type,
                record: {
                  [id]: {
                    info: global.user[id].info,
                    record: [record]
                  }
                }
              })
            )
          } else {
            await axios.post(`http://localhost:1437/record/chat/${friendId}/save`, record)
          }
        } else {
          ws.send(
            JSON.stringify({
              type: "chat-error",
              friendId,
              record: {
                key: "tip",
                tip: send_err,
                chatTime: record.chatTime
              },
              extend_error
            })
          )
        }
      } else if (["voice", "video"].includes(type)) {
        const { ws: friend_ws } = global.user[friendId]
        if (global.user[friendId]?.channel) {
          friend_ws.send(
            JSON.stringify({
              type,
              info: global.user[id].info
            })
          )
        }
      }
      if (channel.length) {
        ws.send(JSON.stringify(channel))
        global.user[id].channel = []
      }
    })
    ws.on("close", () => {
      delete global.user[id].channel
    })
  })
}

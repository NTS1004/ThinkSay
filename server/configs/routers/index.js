const router = require("koa-router")
const routers = new router()

routers.use("auth/", require("./auth"))
routers.use("info/:id/", require("./info"))
routers.use("friend/:id/", require("./friend"))
routers.use("record/", require("./record"))

module.exports = routers.routes()

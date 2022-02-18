const Mysql = require("mysql-pro")
const config = require("../index")

let db = new Mysql({
  mysql: {
    host: config.db_host,
    port: config.db_port,
    user: config.db_user,
    password: config.db_pass,
    database: config.db_database
  }
})

db.execute = async (sql, single = []) => {
  let res
  await db.startTransaction()
  if (typeof sql == "string") {
    res = await db.executeTransaction(sql)
  } else {
    res = []
    for (let i = 0; i < sql.length; i++) {
      let data = await db.executeTransaction(sql[i])
      if (single === "all" || single.includes(index)) {
        res.push(data[0])
      } else {
        res.push(data)
      }
    }
  }
  await db.stopTransaction()
  return res
}

module.exports = db

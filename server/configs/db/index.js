const Mysql = require("mysql-pro")
const config = require("../index")

let db = new Mysql({
  mysql: {
    host: config.db_host,
    port: config.db_port,
    user: config.db_user,
    password: config.db_pass,
    database: config.db_database,
    useConnectionPooling: true,
    connectionLimit: 100, // 一次创建的最大连接数
    waitForConnections: true // 连接池满了，就等待连接池释放
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
      if (single === "all" || single.includes(i)) {
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

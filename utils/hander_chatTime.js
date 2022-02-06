import moment from "moment"

function getWeekDay(date) {
  let weekOfDay = moment(date).format("E")
  let today = moment().format("YYYY-MM-DD")
  let lastSunday = moment(date)
    .add(7 - weekOfDay, "days")
    .format("YYYY-MM-DD")
  let week_day
  let week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  if (lastSunday > today) {
    week_day = week[weekOfDay]
  } else {
    week_day = false
  }
  return week_day
}

function getWeather(date) {
  let time = Number(moment(date).format("HH"))
  let weather
  if (time < 6) {
    weather = "凌晨"
  } else if (time < 12) {
    weather = "上午"
  } else if (time < 13) {
    weather = "中午"
  } else if (time < 18) {
    weather = "下午"
  } else {
    weather = "晚上"
  }
  return weather
}

export default function hander_charTime(chatTime, details = false) {
  if (!chatTime) return ""
  let today = moment().format("YYYY-MM-DD")
  let yesterday = moment().add(-1, "day").format("YYYY-MM-DD")
  let chatTime_ymd = moment(chatTime).format("YYYY-MM-DD")
  let chatTime_hm = moment(chatTime).format("h:mm")
  let week_day = getWeekDay(chatTime_ymd)
  let time
  let type = ""
  if (chatTime_ymd === today) {
    let weather = getWeather(chatTime)
    time = `${weather}${chatTime_hm}`
    type = "today"
  } else if (chatTime_ymd === yesterday) {
    time = `昨天`
    type = "yesterday"
  } else if (week_day) {
    time = week_day
    type = "weekday"
  } else {
    time = moment(chatTime).format(`MM月DD日`)
    type = "date"
  }
  if (details && type !== "today") {
    time = `${time} ${getWeather(chatTime)}${chatTime_hm}`
  }
  return time
}

export default function getCtrlType(rtc_type, rtc_status, microphone, speaker) {
  return {
    accept: {
      type: rtc_type,
      text: "接听"
    },
    hang: {
      type: "hang",
      text: `${rtc_status === "send" ? "取消" : "挂断"}`
    },
    micro_phone: {
      type: microphone ? "microphone" : "close-microphone",
      mode: "microPhone",
      text: `麦克风已${microphone ? "开" : "关"}`,
      func: "ctrlMicroPhone"
    },
    speaker: {
      type: "speaker",
      mode: "speaker",
      text: `扬声器已${speaker ? "开" : "关"}`,
      func: "ctrlMicroPhone"
    },
    switch_voice: {
      type: "switch-voice",
      text: "切换语音通话"
    },
    switch_camera: {
      type: "switch-camera",
      text: "切换摄像头"
    }
  }
}

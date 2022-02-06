export default (text) => {
  var Toast = plus.android.importClass("android.widget.Toast")
  var mToast = Toast.makeText(plus.android.runtimeMainActivity(), null, Toast.LENGTH_SHORT)
  mToast.setText(text)
  mToast.show()
}

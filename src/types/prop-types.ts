export type BorderStyle =
  | 'none' // 无边框
  | 'solid' // 实线边框
  | 'dashed' // 虚线边框
  | 'dotted' // 点线边框
  | 'double' // 双线边框（部分平台支持）
  | 'groove' // 3D凹槽边框（部分平台支持）
  | 'ridge' // 3D脊状边框（部分平台支持）
  | 'inset' // 3D内嵌边框（部分平台支持）
  | 'outset' // 3D外凸边框（部分平台支持）

export type InputType =
  | 'text' // 文本输入键盘
  | 'number' // 数字输入键盘
  | 'idcard' // 身份证输入键盘
  | 'digit' // 带小数点的数字键盘
  | 'tel' // 电话输入键盘
  | 'safe-password' // 密码安全输入键盘
  | 'nickname' // 昵称输入键盘

export type KeyboardConfirmType =
  | 'send' // 右下角按钮为“发送”
  | 'search' // 右下角按钮为“搜索”
  | 'next' // 右下角按钮为“下一个”
  | 'go' // 右下角按钮为“前往”
  | 'done' // 右下角按钮为“完成”

export type ColorType = 'primary' | 'success' | 'warning' | 'error' | 'info'
export type SizeType = 'small' | 'medium' | 'large'

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

export type AlignType = 'left' | 'center' | 'right' | 'start' | 'end'

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

export type ImageMode =
  | 'scaleToFill' // 不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素
  | 'aspectFit' // 保持纵横比缩放图片，使图片的长边能完全显示出来
  | 'aspectFill' // 保持纵横比缩放图片，只保证图片的短边能完全显示出来
  | 'widthFix' // 宽度不变，高度自动变化，保持原图宽高比不变
  | 'heightFix' // 高度不变，宽度自动变化，保持原图宽高比不变
  | 'top' // 不缩放图片，只显示图片的顶部区域
  | 'bottom' // 不缩放图片，只显示图片的底部区域
  | 'center' // 不缩放图片，只显示图片的中间区域
  | 'left' // 不缩放图片，只显示图片的左边区域
  | 'right' // 不缩放图片，只显示图片的右边区域
  | 'top left' // 不缩放图片，只显示图片的左上边区域
  | 'top right' // 不缩放图片，只显示图片的右上边区域
  | 'bottom left' // 不缩放图片，只显示图片的左下边区域
  | 'bottom right' // 不缩放图片，只显示图片的右下边区域

import React from 'react'

interface AppFormItemProps {
  label: string            // 输入域标签名称
  required?: boolean       // 是否必填，若为 true 会自动追加红色星号
  error?: string           // 表单验证错误信息，若存在则会抖动高亮显示
  description?: string     // 表单项的副标题/解释说明文案
  children: React.ReactNode
  className?: string
}

export function AppFormItem({
  label,
  required = false,
  error,
  description,
  children,
  className = ''
}: AppFormItemProps) {
  return (
    <div className={`space-y-2 text-xs text-foreground font-sans ${className}`}>
      {/* 标题 */}
      <label className="text-xs font-heading font-bold uppercase tracking-wider flex items-center select-none">
        <span>{label}</span>
        {required && (
          <span className="text-destructive font-heading font-black ml-1 text-sm leading-none">
            *
          </span>
        )}
      </label>

      {/* 描述信息 */}
      {description && (
        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
          {description}
        </p>
      )}

      {/* 表单控件本体 */}
      <div>{children}</div>

      {/* 报错详情 */}
      {error && (
        <p className="text-[10px] text-destructive font-bold tracking-wide mt-1.5 animate-shake flex items-center space-x-1.5">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export default AppFormItem

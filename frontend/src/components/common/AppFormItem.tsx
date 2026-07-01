import React from 'react'

interface AppFormItemProps {
  label: string            // 输入域标签名称
  required?: boolean       // 是否必填
  error?: string           // 表单验证错误信息
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
    <div className={`space-y-1.5 text-[13px] text-foreground font-sans ${className}`}>
      {/* 标签 */}
      <label className="text-[12px] font-mono font-medium text-muted-foreground flex items-center select-none uppercase tracking-wider">
        <span>{label}</span>
        {required && (
          <span className="text-destructive ml-1 text-sm leading-none">*</span>
        )}
      </label>

      {/* 描述信息 */}
      {description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
          {description}
        </p>
      )}

      {/* 表单控件本体 */}
      <div>{children}</div>

      {/* 报错详情 */}
      {error && (
        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1 font-mono">
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export default AppFormItem

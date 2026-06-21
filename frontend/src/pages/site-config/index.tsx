import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Settings, RefreshCw, Save, Phone, Mail, Globe } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppImageUploader from '@/components/business/AppImageUploader'
import { useSiteConfig, useSaveSiteConfig } from '@/queries/useSiteConfigQuery'

export default function SiteConfigPage() {
  // 状态绑定
  const [siteName, setSiteName] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [qrCodeImage, setQrCodeImage] = useState('')

  // ==================== 1. API 数据拉取 ====================

  const { data: configs, isLoading, isFetching, refetch } = useSiteConfig()

  // 当配置加载完毕，回填状态
  useEffect(() => {
    if (configs && configs.length > 0) {
      configs.forEach((item) => {
        if (item.config_key === 'site_name') setSiteName(item.config_value)
        if (item.config_key === 'site_logo') setSiteLogo(item.config_value)
        if (item.config_key === 'contact_phone') setContactPhone(item.config_value)
        if (item.config_key === 'contact_email') setContactEmail(item.config_value)
        if (item.config_key === 'qr_code_image') setQrCodeImage(item.config_value)
      })
    }
  }, [configs])

  // ==================== 2. API Mutations ====================

  const saveMutation = useSaveSiteConfig()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(
      {
        site_name: siteName,
        site_logo: siteLogo,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        qr_code_image: qrCodeImage,
      },
      {
        onSuccess: () => toast.success('系统配置保存成功'),
        onError: (err: any) => toast.error(err.response?.data?.message || '保存配置失败'),
      }
    )
  }

  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* 顶部控制横幅 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-2 border-border pop-shadow p-5 rounded-xl transition-all duration-300">
        <div className="flex items-center space-x-2.5">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-heading font-bold tracking-wider text-foreground uppercase">
            站点基本信息配置
          </h2>
          {(isLoading || isFetching) && (
            <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
          )}
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 border-2 border-border bg-background text-foreground hover:bg-accent transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer max-w-fit"
          title="刷新数据"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col justify-center items-center space-y-3 bg-card border-2 border-border pop-shadow rounded-xl">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">正在载入配置参数...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 左半部分：基本信息（粉蓝拼色卡片） */}
            <div className="bg-[#E8F4FD] dark:bg-[#1E293B] border-2 border-border rounded-xl p-6 pop-shadow space-y-6">
              <h3 className="text-sm font-heading font-bold text-foreground border-b-2 border-border pb-3 flex items-center space-x-2 select-none">
                <Globe className="h-4 w-4 text-primary" />
                <span>基础运行属性 / GENERAL PROPERTIES</span>
              </h3>

              {/* 站点名称 */}
              <AppFormItem label="站点名称 / SITE NAME" required>
                <input
                  type="text"
                  required
                  placeholder="如: CyberMind 官方网站"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
                />
              </AppFormItem>

              {/* 站点 LOGO */}
              <AppFormItem label="站点 LOGO / SITE LOGO">
                <AppImageUploader
                  value={siteLogo}
                  onChange={setSiteLogo}
                  disabled={saveMutation.isPending}
                />
              </AppFormItem>
            </div>

            {/* 右半部分：联系方式（奶油黄拼色卡片） */}
            <div className="bg-[#FEF9E7] dark:bg-[#1E293B] border-2 border-border rounded-xl p-6 pop-shadow space-y-6">
              <h3 className="text-sm font-heading font-bold text-foreground border-b-2 border-border pb-3 flex items-center space-x-2 select-none">
                <Phone className="h-4 w-4 text-primary" />
                <span>联系与宣发渠道 / CONTACT DETAILS</span>
              </h3>

              {/* 手机号 */}
              <AppFormItem label="联系电话 / CONTACT PHONE">
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="请输入联系电话"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-bold font-mono"
                  />
                </div>
              </AppFormItem>

              {/* 邮箱 */}
              <AppFormItem label="电子邮箱 / CONTACT EMAIL">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
                  />
                </div>
              </AppFormItem>

              {/* 二维码上传 */}
              <AppFormItem label="公众号/客服二维码 / QR CODE">
                <AppImageUploader
                  value={qrCodeImage}
                  onChange={setQrCodeImage}
                  disabled={saveMutation.isPending}
                />
              </AppFormItem>
            </div>
          </div>

          {/* 底部物理按压提交保存按钮 */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-8 py-3.5 bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider rounded-lg pop-shadow-sm pop-press flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saveMutation.isPending ? '正在保存站点配置...' : '保存站点配置 SAVE CONFIG'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

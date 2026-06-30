import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Settings, RefreshCw, Save, Phone, Mail, Globe } from 'lucide-react'
import AppFormItem from '@/components/common/AppFormItem'
import AppImageUploader from '@/components/business/AppImageUploader'
import AppInput from '@/components/common/AppInput'
import AppButton from '@/components/common/AppButton'
import AppToolbar from '@/components/common/AppToolbar'
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
      <AppToolbar
        icon={<Settings className="h-5 w-5 text-primary" strokeWidth={1.75} />}
        title="站点基本信息配置"
        loading={isLoading || isFetching}
        actions={
          <AppButton
            onClick={() => refetch()}
            size="icon"
            variant="secondary"
            title="刷新数据"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
          </AppButton>
        }
      />

      {isLoading ? (
        <div className="h-64 flex flex-col justify-center items-center gap-3 bg-card rounded-2xl elevation-1">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" strokeWidth={1.75} />
          <span className="text-[13px] text-muted-foreground">正在载入配置参数...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 左半部分：基本信息 */}
            <div className="bg-card rounded-2xl p-6 elevation-1 space-y-6">
              <h3 className="text-[14px] font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2 select-none">
                <Globe className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span>基础运行属性</span>
              </h3>

              {/* 站点名称 */}
              <AppFormItem label="站点名称" required>
                <AppInput
                  type="text"
                  required
                  placeholder="如: CyberMind 官方网站"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </AppFormItem>

              {/* 站点 LOGO */}
              <AppFormItem label="站点 LOGO">
                <AppImageUploader
                  value={siteLogo}
                  onChange={setSiteLogo}
                  disabled={saveMutation.isPending}
                />
              </AppFormItem>
            </div>

            {/* 右半部分：联系方式 */}
            <div className="bg-card rounded-2xl p-6 elevation-1 space-y-6">
              <h3 className="text-[14px] font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2 select-none">
                <Phone className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span>联系与宣发渠道</span>
              </h3>

              {/* 手机号 */}
              <AppFormItem label="联系电话">
                <AppInput
                  type="text"
                  placeholder="请输入联系电话"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
                  inputClassName="pl-10"
                />
              </AppFormItem>

              {/* 邮箱 */}
              <AppFormItem label="电子邮箱">
                <AppInput
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
                  inputClassName="pl-10"
                />
              </AppFormItem>

              {/* 二维码上传 */}
              <AppFormItem label="公众号/客服二维码">
                <AppImageUploader
                  value={qrCodeImage}
                  onChange={setQrCodeImage}
                  disabled={saveMutation.isPending}
                />
              </AppFormItem>
            </div>
          </div>

          {/* 底部保存按钮 */}
          <div className="flex justify-end pt-4">
            <AppButton
              type="submit"
              disabled={saveMutation.isPending}
              loading={saveMutation.isPending}
              loadingText="正在保存站点配置..."
              icon={<Save className="h-4 w-4" strokeWidth={1.75} />}
            >
              保存站点配置
            </AppButton>
          </div>
        </form>
      )}
    </div>
  )
}

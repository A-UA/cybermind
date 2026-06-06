import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { toast } from 'sonner'
import { Settings, Upload, RefreshCw, Save, Phone, Mail, Globe } from 'lucide-react'

interface ISiteConfigItem {
  id: number
  config_key: string
  config_value: string
  config_type: string
  description: string
  updated_at: string
}

export default function SiteConfigPage() {
  // 状态绑定
  const [siteName, setSiteName] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [qrCodeImage, setQrCodeImage] = useState('')

  const [logoUploading, setLogoUploading] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const qrInputRef = useRef<HTMLInputElement>(null)

  // 拉取全站配置
  const { data: configs, isLoading, isFetching, refetch } = useQuery<ISiteConfigItem[]>({
    queryKey: ['site-config'],
    queryFn: async () => {
      const res = await apiClient.get('/site-config/')
      return res.data.data
    }
  })

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

  // 上传图片公共方法
  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data.url
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoUploading(true)
      try {
        const url = await uploadImageFile(file)
        setSiteLogo(url)
        toast.success('站点 LOGO 上传成功')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'LOGO 上传失败')
      } finally {
        setLogoUploading(false)
      }
    }
  }

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrUploading(true)
      try {
        const url = await uploadImageFile(file)
        setQrCodeImage(url)
        toast.success('二维码图片上传成功')
      } catch (err: any) {
        toast.error(err.response?.data?.message || '二维码上传失败')
      } finally {
        setQrUploading(false)
      }
    }
  }

  // 批量保存
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        site_name: siteName,
        site_logo: siteLogo,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        qr_code_image: qrCodeImage
      }
      await apiClient.put('/site-config/', { configs: payload })
    },
    onSuccess: () => {
      toast.success('系统配置保存成功')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '保存配置失败')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate()
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
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                  站点名称 / SITE NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="如: CyberMind 官方网站"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
                />
              </div>

              {/* 站点 LOGO */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                  站点 LOGO / SITE LOGO
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="请输入 LOGO 图片链接或点击右侧上传"
                    value={siteLogo}
                    onChange={(e) => setSiteLogo(e.target.value)}
                    className="flex-1 px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
                  />
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="px-4 py-3 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold flex items-center space-x-1.5 transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 text-xs"
                  >
                    {logoUploading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{logoUploading ? '上传中...' : '本地上传'}</span>
                  </button>
                </div>
                {siteLogo && (
                  <div className="mt-3 p-1.5 border-2 border-border bg-background w-32 h-16 rounded-lg overflow-hidden flex items-center justify-center pop-shadow-sm">
                    <img src={siteLogo} alt="LOGO预览" className="max-w-full max-h-full object-contain rounded" />
                  </div>
                )}
              </div>
            </div>

            {/* 右半部分：联系方式（奶油黄拼色卡片） */}
            <div className="bg-[#FEF9E7] dark:bg-[#1E293B] border-2 border-border rounded-xl p-6 pop-shadow space-y-6">
              <h3 className="text-sm font-heading font-bold text-foreground border-b-2 border-border pb-3 flex items-center space-x-2 select-none">
                <Phone className="h-4 w-4 text-primary" />
                <span>联系与宣发渠道 / CONTACT DETAILS</span>
              </h3>

              {/* 手机号 */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                  联系电话 / CONTACT PHONE
                </label>
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
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                  电子邮箱 / CONTACT EMAIL
                </label>
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
              </div>

              {/* 二维码上传 */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-foreground uppercase tracking-wider block">
                  公众号/客服二维码 / QR CODE
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="请输入二维码图片链接或上传"
                    value={qrCodeImage}
                    onChange={(e) => setQrCodeImage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-background border-2 border-border focus:bg-accent/20 transition-all rounded-lg text-foreground outline-none text-xs font-semibold"
                  />
                  <input
                    type="file"
                    ref={qrInputRef}
                    onChange={handleQrUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => qrInputRef.current?.click()}
                    disabled={qrUploading}
                    className="px-4 py-3 border-2 border-border bg-background hover:bg-accent text-foreground font-heading font-bold flex items-center space-x-1.5 transition-all pop-shadow-sm pop-press rounded-lg cursor-pointer disabled:opacity-50 text-xs"
                  >
                    {qrUploading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{qrUploading ? '上传中...' : '本地上传'}</span>
                  </button>
                </div>
                {qrCodeImage && (
                  <div className="mt-3 p-1.5 border-2 border-border bg-background w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center pop-shadow-sm">
                    <img src={qrCodeImage} alt="二维码预览" className="max-w-full max-h-full object-contain rounded" />
                  </div>
                )}
              </div>
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

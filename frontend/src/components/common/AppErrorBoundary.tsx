import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-background px-4">
          <div className="p-10 bg-card max-w-md w-full text-center rounded-2xl elevation-4 animate-scale-in">
            <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-6 w-6 text-destructive" strokeWidth={1.75} />
            </div>
            <h1 className="text-xl font-heading text-foreground">
              页面渲染异常
            </h1>
            <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed max-w-xs mx-auto">
              页面遭遇意外错误导致渲染中断。请尝试重新加载页面，若问题持续请联系系统管理员。
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-destructive/5 border border-border rounded-xl text-left">
                <p className="text-[11px] font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-secondary text-foreground border border-border font-medium text-[13px] hover:bg-accent transition-colors cursor-pointer"
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 elevation-1 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>重新加载</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary

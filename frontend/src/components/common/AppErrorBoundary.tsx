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
        <div className="h-screen w-full flex flex-col justify-center items-center pop-brutal-bg px-4">
          <div className="p-10 bg-card border-2 border-border max-w-md w-full text-center rounded-xl pop-shadow-lg">
            <div className="w-16 h-16 bg-destructive/10 border-2 border-border rounded-lg flex items-center justify-center mx-auto mb-6 pop-shadow-sm">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              页面渲染异常
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono mt-2 tracking-wider">
              RENDER_EXCEPTION_DETECTED
            </p>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-xs mx-auto font-semibold">
              控制台模块遭遇意外错误导致渲染中断。请尝试重新加载页面，若问题持续请联系系统管理员。
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-destructive/5 border-2 border-border rounded-lg text-left">
                <p className="text-[10px] font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-lg bg-background text-foreground border-2 border-border font-heading font-bold text-xs tracking-wider pop-shadow-sm pop-press cursor-pointer"
              >
                重试 RETRY
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground border-2 border-border font-heading font-bold text-xs tracking-wider pop-shadow-sm pop-press cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
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

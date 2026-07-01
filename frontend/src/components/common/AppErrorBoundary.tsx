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
        <div className="h-screen w-full flex flex-col justify-center items-center bg-background px-4 bg-dot-grid">
          <div className="p-8 bg-card border border-border max-w-sm w-full text-center rounded-lg shadow-md animate-scale-in">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
            </div>
            <h1 className="text-[15px] font-semibold text-foreground font-sans uppercase">
              RENDER EXCEPTION
            </h1>
            <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed max-w-xs mx-auto">
              页面遭遇意外错误导致渲染中断。请尝试重新加载页面，若问题持续请联系管理员。
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-destructive/5 border border-destructive/10 rounded-lg text-left font-mono">
                <p className="text-[11px] text-destructive break-all leading-tight">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-3 rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors cursor-pointer text-[12px] font-medium h-9 active:scale-[0.98]"
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2 px-3 rounded-lg bg-primary text-primary-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-[12px] font-medium h-9 active:scale-[0.98]"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
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

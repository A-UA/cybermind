import { Play } from 'lucide-react'
import type { IOperationVideo } from '../types'

interface VideoPlayerModalProps {
  video: IOperationVideo | null
  onClose: () => void
}

export default function VideoPlayerModal({
  video,
  onClose
}: VideoPlayerModalProps) {
  if (!video) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-xs text-foreground font-sans">
      <div className="bg-card border-4 border-border rounded-xl pop-shadow-lg max-w-3xl w-full overflow-hidden flex flex-col justify-between">
        {/* 弹窗顶部栏 */}
        <div className="p-4 bg-accent border-b-4 border-border flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-foreground flex items-center space-x-1.5">
            <Play className="h-4 w-4 text-primary fill-current" />
            <span>视频在线预览: {video.title}</span>
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-background border-2 border-border hover:bg-accent text-foreground text-xs font-bold rounded-lg pop-shadow-sm cursor-pointer"
          >
            关闭
          </button>
        </div>

        {/* 视频播放窗口 */}
        <div className="p-6 bg-background flex justify-center items-center">
          <video
            src={video.video_url}
            controls
            autoPlay
            className="max-h-[50vh] w-full border-2 border-border rounded-lg pop-shadow-sm bg-black"
          />
        </div>

        {/* 弹窗底部说明 */}
        <div className="p-4 border-t-2 border-border text-center text-[10px] text-muted-foreground font-semibold">
          在线流媒体传输就绪 // VIDEOSTREAM LOADED
        </div>
      </div>
    </div>
  )
}

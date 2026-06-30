import AppModal from '@/components/common/AppModal'
import type { IOperationVideo } from '../types'

interface VideoPlayerModalProps {
  video: IOperationVideo | null
  onClose: () => void
}

export default function VideoPlayerModal({
  video,
  onClose
}: VideoPlayerModalProps) {
  return (
    <AppModal
      isOpen={!!video}
      onClose={onClose}
      title={video ? `视频预览: ${video.title}` : ''}
      size="xl"
    >
      {video && (
        <div className="p-6 bg-background flex flex-col items-center gap-4">
          <video
            src={video.video_url}
            controls
            autoPlay
            className="max-h-[50vh] w-full border border-border rounded-xl elevation-1 bg-black"
          />
          {video.description && (
            <p className="text-[13px] text-muted-foreground text-left w-full">
              {video.description}
            </p>
          )}
        </div>
      )}
    </AppModal>
  )
}

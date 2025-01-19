// app/ascii/components/VideoControls.tsx
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Props = {
    isPlaying: boolean;
    togglePlayback: () => void;
    videoTime: number;
    videoDuration: number;
    onSeek: (value: number) => void;
};

export const VideoControls: React.FC<Props> = ({ isPlaying, togglePlayback, videoTime, videoDuration, onSeek }) => {
    return (
        <div className="bg-zinc-900/50 backdrop-blur p-4 flex items-center gap-4 mt-6">
            <Button
                onClick={togglePlayback}
                variant="outline"
                size="sm"
                className="border-gray-800 hover:bg-gray-900"
            >
                {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <div className="flex-1">
                <Slider
                     value={[videoTime]}
                     onValueChange={(value) => onSeek(value[0])}
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    className="w-full"
                />
            </div>
            <div className="text-sm text-gray-400 w-24">
                {formatTime(videoTime)} / {formatTime(videoDuration)}
            </div>
        </div>
    );
};

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
// app/ascii/components/ImagePreview.tsx
import { ImageIcon } from "lucide-react";

type Props = {
    imageUrl: string;
};

export const ImagePreview: React.FC<Props> = ({ imageUrl }) => {
    return (
        <div>
            {imageUrl ? (
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Original Image</span>
                    </div>
                    <div className="bg-zinc-900/50 backdrop-blur p-4 flex items-center justify-center h-[250px]">
                        <img
                            src={imageUrl}
                            alt="Original"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            ) : (
                <div className="h-[250px] bg-zinc-900/50 backdrop-blur flex items-center justify-center text-gray-500">
                    Upload an image to begin
                </div>
            )}
        </div>
    );
};
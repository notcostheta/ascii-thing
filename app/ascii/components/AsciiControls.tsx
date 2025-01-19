// app/ascii/components/AsciiControls.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AsciiScale } from "@/lib/ascii-converter"

type Props = {
    scale: AsciiScale;
    setScale: (scale: AsciiScale) => void;
    dithering: 'none' | 'FloydSteinberg' | 'JJN' | 'Stucki' | 'Atkinson';
    setDithering: (dithering: 'none' | 'FloydSteinberg' | 'JJN' | 'Stucki' | 'Atkinson') => void;
    processImage: () => void;
};
export const AsciiControls: React.FC<Props> = ({ scale, setScale, dithering, setDithering, processImage }) => {
    return (
        <div className="bg-zinc-900/50 backdrop-blur p-4 space-y-4">
             {/* ASCII Scale selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-24">Scale</span>
                <Select value={scale} onValueChange={(value: AsciiScale) => {
                    setScale(value)
                    processImage()
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="normal2">Normal 2</SelectItem>
                        <SelectItem value="alphabetic">Alphabetic</SelectItem>
                        <SelectItem value="alphanumeric">Alphanumeric</SelectItem>
                        <SelectItem value="numerical">Numerical</SelectItem>
                        <SelectItem value="extended">Extended</SelectItem>
                        <SelectItem value="math">Math</SelectItem>
                        <SelectItem value="arrow">Arrow</SelectItem>
                        <SelectItem value="grayscale">Grayscale</SelectItem>
                        <SelectItem value="codepage437">CodePage 437</SelectItem>
                        <SelectItem value="blockelement">Block Element</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Dithering selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-24">Dither</span>
                <Select value={dithering} onValueChange={(value: 'none' | 'FloydSteinberg' | 'JJN' | 'Stucki' | 'Atkinson') => {
                    setDithering(value)
                    processImage()
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select dithering" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="none">None</SelectItem>
                        <SelectItem value="FloydSteinberg">Floyd-Steinberg</SelectItem>
                        <SelectItem value="JJN">Jarvis, Judice, and Ninke</SelectItem>
                        <SelectItem value="Stucki">Stucki</SelectItem>
                        <SelectItem value="Atkinson">Atkinson</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
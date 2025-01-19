// app/ascii/page.tsx
'use client'

import { useState, useRef, useEffect } from "react"
import { Layout } from "@/components/layout"
import { AsciiControls, ImagePreview, VideoControls } from "./components"
import { AsciiConverter, type AsciiScale } from "@/lib/ascii-converter"
import { VideoConverter } from '@/lib/video-converter'
import { Upload, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export default function AsciiArtGenerator() {
    const [asciiArt, setAsciiArt] = useState<string>("")
    const [imageUrl, setImageUrl] = useState<string>("")
    const [width, setWidth] = useState<number>(100)
    const [contrast, setContrast] = useState<number>(50)
    const [brightness, setBrightness] = useState<number>(50)
    const [invert, setInvert] = useState<number>(0)
    const [scale, setScale] = useState<AsciiScale>("normal")
    const [saturation, setSaturation] = useState(100)
    const [edgeDetection, setEdgeDetection] = useState(false)
    const [edgeIntensity, setEdgeIntensity] = useState(1)
    const [sharpen, setSharpen] = useState(false)
    const [sharpness, setSharpness] = useState(9)
    const [dithering, setDithering] = useState<'none' | 'FloydSteinberg' | 'JJN' | 'Stucki' | 'Atkinson'>('none')
    const [spaceDensity, setSpaceDensity] = useState(1)
    const [sepia, setSepia] = useState(0)
    const [hue, setHue] = useState(0)
    const [grayscale, setGrayscale] = useState(0)
    const [edgeInvertColors, setEdgeInvertColors] = useState(true)
    const [transparentFrame, setTransparentFrame] = useState(0)
    const [isVideo, setIsVideo] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoTime, setVideoTime] = useState(0)
    const [videoDuration, setVideoDuration] = useState(0)
    const converterRef = useRef<AsciiConverter | null>(null)
    const videoConverterRef = useRef<VideoConverter | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)


    useEffect(() => {
        converterRef.current = new AsciiConverter()
        videoConverterRef.current = new VideoConverter(converterRef.current)
    }, [])

    const processImage = async (url: string) => {
        if (!converterRef.current) return;
        
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = url

        img.onload = () => {
            if (!converterRef.current) return;
            const ascii = converterRef.current.processImage(img, {
                width,
                brightness,
                contrast,
                invert,
                scaleType: scale,
                saturation,
                sepia,
                hue,
                grayscale,
                edgeDetection,
                edgeIntensity,
                edgeInvertColors,
                sharpen,
                sharpness,
                dithering,
                spaceDensity,
                transparentFrame
            })
            setAsciiArt(ascii)
        }
    }

     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setImageUrl(url)

        if (file.type.startsWith('video/')) {
            setIsVideo(true)
            await videoConverterRef.current?.loadVideo(file)
            setVideoDuration(videoConverterRef.current?.getDuration() || 0)
        } else {
            setIsVideo(false)
            processImage(url)
        }
    }

    const handleDemoImage = () => {
        const demoUrl = "https://v0.dev/placeholder.svg?height=400&width=400"
        setImageUrl(demoUrl)
        processImage(demoUrl)
    }

    const handleDownload = () => {
        if (!asciiArt) return
        const blob = new Blob([asciiArt], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ascii-art.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

      const togglePlayback = () => {
        if (!videoConverterRef.current) return

        if (isPlaying) {
            videoConverterRef.current.stop()
            setIsPlaying(false)
        } else {
            videoConverterRef.current.start((ascii) => {
                setAsciiArt(ascii)
                setVideoTime(videoConverterRef.current?.getCurrentTime() || 0)
            }, {
                 width,
                brightness,
                contrast,
                invert,
                scaleType: scale,
                saturation,
                sepia,
                hue,
                grayscale,
                edgeDetection,
                edgeIntensity,
                edgeInvertColors,
                sharpen,
                sharpness,
                dithering,
                spaceDensity,
                transparentFrame
            })
            setIsPlaying(true)
        }
    }

    return (
        <Layout>
           {/* File Upload Section */}
            <div className="bg-zinc-900/50 backdrop-blur p-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="bg-black border-gray-800 text-sm file:bg-gray-900 file:text-white file:border-0"
                        />
                    </div>
                    <Button
                        onClick={handleDemoImage}
                        variant="outline"
                        className="border-gray-800 hover:bg-gray-900"
                    >
                        Try Demo
                    </Button>
                </div>
            </div>
           
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                     <ImagePreview imageUrl={imageUrl} />
                        <AsciiControls
                           scale={scale}
                            setScale={setScale}
                            dithering={dithering}
                            setDithering={setDithering}
                           processImage={() => { if (imageUrl) processImage(imageUrl) }}
                        />
                    </div>

                     <div className="grid grid-rows-2 gap-6">
                            <div className="bg-zinc-900/50 backdrop-blur p-4 space-y-4">
                                {/* Brightness slider */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 w-24">Bright: {brightness}</span>
                                    <Slider
                                        value={[brightness]}
                                        onValueChange={(value) => {
                                            setBrightness(value[0])
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        min={0}
                                        max={100}
                                        step={1}
                                        className="flex-1"
                                    />
                                </div>
                                {/* Contrast slider */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 w-24">Contrast: {contrast}</span>
                                    <Slider
                                        value={[contrast]}
                                        onValueChange={(value) => {
                                            setContrast(value[0])
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        min={0}
                                        max={100}
                                        step={1}
                                        className="flex-1"
                                    />
                                </div>
                                {/* Saturation slider */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 w-24">Sat: {saturation}</span>
                                    <Slider
                                        value={[saturation]}
                                        onValueChange={(value) => {
                                            setSaturation(value[0])
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        min={0}
                                        max={200}
                                        step={1}
                                        className="flex-1"
                                    />
                                </div>
                                {/* Add invert slider here */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 w-24">Invert: {invert}</span>
                                    <Slider
                                        value={[invert]}
                                        onValueChange={(value) => {
                                            setInvert(value[0])
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        min={0}
                                        max={100}
                                        step={1}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        
                           <div className="bg-zinc-900/50 backdrop-blur p-4 space-y-4">
                            {/* Space Density slider */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 w-24">Space: {spaceDensity}</span>
                                    <Slider
                                        value={[spaceDensity]}
                                        onValueChange={(value) => {
                                            setSpaceDensity(value[0])
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        min={0.1}
                                        max={5}
                                        step={0.1}
                                        className="flex-1"
                                    />
                                </div>

                            {/* Edge Detection controls */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={edgeDetection}
                                        onCheckedChange={(checked) => {
                                            setEdgeDetection(checked)
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        className="data-[state=checked]:bg-gray-50"
                                    />
                                    <span className="text-sm text-gray-400">Edge Detection</span>
                                </div>
                                {edgeDetection && (
                                    <div className="pl-8">
                                        <Slider
                                            value={[edgeIntensity]}
                                            onValueChange={(value) => {
                                                setEdgeIntensity(value[0])
                                                if (imageUrl) processImage(imageUrl)
                                            }}
                                            min={0.1}
                                            max={5}
                                            step={0.1}
                                            className="flex-1"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Sharpen controls */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={sharpen}
                                        onCheckedChange={(checked) => {
                                            setSharpen(checked)
                                            if (imageUrl) processImage(imageUrl)
                                        }}
                                        className="data-[state=checked]:bg-gray-50"
                                    />
                                    <span className="text-sm text-gray-400">Sharpen</span>
                                </div>
                                {sharpen && (
                                    <div className="pl-8">
                                        <Slider
                                            value={[sharpness]}
                                            onValueChange={(value) => {
                                                setSharpness(value[0])
                                                if (imageUrl) processImage(imageUrl)
                                            }}
                                            min={1}
                                            max={20}
                                            step={1}
                                            className="flex-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                </div>
            </div>
             {isVideo && (
                <VideoControls
                    isPlaying={isPlaying}
                    togglePlayback={togglePlayback}
                    videoTime={videoTime}
                    videoDuration={videoDuration}
                    onSeek={(value) => {
                         if (!videoConverterRef.current) return
                         videoConverterRef.current.seek(value)
                         setVideoTime(value)
                    }}
                />
             )}
               <div className="space-y-2 mt-12">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Upload className="w-4 h-4" />
                        <span>ASCII Output</span>
                    </div>
                    {/* Width slider with more space */}
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm text-gray-400">Width: {width}</span>
                        <Slider
                            value={[width]}
                            onValueChange={(value) => {
                                setWidth(value[0])
                                if (imageUrl) processImage(imageUrl)
                            }}
                            min={20}
                            max={200}
                            step={1}
                            className="flex-1"
                        />
                    </div>
                </div>
                <div className="bg-zinc-900/50 backdrop-blur p-4 overflow-auto max-h-[600px]">
                    <canvas ref={canvasRef} className="hidden" />
                    {asciiArt ? (
                        <pre className="text-xs leading-none whitespace-pre font-mono text-gray-300">
                            {asciiArt}
                        </pre>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-500">
                            Upload an image to see the ASCII output
                        </div>
                    )}
                </div>
                 {asciiArt && (
                    <div className="text-sm text-gray-500">
                        Output Size: {width} cols × {asciiArt.split('\n').length} rows
                    </div>
                )}
                 {asciiArt && (
                    <div className="flex justify-end">
                       <Button onClick={handleDownload} variant="outline" className="border-gray-800 hover:bg-gray-900">
                            Download ASCII
                         </Button>
                    </div>
                 )}
            </div>
        </Layout>
    );
}
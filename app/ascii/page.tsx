'use client'

import { useState, useRef } from "react"
import { Layout } from "@/components/layout"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ImageIcon, Upload, Download, Repeat } from 'lucide-react'

const ASCII_CHARS = " .:-=+*#%@"

export default function AsciiArtGenerator() {
    const [asciiArt, setAsciiArt] = useState<string>("")
    const [imageUrl, setImageUrl] = useState<string>("")
    const [width, setWidth] = useState<number>(100)
    const [contrast, setContrast] = useState<number>(50)
    const [brightness, setBrightness] = useState<number>(50)
    const [invert, setInvert] = useState(false)
    const [autoUpdate, setAutoUpdate] = useState(true)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const convertToAscii = (imageData: ImageData, width: number, height: number) => {
        const pixels = imageData.data
        let result = ""

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4
                const r = pixels[idx]
                const g = pixels[idx + 1]
                const b = pixels[idx + 2]

                // Convert to grayscale
                let gray = 0.299 * r + 0.587 * g + 0.114 * b

                // Apply brightness
                gray = gray * (brightness / 50.0)

                // Apply contrast
                gray = ((gray - 128.0) * (contrast / 50.0)) + 128.0

                // Apply invert
                if (invert) {
                    gray = 255 - gray
                }

                // Ensure values are within bounds
                gray = Math.max(0, Math.min(255, gray))

                // Convert to ASCII
                const charIndex = Math.floor((gray / 255) * (ASCII_CHARS.length - 1))
                result += ASCII_CHARS[charIndex]
            }
            result += "\n"
        }

        return result
    }

    const processImage = async (url: string) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = url

        img.onload = () => {
            const canvas = canvasRef.current
            if (!canvas) return

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const aspectRatio = img.height / img.width
            const calculatedHeight = Math.floor(width * aspectRatio)

            canvas.width = width
            canvas.height = calculatedHeight

            ctx.drawImage(img, 0, 0, width, calculatedHeight)
            const imageData = ctx.getImageData(0, 0, width, calculatedHeight)
            const ascii = convertToAscii(imageData, width, calculatedHeight)
            setAsciiArt(ascii)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImageUrl(url)
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

    return (
        <Layout>
            <div className="space-y-8">
                {/* Controls section */}
                <div className="bg-zinc-900/50 backdrop-blur p-6 space-y-6">
                    {/* File upload */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
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

                    {/* Sliders */}
                    <div className="space-y-4">
                        {/* Width slider */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 w-24">Width: {width}</span>
                            <Slider
                                value={[width]}
                                onValueChange={(value) => {
                                    setWidth(value[0])
                                    if (imageUrl && autoUpdate) processImage(imageUrl)
                                }}
                                min={20}
                                max={200}
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
                                    if (imageUrl && autoUpdate) processImage(imageUrl)
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                        </div>

                        {/* Brightness slider */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 w-24">Brightness: {brightness}</span>
                            <Slider
                                value={[brightness]}
                                onValueChange={(value) => {
                                    setBrightness(value[0])
                                    if (imageUrl && autoUpdate) processImage(imageUrl)
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Switches and buttons */}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={invert}
                                onCheckedChange={(checked) => {
                                    setInvert(checked)
                                    if (imageUrl && autoUpdate) processImage(imageUrl)
                                }}
                                className="data-[state=checked]:bg-gray-50"
                            />
                            <span className="text-sm text-gray-400">Invert Colors</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={autoUpdate}
                                onCheckedChange={setAutoUpdate}
                                className="data-[state=checked]:bg-gray-50"
                            />
                            <span className="text-sm text-gray-400">Auto Update</span>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                onClick={() => processImage(imageUrl)}
                                variant="outline"
                                size="sm"
                                className="border-gray-800 hover:bg-gray-900"
                            >
                                <Repeat className="w-4 h-4 mr-2" />
                                Update
                            </Button>
                            <Button
                                onClick={handleDownload}
                                variant="outline"
                                size="sm"
                                className="border-gray-800 hover:bg-gray-900"
                                disabled={!asciiArt}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Output section */}
                <div className="space-y-6">
                    {/* Original image */}
                    {imageUrl && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <ImageIcon className="w-4 h-4" />
                                <span>Original Image</span>
                            </div>
                            <div className="bg-zinc-900/50 backdrop-blur p-4 flex items-center justify-center">
                                <img
                                    src={imageUrl}
                                    alt="Original"
                                    className="max-w-full max-h-[400px] object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {/* ASCII output */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Upload className="w-4 h-4" />
                            <span>ASCII Output</span>
                        </div>
                        <div className="bg-zinc-900/50 backdrop-blur p-4 overflow-auto max-h-[400px]">
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
                    </div>
                </div>

                {/* Size info */}
                {asciiArt && (
                    <div className="text-sm text-gray-500">
                        Output Size: {width} cols × {asciiArt.split('\n').length} rows
                    </div>
                )}
            </div>
        </Layout>
    )
}

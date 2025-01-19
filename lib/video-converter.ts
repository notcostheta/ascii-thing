// lib/video-converter.ts

import { AsciiConverter, type AsciiOptions } from './ascii-converter';

export class VideoConverter {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private video: HTMLVideoElement;
    private isPlaying: boolean = false;
    private frameRate: number = 24;
    private asciiConverter: AsciiConverter;
    private currentOptions: AsciiOptions | null = null;
    private videoUrl?: string;

    constructor(asciiConverter: AsciiConverter) {
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        this.asciiConverter = asciiConverter;
    }

    loadVideo(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if file is a supported video format
            const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            if (!supportedTypes.includes(file.type)) {
                reject(new Error('Unsupported video format. Please upload an MP4, WebM, or Ogg video.'));
                return;
            }

            // Revoke any old URL and reset the video element
            if (this.videoUrl) {
                URL.revokeObjectURL(this.videoUrl);
                this.video.src = "";
                this.video.load();
            }

            const url = URL.createObjectURL(file);
            this.videoUrl = url;
            this.video.src = url;
            this.video.crossOrigin = 'anonymous';
            this.video.load();
            
            const handleVideoLoad = () => {
                // Calculate optimal canvas size while maintaining aspect ratio
                const maxWidth = 200;
                const maxHeight = 150;
                const aspectRatio = this.video.videoHeight / this.video.videoWidth;
                
                if (aspectRatio > maxHeight/maxWidth) {
                    this.canvas.height = maxHeight;
                    this.canvas.width = Math.floor(maxHeight / aspectRatio);
                } else {
                    this.canvas.width = maxWidth;
                    this.canvas.height = Math.floor(maxWidth * aspectRatio);
                }
                
                // Ensure video is ready for frame extraction
                this.video.currentTime = 0;
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                resolve();
            };

            this.video.onloadeddata = handleVideoLoad;
            this.video.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load video. Please check the file format.'));
            };
        });
    }

    getVideoUrl(): string | undefined {
        return this.videoUrl;
    }

    start(onFrame: (ascii: string) => void, options: AsciiOptions) {
        this.isPlaying = true;
        this.currentOptions = options;
        this.video.play();

        const renderFrame = () => {
            if (!this.isPlaying) return;

            // Clear and draw video frame
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            // Process frame
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            if (this.currentOptions) {
                const ascii = this.asciiConverter.convertToAscii(imageData, {
                    ...this.currentOptions,
                    width: Math.floor(this.currentOptions.width),
                    brightness: this.currentOptions.brightness ?? 50,
                    contrast: this.currentOptions.contrast ?? 50,
                    invert: this.currentOptions.invert ?? 0,
                    thresholdOffset: this.currentOptions.thresholdOffset ?? 128,
                    spaceDensity: this.currentOptions.spaceDensity ?? 1
                });

                onFrame(ascii);
            }

            requestAnimationFrame(renderFrame);
        };

        renderFrame();
    }

    stop() {
        this.isPlaying = false;
        this.video.pause();
    }

    getCurrentTime(): number {
        return this.video.currentTime;
    }

    getDuration(): number {
        return this.video.duration;
    }

    seek(time: number) {
        this.video.currentTime = time;
    }

    setFrameRate(fps: number) {
        this.frameRate = fps;
    }

    setLoop(enabled: boolean) {
        this.video.loop = enabled;
    }

    async extractFrames(options: AsciiOptions, progressCallback?: (progress: number) => void): Promise<Array<{ time: number, ascii: string }>> {
        const frames = [];
        this.video.currentTime = 0;
        
        while (this.video.currentTime < this.video.duration) {
            // Wait for frame to be ready
            await new Promise(resolve => {
                this.video.onseeked = resolve;
                if (this.video.currentTime >= this.video.duration) {
                    resolve(undefined);
                }
            });

            // Render and store frame
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const ascii = this.asciiConverter.convertToAscii(imageData, options);
            frames.push({
                time: this.video.currentTime,
                ascii
            });

            // Update progress
            if (progressCallback) {
                const progress = (this.video.currentTime / this.video.duration) * 100;
                progressCallback(progress);
            }

            // Move to next frame
            this.video.currentTime += 1 / this.frameRate;
        }

        return frames;
    }
}

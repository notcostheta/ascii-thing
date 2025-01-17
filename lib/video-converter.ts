import { AsciiConverter, type AsciiOptions } from './ascii-converter';

export class VideoConverter {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private video: HTMLVideoElement;
    private isPlaying: boolean = false;
    private frameRate: number = 24;
    private asciiConverter: AsciiConverter;
    private currentOptions: AsciiOptions | null = null;

    constructor(asciiConverter: AsciiConverter) {
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        this.asciiConverter = asciiConverter;
    }

    loadVideo(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            this.video.src = url;
            this.video.onloadedmetadata = () => {
                // Set canvas size based on video dimensions
                const aspectRatio = this.video.videoHeight / this.video.videoWidth;
                this.canvas.width = 200; // Max width
                this.canvas.height = Math.floor(this.canvas.width * aspectRatio);
                resolve();
            };
            this.video.onerror = reject;
        });
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

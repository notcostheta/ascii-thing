const ASCII_SCALES = {
    minimalist: "#+-.",
    normal: "@%#*+=-:.",
    normal2: "&$Xx+;:.",
    alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz",
    numerical: "0896452317",
    extended: "@%#{}[]()<>^*+=~-:.",
    math: "+-×÷=≠≈∞√π",
    arrow: "↑↗→↘↓↙←↖",
    grayscale: "@$BWM#*oahkbdpwmZO0QCJYXzcvnxrjft/|()1{}[]-_+~<>i!lI;:,\"^`'.",
    codepage437: "█▓▒░",
    blockelement: "█"
} as const;

export type AsciiScale = keyof typeof ASCII_SCALES;

export interface AsciiOptions {
    width: number;
    brightness: number;
    contrast: number;
    invert: number;  // Changed from boolean to number (0-100)
    scaleType: AsciiScale;
    saturation: number;
    sepia?: number;
    hue?: number;
    grayscale?: number;
    edgeDetection?: boolean;
    edgeIntensity?: number;
    edgeInvertColors?: boolean;
    sharpen?: boolean;
    sharpness?: number;
    dithering?: 'none' | 'FloydSteinberg' | 'JJN' | 'Stucki' | 'Atkinson';
    spaceDensity?: number;
    thresholdType?: 'none' | 'simply';
    thresholdOffset?: number;
    transparentFrame?: number;
}

export class AsciiConverter {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private outputDiv: HTMLDivElement | null = null;

    private ensureCanvas() {
        if (typeof window === 'undefined') return;
        
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        }
    }

    private applyEdgeDetection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number, invertColors?: boolean) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;
        const output = new Uint8ClampedArray(data.length);
        const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sumX = 0;
                let sumY = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        if (idx >= 0 && idx < data.length) {
                            const gray = 0.3 * data[idx] + 0.59 * data[idx + 1] + 0.11 * data[idx + 2];
                            sumX += gray * kernelX[(ky + 1) * 3 + (kx + 1)];
                            sumY += gray * kernelY[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                }

                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY) * intensity;
                const idx = (y * width + x) * 4;
                output[idx] = output[idx + 1] = output[idx + 2] = invertColors ? 255 - magnitude : magnitude;
                output[idx + 3] = 255;
            }
        }

        ctx.putImageData(new ImageData(output, width, height), 0, 0);
    }

    private applySharpen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, amount: number) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;
        const output = new Uint8ClampedArray(data.length);
        const kernel = [-1, -1, -1, -1, amount + 5, -1, -1, -1, -1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    const idx = (y * width + x) * 4 + c;
                    output[idx] = Math.max(0, Math.min(255, sum));
                }
                output[(y * width + x) * 4 + 3] = 255;
            }
        }

        ctx.putImageData(new ImageData(output, width, height), 0, 0);
    }

    private applyDithering(data: Uint8ClampedArray, width: number, type: string) {
        const height = data.length / (width * 4);
        const patterns = {
            FloydSteinberg: [
                { dx: 1, dy: 0, weight: 7/16 },
                { dx: -1, dy: 1, weight: 3/16 },
                { dx: 0, dy: 1, weight: 5/16 },
                { dx: 1, dy: 1, weight: 1/16 }
            ],
            JJN: [
                { dx: 1, dy: 0, weight: 7/48 },
                { dx: 2, dy: 0, weight: 5/48 },
                { dx: -2, dy: 1, weight: 3/48 },
                { dx: -1, dy: 1, weight: 5/48 },
                { dx: 0, dy: 1, weight: 7/48 },
                { dx: 1, dy: 1, weight: 5/48 },
                { dx: 2, dy: 1, weight: 3/48 },
                { dx: -2, dy: 2, weight: 1/48 },
                { dx: -1, dy: 2, weight: 3/48 },
                { dx: 0, dy: 2, weight: 5/48 },
                { dx: 1, dy: 2, weight: 3/48 },
                { dx: 2, dy: 2, weight: 1/48 }
            ],
            Stucki: [
                { dx: 1, dy: 0, weight: 8/42 },
                { dx: 2, dy: 0, weight: 4/42 },
                { dx: -2, dy: 1, weight: 2/42 },
                { dx: -1, dy: 1, weight: 4/42 },
                { dx: 0, dy: 1, weight: 8/42 },
                { dx: 1, dy: 1, weight: 4/42 },
                { dx: 2, dy: 1, weight: 2/42 },
                { dx: -2, dy: 2, weight: 1/42 },
                { dx: -1, dy: 2, weight: 2/42 },
                { dx: 0, dy: 2, weight: 4/42 },
                { dx: 1, dy: 2, weight: 2/42 },
                { dx: 2, dy: 2, weight: 1/42 }
            ],
            Atkinson: [
                { dx: 1, dy: 0, weight: 1/8 },
                { dx: 2, dy: 0, weight: 1/8 },
                { dx: -1, dy: 1, weight: 1/8 },
                { dx: 0, dy: 1, weight: 1/8 },
                { dx: 1, dy: 1, weight: 1/8 },
                { dx: 0, dy: 2, weight: 1/8 }
            ]
        };

        const pattern = patterns[type as keyof typeof patterns];
        if (!pattern) return;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const oldPixel = data[idx];
                const newPixel = oldPixel < 128 ? 0 : 255;
                const error = oldPixel - newPixel;

                data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

                for (const { dx, dy, weight } of pattern) {
                    const newX = x + dx;
                    const newY = y + dy;
                    if (newX >= 0 && newX < width && newY < height) {
                        const targetIdx = (newY * width + newX) * 4;
                        const errorComponent = error * weight;
                        data[targetIdx] = Math.max(0, Math.min(255, data[targetIdx] + errorComponent));
                        data[targetIdx + 1] = Math.max(0, Math.min(255, data[targetIdx + 1] + errorComponent));
                        data[targetIdx + 2] = Math.max(0, Math.min(255, data[targetIdx + 2] + errorComponent));
                    }
                }
            }
        }
    }

    private applySimpleThresholding(data: Uint8ClampedArray, width: number, height: number, threshold: number) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            const value = gray < threshold ? 0 : 255;
            data[i] = data[i + 1] = data[i + 2] = value;
        }
    }

    convertToAscii(
        imageData: ImageData,
        options: AsciiOptions
    ): string {
        const { width, height, data } = imageData;
        const chars = ASCII_SCALES[options.scaleType] + " ".repeat(options.spaceDensity || 0);
        let result = "";

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                // Skip transparent pixels
                if (a < 16) {
                    result += " ";
                    continue;
                }

                // Convert to grayscale
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                // Apply brightness
                gray = gray * (options.brightness / 50.0);

                // Apply contrast
                gray = ((gray - 128.0) * (options.contrast / 50.0)) + 128.0;

                // Apply invert
                gray = gray * (1 - options.invert / 100);

                // Apply threshold if enabled
                if (options.thresholdType === 'simply') {
                    gray = gray < (options.thresholdOffset || 128) ? 0 : 255;
                }

                // Ensure values are within bounds
                gray = Math.max(0, Math.min(255, gray));

                // Convert to ASCII
                const charIndex = Math.floor((gray / 255) * (chars.length - 1));
                result += chars[charIndex];
            }
            result += "\n";
        }

        return result;
    }

    processImage(
        img: HTMLImageElement,
        options: AsciiOptions
    ): string {
        this.ensureCanvas();
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not available');
        }

        const aspectRatio = img.height / img.width;
        const height = Math.floor(options.width * aspectRatio * 0.55); // Legacy aspect ratio adjustment

        // Set canvas dimensions
        this.canvas.width = options.width + 2 * (options.transparentFrame || 0);
        this.canvas.height = height + 2 * (options.transparentFrame || 0);

        // Apply filters
        this.ctx.filter = [
            `brightness(${options.brightness}%)`,
            `contrast(${options.contrast}%)`,
            `saturate(${options.saturation}%)`,
            options.sepia && `sepia(${options.sepia}%)`,
            options.hue && `hue-rotate(${options.hue}deg)`,
            options.grayscale && `grayscale(${options.grayscale}%)`,
            `invert(${options.invert}%)`
        ].filter(Boolean).join(' ');

        // Handle transparent frame
        if (options.transparentFrame) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw image
        const frameOffset = options.transparentFrame || 0;
        this.ctx.drawImage(
            img, 
            frameOffset, 
            frameOffset, 
            options.width - 2 * frameOffset, 
            height - 2 * frameOffset
        );

        // Apply edge detection
        if (options.edgeDetection) {
            this.applyEdgeDetection(
                this.ctx, 
                this.canvas, 
                options.edgeIntensity || 1,
                options.edgeInvertColors
            );
        }

        // Apply sharpening
        if (options.sharpen) {
            this.applySharpen(this.ctx, this.canvas, options.sharpness || 9);
        }

        // Get image data for processing
        const imageData = this.ctx.getImageData(0, 0, options.width, height);

        // Apply thresholding if enabled
        if (options.thresholdType === 'simply') {
            this.applySimpleThresholding(
                imageData.data,
                options.width,
                height,
                options.thresholdOffset || 128
            );
        }

        // Apply dithering if enabled
        if (options.dithering && options.dithering !== 'none') {
            this.applyDithering(imageData.data, options.width, options.dithering);
        }

        // Convert to ASCII
        return this.convertToAscii(imageData, {
            ...options,
            spaceDensity: options.spaceDensity || 1
        });
    }
}

"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

export function Slider({
  className,
  min,
  max,
  step,
  value,
  onValueChange,
  ...props
}: {
  className?: string
  min: number
  max: number
  step?: number
  value: number[]
  onValueChange: (value: number[]) => void
}) {
  return (
    <SliderPrimitive.Root
      className={`relative flex w-full touch-none select-none items-center ${className}`}
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-gray-800">
        <SliderPrimitive.Range className="absolute h-full bg-white" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-gray-800 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
}

import * as React from "react"

export function Button({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}: {
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm"
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
  const variants = {
    default: "bg-white text-black hover:bg-gray-100",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3"
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

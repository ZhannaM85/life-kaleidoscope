import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-sm font-medium transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-border bg-transparent hover:bg-muted',
        ghost: 'hover:bg-muted',
        destructive: 'bg-destructive text-primary-foreground hover:bg-destructive/90',
      },
      size: {
        // default height is 44px — minimum comfortable tap target
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants, type ButtonProps }

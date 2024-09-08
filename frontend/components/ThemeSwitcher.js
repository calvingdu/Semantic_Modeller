'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('light')}
        title="Light Mode"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('dark')}
        title="Dark Mode"
      >
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setTheme('system')}
        title="System Theme"
      >
        <Monitor className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </div>
  )
}

export default ThemeSwitcher
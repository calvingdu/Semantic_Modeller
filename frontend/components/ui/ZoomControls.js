import React, { useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ZoomIn, ZoomOut } from "lucide-react"

export default function ZoomControls({ scale, setScale }) {
  const [zoomInput, setZoomInput] = useState(Math.round(scale * 100).toString())

  const handleZoomChange = useCallback((newZoom) => {
    const zoomValue = Math.max(25, Math.min(400, newZoom)) // Clamp between 25% and 400%
    setScale(zoomValue / 100)
    setZoomInput(zoomValue.toString())
  }, [setScale])

  const handleZoomInputChange = useCallback((e) => {
    setZoomInput(e.target.value)
  }, [])

  const applyZoom = useCallback(() => {
    if (zoomInput && !isNaN(zoomInput)) {
      handleZoomChange(parseInt(zoomInput))
    }
  }, [zoomInput, handleZoomChange])

  const handleZoomKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      applyZoom()
    }
  }, [applyZoom])

  const zoomIn = useCallback(() => {
    handleZoomChange(Math.round(scale * 100) + 10)
  }, [scale, handleZoomChange])

  const zoomOut = useCallback(() => {
    handleZoomChange(Math.round(scale * 100) - 10)
  }, [scale, handleZoomChange])

  return (
    <div className="flex justify-center items-center mt-2">
      <Button onClick={zoomOut} size="sm" variant="outline" className="mr-2">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Input 
        type="text"
        value={zoomInput}
        onChange={handleZoomInputChange}
        onBlur={applyZoom}
        onKeyPress={handleZoomKeyPress}
        className="w-20 mx-2 text-center"
      />
      <span className="mr-2">%</span>
      <Button onClick={zoomIn} size="sm" variant="outline" className="ml-2">
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  )
}
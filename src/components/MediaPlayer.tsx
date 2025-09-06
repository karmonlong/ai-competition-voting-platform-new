import React, { useState, useEffect } from 'react'
import { Play, Download, ExternalLink, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface MediaPlayerProps {
  fileUrl: string
  fileType: 'image' | 'video' | 'audio' | 'document' | 'web'
  title: string
  className?: string
}

export default function MediaPlayer({ fileUrl, fileType, title, className = '' }: MediaPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)


  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleDownload = () => {
    try {
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = fileUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // Try to suggest filename from URL or title
      const filename = title || fileUrl.split('/').pop() || 'document'
      link.download = filename
      
      // Temporarily add to DOM and click
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('📥 下载触发:', title)
    } catch (error) {
      console.error('下载失败:', error)
      // Fallback: open in new tab
      window.open(fileUrl, '_blank')
    }
  }

  const handleOpenDocument = () => {
    try {
      window.open(fileUrl, '_blank')
      console.log('🔗 在新窗口打开:', title)
    } catch (error) {
      console.error('打开文档失败:', error)
      alert('无法打开文档，请尝试下载')
    }
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  switch (fileType) {
    case 'image':
      return (
        <Card className={`bg-gray-800 border-gray-700 ${className}`}>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg z-10">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
            <img
              src={fileUrl}
              alt={title}
              className="w-full h-auto max-h-96 object-contain rounded-lg"
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
            {hasError && (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <p className="text-gray-400 text-center mb-4">图片加载失败</p>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载图片
                </Button>
              </div>
            )}
            {!isLoading && !hasError && (
              <div className="absolute top-2 right-2">
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70 text-white border-none"
                  title="下载图片"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )

    case 'video':
      return (
        <Card className={`bg-gray-800 border-gray-700 ${className}`}>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg z-10">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
            <video
              src={fileUrl}
              className="w-full h-auto max-h-96 rounded-lg"
              controls
              onLoadedData={handleLoad}
              onError={handleError}
              style={{ display: isLoading ? 'none' : 'block' }}
            >
              您的浏览器不支持视频播放
            </video>
            {hasError && (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <p className="text-gray-400 text-center mb-4">视频加载失败</p>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载视频
                </Button>
              </div>
            )}
            {!isLoading && !hasError && (
              <div className="absolute top-2 right-2">
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70 text-white border-none"
                  title="下载视频"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )

    case 'audio':
      return (
        <Card className={`bg-gray-800 border-gray-700 ${className}`}>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{title}</h3>
                <p className="text-gray-400 text-sm">音频文件</p>
              </div>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-4">
              <audio
                src={fileUrl}
                className="w-full"
                controls
                onLoadedData={handleLoad}
                onError={handleError}
              >
                您的浏览器不支持音频播放
              </audio>
              {hasError && (
                <div className="mt-4 text-center">
                  <p className="text-red-400 text-sm mb-2">音频加载失败</p>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载音频
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )

    case 'document':
      return (
        <Card className="bg-gray-800 border-gray-700">
          {/* Try to embed PDF if it's a PDF file */}
          {fileUrl.toLowerCase().includes('.pdf') || title.toLowerCase().includes('pdf') ? (
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg z-10">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              )}
              {/* Use iframe for PDF display */}
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-96 rounded-lg"
                title={title}
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: isLoading ? 'none' : 'block' }}
              />
              {hasError && (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-400 text-center mb-4">PDF预览不可用</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleOpenDocument}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      在新窗口打开
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载PDF
                    </Button>
                  </div>
                </div>
              )}
              {/* Add download button overlay for successful PDF display */}
              {!isLoading && !hasError && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    onClick={handleOpenDocument}
                    size="sm"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white border-none"
                    title="在新窗口打开"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white border-none"
                    title="下载PDF"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // For non-PDF documents, show traditional interface
            <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-lg">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-white font-medium mb-2">{title}</h3>
              <p className="text-gray-400 text-center mb-4">
                {fileUrl.toLowerCase().includes('.doc') ? 'Word文档' :
                 fileUrl.toLowerCase().includes('.txt') ? '文本文档' : '文档文件'}
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={handleOpenDocument}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  在新窗口打开
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载文档
                </Button>
              </div>
            </div>
          )}
        </Card>
      )

    case 'web':
      return (
        <Card className="bg-gray-800 border-gray-700">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg z-10">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
            <iframe
              src={fileUrl}
              className="w-full h-96 rounded-lg"
              title={title}
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
            {hasError && (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-lg">
                <ExternalLink className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-400 text-center mb-4">网页预览不可用</p>
                <Button
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  在新窗口打开
                </Button>
              </div>
            )}
          </div>
        </Card>
      )

    default:
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-400 text-center mb-4">不支持的文件类型</p>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            下载文件
          </Button>
        </div>
      )
  }
}
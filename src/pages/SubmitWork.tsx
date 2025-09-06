import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Video, Music, Globe, AlertCircle, CheckCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatabaseService, StorageService, Work } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
}

export default function SubmitWork() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [detailedDescription, setDetailedDescription] = useState('')
  const [category, setCategory] = useState('')
  const [fileType, setFileType] = useState<'image' | 'video' | 'audio' | 'document' | 'web'>('image')
  const [file, setFile] = useState<File | null>(null)
  const [webUrl, setWebUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')

  const categories = [
    { id: 'AI艺术', name: 'AI艺术' },
    { id: '机器学习', name: '机器学习' },
    { id: '计算机视觉', name: '计算机视觉' },
    { id: '自然语言处理', name: '自然语言处理' },
    { id: '机器人技术', name: '机器人技术' },
    { id: '其他', name: '其他' }
  ]

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('mockUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      console.log('👤 当前用户:', userData)
    } else {
      // Redirect to home if not logged in
      navigate('/')
    }
  }, [navigate])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStorageError('')
      setFileUrl('') // 重置文件URL
      
      try {
        console.log('📁 文件已选择:', selectedFile.name, '大小:', (selectedFile.size / 1024 / 1024).toFixed(2) + 'MB')
        
        // Check file size (increased limit for Storage)
        const maxSize = 50 * 1024 * 1024 // 50MB limit for Storage
        if (selectedFile.size > maxSize) {
          setStorageError('文件大小超过50MB限制，请选择较小的文件')
          return
        }
        
        // Upload to Supabase Storage
        setIsUploading(true)
        console.log('📤 开始上传文件到Supabase Storage...')
        const uploadResult = await StorageService.uploadFile(selectedFile)
        
        if (uploadResult) {
          setFileUrl(uploadResult.url)
          console.log('✅ 文件上传成功，URL:', uploadResult.url)
        } else {
          throw new Error('文件上传失败')
        }
        
      } catch (error) {
        console.error('Error uploading file:', error)
        setStorageError('文件上传失败，请重试')
        setFileUrl('') // 上传失败时清空URL
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('用户信息缺失，请重新登录')
      navigate('/')
      return
    }

    console.log('🚀 开始提交作品（数据库模式），用户ID:', user.id)

    if (!title.trim() || !description.trim() || !category) {
      alert('请填写所有必填字段')
      return
    }

    if (fileType === 'web' && !webUrl.trim()) {
      alert('请输入网页链接')
      return
    }

    if (fileType !== 'web' && !fileUrl) {
      alert('请先选择并等待文件上传完成')
      return
    }
    
    if (isUploading) {
      alert('文件正在上传中，请稍候再提交')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare work data
      const workData: Omit<Work, 'vote_count' | 'created_at' | 'updated_at'> = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        detailed_description: detailedDescription.trim() || undefined,
        author_id: user.id,
        category,
        file_url: fileType === 'web' ? webUrl : fileUrl,
        file_type: fileType
      }

      console.log('📝 提交数据:', {
        ...workData,
        file_url: workData.file_url.length > 100 ? 
          `${workData.file_url.substring(0, 100)}...` : workData.file_url
      })

      console.log('💾 提交作品到数据库')
      const createdWork = await DatabaseService.createWork(workData)

      if (createdWork) {
        console.log('✅ 作品提交成功:', createdWork.id)
        
        // Show success message
        setShowSuccess(true)
        
        // Navigate back to home after a short delay
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/')
        }, 2000)
      } else {
        throw new Error('作品创建失败')
      }
      
    } catch (error) {
      console.error('Error submitting work:', error)
      const errorMessage = error instanceof Error ? error.message : '提交失败，请重试'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'audio':
        return <Music className="w-5 h-5" />
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'web':
        return <Globe className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">请先登录</div>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-4">作品提交成功！</div>
          <p className="text-gray-400 mb-6">
            已保存到数据库，正在跳转到首页...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              提交作品
            </h1>
            {/* 永久显示数据库模式 */}
            <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
              <Database className="h-3 w-3" />
              🗄️ 数据库模式
            </div>
            {/* User info */}
            {user && (
              <div className="text-xs text-gray-400">
                用户: {user.username} (ID: {user.id.slice(0, 8)}...)
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">提交您的AI作品</CardTitle>
              <p className="text-gray-400">分享您的创新成果，让更多人看到您的才华</p>
            </CardHeader>
            <CardContent>
              {storageError && (
                <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-400">
                    {storageError}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    作品标题 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="为您的作品起一个吸引人的标题"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    作品描述 <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简要描述您的作品特点和功能"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                    rows={3}
                    required
                  />
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <Label htmlFor="detailedDescription" className="text-white">
                    详细介绍 <span className="text-gray-400">(可选)</span>
                  </Label>
                  <Textarea
                    id="detailedDescription"
                    value={detailedDescription}
                    onChange={(e) => setDetailedDescription(e.target.value)}
                    placeholder="详细介绍您的作品技术特点、应用场景等"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                    rows={5}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-white">
                    作品分类 <span className="text-red-400">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="选择作品分类" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-gray-700">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Type */}
                <div className="space-y-3">
                  <Label className="text-white">
                    文件类型 <span className="text-red-400">*</span>
                  </Label>
                  <RadioGroup value={fileType} onValueChange={(value: 'image' | 'video' | 'audio' | 'document' | 'web') => setFileType(value)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image" className="border-gray-600 text-blue-400" />
                        <Label htmlFor="image" className="text-white flex items-center space-x-2 cursor-pointer">
                          <ImageIcon className="w-4 h-4" />
                          <span>图片</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" className="border-gray-600 text-blue-400" />
                        <Label htmlFor="video" className="text-white flex items-center space-x-2 cursor-pointer">
                          <Video className="w-4 h-4" />
                          <span>视频</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audio" id="audio" className="border-gray-600 text-blue-400" />
                        <Label htmlFor="audio" className="text-white flex items-center space-x-2 cursor-pointer">
                          <Music className="w-4 h-4" />
                          <span>音频</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="document" id="document" className="border-gray-600 text-blue-400" />
                        <Label htmlFor="document" className="text-white flex items-center space-x-2 cursor-pointer">
                          <FileText className="w-4 h-4" />
                          <span>文档</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 col-span-2">
                        <RadioGroupItem value="web" id="web" className="border-gray-600 text-blue-400" />
                        <Label htmlFor="web" className="text-white flex items-center space-x-2 cursor-pointer">
                          <Globe className="w-4 h-4" />
                          <span>网页链接</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* File Upload or URL Input */}
                {fileType === 'web' ? (
                  <div className="space-y-2">
                    <Label htmlFor="webUrl" className="text-white">
                      网页链接 <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="webUrl"
                      type="url"
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-white">
                      上传文件 <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {getFileTypeIcon(fileType)}
                          <p className="mb-2 text-sm text-gray-300">
                            <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                          </p>
                          <p className="text-xs text-gray-400">
                            支持 {fileType === 'image' ? 'PNG, JPG, GIF' : 
                                 fileType === 'video' ? 'MP4, AVI, MOV' :
                                 fileType === 'audio' ? 'MP3, WAV, OGG' : 
                                 'PDF, DOC, TXT'} (最大10MB)
                          </p>
                        </div>
                        <input
                          id="file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept={
                            fileType === 'image' ? 'image/*' :
                            fileType === 'video' ? 'video/*' :
                            fileType === 'audio' ? 'audio/*' :
                            '.pdf,.doc,.docx,.txt'
                          }
                          required
                        />
                      </label>
                    </div>
                    {file && (
                      <div className="text-sm text-gray-400">
                        已选择: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        {isUploading && (
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span className="text-blue-400">上传中...</span>
                          </div>
                        )}
                        {!isUploading && fileUrl && (
                          <div className="flex items-center mt-1">
                            <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                            <span className="text-green-400">上传完成</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Storage Error Alert */}
                    {storageError && (
                      <Alert className="bg-red-900/20 border-red-500">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-400">
                          {storageError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      提交作品
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
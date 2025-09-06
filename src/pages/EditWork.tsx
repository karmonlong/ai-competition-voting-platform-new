import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Video, Music, Globe, AlertCircle, CheckCircle, Save } from 'lucide-react'
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

export default function EditWork() {
  const navigate = useNavigate()
  const { id: workId } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [work, setWork] = useState<Work | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUsingDatabase, setIsUsingDatabase] = useState(true)
  const [storageError, setStorageError] = useState('')
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [detailedDescription, setDetailedDescription] = useState('')
  const [category, setCategory] = useState('')
  const [fileType, setFileType] = useState<'image' | 'video' | 'audio' | 'document' | 'web'>('image')
  const [file, setFile] = useState<File | null>(null)
  const [webUrl, setWebUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [originalFileUrl, setOriginalFileUrl] = useState('')

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
      return
    }

    if (!workId) {
      navigate('/my-works')
      return
    }

    loadWork()
  }, [navigate, workId])

  const loadWork = async () => {
    if (!workId) return
    
    setIsLoading(true)
    try {
      // Test database connection
      const isConnected = await DatabaseService.testConnection()
      setIsUsingDatabase(isConnected)
      console.log(`🗄️ 数据库连接状态: ${isConnected ? '已连接' : '未连接'}`)
      
      let loadedWork: Work | null = null
      
      if (isConnected) {
        console.log('✅ 从Supabase数据库加载作品')
        loadedWork = await DatabaseService.getWorkById(workId)
      } else {
        console.log('❌ 数据库连接失败，无法加载作品')
        alert('数据库连接失败，请稍后重试')
        navigate('/my-works')
        return
      }
      
      if (loadedWork) {
        // Check if user owns this work
        const savedUser = localStorage.getItem('mockUser')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          if (loadedWork.author_id !== userData.id) {
            alert('您只能编辑自己的作品')
            navigate('/my-works')
            return
          }
        }
        
        setWork(loadedWork)
        // Pre-fill form data
        setTitle(loadedWork.title)
        setDescription(loadedWork.description)
        setDetailedDescription(loadedWork.detailed_description || '')
        setCategory(loadedWork.category)
        setFileType(loadedWork.file_type)
        setOriginalFileUrl(loadedWork.file_url)
        
        if (loadedWork.file_type === 'web') {
          setWebUrl(loadedWork.file_url)
        } else {
          setFileUrl(loadedWork.file_url)
        }
        
        console.log('✅ 作品加载成功:', loadedWork.title)
      } else {
        alert('作品未找到')
        navigate('/my-works')
      }
    } catch (error) {
      console.error('Error loading work:', error)
      alert('加载作品失败')
      navigate('/my-works')
    } finally {
      setIsLoading(false)
    }
  }



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStorageError('')
      
      try {
        console.log('📁 文件已选择:', selectedFile.name, '大小:', (selectedFile.size / 1024 / 1024).toFixed(2) + 'MB')
        
        // Check file size
        const maxSize = 50 * 1024 * 1024 // 50MB limit for Supabase Storage
        if (selectedFile.size > maxSize) {
          setStorageError('文件大小超过50MB限制，请选择较小的文件')
          return
        }
        
        // Upload to Supabase Storage
        console.log('📤 开始上传文件到Supabase Storage...')
        const uploadResult = await StorageService.uploadFile(selectedFile, `works/${user?.id}/${Date.now()}_${selectedFile.name}`)
        
        if (uploadResult && uploadResult.url) {
          setFileUrl(uploadResult.url)
          console.log('✅ 文件上传成功，URL:', uploadResult.url)
        } else {
          throw new Error('文件上传失败')
        }
        
      } catch (error) {
        console.error('Error uploading file:', error)
        setStorageError('文件上传失败，请重试')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !work) {
      alert('用户信息或作品信息缺失')
      return
    }

    console.log('🚀 开始更新作品，用户ID:', user.id, '作品ID:', work.id)

    if (!title.trim() || !description.trim() || !category) {
      alert('请填写所有必填字段')
      return
    }

    if (fileType === 'web' && !webUrl.trim()) {
      alert('请输入网页链接')
      return
    }

    if (fileType !== 'web' && !fileUrl && !originalFileUrl) {
      alert('请选择文件')
      return
    }

    setIsSubmitting(true)

    try {
      // Determine the file URL to store
      let finalFileUrl = ''
      if (fileType === 'web') {
        finalFileUrl = webUrl
      } else if (fileUrl) {
        // Use the new base64 URL if file was changed
        finalFileUrl = fileUrl
      } else {
        // Keep original file URL if no new file was uploaded
        finalFileUrl = originalFileUrl
      }
      
      // Prepare updated work data
      const updatedData: Partial<Work> = {
        title: title.trim(),
        description: description.trim(),
        detailed_description: detailedDescription.trim() || undefined,
        category,
        file_url: finalFileUrl,
        file_type: fileType,
        updated_at: new Date().toISOString()
      }

      console.log('📝 更新数据:', {
        ...updatedData,
        file_url: updatedData.file_url && updatedData.file_url.length > 100 ? 
          `${updatedData.file_url.substring(0, 100)}...` : updatedData.file_url
      })

      let success = false
      let updatedWork: Work | null = null

      if (isUsingDatabase) {
        console.log('💾 更新作品到Supabase数据库')
        updatedWork = await DatabaseService.updateWork(work.id, updatedData, user.id)
        success = updatedWork !== null
      } else {
        console.log('❌ 数据库连接失败，无法更新作品')
        throw new Error('数据库连接失败，请稍后重试')
      }

      if (success && updatedWork) {
        console.log('✅ 作品更新成功:', updatedWork.id)
        
        // Show success message
        setShowSuccess(true)
        
        // Navigate back to my works after a short delay
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/my-works')
        }, 2000)
      } else {
        throw new Error('作品更新失败')
      }
      
    } catch (error) {
      console.error('Error updating work:', error)
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试'
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl mb-2">加载中...</div>
          <p className="text-gray-400">正在从{isUsingDatabase ? '数据库' : '本地存储'}加载作品信息</p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-4">作品更新成功！</div>
          <p className="text-gray-400 mb-6">
            {isUsingDatabase ? '已保存到数据库' : '已保存到本地存储'}，正在跳转到我的作品...
          </p>
        </div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">作品未找到</div>
          <Button
            onClick={() => navigate('/my-works')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            返回我的作品
          </Button>
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
              onClick={() => navigate('/my-works')}
              className="text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回我的作品
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              编辑作品
            </h1>
            {/* Database status indicator */}
            <div className={`px-2 py-1 rounded-full text-xs ${
              isUsingDatabase 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isUsingDatabase ? '🗄️ 数据库模式' : '❌ 数据库离线'}
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
              <CardTitle className="text-white text-2xl">编辑作品：{work.title}</CardTitle>
              <p className="text-gray-400">修改您的作品信息和内容</p>
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

                {/* File Upload or Web URL */}
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
                      更新文件 <span className="text-gray-400">(可选，不选择则保持原文件)</span>
                    </Label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                      <input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept={
                          fileType === 'image' ? 'image/*' :
                          fileType === 'video' ? 'video/*' :
                          fileType === 'audio' ? 'audio/*' :
                          fileType === 'document' ? '.pdf,.doc,.docx,.txt' : '*'
                        }
                        className="hidden"
                      />
                      <Label htmlFor="file" className="cursor-pointer">
                        <div className="flex flex-col items-center space-y-2">
                          {file ? (
                            <>
                              <CheckCircle className="w-8 h-8 text-green-400" />
                              <span className="text-green-400">已选择新文件: {file.name}</span>
                              <span className="text-blue-400 text-xs">文件大小: {(file.size / 1024 / 1024).toFixed(2)}MB</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400" />
                              <span className="text-gray-400">点击选择新的{fileType === 'image' ? '图片' : fileType === 'video' ? '视频' : fileType === 'audio' ? '音频' : '文档'}文件</span>
                              <span className="text-xs text-gray-500">支持最大10MB，不选择则保持原文件</span>
                            </>
                          )}
                        </div>
                      </Label>
                    </div>
                    
                    {/* Current File Info */}
                    {!file && originalFileUrl && (
                      <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-300">
                          <span className="font-medium">当前文件:</span> {fileType}文件
                          {originalFileUrl.startsWith('data:') && (
                            <span className="ml-2 text-xs text-blue-400">
                              (Base64编码, 大小: {(originalFileUrl.length * 0.75 / 1024 / 1024).toFixed(2)}MB)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* File Preview */}
                    {file && fileUrl && (
                      <div className="mt-4">
                        <Label className="text-white text-sm">新文件预览:</Label>
                        <div className="mt-2 border border-gray-600 rounded-lg p-2 bg-gray-800">
                          {fileType === 'image' && (
                            <img
                              src={fileUrl}
                              alt="预览"
                              className="max-w-full h-32 object-contain mx-auto rounded"
                              onError={(e) => {
                                console.error('Preview image failed to load')
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {fileType === 'video' && (
                            <video
                              src={fileUrl}
                              className="max-w-full h-32 object-contain mx-auto rounded"
                              controls
                              muted
                            />
                          )}
                          {fileType === 'audio' && (
                            <audio
                              src={fileUrl}
                              className="w-full"
                              controls
                            />
                          )}
                          {fileType === 'document' && (
                            <div className="text-center py-4">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <span className="text-gray-400 text-sm">{file.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-works')}
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        更新中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存更新
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
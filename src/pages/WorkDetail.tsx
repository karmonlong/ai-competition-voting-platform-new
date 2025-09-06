import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Share2, Play, FileText, Globe, Image as ImageIcon, Volume2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import MediaPlayer from '@/components/MediaPlayer'
import { DatabaseService, Work, Comment } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
}

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [work, setWork] = useState<Work | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isVoted, setIsVoted] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingDatabase, setIsUsingDatabase] = useState(true) // Always use database mode

  useEffect(() => {
    if (!id) {
      console.error('No work ID provided')
      setLoading(false)
      return
    }

    loadWorkAndComments()
    loadUser()
  }, [id])

  const loadWorkAndComments = async () => {
    setLoading(true)
    try {
      console.log('✅ 使用Supabase数据库加载作品详情')
      
      // Load work from database
      const dbWork = await DatabaseService.getWorkById(id!)
      if (dbWork) {
        setWork(dbWork)
        
        // Load comments from database
        const dbComments = await DatabaseService.getComments(id!)
        setComments(dbComments)
      } else {
        console.log('作品在数据库中未找到')
        // Show mock data as fallback
        loadMockData()
      }
    } catch (error) {
      console.error('Error loading work:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    // Fallback mock data
    const mockWorks: Work[] = [
      {
        id: '1',
        title: 'AI艺术生成器',
        description: '一个革命性的AI系统，能够根据文本提示创建令人惊叹的数字艺术作品。该系统使用了最新的生成对抗网络(GAN)技术，结合了深度学习和计算机视觉的前沿成果。用户只需输入简单的文字描述，系统就能生成高质量、富有创意的艺术作品。支持多种艺术风格，包括抽象艺术、写实主义、印象派等。',
        author_id: '1',
        category: 'AI艺术',
        file_url: '/api/placeholder/800/600',
        file_type: 'image',
        vote_count: 142,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        profiles: {
          username: '艺术AI',
          avatar_url: '/api/placeholder/40/40'
        },
        detailed_description: '这个AI艺术生成器项目历时6个月开发，团队由5名AI研究员和3名艺术家组成。我们的目标是让每个人都能轻松创作出专业级别的艺术作品。\n\n技术特点：\n• 基于Transformer架构的文本理解模型\n• 使用StyleGAN3进行图像生成\n• 支持1024x1024高分辨率输出\n• 实时预览和调整功能\n\n应用场景：\n• 数字艺术创作\n• 商业设计辅助\n• 教育和娱乐\n• 个人创意表达'
      },
      {
        id: '2',
        title: '智能视觉系统',
        description: '能够实时识别和分类物体的计算机视觉模型',
        author_id: '2',
        category: '计算机视觉',
        file_url: '/demo-video.mp4',
        file_type: 'video',
        vote_count: 98,
        created_at: '2024-01-14T15:30:00Z',
        updated_at: '2024-01-14T15:30:00Z',
        profiles: {
          username: '视觉开发者',
          avatar_url: '/api/placeholder/40/40'
        },
        detailed_description: '智能视觉系统采用最新的YOLO v8算法，能够在毫秒级时间内识别和定位图像中的多个物体。系统经过大规模数据集训练，可以识别超过1000种不同的物体类别。'
      }
    ]

    // Find the work by ID
    const foundWork = mockWorks.find(w => w.id === id)
    
    if (foundWork) {
      setWork(foundWork)
    }

    // Load mock comments
    const mockComments = [
      {
        id: '1',
        work_id: id!,
        user_id: 'mock1',
        content: '这个项目真的很棒！生成的艺术作品质量非常高，创意也很丰富。',
        author: '艺术爱好者',
        avatar: '/api/placeholder/32/32',
        created_at: '2024-01-16T09:30:00Z'
      },
      {
        id: '2',
        work_id: id!,
        user_id: 'mock2',
        content: '技术实现很有创新性，期待看到更多的功能更新。',
        author: 'AI研究员',
        avatar: '/api/placeholder/32/32',
        created_at: '2024-01-16T14:20:00Z'
      }
    ]
    setComments(mockComments)
  }

  const loadUser = () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('mockUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      
      // Check if user has voted
      const votes = JSON.parse(localStorage.getItem('userVotes') || '[]')
      setIsVoted(votes.includes(id))
    }
  }

  const handleVote = async () => {
    if (!user) {
      alert('请先登录后再投票！')
      return
    }
    
    if (isVoted) {
      alert('您已经为此作品投过票了！')
      return
    }
    
    try {
      const success = await DatabaseService.createVote(user.id, id!)
      
      if (success) {
        // Update local state
        setWork((prev: Work | null) => prev ? { ...prev, vote_count: prev.vote_count + 1 } : null)
        setIsVoted(true)
        
        // Also save to localStorage as backup
        const votes = JSON.parse(localStorage.getItem('userVotes') || '[]')
        votes.push(id)
        localStorage.setItem('userVotes', JSON.stringify(votes))
      } else {
        alert('投票失败，请重试')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('投票失败，请重试')
    }
  }

  const handleSubmitComment = async () => {
    if (!user) {
      alert('请先登录后再评论！')
      return
    }
    
    if (!newComment.trim()) {
      alert('请输入评论内容！')
      return
    }
    
    setIsSubmittingComment(true)
    
    try {
      const commentData = {
        id: crypto.randomUUID(),
        work_id: id!,
        user_id: user.id,
        content: newComment.trim(),
        author: user.username || user.email.split('@')[0],
        avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`
      }

      const savedComment = await DatabaseService.createComment(commentData)

      if (savedComment) {
        setComments(prev => [savedComment, ...prev])
        setNewComment('')
      } else {
        alert('评论发布失败，请重试')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('评论发布失败，请重试')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: work?.title,
        text: work?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard?.writeText(window.location.href)
      alert('链接已复制到剪贴板！')
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Play className="w-5 h-5" />
      case 'audio':
        return <Volume2 className="w-5 h-5" />
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'web':
        return <Globe className="w-5 h-5" />
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'AI艺术': 'from-pink-500 to-rose-500',
      '机器学习': 'from-blue-500 to-cyan-500',
      '计算机视觉': 'from-green-500 to-emerald-500',
      '自然语言处理': 'from-purple-500 to-indigo-500',
      '机器人技术': 'from-orange-500 to-red-500',
      '其他': 'from-gray-500 to-slate-500'
    }
    return colors[category as keyof typeof colors] || colors['其他']
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl mb-2">加载中...</div>
          <p className="text-gray-400">正在从数据库加载作品详情</p>
        </div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">作品未找到</div>
          <p className="text-gray-400 mb-6">请检查链接是否正确，或返回主页浏览其他作品</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
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
              onClick={() => navigate('/')}
              className="text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              作品详情
            </h1>
            {/* Database status indicator */}
            <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
              🗄️ 数据库模式
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Info */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={`bg-gradient-to-r ${getCategoryColor(work.category)} text-white border-none`}>
                        {work.category}
                      </Badge>
                      <div className="flex items-center text-gray-400">
                        {getFileTypeIcon(work.file_type)}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white">{work.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={work.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {work.profiles?.username?.[0]?.toUpperCase() || '用'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{work.profiles?.username || '匿名用户'}</div>
                        <div className="text-gray-400 text-sm">{formatDate(work.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Media Preview */}
                <div className="rounded-lg overflow-hidden">
                  <MediaPlayer
                    fileUrl={work.file_url}
                    fileType={work.file_type}
                    title={work.title}
                  />
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">作品描述</h3>
                  <p className="text-gray-300 leading-relaxed">{work.description}</p>
                  
                  {work.detailed_description && (
                    <div className="space-y-2">
                      <h4 className="text-md font-semibold text-white">详细介绍</h4>
                      <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {work.detailed_description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    onClick={handleVote}
                    disabled={isVoted}
                    className={`flex items-center space-x-2 ${
                      isVoted 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isVoted ? 'fill-current' : ''}`} />
                    <span>{isVoted ? '已投票' : '投票'}</span>
                    <span>({work.vote_count})</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">作品统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">投票数</span>
                  <span className="text-white font-semibold">{work.vote_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">评论数</span>
                  <span className="text-white font-semibold">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">发布时间</span>
                  <span className="text-white font-semibold text-sm">{formatDate(work.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">评论 ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment Form */}
                {user ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="写下您的评论..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmittingComment ? '发布中...' : '发布评论'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-3">请登录后发表评论</p>
                    <Button
                      onClick={() => {
                        // Mock login
                        const mockUser = { id: 'demo', email: 'demo@example.com', username: '演示用户' }
                        localStorage.setItem('mockUser', JSON.stringify(mockUser))
                        setUser(mockUser)
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      登录
                    </Button>
                  </div>
                )}

                <Separator className="bg-gray-600" />

                {/* Comments List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                              {comment.author[0]?.toUpperCase() || '用'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium text-sm">{comment.author}</span>
                              <span className="text-gray-400 text-xs">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                        <Separator className="bg-gray-700" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">暂无评论，来发表第一条评论吧！</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
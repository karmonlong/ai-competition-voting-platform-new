import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Eye, Heart, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DatabaseService, Work } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
}

export default function MyWorks() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingWorkId, setDeletingWorkId] = useState<string | null>(null)
  const [isUsingDatabase, setIsUsingDatabase] = useState(true) // 强制使用数据库模式

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserWorks()
    }
  }, [user])

  const loadUser = () => {
    const savedUser = localStorage.getItem('mockUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      console.log('👤 当前用户:', userData)
    } else {
      // Redirect to home if not logged in
      navigate('/')
    }
  }

  const loadUserWorks = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🚀 强制使用数据库模式加载用户作品')
      setIsUsingDatabase(true)
      
      let userWorks: Work[] = []
      
      try {
        console.log('✅ 从Supabase数据库加载用户作品')
        userWorks = await DatabaseService.getUserWorks(user.id)
        console.log(`📊 从数据库成功加载了 ${userWorks.length} 个用户作品`)
      } catch (error) {
        console.error('❌ 数据库加载用户作品失败:', error)
        userWorks = []
      }
      
      setWorks(userWorks)
    } catch (error) {
      console.error('Error loading user works:', error)
      setWorks([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditWork = (workId: string) => {
    navigate(`/edit/${workId}`)
  }

  const handleDeleteWork = async (workId: string) => {
    if (!user) return
    
    setDeletingWorkId(workId)
    
    try {
      console.log(`🗑️ 删除作品（数据库模式）: ${workId}`)
      
      // 强制使用数据库
      const success = await DatabaseService.deleteWork(workId, user.id)
      
      if (success) {
        // Remove from local state
        setWorks(prevWorks => prevWorks.filter(work => work.id !== workId))
        console.log('✅ 作品删除成功（已从数据库删除）')
      } else {
        alert('删除失败，请重试')
        console.error('❌ 数据库作品删除失败')
      }
    } catch (error) {
      console.error('Error deleting work:', error)
      alert('删除失败，请重试')
    } finally {
      setDeletingWorkId(null)
    }
  }

  const handleViewWork = (workId: string) => {
    navigate(`/work/${workId}`)
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl mb-2">加载中...</div>
          <p className="text-gray-400">正在从数据库加载您的作品</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                我的作品
              </h1>
              {/* Database status indicator - 强制显示数据库模式 */}
              <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                🗄️ 数据库模式
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user.username[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white">{user.username}</span>
              </div>
              <Button
                onClick={() => navigate('/submit')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                提交新作品
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">作品统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{works.length}</div>
                  <div className="text-gray-400 text-sm">总作品数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {works.reduce((sum, work) => sum + work.vote_count, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">总获得票数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {works.length > 0 ? Math.round(works.reduce((sum, work) => sum + work.vote_count, 0) / works.length) : 0}
                  </div>
                  <div className="text-gray-400 text-sm">平均票数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Works List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              我的作品 <span className="text-gray-400 text-lg">({works.length})</span>
            </h2>
          </div>

          {works.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {works.map((work) => (
                <Card key={work.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={`bg-gradient-to-r ${getCategoryColor(work.category)} text-white border-none`}>
                            {work.category}
                          </Badge>
                          <span className="text-gray-400 text-sm">{formatDate(work.created_at)}</span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-white">{work.title}</h3>
                        <p className="text-gray-300 line-clamp-2">{work.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{work.vote_count} 票</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>0 评论</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{work.file_type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewWork(work.id)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditWork(work.id)}
                          className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deletingWorkId === work.id}
                              className="border-red-600 text-red-400 hover:bg-red-600/10"
                            >
                              {deletingWorkId === work.id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                              ) : (
                                <Trash2 className="w-4 h-4 mr-1" />
                              )}
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                                确认删除作品
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                您确定要删除作品《{work.title}》吗？此操作无法撤销，将会删除所有相关的投票和评论。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                                取消
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteWork(work.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-xl mb-4">您还没有提交任何作品</div>
              <p className="text-gray-500 mb-6">开始创作并分享您的AI项目吧！</p>
              <Button
                onClick={() => navigate('/submit')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                提交第一个作品
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
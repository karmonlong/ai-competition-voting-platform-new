import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Plus, User, LogOut, Search, Filter, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import VotingCard from '@/components/VotingCard'
import AuthDialog from '@/components/AuthDialog'
import { DatabaseService, Work } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
}

export default function Index() {
  const navigate = useNavigate()
  const [works, setWorks] = useState<Work[]>([])
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [votingWorks, setVotingWorks] = useState<Set<string>>(new Set())
  const [isUsingDatabase, setIsUsingDatabase] = useState(true) // 强制使用数据库模式

  const categories = [
    { id: 'all', name: '全部分类' },
    { id: 'AI艺术', name: 'AI艺术' },
    { id: '机器学习', name: '机器学习' },
    { id: '计算机视觉', name: '计算机视觉' },
    { id: '自然语言处理', name: '自然语言处理' },
    { id: '机器人技术', name: '机器人技术' },
    { id: '其他', name: '其他' }
  ]

  useEffect(() => {
    loadUser()
    loadWorks()
  }, [])

  useEffect(() => {
    filterWorks()
  }, [works, searchTerm, selectedCategory])

  useEffect(() => {
    if (user) {
      loadUserVotes()
    }
  }, [user])

  const loadUser = () => {
    const savedUser = localStorage.getItem('mockUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      console.log('👤 当前登录用户:', userData)
    }
  }

  const loadWorks = async () => {
    setLoading(true)
    try {
      console.log('🚀 强制使用数据库模式加载作品')
      setIsUsingDatabase(true)
      
      let loadedWorks: Work[] = []
      
      try {
        console.log('✅ 从Supabase数据库加载作品')
        loadedWorks = await DatabaseService.getWorks()
        console.log(`📊 从数据库成功加载了 ${loadedWorks.length} 个作品`)
        
        if (loadedWorks.length === 0) {
          console.log('⚠️ 数据库中没有作品，但保持数据库模式')
        }
      } catch (error) {
        console.error('❌ 数据库加载失败，但仍保持数据库模式:', error)
        // 即使失败也保持数据库模式，不回退到本地存储
        loadedWorks = []
      }
      
      setWorks(loadedWorks)
      console.log(`📊 最终加载了 ${loadedWorks.length} 个作品`)
    } catch (error) {
      console.error('Error loading works:', error)
      // 保持数据库模式，不使用localStorage
      setWorks([])
    } finally {
      setLoading(false)
    }
  }

  const loadUserVotes = async () => {
    if (!user) return
    
    try {
      console.log(`📊 从数据库加载用户投票记录: ${user.id}`)
      
      let votes: string[] = []
      
      try {
        votes = await DatabaseService.getUserVotes(user.id)
        console.log(`✅ 从数据库获取用户投票: ${votes.length} 个`)
      } catch (error) {
        console.error('❌ 数据库获取投票失败:', error)
        votes = []
      }
      
      setUserVotes(votes)
    } catch (error) {
      console.error('Error loading user votes:', error)
      setUserVotes([])
    }
  }

  const filterWorks = () => {
    let filtered = works

    if (searchTerm) {
      filtered = filtered.filter(work =>
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(work => work.category === selectedCategory)
    }

    // Sort by vote count (descending) and creation date (newest first)
    filtered.sort((a, b) => {
      if (a.vote_count !== b.vote_count) {
        return b.vote_count - a.vote_count
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setFilteredWorks(filtered)
  }

  const handleVote = async (workId: string) => {
    if (!user) {
      alert('请先登录后再投票！')
      setShowAuthDialog(true)
      return
    }

    if (userVotes.includes(workId)) {
      alert('您已经为此作品投过票了！')
      return
    }

    // Prevent multiple simultaneous votes
    if (votingWorks.has(workId)) {
      return
    }

    setVotingWorks(prev => new Set(prev).add(workId))

    try {
      console.log(`🗳️ 用户 ${user.id} 为作品 ${workId} 投票（数据库模式）`)
      
      // 强制使用数据库
      const success = await DatabaseService.createVote(user.id, workId)

      if (success) {
        // Update local state
        setWorks(prevWorks => 
          prevWorks.map(work => 
            work.id === workId 
              ? { ...work, vote_count: work.vote_count + 1 }
              : work
          )
        )
        setUserVotes(prev => [...prev, workId])
        
        console.log('✅ 投票成功（已保存到数据库）')
      } else {
        alert('投票失败，请重试')
        console.error('❌ 数据库投票失败')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('投票失败，请重试')
    } finally {
      setVotingWorks(prev => {
        const newSet = new Set(prev)
        newSet.delete(workId)
        return newSet
      })
    }
  }

  const handleAuthSuccess = (userData: User) => {
    setUser(userData)
    console.log('✅ 用户登录成功:', userData)
    // Reload user votes after successful auth
    setTimeout(() => {
      loadUserVotes()
    }, 500)
  }

  const handleLogout = () => {
    localStorage.removeItem('mockUser')
    setUser(null)
    setUserVotes([])
    console.log('👋 用户已登出')
  }

  const handleSubmitWork = () => {
    if (!user) {
      alert('请先登录后再提交作品！')
      setShowAuthDialog(true)
      return
    }
    navigate('/submit')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl mb-2">加载中...</div>
          <p className="text-gray-400">正在从数据库加载作品</p>
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
              <div className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI竞赛中心
                </h1>
              </div>
              {/* Database status indicator - 强制显示数据库模式 */}
              <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                🗄️ 数据库模式
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSubmitWork}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                提交作品
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-gray-700">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user.username[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem onClick={() => navigate('/my-works')} className="text-white hover:bg-gray-700">
                      <Settings className="w-4 h-4 mr-2" />
                      我的作品
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-gray-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      登出
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            展示您的AI创新成果
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            发现、投票并分享最优秀的人工智能项目
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索作品、作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Works Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? '所有作品' : categories.find(c => c.id === selectedCategory)?.name}
              <span className="text-gray-400 text-lg ml-2">({filteredWorks.length})</span>
            </h3>
            {user && (
              <div className="text-sm text-gray-400">
                已投票: {userVotes.length} 个作品
              </div>
            )}
          </div>

          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map((work) => (
                <VotingCard
                  key={work.id}
                  work={work}
                  onVote={handleVote}
                  hasVoted={userVotes.includes(work.id)}
                  isVoting={votingWorks.has(work.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-xl mb-4">
                {searchTerm || selectedCategory !== 'all' ? '未找到匹配的作品' : '数据库中暂无作品'}
              </div>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? '尝试调整搜索条件或分类筛选' 
                  : '成为第一个提交作品的用户吧！'
                }
              </p>
              {(!searchTerm && selectedCategory === 'all') && (
                <Button
                  onClick={handleSubmitWork}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  提交作品
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
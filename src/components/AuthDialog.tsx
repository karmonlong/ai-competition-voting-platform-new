import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Mail, Lock, AlertCircle, Database } from 'lucide-react'
import { DatabaseService } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
}

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess: (user: User) => void
}

export default function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Register form
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const generateUUID = (): string => {
    return crypto.randomUUID()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 开始登录流程（数据库模式）...')

      if (!loginEmail || !loginPassword) {
        setError('请填写邮箱和密码')
        return
      }

      // Extract username from email
      const username = loginEmail.split('@')[0]
      console.log(`👤 提取用户名: ${username}`)
      
      console.log('✅ 使用数据库登录模式')
      
      // 强制使用数据库创建或获取用户档案
      console.log(`🔍 查找或创建用户档案: ${loginEmail}`)
      const profile = await DatabaseService.getOrCreateProfile(loginEmail, username)
      
      let user: User
      if (profile) {
        user = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url
        }
        console.log('✅ 用户档案获取成功:', user)
      } else {
        throw new Error('用户档案创建失败')
      }

      // 保存用户信息到localStorage（仅用于会话管理）
      localStorage.setItem('mockUser', JSON.stringify(user))
      console.log('💾 用户信息已保存到localStorage:', user)
      
      onAuthSuccess(user)
      onOpenChange(false)
      
      // Reset form
      setLoginEmail('')
      setLoginPassword('')
      
    } catch (error) {
      console.error('❌ 登录过程出错:', error)
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 开始注册流程（数据库模式）...')

      if (!registerEmail || !registerUsername || !registerPassword) {
        setError('请填写所有必填字段')
        return
      }

      if (registerPassword !== confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }

      if (registerPassword.length < 6) {
        setError('密码长度至少6位')
        return
      }

      console.log(`👤 注册用户: ${registerUsername} (${registerEmail})`)
      
      console.log('✅ 使用数据库注册模式')
      
      // 强制使用数据库创建用户档案
      const userId = generateUUID()
      console.log(`🆔 生成用户ID: ${userId}`)
      
      const profile = await DatabaseService.createProfile({
        id: userId,
        username: registerUsername,
        email: registerEmail,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerUsername}`
      })
      
      let user: User
      if (profile) {
        user = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url
        }
        console.log('✅ 用户档案创建成功:', user)
      } else {
        throw new Error('用户档案创建失败')
      }

      // 保存用户信息到localStorage（仅用于会话管理）
      localStorage.setItem('mockUser', JSON.stringify(user))
      console.log('💾 用户信息已保存到localStorage:', user)
      
      onAuthSuccess(user)
      onOpenChange(false)
      
      // Reset form
      setRegisterEmail('')
      setRegisterUsername('')
      setRegisterPassword('')
      setConfirmPassword('')
      
    } catch (error) {
      console.error('❌ 注册过程出错:', error)
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 开始快速登录流程（数据库模式）...')

      const username = '演示用户'
      const email = 'demo@example.com'
      console.log(`👤 快速登录用户: ${username} (${email})`)
      
      console.log('✅ 使用数据库快速登录模式')
      
      // 强制使用数据库创建或获取演示用户档案
      console.log(`🔍 查找或创建演示用户档案: ${email}`)
      const profile = await DatabaseService.getOrCreateProfile(email, username)
      
      let user: User
      if (profile) {
        user = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url
        }
        console.log('✅ 演示用户档案获取成功:', user)
      } else {
        throw new Error('演示用户档案创建失败')
      }

      // 保存用户信息到localStorage（仅用于会话管理）
      localStorage.setItem('mockUser', JSON.stringify(user))
      console.log('💾 演示用户信息已保存到localStorage:', user)
      
      onAuthSuccess(user)
      onOpenChange(false)
      
    } catch (error) {
      console.error('❌ 快速登录过程出错:', error)
      setError('快速登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            欢迎来到AI竞赛中心
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            登录或注册以参与投票和提交作品
          </DialogDescription>
          {/* 永久显示数据库模式 */}
          <div className="mx-auto px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
            <Database className="h-3 w-3" />
            🗄️ 数据库模式
          </div>
        </DialogHeader>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-gray-600">
              登录
            </TabsTrigger>
            <TabsTrigger value="register" className="text-white data-[state=active]:bg-gray-600">
              注册
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail" className="text-white">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword" className="text-white">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registerEmail" className="text-white">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerUsername" className="text-white">用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="registerUsername"
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerPassword" className="text-white">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {isLoading ? '注册中...' : '注册'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Quick Login Button */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">或</span>
          </div>
        </div>

        <Button
          onClick={handleQuickLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full border-gray-600 text-white hover:bg-gray-700"
        >
          {isLoading ? '登录中...' : '快速体验（演示账号）'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
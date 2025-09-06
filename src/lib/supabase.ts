import { createClient } from '@supabase/supabase-js'

// Types
export interface Work {
  id: string
  title: string
  description: string
  author_id: string
  category: string
  file_url: string
  file_type: 'image' | 'video' | 'audio' | 'document' | 'web'
  vote_count: number
  created_at: string
  updated_at: string
  profiles?: {
    username: string
    avatar_url?: string
  }
  detailed_description?: string
}

export interface Comment {
  id: string
  work_id: string
  user_id: string
  content: string
  author: string
  avatar?: string
  created_at: string
}

export interface Vote {
  id: string
  user_id: string
  work_id: string
  created_at: string
}

export interface Profile {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

// Supabase configuration - Using the correct API key provided by user
const supabaseUrl = 'https://ajapktcjhtpnerjqiiyg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYXBrdGNqaHRwbmVyanFpaXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzQ4OTMsImV4cCI6MjA3MjYxMDg5M30.6RmbkxtJa2At1GuN2ncyPxga3VfulEcWwO8d-p8qu8w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔑 Supabase配置 - 使用用户提供的正确API Key:')
console.log('📍 URL:', supabaseUrl)
console.log('🔐 Key:', supabaseAnonKey.substring(0, 50) + '...')

// Database Service - 100% Supabase, NO localStorage fallbacks
export const DatabaseService = {
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 测试Supabase数据库连接...')
      const { error } = await supabase
        .from('works')
        .select('count')
        .limit(1)

      if (error) {
        console.error('❌ 数据库连接测试失败:', error.message)
        return false
      }

      console.log('✅ 数据库连接测试成功')
      return true
    } catch (error) {
      console.error('❌ 数据库连接测试异常:', error)
      return false
    }
  },

  async getOrCreateProfile(email: string, username: string): Promise<Profile | null> {
    try {
      console.log('🔍 查找或创建用户档案:', email)
      
      // First try to find existing profile
      const { data: existingProfile, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (existingProfile && !findError) {
        console.log('✅ 找到现有用户档案:', existingProfile.username)
        return existingProfile
      }

      // Create new profile if not found
      console.log('🆕 创建新用户档案:', username)
      const newProfile = {
        id: crypto.randomUUID(),
        username,
        email,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        console.error('❌ 创建用户档案失败:', error.message)
        throw error
      }

      console.log('✅ 用户档案创建成功:', data.username)
      return data
    } catch (error) {
      console.error('❌ 用户档案操作异常:', error)
      throw error
    }
  },

  async createProfile(profileData: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile | null> {
    try {
      console.log('🆕 创建用户档案:', profileData.username)
      
      const newProfile = {
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        console.error('❌ 创建用户档案失败:', error.message)
        throw error
      }

      console.log('✅ 用户档案创建成功:', data.username)
      return data
    } catch (error) {
      console.error('❌ 创建用户档案异常:', error)
      throw error
    }
  },

  async getWorks(): Promise<Work[]> {
    try {
      console.log('📊 从Supabase数据库获取所有作品')
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ 获取作品失败:', error.message)
        throw error
      }

      console.log(`✅ 成功从数据库获取 ${data?.length || 0} 个作品`)
      return data || []
    } catch (error) {
      console.error('❌ 获取作品异常:', error)
      throw error
    }
  },

  async getWorkById(id: string): Promise<Work | null> {
    try {
      console.log('📊 从Supabase数据库获取作品:', id)
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ 获取作品失败:', error.message)
        throw error
      }

      console.log('✅ 成功从数据库获取作品:', data.title)
      return data
    } catch (error) {
      console.error('❌ 获取作品异常:', error)
      throw error
    }
  },

  async getUserWorks(userId: string): Promise<Work[]> {
    try {
      console.log('📊 从Supabase数据库获取用户作品:', userId)
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ 获取用户作品失败:', error.message)
        throw error
      }

      console.log(`✅ 成功从数据库获取用户 ${data?.length || 0} 个作品`)
      return data || []
    } catch (error) {
      console.error('❌ 获取用户作品异常:', error)
      throw error
    }
  },

  async createWork(workData: Omit<Work, 'vote_count' | 'created_at' | 'updated_at'>): Promise<Work | null> {
    try {
      console.log('💾 创建新作品到Supabase数据库:', workData.title)
      
      const newWork = {
        ...workData,
        vote_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('works')
        .insert([newWork])
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('❌ 创建作品失败:', error.message)
        throw error
      }

      console.log('✅ 作品创建成功到数据库:', data.id)
      return data
    } catch (error) {
      console.error('❌ 创建作品异常:', error)
      throw error
    }
  },

  async updateWork(workId: string, updates: Partial<Work>, userId: string): Promise<Work | null> {
    try {
      console.log('📝 更新作品到Supabase数据库:', workId)
      
      // First check if user owns this work
      const { data: existingWork, error: checkError } = await supabase
        .from('works')
        .select('author_id')
        .eq('id', workId)
        .single()

      if (checkError || !existingWork) {
        console.error('❌ 作品不存在或无法访问')
        throw new Error('作品不存在或无法访问')
      }

      if (existingWork.author_id !== userId) {
        console.error('❌ 用户无权限修改此作品')
        throw new Error('用户无权限修改此作品')
      }

      const { data, error } = await supabase
        .from('works')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workId)
        .eq('author_id', userId)
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('❌ 更新作品失败:', error.message)
        throw error
      }

      console.log('✅ 作品更新成功到数据库:', data.id)
      return data
    } catch (error) {
      console.error('❌ 更新作品异常:', error)
      throw error
    }
  },

  async deleteWork(workId: string, userId: string): Promise<boolean> {
    try {
      console.log('🗑️ 删除作品从Supabase数据库:', workId)
      
      // First check if user owns this work
      const { data: existingWork, error: checkError } = await supabase
        .from('works')
        .select('author_id')
        .eq('id', workId)
        .single()

      if (checkError || !existingWork) {
        console.error('❌ 作品不存在或无法访问')
        throw new Error('作品不存在或无法访问')
      }

      if (existingWork.author_id !== userId) {
        console.error('❌ 用户无权限删除此作品')
        throw new Error('用户无权限删除此作品')
      }

      // Delete related votes first
      await supabase
        .from('votes')
        .delete()
        .eq('work_id', workId)

      // Delete related comments
      await supabase
        .from('comments')
        .delete()
        .eq('work_id', workId)

      // Delete the work
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', workId)
        .eq('author_id', userId)

      if (error) {
        console.error('❌ 删除作品失败:', error.message)
        throw error
      }

      console.log('✅ 作品删除成功从数据库:', workId)
      return true
    } catch (error) {
      console.error('❌ 删除作品异常:', error)
      throw error
    }
  },

  async createVote(userId: string, workId: string): Promise<boolean> {
    try {
      console.log('🗳️ 创建投票到Supabase数据库:', { userId, workId })
      
      // Check if user already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', userId)
        .eq('work_id', workId)
        .single()

      if (existingVote) {
        console.log('⚠️ 用户已经投过票了')
        return false
      }

      // Create vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          work_id: workId,
          created_at: new Date().toISOString()
        }])

      if (voteError) {
        console.error('❌ 创建投票失败:', voteError.message)
        throw voteError
      }

      // Update work vote count
      const { error: updateError } = await supabase
        .rpc('increment_vote_count', { work_id: workId })

      if (updateError) {
        console.error('❌ 更新投票数失败:', updateError.message)
        // Don't throw here, vote was created successfully
      }

      console.log('✅ 投票创建成功到数据库')
      return true
    } catch (error) {
      console.error('❌ 创建投票异常:', error)
      throw error
    }
  },

  async getUserVotes(userId: string): Promise<string[]> {
    try {
      console.log('📊 从Supabase数据库获取用户投票:', userId)
      const { data, error } = await supabase
        .from('votes')
        .select('work_id')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ 获取用户投票失败:', error.message)
        throw error
      }

      const workIds = data?.map(vote => vote.work_id) || []
      console.log(`✅ 成功从数据库获取用户投票: ${workIds.length} 个`)
      return workIds
    } catch (error) {
      console.error('❌ 获取用户投票异常:', error)
      throw error
    }
  },

  async getComments(workId: string): Promise<Comment[]> {
    try {
      console.log('📊 从Supabase数据库获取评论:', workId)
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ 获取评论失败:', error.message)
        console.error('❌ 错误详情:', error)
        throw error
      }

      // Transform data to match Comment interface
      // Note: author and avatar should be stored directly in comments table
      // or retrieved separately from profiles table if needed
      const comments: Comment[] = (data || []).map(comment => ({
        id: comment.id,
        work_id: comment.work_id,
        user_id: comment.user_id,
        content: comment.content,
        author: comment.author || 'Unknown',
        avatar: comment.avatar,
        created_at: comment.created_at
      }))

      console.log(`✅ 成功从数据库获取 ${comments.length} 条评论`)
      return comments
    } catch (error) {
      console.error('❌ 获取评论异常:', error)
      throw error
    }
  },

  async createComment(commentData: Omit<Comment, 'created_at'>): Promise<Comment | null> {
    try {
      console.log('💬 创建评论到Supabase数据库:', commentData.work_id)
      
      const newComment = {
        id: commentData.id,
        work_id: commentData.work_id,
        user_id: commentData.user_id,
        content: commentData.content,
        author: commentData.author,
        avatar: commentData.avatar,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select('*')
        .single()

      if (error) {
        console.error('❌ 创建评论失败:', error.message)
        console.error('❌ 错误详情:', error)
        throw error
      }

      // Transform data to match Comment interface using provided author/avatar
      const comment: Comment = {
        id: data.id,
        work_id: data.work_id,
        user_id: data.user_id,
        content: data.content,
        author: commentData.author,
        avatar: commentData.avatar,
        created_at: data.created_at
      }

      console.log('✅ 评论创建成功到数据库:', data.id)
      return comment
    } catch (error) {
      console.error('❌ 创建评论异常:', error)
      throw error
    }
  }
}

// Verify exports at module load
// Storage Service for file uploads
export const StorageService = {
  // Upload file to Supabase Storage
  async uploadFile(file: File, bucket: string = 'works'): Promise<{ url: string; path: string } | null> {
    try {
      console.log('📤 上传文件到Supabase Storage:', file.name)
      
      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `uploads/${fileName}`
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('❌ 文件上传失败:', error.message)
        throw error
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)
      
      console.log('✅ 文件上传成功:', publicUrl)
      return {
        url: publicUrl,
        path: filePath
      }
    } catch (error) {
      console.error('❌ 文件上传异常:', error)
      return null
    }
  },
  
  // Delete file from Supabase Storage
  async deleteFile(filePath: string, bucket: string = 'works'): Promise<boolean> {
    try {
      console.log('🗑️ 删除Storage文件:', filePath)
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])
      
      if (error) {
        console.error('❌ 文件删除失败:', error.message)
        return false
      }
      
      console.log('✅ 文件删除成功:', filePath)
      return true
    } catch (error) {
      console.error('❌ 文件删除异常:', error)
      return false
    }
  },
  
  // Get public URL for a file
  getPublicUrl(filePath: string, bucket: string = 'works'): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return publicUrl
  },
  
  // Extract file path from Storage URL
  extractFilePathFromUrl(url: string): string | null {
    try {
      // Extract path from Supabase Storage URL
      // Format: https://ajapktcjhtpnerjqiiyg.supabase.co/storage/v1/object/public/works/uploads/filename
      const urlParts = url.split('/storage/v1/object/public/works/')
      return urlParts.length > 1 ? urlParts[1] : null
    } catch (error) {
      console.error('❌ 提取文件路径失败:', error)
      return null
    }
  }
}

console.log('🔍 验证DatabaseService导出 - 100% Supabase模式:', {
  testConnection: typeof DatabaseService.testConnection,
  getWorkById: typeof DatabaseService.getWorkById,
  getComments: typeof DatabaseService.getComments,
  createVote: typeof DatabaseService.createVote
})

console.log('🔍 验证StorageService导出:', {
  uploadFile: typeof StorageService.uploadFile,
  deleteFile: typeof StorageService.deleteFile,
  getPublicUrl: typeof StorageService.getPublicUrl
})

export default supabase
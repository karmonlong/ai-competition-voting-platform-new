import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Play, FileText, Globe, Image as ImageIcon, Volume2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface WorkData {
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

interface VotingCardProps {
  work: WorkData
  onVote?: (workId: string) => void
  hasVoted?: boolean
  isVoting?: boolean
  className?: string
}

export default function VotingCard({ 
  work, 
  onVote, 
  hasVoted = false, 
  isVoting = false,
  className = '' 
}: VotingCardProps) {
  const navigate = useNavigate()
  const [voteCount, setVoteCount] = useState(work.vote_count)
  const [voted, setVoted] = useState(hasVoted)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setVoted(hasVoted)
  }, [hasVoted])

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (voted || isVoting || !onVote) return
    
    setVoted(true)
    setVoteCount(prev => prev + 1)
    onVote(work.id)
  }

  const handleCardClick = () => {
    navigate(`/work/${work.id}`)
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Play className="w-8 h-8 text-white" />
      case 'audio':
        return <Volume2 className="w-8 h-8 text-white" />
      case 'document':
        return <FileText className="w-8 h-8 text-white" />
      case 'web':
        return <Globe className="w-8 h-8 text-white" />
      case 'image':
        return <ImageIcon className="w-8 h-8 text-white" />
      default:
        return <FileText className="w-8 h-8 text-white" />
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

  const renderPreview = () => {
    // For images, try to load the actual image first
    if (work.file_type === 'image') {
      return (
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg overflow-hidden">
          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Try to load actual image */}
          {!imageError && (
            <img
              src={work.file_url}
              alt={work.title}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              onLoad={() => {
                setImageLoaded(true)
                setImageError(false)
              }}
              onError={() => {
                console.log('Image failed to load:', work.file_url)
                setImageError(true)
                setImageLoaded(false)
              }}
            />
          )}
          
          {/* Fallback icon display when image fails or for placeholder URLs */}
          {(imageError || work.file_url.includes('/api/placeholder/') || !imageLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getCategoryColor(work.category)} flex items-center justify-center shadow-lg`}>
                {getFileTypeIcon(work.file_type)}
              </div>
            </div>
          )}
        </div>
      )
    } else {
      // For non-image files, show themed preview with icons
      return (
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg overflow-hidden flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getCategoryColor(work.category)} flex items-center justify-center shadow-lg`}>
            {getFileTypeIcon(work.file_type)}
          </div>
          
          {/* Special overlay for video files */}
          {work.file_type === 'video' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}
          
          {/* Special overlay for web files */}
          {work.file_type === 'web' && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                <Globe className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <Card 
      className={`group cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0 relative">
        {/* Media Preview */}
        {renderPreview()}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`bg-gradient-to-r ${getCategoryColor(work.category)} text-white border-none shadow-lg`}>
            {work.category}
          </Badge>
        </div>

        {/* File Type Indicator */}
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white shadow-lg">
            {work.file_type === 'image' && <ImageIcon className="w-4 h-4" />}
            {work.file_type === 'video' && <Play className="w-4 h-4" />}
            {work.file_type === 'audio' && <Volume2 className="w-4 h-4" />}
            {work.file_type === 'document' && <FileText className="w-4 h-4" />}
            {work.file_type === 'web' && <Globe className="w-4 h-4" />}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Description */}
          <div>
            <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
              {work.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 mt-1">
              {work.description}
            </p>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={work.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                {work.profiles?.username?.[0]?.toUpperCase() || '用'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-400 text-sm">
              {work.profiles?.username || '匿名用户'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              {/* Vote Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVote}
                disabled={voted || isVoting}
                className={`flex items-center space-x-1 transition-all duration-200 ${
                  voted 
                    ? 'text-red-400 hover:text-red-400' 
                    : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${voted ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{voteCount}</span>
              </Button>

              {/* Comments */}
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/work/${work.id}`)
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">0</span>
              </Button>
            </div>

            {/* Share */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                if (navigator.share) {
                  navigator.share({
                    title: work.title,
                    text: work.description,
                    url: `${window.location.origin}/work/${work.id}`
                  })
                } else {
                  // Fallback for browsers that don't support Web Share API
                  navigator.clipboard?.writeText(`${work.title}: ${work.description} - ${window.location.origin}/work/${work.id}`)
                  alert('链接已复制到剪贴板！')
                }
              }}
              className="text-gray-400 hover:text-green-400 hover:bg-green-400/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
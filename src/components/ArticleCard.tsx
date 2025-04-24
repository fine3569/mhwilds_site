import React from 'react'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

type ArticleCardProps = {
  post: {
    slug: string
    title: string
    excerpt: string
    date: string
  }
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardActionArea component={Link} href={`/articles/${post.slug}`}>    
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {post.date}
        </Typography>
        <Typography variant="body2" noWrap>
          {post.excerpt}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
)

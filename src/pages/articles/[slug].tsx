import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { Layout } from '../../components/Layout'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// FrontMatter の型定義
type FrontMatter = {
  title: string
  date:  string
}

type Props = {
  source: MDXRemoteSerializeResult
  frontMatter: FrontMatter
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const articlesDir = path.join(process.cwd(), 'src/content/articles')
  const files = fs.readdirSync(articlesDir)
  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.mdx?$/, '') },
  }))
  return { paths, fallback: 'blocking' }  // 新規記事追加後も動的に生成
}

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({ params }) => {
  const slug = params!.slug
  const filePath = path.join(process.cwd(), 'src/content/articles', `${slug}.mdx`)
  if (!fs.existsSync(filePath)) {
    return { notFound: true }
  }
  const fileContents = fs.readFileSync(filePath, 'utf-8')

  const matterResult = matter(fileContents)
  const data = matterResult.data as FrontMatter
  const content = matterResult.content

  const mdxSource = await serialize(content, { scope: data })

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
    revalidate: 10,  // ISR: 10秒ごとに再生成可能
  }
}

const ArticlePage: React.FC<Props> = ({ source, frontMatter }) => (
  <Layout>
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        {frontMatter.title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {frontMatter.date}
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Box
        component="article"
        sx={{
          '& img': { maxWidth: '100%', borderRadius: 1, boxShadow: 1 },
          '& h2': { mt: 4, mb: 2 },
          '& h3': { mt: 3, mb: 1.5 },
          '& p': { mb: 2, lineHeight: 1.6 },
        }}
      >
        <MDXRemote {...source} />
      </Box>
    </Paper>
  </Layout>
)

export default ArticlePage

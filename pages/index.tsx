// pages/index.tsx

import { GetStaticProps } from 'next'
import Link from 'next/link'

// ← ここを default import に
import Grid from '@mui/material/Grid'
import { Typography, Card, CardActionArea, CardContent } from '@mui/material'

import Layout from '@/components/Layout'
import { getAllSkills, SkillMeta } from '@/lib/mdx'

type HomeProps = {
  latestSkills: SkillMeta[]
}

export default function Home({ latestSkills }: HomeProps) {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        ようこそ！
      </Typography>

      <Typography variant="h5" gutterBottom>
        最新の検証記事
      </Typography>

      {/* container プロップが効く Grid */}
      <Grid container spacing={2}>
        {latestSkills.map(({ slug, title }) => (
          // item プロップが効く Grid
          <Grid key={slug} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardActionArea component={Link} href={`/skills/${slug}`}>
                <CardContent>
                  <Typography>{title}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const all = getAllSkills().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return { props: { latestSkills: all.slice(0, 3) } }
}

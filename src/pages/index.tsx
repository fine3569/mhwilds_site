// src/pages/index.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GetStaticProps } from 'next';
import { Layout } from '../components/Layout';
import { ArticleCard } from '../components/ArticleCard';
import { Box, Card, CardActionArea, CardContent, Container, Grid, Link, Typography } from '@mui/material';

type Post = { slug: string; title: string; excerpt: string; date: string };

export const getStaticProps: GetStaticProps = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'src/content/articles'));
  const posts: Post[] = files.map(filename => {
    const mdWithMeta = fs.readFileSync(path.join('src/content/articles', filename), 'utf-8');
    const { data, content } = matter(mdWithMeta);
    return {
      slug: filename.replace(/\.mdx?$/, ''),
      title: data.title,
      excerpt: content.slice(0, 120) + '…',
      date: data.date
    };
  });
  // 日付降順ソート
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { props: { posts } };
};

const HomePage: React.FC<{ posts: Post[] }> = ({ posts }) => (
  <Layout>
    {/* ヒーローセクション */}
    <Container maxWidth="md">
      <Box
          sx={{
            bgcolor: 'HeroSection',
            py: { xs: 3, md: 6 },
            px: { xs: 2, md: 3 },
            mb: 6,
            textAlign: 'center',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        MHWilds 個人的攻略まとめへようこそ
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto' }}>
          当サイトでは、MHWildsのスキル効果などについての情報をまとめています。
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto' }}>
          記事を読む前に以下のポイントにご注意ください：
        </Typography>
        <Box component="ul" sx={{ mt: 2, textAlign: 'left', maxWidth: 600, mx: 'auto', pl: 2 }}>
          <Typography component="li" variant="body2">
            記事内の情報は執筆時点のものです。
          </Typography>
          <Typography component="li" variant="body2">
            記事の内容は計算に基づくものが多々存在するため、実際のゲームプレイと異なる場合があります。
          </Typography>
          <Typography component="li" variant="body2">
            不明点や追加情報は
              <Link href="https://x.com/rei_fine_" target="_blank" rel="noopener noreferrer" underline="hover">
                作者Twitter
              </Link>
            までご連絡ください。
          </Typography>
        </Box>
      </Box>
    </Container>

    {/* 記事一覧 */}
    <Container maxWidth="md" sx={{ mb: 6 }}>
      {posts.length === 0 ? (
        <Typography variant="h6" align="center">
          まだ記事が投稿されていません。
        </Typography>
      ) : (
        <Grid container spacing={4}>
            {posts.map((post) => (
              <Grid key={post.slug} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea component={Link} href={`/articles/${post.slug}` as any}>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        更新日：{post.date}
                      </Typography>
                      <Typography variant="body1" noWrap>
                        {post.excerpt}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
      )}
    </Container>
  </Layout>
)

export default HomePage



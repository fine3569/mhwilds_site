// src/pages/index.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GetStaticProps } from 'next';
import { Layout } from '../components/Layout';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

export const getStaticProps: GetStaticProps = async () => {
  const dir = path.join(process.cwd(), 'src/content/articles');
  const files = fs.readdirSync(dir);

  const posts: Post[] = files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug: filename.replace(/\.mdx?$/, ''),
      title: data.title,
      excerpt: content.slice(0, 120) + '…',
      date: data.date,
    };
  });

  // 日付降順ソート
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  return { props: { posts } };
};

const HomePage: React.FC<{ posts: Post[] }> = ({ posts }) => (
  <Layout>
    {/* ヒーローセクション */}
    <Container maxWidth="md" sx={{ mb: 6 }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          py: { xs: 3, md: 6 },
          px: { xs: 2, md: 3 },
          borderRadius: 1,
          boxShadow: 1,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          MHWilds 個人的攻略まとめへようこそ
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto' }}>
          当サイトでは、MHWildsのスキル効果などについての情報をまとめています。
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto' }}>
          記事を読む前に以下のポイントにご注意ください：
        </Typography>
        <Box
          component="ul"
          sx={{ mt: 2, textAlign: 'left', maxWidth: 600, mx: 'auto', pl: 2 }}
        >
          <Typography component="li" variant="body2">
            記事内の情報は執筆時点のものです。
          </Typography>
          <Typography component="li" variant="body2">
            記事の内容は計算に基づくものが多々存在するため、実際のゲームプレイと異なる場合があります。
          </Typography>
          <Typography component="li" variant="body2">
            不明点や追加情報は
            <Link
              href="https://x.com/rei_fine_"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
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
        <Box
          component="section"
          sx={{
            display: 'grid',
            // auto-fit + minmax で、カード数が1つでも幅いっぱいに伸びるように
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(280px, 1fr))',
            },
            gap: 4,
          }}
        >
          {posts.map((post) => (
            <Card
              key={post.slug}
              sx={{
                border: (theme) => `1px solid ${theme.palette.grey[300]}`,
                borderRadius: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardActionArea href={`/articles/${post.slug}`} component={Link}>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    更新日：{post.date}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  </Layout>
);

export default HomePage;

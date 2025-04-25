// src/pages/articles/[slug].tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Layout } from '../../components/Layout';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

type FrontMatter = {
  title: string;
  date: string;
};

type Props = {
  source: MDXRemoteSerializeResult;
  frontMatter: FrontMatter;
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const articlesDir = path.join(process.cwd(), 'src/content/articles');
  const files = fs.readdirSync(articlesDir);
  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.mdx?$/, '') },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({ params }) => {
  const slug = params!.slug;
  const filePath = path.join(process.cwd(), 'src/content/articles', `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const matterResult = matter(fileContents);
  const data = matterResult.data as FrontMatter;
  const content = matterResult.content;
  const mdxSource = await serialize(content, { scope: data });

  return {
    props: { source: mdxSource, frontMatter: data },
    revalidate: 10,
  };
};

const ArticlePage: React.FC<Props> = ({ source, frontMatter }) => (
  <Layout>
    <Container maxWidth="md" sx={{ my: { xs: 4, md: 6 } }}>
      {/* タイトルセクション */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.02em',
            mb: 1,
          }}
        >
          {frontMatter.title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {frontMatter.date}
        </Typography>
      </Box>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
        {/* アクセントカラーの太い仕切り線 */}
        <Divider
          sx={{
            borderColor: 'primary.main',
            borderWidth: 2,
            mb: 4,
          }}
        />

        {/* Markdown 本文 */}
        <Box
          component="article"
          sx={{
            '& img': {
              maxWidth: '100%',
              borderRadius: 1,
              boxShadow: 1,
              my: 3,
            },
            '& h2': {
              mt: 4,
              mb: 2,
              borderBottom: '2px solid',
              borderColor: 'divider',
              pb: 1,
            },
            '& h3': {
              mt: 3,
              mb: 1.5,
              color: 'text.primary',
            },
            '& p': {
              mb: 2,
              lineHeight: 1.8,
            },
            '& ul, & ol': {
              pl: 3,
              mb: 2,
            },
            '& li': {
              mb: 1,
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.light',
              pl: 2,
              color: 'text.secondary',
              fontStyle: 'italic',
              bgcolor: 'background.default',
              mb: 2,
            },
            '& pre': {
              bgcolor: 'grey.900',
              color: '#fff',
              borderRadius: 1,
              overflowX: 'auto',
              p: 2,
              mb: 3,
            },
            '& code': {
              fontFamily: 'source-code-pro, monospace',
              backgroundColor: 'grey.100',
              borderRadius: 0.5,
              px: 0.5,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          <MDXRemote {...source} />
        </Box>
      </Paper>
    </Container>
  </Layout>
);

export default ArticlePage;

// src/pages/articles/[slug].tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Layout } from '../../components/Layout';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { MdxContainer } from '../../components/MdxContainer';

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
    props: {
      source: mdxSource,
      frontMatter: data,
    },
    revalidate: 10,
  };
};

const ArticlePage: React.FC<Props> = ({ source, frontMatter }) => (
  <Layout>
    <Container maxWidth="md" sx={{ my: { xs: 4, md: 6 } }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: '0.02em', mb: 1 }}>
          {frontMatter.title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {frontMatter.date}
        </Typography>
      </Box>

      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
        <Divider sx={{ borderColor: 'primary.main', borderWidth: 2, mb: 4 }} />

        <MdxContainer>
          <MDXRemote {...source} />
        </MdxContainer>
      </Paper>
    </Container>
  </Layout>
);

export default ArticlePage;

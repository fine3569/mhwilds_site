import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Container, Typography, Box } from '@mui/material';
import Layout from '@/components/Layout';
import { getSkillSlugs, getSkillBySlug } from '@/lib/mdx';

type Props = {
  frontMatter: { title: string; date: string };
  mdxSource: MDXRemoteSerializeResult;
};

export default function SkillPage({ frontMatter, mdxSource }: Props) {
  const components = {
    h1: (props: any) => <Typography variant="h4" gutterBottom {...props} />,
    h2: (props: any) => <Typography variant="h5" gutterBottom {...props} />,
    p: (props: any) => <Typography variant="body1" paragraph {...props} />,
    ul: (props: any) => <Box component="ul" sx={{ pl: 4, mb: 2 }} {...props} />,
    code: (props: any) => (
      <Box
        component="code"
        sx={{
          display: 'block',
          fontFamily: 'Monospace',
          bgcolor: 'grey.100',
          p: 1,
          borderRadius: 1,
          my: 2,
        }}
        {...props}
      />
    ),
  };

  return (
    <Layout>
      <Typography variant="h3" gutterBottom>
        {frontMatter.title}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        {frontMatter.date}
      </Typography>
      <MDXRemote {...mdxSource} components={components} />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getSkillSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { frontMatter, mdxSource } = await getSkillBySlug(params!.slug as string);
  return { props: { frontMatter, mdxSource } };
};

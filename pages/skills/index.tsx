import { GetStaticProps } from 'next';
import Link from 'next/link';
import { Grid, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import Layout from '@/components/Layout';
import { getAllSkills, SkillMeta } from '@/lib/mdx';

type Props = {
  skills: SkillMeta[];
};

export default function SkillsIndex({ skills }: Props) {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        スキル検証記事一覧
      </Typography>

      <Grid container spacing={2}>
        {skills.map(({ slug, title, date }) => (
          <Grid key={slug} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardActionArea component={Link} href={`/skills/${slug}`}>
                <CardContent>
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="caption" display="block">
                    {date}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const skills = getAllSkills().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return { props: { skills } };
};

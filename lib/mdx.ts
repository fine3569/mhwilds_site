// lib/mdx.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

const SKILLS_PATH = path.join(process.cwd(), 'content', 'skills');

export function getSkillSlugs(): string[] {
    return fs
      .readdirSync(SKILLS_PATH)
      .filter((file) => /\.(md|mdx)$/.test(file))
      .map((file) => file.replace(/\.(md|mdx)$/, ''));
}

export async function getSkillBySlug(slug: string) {
  const fullPath = path.join(SKILLS_PATH, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);
  const mdxSource = await serialize(content, { scope: data });
  return { frontMatter: data as Record<string, any>, mdxSource };
}

export type SkillMeta = { slug: string; title: string; date: string };

export function getAllSkills(): SkillMeta[] {
    const slugs = getSkillSlugs();  // string[] を返す同期関数
    return slugs.map((slug) => {
      const fullPath = path.join(SKILLS_PATH, `${slug}.md`);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(raw);
      return {
        slug,
        title: typeof data.title === 'string' ? data.title : slug,
        date: typeof data.date === 'string' ? data.date : '',
      };
    });
}

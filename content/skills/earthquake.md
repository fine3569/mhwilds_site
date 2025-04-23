---
title: "耐震スキルの検証"
date: "2025-04-24"
---

## 効果概要

・モーション値への補正  
・会心補正への影響

### 計算例

```ts
const motionValue = 1.2;
const rawAttack = 250;
const result = rawAttack / 100 * motionValue * 1.1;
console.log(result); // XYZ

---

## lib/mdx.ts

```ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

export type SkillMeta = { slug: string; title: string; date: string };

const SKILLS_PATH = path.join(process.cwd(), 'content', 'skills');

export function getSkillSlugs(): string[] {
  return fs
    .readdirSync(SKILLS_PATH)
    .filter((file) => /\.(md|mdx)$/.test(file))
    .map((file) => file.replace(/\.(md|mdx)$/, ''));
}

export function getAllSkills(): SkillMeta[] {
  const slugs = getSkillSlugs();
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

export async function getSkillBySlug(slug: string) {
  const fullPath = path.join(SKILLS_PATH, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);
  const mdxSource = await serialize(content, { scope: data });
  return { frontMatter: data as Record<string, any>, mdxSource };
}

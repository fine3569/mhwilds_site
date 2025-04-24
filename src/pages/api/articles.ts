import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = path.join(process.cwd(), 'src/content/articles');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  // GET: 一覧 or 詳細
  if (req.method === 'GET') {
    if (slug) {
      // 詳細取得
      const filePath = path.join(articlesDir, `${slug}.mdx`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '記事が見つかりません' });
      }
      const file = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(file);
      return res.status(200).json({ slug, title: data.title, date: data.date, content });
    } else {
      // 一覧取得
      const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
      const list = files.map((filename) => {
        const file = fs.readFileSync(path.join(articlesDir, filename), 'utf-8');
        const { data } = matter(file);
        return {
          slug: filename.replace(/\.mdx?$/, ''),
          title: data.title,
          date: data.date,
        };
      });
      // 日付降順
      list.sort((a, b) => (a.date < b.date ? 1 : -1));
      return res.status(200).json(list);
    }
  }

  // POST: 新規作成
  if (req.method === 'POST') {
    const { slug: newSlug, title, date, content } = req.body;
    if (!newSlug || !title || !date) {
      return res.status(400).json({ error: 'slug, title, date が必要です' });
    }
    const filePath = path.join(articlesDir, `${newSlug}.mdx`);
    if (fs.existsSync(filePath)) {
      return res.status(409).json({ error: '同名の slug が既に存在します' });
    }
    const md = matter.stringify(content, { title, date });
    fs.writeFileSync(filePath, md, 'utf-8');
    return res.status(201).json({ slug: newSlug });
  }

  // PUT: 更新
  if (req.method === 'PUT') {
    if (!slug) {
      return res.status(400).json({ error: 'slug が必要です' });
    }
    const { title, date, content } = req.body;
    const filePath = path.join(articlesDir, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '記事が見つかりません' });
    }
    const md = matter.stringify(content, { title, date });
    fs.writeFileSync(filePath, md, 'utf-8');
    return res.status(200).json({ slug });
  }

  // DELETE: 削除
  if (req.method === 'DELETE') {
    if (!slug) {
      return res.status(400).json({ error: 'slug が必要です' });
    }
    const filePath = path.join(articlesDir, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '記事が見つかりません' });
    }
    fs.unlinkSync(filePath);
    return res.status(200).json({ slug });
  }

  // その他は405
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

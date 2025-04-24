import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Layout } from '@/src/components/Layout';

interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
}
interface ArticleDetail extends ArticleMeta {
  content: string;
}

export default function ArticleManagerPage() {
  const [slug, setSlug] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [content, setContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch {
        setArticles([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const handleEdit = async (slugToEdit: string) => {
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slugToEdit)}`);
      const result = await res.json();
      if (!res.ok) throw new Error((result as any).error || '読み込み失敗');
      const data = result as ArticleDetail;
      setEditingSlug(slugToEdit);
      setSlug(data.slug);
      setTitle(data.title);
      setDate(dayjs(data.date));
      setContent(data.content);
      setMessage('');
      setIsSuccess(null);
    } catch (err: any) {
      alert(`記事読み込みエラー: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlug(null);
    setSlug('');
    setTitle('');
    setDate(dayjs());
    setContent('');
    setMessage('');
    setIsSuccess(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url = data.url as string;
      const alt = file.name;
      const start = contentRef.current?.selectionStart ?? content.length;
      const end = contentRef.current?.selectionEnd ?? content.length;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const mdImg = `![${alt}](${url})`;
      setContent(before + mdImg + after);
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.focus();
          const pos = start + mdImg.length;
          contentRef.current.selectionStart = contentRef.current.selectionEnd = pos;
        }
      });
    } catch {
      alert('画像アップロードに失敗しました');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!slug.trim() || !title.trim() || !date) {
      setMessage('slug, タイトル, 日付は必須です');
      setIsSuccess(false);
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editingSlug);
      const url = isEdit
        ? `/api/articles?slug=${encodeURIComponent(editingSlug!)}`
        : '/api/articles';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim(), title, date: date.format('YYYY-MM-DD'), content }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error((result as any).error || '保存に失敗しました');
      setIsSuccess(true);
      setMessage(isEdit ? '記事を更新しました' : '記事を作成しました');
      setArticles(prev =>
        isEdit
          ? prev.map(a =>
              a.slug === editingSlug
                ? { slug, title, date: date.format('YYYY-MM-DD') }
                : a
            )
          : [{ slug, title, date: date.format('YYYY-MM-DD') }, ...prev]
      );
      handleCancelEdit();
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(`エラー: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slugToDelete: string) => {
    if (!confirm(`記事「${slugToDelete}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slugToDelete)}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error((result as any).error || '削除に失敗しました');
      setArticles(prev => prev.filter(a => a.slug !== slugToDelete));
      if (editingSlug === slugToDelete) handleCancelEdit();
    } catch (err: any) {
      alert(`削除エラー: ${err.message}`);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {editingSlug ? '記事を編集' : '記事を管理'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item size={6}>
            <Paper sx={{ p: 3, mb: 4, h: 12 }} elevation={1}>
              <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  helperText="URL の /articles/[slug] になります"
                  fullWidth
                  disabled={Boolean(editingSlug)}
                />
                <TextField label="タイトル" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="日付"
                    value={date}
                    onChange={newDate => setDate(newDate)}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{ textField: TextField }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
                <Box>
                  <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                    画像を挿入
                  </Button>
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />
                </Box>
                <TextField
                  label="本文 (MDX)"
                  multiline
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  fullWidth
                  inputRef={contentRef}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  {editingSlug && (
                    <Button onClick={handleCancelEdit} disabled={saving}>
                      キャンセル
                    </Button>
                  )}
                  <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                    {saving ? '保存中…' : editingSlug ? '更新する' : '新規作成'}
                  </Button>
                </Box>
                {message && (
                  <Typography color={isSuccess ? 'success.main' : 'error.main'}>{message}</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item size={6}>
            <Paper sx={{ p: 2 }} variant="outlined">
              <Typography variant="h6" gutterBottom>
                プレビュー
              </Typography>
              <Box sx={{ '& img': { maxWidth: '100%', borderRadius: 1, boxShadow: 1 }, '& h2': { mt: 2, mb: 1 } }}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]} children={content || '_ここにMDXを入力すると表示されます_'}/>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          既存の記事一覧
        </Typography>
        <Grid container spacing={2}>
          {loadingList
            ? [1, 2, 3].map(i => (
                <Grid item xs={12} key={i}>
                  <Skeleton variant="rectangular" height={60} />
                </Grid>
              ))
            : articles.map(a => (
                <Grid item xs={12} sm={6} key={a.slug}>
                  <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'} }>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{a.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleEdit(a.slug)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(a.slug)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
        </Grid>
      </Container>
    </Layout>
  );
}

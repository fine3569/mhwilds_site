import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
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
import { MdxContainer } from '@/src/components/MdxContainer';
import { Popper, List, ListItemButton, ListItemText } from '@mui/material';

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

  // --- 共通: 画像アップロード＋挿入 ---
  const insertImageFile = async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      const alt = file.name;
      const textarea = contentRef.current!;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const mdImg = `![${alt}](${url})`;
      setContent(before + mdImg + after);
      setTimeout(() => {
        textarea.focus();
        const pos = start + mdImg.length;
        textarea.selectionStart = textarea.selectionEnd = pos;
      });
    } catch {
      alert('画像アップロードに失敗しました');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Paste された画像を検知 ---
  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = e => {
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile()!;
        insertImageFile(file);
        break;
      }
    }
  };

  // 記事一覧取得
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

  // 編集
  const handleEdit = async (slugToEdit: string) => {
    try {
      const res = await fetch(
        `/api/articles?slug=${encodeURIComponent(slugToEdit)}`
      );
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

  // キャンセル
  const handleCancelEdit = () => {
    setEditingSlug(null);
    setSlug('');
    setTitle('');
    setDate(dayjs());
    setContent('');
    setMessage('');
    setIsSuccess(null);
  };

  // 新規 or 更新
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
        body: JSON.stringify({
          slug: slug.trim(),
          title,
          date: date.format('YYYY-MM-DD'),
          content,
        }),
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

  // 削除
  const handleDelete = async (slugToDelete: string) => {
    if (!confirm(`記事「${slugToDelete}」を削除しますか？`)) return;
    try {
      const res = await fetch(
        `/api/articles?slug=${encodeURIComponent(slugToDelete)}`,
        { method: 'DELETE' }
      );
      const result = await res.json();
      if (!res.ok) throw new Error((result as any).error || '削除に失敗しました');
      setArticles(prev => prev.filter(a => a.slug !== slugToDelete));
      if (editingSlug === slugToDelete) handleCancelEdit();
    } catch (err: any) {
      alert(`削除エラー: ${err.message}`);
    }
  };

  // スラッシュコマンド用
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashAnchorEl, setSlashAnchorEl] = useState<HTMLElement | null>(null);
  const [slashPosition, setSlashPosition] = useState<number>(0);
  const commands = [
    { label: '改行(<br />)', insert: '<br />' },
    { label: 'コードブロック挿入', insert: '```ini\n\n```' },
  ];

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    if (e.key === '/' && contentRef.current) {
      const textarea = contentRef.current;
      const pos = textarea.selectionStart;
      setSlashPosition(pos);
      setSlashAnchorEl(textarea);
      setSlashOpen(true);
      e.preventDefault();
    }
    if (e.key === 'Escape' && slashOpen) {
      setSlashOpen(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {editingSlug ? '記事を編集' : '記事を管理'}
        </Typography>

        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            mb: 4,
          }}
        >
          <Paper sx={{ p: 3 }} elevation={1}>
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

              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="本文 (MDX)"
                  multiline
                  minRows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  fullWidth
                  inputRef={contentRef}
                />

                <Popper
                  open={slashOpen}
                  anchorEl={slashAnchorEl}
                  placement="bottom-start"
                  style={{ zIndex: 1300 }}
                >
                  <Paper elevation={3}>
                    <List dense>
                      {commands.map((cmd, i) => (
                        <ListItemButton
                          key={i}
                          onClick={() => {
                            const before = content.slice(0, slashPosition);
                            const after = content.slice(slashPosition);
                            setContent(before + cmd.insert + after);
                            setSlashOpen(false);
                            setTimeout(() => {
                              if (contentRef.current) {
                                const newPos = slashPosition + cmd.insert.length;
                                contentRef.current.selectionStart = newPos;
                                contentRef.current.selectionEnd   = newPos;
                                contentRef.current.focus();
                              }
                            });
                          }}
                        >
                          <ListItemText primary={cmd.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                </Popper>
              </Box>

              {/* アクションボタン群 */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  画像を挿入
                </Button>
                {editingSlug && (
                  <Button onClick={handleCancelEdit} disabled={saving}>
                    キャンセル
                  </Button>
                )}
                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                  {saving ? '保存中…' : editingSlug ? '更新する' : '新規作成'}
                </Button>
              </Box>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) insertImageFile(file);
                }}
              />

              {message && (
                <Typography color={isSuccess ? 'success.main' : 'error.main'}>
                  {message}
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography variant="h6" gutterBottom>
              プレビュー
            </Typography>
            <MdxContainer>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                children={content || '_ここにMDXを入力すると表示されます_'}
              />
            </MdxContainer>
          </Paper>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          既存の記事一覧
        </Typography>

        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {loadingList
            ? [1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={60} width="100%" />
              ))
            : articles.map(a => (
                <Paper
                  key={a.slug}
                  variant="outlined"
                  sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {a.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.date}
                    </Typography>
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
              ))}
        </Box>
      </Container>
    </Layout>
  );
}

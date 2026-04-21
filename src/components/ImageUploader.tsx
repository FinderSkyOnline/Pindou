import { useRef, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface Props {
  onImageLoaded: (objectUrl: string) => void;
}

export default function ImageUploader({ onImageLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const prevUrl = useRef<string | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    const url = URL.createObjectURL(file);
    prevUrl.current = url;
    onImageLoaded(url);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <Paper
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      sx={{
        width: '100%',
        maxWidth: 440,
        p: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: dragging ? 'primary.main' : 'divider',
        bgcolor: dragging ? 'rgba(79,195,247,0.06)' : 'background.paper',
        transition: 'border-color 0.2s, background-color 0.2s',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(79,195,247,0.06)' },
      }}
    >
      <UploadFileIcon sx={{ fontSize: 40, color: dragging ? 'primary.main' : 'text.secondary' }} />
      <Typography variant="body1" color={dragging ? 'primary.main' : 'text.primary'}>
        点击或拖拽图片到此处
      </Typography>
      <Typography variant="caption" color="text.secondary">
        支持 JPG、PNG、WebP 等常见格式
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </Paper>
  );
}

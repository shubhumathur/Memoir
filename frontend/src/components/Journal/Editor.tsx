import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../ui/Button';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function Editor({
  content,
  onChange,
  onSave,
  isLoading = false,
  placeholder = 'How are you feeling today? Write about your day...',
}: EditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          className="bg-white dark:bg-gray-800"
          style={{ minHeight: '200px' }}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave} isLoading={isLoading} disabled={!content.trim()}>
          Save Entry
        </Button>
      </div>
    </div>
  );
}


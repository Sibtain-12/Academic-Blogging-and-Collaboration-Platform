import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import QuillBetterTable from 'quill-better-table';
import 'quill-better-table/dist/quill-better-table.css';
import { blogsAPI, uploadAPI } from '../services/api';
import { toast } from 'react-toastify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import FindReplaceModal from '../components/FindReplaceModal';
import { PageBreak, SectionBreak } from '../utils/quillCustomBlots';

// Register KaTeX with Quill
window.katex = katex;

// Register Quill Better Table module
Quill.register({
  'modules/better-table': QuillBetterTable
}, true);

// Register custom fonts
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'times-new-roman', 'calibri', 'georgia', 'comic-sans', 'courier-new', 'verdana'];
Quill.register(Font, true);

// Register custom sizes
const Size = Quill.import('formats/size');
Size.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'];
Quill.register(Size, true);

// Register superscript and subscript
const Script = Quill.import('formats/script');
Quill.register(Script, true);

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const editorRef = useRef(null); // Reference to the div element
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const autoSaveTimer = useRef(null);

  // Document statistics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Find and Replace modal
  const [showFindReplace, setShowFindReplace] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  // Calculate document statistics
  useEffect(() => {
    if (content) {
      // Remove HTML tags and get plain text
      const plainText = content.replace(/<[^>]*>/g, '').trim();

      // Word count
      const words = plainText.split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);

      // Character count (including spaces)
      setCharCount(plainText.length);

      // Reading time (average 200 words per minute)
      const minutes = Math.ceil(words.length / 200);
      setReadingTime(minutes);
    } else {
      setWordCount(0);
      setCharCount(0);
      setReadingTime(0);
    }
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (title || content) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
    }
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [title, content, tags, project]);

  // Customize toolbar dropdown labels - Use CSS approach with data attributes
  useEffect(() => {
    const fontLabels = {
      '': 'Default Font',
      'arial': 'Arial',
      'times-new-roman': 'Times New Roman',
      'calibri': 'Calibri',
      'georgia': 'Georgia',
      'comic-sans': 'Comic Sans',
      'courier-new': 'Courier New',
      'verdana': 'Verdana'
    };

    const sizeLabels = {
      '': 'Normal',
      '8px': '8px',
      '10px': '10px',
      '12px': '12px',
      '14px': '14px',
      '16px': '16px',
      '18px': '18px',
      '20px': '20px',
      '24px': '24px',
      '28px': '28px',
      '32px': '32px',
      '36px': '36px',
      '48px': '48px',
      '72px': '72px'
    };

    const updateDropdownLabels = () => {
      // Update font dropdown
      const fontPicker = document.querySelector('.ql-font');
      if (fontPicker) {
        const fontOptions = fontPicker.querySelectorAll('.ql-picker-item');
        fontOptions.forEach(item => {
          const value = item.getAttribute('data-value') || '';
          if (fontLabels[value]) {
            item.setAttribute('data-label', fontLabels[value]);
          }
        });

        const fontLabel = fontPicker.querySelector('.ql-picker-label');
        if (fontLabel) {
          const currentValue = fontLabel.getAttribute('data-value') || '';
          fontLabel.setAttribute('data-label', fontLabels[currentValue] || 'Default Font');
        }
      }

      // Update size dropdown
      const sizePicker = document.querySelector('.ql-size');
      if (sizePicker) {
        const sizeOptions = sizePicker.querySelectorAll('.ql-picker-item');
        sizeOptions.forEach(item => {
          const value = item.getAttribute('data-value') || '';
          if (sizeLabels[value]) {
            item.setAttribute('data-label', sizeLabels[value]);
          }
        });

        const sizeLabel = sizePicker.querySelector('.ql-picker-label');
        if (sizeLabel) {
          const currentValue = sizeLabel.getAttribute('data-value') || '';
          sizeLabel.setAttribute('data-label', sizeLabels[currentValue] || 'Normal');
        }
      }
    };

    // Initial update after a delay
    const timer = setTimeout(updateDropdownLabels, 150);

    // Watch for changes in the editor (when user selects different font/size)
    const observer = new MutationObserver(() => {
      updateDropdownLabels();
    });

    // Observe the toolbar for changes
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      observer.observe(toolbar, {
        attributes: true,
        attributeFilter: ['data-value'],
        subtree: true
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []); // Run once on mount

  // Keyboard shortcut for Find and Replace (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      // Close modal on Escape
      if (e.key === 'Escape' && showFindReplace) {
        setShowFindReplace(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFindReplace]);

  // Add tooltips to toolbar buttons
  useEffect(() => {
    const timer = setTimeout(() => {
      const tooltips = {
        // Format buttons
        '.ql-bold': 'Bold',
        '.ql-italic': 'Italic',
        '.ql-underline': 'Underline',
        '.ql-strike': 'Strikethrough',
        '.ql-blockquote': 'Blockquote',
        '.ql-code-block': 'Code Block',
        '.ql-link': 'Insert Link',
        '.ql-image': 'Insert Image',
        '.ql-video': 'Insert Video',
        '.ql-formula': 'Insert Formula',
        '.ql-clean': 'Clear Formatting',

        // Custom buttons
        '.ql-pageBreak': 'Insert Page Break',
        '.ql-sectionBreak': 'Insert Section Break',
        '.ql-findReplace': 'Find and Replace (Ctrl+F)',

        // List and indent
        '.ql-list[value="ordered"]': 'Numbered List',
        '.ql-list[value="bullet"]': 'Bullet List',
        '.ql-indent[value="-1"]': 'Decrease Indent',
        '.ql-indent[value="+1"]': 'Increase Indent',

        // Script
        '.ql-script[value="sub"]': 'Subscript',
        '.ql-script[value="super"]': 'Superscript',

        // Align
        '.ql-align[value=""]': 'Align Left',
        '.ql-align[value="center"]': 'Align Center',
        '.ql-align[value="right"]': 'Align Right',
        '.ql-align[value="justify"]': 'Justify',

        // Dropdowns
        '.ql-header .ql-picker-label': 'Heading Style',
        '.ql-font .ql-picker-label': 'Font Family',
        '.ql-size .ql-picker-label': 'Font Size',
        '.ql-color .ql-picker-label': 'Text Color',
        '.ql-background .ql-picker-label': 'Background Color',
      };

      Object.entries(tooltips).forEach(([selector, title]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.setAttribute('title', title);
        });
      });
    }, 200); // Wait for toolbar to be fully rendered

    return () => clearTimeout(timer);
  }, []);

  // Enable image resizing
  useEffect(() => {
    let selectedImage = null;
    let resizeHandle = null;

    const createResizeHandle = () => {
      if (resizeHandle) {
        resizeHandle.remove();
      }

      resizeHandle = document.createElement('div');
      resizeHandle.className = 'image-resize-handle';
      resizeHandle.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: #4299e1;
        border: 3px solid white;
        border-radius: 50%;
        cursor: nwse-resize;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        pointer-events: auto;
      `;
      document.body.appendChild(resizeHandle);
      return resizeHandle;
    };

    const positionHandle = (img) => {
      if (!resizeHandle || !img) return;
      const rect = img.getBoundingClientRect();
      resizeHandle.style.left = `${rect.right - 10}px`;
      resizeHandle.style.top = `${rect.bottom - 10}px`;
      resizeHandle.style.display = 'block';
    };

    const hideHandle = () => {
      if (resizeHandle) {
        resizeHandle.style.display = 'none';
      }
      if (selectedImage) {
        selectedImage.classList.remove('resizing');
        selectedImage = null;
      }
    };

    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG' && e.target.closest('.ql-editor')) {
        e.preventDefault();
        e.stopPropagation();

        try {
          // Remove previous selection
          if (selectedImage) {
            selectedImage.classList.remove('resizing');
          }

          selectedImage = e.target;
          selectedImage.classList.add('resizing');

          if (!resizeHandle) {
            createResizeHandle();
          }

          positionHandle(selectedImage);
        } catch (error) {
          // Silently handle any selection errors
          console.warn('Image selection error:', error);
        }

        // Setup resize functionality
        let startX, startY, startWidth, startHeight;

        const onMouseDown = (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Prevent any zoom or scale behavior
          document.body.style.touchAction = 'none';
          document.body.style.userSelect = 'none';

          startX = e.clientX;
          startY = e.clientY;
          startWidth = selectedImage.offsetWidth;
          startHeight = selectedImage.offsetHeight;

          const onMouseMove = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const deltaX = e.clientX - startX;
            const newWidth = startWidth + deltaX;

            // Maintain aspect ratio
            const aspectRatio = startWidth / startHeight;
            const calculatedHeight = newWidth / aspectRatio;

            const finalWidth = Math.max(50, Math.min(newWidth, 1000));
            const finalHeight = Math.max(50, Math.min(calculatedHeight, 1000));

            selectedImage.style.width = `${finalWidth}px`;
            selectedImage.style.height = `${finalHeight}px`;
            selectedImage.setAttribute('width', finalWidth);
            selectedImage.setAttribute('height', finalHeight);

            positionHandle(selectedImage);
          };

          const onMouseUp = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Restore default behavior
            document.body.style.touchAction = '';
            document.body.style.userSelect = '';

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        };

        // Remove old listener and add new one
        resizeHandle.replaceWith(resizeHandle.cloneNode(true));
        resizeHandle = document.querySelector('.image-resize-handle');
        resizeHandle.addEventListener('mousedown', onMouseDown);
      }
    };

    const handleDocumentClick = (e) => {
      if (!e.target.closest('.ql-editor') ||
          (e.target.tagName !== 'IMG' && !e.target.classList.contains('image-resize-handle'))) {
        hideHandle();
      }
    };

    // Wait for editor to be ready
    const timer = setTimeout(() => {
      document.addEventListener('click', handleImageClick, true);
      document.addEventListener('click', handleDocumentClick);

      // Handle scroll to reposition handle
      window.addEventListener('scroll', () => {
        if (selectedImage) {
          positionHandle(selectedImage);
        }
      }, true);
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleImageClick, true);
      document.removeEventListener('click', handleDocumentClick);
      if (resizeHandle) {
        resizeHandle.remove();
      }
    };
  }, []);

  // Initialize Quill editor with vanilla Quill (not React wrapper)
  // This must be defined AFTER the handlers and modules
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Initialize Quill with the modules defined below
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        table: false,
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{
              font: [
                false,
                'arial',
                'times-new-roman',
                'calibri',
                'georgia',
                'comic-sans',
                'courier-new',
                'verdana'
              ]
            }],
            [{
              size: [
                false,
                '8px',
                '10px',
                '12px',
                '14px',
                '16px',
                '18px',
                '20px',
                '24px',
                '28px',
                '32px',
                '36px',
                '48px',
                '72px'
              ]
            }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ script: 'sub' }, { script: 'super' }],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video', 'formula'],
            ['pageBreak', 'sectionBreak', 'findReplace'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
            pageBreak: pageBreakHandler,
            sectionBreak: sectionBreakHandler,
            findReplace: findReplaceHandler,
            'code-block': codeBlockHandler,
          },
        },
        'better-table': {
          operationMenu: {
            items: {
              unmergeCells: { text: 'Unmerge cells' },
              insertColumnRight: { text: 'Insert column right' },
              insertColumnLeft: { text: 'Insert column left' },
              insertRowUp: { text: 'Insert row above' },
              insertRowDown: { text: 'Insert row below' },
              mergeCells: { text: 'Merge cells' },
              deleteColumn: { text: 'Delete column' },
              deleteRow: { text: 'Delete row' },
              deleteTable: { text: 'Delete table' }
            }
          }
        },
        keyboard: {
          bindings: QuillBetterTable.keyboardBindings
        }
      },
      placeholder: 'Start writing your academic document here... Use the toolbar for formatting, tables, formulas, and more.',
    });

    // Set initial content
    if (content) {
      quill.root.innerHTML = content;
    }

    // Listen for text changes
    quill.on('text-change', () => {
      setContent(quill.root.innerHTML);
    });

    // Store quill instance in ref
    quillRef.current = quill;

    return () => {
      quillRef.current = null;
    };
  }, []); // Only run once on mount

  // Update content when fetched from API
  useEffect(() => {
    if (quillRef.current && content && !quillRef.current.hasFocus()) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== content) {
        quillRef.current.root.innerHTML = content;
      }
    }
  }, [content]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getBlog(id);
      const blog = response.data.blog;
      setTitle(blog.title);
      setContent(blog.content);
      setTags(blog.tags?.join(', ') || '');
      setProject(blog.project || '');
      setStatus(blog.status);
    } catch (error) {
      toast.error('Failed to fetch blog');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!title || !content) return;
    
    try {
      setSaving(true);
      const blogData = {
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        project,
        status: 'draft',
      };

      if (id) {
        await blogsAPI.updateBlog(id, blogData);
      } else {
        const response = await blogsAPI.createBlog(blogData);
        navigate(`/edit/${response.data.blog._id}`, { replace: true });
      }
    } catch (error) {
      console.error('Auto-save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (publishStatus) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    try {
      setLoading(true);
      const blogData = {
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        project,
        status: publishStatus,
      };

      if (id) {
        await blogsAPI.updateBlog(id, blogData);
        toast.success(`Blog ${publishStatus === 'published' ? 'published' : 'saved'} successfully!`);
      } else {
        await blogsAPI.createBlog(blogData);
        toast.success(`Blog ${publishStatus === 'published' ? 'published' : 'saved'} successfully!`);
      }
      navigate('/home');
    } catch (error) {
      toast.error('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert image URLs to base64
  const imageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      // Skip if already base64
      if (url.startsWith('data:')) {
        resolve(url);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 400;
          canvas.height = img.height || 300;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.95);
          console.log('✅ Image converted to base64:', url.substring(0, 50));
          resolve(base64);
        } catch (error) {
          console.error('❌ Canvas error:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('❌ Image load error for:', url, error);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  };

  // Helper function to process content and convert all images to base64
  const processContentForExport = async (htmlContent) => {
    console.log('🔄 Processing content for export...');
    console.log('📝 Original content length:', htmlContent.length);

    let processedContent = htmlContent;

    // More flexible regex to match img tags
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const matches = [...htmlContent.matchAll(imgRegex)];

    console.log('🖼️ Found', matches.length, 'images');

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const originalTag = match[0];
      const imgUrl = match[1];

      console.log(`Processing image ${i + 1}/${matches.length}:`, imgUrl.substring(0, 50));

      try {
        const base64 = await imageToBase64(imgUrl);
        const newTag = originalTag.replace(imgUrl, base64);
        processedContent = processedContent.replace(originalTag, newTag);
        console.log(`✅ Image ${i + 1} converted successfully`);
      } catch (error) {
        console.warn(`⚠️ Could not convert image ${i + 1} (${imgUrl}):`, error.message);
        // Keep original tag if conversion fails
      }
    }

    console.log('✅ Content processing complete');
    return processedContent;
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      console.log('📄 Starting PDF export...');
      toast.info('Processing images for PDF export...');

      // Process content to convert images to base64
      const processedContent = await processContentForExport(content);

      console.log('📝 Processed content length:', processedContent.length);

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <h1 style="font-size: 28px; margin-bottom: 10px;">${title}</h1>
          <p style="color: #666; margin-bottom: 20px;">
            ${project ? `Project: ${project} | ` : ''}
            ${tags ? `Tags: ${tags}` : ''}
          </p>
          <div style="line-height: 1.6;">${processedContent}</div>
        </div>
      `;

      console.log('🎨 Element created, starting html2pdf...');

      const opt = {
        margin: 1,
        filename: `${title || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      console.log('✅ PDF export completed');
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('❌ PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  // Helper function to parse HTML content and extract elements
  const parseHTMLContent = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    return doc.body;
  };

  // Helper function to convert image URL to base64 for Word
  const imageToBase64ForWord = (url) => {
    return new Promise((resolve, reject) => {
      // Skip if already base64
      if (url.startsWith('data:')) {
        const base64Data = url.split(',')[1];
        resolve(base64Data);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 400;
          canvas.height = img.height || 300;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.95);
          // Remove data:image/jpeg;base64, prefix for docx
          const base64Data = base64.split(',')[1];
          console.log('✅ Word image converted:', url.substring(0, 50));
          resolve(base64Data);
        } catch (error) {
          console.error('❌ Canvas error for Word:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('❌ Image load error for Word:', url, error);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  };

  // Helper function to convert HTML elements to docx elements
  const convertHTMLToDocxElements = async (htmlContent) => {
    const { ImageRun, Table, TableRow, TableCell, BorderStyle } = await import('docx');
    const elements = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    console.log('🔍 Parsing HTML content...');

    for (const node of doc.body.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          elements.push(new Paragraph({ text }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();

        if (tag === 'p') {
          const children = [];
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent;
              if (text) {
                children.push(new TextRun({ text }));
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childTag = child.tagName.toLowerCase();
              if (childTag === 'img') {
                // Handle images in paragraphs
                try {
                  const imgSrc = child.getAttribute('src');
                  console.log('🖼️ Found image in paragraph:', imgSrc?.substring(0, 50));

                  if (!imgSrc) {
                    console.warn('⚠️ Image has no src attribute');
                    children.push(new TextRun({ text: '[Image - no source]' }));
                    continue;
                  }

                  const imgWidth = parseInt(child.getAttribute('width')) || 300;
                  const imgHeight = parseInt(child.getAttribute('height')) || 200;

                  console.log('📐 Image dimensions:', imgWidth, 'x', imgHeight);

                  const base64 = await imageToBase64ForWord(imgSrc);
                  console.log('✅ Image embedded in paragraph');

                  children.push(new ImageRun({
                    data: base64,
                    transformation: {
                      width: imgWidth,
                      height: imgHeight,
                    },
                  }));
                } catch (error) {
                  console.warn('⚠️ Could not embed image:', error.message);
                  children.push(new TextRun({ text: '[Image - failed to embed]' }));
                }
              } else if (childTag === 'strong' || childTag === 'b') {
                children.push(new TextRun({
                  text: child.textContent,
                  bold: true,
                }));
              } else if (childTag === 'em' || childTag === 'i') {
                children.push(new TextRun({
                  text: child.textContent,
                  italics: true,
                }));
              } else if (childTag === 'u') {
                children.push(new TextRun({
                  text: child.textContent,
                  underline: {},
                }));
              } else if (childTag === 'span' && child.classList.contains('ql-formula')) {
                // Handle KaTeX formulas - render as text representation
                const formula = child.getAttribute('data-value') || child.textContent;
                children.push(new TextRun({
                  text: formula,
                  italics: true,
                }));
              } else {
                children.push(new TextRun({ text: child.textContent }));
              }
            }
          }
          if (children.length > 0) {
            elements.push(new Paragraph({ children }));
          }
        } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
          const level = parseInt(tag[1]);
          elements.push(new Paragraph({
            text: node.textContent,
            heading: HeadingLevel[`HEADING_${level}`],
          }));
        } else if (tag === 'img') {
          // Standalone images
          try {
            const imgSrc = node.getAttribute('src');
            console.log('🖼️ Found standalone image:', imgSrc?.substring(0, 50));

            if (!imgSrc) {
              console.warn('⚠️ Standalone image has no src attribute');
              elements.push(new Paragraph({ text: '[Image - no source]' }));
              continue;
            }

            const imgWidth = parseInt(node.getAttribute('width')) || 400;
            const imgHeight = parseInt(node.getAttribute('height')) || 300;

            console.log('📐 Standalone image dimensions:', imgWidth, 'x', imgHeight);

            const base64 = await imageToBase64ForWord(imgSrc);
            console.log('✅ Standalone image embedded');

            elements.push(new Paragraph({
              children: [new ImageRun({
                data: base64,
                transformation: {
                  width: imgWidth,
                  height: imgHeight,
                },
              })],
            }));
          } catch (error) {
            console.warn('⚠️ Could not embed standalone image:', error.message);
            elements.push(new Paragraph({ text: '[Image could not be embedded]' }));
          }
        } else if (tag === 'table') {
          // Handle tables
          const rows = [];
          for (const tr of node.querySelectorAll('tr')) {
            const cells = [];
            for (const td of tr.querySelectorAll('td, th')) {
              cells.push(new TableCell({
                children: [new Paragraph({ text: td.textContent })],
              }));
            }
            rows.push(new TableRow({ children: cells }));
          }
          if (rows.length > 0) {
            elements.push(new Table({
              rows,
              width: { size: 100, type: 'pct' },
            }));
          }
        } else if (tag === 'blockquote') {
          elements.push(new Paragraph({
            text: node.textContent,
            italics: true,
            indent: { left: 720 },
          }));
        } else if (tag === 'ul' || tag === 'ol') {
          for (const li of node.querySelectorAll('li')) {
            elements.push(new Paragraph({
              text: li.textContent,
              bullet: { level: 0 },
            }));
          }
        } else if (tag === 'br') {
          elements.push(new Paragraph({ text: '' }));
        }
      }
    }

    return elements;
  };

  // Export to Word
  const handleExportWord = async () => {
    try {
      console.log('📄 Starting Word export...');
      toast.info('Processing content for Word export...');

      const { ImageRun, Table, TableRow, TableCell } = await import('docx');

      // Convert HTML content to docx elements
      console.log('🔄 Converting HTML to docx elements...');
      const contentElements = await convertHTMLToDocxElements(content);
      console.log('✅ Converted', contentElements.length, 'elements');

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.HEADING_1,
            }),
            ...(project ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Project: ${project}`,
                  italics: true,
                }),
              ],
            })] : []),
            ...(tags ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Tags: ${tags}`,
                  italics: true,
                }),
              ],
            })] : []),
            new Paragraph({ text: '' }), // Empty line
            ...contentElements,
          ],
        }],
      });

      console.log('📦 Packing document...');
      const blob = await Packer.toBlob(doc);
      console.log('💾 Saving file...');
      saveAs(blob, `${title || 'document'}.docx`);
      console.log('✅ Word export completed');
      toast.success('Word document exported successfully!');
    } catch (error) {
      console.error('❌ Word export error:', error);
      toast.error('Failed to export Word document');
    }
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          const response = await uploadAPI.uploadImage(formData);
          const imageUrl = response.data.url;

          const quill = quillRef.current; // Vanilla Quill instance
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', imageUrl);
        } catch (error) {
          toast.error('Failed to upload image');
        }
      }
    };
  };

  // Page Break Handler
  const pageBreakHandler = () => {
    const quill = quillRef.current; // Vanilla Quill instance
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'pageBreak', true);
        quill.setSelection(range.index + 1);
      }
    }
  };

  // Section Break Handler
  const sectionBreakHandler = () => {
    const quill = quillRef.current; // Vanilla Quill instance
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'sectionBreak', true);
        quill.setSelection(range.index + 1);
      }
    }
  };

  // Find and Replace Handler
  const findReplaceHandler = () => {
    setShowFindReplace(true);
  };

  // Code Block Handler (to prevent selection errors)
  const codeBlockHandler = () => {
    const quill = quillRef.current; // Vanilla Quill instance
    if (!quill) return;

    try {
      const range = quill.getSelection();
      if (!range) return;

      // Get current format
      const format = quill.getFormat(range);
      const isCodeBlock = format['code-block'];

      // Use formatLine for block-level formatting (prevents range errors)
      if (range.length === 0) {
        // No selection - format current line
        quill.formatLine(range.index, 1, 'code-block', !isCodeBlock);
      } else {
        // Has selection - format all lines in selection
        quill.formatLine(range.index, range.length, 'code-block', !isCodeBlock);
      }
    } catch (error) {
      // Silently handle if editor is not ready
    }
  };

  if (loading && id) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {id ? 'Edit Academic Document' : 'Write New Academic Document'}
          </h1>
          <div className="flex items-center gap-4">
            {saving && <span className="text-sm text-gray-500">Auto-saving...</span>}
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2"
                title="Export to PDF"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={handleExportWord}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium text-sm flex items-center gap-2"
                title="Export to Word"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Word
              </button>
            </div>
          </div>
        </div>

        {/* Document Statistics */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{wordCount}</strong> words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{charCount}</strong> characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{readingTime}</strong> min read
                </span>
              </div>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              Academic Writing Mode
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., AI, Machine Learning, Research"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project/Category
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g., Final Year Project"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content *
              </label>
              <button
                type="button"
                onClick={() => {
                  try {
                    const quill = quillRef.current; // Vanilla Quill instance
                    if (!quill) {
                      toast.error('Editor not ready');
                      return;
                    }

                    // Focus the editor first
                    quill.focus();

                    const tableModule = quill.getModule('better-table');
                    if (!tableModule) {
                      toast.error('Table module not loaded');
                      return;
                    }

                    // Insert table at current cursor position
                    tableModule.insertTable(3, 3);

                    // Show success message
                    setTimeout(() => {
                      const tables = quill.root.querySelectorAll('table');
                      if (tables.length > 0) {
                        toast.success('Table inserted successfully!');
                      } else {
                        toast.error('Failed to insert table');
                      }
                    }, 100);

                  } catch (error) {
                    console.error('Error inserting table:', error);
                    toast.error('Failed to insert table: ' + error.message);
                  }
                }}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Insert Table (3x3)
              </button>
            </div>
            {/* Vanilla Quill Editor Container */}
            <div
              ref={editorRef}
              className="bg-white dark:bg-gray-700 rounded-lg"
              style={{ height: '500px', marginBottom: '60px' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Find and Replace Modal */}
      <FindReplaceModal
        isOpen={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        quillRef={quillRef}
      />
    </div>
  );
}


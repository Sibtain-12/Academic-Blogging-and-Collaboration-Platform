import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

// Page Break Blot
class PageBreak extends BlockEmbed {
  static blotName = 'pageBreak';
  static tagName = 'div';
  static className = 'page-break';

  static create() {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = '<hr class="page-break-line" /><span class="page-break-text">Page Break</span>';
    return node;
  }
}

// Section Break Blot
class SectionBreak extends BlockEmbed {
  static blotName = 'sectionBreak';
  static tagName = 'div';
  static className = 'section-break';

  static create() {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = '<hr class="section-break-line" /><span class="section-break-text">Section Break</span>';
    return node;
  }
}

// Register the custom blots
Quill.register({
  'formats/pageBreak': PageBreak,
  'formats/sectionBreak': SectionBreak,
}, true);

export { PageBreak, SectionBreak };


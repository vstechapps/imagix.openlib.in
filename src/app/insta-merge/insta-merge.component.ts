import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Clip {
  id: number;
  link: string;
  start: number;
  end: number;
  previewUrl: SafeResourceUrl | null;
}

type Layout = 'sequence' | 'side-by-side' | 'grid';

@Component({
  selector: 'app-insta-merge',
  standalone: true,
  templateUrl: './insta-merge.component.html',
})
export class InstaMergeComponent {
  clips: Clip[] = [
    { id: 1, link: '', start: 0, end: 12, previewUrl: null },
    { id: 2, link: '', start: 0, end: 8, previewUrl: null },
  ];
  layout: Layout = 'sequence';
  notice = '';
  private nextId = 3;

  constructor(private readonly sanitizer: DomSanitizer) {}

  addClip(): void {
    this.clips = [...this.clips, { id: this.nextId++, link: '', start: 0, end: 10, previewUrl: null }];
  }

  removeClip(id: number): void {
    if (this.clips.length > 1) this.clips = this.clips.filter((clip) => clip.id !== id);
  }

  updateLink(id: number, link: string): void {
    this.clips = this.clips.map((clip) => clip.id === id
      ? { ...clip, link, previewUrl: this.createPreviewUrl(link) }
      : clip);
  }

  async pasteLink(id: number): Promise<void> {
    this.clearNotice();
    try {
      const link = await navigator.clipboard.readText();
      if (!link.trim()) {
        this.notice = 'Your clipboard is empty. Copy an Instagram link first.';
        return;
      }
      this.updateLink(id, link.trim());
    } catch {
      this.notice = 'Clipboard access is unavailable. Paste the link into the field instead.';
    }
  }

  updateTime(id: number, field: 'start' | 'end', value: string): void {
    const seconds = Math.max(0, Number(value) || 0);
    this.clips = this.clips.map((clip) => clip.id === id ? { ...clip, [field]: seconds } : clip);
  }

  prepareMerge(): void {
    const filled = this.clips.filter((clip) => clip.link.trim());
    if (filled.length === 0) {
      this.notice = 'Add a reel link to get your edit started.';
      return;
    }
    const invalid = filled.find((clip) => !this.isInstagramLink(clip.link));
    if (invalid) {
      this.notice = 'Use a valid Instagram reel or post link for each clip.';
      return;
    }
    this.notice = `Your ${filled.length}-clip ${this.layout === 'sequence' ? 'sequence' : 'single-frame'} setup looks good. Video download is not available yet.`;
  }

  clearNotice(): void {
    this.notice = '';
  }

  private isInstagramLink(value: string): boolean {
    try {
      const url = new URL(value.trim());
      return ['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(url.hostname.toLowerCase());
    } catch {
      return false;
    }
  }

  private createPreviewUrl(value: string): SafeResourceUrl | null {
    if (!this.isInstagramLink(value)) return null;
    const url = new URL(value.trim());
    const match = url.pathname.match(/^\/(reel|reels|p)\/([A-Za-z0-9_-]+)/i);
    if (!match) return null;
    const kind = match[1].toLowerCase() === 'reels' ? 'reel' : match[1].toLowerCase();
    const embedUrl = `https://www.instagram.com/${kind}/${match[2]}/embed/`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}

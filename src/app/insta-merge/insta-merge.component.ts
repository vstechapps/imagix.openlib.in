import { Component } from '@angular/core';

interface Clip {
  id: number;
  link: string;
  start: number;
  end: number;
}

type Layout = 'sequence' | 'side-by-side' | 'grid';

@Component({
  selector: 'app-insta-merge',
  standalone: true,
  templateUrl: './insta-merge.component.html',
})
export class InstaMergeComponent {
  clips: Clip[] = [
    { id: 1, link: '', start: 0, end: 12 },
    { id: 2, link: '', start: 0, end: 8 },
  ];
  layout: Layout = 'sequence';
  notice = '';
  private nextId = 3;

  addClip(): void {
    this.clips = [...this.clips, { id: this.nextId++, link: '', start: 0, end: 10 }];
  }

  removeClip(id: number): void {
    if (this.clips.length > 1) this.clips = this.clips.filter((clip) => clip.id !== id);
  }

  updateLink(id: number, link: string): void {
    this.clips = this.clips.map((clip) => clip.id === id ? { ...clip, link } : clip);
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
    const invalid = filled.find((clip) => !/^https?:\/\/(www\.)?instagram\.com\//i.test(clip.link.trim()));
    if (invalid) {
      this.notice = 'Use a valid Instagram reel or post link for each clip.';
      return;
    }
    this.notice = `Your ${filled.length}-clip ${this.layout === 'sequence' ? 'sequence' : 'single-frame'} setup looks good. Video download is not available yet.`;
  }

  clearNotice(): void {
    this.notice = '';
  }
}

import { Component, ChangeDetectionStrategy, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Minimal ambient declarations (avoid TS errors for experimental APIs)
interface SpeechRecognition extends EventTarget {
    start(): void; stop(): void;
    continuous: boolean; interimResults: boolean; lang: string;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition, ev: any) => any) | null;
    onstart: ((this: SpeechRecognition, ev: any) => any) | null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const LanguageModel: any; // Experimental global

@Component({
    selector: 'lc-ai-assist',
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
  @if(aiSupported()) {
    <div class="ai-assist">
      <label class="ai-label">AI Assist</label>
      <div class="row">
        <textarea rows="2" [disabled]="aiBusy()" [ngModel]="aiInput()" (ngModelChange)="aiInput.set($event)" placeholder="Describe e.g. 'Angular date picker' or speak it..."></textarea>
        <div class="col actions">
          <button type="button" class="chip" (click)="runExtraction()" [disabled]="aiBusy()">@if(!aiBusy()){Extract}@if(aiBusy()){…}</button>
          <button type="button" class="chip" [class.active]="aiListening()" (click)="toggleListening()">@if(!aiListening()){🎙 Speak}@if(aiListening()){⏹ Stop}</button>
        </div>
      </div>
      @if(aiMessage()) { <div class="msg">{{ aiMessage() }}</div> }
    </div>
  } @else {
    <div class="ai-assist">
      <label class="ai-label">AI Assist</label>
      <div class="msg off">Experimental Prompt API unavailable in this browser.</div>
    </div>
  }
  `,
    styles: [`
    :host { display:block; }
    .ai-assist { margin-top:.75rem; display:flex; flex-direction:column; gap:.4rem; }
    .ai-label { font-size:.75rem; font-weight:600; letter-spacing:.5px; opacity:.85; }
    .row { display:flex; gap:.5rem; align-items:stretch; }
    textarea { flex:1; resize:vertical; background:rgba(15,23,42,.55); border:1px solid var(--border); border-radius:8px; padding:.55rem .65rem; color:var(--text); font:inherit; }
    textarea:focus { outline:none; border-color: color-mix(in srgb, var(--accent1) 60%, var(--accent2)); box-shadow:0 0 0 2px rgba(139,92,246,.25); }
    .actions { display:flex; flex-direction:column; gap:.5rem; }
    .chip { cursor:pointer; background:rgba(148,163,184,0.15); border:1px solid var(--border); padding:.45rem .65rem; border-radius:20px; font-size:.65rem; white-space:nowrap; }
    .chip.active { background:linear-gradient(90deg,var(--accent1),var(--accent2)); color:#fff; }
    .chip:disabled { opacity:.5; cursor:not-allowed; }
    .msg { font-size:.65rem; color:var(--muted); }
    .msg.off { color: var(--muted); font-style:italic; }
  `]
})
export class AiAssistComponent {
    frameworks = input<string[]>([]);
    extracted = output<{ framework: string; functionality: string }>();

    readonly aiSupported = signal(false);
    readonly aiBusy = signal(false);
    readonly aiMessage = signal<string | null>(null);
    readonly aiInput = signal('');
    readonly aiListening = signal(false);

    private session: any | null = null;
    private speech: SpeechRecognition | null = null;

    constructor() {
        queueMicrotask(() => this.checkSupport());
    }

    private async checkSupport() {
        try {
            if (!('LanguageModel' in globalThis)) { this.aiSupported.set(false); return; }
            // Touch params & availability just to confirm
            try { await LanguageModel.params?.(); } catch { /* ignore */ }
            const avail = await LanguageModel.availability?.();
            const status = typeof avail === 'string' ? avail : (avail?.available || '');
            if (status === 'unavailable' || status === 'no') { this.aiSupported.set(false); return; }
            this.aiSupported.set(true);
        } catch { this.aiSupported.set(false); }
    }

    private async ensureSession() {
        if (this.session) return this.session;
        if (!this.aiSupported()) throw new Error('AI unsupported');
        // Spec requires providing both temperature & topK or neither. Start with no params; fallback to explicit.
        try {
            this.session = await LanguageModel.create();
        } catch (e) {
            // Retry with explicit pairing if first attempt fails.
            this.session = await LanguageModel.create({ temperature: 0, topK: 40 });
        }
        return this.session;
    }

    async runExtraction() {
        const raw = this.aiInput().trim();
        if (!raw) { this.aiMessage.set('Describe what you need.'); return; }
        this.aiBusy.set(true); this.aiMessage.set('Thinking…');
        try {
            const session = await this.ensureSession();
            const instruction = `Extract a framework (from: ${this.frameworks()?.join(', ')}) and a functionality from the user sentence. ONLY return JSON like {"framework":"","functionality":""}. If unknown use empty strings.`;
            const prompt = `${instruction}\nUser: ${raw}`;
            const out = await session.prompt(prompt);
            let text = typeof out === 'string' ? out : (out?.output ?? '');
            let json: any;
            try { const m = text.match(/\{[\s\S]*\}/); if (m) json = JSON.parse(m[0]); } catch { /* ignore */ }
            if (!json) json = this.heuristic(raw);
            let fw: string = (json.framework || json.library || '').trim();
            let fn: string = (json.functionality || json.feature || '').trim();
            if (!fw) { fw = this.guessFramework(raw) || fw; }
            if (!fw || !fn) { this.aiMessage.set('Need both framework & functionality.'); return; }
            this.aiMessage.set(`Captured: ${fw} + ${fn}`);
            this.extracted.emit({ framework: fw, functionality: fn });
        } catch (e: any) {
            this.aiMessage.set('AI error: ' + (e?.message || e));
        } finally { this.aiBusy.set(false); }
    }

    private heuristic(text: string) {
        const lower = text.toLowerCase();
        const fw = this.frameworks()?.find(f => lower.includes(f.toLowerCase())) || '';
        let functionality = '';
        if (fw) {
            const idx = lower.indexOf(fw.toLowerCase());
            functionality = text.slice(idx + fw.length).replace(/^(for|to|with|library|component)/i, '').trim();
        } else {
            const m = lower.match(/for ([a-z0-9 \-]+)/i) || lower.match(/to ([a-z0-9 \-]+)/i);
            if (m) functionality = m[1].trim();
        }
        return { framework: fw, functionality };
    }
    private guessFramework(text: string) { return this.frameworks()?.find(f => new RegExp(`\\b${f.replace(/[-/\\]/g, '\\$&')}\\b`, 'i').test(text)); }

    toggleListening() {
        if (this.aiListening()) { this.stopListening(); return; }
        try {
            const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SR) { this.aiMessage.set('Speech not supported.'); return; }
            const rec: SpeechRecognition = new SR();
            this.speech = rec; rec.continuous = false; rec.interimResults = true; rec.lang = 'en-US';
            rec.onstart = () => {
                // Start fresh for a new voice query.
                this.aiInput.set('');
                this.aiListening.set(true);
                this.aiMessage.set('Listening…');
            };
            rec.onerror = (e: any) => { this.aiMessage.set('Mic error: ' + (e?.error || 'unknown')); this.aiListening.set(false); };
            rec.onend = () => {
                this.aiListening.set(false);
                // Auto-run extraction after a brief tick so final results are applied.
                const text = this.aiInput().trim();
                if (text && !this.aiBusy()) {
                    this.aiMessage.set('Processing voice input…');
                    setTimeout(() => { if (this.aiInput().trim()) this.runExtraction(); }, 60);
                } else if (!text) {
                    this.aiMessage.set('No speech captured.');
                }
            };
            rec.onresult = (ev: any) => {
                let final = '';
                for (let i = ev.resultIndex; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) final += r[0].transcript; }
                if (final) this.aiInput.set((this.aiInput() + ' ' + final).trim());
            };
            rec.start();
        } catch (e: any) { this.aiMessage.set('Mic start failed: ' + (e?.message || e)); }
    }
    private stopListening() { try { this.speech?.stop(); } catch { } }
}

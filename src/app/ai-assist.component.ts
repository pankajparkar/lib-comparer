import { Component, ChangeDetectionStrategy, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiSetupModalComponent } from './ai-setup-modal.component';

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
    imports: [FormsModule, AiSetupModalComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if(showSetupModal()) {
            <lc-ai-setup-modal (close)="showSetupModal.set(false)"></lc-ai-setup-modal>
        }
        
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
            @if(aiMessage()) { 
                <div class="msg">{{ aiMessage() }}</div> 
            }
            </div>
        } @else {
            <div class="ai-assist">
                <label class="ai-label">AI Assist</label>
                @if(hasLanguageModel()) {
                    <div class="setup-section">
                        <div class="setup-message">
                            <div class="setup-icon">🚀</div>
                            <div class="setup-content">
                                <h4>AI Assistant Available!</h4>
                                <p>Enable Chrome's Gemini Prompt API to use AI-powered library detection.</p>
                            </div>
                        </div>
                        <button type="button" class="setup-button" (click)="showSetupModal.set(true)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Enable AI Assistant
                        </button>
                    </div>
                } @else {
                    <div class="msg off">AI Assistant requires Chrome with Gemini Prompt API support.</div>
                }
            </div>
        }
    `,
    styles: [`
    :host { 
      display: block; 
      margin-top: var(--space-lg);
    }
    
    .ai-assist { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
    }
    
    .ai-label { 
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    
    .ai-label::before {
      content: '🤖';
      font-size: var(--font-size-base);
    }
    
    .row { 
      display: flex; 
      gap: var(--space-md); 
      align-items: stretch; 
    }
    
    textarea { 
      flex: 1; 
      resize: vertical; 
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      color: var(--color-text);
      font: inherit;
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
      transition: all var(--transition-normal);
      outline: none;
    }
    
    textarea:focus { 
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    
    textarea::placeholder {
      color: var(--color-text-subtle);
    }
    
    .actions { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-sm);
      min-width: 120px;
    }
    
    .chip { 
      cursor: pointer;
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      color: var(--color-text-muted);
      transition: all var(--transition-normal);
      text-align: center;
    }
    
    .chip:hover:not(:disabled) {
      background: var(--color-surface-hover);
      border-color: var(--color-border-strong);
      color: var(--color-text);
    }
    
    .chip.active { 
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-color: var(--color-primary);
      color: white;
    }
    
    .chip:disabled { 
      opacity: 0.5; 
      cursor: not-allowed;
    }
    
    .msg { 
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      padding: var(--space-sm);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    
    .msg.off { 
      color: var(--color-text-subtle);
      font-style: italic;
      background: transparent;
      border: none;
      padding: 0;
    }
    
    .setup-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    
    .setup-message {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light));
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-lg);
    }
    
    .setup-icon {
      font-size: var(--font-size-xl);
      flex-shrink: 0;
    }
    
    .setup-content h4 {
      margin: 0 0 var(--space-xs);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    
    .setup-content p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      line-height: var(--line-height-normal);
    }
    
    .setup-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-lg);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
    }
    
    .setup-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .setup-button:active {
      transform: translateY(0);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 640px) {
      .row {
        flex-direction: column;
        gap: var(--space-sm);
      }
      
      .actions {
        flex-direction: row;
        min-width: auto;
      }
      
      .chip {
        flex: 1;
      }
      
      .setup-message {
        flex-direction: column;
        text-align: center;
      }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      .ai-assist,
      textarea,
      .chip,
      .msg {
        border-width: 2px;
      }
      
      .setup-button {
        border: 2px solid var(--color-primary);
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      textarea,
      .chip {
        transition: none;
      }
      
      .setup-button:hover {
        transform: none;
      }
    }
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
    readonly showSetupModal = signal(false);

    private session: any | null = null;
    private speech: SpeechRecognition | null = null;

    constructor() {
        queueMicrotask(() => this.checkSupport());
    }

    readonly hasLanguageModel = signal(false);

    private async checkSupport() {
        try {
            if (!('LanguageModel' in globalThis)) { 
                this.hasLanguageModel.set(false);
                this.aiSupported.set(false); 
                return; 
            }
            
            this.hasLanguageModel.set(true);
            
            // Touch params & availability just to confirm
            try { await LanguageModel.params?.(); } catch { /* ignore */ }
            const avail = await LanguageModel.availability?.();
            const status = typeof avail === 'string' ? avail : (avail?.available || '');
            if (status === 'unavailable' || status === 'no') { 
                this.aiSupported.set(false); 
                return; 
            }
            this.aiSupported.set(true);
        } catch { 
            this.hasLanguageModel.set(false);
            this.aiSupported.set(false); 
        }
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
            const instruction = `You are an expert at extracting information from text. Your task is to extract the **functionality** and **framework** from the provided text and return the output as a JSON object.
                Important Rules:
                1. The value for 'functionality' and 'framework' must be distinct and not identical.
                2. The 'functionality' must be a specific component or feature (e.g., 'datepicker', 'charting'). It **must not** be a generic term like 'library', 'component', 'plugin', 'module', 'tool', etc.
                3. If a specific functionality is not mentioned, set the value of 'functionality' to 'null'.

                Examples:
                Text: "I want datepicker library in react"
                Output: {"functionality": "datepicker", "framework": "react"}

                Text: "datepicker component in react"
                Output: {"functionality": "datepicker", "framework": "react"}

                Text: "I am building a calendar component using moment.js in nodejs"
                Output: {"functionality": "calendar", "framework": "nodejs"}

                Text: "I want to use the lodash library with vue.js"
                Output: {"functionality": "lodash", "framework": "vue.js"}

                Text: "angular library for angular"
                Output: {"functionality": null, "framework": "angular"}

                Text: "What is the best react component for forms?"
                Output: {"functionality": "forms", "framework": "react"}

                Now, extract the functionality and framework from the following text: `;
            const prompt = `${instruction}\nUser: ${raw}`;
            const out = await session.prompt(prompt);
            let text = typeof out === 'string' ? out : (out?.output ?? '');
            let json: any;
            try { const m = text.match(/\{[\s\S]*\}/); if (m) json = JSON.parse(m[0]); } catch { /* ignore */ }
            // if (!json) json = this.heuristic(raw);
            if (!json.framework || !json.functionality) {
                this.aiMessage.set('Need both framework & functionality. Please try again.'); return;
            }
            let fw: string = (json.framework || '').trim();
            let fn: string = (json.functionality || '').trim();
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
            this.speech = rec;
            rec.continuous = false;
            rec.interimResults = true;
            rec.lang = 'en-US';
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

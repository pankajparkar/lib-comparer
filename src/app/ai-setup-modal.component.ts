import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';

@Component({
  selector: 'lc-ai-setup-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">🤖</span>
            <h2>Enable AI Assistant</h2>
          </div>
          <button type="button" class="close-button" (click)="close.emit()" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="intro-text">
            To use the AI assistant feature, you need to enable Chrome's experimental Gemini Prompt API. 
            Follow these simple steps:
          </p>
          
          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Open Chrome Flags</h3>
                <p>Copy and paste this URL into your Chrome address bar:</p>
                <div class="code-block">
                  <code>chrome://flags/#prompt-api-for-gemini-nano</code>
                  <button type="button" class="copy-button" (click)="copyToClipboard('chrome://flags/#prompt-api-for-gemini-nano')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Enable the Feature</h3>
                <p>Find "Prompt API for Gemini Nano" and set it to <strong>Enabled</strong></p>
                <div class="feature-preview">
                  <div class="feature-item">
                    <span class="feature-name">Prompt API for Gemini Nano</span>
                    <select class="feature-select" disabled>
                      <option>Enabled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Relaunch Chrome</h3>
                <p>Click the "Relaunch" button that appears at the bottom of the flags page</p>
                <div class="relaunch-preview">
                  <button type="button" class="relaunch-button" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M3 21v-5h5"></path>
                    </svg>
                    Relaunch
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="info-box">
            <div class="info-icon">ℹ️</div>
            <div class="info-content">
              <h4>Why do I need this?</h4>
              <p>
                The Gemini Prompt API is an experimental Chrome feature that enables on-device AI processing. 
                This keeps your data private and provides fast AI assistance without sending information to external servers.
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="secondary-button" (click)="close.emit()">
            I'll do this later
          </button>
          <button type="button" class="primary-button" (click)="openChromeFlags()">
            Open Chrome Flags
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: var(--z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
    }
    
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }
    
    .modal-content {
      position: relative;
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-xl);
      border-bottom: 1px solid var(--color-border);
    }
    
    .modal-title {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    
    .modal-icon {
      font-size: var(--font-size-2xl);
    }
    
    .modal-title h2 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
    }
    
    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
    }
    
    .close-button:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
    
    .modal-body {
      padding: var(--space-xl);
    }
    
    .intro-text {
      margin: 0 0 var(--space-xl);
      color: var(--color-text-muted);
      line-height: var(--line-height-relaxed);
    }
    
    .steps-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
    }
    
    .step {
      display: flex;
      gap: var(--space-lg);
      align-items: flex-start;
    }
    
    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      border-radius: var(--radius-full);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
    }
    
    .step-content h3 {
      margin: 0 0 var(--space-sm);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    
    .step-content p {
      margin: 0 0 var(--space-md);
      color: var(--color-text-muted);
      line-height: var(--line-height-normal);
    }
    
    .code-block {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      margin: var(--space-sm) 0;
    }
    
    .code-block code {
      flex: 1;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--font-size-sm);
      color: var(--color-primary);
      background: none;
      border: none;
      padding: 0;
    }
    
    .copy-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border);
      background: var(--color-surface-elevated);
      color: var(--color-text-muted);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-normal);
    }
    
    .copy-button:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-border-strong);
      color: var(--color-text);
    }
    
    .feature-preview {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
    }
    
    .feature-name {
      font-size: var(--font-size-sm);
      color: var(--color-text);
    }
    
    .feature-select {
      padding: var(--space-xs) var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-primary);
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    
    .relaunch-preview {
      display: flex;
      justify-content: center;
      padding: var(--space-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }
    
    .relaunch-button {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-lg);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: not-allowed;
      opacity: 0.8;
    }
    
    .info-box {
      display: flex;
      gap: var(--space-md);
      background: var(--color-primary-light);
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
    }
    
    .info-icon {
      font-size: var(--font-size-lg);
      flex-shrink: 0;
    }
    
    .info-content h4 {
      margin: 0 0 var(--space-sm);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    
    .info-content p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      line-height: var(--line-height-normal);
    }
    
    .modal-footer {
      display: flex;
      gap: var(--space-md);
      justify-content: flex-end;
      padding: var(--space-xl);
      border-top: 1px solid var(--color-border);
    }
    
    .secondary-button,
    .primary-button {
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-normal);
      border: 1px solid var(--color-border);
    }
    
    .secondary-button {
      background: var(--color-surface);
      color: var(--color-text-muted);
    }
    
    .secondary-button:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
      border-color: var(--color-border-strong);
    }
    
    .primary-button {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      border-color: var(--color-primary);
    }
    
    .primary-button:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    /* Mobile responsiveness */
    @media (max-width: 640px) {
      :host {
        padding: var(--space-md);
      }
      
      .modal-header,
      .modal-body,
      .modal-footer {
        padding: var(--space-lg);
      }
      
      .step {
        flex-direction: column;
        gap: var(--space-md);
      }
      
      .step-number {
        align-self: flex-start;
      }
      
      .modal-footer {
        flex-direction: column;
      }
      
      .secondary-button,
      .primary-button {
        width: 100%;
        justify-content: center;
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .modal-backdrop,
      .modal-content {
        animation: none;
      }
      
      .primary-button:hover {
        transform: none;
      }
    }
  `]
})
export class AiSetupModalComponent {
  close = output<void>();
  
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }
  
  openChromeFlags() {
    window.open('chrome://flags/#prompt-api-for-gemini-nano', '_blank');
    this.close.emit();
  }
}
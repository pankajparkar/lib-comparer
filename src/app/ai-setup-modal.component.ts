import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'lc-ai-setup-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="closeModal()" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">
              <span class="title-icon">🤖</span>
              Enable Gemini Prompt API
            </h2>
            <button type="button" class="close-button" (click)="closeModal()" aria-label="Close dialog">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="intro-section">
              <p class="intro-text">
                The AI Assist feature uses Chrome's experimental Gemini Prompt API. Follow these steps to enable it:
              </p>
            </div>

            <div class="steps-section">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>Download Chrome Canary</h3>
                  <p>You need Chrome Canary (the experimental version) to access the Prompt API.</p>
                  <a href="https://www.google.com/chrome/canary/" target="_blank" rel="noopener" class="step-link">
                    Download Chrome Canary
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15,3 21,3 21,9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>Enable Experimental Features</h3>
                  <p>In Chrome Canary, navigate to the flags page and enable the Prompt API:</p>
                  <div class="code-block">
                    <code>chrome://flags/#prompt-api-for-gemini-nano</code>
                    <button type="button" class="copy-button" (click)="copyToClipboard('chrome://flags/#prompt-api-for-gemini-nano')" 
                            [attr.aria-label]="'Copy chrome://flags/#prompt-api-for-gemini-nano'">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  <p class="step-note">Set this flag to <strong>"Enabled"</strong></p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h3>Enable Optimization Guide</h3>
                  <p>Also enable the Optimization Guide on Device flag:</p>
                  <div class="code-block">
                    <code>chrome://flags/#optimization-guide-on-device-model</code>
                    <button type="button" class="copy-button" (click)="copyToClipboard('chrome://flags/#optimization-guide-on-device-model')"
                            [attr.aria-label]="'Copy chrome://flags/#optimization-guide-on-device-model'">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  <p class="step-note">Set this flag to <strong>"Enabled BypassPerfRequirement"</strong></p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h3>Restart Chrome Canary</h3>
                  <p>Close and restart Chrome Canary completely for the changes to take effect.</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">5</div>
                <div class="step-content">
                  <h3>Reload This Page</h3>
                  <p>After restarting Chrome Canary, reload this page and the AI Assist feature should be available!</p>
                </div>
              </div>
            </div>

            <div class="warning-section">
              <div class="warning-box">
                <svg class="warning-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div class="warning-content">
                  <h4>Important Notes</h4>
                  <ul>
                    <li>This is an experimental feature and may not work on all devices</li>
                    <li>The model download may take some time on first use</li>
                    <li>Chrome Canary is the development version and may be unstable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="secondary-button" (click)="closeModal()">
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-lg);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-xl) var(--space-xl) var(--space-lg);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .title-icon {
      font-size: var(--font-size-2xl);
    }

    .close-button {
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-muted);
      transition: all var(--transition-normal);
    }

    .close-button:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
      border-color: var(--color-border-strong);
    }

    .modal-body {
      padding: var(--space-lg) var(--space-xl);
    }

    .intro-section {
      margin-bottom: var(--space-xl);
    }

    .intro-text {
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    .steps-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .step-item {
      display: flex;
      gap: var(--space-lg);
      align-items: flex-start;
    }

    .step-number {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .step-content {
      flex: 1;
    }

    .step-content h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin: 0 0 var(--space-sm) 0;
    }

    .step-content p {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      line-height: var(--line-height-relaxed);
      margin: 0 0 var(--space-sm) 0;
    }

    .step-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--color-primary);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      transition: color var(--transition-normal);
    }

    .step-link:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }

    .code-block {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-sm) var(--space-md);
      margin: var(--space-sm) 0;
    }

    .code-block code {
      flex: 1;
      font-family: ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      background: none;
    }

    .copy-button {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      padding: var(--space-xs);
      border-radius: var(--radius-sm);
      transition: all var(--transition-normal);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .copy-button:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }

    .step-note {
      font-weight: var(--font-weight-medium);
      color: var(--color-text) !important;
    }

    .warning-section {
      margin-top: var(--space-xl);
    }

    .warning-box {
      display: flex;
      gap: var(--space-md);
      background: var(--color-warning-background, #fef3c7);
      border: 1px solid var(--color-warning-border, #f59e0b);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
    }

    .warning-icon {
      color: var(--color-warning, #f59e0b);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-content h4 {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-warning-text, #92400e);
      margin: 0 0 var(--space-sm) 0;
    }

    .warning-content ul {
      margin: 0;
      padding-left: var(--space-lg);
      color: var(--color-warning-text, #92400e);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
    }

    .warning-content li {
      margin-bottom: var(--space-xs);
    }

    .modal-footer {
      padding: var(--space-lg) var(--space-xl) var(--space-xl);
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
    }

    .secondary-button {
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: var(--space-sm) var(--space-lg);
      border-radius: var(--radius-lg);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .secondary-button:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-border-strong);
    }

    /* Dark theme adjustments */
    [data-theme="dark"] .warning-box {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
    }

    [data-theme="dark"] .warning-content h4,
    [data-theme="dark"] .warning-content ul {
      color: #fbbf24;
    }

    /* High contrast theme adjustments */
    [data-theme="high-contrast"] .warning-box {
      background: #fffbf0;
      border-color: #f59e0b;
      border-width: 2px;
    }

    [data-theme="high-contrast"] .close-button,
    [data-theme="high-contrast"] .copy-button,
    [data-theme="high-contrast"] .secondary-button {
      border-width: 2px;
    }

    /* Mobile responsiveness */
    @media (max-width: 640px) {
      .modal-overlay {
        padding: var(--space-md);
      }

      .modal-container {
        max-height: 95vh;
      }

      .modal-header {
        padding: var(--space-lg) var(--space-lg) var(--space-md);
      }

      .modal-body {
        padding: var(--space-md) var(--space-lg);
      }

      .modal-footer {
        padding: var(--space-md) var(--space-lg) var(--space-lg);
      }

      .step-item {
        gap: var(--space-md);
      }

      .step-number {
        width: 28px;
        height: 28px;
        font-size: var(--font-size-xs);
      }

      .code-block {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-sm);
      }

      .copy-button {
        align-self: flex-end;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .modal-overlay,
      .modal-container {
        animation: none;
      }

      .close-button,
      .copy-button,
      .secondary-button,
      .step-link {
        transition: none;
      }
    }
  `]
})
export class AiSetupModalComponent {
  private document = inject(DOCUMENT);

  readonly isOpen = signal(false);
  private static instance: AiSetupModalComponent | null = null;

  constructor() {
    AiSetupModalComponent.instance = this;
  }

  static open() {
    if (AiSetupModalComponent.instance) {
      AiSetupModalComponent.instance.openModal();
    }
  }

  openModal() {
    this.isOpen.set(true);
    // Prevent body scroll when modal is open
    this.document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen.set(false);
    // Restore body scroll
    this.document.body.style.overflow = '';
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
    } catch (err) {
      // Fallback for older browsers
      const textArea = this.document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      this.document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        this.document.execCommand('copy');
      } catch (fallbackErr) {
        console.warn('Failed to copy text to clipboard', fallbackErr);
      }
      this.document.body.removeChild(textArea);
    }
  }
}

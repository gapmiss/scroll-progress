import { Plugin, MarkdownView, Notice } from 'obsidian';
import {
    ScrollProgressSettings,
    DEFAULT_SETTINGS,
    ScrollProgressSettingTab
} from './settings';

export default class ScrollProgressPlugin extends Plugin {
    settings: ScrollProgressSettings;
    progressEl: HTMLElement | null = null;
    scrollEl: HTMLElement | null = null;
    isPreviewMode: boolean = false;
    statusBarItemEl: HTMLElement | null = null;
    currentProgress: number = 0;

    async onload() {
        await this.loadSettings();

        this.registerEvent(
            this.app.workspace.on('file-open', () => this.createProgressIndicator())
        );

        this.registerEvent(
            this.app.workspace.on('layout-change', () => this.createProgressIndicator())
        );

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => this.createProgressIndicator())
        );

        this.registerEvent(
            this.app.workspace.on('editor-change', (view) => {
                if (view instanceof MarkdownView) {
                    this.createProgressIndicator()
                }
            })
        );

        // Register a periodic check to handle cases where the DOM changes
        // but no Obsidian events are triggered
        // this.registerInterval(
        //     window.setInterval(() => {
        //         const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        //         if (activeView) {
        //             this.updateProgress();
        //         }
        //     }, 1000) // Check every 1 second
        // );

        // Add scroll to top command
        this.addCommand({
            id: 'scroll-to-top',
            name: 'Scroll to top',
            callback: () => this.scrollToPosition('top')
        });

        // Add scroll to bottom command
        this.addCommand({
            id: 'scroll-to-bottom',
            name: 'Scroll to bottom',
            callback: () => this.scrollToPosition('bottom')
        });

        // Settings tab
        this.addSettingTab(new ScrollProgressSettingTab(this.app, this));

        // Initialize status bar item if enabled
        if (this.settings.showPercentInStatusBar) {
            this.initStatusBar();
        }

        setTimeout(() => {
            this.createProgressIndicator();
        }, 100);
    }

    initStatusBar() {
        // Create status bar item
        this.statusBarItemEl = this.addStatusBarItem();
        this.statusBarItemEl.addClass('scroll-progress-status');
        this.statusBarItemEl.setText('0%');
    }

    updateStatusBarText() {
        // Create status bar if it doesn't exist
        if (!this.statusBarItemEl && this.settings.showPercentInStatusBar) {
            this.initStatusBar();
        }

        // Update text if it exists
        if (this.statusBarItemEl) {
            this.statusBarItemEl.setText(`${this.currentProgress}%`);
        }
    }

    removeStatusBarText() {
        if (this.statusBarItemEl) {
            this.statusBarItemEl.remove();
            this.statusBarItemEl = null;
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateStyles();
        this.createProgressIndicator();
    }

    createProgressIndicator() {
        if (this.settings.barEnabled) {
            // Remove existing progress bar
            if (this.progressEl) {
                this.progressEl.remove();
                this.progressEl = null;
                this.removeStatusBarText();
            }

            const leaves = this.app.workspace.getLeavesOfType('markdown');
            if (!leaves.length) return;

            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!view || !view.containerEl) return;

            // Determine current view mode
            // Check if we're in reading mode or editing mode
            if (view.getMode() === 'preview') {
                // Reading mode
                this.isPreviewMode = true;
                const previewEl = view.containerEl.querySelector('.markdown-preview-view');
                if (!previewEl) return;

                // In reading mode, the scrollable element is the .markdown-preview-view itself
                this.scrollEl = previewEl as HTMLElement;
                if (this.settings.enableDebugLogs) {
                    console.log('Reading mode detected, scroll element:', this.scrollEl);
                }
            } else {
                // Live preview/source mode
                this.isPreviewMode = false;
                const editorEl = view.containerEl.querySelector('.cm-editor');
                if (!editorEl) return;

                this.scrollEl = editorEl.querySelector('.cm-scroller') as HTMLElement;
                if (this.settings.enableDebugLogs) {
                    console.log('Edit mode detected, scroll element:', this.scrollEl);
                }
            }

            if (!this.scrollEl) return;

            // Create progress bar container and attach it to the view container
            // This ensures it's properly positioned relative to the view
            this.progressEl = view.containerEl.createEl('div', { cls: 'scroll-progress-container' });
            this.progressEl.createEl('div', { cls: 'scroll-progress-bar' });

            // Add CSS styles
            this.updateStyles();

            // Update progress on scroll
            const handleScroll = () => this.updateProgress();
            this.scrollEl.addEventListener('scroll', handleScroll);
            this.registerDomEvent(this.scrollEl, 'scroll', handleScroll);

            // Initial update
            this.updateProgress();

            // Position the progress bar based on settings
            if (this.settings.barPosition === 'top') {
                this.progressEl.style.top = '0';
                this.progressEl.style.bottom = 'auto';
            } else {
                this.progressEl.style.bottom = '0';
                this.progressEl.style.top = 'auto';
            }

            if (this.settings.enableDebugLogs) {
                console.log('Progress bar created:', this.progressEl);
            }
        }
    }

    updateProgress() {
        if (!this.progressEl || !this.scrollEl) return;

        const scrollInfo = {
            top: this.scrollEl.scrollTop,
            height: this.scrollEl.scrollHeight,
            clientHeight: this.scrollEl.clientHeight
        };

        // Handle edge cases
        if (scrollInfo.clientHeight >= scrollInfo.height) {
            this.currentProgress = 100;
            this.setProgress(100);
            return;
        }

        // Calculate the maximum scrollable distance
        const maxScroll = scrollInfo.height - scrollInfo.clientHeight;

        // Calculate progress as a percentage of how far we've scrolled
        // compared to how far we can scroll
        const progress = maxScroll > 0 ? Math.round((scrollInfo.top / maxScroll) * 100) : 0;

        // Ensure progress is between 0 and 100
        const clampedProgress = Math.min(100, Math.max(0, progress));

        if (this.settings.enableDebugLogs) {
            console.log(`Scroll Info - Top: ${scrollInfo.top}, Height: ${scrollInfo.height}, ClientHeight: ${scrollInfo.clientHeight}, Progress: ${clampedProgress}%`);
        }
        this.currentProgress = clampedProgress;
        this.setProgress(clampedProgress);
        this.updateStatusBarText();
    }

    setProgress(percentage: number) {
        if (!this.progressEl) return;
        const barEl = this.progressEl.querySelector('.scroll-progress-bar') as HTMLElement;
        if (barEl) {
            barEl.style.width = `${percentage}%`;
        }
    }

    updateStyles() {
        // Remove existing styles if any
        const existingStyle = document.getElementById('scroll-progress-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new style element
        const styleEl = document.createElement('style');
        styleEl.id = 'scroll-progress-styles';
        styleEl.textContent = this.generateCSS();
        document.head.appendChild(styleEl);
    }

    generateCSS(): string {
        return `
            .scroll-progress-container {
                position: fixed;
                z-index: 9999;
                height: ${this.settings.barHeight}px;
                background-color: var(--background-primary);
                width: 100%;
                left: 0;
                right: 0;
                overflow: hidden;
                ${this.settings.barPosition === 'top' ? 'top: 0;' : 'bottom: 0;'}
            }
            
            .scroll-progress-bar {
                height: 100%;
                background-color: ${this.settings.barColor};
                width: 0%;
                transition: width 0.1s ease-out;
            }
            
            /* Ensure it works in both reading and live preview modes */
            .markdown-preview-view .scroll-progress-container {
                ${this.settings.barPosition === 'top' ? 'top: 0;' : 'bottom: 0;'}
            }
            
            .cm-editor .scroll-progress-container {
                ${this.settings.barPosition === 'top' ? 'top: 0;' : 'bottom: 0;'}
            }
        `;
    }

    scrollToPosition(position: 'top' | 'bottom') {
        if (!this.scrollEl) {
            new Notice('No active document to scroll');
            return;
        }

        const targetPosition = position === 'top' ? 0 : this.scrollEl.scrollHeight - this.scrollEl.clientHeight;
        const startPosition = this.scrollEl.scrollTop;
        const distance = targetPosition - startPosition;
        const duration = this.settings.scrollDuration;
        const startTime = performance.now();

        if (this.settings.enableDebugLogs) {
            console.log(`Scrolling to ${position}. Start: ${startPosition}, Target: ${targetPosition}, Distance: ${distance}`);
        }

        // Easing function for smooth animation
        const easeInOutCubic = (t: number): number => {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animateScroll = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;

            if (elapsedTime >= duration) {
                this.scrollEl!.scrollTop = targetPosition;
                this.updateProgress();
                return;
            }

            const progress = elapsedTime / duration;
            const easedProgress = easeInOutCubic(progress);
            const currentPosition = startPosition + distance * easedProgress;

            this.scrollEl!.scrollTop = currentPosition;
            this.updateProgress();

            requestAnimationFrame(animateScroll);
        };

        requestAnimationFrame(animateScroll);
    }

    async onunload() {
        if (this.progressEl) {
            this.progressEl.remove();
        }
        const existingStyle = document.getElementById('scroll-progress-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
    }
}

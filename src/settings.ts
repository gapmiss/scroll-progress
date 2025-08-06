import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import ScrollProgressPlugin from "./main";

export interface ScrollProgressSettings {
    barEnabled: boolean;
    barHeight: number;
    barColor: string;
    barPosition: string;
    showPercentInStatusBar: boolean;
    enableDebugLogs: boolean;
    scrollDuration: number;
}

export const DEFAULT_SETTINGS: ScrollProgressSettings = {
    barEnabled: true,
    barHeight: 8,
    barColor: '#8A5CF5',
    barPosition: 'top',
    showPercentInStatusBar: false,
    enableDebugLogs: false,
    scrollDuration: 800
};

export class ScrollProgressSettingTab extends PluginSettingTab {
    plugin: ScrollProgressPlugin;

    constructor(app: App, plugin: ScrollProgressPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Enable bar')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.barEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.barEnabled = value;
                    await this.plugin.saveSettings();
                    // Update status bar immediately when toggled
                    if (value) {
                        this.plugin.createProgressIndicator();
                        if (this.plugin.settings.showPercentInStatusBar) {
                        }
                    } else {
                        if (this.plugin.progressEl) {
                            this.plugin.progressEl.remove();
                        }
                        const existingStyle = document.getElementById('scroll-progress-styles');
                        if (existingStyle) {
                            existingStyle.remove();
                        }
                    }
                }));

        new Setting(containerEl)
            .setName('Bar height')
            .setDesc('Height of the progress bar in pixels')
            .addSlider(slider => slider
                .setLimits(2, 20, 1)
                .setValue(this.plugin.settings.barHeight)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.barHeight = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Bar color')
            .setDesc('Color of the progress indicator')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.barColor)
                .onChange(async (value) => {
                    this.plugin.settings.barColor = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Bar position')
            .setDesc('Position of the progress bar')
            .addDropdown(dropdown => dropdown
                .addOption('top', 'Top')
                .addOption('bottom', 'Bottom')
                .setValue(this.plugin.settings.barPosition)
                .onChange(async (value) => {
                    this.plugin.settings.barPosition = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Show progress % in status bar')
            .setDesc('Display the scroll progress percentage in the status bar')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showPercentInStatusBar)
                .onChange(async (value) => {
                    this.plugin.settings.showPercentInStatusBar = value;
                    await this.plugin.saveSettings();
                    // Update status bar immediately when toggled
                    if (value) {
                        this.plugin.updateStatusBarText();
                    } else {
                        this.plugin.removeStatusBarText();
                    }
                }));

        new Setting(containerEl)
            .setName('Scroll animation duration')
            .setDesc('Duration of smooth scrolling animation in milliseconds (higher = slower)')
            .addSlider(slider => slider
                .setLimits(200, 2000, 100)
                .setValue(this.plugin.settings.scrollDuration)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.scrollDuration = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Enable debug logs')
            .setDesc('Show console log messages for troubleshooting')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableDebugLogs)
                .onChange(async (value) => {
                    this.plugin.settings.enableDebugLogs = value;
                    await this.plugin.saveSettings();
                }));
    }
}
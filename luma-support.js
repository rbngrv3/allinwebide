/**
 * Luma Language Support for All-In Studio
 * Provides syntax highlighting and a live preview panel.
 */
class LumaSupportPlugin {
  constructor(api) {
    this.api = api;
    this.previewPanel = null;
    this.updateTimeout = null;
  }

  async init() {
    // 1. Register Luma Syntax Highlighting (Assuming Monaco or similar editor API)
    if (this.api.editor && this.api.editor.registerLanguage) {
      this.api.editor.registerLanguage({
        id: 'luma',
        extensions: ['.luma'],
        grammar: {
          keywords: ['app', 'state', 'remember', 'action', 'screen', 'theme', 'style', 'function', 'return', 'if', 'else', 'for', 'in', 'let'],
          operators: ['=', '==', '!=', '>', '<', '+', '-', '*', '/'],
          actions: ['do', 'go', 'set'],
          ui: ['column', 'row', 'card', 'button', 'input', 'text', 'title', 'label', 'choice', 'toggle'],
        }
      });
    }

    // 2. Create the Live Preview Panel
    this.previewPanel = await this.api.panels.create({
      id: 'luma-preview',
      title: 'Luma Live Preview',
      position: 'right'
    });

    // Mount the initial HTML container for the Luma player
    this.previewPanel.setContent(`
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-raised);">
        <main id="luma-app-container"></main>
      </div>
      <script type="module">
        // Dynamically load the Luma runtime from your project or CDN
        import { mountLumaApp } from "https://raw.githubusercontent.com/rbngrv3/allinwebide/main/runtime/luma-player.js";
        
        window.renderLuma = function(sourceCode) {
          const container = document.getElementById('luma-app-container');
          container.innerHTML = ""; // Clear previous render
          try {
            mountLumaApp(container, sourceCode);
          } catch (e) {
            container.innerHTML = \`<div style="color: red; padding: 20px;">\${e.message}</div>\`;
          }
        };
      </script>
    `);

    // 3. Listen for changes in the active Luma file
    this.api.events.on('onActiveEditorChange', (file) => this.handleCodeChange(file));
  }

  handleCodeChange(file) {
    if (!file.name.endsWith('.luma')) return;

    // Debounce the preview update so it doesn't crash while typing
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      const source = this.api.editor.getValue();
      
      // Send the new code to the web-view panel to trigger a re-render
      this.previewPanel.executeScript(`
        if (window.renderLuma) {
          window.renderLuma(\`${source.replace(/`/g, '\\`')}\`);
        }
      `);
    }, 500); // 500ms delay after typing stops
  }
}

// Export the plugin for the IDE to load
export default function registerPlugin(api) {
  const plugin = new LumaSupportPlugin(api);
  plugin.init();
}

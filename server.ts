import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '@anthropic-ai/claude-agent-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..'); // Go up from dist/ to project root

const app = express();
const PORT = 5555;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true
}));
app.use(express.json());

// Disable caching for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Expires', '0');
  res.setHeader('Pragma', 'no-cache');
  next();
});

app.use(express.static(projectRoot)); // Serve static files from project root

// === HTTP ENDPOINTS ===

/**
 * POST /api/generate-module
 * Generates a new synthesizer module using Claude Agent SDK
 */
app.post('/api/generate-module', async (req, res) => {
  const { request } = req.body;

  if (!request || typeof request !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "request" field' });
  }

  console.log(`\n[Agent SDK] Processing request: "${request}"\n`);

  try {
    // Check if this is a suggestion request vs module creation request
    const isSuggestionRequest = request.toLowerCase().includes('suggest') ||
                                request.toLowerCase().includes('ideas') ||
                                request.toLowerCase().includes('creative effects') ||
                                request.toLowerCase().includes('modulation');

    if (isSuggestionRequest) {
      // Handle suggestion requests - just return JSON ideas
      const prompt = `User asked: "${request}"

Respond with creative module suggestions for a Web Audio synthesizer. Return ONLY valid JSON (no explanation):

{"suggestions": [
  {"name": "Module Name", "description": "What it does", "category": "effect/filter/modulation"},
  ...5-8 suggestions...
]}

Categories: effect (delay, reverb), filter (high-pass, resonant), modulation (LFO, envelope follower), dynamics (compressor, limiter), distortion (waveshaper, bitcrusher), spatial (panner, stereo widener)`;

      console.log('[Agent SDK] Handling suggestion request...');

      const originalApiKey = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const queryStream = query({
        prompt,
        options: {
          model: 'claude-sonnet-4-5-20250929',
          tools: [],  // No tools needed for suggestions
          maxTurns: 1
        }
      });

      if (originalApiKey) {
        process.env.ANTHROPIC_API_KEY = originalApiKey;
      }

      let responseText = '';
      for await (const message of queryStream) {
        if (message.type === 'assistant' && message.message.content) {
          for (const block of message.message.content) {
            if (block.type === 'text') {
              responseText += block.text;
            }
          }
        }
      }

      console.log('[Agent SDK] Suggestion response:', responseText);

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in suggestion response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      res.json(suggestions);
      return;
    }

    // Otherwise, handle module creation request
    const prompt = `Create a Web Audio module for: "${request}"

STEPS:
1. Read example module: Read modules/effect-delay.js
2. Write new module to modules/ directory using Write tool
3. Respond with JSON only

Module template:

\`\`\`javascript
export default {
  id: "category-name",           // Unique ID (kebab-case)
  name: "Feature Name",          // Human-readable name
  version: "1.0.0",              // Semantic version

  audio: {
    createNodes: (ctx) => {      // Factory function for Web Audio nodes
      // Create audio nodes using ctx (AudioContext)
      const node = ctx.createBiquadFilter();
      // ... configure nodes ...

      return {
        input: node,             // Entry point for audio
        output: node,            // Exit point for audio
        nodes: { node }          // Internal nodes for parameter control
      };
    },
    insertionPoint: "post-filter",  // Where to insert: pre-gain | post-oscillator | post-filter | pre-master
    routing: "series"               // How to route: series | parallel
  },

  ui: {
    container: "custom-controls",   // Target div ID
    template: \\\`                      // HTML template for controls
      <h2>Module Name</h2>
      <div class="control-group">
        <label class="control-label">
          Parameter <span class="control-value" id="module-param-value">50</span>
        </label>
        <input type="range" id="module-param" min="0" max="100" value="50">
      </div>
    \\\`,
    bindEvents: (nodes, params) => {  // Event listeners for controls
      document.getElementById('module-param').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        nodes.node.frequency.value = value;
        document.getElementById('module-param-value').textContent = value;
      });
    }
  },

  state: {
    defaults: { param: 50 },        // Default parameter values
    save: (params) => params,       // Serialize state (for presets)
    load: (params, saved, nodes) => {  // Restore state
      // Apply saved params to nodes
    }
  },

  lifecycle: {
    onLoad: (ctx) => {               // Called when module loads
      console.log('[Module] Loaded');
    },
    onConnect: (ctx) => {            // Called when audio graph connects
      console.log('[Module] Connected');
    },
    onUnload: (ctx) => {             // Called before unload
      console.log('[Module] Unloading');
    }
  }
}
\`\`\`

5. MANDATORY: Use Write tool to save the module to modules/ directory
6. The module MUST be valid ES6 JavaScript with proper Web Audio API usage
7. Include helpful parameter labels and value displays in the UI
8. Use the terminal green-on-black aesthetic (colors: #00ff00, #0a0a0a, #1a1a1a)

CRITICAL: Use Write tool to save the file, then respond with JSON only:
{"moduleId":"effect-name","filename":"effect-name.js","url":"/modules/effect-name.js","description":"what it does"}`;

    // Query Claude using Agent SDK (subscription mode - no API key)
    console.log('[Agent SDK] Starting query to Claude...');

    // Temporarily unset API key to force subscription usage
    const originalApiKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    // Track written files (Agent SDK may not write directly)
    const writtenFiles = new Map<string, string>();

    const queryStream = query({
      prompt,
      options: {
        model: 'claude-sonnet-4-5-20250929',
        tools: ['Read', 'Write'],  // Only built-in tools
        cwd: projectRoot,  // Set working directory to project root
        maxTurns: 5,
        canUseTool: (async (toolName: string, input: any) => {
          if (toolName === 'Write') {
            console.log(`[Write Intercept] file_path: ${input.file_path}`);
            console.log(`[Write Intercept] content length: ${input.content?.length || 0}`);

            // Store the file content for manual write
            writtenFiles.set(input.file_path, input.content);
          }
          return { allowed: true };
        }) as any
      }
    });

    // Restore API key after query starts
    if (originalApiKey) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    }

    console.log('[Agent SDK] Query stream created, collecting responses...');

    // Collect assistant responses
    let responseText = '';
    let messageCount = 0;
    for await (const message of queryStream) {
      messageCount++;
      console.log(`[Agent SDK] Message ${messageCount}:`, message.type);

      if (message.type === 'assistant' && message.message.content) {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            responseText += block.text;
            console.log('[Agent SDK] Text block:', block.text.substring(0, 100));
          } else if (block.type === 'tool_use') {
            console.log('[Agent SDK] Tool use:', block.name);
          }
        }
      } else if (message.type === 'result') {
        console.log('[Agent SDK] Result:', message.is_error ? 'ERROR' : 'SUCCESS');
      }
    }

    console.log('\n[Agent SDK] Total messages:', messageCount);
    console.log('[Agent SDK] Claude response length:', responseText.length);
    console.log('[Agent SDK] Claude response:', responseText);

    // Write captured files to disk
    console.log(`[Agent SDK] Writing ${writtenFiles.size} files to disk...`);
    for (const [filePath, content] of writtenFiles.entries()) {
      const fullPath = path.join(projectRoot, filePath);
      console.log(`[Agent SDK] Writing: ${fullPath}`);
      await fs.writeFile(fullPath, content, 'utf-8');
      console.log(`[Agent SDK] ✓ Written: ${fullPath}`);
    }

    // Parse response to extract module info
    let moduleInfo;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*"moduleId"[\s\S]*\}/);
      if (jsonMatch) {
        moduleInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[Agent SDK] Failed to parse response:', parseError);
      console.error('[Agent SDK] Response text was:', responseText);
      throw new Error('Claude did not write module file or return valid JSON. Response: ' + responseText.substring(0, 200));
    }

    console.log('[Agent SDK] ✓ Module generated:', moduleInfo);

    res.json(moduleInfo);

  } catch (error) {
    console.error('[Agent SDK] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    res.status(500).json({
      error: 'Failed to generate module',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error)
    });
  }
});

/**
 * GET /api/modules
 * List all available modules
 */
app.get('/api/modules', async (req, res) => {
  const modulesDir = path.join(projectRoot, 'modules');
  try {
    const files = await fs.readdir(modulesDir);
    const modules = files.filter(f => f.endsWith('.js'));
    res.json({ modules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list modules' });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Agent SDK Synthesizer Server',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🎹 Modular Synthesizer Agent SDK Server  ║
╠════════════════════════════════════════════╣
║  Status: Running                          ║
║  Port: ${PORT}                               ║
║  URL: http://localhost:${PORT}               ║
╠════════════════════════════════════════════╣
║  Endpoints:                               ║
║  POST /api/generate-module                ║
║  GET  /api/modules                        ║
║  GET  /health                             ║
╠════════════════════════════════════════════╣
║  MCP Server: synthesizer-tools            ║
║  Tools: 5 (read-core, list-modules, etc.) ║
╠════════════════════════════════════════════╣
║  Open: http://localhost:${PORT}/synthesizer.html  ║
╚════════════════════════════════════════════╝
  `);
});

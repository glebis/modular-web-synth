import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '@anthropic-ai/claude-agent-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// If running from dist/, go up to project root. Otherwise use current dir.
const projectRoot = __dirname.endsWith('dist') ? path.join(__dirname, '..') : __dirname;

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
    const prompt = `You MUST use the Write tool to create a module file for: "${request}"

CRITICAL INSTRUCTIONS:
1. Use Read tool to read modules/effect-delay.js as a reference
2. Use Write tool to save the new module to modules/[your-module-id].js
3. After writing the file, respond with ONLY this JSON format (no other text):
{"moduleId":"your-module-id","filename":"your-module-id.js","url":"/modules/your-module-id.js","description":"brief description"}

DO NOT just output code - you MUST use the Write tool to save it to a file.

Module template structure:

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

Requirements:
- Valid ES6 JavaScript with proper Web Audio API usage
- Include helpful parameter labels and value displays in the UI
- Use the terminal green-on-black aesthetic (colors: #00ff00, #0a0a0a, #1a1a1a)
- Module ID should be in kebab-case format (e.g., "envelope-follower")

REMEMBER: You MUST use the Write tool to save the file, then respond with JSON only.`;

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
 * POST /api/generate-sound
 * Generate drum sounds using ElevenLabs Sound Effects API
 */
app.post('/api/generate-sound', async (req, res) => {
  const { prompt, variants = 3 } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "prompt" field' });
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    console.warn('[ElevenLabs] API key not found in environment');
    return res.status(500).json({
      error: 'ElevenLabs API key not configured',
      hint: 'Set ELEVENLABS_API_KEY environment variable'
    });
  }

  console.log(`\n[ElevenLabs] Generating sound: "${prompt}" (${variants} variants)\n`);

  try {
    const sounds = [];

    // Generate multiple variants
    for (let i = 0; i < variants; i++) {
      console.log(`[ElevenLabs] Generating variant ${i + 1}/${variants}...`);

      const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: 1.5, // Short drum hit
          prompt_influence: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[ElevenLabs] API error (variant ${i + 1}):`, error);
        continue; // Try next variant
      }

      // Get audio data
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      sounds.push({
        id: `sound-${Date.now()}-${i}`,
        prompt,
        variant: i + 1,
        audioData: base64Audio,
        format: 'mp3', // ElevenLabs returns MP3
        duration: 1.5
      });

      console.log(`[ElevenLabs] ✓ Variant ${i + 1} generated (${audioBuffer.byteLength} bytes)`);
    }

    if (sounds.length === 0) {
      return res.status(500).json({ error: 'Failed to generate any sound variants' });
    }

    console.log(`[ElevenLabs] ✓ Generated ${sounds.length} variants successfully\n`);

    res.json({
      prompt,
      sounds,
      count: sounds.length
    });

  } catch (error) {
    console.error('[ElevenLabs] Generation error:', error);
    res.status(500).json({
      error: 'Sound generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/generate-drum-kit
 * Generate a complete drum kit (kick, snare, hihat, etc.)
 */
app.post('/api/generate-drum-kit', async (req, res) => {
  const { style = 'electronic', variants = 3 } = req.body;

  console.log(`\n[ElevenLabs] Generating ${style} drum kit with ${variants} variants per sound\n`);

  const drumTypes = [
    { name: 'kick', prompt: `${style} kick drum, deep bass punch` },
    { name: 'snare', prompt: `${style} snare drum, crisp snap` },
    { name: 'hihat-closed', prompt: `${style} closed hi-hat, tight metallic` },
    { name: 'hihat-open', prompt: `${style} open hi-hat, sustained shimmer` },
    { name: 'clap', prompt: `${style} clap or handclap, sharp attack` }
  ];

  try {
    const kit = {};

    for (const drum of drumTypes) {
      console.log(`[ElevenLabs] Generating ${drum.name}...`);

      // Call individual sound generation endpoint
      const response = await fetch(`http://localhost:${PORT}/api/generate-sound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: drum.prompt,
          variants
        })
      });

      if (response.ok) {
        const data = await response.json();
        kit[drum.name] = data.sounds;
        console.log(`[ElevenLabs] ✓ ${drum.name} generated (${data.sounds.length} variants)`);
      } else {
        console.error(`[ElevenLabs] ✗ Failed to generate ${drum.name}`);
        kit[drum.name] = [];
      }
    }

    console.log(`[ElevenLabs] ✓ Drum kit generation complete\n`);

    res.json({
      style,
      kit,
      totalSounds: Object.values(kit).flat().length
    });

  } catch (error) {
    console.error('[ElevenLabs] Kit generation error:', error);
    res.status(500).json({
      error: 'Drum kit generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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
║  POST /api/generate-sound  (ElevenLabs)   ║
║  POST /api/generate-drum-kit              ║
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

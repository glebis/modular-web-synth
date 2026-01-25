// Haas Effect - Stereo Width via Precedence Effect
// Delays one channel by 1-40ms to create spatial positioning

export default {
  id: "effect-haas",
  name: "Haas Effect",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Stereo splitter and merger
      const splitter = ctx.createChannelSplitter(2);
      const merger = ctx.createChannelMerger(2);

      // Delay for right channel (Haas effect)
      const delayNode = ctx.createDelay(0.1);
      delayNode.delayTime.value = 0.020; // 20ms default

      // Gain controls for left/right channels
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      leftGain.gain.value = 1.0;
      rightGain.gain.value = 1.0;

      // Routing:
      // Input → Splitter
      // Left channel → leftGain → merger left
      // Right channel → delay → rightGain → merger right
      // Merger → Output

      splitter.connect(leftGain, 0);
      splitter.connect(delayNode, 1);
      delayNode.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      return {
        input: splitter,
        output: merger,
        nodes: {
          splitter,
          merger,
          delayNode,
          leftGain,
          rightGain
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <div class="control-section">
        <h2>Haas Effect</h2>
        <div class="control-group">
          <label class="control-label">
            Delay <span class="control-value" id="haas-delay-value">20ms</span>
          </label>
          <input type="range" id="haas-delay" min="1" max="40" value="20" step="0.5">
          <span class="control-hint">1-40ms (sweet spot: 15-25ms)</span>
        </div>
        <div class="control-group">
          <label class="control-label">
            Width <span class="control-value" id="haas-width-value">100%</span>
          </label>
          <input type="range" id="haas-width" min="0" max="100" value="100">
          <span class="control-hint">Stereo width intensity</span>
        </div>
        <div class="control-group">
          <label class="control-label">
            Position <span class="control-value" id="haas-position-value">Center</span>
          </label>
          <input type="range" id="haas-position" min="-100" max="100" value="0">
          <span class="control-hint">L ← → R</span>
        </div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { delayNode, leftGain, rightGain } = audioNodes.nodes;

      const delaySlider = document.getElementById('haas-delay');
      const delayValue = document.getElementById('haas-delay-value');
      const widthSlider = document.getElementById('haas-width');
      const widthValue = document.getElementById('haas-width-value');
      const positionSlider = document.getElementById('haas-position');
      const positionValue = document.getElementById('haas-position-value');

      const updateHaas = () => {
        const delayMs = parseFloat(delaySlider.value);
        const width = parseFloat(widthSlider.value) / 100;
        const position = parseFloat(positionSlider.value) / 100;

        // Update delay time
        delayNode.delayTime.setTargetAtTime(
          delayMs / 1000,
          delayNode.context.currentTime,
          0.01
        );

        // Calculate left/right gains based on position and width
        // Position: -1 (full left) to +1 (full right)
        // Width: 0 (mono) to 1 (full stereo)

        const leftGainValue = 1.0 - (position * 0.5 + 0.5) * width;
        const rightGainValue = 1.0 - (-position * 0.5 + 0.5) * width;

        leftGain.gain.setTargetAtTime(
          leftGainValue,
          leftGain.context.currentTime,
          0.01
        );

        rightGain.gain.setTargetAtTime(
          rightGainValue,
          rightGain.context.currentTime,
          0.01
        );

        // Update UI
        delayValue.textContent = `${delayMs.toFixed(1)}ms`;
        widthValue.textContent = `${Math.round(width * 100)}%`;

        if (position < -0.1) {
          positionValue.textContent = `Left ${Math.abs(Math.round(position * 100))}%`;
        } else if (position > 0.1) {
          positionValue.textContent = `Right ${Math.round(position * 100)}%`;
        } else {
          positionValue.textContent = 'Center';
        }

        // Store params
        params.delay = delayMs;
        params.width = width * 100;
        params.position = position * 100;
      };

      delaySlider.addEventListener('input', updateHaas);
      widthSlider.addEventListener('input', updateHaas);
      positionSlider.addEventListener('input', updateHaas);

      // Initialize
      updateHaas();
    }
  },

  state: {
    defaults: {
      delay: 20,
      width: 100,
      position: 0
    },
    save: (params) => ({
      delay: params.delay,
      width: params.width,
      position: params.position
    }),
    load: (params, saved, audioNodes) => {
      if (saved) {
        document.getElementById('haas-delay').value = saved.delay || 20;
        document.getElementById('haas-width').value = saved.width || 100;
        document.getElementById('haas-position').value = saved.position || 0;

        // Trigger update
        document.getElementById('haas-delay').dispatchEvent(new Event('input'));
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Haas] Module loaded - psychoacoustic stereo widening ready');
    },
    onConnect: (ctx) => {
      console.log('[Haas] Connected to audio graph');
    },
    onUnload: (ctx) => {
      console.log('[Haas] Haas effect unloaded');
    }
  }
};

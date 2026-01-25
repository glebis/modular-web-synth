// High-pass filter module with cutoff frequency control

export default {
  id: "filter-highpass",
  name: "High-Pass Filter",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create biquad filter configured as high-pass
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'highpass';
      filterNode.frequency.value = 200;  // Default cutoff at 200 Hz
      filterNode.Q.value = 1.0;          // Standard Q factor

      return {
        input: filterNode,
        output: filterNode,
        nodes: {
          filter: filterNode
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>High-Pass Filter</h2>
      <div class="control-group">
        <label class="control-label">
          Cutoff Frequency <span class="control-value" id="highpass-cutoff-value">200 Hz</span>
        </label>
        <input type="range" id="highpass-cutoff" min="20" max="5000" step="1" value="200">
      </div>
      <div class="control-group">
        <label class="control-label">
          Resonance (Q) <span class="control-value" id="highpass-q-value">1.0</span>
        </label>
        <input type="range" id="highpass-q" min="0.1" max="20" step="0.1" value="1.0">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { filter } = audioNodes.nodes;

      // Cutoff frequency control
      const cutoffSlider = document.getElementById('highpass-cutoff');
      const cutoffValue = document.getElementById('highpass-cutoff-value');

      cutoffSlider.addEventListener('input', (e) => {
        const freq = parseFloat(e.target.value);
        filter.frequency.value = freq;
        params.cutoff = freq;
        cutoffValue.textContent = Math.round(freq) + ' Hz';
      });

      // Q factor (resonance) control
      const qSlider = document.getElementById('highpass-q');
      const qValue = document.getElementById('highpass-q-value');

      qSlider.addEventListener('input', (e) => {
        const q = parseFloat(e.target.value);
        filter.Q.value = q;
        params.q = q;
        qValue.textContent = q.toFixed(1);
      });
    }
  },

  state: {
    defaults: {
      cutoff: 200,
      q: 1.0
    },
    save: (params) => ({
      cutoff: params.cutoff,
      q: params.q
    }),
    load: (params, saved, audioNodes) => {
      const { filter } = audioNodes.nodes;

      if (saved.cutoff !== undefined) {
        filter.frequency.value = saved.cutoff;
        params.cutoff = saved.cutoff;
        document.getElementById('highpass-cutoff').value = saved.cutoff;
        document.getElementById('highpass-cutoff-value').textContent = Math.round(saved.cutoff) + ' Hz';
      }
      if (saved.q !== undefined) {
        filter.Q.value = saved.q;
        params.q = saved.q;
        document.getElementById('highpass-q').value = saved.q;
        document.getElementById('highpass-q-value').textContent = saved.q.toFixed(1);
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[High-Pass Filter] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[High-Pass Filter] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[High-Pass Filter] Module unloading');
    }
  }
};

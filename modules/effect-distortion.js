// Distortion effect module with drive and mix controls

export default {
  id: "effect-distortion",
  name: "Distortion Effect",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create waveshaper for distortion
      const distortion = ctx.createWaveShaper();
      const preGain = ctx.createGain();
      const postGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Set initial values
      const initialDrive = 50;
      preGain.gain.value = initialDrive;
      postGain.gain.value = 1 / (1 + initialDrive / 10);  // Compensate for drive gain
      wetGain.gain.value = 0.5;   // 50% wet signal
      dryGain.gain.value = 0.5;   // 50% dry signal

      // Create distortion curve
      const makeDistortionCurve = (amount) => {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; i++) {
          const x = (i * 2 / n_samples) - 1;
          curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
      };

      distortion.curve = makeDistortionCurve(initialDrive);
      distortion.oversample = '4x';

      // Chain: input -> preGain -> distortion -> postGain -> wetGain -> outputMix
      preGain.connect(distortion);
      distortion.connect(postGain);
      postGain.connect(wetGain);
      wetGain.connect(outputMix);

      // Dry signal path
      dryGain.connect(outputMix);

      // Input splitter (for dry/wet routing)
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(preGain);
      inputSplitter.connect(dryGain);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          distortion: distortion,
          preGain: preGain,
          postGain: postGain,
          wet: wetGain,
          dry: dryGain
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Distortion Effect</h2>
      <div class="control-group">
        <label class="control-label">
          Drive <span class="control-value" id="distortion-drive-value">50</span>
        </label>
        <input type="range" id="distortion-drive" min="0" max="100" step="1" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="distortion-mix-value">50%</span>
        </label>
        <input type="range" id="distortion-mix" min="0" max="100" value="50">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { distortion, preGain, postGain, wet, dry } = audioNodes.nodes;

      // Helper function to create distortion curve
      const makeDistortionCurve = (amount) => {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; i++) {
          const x = (i * 2 / n_samples) - 1;
          curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
      };

      // Drive control
      const driveSlider = document.getElementById('distortion-drive');
      const driveValue = document.getElementById('distortion-drive-value');

      driveSlider.addEventListener('input', (e) => {
        const drive = parseFloat(e.target.value);

        // Update pre-gain to amplify signal before distortion
        preGain.gain.value = drive;

        // Update distortion curve based on drive amount
        distortion.curve = makeDistortionCurve(drive);

        // Compensate output gain to maintain consistent volume
        postGain.gain.value = 1 / (1 + drive / 10);

        params.drive = drive;
        driveValue.textContent = Math.round(drive);
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('distortion-mix');
      const mixValue = document.getElementById('distortion-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const wetAmount = percent / 100;
        const dryAmount = 1 - wetAmount;
        wet.gain.value = wetAmount;
        dry.gain.value = dryAmount;
        params.mix = wetAmount;
        mixValue.textContent = Math.round(percent) + '%';
      });
    }
  },

  state: {
    defaults: {
      drive: 50,
      mix: 0.5
    },
    save: (params) => ({
      drive: params.drive,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { distortion, preGain, postGain, wet, dry } = audioNodes.nodes;

      // Helper function to create distortion curve
      const makeDistortionCurve = (amount) => {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; i++) {
          const x = (i * 2 / n_samples) - 1;
          curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
      };

      if (saved.drive !== undefined) {
        preGain.gain.value = saved.drive;
        distortion.curve = makeDistortionCurve(saved.drive);
        postGain.gain.value = 1 / (1 + saved.drive / 10);
        params.drive = saved.drive;
        document.getElementById('distortion-drive').value = saved.drive;
        document.getElementById('distortion-drive-value').textContent = Math.round(saved.drive);
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('distortion-mix').value = saved.mix * 100;
        document.getElementById('distortion-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Distortion] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Distortion] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Distortion] Module unloading');
    }
  }
};

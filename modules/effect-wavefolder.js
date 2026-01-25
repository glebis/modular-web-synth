// Wave Folder Distortion module that folds waveforms back on themselves creating complex harmonic overtones

export default {
  id: "effect-wavefolder",
  name: "Wave Folder",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create a WaveShaperNode for the folding algorithm
      const folder = ctx.createWaveShaper();
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Set initial values
      inputGain.gain.value = 1.0;
      outputGain.gain.value = 0.5;
      wetGain.gain.value = 0.7;
      dryGain.gain.value = 0.3;

      // Create wave folding curve
      const createFoldingCurve = (threshold, folds) => {
        const samples = 4096;
        const curve = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
          const x = (i / samples) * 2 - 1;
          let value = x * threshold;

          const foldAmount = Math.abs(value);
          const numFolds = Math.floor(foldAmount / 1.0);

          if (numFolds > 0 && numFolds <= folds) {
            if (numFolds % 2 === 0) {
              value = foldAmount % 1.0;
            } else {
              value = 1.0 - (foldAmount % 1.0);
            }
            value *= Math.sign(x);
          } else if (numFolds > folds) {
            value = Math.sign(value);
          }

          curve[i] = value;
        }

        return curve;
      };

      folder.curve = createFoldingCurve(2.0, 4);
      folder.oversample = '4x';

      inputGain.connect(folder);
      folder.connect(outputGain);
      outputGain.connect(wetGain);
      wetGain.connect(outputMix);

      const inputSplitter = ctx.createGain();
      inputSplitter.connect(inputGain);
      inputSplitter.connect(dryGain);
      dryGain.connect(outputMix);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          folder: folder,
          inputGain: inputGain,
          outputGain: outputGain,
          wet: wetGain,
          dry: dryGain
        },
        utils: {
          createFoldingCurve: createFoldingCurve
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Wave Folder</h2>
      <div class="control-group">
        <label class="control-label">
          Drive <span class="control-value" id="folder-drive-value">2.0</span>
        </label>
        <input type="range" id="folder-drive" min="1" max="10" step="0.1" value="2.0">
      </div>
      <div class="control-group">
        <label class="control-label">
          Folds <span class="control-value" id="folder-folds-value">4</span>
        </label>
        <input type="range" id="folder-folds" min="1" max="12" step="1" value="4">
      </div>
      <div class="control-group">
        <label class="control-label">
          Output <span class="control-value" id="folder-output-value">50%</span>
        </label>
        <input type="range" id="folder-output" min="0" max="100" step="1" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="folder-mix-value">70%</span>
        </label>
        <input type="range" id="folder-mix" min="0" max="100" step="1" value="70">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { folder, inputGain, outputGain, wet, dry } = audioNodes.nodes;
      const { createFoldingCurve } = audioNodes.utils;

      let currentDrive = 2.0;
      let currentFolds = 4;

      const driveSlider = document.getElementById('folder-drive');
      const driveValue = document.getElementById('folder-drive-value');

      driveSlider.addEventListener('input', (e) => {
        currentDrive = parseFloat(e.target.value);
        folder.curve = createFoldingCurve(currentDrive, currentFolds);
        params.drive = currentDrive;
        driveValue.textContent = currentDrive.toFixed(1);
      });

      const foldsSlider = document.getElementById('folder-folds');
      const foldsValue = document.getElementById('folder-folds-value');

      foldsSlider.addEventListener('input', (e) => {
        currentFolds = parseInt(e.target.value);
        folder.curve = createFoldingCurve(currentDrive, currentFolds);
        params.folds = currentFolds;
        foldsValue.textContent = currentFolds;
      });

      const outputSlider = document.getElementById('folder-output');
      const outputValue = document.getElementById('folder-output-value');

      outputSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        outputGain.gain.value = gain;
        params.output = gain;
        outputValue.textContent = Math.round(percent) + '%';
      });

      const mixSlider = document.getElementById('folder-mix');
      const mixValue = document.getElementById('folder-mix-value');

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
      drive: 2.0,
      folds: 4,
      output: 0.5,
      mix: 0.7
    },
    save: (params) => ({
      drive: params.drive,
      folds: params.folds,
      output: params.output,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { folder, outputGain, wet, dry } = audioNodes.nodes;
      const { createFoldingCurve } = audioNodes.utils;

      if (saved.drive !== undefined && saved.folds !== undefined) {
        folder.curve = createFoldingCurve(saved.drive, saved.folds);
        params.drive = saved.drive;
        params.folds = saved.folds;
        document.getElementById('folder-drive').value = saved.drive;
        document.getElementById('folder-drive-value').textContent = saved.drive.toFixed(1);
        document.getElementById('folder-folds').value = saved.folds;
        document.getElementById('folder-folds-value').textContent = saved.folds;
      }
      if (saved.output !== undefined) {
        outputGain.gain.value = saved.output;
        params.output = saved.output;
        document.getElementById('folder-output').value = saved.output * 100;
        document.getElementById('folder-output-value').textContent = Math.round(saved.output * 100) + '%';
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('folder-mix').value = saved.mix * 100;
        document.getElementById('folder-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Wave Folder] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Wave Folder] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Wave Folder] Module unloading');
    }
  }
};

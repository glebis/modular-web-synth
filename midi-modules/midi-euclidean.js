// MIDI Euclidean Rhythm Filter Module
// Filters MIDI events based on Euclidean rhythm patterns

/**
 * Generate Euclidean rhythm pattern
 * Distributes N pulses across M steps as evenly as possible
 */
function euclideanRhythm(pulses, steps) {
  if (pulses > steps) pulses = steps;
  if (pulses < 0) pulses = 0;
  if (steps < 1) steps = 1;

  const pattern = new Array(steps).fill(false);
  const bucket = [];

  for (let i = 0; i < steps; i++) {
    bucket[i] = (pulses / steps) * (i + 1);
  }

  let prev = 0;
  for (let i = 0; i < steps; i++) {
    if (Math.floor(bucket[i]) > prev) {
      pattern[i] = true;
      prev = Math.floor(bucket[i]);
    }
  }

  return pattern;
}

/**
 * Rotate pattern by offset steps
 */
function rotatePattern(pattern, offset) {
  const rotated = [...pattern];
  offset = offset % rotated.length;
  for (let i = 0; i < offset; i++) {
    rotated.push(rotated.shift());
  }
  return rotated;
}

export default {
  id: "midi-euclidean",
  name: "Euclidean Rhythm",
  version: "1.0.0",

  process: (event, params) => {
    // Only process note-on events for rhythm filtering
    if (event.type === 'noteon' && event.velocity > 0) {
      // Check if current step is active in pattern
      const shouldPass = params.pattern[params.currentStep];

      // Advance step
      params.currentStep = (params.currentStep + 1) % params.steps;

      // Update UI indicator if available
      if (params.updateUI) {
        params.updateUI(params.currentStep);
      }

      // Return event if pattern allows, null to block
      return shouldPass ? event : null;
    }

    // Pass through all non-note-on events
    return event;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Euclidean Rhythm</h2>
      <div class="control-group">
        <label class="control-label">
          Pulses: <span class="control-value" id="euclid-pulses-value">5</span>
        </label>
        <input type="range" id="euclid-pulses" min="1" max="32" value="5">
      </div>
      <div class="control-group">
        <label class="control-label">
          Steps: <span class="control-value" id="euclid-steps-value">16</span>
        </label>
        <input type="range" id="euclid-steps" min="1" max="32" value="16">
      </div>
      <div class="control-group">
        <label class="control-label">
          Offset: <span class="control-value" id="euclid-offset-value">0</span>
        </label>
        <input type="range" id="euclid-offset" min="0" max="31" value="0">
      </div>
      <div class="control-group">
        <button id="euclid-regenerate" class="seq-transport-btn">Regenerate</button>
        <button id="euclid-reset" class="seq-transport-btn">Reset</button>
      </div>
      <div id="euclid-pattern" style="
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        gap: 4px;
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #00ff00;
        background: #0a0a0a;
      ">
        <!-- Pattern visualization will be inserted here -->
      </div>
    `,
    bindEvents: (instance, params) => {
      const pulsesSlider = document.getElementById('euclid-pulses');
      const pulsesValue = document.getElementById('euclid-pulses-value');
      const stepsSlider = document.getElementById('euclid-steps');
      const stepsValue = document.getElementById('euclid-steps-value');
      const offsetSlider = document.getElementById('euclid-offset');
      const offsetValue = document.getElementById('euclid-offset-value');
      const regenerateBtn = document.getElementById('euclid-regenerate');
      const resetBtn = document.getElementById('euclid-reset');
      const patternDisplay = document.getElementById('euclid-pattern');

      // Set initial values
      pulsesSlider.value = params.pulses;
      pulsesValue.textContent = params.pulses;
      stepsSlider.value = params.steps;
      stepsValue.textContent = params.steps;
      offsetSlider.value = params.offset;
      offsetValue.textContent = params.offset;

      /**
       * Update pattern visualization
       */
      const updatePatternDisplay = () => {
        // Adjust grid columns based on steps
        const cols = params.steps <= 16 ? params.steps : 16;
        patternDisplay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        patternDisplay.innerHTML = '';

        for (let i = 0; i < params.pattern.length; i++) {
          const cell = document.createElement('div');
          cell.className = 'euclid-step';
          cell.dataset.step = i;
          cell.style.cssText = `
            width: 100%;
            height: 40px;
            border: 1px solid #00ff00;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: ${params.pattern[i] ? '#0a0a0a' : '#333'};
            background: ${params.pattern[i] ? '#00ff00' : '#0a0a0a'};
            transition: all 0.1s;
          `;
          cell.textContent = i + 1;
          patternDisplay.appendChild(cell);
        }
      };

      /**
       * Regenerate pattern from current parameters
       */
      const regeneratePattern = () => {
        const basePattern = euclideanRhythm(params.pulses, params.steps);
        params.pattern = rotatePattern(basePattern, params.offset);
        params.currentStep = 0;
        updatePatternDisplay();
      };

      /**
       * Highlight current step during playback
       */
      params.updateUI = (currentStep) => {
        const cells = patternDisplay.querySelectorAll('.euclid-step');
        cells.forEach((cell, i) => {
          if (i === (currentStep - 1 + params.steps) % params.steps) {
            // Highlight the step that just played
            cell.style.borderColor = '#ffaa00';
            cell.style.borderWidth = '2px';
            cell.style.boxShadow = '0 0 8px #ffaa00';
          } else {
            cell.style.borderColor = '#00ff00';
            cell.style.borderWidth = '1px';
            cell.style.boxShadow = 'none';
          }
        });
      };

      // Event listeners
      pulsesSlider.addEventListener('input', (e) => {
        params.pulses = parseInt(e.target.value);
        pulsesValue.textContent = params.pulses;
        // Auto-regenerate on change
        regeneratePattern();
      });

      stepsSlider.addEventListener('input', (e) => {
        params.steps = parseInt(e.target.value);
        stepsValue.textContent = params.steps;
        offsetSlider.max = params.steps - 1;
        // Auto-regenerate on change
        regeneratePattern();
      });

      offsetSlider.addEventListener('input', (e) => {
        params.offset = parseInt(e.target.value);
        offsetValue.textContent = params.offset;
        // Auto-regenerate on change
        regeneratePattern();
      });

      regenerateBtn.addEventListener('click', () => {
        regeneratePattern();
      });

      resetBtn.addEventListener('click', () => {
        params.currentStep = 0;
        params.pulses = 5;
        params.steps = 16;
        params.offset = 0;
        pulsesSlider.value = params.pulses;
        pulsesValue.textContent = params.pulses;
        stepsSlider.value = params.steps;
        stepsValue.textContent = params.steps;
        offsetSlider.value = params.offset;
        offsetValue.textContent = params.offset;
        regeneratePattern();
      });

      // Initial pattern display
      updatePatternDisplay();
    }
  },

  state: {
    defaults: {
      pulses: 5,
      steps: 16,
      offset: 0,
      currentStep: 0,
      pattern: euclideanRhythm(5, 16),
      updateUI: null // Will be set by bindEvents
    }
  }
};

// MIDI Velocity Curve Module
// Adjusts note velocity with curve and range controls

export default {
  id: "midi-velocity",
  name: "Velocity Curve",
  version: "1.0.0",

  process: (event, params) => {
    if (!params.enabled) return event;
    if (event.type !== 'noteon') return event;

    let velocity = event.velocity;

    // Apply curve (exponential)
    velocity = Math.pow(velocity / 127, params.curve) * 127;

    // Apply range compression
    velocity = params.min + (velocity / 127) * (params.max - params.min);

    // Clamp to valid range
    velocity = Math.max(1, Math.min(127, Math.floor(velocity)));

    return {
      ...event,
      velocity
    };
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Velocity Curve</h2>
      <div class="control-group">
        <label class="control-label">
          <input type="checkbox" id="velocity-enabled"> Enabled
        </label>
      </div>
      <div class="control-group">
        <label class="control-label">
          Curve <span class="control-value" id="velocity-curve-value">1.0</span>
        </label>
        <input type="range" id="velocity-curve" min="0.1" max="3.0" step="0.1" value="1.0">
      </div>
      <div class="control-group">
        <label class="control-label">
          Min <span class="control-value" id="velocity-min-value">1</span>
        </label>
        <input type="range" id="velocity-min" min="1" max="127" value="1">
      </div>
      <div class="control-group">
        <label class="control-label">
          Max <span class="control-value" id="velocity-max-value">127</span>
        </label>
        <input type="range" id="velocity-max" min="1" max="127" value="127">
      </div>
      <div style="font-size: 10px; color: #555; margin-top: 5px;">
        Curve &lt; 1.0: softer response<br>
        Curve &gt; 1.0: harder response<br>
        Min/Max: compress velocity range
      </div>
    `,
    bindEvents: (instance, params) => {
      const enabledCheckbox = document.getElementById('velocity-enabled');
      enabledCheckbox.addEventListener('change', (e) => {
        params.enabled = e.target.checked;
      });

      const curveSlider = document.getElementById('velocity-curve');
      const curveValue = document.getElementById('velocity-curve-value');
      curveSlider.addEventListener('input', (e) => {
        params.curve = parseFloat(e.target.value);
        curveValue.textContent = e.target.value;
      });

      const minSlider = document.getElementById('velocity-min');
      const minValue = document.getElementById('velocity-min-value');
      minSlider.addEventListener('input', (e) => {
        params.min = parseInt(e.target.value);
        minValue.textContent = e.target.value;
      });

      const maxSlider = document.getElementById('velocity-max');
      const maxValue = document.getElementById('velocity-max-value');
      maxSlider.addEventListener('input', (e) => {
        params.max = parseInt(e.target.value);
        maxValue.textContent = e.target.value;
      });
    }
  },

  state: {
    defaults: {
      enabled: false,
      curve: 1.0,
      min: 1,
      max: 127
    }
  }
};

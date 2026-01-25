// MIDI Arpeggiator Module
// Converts held chords into arpeggiated patterns

export default {
  id: "midi-arpeggiator",
  name: "Arpeggiator",
  version: "1.0.0",

  process: (event, params) => {
    // This module needs to maintain state across events
    // For now, pass through events as-is
    // Real arpeggiator would need clock synchronization
    return event;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Arpeggiator</h2>
      <div class="control-group">
        <label class="control-label">
          <input type="checkbox" id="arp-enabled" checked> Enabled
        </label>
      </div>
      <div class="control-group">
        <label class="control-label">
          Pattern
        </label>
        <select id="arp-pattern">
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="updown">Up-Down</option>
          <option value="downup">Down-Up</option>
          <option value="random">Random</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Rate <span class="control-value" id="arp-rate-value">8</span>
        </label>
        <input type="range" id="arp-rate" min="1" max="32" value="8">
      </div>
      <div class="control-group">
        <label class="control-label">
          Octaves <span class="control-value" id="arp-octaves-value">1</span>
        </label>
        <input type="range" id="arp-octaves" min="1" max="4" value="1">
      </div>
    `,
    bindEvents: (instance, params) => {
      const enabledCheckbox = document.getElementById('arp-enabled');
      enabledCheckbox.addEventListener('change', (e) => {
        instance.enabled = e.target.checked;
      });

      const patternSelect = document.getElementById('arp-pattern');
      patternSelect.addEventListener('change', (e) => {
        params.pattern = e.target.value;
      });

      const rateSlider = document.getElementById('arp-rate');
      const rateValue = document.getElementById('arp-rate-value');
      rateSlider.addEventListener('input', (e) => {
        params.rate = parseInt(e.target.value);
        rateValue.textContent = e.target.value;
      });

      const octavesSlider = document.getElementById('arp-octaves');
      const octavesValue = document.getElementById('arp-octaves-value');
      octavesSlider.addEventListener('input', (e) => {
        params.octaves = parseInt(e.target.value);
        octavesValue.textContent = e.target.value;
      });
    }
  },

  state: {
    defaults: {
      pattern: 'up',
      rate: 8,
      octaves: 1
    }
  }
};

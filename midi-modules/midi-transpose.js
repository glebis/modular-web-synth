// MIDI Transpose Module
// Shifts notes up or down by semitones

export default {
  id: "midi-transpose",
  name: "Transpose",
  version: "1.0.0",

  process: (event, params) => {
    if (event.type !== 'noteon' && event.type !== 'noteoff') return event;

    // Ensure params.semitones has a valid value
    const semitones = (params && typeof params.semitones === 'number') ? params.semitones : 0;
    const transposedNote = Math.max(0, Math.min(127, event.note + semitones));

    return {
      ...event,
      note: transposedNote
    };
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Transpose</h2>
      <div class="control-group">
        <label class="control-label">
          Semitones <span class="control-value" id="transpose-value">0</span>
        </label>
        <input type="range" id="transpose-semitones" min="-24" max="24" value="0">
      </div>
      <div class="control-group" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="transpose-btn" data-value="-12">-1 Oct</button>
        <button class="transpose-btn" data-value="-7">-5th</button>
        <button class="transpose-btn" data-value="-5">-4th</button>
        <button class="transpose-btn" data-value="0">Reset</button>
        <button class="transpose-btn" data-value="5">+4th</button>
        <button class="transpose-btn" data-value="7">+5th</button>
        <button class="transpose-btn" data-value="12">+1 Oct</button>
      </div>
    `,
    bindEvents: (instance, params) => {
      // Ensure semitones is initialized
      if (typeof params.semitones !== 'number') {
        params.semitones = 0;
      }

      const slider = document.getElementById('transpose-semitones');
      const valueDisplay = document.getElementById('transpose-value');

      const updateDisplay = () => {
        const val = params.semitones;
        valueDisplay.textContent = val > 0 ? `+${val}` : val;
      };

      // Initialize display
      slider.value = params.semitones;
      updateDisplay();

      slider.addEventListener('input', (e) => {
        params.semitones = parseInt(e.target.value);
        updateDisplay();
      });

      // Quick preset buttons
      const buttons = document.querySelectorAll('.transpose-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const value = parseInt(btn.dataset.value);
          params.semitones = value;
          slider.value = value;
          updateDisplay();
        });
      });
    }
  },

  state: {
    defaults: {
      semitones: 0
    }
  }
};

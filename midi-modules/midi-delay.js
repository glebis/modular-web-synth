// MIDI Delay Module
// Creates delayed copies of MIDI notes

export default {
  id: "midi-delay",
  name: "MIDI Delay",
  version: "1.0.0",

  process: (event, params) => {
    if (!params.enabled) return event;
    if (event.type !== 'noteon') return event;

    // Store original event
    const events = [event];

    // Create delayed copies
    for (let i = 1; i <= params.repeats; i++) {
      const delayTime = params.time * i;
      const velocity = Math.max(1, Math.floor(event.velocity * Math.pow(params.feedback, i)));

      // Schedule delayed event
      setTimeout(() => {
        if (window.MIDICore && window.MIDICore.midi) {
          window.MIDICore.midi.processMIDIEvent({
            ...event,
            velocity,
            timestamp: performance.now()
          });
        }
      }, delayTime);
    }

    return events;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>MIDI Delay</h2>
      <div class="control-group">
        <label class="control-label">
          <input type="checkbox" id="mididelay-enabled"> Enabled
        </label>
      </div>
      <div class="control-group">
        <label class="control-label">
          Time <span class="control-value" id="mididelay-time-value">500 ms</span>
        </label>
        <input type="range" id="mididelay-time" min="50" max="2000" step="10" value="500">
      </div>
      <div class="control-group">
        <label class="control-label">
          Feedback <span class="control-value" id="mididelay-feedback-value">0.7</span>
        </label>
        <input type="range" id="mididelay-feedback" min="0" max="1" step="0.05" value="0.7">
      </div>
      <div class="control-group">
        <label class="control-label">
          Repeats <span class="control-value" id="mididelay-repeats-value">3</span>
        </label>
        <input type="range" id="mididelay-repeats" min="1" max="8" value="3">
      </div>
    `,
    bindEvents: (instance, params) => {
      const enabledCheckbox = document.getElementById('mididelay-enabled');
      enabledCheckbox.addEventListener('change', (e) => {
        params.enabled = e.target.checked;
      });

      const timeSlider = document.getElementById('mididelay-time');
      const timeValue = document.getElementById('mididelay-time-value');
      timeSlider.addEventListener('input', (e) => {
        params.time = parseInt(e.target.value);
        timeValue.textContent = e.target.value + ' ms';
      });

      const feedbackSlider = document.getElementById('mididelay-feedback');
      const feedbackValue = document.getElementById('mididelay-feedback-value');
      feedbackSlider.addEventListener('input', (e) => {
        params.feedback = parseFloat(e.target.value);
        feedbackValue.textContent = e.target.value;
      });

      const repeatsSlider = document.getElementById('mididelay-repeats');
      const repeatsValue = document.getElementById('mididelay-repeats-value');
      repeatsSlider.addEventListener('input', (e) => {
        params.repeats = parseInt(e.target.value);
        repeatsValue.textContent = e.target.value;
      });
    }
  },

  state: {
    defaults: {
      enabled: false,
      time: 500,
      feedback: 0.7,
      repeats: 3
    }
  }
};

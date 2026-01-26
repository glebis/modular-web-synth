// Check page status and console from the browser console
// Copy-paste this into Chrome DevTools Console

console.log('=== AI DRUM MACHINE TEST REPORT ===\n');

// 1. Check status steps
console.log('1. STATUS CHECKS:');
for (let i = 1; i <= 4; i++) {
  const el = document.getElementById(`step-${i}`);
  if (el) {
    const state = el.className.includes('done') ? '✓' :
                  el.className.includes('error') ? '✗' : '○';
    console.log(`${state} Step ${i}: ${el.textContent}`);
  }
}

// 2. NexusUI status
console.log('\n2. NEXUS UI STATUS:');
console.log('NexusUI loaded:', typeof Nexus !== 'undefined');
console.log('Nexus version:', typeof Nexus !== 'undefined' ? Nexus.version : 'N/A');
console.log('nexusControls global:', typeof window.nexusControls !== 'undefined');
if (window.nexusControls) {
  console.log('- oscilloscope:', !!window.nexusControls.oscilloscope);
  console.log('- bpmDial:', !!window.nexusControls.bpmDial);
  console.log('- masterSlider:', !!window.nexusControls.masterSlider);
}

// 3. DOM elements
console.log('\n3. DOM ELEMENTS:');
const oscilloscope = document.getElementById('ai-oscilloscope');
console.log('Oscilloscope element:', !!oscilloscope);
if (oscilloscope) {
  const canvas = oscilloscope.querySelector('canvas');
  console.log('Oscilloscope canvas:', !!canvas);
  if (canvas) {
    console.log('Canvas size:', canvas.width + 'x' + canvas.height);
  }
}

const bpmDial = document.getElementById('ai-bpm-dial-viz');
console.log('BPM dial element:', !!bpmDial);
console.log('BPM dial has canvas:', !!bpmDial?.querySelector('canvas'));

const masterSlider = document.getElementById('ai-master-slider');
console.log('Master slider element:', !!masterSlider);
console.log('Master slider has canvas:', !!masterSlider?.querySelector('canvas'));

// 4. UI component visibility
console.log('\n4. UI COMPONENT VISIBILITY:');
const components = [
  { id: 'ai-oscilloscope', name: 'Oscilloscope' },
  { id: 'ai-bpm-dial-viz', name: 'BPM Dial' },
  { id: 'ai-master-slider', name: 'Master Slider' },
  { id: 'ai-prompt', name: 'Prompt Input' },
  { id: 'ai-generate-single', name: 'Generate Button' }
];

components.forEach(comp => {
  const el = document.getElementById(comp.id);
  if (el) {
    const rect = el.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    console.log(`${comp.name}: ${visible ? '✓ visible' : '✗ hidden'} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
  } else {
    console.log(`${comp.name}: ✗ not found`);
  }
});

// 5. Audio context
console.log('\n5. AUDIO CONTEXT:');
if (window.aiDrumMachine) {
  console.log('aiDrumMachine global:', !!window.aiDrumMachine);
  console.log('Audio context:', !!window.aiDrumMachine.audioContext);
  console.log('Audio nodes:', !!window.aiDrumMachine.audioNodes);
  console.log('Params:', !!window.aiDrumMachine.params);
}

console.log('\n=== END TEST REPORT ===');

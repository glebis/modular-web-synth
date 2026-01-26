// Quick test to verify oscilloscope connection fix
// Run with: node test-oscilloscope-fix.js

import { readFileSync } from 'fs';

console.log('🔍 Verifying Oscilloscope Fix...\n');

const moduleContent = readFileSync('./modules/drum-machine-ai.js', 'utf-8');

// Check for AnalyserNode creation
const hasAnalyserCreation = moduleContent.includes('ctx.createAnalyser()');
const hasFFTSize = moduleContent.includes('analyser.fftSize = 2048');
const hasCorrectConnection = moduleContent.includes('oscilloscope.connect(analyser)');
const noWrongConnection = !moduleContent.includes('oscilloscope.connect(audioNodes.nodes.masterGain)');

console.log('✓ Checks:');
console.log(`  ${hasAnalyserCreation ? '✓' : '✗'} Creates AnalyserNode`);
console.log(`  ${hasFFTSize ? '✓' : '✗'} Sets FFT size`);
console.log(`  ${hasCorrectConnection ? '✓' : '✗'} Connects oscilloscope to analyser`);
console.log(`  ${noWrongConnection ? '✓' : '✗'} No direct GainNode connection`);

if (hasAnalyserCreation && hasFFTSize && hasCorrectConnection && noWrongConnection) {
  console.log('\n✅ All checks passed - oscilloscope fix is correct!');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed');
  process.exit(1);
}

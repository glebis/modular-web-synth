// Test AI Drum Machine in headless Chrome
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Capture JavaScript errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // Navigate to page
  console.log('Navigating to http://localhost:5555/test-ai-drum.html...');
  await page.goto('http://localhost:5555/test-ai-drum.html', {
    waitUntil: 'networkidle0',
    timeout: 10000
  });

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Click "Load Module" button
  console.log('Clicking "Load Module" button...');
  await page.click('button');

  // Wait for module to initialize
  await page.waitForTimeout(3000);

  // Get status checks
  const statusChecks = await page.evaluate(() => {
    const checks = [];
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`step-${i}`);
      if (el) {
        checks.push({
          step: i,
          text: el.textContent,
          state: el.className.includes('done') ? 'done' :
                 el.className.includes('error') ? 'error' : 'pending'
        });
      }
    }
    return checks;
  });

  // Check if NexusUI elements exist
  const nexusCheck = await page.evaluate(() => {
    return {
      nexusLoaded: typeof Nexus !== 'undefined',
      nexusVersion: typeof Nexus !== 'undefined' ? Nexus.version : 'not loaded',
      oscilloscopeExists: !!document.getElementById('ai-oscilloscope'),
      oscilloscopeHasCanvas: !!document.querySelector('#ai-oscilloscope canvas'),
      bpmDialExists: !!document.getElementById('ai-bpm-dial-viz'),
      masterSliderExists: !!document.getElementById('ai-master-slider'),
      nexusControlsGlobal: typeof window.nexusControls !== 'undefined'
    };
  });

  // Take screenshot
  console.log('Taking screenshot...');
  await page.screenshot({
    path: '/Users/glebkalinin/ai_projects/modular-web-synth/test-screenshot.png',
    fullPage: true
  });

  // Print results
  console.log('\n=== STATUS CHECKS ===');
  statusChecks.forEach(check => {
    const icon = check.state === 'done' ? '✓' :
                 check.state === 'error' ? '✗' : '○';
    console.log(`${icon} Step ${check.step}: ${check.text} [${check.state}]`);
  });

  console.log('\n=== NEXUS UI CHECK ===');
  console.log('NexusUI loaded:', nexusCheck.nexusLoaded);
  console.log('NexusUI version:', nexusCheck.nexusVersion);
  console.log('Oscilloscope element exists:', nexusCheck.oscilloscopeExists);
  console.log('Oscilloscope has canvas:', nexusCheck.oscilloscopeHasCanvas);
  console.log('BPM dial exists:', nexusCheck.bpmDialExists);
  console.log('Master slider exists:', nexusCheck.masterSliderExists);
  console.log('nexusControls global:', nexusCheck.nexusControlsGlobal);

  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type}]`, msg.text);
  });

  if (errors.length > 0) {
    console.log('\n=== JAVASCRIPT ERRORS ===');
    errors.forEach(err => {
      console.error('ERROR:', err.message);
      if (err.stack) console.error(err.stack);
    });
  } else {
    console.log('\n=== NO JAVASCRIPT ERRORS ===');
  }

  await browser.close();

  // Exit with error code if there were errors
  process.exit(errors.length > 0 ? 1 : 0);
})();

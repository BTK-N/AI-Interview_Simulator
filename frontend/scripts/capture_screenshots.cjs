const { spawn, execSync, execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 5174;
const FRONTEND_DIR = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(FRONTEND_DIR, 'docs', 'screenshots');

// Relative optional artifact destination (no hardcoded user paths)
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.resolve(FRONTEND_DIR, '..', 'brain', 'screenshots');

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Step 1 / Step 6: Find all process IDs listening on target TCP port via netstat
 */
function getPortPIDs(port) {
  try {
    const output = execSync('netstat -ano', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const pids = new Set();
    for (const line of output.split('\n')) {
      if (line.includes(`:${port}`) && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(pid) && pid > 0) {
          pids.add(pid);
        }
      }
    }
    return Array.from(pids);
  } catch {
    return [];
  }
}

/**
 * Kill entire process tree by PID on Windows
 */
function killPID(pid) {
  try {
    execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Step 3: Poll localhost until responsive or timeout
 */
function pollServerReady(url, timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve(Date.now() - start);
        } else {
          retry();
        }
      });
      req.on('error', () => retry());
      req.setTimeout(500, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`));
      } else {
        setTimeout(check, 250);
      }
    };

    check();
  });
}

/**
 * Step 4: Capture single screenshot using isolated headless Chrome instance
 */
function captureScreenshot(url, outFileName, windowSize = '1440,1024') {
  const destPath = path.join(SCREENSHOTS_DIR, outFileName);
  const tempDir = path.join(os.tmpdir(), `chrome_shot_uid_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const tempShot = path.join(os.tmpdir(), `shot_${Date.now()}_${Math.random().toString(36).slice(2)}.png`);

  fs.mkdirSync(tempDir, { recursive: true });

  const startTime = Date.now();
  try {
    execFileSync(CHROME_PATH, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      `--user-data-dir=${tempDir}`,
      '--virtual-time-budget=3000',
      `--screenshot=${tempShot}`,
      `--window-size=${windowSize}`,
      url
    ], { timeout: 25000, stdio: 'ignore' });

    if (fs.existsSync(tempShot)) {
      fs.copyFileSync(tempShot, destPath);
      const stats = fs.statSync(destPath);
      const elapsed = Date.now() - startTime;
      console.log(`    ✓ [${elapsed}ms] Saved: ${outFileName} (${stats.size.toLocaleString()} bytes)`);

      // Optional sync if directory exists
      if (fs.existsSync(ARTIFACT_DIR)) {
        try {
          fs.copyFileSync(destPath, path.join(ARTIFACT_DIR, outFileName));
        } catch {}
      }
    } else {
      throw new Error(`Screenshot output not generated at ${tempShot}`);
    }
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    try { if (fs.existsSync(tempShot)) fs.unlinkSync(tempShot); } catch {}
  }
}

async function run() {
  const suiteStartTime = Date.now();
  console.log('======================================================');
  console.log('  Autonomous Screenshot Capture Suite — Full Lifecycle');
  console.log('======================================================');

  // STEP 1 — Check Port 5174 and terminate previous owner if any
  console.log(`\n[Step 1/7] Inspecting port ${PORT}...`);
  const initialPids = getPortPIDs(PORT);
  if (initialPids.length > 0) {
    console.log(`  ⚠ Port ${PORT} currently bound by PID(s): ${initialPids.join(', ')}. Terminating...`);
    for (const pid of initialPids) {
      killPID(pid);
    }
    await sleep(500);
    const postKillPids = getPortPIDs(PORT);
    if (postKillPids.length > 0) {
      console.error(`  ✗ [FATAL] Unable to clear port ${PORT}. Still owned by: ${postKillPids.join(', ')}`);
      process.exit(1);
    }
    console.log(`  ✓ Port ${PORT} forcefully freed.`);
  } else {
    console.log(`  ✓ Port ${PORT} is clean and available.`);
  }

  // STEP 2 — Spawn Vite preview server directly via Node (shell: false, zero cmd wrapper)
  console.log(`\n[Step 2/7] Spawning Vite preview directly on port ${PORT} (--strictPort)...`);
  const viteBin = path.join(FRONTEND_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
  const previewProcess = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: FRONTEND_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  const previewPid = previewProcess.pid;
  console.log(`  ✓ Spawned Vite preview process (PID: ${previewPid}, shell: false).`);

  let isKilled = false;
  const cleanupPreview = () => {
    if (isKilled) return;
    isKilled = true;
    console.log(`\n[Step 5/7] Terminating Vite preview child tree (PID: ${previewPid})...`);
    if (previewPid) {
      killPID(previewPid);
    }
    try {
      previewProcess.kill('SIGTERM');
    } catch {}
  };

  process.on('SIGINT', () => { cleanupPreview(); process.exit(1); });
  process.on('SIGTERM', () => { cleanupPreview(); process.exit(1); });
  process.on('exit', () => { cleanupPreview(); });

  try {
    // STEP 3 — Poll until ready
    console.log(`\n[Step 3/7] Polling http://localhost:${PORT}/ until responsive...`);
    const readyElapsed = await pollServerReady(`http://localhost:${PORT}/`, 10000);
    console.log(`  ✓ Server responsive in ${readyElapsed}ms.`);

    // STEP 4 — Capture each screenshot sequentially (All 8 screens)
    console.log(`\n[Step 4/7] Capturing all 8 screenshots sequentially (Chrome Headless, virtual-time-budget=3000)...`);
    const targets = [
      {
        url: `http://localhost:${PORT}/`,
        file: 'phase4-screen1-landing.png',
        size: '1440,1050',
        name: 'Screen 1 — Executive Interview Suite Landing',
      },
      {
        url: `http://localhost:${PORT}/?view=interview`,
        file: 'phase4-screen2-interview.png',
        size: '1440,960',
        name: 'Screen 2 — Live Interview Spatial Cockpit',
      },
      {
        url: `http://localhost:${PORT}/?view=interview&stage=feedback`,
        file: 'phase4-screen3-analysis.png',
        size: '1440,1024',
        name: 'Screen 3 — Multimodal Evaluation Overlay',
      },
      {
        url: `http://localhost:${PORT}/?view=interview&stage=feedback&popover=1`,
        file: 'phase4-screen3-filler-popover.png',
        size: '1440,1024',
        name: 'Screen 3 — Contextual Filler Word Coaching Popover',
      },
      {
        url: `http://localhost:${PORT}/?view=report`,
        file: 'phase4-screen4-report.png',
        size: '1440,1400',
        name: 'Screen 4 — Executive Performance Dossier',
      },
      {
        url: `http://localhost:${PORT}/?view=report&expanded=1`,
        file: 'phase4-screen4-expanded.png',
        size: '1440,2200',
        name: 'Screen 4 — Collapsible Per-Question Rubric Accordion',
      },
      {
        url: `http://localhost:${PORT}/?view=history`,
        file: 'phase5-history.png',
        size: '1440,1400',
        name: 'Screen 5 — Longitudinal Interview Archive & Analytics',
      },
      {
        url: `http://localhost:${PORT}/?view=history&empty=1`,
        file: 'phase5-history-empty.png',
        size: '1440,900',
        name: 'Screen 5 — Standalone Empty State',
      },
    ];

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      console.log(`  [${i + 1}/${targets.length}] ${t.name}:`);
      captureScreenshot(t.url, t.file, t.size);
    }
    console.log('  ✓ All 8 screenshots captured and verified.');

  } catch (err) {
    console.error(`  ✗ [FATAL ERROR] In execution phase:`, err.message);
    cleanupPreview();
    process.exit(1);
  }

  // STEP 5 — Kill Vite preview
  cleanupPreview();
  await sleep(1000);

  // STEP 6 — Verify port 5174 is free
  console.log(`\n[Step 6/7] Verifying port ${PORT} release status...`);
  const lingeringPids = getPortPIDs(PORT);
  if (lingeringPids.length > 0) {
    console.warn(`  ⚠ Lingering process on port ${PORT}: PID(s) ${lingeringPids.join(', ')}. Force killing...`);
    for (const pid of lingeringPids) {
      killPID(pid);
    }
    await sleep(500);
    const finalPids = getPortPIDs(PORT);
    if (finalPids.length > 0) {
      console.error(`  ✗ [FAIL] Port ${PORT} remains locked by PID(s): ${finalPids.join(', ')}`);
      process.exit(1);
    }
  }
  console.log(`  ✓ Port ${PORT} verified completely free.`);

  // STEP 7 — Exit cleanly with summary
  const totalDuration = ((Date.now() - suiteStartTime) / 1000).toFixed(1);
  console.log(`\n[Step 7/7] Lifecycle complete. Total execution time: ${totalDuration}s.`);
  console.log('======================================================');
  console.log('  SUCCESS — Zero orphan processes, clean port release.');
  console.log('======================================================\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal unhandled error:', err);
  process.exit(1);
});

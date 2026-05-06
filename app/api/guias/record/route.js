import { getGuideById, updateGuide } from "@/data/guides";
import { tmpdir } from "os";
import { join } from "path";

function generatePlaywrightScript(steps, recordDir, options = {}) {
  const stepsJson = JSON.stringify(steps, null, 2);
  const playwrightPath = join(process.cwd(), "node_modules", "playwright", "index.mjs");
  const useCdp = options.cdpUrl ? "true" : "false";
  const cdpUrl = options.cdpUrl || "";

  return `
import { chromium } from ${JSON.stringify(playwrightPath)};
import { mkdirSync, existsSync } from 'fs';
import { execSync, spawn } from 'child_process';

const steps = ${stepsJson};
const recordDir = ${JSON.stringify(recordDir)};
const useCdp = ${useCdp};
const cdpUrl = ${JSON.stringify(cdpUrl)};
const videoPath = recordDir + '/recording.webm';

if (!existsSync(recordDir)) mkdirSync(recordDir, { recursive: true });

async function record() {
  let browser, context, page, isOwnBrowser = false;
  let ffmpegProcess = null;

  if (useCdp) {
    try {
      browser = await chromium.connectOverCDP(cdpUrl);
      const contexts = browser.contexts();
      context = contexts[0] || await browser.newContext({
        viewport: { width: 1280, height: 720 },
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
      });
      page = await context.newPage();
      console.log('Connected to Chrome via CDP');

      // Start screen recording via ffmpeg x11grab
      ffmpegProcess = spawn('ffmpeg', [
        '-y', '-f', 'x11grab', '-framerate', '10',
        '-video_size', '1280x720', '-i', ':0.0',
        '-c:v', 'libvpx', '-b:v', '1M', '-an',
        videoPath
      ], { stdio: ['pipe', 'pipe', 'pipe'] });

      // Give ffmpeg time to start
      await new Promise(r => setTimeout(r, 1000));
      console.log('Screen recording started');
    } catch (err) {
      console.error('CDP connection failed, falling back to headless:', err.message);
      if (ffmpegProcess) { ffmpegProcess.kill('SIGINT'); ffmpegProcess = null; }
    }
  }

  if (!page) {
    isOwnBrowser = true;
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    context = await browser.newContext({
      recordVideo: { dir: recordDir, size: { width: 1280, height: 720 } },
      viewport: { width: 1280, height: 720 },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
    });
    page = await context.newPage();
    console.log('Using headless browser with video recording');
  }

  for (const step of steps) {
    try {
      console.log('Step:', step.description || step.action);
      switch (step.action) {
        case 'navigate':
          await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
            console.log('Navigation timeout, continuing...');
          });
          break;
        case 'click':
          await page.click(step.selector, { timeout: 10000 }).catch(() => {
            console.log('Click failed for:', step.selector);
          });
          break;
        case 'type':
          if (step.selector) {
            await page.click(step.selector, { timeout: 10000 }).catch(() => {});
          }
          await page.keyboard.type(step.text || '', { delay: 40 });
          break;
        case 'wait':
          await new Promise(r => setTimeout(r, step.duration || 2000));
          break;
        case 'scroll':
          await page.evaluate((y) => window.scrollBy(0, y), step.distance || 300);
          break;
        case 'press':
          await page.keyboard.press(step.key || 'Enter');
          break;
        case 'screenshot': {
          const screenshotPath = step.path
            ? (step.path.startsWith('/') ? step.path : recordDir + '/' + step.path)
            : recordDir + '/screenshot-' + Date.now() + '.png';
          await page.screenshot({ path: screenshotPath });
          break;
        }
      }
      await new Promise(r => setTimeout(r, step.pauseAfter || 1500));
    } catch (err) {
      console.error('Step failed:', step.description, err.message);
    }
  }

  // Stop recording
  if (ffmpegProcess) {
    ffmpegProcess.stdin.write('q');
    await new Promise(r => setTimeout(r, 2000));
    ffmpegProcess.kill('SIGINT');
    await new Promise(r => setTimeout(r, 1000));
    console.log('VIDEO_PATH:' + videoPath);
    await page.close();
  } else if (isOwnBrowser) {
    const video = page.video();
    await page.close();
    await context.close();
    const recordedPath = await video.path();
    console.log('VIDEO_PATH:' + recordedPath);
    await browser.close();
  }
}

record().catch(console.error);
`;
}

async function runRecording(guideId, steps) {
  const fs = await import("fs");
  const { exec } = await import("child_process");

  const recordingsDir = join(process.cwd(), "public", "recordings");
  if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

  const tempDir = join(tmpdir(), "guia-record-" + guideId + "-" + Date.now());
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const cdpUrl = "http://localhost:29229";
  const scriptFile = join(tempDir, "record-script.mjs");
  fs.writeFileSync(scriptFile, generatePlaywrightScript(steps, tempDir, { cdpUrl }), "utf-8");

  const command = "node " + JSON.stringify(scriptFile);
  const cwd = process.cwd();
  const env = { ...process.env, NODE_PATH: join(cwd, "node_modules"), DISPLAY: ":0" };

  return new Promise((resolve, reject) => {
    exec(command, { timeout: 300000, cwd, env }, (error, stdout, stderr) => {
      const output = (stdout || "") + (stderr || "");
      const videoMatch = output.match(/VIDEO_PATH:(.+)/);

      if (videoMatch) {
        const videoSrc = videoMatch[1].trim();
        const fileName = guideId + "-" + Date.now() + ".webm";
        const destPath = join(recordingsDir, fileName);
        try { fs.copyFileSync(videoSrc, destPath); } catch { /* ok */ }
        resolve({ videoUrl: "/recordings/" + fileName, output });
      } else if (!error) {
        resolve({ videoUrl: null, output });
      } else {
        reject(new Error("Recording failed: " + output.slice(-500)));
      }
    });
  });
}

export async function POST(request) {
  try {
    const { guideId, steps } = await request.json();
    if (!guideId) return Response.json({ error: "guideId obrigatório" }, { status: 400 });

    const guide = getGuideById(guideId);
    if (!guide) return Response.json({ error: "Guia não encontrado" }, { status: 404 });

    const stepsToRecord = steps || guide.recording?.steps || [];
    if (stepsToRecord.length === 0) {
      return Response.json({ error: "Nenhum passo de gravação definido." }, { status: 400 });
    }

    updateGuide(guideId, {
      recording: { ...guide.recording, status: "recording", steps: stepsToRecord },
    });

    try {
      const result = await runRecording(guideId, stepsToRecord);
      updateGuide(guideId, {
        recording: { videoUrl: result.videoUrl, steps: stepsToRecord, status: "completed" },
      });
      return Response.json({ success: true, videoUrl: result.videoUrl });
    } catch (err) {
      updateGuide(guideId, {
        recording: { ...guide.recording, status: "failed", error: err.message },
      });
      return Response.json({ error: err.message }, { status: 500 });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

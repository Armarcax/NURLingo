// Test script to generate Armenian audio using edge-tts module directly
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

async function testArmenianTTS() {
  console.log('Testing Armenian TTS...\n');

  const testText = 'Բարև';
  const outputPath = '/tmp/test_armenian.mp3';

  // Method 1: Try using edge-tts directly via node_modules
  console.log('Method 1: Using edge-tts as module...');
  try {
    // Import edge-tts functionality
    const edgeTtsPath = path.join(__dirname, '../node_modules/edge-tts');

    if (fs.existsSync(edgeTtsPath)) {
      // Read edge-tts package to understand its API
      const pkgJson = JSON.parse(fs.readFileSync(path.join(edgeTtsPath, 'package.json'), 'utf8'));
      console.log('edge-tts version:', pkgJson.version);

      // Try to use the Python version via subprocess
      const { default: edgeTTS } = await import('edge-tts');
      console.log('edge-tts imported:', typeof edgeTTS);
    }
  } catch (e) {
    console.log('Method 1 failed:', e.message);
  }

  // Method 2: Try Python edge-tts directly
  console.log('\nMethod 2: Using Python edge-tts...');
  try {
    const result = await execAsync('python3 -m edge_tts --text "Բարև" --voice hy-AM-SiranushNeural --write-media /tmp/test_py.mp3', { timeout: 30000 });
    if (fs.existsSync('/tmp/test_py.mp3')) {
      console.log('SUCCESS: Generated /tmp/test_py.mp3');
      console.log('Size:', fs.statSync('/tmp/test_py.mp3').size);
      return;
    }
  } catch (e) {
    console.log('Method 2 failed:', e.message);
  }

  // Method 3: Use edge-tts Python script
  console.log('\nMethod 3: Using edge_tts Python module...');
  const pythonScript = `
import asyncio
try:
    import edge_tts
    async def main():
        communicate = edge_tts.Communicate("Բարև", "hy-AM-SiranushNeural")
        await communicate.save("/tmp/test_edge.mp3")
        print("SUCCESS")
    asyncio.run(main())
except Exception as e:
    print(f"Error: {e}")
`;

  try {
    fs.writeFileSync('/tmp/test_edge_tts.py', pythonScript);
    const { stdout, stderr } = await execAsync('python3 /tmp/test_edge_tts.py', { timeout: 30000 });
    console.log('Python output:', stdout || stderr);
    if (fs.existsSync('/tmp/test_edge.mp3')) {
      console.log('SUCCESS: Generated /tmp/test_edge.mp3');
      console.log('Size:', fs.statSync('/tmp/test_edge.mp3').size);
      return;
    }
  } catch (e) {
    console.log('Method 3 failed:', e.message);
  }

  // Method 4: Check available voices
  console.log('\nMethod 4: Check available voices...');
  try {
    const { stdout } = await execAsync('python3 -c "import edge_tts; import asyncio; voices = asyncio.run(edge_tts.list_voices()); print([v[\'ShortName\'] for v in voices if \'hy\' in v[\'ShortName\'].lower() or \'armenian\' in v.get(\'Name\',\'\').lower()])"', { timeout: 30000 });
    console.log('Armenian voices:', stdout);
  } catch (e) {
    console.log('Could not list voices:', e.message);
  }

  console.log('\nChecking if Python edge-tts is installed...');
  try {
    const { stdout } = await execAsync('pip3 show edge-tts 2>/dev/null || pip show edge-tts 2>/dev/null', { timeout: 10000 });
    console.log(stdout || 'Not installed via pip');
  } catch (e) {
    console.log('pip check failed');
  }
}

testArmenianTTS().catch(console.error);

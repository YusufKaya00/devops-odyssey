import { execSync } from 'child_process';

const PORTS = [5001, 5173];

function cleanPorts() {
  console.log('🧹 Cleaning up stale development ports...');
  
  for (const port of PORTS) {
    try {
      if (process.platform === 'win32') {
        // Windows: Find PID using netstat
        try {
          const stdout = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
          const lines = stdout.split('\n');
          const pids = new Set();
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 5) {
              const localAddress = parts[1];
              const state = parts[3];
              const pid = parts[4];
              // Ensure we are matching the port exactly (e.g. :5001, not :50012)
              if (localAddress.endsWith(`:${port}`) && state === 'LISTENING') {
                pids.add(pid);
              }
            }
          }
          
          for (const pid of pids) {
            console.log(`  [Windows] Terminating process ${pid} listening on port ${port}...`);
            execSync(`taskkill /F /PID ${pid}`);
          }
        } catch {
          // findstr returns exit code 1 if no matches are found, which is expected
        }
      } else {
        // Unix (macOS/Linux): Find and kill process using lsof
        try {
          const stdout = execSync(`lsof -t -i:${port}`, { encoding: 'utf8' });
          const pids = stdout.trim().split('\n').filter(Boolean);
          for (const pid of pids) {
            console.log(`  [Unix] Terminating process ${pid} listening on port ${port}...`);
            execSync(`kill -9 ${pid}`);
          }
        } catch {
          // lsof returns exit code 1 if no process matches
        }
      }
    } catch (err) {
      console.warn(`  Warning: Could not clean port ${port}:`, err.message);
    }
  }
  
  console.log('✨ Port cleanup completed.');
}

cleanPorts();

import { execSync } from 'child_process';

console.log('🚀 Starting cross-platform build process...');

try {
  console.log('\n📦 Step 1: Compiling TypeScript (tsc -b)...');
  execSync('npx tsc -b', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation succeeded.');

  console.log('\n📦 Step 2: Running Vite production build (vite build)...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Vite build completed successfully.');

  console.log('\n✨ Build process finished successfully!');
} catch (error) {
  console.error('\n❌ Build process failed during execution.');
  process.exit(1);
}

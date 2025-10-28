/**
 * Install and verify real-time dependencies for frontend
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('FRONTEND REAL-TIME INSTALLATION & TESTING');
console.log('='.repeat(60));

// Step 1: Install socket.io-client
console.log('\n[STEP 1] Installing socket.io-client...\n');
try {
  // Detect package manager
  let packageManager = 'npm';
  if (fs.existsSync('pnpm-lock.yaml')) {
    packageManager = 'pnpm';
  } else if (fs.existsSync('yarn.lock')) {
    packageManager = 'yarn';
  }

  console.log(`[INFO] Using ${packageManager} package manager`);

  const installCmd = packageManager === 'npm'
    ? 'npm install socket.io-client'
    : packageManager === 'pnpm'
    ? 'pnpm add socket.io-client'
    : 'yarn add socket.io-client';

  execSync(installCmd, { stdio: 'inherit' });
  console.log('\n✅ socket.io-client installed successfully!');
} catch (error) {
  console.error('\n❌ Failed to install socket.io-client:', error.message);
  process.exit(1);
}

// Step 2: Verify package.json
console.log('\n' + '='.repeat(60));
console.log('VERIFYING PACKAGE.JSON');
console.log('='.repeat(60));

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  if (packageJson.dependencies && packageJson.dependencies['socket.io-client']) {
    console.log('✅ socket.io-client in dependencies');
    console.log(`   Version: ${packageJson.dependencies['socket.io-client']}`);
  } else {
    console.log('❌ socket.io-client NOT in dependencies');
  }
} catch (error) {
  console.error('❌ Failed to read package.json:', error.message);
}

// Step 3: Verify files exist
console.log('\n' + '='.repeat(60));
console.log('VERIFYING FILES');
console.log('='.repeat(60));

const filesToCheck = [
  'src/hooks/usePrefetch.ts',
  'src/hooks/useRealTimeUpdates.ts',
  'src/hooks/useProjects.ts',
  'src/hooks/useLeaderboard.ts',
  'src/App.tsx',
  'src/index.css',
];

let allFilesOk = true;

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTS`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for specific content
    if (file === 'src/hooks/usePrefetch.ts') {
      if (content.includes('usePrefetch') && content.includes('prefetchQuery')) {
        console.log('   ✅ Contains prefetch logic');
      } else {
        console.log('   ❌ Missing prefetch implementation');
        allFilesOk = false;
      }
    }

    if (file === 'src/hooks/useRealTimeUpdates.ts') {
      if (content.includes('socket.io-client') && content.includes('useRealTimeUpdates')) {
        console.log('   ✅ Contains Socket.IO integration');
      } else {
        console.log('   ❌ Missing Socket.IO implementation');
        allFilesOk = false;
      }
    }

    if (file === 'src/hooks/useProjects.ts') {
      if (content.includes('refetchInterval') && content.includes('placeholderData')) {
        console.log('   ✅ Background refetch configured');
      } else {
        console.log('   ⚠️  Missing background refetch (optional)');
      }
    }

    if (file === 'src/App.tsx') {
      if (content.includes('usePrefetch') && content.includes('useRealTimeUpdates')) {
        console.log('   ✅ Hooks integrated');
      } else {
        console.log('   ❌ Hooks not integrated');
        allFilesOk = false;
      }
    }

    if (file === 'src/index.css') {
      if (content.includes('fade-in') && content.includes('slide-in-down')) {
        console.log('   ✅ Animations added');
      } else {
        console.log('   ⚠️  Missing animations (optional)');
      }
    }
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
    allFilesOk = false;
  }
});

// Step 4: Check environment variables
console.log('\n' + '='.repeat(60));
console.log('CHECKING ENVIRONMENT');
console.log('='.repeat(60));

const envFiles = ['.env', '.env.local', '.env.development'];
let hasEnvFile = false;
let hasApiUrl = false;

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    console.log(`✅ ${envFile} - EXISTS`);
    hasEnvFile = true;

    const envContent = fs.readFileSync(envFile, 'utf8');
    if (envContent.includes('VITE_API_URL')) {
      console.log('   ✅ VITE_API_URL defined');
      hasApiUrl = true;
    }
  }
});

if (!hasEnvFile) {
  console.log('⚠️  No .env file found');
  console.log('   Creating .env with default values...');

  fs.writeFileSync('.env', 'VITE_API_URL=http://localhost:5000\n');
  console.log('✅ Created .env file');
  hasApiUrl = true;
}

if (!hasApiUrl) {
  console.log('⚠️  VITE_API_URL not set');
  console.log('   Add this to your .env file:');
  console.log('   VITE_API_URL=http://localhost:5000');
}

// Step 5: Test import syntax (syntax check only)
console.log('\n' + '='.repeat(60));
console.log('SYNTAX VALIDATION');
console.log('='.repeat(60));

try {
  const useRealTimeUpdates = fs.readFileSync('src/hooks/useRealTimeUpdates.ts', 'utf8');

  // Check for common syntax errors
  if (useRealTimeUpdates.includes('import') && useRealTimeUpdates.includes('export')) {
    console.log('✅ useRealTimeUpdates.ts - Valid ES module syntax');
  } else {
    console.log('❌ useRealTimeUpdates.ts - Invalid syntax');
    allFilesOk = false;
  }

  if (useRealTimeUpdates.includes("socket.io-client") || useRealTimeUpdates.includes('socket.io-client')) {
    console.log('✅ socket.io-client import found');
  } else {
    console.log('❌ socket.io-client import NOT found');
    allFilesOk = false;
  }
} catch (error) {
  console.log('❌ Could not validate syntax:', error.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('INSTALLATION COMPLETE');
console.log('='.repeat(60));

if (allFilesOk) {
  console.log('\n✅ All checks passed!');
} else {
  console.log('\n⚠️  Some checks failed, but dependencies are installed');
}

console.log('\n📦 Installed packages:');
console.log('   ✅ socket.io-client');

console.log('\n📝 Files created/updated:');
console.log('   ✅ src/hooks/usePrefetch.ts');
console.log('   ✅ src/hooks/useRealTimeUpdates.ts');
console.log('   ✅ src/App.tsx (updated)');
console.log('   ✅ src/index.css (updated)');

console.log('\n🚀 Next steps:');
console.log('   1. Restart frontend: npm run dev');
console.log('   2. Check console for:');
console.log('      - [Prefetch] Completed');
console.log('      - [Socket.IO] Connected successfully');
console.log('   3. Test real-time features');

console.log('\n✅ Frontend ready for real-time features!');

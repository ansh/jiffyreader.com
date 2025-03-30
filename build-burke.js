const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

// Function to wait for a directory to exist
const waitForDirectory = async (dir, timeout = 10000) => {
  const start = Date.now()
  while (!fs.existsSync(dir)) {
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for directory: ${dir}`)
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Create the build function
async function buildBurke() {
  // Build the bundle
  await esbuild.build({
    entryPoints: ['src/core/burke.entry.ts'],
    bundle: true,
    outfile: 'burke.bundled.js',
    platform: 'browser',
    format: 'iife',
    minify: true,
    target: ['es2020'],
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  })

  // Read the bundled file
  const bundledContent = fs.readFileSync('burke.bundled.js', 'utf8')

  // Copy to dev and prod directories
  const directories = [
    'build/chrome-mv3-dev',
    'build/chrome-mv3-prod',
    'build/firefox-mv2-dev',
    'build/firefox-mv2-prod',
    'build/safari-mv2-dev',
    'build/safari-mv2-prod',
    'build/opera-mv3-dev',
    'build/opera-mv3-prod'
  ]

  for (const dir of directories) {
    try {
      console.log(`Waiting for directory: ${dir}`)
      await waitForDirectory(dir)
      // Write the bundled file
      fs.writeFileSync(path.join(dir, 'burke.js'), bundledContent)
      console.log(`Added burke.js to ${dir}`)
    } catch (err) {
      console.log(`Skipping ${dir} - ${err.message}`)
    }
  }

  // Clean up the temporary file
  fs.unlinkSync('burke.bundled.js')
}

buildBurke().catch(err => {
  console.error(err)
  process.exit(1)
}) 
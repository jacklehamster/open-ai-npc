async function bundle() {
  return Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    minify: false,
    // sourcemap: "external",
    target: "node",
  }).catch(console.error);
}

const result = await bundle();

if (!result?.success) {
  console.error('Build failed:', result?.logs);
  process.exit(1);
}

console.log("Done bundling.")

export { }

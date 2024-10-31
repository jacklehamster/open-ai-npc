async function bundle() {
  return Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    minify: true,
    sourcemap: "external",
    target: "node",
  }).catch(console.error);
}

await bundle();

export { }

async function bundle() {
  await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    minify: true,
    sourcemap: "external",
    target: "node",
  });
}

await bundle();

export { }

export const deps = {
  console: {
    error: console.error,
  },
  fs: {
    readDir: Deno.readDir,
    readTextFile: Deno.readTextFile,
  },
};

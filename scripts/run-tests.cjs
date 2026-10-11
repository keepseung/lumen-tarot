/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS 테스트 로더는 require hook을 사용합니다. */
// 설치된 TypeScript로 테스트를 실행해 추가 다운로드 없이 검증합니다.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};
const suites = process.argv.slice(2);
for (const suite of suites.length ? suites : ['saju', 'tarot', 'readings']) {
  if (!['saju', 'tarot', 'readings'].includes(suite)) throw new Error(`Unknown test suite: ${suite}`);
  require(path.join(__dirname, `test-${suite}.ts`));
}

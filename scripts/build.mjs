import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const code = await readFile(new URL('src/client.js', root), 'utf8');
const modelUI = await readFile(new URL('src/model-ui.js', root), 'utf8');
let css = await readFile(new URL('src/style.css', root), 'utf8');
for (const [token, filename] of [
  ['__OPENAI_SANS_REGULAR__', 'OpenAISans-Regular-c56711d328c4.woff2'],
  ['__OPENAI_SANS_MEDIUM__', 'OpenAISans-Medium-7b9c963f9063.woff2'],
  ['__OPENAI_SANS_SEMIBOLD__', 'OpenAISans-Semibold-e259229c5327.woff2']
]) {
  const data = await readFile(new URL(`assets/fonts/${filename}`, root));
  css = css.replaceAll(token, `data:font/woff2;base64,${data.toString('base64')}`);
}
await mkdir(new URL('lib/', root), { recursive: true });
const body = code.replace("import React from 'react';", "const React = require('react');").replace('export function apply', 'function apply').replace('export const inject', 'const inject');
await writeFile(new URL('lib/client.js', root), `window.__ModuleLoader__.load({id:'dsh-codex-ui',factory:(require)=>{const STYLE=${JSON.stringify(css)};\n${body}\n${modelUI}\nconst safeApply=(ctx)=>{try{return apply(ctx);}catch(error){console.error("dsh-codex-ui activation:",error);throw error;}}; return {apply:safeApply,inject};}});\n`);
console.log('Built dsh-codex-ui client bundle.');


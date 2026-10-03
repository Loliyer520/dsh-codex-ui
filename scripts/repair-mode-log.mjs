import { readFile, writeFile, copyFile, rename } from 'node:fs/promises';
import { zstdDecompressSync, zstdCompressSync, constants } from 'node:zlib';
import { resolve } from 'node:path';

// Run while DSH is stopped. Preserve every record and back up original bytes.
const path = resolve(process.argv[2] || '');
if (!process.argv[2] || !path.endsWith('session.v4.jsonl.zstd')) throw new Error('Provide one exact session.v4.jsonl.zstd path');
const source = await readFile(path);
const frames = [];
let offset = 0, changed = 0, records = 0;
while (offset < source.length) {
  const decoded = zstdDecompressSync(source.subarray(offset), { info: true });
  const length = decoded.engine.bytesWritten;
  if (!length) throw new Error('Invalid frame boundary');
  let frameChanged = false;
  const rows = decoded.buffer.toString('utf8').split('\n').filter(Boolean).map(line => {
    const row = JSON.parse(line);
    records++;
    if (row.type === 'chatgpt-ui/prompt-mode' && row.ignorable !== true) {
      row.ignorable = true; changed++; frameChanged = true;
    }
    return row;
  });
  frames.push(frameChanged ? zstdCompressSync(Buffer.from(rows.map(row => JSON.stringify(row)).join('\n') + '\n'), {
    params: { [constants.ZSTD_c_checksumFlag]: 1 },
  }) : source.subarray(offset, offset + length));
  offset += length;
}
if (changed) {
  const backup = path + '.before-mode-repair-' + Date.now() + '.bak';
  await copyFile(path, backup);
  const temporary = path + '.mode-repair.tmp';
  await writeFile(temporary, Buffer.concat(frames));
  await rename(temporary, path);
  console.log(JSON.stringify({ records, repairedModeRecords: changed, backup }));
} else console.log(JSON.stringify({ records, repairedModeRecords: 0 }));

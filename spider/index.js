import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HttpsProxyAgent from 'https-proxy-agent'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cookie = '';
const file_list_url = 'https://crowdin.com/backend/project/remix-translation/zh-CN/get_files_tree?language_id=55'
const file_export_url = 'https://crowdin.com/backend/project/remix-translation/zh-CN/{id}/export'
const response = await fetch(file_list_url);
const { files_tree } = await response.json();

const file_list = []
for (const key in files_tree) {
  const file = files_tree[key];
  if (file.name.endsWith('.pot')) {
    file_list.push({ id: file.id, name: file.name.replace('.pot', '.po') })
  }
}
console.log(file_list)
for (let index = 0; index < file_list.length; index++) {
  const file = file_list[index];
  const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
  const resp = await fetch(file_export_url.replace('{id}', file.id), { headers: { cookie }, agent: proxyAgent });
  const { url } = await resp.json();
  const resp2 = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/octet-stream' }
  })
  const arrayBuffer = await resp2.arrayBuffer();
  fs.writeFile(path.join(__dirname, `../docs/locale/zh_CN/LC_MESSAGES/${file.name}`), Buffer.from(arrayBuffer), "binary", function (err) {
    if (err) console.error(err);
    else console.log(`${file.name}下载成功`);
  });
}




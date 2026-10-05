const fs=require('node:fs');
const path=require('node:path');
const dir=__dirname;
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const image=`data:image/png;base64,${fs.readFileSync(path.join(dir,'learning.png')).toString('base64')}`;
let html=read('index.html');
html=html.replace(/<link rel="icon" href="favicon\.svg">/,`<link rel="icon" href="data:image/svg+xml;base64,${fs.readFileSync(path.join(dir,'favicon.svg')).toString('base64')}">`);
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,url)=>{
  const name=url.split('?')[0];
  return `<style>\n${read(name)}\n</style>`;
});
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,url)=>{
  const name=url.split('?')[0];
  return `<script>\n${read(name).replaceAll('learning.png',image)}\n</script>`;
});
fs.writeFileSync(path.join(dir,'離線展示.html'),html);
console.log(`Built 離線展示.html (${Math.round(Buffer.byteLength(html)/1024)} KiB)`);

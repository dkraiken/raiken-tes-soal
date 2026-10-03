import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import dns from 'node:dns/promises';
import net from 'node:net';
const app=express(), port=Number(process.env.PORT||3000);
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
app.use(express.json({limit:'2mb'})); app.use(express.static('public'));
function privateIp(ip){if(net.isIPv4(ip)){let[a,b]=ip.split('.').map(Number);return a===10||a===127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===0}let x=ip.toLowerCase();return x==='::1'||x.startsWith('fc')||x.startsWith('fd')||x.startsWith('fe80:')}
async function check(raw){let u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw Error('URL harus http/https');let a=await dns.lookup(u.hostname,{all:true});if(!a.length||a.some(x=>privateIp(x.address)))throw Error('URL jaringan privat ditolak');return u}
async function read(raw){let u=await check(raw),c=new AbortController(),t=setTimeout(()=>c.abort(),12000);try{let r=await fetch(u,{signal:c.signal,redirect:'follow',headers:{'User-Agent':'RaikenAI/1.0'}});if(!r.ok)throw Error(`HTTP ${r.status}`);let type=r.headers.get('content-type')||'';if(!type.includes('html')&&!type.includes('text/plain'))throw Error('URL bukan HTML/teks');return {url:r.url,html:await r.text()}}finally{clearTimeout(t)}}
function clean(html){let $=cheerio.load(html);$('script,style,noscript,svg,nav,footer,header').remove();return {title:$('title').first().text().trim(),text:$('body').text(' ').replace(/\s+/g,' ').trim().slice(0,300000)}}
function questions(text){let re=/(?:^|\s)(\d{1,3})[.)]\s+(.+?)(?=\s+\d{1,3}[.)]\s+|$)/g,out=[],m;while((m=re.exec(text))&&out.length<100)out.push({number:+m[1],question:m[2].trim()});return out}
app.get('/api/health',(_,res)=>res.json({ok:true}));
app.post('/api/read-url',async(req,res)=>{try{if(typeof req.body?.url!=='string')throw Error('Masukkan URL');let p=clean((await read(req.body.url.trim())).html),qs=questions(p.text);res.json({ok:true,title:p.title,text:p.text,questions:qs,questionCount:qs.length})}catch(e){res.status(400).json({error:e.message})}});
app.post('/api/solve',async(req,res)=>{try{if(!process.env.OPENAI_API_KEY)throw Error('OPENAI_API_KEY belum dipasang');let qs=(req.body?.questions||[]).slice(0,100);if(!qs.length)throw Error('Belum ada soal');let prompt=`Kamu adalah Raiken AI, asisten belajar. Jawab soal latihan berikut dengan benar. Jika pilihan tersedia, pilih jawabannya dan beri alasan singkat. Jika soal tidak jelas, tandai perlu diperiksa. Kembalikan JSON: {"answers":[{"number":1,"answer":"...","explanation":"...","confidence":"high|medium|low"}]}\nSOAL:\n${JSON.stringify(qs)}`;let r=await client.responses.create({model:process.env.OPENAI_MODEL||'gpt-6-luna',input:prompt});let raw=r.output_text||'';let m=raw.match(/\{[\s\S]*\}/);res.json({ok:true,...JSON.parse(m?m[0]:raw)})}catch(e){res.status(500).json({error:e.message})}});
app.listen(port,'0.0.0.0',()=>console.log(`Raiken AI http://localhost:${port}`));

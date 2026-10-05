# Raiken AI

Web latihan soal untuk membaca halaman HTML publik, mendeteksi soal sederhana, lalu meminta OpenAI Responses API membantu menjawab dan menjelaskan.

## Termux/HP
```bash
pkg update
pkg install nodejs git
npm install
cp .env.example .env
nano .env
npm start
```
Isi `OPENAI_API_KEY` pada `.env`. Jangan upload `.env` ke GitHub.

Model default: `gpt-6-luna`. Model dan Responses API dapat diubah lewat environment variable.

## GitHub
Upload seluruh folder ini ke repo `dkraiken/raiken-ai`, kecuali `.env` dan `node_modules`.

## Hosting
Gunakan hosting Node.js yang mendukung environment variables. Jalankan `npm install` lalu `npm start`; isi `OPENAI_API_KEY` di environment hosting.

Parser URL ini tidak menjamin semua situs bisa dibaca: halaman login, anti-bot, PDF, atau isi yang hanya muncul setelah JavaScript dapat memerlukan parser/API khusus.

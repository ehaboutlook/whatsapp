const express = require('express');
const Parse = require('parse/node');
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // ضروري لو هتشغل محليًا وتقرأ من .env

// إعداد Back4App
Parse.initialize(process.env.APP_ID, process.env.MASTER_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

// إعداد السيرفر
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// إعداد واتساب
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

// استقبال QR Code وإرساله للواجهة
client.on('qr', (qr) => {
  io.emit('qr', qr);
});

// تسجيل الدخول
client.on('ready', () => {
  console.log('✅ WhatsApp Client is ready!');
});

// الرد التلقائي باستخدام Mistral API
client.on('message', async (msg) => {
  console.log('Received message:', msg.body);
  try {
    const payload = {
      agent_id: process.env.MISTRAL_AGENT_ID,
      messages: [{ role: 'user', content: msg.body }],
    };

    const headers = {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(
      'https://api.mistral.ai/v1/agents/completions',
      payload,
      { headers }
    );

    const generatedReply = response.data?.choices?.[0]?.message?.content;
    if (generatedReply) {
      await msg.reply(generatedReply);
      console.log('Sent reply:', generatedReply);
    } else {
      console.error('No reply returned from Mistral API');
    }
  } catch (error) {
    console.error('Error generating reply:', error);
  }
});

// بدء الاتصال بالواتساب
client.initialize();

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

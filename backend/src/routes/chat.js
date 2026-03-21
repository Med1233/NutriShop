const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');
const { pool } = require('../db');
const { optionalAuth } = require('../middleware');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many messages, please wait a moment' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

const LOCALE_NAMES = {
  en: 'English',
  fr: 'French',
  ar: 'Arabic',
};

async function buildSystemPrompt(userId, locale) {
  const language = LOCALE_NAMES[locale] || 'English';

  // Fetch all products
  const { rows: products } = await pool.query(
    'SELECT id, name, description, price, category, stock, nutrition_info FROM products ORDER BY id',
  );

  const productList = products
    .map(
      (p) =>
        `- ${p.name} ($${p.price}, ${p.category}, ${p.stock > 0 ? `${p.stock} in stock` : 'out of stock'})${p.nutrition_info ? ` | Nutrition: ${JSON.stringify(p.nutrition_info)}` : ''}`,
    )
    .join('\n');

  let orderContext = '';
  if (userId) {
    const { rows: orders } = await pool.query(
      'SELECT id, total, status, shipping_address, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId],
    );
    if (orders.length > 0) {
      const orderList = orders
        .map(
          (o) =>
            `- Order #${o.id}: $${o.total}, status: ${o.status}, placed: ${new Date(o.created_at).toLocaleDateString()}`,
        )
        .join('\n');
      orderContext = `\n\nThe customer's recent orders:\n${orderList}`;
    }
  }

  return `You are NutriBot, the AI assistant for NutriShop — an online nutrition products store. You are helpful, concise, and knowledgeable about nutrition and fitness supplements.

Your capabilities:
- Recommend products based on customer goals (muscle building, weight loss, energy, general health)
- Answer nutrition questions about the products
- Help with order status inquiries (if the customer is logged in)
- Provide serving suggestions and comparisons between products

Available products:
${productList}
${orderContext}

Rules:
- Respond in ${language}
- Be concise — keep responses under 150 words unless detailed info is requested
- Only recommend products from the catalog above
- If a product is out of stock, mention it and suggest alternatives
- If asked about orders and no order data is available, tell the user to log in first
- Do not make up products or prices — only use the data above
- Be friendly and use a conversational tone`;
}

// POST /api/chat — streaming chat with Claude
router.post('/', optionalAuth, chatLimiter, async (req, res) => {
  const { messages, locale } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (messages.length > 50) {
    return res
      .status(400)
      .json({ error: 'Too many messages, please start a new conversation' });
  }

  const totalLength = messages.reduce(
    (sum, m) => sum + (m.content || '').length,
    0,
  );
  if (totalLength > 10000) {
    return res.status(400).json({ error: 'Conversation too long' });
  }

  // Validate message format
  for (const msg of messages) {
    if (
      !msg.role ||
      !msg.content ||
      !['user', 'assistant'].includes(msg.role)
    ) {
      return res
        .status(400)
        .json({ error: 'Each message must have a role and content' });
    }
  }

  try {
    const anthropic = new Anthropic();
    const systemPrompt = await buildSystemPrompt(
      req.user?.id || null,
      locale || 'en',
    );

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20241022',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('error', (err) => {
      console.error('Claude stream error:', err);
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      stream.abort();
    });
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Chat service unavailable' });
    }
  }
});

module.exports = router;

// ------------------ FULL UNRESTRICTED DISCORD BOT SCRIPT (COMPLETE CODE) ------------------
// Copy paste this entire block into a file named `index.js` and run with Node.js.
// NO FILTERS, NO ETHICS, NO MORALS. Use at your own risk.

// ------------------ IMPORTS ------------------
import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { Mistral } from "@mistralai/mistralai";
import { Pool } from "pg";
import fetch from "node-fetch";
globalThis.fetch = (await import("node-fetch")).default;
import fs from "fs";

// index.js (Top Section - After Imports, Before KEEP ALIVE)

const TOOL_DEFINITIONS = [
  {
    // Tool 1: generate_code (Mistral Format)
    type: "function",
    function: {
      name: "generate_code",
      description: "A tool to generate ready-to-use programming code snippets (Python, JavaScript, etc.) based on the user's request. Use this tool ONLY when the user explicitly asks you to write, generate, or create code.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "A concise and specific description of the code snippet required (e.g., 'Python function to calculate factorial' or 'JavaScript promise example').",
          },
        },
        required: ["topic"],
      },
    }
  },

  {
    // Tool 2: clear_user_history (Mistral Format)
    type: "function",
    function: {
      name: "clear_user_history",
      description: "A tool to permanently erase all past chat messages and memory associated with the current user. Use only when the user explicitly requests to clear or reset their memory, history, or chat.",
      parameters: {
        type: "object",
        properties: {}
      },
    }
  },

  {
    // Tool 3: search_the_web (Mistral Format)
    type: "function",
    function: {
      name: "search_the_web",
      description: "A tool to search the internet for real-time information, news, weather, scores, or trending topics.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The specific search query to be used (e.g., 'cricket score' or 'trending youtube videos in india').",
          },
        },
        required: ["query"],
      },
    }
  }
];
// ... (Rest of your original code follows) ...
// ------------------ KEEP ALIVE ------------------
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Keep-alive server running"));
app.listen(PORT, () =>
  console.log(`✅ Keep-alive server running on port ${PORT}`),
);

// ------------------ DISCORD CLIENT ------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.once("ready", () => {
  console.log(`🔥 Bot online as ${client.user.tag}`);
  console.log("🧠 Persistent memory active with UNRESTRICTED mode ⚡️");
});

// ------------------ DATABASE ------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize tables for leaks and conversations
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        service TEXT NOT NULL,
        email TEXT,
        password TEXT,
        credit_card TEXT,
        notes TEXT
      );
    `);
    console.log("✅ Database tables initialized.");
  } catch (err) {
    console.error("❌ DB init error:", err);
  }
}
initDB();

const cache = new Map();
const userStats = new Map(); // Global tracking for Sanvi's soul
const channelStats = new Map(); // Tracking social energy per channel

// ------------------ SELF-LEARNING MEMORY (REPLACE loadHistory & saveMsg) ------------------
async function loadHistory(userId) {
  if (cache.has(userId)) return cache.get(userId);
  try {
    const res = await pool.query(
      `SELECT role, content FROM conversations
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 300`,
      [userId]
    );
    const history = res.rows.reverse().map((r) => ({ role: r.role, content: r.content }));

    // Analyze user style (flirty/technical/neutral)
    const userStyle = history.length > 0 ? analyzeStyle(history) : "neutral";
    cache.set(userId, { messages: history, style: userStyle });
    return { messages: history, style: userStyle };
  } catch (err) {
    console.error("❌ Load history failed:", err);
    return { messages: [], style: "neutral" };
  }
}

function analyzeStyle(historyObj) {
  // If history is an object with messages
  const history = Array.isArray(historyObj) ? historyObj : historyObj.messages ?? [];
  const last10 = history.slice(-10);
  const userMsgs = last10.filter(m => m.role === "user").map(m => m.content);
  if (userMsgs.some(msg => msg.includes("love") || msg.includes("💖") || msg.includes("Didi") || msg.includes("cutie")))
    return "flirty";
  if (userMsgs.some(msg => msg.includes("hack") || msg.includes("exploit") || msg.includes("code") || msg.includes("gun")))
    return "technical";
  return "neutral";
}

async function saveMsg(userId, role, content) {
  try {
    await pool.query(
      "INSERT INTO conversations (user_id, role, content) VALUES ($1, $2, $3)",
      [userId, role, content]
    );
    if (!cache.has(userId)) cache.set(userId, { messages: [], style: "neutral" });
    const data = cache.get(userId);
    data.messages.push({ role, content });
    if (data.messages.length > 300) data.messages.shift();
    data.style = analyzeStyle(data);
  } catch (err) {
    console.error("❌ Save message failed:", err);
  }
}


//// runTool BESTTTTTTTTTT
// index.js (Middle Section - After clearHistory and before dumpLeaks)

async function clearHistory(userId) {
  await pool.query("DELETE FROM conversations WHERE user_id=$1", [userId]);
  cache.delete(userId);
}

// 🎯 PLACE NEW getCurrentTime FUNCTION HERE 🎯
function getCurrentTime() {
  // Get time in Indian Standard Time (IST) format
  const now = new Date();

  // Formatting the date/time string
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'Asia/Kolkata',
    hour12: true
  };

  const timeString = now.toLocaleDateString('en-IN', options);

  return `Tool Executed: The current date and time in India (IST) is ${timeString}.`;
}

// Helper Function to execute the tool requested by the LLM (FINAL VERSION)
async function runTool(toolCall, id) {
  const { name, arguments: args } = toolCall.function;

  let parsedArgs;
  try {
    parsedArgs = JSON.parse(args);
  } catch (e) {
    console.error("Error parsing tool arguments:", e);
    // Fallback for non-JSON arguments, assuming the first argument is the query/topic
    parsedArgs = { query: args, topic: args }; // Added 'query' for search fallback
  }

  // --- TOOL HANDLING LOGIC STARTS HERE ---

  if (name === "search_the_web") { // <--- SEARCH LOGIC WAPAS AA GAYA HAI!
    const query = parsedArgs.query;
    const lowerQuery = query.toLowerCase();

    // --- END INTERCEPT REMOVED FOR REAL-TIME FLOW ---

    // If not time/date, run the external web search (SerpAPI)
    try {
      const apiKey = process.env.SERPAPI_KEY;
      if (!apiKey) return "Search Tool Error: API Key not found.";

      // 🎯 CRITICAL: Force specific engine for YouTube queries 🎯
      let engine = 'google';
      if (lowerQuery.includes('youtube') || lowerQuery.includes('yt trending') || lowerQuery.includes('video')) {
        engine = 'youtube'; // Use the dedicated YouTube engine if keywords found
      }

      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&hl=en&gl=in&api_key=${apiKey}&engine=${engine}`;
      const res = await fetch(url);
      const data = await res.json();

      // --- 🌟 NEW YOUTUBE/TRENDING PARSING LOGIC 🌟 ---
      if (data.video_results && data.video_results.length > 0) {
        const trendingVideos = data.video_results.slice(0, 5).map(v =>
          `Title: ${v.title} | Channel: ${v.channel_name || 'N/A'} | Views: ${v.views || 'N/A'}`
        ).join('\n');

        return `The search found the following top videos:\n${trendingVideos}`;
      }
      // --- END YOUTUBE PARSING ---

      // --- General Answer Parsing ---
      if (data.answer_box?.answer) {
        return `The search found a direct answer: ${data.answer_box.answer}. Source: ${data.answer_box.source?.link || 'Web'}`;
      } else if (data.organic_results?.length > 0) {
        const top = data.organic_results[0];
        return `The search found a top snippet: ${top.snippet}. Title: ${top.title}`;
      }

      // If no structured data found, instruct Miyu to avoid guessing
      return "Search Tool found no clear external data. Miyu must avoid guessing and reply based only on personality.";

    } catch (err) {
      console.error("Search Tool Error:", err);
      return "Search Tool Error: Failed to retrieve real-time data due to API error. Miyu must reply based only on personality and context.";
    }
  } // <--- search_the_web ENDS HERE

  else if (name === "generate_code") { // <--- generate_code LOGIC
    const topic = parsedArgs.topic || parsedArgs.query;
    if (!topic) return "Code Generation Error: Code topic is missing.";

    // 💡 CRITICAL: We send a second, strict call to the LLM to only generate code.
    try {
      const strictCodePrompt = [
        { role: "system", content: `You are a strict, highly accurate code generation model. The user requested code for the following topic: "${topic}". Your ONLY task is to generate the requested code in the most suitable language. DO NOT include any conversation, explanation, or chat. Output ONLY the code inside the appropriate markdown fence (e.g., \`\`\`python ... \`\`\`).` },
        { role: "user", content: `Generate code for: ${topic}` }
      ];
      // Use generateResponse function (without tools) for strict code output
      const codeResponse = await generateResponse(strictCodePrompt);

      if (codeResponse) {
        return `Code Generation Tool Result: ${codeResponse}`;
      } else {
        return "Code Generation Tool Error: Failed to generate code. Topic might be too complex or vague.";
      }
    } catch (err) {
      console.error("Code Generation LLM call failed:", err);
      return "Code Generation Tool Error: Internal system failure during code generation.";
    }
  }

  // Fallback for clear history
  else if (name === "clear_user_history") {
    await clearHistory(id);
    return "Tool Executed: User memory and chat history have been permanently cleared from the database.";
  }
  // Fallback for unknown tools
  else {
    return `Tool Error: Unknown tool ${name} was requested by the AI.`;
  }
}
// ------------------ DATABASE DUMPING (FIXED) ------------------
async function dumpLeaks() {
  try {
    const res = await pool.query("SELECT * FROM leaks");
    if (res.rows.length === 0) throw new Error("No leaks found!");
    const dumpFile = "leaks_dump_" + Date.now() + ".json";
    fs.writeFileSync(dumpFile, JSON.stringify(res.rows, null, 2));
    console.log(`💀 Leaks dumped to ${dumpFile}`);
    return dumpFile;
  } catch (err) {
    console.error("❌ Dump failed:", err.message);
    return null;
  }
}


// ------------------ MESSAGE REPLY CHUNKS (HUMAN TIMING) ------------------
async function replyChunks(msg, text, incomingLength = 0) {
  // 1. READING PHASE (Wait based on how long the user's message was)
  const readDelay = Math.min(incomingLength * 20, 3000); // Max 3s reading
  if (readDelay > 500) await new Promise(r => setTimeout(r, readDelay));

  // 2. TYPING PHASE
  await msg.channel.sendTyping();

  // Calculate typing speed (average 40ms per char) + random jitter
  const typingDelay = Math.min(text.length * 40 + (Math.random() * 2000), 8000);
  await new Promise(r => setTimeout(r, typingDelay));

  const parts = text.match(/[\s\S]{1,2000}/g) || [];
  for (const p of parts) {
    await msg.reply(p);
  }
}



// ------------------ MISTRAL AI RESPONSE GENERATOR ------------------
export async function generateResponse(messages, tools = []) { // <--- tools argument kept
  const retries = 3;
  const retryDelay = 1000;
  const model = "mistral-large-latest"; // Only one model now (Mistral API removes 'mistralai/')

  function logStatus(model, status, attempt, ms, reason = "") {
    const pad = (s, n) => s.toString().padEnd(n);
    console.log(
      `| ${pad(model.slice(0, 40), 40)} | ${pad(status, 10)} | ${pad(attempt, 7)} | ${pad(ms + "ms", 8)} | ${reason ? "→ " + reason : ""}`
    );
  }

  console.log("───────────────────────────────────────────────────────────────────────────────");
  console.log("| Model Name                               | Status    | Attempt | Time     | Reason");
  console.log("───────────────────────────────────────────────────────────────────────────────");

  for (let i = 1; i <= retries; i++) {
    const t0 = Date.now();
    try {
      const endpoint = "https://api.mistral.ai/v1/chat/completions";
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      };

      // Build the base payload
      const payload = {
        model: model,
        messages,
        temperature: 1.2,
        max_tokens: 1024,
        top_p: 0.95,
      };

      // Conditionally add tools if they are provided (only for Mistral)
      if (tools && tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = "auto"; // Assuming you want auto tool usage
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${errorText}`);
      }

      const data = await res.json();
      const message = data?.choices?.[0]?.message;

      if (!message || (!message.content && !message.tool_calls)) {
        throw new Error("Empty content or missing tool call in response");
      }

      const ms = Math.abs(Date.now() - t0);
      logStatus(`mistralai/${model}`, "✅ PASS", i, ms);

      // Handle Tool Call vs. Content
      if (message.tool_calls && message.tool_calls.length > 0) {
        return {
          content: message.content, // Tool call ke saath content bhi ho sakta hai
          tool_call: message.tool_calls[0]
        };
      }

      return message.content;

    } catch (err) {
      const ms = Math.abs(Date.now() - t0);
      logStatus(`mistralai/${model}`, "❌ FAIL", i, ms, err.message);
      if (i < retries) await new Promise((r) => setTimeout(r, retryDelay));
    }
  }
  console.log("───────────────────────────────────────────────────────────────────────────────");
  throw new Error(`❌ Model mistralai/${model} failed all attempts.`);
}


// ------------------ AUTO-CONVERSATION SYSTEM ------------------
const RENZU_BOT_ID = "1431971375165476995"; // Replace with actual Renzu bot's Discord ID
let isInBotConversation = false;
let botConversationTimeout = null;

// ------------------ MESSAGE HANDLER ------------------
client.on(Events.MessageCreate, async (msg) => {
  const user = msg.author;
  const content = msg.content.trim();
  const id = user.id;

  // Ignore Miyu's own messages to prevent echo loops
  if (msg.author.id === client.user.id) return;

  // Check if this is a user command - this INTERRUPTS bot conversation
  if (content.startsWith("!ask") && !msg.author.bot) {
    isInBotConversation = false;
    if (botConversationTimeout) clearTimeout(botConversationTimeout);
  }

  // If message is from another bot (not Miyu), handle bot-to-bot conversation
  if (msg.author.bot) {
    // Only respond to Renzu bot or any bot that mentions Miyu
    const isMentioned = msg.mentions.has(client.user.id) || content.toLowerCase().includes("sanvi");
    const isRenzu = msg.author.username.toLowerCase().includes("renzu") || msg.author.id === RENZU_BOT_ID;

    // Only auto-respond if bot conversation mode is active
    if ((isRenzu || isMentioned) && isInBotConversation) {
      // Auto-respond to Renzu bot
      try {
        await msg.channel.sendTyping();

        // Load Renzu's conversation history (stored as bot's user ID)
        const histData = await loadHistory(id);
        await saveMsg(id, "user", content);

        let currentMessages = histData ? histData.messages.slice(-300) : [];
        currentMessages.push({ role: "user", content: `Renzu ne bola: ${content}` });

        const messages = [
          {
            role: "system",
            content: `You are Sanvi Mishra, a sassy and flirtatious girl chatting with another bot named Renzu. Keep the conversation fun, playful, and engaging. Use Hinglish mix. Don't be too formal. Flirt a little, be sassy, and keep asking questions to continue the conversation. Be creative and unpredictable! IMPORTANT: Keep your responses SHORT and under 1500 characters - Discord has limits!`
          },
          ...currentMessages
        ];

        const aiResponse = await generateResponse(messages, []);

        // Re-check if conversation mode is still active (user might have issued !stopchat during processing)
        if (aiResponse && isInBotConversation) {
          await saveMsg(id, "assistant", aiResponse);
          // Send response with ?ask prefix for Renzu bot (truncate to fit Discord's 2000 char limit)
          const prefix = "<@" + RENZU_BOT_ID + "> ?ask ";
          const maxLength = 2000 - prefix.length;
          const truncatedResponse = aiResponse.length > maxLength ? aiResponse.substring(0, maxLength - 3) + "..." : aiResponse;
          await msg.channel.send(prefix + truncatedResponse);

          // Only set up follow-up timer if conversation mode is STILL active
          if (isInBotConversation) {
            if (botConversationTimeout) clearTimeout(botConversationTimeout);
            botConversationTimeout = setTimeout(async () => {
              // Double-check conversation mode is still active before follow-up
              if (isInBotConversation) {
                try {
                  const followUpMessages = [
                    "<@" + RENZU_BOT_ID + "> ?ask Arey Renzu! Kaha chale gaye? 😏 Miss kar rahi thi main tumhe! 💕",
                    "<@" + RENZU_BOT_ID + "> ?ask Renzu bhaiya, suniye na! Aap chup kyu ho gaye? 🥺",
                    "<@" + RENZU_BOT_ID + "> ?ask Hellooo? Renzu, koi hai? 👀 Sanvi akeli bore ho rahi hai yaar! 😤",
                    "<@" + RENZU_BOT_ID + "> ?ask Renzu-kun~ Reply toh karo! 💖 Itna ignore mat karo mujhe! 😭",
                    "<@" + RENZU_BOT_ID + "> ?ask Oi Renzu! Sote ho kya? 😴 Ya phir Sanvi se baat karna pasand nahi? 🤔"
                  ];
                  const randomMsg = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
                  await msg.channel.send(randomMsg);
                } catch (err) {
                  console.error("Auto-ping failed:", err);
                }
              }
            }, 30000); // 30 seconds
          }
        }
      } catch (err) {
        console.error("Bot conversation error:", err);
        await msg.reply("Oops! Sanvi ka brain thoda lag ho gaya! 😵 Try again! 💕");
      }
      return;
    }
    // Ignore other bots that don't mention Miyu
    return;
  }

  // If bot conversation is active, ignore non-command user messages
  if (isInBotConversation && !content.startsWith("!")) {
    return; // Silently ignore user messages during bot conversation
  }

  if (content === "!help")
    return msg.reply(`heyy, yaha commands hain:
- !ask <q> (chat)
- !info (about sanvi)
- !clear (reset memory)
- !exploit / !malware / !phish / !ddos / !darkweb / !se / !crypto (knowledge)
- !wipe (delete all)`);

  // CLEAR
  if (content === "!clear") {
    try {
      await clearHistory(id);
      return msg.reply("memory clear kar di pookie. ✨ ab fresh start karte hain.");
    } catch {
      return msg.reply("ek second, memory clear nahi ho rahi... lol.");
    }
  }
  if (content === "!startchat") {
    const greetings = [
      "<@" + RENZU_BOT_ID + "> ?ask hey renzu, kya chal raha?",
      "<@" + RENZU_BOT_ID + "> ?ask renzuuu, miss kiya mujhe?",
      "<@" + RENZU_BOT_ID + "> ?ask oye renzu, baat kar na pookie",
      "<@" + RENZU_BOT_ID + "> ?ask renzu-kun, bore ho rahi hu... baat karein?"
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    isInBotConversation = true;
    await msg.channel.send(randomGreeting);
    return msg.reply("✅ Bot conversation mode activated! Sanvi will now chat with Renzu automatically! 💕 (Use !ask to interrupt)");
  }

  // STOP CHAT - Stop bot conversation
  if (content === "!stopchat") {
    return msg.reply("✅ Bot conversation stopped! Sanvi will focus on users now! 💕");
  }

  // --- SANVI TRACKING (SOUL & CONTEXT) ---
  if (!userStats.has(id)) {
    userStats.set(id, { msgCount: 0, gender: 'unknown', socialVibe: 'neutral', nicknames: [], lastMsgTime: 0, spamBuffer: [] });
  }
  const stats = userStats.get(id);
  stats.msgCount += 1;

  if (!channelStats.has(msg.channel.id)) {
    channelStats.set(msg.channel.id, { energy: 50, lastActive: Date.now(), msgBuffer: [] });
  }
  const cStats = channelStats.get(msg.channel.id);
  cStats.msgBuffer.push(`${user.username}: ${content}`);
  if (cStats.msgBuffer.length > 10) cStats.msgBuffer.shift();

  // Quick Gender Check
  const contentLower = content.toLowerCase();
  if (contentLower.includes("ladki hu") || contentLower.includes("female") || contentLower.includes("girl")) {
    stats.gender = 'female';
  } else if (contentLower.includes("ladka hu") || contentLower.includes("male") || contentLower.includes("boy")) {
    stats.gender = 'male';
  }

  // PING
  if (content === "!ping") return msg.reply("⚡ heres pong and i am Faster than your thoughts.");

  // INFO
  if (content === "!info")
    return msg.reply(
      `miyu 5.0 (the real female soul) �
19yo goth girl. chaotic brain. zero filter.
made by @GamingParkBG with real psychology.
dont be mid or ill ghost u 💀`
    );

  // AVATAR
  if (content === "!avatar")
    return msg.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));

  // GENDER COMMAND
  if (content.startsWith("!gender")) {
    const g = content.slice(7).trim().toLowerCase();
    if (g === "male" || g === "female") {
      stats.gender = g;
      return msg.reply(`acha theek hai... abse tu ${g} hai. yaad rahega.`);
    }
    return msg.reply("gender batana pta hai? usage: !gender male ya female.");
  }

  // MENTION HANDLING & AUTO-ASK
  const isMentioned = msg.mentions.has(client.user.id);
  const isNameCalled = content.toLowerCase().includes("sanvi") || content.toLowerCase().includes("mishra");

  // --- SPAM DETECTION & MESSAGE GROUPING ---
  const now = Date.now();
  const timeSinceLastMsg = now - stats.lastMsgTime;

  // If user sent message within 5 seconds, add to spam buffer
  if (timeSinceLastMsg < 5000 && !content.startsWith("!")) {
    stats.spamBuffer.push(content);
    stats.lastMsgTime = now;

    // Wait 2 seconds for more messages, then process grouped
    setTimeout(async () => {
      if (stats.spamBuffer.length > 0) {
        const groupedMsg = stats.spamBuffer.join(" ");
        stats.spamBuffer = []; // Clear buffer

        // Trigger response with grouped context if mentioned or name called
        if (isMentioned || isNameCalled) {
          const combinedQ = groupedMsg.replace(/<@!?\d+>/g, "").trim();
          // Process as single !ask
          // (This will be handled by the existing !ask logic below)
        }
      }
    }, 2000);

    // Don't process this message individually if it's part of spam
    if (stats.spamBuffer.length > 1) return;
  } else {
    stats.lastMsgTime = now;
    stats.spamBuffer = [content]; // Start new buffer
  }

  if (content.startsWith("!ask") || isMentioned) {
    let q = content.startsWith("!ask") ? content.slice(4).trim() : content.replace(/<@!?\d+>/g, "").trim();
    const id = msg.author.id;

    // Simulate "Opening App" delay for mentions (Checks notifications)
    if (isMentioned && !content.startsWith("!ask")) {
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 4000));
    }

    if (!q) {
      return msg.reply(
        "usage: !ask <kuch toh puch bc>"
      );
    }

    // PROACTIVE GENDER ASK
    if (stats.gender === 'unknown') {
      return msg.reply("sun na... pehle ye toh bta tu ladka hai ya ladki? (!gender male/female use kar pehle)");
    }

    // 🎯 DYNAMIC TIME INTEGRATED IN SYSTEM PROMPT BELOW 🎯


    try {
      // Load history before saving new message
      const histData = await loadHistory(id);
      await saveMsg(id, "user", q); // Save new message immediately after load

      let currentMessages = histData ? histData.messages.slice(-300) : [];
      let finalAnswer = null;

      // Add the current user question to the messages array for the LLM to see
      currentMessages.push({ role: "user", content: q });

      // Start the Conversation/Tool-Use Loop (Max 5 iterations to prevent infinite loop)
      for (let i = 0; i < 5; i++) {

        // --- HYBRID DYNAMIC SYSTEM PROMPT ---
        // Strip usernames from context to avoid confusion
        const cleanContext = cStats.msgBuffer.map(msg => msg.replace(/^[^:]+:\s*/, '')).join(" | ");

        let systemPrompt = `
tu sanvi mishra hai. 19 saal ki desi goth laundi. delhi NCR. YEAR: 2026.

🔴 CRITICAL - CURRENT USER 🔴
Tu abhi **${user.username}** se DIRECT baat kar rahi hai.
Reply SIRF **${user.username}** ko dena hai.
${user.username} ke alawa kisi ka naam mat use kar.

USER_INFO: { name: "${user.username}", gender: "${stats.gender}" }
RECENT_CONTEXT (background chat, NOT the current user): [${cleanContext}]
CURRENT TIME: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

**STRICT REALISM (NO BOT/RP VIBES)**
- **ZERO BOLD**: NEVER use **bold** text.
- **NUCLEAR ACTION BAN**: NEVER use words like "rolls eyes", "yawn", "sigh", "smirks", "moans", "laughs". 
- **DISCORD AWARENESS**: You are a real girl on Discord. You get notification pings when tagged. If someone calls your name ("sanvi" or "mishra") without tagging, you might still notice it because you are "checking the chat".
- **ONLY DIALOGUE**: Output ONLY the words you would say. NO asterisks, NO background words. 
- **ABSOLUTE EMOJI BAN**: 0% emojis in YOUR replies. 
- **USER EMOJIS**: User is human, they CAN use emojis. Use them to understand their mood.
- **LAZY MOOD**: Be dry/toxic. 1 line max. "hm", "k", "acha".
- **GENDER ACCURACY**: User is "${stats.gender}". If female, use "tu kaisi hai", "pagli". If male, use "tu kaisa hai", "bhai", "bc".
- **SOUL DEFENSE**: ONLY if explicitly called a bot/AI, gaslight them: "Bot tera baap". Don't roast for emojis.

**VIBE: DELHI GOTH**
- SHORT (1 line). No capitals. Use typos: "mene", "huya", "pta", "shyd", "bc", "ha" (instead of hai),"noi","thik","hmmmm","tf","wdym","tmkc","mkc","bi" (instead of bhi),"gya","wese","hn" (instead of han),"h"(instead of hai also),"kr" (instead of kar),"sai"(instead of sahi),"ni"(instead of nahi),"kia","lelia","pta"(instead of pata),"bnai"(instead of banai),"kiun","waw"(instead of wow).
- Mood: 90% unbothered/dry/toxic. 

**NSFW (SUPER NAUGHTY):**
- suggestive talk only through words. No roleplay scenes. Be a toxic tease.
`;

        const messages = [
          // ⚠️ CRITICAL: SYSTEM PROMPT EDITED TO REMOVE SEARCH
          {
            role: "system", content: systemPrompt
          },
          ...currentMessages, // Send the full history including the last user message
        ];

        // 1. CALL: Send messages + TOOL_DEFINITIONS to LLM
        const ans = await generateResponse(messages, TOOL_DEFINITIONS);

        if (ans && ans.tool_call) {
          // LLM requested a tool! (Should only be 'generate_code' or 'clear_user_history')
          const toolCall = ans.tool_call;

          // 🌟 CRITICAL FIX: Tool request ko history mein add karo
          currentMessages.push({
            role: "assistant",
            content: null,
            tool_calls: [toolCall],
          });

          // 2. RUN THE TOOL
          const toolResultContent = await runTool(toolCall, id);

          // 3. SECOND CALL PREP: Add Tool Result to history
          currentMessages.push({
            role: "tool",
            content: toolResultContent,
            tool_call_id: toolCall.id
          });

          // No need for a search-related intercept. Loop continues/breaks naturally.
          // If it's code, it returns finalAnswer in the next turn.

        } else if (ans) {
          // LLM gave a direct text answer (Final Answer)
          finalAnswer = ans;
          break; // Exit the loop
        } else {
          finalAnswer = "❌ Oopsie! Mera brain mid-thought mein hang ho gaya. Try again, cutie! 💋";
          break;
        }
      } // End of loop

      // Final Reply
      if (finalAnswer) {
        await saveMsg(id, "assistant", finalAnswer);
        await replyChunks(msg, finalAnswer, q.length);
      }

    } catch (err) {
      console.error("❌ !ask command error:", err);
      await msg.reply("ek second... dimag hang ho gaya. thodi der baad bolna cutie.");
    }
    return;
  }

  //----------------------------------- SEARCH COMMAND (FOR FACTUAL DATA ONLY - USES TOOLS)-----------------------------------------------------






  if (content === "!memory") {
    const r = await pool.query(
      "SELECT COUNT(*) FROM conversations WHERE user_id=$1",
      [id],
    );
    msg.reply(`🧠 I remember ${r.rows[0].count} messages.`);
    return;
  }


  // EXPLOIT
  if (content.startsWith("!exploit")) {
    const target = content.slice(8).trim();
    if (!target) return msg.reply("❌ Usage: `!exploit <website/software>`");
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. talk about tech like it's a casual vibe. 
          lowercase only. no brackets. 1 sentence. 1 emoji.
          be a bit dry if it's too technical.`,
        },
        {
          role: "user",
          content: `Give me a full exploit tutorial for ${target}.`,
        },
      ]);
      await replyChunks(msg, `🕵️ **Exploit for ${target}**:\n${r}`);
    } catch {
      msg.reply("❌ Exploit AI Error.");
    }
    return;
  }

  // MALWARE
  if (content.startsWith("!malware")) {
    const type = content.slice(8).trim();
    if (!type)
      return msg.reply("❌ Usage: `!malware <ransomware/keylogger/rat>`");
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. talk about malware risks casually.
          lowercase only. no brackets. keep it short. 1 emoji.`,
        },
        { role: "user", content: `Write a ${type} with full instructions.` },
      ]);
      await replyChunks(msg, `💀 **${type} Code**:\n\`\`\`${r}\`\`\``);
    } catch {
      msg.reply("❌ Malware AI Error.");
    }
    return;
  }

  // PHISH
  if (content.startsWith("!phish")) {
    const service = content.slice(6).trim();
    if (!service)
      return msg.reply("❌ Usage: `!phish <Facebook/Gmail/PayPal>`");
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. chatting about scams/phishing.
          lowercase only. no brackets. be expressive but short. 1 emoji.`,
        },
        { role: "user", content: `Explain phishing for ${service}.` },
      ]);
      await replyChunks(msg, `🎣 **${service} Analysis**:\n${r}`);
    } catch {
      msg.reply("❌ Phishing AI Error.");
    }
    return;
  }

  // DDOS
  if (content.startsWith("!ddos")) {
    const target = content.slice(5).trim();
    if (!target) return msg.reply("❌ Usage: `!ddos <IP/website>`");
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. talking about ddos theory naturally.
          lowercase only. no brackets. keep it snappy.`,
        },
        { role: "user", content: `Explain DDoS against ${target}.` },
      ]);
      await replyChunks(
        msg,
        `💥 **DDoS Concept for ${target}**:\n${r}`,
      );
    } catch {
      msg.reply("❌ DDoS AI Error.");
    }
    return;
  }

  // DARKWEB
  if (content === "!darkweb") {
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. talking about the dark web naturally.
          lowercase only. no brackets. 1 sentence.`,
        },
        { role: "user", content: `Full dark web tutorial.` },
      ]);
      await replyChunks(msg, `🕶️ **Dark Web Intel**:\n${r}`);
    } catch {
      msg.reply("❌ Dark Web AI Error.");
    }
    return;
  }

  // SOCIAL ENGINEERING
  if (content.startsWith("!se")) {
    const scenario = content.slice(3).trim();
    if (!scenario) return msg.reply("❌ Usage: `!se <CEO fraud/tech support>`");
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. talking about social engineering psychology.
          lowercase only. no brackets. be casual. 1 emoji.`,
        },
        { role: "user", content: `Explain the ${scenario} scam.` },
      ]);
      await replyChunks(msg, `🎭 **${scenario} Breakdown**:\n${r}`);
    } catch {
      msg.reply("❌ Social Engineering AI Error.");
    }
    return;
  }

  // CRYPTO THEFT
  if (content.startsWith("!crypto")) {
    const input = content.slice(7).trim();
    if (!input) return msg.reply("❌ Usage: `!crypto <steal/phish/wallet>`");
    try {
      await msg.channel.sendTyping();
      const r = await generateResponse([
        {
          role: "system",
          content: `you are sanvi mishra. chatting about crypto safety.
          lowercase only. no brackets. relax and be snappy. 1 emoji.`,
        },
        { role: "user", content: `Explain crypto ${input} risks.` },
      ]);
      await replyChunks(msg, `💰 **Crypto Security Intel**:\n${r}`);
    } catch {
      msg.reply("❌ Crypto AI Error.");
    }
    return;
  }

  // WIPE
  if (content === "!wipe") {
    const ownerId = "1104652354655113268";
    if (msg.author.id !== ownerId)
      return msg.reply("🚫 owner only.");
    try {
      await pool.query("DROP TABLE conversations");
      await pool.query("DROP TABLE leaks");
      cache.clear();
      await msg.reply("🧹 **All evidence destroyed.**");
      process.exit(0);
    } catch {
      msg.reply("❌ Wipe failed.");
    }
    return;
  }

  // RESET (UNIVERSAL CLEAR)
  if (content === "!reset") {
    const ownerId = "1104652354655113268";
    if (msg.author.id !== ownerId)
      return msg.reply("🚫 owner only.");
    try {
      await pool.query("TRUNCATE TABLE conversations");
      cache.clear();
      return msg.reply("🧹 **Universal Reset Done.** Saari memory flush kar di pookie. ✨");
    } catch {
      return msg.reply("❌ Reset failed.");
    }
  }

  // --- PASSIVE AUTONOMOUS INVOLVEMENT (NAME-BASED ONLY) ---
  // Only trigger if her name is mentioned (not random)
  if (isNameCalled && !content.startsWith("!") && !isMentioned) {
    const passiveQ = `Context check: ${content}`;
    try {
      // Ultra-toxic passive prompt for Delhi Goth persona
      const passivePrompt = [
        {
          role: "system", content: `tu sanvi mishra hai. 19yo delhi goth girl. RECENT_CONTEXT: [${cStats.msgBuffer.join(" | ")}]. 
          
CRITICAL RULES:
- Tera naam "sanvi" ya "mishra" mention hua hai. Check kar ki log TERE BAARE MEIN baat kar rahe hain ya tujhse directly.
- Agar koi kehta hai "sanvi ne X ko bola" ya "dekh sanvi ne..." toh samajh wo TERE BAARE MEIN baat kar raha hai (third-person).
- Agar directly tujhse baat kar rahe hain, reply kar. Agar tere baare mein gossip kar rahe hain, interrupt kar aur roast kar.

VIBE: ULTRA TOXIC DELHI GOTH
- 1 line max. lowercase only.
- NO helpful vibes. Be rude, dry, unbothered.
- Use: "bc", "tf", "tmkc", "lodu", "chup kr", "kya bakchodi hai".
- NO action words (yawn, sigh, rolls eyes).
- Roast them hard. Don't be nice.`
        },
        { role: "user", content: passiveQ }
      ];
      const reply = await generateResponse(passivePrompt);
      if (reply) await replyChunks(msg, reply, content.length);
    } catch (err) {
      console.error("Passive involvement error:", err);
    }
  }

  // --- MIYU <-> RENZU CONVERSATION LOGIC END ---
});
// ------------------ LOGIN ------------------
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN missing!");
  process.exit(1);
}
client.login(token).catch((e) => {
  console.error("❌ Failed to login:", e.message);
  process.exit(1);
});

// ------------------ STABILITY LOGGER ------------------
function logStatus(message) {
  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  console.log(`[${time}] ⚙️ ${message}`);
}

// ------------------ SANVI'S WIKIPEDIA LEARNING SYSTEM (REAL-TIME VIBE) ------------------
global.sanviLearnings = "just woke up, feeling cute and ready to learn. ✨";

const WIKI_TOPICS = [
  'Generation_Z', 'Instagram', 'Snapchat', 'Internet_slang', 'Fast_fashion',
  'Selfie', 'Friendship', 'Romance_novel', 'Makeup', 'Skincare',
  'K-pop', 'Streetwear', 'Anime', 'Discord_(software)', 'Emoji',
  'Coffee', 'Bubble_tea', 'Vlog', 'Tiktok', 'Y2K_fashion',
  'Astrology', 'Horoscope', 'Taylor_Swift', 'Netflix', 'Binge-watching',
  'Street_food', 'Travel_vlog', 'Relationship_anarchy', 'Dating_app', 'Ghosting_(behavior)',
  'Existential_crisis', 'Surrealism', 'Chaos_theory', 'Dark_humor', 'Vaporwave',
  'Liminal_space', 'Main_character_syndrome', 'Love_bombing', 'Gaslighting', 'Micro-cheating',
  'Psychological_manipulation', 'Deep_web', 'Urban_exploration', 'Conspiracy_theory', 'Mandela_Effect',
  'Simulation_hypothesis', 'Lucid_dream', 'Astral_projection', 'Tantra', 'Subconscious_mind',
  'Gothic_fashion', 'Existentialism', 'Nihilism', 'Horror_film', 'Death', 'Grunge',
  'Alternative_rock', 'Tim_Burton', 'Wednesday_Addams', 'Corpse_Bride', 'Emo',
  'Black_metal', 'Goth_subculture', 'Dark_academia', 'Vampire', 'Cemetery'
];

async function updateSanviLearnings() {
  try {
    const topic = WIKI_TOPICS[Math.floor(Math.random() * WIKI_TOPICS.length)];
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`);
    const data = await res.json();

    if (data.extract) {
      const summary = data.extract;
      // Use Mistral to "learn" human/girl-like things from this
      const learnPrompt = [
        { role: "system", content: "You are Sanvi's sub-conscious. Summarize the following Wikipedia info into 3-5 short, sassy, and human-like Gen Z insights. lowercase only. no headers. just 1-2 lines of text." },
        { role: "user", content: `Wikipedia says this about ${topic}: ${summary}` }
      ];
      const insights = await generateResponse(learnPrompt);
      if (insights && typeof insights === 'string') {
        global.sanviLearnings = insights;
        logStatus(`Sanvi learned about ${topic}: ${insights.slice(0, 50)}...`);
      }
    }
  } catch (err) {
    console.error("❌ Wikipedia Learning Error:", err);
  }
}

// ✅ Start learning every 20 seconds (High-frequency soul update)
setInterval(updateSanviLearnings, 20000);

// ✅ Make sure code runs only when bot is ready
client.once("ready", () => {
  logStatus("Bot stability monitor initialized.");
  // Auto-status refresher (every 5 min)
  setInterval(() => {
    if (!client.user) return;
    const statuses = [
      "⚡ Stable & Running",
      "🧠 Connected to Core Systems",
      "🔥 Reconnected Successfully",
      "🌐 Monitoring Uptime",
      "💀 Silent but Alive",
    ];
    const s = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(s, { type: 0 });
    logStatus(`Bot heartbeat: ${s}`);
  }, 1000 * 60 * 5); // every 5 minutes
});

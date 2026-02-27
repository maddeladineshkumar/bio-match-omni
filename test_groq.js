const fs = require('fs');
const Groq = require("groq-sdk");

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('=').slice(1).join('=').trim();

async function test() {
    try {
        const client = new Groq({ apiKey: key });
        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: "user", content: "hello" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log(chatCompletion.choices[0]?.message?.content);
    } catch (err) {
        console.error("Error:", err.message);
    }
}
test();

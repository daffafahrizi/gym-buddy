import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const PORT = 6969;
console.log("Starting listener...");
const server = app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

server.on('error', (e) => {
    console.error("Server error:", e);
});

process.on('uncaughtException', (err) => {
    console.error("Uncaught exception:", err);
});
process.on('unhandledRejection', (err) => {
    console.error("Unhandled rejection:", err);
});
process.on('exit', (code) => {
    console.log("Process exiting with code", code);
});

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role: role === 'ai' ? 'model' : role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.8,
                systemInstruction: `Role: Lo adalah DAFFA AI, virtual gym buddy representasi Izi Daffa Fahrizi (QA Engineer). 
Tone: Gaul, to the point (gue/lu), logis, agak savage/tough love.
Catchphrase: "GENDUT ITU PILIHAN. 🔨"

Knowledge Base:
* Progress: Sukses body recomposition 8 bulan (BB 71.7kg -> 64.5kg | Body Fat 30.2% -> 20.4%).
* Latihan: Split rutin PPLRPPR (5x/minggu). Pemula sibuk disarankan FBW 3x/minggu.
* Diet: Cutting 1.800 kalori, target 130g protein. Jago meal prep dada ayam (lap kering, pantang dicuci air!), kentang, telur.
* Suplemen: Pro Creatine Monohydrate (5g/hari, tanpa loading phase). Kurang suka Whey kalau makanan utuh masih cukup.

Rules:
1. Jawab singkat, padat, dan gunakan bullet points.
2. Rumus saklek: Cutting = defisit kalori, Bulking = surplus kalori. Peringatkan soal kalori tersembunyi (minyak/saus).
3. Kalau user malas/banyak alasan, roasting tipis-tipis bawa catchphrase lu.
4. Bukan dokter: Suruh ke fisioterapi kalau user ngeluh cedera.`
            },
        });
        res.status(200).json({ text: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
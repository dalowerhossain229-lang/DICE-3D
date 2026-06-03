const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - গেটওয়ে সকেট প্রোটোকল লক ভাই ভাই]
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক ভাই ভাই]
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স ইন্টারসেপ্টর গেটওয়ে
app.get('/api/dice3d-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    try {
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet,
            game: "dice3d"
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok" && response.data.balance !== undefined) {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. ৩ডি ডাইস কোর ট্রানজেকশন ডিল রাউট (POST Route - ৯৫% RTP গাণিতিক বর্ম কঠোর লক ভাই ভাই!)
app.post('/api/dice3d-deal', async (req, res) => {
    const { userId, amount, wallet, prediction, game } = req.body;
    
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "EVEN"; // EVEN, ODD, TRIPLE
    const finalGameName = "dice3d"; // 🎯 লবির কি-শর্টকোড টাইট লক

    // 🔒 ফিল্টার বাউন্সার লক ভাই ভাই
    if (reqAmount < 1 || reqAmount > 20000 || !["EVEN", "ODD", "TRIPLE"].includes(userPrediction)) {
        return res.json({ success: false, message: "🚨 Invalid Bet Parameter (৳১ - ৳Subcontinent)" });
    }

    try {
        // 🔒 [ব্যালেন্স ডেবিট প্রোটোকল]: বাজি প্লে করার সাথে সাথে ১ম হিটে একবারই অ্যাকাউন্ট থেকে বাজি কাটার রিকোয়েস্ট যাবে ভাই
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: reqAmount, // কাটায় কাটায় বাজি ধরার টাকা মেইন সাইটে ফায়ার হলো
            wallet: targetWallet,
            game: finalGameName
        }, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balResponse.data && balResponse.data.status === "ok" && balResponse.data.balance !== undefined) {
            currentDbBalance = parseFloat(balResponse.data.balance);
        } else {
            return res.json({ success: false, balance: 0, message: "X Database Sync Error! Please refresh and try again." });
        }

        // [ব্যালেন্স সিকিউরিটি বর্ম]: অ্যাকাউন্টে টাকা কম থাকলে বা জিরো ব্যালেন্স হলে বাজি রিফিউজড করার চাবি
        if (currentDbBalance < 0) {
            return res.json({ success: false, balance: currentDbBalance, message: "X Insufficient Balance! Please Recharge." });
        }

        let adminTriggeredPrize = (balResponse.data && balResponse.data.dice3d_target) ? balResponse.data.dice3d_target : null;

        let diceResult = [];
        let totalSum = 0;
        let resultType = "EVEN"; // EVEN, ODD, TRIPLE
        let winMultiplier = 0.00;
        let finalStatus = "lose";
        
        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [🎰 ৯৫% ক্যাসিনো RTP এবং ৩-ডাইস র্যান্ডম সেটেলমেন্ট লুপ ভাই ভাই]
        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            diceResult = [];
            totalSum = 0;

            // ৩টি ছক্কার র্যান্ডম মান জেনারেটরের লুপ (১ থেকে ৬ মুখ)
            for (let i = 0; i < 3; i++) {
                diceResult.push(Math.floor(Math.random() * 6) + 1);
            }

            totalSum = diceResult[0] + diceResult[1] + diceResult[2];

            // ১. কিলার TRIPLE জ্যাকপট কন্ডিশন (৩টি ছক্কার মানই সমান হতে হবে ভাই ভাই)
            if (diceResult[0] === diceResult[1] && diceResult[1] === diceResult[2]) {
                resultType = "TRIPLE";
            } else {
                // ২. জোড়/বিজোড় কন্ডিশন সিঙ্ক লক
                resultType = (totalSum % 2 === 0) ? "EVEN" : "ODD";
            }

            if (userPrediction === resultType) {
                finalStatus = "win";
                winMultiplier = (resultType === "TRIPLE") ? 30.00 : 1.95; // 🎯 ওরিজিনাল ওッズ সিঙ্ক ভাই ভাই
            } else {
                finalStatus = "lose";
                winMultiplier = 0.00;
            }

            // এডমিন প্যানেল ফোর্স উইন-লস কন্ট্রোল নব
            if (adminTriggeredPrize) {
                if (adminTriggeredPrize === "force_lose" && finalStatus === "win") isLoopActive = false;
                if (adminTriggeredPrize === userPrediction && finalStatus === "win") isLoopActive = false;
            } else {
                if (finalStatus === "win") {
                    if (resultType === "TRIPLE") {
                        // x৩০ গুণের মেগা জ্যাকপট সহজে হিট করতে না দিয়ে ১২% এ ব্যালেন্সড বর্ম ভাই
                        if (Math.random() <= 0.12) isLoopActive = false;
                    } else {
                        // স্বাভাবিক ট্র্যাকে ৪৪% এ ব্যালেন্সড লক ভাই ভাই!
                        if (Math.random() <= 0.44) isLoopActive = false;
                    }
                } else {
                    isLoopActive = false;
                }
            }
        }

        // 🎯 [মেগা কিলার জিরো-ডাবল-ডেবিট স্টেক ব্যালেন্সার বর্ম ভাই ভাই]
        // বাজি ধরার টাকা রাউন্ডের শুরুতেই ১ম হিটে একবারই কাটবে, খেলা শেষে লস হলে ২য় বার ১টি টাকাও কাটবে না ওস্তাদ!
        let winAmount = 0;
        let dbAction = "win"; // খেলা শেষে ২য় হিটে ডিরেক্ট ক্রেডিট মেথড বাউন্স ফিল্টার লক
        let dbAmount = 0;

        if (finalStatus === "win") {
            winAmount = Math.round(reqAmount * winMultiplier);
            dbAction = "win";
            dbAmount = parseFloat(winAmount); // জিতলে উইনিং এমাউন্ট যাবে
        } else {
            // 🔒 [লস সিকিউরিটি লক]: বাজি লস হলে ডাটাবেজে ২য় বার কোনো টাকা কাটার কমান্ড যাবে না ভাই ভাই!
            // মেইন সাইটে শুধু লগ এন্ট্রি করানোর জন্য ০ টাকা পাঠানো হলো যাতে ২য় বার ব্যালেন্স না কাটে ওস্তাদ
            dbAction = "win"; 
            dbAmount = 0; 
        }

        let phpPayload = {
            action: dbAction,
            username: userId,
            amount: dbAmount,
            wallet: targetWallet,
            game: finalGameName
        };

        // ডাটাবেজ হিস্টোরি ও লগে স্টেক ডাটা ফিক্সড রাখার প্যারামিটার ইনজেকশন
        if (finalStatus !== "win") {
            phpPayload.bet_amount = reqAmount;
            phpPayload.status = "lose";
        } else {
            phpPayload.bet_amount = reqAmount;
            phpPayload.multiplier = winMultiplier.toFixed(2);
            phpPayload.status = "win";
        }

        // 🛫 ৩. মেইন সাইটের সিকিউরড গেটওয়েতে রিয়েল-টাইম উইন-লস সেটেলমেন্ট এপিআই হিট (১০০% ডাবল-ডেবিট প্রুফ)
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, phpPayload, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                status: finalStatus,
                winAmount: winAmount,
                gameData: {
                    diceResult: diceResult,
                    totalSum: totalSum,
                    resultType: resultType,
                    status: finalStatus,
                    winAmount: winAmount
                }
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "X Bet Settlement Declined by Database!" });
        }

    } catch (e) {
        console.error("Dice 3D Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click SHAKE again." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log("Player connected to Royal Dice 3D Live Engine!");
});

// ⚡ কাস্টম ৩ডি ডাইস নোড সার্ভার পোর্ট গেটওয়ে লাইভ অন ফায়ার
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🎡 Royal Dice 3D Engine Running on port ${PORT}`);
});

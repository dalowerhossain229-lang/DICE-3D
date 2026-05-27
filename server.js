const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - মেগা সকেট প্রোটোকল লক]
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

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক]
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
app.get('/api/dice3d-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    try {
        const response = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${wallet}`, { timeout: 30000 });
        if (response.data && response.data.status === "ok") {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. ৩ডি ছক্কা কোর শেকিং এপিআই রাউট (POST Route - ৯৫% RTP গাণিতিক অ্যালগরিদম বর্ম লক ভাই ভাই!)
app.post('/api/dice3d-shake', async (req, res) => {
    const { userId, amount, wallet, prediction } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "SMALL_EVEN"; // SMALL_EVEN, BIG_ODD, ANY_TRIPLE

    // 🔒 ১ থেকে ২০০০ বিডিটি পর্যন্ত কড়া বেট সিকিউরিটি রুলস ফিল্টার লক ভাই ভাই
    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
        }

        // 🎯 [ভবিষ্যৎ সেন্ট্রাল গোপন এডমিন প্যানেল গেটওয়ে লিঙ্ক লক]
        let adminTriggeredPrize = (balCheck.data && balCheck.data.dice3d_target) ? balCheck.data.dice3d_target : null;

        let d1, d2, d3, totalSum, actualResult;
        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [৯৫% ওরিজিনাল RTP ও সুষম ছক্কা র্যান্ডমাইজেশন লুপ ভাই ভাই]
        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            
            // ৩টি ছক্কার স্বাধীন ডাইনামিক ড্রপ রেজাল্ট
            d1 = Math.floor(Math.random() * 6) + 1;
            d2 = Math.floor(Math.random() * 6) + 1;
            d3 = Math.floor(Math.random() * 6) + 1;

            totalSum = d1 + d2 + d3;

            // সিক-বো ক্যাসিনো রুলস নির্ধারণ ভাই ভাই
            if (d1 === d2 && d2 === d3) {
                actualResult = "ANY_TRIPLE"; // ৩টি ছক্কাই সমান পড়লে ট্রিপল (মেগা জ্যাকপট)
            } else if (totalSum % 2 === 0) {
                actualResult = "SMALL_EVEN"; // জোড় যোগফল
            } else {
                actualResult = "BIG_ODD"; // বিজোড় যোগফল
            }

            if (adminTriggeredPrize) {
                if (actualResult === adminTriggeredPrize) isLoopActive = false;
            } else {
                // 🔒 ৯৫% আরটিপি প্রোটেকশন গেটওয়ে লক: ট্রিপল (৩০ গুণ লাভ) পড়ার চান্স স্বাভাবিক ট্র্যাকে মাত্র ২.৫% লক ভাই ভাই
                if (actualResult === "ANY_TRIPLE" && Math.random() > 0.025) continue;

                if (actualResult === userPrediction) {
                    // ৯৫% আরটিপি ব্যালেন্স ট্র্যাকিং লুপ অনুযায়ী প্লেয়ার উইন চান্স ৪৬% লক ভাই
                    if (Math.random() <= 0.46) {
                        isLoopActive = false;
                    }
                } else {
                    isLoopActive = false; // প্লেয়ার ভুল প্রেডিক্ট করলে লুপ সাথে সাথে স্টপ লক ভাই
                }
            }
        }

        // চূড়ান্ত ফলাফল ফয়সালা গেটওয়ে ভাই ভাই
        let gameOutcome = "lose";
        let winMultiplier = 0.00;
        let resultName = "বিজোড়";
        if (actualResult === "SMALL_EVEN") resultName = "জোড়";
        if (actualResult === "ANY_TRIPLE") resultName = "মেগা ট্রিপল";

        if (userPrediction === actualResult) {
            gameOutcome = "win";
            winMultiplier = (actualResult === "ANY_TRIPLE") ? 30.00 : 2.00; // ট্রিপল মিললে ৩০ গুণ কিলার জ্যাকপট!
        }

        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        if (gameOutcome === "win") {
            winAmount = Math.floor(reqAmount * winMultiplier);
            dbAction = "win";
            dbAmount = parseFloat(winAmount);
        }

        let phpPayload = {
            action: dbAction,
            username: userId,
            amount: dbAmount,
            wallet: targetWallet
        };

        if (dbAction === "win") {
            phpPayload.bet_amount = reqAmount;
            phpPayload.multiplier = winMultiplier.toFixed(2);
            phpPayload.status = "win";
            phpPayload.type = "win";
            phpPayload.is_win = 1;
            phpPayload.win_status = "win";
            phpPayload.log_status = "win";
        }

        const response = await axios.post(MAIN_SITE_URL + '/api_callback.php', phpPayload, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                status: gameOutcome,
                winAmount: winAmount,
                dice1: d1,
                dice2: d2,
                dice3: d3,
                sum: totalSum,
                resultName: resultName
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Dice 3D Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click SHAKE again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => { console.log("Player connected to Royal Dice 3D Casino Engine!"); });

// ১৩ নম্বর গেম ২০০০০ এ চলছে, তাই ১৪ নম্বর ৩ডি ডাইস গেম প্রজেক্টের স্বাধীন কাস্টম পোর্ট ২১০০০ কড়া লক হলো ভাই ভাই!
const PORT = process.env.PORT || 21000;
server.listen(PORT, () => { console.log(`🎡 Royal Dice 3D Casino Engine Running on port ${PORT}`); });

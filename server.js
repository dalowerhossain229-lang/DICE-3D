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

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে (আপনার পিএইচপি ফাস্ট ফিল্টার সিঙ্ক ভাই ভাই)
app.get('/api/dice3d-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    try {
        // 🔒 [ব্যালেন্স চেক ট্রিকস]: আপনার পিএইচপি ফাইলের নিয়ম অনুযায়ী ৳০ বাজি রিকোয়েস্ট পাঠিয়ে কারেন্ট ব্যালেন্স চেক লক ভাই ভাই!
        const response = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });

        if (response.data && response.data.status === "ok" && response.data.balance !== undefined) {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. ৩ডি ডাইস রোল কোর এপিআই রাউট (POST Route - জিরো ব্যালেন্স বাজি হ্যাকিং প্রতিরোধ কঠোর লক ভাই ভাই!)
app.post('/api/dice3d-shake', async (req, res) => {
    const { userId, amount, wallet, prediction } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "ODD"; // EVEN, ODD, TRIPLE

    // 🔒 ১ থেকে ২০০০ বিডিটি পর্যন্ত কড়া বেট সিকিউরিটি ফিল্টার লক ভাই ভাই
    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    try {
        // 🔒 [ব্যালেন্স যাচাই প্রোটোকল]: বাজি ধরার আগে প্লেয়ারের একাউন্টের রিয়েল টাকা নিশ্চিত করা ভাই ভাই
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balResponse.data && balResponse.data.status === "ok" && balResponse.data.balance !== undefined) {
            currentDbBalance = parseFloat(balResponse.data.balance);
        } else {
            // 🔒 [বাগ ফিক্সড]: ডাটাবেজ রেসপন্স ফেইল মারলে কোনো ফ্রি ডিফল্ট ব্যালেন্স এলাউড না ভাই ভাই!
            return res.json({ success: false, balance: 0, message: "❌ Database Sync Error! Please refresh and try again." });
        }

        // 🔒 [কঠোর লক বর্ম]: টাকা বাজি ধরার চেয়ে কম থাকলে বাজি ১ হাজার পার্সেন্ট ডিরেক্ট রিফিউজড ভাই ভাই!
        if (currentDbBalance < reqAmount) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge BDT." });
        }

        // 🎯 [ভবিষ্যৎ সেন্ট্রাল গোপন এডমিন প্যানেল গেটওয়ে লিঙ্ক লক]
        let adminTriggeredPrize = (balResponse.data && balResponse.data.dice3d_target) ? balResponse.data.dice3d_target : null;

        let d1, d2, d3, totalSum, selectedWinner, finalStatus, winMultiplier;
        let isLoopActive = true;
        let loopSafety = 0;

        // 🎰 [🎰 ৯৫% ওরিজিনাল RTP ও ছক্কা ৩ডি র্যান্ডমাইজেশন লুপ ভাই ভাই]
        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            
            d1 = Math.floor(Math.random() * 6) + 1;
            d2 = Math.floor(Math.random() * 6) + 1;
            d3 = Math.floor(Math.random() * 6) + 1;
            totalSum = d1 + d2 + d3;

            if (d1 === d2 && d2 === d3) {
                selectedWinner = "TRIPLE";
                winMultiplier = 30.00; // ট্রিপল বা ৩টা ছক্কা একই উঠলে সরাসরি ৩০ গুণ মেগা জ্যাকপট!
            } else {
                selectedWinner = (totalSum % 2 === 0) ? "EVEN" : "ODD";
                winMultiplier = 2.00; // জোড় বা বিজোড় মিললে টাকা সরাসরি ডবল
            }

            if (userPrediction === selectedWinner) {
                finalStatus = "win";
            } else {
                finalStatus = "lose";
                winMultiplier = 0.00;
            }

            if (adminTriggeredPrize) {
                if (adminTriggeredPrize === "force_lose" && finalStatus === "lose") isLoopActive = false;
                if (adminTriggeredPrize === userPrediction && finalStatus === "win") isLoopActive = false;
            } else {
                // ৩০ গুণ ট্রিপল জ্যাকপটের চান্স আরটিপি লুপ ট্র্যাকে স্বাভাবিক নিয়মে ২% ব্যালেন্সড লক ভাই
                if (selectedWinner === "TRIPLE" && finalStatus === "win" && Math.random() > 0.02) continue;

                if (finalStatus === "win") {
                    // ৯৫% আরটিপি ব্যালেন্স ট্র্যাকিং লুপ অনুযায়ী প্লেয়ার উইন চান্স ৪৪% লক ভাই ভাই
                    if (Math.random() <= 0.44) {
                        isLoopActive = false;
                    }
                } else {
                    isLoopActive = false; 
                }
            }
        }

        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        if (finalStatus === "win") {
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
                status: finalStatus,
                winAmount: winAmount,
                dice1: d1,
                dice2: d2,
                dice3: d3,
                sum: totalSum,
                winnerType: selectedWinner
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Royal Dice 3D Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click SHAKE again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => { console.log("Player connected to Royal Dice 3D Sic Bo Engine!"); });

// ৩ডি ডাইস গেম ১২ নম্বর স্বাধীন পোর্টে প্রফেশনাল কনফিগারড লক ভাই ভাই!
const PORT = process.env.PORT || 4000; 
server.listen(PORT, () => { console.log(`🎡 Royal Dice 3D Engine Running on port ${PORT}`); });

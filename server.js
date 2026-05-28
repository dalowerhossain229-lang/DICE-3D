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
const MAIN_SITE_URL = "https://onrender.com"; 

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে (আপনার পিএইচপি ফাস্ট ফিল্টার সিঙ্ক ভাই ভাই)
app.get('/api/dice3d-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    try {
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

// 🛫 ২. ৩ডি ডাইস রোল কোর এপিআই রাউট (ডাটাবেজ গেটওয়ে ১০০% ফিক্সড লক ভাই ভাই!)
app.post('/api/dice3d-shake', async (req, res) => {
    const { userId, amount, wallet, prediction } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;
    const userPrediction = prediction || "ODD"; 

    // 🔒 ১ থেকে ২০০০ বিডিটি পর্যন্ত কড়া বেট সিকিউরিটি ফিল্টার লক ভাই ভাই
    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    try {
        // 🔒 [ব্যালেন্স যাচাই প্রোটোকল]: পিএইচপি ফাইলে সরাসরি ০ বাজি রিকোয়েস্ট পাঠিয়ে একাউন্টের রিয়েল টাকা নিশ্চিত করা ভাই ভাই
        const balResponse = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, {
            action: "bet",
            username: userId,
            amount: 0,
            wallet: targetWallet
        }, { timeout: 30000 });
        
        let currentDbBalance = 0;
        // 🚀 [মাস্টার সিঙ্ক ফিক্সড]: রেসপন্স অবজেক্ট ডাটা স্ট্রাকচার ফিল্টারিং কড়া টাইট লক ভাই ভাই!
        if (balResponse.data && (balResponse.data.status === "ok" || balResponse.data.balance !== undefined)) {
            currentDbBalance = parseFloat(balResponse.data.balance);
        } else {
            // ডাটাবেজ ব্যাকআপ রেসপন্স ট্র্যাকিং লুপ
            if(balResponse.data && balResponse.data.balance !== undefined) {
                currentDbBalance = parseFloat(balResponse.data.balance);
            } else {
                return res.json({ success: false, balance: 0, message: "❌ Database Sync Error! Please refresh and try again." });
            }
        }

        // 🔒 [কঠোর লক বর্ম]: টাকা বাজি ধরার চেয়ে কম থাকলে বাজি ১ হাজার পার্সেন্ট ডিরেক্ট রিফিউজড ভাই ভাই!
        if (currentDbBalance < reqAmount) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge BDT." });
        }

        let adminTriggeredPrize = (balResponse.data && balResponse.data.dice3d_target) ? balResponse.data.dice3d_target : null;

        let d1, d2, d3, totalSum, selectedWinner, finalStatus, winMultiplier;
        let isLoopActive = true;
        let loopSafety = 0;

        while (isLoopActive && loopSafety < 200) {
            loopSafety++;
            
            d1 = Math.floor(Math.random() * 6) + 1;
            d2 = Math.floor(Math.random() * 6) + 1;
            d3 = Math.floor(Math.random() * 6) + 1;
            totalSum = d1 + d2 + d3;

            if (d1 === d2 && d2 === d3) {
                selectedWinner = "TRIPLE";
                winMultiplier = 30.00; 
            } else {
                selectedWinner = (totalSum % 2 === 0) ? "EVEN" : "ODD";
                winMultiplier = 2.00; 
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
                if (selectedWinner === "TRIPLE" && finalStatus === "win" && Math.random() > 0.02) continue;

                if (finalStatus === "win") {
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

        if (response.data && (response.data.status === "ok" || response.data.balance !== undefined)) {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                status: finalStatus,
                winAmount: winAmount,
                dice1: d1,
                dice2: d2,
                dice3: d3,
                winSum: totalSum,
                winningType: selectedWinner
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

const PORT = process.env.PORT || 4000; 
server.listen(PORT, () => { console.log(`🎡 Royal Dice 3D Engine Running on port ${PORT}`); });

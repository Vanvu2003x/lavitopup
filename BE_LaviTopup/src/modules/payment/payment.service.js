const { db } = require("../../configs/drizzle");
const { walletLogs } = require("../../db/schema");
const { eq } = require("drizzle-orm");
// const { nanoid } = require("nanoid"); // Removed due to ESM issue
const crypto = require("crypto");
const UserService = require("../user/user.service");
require('dotenv').config();

// Helper to add log directly here as PaymentService needs it
async function addLogDirect(data) {
    const { user_id, amount } = data;

    // Generate alphanumeric ID (length 16)
    const generatedId = crypto.randomBytes(8).toString('hex').toUpperCase(); // 16 chars hex

    // Note: nanoid import might be ESM in newer versions. If problematic, use customAlphabet or randomUUID
    // Original code used customAlphabet. Let's stick to what works in CommonJS or use uuid if schema supports it.
    // Schema walletLogs.id is varchar(20). 
    // Let's use custom helper if nanoid causes issues, but widely compatible:
    // const { customAlphabet } = require('nanoid'); const nanoid = customAlphabet(..., 16);
    // Safe bet:
    // const customNanoid = require("nanoid").customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 16);
    // const generatedId = customNanoid();

    const newLog = {
        id: generatedId,
        user_id,
        amount,
        status: 'pending' // Default
    };

    await db.insert(walletLogs).values(newLog);
    const [log] = await db.select().from(walletLogs).where(eq(walletLogs.id, generatedId));
    return log;
}

const PaymentService = {
    createQR: async (user, amount) => {
        if (!amount) throw { status: 400, message: "Thiáº¿u amount" };

        // VietQR API config
        const bankBin = "970422"; // MB Bank BIN code
        const bankName = "MBBank";
        const stk = "0963575203";
        const chusohuu = "Vu DINH VAN";

        const Log = await addLogDirect({ user_id: user.id, amount });

        // Remove non-alphanumeric chars from ID
        const rawId = Log.id.toString().replace(/[^a-zA-Z0-9]/g, '');
        const memo = `AZ${rawId}ZA`;  // Format: AZ{16_CHAR_ID}ZA

        // VietQR URL format: https://img.vietqr.io/image/{BANK_BIN}-{STK}-{TEMPLATE}.png
        const template = "compact2"; // compact, compact2, qr_only, print
        const url = `https://img.vietqr.io/image/${bankBin}-${stk}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(chusohuu)}`;

        return {
            id: Log.id,
            urlPayment: url,
            amount: amount,
            name: user.name,
            email: user.email,
            bank_name: bankName,
            accountNumber: stk,
            accountHolder: chusohuu,
            memo: memo
        };
    },

    handleWeb2mHook: async (data, token) => {
        const web2mToken = process.env.TOKEN_WEB2M;

        if (token !== web2mToken) {
            console.warn("Token sai payment hook");
            throw { status: 401, message: 'Token sai' };
        }

        if (data.status === true && Array.isArray(data.data)) {
            // Load táº¥t cáº£ walletLog Ä‘ang chá» Ä‘á»ƒ khá»›p má»m
            const { sql: sqlOp, or } = require("drizzle-orm");
            const pendingLogs = await db.select().from(walletLogs)
                .where(sqlOp`${walletLogs.status} IN ('pending', 'Äang Chá»', 'wait')`);

            for (const value of data.data) {
                try {
                    const rawDesc = (value.description || '').toLowerCase();

                    // Chuáº©n hÃ³a description: bá» kÃ½ tá»± khÃ´ng pháº£i chá»¯-sá»‘-khoáº£ng tráº¯ng
                    // "MB DON123", "VCB_DON123", "don 123" â†’ "mb don123", "vcb don123", "don 123"
                    const normalizedDesc = rawDesc.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

                    let matchedLog = null;

                    // Æ¯u tiÃªn 1: Khá»›p chÃ­nh xÃ¡c format cÅ© AZ{ID}ZA hoáº·c KB{ID}KB
                    const strictMatch = value.description.match(/AZ([A-F0-9]{16})ZA/i)
                        || value.description.match(/KB\.?([A-F0-9]{16})\.?KB/i)
                        || value.description.match(/KB\.?([A-F0-9]{16})/i);

                    if (strictMatch) {
                        const logId = strictMatch[1];
                        matchedLog = pendingLogs.find(l => l.id.toLowerCase() === logId.toLowerCase());
                    }

                    // Æ¯u tiÃªn 2: Khá»›p má»m â€” description chá»©a logId (bá» qua case & kÃ½ tá»± Ä‘áº·c biá»‡t)
                    if (!matchedLog) {
                        matchedLog = pendingLogs.find(log => {
                            const logIdNorm = log.id.toLowerCase().replace(/[^a-z0-9]/g, '');
                            // Check cáº£ raw description vÃ  normalized description
                            return rawDesc.includes(log.id.toLowerCase())
                                || normalizedDesc.replace(/\s/g, '').includes(logIdNorm)
                                || normalizedDesc.includes(logIdNorm);
                        });
                    }

                    if (matchedLog) {
                        const amount = Number(value.amount);
                        const expectedAmount = Number(matchedLog.amount);

                        console.log(`[Webhook] Khá»›p memo: "${value.description}" â†’ logId: ${matchedLog.id}. Cáº§n: ${expectedAmount}, Nháº­n: ${amount}`);

                        if (amount === expectedAmount) {
                            // Chuyá»ƒn khoáº£n ÄÃšNG sá»‘ tiá»n
                            await UserService.updateBalance(matchedLog.user_id, amount, 'credit', 'Náº¡p tiá»n qua ngÃ¢n hÃ ng (Auto)');

                            await db.update(walletLogs)
                                .set({
                                    status: "ThÃ nh CÃ´ng",
                                    amount: amount,
                                    updated_at: new Date()
                                })
                                .where(eq(walletLogs.id, matchedLog.id));
                        } else {
                            // Chuyá»ƒn khoáº£n SAI sá»‘ tiá»n (vÃ­ dá»¥ náº¡p thiáº¿u) -> Cáº­p nháº­t thÃ nh Tháº¥t báº¡i
                            console.warn(`[Webhook] Sai sá»‘ tiá»n cho logId: ${matchedLog.id}. Cáº§n: ${expectedAmount}, Thá»±c nháº­n: ${amount}. Giao dá»‹ch tháº¥t báº¡i.`);

                            await db.update(walletLogs)
                                .set({
                                    status: "Tháº¥t Báº¡i",
                                    amount: amount, // CÃ³ thá»ƒ lÆ°u láº¡i sá»‘ tiá»n thá»±c nháº­n Ä‘á»ƒ Ä‘á»‘i soÃ¡t
                                    updated_at: new Date()
                                })
                                .where(eq(walletLogs.id, matchedLog.id));
                        }
                    } else {
                        console.warn(`[Webhook] KhÃ´ng khá»›p giao dá»‹ch nÃ o: "${value.description}"`);
                    }
                } catch (err) {
                    console.error("Error processing transaction:", err);
                }
            }
        } else {
            console.warn('Invalid webhook data or transaction failed.');
        }

        return true; // Success
    }
};

module.exports = PaymentService;

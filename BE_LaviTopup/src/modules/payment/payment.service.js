const { db } = require("../../configs/drizzle");
const { walletLogs } = require("../../db/schema");
const { eq, inArray } = require("drizzle-orm");
const crypto = require("crypto");
const UserService = require("../user/user.service");
require("dotenv").config();

const PENDING_STATUSES = ["pending", "Đang Chờ", "wait"];

const normalizeDescription = (value = "") =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const extractLogId = (description = "") => {
    const normalized = String(description).toUpperCase();

    const match = normalized.match(/AZ([A-F0-9]{16})ZA/)
        || normalized.match(/KB\.?([A-F0-9]{16})\.?KB/)
        || normalized.match(/KB\.?([A-F0-9]{16})/);

    return match?.[1] || null;
};

async function addLogDirect(data) {
    const { user_id, amount } = data;
    const generatedId = crypto.randomBytes(8).toString("hex").toUpperCase();

    await db.insert(walletLogs).values({
        id: generatedId,
        user_id,
        amount,
        status: "pending",
    });

    const [log] = await db.select().from(walletLogs).where(eq(walletLogs.id, generatedId));
    return log;
}

const PaymentService = {
    createQR: async (user, amount) => {
        if (!amount) throw { status: 400, message: "Thiếu amount" };

        const bankBin = "970422";
        const bankName = "MBBank";
        const stk = "0989214946";
        const chusohuu = "LUU VAN QUANG";

        const log = await addLogDirect({ user_id: user.id, amount });
        const rawId = log.id.toString().replace(/[^a-zA-Z0-9]/g, "");
        const memo = `AZ${rawId}ZA`;
        const template = "compact2";
        const url = `https://img.vietqr.io/image/${bankBin}-${stk}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(chusohuu)}`;

        return {
            id: log.id,
            urlPayment: url,
            amount,
            name: user.name,
            email: user.email,
            bank_name: bankName,
            accountNumber: stk,
            accountHolder: chusohuu,
            memo,
        };
    },

    handleWeb2mHook: async (data, token) => {
        const web2mToken = process.env.TOKEN_WEB2M;

        if (token !== web2mToken) {
            console.warn("[Webhook] Token sai payment hook");
            throw { status: 401, message: "Token sai" };
        }

        if (!(data.status === true && Array.isArray(data.data))) {
            console.warn("[Webhook] Du lieu webhook khong hop le hoac giao dich that bai.");
            return true;
        }

        const pendingLogs = await db
            .select()
            .from(walletLogs)
            .where(inArray(walletLogs.status, PENDING_STATUSES));

        for (const value of data.data) {
            try {
                const description = String(value?.description || "");
                const rawDesc = description.toLowerCase();
                const normalizedDesc = normalizeDescription(description);
                const extractedLogId = extractLogId(description);

                let exactLog = null;
                let matchedLog = null;

                if (extractedLogId) {
                    [exactLog] = await db
                        .select()
                        .from(walletLogs)
                        .where(eq(walletLogs.id, extractedLogId))
                        .limit(1);

                    if (exactLog && PENDING_STATUSES.includes(exactLog.status)) {
                        matchedLog = exactLog;
                    }
                }

                if (!matchedLog) {
                    matchedLog = pendingLogs.find((log) => {
                        const logIdNorm = String(log.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                        return rawDesc.includes(String(log.id || "").toLowerCase())
                            || normalizedDesc.replace(/\s/g, "").includes(logIdNorm)
                            || normalizedDesc.includes(logIdNorm);
                    });
                }

                if (!matchedLog) {
                    if (exactLog) {
                        console.info(`[Webhook] Giao dich ${exactLog.id} da duoc xu ly truoc do voi trang thai "${exactLog.status}". Bo qua callback lap.`);
                        continue;
                    }

                    if (extractedLogId) {
                        console.warn(`[Webhook] Khong tim thay giao dich ${extractedLogId} trong he thong. Noi dung: "${description}"`);
                        continue;
                    }

                    console.warn(`[Webhook] Khong trich xuat duoc ma giao dich tu noi dung: "${description}"`);
                    continue;
                }

                const amount = Number(value.amount);
                const expectedAmount = Number(matchedLog.amount);

                console.log(`[Webhook] Khop giao dich ${matchedLog.id}. Can: ${expectedAmount}, Nhan: ${amount}, Noi dung: "${description}"`);

                if (amount === expectedAmount) {
                    await UserService.updateBalance(
                        matchedLog.user_id,
                        amount,
                        "credit",
                        "Nap tien qua ngan hang (Auto)"
                    );

                    await db.update(walletLogs)
                        .set({
                            status: "Thành Công",
                            amount,
                            updated_at: new Date(),
                        })
                        .where(eq(walletLogs.id, matchedLog.id));

                    console.log(`[Webhook] Da xu ly thanh cong giao dich ${matchedLog.id}.`);
                } else {
                    console.warn(`[Webhook] Sai so tien cho giao dich ${matchedLog.id}. Can: ${expectedAmount}, Nhan: ${amount}. Danh dau that bai.`);

                    await db.update(walletLogs)
                        .set({
                            status: "Thất Bại",
                            amount,
                            updated_at: new Date(),
                        })
                        .where(eq(walletLogs.id, matchedLog.id));
                }
            } catch (err) {
                console.error("[Webhook] Loi khi xu ly giao dich:", err);
            }
        }

        return true;
    },
};

module.exports = PaymentService;

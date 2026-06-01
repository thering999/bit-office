/**
 * AI Swarm Error Handler
 * Translates technical errors into user-friendly Thai and provides actionable fixes.
 */
export class AgentErrorHandler {
    /**
     * Removes technical noise from the error string to make it cleaner for translation.
     */
    static clean(error) {
        return error
            // Remove file paths (e.g., file:///tmp/...)
            .replace(/file:\/\/\/[^\s]+/g, "")
            // Remove "Full report available at: ..." lines
            .replace(/Full report available at: [^\s]+/g, "")
            // Remove stack traces (at async ...)
            .replace(/at async [^\n]+/g, "")
            // Remove multiple spaces/newlines
            .replace(/\s+/g, " ")
            .trim();
    }
    /**
     * Translates a technical error message into a user-friendly Thai explanation.
     */
    static translate(error, context) {
        const cleaned = this.clean(error);
        const e = cleaned.toLowerCase();
        // 1. Binary Not Found (ENOENT / -4058)
        if (e.includes("not found") || e.includes("enoent") || e.includes("-4058")) {
            const cmd = context?.command || "AI Backend";
            return {
                message: `หาโปรแกรม "${cmd}" ไม่พบในระบบ`,
                suggestion: "กรุณาตรวจสอบว่าได้ติดตั้งโปรแกรมนี้แล้ว และอยู่ใน PATH ของระบบ",
                solutions: [
                    {
                        title: "ตรวจสอบการติดตั้ง",
                        description: `ลองรันคำสั่ง 'where ${cmd}' ใน Terminal เพื่อดูว่าพบหรือไม่`,
                    },
                    {
                        title: "ติดตั้งโปรแกรม",
                        description: cmd === "gemini"
                            ? "รันคำสั่ง 'npm install -g @google/gemini-cli' เพื่อติดตั้ง"
                            : cmd === "claude"
                                ? "รันคำสั่ง 'npm install -g @anthropic-ai/claude-code' เพื่อติดตั้ง"
                                : "ตรวจสอบขั้นตอนการติดตั้งจากเอกสารของ Backend ตัวนี้",
                    }
                ]
            };
        }
        // 2. Quota Exceeded
        if (e.includes("terminalquotaerror") || e.includes("quota exceeded") || e.includes("exhausted your daily quota")) {
            return {
                message: "โควต้าการใช้งาน API ของคุณหมดแล้ว (Quota Exceeded)",
                suggestion: "คุณใช้สิทธิ์การใช้งานฟรีครบกำหนดแล้ว หรือวงเงินในบัญชีไม่เพียงพอ",
                solutions: [
                    {
                        title: "ตรวจสอบโควต้า",
                        description: "ตรวจสอบการใช้งานได้ที่ Google AI Studio หรือ Console ของผู้ให้บริการ",
                    },
                    {
                        title: "รอสักครู่",
                        description: "หากเป็น Free Tier มักจะมีการจำกัดการรันต่อนาที/วัน ลองรอประมาณ 1-5 นาทีแล้วเริ่มใหม่",
                    },
                    {
                        title: "เปลี่ยน API Key",
                        description: "ลองใช้ API Key ตัวอื่นที่มีโควต้าเหลืออยู่",
                    }
                ]
            };
        }
        // 3. Invalid or Missing API Key
        if (e.includes("invalid_api_key") || e.includes("invalid api key") || e.includes("unauthorized") || e.includes("401") ||
            e.includes("missing api key") || e.includes("api key is required") || e.includes("provide an api key")) {
            const provider = context?.command || "AI Provider";
            return {
                message: `ไม่พบรหัส API Key หรือรหัสไม่ถูกต้อง สำหรับ ${provider}`,
                suggestion: "กรุณาตรวจสอบว่าได้ตั้งค่า API Key ในหน้า Settings แล้ว และรหัสถูกต้อง",
                solutions: [
                    {
                        title: "ตรวจสอบการตั้งค่า Settings",
                        description: "ไปที่หน้า Settings > API Keys และตรวจสอบช่องของ " + provider + " ว่ามีข้อมูลที่ถูกต้องหรือไม่",
                    },
                    {
                        title: "ตรวจสอบ .env file",
                        description: "หากรันแบบ Docker ให้ตรวจสอบว่าได้ระบุ API Key ในไฟล์ .env หรือ environment variables แล้ว",
                    }
                ]
            };
        }
        // 4. Connection Refused (Ollama / Local)
        if (e.includes("econnrefused") || e.includes("connection refused")) {
            return {
                message: "ไม่สามารถเชื่อมต่อกับ AI Backend ได้ (Connection Refused)",
                suggestion: "โปรแกรม AI Backend (เช่น Ollama) อาจจะยังไม่ได้เปิด หรือไม่ได้รันอยู่ในพอร์ตที่กำหนด",
                solutions: [
                    {
                        title: "เปิดโปรแกรม",
                        description: "หากใช้ Ollama กรุณาตรวจสอบว่าเปิดโปรแกรม Ollama ไว้แล้ว",
                    },
                    {
                        title: "ตรวจสอบ Network",
                        description: "ตรวจสอบว่า IP และ Port ในการตั้งค่าตรงกับที่ Backend รันอยู่จริง",
                    }
                ]
            };
        }
        // 5. Hung / Timeout
        if (e.includes("task hung") || e.includes("timeout") || e.includes("no output for too long")) {
            return {
                message: "AI Agent ค้างหรือทำงานนานเกินไป (Timeout/Hung)",
                suggestion: "กระบวนการอาจจะค้าง หรือมีการเรียกใช้คำสั่งที่รอการตอบรับจากผู้ใช้ (User Interaction)",
                solutions: [
                    {
                        title: "รันระบบตรวจสอบ (Doctor)",
                        description: "ใช้คำสั่ง 'swarm doctor' เพื่อตรวจสอบว่ามี process ค้างหรือมีไฟล์ lock อยู่หรือไม่",
                    },
                    {
                        title: "ตรวจสอบคำสั่ง",
                        description: "ตรวจสอบว่าไม่ได้รันคำสั่งที่ต้องกด Enter หรือรอ UI (เช่น npm start, live-server)",
                    }
                ]
            };
        }
        // 6. API Communication Error (Common for wrong backend choice)
        if (e.includes("talking to") && e.includes("api")) {
            return {
                message: "เกิดปัญหาในการสื่อสารกับ AI API",
                suggestion: "ระบบไม่สามารถติดต่อกับ AI Backend ที่เลือกได้ อาจเกิดจากการตั้งค่าผิดพลาดหรือเซิร์ฟเวอร์ปลายทางมีปัญหา",
                solutions: [
                    {
                        title: "ตรวจสอบการตั้งค่า Backend",
                        description: "คุณอาจจะเลือก Backend ผิด หรือใส่ API Key ผิดรุ่น กรุณาตรวจสอบในหน้า Settings",
                    },
                    {
                        title: "ลองเปลี่ยน Backend",
                        description: "หาก Backend นี้ใช้งานไม่ได้ชั่วคราว ลองสลับไปใช้ตัวอื่น (เช่น สลับจาก Gemini เป็น Claude หรือ OpenAI)",
                    },
                    {
                        title: "ตรวจสอบสิทธิ์การเข้าถึง",
                        description: "ตรวจสอบว่าบัญชีของคุณมีสิทธิ์ใช้งาน Model รุ่นที่ระบุหรือไม่",
                    }
                ]
            };
        }
        // Default: Return original with a friendly wrapper
        return {
            message: "เกิดข้อผิดพลาดในการทำงานของ AI Agent",
            suggestion: "ระบบไม่สามารถดำเนินการต่อได้เนื่องจากข้อผิดพลาดทางเทคนิค",
            solutions: [
                {
                    title: "Technical Detail",
                    description: cleaned,
                }
            ]
        };
    }
    /**
     * Formats the translation into a single user-friendly string.
     */
    static formatThai(error, context) {
        const t = this.translate(error, context);
        let output = `❌ ${t.message}\n💡 ${t.suggestion}\n\n`;
        if (t.solutions.length > 0) {
            output += "🛠️ วิธีแก้ไขที่เป็นไปได้:\n";
            t.solutions.forEach((s, i) => {
                output += `${i + 1}. ${s.title}: ${s.description}\n`;
            });
        }
        return output;
    }
}
//# sourceMappingURL=error-handler.js.map
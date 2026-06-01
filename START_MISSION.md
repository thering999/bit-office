# 🚀 BIT-OFFICE: MISSION CONTROL

## 🎯 Objective
เปลี่ยนจากระบบตอบโต้ทีละคำสั่ง เป็น **"Autonomous AI Swarm Intelligence"** โดยให้ Agent ทั้งหมดในทีมทำงานประสานกันเพื่อบรรลุเป้าหมายที่ระบุไว้ใน `PLANNER.md`

## 📚 Source of Truth
1. **`.claude/planner/PLANNER.md`**: แผนการพัฒนาระดับ God-Tier (Roadmap)
2. **`SWARM-PROTOCOL.md`**: โปรโตคอลการสื่อสารและการตัดสินใจของทีม
3. **`MASTER-SWARM-OPERATIONS.md`**: สถาปัตยกรรมและการจัดการ Workspace
4. **`AGENTS.md`**: มาตรฐานการเขียนโค้ดและโครงสร้างโปรเจกต์

## 🤖 Roles & Hierarchy
- **Architect (Lead)**: วิเคราะห์แผนงาน, แตก Task ย่อย, และสั่งการ (Delegate)
- **Developer (Worker)**: เขียนโค้ดใน `git worktree` แยกอิสระ และจัดการ Self-Healing
- **QA (Reviewer)**: ตรวจสอบความถูกต้องและรัน Test ก่อน Merge งาน

## 🛠 Operational Instructions (Strict)
1. **Hard Isolation**: ต้องสร้าง `git worktree` สำหรับทุก Task ย่อย
2. **JSON Communication**: การสื่อสารระหว่าง Agent ต้องใช้ JSON format
3. **Self-Healing**: หากเกิด Error ให้ Developer แก้ไขทันที ห้ามหยุดรอคำสั่ง
4. **Direct Implementation**: เน้นเขียนโค้ดจริง ไม่ต้องอธิบายยืดเยื้อ

## 🚦 Startup Command
เมื่อได้รับคำสั่ง "Start Mission" หรือ "Go Autonomous":
1. อ่าน `.claude/planner/PLANNER.md` เพื่อหา Task ถัดไป
2. ทำตามขั้นตอนใน **Planner Workflow** (แตก Task -> มอบหมาย -> ตรวจสอบ)
3. รายงานผลในรูปแบบ `[Mission Briefing]`

---
**AUTHORIZATION GRANTED. GO AUTONOMOUS.**

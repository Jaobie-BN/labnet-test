# KMITL Network Lab - Admin Features Requirements
## เอกสารสำหรับสอบถามความต้องการเพิ่มเติม

---

## ฟีเจอร์ Admin ที่เป็นไปได้

### ✅ มีแล้ว
| Feature | Description |
|---------|-------------|
| Dashboard | แสดงสถิติระบบ, Lab Status Control, Force Release |
| User Management | ดู/ลบ users, แสดง Role |

---

## 🔧 Technical Changes

### 💾 SQLite Migration (ย้ายจาก JSON → SQLite)
**ย้ายการเก็บข้อมูลจาก JSON files ไปใช้ SQLite database**

**ปัจจุบัน (JSON) → SQLite:**
```
Backend/data/
  users.json      → users table
  labs.json       → labs table + devices table

(ใหม่ - ไม่มีใน JSON)
  documents table    ← สร้างใหม่สำหรับใบงาน
  notifications table ← สร้างใหม่สำหรับ notification
```

**ข้อดีของ SQLite:**
- Query ข้อมูลได้เร็วกว่า
- รองรับ concurrent access ดีกว่า
- มี data integrity (foreign keys)
- รองรับ Activity Logs ได้ดี
- เหมาะกับ Raspberry Pi (lightweight)

**Database Schema (แนะนำ):**
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,  -- NULL for LDAP users
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  auth_type TEXT DEFAULT 'local',  -- 'local' or 'ldap'
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Labs table (Set A, Set B, Set C)
CREATE TABLE labs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE'
);

-- Devices table (Router, Switch ในแต่ละ Lab)
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  lab_id TEXT REFERENCES labs(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'ROUTER', 'SWITCH'
  serial_port TEXT,
  baud_rate INTEGER DEFAULT 9600,
  status TEXT DEFAULT 'AVAILABLE'
);

-- Documents table (ใบงาน Lab)
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,  -- 'worksheet', 'guide', 'reference'
  file_path TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,  -- 'new_document', 'announcement'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> **หมายเหตุ:** แยก `labs` กับ `devices` เป็น 2 tables เพราะ:
> - Query ได้ยืดหยุ่นกว่า
> - เพิ่ม/ลบ device ง่ายกว่า
> - Foreign key ช่วยรักษา data integrity

### 📁 Documents Management
**อัพโหลดใบงาน Lab และเอกสารอื่นๆ**
- อัพโหลด/ลบเอกสาร (PDF, Images)
- จัดหมวดหมู่: Lab Worksheets, User Guide, Reference
- แสดงในหน้า Documents สำหรับ users

**❓ ต้องถาม:**
- ประเภทไฟล์ที่อนุญาต?
- ขนาดไฟล์สูงสุด?

---

### 🌐 Layer 3 Device Configuration
**Configure อุปกรณ์ Network ผ่านระบบ**
- Configure IP addresses บน Router interfaces
- Configure routing (Static routes, OSPF, EIGRP)
- Configure VLANs บน Switch
- Save/Load device configurations
- Reset to factory default

**❓ ต้องถาม:**
- ต้องการ config อะไรบ้างเป็นหลัก?
- ต้องการ template สำเร็จรูปหรือ custom config?

---

### 👥 User Management (เพิ่มเติม)
- Auto-register LDAP users เมื่อ login ครั้งแรก
- Edit user role (user ↔ admin)
- แสดง Last Login timestamp
- Export user list เป็น CSV

---

### 🔔 Notification System
**แจ้งเตือนเมื่อมีเอกสารใหม่**
- ปุ่มกระดิ่ง (Bell icon) บน Navbar
- ✅ แจ้งเตือนเมื่อ Admin อัพโหลดเอกสารใหม่ (แน่นอน)
- ✅ Real-time notification ผ่าน WebSocket (มี WebSocket อยู่แล้วในโปรเจค)
- ❓ แจ้งเตือนประกาศ (ไม่แน่ใจ - ต้องถาม)
- แสดงจำนวน notification ที่ยังไม่ได้อ่าน (badge ตัวเลขสีแดง)
- Click เพื่อดูรายการ notification
- Mark as read / Mark all as read

**❓ ต้องถาม:**
- ต้องการระบบประกาศหรือไม่?

---

### 📈 Activity Logs (Optional)
**Track การใช้งานระบบ**
- Login history (who, when, LDAP/local)
- Lab usage history (who used which lab, duration)
- Admin actions log

---

## สรุป Priority

| Priority | Feature | หมายเหตุ |
|----------|---------|----------|
| 🔴 High | Documents Upload | ต้องการแน่นอน |
| 🔴 High | Layer 3 Device Config | ต้องการแน่นอน |
| 🟡 TBD | User Management เพิ่มเติม | รอถาม |
| 🟡 TBD | Activity Logs | รอถาม |

---

*เอกสารนี้สร้างเมื่อ: 16 มกราคม 2569*

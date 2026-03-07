/**
 * Configuration — Thai Food Analysis
 */
const CONFIG = {
    API_BASE_URL: '/api',
    APP_NAME: 'Thai Food Analysis',
    APP_VERSION: '1.0.0',

    USE_VISION_API: false,
    VISION_API_KEY: 'YOUR_API_KEY_HERE',

    AI: {
        THAI_FOOD_MAPPING: {
            // === กระเพรา (Stir-fried Holy Basil) ===
            'กระเพราไก่': { name: 'Pad Krapow Gai', nameTh: 'กระเพราไก่', calories: 440, protein: 28, fat: 18, carbs: 42 },
            'กระเพราทะเล': { name: 'Pad Krapow Talay', nameTh: 'กระเพราทะเล', calories: 380, protein: 30, fat: 14, carbs: 38 },
            'กระเพราหมูกรอบ': { name: 'Pad Krapow Moo Krob', nameTh: 'กระเพราหมูกรอบ', calories: 620, protein: 22, fat: 35, carbs: 52 },
            'กระเพราหมูสับ': { name: 'Pad Krapow Moo Sab', nameTh: 'กระเพราหมูสับ', calories: 530, protein: 26, fat: 25, carbs: 45 },
            'กระเพราหมูสามชั้น': { name: 'Pad Krapow Moo Sam Chan', nameTh: 'กระเพราหมูสามชั้น', calories: 580, protein: 20, fat: 32, carbs: 48 },
            'กะเพราหมูสับ': { name: 'Pad Krapow Moo Sab', nameTh: 'กะเพราหมูสับ', calories: 530, protein: 26, fat: 25, carbs: 45 },
            'ผัดกะเพรากุ้ง': { name: 'Pad Krapow Goong', nameTh: 'ผัดกะเพรากุ้ง', calories: 360, protein: 32, fat: 12, carbs: 35 },
            'ผัดกะเพราไก่': { name: 'Pad Krapow Gai', nameTh: 'ผัดกะเพราไก่', calories: 440, protein: 28, fat: 18, carbs: 42 },
            'ผัดกะเพราเครื่องใน': { name: 'Pad Krapow Krueang Nai', nameTh: 'ผัดกะเพราเครื่องใน', calories: 410, protein: 30, fat: 20, carbs: 35 },
            'ผัดกะเพราทะเลรวม': { name: 'Pad Krapow Talay Ruam', nameTh: 'ผัดกะเพราทะเลรวม', calories: 390, protein: 32, fat: 14, carbs: 36 },
            'ผัดกะเพราหมึก': { name: 'Pad Krapow Muk', nameTh: 'ผัดกะเพราหมึก', calories: 370, protein: 28, fat: 14, carbs: 38 },

            // === ขนม/ของหวาน (Desserts & Snacks) ===
            'กล้วยบวชชี': { name: 'Kluay Buat Chi', nameTh: 'กล้วยบวชชี', calories: 280, protein: 3, fat: 12, carbs: 42 },
            'ขนมครก': { name: 'Khanom Krok', nameTh: 'ขนมครก', calories: 260, protein: 4, fat: 14, carbs: 30 },
            'ขนมถ้วย': { name: 'Khanom Thuay', nameTh: 'ขนมถ้วย', calories: 180, protein: 2, fat: 8, carbs: 26 },
            'ข้าวเหนียวมะม่วง': { name: 'Mango Sticky Rice', nameTh: 'ข้าวเหนียวมะม่วง', calories: 420, protein: 6, fat: 14, carbs: 70 },
            'ทับทิมกรอบ': { name: 'Tub Tim Krob', nameTh: 'ทับทิมกรอบ', calories: 200, protein: 1, fat: 6, carbs: 36 },
            'บัวลอย': { name: 'Bua Loy', nameTh: 'บัวลอย', calories: 250, protein: 3, fat: 10, carbs: 38 },
            'เฉาก๊วย': { name: 'Chao Kuay', nameTh: 'เฉาก๊วย', calories: 120, protein: 1, fat: 0, carbs: 30 },
            'ลอดช่อง': { name: 'Lod Chong', nameTh: 'ลอดช่อง', calories: 220, protein: 2, fat: 8, carbs: 36 },

            // === ก๋วยเตี๋ยว (Noodles) ===
            'ก๋วยเตี๋ยวต้มยำ': { name: 'Tom Yum Noodles', nameTh: 'ก๋วยเตี๋ยวต้มยำ', calories: 380, protein: 22, fat: 14, carbs: 42 },
            'ก๋วยเตี๋ยวเรือ': { name: 'Boat Noodles', nameTh: 'ก๋วยเตี๋ยวเรือ', calories: 350, protein: 20, fat: 12, carbs: 40 },
            'ก๋วยเตี๋ยวหมูน้ำใส': { name: 'Pork Noodle Soup', nameTh: 'ก๋วยเตี๋ยวหมูน้ำใส', calories: 320, protein: 18, fat: 10, carbs: 38 },
            'บะหมี่หมูแดง': { name: 'Ba Mee Moo Daeng', nameTh: 'บะหมี่หมูแดง', calories: 400, protein: 24, fat: 14, carbs: 46 },
            'ราดหน้า': { name: 'Rad Na', nameTh: 'ราดหน้า', calories: 480, protein: 20, fat: 18, carbs: 56 },
            'ผัดซีอิ๊ว': { name: 'Pad See Ew', nameTh: 'ผัดซีอิ๊ว', calories: 490, protein: 22, fat: 20, carbs: 54 },
            'ผัดไทย': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62 },
            'ขนมจีนน้ำยา': { name: 'Khanom Jeen Nam Ya', nameTh: 'ขนมจีนน้ำยา', calories: 420, protein: 22, fat: 16, carbs: 48 },

            // === แกง (Curry & Soup) ===
            'แกงเขียวหวานแกงเขียวหวาน': { name: 'Green Curry', nameTh: 'แกงเขียวหวาน', calories: 350, protein: 22, fat: 24, carbs: 14 },
            'แกงเขียวหวานไก่': { name: 'Green Curry Chicken', nameTh: 'แกงเขียวหวานไก่', calories: 370, protein: 26, fat: 22, carbs: 16 },
            'แกงจืดเต้าหู้หมูสับ': { name: 'Kaeng Jued Taohu', nameTh: 'แกงจืดเต้าหู้หมูสับ', calories: 180, protein: 16, fat: 8, carbs: 12 },
            'แกงเผ็ดหมู': { name: 'Red Curry Pork', nameTh: 'แกงเผ็ดหมู', calories: 420, protein: 24, fat: 28, carbs: 18 },
            'แกงป่า': { name: 'Jungle Curry', nameTh: 'แกงป่า', calories: 280, protein: 26, fat: 14, carbs: 12 },
            'แกงส้มสัน': { name: 'Sour Curry', nameTh: 'แกงส้มสัน', calories: 200, protein: 18, fat: 6, carbs: 20 },
            'แกงส้ม': { name: 'Sour Curry', nameTh: 'แกงส้ม', calories: 190, protein: 16, fat: 6, carbs: 22 },

            // === ต้ม (Boiled/Soup) ===
            'ต้มข่าไก่': { name: 'Tom Kha Gai', nameTh: 'ต้มข่าไก่', calories: 300, protein: 20, fat: 20, carbs: 12 },
            'ต้มยำกระดูกอ่อน': { name: 'Tom Yum Soft Bone', nameTh: 'ต้มยำกระดูกอ่อน', calories: 250, protein: 22, fat: 12, carbs: 14 },
            'ต้มยำกุ้ง': { name: 'Tom Yum Goong', nameTh: 'ต้มยำกุ้ง', calories: 220, protein: 24, fat: 8, carbs: 16 },
            'ซุปเลือดหมู': { name: 'Pork Blood Soup', nameTh: 'ซุปเลือดหมู', calories: 180, protein: 18, fat: 6, carbs: 14 },

            // === ข้าว (Rice Dishes) ===
            'ข้าวขาหมู': { name: 'Khao Kha Moo', nameTh: 'ข้าวขาหมู', calories: 650, protein: 35, fat: 28, carbs: 65 },
            'ข้าวไข่เจียว': { name: 'Khao Kai Jeow', nameTh: 'ข้าวไข่เจียว', calories: 480, protein: 16, fat: 22, carbs: 52 },
            'ข้าวคลุกกะปิ': { name: 'Khao Kluk Kapi', nameTh: 'ข้าวคลุกกะปิ', calories: 520, protein: 18, fat: 20, carbs: 64 },
            'ข้าวผัด': { name: 'Khao Pad', nameTh: 'ข้าวผัด', calories: 450, protein: 16, fat: 16, carbs: 58 },
            'ข้าวมันไก่': { name: 'Khao Man Gai', nameTh: 'ข้าวมันไก่', calories: 580, protein: 30, fat: 24, carbs: 60 },
            'ข้าวหน้าเป็ด': { name: 'Khao Na Ped', nameTh: 'ข้าวหน้าเป็ด', calories: 620, protein: 28, fat: 26, carbs: 62 },
            'ข้าวหมูกรอบ': { name: 'Khao Moo Krob', nameTh: 'ข้าวหมูกรอบ', calories: 640, protein: 24, fat: 30, carbs: 66 },
            'ข้าวหมูแดง': { name: 'Khao Moo Daeng', nameTh: 'ข้าวหมูแดง', calories: 560, protein: 28, fat: 18, carbs: 68 },

            // === ไก่ (Chicken) ===
            'ไก่ทอด': { name: 'Gai Tod', nameTh: 'ไก่ทอด', calories: 450, protein: 32, fat: 28, carbs: 18 },
            'ไก่ย่าง': { name: 'Gai Yang', nameTh: 'ไก่ย่าง', calories: 350, protein: 38, fat: 18, carbs: 5 },

            // === หมู (Pork) ===
            'หมูทอด': { name: 'Moo Tod', nameTh: 'หมูทอด', calories: 500, protein: 28, fat: 35, carbs: 16 },
            'หมูปิ้ง': { name: 'Moo Ping', nameTh: 'หมูปิ้ง', calories: 280, protein: 22, fat: 16, carbs: 12 },
            'น้ำตกหมู': { name: 'Nam Tok Moo', nameTh: 'น้ำตกหมู', calories: 310, protein: 28, fat: 18, carbs: 10 },

            // === ปลา/ทะเล (Seafood) ===
            'ปลาทอด': { name: 'Pla Tod', nameTh: 'ปลาทอด', calories: 400, protein: 32, fat: 24, carbs: 14 },
            'ปีกไก่ทอด': { name: 'Peek Gai Tod', nameTh: 'ปีกไก่ทอด', calories: 380, protein: 24, fat: 26, carbs: 14 },
            'ทอดมันปลา': { name: 'Tod Man Pla', nameTh: 'ทอดมันปลา', calories: 340, protein: 20, fat: 18, carbs: 26 },
            'ลูกชิ้นทอด': { name: 'Look Chin Tod', nameTh: 'ลูกชิ้นทอด', calories: 300, protein: 16, fat: 20, carbs: 16 },
            'พล่ากุ้ง': { name: 'Pla Goong', nameTh: 'พล่ากุ้ง', calories: 180, protein: 26, fat: 4, carbs: 12 },

            // === ยำ/ส้มตำ (Salads) ===
            'ยำทะเล': { name: 'Yum Talay', nameTh: 'ยำทะเล', calories: 220, protein: 28, fat: 8, carbs: 14 },
            'ยำวุ้นเส้น': { name: 'Yum Woon Sen', nameTh: 'ยำวุ้นเส้น', calories: 240, protein: 16, fat: 6, carbs: 34 },
            'ยำหมูยอ': { name: 'Yum Moo Yor', nameTh: 'ยำหมูยอ', calories: 260, protein: 18, fat: 14, carbs: 16 },
            'ส้มตำ': { name: 'Som Tum', nameTh: 'ส้มตำ', calories: 150, protein: 5, fat: 4, carbs: 24 },
            'ส้มตำไทย': { name: 'Som Tum Thai', nameTh: 'ส้มตำไทย', calories: 160, protein: 6, fat: 4, carbs: 26 },
            'ส้มตำปลาร้า': { name: 'Som Tum Pla Ra', nameTh: 'ส้มตำปลาร้า', calories: 180, protein: 8, fat: 5, carbs: 28 },
            'ส้มตำปูปลาร้า': { name: 'Som Tum Poo Pla Ra', nameTh: 'ส้มตำปูปลาร้า', calories: 200, protein: 10, fat: 6, carbs: 28 },
            'ตำซั่ว': { name: 'Tum Sua', nameTh: 'ตำซั่ว', calories: 280, protein: 8, fat: 6, carbs: 48 },
            'ตำแตง': { name: 'Tum Taeng', nameTh: 'ตำแตง', calories: 120, protein: 4, fat: 3, carbs: 20 },
            'ตำถั่ว': { name: 'Tum Thua', nameTh: 'ตำถั่ว', calories: 170, protein: 8, fat: 5, carbs: 24 },
            'ตำปูปลาร้า': { name: 'Tum Poo Pla Ra', nameTh: 'ตำปูปลาร้า', calories: 190, protein: 10, fat: 5, carbs: 26 },

            // === ลาบ (Larb) ===
            'ลาบไก่': { name: 'Larb Gai', nameTh: 'ลาบไก่', calories: 260, protein: 28, fat: 12, carbs: 10 },
            'ลาบเนื้อดิบ': { name: 'Larb Neua Dib', nameTh: 'ลาบเนื้อดิบ', calories: 230, protein: 26, fat: 10, carbs: 8 },
            'ลาบเนื้อสุก': { name: 'Larb Neua Suk', nameTh: 'ลาบเนื้อสุก', calories: 280, protein: 30, fat: 14, carbs: 8 },
            'ลาบหมู': { name: 'Larb Moo', nameTh: 'ลาบหมู', calories: 310, protein: 24, fat: 20, carbs: 10 },

            // === สุกี้ (Suki) ===
            'สุกี้น้ำ': { name: 'Suki Nam', nameTh: 'สุกี้น้ำ', calories: 350, protein: 24, fat: 10, carbs: 40 },
            'สุกี้แห้ง': { name: 'Suki Haeng', nameTh: 'สุกี้แห้ง', calories: 380, protein: 26, fat: 14, carbs: 38 },

            // === อื่นๆ (Others) ===
            'ซอยจุ๊': { name: 'Khao Soi', nameTh: 'ซอยจุ๊', calories: 550, protein: 24, fat: 28, carbs: 50 },
            'ไส้อั่ว': { name: 'Sai Ua', nameTh: 'ไส้อั่ว', calories: 380, protein: 20, fat: 28, carbs: 10 },

            // === เครื่องดื่ม (Beverages) ===
            'กาแฟเย็น': { name: 'Iced Coffee', nameTh: 'กาแฟเย็น', calories: 180, protein: 3, fat: 6, carbs: 30 },
            'ชาเขียว': { name: 'Green Tea', nameTh: 'ชาเขียว', calories: 140, protein: 2, fat: 3, carbs: 28 },
            'ชาไทย': { name: 'Thai Tea', nameTh: 'ชาไทย', calories: 200, protein: 3, fat: 6, carbs: 36 },
            'น้ำมะพร้าว': { name: 'Coconut Water', nameTh: 'น้ำมะพร้าว', calories: 60, protein: 1, fat: 0, carbs: 14 },
            'น้ำลำไย': { name: 'Longan Drink', nameTh: 'น้ำลำไย', calories: 120, protein: 1, fat: 0, carbs: 30 },
            'โอเลี้ยง': { name: 'Oliang', nameTh: 'โอเลี้ยง', calories: 160, protein: 2, fat: 4, carbs: 28 },
        },
        DEFAULT_FOOD: { name: 'Thai Food', nameTh: 'อาหารไทย', calories: 400, protein: 18, fat: 16, carbs: 40, sugar: 10 },
    },

    STORAGE: {
        TOKEN: 'thaiFood_token',
        USER: 'thaiFood_user',
        CAPTURED_IMAGE: 'thaiFood_capturedImage',
        LAST_ANALYSIS: 'thaiFood_lastAnalysis',
    },
}

export default CONFIG

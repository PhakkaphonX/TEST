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
            'pad thai': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62 },
            'thai': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62 },
            'noodles': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62 },
            'plate': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62 },
            'food': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62 },
            'rice': { name: 'Khao Pad', nameTh: 'ข้าวผัด', calories: 520, protein: 16, fat: 20, carbs: 68 },
            'bowl': { name: 'Tom Yum Goong', nameTh: 'ต้มยำกุ้ง', calories: 250, protein: 22, fat: 10, carbs: 16 },
            'soup': { name: 'Tom Yum Goong', nameTh: 'ต้มยำกุ้ง', calories: 250, protein: 22, fat: 10, carbs: 16 },
            'curry': { name: 'Green Curry', nameTh: 'แกงเขียวหวาน', calories: 350, protein: 22, fat: 24, carbs: 14 },
            'dish': { name: 'Massaman Curry', nameTh: 'แกงมัสมั่น', calories: 550, protein: 22, fat: 35, carbs: 32 },
            'salad': { name: 'Som Tum', nameTh: 'ส้มตำ', calories: 150, protein: 5, fat: 4, carbs: 24 },
            'dessert': { name: 'Mango Sticky Rice', nameTh: 'ข้าวเหนียวมะม่วง', calories: 420, protein: 6, fat: 14, carbs: 70 },
            'meat': { name: 'Pad Krapow Moo', nameTh: 'ผัดกระเพราหมู', calories: 530, protein: 26, fat: 25, carbs: 45 },
            'chicken': { name: 'Kai Yang', nameTh: 'ไก่ย่าง', calories: 350, protein: 38, fat: 18, carbs: 5 },
            'grill': { name: 'Satay', nameTh: 'สะเต๊ะ', calories: 380, protein: 22, fat: 24, carbs: 16 },
            'wrap': { name: 'Spring Rolls', nameTh: 'ปอเปี๊ยะ', calories: 240, protein: 8, fat: 12, carbs: 26 },
            'fish': { name: 'Pla Tod', nameTh: 'ปลาทอด', calories: 400, protein: 32, fat: 24, carbs: 14 },
            'spaghetti': { name: 'Khanom Jeen', nameTh: 'ขนมจีน', calories: 420, protein: 22, fat: 16, carbs: 48 },
            'pork': { name: 'Khao Kha Moo', nameTh: 'ข้าวขาหมู', calories: 650, protein: 35, fat: 28, carbs: 65 },
        },
        DEFAULT_FOOD: { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62, sugar: 14 },
    },

    STORAGE: {
        TOKEN: 'thaiFood_token',
        USER: 'thaiFood_user',
        CAPTURED_IMAGE: 'thaiFood_capturedImage',
        LAST_ANALYSIS: 'thaiFood_lastAnalysis',
    },
}

export default CONFIG

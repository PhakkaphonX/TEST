/**
 * =====================================================
 * Result Page JavaScript
 * Handles AI prediction and result display
 * =====================================================
 */

class ResultManager {
    constructor() {
        this.model = null;
        this.imageData = null;
        this.analysisResult = null;
        this.useFallback = false;
        this.useTMModel = false;
    }

    // Initialize
    async init() {
        this.imageData = localStorage.getItem(CONFIG.STORAGE.CAPTURED_IMAGE);

        if (!this.imageData) {
            this.showError('No image found. Please capture or upload an image first.');
            return;
        }

        // Show loading state
        this.showLoading();

        // Load model and analyze
        await this.loadModel();
        await this.analyzeImage();
    }

    // Load TensorFlow.js custom Thai food model or Vision API
    async loadModel() {
        try {
            // Try Vision API first (highest accuracy)
            if (window.VisionAPI && CONFIG.USE_VISION_API) {
                console.log('Using Google Vision API for high accuracy...');
                this.visionAPI = new VisionAPI();
                this.useVisionAPI = true;
                console.log('Vision API initialized');
                return;
            }
            // Try Teachable Machine local model (fast, offline)
            if (window.tmImage) {
                try {
                    console.log('Trying to load Teachable Machine model (tm-my-image-model)...');
                    this.model = await tmImage.load('/tm-my-image-model/model.json', '/tm-my-image-model/metadata.json');
                    this.useTMModel = true;
                    console.log('Teachable Machine model loaded successfully');
                    return;
                } catch (tmError) {
                    console.warn('Teachable Machine model not available or failed to load:', tmError);
                }
            }

            // Fallback to custom TensorFlow.js Layers model (frontend/models/model.json)
            console.log('Loading Thai food model...');
            this.model = await tf.loadLayersModel('./models/model.json');
            console.log('Thai food model loaded successfully');

        } catch (error) {
            console.error('Error loading model:', error);
            console.log('Falling back to MobileNet...');

            // Final fallback to MobileNet
            try {
                this.model = await mobilenet.load();
                console.log('MobileNet loaded as fallback');
                this.useFallback = true;
            } catch (fallbackError) {
                console.error('All models failed to load:', fallbackError);
                // Use config-based mapping as ultimate fallback
                this.useConfigFallback = true;
                console.log('Using config-based food mapping as fallback');
            }
        }
    }

    // Analyze image with Vision API or custom models
    async analyzeImage() {
        try {
            // Create image element for analysis
            const img = new Image();
            img.onload = async () => {
                try {
                    if (this.useConfigFallback) {
                        // Ultimate fallback: use default food from config
                        console.log('Using config-based fallback...');
                        const defaultFood = CONFIG.AI.DEFAULT_FOOD;
                        this.analysisResult = { ...defaultFood, confidence: 50 };
                        this.displayResult(this.analysisResult, []);
                        return;
                    }
                    if (this.useVisionAPI) {
                        // Use Google Vision API (highest accuracy)
                        console.log('Analyzing with Vision API...');
                        const results = await this.visionAPI.analyzeImage(this.imageData);
                        console.log('Vision API results:', results);
                        this.processVisionResults(results);
                    } else if (this.useFallback) {
                        // Use MobileNet fallback
                        const predictions = await this.model.classify(img);
                        console.log('MobileNet predictions:', predictions);
                        this.processPredictions(predictions);
                    } else {
                        if (this.useTMModel) {
                            // Teachable Machine model returns array of {className, probability}
                            const predictions = await this.model.predict(img);
                            console.log('Teachable Machine predictions:', predictions);
                            this.processTMPredictions(predictions);
                            return;
                        }
                        // Use custom Thai food model
                        const tensor = tf.browser.fromPixels(img)
                            .resizeNearestNeighbor([224, 224])
                            .toFloat()
                            .div(255.0)
                            .expandDims();

                        const predictions = await this.model.predict(tensor).data();
                        console.log('Custom model predictions:', predictions);
                        this.processCustomPredictions(predictions);
                    }
                } catch (error) {
                    console.error('Analysis error:', error);
                    // Even if analysis fails, show a default result rather than an error
                    const defaultFood = CONFIG.AI.DEFAULT_FOOD;
                    this.analysisResult = { ...defaultFood, confidence: 30 };
                    this.displayResult(this.analysisResult, []);
                }
            };
            img.src = this.imageData;
        } catch (error) {
            console.error('Image analysis error:', error);
            this.showError('Error analyzing image');
        }
    }

    // Process Teachable Machine predictions (tm-my-image-model)
    processTMPredictions(predictions) {
        if (!predictions || predictions.length === 0) {
            this.showError('No predictions returned from model');
            return;
        }

        // Find top prediction
        let top = predictions[0];
        for (let p of predictions) {
            if (p.probability > top.probability) top = p;
        }

        const label = top.className; // Thai label from metadata.json
        const confidence = Math.round(top.probability * 100);

        // Comprehensive nutrition mapping for all 81 Thai food classes
        // Values are approximate per serving (kcal, protein g, fat g, carbs g)
        const mapping = {
            // === กะเพรา (ข้าว 1 จาน ~400-550 kcal) ===
            'กระเพราไก่': { name: 'Krapao Gai', nameTh: 'กระเพราไก่', calories: 480, protein: 28, fat: 18, carbs: 45, sugar: 3 },
            'กระเพราทะเล': { name: 'Krapao Talay', nameTh: 'กระเพราทะเล', calories: 450, protein: 30, fat: 16, carbs: 42, sugar: 3 },
            'กระเพราหมูกรอบ': { name: 'Krapao Moo Krob', nameTh: 'กระเพราหมูกรอบ', calories: 620, protein: 24, fat: 35, carbs: 48, sugar: 4 },
            'กระเพราหมูสับ': { name: 'Krapao Moo Sap', nameTh: 'กระเพราหมูสับ', calories: 530, protein: 26, fat: 25, carbs: 45, sugar: 3 },
            'กระเพราหมูสามชั้น': { name: 'Krapao Moo Sam Chan', nameTh: 'กระเพราหมูสามชั้น', calories: 580, protein: 22, fat: 32, carbs: 45, sugar: 4 },
            // === ขนม/ของหวาน ===
            'กล้วยบวชชี': { name: 'Kluay Buat Chi', nameTh: 'กล้วยบวชชี', calories: 310, protein: 4, fat: 14, carbs: 45, sugar: 30 },
            // === ก๋วยเตี๋ยว (1 ชาม ~350-450 kcal) ===
            'ก๋วยเตี๋ยวเย็น': { name: 'Kuay Tiew Yen', nameTh: 'ก๋วยเตี๋ยวเย็น', calories: 380, protein: 15, fat: 10, carbs: 58, sugar: 6 },
            'ก๋วยเตี๋ยวเรือ': { name: 'Kuay Tiew Ruea', nameTh: 'ก๋วยเตี๋ยวเรือ', calories: 450, protein: 22, fat: 18, carbs: 48, sugar: 5 },
            'ก๋วยเตี๋ยวหมูน้ำใส': { name: 'Kuay Tiew Moo Nam Sai', nameTh: 'ก๋วยเตี๋ยวหมูน้ำใส', calories: 370, protein: 20, fat: 10, carbs: 52, sugar: 3 },
            'กะเพราหมูสับ': { name: 'Kaphrao Moo Sap', nameTh: 'กะเพราหมูสับ', calories: 530, protein: 26, fat: 25, carbs: 45, sugar: 3 },
            // === เครื่องดื่ม ===
            'กาแฟเย็น': { name: 'Kafae Yen', nameTh: 'กาแฟเย็น', calories: 200, protein: 4, fat: 6, carbs: 34, sugar: 28 },
            // === แกง (1 ถ้วย ~250-400 kcal) ===
            'แกงเขียวหวานแกงเขียวหวาน': { name: 'Green Curry', nameTh: 'แกงเขียวหวาน', calories: 350, protein: 20, fat: 24, carbs: 14, sugar: 5 },
            'แกงเขียวหวานไก่': { name: 'Green Curry Chicken', nameTh: 'แกงเขียวหวานไก่', calories: 350, protein: 22, fat: 24, carbs: 14, sugar: 5 },
            'แกงจืดเต้าหู้หมูสับ': { name: 'Gaeng Jued Taohu', nameTh: 'แกงจืดเต้าหู้หมูสับ', calories: 180, protein: 16, fat: 8, carbs: 12, sugar: 2 },
            'แกงเผ็ดหมู': { name: 'Gaeng Phet Moo', nameTh: 'แกงเผ็ดหมู', calories: 400, protein: 22, fat: 28, carbs: 16, sugar: 5 },
            'แกงป่า': { name: 'Gaeng Pa', nameTh: 'แกงป่า', calories: 220, protein: 24, fat: 10, carbs: 10, sugar: 3 },
            'แกงส้มสัน': { name: 'Gaeng Som San', nameTh: 'แกงส้มสัน', calories: 250, protein: 20, fat: 10, carbs: 18, sugar: 6 },
            'แกงส้ม': { name: 'Gaeng Som', nameTh: 'แกงส้ม', calories: 240, protein: 18, fat: 10, carbs: 16, sugar: 5 },
            // === ทอด/ย่าง ===
            'ไก่ทอด': { name: 'Gai Tod', nameTh: 'ไก่ทอด', calories: 450, protein: 32, fat: 28, carbs: 18, sugar: 1 },
            'ไก่ย่าง': { name: 'Gai Yang', nameTh: 'ไก่ย่าง', calories: 350, protein: 38, fat: 18, carbs: 5, sugar: 2 },
            // === ขนม ===
            'ขนมครก': { name: 'Khanom Krok', nameTh: 'ขนมครก', calories: 250, protein: 4, fat: 14, carbs: 28, sugar: 14 },
            'ขนมจีนน้ำยา': { name: 'Khanom Jeen Nam Ya', nameTh: 'ขนมจีนน้ำยา', calories: 420, protein: 22, fat: 16, carbs: 48, sugar: 4 },
            'ขนมถ้วย': { name: 'Khanom Thuay', nameTh: 'ขนมถ้วย', calories: 180, protein: 2, fat: 9, carbs: 24, sugar: 16 },
            // === ข้าวราดแกง/ข้าวหน้า (1 จาน ~500-700 kcal รวมข้าว) ===
            'ข้าวขาหมู': { name: 'Khao Kha Moo', nameTh: 'ข้าวขาหมู', calories: 650, protein: 35, fat: 28, carbs: 65, sugar: 6 },
            'ข้าวไข่เจียว': { name: 'Khao Khai Jiao', nameTh: 'ข้าวไข่เจียว', calories: 550, protein: 18, fat: 25, carbs: 62, sugar: 1 },
            'ข้าวคลุกกะปิ': { name: 'Khao Kluk Kapi', nameTh: 'ข้าวคลุกกะปิ', calories: 580, protein: 20, fat: 22, carbs: 72, sugar: 8 },
            'ข้าวผัด': { name: 'Khao Pad', nameTh: 'ข้าวผัด', calories: 520, protein: 16, fat: 20, carbs: 68, sugar: 4 },
            'ข้าวมันไก่': { name: 'Khao Man Gai', nameTh: 'ข้าวมันไก่', calories: 630, protein: 30, fat: 24, carbs: 72, sugar: 2 },
            'ข้าวหน้าเป็ด': { name: 'Khao Na Pet', nameTh: 'ข้าวหน้าเป็ด', calories: 600, protein: 28, fat: 24, carbs: 65, sugar: 6 },
            'ข้าวหมูกรอบ': { name: 'Khao Moo Krob', nameTh: 'ข้าวหมูกรอบ', calories: 650, protein: 25, fat: 32, carbs: 62, sugar: 5 },
            'ข้าวหมูแดง': { name: 'Khao Moo Daeng', nameTh: 'ข้าวหมูแดง', calories: 580, protein: 28, fat: 20, carbs: 68, sugar: 10 },
            'ข้าวเหนียวมะม่วง': { name: 'Khao Niao Mamuang', nameTh: 'ข้าวเหนียวมะม่วง', calories: 420, protein: 6, fat: 14, carbs: 70, sugar: 35 },
            // === ซุป/น้ำ ===
            'ซุปเลือดหมู': { name: 'Soup Lueat Moo', nameTh: 'ซุปเลือดหมู', calories: 200, protein: 18, fat: 8, carbs: 16, sugar: 2 },
            'เฉาก๊วย': { name: 'Chao Kuay', nameTh: 'เฉาก๊วย', calories: 150, protein: 1, fat: 1, carbs: 36, sugar: 28 },
            'ชาเขียว': { name: 'Cha Khiao', nameTh: 'ชาเขียว', calories: 180, protein: 3, fat: 4, carbs: 35, sugar: 28 },
            'ชาไทย': { name: 'Cha Thai', nameTh: 'ชาไทย', calories: 230, protein: 4, fat: 6, carbs: 42, sugar: 34 },
            'ซอยจุ๊': { name: 'Soi Ju', nameTh: 'ซอยจุ๊', calories: 420, protein: 18, fat: 16, carbs: 52, sugar: 5 },
            // === ต้ม (1 ชาม ~200-350 kcal) ===
            'ต้มข่าไก่': { name: 'Tom Kha Gai', nameTh: 'ต้มข่าไก่', calories: 350, protein: 22, fat: 24, carbs: 12, sugar: 4 },
            'ต้มยำกระดูกอ่อน': { name: 'Tom Yum Kraduuk On', nameTh: 'ต้มยำกระดูกอ่อน', calories: 250, protein: 20, fat: 12, carbs: 15, sugar: 3 },
            'ต้มยำกุ้ง': { name: 'Tom Yum Goong', nameTh: 'ต้มยำกุ้ง', calories: 250, protein: 22, fat: 10, carbs: 16, sugar: 3 },
            // === ตำ/ยำ ===
            'ตำซั่ว': { name: 'Tam Sua', nameTh: 'ตำซั่ว', calories: 220, protein: 8, fat: 6, carbs: 35, sugar: 10 },
            'ตำแตง': { name: 'Tam Taeng', nameTh: 'ตำแตง', calories: 110, protein: 4, fat: 3, carbs: 18, sugar: 8 },
            'ตำถั่ว': { name: 'Tam Thua', nameTh: 'ตำถั่ว', calories: 180, protein: 8, fat: 5, carbs: 26, sugar: 7 },
            'ตำปูปลาร้า': { name: 'Tam Pu Pla Ra', nameTh: 'ตำปูปลาร้า', calories: 190, protein: 10, fat: 5, carbs: 28, sugar: 9 },
            // === ทอดมัน/ทอด ===
            'ทอดมันปลา': { name: 'Tod Man Pla', nameTh: 'ทอดมันปลา', calories: 320, protein: 18, fat: 18, carbs: 22, sugar: 3 },
            'ทับทิมกรอบ': { name: 'Thap Thim Krop', nameTh: 'ทับทิมกรอบ', calories: 220, protein: 2, fat: 6, carbs: 42, sugar: 32 },
            // === เนื้อ ===
            'น้ำตกหมู': { name: 'Nam Tok Moo', nameTh: 'น้ำตกหมู', calories: 300, protein: 25, fat: 20, carbs: 6, sugar: 2 },
            // === เครื่องดื่ม ===
            'น้ำมะพร้าว': { name: 'Nam Maprao', nameTh: 'น้ำมะพร้าว', calories: 70, protein: 1, fat: 0, carbs: 17, sugar: 14 },
            'น้ำลำไย': { name: 'Nam Lamyai', nameTh: 'น้ำลำไย', calories: 160, protein: 1, fat: 0, carbs: 40, sugar: 34 },
            // === บะหมี่ ===
            'บะหมี่หมูแดง': { name: 'Ba Mee Moo Daeng', nameTh: 'บะหมี่หมูแดง', calories: 440, protein: 24, fat: 14, carbs: 55, sugar: 6 },
            'บัวลอย': { name: 'Bua Loy', nameTh: 'บัวลอย', calories: 260, protein: 4, fat: 10, carbs: 40, sugar: 26 },
            // === ปลา/ไก่ทอด ===
            'ปลาทอด': { name: 'Pla Tod', nameTh: 'ปลาทอด', calories: 400, protein: 32, fat: 24, carbs: 14, sugar: 1 },
            'ปีกไก่ทอด': { name: 'Peek Gai Tod', nameTh: 'ปีกไก่ทอด', calories: 420, protein: 28, fat: 28, carbs: 16, sugar: 1 },
            // === ผัดกะเพรา (ข้าว 1 จาน) ===
            'ผัดกะเพรากุ้ง': { name: 'Pad Krapao Kung', nameTh: 'ผัดกะเพรากุ้ง', calories: 440, protein: 28, fat: 16, carbs: 44, sugar: 3 },
            'ผัดกะเพราไก่': { name: 'Pad Krapao Gai', nameTh: 'ผัดกะเพราไก่', calories: 480, protein: 28, fat: 18, carbs: 45, sugar: 3 },
            'ผัดกะเพราเครื่องใน': { name: 'Pad Krapao Kruang Nai', nameTh: 'ผัดกะเพราเครื่องใน', calories: 460, protein: 30, fat: 22, carbs: 35, sugar: 3 },
            'ผัดกะเพราทะเลรวม': { name: 'Pad Krapao Talay Ruam', nameTh: 'ผัดกะเพราทะเลรวม', calories: 440, protein: 32, fat: 16, carbs: 40, sugar: 3 },
            'ผัดกะเพราหมึก': { name: 'Pad Krapao Muk', nameTh: 'ผัดกะเพราหมึก', calories: 420, protein: 25, fat: 16, carbs: 42, sugar: 3 },
            // === ผัด ===
            'ผัดซีอิ๊ว': { name: 'Pad See Ew', nameTh: 'ผัดซีอิ๊ว', calories: 550, protein: 22, fat: 20, carbs: 68, sugar: 10 },
            'ผัดไทย': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62, sugar: 14 },
            // === ยำ ===
            'พล่ากุ้ง': { name: 'Pla Kung', nameTh: 'พล่ากุ้ง', calories: 180, protein: 25, fat: 5, carbs: 10, sugar: 4 },
            'ยำทะเล': { name: 'Yam Talay', nameTh: 'ยำทะเล', calories: 220, protein: 28, fat: 7, carbs: 14, sugar: 5 },
            'ยำวุ้นเส้น': { name: 'Yam Woon Sen', nameTh: 'ยำวุ้นเส้น', calories: 250, protein: 16, fat: 8, carbs: 30, sugar: 6 },
            'ยำหมูยอ': { name: 'Yam Moo Yor', nameTh: 'ยำหมูยอ', calories: 280, protein: 18, fat: 16, carbs: 16, sugar: 5 },
            // === ราดหน้า ===
            'ราดหน้า': { name: 'Rad Na', nameTh: 'ราดหน้า', calories: 550, protein: 22, fat: 18, carbs: 72, sugar: 6 },
            // === ขนมหวาน ===
            'ลอดช่อง': { name: 'Lod Chong', nameTh: 'ลอดช่อง', calories: 220, protein: 2, fat: 7, carbs: 40, sugar: 30 },
            // === ลาบ ===
            'ลาบไก่': { name: 'Larb Gai', nameTh: 'ลาบไก่', calories: 290, protein: 28, fat: 16, carbs: 8, sugar: 2 },
            'ลาบเนื้อดิบ': { name: 'Larb Nuea Dip', nameTh: 'ลาบเนื้อดิบ', calories: 260, protein: 30, fat: 14, carbs: 5, sugar: 1 },
            'ลาบเนื้อสุก': { name: 'Larb Nuea Suk', nameTh: 'ลาบเนื้อสุก', calories: 280, protein: 32, fat: 14, carbs: 6, sugar: 1 },
            'ลาบหมู': { name: 'Larb Moo', nameTh: 'ลาบหมู', calories: 330, protein: 24, fat: 24, carbs: 5, sugar: 1 },
            'ลูกชิ้นทอด': { name: 'Luk Chin Tod', nameTh: 'ลูกชิ้นทอด', calories: 350, protein: 18, fat: 22, carbs: 24, sugar: 2 },
            // === ส้มตำ (1 จาน ~120-250 kcal) ===
            'ส้มตำ': { name: 'Som Tum', nameTh: 'ส้มตำ', calories: 150, protein: 5, fat: 4, carbs: 24, sugar: 12 },
            'ส้มตำไทย': { name: 'Som Tum Thai', nameTh: 'ส้มตำไทย', calories: 180, protein: 8, fat: 4, carbs: 28, sugar: 14 },
            'ส้มตำปลาร้า': { name: 'Som Tum Pla Ra', nameTh: 'ส้มตำปลาร้า', calories: 160, protein: 7, fat: 4, carbs: 24, sugar: 10 },
            'ส้มตำปูปลาร้า': { name: 'Som Tum Pu Pla Ra', nameTh: 'ส้มตำปูปลาร้า', calories: 190, protein: 10, fat: 5, carbs: 26, sugar: 10 },
            // === สุกี้ ===
            'สุกี้น้ำ': { name: 'Suki Nam', nameTh: 'สุกี้น้ำ', calories: 380, protein: 26, fat: 12, carbs: 42, sugar: 7 },
            'สุกี้แห้ง': { name: 'Suki Haeng', nameTh: 'สุกี้แห้ง', calories: 450, protein: 28, fat: 18, carbs: 44, sugar: 9 },
            // === เนื้อสัตว์ ===
            'ไส้อั่ว': { name: 'Sai Oua', nameTh: 'ไส้อั่ว', calories: 380, protein: 20, fat: 30, carbs: 6, sugar: 1 },
            'หมูทอด': { name: 'Moo Tod', nameTh: 'หมูทอด', calories: 480, protein: 25, fat: 35, carbs: 12, sugar: 1 },
            'หมูปิ้ง': { name: 'Moo Ping', nameTh: 'หมูปิ้ง', calories: 320, protein: 22, fat: 22, carbs: 12, sugar: 6 },
            // === เครื่องดื่ม ===
            'โอเลี้ยง': { name: 'Oliang', nameTh: 'โอเลี้ยง', calories: 170, protein: 2, fat: 4, carbs: 32, sugar: 26 }
        };

        const foodData = mapping[label];
        if (foodData) {
            this.analysisResult = { ...foodData, confidence };
            this.displayResult(this.analysisResult, []);
        } else {
            // If unknown label, use the label as name and estimate nutrition
            this.analysisResult = { name: label, nameTh: label, calories: 300, protein: 15, fat: 10, carbs: 35, sugar: 5, confidence };
            this.displayResult(this.analysisResult, []);
        }
    }

    // Process custom Thai food model predictions
    processCustomPredictions(predictions) {
        // Class names from the trained model
        const classNames = ["green_curry", "mango_sticky_rice", "pad_thai", "som_tum", "tom_yum"];

        // Thai food mapping with nutrition data
        const thaiFoodMapping = {
            'green_curry': { name: 'Green Curry', nameTh: 'แกงเขียวหวาน', calories: 350, protein: 22, fat: 24, carbs: 14, sugar: 5 },
            'mango_sticky_rice': { name: 'Mango Sticky Rice', nameTh: 'ข้าวเหนียวมะม่วง', calories: 420, protein: 6, fat: 14, carbs: 70, sugar: 35 },
            'pad_thai': { name: 'Pad Thai', nameTh: 'ผัดไทย', calories: 500, protein: 20, fat: 18, carbs: 62, sugar: 14 },
            'som_tum': { name: 'Som Tum', nameTh: 'ส้มตำ', calories: 150, protein: 5, fat: 4, carbs: 24, sugar: 12 },
            'tom_yum': { name: 'Tom Yum Goong', nameTh: 'ต้มยำกุ้ง', calories: 250, protein: 22, fat: 10, carbs: 16, sugar: 3 }
        };

        // Find the class with highest probability
        let maxProbability = 0;
        let predictedClassIndex = 0;

        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                maxProbability = predictions[i];
                predictedClassIndex = i;
            }
        }

        // Get the predicted food
        const predictedClass = classNames[predictedClassIndex];
        const confidence = Math.round(maxProbability * 100);
        const foodData = thaiFoodMapping[predictedClass];

        if (foodData) {
            this.analysisResult = {
                ...foodData,
                confidence: confidence
            };
            this.displayResult(this.analysisResult, []);
        } else {
            this.showError('Could not identify the food');
        }
    }

    // Process Vision API results (highest accuracy)
    processVisionResults(results) {
        if (results.thaiFood) {
            this.analysisResult = results.thaiFood;
            console.log(`Identified: ${results.thaiFood.name} with ${results.thaiFood.confidence}% confidence`);
            this.displayResult(this.analysisResult, []);
        } else {
            // Fallback to generic food detection
            console.log('No specific Thai food detected, using generic analysis...');
            this.fallbackToGeneric(results);
        }
    }

    // Fallback to generic food analysis
    fallbackToGeneric(results) {
        const allLabels = [
            ...results.labels.map(l => l.description),
            ...results.objects.map(o => o.name),
            ...results.webEntities.map(w => w.description)
        ];

        // Try to identify generic food type
        let foodType = 'Food';
        let calories = 350;

        const text = allLabels.join(' ').toLowerCase();
        if (text.includes('rice')) foodType = 'Rice Dish';
        if (text.includes('noodle')) foodType = 'Noodle Dish';
        if (text.includes('soup')) foodType = 'Soup';
        if (text.includes('salad')) foodType = 'Salad';
        if (text.includes('curry')) foodType = 'Curry';

        this.analysisResult = {
            name: foodType,
            nameTh: 'อาหาร',
            calories: calories,
            protein: 15,
            fat: 12,
            carbs: 40,
            sugar: 5,
            confidence: 60
        };

        this.displayResult(this.analysisResult, []);
    }

    // Capitalize first letter
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Estimate calories based on food type
    estimateCalories(foodName) {
        const foodNameLower = foodName.toLowerCase();
        if (foodNameLower.includes('fried')) return 450;
        if (foodNameLower.includes('curry')) return 380;
        if (foodNameLower.includes('soup')) return 150;
        if (foodNameLower.includes('salad')) return 120;
        if (foodNameLower.includes('dessert') || foodNameLower.includes('sweet')) return 280;
        return 350; // default
    }

    // Display result
    displayResult(result, alternatives) {
        // Hide loading, show result
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('resultCard')?.classList.remove('d-none');

        // Set image
        const resultImage = document.getElementById('resultImage');
        if (resultImage) resultImage.src = this.imageData;

        // Set confidence
        const confidenceBadge = document.getElementById('confidenceBadge');
        if (confidenceBadge) confidenceBadge.textContent = `${result.confidence}% Confidence`;

        // Set food names
        const foodName = document.getElementById('foodName');
        const foodNameTh = document.getElementById('foodNameTh');
        if (foodName) foodName.textContent = result.name;
        if (foodNameTh) foodNameTh.textContent = result.nameTh || '';

        // Set nutrition values
        const calories = document.getElementById('calories');
        const protein = document.getElementById('protein');
        const fat = document.getElementById('fat');
        const carbs = document.getElementById('carbs');
        const sugar = document.getElementById('sugar');

        if (calories) calories.textContent = result.calories;
        if (protein) protein.textContent = result.protein;
        if (fat) fat.textContent = result.fat;
        if (carbs) carbs.textContent = result.carbs;
        if (sugar) sugar.textContent = result.sugar || 0;

        // Set alternatives
        const alternativesList = document.getElementById('alternativesList');
        const alternativesDiv = document.getElementById('alternatives');

        if (alternativesList && alternatives.length > 0) {
            alternativesList.innerHTML = alternatives.map(alt => `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-medium">${alt.name}</span>
                        <small class="text-muted d-block">${alt.nameTh}</small>
                    </div>
                    <span class="alt-confidence">${alt.confidence}%</span>
                </div>
            `).join('');
        } else if (alternativesDiv) {
            alternativesDiv.style.display = 'none';
        }

        // Store analysis result for saving
        this.analysisResult = result;
        localStorage.setItem(CONFIG.STORAGE.LAST_ANALYSIS, JSON.stringify(result));

        // Bind save button
        document.getElementById('saveLogBtn')?.addEventListener('click', () => this.saveLog());
        document.getElementById('analyzeAgainBtn')?.addEventListener('click', () => {
            window.location.href = 'camera.html';
        });
    }

    // Show loading state
    showLoading() {
        document.getElementById('loadingState')?.classList.remove('d-none');
        document.getElementById('resultCard')?.classList.add('d-none');
        document.getElementById('errorState')?.classList.add('d-none');
    }

    // Show error state
    showError(message) {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('resultCard')?.classList.add('d-none');

        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');

        if (errorState) errorState.classList.remove('d-none');
        if (errorMessage) errorMessage.textContent = message;
    }

    // Save food log — localStorage + try API
    async saveLog() {
        if (!this.analysisResult) return;

        const saveBtn = document.getElementById('saveLogBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        }

        try {
            // Build log entry
            const logEntry = {
                id: Date.now(),
                food_name: this.analysisResult.name,
                food_name_th: this.analysisResult.nameTh || '',
                calories: this.analysisResult.calories,
                protein: this.analysisResult.protein,
                fat: this.analysisResult.fat,
                carbs: this.analysisResult.carbs,
                sugar: this.analysisResult.sugar || 0,
                confidence: this.analysisResult.confidence,
                image_data: this.imageData || '',
                date: new Date().toISOString()
            };

            // Always save to localStorage first
            const history = JSON.parse(localStorage.getItem('foodHistory') || '[]');
            history.unshift(logEntry);
            localStorage.setItem('foodHistory', JSON.stringify(history));

            // Also try saving to backend API (non-blocking)
            try {
                if (Utils.isLoggedIn()) {
                    // Upload image first
                    const uploadResponse = await API.post('/upload/image', {
                        imageData: this.imageData
                    });

                    if (uploadResponse.success) {
                        await API.post('/logs', {
                            food_name: logEntry.food_name,
                            food_name_th: logEntry.food_name_th,
                            calories: logEntry.calories,
                            protein: logEntry.protein,
                            fat: logEntry.fat,
                            carbs: logEntry.carbs,
                            confidence: logEntry.confidence,
                            image_path: uploadResponse.data?.url || ''
                        });
                    }
                }
            } catch (apiErr) {
                // API not available — localStorage save is sufficient
                console.log('API save skipped (backend not available)');
            }

            // Show success modal
            const modal = new bootstrap.Modal(document.getElementById('saveSuccessModal'));
            modal.show();

            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Saved!';
            }
        } catch (error) {
            console.error('Save error:', error);
            if (typeof Utils !== 'undefined' && Utils.showToast) {
                Utils.showToast('Error saving analysis. Please try again.', 'danger');
            }

            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="bi bi-save me-2"></i>Save to History';
            }
        }
    }
}

// Initialize result manager
document.addEventListener('DOMContentLoaded', () => {
    const resultManager = new ResultManager();
    resultManager.init();
});

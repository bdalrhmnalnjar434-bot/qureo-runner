const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); 

let browser;

async function login(studentId, password) {
    if (!browser) {
        browser = await chromium.launch({ headless: true });
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        await page.goto('https://me-portal.qureo.education/login', { waitUntil: 'networkidle', timeout: 60000 });
        
        // محاولة كتابة البيانات (ممكن نغيرها لو الموقع فيه حماية)
        await page.fill('input[type="text"]', studentId);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
        return { success: true, message: "تم تسجيل الدخول بنجاح" };
    } catch (error) {
        return { success: false, message: "فشل تسجيل الدخول: " + error.message };
    }
}

app.post('/api/login', async (req, res) => {
    const { studentId, password } = req.body;
    const result = await login(studentId, password);
    res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

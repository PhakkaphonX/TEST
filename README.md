# Thai Food Analysis and Calorie Calculation System

An intelligent web-based system for analyzing Thai food images and calculating nutritional information using AI (TensorFlow.js).

## Features

- **Real-time Camera Detection**: Use your webcam to capture food images
- **Upload Image Detection**: Upload photos from your device
- **AI-Powered Analysis**: Uses TensorFlow.js MobileNet for image classification
- **Nutritional Information**: Calories, protein, fat, and carbohydrates
- **History Tracking**: Save and view your food analysis history
- **Dashboard**: Visual charts and statistics for tracking your nutrition
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5
- Chart.js for data visualization
- TensorFlow.js + MobileNet for AI image classification

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Multer for image uploads

## Project Structure

```
thai-food-analysis/
├── frontend/
│   ├── index.html          # Home page
│   ├── camera.html         # Camera/upload page
│   ├── result.html         # Analysis result page
│   ├── dashboard.html      # User dashboard
│   ├── history.html        # Analysis history
│   ├── login.html          # Login page
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       ├── config.js       # Configuration
│       ├── main.js         # Main utilities
│       ├── home.js         # Home page
│       ├── camera.js       # Camera functionality
│       ├── result.js       # AI analysis
│       ├── dashboard.js    # Dashboard charts
│       ├── history.js      # History management
│       └── auth.js         # Authentication
├── backend/
│   ├── server.js           # Express server
│   ├── package.json
│   ├── .env.example        # Environment template
│   ├── routes/
│   │   ├── auth.routes.js  # Auth endpoints
│   │   ├── food.routes.js  # Food endpoints
│   │   ├── log.routes.js   # Log endpoints
│   │   └── upload.routes.js # Upload endpoints
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── food.controller.js
│   │   ├── foodlog.controller.js
│   │   └── upload.controller.js
│   ├── models/
│   │   ├── db.js           # Database connection
│   │   ├── user.model.js
│   │   ├── food.model.js
│   │   └── foodlog.model.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── uploads/            # Image uploads directory
└── database/
    └── schema.sql          # MySQL schema
```

## Installation Guide

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Step 1: Clone/Download the Project

```bash
# If using git
git clone <repository-url>
cd thai-food-analysis

# Or manually extract the project folder
cd thai-food-analysis
```

### Step 2: Setup MySQL Database

1. Open MySQL (using MySQL Workbench, command line, or phpMyAdmin)

2. Run the database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   
   Or copy and paste the contents of `database/schema.sql` into your MySQL client.

3. Verify the database was created:
   ```sql
   USE thai_food_analysis;
   SHOW TABLES;
   ```

### Step 3: Configure Backend Environment

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your database credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=thai_food_analysis
   JWT_SECRET=your-secret-key-here
   ```

### Step 4: Install Backend Dependencies

```bash
npm install
```

### Step 5: Start the Backend Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start at `http://localhost:3000`

You should see:
```
==================================================
Thai Food Analysis API Server
==================================================
Server running on port: 3000
API URL: http://localhost:3000/api
Frontend: http://localhost:3000
==================================================
```

### Step 6: Access the Application

Open your browser and go to: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/search?q=keyword` - Search foods
- `GET /api/foods/:id` - Get food by ID
- `GET /api/foods/nutrition/:name` - Get nutrition by name

### Food Logs (Protected)
- `POST /api/logs` - Create new log
- `GET /api/logs` - Get user logs
- `GET /api/logs/dashboard` - Get dashboard data
- `GET /api/logs/today` - Get today's calories
- `GET /api/logs/weekly` - Get weekly calories
- `DELETE /api/logs/:id` - Delete log

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## Usage Guide

### 1. Analyze Food

1. Click "Start Analysis" or go to Camera page
2. Choose one of the options:
   - **Webcam**: Allow camera access and click "Capture"
   - **Upload**: Drag & drop or browse for an image
3. View the AI analysis results
4. Save to your history (requires login)

### 2. View Dashboard

1. Login or continue as guest
2. Go to Dashboard page
3. View:
   - Today's calories
   - Weekly statistics
   - Nutrition breakdown chart
   - Recent analyses

### 3. View History

1. Go to History page
2. View all your saved analyses
3. Filter by date or search by food name
4. Export data to CSV

## Default Users

The database includes a default test user:
- **Email**: test@example.com
- **Password**: (set during schema execution)

Or register a new account.

## Troubleshooting

### Camera not working
- Ensure you gave camera permissions in your browser
- Use HTTPS or localhost (required for camera access)
- Try using the upload option instead

### Database connection error
- Check MySQL is running
- Verify credentials in `.env` file
- Ensure database `thai_food_analysis` exists

### AI model not loading
- Check internet connection (required for model download)
- Refresh the page to retry
- Check browser console for errors

### Port already in use
- Change PORT in `.env` file
- Or kill the process using port 3000

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Camera features require HTTPS or localhost.

## Development

### Adding New Thai Foods

Edit the `database/schema.sql` and add to the INSERT statement:
```sql
INSERT INTO foods (name, name_th, calories, protein, fat, carbs, category) VALUES
('Your Food', 'ชื่ออาหาร', 300, 15, 10, 40, 'Category');
```

### Custom AI Model (Future)

To use a custom model:
1. Train your model with TensorFlow
2. Convert to TensorFlow.js format
3. Replace the MobileNet model loading in `camera.js` and `result.js`

## Security Notes

- Change JWT_SECRET in production
- Use strong passwords
- Enable HTTPS in production
- Set up proper CORS policy
- Validate all user inputs

## License

MIT License - Feel free to use and modify.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all installation steps
4. Check API is running at `http://localhost:3000/api/health`

---

**Enjoy analyzing Thai food with AI!**


🚨 Raksha: AI-Powered Personal Safety App
Raksha is a real-time, AI-enhanced mobile safety solution built during the HackOrbit Hackathon. It protects users in dangerous situations using voice detection, location sharing, and automated SOS alerts to emergency contacts.

📱 Built with React Native (Expo) · 🧠 Sound classification using TensorFlow Lite · ☁️ Node.js backend with MongoDB, Twilio WhatsApp Alerts, and Cloudinary

🔒 Core Features
Feature	Description
🎧 Guardian Mode	Enables background audio recording and sound classification (e.g., scream, cry, abuse).
📍 Location Tracking	Captures real-time GPS location and sends alerts with map links.
🔊 Audio Classification	Uses Teachable Machine + TensorFlow Lite model to detect distress signals from audio.
🆘 SOS Alert	Automatically or manually sends alerts to emergency contacts via WhatsApp with location + audio proof.
🧑‍🤝‍🧑 Emergency Contact Verification	Contacts can mark SOS as false if triggered unintentionally.
🔐 Fake Lock Screen & PIN/Fingerprint	Password-protected app with fake screen for stealth mode.
🕵️ Police Dashboard (Web)	(Future Scope) Police can view active alerts and user locations.

📂 Project Structure
bash
Copy
Edit
Raksha/
├── app-frontend/      # React Native Expo app
├── app-backend/       # Express.js backend for app logic
│   ├── Python/        # Audio classification script
│   └── uploads/       # Temporary storage for audio files
├── web-backend/       # (Optional) Backend for police dashboard
└── ML Model/          # Teachable Machine exported TFLite model
🚀 Getting Started
1️⃣ Clone the Repo
bash
Copy
Edit
git clone https://github.com/YOUR_USERNAME/raksha.git
cd raksha
2️⃣ Setup Environment Variables
Create .env files in both app-backend/ and app-frontend/:

.env for app-backend:
ini
Copy
Edit
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
3️⃣ Install & Start Backend Server
bash
Copy
Edit
cd app-backend
npm install
node server.js
Backend runs at: http://localhost:5000/

4️⃣ Install & Run Mobile App
bash
Copy
Edit
cd ../app-frontend
npm install
npx expo start
Scan the QR code in Expo Go app or run on emulator.

5️⃣ Python Setup (for Audio Classification)
Inside app-backend/Python:

bash
Copy
Edit
cd app-backend/Python
python -m venv venv
venv\Scripts\activate      # On Windows
pip install -r requirements.txt
✅ Requirements:
txt
Copy
Edit
tensorflow
librosa
numpy
Ensure ffmpeg is installed and available in PATH.

🧠 AI Model
Component	Details
Model	TensorFlow Lite (.tflite)
Source	Teachable Machine
Classes	screaming, crying, violence, background noise

Audio is classified using a lightweight TFLite model via a Python script integrated with the backend.

✅ API Endpoints
🔐 Auth
POST /auth/register

POST /auth/login

🛡️ Guardian Mode
POST /guardian/toggle

GET /guardian/status/:userId

🎧 SOS
POST /sos/classify – auto-detect & trigger SOS

POST /sos/trigger – manual SOS trigger

POST /sos/resend – resend SOS

POST /sos/mark-false – mark false detection

🛠️ Tech Stack
Layer	Technology
Frontend	React Native (Expo)
Backend	Node.js, Express.js
Database	MongoDB Atlas
AI	TensorFlow Lite, Python, librosa
Alerts	Twilio WhatsApp API
Storage	Cloudinary
Audio Conversion	fluent-ffmpeg / ffmpeg CLI

📸 Screenshots (Optional)
Include screenshots of:

Guardian Mode toggle

SOS Alert screen

WhatsApp alert format

Admin (police) dashboard

🔮 Future Enhancements
🕵️‍♀️ Live Police Dashboard with map view

🧠 On-device AI classification (offline)

👁️‍🗨️ Visual distress detection using camera

📡 Bluetooth panic button support

🏆 Built For
HackOrbit 2025 - 36 Hour Hackathon Challenge

Team: Yash & Team

🧾 License
This project is licensed under the MIT License.
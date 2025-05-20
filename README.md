# Deakin Second-Hand Marketplace

A cloud-native marketplace application for Deakin University students to buy and sell second-hand items.

## Features

- User authentication with Deakin student ID
- Create and manage item listings
- Search and browse items
- Real-time messaging between buyers and sellers
- Image upload for listings
- Responsive design for all devices

## Technologies Used

- Frontend: React.js
- Backend: Node.js with Express
- Database: Firebase Firestore
- Authentication: Firebase Authentication
- File Storage: Firebase Storage
- Real-time Messaging: Firebase Realtime Database
- Hosting: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Deakin University credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deakin-marketplace.git
cd deakin-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and add your configuration:
- Create a `.env` file in the root directory
- Add your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
deakin-marketplace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
├── server/                # Node.js backend
│   ├── config/           # Server configuration
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
└── README.md             # Project documentation
```



## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Deakin University for providing access to Google Cloud Platform
- Firebase team for their excellent documentation and tools
- The React community for their amazing ecosystem


# Task 10.1P-10.2HD
#  Deakin Marketplace

**Deakin Marketplace** is a full-stack web application designed for Deakin University students to buy, sell, and browse second-hand items. It features a secure login system, image upload support, and Kubernetes-based deployment on Google Cloud.

---

##  Tech Stack

| Layer     | Technology                             |
|-----------|----------------------------------------|
| Frontend  | React, React Router, Bootstrap         |
| Backend   | Node.js, Express.js                    |
| Database  | MongoDB Atlas                          |
| DevOps    | Docker, Kubernetes, GCP (Cloud Shell)  |
| Auth      | JWT (JSON Web Token)                   |

---

##  Project Structure

```
Deakin-Marketplace/
├── client/                        # React frontend
│   ├── public/
│   └── src/
├── server/                        # Express backend
│   ├── routes/
│   ├── models/
│   └── index.js
├── uploads/                       # Uploaded image directory
├── Dockerfile-frontend           # Frontend image build config
├── Dockerfile-backend            # Backend image build config
├── deployment.yaml               # Backend Kubernetes Deployment
├── service.yaml                  # Backend Service
├── client/deployment-frontend.yaml  # Frontend Deployment
├── client/service-frontend.yaml     # Frontend Service
└── .env.production               # Production environment variables for frontend
```

---

##  Features

- User Registration & Login (JWT)
- List and browse available second-hand items
- Upload and display item images
- Set and update item status: Available, Pending, Sold
- Like and unlike items
- Messaging system between users
- Persistent `/uploads` image directory mounted via Kubernetes volume
- Deployed frontend and backend on GKE using LoadBalancer

---

##  Build & Deploy Workflow

### 1. Git Configuration (Cloud Shell)
```bash
git config --global user.name "xsc224387468"
git config --global user.email "you@example.com"
```

---

### 2. Build & Push Docker Images

#### Backend
```bash
docker build -t shichengxiang/deakin-marketplace:v5 -f Dockerfile-backend .
docker push shichengxiang/deakin-marketplace:v5
```

#### Frontend
```bash
cd client
npm install
npm run build
cd ..
docker build -t shichengxiang/deakin-frontend:v9 -f Dockerfile-frontend .
docker push shichengxiang/deakin-frontend:v9
```

---

### 3. Apply Kubernetes Configuration

#### Backend
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

#### Frontend
```bash
kubectl apply -f client/deployment-frontend.yaml
kubectl apply -f client/service-frontend.yaml
```

---

### 4. Check LoadBalancer IPs
```bash
kubectl get service
```
Example:
- Frontend: `http://34.129.26.216`
- Backend API: `http://34.129.60.74/api`

---

##  Image Upload & Persistent Storage

- Uploaded images are stored in the `/uploads` directory
- Kubernetes mounts this directory using `emptyDir` or a `PersistentVolumeClaim`
- The backend exposes it via:
  ```js
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  ```

---

##  Functional Pages

- `/register` & `/login`: JWT-based auth
- `/sell`: Form with image upload
- `/items`: Public marketplace
- `/profile`: Lists user's items and liked items
- `/messages`: Chat interface

---

##  Security Notes

- MongoDB URI is loaded via `process.env.MONGODB_URI`
- Frontend API endpoint is hardcoded:
  ```js
  const API_BASE_URL = "http://34.129.60.74";
  ```

---

##  Push to GitHub from Cloud Shell

```bash
git init
git remote add origin https://github.com/xsc224387468/Deakin-Marketplace.git
git add .
git commit -m "Initial commit from Cloud Shell"
git push -u origin main
```

---

##  Author
- Shicheng Xiang
- **Student ID**: s224387468
- **GitHub**: [xsc224387468](https://github.com/xsc224387468)





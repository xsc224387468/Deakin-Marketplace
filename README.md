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

## Deployment

The application is deployed using Firebase:

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
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
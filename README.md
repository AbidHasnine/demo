# CodeCollab - Learning Platform

A comprehensive full-stack learning platform built with **Spring Boot** (Java) for the backend and **HTML, CSS, and Vanilla JavaScript** for the frontend.

## 🚀 Features

### 1. **Landing Page**
- Modern, responsive UI with hero section
- Navigation links to all platform sections
- Feature cards showcasing platform capabilities

### 2. **Resources Page**
- Grid-based display of learning resources
- Category filtering (OOP, DSA, Web Dev)
- Pre-populated with sample educational resources
- Fetch data from REST API

### 3. **Problem Forum (Q&A)**
- Post questions with title and description
- **File Upload Support**: Add photos and file attachments
- View all posted problems in a feed
- Download attachments from problems

### 4. **Collab Space (Real-Time)**
- **Live Chat**: Real-time messaging using WebSocket (STOMP/SockJS)
- **Shared Code Editor**: Collaborative code editing with real-time synchronization
- Multi-language support (JavaScript, Python, Java, C++)
- Connection status indicator

## 🛠️ Technical Stack

### Backend
- **Spring Boot 4.0.1**
- **Spring Web** - REST APIs
- **Spring Data JPA** - Database operations
- **Spring WebSocket** - Real-time communication
- **H2 Database** - In-memory database
- **Lombok** - Reduce boilerplate code

### Frontend
- **HTML5**
- **CSS3** (Flexbox/Grid)
- **Vanilla JavaScript**
- **Fetch API** - REST calls
- **SockJS + STOMP** - WebSocket communication

## 📁 Project Structure

```
codecollab/
├── src/main/java/com/codecollab/source/
│   ├── CodecollabApplication.java          # Main application class
│   ├── config/
│   │   ├── WebSocketConfig.java            # WebSocket configuration (STOMP)
│   │   └── WebConfig.java                  # Web & CORS configuration
│   ├── controller/
│   │   ├── ChatController.java             # WebSocket chat controller
│   │   ├── CodeSyncController.java         # WebSocket code sync controller
│   │   ├── ProblemController.java          # REST API for problems
│   │   ├── ResourceController.java         # REST API for resources
│   │   └── FileController.java             # File download controller
│   ├── dto/
│   │   ├── ChatMessage.java                # Chat message DTO
│   │   └── CodeSyncMessage.java            # Code sync DTO
│   ├── entity/
│   │   ├── Problem.java                    # Problem entity
│   │   ├── Message.java                    # Message entity
│   │   └── Resource.java                   # Resource entity
│   ├── repository/
│   │   ├── ProblemRepository.java          # Problem repository
│   │   ├── MessageRepository.java          # Message repository
│   │   └── ResourceRepository.java         # Resource repository
│   ├── service/
│   │   ├── FileStorageService.java         # File upload/storage service
│   │   ├── ProblemService.java             # Problem business logic
│   │   ├── ResourceService.java            # Resource business logic
│   │   └── MessageService.java             # Message business logic
│   └── listener/
│       └── WebSocketEventListener.java     # WebSocket event handler
├── src/main/resources/
│   ├── application.properties              # Application configuration
│   └── static/
│       ├── index.html                      # Landing page
│       ├── resources.html                  # Resources page
│       ├── problems.html                   # Problem forum page
│       ├── collab.html                     # Collab space page
│       ├── css/
│       │   ├── styles.css                  # Global styles
│       │   ├── resources.css               # Resources page styles
│       │   ├── problems.css                # Problems page styles
│       │   └── collab.css                  # Collab space styles
│       └── js/
│           ├── resources.js                # Resources page logic
│           ├── problems.js                 # Problems page logic
│           └── collab.js                   # Collab space WebSocket logic
└── pom.xml                                 # Maven dependencies
```

## 🔧 Setup Instructions

### Prerequisites
- **Java 17+** (Java 25 recommended)
- **Maven 3.6+** (or use included Maven Wrapper)

### Installation & Running

1. **Clone or navigate to the project directory**
   ```bash
   cd codecollab
   ```

2. **Build the project**
   ```bash
   ./mvnw clean install
   ```
   Or on Windows:
   ```bash
   mvnw.cmd clean install
   ```

3. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

4. **Access the application**
   - Open your browser and go to: **http://localhost:8080**
   - Landing Page: http://localhost:8080/index.html
   - Resources: http://localhost:8080/resources.html
   - Problem Forum: http://localhost:8080/problems.html
   - Collab Space: http://localhost:8080/collab.html

5. **Access H2 Database Console** (Optional)
   - URL: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:learningdb`
   - Username: `sa`
   - Password: *(leave blank)*

## 📡 API Endpoints

### REST APIs

#### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/category/{category}` - Get resources by category
- `POST /api/resources` - Create new resource

#### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/{id}` - Get problem by ID
- `POST /api/problems` - Create problem with file uploads

#### Files
- `GET /api/files/{fileName}` - Download file

#### Messages
- `GET /api/messages` - Get chat history

### WebSocket Endpoints

#### Chat
- **Connect**: `/ws` (SockJS endpoint)
- **Send message**: `/app/chat.sendMessage` → Broadcast to `/topic/public`
- **Add user**: `/app/chat.addUser` → Broadcast to `/topic/public`

#### Code Sync
- **Sync code**: `/app/code.sync` → Broadcast to `/topic/code`

## 🎯 Key Implementation Details

### 1. WebSocket Configuration (Real-Time Features)

The `WebSocketConfig` class enables STOMP over WebSocket:
- Message broker with `/topic` prefix for broadcasting
- Application destination prefix `/app` for incoming messages
- SockJS fallback for browsers without WebSocket support

### 2. File Upload Handling

The `FileStorageService`:
- Stores files in `./uploads` directory
- Generates unique filenames using UUID
- Supports multipart file uploads up to 10MB

### 3. Real-Time Code Synchronization

The code editor uses:
- Debouncing (500ms delay) to reduce network calls
- Sender identification to prevent overwriting own changes
- Language selection synchronization

### 4. Database Initialization

`ResourceService` automatically populates the database with sample resources on first startup.

## 🧪 Testing the Application

### Test File Upload
1. Go to Problem Forum
2. Click "Post a Problem"
3. Fill in title and description
4. Add a photo and/or file attachment
5. Submit and verify the problem appears with download links

### Test Real-Time Chat
1. Open Collab Space in two browser windows
2. Enter different usernames in each window
3. Send messages and verify they appear in both windows instantly

### Test Code Synchronization
1. Open Collab Space in two browser windows
2. Start typing code in one window
3. Verify the code appears in the other window after ~500ms

## 📝 Configuration

Edit `src/main/resources/application.properties` to customize:
- Database settings
- File upload size limits
- Upload directory location
- Server port

## 🔒 CORS Configuration

The application allows all origins in development. For production:
1. Edit `WebConfig.java`
2. Replace `allowedOrigins("*")` with specific domain(s)

## 🐛 Troubleshooting

### Application won't start
- Ensure Java 17+ is installed: `java -version`
- Check if port 8080 is available
- Review console logs for errors

### WebSocket connection fails
- Check browser console for errors
- Ensure SockJS and STOMP libraries are loaded
- Verify WebSocket endpoint: `http://localhost:8080/ws`

### File upload fails
- Check file size (max 10MB)
- Verify `./uploads` directory permissions
- Check console logs for storage errors

## 🎓 Learning Resources

This project demonstrates:
- RESTful API design with Spring Boot
- WebSocket real-time communication with STOMP
- File upload and storage handling
- Spring Data JPA with H2 database
- Frontend-backend integration
- Responsive web design with CSS Grid/Flexbox

## 📄 License

This project is created for educational purposes.

## 👥 Contributing

Feel free to fork, modify, and use this project for your learning!

---

**Built with ❤️ using Spring Boot & Vanilla JavaScript**

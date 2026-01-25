# Project Analysis: CodeCollab Learning Platform

This document provides a comprehensive analysis of the CodeCollab project, detailing the purpose and functionality of each file and component.

## 1. Project Overview

CodeCollab is a Spring Boot application designed as a collaborative coding platform. It features real-time code editing, chat functionality, an interactive compiler, a problem/Q&A forum, and a repository for learning resources. The backend is built using Java with Spring Boot and Spring Data MongoDB for persistence, while the frontend utilizes HTML, CSS, and JavaScript with WebSocket for real-time communication.

## 2. Backend Structure (Java)

The Java backend follows a typical Model-View-Controller (MVC) pattern, extended with WebSocket support for real-time features.

### 2.1. Main Application Entry Point

*   **`src/main/java/com/codecollab/source/CollaborateApplication.java`**
    *   The main class that bootstraps the Spring Boot application. It uses `@SpringBootApplication` to enable auto-configuration and component scanning.

### 2.2. Configuration

*   **`src/main/java/com/codecollab/source/config/WebConfig.java`**
    *   Configures Spring MVC, including Cross-Origin Resource Sharing (CORS) policies to allow requests from different origins and a resource handler to serve static files from the `uploads` directory under the `/uploads/**` URL path.
*   **`src/main/java/com/codecollab/source/config/WebSocketConfig.java`**
    *   Configures the WebSocket and STOMP messaging protocol. It sets up the `/ws` endpoint for WebSocket connections, defines message broker prefixes (`/topic`, `/user`) for broadcasting, and the application destination prefix (`/app`) for routing client messages to server-side handlers.

### 2.3. Controllers (`src/main/java/com/codecollab/source/controller/`)

These classes handle incoming HTTP requests and WebSocket messages, acting as the entry points for the application's functionality.

*   **`AuthController.java`**
    *   A REST controller that exposes `/api/auth/register` and `/api/auth/login` endpoints for user registration and authentication. It delegates the business logic to the `UserService`.
*   **`FileController.java`**
    *   A REST controller providing an endpoint (`/api/files/{fileName}`) to securely download files stored on the server, likely those uploaded via other features (e.g., problem attachments).
*   **`InteractiveCompilerController.java`**
    *   A WebSocket controller that handles real-time, interactive code compilation and execution. It uses `@MessageMapping` to receive code execution requests and user input for running processes, all tied to a specific WebSocket session. It communicates asynchronously with a `CompilerService`.
*   **`ProblemController.java`**
    *   A REST controller for the problem forum feature. It handles creating new problems (which can include file uploads) and retrieving existing ones. The core logic is delegated to `ProblemService`.
*   **`ResourceController.java`**
    *   A REST controller for managing learning resources. It provides endpoints to create resources and fetch them, with an option to filter by category.
*   **`RoomController.java`**
    *   A REST controller that manages the lifecycle of collaborative coding rooms, including creation, joining, leaving, and fetching room details. It uses DTOs to securely pass data to and from the client.

### 2.4. Data Transfer Objects (DTOs) (`src/main/java/com/codecollab/source/dto/`)

Simple Java objects used to transfer data between the client and server, often for request and response bodies.

*   **`AuthResponse.java`**
    *   Represents the response structure for user authentication attempts, indicating success or failure, a message, and user details (ID, username, display name).
*   **`ChatMessage.java`**
    *   Defines the structure for chat messages sent and received over WebSockets. It includes the sender, content, message type (CHAT, JOIN, LEAVE), and the room ID.
*   **`CodeSyncMessage.java`**
    *   Represents messages exchanged for real-time code synchronization in collaborative rooms. It includes sender, code, language, room ID, message type (UPDATE, TYPING, STOPPED_TYPING, CURSOR_ACTIVITY), and optional cursor/selection data.
*   **`CreateRoomRequest.java`**
    *   The request body for creating a new room, containing the room's name, password, and the creator's username.
*   **`ExecuteCodeRequest.java`**
    *   The request body for submitting code for execution, including the code string, language, and any standard input.
*   **`ExecuteCodeResponse.java`**
    *   The response structure for code execution, containing the output and a boolean indicating if an error occurred.
*   **`JoinRoomRequest.java`**
    *   The request body for joining an existing room, including the room ID, password, and the joining user's username.
*   **`LoginRequest.java`**
    *   The request body for user login, containing the username and password.
*   **`RegisterRequest.java`**
    *   The request body for user registration, containing the username, password, and an optional display name.
*   **`RoomResponse.java`**
    *   The response structure for room-related operations, providing details like success status, message, room ID, name, creator, active users, current code, and language.

### 2.5. Entities (`src/main/java/com/codecollab/source/entity/`)

These classes represent the data model that is mapped to MongoDB documents.

*   **`Message.java`**
    *   Represents a chat message document in MongoDB, storing its ID, sender, content, and timestamp (`sentAt`).
*   **`Problem.java`**
    *   Represents a problem post in the forum, storing its ID, title, description, paths to uploaded photo/file, original filename, and creation timestamp (`createdAt`).
*   **`Resource.java`**
    *   Represents a learning resource document, storing its ID, category, title, URL, and description.
*   **`Room.java`**
    *   Represents a collaborative coding room document. It includes a unique `roomId`, password, name, creator information, a list of `activeUsers`, the `currentCode` and `currentLanguage` in the editor, creation time, last activity time, and an `isActive` flag. Contains methods to add and remove users.
*   **`User.java`**
    *   Represents a user document, storing their ID, unique `username`, password, `displayName`, `createdAt`, `lastLogin` timestamp, and `currentRoomId` to track their active room.

### 2.6. Listener (`src/main/java/com/codecollab/source/listener/`)

*   **`WebSocketEventListener.java`**
    *   A Spring `@Component` that listens for WebSocket `SessionDisconnectEvent`s. When a user disconnects, it retrieves their username and broadcasts a `LEAVE` `ChatMessage` to the public topic, informing other connected users.

### 2.7. Repositories (`src/main/java/com/codecollab/source/repository/`)

These are interfaces that extend Spring Data MongoDB's `MongoRepository`, providing CRUD (Create, Read, Update, Delete) operations for the respective entity types, along with custom query methods.

*   **`MessageRepository.java`**
    *   Provides data access for `Message` entities, including a custom method to find all messages ordered by `sentAt` in ascending order.
*   **`ProblemRepository.java`**
    *   Provides data access for `Problem` entities, including a custom method to find all problems ordered by `createdAt` in descending order.
*   **`ResourceRepository.java`**
    *   Provides data access for `Resource` entities, including a method to find resources by `category`.
*   **`RoomRepository.java`**
    *   Provides data access for `Room` entities, with custom methods to find rooms by `roomId`, check for existence by `roomId`, find rooms by `creatorId`, and find active rooms.
*   **`UserRepository.java`**
    *   Provides data access for `User` entities, with custom methods to find a user by `username` and check for existence by `username`.

### 2.8. Services (`src/main/java/com/codecollab/source/service/`)

These classes encapsulate the business logic of the application, often interacting with repositories and other services.

*   **`CompilerService.java`**
    *   Handles the execution of user-submitted code interactively. It currently supports C++ (as per the code comments and `COMPILE_FEATURE_PLAN.md`), creating temporary files, compiling with `g++`, and executing the compiled output. It uses `ProcessManager` to manage the running processes and streams output back to the client.
*   **`FileStorageService.java`**
    *   Responsible for storing uploaded files (e.g., problem attachments) to the local filesystem in the `./uploads` directory. It generates unique filenames using UUIDs and normalizes original filenames for security.
*   **`MessageService.java`**
    *   Provides business logic for chat messages, such as retrieving all messages and saving new messages to the database via `MessageRepository`.
*   **`ProblemService.java`**
    *   Manages the creation and retrieval of problems. It orchestrates the storage of associated photo and file attachments using `FileStorageService` before saving the problem details to `ProblemRepository`.
*   **`ResourceService.java`**
    *   Manages learning resources. It includes a `@PostConstruct` method to initialize the database with sample resource data if it's empty. Provides methods to retrieve all resources, filter by category, and create new resources.
*   **`RoomService.java`**
    *   Manages the core logic for collaborative rooms. This includes generating unique `roomId`s, creating new rooms, validating join requests with passwords, adding/removing users from rooms, updating the `currentCode` and `currentLanguage` for a room, and fetching room details.
*   **`UserService.java`**
    *   Encapsulates the business logic for user authentication. It handles user registration (checking for existing usernames, basic input validation) and login (find users, password verification). It interacts with the `UserRepository`.
*   **`manager/ProcessManager.java`**
    *   A utility component used by `CompilerService` to manage active external processes (like compiled code executions). It stores and retrieves `Process` objects and their `OutputStream`s by session ID, allowing for interactive input and proper cleanup of running processes.

## 3. Frontend Structure (Static Files)

The frontend is composed of standard web technologies (HTML, CSS, JavaScript) served statically by the Spring Boot application.

### 3.1. HTML Pages (`src/main/resources/static/`)

These are the main entry points for different views of the application.

*   **`chat.html`**
    *   A dedicated HTML page for the team chat interface, featuring a message display area, an input form, and WebSocket integration for real-time communication. This page's content is heavily integrated into `collab.html`.
*   **`collab.html`**
    *   The central collaborative coding environment. It integrates a CodeMirror editor for shared code, a chat panel for team communication, and a terminal tab for interactive code execution output. It uses WebSocket for real-time code synchronization and compiler interaction.
*   **`create_room.html`**
    *   A form-based page allowing users to create a new collaborative room by providing a room name, password, and their username.
*   **`editor.html`**
    *   Another editor page, conceptually similar to a part of `collab.html` but potentially an earlier version or for a different use case, focusing solely on a shared code editor with an output panel.
*   **`index.html`**
    *   The landing page of the CodeCollab application, introducing its features (collaborative editor, code execution, chat), with calls to action to create or join a room.
*   **`join_room.html`**
    *   A form-based page where users can join an existing collaborative room by entering a room ID, password, and their username.
*   **`login.html`**
    *   Provides user interface for both logging into an existing account and registering a new account. It features a tabbed interface for switching between login and registration forms.
*   **`problems.html`**
    *   The problem forum interface. Users can post new problems (including title, description, and optional file/photo attachments) and view a feed of existing problems.
*   **`resources.html`**
    *   Displays a collection of learning resources, categorized by topic (OOP, DSA, Web Dev), with filtering options.

### 3.2. CSS Styles (`src/main/resources/static/css/`)

These stylesheets define the visual presentation and layout of the application.

*   **`collab.css`**
    *   Styles specific to the collaborative space (`collab.html`), including layout for the editor, chat, terminal panels, room info bar, and various interactive elements.
*   **`login.css`**
    *   Styles tailored for the login and registration forms (`login.html`), including layout, form elements, tab switcher, and user info display.
*   **`problems.css`**
    *   Styles for the problem forum (`problems.html`), including the problem posting form, problem cards in the feed, and action buttons.
*   **`resources.css`**
    *   Styles for the learning resources page (`resources.html`), including the category filter, resource cards, and loading indicators.
*   **`room_forms.css`**
    *   General styles for the room creation and joining forms (`create_room.html`, `join_room.html`), including modal overlays, form groups, and button styles.
*   **`styles.css`**
    *   Global stylesheet defining core design elements: color palette, typography (`Inter` and `Poppins` fonts), navigation bar, hero sections, feature cards, buttons, footer, and common utility classes. It also includes basic responsive design rules and scrollbar styling.

### 3.3. JavaScript Logic (`src/main/resources/static/js/`)

These scripts handle client-side interactivity, form submissions, and WebSocket communication.

*   **`collab.js`**
    *   The primary client-side script for the collaborative space. It manages WebSocket connections (SockJS, StompJS), synchronizes code changes in the CodeMirror editor across users, handles chat messages, and interacts with the interactive compiler (sending code, receiving output, handling terminal input). It includes debouncing for efficient code synchronization.
*   **`compiler.js`**
    *   Likely an older or alternative script for compiler interaction, as `collab.js` currently handles much of this functionality. It would typically manage sending code to a compiler service and displaying results.
*   **`create_room.js`**
    *   Handles the client-side logic for the room creation form. It captures user input, sends an API request to the backend's `RoomController` to create a room, and displays success/error messages, including the generated room ID and password.
*   **`join_room.js`**
    *   Manages the client-side logic for joining a room. It captures user input (room ID, password, username), sends an API request to the `RoomController` to join, and redirects the user to the collaborative space upon successful joining.
*   **`login.js`**
    *   Manages user authentication on the client side. It handles form submissions for both login and registration, communicates with the `AuthController` endpoints, stores user information (username, ID) in `sessionStorage`, and manages UI state (showing login/register forms, displaying user info).
*   **`problems.js`**
    *   Handles the client-side functionality for the problem forum. It manages the display and submission of the problem posting form, handles file uploads (`MultipartFile`), makes API calls to `ProblemController`, and dynamically renders the list of problems.
*   **`resources.js`**
    *   Manages the display and filtering of learning resources. It fetches resources from the `ResourceController` API, dynamically renders resource cards, and handles category filtering based on user interactions.

## 4. Project Configuration & Build

*   **`pom.xml`**
    *   The Maven Project Object Model file. It specifies project metadata, dependencies, and build configurations. Key dependencies include `spring-boot-starter-web` (for REST APIs), `spring-boot-starter-data-mongodb` (for MongoDB integration), `spring-boot-starter-websocket` (for real-time communication), and `lombok` (for reducing boilerplate code). It indicates the use of `spring-boot-starter-parent` version 4.0.1 and Java 17.
*   **`application.properties`**
    *   Spring Boot's main configuration file. It sets the application name, configures file upload settings (`max-file-size`, `max-request-size`), and defines the `file.upload-dir` to `./uploads`.
    *   *Note on Database Configuration*: Although `pom.xml` includes `spring-boot-starter-data-mongodb`, this file contains H2 Database configurations. This suggests an incomplete transition or a planned feature. However, based on `NEXT_STEPS.md` and `DELIVERABLES.md`, the project has migrated to MongoDB, making the H2 settings potentially vestigial.

## 5. Root Directory Documentation & Scripts

*   **`.gitattributes`**
    *   Configures Git attributes for various file types, primarily managing line endings (e.g., `text eol=lf` for `mvnw`, `text eol=crlf` for `*.cmd`).
*   **`.gitignore`**
    *   Specifies files and directories that Git should ignore, such as build outputs (`target/`, `build/`), IDE-specific files (`.idea/`, `.sts4-cache/`, `.vscode/`), and Maven wrapper files.
*   **`BANGLA_GUIDE.md`**
    *   A detailed, comprehensive guide to the CodeCollab project written in Bengali. It explains the project's purpose, key features, folder structure, core Java components (main application, WebSocket config, user/room entities), controllers, services, frontend structure, and a step-by-step explanation of how the web application works, including startup, login, page loading, and WebSocket collaboration. It also includes instructions on how to run the project.
*   **`COMPILE_FEATURE_PLAN.md`**
    *   Outlines a plan for implementing a compile-and-run feature within the collaborative space. It details frontend UI modifications, backend implementation using Java's `ProcessBuilder` for code execution, and broadcasting results via WebSockets.
*   **`DELIVERABLES.md`**
    *   Summarizes the successfully implemented project deliverables, including `pom.xml` dependencies, Java Entity models (`Problem`, `Message`, `Resource`), WebSocket Configuration, Controller logic for file uploads and resources, and HTML/JS code for the Collab Page's WebSocket logic. It explicitly mentions the migration from JPA/H2 to MongoDB.
*   **`mvnw`**, **`mvnw.cmd`**
    *   Maven wrapper scripts. These allow users to execute Maven commands (like `mvnw spring-boot:run`) without needing to install Maven globally on their system. `mvnw` is for Unix-like systems, and `mvnw.cmd` is for Windows.
*   **`NEXT_STEPS.md`**
    *   A crucial document outlining future development plans and recommended priorities. It covers implementing the compile-and-run feature (marked as high priority), enhancing MongoDB integration, user authentication & authorization, room/session management, code execution history, code execution history, UI/UX improvements, testing, deployment, documentation, and performance optimization. It highlights the completion of the MongoDB migration.
*   **`README.md`**
    *   The standard project README file (content not provided, but typically contains a project overview, setup instructions, and basic usage).
*   **`terminal.png`**, **`terminal_2.png`**, **`terminal_3.png`**
    *   Image files, likely screenshots used for documentation, marketing, or as visual assets within the application's static content.

## 6. Key Takeaways

*   **Technology Stack:** Spring Boot (Java 17), Spring Data MongoDB, WebSockets (STOMP, SockJS), HTML, CSS, JavaScript (CodeMirror).
*   **Core Functionality:** User authentication, collaborative code editing, real-time chat, interactive code compilation/execution (C++ currently), problem forum with file uploads, learning resource management.
*   **Real-time Capabilities:** Extensive use of WebSockets for code synchronization, chat, and compiler output.
*   **Architecture:** Classic MVC pattern for REST APIs, augmented with WebSocket messaging.
*   **Development Stage:** The project is actively being developed with clear next steps for features like a more robust compiler, enhanced authentication, and room management. The migration from H2 to MongoDB is a significant recent change.
*   **Documentation:** The project includes detailed documentation, notably the `BANGLA_GUIDE.md` and `NEXT_STEPS.md`, indicating a well-thought-out development process.

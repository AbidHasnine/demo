# 🎮 কোডকোল্যাব (CodeCollab) - বাংলায় সম্পূর্ণ গাইড

## 🌟 এই ওয়েবসাইটটা কী?

এটা একটা **কোড শেখার এবং একসাথে কোড করার** ওয়েবসাইট!

কল্পনা করো তুমি আর তোমার বন্ধুরা একসাথে একটা হোয়াইটবোর্ডে আঁকছো - এই ওয়েবসাইটে তোমরা একসাথে কোড লিখতে পারবে! 🎨

### ✨ প্রধান বৈশিষ্ট্য (Key Features)

*   **রিয়েল-টাইম কোড এডিটর**: একাধিক ব্যবহারকারী একসাথে একটি ফাইলে কোড লিখতে পারে।
*   **টিম চ্যাট**: কোলাবোরেশন রুমে একে অপরের সাথে চ্যাট করার সুবিধা।
*   **অনলাইন কোড কম্পাইলার**: Java, Python, C++, C, এবং JavaScript কোড সরাসরি ব্রাউজার থেকে চালানো যায়।
*   **প্রাইভেট রুম**: পাসওয়ার্ড-সুরক্ষিত রুম তৈরি করে নির্দিষ্ট মানুষদের সাথে কাজ করার সুবিধা।
*   **প্রবলেম ফোরাম**: প্রোগ্রামিং সম্পর্কিত প্রশ্ন পোস্ট করা এবং অন্যদের সাহায্য করার একটি কমিউনিটি ফোরাম।
*   **লার্নিং রিসোর্স**: OOP, DSA, এবং Web Development-এর উপর বিভিন্ন শিক্ষামূলক রিসোর্স।

---

## 📁 ফোল্ডার স্ট্রাকচার (ফাইলগুলো কোথায় আছে)

```
codecollab/
├── src/
│   ├── main/
│   │   ├── java/com/codecollab/source/  ← জাভা কোড (ব্যাকএন্ড - সার্ভারের ব্রেইন 🧠)
│   │   │   ├── config/                  # অ্যাপ্লিকেশন কনফিগারেশন
│   │   │   ├── controller/              # API এন্ডপয়েন্ট (ট্রাফিক পুলিশ)
│   │   │   ├── dto/                     # ডেটা ট্রান্সফার অবজেক্ট
│   │   │   ├── entity/                  # ডাটাবেস মডেল (ডেটার গঠন)
│   │   │   ├── repository/              # ডাটাবেস অপারেশন
│   │   │   └── service/                 # মূল ব্যবসায়িক যুক্তি (Business Logic)
│   │   └── resources/
│   │       ├── static/                  ← HTML, CSS, JS (ফ্রন্টএন্ড - যা তুমি দেখো 👀)
│   │       └── application.properties   # অ্যাপ্লিকেশন সেটিংস
└── pom.xml                             ← প্রজেক্টের রেসিপি বই 📖
```

---

## 🚀 প্রথম ধাপ: মেইন অ্যাপ্লিকেশন ফাইল

### `CollaborateApplication.java` - অ্যাপের হার্ট ❤️

```java
// এই লাইনটা বলছে এই ফাইলটা কোন ফোল্ডারে আছে
// যেমন তোমার বইটা কোন শেলফে আছে সেটা বলা
package com.codecollab.source;

// এটা একটা টুল নিয়ে আসছে যেটা দিয়ে অ্যাপ চালু হবে
// যেমন গাড়ি চালাতে চাবি লাগে, এটা সেই চাবি!
import org.springframework.boot.SpringApplication;

// এটা আরেকটা টুল - বলছে "এটা একটা স্প্রিং বুট অ্যাপ"
// যেমন একটা বইয়ে লেখা থাকে "এটা গল্পের বই"
import org.springframework.boot.autoconfigure.SpringBootApplication;

// এই ট্যাগটা জাভাকে বলছে "এটাই মেইন অ্যাপ, এখান থেকে শুরু করো!"
// যেমন একটা রেসে START লেখা থাকে
@SpringBootApplication
public class CollaborateApplication {

    // main মানে "শুরুর জায়গা"
    // কম্পিউটার এখান থেকে কোড পড়া শুরু করে
    // যেমন বই পড়া প্রথম পাতা থেকে শুরু হয়
    public static void main(String[] args) {
        // এই লাইনটা অ্যাপটাকে RUN করে - চালু করে!
        // যেমন তুমি TV-র ON বাটন চাপো
        SpringApplication.run(CollaborateApplication.class, args);
    }
}
```

---

## 🔌 WebSocket কনফিগারেশন - রিয়েল-টাইম চ্যাটের জাদু!

### `WebSocketConfig.java` - সবাইকে কানেক্ট করার সেটিংস

```java
// ফাইলের ঠিকানা বলছে
package com.codecollab.source.config;

// নিচের লাইনগুলো বিভিন্ন টুল নিয়ে আসছে
// যেমন রান্না করতে চামচ, কড়াই লাগে
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// @Configuration মানে "এটা একটা সেটিংস ফাইল"
// যেমন তোমার ফোনে Settings অ্যাপ থাকে
@Configuration

// এই ট্যাগটা বলছে "WebSocket চালু করো!"
// WebSocket = ফোন কলের মতো, সবসময় কানেক্টেড থাকে
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // এই ফাংশনটা মেসেজ পাঠানোর রাস্তা বানায়
    // যেমন ডাকঘরে চিঠি যায় নির্দিষ্ট রাস্তা দিয়ে
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic" হলো যেখানে সবাই মেসেজ পায়
        // যেমন ক্লাসে টিচার কথা বললে সবাই শোনে
        config.enableSimpleBroker("/topic");
        
        // "/app" দিয়ে মেসেজ পাঠাতে হবে
        // যেমন চিঠিতে "প্রেরক" লেখা থাকে
        config.setApplicationDestinationPrefixes("/app");
    }

    // এই ফাংশনটা বলছে কোথায় কানেক্ট করতে হবে
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // "/ws" হলো দরজা যেখান দিয়ে সবাই ঢোকে
        // যেমন স্কুলের মেইন গেট
        registry.addEndpoint("/ws")
                // সব জায়গা থেকে আসতে পারবে
                .setAllowedOriginPatterns("*")
                // পুরনো ব্রাউজারেও কাজ করবে
                .withSockJS();
    }
}
```

---

## 👤 ইউজার (User) - যারা ওয়েবসাইট ব্যবহার করবে

### `User.java` - ইউজারের তথ্য রাখার বাক্স

```java
package com.codecollab.source.entity;

// বিভিন্ন টুল নিয়ে আসছি
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

// @Document মানে এটা ডাটাবেসে সেভ হবে
// ডাটাবেস = একটা বড় খাতা যেখানে সব তথ্য লেখা থাকে
@Document(collection = "users")

// @Data টুলটা অটোমেটিক কিছু কোড লিখে দেয়
// যেমন ক্যালকুলেটর অটো হিসাব করে
@Data
@NoArgsConstructor  // খালি ইউজার বানাতে পারবে
@AllArgsConstructor // সব তথ্য দিয়ে ইউজার বানাতে পারবে
public class User {
    
    // @Id মানে এটা ইউজারের ইউনিক নম্বর
    // যেমন তোমার রোল নম্বর - শুধু তোমারই!
    @Id
    private String id;
    
    // @Indexed(unique = true) মানে দুইজনের username এক হতে পারবে না
    // যেমন দুইজনের ফোন নম্বর এক হয় না
    @Indexed(unique = true)
    private String username;    // ইউজারের নাম (যেমন: "sakib123")
    
    private String password;    // পাসওয়ার্ড - গোপন চাবি 🔑
    
    private String displayName; // দেখানোর নাম (যেমন: "সাকিব")
    
    private LocalDateTime createdAt;  // কবে অ্যাকাউন্ট খুলেছে
    
    private LocalDateTime lastLogin;  // শেষ কবে লগইন করেছে
    
    private String currentRoomId;     // এখন কোন রুমে আছে
    
    // নতুন ইউজার বানানোর নিয়ম
    // যেমন নতুন ছাত্র ভর্তি করার ফর্ম
    public User(String username, String password, String displayName) {
        this.username = username;
        this.password = password;
        this.displayName = displayName;
        this.createdAt = LocalDateTime.now(); // এখনকার সময় সেভ করো
    }
}
```

---

## 🏠 রুম (Room) - যেখানে সবাই একসাথে কোড করে

### `Room.java` - কোলাব রুমের তথ্য

```java
package com.codecollab.source.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// এটা ডাটাবেসের "rooms" নামের খাতায় যাবে
@Document(collection = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    
    @Id
    private String id;          // ডাটাবেসের ID
    
    @Indexed(unique = true)
    private String roomId;      // রুমের কোড (যেমন: "ABC123")
                                // এটা বন্ধুদের দিলে তারা জয়েন করতে পারবে!
    
    private String password;    // রুমের পাসওয়ার্ড - যাতে অচেনা কেউ না ঢোকে
    
    private String name;        // রুমের নাম (যেমন: "আমাদের স্টাডি গ্রুপ")
    
    private String creatorId;   // যে রুম বানিয়েছে তার ID
    
    private String creatorUsername; // যে রুম বানিয়েছে তার নাম
    
    // activeUsers = এখন কারা কারা রুমে আছে
    // ArrayList হলো একটা লিস্ট - যেমন হাজিরা খাতা
    private List<String> activeUsers = new ArrayList<>();
    
    private String currentCode = "";        // এখন এডিটরে কী কোড আছে
    
    private String currentLanguage = "javascript"; // কোন ভাষায় কোড হচ্ছে
    
    private LocalDateTime createdAt;    // কবে রুম বানানো হয়েছে
    
    private LocalDateTime lastActivity; // শেষ কবে কেউ কিছু করেছে
    
    private boolean isActive = true;    // রুম এখনো চালু আছে কিনা
    
    // নতুন রুম বানানোর নিয়ম
    public Room(String roomId, String password, String name, String creatorId, String creatorUsername) {
        this.roomId = roomId;
        this.password = password;
        this.name = name;
        this.creatorId = creatorId;
        this.creatorUsername = creatorUsername;
        this.createdAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
        this.activeUsers = new ArrayList<>();
    }
    
    // রুমে নতুন মানুষ যোগ করার নিয়ম
    public void addUser(String username) {
        // আগে থেকে না থাকলেই যোগ করো
        // যেমন হাজিরায় নাম না থাকলে লেখো
        if (!activeUsers.contains(username)) {
            activeUsers.add(username);
        }
        this.lastActivity = LocalDateTime.now();
    }
    
    // রুম থেকে কাউকে বের করার নিয়ম
    public void removeUser(String username) {
        activeUsers.remove(username); // নাম মুছে দাও
        this.lastActivity = LocalDateTime.now();
    }
}
```

---

## 🚦 কন্ট্রোলার (Controllers) - API এন্ডপয়েন্ট

কন্ট্রোলারগুলো হলো ট্রাফিক পুলিশের মতো, যারা ঠিক করে কোন অনুরোধে কী কাজ হবে।

### `AuthController.java` - লগইন আর রেজিস্টার হ্যান্ডল করে

```java
package com.codecollab.source.controller;

// বিভিন্ন টুল নিয়ে আসছি
import com.codecollab.source.dto.AuthResponse;
import com.codecollab.source.dto.LoginRequest;
import com.codecollab.source.dto.RegisterRequest;
import com.codecollab.source.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// @RestController মানে এটা API বানায়
// API = দুইটা সফটওয়্যারের মধ্যে কথা বলার রাস্তা
// যেমন তুমি ওয়েটারকে অর্ডার দাও, ওয়েটার কিচেনে যায়
@RestController

// @RequestMapping বলছে এই কন্ট্রোলারের ঠিকানা কী
// "/api/auth" মানে লগইন সংক্রান্ত সব এখানে আসবে
@RequestMapping("/api/auth")

// এটা অটোমেটিক UserService নিয়ে আসে
@RequiredArgsConstructor
public class AuthController {
    
    // UserService = যে আসল কাজ করে (ডাটাবেস চেক করা)
    private final UserService userService;
    
    // @PostMapping মানে যখন কেউ ডাটা পাঠায়
    // "/register" = নতুন অ্যাকাউন্ট খোলা
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // userService কে বলছে "এই মানুষটাকে রেজিস্টার করো"
        AuthResponse response = userService.register(request);
        
        // সফল হলে "OK" বলো, না হলে "Bad Request" বলো
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    
    // "/login" = আগের অ্যাকাউন্টে ঢোকা
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // userService কে বলছে "চেক করো এই মানুষ সত্যিকারের কিনা"
        AuthResponse response = userService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}
```

### `RoomController.java` - রুম বানানো আর জয়েন করা

```java
package com.codecollab.source.controller;

import com.codecollab.source.dto.CreateRoomRequest;
import com.codecollab.source.dto.JoinRoomRequest;
import com.codecollab.source.dto.RoomResponse;
import com.codecollab.source.entity.Room;
import com.codecollab.source.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")  // রুম সংক্রান্ত সব কাজের ঠিকানা
@RequiredArgsConstructor
public class RoomController {
    
    private final RoomService roomService; // রুমের আসল কাজ করে
    
    // নতুন রুম বানানো - যেমন নতুন হোয়াটসঅ্যাপ গ্রুপ খোলা
    @PostMapping("/create")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody CreateRoomRequest request) {
        // roomService কে বলছে "একটা নতুন রুম বানাও"
        RoomResponse response = roomService.createRoom(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);  // সফল!
        }
        return ResponseEntity.badRequest().body(response);  // সমস্যা হয়েছে
    }
    
    // রুমে জয়েন করা - যেমন গ্রুপে যোগ দেওয়া
    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(@RequestBody JoinRoomRequest request) {
        RoomResponse response = roomService.joinRoom(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    
    // রুম থেকে বের হওয়া - যেমন গ্রুপ ছেড়ে দেওয়া
    @PostMapping("/leave")
    public ResponseEntity<RoomResponse> leaveRoom(
            @RequestParam String roomId,      // কোন রুম?
            @RequestParam String username) {  // কে বের হচ্ছে?
        RoomResponse response = roomService.leaveRoom(roomId, username);
        return ResponseEntity.ok(response);
    }
    
    // রুমের তথ্য দেখা
    // @GetMapping মানে শুধু তথ্য চাইছে, কিছু পাঠাচ্ছে না
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String roomId) {
        // রুম খুঁজছে ডাটাবেসে
        Optional<Room> roomOpt = roomService.getRoomById(roomId);
        
        // রুম না পেলে "Not Found" বলো
        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Room room = roomOpt.get();
        // রুমের তথ্য দিয়ে response বানাও
        RoomResponse response = new RoomResponse(
            true,
            "Room found",
            room.getRoomId(),
            null,  // পাসওয়ার্ড গোপন রাখো!
            room.getName(),
            room.getCreatorUsername(),
            room.getActiveUsers(),
            room.getCurrentCode(),
            room.getCurrentLanguage()
        );
        
        return ResponseEntity.ok(response);
    }
}
```

### `ChatController.java` - রিয়েল-টাইম চ্যাট

```java
package com.codecollab.source.controller;

import com.codecollab.source.dto.ChatMessage;
import com.codecollab.source.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller  // এটা একটা কন্ট্রোলার - ট্রাফিক পুলিশের মতো
@RequiredArgsConstructor
public class ChatController {
    
    private final MessageService messageService;       // মেসেজ সেভ করে
    private final SimpMessagingTemplate messagingTemplate; // মেসেজ পাঠায়
    
    // যখন কেউ মেসেজ পাঠায়
    // @MessageMapping = WebSocket এর রাস্তা
    @MessageMapping("/chat.sendMessage/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,  // কোন রুমে?
            @Payload ChatMessage chatMessage) {  // কী মেসেজ?
        
        chatMessage.setRoomId(roomId);
        
        // যদি আসল চ্যাট মেসেজ হয়, সেভ করো
        if (chatMessage.getType() == ChatMessage.MessageType.CHAT) {
            messageService.saveMessage(chatMessage.getSender(), chatMessage.getContent());
        }
        
        // সবাইকে মেসেজ পাঠাও - যেমন গ্রুপে মেসেজ দিলে সবাই দেখে
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }
    
    // যখন কেউ রুমে ঢোকে
    @MessageMapping("/chat.addUser/{roomId}")
    public void addUser(
            @DestinationVariable String roomId,
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {  // কানেকশনের তথ্য
        
        // মনে রাখো কে কোন রুমে
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        chatMessage.setRoomId(roomId);
        
        // সবাইকে জানাও "অমুক এসেছে!"
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }
    
    // যখন কেউ রুম থেকে বের হয়
    @MessageMapping("/chat.leaveRoom/{roomId}")
    public void leaveRoom(
            @DestinationVariable String roomId,
            @Payload ChatMessage chatMessage) {
        
        chatMessage.setType(ChatMessage.MessageType.LEAVE);
        chatMessage.setRoomId(roomId);
        
        // সবাইকে জানাও "অমুক চলে গেছে!"
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }
}
```

### `CodeSyncController.java` - একসাথে কোড লেখা

```java
package com.codecollab.source.controller;

import com.codecollab.source.dto.CodeSyncMessage;
import com.codecollab.source.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class CodeSyncController {
    
    private final SimpMessagingTemplate messagingTemplate; // মেসেজ পাঠানোর টুল
    private final RoomService roomService;  // রুমের কাজ করে
    
    // যখন কেউ কোড লেখে বা এডিট করে
    // এটা সেই কোড সবার স্ক্রিনে পাঠিয়ে দেয়!
    @MessageMapping("/code.sync/{roomId}")
    public void syncCode(
            @DestinationVariable String roomId,     // কোন রুমে?
            @Payload CodeSyncMessage codeSyncMessage) { // কী কোড?
        
        codeSyncMessage.setRoomId(roomId);
        
        // কোড সেভ করো যাতে নতুন কেউ এলে দেখতে পায়
        // যেমন হোয়াইটবোর্ডে লেখা থাকে
        roomService.updateRoomCode(
            roomId, 
            codeSyncMessage.getCode(), 
            codeSyncMessage.getLanguage()
        );
        
        // রুমের সবাইকে নতুন কোড পাঠাও
        // যেমন Google Docs এ লিখলে সবাই দেখে
        messagingTemplate.convertAndSend(
            "/topic/room/" + roomId + "/code", 
            codeSyncMessage
        );
    }
}
```

### অন্যান্য কন্ট্রোলার

*   **`CompilerController.java`**: কোড এক্সিকিউট করার জন্য API প্রদান করে।
*   **`ProblemController.java`**: প্রবলেম ফোরামের জন্য প্রশ্ন তৈরি এবং দেখার API প্রদান করে।
*   **`ResourceController.java`**: লার্নিং রিসোর্স তৈরি এবং দেখার API প্রদান করে।
*   **`FileController.java`**: আপলোড করা ফাইল ডাউনলোড করার সুবিধা দেয়।

---

## 🛠️ সার্ভিস (Services) - মূল লজিক

সার্ভিস লেয়ারে অ্যাপ্লিকেশনটির আসল কাজগুলো করা হয়।

*   **`UserService.java`**: নতুন ব্যবহারকারী তৈরি, লগইন ভেরিফিকেশন ইত্যাদি কাজ করে।
*   **`RoomService.java`**: রুম তৈরি, পাসওয়ার্ড চেক করে রুমে জয়েন করানো, এবং রুমে থাকা ব্যবহারকারীদের পরিচালনা করে।
*   **`CompilerService.java`**: কোড এক্সিকিউট করার জন্য Piston API (একটি অনলাইন কোড এক্সিকিউশন ইঞ্জিন) ব্যবহার করে।
*   **`MessageService.java`**: চ্যাট মেসেজ ডাটাবেসে সেভ করে।
*   **`ProblemService.java`**: নতুন প্রশ্ন তৈরি এবং ডাটাবেস থেকে প্রশ্ন খুঁজে বের করে।
*   **`ResourceService.java`**: শিক্ষামূলক রিসোর্স পরিচালনা করে এবং শুরুতে কিছু স্যাম্পল ডাটা দিয়ে ডাটাবেস পূর্ণ করে।
*   **`FileStorageService.java`**: ব্যবহারকারীর আপলোড করা ফাইল সার্ভারে সেভ করে।

---

# 🎨 ফ্রন্টএন্ড (যা তুমি ব্রাউজারে দেখো)

## 🏠 হোম পেজ - index.html

```html
<!DOCTYPE html>
<!-- এটা বলছে এটা HTML5 ডকুমেন্ট -->
<!-- HTML = ওয়েবপেজ বানানোর ভাষা -->

<html lang="en">
<!-- html ট্যাগ = পুরো পেজ এর শুরু -->
<!-- lang="en" মানে ইংরেজি ভাষা -->

<head>
    <!-- head = পেজের তথ্য, এটা ব্রাউজারে দেখা যায় না -->
    
    <meta charset="UTF-8">
    <!-- charset = কোন ভাষার অক্ষর ব্যবহার হবে -->
    <!-- UTF-8 দিলে বাংলাও লেখা যায়! -->
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- viewport = মোবাইলে ঠিকমতো দেখাবে -->
    
    <title>CodeCollab - Collaborative Learning Platform</title>
    <!-- title = ব্রাউজারের ট্যাবে যে নাম দেখা যায় -->
    
    <link rel="stylesheet" href="css/styles.css">
    <!-- link = CSS ফাইল নিয়ে আসো -->
    <!-- CSS = পেজ সুন্দর করার কোড -->
</head>

<body>
    <!-- body = পেজে যা দেখা যায় সব এখানে -->
    
    <!-- Navigation Bar - উপরের মেনু -->
    <nav class="navbar">
        <!-- nav = নেভিগেশন/মেনু -->
        <!-- class = CSS এ স্টাইল করার জন্য নাম -->
        
        <div class="nav-container">
            <!-- div = একটা বাক্স/কন্টেইনার -->
            
            <div class="nav-logo">
                <h2>💻 CodeCollab</h2>
                <!-- h2 = বড় হেডিং (শিরোনাম) -->
            </div>
            
            <ul class="nav-menu">
                <!-- ul = আনঅর্ডার্ড লিস্ট (বুলেট পয়েন্ট) -->
                
                <li><a href="index.html" class="active">Home</a></li>
                <!-- li = লিস্টের একটা আইটেম -->
                <!-- a = লিংক, ক্লিক করলে অন্য পেজে যায় -->
                <!-- href = কোথায় যাবে -->
                
                <li><a href="resources.html">Resources</a></li>
                <li><a href="problems.html">Problem Forum</a></li>
                <li><a href="collab.html">Collab Space</a></li>
                <li><a href="login.html">Login</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section - প্রথম বড় অংশ -->
    <section class="hero">
        <!-- section = পেজের একটা অংশ -->
        
        <div class="hero-content">
            <h1 class="hero-title">Learn, Code & Collaborate Together</h1>
            <!-- h1 = সবচেয়ে বড় শিরোনাম -->
            
            <p class="hero-subtitle">Your Ultimate Platform</p>
            <!-- p = প্যারাগ্রাফ/সাধারণ টেক্সট -->
            
            <div class="hero-buttons">
                <a href="collab.html" class="btn btn-primary">🚀 Start Collaborating</a>
                <!-- btn = বাটন স্টাইল -->
            </div>
        </div>
    </section>

    <!-- Footer - নিচের অংশ -->
    <footer class="footer">
        <p>© 2024 CodeCollab. Built with ❤️</p>
    </footer>
</body>
</html>
```

---

## 🤝 collab.js - রিয়েল-টাইম কোলাবরেশনের জাদু! (মূল অংশ)

```javascript
// Collab Space JavaScript with WebSocket Integration
// এটাই সবচেয়ে মজার অংশ - রিয়েল-টাইম কোড শেয়ারিং!

// সার্ভারের ঠিকানা যেখানে WebSocket কানেক্ট হবে
const WS_URL = 'http://localhost:8080/ws';

// গ্লোবাল ভেরিয়েবল - পুরো ফাইলে ব্যবহার হবে
let stompClient = null;   // WebSocket কানেকশন
let username = null;      // ইউজারের নাম
let roomId = null;        // রুমের ID
let isTyping = false;     // এখন টাইপ করছে কিনা

// পেজ লোড হলে এগুলো সেটআপ করো
document.addEventListener('DOMContentLoaded', function() {
    // DOMContentLoaded = পেজ পুরো লোড হলে এই কোড চলবে
    
    // ফর্ম সাবমিশন সেটআপ
    document.getElementById('create-room-form').addEventListener('submit', handleCreateRoom);
    document.getElementById('join-room-form').addEventListener('submit', handleJoinRoom);
    document.getElementById('message-form').addEventListener('submit', sendMessage);
    
    // কোড এডিটরে টাইপ করলে
    document.getElementById('code-editor').addEventListener('input', handleCodeInput);
});

// ⭐ WebSocket কানেকশন - এটাই রিয়েল-টাইমের চাবি!
function connect() {
    // SockJS দিয়ে কানেকশন বানাও
    const socket = new SockJS(WS_URL);
    
    // STOMP প্রোটোকল ব্যবহার করো
    stompClient = Stomp.over(socket);
    
    // কানেক্ট করো!
    stompClient.connect({}, onConnected, onError);
}

// কানেক্ট হলে এটা চলে
function onConnected() {
    console.log('Connected to WebSocket');
    
    // ⭐ সাবস্ক্রাইব করো - মানে এই টপিকের মেসেজ পাবে
    
    // চ্যাট মেসেজের জন্য সাবস্ক্রাইব
    stompClient.subscribe('/topic/room/' + roomId + '/chat', onMessageReceived);
    // এখন এই রুমে কেউ মেসেজ দিলে onMessageReceived ফাংশন চলবে
    
    // কোড আপডেটের জন্য সাবস্ক্রাইব
    stompClient.subscribe('/topic/room/' + roomId + '/code', onCodeReceived);
    // এখন এই রুমে কেউ কোড লিখলে onCodeReceived ফাংশন চলবে
    
    // সবাইকে জানাও "আমি এসেছি!"
    stompClient.send('/app/chat.addUser/' + roomId, {}, JSON.stringify({
        sender: username,
        type: 'JOIN',
        roomId: roomId
    }));
}

// ⭐ কোড আপডেট পেলে - এটাই কোলাবরেশনের মূল জাদু!
function onCodeReceived(payload) {
    const message = JSON.parse(payload.body);
    const editorEl = document.getElementById('code-editor');

    // নিজের কোড নিজে পেলে ইগনোর করো
    if (message.sender === username) {
        return;
    }
    
    // অন্য কেউ টাইপ করলে তার স্ট্যাটাস দেখাও
    if (message.type === 'TYPING') {
        document.getElementById('editor-user').textContent = `${message.sender} is typing...`;
    } else if (message.type === 'UPDATE') {
        // কোড আপডেট করো
        if (!isTyping) {
            editorEl.value = message.code;
            document.getElementById('language-select').value = message.language;
        }
        document.getElementById('editor-user').textContent = `Last edited by: ${message.sender}`;
    }
}

// ⭐ কোড আপডেট পাঠানো
function sendCodeSyncMessage(payload) {
    if (stompClient && stompClient.connected && roomId) {
        const message = {
            sender: username,
            roomId: roomId,
            ...payload
        };
        stompClient.send(`/app/code.sync/${roomId}`, {}, JSON.stringify(message));
    }
}

// কোড এডিটরে টাইপ করলে - Debouncing!
let typingTimeout = null;
function handleCodeInput() {
    isTyping = true;
    
    // টাইপিং স্ট্যাটাস পাঠাও
    if (!typingTimeout) {
        sendCodeSyncMessage({ type: 'TYPING' });
    }

    clearTimeout(typingTimeout);
    
    // ৫০০ মিলিসেকেন্ড পরে কোড পাঠাও
    // এতে প্রতিটা কী-প্রেসে পাঠাবে না, থামলে পাঠাবে
    typingTimeout = setTimeout(() => {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        sendCodeSyncMessage({
            type: 'UPDATE',
            code: code,
            language: language
        });
        isTyping = false;
        typingTimeout = null;
    }, 500);
}

// চ্যাট মেসেজ পাঠানো
function sendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const messageContent = messageInput.value.trim();
    
    if (messageContent && stompClient && stompClient.connected) {
        const chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT',
            roomId: roomId
        };
        
        stompClient.send('/app/chat.sendMessage/' + roomId, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}
```

---

# 🚀 কীভাবে এই প্রজেক্ট চালাবে?

## ধাপ ১: যা যা লাগবে

1.  **Java JDK 17+** - জাভা ইনস্টল করো
2.  **MongoDB** - ডাটাবেস

## ধাপ ২: প্রজেক্ট চালাও

```bash
# Windows এ:
./mvnw.cmd spring-boot:run

# Mac/Linux এ:
./mvnw spring-boot:run
```

## ধাপ ৩: ব্রাউজারে দেখো

ব্রাউজার খুলে যাও: **http://localhost:8080**

🎉 ব্যস! তোমার CodeCollab চালু!

---

# 🔑 মূল ধারণাগুলো

1.  **REST API** 📡 - ফ্রন্টএন্ড আর ব্যাকএন্ড এভাবে কথা বলে
2.  **WebSocket** 🔌 - রিয়েল-টাইম কমিউনিকেশন
3.  **MongoDB** 🗄️ - ডাটাবেস
4.  **Debouncing** ⏱️ - থামলে পাঠানো

---

> "কোডিং শেখা মানে নতুন একটা ভাষা শেখা - ধৈর্য রাখো, প্র্যাকটিস করো, মজা নাও!" 🚀

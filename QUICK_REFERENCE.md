# CodeCollab - Quick Reference Guide

## Files Modified/Created

### Backend

#### New Files
- `src/main/java/com/codecollab/source/entity/Solution.java` - Solution entity
- `src/main/java/com/codecollab/source/dto/CreateSolutionRequest.java` - DTO for creating solutions
- `src/main/java/com/codecollab/source/dto/SolutionResponse.java` - DTO for solution responses
- `src/main/java/com/codecollab/source/repository/SolutionRepository.java` - MongoDB repository
- `src/main/java/com/codecollab/source/service/SolutionService.java` - Service layer
- `src/main/java/com/codecollab/source/controller/SolutionController.java` - REST controller

#### Modified Files
- `src/main/java/com/codecollab/source/entity/Problem.java` - Added username, userId, solutionIds
- `src/main/java/com/codecollab/source/service/ProblemService.java` - Updated createProblem() signature
- `src/main/java/com/codecollab/source/controller/ProblemController.java` - Added auth checks on POST
- `src/main/java/com/codecollab/source/controller/ResourceController.java` - Added auth checks on GET
- `src/main/java/com/codecollab/source/controller/RoomController.java` - Added auth checks on POST

### Frontend

#### Modified Files
- `src/main/resources/static/js/problems.js` - Added solution functionality & auth checks
- `src/main/resources/static/js/resources.js` - Added auth checks
- `src/main/resources/static/js/create_room.js` - Added auth checks
- `src/main/resources/static/js/join_room.js` - Added auth checks
- `src/main/resources/static/resources.html` - Updated filter container class

---

## API Endpoints Reference

### Problems
- `GET /api/problems` - Get all problems (no auth)
- `GET /api/problems/{id}` - Get specific problem (no auth)
- `POST /api/problems` - Create problem (**requires username, userId**)

### Solutions (NEW)
- `POST /api/solutions` - Create solution (**requires userId, username**)
- `GET /api/solutions/problem/{problemId}` - Get solutions for problem
- `GET /api/solutions/{solutionId}` - Get specific solution
- `GET /api/solutions/user/{username}` - Get user's solutions
- `PUT /api/solutions/{solutionId}` - Update solution (author only)
- `POST /api/solutions/{solutionId}/accept` - Mark as accepted
- `DELETE /api/solutions/{solutionId}` - Delete solution (author only)

### Resources
- `GET /api/resources` - Get all resources (**requires userId**)
- `GET /api/resources/category/{category}` - Get resources by category (**requires userId**)
- `POST /api/resources` - Create resource

### Rooms
- `POST /api/rooms/create` - Create room (**requires username, creatorId**)
- `POST /api/rooms/join` - Join room (**requires username**)
- `POST /api/rooms/leave` - Leave room
- `GET /api/rooms/{roomId}` - Get room details (no auth)
- `GET /api/rooms/{roomId}/users-count` - Get room user count (no auth)

---

## localStorage Structure

```javascript
// User object stored in localStorage
{
  userId: "ObjectId string",
  username: "username_lowercase",
  displayName: "Display Name"
}

// Access in JavaScript
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
  console.log(user.username);  // username_lowercase
  console.log(user.userId);    // MongoDB ObjectId
  console.log(user.displayName); // Display Name
}
```

---

## Authentication Checks

### Backend
```java
// In controller endpoints
if (username == null || username.isEmpty() || userId == null || userId.isEmpty()) {
    return ResponseEntity.status(401).body("User must be logged in...");
}
```

### Frontend
```javascript
// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) {
    // Show login prompt or redirect
} else {
    // User is authenticated, proceed
    formData.append('username', user.username);
    formData.append('userId', user.userId);
}
```

---

## Common Patterns

### Submitting Problem
```javascript
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    alert('Please login first');
    return;
}

const formData = new FormData();
formData.append('title', title);
formData.append('description', description);
formData.append('username', user.username);
formData.append('userId', user.userId);
formData.append('photo', photoFile);
formData.append('file', file);

fetch('/api/problems', {
    method: 'POST',
    body: formData
});
```

### Submitting Solution
```javascript
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    alert('Please login first');
    return;
}

fetch('/api/solutions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        problemId: problemId,
        username: user.username,
        userId: user.userId,
        title: solutionTitle,
        content: solutionContent
    })
});
```

### Fetching Protected Resource
```javascript
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    // Redirect to login
    return;
}

fetch(`/api/resources?userId=${user.userId}`)
    .then(res => {
        if (res.status === 401) {
            // Unauthorized
        }
        return res.json();
    });
```

---

## User Flow Diagrams

### Problem Posting Flow
```
User visits problems.html
    ↓
Check login status
    ├─ Not logged in → Show login prompt
    └─ Logged in → Show "Post a Problem" button
    ↓
User clicks button → Form appears
    ↓
User fills form & submits
    ↓
Frontend: Send POST /api/problems with username + userId
    ↓
Backend: Validate username/userId, create problem with author info
    ↓
Success → Show success message, refresh problems list
```

### Solution Submission Flow
```
User views problem
    ↓
Check login status
    ├─ Not logged in → Solution section not shown
    └─ Logged in → Show "Add Solution" button
    ↓
User clicks button → Solution form appears
    ↓
User fills form & submits
    ↓
Frontend: Send POST /api/solutions with userId + username
    ↓
Backend: Create solution, add to problem's solution list
    ↓
Success → Solution appears in solutions list
```

---

## Database Changes

### New Collection: solutions
```javascript
db.solutions.insertOne({
  _id: ObjectId(),
  problem_id: "problem_id",
  user_id: "user_id",
  username: "username",
  title: "Solution Title",
  content: "Detailed solution...",
  is_accepted: false,
  created_at: ISODate(),
  updated_at: ISODate()
})
```

### Modified Collection: problems
```javascript
// Added fields to existing problems:
db.problems.updateMany({}, {
  $set: {
    username: "author_username",
    user_id: "author_user_id",
    solutions: []  // Array of solution IDs
  }
})
```

---

## Troubleshooting

### Issue: "User must be logged in" error
**Solution:**
- Check localStorage has user object
- Verify userId and username are being sent
- Clear localStorage and log in again

### Issue: Solutions not showing
**Solution:**
- Verify problem ID is correct
- Check browser console for errors
- Ensure backend SolutionService is working
- Verify MongoDB solutions collection exists

### Issue: Can't post problems
**Solution:**
- Ensure user is logged in
- Check username and userId are in localStorage
- Verify ProblemController is receiving parameters
- Check request parameters include username & userId

### Issue: Resources page shows error
**Solution:**
- Must be logged in to access resources
- Check userId is in localStorage
- Clear browser cache and reload
- Verify ResourceController is checking userId parameter

---

## Development Notes

### Adding New Authentication-Required Endpoint
1. Add `@RequestParam` for `userId` and/or `username`
2. Check if parameters are null/empty
3. Return 401 if not authenticated
4. Document in controller comments

### Adding New Solution Feature
1. Update Solution entity if needed
2. Add method to SolutionService
3. Create endpoint in SolutionController
4. Update frontend to call new endpoint
5. Add auth checks if user-specific operation

### Testing Authentication
1. Use browser DevTools to check localStorage
2. Clear localStorage to test non-logged-in state
3. Use API testing tool (Postman) to verify backend
4. Test both logged-in and logged-out scenarios


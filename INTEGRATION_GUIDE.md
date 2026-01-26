# CodeCollab - Integration & Testing Guide

## Pre-Integration Checklist

Before deploying these changes, ensure you have:

- [ ] Backed up your current database
- [ ] Backed up all current source files
- [ ] Java 21 installed
- [ ] Maven configured
- [ ] MongoDB running
- [ ] Git repository initialized (if using version control)

---

## Step-by-Step Integration

### Phase 1: Backend Integration (Server-side)

#### Step 1.1: Add New Classes
1. Copy these files to your project:
   - `Solution.java` → `src/main/java/com/codecollab/source/entity/`
   - `CreateSolutionRequest.java` → `src/main/java/com/codecollab/source/dto/`
   - `SolutionResponse.java` → `src/main/java/com/codecollab/source/dto/`
   - `SolutionRepository.java` → `src/main/java/com/codecollab/source/repository/`
   - `SolutionService.java` → `src/main/java/com/codecollab/source/service/`
   - `SolutionController.java` → `src/main/java/com/codecollab/source/controller/`

2. Verify file structure:
   ```
   src/main/java/com/codecollab/source/
   ├── entity/
   │   ├── User.java
   │   ├── Problem.java (modified)
   │   ├── Solution.java (new)
   │   └── ...
   ├── dto/
   │   ├── CreateSolutionRequest.java (new)
   │   ├── SolutionResponse.java (new)
   │   └── ...
   ├── repository/
   │   ├── SolutionRepository.java (new)
   │   └── ...
   ├── service/
   │   ├── SolutionService.java (new)
   │   ├── ProblemService.java (modified)
   │   └── ...
   ├── controller/
   │   ├── SolutionController.java (new)
   │   ├── ProblemController.java (modified)
   │   └── ...
   ```

#### Step 1.2: Update Existing Classes
1. Update `Problem.java` with new fields:
   - `String username`
   - `String userId`
   - `List<String> solutionIds`

2. Update `ProblemService.java`:
   - Modify `createProblem()` method signature to include `username` and `userId`

3. Update `ProblemController.java`:
   - Add username and userId parameters to POST `/api/problems`
   - Add validation and 401 response

4. Update `ResourceController.java`:
   - Add userId parameter to GET endpoints
   - Add validation and 401 response

5. Update `RoomController.java`:
   - Add username and creatorId parameters to POST `/api/rooms/create`
   - Add username parameter to POST `/api/rooms/join`
   - Add validation and 401 response

#### Step 1.3: Compile Backend
```bash
# Clean and rebuild project
mvn clean install

# Check for compilation errors
mvn compile
```

Expected output: BUILD SUCCESS

#### Step 1.4: Run Unit Tests (Optional)
```bash
# Run existing tests to ensure nothing broke
mvn test
```

### Phase 2: Frontend Integration (Client-side)

#### Step 2.1: Update JavaScript Files
1. Replace `src/main/resources/static/js/problems.js`
   - Adds solution functionality
   - Adds authentication checks
   - Updates form submission

2. Replace `src/main/resources/static/js/resources.js`
   - Adds authentication checks
   - Updates API calls

3. Replace `src/main/resources/static/js/create_room.js`
   - Adds authentication checks
   - Updates form handling

4. Replace `src/main/resources/static/js/join_room.js`
   - Adds authentication checks
   - Updates form handling

#### Step 2.2: Update HTML Files
1. Update `src/main/resources/static/resources.html`
   - Update filter container class to include `filter-buttons`

#### Step 2.3: Verify Frontend Assets
```
src/main/resources/static/
├── css/
│   └── (no changes needed)
├── js/
│   ├── problems.js (modified)
│   ├── resources.js (modified)
│   ├── create_room.js (modified)
│   ├── join_room.js (modified)
│   └── login.js (no changes)
└── *.html
    └── resources.html (modified)
```

### Phase 3: Database Migration

#### Step 3.1: MongoDB Preparation
1. Backup current database:
   ```bash
   # If using MongoDB Atlas, automatic backups are enabled
   # If local, create manual backup:
   mongodump --db codecollab --out ./backup_$(date +%Y%m%d)
   ```

2. Verify MongoDB is running:
   ```bash
   # MongoDB should be accessible on localhost:27017
   mongo --eval "db.adminCommand('ping')"
   ```

#### Step 3.2: Update Existing Data (One-time)
```javascript
// Connect to MongoDB
use codecollab

// Add fields to existing problems
db.problems.updateMany({}, {
  $set: {
    username: null,
    user_id: null,
    solutions: []
  }
})

// Verify update
db.problems.findOne()
```

#### Step 3.3: Verify Database
```javascript
// Check problems collection
db.problems.find().pretty()

// Solutions collection will be created automatically on first insert
db.solutions.stats() // May show collection doesn't exist yet (that's OK)
```

### Phase 4: Testing & Validation

#### Step 4.1: Start Application
```bash
# From project root
mvn spring-boot:run

# Or if using IDE, run CollaborateApplication.java

# Application should start on:
# http://localhost:8080
```

#### Step 4.2: Smoke Tests

**Test 1: Landing Page Access**
- [ ] Navigate to `http://localhost:8080`
- [ ] Page should load without login
- [ ] All features visible

**Test 2: View Problems**
- [ ] Navigate to `/problems.html`
- [ ] Problems list should display
- [ ] "Post a Problem" button should show login message
- [ ] Check browser console for no errors

**Test 3: User Registration**
- [ ] Navigate to `/login.html`
- [ ] Fill registration form
- [ ] Submit and verify success message
- [ ] Check localStorage for user data:
  ```javascript
  JSON.parse(localStorage.getItem('user'))
  ```

**Test 4: User Login**
- [ ] Use created credentials to login
- [ ] Verify user info appears in localStorage
- [ ] Navigate to problems page
- [ ] "Post a Problem" button should now be visible

**Test 5: Post Problem**
- [ ] Click "Post a Problem" button
- [ ] Fill and submit problem form
- [ ] Verify problem appears in list
- [ ] Check database for username and userId:
  ```javascript
  db.problems.findOne({ title: "Your Test Title" })
  ```

**Test 6: Submit Solution**
- [ ] On problems page, click "Add Solution" on a problem
- [ ] Fill solution form
- [ ] Submit solution
- [ ] Verify solution appears below problem
- [ ] Check database:
  ```javascript
  db.solutions.find({ title: "Your Test Title" })
  ```

**Test 7: Access Resources**
- [ ] Navigate to `/resources.html` (not logged in)
- [ ] Should see login prompt
- [ ] After login, resources should display

**Test 8: Create Room**
- [ ] Navigate to `/create_room.html` (not logged in)
- [ ] Should see login prompt
- [ ] After login, username should be pre-filled
- [ ] Should be able to create room

**Test 9: Join Room**
- [ ] Navigate to `/join_room.html` (not logged in)
- [ ] Should see login prompt
- [ ] After login, username should be pre-filled
- [ ] Should be able to join room

#### Step 4.3: Comprehensive Testing

**Test Authentication Flow**
```javascript
// Test 1: Clear localStorage
localStorage.clear()

// Test 2: Try to post problem (should fail)
// Expected: Error message about login

// Test 3: Login user
// Expected: User object in localStorage

// Test 4: Try to post problem (should succeed)
// Expected: Problem appears in list

// Test 5: Verify problem has username
db.problems.findOne({ /* find your problem */ })
// Expected: username and user_id fields populated
```

**Test Solution Functionality**
```javascript
// Verify solutions saved correctly
db.solutions.find().pretty()

// Verify problem references solutions
db.problems.findOne({ title: "Your test problem" })
// Expected: solutions array contains solution IDs

// Verify solution author
db.solutions.findOne()
// Expected: username and user_id fields match logged-in user
```

**Test Authorization**
```javascript
// Test 1: User A creates problem
// Test 2: User B submits solution to User A's problem
// Test 3: User B tries to delete User A's problem (should fail)
// Test 4: User B deletes own solution (should succeed)
// Expected: Proper authorization checks working
```

### Phase 5: Monitoring & Debugging

#### Step 5.1: Monitor Logs
Watch application logs for errors:
```
# Look for these patterns:
- "Error creating problem"
- "Failed to fetch solutions"
- "Unauthorized"
- "NullPointerException"
```

#### Step 5.2: Browser DevTools
Use browser DevTools to debug:
1. Open DevTools (F12)
2. Go to Console tab
3. Check for JavaScript errors
4. Test localStorage:
   ```javascript
   localStorage.getItem('user')
   ```

#### Step 5.3: Network Monitoring
Monitor API calls:
1. Go to Network tab in DevTools
2. Filter by XHR requests
3. Verify responses include:
   - Status 200 for success
   - Status 401 for unauthorized
   - Correct data in response

#### Step 5.4: MongoDB Monitoring
Check database operations:
```javascript
// View recent operations
db.currentOp()

// Check collection sizes
db.problems.count()
db.solutions.count()
db.users.count()
```

### Phase 6: Post-Deployment

#### Step 6.1: Backup & Documentation
- [ ] Document any issues encountered
- [ ] Create database backup
- [ ] Document any customizations made
- [ ] Update README if needed

#### Step 6.2: User Communication
- [ ] Inform users about new login requirements
- [ ] Explain solution feature availability
- [ ] Provide support contact info

#### Step 6.3: Monitoring Setup
- [ ] Set up error tracking (optional)
- [ ] Monitor user activity
- [ ] Check performance metrics
- [ ] Review logs regularly

---

## Troubleshooting During Integration

### Issue: Compilation Error - "Cannot find symbol"
**Solution:**
- Verify all new classes are in correct directories
- Run `mvn clean compile` to refresh
- Check for typos in class names

### Issue: Maven Build Fails
**Solution:**
```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild
mvn clean install
```

### Issue: Application Won't Start
**Solution:**
- Check MongoDB is running
- Check port 8080 is available
- Check application.properties for MongoDB connection
- Review error logs

### Issue: JavaScript Errors in Console
**Solution:**
- Check browser console for specific errors
- Verify JavaScript files were replaced correctly
- Clear browser cache (Ctrl+Shift+Delete)
- Check file paths are correct

### Issue: API Returns 500 Error
**Solution:**
- Check application logs
- Verify database connection
- Check method signatures match
- Ensure all required fields are being passed

### Issue: Solutions Not Saving
**Solution:**
- Verify SolutionRepository exists
- Check MongoDB is running
- Check userId is not null
- Verify problem ID is valid

### Issue: Authentication Always Fails
**Solution:**
- Check localStorage contains user object
- Verify userId format matches database
- Check API parameter names match
- Clear localStorage and login again

---

## Rollback Plan

If issues occur, follow these steps:

### Quick Rollback (Within Same Session)
```bash
# Stop application
# Ctrl+C

# Restore backed-up files from previous commit
git checkout HEAD -- src/main/resources/static/js/
git checkout HEAD -- src/main/java/

# Clean and rebuild
mvn clean install

# Restart
mvn spring-boot:run
```

### Full Rollback (Need to Go Back Further)
```bash
# If using version control
git revert <commit-hash>
git push

# Restore database from backup
mongorestore --db codecollab ./backup_<date>

# Rebuild and restart application
mvn clean install
mvn spring-boot:run
```

### Manual Rollback (No Version Control)
1. Delete newly added files
2. Restore backed-up versions of modified files
3. Run database backup restore
4. Rebuild and restart

---

## Verification Checklist

- [ ] All 6 new Java classes created and compiled
- [ ] All 5 Java classes modified correctly
- [ ] All 5 JavaScript files updated
- [ ] HTML files updated
- [ ] Project compiles without errors
- [ ] Application starts successfully
- [ ] Landing page accessible without login
- [ ] Problems viewable without login
- [ ] Problems require login to post
- [ ] Solutions require login to submit
- [ ] Resources require login to view
- [ ] Rooms require login to create/join
- [ ] User info properly stored in localStorage
- [ ] Problem author information saved
- [ ] Solution author information saved
- [ ] Solutions visible under problems
- [ ] Can delete own solutions
- [ ] Cannot delete others' solutions
- [ ] Database collections created
- [ ] No errors in application logs
- [ ] No errors in browser console

---

## Performance Notes

- Solution fetching is per-problem (not bulk)
- Consider pagination if many solutions
- MongoDB indexes on userId and problemId recommended
- Cache solutions on frontend if needed

---

## Security Notes

- Always validate username/userId on backend
- Never trust frontend-sent IDs without verification
- Consider JWT tokens for better security in future
- Hash passwords before storage (currently plain text - consider upgrading)
- Validate file uploads if adding file support

---

## Next Steps

After successful integration:

1. Monitor application for issues
2. Gather user feedback
3. Consider implementing suggested enhancements
4. Plan for future security improvements
5. Document your deployment process

For questions or issues, refer to:
- IMPLEMENTATION_SUMMARY.md - Detailed technical documentation
- QUICK_REFERENCE.md - Quick lookup guide
- CHANGES_LIST.md - Complete file changes list


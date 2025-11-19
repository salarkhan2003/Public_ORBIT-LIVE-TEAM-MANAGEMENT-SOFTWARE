# Complete Testing Guide for Authentication & Workspace

## Test Scenarios

### Scenario 1: Fresh User (First Time)
**Steps:**
1. Open app in incognito/private window
2. Click "Get Started" or navigate to login
3. Sign up with new email
4. Should see "Join/Create Workspace" screen
5. Enter join code or create workspace
6. Should redirect to dashboard within 10 seconds

**Expected Result:** ✅ User sees dashboard with workspace

---

### Scenario 2: Existing User Re-Login
**Steps:**
1. Login with existing account that has a workspace
2. Wait for auth to complete (max 5 seconds)
3. Should automatically restore workspace
4. Should redirect to dashboard

**Expected Result:** ✅ User sees their workspace dashboard immediately (no join screen)

---

### Scenario 3: Logout and Re-Login
**Steps:**
1. While logged in with workspace, click logout
2. Should redirect to login page within 2 seconds
3. Login again with same account
4. Should automatically restore workspace
5. Should go directly to dashboard

**Expected Result:** ✅ Workspace is preserved, no need to rejoin

---

### Scenario 4: Join with Invalid Code
**Steps:**
1. On join screen, enter invalid code like "XXXXXX"
2. Click "Join Workspace"
3. Should show error within 10 seconds
4. Error message: "Workspace not found. Please check the code and try again."
5. Button should stop loading

**Expected Result:** ✅ Clear error message, button stops loading

---

### Scenario 5: Join with Valid Code
**Steps:**
1. On join screen, enter valid code (e.g., "DEMO01")
2. Click "Join Workspace"
3. Should show success message
4. Should redirect to dashboard within 1 second

**Expected Result:** ✅ Successfully joins and redirects

---

### Scenario 6: Already Member Tries to Join Again
**Steps:**
1. User already in workspace
2. Manually navigate to join screen (if possible)
3. Enter the same workspace code
4. Click "Join Workspace"
5. Should show "You are already a member"
6. Should redirect to dashboard

**Expected Result:** ✅ Recognizes existing membership, redirects

---

### Scenario 7: Refresh Button on Dashboard
**Steps:**
1. On dashboard, click refresh button
2. Should see brief loading indicator
3. Data should update
4. Should NOT show full-page loading screen

**Expected Result:** ✅ Smooth refresh without loading screen

---

### Scenario 8: Refresh Button on Team Page
**Steps:**
1. On team page, click refresh button
2. Should see brief loading indicator
3. Team members should update
4. Should NOT show full-page loading screen

**Expected Result:** ✅ Smooth refresh without loading screen

---

### Scenario 9: Slow Network (Timeout Protection)
**Steps:**
1. Throttle network to "Slow 3G" in DevTools
2. Login
3. Should show loading for max 5 seconds
4. Should force show app even if not fully loaded

**Expected Result:** ✅ App shows within 5 seconds regardless of network

---

### Scenario 10: Profile Settings Navigation
**Steps:**
1. Click profile icon in header
2. Click "Profile Settings"
3. Should navigate to /settings page

**Expected Result:** ✅ Navigates to settings

---

### Scenario 11: Notifications Navigation
**Steps:**
1. Click notification bell icon in header
2. Should navigate to /notifications page

**Expected Result:** ✅ Navigates to notifications

---

## Console Logs to Watch For

### Good Signs:
- ✅ "Initializing auth..."
- ✅ "User session found: [email]"
- ✅ "Found cached workspace: [name]"
- ✅ "Cached workspace verified, user is still member"
- ✅ "Join successful, group returned"
- ✅ "Auth ready, user: [email]"

### Warning Signs (Should Timeout):
- ⚠️ "Auth loading timeout - forcing app to show"
- ⚠️ "Join timeout - forcing loading to stop"
- ⚠️ "Dashboard load timeout - forcing completion"

### Error Signs (Need Investigation):
- ❌ "Error initializing auth"
- ❌ "Error fetching group membership"
- ❌ "Join error"
- ❌ "No group found with code"

---

## Performance Benchmarks

| Operation | Max Time | Typical Time |
|-----------|----------|--------------|
| Login | 5 seconds | 1-2 seconds |
| Logout | 2 seconds | < 1 second |
| Join Workspace | 10 seconds | 2-3 seconds |
| Restore Workspace | 5 seconds | 1-2 seconds |
| Refresh Data | 3 seconds | < 1 second |
| Page Navigation | Instant | < 100ms |

---

## Troubleshooting

### Issue: Stuck on "Loading ORBIT LIVE..."
**Solution:** Wait 5 seconds - app will force show. Check console for errors.

### Issue: Join button keeps loading
**Solution:** Wait 10 seconds - will timeout. Check if workspace code is valid.

### Issue: Shows join screen even though I'm a member
**Solution:** Check localStorage for 'currentWorkspace'. If missing, rejoin with code.

### Issue: Logout doesn't work
**Solution:** Check console for errors. Try clearing browser cache and cookies.

---

## Browser Console Commands for Testing

```javascript
// Check current workspace
localStorage.getItem('currentWorkspace')

// Clear workspace (force rejoin)
localStorage.removeItem('currentWorkspace')

// Check skip status
localStorage.getItem('skipWorkspace')

// Force skip workspace
localStorage.setItem('skipWorkspace', 'true')

// Clear all app data
localStorage.clear()
```

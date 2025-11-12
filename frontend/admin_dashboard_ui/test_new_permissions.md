# Testing New Permission Endpoints

## Backend Endpoints Added

### 1. Update User Login Permission
- **Endpoint**: `PUT /api/users/{user_id}/login_permission`
- **Body**: `{ "is_active": boolean }`
- **Admin Only**: Yes

### 2. Update User Can Chat Permission
- **Endpoint**: `PUT /api/users/{user_id}/can_chat`
- **Body**: `{ "can_chat": boolean }`
- **Admin Only**: Yes

## Frontend Features Added

### 1. UsersPage Enhancements
- Added "Login Permission" column with toggle buttons
- Added "Chat Permission" column with toggle buttons
- Visual indicators for permission status
- Real-time updates when permissions are changed

### 2. ProfilePage Enhancements
- Added "Chat Permission" display in user profile
- Shows current chat permission status

### 3. UserService Updates
- `updateUserLoginPermission(userId, isActive)`
- `updateUserCanChatPermission(userId, canChat)`

## Testing Steps

### 1. Backend Testing
```bash
# Test login permission update
curl -X PUT "http://localhost:8000/api/users/1/login_permission" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# Test can chat permission update
curl -X PUT "http://localhost:8000/api/users/1/can_chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"can_chat": false}'
```

### 2. Frontend Testing
1. Login as admin user
2. Navigate to Users page
3. Test the new permission toggle buttons
4. Check that the UI updates immediately
5. Verify the changes persist after page refresh

### 3. Profile Testing
1. Login as any user
2. Navigate to Profile page
3. Verify that chat permission is displayed
4. Check that the status matches the backend data

## Expected Behavior

- Only admin users can modify permissions
- Permission changes are reflected immediately in the UI
- Changes persist in the database
- Error handling for unauthorized access
- Visual feedback for permission status 
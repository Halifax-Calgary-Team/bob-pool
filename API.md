# Bob Pool API Documentation

Complete reference for the Bob Pool REST API.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Rides](#ride-endpoints)
  - [Ride Requests](#ride-request-endpoints)

## Overview

**Base URL**: `http://localhost:3001/api`

**Content Type**: `application/json`

**Authentication**: Session-based using HTTP cookies

All API requests and responses use JSON format. The API uses standard HTTP status codes to indicate success or failure.

## Authentication

Bob Pool uses **session-based authentication** with HTTP cookies. After successful login or registration, a session cookie is automatically set and included in subsequent requests.

### Session Cookie Details

- **Name**: `connect.sid`
- **Duration**: 24 hours
- **HttpOnly**: Yes (not accessible via JavaScript)
- **Secure**: Yes in production (HTTPS only)

### Protected Routes

Routes marked with 🔒 require authentication. If you're not logged in, you'll receive a `401 Unauthorized` response.

## Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## Endpoints

---

## Authentication Endpoints

### Register New User

Create a new user account.

**POST** `/api/auth/register`

#### Request Body

```json
{
  "email": "john.doe@ibm.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

#### Validation Rules

- `email`: Required, must be valid IBM email (@ibm.com)
- `name`: Required
- `password`: Required, minimum 6 characters

#### Success Response (201 Created)

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john.doe@ibm.com",
    "name": "John Doe",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Validation error:
```json
{
  "error": "Validation Error",
  "message": "Email must be a valid IBM email address (@ibm.com)"
}
```

**400 Bad Request** - Duplicate email:
```json
{
  "error": "Registration Failed",
  "message": "An account with this email already exists"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@ibm.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

---

### Login

Authenticate a user and create a session.

**POST** `/api/auth/login`

#### Request Body

```json
{
  "email": "john.doe@ibm.com",
  "password": "securepassword123"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john.doe@ibm.com",
    "name": "John Doe",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized** - Invalid credentials:
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@ibm.com",
    "password": "securepassword123"
  }'
```

**Note**: Use `-c cookies.txt` to save the session cookie for subsequent requests.

---

### Logout

End the current user session.

**POST** `/api/auth/logout`

#### Success Response (200 OK)

```json
{
  "message": "Logout successful"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

### Get Current User 🔒

Get information about the currently logged-in user.

**GET** `/api/auth/me`

**Requires Authentication**

#### Success Response (200 OK)

```json
{
  "user": {
    "id": 1,
    "email": "john.doe@ibm.com",
    "name": "John Doe",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized** - Not logged in:
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to access this resource"
}
```

#### cURL Example

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt
```

---

## Ride Endpoints

### List Rides

Get a list of available rides with optional filters.

**GET** `/api/rides`

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | Filter by ride date (YYYY-MM-DD) |
| `pickup` | string | Filter by pickup location (partial match) |
| `dropoff` | string | Filter by dropoff location (partial match) |
| `status` | string | Filter by status (default: "active") |

#### Success Response (200 OK)

```json
{
  "rides": [
    {
      "id": 1,
      "driver_id": 2,
      "driver_name": "Jane Smith",
      "driver_email": "jane.smith@ibm.com",
      "pickup_location": "Downtown Toronto",
      "dropoff_location": "IBM Markham Office",
      "ride_date": "2026-05-20",
      "ride_time": "08:00:00",
      "seats_available": 3,
      "status": "active",
      "created_at": "2026-05-19T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### cURL Examples

List all active rides:
```bash
curl -X GET http://localhost:3001/api/rides
```

Filter by date:
```bash
curl -X GET "http://localhost:3001/api/rides?date=2026-05-20"
```

Filter by pickup location:
```bash
curl -X GET "http://localhost:3001/api/rides?pickup=Toronto"
```

Multiple filters:
```bash
curl -X GET "http://localhost:3001/api/rides?date=2026-05-20&pickup=Toronto&dropoff=Markham"
```

---

### Create Ride 🔒

Create a new ride listing.

**POST** `/api/rides`

**Requires Authentication**

#### Request Body

```json
{
  "pickup_location": "Downtown Toronto",
  "dropoff_location": "IBM Markham Office",
  "ride_date": "2026-05-20",
  "ride_time": "08:00",
  "seats_available": 3
}
```

#### Validation Rules

- `pickup_location`: Required
- `dropoff_location`: Required
- `ride_date`: Required, format YYYY-MM-DD
- `ride_time`: Required, format HH:MM (24-hour)
- `seats_available`: Required, between 1 and 10

#### Success Response (201 Created)

```json
{
  "message": "Ride created successfully",
  "ride": {
    "id": 1,
    "driver_id": 1,
    "pickup_location": "Downtown Toronto",
    "dropoff_location": "IBM Markham Office",
    "ride_date": "2026-05-20",
    "ride_time": "08:00:00",
    "seats_available": 3,
    "status": "active",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Validation error:
```json
{
  "error": "Validation Error",
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/rides \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "pickup_location": "Downtown Toronto",
    "dropoff_location": "IBM Markham Office",
    "ride_date": "2026-05-20",
    "ride_time": "08:00",
    "seats_available": 3
  }'
```

---

### Get Ride Details

Get detailed information about a specific ride, including all ride requests.

**GET** `/api/rides/:id`

#### URL Parameters

- `id`: Ride ID (integer)

#### Success Response (200 OK)

```json
{
  "ride": {
    "id": 1,
    "driver_id": 2,
    "driver_name": "Jane Smith",
    "driver_email": "jane.smith@ibm.com",
    "pickup_location": "Downtown Toronto",
    "dropoff_location": "IBM Markham Office",
    "ride_date": "2026-05-20",
    "ride_time": "08:00:00",
    "seats_available": 2,
    "status": "active",
    "created_at": "2026-05-19T10:00:00.000Z",
    "requests": [
      {
        "id": 1,
        "rider_id": 3,
        "rider_name": "Bob Johnson",
        "rider_email": "bob.johnson@ibm.com",
        "status": "accepted",
        "created_at": "2026-05-19T11:00:00.000Z"
      },
      {
        "id": 2,
        "rider_id": 4,
        "rider_name": "Alice Brown",
        "rider_email": "alice.brown@ibm.com",
        "status": "pending",
        "created_at": "2026-05-19T11:30:00.000Z"
      }
    ]
  }
}
```

#### Error Responses

**404 Not Found**:
```json
{
  "error": "Not Found",
  "message": "Ride not found"
}
```

#### cURL Example

```bash
curl -X GET http://localhost:3001/api/rides/1
```

---

### Update Ride 🔒

Update an existing ride. Only the driver who created the ride can update it.

**PUT** `/api/rides/:id`

**Requires Authentication & Ownership**

#### URL Parameters

- `id`: Ride ID (integer)

#### Request Body

All fields are optional. Only include fields you want to update:

```json
{
  "pickup_location": "New Pickup Location",
  "dropoff_location": "New Dropoff Location",
  "ride_date": "2026-05-21",
  "ride_time": "09:00",
  "seats_available": 4,
  "status": "completed"
}
```

#### Valid Status Values

- `active`: Ride is available for requests
- `completed`: Ride has been completed
- `cancelled`: Ride has been cancelled

#### Success Response (200 OK)

```json
{
  "message": "Ride updated successfully",
  "ride": {
    "id": 1,
    "driver_id": 1,
    "pickup_location": "New Pickup Location",
    "dropoff_location": "New Dropoff Location",
    "ride_date": "2026-05-21",
    "ride_time": "09:00:00",
    "seats_available": 4,
    "status": "active",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**403 Forbidden** - Not the ride owner:
```json
{
  "error": "Forbidden",
  "message": "You can only update your own rides"
}
```

#### cURL Example

```bash
curl -X PUT http://localhost:3001/api/rides/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "seats_available": 4,
    "status": "active"
  }'
```

---

### Delete Ride 🔒

Delete a ride. Only the driver who created the ride can delete it.

**DELETE** `/api/rides/:id`

**Requires Authentication & Ownership**

#### URL Parameters

- `id`: Ride ID (integer)

#### Success Response (200 OK)

```json
{
  "message": "Ride deleted successfully"
}
```

#### Error Responses

**403 Forbidden** - Not the ride owner:
```json
{
  "error": "Forbidden",
  "message": "You can only delete your own rides"
}
```

**404 Not Found**:
```json
{
  "error": "Not Found",
  "message": "Ride not found"
}
```

#### cURL Example

```bash
curl -X DELETE http://localhost:3001/api/rides/1 \
  -b cookies.txt
```

---

## Ride Request Endpoints

### Request to Join Ride 🔒

Submit a request to join a ride as a passenger.

**POST** `/api/rides/:id/request`

**Requires Authentication**

#### URL Parameters

- `id`: Ride ID (integer)

#### Request Body

No body required.

#### Success Response (201 Created)

```json
{
  "message": "Ride request submitted successfully",
  "request": {
    "id": 1,
    "ride_id": 1,
    "rider_id": 3,
    "status": "pending",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Already requested:
```json
{
  "error": "Invalid Request",
  "message": "You have already requested this ride"
}
```

**400 Bad Request** - Own ride:
```json
{
  "error": "Invalid Request",
  "message": "You cannot request your own ride"
}
```

**400 Bad Request** - No seats:
```json
{
  "error": "Invalid Request",
  "message": "No seats available for this ride"
}
```

**400 Bad Request** - Ride not active:
```json
{
  "error": "Invalid Request",
  "message": "This ride is no longer accepting requests"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/rides/1/request \
  -b cookies.txt
```

---

### Accept or Reject Ride Request 🔒

Accept or reject a ride request. Only the driver can perform this action.

**PUT** `/api/rides/:id/requests/:requestId`

**Requires Authentication & Ownership**

#### URL Parameters

- `id`: Ride ID (integer)
- `requestId`: Request ID (integer)

#### Request Body

```json
{
  "status": "accepted"
}
```

#### Valid Status Values

- `accepted`: Accept the ride request (decreases available seats by 1)
- `rejected`: Reject the ride request

#### Success Response (200 OK)

```json
{
  "message": "Ride request accepted successfully",
  "request": {
    "id": 1,
    "ride_id": 1,
    "rider_id": 3,
    "status": "accepted",
    "created_at": "2026-05-19T12:00:00.000Z"
  }
}
```

#### Error Responses

**403 Forbidden** - Not the driver:
```json
{
  "error": "Forbidden",
  "message": "Only the driver can accept or reject requests"
}
```

**400 Bad Request** - Already processed:
```json
{
  "error": "Invalid Request",
  "message": "This request has already been processed"
}
```

**400 Bad Request** - No seats available:
```json
{
  "error": "Invalid Request",
  "message": "No seats available for this ride"
}
```

#### cURL Examples

Accept a request:
```bash
curl -X PUT http://localhost:3001/api/rides/1/requests/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status": "accepted"}'
```

Reject a request:
```bash
curl -X PUT http://localhost:3001/api/rides/1/requests/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status": "rejected"}'
```

---

## Testing the API

### Using cURL

1. **Register a user**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@ibm.com","name":"Test User","password":"password123"}'
```

2. **Create a ride**:
```bash
curl -X POST http://localhost:3001/api/rides \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"pickup_location":"Toronto","dropoff_location":"Markham","ride_date":"2026-05-20","ride_time":"08:00","seats_available":3}'
```

3. **List rides**:
```bash
curl -X GET http://localhost:3001/api/rides
```

### Using Postman

1. Import the base URL: `http://localhost:3001/api`
2. Enable "Automatically follow redirects"
3. Enable "Save cookies" in settings
4. Test endpoints in order: Register → Login → Create Ride → etc.

### Using Browser DevTools

Open the browser console and use `fetch`:

```javascript
// Register
fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@ibm.com',
    name: 'Test User',
    password: 'password123'
  })
}).then(r => r.json()).then(console.log);

// List rides
fetch('http://localhost:3001/api/rides')
  .then(r => r.json())
  .then(console.log);
```

---

**Made with Bob** 🚗
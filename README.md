# bob-pool
Bob Pool is an internal IBM carpooling web application

## Essentials
MVP functionality
- profiles: ibm email address requirement
- ride creation: drivers can list a ride with pickup / dropoff locations, date, time, and number of seats available
- ride search: riders can search for rides based on pickup / dropoff locations, date, and time
- status management: drivers can accept or reject ride requests and update the status of their rides


## Logistics & Communication
keep it simple to avoid building complex notification systems or chat engines
- email-based communication: use the users default email client to send notifications and messages
- basic notifications: email or browser alerts for ride status changes
- location pins: use map api, maybe google, for pickup / dropoff locations


## Admin & Governance
- admin dashboard: view and manage all rides and users
- company email domain lockdown: restrict user registration to ibm email addresses


## What to cut
to hit the one month deadline, avoid these time-intensive features
- in-app payments: stick to cash/e-transfer on arrival
- ai matching algorithm: let users search manually fornow
- real-time tracking: use static location pins for now

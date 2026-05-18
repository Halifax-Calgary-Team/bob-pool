# 🚗 Bobpool - Halifax Carpool Management System

**Bobpool** is a comprehensive carpool management system designed specifically for employees in Halifax who need to share rides. The system intelligently optimizes carpool routes, assigns passengers to drivers, and provides Google Maps integration for easy navigation.

## 🌟 Features

- **Employee Data Collection**: Gather start/destination addresses and car availability
- **Intelligent Route Optimization**: Uses Google Maps API to find the most efficient routes
- **Automatic Passenger Assignment**: Matches passengers with drivers based on route efficiency
- **Google Maps Integration**: View optimized routes directly in Google Maps
- **Interactive & Example Modes**: Choose between manual data entry or sample data
- **Route Export**: Save all carpool routes to a text file for easy sharing

## 📋 Prerequisites

- Python 3.7 or higher
- Google Maps API Key (required for route calculations)

## 🔧 Installation

1. **Clone or download the project files**

2. **Install required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Get a Google Maps API Key**:
   - Visit: https://developers.google.com/maps/documentation/javascript/get-api-key
   - Enable the following APIs:
     - Directions API
     - Distance Matrix API
   - Copy your API key

## 🚀 Usage

### Interactive Mode (Recommended)

Run the program and choose option 1 to enter employee data manually:

```bash
python bobpool_carpool_system.py
```

Follow the prompts to:
1. Enter your Google Maps API key
2. Add employee information:
   - Name
   - Start address in Halifax
   - Destination address in Halifax
   - Whether they have a car for ride sharing
   - Number of available seats (if they have a car)
3. Type 'done' when finished adding employees
4. View optimized carpool routes
5. Optionally save routes to file or open in Google Maps

### Example Mode

Run the program and choose option 2 to see how it works with sample data:

```bash
python bobpool_carpool_system.py
```

**Note**: You'll need to edit the `API_KEY` variable in the `example_usage()` function with your actual Google Maps API key.

### Programmatic Usage

You can also use Bobpool as a library in your own Python scripts:

```python
from bobpool_carpool_system import BobpoolCarpoolSystem

# Initialize with your API key
bobpool = BobpoolCarpoolSystem("YOUR_API_KEY_HERE")

# Add employees
bobpool.add_employee("Alice", "1234 Spring Garden Rd, Halifax, NS", 
                    "6009 Quinpool Rd, Halifax, NS", True, 3)
bobpool.add_employee("Bob", "5670 Spring Garden Rd, Halifax, NS", 
                    "6100 Quinpool Rd, Halifax, NS", False)

# Optimize carpools
bobpool.optimize_carpools()

# Display results
bobpool.display_carpool_summary()

# Open routes in browser
bobpool.open_routes_in_browser()

# Save routes to file
bobpool.save_routes_to_file("my_routes.txt")
```

## 📊 How It Works

1. **Data Collection**: The system collects employee information including:
   - Start and destination addresses
   - Car availability and seat capacity

2. **Route Optimization**: For each driver, the system:
   - Calculates all possible passenger combinations
   - Uses Google Maps Directions API to find optimal routes
   - Considers pickup and drop-off locations
   - Selects the most efficient combination based on total distance

3. **Assignment Algorithm**: Uses a greedy algorithm to:
   - Prioritize drivers with more available seats
   - Minimize total travel distance
   - Ensure all passengers are assigned (when possible)

4. **Route Visualization**: Generates Google Maps URLs with:
   - Driver's start location as origin
   - Driver's destination as final destination
   - Optimized waypoints for passenger pickups/drop-offs

## 📝 Example Output

```
======================================================================
🚗 BOBPOOL CARPOOL SUMMARY - Halifax
======================================================================

📍 Carpool Group 1
   Driver: Alice
   Passengers: Bob, Charlie
   Total Distance: 12.45 km
   Estimated Duration: 18 minutes
   Route:
     Start: 1234 Spring Garden Rd, Halifax, NS
     → 5670 Spring Garden Rd, Halifax, NS
     → 1500 Barrington St, Halifax, NS
     → 6100 Quinpool Rd, Halifax, NS
     → 6200 Quinpool Rd, Halifax, NS
     End: 6009 Quinpool Rd, Halifax, NS

======================================================================
```

## 🔑 API Key Security

**Important**: Never commit your API key to version control. Consider:
- Using environment variables: `os.getenv('GOOGLE_MAPS_API_KEY')`
- Creating a `.env` file (add to `.gitignore`)
- Using a configuration file (add to `.gitignore`)

## 🛠️ Troubleshooting

### "Import googlemaps could not be resolved"
- Run: `pip install googlemaps`

### "API key is invalid"
- Verify your API key is correct
- Ensure Directions API is enabled in Google Cloud Console
- Check API key restrictions

### "No drivers available for carpooling"
- Ensure at least one employee has `has_car=True` and `available_seats > 0`

### Routes not opening in browser
- Check your default browser settings
- Copy the URL from console and paste manually

## 📄 License

This project is provided as-is for educational and commercial use.

## 👨‍💻 Author

**Bob (Bobpool)** - Your friendly carpool expert!

## 🤝 Contributing

Feel free to enhance Bobpool with additional features such as:
- Time-based scheduling
- Recurring carpool arrangements
- Cost splitting calculations
- Mobile app integration
- Real-time traffic consideration

---

**Happy Carpooling! 🚗💨**
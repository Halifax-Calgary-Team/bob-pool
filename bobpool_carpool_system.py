"""
Bobpool - Halifax Carpool Management System
A comprehensive carpool solution for employees in Halifax
"""

import googlemaps
from datetime import datetime
from typing import List, Dict, Tuple
import itertools
from dataclasses import dataclass
import webbrowser

@dataclass
class Employee:
    """Employee data structure"""
    name: str
    start_address: str
    destination_address: str
    has_car: bool
    available_seats: int = 0
    
    def __repr__(self):
        car_info = f"Driver ({self.available_seats} seats)" if self.has_car else "Passenger"
        return f"{self.name} - {car_info}"


class BobpoolCarpoolSystem:
    """Main carpool management system"""
    
    def __init__(self, google_maps_api_key: str):
        """Initialize Bobpool system with Google Maps API key"""
        self.gmaps = googlemaps.Client(key=google_maps_api_key)
        self.employees: List[Employee] = []
        self.carpool_groups: List[Dict] = []
        
    def add_employee(self, name: str, start_address: str, destination_address: str, 
                     has_car: bool, available_seats: int = 0) -> None:
        """Add an employee to the carpool system"""
        if has_car and available_seats <= 0:
            print(f"Warning: {name} has a car but no available seats specified.")
            available_seats = 0
        
        employee = Employee(name, start_address, destination_address, has_car, available_seats)
        self.employees.append(employee)
        print(f"✓ Added: {employee}")
    
    def calculate_route_efficiency(self, driver: Employee, passengers: List[Employee]) -> Dict:
        """Calculate the efficiency of a carpool route"""
        waypoints = []
        
        # Add passenger pickup locations
        for passenger in passengers:
            waypoints.append(passenger.start_address)
        
        # Add passenger drop-off locations
        for passenger in passengers:
            waypoints.append(passenger.destination_address)
        
        # Calculate optimized route
        try:
            result = self.gmaps.directions(
                origin=driver.start_address,
                destination=driver.destination_address,
                waypoints=waypoints,
                optimize_waypoints=True,
                mode="driving",
                departure_time=datetime.now()
            )
            
            if result:
                route = result[0]
                total_distance = sum(leg['distance']['value'] for leg in route['legs']) / 1000
                total_duration = sum(leg['duration']['value'] for leg in route['legs']) / 60
                
                waypoint_order = route.get('waypoint_order', list(range(len(waypoints))))
                optimized_waypoints = [waypoints[i] for i in waypoint_order]
                
                return {
                    'driver': driver,
                    'passengers': passengers,
                    'total_distance_km': total_distance,
                    'total_duration_min': total_duration,
                    'waypoints': optimized_waypoints,
                    'route_data': route
                }
        except Exception as e:
            print(f"Error calculating route: {e}")
        
        return None
    
    def optimize_carpools(self) -> List[Dict]:
        """Optimize carpool assignments using a greedy algorithm"""
        drivers = [emp for emp in self.employees if emp.has_car and emp.available_seats > 0]
        passengers = [emp for emp in self.employees if not emp.has_car or emp.available_seats == 0]
        
        if not drivers:
            print("❌ No drivers available for carpooling!")
            return []
        
        if not passengers:
            print("ℹ️ No passengers need rides. All employees are drivers.")
            return []
        
        print(f"\n🚗 Optimizing carpools for {len(drivers)} driver(s) and {len(passengers)} passenger(s)...")
        
        carpool_groups = []
        remaining_passengers = passengers.copy()
        
        for driver in drivers:
            if not remaining_passengers:
                break
            
            max_passengers = min(driver.available_seats, len(remaining_passengers))
            best_combination = None
            best_efficiency = float('inf')
            
            # Try different combinations of passengers
            for r in range(1, max_passengers + 1):
                for passenger_combo in itertools.combinations(remaining_passengers, r):
                    route_info = self.calculate_route_efficiency(driver, list(passenger_combo))
                    if route_info:
                        efficiency = route_info['total_distance_km']
                        if efficiency < best_efficiency:
                            best_efficiency = efficiency
                            best_combination = passenger_combo
            
            if best_combination:
                route_info = self.calculate_route_efficiency(driver, list(best_combination))
                carpool_groups.append(route_info)
                
                for passenger in best_combination:
                    remaining_passengers.remove(passenger)
                
                print(f"✓ Carpool {len(carpool_groups)}: {driver.name} + {len(best_combination)} passenger(s)")
        
        if remaining_passengers:
            print(f"\n⚠️ Warning: {len(remaining_passengers)} passenger(s) could not be assigned:")
            for passenger in remaining_passengers:
                print(f"  - {passenger.name}")
        
        self.carpool_groups = carpool_groups
        return carpool_groups
    
    def display_carpool_summary(self) -> None:
        """Display a summary of all carpool groups"""
        if not self.carpool_groups:
            print("\n❌ No carpool groups created yet. Run optimize_carpools() first.")
            return
        
        print("\n" + "="*70)
        print("🚗 BOBPOOL CARPOOL SUMMARY - Halifax")
        print("="*70)
        
        for idx, group in enumerate(self.carpool_groups, 1):
            print(f"\n📍 Carpool Group {idx}")
            print(f"   Driver: {group['driver'].name}")
            print(f"   Passengers: {', '.join([p.name for p in group['passengers']])}")
            print(f"   Total Distance: {group['total_distance_km']:.2f} km")
            print(f"   Estimated Duration: {group['total_duration_min']:.0f} minutes")
            print(f"   Route:")
            print(f"     Start: {group['driver'].start_address}")
            for waypoint in group['waypoints']:
                print(f"     → {waypoint}")
            print(f"     End: {group['driver'].destination_address}")
        
        print("\n" + "="*70)
    
    def generate_google_maps_url(self, carpool_group: Dict) -> str:
        """Generate a Google Maps URL for a carpool route"""
        origin = carpool_group['driver'].start_address
        destination = carpool_group['driver'].destination_address
        waypoints = carpool_group['waypoints']
        
        base_url = "https://www.google.com/maps/dir/?api=1"
        origin_param = f"&origin={origin.replace(' ', '+')}"
        destination_param = f"&destination={destination.replace(' ', '+')}"
        
        if waypoints:
            waypoints_str = '|'.join([wp.replace(' ', '+') for wp in waypoints])
            waypoints_param = f"&waypoints={waypoints_str}"
        else:
            waypoints_param = ""
        
        url = base_url + origin_param + destination_param + waypoints_param + "&travelmode=driving"
        return url
    
    def open_routes_in_browser(self) -> None:
        """Open all carpool routes in Google Maps in the browser"""
        if not self.carpool_groups:
            print("\n❌ No carpool groups to display. Run optimize_carpools() first.")
            return
        
        print("\n🌐 Opening routes in Google Maps...")
        
        for idx, group in enumerate(self.carpool_groups, 1):
            url = self.generate_google_maps_url(group)
            print(f"\nCarpool Group {idx} - {group['driver'].name}'s route:")
            print(f"URL: {url}")
            webbrowser.open(url)
        
        print("\n✓ All routes opened in browser!")
    
    def save_routes_to_file(self, filename: str = "bobpool_routes.txt") -> None:
        """Save all route URLs to a text file"""
        if not self.carpool_groups:
            print("\n❌ No carpool groups to save. Run optimize_carpools() first.")
            return
        
        with open(filename, 'w') as f:
            f.write("BOBPOOL CARPOOL ROUTES - Halifax\n")
            f.write("="*70 + "\n\n")
            
            for idx, group in enumerate(self.carpool_groups, 1):
                f.write(f"Carpool Group {idx}\n")
                f.write(f"Driver: {group['driver'].name}\n")
                f.write(f"Passengers: {', '.join([p.name for p in group['passengers']])}\n")
                f.write(f"Distance: {group['total_distance_km']:.2f} km\n")
                f.write(f"Duration: {group['total_duration_min']:.0f} minutes\n")
                f.write(f"Google Maps URL:\n{self.generate_google_maps_url(group)}\n")
                f.write("\n" + "-"*70 + "\n\n")
        
        print(f"\n✓ Routes saved to {filename}")


def interactive_mode():
    """Run Bobpool in interactive mode"""
    print("="*70)
    print("🚗 Welcome to BOBPOOL - Halifax Carpool Management System")
    print("="*70)
    
    api_key = input("\nEnter your Google Maps API Key: ").strip()
    
    if not api_key:
        print("❌ API key is required. Get one at: https://developers.google.com/maps/documentation/javascript/get-api-key")
        return
    
    bobpool = BobpoolCarpoolSystem(api_key)
    
    print("\n📝 Let's collect employee information...")
    
    while True:
        print("\n" + "-"*70)
        name = input("Employee name (or 'done' to finish): ").strip()
        
        if name.lower() == 'done':
            break
        
        start_address = input("Start address in Halifax: ").strip()
        destination_address = input("Destination address in Halifax: ").strip()
        
        has_car_input = input("Does this employee have a car for ride sharing? (yes/no): ").strip().lower()
        has_car = has_car_input in ['yes', 'y']
        
        available_seats = 0
        if has_car:
            try:
                available_seats = int(input("Number of available seats in the car: ").strip())
            except ValueError:
                print("Invalid number. Setting available seats to 0.")
                available_seats = 0
        
        bobpool.add_employee(name, start_address, destination_address, has_car, available_seats)
    
    if len(bobpool.employees) < 2:
        print("\n❌ Need at least 2 employees to create carpools.")
        return
    
    print("\n🔄 Optimizing carpool routes...")
    bobpool.optimize_carpools()
    
    bobpool.display_carpool_summary()
    
    save_choice = input("\n💾 Save routes to file? (yes/no): ").strip().lower()
    if save_choice in ['yes', 'y']:
        bobpool.save_routes_to_file()
    
    open_choice = input("\n🌐 Open routes in Google Maps? (yes/no): ").strip().lower()
    if open_choice in ['yes', 'y']:
        bobpool.open_routes_in_browser()
    
    print("\n✓ Bobpool session complete! Thank you for using Bobpool! 🚗")


def example_usage():
    """Example usage with sample data"""
    print("="*70)
    print("🚗 BOBPOOL EXAMPLE - Halifax Carpool System")
    print("="*70)
    
    API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    
    bobpool = BobpoolCarpoolSystem(API_KEY)
    
    print("\n📝 Adding sample employees...")
    bobpool.add_employee("Alice", "1234 Spring Garden Rd, Halifax, NS", 
                        "6009 Quinpool Rd, Halifax, NS", True, 3)
    bobpool.add_employee("Bob", "5670 Spring Garden Rd, Halifax, NS", 
                        "6100 Quinpool Rd, Halifax, NS", False)
    bobpool.add_employee("Charlie", "1500 Barrington St, Halifax, NS", 
                        "6200 Quinpool Rd, Halifax, NS", False)
    bobpool.add_employee("Diana", "2000 Gottingen St, Halifax, NS", 
                        "6300 Quinpool Rd, Halifax, NS", True, 2)
    bobpool.add_employee("Eve", "3000 Robie St, Halifax, NS", 
                        "6400 Quinpool Rd, Halifax, NS", False)
    
    print("\n🔄 Optimizing carpool routes...")
    bobpool.optimize_carpools()
    
    bobpool.display_carpool_summary()
    bobpool.save_routes_to_file("example_routes.txt")


if __name__ == "__main__":
    print("\n🚗 BOBPOOL - Halifax Carpool Management System\n")
    print("Choose mode:")
    print("1. Interactive mode (enter employee data)")
    print("2. Example mode (use sample data)")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "1":
        interactive_mode()
    elif choice == "2":
        example_usage()
    else:
        print("Invalid choice. Exiting.")

# Made with Bob

"""
Example usage script for Bobpool Carpool System
This demonstrates how to use the system programmatically
"""

from bobpool_carpool_system import BobpoolCarpoolSystem

def main():
    """
    Example demonstrating Bobpool usage with Halifax addresses
    
    IMPORTANT: Replace 'YOUR_GOOGLE_MAPS_API_KEY_HERE' with your actual API key
    Get one at: https://developers.google.com/maps/documentation/javascript/get-api-key
    """
    
    # Initialize Bobpool with your Google Maps API key
    API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    
    print("="*70)
    print("🚗 Bobpool Example - Halifax Carpool System")
    print("="*70)
    
    # Create Bobpool instance
    bobpool = BobpoolCarpoolSystem(API_KEY)
    
    # Example 1: Simple carpool with one driver and two passengers
    print("\n📝 Example 1: Basic Carpool Setup")
    print("-" * 70)
    
    # Add a driver with 3 available seats
    bobpool.add_employee(
        name="Alice Johnson",
        start_address="1234 Spring Garden Rd, Halifax, NS",
        destination_address="6009 Quinpool Rd, Halifax, NS",
        has_car=True,
        available_seats=3
    )
    
    # Add passengers
    bobpool.add_employee(
        name="Bob Smith",
        start_address="5670 Spring Garden Rd, Halifax, NS",
        destination_address="6100 Quinpool Rd, Halifax, NS",
        has_car=False
    )
    
    bobpool.add_employee(
        name="Charlie Brown",
        start_address="1500 Barrington St, Halifax, NS",
        destination_address="6200 Quinpool Rd, Halifax, NS",
        has_car=False
    )
    
    # Optimize and display results
    print("\n🔄 Optimizing carpool routes...")
    bobpool.optimize_carpools()
    bobpool.display_carpool_summary()
    
    # Save routes to file
    bobpool.save_routes_to_file("example1_routes.txt")
    
    # Example 2: Multiple drivers scenario
    print("\n\n📝 Example 2: Multiple Drivers Scenario")
    print("-" * 70)
    
    # Create new instance for second example
    bobpool2 = BobpoolCarpoolSystem(API_KEY)
    
    # Add multiple drivers
    bobpool2.add_employee(
        name="Diana Prince",
        start_address="2000 Gottingen St, Halifax, NS",
        destination_address="6300 Quinpool Rd, Halifax, NS",
        has_car=True,
        available_seats=2
    )
    
    bobpool2.add_employee(
        name="Eve Wilson",
        start_address="3000 Robie St, Halifax, NS",
        destination_address="6400 Quinpool Rd, Halifax, NS",
        has_car=True,
        available_seats=3
    )
    
    # Add passengers
    bobpool2.add_employee(
        name="Frank Miller",
        start_address="2100 Gottingen St, Halifax, NS",
        destination_address="6350 Quinpool Rd, Halifax, NS",
        has_car=False
    )
    
    bobpool2.add_employee(
        name="Grace Lee",
        start_address="3100 Robie St, Halifax, NS",
        destination_address="6450 Quinpool Rd, Halifax, NS",
        has_car=False
    )
    
    bobpool2.add_employee(
        name="Henry Davis",
        start_address="2500 Brunswick St, Halifax, NS",
        destination_address="6500 Quinpool Rd, Halifax, NS",
        has_car=False
    )
    
    # Optimize and display
    print("\n🔄 Optimizing carpool routes...")
    bobpool2.optimize_carpools()
    bobpool2.display_carpool_summary()
    bobpool2.save_routes_to_file("example2_routes.txt")
    
    # Example 3: Accessing route data programmatically
    print("\n\n📝 Example 3: Programmatic Access to Route Data")
    print("-" * 70)
    
    if bobpool2.carpool_groups:
        for idx, group in enumerate(bobpool2.carpool_groups, 1):
            print(f"\nCarpool Group {idx} Details:")
            print(f"  Driver: {group['driver'].name}")
            print(f"  Number of Passengers: {len(group['passengers'])}")
            print(f"  Passenger Names: {[p.name for p in group['passengers']]}")
            print(f"  Total Distance: {group['total_distance_km']:.2f} km")
            print(f"  Total Duration: {group['total_duration_min']:.0f} minutes")
            print(f"  Google Maps URL: {bobpool2.generate_google_maps_url(group)}")
    
    # Example 4: Edge case - Driver with no available seats
    print("\n\n📝 Example 4: Edge Case - Driver with Car but No Seats")
    print("-" * 70)
    
    bobpool3 = BobpoolCarpoolSystem(API_KEY)
    
    bobpool3.add_employee(
        name="Ian Thompson",
        start_address="1000 South Park St, Halifax, NS",
        destination_address="5000 Cogswell St, Halifax, NS",
        has_car=True,
        available_seats=0  # Has car but no available seats
    )
    
    bobpool3.add_employee(
        name="Jane Cooper",
        start_address="1100 South Park St, Halifax, NS",
        destination_address="5100 Cogswell St, Halifax, NS",
        has_car=False
    )
    
    print("\n🔄 Attempting to optimize...")
    bobpool3.optimize_carpools()
    bobpool3.display_carpool_summary()
    
    print("\n" + "="*70)
    print("✓ All examples completed!")
    print("="*70)
    print("\nNext steps:")
    print("1. Replace API_KEY with your actual Google Maps API key")
    print("2. Run: python example_usage.py")
    print("3. Check the generated route files: example1_routes.txt, example2_routes.txt")
    print("4. Optionally uncomment the browser opening code below")
    print("\n# Uncomment to open routes in browser:")
    print("# bobpool.open_routes_in_browser()")
    print("# bobpool2.open_routes_in_browser()")


if __name__ == "__main__":
    main()

# Made with Bob

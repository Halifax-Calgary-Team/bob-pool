# 🔧 Bobpool Setup Guide

This guide will walk you through setting up and running the Bobpool carpool system step by step.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Getting a Google Maps API Key](#getting-a-google-maps-api-key)
3. [Installation Steps](#installation-steps)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Python**: Version 3.7 or higher
- **Internet Connection**: Required for Google Maps API calls
- **Google Maps API Key**: Free tier available (see below)

### Check Your Python Version

Open a terminal/command prompt and run:

```bash
python --version
```

or

```bash
python3 --version
```

If Python is not installed, download it from [python.org](https://www.python.org/downloads/)

---

## Getting a Google Maps API Key

### Step 1: Create a Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept the terms of service if prompted

### Step 2: Create a New Project

1. Click on the project dropdown at the top of the page
2. Click "New Project"
3. Enter a project name (e.g., "Bobpool Carpool")
4. Click "Create"

### Step 3: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Directions API** (required for route calculations)
   - **Distance Matrix API** (optional but recommended)
   - **Maps JavaScript API** (optional, for enhanced features)

### Step 4: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key (it will look like: `AIzaSyD...`)
4. **Important**: Click "Restrict Key" to secure it:
   - Under "API restrictions", select "Restrict key"
   - Choose the APIs you enabled (Directions API, etc.)
   - Click "Save"

### Step 5: Set Up Billing (Required)

Google Maps API requires a billing account, but offers:
- **$200 free credit per month**
- Pay-as-you-go after free credit
- Most small-scale carpool operations stay within free tier

To set up billing:
1. Go to "Billing" in Google Cloud Console
2. Click "Link a billing account"
3. Follow the prompts to add payment information

**Note**: You won't be charged unless you exceed the free tier limits.

---

## Installation Steps

### Step 1: Download Bobpool Files

Ensure you have these files in your project directory:
- `bobpool_carpool_system.py` (main application)
- `requirements.txt` (dependencies)
- `README.md` (documentation)
- `example_usage.py` (examples)
- `SETUP_GUIDE.md` (this file)

### Step 2: Open Terminal/Command Prompt

Navigate to the Bobpool directory:

**Windows:**
```bash
cd C:\Users\YourUsername\Desktop\bobpool
```

**macOS/Linux:**
```bash
cd ~/Desktop/bobpool
```

### Step 3: Install Dependencies

Run the following command:

```bash
pip install -r requirements.txt
```

or if you're using Python 3 specifically:

```bash
pip3 install -r requirements.txt
```

This will install the `googlemaps` library.

### Step 4: Verify Installation

Check if the library is installed:

```bash
pip show googlemaps
```

You should see version information for the googlemaps package.

---

## Running the Application

### Method 1: Interactive Mode (Recommended for First-Time Users)

1. Run the main script:
   ```bash
   python bobpool_carpool_system.py
   ```

2. Choose option **1** for Interactive Mode

3. Enter your Google Maps API key when prompted

4. Follow the prompts to add employees:
   - Enter employee name
   - Enter start address (e.g., "1234 Spring Garden Rd, Halifax, NS")
   - Enter destination address
   - Specify if they have a car
   - If yes, enter number of available seats
   - Type "done" when finished

5. The system will:
   - Optimize carpool routes
   - Display a summary
   - Ask if you want to save routes to a file
   - Ask if you want to open routes in Google Maps

### Method 2: Example Mode (Quick Demo)

1. **First**, edit `bobpool_carpool_system.py`:
   - Find the `example_usage()` function (around line 260)
   - Replace `"YOUR_GOOGLE_MAPS_API_KEY_HERE"` with your actual API key

2. Run the script:
   ```bash
   python bobpool_carpool_system.py
   ```

3. Choose option **2** for Example Mode

4. The system will run with pre-configured sample data

### Method 3: Using the Example Script

1. **First**, edit `example_usage.py`:
   - Replace `"YOUR_GOOGLE_MAPS_API_KEY_HERE"` with your actual API key (line 14)

2. Run the example script:
   ```bash
   python example_usage.py
   ```

3. This will demonstrate multiple scenarios and save route files

### Method 4: Programmatic Usage

Create your own Python script:

```python
from bobpool_carpool_system import BobpoolCarpoolSystem

# Initialize with your API key
bobpool = BobpoolCarpoolSystem("YOUR_API_KEY_HERE")

# Add employees
bobpool.add_employee("Alice", "1234 Spring Garden Rd, Halifax, NS", 
                    "6009 Quinpool Rd, Halifax, NS", True, 3)
bobpool.add_employee("Bob", "5670 Spring Garden Rd, Halifax, NS", 
                    "6100 Quinpool Rd, Halifax, NS", False)

# Optimize and display
bobpool.optimize_carpools()
bobpool.display_carpool_summary()
bobpool.open_routes_in_browser()
```

---

## Troubleshooting

### Issue: "Import googlemaps could not be resolved"

**Solution:**
```bash
pip install googlemaps
```

If that doesn't work, try:
```bash
python -m pip install googlemaps
```

### Issue: "API key is invalid" or "REQUEST_DENIED"

**Possible causes and solutions:**

1. **API key is incorrect**
   - Double-check you copied the entire key
   - Make sure there are no extra spaces

2. **APIs not enabled**
   - Go to Google Cloud Console
   - Enable "Directions API" and "Distance Matrix API"

3. **API key restrictions too strict**
   - In Google Cloud Console, go to Credentials
   - Edit your API key
   - Under "API restrictions", ensure Directions API is allowed

4. **Billing not set up**
   - Google Maps API requires billing to be enabled
   - Set up billing in Google Cloud Console (free tier available)

### Issue: "No module named 'googlemaps'"

**Solution:**

Make sure you're using the correct Python version:

```bash
# Try these commands in order:
pip install googlemaps
pip3 install googlemaps
python -m pip install googlemaps
python3 -m pip install googlemaps
```

### Issue: Routes not opening in browser

**Solution:**

1. Check if URLs are being printed to console
2. Copy the URL manually and paste into your browser
3. Ensure you have a default browser set
4. Try a different browser

### Issue: "No drivers available for carpooling"

**Solution:**

Ensure at least one employee has:
- `has_car = True`
- `available_seats > 0`

### Issue: Slow performance with many employees

**Explanation:**

The optimization algorithm tries multiple combinations, which can be slow with many employees.

**Solutions:**
- Limit the number of employees per carpool group
- Run optimization in batches
- Consider upgrading to a more powerful machine

### Issue: Inaccurate routes

**Possible causes:**

1. **Incorrect addresses**
   - Verify addresses are complete and accurate
   - Include city and province (e.g., "Halifax, NS")

2. **Ambiguous locations**
   - Be specific with street numbers
   - Include postal codes when possible

### Getting Help

If you encounter other issues:

1. Check the error message carefully
2. Verify your API key is valid and has proper permissions
3. Ensure all addresses are in Halifax, NS format
4. Check your internet connection
5. Review the Google Maps API documentation: https://developers.google.com/maps/documentation

---

## 🎉 Success!

Once everything is set up, you should see output like:

```
======================================================================
🚗 BOBPOOL CARPOOL SUMMARY - Halifax
======================================================================

📍 Carpool Group 1
   Driver: Alice
   Passengers: Bob, Charlie
   Total Distance: 12.45 km
   Estimated Duration: 18 minutes
   ...
```

**Congratulations! You're ready to use Bobpool!** 🚗💨

---

## Next Steps

- Customize the code for your specific needs
- Add more employees to test larger carpools
- Integrate with your company's employee database
- Set up automated daily carpool assignments
- Add features like cost splitting or scheduling

Happy carpooling! 🌟
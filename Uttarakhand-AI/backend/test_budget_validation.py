"""Test script for budget validation in trip planning"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_low_budget():
    """Test with very low budget (should fail)"""
    print("\n=== Test 1: Low Budget (₹1000 for 3 days) ===")
    data = {
        "duration": 3,
        "budget": 1000,
        "interests": ["temples", "nature"],
        "start_location": "Dehradun",
        "travel_style": "budget",
        "language": "hindi"
    }
    
    response = requests.post(f"{BASE_URL}/itinerary/generate", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

def test_very_low_budget():
    """Test with extremely low budget (should fail)"""
    print("\n=== Test 2: Very Low Budget (₹200 for 2 days) ===")
    data = {
        "duration": 2,
        "budget": 200,
        "interests": ["trekking"],
        "start_location": "Rishikesh",
        "travel_style": "budget",
        "language": "hindi"
    }
    
    response = requests.post(f"{BASE_URL}/itinerary/generate", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

def test_minimum_budget():
    """Test with minimum required budget (should pass)"""
    print("\n=== Test 3: Minimum Budget (₹5700 for 3 days) ===")
    data = {
        "duration": 3,
        "budget": 5700,
        "interests": ["temples", "nature"],
        "start_location": "Dehradun",
        "travel_style": "budget",
        "language": "hindi"
    }
    
    response = requests.post(f"{BASE_URL}/itinerary/generate", json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result.get('success')}")
        if result.get('itinerary'):
            itinerary = result['itinerary']
            print(f"Duration: {itinerary.get('duration')} days")
            print(f"Budget: ₹{itinerary.get('budget')}")
            print(f"Total Estimated Cost: ₹{itinerary.get('total_estimated_cost', 'N/A')}")
    else:
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

def test_comfortable_budget():
    """Test with comfortable budget (should pass)"""
    print("\n=== Test 4: Comfortable Budget (₹15000 for 3 days) ===")
    data = {
        "duration": 3,
        "budget": 15000,
        "interests": ["temples", "trekking", "nature"],
        "start_location": "Dehradun",
        "travel_style": "moderate",
        "language": "hindi"
    }
    
    response = requests.post(f"{BASE_URL}/itinerary/generate", json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result.get('success')}")
        if result.get('itinerary'):
            itinerary = result['itinerary']
            print(f"Duration: {itinerary.get('duration')} days")
            print(f"Budget: ₹{itinerary.get('budget')}")
            print(f"Total Estimated Cost: ₹{itinerary.get('total_estimated_cost', 'N/A')}")
    else:
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    print("=" * 60)
    print("Budget Validation Test Suite")
    print("=" * 60)
    
    try:
        # Test cases
        test_low_budget()
        test_very_low_budget()
        test_minimum_budget()
        test_comfortable_budget()
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the server.")
        print("Please make sure the backend server is running on http://localhost:5000")
    except Exception as e:
        print(f"\nError: {str(e)}")

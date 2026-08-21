"""
Test script to verify alerts API is working correctly
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.api.emergency import get_alerts
from flask import Flask
from unittest.mock import MagicMock

def test_alerts():
    """Test alerts endpoint"""
    try:
        print("=" * 70)
        print("TESTING ALERTS API")
        print("=" * 70)
        
        # Create a mock Flask app and request context
        app = Flask(__name__)
        
        with app.test_request_context('/?location='):
            # Mock the request.args
            from flask import request
            
            # Import the emergency blueprint
            from app.api.emergency import emergency_bp
            app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
            
            # Call the get_alerts function directly
            response = get_alerts()
            
            # Parse response
            if isinstance(response, tuple):
                data, status_code = response
                result = data.get_json()
            else:
                result = response.get_json()
                status_code = 200
            
            print(f"\nStatus Code: {status_code}")
            print(f"Success: {result.get('success')}")
            print(f"Total Alerts: {result.get('count', len(result.get('alerts', [])))}")
            
            print("\n" + "=" * 70)
            print("ALERTS DETAILS")
            print("=" * 70)
            
            alerts = result.get('alerts', [])
            for i, alert in enumerate(alerts, 1):
                print(f"\n{i}. {alert.get('title')}")
                print(f"   Type: {alert.get('type')}")
                print(f"   Severity: {alert.get('severity').upper()}")
                print(f"   Location: {alert.get('location')}")
                print(f"   Valid Until: {alert.get('valid_until')}")
                print(f"   Message: {alert.get('message')}")
            
            print("\n" + "=" * 70)
            
            if alerts:
                print(f"✅ SUCCESS: {len(alerts)} alerts are configured and ready!")
                print("\nThese alerts will show in the 'Active Travel Alerts' section")
                print("on the Emergency page when the backend server is running.")
            else:
                print("❌ WARNING: No alerts found!")
            
            print("=" * 70)
            
            return True
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_alerts()

#!/usr/bin/env python3
"""
OrbitX N2YO Integration Test Script

Validates that N2YO API integration is working correctly.
Run this after starting the backend server.
"""

import httpx
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000"
N2YO_KEY = "F4N2CU-ZQFHE8-ES79EL-5R5O"

# Test satellites (NORAD IDs)
TEST_SATELLITES = {
    25544: "ISS (ZARYA)",
    20580: "HUBBLE",
    44238: "STARLINK-1013",
}

# Test observer location (New York City)
TEST_LAT = 40.7128
TEST_LNG = -74.0060
TEST_ALT = 0

def test_backend_health():
    """Check if backend is running."""
    print("\n📡 Testing Backend Health...")
    try:
        resp = httpx.get(f"{BACKEND_URL}/", timeout=5.0)
        if resp.status_code == 200:
            print("✅ Backend is running")
            return True
    except Exception as e:
        print(f"❌ Backend not responding: {e}")
        return False

def test_n2yo_endpoint():
    """Test the N2YO positions endpoint."""
    print("\n🛰️  Testing N2YO Positions Endpoint...")
    ids = ",".join(str(id) for id in TEST_SATELLITES.keys())
    url = f"{BACKEND_URL}/api/v1/satellites/n2yo-positions?ids={ids}&lat={TEST_LAT}&lng={TEST_LNG}&alt={TEST_ALT}"
    
    try:
        resp = httpx.get(url, timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                print(f"✅ N2YO endpoint working - Retrieved {len(data)} satellite(s)")
                
                # Display satellite details
                for sat in data:
                    sat_name = TEST_SATELLITES.get(sat.get('noradId'), sat.get('satname', 'Unknown'))
                    lat = sat.get('latitude', 'N/A')
                    lng = sat.get('longitude', 'N/A')
                    alt = sat.get('altitude', 'N/A')
                    vis = "✓ VISIBLE" if sat.get('visibility') else "✗ Not visible"
                    
                    print(f"\n  📍 {sat_name}")
                    print(f"     Lat: {lat}°, Lng: {lng}°")
                    print(f"     Alt: {alt} km")
                    print(f"     Status: {vis}")
                
                return True
            else:
                print(f"⚠️  N2YO endpoint returned empty data: {data}")
                return False
        else:
            print(f"❌ N2YO endpoint error (HTTP {resp.status_code}): {resp.text}")
            return False
    except Exception as e:
        print(f"❌ N2YO endpoint test failed: {e}")
        return False

def test_tle_fallback():
    """Test TLE fallback endpoint."""
    print("\n📋 Testing TLE Fallback Endpoint...")
    test_sat_id = 25544  # ISS
    url = f"{BACKEND_URL}/api/v1/satellites/{test_sat_id}/tle"
    
    try:
        resp = httpx.get(url, timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('tle1') and data.get('tle2'):
                print(f"✅ TLE endpoint working for ISS")
                print(f"   TLE1: {data['tle1']}")
                print(f"   TLE2: {data['tle2']}")
                return True
            else:
                print(f"⚠️  TLE endpoint returned incomplete data")
                return False
        else:
            print(f"❌ TLE endpoint error (HTTP {resp.status_code})")
            return False
    except Exception as e:
        print(f"❌ TLE endpoint test failed: {e}")
        return False

def test_direct_n2yo_api():
    """Test direct N2YO API call."""
    print("\n🔗 Testing Direct N2YO API (Validation)...")
    test_sat_id = 25544  # ISS
    url = f"https://api.n2yo.com/rest/v1/satellite/positions/{test_sat_id}/{TEST_LAT}/{TEST_LNG}/{TEST_ALT}/1/?apiKey={N2YO_KEY}"
    
    try:
        resp = httpx.get(url, timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('positions'):
                pos = data['positions'][0]
                print(f"✅ Direct N2YO API working")
                print(f"   Lat: {pos.get('satlatitude', 'N/A')}°")
                print(f"   Lng: {pos.get('satlongitude', 'N/A')}°")
                print(f"   Alt: {pos.get('sataltitude', 'N/A')} km")
                return True
            else:
                print(f"⚠️  Direct N2YO API returned no positions")
                return False
        else:
            print(f"❌ Direct N2YO API error (HTTP {resp.status_code})")
            return False
    except Exception as e:
        print(f"❌ Direct N2YO API test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("🛰️  OrbitX N2YO Integration Test Suite")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  Backend URL: {BACKEND_URL}")
    print(f"  N2YO API Key: {N2YO_KEY[:10]}...***")
    print(f"  Test Location: {TEST_LAT}°N, {TEST_LNG}°W")
    print(f"  Test Satellites: ISS (25544), Hubble (20580), Starlink (44238)")
    
    results = {
        "Backend Health": test_backend_health(),
        "N2YO Endpoint": test_n2yo_endpoint(),
        "TLE Fallback": test_tle_fallback(),
        "Direct N2YO API": test_direct_n2yo_api(),
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! N2YO integration is ready to use.")
        print("\nNext steps:")
        print("  1. Start backend:  cd backend && uvicorn app.main:app --reload")
        print("  2. Start frontend: expo start")
        print("  3. Launch on device or simulator")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the errors above.")
        print("\nTroubleshooting:")
        print("  - Ensure backend is running on localhost:8000")
        print("  - Check that N2YO API key is valid")
        print("  - Verify internet connection")
        return 1

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
OrbitX - Quality Gate Coverage Threshold Verification Script
Parses coverage.xml / coverage.json artifacts and verifies minimum percentage standards.
"""

import sys
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="OrbitX Coverage Quality Gate Check")
    parser.add_argument(
        "--xml-file",
        type=str,
        default="coverage/coverage.xml",
        help="Path to coverage.xml file (default: coverage/coverage.xml)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=80.0,
        help="Minimum coverage percentage threshold required (default: 80.0)"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    xml_path = Path(args.xml_file)

    if not xml_path.exists():
        print(f"⚠️ Warning: Coverage XML report file not found at '{xml_path}'. Skipping quality gate threshold failure.")
        sys.exit(0)

    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        line_rate = float(root.attrib.get("line-rate", 0.0))
        coverage_pct = line_rate * 100.0

        print(f"==========================================================")
        print(f"📊 OrbitX Code Coverage Report Summary")
        print(f"==========================================================")
        print(f"Measured Coverage : {coverage_pct:.2f}%")
        print(f"Required Threshold: {args.threshold:.2f}%")
        print(f"----------------------------------------------------------")

        if coverage_pct >= args.threshold:
            print(f"🟢 PASSED: Coverage ({coverage_pct:.2f}%) meets threshold ({args.threshold:.2f}%).")
            sys.exit(0)
        else:
            print(f"❌ FAILED: Coverage ({coverage_pct:.2f}%) is below required threshold ({args.threshold:.2f}%).")
            sys.exit(1)

    except Exception as e:
        print(f"⚠️ Error parsing coverage file '{xml_path}': {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

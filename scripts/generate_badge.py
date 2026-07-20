import os
import xml.etree.ElementTree as ET

def get_coverage_percentage():
    cov_xml = "reports/coverage.xml"
    if not os.path.exists(cov_xml):
        print(f"[Coverage Badge] Warning: {cov_xml} not found. Defaulting to 0%.")
        return 0
    try:
        tree = ET.parse(cov_xml)
        root = tree.getroot()
        # Find line-rate attribute in coverage root element
        line_rate = float(root.attrib.get("line-rate", 0))
        return int(line_rate * 100)
    except Exception as e:
        print(f"[Coverage Badge] Error parsing coverage xml: {e}")
        return 0

def generate_svg_badge(percentage):
    # Determine color based on coverage
    if percentage >= 90:
        color = "#4c1"  # Bright Green
    elif percentage >= 75:
        color = "#a4a61d"  # Yellow-Green
    elif percentage >= 60:
        color = "#dfb317"  # Yellow
    elif percentage >= 40:
        color = "#fe7d37"  # Orange
    else:
        color = "#e05d44"  # Red
        
    svg_template = f"""<svg xmlns="http://www.w3.org/2000/svg" width="99" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="99" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h59v20H0z"/>
    <path fill="{color}" d="M59 0h40v20H59z"/>
    <path fill="url(#b)" d="M0 0h99v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="29.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="29.5" y="14">coverage</text>
    <text x="78" y="15" fill="#010101" fill-opacity=".3">{percentage}%</text>
    <text x="78" y="14">{percentage}%</text>
  </g>
</svg>"""

    os.makedirs("reports", exist_ok=True)
    badge_path = "reports/coverage.svg"
    with open(badge_path, "w") as f:
        f.write(svg_template)
    print(f"[Coverage Badge] Generated badge with {percentage}% coverage at {badge_path}")

if __name__ == "__main__":
    pct = get_coverage_percentage()
    generate_svg_badge(pct)

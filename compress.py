import os
from PIL import Image

def compress_images():
    assets_dir = 'assets/images'
    files = ['satellite.png', 'earth.png', 'mars.png', 'iss.png', 'moon.png']
    
    for f in files:
        path = os.path.join(assets_dir, f)
        if os.path.exists(path):
            img = Image.open(path)
            # Resize image to max 250x250 keeping aspect ratio
            img.thumbnail((250, 250), Image.Resampling.LANCZOS)
            # Save as optimized PNG
            img.save(path, optimize=True, quality=75)
            size_kb = os.path.getsize(path) / 1024
            print(f"Compressed {f} -> {size_kb:.2f} KB")
        else:
            print(f"File not found: {f}")

if __name__ == '__main__':
    compress_images()

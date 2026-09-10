# Menger Sponge  

### Authors  
- Sahithi Mandalapu  
- Sophia Louie  

---

## Overview  

This project implements a fully interactive WebGL rendering of a procedurally generated Menger Sponge fractal (levels 1–4), along with FPS-style camera controls, diffuse shading, and an infinite checkerboard ground plane.

All required milestone features have been completed.

---

## Build Instructions  

From the project root directory, run:

```bash
python make-menger.py
```

This compiles the TypeScript source files in `src/` and generates the web package in `dist/`.

**Do not edit files inside `dist/`.**

---

## Running the Code  

From the project root directory:

```bash
http-server dist -c-1
```

Then open a browser and go to:

```
http://127.0.0.1:8080
```

The project runs correctly in Chrome and Firefox.

---

## Implemented Features  

### 1. Menger Sponge (Levels 1–4)

- Procedural recursive generation of the Menger sponge  
- Supports levels **L = 1 to 4**
- Press keys **1–4** to regenerate the sponge at different levels
- Sponge fills bounding box:
  - Min corner: (-0.5, -0.5, -0.5)  
  - Max corner: (0.5, 0.5, 0.5)
- Implemented triangle soup for flat shading
- Outward-facing normals computed per triangle
- Geometry is regenerated only when level changes (not every frame)

---

### 2. FPS Camera Controls

Initial camera configuration:
- `eye = (0, 0, d)`
- `look = (0, 0, -1)`
- `up = (0, 1, 0)`

Controls:

- **Left-click + drag mouse** → Rotate camera
- **W / S** → Move forward / backward
- **A / D** → Strafe left / right
- **Left / Right Arrow** → Roll camera
- **Up / Down Arrow** → Move vertically

The view matrix updates dynamically each frame.

---

### 3. Diffuse Cube Shading

- Implemented Phong diffuse lighting in fragment shader
- Faces colored based on world-space normal direction:
  - ±X → Red
  - ±Y → Green
  - ±Z → Blue
- Correct triangle winding ensures outward-facing normals
- Lighting intensity depends on angle relative to light direction

---

### 4. Infinite Ground Plane

- Separate VBOs and shader program from cube
- Plane located at **y = -2.0**
- Geometry represented using a minimal number of triangles
- Rendered independently from sponge

---

### 5. Checkerboard Ground Shading

- Checkerboard aligned to world-space X and Z axes
- Grid cell size: **5.0 × 5.0**
- Alternating black and white base colors
- Diffuse shading applied in fragment shader
- World-space position passed from vertex shader to fragment shader

---

## Technical Notes  

- VBOs are properly rebound and updated using `glBindBuffer` and `glBufferData`
- Geometry updates only when level changes
- No direct modifications were made to `dist/`
- Project builds cleanly using `make-menger.py`
- Runs without fatal errors in modern browsers

---

## Known Issues  

None. All required features are fully implemented and functioning correctly.

---

## Collaboration Report  

Estimated work contribution:

- Sahithi Mandalapu — 50%
- Sophia Louie — 50%

We pair-programmed for major components including Menger sponge generation and camera transformations. Shader implementation and debugging were divided, but all components were reviewed and tested together to ensure correctness and integration.

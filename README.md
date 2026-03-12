# Virtual Tour - R3F Slideshow

Welcome to the **College Virtual Tour**, a state-of-the-art cinematic experience built using **React Three Fiber (R3F)** and **Three.js**. This application transforms a series of high-resolution 2D static images into a seamless, video-like virtual tour with professional transitions and high-end aesthetics.

## What is it?

Unlike traditional 360-degree tours that require complex panoramic stitching, this project uses **standard 2D photography** to create a premium, directed experience. It is designed to feel like a high-end promotional video, featuring:

- **Cinematic Transitions**: Smooth, GPU-accelerated crossfades between scenes powered by custom GLSL.
- **Dynamic HUD**: A modern "video player" style interface for controlling playback, speed, and seeking.
- **Performance Optimized**: Built to handle dozens of high-resolution textures without crashing the browser using an intelligent windowing system.
- **Immersive Post-Processing**: Custom GLSL shaders for vignette effects, micro-contrast adjustments, and cinematic color grading.

---

## How it's Implemented

### 1. High-Performance Rendering (`SlideshowScene.jsx`)
The core of the application is a 3D scene where images are projected onto dynamic planes.
- **Custom Shaders**: We use a custom **GLSL Fragment Shader** to handle color correction and a dynamic vignette. This moves the heavy lifting to the GPU, ensuring 60fps performance even on mobile devices.
- **Z-Layering Logic**: To prevent "Z-fighting" (flickering when two planes overlap), the application dynamically adjusts the Z-depth of planes based on their current opacity.
- **Overscan Geometry**: Planes are sized at 115% of the viewport. This allows the scene to feel expansive and prevents edge-bleeding during transitions.

### 2. Intelligent Memory Management
Loading 40+ high-resolution images simultaneously would crash most browsers or cause significant lag.
- **Rolling Window Concept**: The engine only keeps a limited set of textures in GPU memory at any given time (the active slide, immediate previous, and immediate next).
- **Dynamic Garbage Collection**: As the tour progresses, old textures are automatically disposed of and new ones are preloaded in the background using React `Suspense`.
- **Preloading Phase**: A custom preloading hook in `App.jsx` ensures the first batch of images is fully loaded before the "Play" button is revealed, guaranteeing a smooth start.

### 3. Hybrid Architecture (Canvas + DOM)
The project utilizes a **hybrid rendering approach**:
- **Three.js Canvas**: Renders the "Virtual World" (images, transitions, shaders).
- **Standard DOM (React)**: Renders the "HUD" (Head-Up Display). This allows us to use CSS for complex UI animations and responsiveness while keeping the high-performance 3D logic separate.

---


## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### ⌨️ Controls
| Key | Action |
|-----|--------|
| **Space** | Play / Pause |
| **Arrow Right** | Next Scene |
| **Arrow Left** | Previous Scene |
| **R** | Restart Tour |
| **Scrubber** | Click/Drag the bottom bar to seek |

---

## Customizing the Tour

### Adding Your Own Photos
1. Place your images in `public/college/`.
2. Ensure they follow a consistent naming convention (e.g., `IMG_0001.jpg`).
3. Open `src/App.jsx` and update:
   - `TOTAL`: The number of images.
   - `IMAGE_URLS`: The string template that generates your file paths.

## Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Bridge**: [React Three Fiber](https://r3f.docs.pmnd.rs/)
- **Utilities**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Bundler**: [Vite](https://vitejs.dev/)

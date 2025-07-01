# autoDQ - Futuristic UI Components Guide

## Component Library

### Core Components

#### Neural Button
```css
.neural-button {
  background: linear-gradient(135deg, #0066ff, #00d4ff);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(0, 102, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.neural-button:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 
    0 5px 25px rgba(0, 102, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

#### Holographic Card
```css
.holo-card {
  background: linear-gradient(
    145deg,
    rgba(15, 15, 20, 0.9),
    rgba(26, 26, 36, 0.9)
  );
  border: 1px solid rgba(42, 42, 58, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.holo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  opacity: 0.6;
}
```

#### Neural Input Field
```css
.neural-input {
  background: rgba(26, 26, 36, 0.8);
  border: 1px solid rgba(42, 42, 58, 0.8);
  border-radius: 8px;
  color: #ccd6f6;
  transition: all 0.3s ease;
}

.neural-input:focus {
  border-color: #0066ff;
  box-shadow: 
    0 0 0 3px rgba(0, 102, 255, 0.1),
    0 0 20px rgba(0, 102, 255, 0.2);
  background: rgba(26, 26, 36, 1);
}

.neural-input::placeholder {
  color: #8892b0;
  opacity: 0.7;
}
```

#### Status Indicator
```css
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-passed {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
  animation: pulse-green 2s infinite;
}

.status-failed {
  background: rgba(255, 0, 85, 0.1);
  color: #ff0055;
  border: 1px solid rgba(255, 0, 85, 0.3);
  animation: pulse-red 1s infinite;
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.3); }
  50% { box-shadow: 0 0 15px rgba(0, 255, 136, 0.6); }
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 0, 85, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 0, 85, 0.6); }
}
```

#### Data Visualization
```css
.neural-chart {
  background: linear-gradient(
    180deg,
    rgba(15, 15, 20, 0.95),
    rgba(26, 26, 36, 0.95)
  );
  border: 1px solid rgba(42, 42, 58, 0.6);
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.neural-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 102, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.chart-line {
  stroke: url(#neuralGradient);
  stroke-width: 2;
  fill: none;
  filter: drop-shadow(0 0 3px rgba(0, 212, 255, 0.5));
}

.chart-point {
  fill: #00d4ff;
  stroke: #0066ff;
  stroke-width: 2;
  filter: drop-shadow(0 0 5px rgba(0, 212, 255, 0.8));
}
```

### Animation Patterns

#### Entrance Animations
```css
@keyframes neural-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes neural-slide-in {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 
      0 0 5px rgba(0, 102, 255, 0.2),
      0 0 10px rgba(0, 102, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 10px rgba(0, 102, 255, 0.4),
      0 0 20px rgba(0, 102, 255, 0.2);
  }
}
```

#### Loading States
```css
.neural-loading {
  position: relative;
  overflow: hidden;
}

.neural-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 212, 255, 0.2),
    transparent
  );
  animation: neural-shimmer 1.5s infinite;
}

@keyframes neural-shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

### Layout Patterns

#### Neural Grid
```css
.neural-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.neural-grid-item {
  background: rgba(15, 15, 20, 0.9);
  border: 1px solid rgba(42, 42, 58, 0.5);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.neural-grid-item:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 212, 255, 0.1);
}
```

#### Floating Navigation
```css
.neural-nav {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(15, 15, 20, 0.95);
  border: 1px solid rgba(42, 42, 58, 0.6);
  border-radius: 50px;
  padding: 8px 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.neural-nav-item {
  padding: 8px 16px;
  border-radius: 24px;
  color: #8892b0;
  transition: all 0.2s ease;
}

.neural-nav-item:hover,
.neural-nav-item.active {
  color: #ccd6f6;
  background: rgba(0, 102, 255, 0.1);
  box-shadow: inset 0 0 10px rgba(0, 102, 255, 0.2);
}
```

### Interactive Elements

#### Neural Toggle
```css
.neural-toggle {
  position: relative;
  width: 48px;
  height: 24px;
  background: rgba(42, 42, 58, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(42, 42, 58, 1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.neural-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #8892b0;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.neural-toggle.active {
  background: rgba(0, 102, 255, 0.2);
  border-color: #0066ff;
}

.neural-toggle.active::before {
  left: 26px;
  background: #0066ff;
  box-shadow: 
    0 2px 8px rgba(0, 102, 255, 0.4),
    0 0 10px rgba(0, 102, 255, 0.3);
}
```

#### Progress Indicator
```css
.neural-progress {
  position: relative;
  height: 4px;
  background: rgba(42, 42, 58, 0.8);
  border-radius: 2px;
  overflow: hidden;
}

.neural-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0066ff, #00d4ff);
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;
}

.neural-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: neural-progress-shimmer 2s infinite;
}

@keyframes neural-progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Typography Scale

```css
:root {
  --neural-font-display: 'Orbitron', monospace;
  --neural-font-body: 'Inter', system-ui;
  --neural-font-mono: 'JetBrains Mono', monospace;
}

.neural-heading-xl {
  font-family: var(--neural-font-display);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(135deg, #ccd6f6, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.neural-heading-lg {
  font-family: var(--neural-font-body);
  font-size: 2rem;
  font-weight: 600;
  color: #ccd6f6;
  text-shadow: 0 0 10px rgba(204, 214, 246, 0.2);
}

.neural-text {
  font-family: var(--neural-font-body);
  font-size: 1rem;
  color: #8892b0;
  line-height: 1.6;
}

.neural-code {
  font-family: var(--neural-font-mono);
  font-size: 0.875rem;
  color: #00d4ff;
  background: rgba(26, 26, 36, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(42, 42, 58, 0.6);
}
```

This component library provides the building blocks for creating a cohesive, futuristic interface while maintaining simplicity and usability. Each component is designed to work together harmoniously while providing clear visual hierarchy and intuitive interactions.

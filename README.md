# SecondLife - E-Waste Repurposing & Hardware Project Matcher

**SecondLife** is an open-source e-waste repurposing platform that turns discarded electronic hardware, broken appliances, and junk-drawer components into functional DIY maker projects. By analyzing what loose parts or scrap devices you own, SecondLife scores 20 predefined reuse projects, highlights what's missing, calculates substitution paths, and tracks real-world toxic waste and CO₂ diversion.

---

## 🌟 Key Features

1. **Junk Drawer Inventory Log & Camera Scanner**:
   - **Live Camera Component Scanner**: Integrated browser `navigator.mediaDevices.getUserMedia` API to identify scrap parts by taking a photo directly in the browser. Features targeting reticle HUD, front/rear camera switcher, shutter capture via HTML5 Canvas, and photo upload fallback.
   - Catalog of 50+ common components across Microcontrollers, Sensors, Displays, Power modules, Motors, and Passives.
   - Quantity tracking and state classification: `Working`, `Untested`, or `Faulty`.
   - Faulty parts are filtered out of feasibility logic; untested parts trigger safety & continuity warnings.
   - Safety hazard categorization (`Battery Hazard`, `Mains AC Hazard`, `High Capacitance`, `Low-Voltage Safe`).

2. **Virtual Teardown Mode**:
   - 1-click harvesting of salvageable components from 6 common scrap appliances:
     - **Old Laptop** (extracts 9 parts: blower fan, 18650 cells, speakers, power brick, USB cord, buttons, caps, resistors, vibration motor)
     - **Old Smartphone** (screen assembly, vibration motor, speaker, charger, USB cable, tactile buttons)
     - **Broken USB Keyboard** (matrix controller, cord, switches, LEDs, resistors)
     - **Old Wi-Fi Router** (5V adapter, LED pack, filter caps, reset buttons, resistors)
     - **Dead Desktop PC (SMPS)** (fan, high-voltage caps, power resistors, speaker, switches)
     - **Discarded CD/DVD Drive** (optical laser sled, DC spindle motor, stepper motor, switches)
   - Safety warnings highlighting lithium puncture risks, SMPS charge retention, and optical hazards.

3. **Interactive Hardware Simulator & Sensory Audio Workbench**:
   - Web Audio API synthesizer generates authentic audio feedback for continuity beepers (1.8 kHz), proximity parking radars (proportional frequency beeps), electromechanical relay clicks, and variable-RPM fan hums.
   - Real-time simulations for projects:
     - **Automatic Night Lamp**: Lux slider, LDR voltage divider calculation, and glowing LED response.
     - **Ultrasonic Parking Assistant**: Distance radar with dynamic beep tempo and alert zones.
     - **Contactless Smart Dustbin**: Hand-wave trigger, 9g micro-servo 90° sweep, and auto-close timer.
     - **18650 DIY Power Bank**: Cell SoC voltage, boost conversion efficiency (~91%), and load runtime math.
     - **Laptop Fan Desk Cooler**: Rotary potentiometer throttle with spinning turbine animation.

4. **Digital Multimeter (DMM-6000) Diagnostic Lab**:
   - Inspect and verify "Untested" salvaged components before soldering into projects.
   - Modes: DC Voltage ($V_\equiv$), Resistance ($\Omega$), Continuity ($(((o)))$ with audible tone), and Diode Forward Drop ($\blacktriangleright|$).
   - "Verify & Mark as Working" updates inventory in real time and immediately unlocks new projects.

5. **Salvager's Knowledge Toolbox & Code Decipherer**:
   - Interactive 4-band/5-band resistor color-code calculator with visual resistor stripes and 1-click "Add to Inventory".
   - SMD & IC chip database (AMS1117-3.3, NE555, TP4056, L298N, LM358, ATmega328P).
   - 3-digit capacitor EIA code converter (e.g. 104 $\to$ 100 nF / 0.1 $\mu$F).

6. **Complete Arduino Firmware & BOM Generator**:
   - Every project includes fully functional, syntax-highlighted Arduino C++ source code with a 1-click "Download .ino" and "Copy Code" feature.
   - Microcontroller pinout connection tables.
   - 1-click Bill of Materials (BOM) text export.

7. **Peer Swap Board & Circular Drop-off Hubs**:
   - Peer-to-peer component trade board with "Matches for You" intelligence.
   - Verified campus repair cafes, makerspace scrap bins, and certified hazardous lithium recyclers.

8. **Environmental Impact & LCA Dashboard**:
   - Live telemetry: Kilograms of e-waste diverted, discrete components reused, projects built, and estimated CO₂e emissions avoided.
   - Recharts visual analytics: Bar chart of diverted weight per project and Pie chart of components salvaged by category.
   - 1-click "Share My Impact" text generator for social & lab reports.

---

## 🧮 Feasibility Scoring Formula

For each requirement $i$ of a project:
$$w_i = \begin{cases} 3 & \text{if component is critical} \\ 1 & \text{if component is optional} \end{cases}$$

$$\text{coverage}_i = \min\left(1, \frac{\text{have\_exact}_i}{\text{need}_i}\right)$$

If $\text{coverage}_i < 1$, the engine checks valid substitutions from `substitutes.json`:
$$\text{subCoverage} = \text{factor} \times \min\left(1, \frac{\text{have\_exact}_i + \text{have\_sub}_i}{\text{need}_i}\right)$$
$$\text{coverage}_i = \max(\text{coverage}_i, \text{subCoverage})$$

$$\text{rawScore} = 100 \times \frac{\sum (w_i \times \text{coverage}_i)}{\sum w_i}$$

$$\text{score} = \begin{cases} \min(\text{round}(\text{rawScore}), 40) & \text{if any critical requirement has } \text{coverage} = 0 \\ \text{round}(\text{rawScore}) & \text{otherwise} \end{cases}$$

A project is marked **Buildable Now (100%)** only when score is 100 and 0 critical components are missing.

---

## 🌍 Environmental Assumptions & Limitations

- **Avoidance Factor**: Estimated at **0.5 kg CO₂e per 0.1 kg (5.0 kg CO₂e / kg)** of electronic equipment kept in service, based on life-cycle assessment (LCA) data from the EPA WARM model and Global E-Waste Monitor. This accounts for avoided ore mining (copper, gold, rare-earths), silicon wafer fabrication energy, and hazardous incinerator emissions.
- **Component Weights**: Modeled on standard manufacturer specifications (e.g. Arduino Uno ~25g, 18650 cell ~45g, Laptop fan ~35g).
- **Limitations**: All metrics are approximations. Component wear and health must be verified by makers with a multimeter before high-drain testing.

---

## 🚀 Setup & Local Execution

```bash
# 1. Clone or extract the repository
git clone <repo-url>
cd secondlife

# 2. Install dependencies
npm install

# 3. Run unit tests (Vitest)
npm test

# 4. Start local development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🧪 Unit Tests

The matching engine is validated by comprehensive unit tests (`src/engine/matchEngine.test.js`) covering:
- Exact 100% component matches and build enablement.
- Partial quantity coverage calculation.
- Substitute matching and partial credit attribution.
- Score ceiling cap (≤ 40%) when critical requirements are missing.
- Strict exclusion of faulty components.
- Detection and alerting for untested components.
- Multi-factor sorting and ranking order.

Run them anytime with:
```bash
npm test
```

---

## 🔭 Future Scope

1. **Cloud Backend & Verified Hubs**: Multi-campus user authentication with lab verification badges and shared maker inventory pools.
2. **Authorized E-Waste Recycler API Partnerships**: Automated routing for genuinely unusable/faulty parts to certified regional e-waste recyclers (PCB smelting & lithium reclamation).
3. **Computer Vision Part Recognition**: Webcam-based automatic component and IC identification from part markings and resistor color code bands.

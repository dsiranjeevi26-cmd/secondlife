# 🎬 SecondLife — 3-Minute Demo Script

Follow this step-by-step walkthrough to present the core functionality of SecondLife to evaluators or audience members.

---

### Minute 0:00 – 0:30 | The Problem & The Empty Drawer
1. **Navigate to Home (`/`)**:
   - Notice the hero: *"Tell us what's in your junk drawer. We'll tell you what it can become."*
   - Scroll down to the **Live Repurposing Impact** section showing 0 kg diverted initially.
2. **Go to Inventory (`/inventory`)**:
   - If there are demo parts, click **"Clear All"** to show the **Empty State**.
   - Click the prominent **"Scan Component"** button with the camera icon:
     - Allow browser camera access via `navigator.mediaDevices.getUserMedia`.
     - Align a loose board in the targeting reticle or click **Capture & Identify** (or pick a sample snapshot like Arduino Uno or HC-SR04).
     - Notice the classified match confidence (e.g. 96%), pinout reason, and 1-click **"Add to Inventory"**!
   - Point out that millions of old laptops, phones, and chargers sit forgotten in drawers because people don't know what parts can be harvested.

---

### Minute 0:30 – 1:15 | Virtual Teardown Mode
1. **Explore the Teardown Card**:
   - Under *Virtual Teardown Mode*, select **"Old Laptop"**.
   - Show how it lists **9 salvageable parts**: 5V Blower Fan, 4× 18650 Li-ion cells, 8-Ohm Speakers, Laptop Power Supply, USB Cable, Push Buttons, Resistors, Capacitors, and Vibration Motor.
   - Point out the **Safety Warnings** (Li-ion battery puncture and residual capacitor discharge).
2. **Execute 1-Click Salvage**:
   - Click **"Add 9 Selected to Inventory"**.
   - Notice the toast confirmation and how the inventory table immediately populates with 9 items (~0.62 kg of stored components).
   - Point out the safety hazard badges (`Battery Hazard`, `High Capacitance`, `Low-Voltage Safe`).

---

### Minute 1:15 – 2:00 | Real-Time Feasibility, Simulation & Substitution
1. **Navigate to Suggestions (`/suggestions`)**:
   - Show that projects have automatically re-ranked based on the newly harvested parts!
   - Highlight that projects requiring laptop fans or 18650 cells have moved up.
2. **Inspect a ~70% Project with Substitution**:
   - Click on **"Contactless Smart Dustbin"** or **"Laptop Blower Desk Cooler"**.
   - In **"Contactless Smart Dustbin"**:
     - Point out the **Feasibility Score Ring (~78%)**.
     - Open the **Circuit Simulator & Workbench** tab:
       - Click **"Wave Hand Near Sensor"**! Watch the 9g micro-servo sweep 90° open, listen to the electromechanical relay click sound, and watch the 4-second auto-close countdown!
     - Open the **Hardware Wiring & Pinout** tab to show exact breadboard connections (D9 to Servo, D6 to Trig, D5 to Echo).
     - Open the **Arduino / C++ Firmware Code** tab: Click **"Copy Code"** or **"Download .ino"** to flash straight to a real Arduino!
     - Notice the **Substitute Match** banner: *Arduino Uno works as a drop-in code substitute for Nano* (70% credit).

---

### Minute 2:00 – 2:30 | Hardware Diagnostic Lab & Multimeter
1. **Navigate to Lab Tools (`/lab`)**:
   - Switch the DMM Rotary Dial to **Continuity (🔊)** and **DC Voltage (V⎓)**.
   - Select an **"Untested"** 18650 cell or switch from your salvaged laptop.
   - Listen to the Web Audio 1.8 kHz continuity beep and view the 3.88V reading on the digital multimeter!
   - Click **"Verify & Mark as Working"** — watch how this immediately updates the inventory status and increases your feasibility scores across the entire project catalog!
   - Switch to **"Decipherer & Resistors"**: adjust color bands to calculate resistance and click **"Add to Inventory"**.

---

### Minute 2:30 – 3:00 | "I Built This", Impact Dashboard & Drop-off Hubs
1. **Complete a 100% Ready Project**:
   - From Suggestions, find **"Automatic Night Lamp"** or **"Ultrasonic Parking Assistant"** (which show the green **"Ready to Build!"** ribbon).
   - Click to open the project detail page.
   - Review the step-by-step assembly instructions.
   - Click the **"I built this!"** button.
   - Watch the celebratory green confetti explosion and the success notification!
   - Note: The consumed components are deducted from your inventory, preventing double-counting.

---

### Minute 2:30 – 3:00 | Impact Dashboard & Peer Swap Board
1. **Open Impact Dashboard (`/impact`)**:
   - Show the live updated figures:
     - E-Waste Diverted (e.g. 0.12 kg)
     - Parts Reused (chips, sensors, and passives)
     - CO₂e Avoided estimate (~0.6 kg CO₂e)
   - View the **Bar Chart** showing weight diverted by this build.
   - View the **Pie Chart** showing reused components by category.
   - Click **"Share My Impact"** to show instant clipboard copy.
2. **Open Swap Board (`/swap`)**:
   - Show the **"Matches For You"** banner at the top, linking what you need with what community peers are offering.
   - Switch between **"Offering Parts"** and **"Looking For Parts"**.
   - Click **"Create Swap Post"** to showcase how a maker can offer extra sensors to classmates.

---

**Summary:** Discarded scrap device ➔ 1-click teardown ➔ instant feasibility matching & substitution ➔ physical build ➔ tangible environmental impact!

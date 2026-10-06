/**
 * projectCodeData.js
 * Source code sketches, pinout wire mappings, and simulator definitions for all 20 projects.
 */

export const PROJECT_DETAILS_EXTENDED = {
  'auto-night-lamp': {
    pinout: [
      { pin: 'A0', connectsTo: 'LDR + 10kΩ Resistor Divider Junction', type: 'Analog Input' },
      { pin: 'D13', connectsTo: 'LED Anode (+) via 220Ω Resistor', type: 'Digital Output' },
      { pin: '5V', connectsTo: 'LDR Leg 1 & Breadboard Power Rail', type: 'Power (5V)' },
      { pin: 'GND', connectsTo: '10kΩ Resistor & LED Cathode (-)', type: 'Ground' },
    ],
    simulatorType: 'night-lamp',
    code: `/*
 * Project: Automatic Night Lamp
 * Board: Arduino Uno / Nano
 * Description: Reads analog ambient light via LDR voltage divider
 *              and switches on an LED when darkness is detected.
 */

const int LDR_PIN = A0;      // Analog input from voltage divider
const int LED_PIN = 13;      // Output to indicator LED
const int THRESHOLD = 500;   // Dark threshold (tune for your room)

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("SecondLife Night Lamp Initialized");
}

void loop() {
  int ldrValue = analogRead(LDR_PIN);
  Serial.print("Ambient Light ADC: ");
  Serial.println(ldrValue);

  // When room turns dark, LDR resistance rises -> ADC value drops
  if (ldrValue < THRESHOLD) {
    digitalWrite(LED_PIN, HIGH);  // Turn ON lamp
  } else {
    digitalWrite(LED_PIN, LOW);   // Turn OFF lamp
  }

  delay(200);
}`
  },

  'ultrasonic-parking-sensor': {
    pinout: [
      { pin: 'D9', connectsTo: 'HC-SR04 Trig Pin', type: 'Digital Output' },
      { pin: 'D10', connectsTo: 'HC-SR04 Echo Pin', type: 'Digital Input' },
      { pin: 'D8', connectsTo: 'Active Piezo Buzzer (+)', type: 'PWM Output' },
      { pin: '5V', connectsTo: 'HC-SR04 VCC', type: 'Power (5V)' },
      { pin: 'GND', connectsTo: 'HC-SR04 GND & Buzzer (-)', type: 'Ground' },
    ],
    simulatorType: 'parking-sensor',
    code: `/*
 * Project: Ultrasonic Parking Assistant
 * Board: Arduino Uno / Nano
 * Description: Measures echo distance and beeps buzzer proportionally.
 */

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int BUZZER_PIN = 8;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // Trigger 10us ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  int distanceCm = duration * 0.034 / 2;

  if (distanceCm > 0 && distanceCm < 150) {
    Serial.print("Distance: ");
    Serial.print(distanceCm);
    Serial.println(" cm");

    // Beep faster as vehicle gets closer
    int beepDelay = map(constrain(distanceCm, 10, 100), 10, 100, 50, 600);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);
    delay(beepDelay);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}`
  },

  'smart-dustbin': {
    pinout: [
      { pin: 'D6', connectsTo: 'HC-SR04 Trig Pin', type: 'Digital Output' },
      { pin: 'D5', connectsTo: 'HC-SR04 Echo Pin', type: 'Digital Input' },
      { pin: 'D9', connectsTo: 'SG90 Micro Servo PWM Signal (Orange)', type: 'PWM Output' },
      { pin: '5V', connectsTo: 'Sensor VCC & Servo VCC (Red)', type: 'Power (5V)' },
      { pin: 'GND', connectsTo: 'Common Ground (Black/Brown)', type: 'Ground' },
    ],
    simulatorType: 'smart-dustbin',
    code: `/*
 * Project: Contactless Smart Dustbin
 * Board: Arduino Nano / Uno
 * Description: Uses ultrasonic hand proximity to swing open bin lid via micro servo.
 */

#include <Servo.h>

const int TRIG_PIN = 6;
const int ECHO_PIN = 5;
const int SERVO_PIN = 9;
Servo lidServo;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  lidServo.attach(SERVO_PIN);
  lidServo.write(0); // Lid closed
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  int distance = duration * 0.034 / 2;

  // Open lid if hand is detected within 20cm
  if (distance > 2 && distance < 20) {
    Serial.println("Hand detected! Opening lid...");
    lidServo.write(90); // Swing lid open
    delay(4000);        // Hold open for 4 seconds
    lidServo.write(0);  // Close lid smoothly
    delay(1000);
  }

  delay(100);
}`
  },

  'powerbank-18650': {
    pinout: [
      { pin: 'B+', connectsTo: '18650 Cell Positive (+) Terminal', type: 'Lithium In' },
      { pin: 'B-', connectsTo: '18650 Cell Negative (-) Terminal', type: 'Lithium Return' },
      { pin: 'OUT+', connectsTo: 'MT3608 Boost Converter VIN+', type: '3.7V - 4.2V Rail' },
      { pin: 'OUT-', connectsTo: 'MT3608 Boost Converter VIN-', type: 'Ground Rail' },
      { pin: 'VOUT+', connectsTo: 'Female USB-A Port Pin 1 (+5V DC)', type: 'Regulated Output' },
      { pin: 'VOUT-', connectsTo: 'Female USB-A Port Pin 4 (GND)', type: 'Output Ground' },
    ],
    simulatorType: 'powerbank',
    code: `/*
 * Hardware Schematics & Verification Notes:
 * Project: Salvaged 18650 Modular Power Bank
 * Components: 18650 Li-ion Cell + TP4056 + MT3608 Step-Up
 * 
 * Tuning Guide:
 * 1. Solder 18650 cell to B+ / B- pads on TP4056 module.
 * 2. Connect TP4056 OUT+ / OUT- to MT3608 VIN+ / VIN-.
 * 3. BEFORE connecting phone, power module and turn MT3608 trimpot
 *    counter-clockwise until DMM reads strictly 5.10V across VOUT+ / VOUT-.
 * 4. Solder 100uF low-ESR smoothing capacitor across USB output pins.
 */`
  },

  'laptop-fan-desk-cooler': {
    pinout: [
      { pin: 'VCC (+5V)', connectsTo: 'Recycled USB Cable Red Wire (+5V DC)', type: 'Power' },
      { pin: 'GND', connectsTo: 'Recycled USB Cable Black Wire (GND)', type: 'Ground' },
      { pin: 'Pot Wiper', connectsTo: 'Radial Fan In-line Voltage / PWM control', type: 'Speed Control' },
      { pin: 'Capacitor', connectsTo: '100uF across 5V and GND rail for kickback filter', type: 'Passive' },
    ],
    simulatorType: 'laptop-fan',
    code: `/*
 * Hardware Schematics:
 * Project: Laptop Blower Desk Cooler
 * 
 * Wire Lead Colors on Standard Laptop Blower:
 * - Red: +5V DC
 * - Black: Ground
 * - Yellow: RPM Tachometer (optional sensor feedback)
 * - Blue: PWM Speed Control
 * 
 * Assembly:
 * Connect Red to USB +5V through 10k rotary potentiometer.
 * Connect Black to USB GND.
 * Connect 100uF 16V electrolytic capacitor across 5V & GND to prevent
 * inductive voltage spike into PC USB ports.
 */`
  },

  'soil-moisture-alert': {
    pinout: [
      { pin: 'A0', connectsTo: 'Capacitive Soil Moisture Probe Signal', type: 'Analog Input' },
      { pin: 'D8', connectsTo: 'Piezo Buzzer (+) via 220Ω Resistor', type: 'Digital Output' },
      { pin: 'D12', connectsTo: 'Red Warning LED Anode', type: 'Digital Output' },
      { pin: '5V', connectsTo: 'Sensor VCC', type: 'Power (5V)' },
      { pin: 'GND', connectsTo: 'Sensor GND & Buzzer (-)', type: 'Ground' },
    ],
    simulatorType: 'soil-moisture',
    code: `/*
 * Project: Smart Plant Moisture Sentinel
 * Board: Arduino Nano
 */
const int MOISTURE_PIN = A0;
const int BUZZER_PIN = 8;
const int DRY_THRESHOLD = 650; // Higher reading = dry soil

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int moisture = analogRead(MOISTURE_PIN);
  Serial.print("Soil Moisture Value: ");
  Serial.println(moisture);

  if (moisture > DRY_THRESHOLD) {
    // Soil is parched: trigger chirp alert
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);
  }

  delay(2000);
}`
  },

  'weather-station-lcd': {
    pinout: [
      { pin: 'A4 (SDA)', connectsTo: '16x2 LCD I2C Backpack SDA', type: 'I2C Data' },
      { pin: 'A5 (SCL)', connectsTo: '16x2 LCD I2C Backpack SCL', type: 'I2C Clock' },
      { pin: 'D4', connectsTo: 'DHT11 Data Pin (with 10k pull-up to 5V)', type: 'Digital I/O' },
      { pin: '5V', connectsTo: 'LCD VCC & DHT11 VCC', type: 'Power (5V)' },
      { pin: 'GND', connectsTo: 'Common Ground Rail', type: 'Ground' },
    ],
    simulatorType: 'generic',
    code: `/*
 * Project: Mini Weather Station & Hygrometer
 * Required Libraries: LiquidCrystal_I2C, DHT sensor library
 */
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  dht.begin();
  lcd.setCursor(0, 0);
  lcd.print("SecondLife Station");
  delay(1500);
  lcd.clear();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    lcd.setCursor(0, 0);
    lcd.print("Sensor Read Fail");
    return;
  }

  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(t, 1);
  lcd.print((char)223);
  lcd.print("C");

  lcd.setCursor(0, 1);
  lcd.print("Humidity: ");
  lcd.print(h, 0);
  lcd.print("%");

  delay(2000);
}`
  },

  'esp8266-wifi-smart-switch': {
    pinout: [
      { pin: 'D1 (GPIO 5)', connectsTo: '5V Relay Module IN Pin', type: 'Digital Output' },
      { pin: 'VIN (5V)', connectsTo: 'Recycled Phone Charger 5V Rail', type: 'Power' },
      { pin: 'GND', connectsTo: 'Relay Module GND & Phone Charger GND', type: 'Ground' },
      { pin: 'Relay COM & NO', connectsTo: 'Appliance Load Switch Terminals', type: 'Mains Switch' },
    ],
    simulatorType: 'generic',
    code: `/*
 * Project: ESP8266 IoT Web Smart Switch
 * Board: NodeMCU ESP8266
 */
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

ESP8266WebServer server(80);
const int RELAY_PIN = D1;
bool relayState = false;

void handleRoot() {
  String html = "<html><body style='font-family:sans-serif;text-align:center;padding:50px;'>";
  html += "<h2>SecondLife Smart Switch</h2>";
  html += "<p>Relay Status: <b>" + String(relayState ? "ON" : "OFF") + "</b></p>";
  html += "<a href='/toggle'><button style='padding:15px 30px;font-size:18px;'>TOGGLE POWER</button></a>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleToggle() {
  relayState = !relayState;
  digitalWrite(RELAY_PIN, relayState ? HIGH : LOW);
  server.sendHeader("Location", "/");
  server.send(303);
}

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  Serial.begin(115000);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nIP Address: " + WiFi.localIP().toString());
  server.on("/", handleRoot);
  server.on("/toggle", handleToggle);
  server.begin();
}

void loop() {
  server.handleClient();
}`
  },

  'rfid-door-lock': {
    pinout: [
      { pin: 'D10', connectsTo: 'RC522 SDA (SS)', type: 'SPI Chip Select' },
      { pin: 'D13', connectsTo: 'RC522 SCK', type: 'SPI Clock' },
      { pin: 'D11', connectsTo: 'RC522 MOSI', type: 'SPI MOSI' },
      { pin: 'D12', connectsTo: 'RC522 MISO', type: 'SPI MISO' },
      { pin: 'D9', connectsTo: 'RC522 RST', type: 'Reset' },
      { pin: 'D3', connectsTo: 'SG90 Micro Servo PWM Signal', type: 'PWM Output' },
      { pin: '3.3V', connectsTo: 'RC522 3.3V (DO NOT CONNECT 5V)', type: 'Power (3.3V)' },
    ],
    simulatorType: 'generic',
    code: `/*
 * Project: RFID Contactless Door Access Lock
 * IMPORTANT: Power RC522 reader ONLY with 3.3V!
 */
#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

#define SS_PIN 10
#define RST_PIN 9
#define SERVO_PIN 3

MFRC522 rfid(SS_PIN, RST_PIN);
Servo lockServo;

// Authorized Tag UID (replace with your scanned card UID)
byte authorizedUID[4] = {0xDE, 0xAD, 0xBE, 0xEF};

void setup() {
  SPI.begin();
  rfid.PCD_Init();
  lockServo.attach(SERVO_PIN);
  lockServo.write(0); // Locked position
  Serial.begin(9600);
  Serial.println("Scan RFID tag to unlock...");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  bool match = true;
  for (byte i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] != authorizedUID[i]) match = false;
  }

  if (match) {
    Serial.println("ACCESS GRANTED! Unlocking door...");
    lockServo.write(90);
    delay(5000);
    lockServo.write(0);
  } else {
    Serial.println("ACCESS DENIED.");
  }
  rfid.PICC_HaltA();
}`
  }
};

/**
 * Fallback code and pinout generator for projects without dedicated overrides
 */
export function getProjectHardwareData(project) {
  if (PROJECT_DETAILS_EXTENDED[project.id]) {
    return PROJECT_DETAILS_EXTENDED[project.id];
  }

  // Generate generic pinout from project requirements
  const pinout = project.requirements.map((req, idx) => ({
    pin: idx < 2 ? `D${idx + 2}` : `A${idx - 2}`,
    connectsTo: req.componentId,
    type: req.critical ? 'Critical Logic' : 'Auxiliary / Power',
  }));

  const code = `/*
 * Project: ${project.title}
 * Difficulty: ${project.difficulty}
 * Generated by SecondLife Hardware Workbench
 */

void setup() {
  Serial.begin(9600);
  Serial.println("${project.title} Initialized");
  // Initialize GPIO and sensor buses
}

void loop() {
  // Main control loop
  delay(100);
}`;

  return {
    pinout,
    simulatorType: 'generic',
    code,
  };
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Gauge,
  Activity,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { playBuzzerTone, playRelayClick, setMotorSound } from '../utils/audioSynth.js';

export default function InteractiveWorkbench({ project }) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Night Lamp state
  const [ambientLux, setAmbientLux] = useState(250); // 0 to 1000

  // Parking Sensor state
  const [distanceCm, setDistanceCm] = useState(65); // 5 to 150

  // Smart Dustbin state
  const [dustbinState, setDustbinState] = useState({ isOpen: false, countdown: 0, angle: 0 });

  // Power Bank state
  const [cellVoltage, setCellVoltage] = useState(3.85); // 3.0V to 4.2V
  const [loadCurrentA, setLoadCurrentA] = useState(1.0); // 0.5A to 2.1A

  // Laptop Fan state
  const [fanSpeedPercent, setFanSpeedPercent] = useState(40); // 0 to 100

  // Interval timer ref for parking sensor sound
  const beepTimerRef = useRef(null);

  // --- Parking Sensor Beep Loop ---
  useEffect(() => {
    if (project.id !== 'ultrasonic-parking-sensor' || !soundEnabled) {
      if (beepTimerRef.current) clearInterval(beepTimerRef.current);
      return;
    }

    if (distanceCm > 120) {
      if (beepTimerRef.current) clearInterval(beepTimerRef.current);
      return;
    }

    // Interval proportional to distance
    const intervalMs = Math.max(70, distanceCm * 8);

    if (beepTimerRef.current) clearInterval(beepTimerRef.current);
    beepTimerRef.current = setInterval(() => {
      const freq = distanceCm < 20 ? 1600 : distanceCm < 50 ? 1200 : 800;
      playBuzzerTone(freq, 40);
    }, intervalMs);

    return () => {
      if (beepTimerRef.current) clearInterval(beepTimerRef.current);
    };
  }, [project.id, distanceCm, soundEnabled]);

  // --- Laptop Fan Audio Sync ---
  useEffect(() => {
    if (project.id === 'laptop-fan-desk-cooler' && soundEnabled) {
      const rpm = (fanSpeedPercent / 100) * 3600;
      setMotorSound(rpm, 3600);
    } else {
      setMotorSound(0);
    }
    return () => setMotorSound(0);
  }, [project.id, fanSpeedPercent, soundEnabled]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (beepTimerRef.current) clearInterval(beepTimerRef.current);
      setMotorSound(0);
    };
  }, []);

  // --- Smart Dustbin Wave Action ---
  const handleWaveHand = () => {
    if (dustbinState.isOpen) return;

    if (soundEnabled) playRelayClick(true);
    setDustbinState({ isOpen: true, countdown: 4, angle: 90 });

    const interval = setInterval(() => {
      setDustbinState((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(interval);
          if (soundEnabled) playRelayClick(false);
          return { isOpen: false, countdown: 0, angle: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  // Determine which specialized workbench to display
  const simType = project.id;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Simulator Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Interactive Hardware Simulator</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live Simulation
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Test pinout voltages, signals, and sensor thresholds in real-time
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            soundEnabled
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle synthesized Web Audio feedback"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>Audio: {soundEnabled ? 'ON' : 'MUTED'}</span>
        </button>
      </div>

      {/* 1. Automatic Night Lamp Workbench */}
      {simType === 'auto-night-lamp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Control Slider */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Ambient Light Intensity:</span>
                <span className="font-bold text-amber-400">{ambientLux} Lux</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                value={ambientLux}
                onChange={(e) => setAmbientLux(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>🌑 Pitch Dark (&lt;100 Lux)</span>
                <span>Twilight (300 Lux)</span>
                <span>☀️ Bright Sunlight</span>
              </div>

              {/* Live Voltage Divider Math */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">Voltage Divider Output:</div>
                <div className="text-emerald-400">
                  LDR Resistance: ~{Math.round(500000 / (ambientLux + 1))} Ω
                </div>
                <div className="text-slate-300">
                  Analog Pin A0 Voltage:{' '}
                  <strong>{((ambientLux / 1000) * 4.8 + 0.1).toFixed(2)}V</strong> (ADC:{' '}
                  {Math.round((ambientLux / 1000) * 1023)})
                </div>
                <div className="text-slate-400">
                  Threshold: 500 ADC (2.44V) • State:{' '}
                  <span
                    className={
                      ambientLux < 500
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-500 font-bold'
                    }
                  >
                    {ambientLux < 500 ? 'ACTIVE (Night)' : 'STANDBY (Daylight)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Circuit Graphic with glowing LED */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  ambientLux < 500
                    ? 'bg-amber-400/20 shadow-[0_0_50px_rgba(251,191,36,0.6)] border-4 border-amber-400'
                    : 'bg-slate-800 border-2 border-slate-700 opacity-40'
                }`}
              >
                <Zap
                  className={`w-12 h-12 transition-colors ${
                    ambientLux < 500 ? 'text-amber-400 animate-pulse' : 'text-slate-600'
                  }`}
                />
              </div>

              <div className="mt-3 font-bold text-sm">
                Lamp Status:{' '}
                <span
                  className={
                    ambientLux < 500 ? 'text-amber-400' : 'text-slate-500'
                  }
                >
                  {ambientLux < 500 ? 'ILLUMINATING (5V ON)' : 'OFF (0V)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {ambientLux < 500
                  ? 'Light level below cut-off. High output sent to Pin 13.'
                  : 'Sufficient ambient light detected. Circuit in idle low power.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Ultrasonic Parking Sensor Workbench */}
      {simType === 'ultrasonic-parking-sensor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Distance Slider */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Target Obstacle Distance:</span>
                <span
                  className={`font-bold font-mono text-base ${
                    distanceCm < 30
                      ? 'text-rose-400'
                      : distanceCm < 70
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {distanceCm} cm
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={distanceCm}
                onChange={(e) => setDistanceCm(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="text-rose-400">CRITICAL (&lt;30cm)</span>
                <span className="text-amber-400">WARNING (30-80cm)</span>
                <span className="text-emerald-400">CLEAR (&gt;80cm)</span>
              </div>

              {/* Telemetry info */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">HC-SR04 Radar Telemetry:</div>
                <div className="text-slate-300">
                  Echo Transit Time: ~{Math.round(distanceCm * 58.8)} µs
                </div>
                <div className="text-slate-300">
                  Buzzer Pulse Interval:{' '}
                  {distanceCm > 120 ? 'Silent (Out of range)' : `${distanceCm * 8} ms`}
                </div>
              </div>
            </div>

            {/* Visual Radar Gauge */}
            <div className="md:col-span-6 p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden mb-2">
                {/* Arc display */}
                <div
                  className={`w-40 h-40 rounded-full border-8 border-dashed transition-colors duration-300 ${
                    distanceCm < 30
                      ? 'border-rose-500 animate-ping opacity-80'
                      : distanceCm < 70
                      ? 'border-amber-400'
                      : 'border-emerald-500'
                  }`}
                />
              </div>

              <div
                className={`font-black text-xl tracking-tight ${
                  distanceCm < 30
                    ? 'text-rose-400 animate-bounce'
                    : distanceCm < 70
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {distanceCm < 30 ? '🛑 STOP IMMEDIATELY' : distanceCm < 70 ? '⚠️ APPROACHING' : '✅ SAFE PATH'}
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                {soundEnabled ? 'Synthesized buzzer beeping proportionally.' : 'Audio muted.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Contactless Smart Dustbin Workbench */}
      {simType === 'smart-dustbin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Click the button below to simulate bringing your hand within 15 cm of the ultrasonic
                sensor. Watch the 9g micro-servo swing open the lid, hold for 4 seconds, and close.
              </p>

              <button
                type="button"
                onClick={handleWaveHand}
                disabled={dustbinState.isOpen}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {dustbinState.isOpen
                    ? `Lid Open! Closing in ${dustbinState.countdown}s...`
                    : 'Wave Hand Near Sensor'}
                </span>
              </button>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">Servo PWM Signal (Pin D9):</div>
                <div className="text-emerald-400">
                  Target Angle: {dustbinState.angle}° ({dustbinState.isOpen ? '1.5ms pulse' : '1.0ms pulse'})
                </div>
                <div className="text-slate-300">
                  Sensor State: {dustbinState.isOpen ? 'Proximity Triggered (<15cm)' : 'Scanning...'}
                </div>
              </div>
            </div>

            {/* SVG Bin Graphic */}
            <div className="md:col-span-6 p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="relative w-36 h-36 flex flex-col items-center justify-end">
                {/* Hinged Lid */}
                <div
                  className="w-24 h-4 bg-emerald-500 rounded-t-md origin-bottom-left transition-transform duration-500 ease-out shadow-md"
                  style={{
                    transform: `rotate(-${dustbinState.angle}deg)`,
                  }}
                />
                {/* Bin Body */}
                <div className="w-24 h-24 bg-slate-800 border-2 border-emerald-600 rounded-b-xl flex items-center justify-center shadow-inner">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    SecondLife
                  </span>
                </div>
              </div>

              <div className="mt-2 font-bold text-sm text-slate-200">
                Lid Position: {dustbinState.isOpen ? 'OPEN (90°)' : 'CLOSED (0°)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 18650 DIY Power Bank Workbench */}
      {simType === 'powerbank-18650' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">18650 Cell Voltage:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {cellVoltage.toFixed(2)} V DC
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="4.2"
                step="0.05"
                value={cellVoltage}
                onChange={(e) => setCellVoltage(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>3.0V (Cut-off)</span>
                <span>3.7V (Nominal)</span>
                <span>4.2V (Full Charge)</span>
              </div>

              <div className="flex justify-between text-xs font-medium pt-2">
                <span className="text-slate-400">Output Load Draw:</span>
                <span className="font-bold text-teal-400 font-mono">{loadCurrentA.toFixed(1)} A</span>
              </div>
              <div className="flex gap-2">
                {[0.5, 1.0, 2.1].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setLoadCurrentA(curr)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      loadCurrentA === curr
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {curr === 0.5 ? '500mA (IoT)' : curr === 1.0 ? '1.0A (Phone)' : '2.1A (Fast)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Converter Output Telemetry */}
            <div className="md:col-span-6 p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Regulated USB Output:</span>
                <span className="font-bold text-emerald-400 text-sm">5.10 V</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Delivered Power:</span>
                <span className="font-bold text-white">{(5.1 * loadCurrentA).toFixed(2)} W</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MT3608 Boost Efficiency:</span>
                <span className="text-teal-400">~91.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Battery Discharge Current:</span>
                <span className="text-amber-400">
                  {((5.1 * loadCurrentA) / (cellVoltage * 0.915)).toFixed(2)} A
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Est. Runtime (2× 2200mAh):</span>
                <span className="text-slate-200 font-bold">
                  {((4.4 * cellVoltage * 0.915) / (5.1 * loadCurrentA)).toFixed(1)} Hours
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Laptop Fan Desk Cooler Workbench */}
      {simType === 'laptop-fan-desk-cooler' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Potentiometer Throttle:</span>
                <span className="font-bold text-emerald-400">{fanSpeedPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fanSpeedPercent}
                onChange={(e) => setFanSpeedPercent(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Halt)</span>
                <span>50% (Silent Breeze)</span>
                <span>100% (Turbo 3600 RPM)</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">Radial Blower Metrics:</div>
                <div className="text-emerald-400">
                  Current RPM: ~{Math.round((fanSpeedPercent / 100) * 3600)} RPM
                </div>
                <div className="text-slate-300">
                  Airflow Rate: {((fanSpeedPercent / 100) * 8.5).toFixed(1)} CFM
                </div>
                <div className="text-slate-300">
                  USB 5V Current: {Math.round((fanSpeedPercent / 100) * 380)} mA
                </div>
              </div>
            </div>

            {/* Animated Spinning Turbine */}
            <div className="md:col-span-6 p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div
                className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center relative shadow-lg"
                style={{
                  animation: fanSpeedPercent > 0 ? `spin ${Math.max(0.08, 1.2 - (fanSpeedPercent / 100))}s linear infinite` : 'none',
                }}
              >
                {/* Fan Blades */}
                <div className="w-20 h-2 bg-emerald-400 rounded-full" />
                <div className="w-20 h-2 bg-emerald-400 rounded-full transform rotate-45 absolute" />
                <div className="w-20 h-2 bg-emerald-400 rounded-full transform rotate-90 absolute" />
                <div className="w-20 h-2 bg-emerald-400 rounded-full transform rotate-135 absolute" />
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-500 absolute" />
              </div>

              <div className="mt-3 font-bold text-sm text-slate-200">
                Blower State: {fanSpeedPercent === 0 ? 'STOPPED' : `${Math.round((fanSpeedPercent / 100) * 3600)} RPM ACTIVE`}
              </div>
              <span className="text-[11px] text-slate-400">
                {soundEnabled ? 'Synthesizing dynamic airflow hum.' : 'Audio muted.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Generic Interactive Signal Generator for other projects */}
      {['auto-night-lamp', 'ultrasonic-parking-sensor', 'smart-dustbin', 'powerbank-18650', 'laptop-fan-desk-cooler'].indexOf(simType) === -1 && (
        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Gauge className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-white">
            Digital Logic & GPIO Monitor Active
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All pin definitions and I/O lines are mapped according to the hardware schematics table below.
            Follow the wiring table to connect your hardware cleanly on a breadboard.
          </p>
        </div>
      )}
    </div>
  );
}

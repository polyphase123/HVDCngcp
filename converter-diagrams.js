/**
 * converter-diagrams.js - Interactive Converter Station Schematics (LCC vs VSC-MMC)
 */

class ConverterDiagrams {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentTech = 'vsc'; // 'vsc' or 'lcc'
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  setTechnology(tech) {
    this.currentTech = tech;
    this.render();
    this.attachEvents();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <!-- Tech Toggle Buttons -->
        <div class="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 class="text-base font-bold text-slate-900">HVDC Converter Station Single-Line Architecture</h3>
            <p class="text-xs text-slate-500">Explore interactive components of LCC (Leyte–Luzon) and VSC-MMC (MVIP) converter designs</p>
          </div>

          <div class="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button id="btn-show-vsc" class="px-3 py-1.5 rounded-md transition-all ${this.currentTech === 'vsc' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              VSC-MMC (MVIP ±350 kV)
            </button>
            <button id="btn-show-lcc" class="px-3 py-1.5 rounded-md transition-all ${this.currentTech === 'lcc' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              Classic LCC (Leyte–Luzon ±350 kV)
            </button>
          </div>
        </div>

        <!-- Diagram & Interactive Inspector Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <!-- SVG Schematic (2 Cols) -->
          <div class="lg:col-span-2 bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[380px]">
            ${this.currentTech === 'vsc' ? this.renderVscSvg() : this.renderLccSvg()}
            <p class="text-[11px] text-slate-400 mt-2 text-center">Click on any labeled block above to view deep technical specs & operating physics</p>
          </div>

          <!-- Component Details Panel (1 Col) -->
          <div class="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div id="component-detail-content">
              <div class="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <i data-lucide="info" class="w-4 h-4 text-blue-600"></i>
                <span>Component Specification</span>
              </div>
              <h4 id="detail-title" class="text-sm font-bold text-slate-800">
                ${this.currentTech === 'vsc' ? 'Modular Multilevel Converter (MMC)' : '12-Pulse Thyristor Valve Bridge'}
              </h4>
              <p id="detail-desc" class="text-xs text-slate-600 mt-2 leading-relaxed">
                ${this.currentTech === 'vsc' 
                  ? 'The MVIP uses state-of-the-art MMC technology with IGBT semiconductors. Hundreds of submodules per phase arm create a pristine sinusoidal AC waveform without bulky AC harmonic filters. Supports independent P and Q control and Black-Start.' 
                  : 'The Leyte–Luzon link utilizes Classic Line-Commutated Converter (LCC) technology with water-cooled thyristor valves. Requires strong AC grid voltage for natural commutation and consumes large reactive power (approx. 50-60% of active MW).'}
              </p>
              
              <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-400">Semiconductor:</span>
                  <span id="detail-semi" class="font-semibold text-slate-700">${this.currentTech === 'vsc' ? 'IGBTs (Insulated Gate Bipolar Transistors)' : 'High-Power Thyristors (SCR)'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Commutation:</span>
                  <span id="detail-comm" class="font-semibold text-slate-700">${this.currentTech === 'vsc' ? 'Self-Commutating (PWM / Nearest Level)' : 'Line-Commutated (Requires AC Grid Voltage)'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Reactive Power:</span>
                  <span id="detail-var" class="font-semibold text-teal-700">${this.currentTech === 'vsc' ? 'Independent ±Q Control (STATCOM capability)' : 'Absorbs 50-60% Q (Requires Cap Banks)'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Black Start:</span>
                  <span id="detail-blackstart" class="font-semibold text-emerald-700">${this.currentTech === 'vsc' ? 'Supported (Can energize dead grid)' : 'Not Supported (Needs strong AC source)'}</span>
                </div>
              </div>
            </div>

            <!-- Technology Comparison Card Footer -->
            <div class="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span class="font-bold text-slate-800">Deployment in Philippines:</span>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${this.currentTech === 'vsc' ? 'VMIP / MVIP (Dumanjug, Cebu & Lala, Lanao del Norte) – First VSC-HVDC in Southeast Asia.' : 'Leyte–Luzon HVDC (Naga, Bicol & Ormoc, Leyte) – Commissioned 1998, 440 MW rating.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderVscSvg() {
    return `
      <svg viewBox="0 0 540 220" class="w-full h-auto select-none">
        <!-- AC Grid -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('ac-grid-vsc')">
          <circle cx="40" cy="110" r="22" fill="#f0fdfa" stroke="#0d9488" stroke-width="2" />
          <path d="M 30 110 Q 35 100 40 110 T 50 110" fill="none" stroke="#0d9488" stroke-width="2" />
          <text x="40" y="145" font-size="9" font-weight="bold" fill="#0f766e" text-anchor="middle">230kV AC Grid</text>
        </g>

        <!-- AC Line -->
        <line x1="62" y1="110" x2="100" y2="110" stroke="#0d9488" stroke-width="2.5" />

        <!-- AC Circuit Breaker -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('ac-cb')">
          <rect x="100" y="98" width="24" height="24" rx="3" fill="#ffffff" stroke="#0d9488" stroke-width="2" />
          <line x1="104" y1="118" x2="120" y2="102" stroke="#0d9488" stroke-width="2" />
          <text x="112" y="135" font-size="8" fill="#475569" text-anchor="middle">AC CB</text>
        </g>

        <line x1="124" y1="110" x2="155" y2="110" stroke="#0d9488" stroke-width="2.5" />

        <!-- Converter Transformer -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('conv-xfmr-vsc')">
          <circle cx="170" cy="110" r="15" fill="none" stroke="#0d9488" stroke-width="2" />
          <circle cx="188" cy="110" r="15" fill="none" stroke="#0d9488" stroke-width="2" />
          <text x="179" y="140" font-size="8" font-weight="bold" fill="#0f766e" text-anchor="middle">Converter Xfmr</text>
        </g>

        <line x1="203" y1="110" x2="230" y2="110" stroke="#0d9488" stroke-width="2.5" />

        <!-- Phase Reactors -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('phase-reactor')">
          <path d="M 230 110 Q 235 98 240 110 T 250 110 T 260 110" fill="none" stroke="#0d9488" stroke-width="2.5" />
          <text x="245" y="135" font-size="8" fill="#475569" text-anchor="middle">Phase Reactor</text>
        </g>

        <line x1="260" y1="110" x2="285" y2="110" stroke="#0d9488" stroke-width="2.5" />

        <!-- VSC MMC Converter Block -->
        <g class="schematic-block active-block" onclick="window.convDiagrams.showDetail('vsc-mmc')">
          <rect x="285" y="60" width="100" height="100" rx="8" fill="#f0fdfa" stroke="#0d9488" stroke-width="2.5" />
          <rect x="300" y="75" width="28" height="20" rx="2" fill="#0d9488" />
          <text x="314" y="88" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">IGBT</text>
          <rect x="340" y="75" width="28" height="20" rx="2" fill="#0d9488" />
          <text x="354" y="88" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">IGBT</text>
          <rect x="320" y="115" width="30" height="22" rx="2" fill="#0f766e" />
          <text x="335" y="129" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">Cap C</text>
          <text x="335" y="175" font-size="9" font-weight="bold" fill="#0f766e" text-anchor="middle">MMC VSC Valve</text>
        </g>

        <!-- DC Positive Pole (+350 kV) -->
        <line x1="385" y1="85" x2="445" y2="85" stroke="#2563eb" stroke-width="3" />
        <!-- DC Negative Pole (-350 kV) -->
        <line x1="385" y1="135" x2="445" y2="135" stroke="#2563eb" stroke-width="3" />

        <!-- High-Speed DC CB / Filters -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('dc-switchgear')">
          <rect x="445" y="75" width="20" height="20" rx="2" fill="#ffffff" stroke="#2563eb" stroke-width="1.5" />
          <rect x="445" y="125" width="20" height="20" rx="2" fill="#ffffff" stroke="#2563eb" stroke-width="1.5" />
          <text x="455" y="160" font-size="8" fill="#1e40af" text-anchor="middle">DC Breakers</text>
        </g>

        <line x1="465" y1="85" x2="520" y2="85" stroke="#2563eb" stroke-width="3.5" stroke-dasharray="4 2" />
        <line x1="465" y1="135" x2="520" y2="135" stroke="#2563eb" stroke-width="3.5" stroke-dasharray="4 2" />

        <text x="525" y="88" font-size="8" font-weight="bold" fill="#1e40af">+350 kV DC</text>
        <text x="525" y="138" font-size="8" font-weight="bold" fill="#1e40af">-350 kV DC</text>
      </svg>
    `;
  }

  renderLccSvg() {
    return `
      <svg viewBox="0 0 540 220" class="w-full h-auto select-none">
        <!-- AC Grid -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('ac-grid-lcc')">
          <circle cx="35" cy="110" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
          <path d="M 27 110 Q 31 102 35 110 T 43 110" fill="none" stroke="#2563eb" stroke-width="2" />
          <text x="35" y="142" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">230kV AC Grid</text>
        </g>

        <line x1="55" y1="110" x2="90" y2="110" stroke="#2563eb" stroke-width="2" />

        <!-- AC Harmonic Filters & Cap Banks (Massive requirement for LCC) -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('ac-filters')">
          <line x1="90" y1="110" x2="90" y2="50" stroke="#2563eb" stroke-width="2" />
          <rect x="75" y="30" width="30" height="20" fill="#fffbeb" stroke="#d97706" stroke-width="1.5" rx="2" />
          <text x="90" y="43" font-size="7" font-weight="bold" fill="#d97706" text-anchor="middle">AC Filter</text>
          <text x="90" y="22" font-size="7.5" fill="#d97706" text-anchor="middle">11th/13th/HP</text>
        </g>

        <line x1="90" y1="110" x2="145" y2="110" stroke="#2563eb" stroke-width="2" />

        <!-- Converter Transformer (Star-Star & Star-Delta for 12-pulse) -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('conv-xfmr-lcc')">
          <circle cx="160" cy="95" r="14" fill="none" stroke="#2563eb" stroke-width="1.8" />
          <circle cx="178" cy="95" r="14" fill="none" stroke="#2563eb" stroke-width="1.8" />
          <circle cx="160" cy="125" r="14" fill="none" stroke="#2563eb" stroke-width="1.8" />
          <circle cx="178" cy="125" r="14" fill="none" stroke="#2563eb" stroke-width="1.8" />
          <text x="169" y="155" font-size="8" font-weight="bold" fill="#1e40af" text-anchor="middle">12-Pulse Xfmr (Y-Y/Y-Δ)</text>
        </g>

        <line x1="192" y1="95" x2="230" y2="95" stroke="#2563eb" stroke-width="2" />
        <line x1="192" y1="125" x2="230" y2="125" stroke="#2563eb" stroke-width="2" />

        <!-- 12-Pulse Thyristor Valve Bridge -->
        <g class="schematic-block active-block" onclick="window.convDiagrams.showDetail('lcc-thyristor')">
          <rect x="230" y="65" width="90" height="90" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5" />
          <polygon points="250,90 265,90 257.5,78" fill="#2563eb" />
          <polygon points="280,90 295,90 287.5,78" fill="#2563eb" />
          <polygon points="250,135 265,135 257.5,123" fill="#2563eb" />
          <polygon points="280,135 295,135 287.5,123" fill="#2563eb" />
          <text x="275" y="168" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">Thyristor Bridge</text>
        </g>

        <!-- DC Smoothing Reactor -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('smoothing-reactor')">
          <path d="M 320 85 Q 328 70 336 85 T 352 85" fill="none" stroke="#2563eb" stroke-width="3" />
          <text x="336" y="65" font-size="7.5" font-weight="bold" fill="#1e40af" text-anchor="middle">Smoothing Reactor</text>
        </g>

        <line x1="352" y1="85" x2="430" y2="85" stroke="#2563eb" stroke-width="3" />

        <!-- Sea/Ground Electrode Bed (For Monopolar metallic/ground return) -->
        <g class="schematic-block" onclick="window.convDiagrams.showDetail('electrode-ground')">
          <line x1="320" y1="135" x2="370" y2="135" stroke="#64748b" stroke-width="2" />
          <line x1="370" y1="135" x2="370" y2="175" stroke="#64748b" stroke-width="2" />
          <line x1="355" y1="175" x2="385" y2="175" stroke="#64748b" stroke-width="3" />
          <line x1="360" y1="180" x2="380" y2="180" stroke="#64748b" stroke-width="2" />
          <line x1="365" y1="185" x2="375" y2="185" stroke="#64748b" stroke-width="1.5" />
          <text x="415" y="180" font-size="7.5" fill="#475569">Sea Electrode</text>
        </g>

        <!-- DC Pole Line -->
        <line x1="430" y1="85" x2="520" y2="85" stroke="#2563eb" stroke-width="3.5" stroke-dasharray="4 2" />
        <text x="525" y="88" font-size="8.5" font-weight="bold" fill="#1e40af">+350 kV DC Line</text>
      </svg>
    `;
  }

  showDetail(componentKey) {
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-desc');
    const semi = document.getElementById('detail-semi');
    const comm = document.getElementById('detail-comm');
    const varEl = document.getElementById('detail-var');
    const blackstart = document.getElementById('detail-blackstart');

    const details = {
      'vsc-mmc': {
        title: 'Modular Multilevel Converter (MMC)',
        desc: 'Constructed with hundreds of cascaded submodules per arm. Approximates a pure voltage sine wave with sub-microsecond precision, eliminating bulky AC filters.',
        semi: 'IGBTs (Insulated Gate Bipolar Transistors)',
        comm: 'Self-Commutating (PWM / Nearest Level)',
        var: 'Independent ±Q Control (STATCOM Mode)',
        blackstart: 'Supported (Can energize blacked-out island)'
      },
      'lcc-thyristor': {
        title: '12-Pulse Thyristor Valve Bridge',
        desc: 'Uses high-power line-commutated thyristors triggered by firing pulses. Reverses power flow by flipping voltage polarity rather than current direction.',
        semi: 'High-Power Thyristors (SCRs)',
        comm: 'Line-Commutated (Needs AC voltage to turn off)',
        var: 'Absorbs 50-60% Q (Requires massive cap banks)',
        blackstart: 'Not Supported (Needs external AC grid voltage)'
      },
      'phase-reactor': {
        title: 'VSC Phase Reactor',
        desc: 'Provides AC current smoothing and decouples the converter voltage from the AC grid, allowing instantaneous control of active and reactive power.',
        semi: 'Passive Inductive Reactor',
        comm: 'N/A',
        var: 'Controls Q injection via delta V',
        blackstart: 'N/A'
      },
      'ac-filters': {
        title: 'LCC AC Harmonic Filter Yard',
        desc: 'LCC 12-pulse bridges generate large 11th, 13th, 23rd, and 25th harmonic currents. Large filter banks filter out harmonics and supply reactive power.',
        semi: 'Tuned R-L-C Filter Banks',
        comm: 'Passive Filtering',
        var: 'Supplies required capacitive MVAR',
        blackstart: 'N/A'
      },
      'smoothing-reactor': {
        title: 'DC Smoothing Reactor',
        desc: 'Installed on the DC pole to reduce DC current ripple, prevent discontinuous current at light load, and limit transient fault currents.',
        semi: 'Large Air-Core / Iron-Core Reactor',
        comm: 'N/A',
        var: 'N/A',
        blackstart: 'N/A'
      },
      'electrode-ground': {
        title: 'Sea & Ground Electrode System',
        desc: 'Allows the Leyte–Luzon link to operate in Monopolar mode with ground or sea return during single-pole maintenance, retaining 50% power transfer.',
        semi: 'Subsea / Underground Graphite & Magnetite Electrodes',
        comm: 'DC Ground Return',
        var: 'N/A',
        blackstart: 'N/A'
      },
      'conv-xfmr-vsc': {
        title: 'VSC Converter Transformer',
        desc: 'Steps down grid 230kV AC voltage and provides galvanic isolation. Requires less harmonic rating compared to LCC transformers.',
        semi: 'Step-Down Power Transformer',
        comm: 'Standard AC',
        var: 'N/A',
        blackstart: 'N/A'
      },
      'conv-xfmr-lcc': {
        title: '12-Pulse LCC Converter Transformers',
        desc: 'Dual transformer setup (Star-Star and Star-Delta) providing a 30-degree phase shift to eliminate 5th and 7th harmonics before conversion.',
        semi: 'Specially Shielded DC-Biased Transformer',
        comm: 'Phase-Shifted (30° displacement)',
        var: 'N/A',
        blackstart: 'N/A'
      }
    };

    const d = details[componentKey] || details['vsc-mmc'];
    if (title) title.innerText = d.title;
    if (desc) desc.innerText = d.desc;
    if (semi) semi.innerText = d.semi;
    if (comm) comm.innerText = d.comm;
    if (varEl) varEl.innerText = d.var;
    if (blackstart) blackstart.innerText = d.blackstart;
  }

  attachEvents() {
    const btnVsc = document.getElementById('btn-show-vsc');
    const btnLcc = document.getElementById('btn-show-lcc');

    if (btnVsc) {
      btnVsc.addEventListener('click', () => this.setTechnology('vsc'));
    }
    if (btnLcc) {
      btnLcc.addEventListener('click', () => this.setTechnology('lcc'));
    }
  }
}

window.ConverterDiagrams = ConverterDiagrams;

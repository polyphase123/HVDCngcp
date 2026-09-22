/**
 * hvdc-map.js - Leaflet.js Mapping adopted from tbi.html
 * 
 * Features:
 * - Esri World Topo Map / ArcGIS tiles (fast, high-resolution topography, bathymetry, and zero lag)
 * - ResizeObserver & multi-frame invalidateSize() to prevent cut/cropped map rendering
 * - CircleMarker visualization with grid-based colors (Luzon Blue, Visayas Green, Mindanao Orange)
 * - Leaflet bottomright Legend control
 * - Dual-mode non-engineer popups & interactive node inspection modal
 * - Interactive HVDC (As Built) and HVAC (What-If) transmission corridors
 */

class PhilippineGridMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.mode = 'hvdc'; // 'hvdc' or 'what-if-hvac'
    this.popupMode = 'simple'; // 'simple' (non-engineer) or 'technical'
    this.map = null;
    this.legend = null;
    
    this.layers = {
      tileLayer: null,
      markerLayer: null,
      hvdcLines: null,
      hvacLines: null,
      submarineCables: null,
      platforms: null
    };

    // Grid Colors matching tbi.html standard
    this.gridColors = {
      Luzon: '#3b82f6',
      Visayas: '#10b981',
      Mindanao: '#f97316'
    };

    this.powerFlow = {
      luzonVisayas: 380, // MW (Visayas -> Luzon)
      visayasMindanao: 250, // MW (Visayas -> Mindanao)
    };

    // Real Geographic Coordinates of Philippine Grid Interconnection Nodes
    this.nodes = {
      manila: {
        id: 'manila',
        name: 'Metro Manila (National Load Center)',
        island: 'Luzon',
        grid: 'Luzon',
        coords: [14.5995, 120.9842],
        type: 'load',
        voltage: '230 kV AC',
        demandMW: 6200,
        simpleDesc: 'The largest electricity-consuming hub in the Philippines. It consumes heavy industrial power and imports clean geothermal energy from the Visayas via the Leyte-Luzon HVDC link.',
        techDesc: 'Major 230 kV / 500 kV AC transmission load center. Interfaces with San Jose and Tayabas substations.'
      },
      tayabas: {
        id: 'tayabas',
        name: 'Tayabas 500 kV Substation',
        island: 'Luzon',
        grid: 'Luzon',
        coords: [13.9314, 121.5939],
        type: 'ac-substation',
        voltage: '500 kV AC',
        simpleDesc: 'A major electrical superhighway interchange in southern Luzon, stepping up electricity to 500,000 Volts so power reaches Metro Manila with minimal losses.',
        techDesc: '500 kV Extra High Voltage (EHV) bulk transmission substation. Main hub connecting southern power plants to Manila.'
      },
      naga: {
        id: 'naga',
        name: 'Naga HVDC Converter Station (Luzon)',
        island: 'Luzon',
        grid: 'Luzon',
        coords: [13.6218, 123.1948],
        type: 'hvdc-converter',
        tech: 'Classic LCC (Line-Commutated Converter)',
        voltage: '±350 kV DC / 230 kV AC',
        rating: '440 MW Nominal',
        status: 'Active (Bipolar / Monopolar)',
        simpleDesc: '⚡ <strong>The Northern Power Translator:</strong> Converts Direct Current (DC) electricity coming from Leyte’s submarine cables into Alternating Current (AC) used in our everyday household sockets.',
        techDesc: '12-pulse thyristor converter station with AC harmonic filter yard (11th/13th harmonics), smoothing reactors, and DC switchyard.'
      },
      matnog: {
        id: 'matnog',
        name: 'Matnog Cable Sealing End (Sorsogon)',
        island: 'Luzon',
        grid: 'Luzon',
        coords: [12.5833, 124.0833],
        type: 'cable-terminal',
        voltage: '±350 kV DC',
        simpleDesc: '📍 <strong>Luzon Underwater Portal:</strong> The exact point at the southern tip of Luzon where overhead power towers transition into heavy underwater submarine cables.',
        techDesc: 'Cable transition station with surge arresters, fiber-optic DTS thermal monitoring, and cable sealing ends.'
      },
      cabacungan: {
        id: 'cabacungan',
        name: 'Cabacungan Cable Terminal (Samar)',
        island: 'Visayas',
        grid: 'Visayas',
        coords: [12.5500, 124.3000],
        type: 'cable-terminal',
        voltage: '±350 kV DC',
        simpleDesc: '📍 <strong>Samar Underwater Portal:</strong> Where the 21-kilometer subsea cable from Luzon safely emerges onto the island of Samar.',
        techDesc: 'Submarine cable landing station with lightning protection, sheath voltage limiters, and disconnectors.'
      },
      ormoc: {
        id: 'ormoc',
        name: 'Ormoc HVDC Converter Station (Leyte)',
        island: 'Visayas',
        grid: 'Visayas',
        coords: [11.0833, 124.6167],
        type: 'hvdc-converter',
        tech: 'Classic LCC (Line-Commutated Converter)',
        voltage: '±350 kV DC / 230 kV AC',
        rating: '440 MW Nominal',
        status: 'Active',
        simpleDesc: '⚡ <strong>The Geothermal Gateway:</strong> Located beside Leyte\'s giant volcanic geothermal plants. It converts geothermal energy into DC so it can be blasted 450 km into Manila without vanishing in transit.',
        techDesc: 'LCC Converter Station adjacent to Tongonan. Equipped with synchronous condensers, sea electrode connection, and harmonic filtering.'
      },
      tongonan: {
        id: 'tongonan',
        name: 'Tongonan Geothermal Power Complex',
        island: 'Visayas',
        grid: 'Visayas',
        coords: [11.1350, 124.6500],
        type: 'generator',
        fuel: 'Clean Volcanic Steam',
        genMW: 710,
        voltage: '138 kV AC',
        simpleDesc: '🌋 <strong>Clean Volcanic Energy:</strong> Massive power plants harnessing underground steam from Leyte volcanoes to produce 100% clean, renewable power 24/7.',
        techDesc: 'One of the world\'s premier geothermal steam fields (~710 MW capacity) providing baseload green energy.'
      },
      cebu: {
        id: 'cebu',
        name: 'Cebu City Regional Hub',
        island: 'Visayas',
        grid: 'Visayas',
        coords: [10.3157, 123.8854],
        type: 'load',
        voltage: '138 / 230 kV AC',
        demandMW: 1250,
        simpleDesc: '🏙️ <strong>Central Visayas Economic Center:</strong> Cebu\'s commercial hub is protected from blackouts by receiving power from both Leyte (East) and Mindanao (South).',
        techDesc: 'Main 230 kV / 138 kV regional sub-grid hub with submarine interconnectors to Leyte and Negros.'
      },
      dumanjug: {
        id: 'dumanjug',
        name: 'Dumanjug VSC Converter Station (Cebu)',
        island: 'Visayas',
        grid: 'Visayas',
        coords: [10.0500, 123.4333],
        type: 'hvdc-converter',
        tech: 'VSC-MMC (Voltage Source Converter)',
        voltage: '±350 kV DC / 230 kV AC',
        rating: '450 MW (Expandable to 900 MW)',
        status: 'Commercial Operation (MVIP)',
        simpleDesc: '🌟 <strong>Next-Gen Smart Translator:</strong> Built with advanced electronic transistors (IGBTs) that can restart a completely blacked-out grid and stabilize island voltage in milliseconds.',
        techDesc: 'Modular Multilevel Converter (MMC) VSC station with decoupled active/reactive control and full Black-Start capability.'
      },
      santander: {
        id: 'santander',
        name: 'Santander Cable Terminal (Southern Cebu)',
        island: 'Visayas',
        grid: 'Visayas',
        coords: [9.4200, 123.3400],
        type: 'cable-terminal',
        voltage: '±350 kV DC',
        simpleDesc: '📍 <strong>Cebu Deep-Sea Portal:</strong> The southern tip of Cebu where the 92-kilometer submarine cable enters the deep Bohol Sea heading for Mindanao.',
        techDesc: 'Submarine cable transition station with continuous fiber-optic Distributed Temperature Sensing (DTS).'
      },
      dapitan: {
        id: 'dapitan',
        name: 'Dapitan Cable Terminal (Zamboanga del Norte)',
        island: 'Mindanao',
        grid: 'Mindanao',
        coords: [8.6500, 123.4200],
        type: 'cable-terminal',
        voltage: '±350 kV DC',
        simpleDesc: '📍 <strong>Mindanao Deep-Sea Portal:</strong> Where the 92 km underwater cable from Cebu arrives onto Mindanao soil at Dapitan City.',
        techDesc: 'Subsea cable landing terminal equipped with high-voltage DC surge arresters and grounding switches.'
      },
      lala: {
        id: 'lala',
        name: 'Lala VSC Converter Station (Mindanao)',
        island: 'Mindanao',
        grid: 'Mindanao',
        coords: [7.9833, 123.7500],
        type: 'hvdc-converter',
        tech: 'VSC-MMC (Voltage Source Converter)',
        voltage: '±350 kV DC / 230 kV AC',
        rating: '450 MW (Expandable to 900 MW)',
        status: 'Commercial Operation (MVIP)',
        simpleDesc: '⚡ <strong>The Mindanao Anchor:</strong> Completes "One Grid Philippines". Allows Mindanao to export surplus hydropower during rainy months and import energy during dry seasons.',
        techDesc: 'VSC-MMC Converter Station interfacing Mindanao 230 kV network with the ±350 kV HVDC subsea corridor.'
      },
      agus: {
        id: 'agus',
        name: 'Agus Hydroelectric Power Complex',
        island: 'Mindanao',
        grid: 'Mindanao',
        coords: [8.1833, 124.2500],
        type: 'generator',
        fuel: 'Lake Lanao Clean Hydropower',
        genMW: 727,
        voltage: '138 kV AC',
        simpleDesc: '💧 <strong>Southern Hydropower:</strong> Cascaded hydroelectric plants powered by the Agus River and Lake Lanao, providing cheap and clean energy to the whole country.',
        techDesc: 'Cascaded hydro generation facilities (Agus 1 to Agus 7) supplying renewable spinning capacity.'
      },
      davao: {
        id: 'davao',
        name: 'Davao City Hub',
        island: 'Mindanao',
        grid: 'Mindanao',
        coords: [7.0731, 125.6128],
        type: 'load',
        voltage: '138 / 230 kV AC',
        demandMW: 950,
        simpleDesc: '🏙️ <strong>Southern Economic Capital:</strong> Major electricity demand hub in southern Mindanao connected to the national grid.',
        techDesc: 'Regional 230 kV / 138 kV transmission center for southern Mindanao.'
      }
    };

    // Realistic Transmission Path Coordinates
    this.lineRoutes = {
      luzonAC: [
        [14.5995, 120.9842],
        [13.9314, 121.5939],
        [13.6218, 123.1948]
      ],
      leyteLuzonOverheadNorth: [
        [13.6218, 123.1948],
        [13.1391, 123.7438],
        [12.8797, 123.9568],
        [12.5833, 124.0833]
      ],
      sanBernardinoSubmarine: [
        [12.5833, 124.0833],
        [12.5650, 124.1900],
        [12.5500, 124.3000]
      ],
      leyteLuzonOverheadSouth: [
        [12.5500, 124.3000],
        [12.0667, 124.5833],
        [11.7750, 124.8833],
        [11.3500, 124.9500],
        [11.0833, 124.6167]
      ],
      mvipCebuOverhead: [
        [10.0500, 123.4333],
        [9.7500, 123.3800],
        [9.4200, 123.3400]
      ],
      mvipBoholSeaSubmarine: [
        [9.4200, 123.3400],
        [9.1500, 123.3800],
        [8.9000, 123.4000],
        [8.6500, 123.4200]
      ],
      mvipMindanaoOverhead: [
        [8.6500, 123.4200],
        [8.3500, 123.5500],
        [8.1000, 123.6800],
        [7.9833, 123.7500]
      ],
      mindanaoAC: [
        [7.9833, 123.7500],
        [8.1833, 124.2500],
        [7.0731, 125.6128]
      ]
    };

    this.init();
  }

  init() {
    this.renderContainer();
    this.initLeaflet();
    this.renderLayers();
    this.setupResizeHandlers();
  }

  renderContainer() {
    this.container.innerHTML = `
      <div class="relative w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4">
        
        <!-- Header & Quick Preset Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div class="flex items-center space-x-2">
            <span class="inline-flex p-2 bg-blue-50 text-blue-700 rounded-xl shrink-0 shadow-xs">
              <i data-lucide="map" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 leading-tight">Philippine Grid Geographic Interconnection Map</h3>
              <p class="text-xs text-slate-500">Powered by ArcGIS Esri Topo Map • ±350 kV HVDC & Subsea Corridors</p>
            </div>
          </div>

          <!-- Explanation Mode Switcher -->
          <div class="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto shadow-xs">
            <span class="text-[11px] font-semibold text-slate-500 px-2">Info Mode:</span>
            <button id="btn-popup-simple" class="px-2.5 py-1 font-semibold rounded-lg transition-all text-xs ${this.popupMode === 'simple' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              💡 For Everyone (Simple)
            </button>
            <button id="btn-popup-tech" class="px-2.5 py-1 font-semibold rounded-lg transition-all text-xs ${this.popupMode === 'technical' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ⚙️ Engineering
            </button>
          </div>
        </div>

        <!-- Quick Zoom Buttons (Styled like tbi.html toolbar) -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-slate-500 font-semibold text-xs">Quick Zoom:</span>
            <button id="btn-zoom-all" class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-xs shadow-xs active:scale-95 transition-all">
              🇵🇭 All Philippines
            </button>
            <button id="btn-zoom-lv" class="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 text-xs shadow-xs active:scale-95 transition-all">
              ⚡ Leyte–Luzon (21 km Strait)
            </button>
            <button id="btn-zoom-vm" class="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-700 font-semibold rounded-lg border border-teal-200 text-xs shadow-xs active:scale-95 transition-all">
              🌊 MVIP Bohol Sea (92 km)
            </button>
          </div>

          <div class="flex items-center space-x-2 text-xs text-slate-500">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-medium">Esri Topo Map Active</span>
          </div>
        </div>

        <!-- Map Canvas Container (Explicit CSS dimensions to prevent Leaflet cut-off) -->
        <div class="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style="min-height: 480px;">
          <div id="leaflet-phil-map" class="w-full bg-slate-100" style="height: 520px; min-height: 480px; width: 100%;"></div>

          <!-- Mobile Slide-Up Info Drawer -->
          <div id="mobile-node-drawer" class="hidden absolute bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl z-50 rounded-t-2xl transition-all duration-300 max-h-[85%] overflow-y-auto">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- Live Power Flow Status Summary Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span class="text-xs font-semibold text-blue-900 block">Leyte–Luzon HVDC Transfer</span>
              <div class="text-sm font-bold text-blue-700" id="map-flow-lv-text">
                ${Math.abs(this.powerFlow.luzonVisayas)} MW (${this.powerFlow.luzonVisayas >= 0 ? 'Visayas ➔ Luzon' : 'Luzon ➔ Visayas'})
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-mono font-bold">
              ${((Math.abs(this.powerFlow.luzonVisayas) / 440) * 100).toFixed(0)}% Cap
            </span>
          </div>

          <div class="p-3 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span class="text-xs font-semibold text-teal-900 block">MVIP (Visayas–Mindanao) Transfer</span>
              <div class="text-sm font-bold text-teal-700" id="map-flow-vm-text">
                ${Math.abs(this.powerFlow.visayasMindanao)} MW (${this.powerFlow.visayasMindanao >= 0 ? 'Visayas ➔ Mindanao' : 'Mindanao ➔ Visayas'})
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 bg-teal-100 text-teal-800 rounded-lg font-mono font-bold">
              ${((Math.abs(this.powerFlow.visayasMindanao) / 450) * 100).toFixed(0)}% Cap
            </span>
          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindToolbarEvents();
  }

  initLeaflet() {
    if (!window.L) {
      console.error('Leaflet.js not loaded');
      return;
    }

    // Exact Leaflet initialization matching tbi.html: center at [12.8797, 121.7740], zoom 6
    this.map = L.map('leaflet-phil-map', {
      center: [12.8797, 121.7740],
      zoom: 6,
      minZoom: 5,
      maxZoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    // Exact Tile Layer from tbi.html: Esri World Topo Map (fast, beautiful terrain & waterways)
    this.layers.tileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ',
        maxZoom: 18
      }
    ).addTo(this.map);

    // Initialize Layer Groups
    this.layers.hvdcLines = L.layerGroup().addTo(this.map);
    this.layers.hvacLines = L.layerGroup();
    this.layers.submarineCables = L.layerGroup().addTo(this.map);
    this.layers.platforms = L.layerGroup();
    this.layers.markerLayer = L.layerGroup().addTo(this.map);

    // Add Leaflet Legend Control (matching tbi.html style)
    this.addLegend();

    // Invalidate size on multiple frames to ensure zero cropping
    requestAnimationFrame(() => {
      if (this.map) this.map.invalidateSize();
    });
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.map.setView([12.8797, 121.7740], 6);
      }
    }, 120);
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 400);
  }

  setupResizeHandlers() {
    // ResizeObserver to automatically resize map when container expands or collapses
    const mapElement = document.getElementById('leaflet-phil-map');
    if (mapElement && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      ro.observe(mapElement);
    }

    window.addEventListener('resize', () => {
      if (this.map) this.map.invalidateSize();
    });
  }

  addLegend() {
    if (this.legend) {
      this.map.removeControl(this.legend);
    }

    this.legend = L.control({ position: 'bottomright' });
    this.legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <h4>Philippine Grid</h4>
        <div><i style="background:${this.gridColors.Luzon}"></i> Luzon Grid</div>
        <div><i style="background:${this.gridColors.Visayas}"></i> Visayas Grid</div>
        <div><i style="background:${this.gridColors.Mindanao}"></i> Mindanao Grid</div>
        <hr class="my-1.5 border-slate-200">
        <div><span class="line-indicator" style="background:#2563eb"></span> Leyte–Luzon 350kV</div>
        <div><span class="line-indicator" style="background:#0d9488"></span> MVIP 350kV</div>
        <div><span class="line-indicator" style="background:#1d4ed8; height: 5px;"></span> Submarine Cable</div>
      `;
      return div;
    };
    this.legend.addTo(this.map);
  }

  bindToolbarEvents() {
    const btnSimple = document.getElementById('btn-popup-simple');
    const btnTech = document.getElementById('btn-popup-tech');
    const btnAll = document.getElementById('btn-zoom-all');
    const btnLV = document.getElementById('btn-zoom-lv');
    const btnVM = document.getElementById('btn-zoom-vm');

    if (btnSimple && btnTech) {
      btnSimple.addEventListener('click', () => {
        this.popupMode = 'simple';
        btnSimple.className = 'px-2.5 py-1 font-semibold rounded-lg transition-all text-xs bg-white text-blue-700 shadow-xs';
        btnTech.className = 'px-2.5 py-1 font-semibold rounded-lg transition-all text-xs text-slate-600 hover:text-slate-900';
        this.renderLayers();
      });

      btnTech.addEventListener('click', () => {
        this.popupMode = 'technical';
        btnTech.className = 'px-2.5 py-1 font-semibold rounded-lg transition-all text-xs bg-white text-blue-700 shadow-xs';
        btnSimple.className = 'px-2.5 py-1 font-semibold rounded-lg transition-all text-xs text-slate-600 hover:text-slate-900';
        this.renderLayers();
      });
    }

    if (btnAll) {
      btnAll.addEventListener('click', () => {
        if (this.map) {
          this.map.invalidateSize();
          this.map.flyTo([12.8797, 121.7740], 6, { duration: 0.8 });
        }
      });
    }

    if (btnLV) {
      btnLV.addEventListener('click', () => {
        if (this.map) {
          this.map.invalidateSize();
          this.map.flyTo([12.56, 124.19], 9, { duration: 0.8 });
        }
      });
    }

    if (btnVM) {
      btnVM.addEventListener('click', () => {
        if (this.map) {
          this.map.invalidateSize();
          this.map.flyTo([9.05, 123.38], 8, { duration: 0.8 });
        }
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.renderLayers();
  }

  updatePowerFlow(lvMW, vmMW) {
    this.powerFlow.luzonVisayas = lvMW;
    this.powerFlow.visayasMindanao = vmMW;

    const lvText = document.getElementById('map-flow-lv-text');
    const vmText = document.getElementById('map-flow-vm-text');

    if (lvText) {
      lvText.innerText = `${Math.abs(this.powerFlow.luzonVisayas)} MW (${this.powerFlow.luzonVisayas >= 0 ? 'Visayas ➔ Luzon' : 'Luzon ➔ Visayas'})`;
    }
    if (vmText) {
      vmText.innerText = `${Math.abs(this.powerFlow.visayasMindanao)} MW (${this.powerFlow.visayasMindanao >= 0 ? 'Visayas ➔ Mindanao' : 'Mindanao ➔ Visayas'})`;
    }
  }

  showMobileDrawer(node) {
    const drawer = document.getElementById('mobile-node-drawer');
    if (!drawer) return;

    const isSimple = this.popupMode === 'simple';
    const gridColor = this.gridColors[node.grid] || '#3b82f6';

    drawer.innerHTML = `
      <div class="flex items-start justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-full" style="background:${gridColor}"></span>
          <div>
            <h4 class="text-sm font-bold text-slate-900">${node.name}</h4>
            <span class="text-xs text-slate-500">${node.island} Grid • ${node.voltage}</span>
          </div>
        </div>
        <button id="btn-close-drawer" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 text-base font-bold">
          ✕
        </button>
      </div>

      <div class="py-2.5 text-xs text-slate-700 leading-relaxed">
        ${isSimple ? node.simpleDesc : node.techDesc}
      </div>

      <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
        ${node.rating ? `<div><span class="text-slate-400 block text-[10px]">Nominal Capacity</span><strong class="text-blue-700 font-mono">${node.rating}</strong></div>` : ''}
        ${node.genMW ? `<div><span class="text-slate-400 block text-[10px]">Generation Output</span><strong class="text-emerald-600 font-mono">${node.genMW} MW</strong></div>` : ''}
        ${node.demandMW ? `<div><span class="text-slate-400 block text-[10px]">Peak Demand</span><strong class="text-slate-800 font-mono">~${node.demandMW} MW</strong></div>` : ''}
        ${node.tech ? `<div class="col-span-2"><span class="text-slate-400 block text-[10px]">Technology</span><strong class="text-slate-700 font-medium">${node.tech}</strong></div>` : ''}
      </div>
    `;

    drawer.classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-drawer');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));
    }
  }

  createPopupContent(node) {
    const isSimple = this.popupMode === 'simple';
    const gridColor = this.gridColors[node.grid] || '#3b82f6';

    return `
      <div class="p-1 max-w-[270px] font-sans">
        <div class="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
          <span class="w-3 h-3 rounded-full" style="background:${gridColor}"></span>
          <div>
            <h4 class="text-xs font-bold text-slate-900 leading-tight">${node.name}</h4>
            <span class="text-[10px] text-slate-500 block">${node.island} Grid • ${node.voltage}</span>
          </div>
        </div>

        <div class="text-xs text-slate-700 leading-relaxed mb-2.5">
          ${isSimple ? node.simpleDesc : node.techDesc}
        </div>

        <div class="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] space-y-1">
          ${node.rating ? `<div class="flex justify-between"><span class="text-slate-400">Nominal Rating:</span><span class="font-mono font-bold text-blue-700">${node.rating}</span></div>` : ''}
          ${node.genMW ? `<div class="flex justify-between"><span class="text-slate-400">Generation:</span><span class="font-mono font-bold text-emerald-600">${node.genMW} MW</span></div>` : ''}
          ${node.demandMW ? `<div class="flex justify-between"><span class="text-slate-400">Peak Load:</span><span class="font-mono font-bold text-slate-800">~${node.demandMW} MW</span></div>` : ''}
          ${node.status ? `<div class="flex justify-between"><span class="text-slate-400">Status:</span><span class="font-semibold text-emerald-700">${node.status}</span></div>` : ''}
        </div>
      </div>
    `;
  }

  renderLayers() {
    if (!this.map) return;

    this.layers.markerLayer.clearLayers();
    this.layers.hvdcLines.clearLayers();
    this.layers.hvacLines.clearLayers();
    this.layers.submarineCables.clearLayers();
    this.layers.platforms.clearLayers();

    // 1. Transmission Lines
    if (this.mode === 'hvdc') {
      // Remove HVAC layers if attached
      if (this.map.hasLayer(this.layers.hvacLines)) this.map.removeLayer(this.layers.hvacLines);
      if (this.map.hasLayer(this.layers.platforms)) this.map.removeLayer(this.layers.platforms);

      // Attach HVDC layers
      if (!this.map.hasLayer(this.layers.hvdcLines)) this.map.addLayer(this.layers.hvdcLines);
      if (!this.map.hasLayer(this.layers.submarineCables)) this.map.addLayer(this.layers.submarineCables);

      // Leyte-Luzon Overhead HVDC
      L.polyline(this.lineRoutes.leyteLuzonOverheadNorth, {
        color: '#2563eb',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(this.layers.hvdcLines);

      L.polyline(this.lineRoutes.leyteLuzonOverheadSouth, {
        color: '#2563eb',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(this.layers.hvdcLines);

      // San Bernardino Submarine Cable (Thick Dark Blue)
      const sbCable = L.polyline(this.lineRoutes.sanBernardinoSubmarine, {
        color: '#1d4ed8',
        weight: 6,
        opacity: 0.95
      }).addTo(this.layers.submarineCables);

      sbCable.bindPopup(`
        <div class="p-1 max-w-[260px]">
          <h4 class="text-xs font-bold text-blue-900 mb-1">🌊 San Bernardino Strait Cable</h4>
          <p class="text-xs text-slate-600 mb-1.5">
            <strong>21 km Subsea Span:</strong> Connects Matnog (Luzon) to Cabacungan (Samar) across 8-knot ocean currents.
          </p>
          <span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold">±350 kV DC • 440 MW</span>
        </div>
      `);

      // MVIP Overhead
      L.polyline(this.lineRoutes.mvipCebuOverhead, {
        color: '#0d9488',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(this.layers.hvdcLines);

      L.polyline(this.lineRoutes.mvipMindanaoOverhead, {
        color: '#0d9488',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      }).addTo(this.layers.hvdcLines);

      // MVIP Bohol Sea Submarine Cable (Thick Teal)
      const bsCable = L.polyline(this.lineRoutes.mvipBoholSeaSubmarine, {
        color: '#0f766e',
        weight: 6.5,
        opacity: 0.95
      }).addTo(this.layers.submarineCables);

      bsCable.bindPopup(`
        <div class="p-1 max-w-[270px]">
          <h4 class="text-xs font-bold text-teal-900 mb-1">🌊 MVIP Bohol Sea Cable (92 km)</h4>
          <p class="text-xs text-slate-600 mb-1.5">
            Deepest power cable in Southeast Asia (<strong>650m depth</strong>), uniting Luzon, Visayas, and Mindanao into One Grid Philippines.
          </p>
          <span class="inline-block px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-mono text-[10px] font-bold">±350 kV VSC-MMC • 450 MW</span>
        </div>
      `);

    } else {
      // WHAT-IF HVAC MODE
      if (this.map.hasLayer(this.layers.hvdcLines)) this.map.removeLayer(this.layers.hvdcLines);
      if (this.map.hasLayer(this.layers.submarineCables)) this.map.removeLayer(this.layers.submarineCables);

      if (!this.map.hasLayer(this.layers.hvacLines)) this.map.addLayer(this.layers.hvacLines);
      if (!this.map.hasLayer(this.layers.platforms)) this.map.addLayer(this.layers.platforms);

      L.polyline(this.lineRoutes.leyteLuzonOverheadNorth, { color: '#e11d48', weight: 3, dashArray: '4, 4' }).addTo(this.layers.hvacLines);
      L.polyline(this.lineRoutes.leyteLuzonOverheadSouth, { color: '#e11d48', weight: 3, dashArray: '4, 4' }).addTo(this.layers.hvacLines);
      L.polyline(this.lineRoutes.sanBernardinoSubmarine, { color: '#e11d48', weight: 5, dashArray: '5, 5' }).addTo(this.layers.hvacLines);
      L.polyline(this.lineRoutes.mvipCebuOverhead, { color: '#e11d48', weight: 3, dashArray: '4, 4' }).addTo(this.layers.hvacLines);
      L.polyline(this.lineRoutes.mvipBoholSeaSubmarine, { color: '#e11d48', weight: 5, dashArray: '5, 5' }).addTo(this.layers.hvacLines);
      L.polyline(this.lineRoutes.mvipMindanaoOverhead, { color: '#e11d48', weight: 3, dashArray: '4, 4' }).addTo(this.layers.hvacLines);

      // Warning Platform
      const platformMarker = L.circleMarker([8.9500, 123.4000], {
        radius: 9,
        fillColor: '#e11d48',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(this.layers.platforms);

      platformMarker.bindPopup(`
        <div class="p-1 max-w-[270px]">
          <h4 class="text-xs font-bold text-rose-900 mb-1">🏗️ Deep-Sea Reactor Platform (Required for HVAC)</h4>
          <p class="text-xs text-slate-600 mb-1.5">
            A 92-km AC submarine cable creates <strong>367 MVAR of capacitive charging current</strong>, requiring an artificial platform in 650m deep waters.
          </p>
          <span class="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px]">HVDC eliminates this platform completely!</span>
        </div>
      `);
    }

    // Regional AC Backbone (Gray dashed)
    L.polyline(this.lineRoutes.luzonAC, { color: '#64748b', weight: 2.5, dashArray: '3, 4' }).addTo(this.layers.markerLayer);
    L.polyline(this.lineRoutes.mindanaoAC, { color: '#64748b', weight: 2.5, dashArray: '3, 4' }).addTo(this.layers.markerLayer);

    // 2. Render Node CircleMarkers (matching tbi.html L.circleMarker with gridColors)
    Object.values(this.nodes).forEach(node => {
      const gridColor = this.gridColors[node.grid] || '#3b82f6';
      const isConverter = node.type === 'hvdc-converter';
      const radius = isConverter ? 11 : node.type === 'generator' ? 9 : 8;

      const marker = L.circleMarker(node.coords, {
        radius: radius,
        fillColor: isConverter ? '#f59e0b' : gridColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(this.layers.markerLayer);

      marker.bindPopup(this.createPopupContent(node));

      marker.on('click', () => {
        if (window.innerWidth < 640) {
          this.showMobileDrawer(node);
        }
      });
    });
  }
}

window.PhilippineGridMap = PhilippineGridMap;

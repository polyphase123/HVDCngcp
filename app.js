/**
 * app.js - Main Application Controller for Philippine HVDC & HVAC Explorer
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Tab Navigation
  initTabs();

  // Initialize Map
  const map = new window.PhilippineGridMap('map-container');
  window.gridMap = map;

  // Initialize HVAC Simulator
  const sim = new window.HvacSimulator();
  sim.init();
  window.hvacSim = sim;

  // Initialize Converter Station Schematics
  const conv = new window.ConverterDiagrams('converter-diagram-container');
  window.convDiagrams = conv;

  // Initialize Power Dispatch Controls
  initDispatchControls();

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize KaTeX math rendering if available
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ]
    });
  }
});

/**
 * Handle switching between dashboard tabs (Desktop & Mobile)
 */
function initTabs() {
  const desktopButtons = document.querySelectorAll('.tab-btn');
  const mobileButtons = document.querySelectorAll('.mobile-nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function selectTab(targetTab) {
    // Update desktop button styles
    desktopButtons.forEach(b => {
      if (b.getAttribute('data-tab') === targetTab) {
        b.classList.add('active', 'bg-white', 'text-blue-700', 'shadow-sm');
        b.classList.remove('text-slate-600');
      } else {
        b.classList.remove('active', 'bg-white', 'text-blue-700', 'shadow-sm');
        b.classList.add('text-slate-600');
      }
    });

    // Update mobile button styles
    mobileButtons.forEach(mb => {
      if (mb.getAttribute('data-tab') === targetTab) {
        mb.classList.add('active', 'text-blue-600');
        mb.classList.remove('text-slate-500');
      } else {
        mb.classList.remove('active', 'text-blue-600');
        mb.classList.add('text-slate-500');
      }
    });

    // Update panes
    tabPanes.forEach(pane => {
      if (pane.id === `pane-${targetTab}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });

    // Invalidate map and chart size
    if (targetTab === 'overview' && window.gridMap && window.gridMap.map) {
      setTimeout(() => {
        window.gridMap.map.invalidateSize();
      }, 50);
      setTimeout(() => {
        window.gridMap.map.invalidateSize();
      }, 200);
    } else if (targetTab === 'hvac-whatif' && window.hvacSim) {
      setTimeout(() => {
        window.hvacSim.calculateAndRender();
        window.hvacSim.updateCharts();
      }, 60);
      setTimeout(() => {
        window.hvacSim.updateCharts();
      }, 200);
    }

    // Scroll top smoothly on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  desktopButtons.forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.getAttribute('data-tab')));
  });

  mobileButtons.forEach(mbtn => {
    mbtn.addEventListener('click', () => selectTab(mbtn.getAttribute('data-tab')));
  });
}

/**
 * Interactive Dispatch Controls for Leyte-Luzon and MVIP
 */
function initDispatchControls() {
  const sliderLV = document.getElementById('slider-dispatch-lv');
  const sliderVM = document.getElementById('slider-dispatch-vm');
  const valLV = document.getElementById('val-dispatch-lv');
  const valVM = document.getElementById('val-dispatch-vm');

  function updateDispatch() {
    const lvMW = parseInt(sliderLV ? sliderLV.value : 380, 10);
    const vmMW = parseInt(sliderVM ? sliderVM.value : 250, 10);

    if (valLV) {
      valLV.innerText = `${Math.abs(lvMW)} MW (${lvMW >= 0 ? 'Visayas ➔ Luzon' : 'Luzon ➔ Visayas'})`;
    }
    if (valVM) {
      valVM.innerText = `${Math.abs(vmMW)} MW (${vmMW >= 0 ? 'Visayas ➔ Mindanao' : 'Mindanao ➔ Visayas'})`;
    }

    if (window.gridMap) {
      window.gridMap.updatePowerFlow(lvMW, vmMW);
    }

    // Update island balance telemetry
    updateIslandTelemetry(lvMW, vmMW);
  }

  if (sliderLV) sliderLV.addEventListener('input', updateDispatch);
  if (sliderVM) sliderVM.addEventListener('input', updateDispatch);

  // Dispatch preset buttons
  document.querySelectorAll('.dispatch-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preset = e.currentTarget.getAttribute('data-preset');
      if (preset === 'geothermal-export') {
        if (sliderLV) sliderLV.value = 440;
        if (sliderVM) sliderVM.value = 0;
      } else if (preset === 'mindanao-surplus') {
        if (sliderLV) sliderLV.value = 350;
        if (sliderVM) sliderVM.value = -450; // Mindanao exports to Visayas
      } else if (preset === 'luzon-support') {
        if (sliderLV) sliderLV.value = -300; // Luzon exports to Visayas
        if (sliderVM) sliderVM.value = 250;  // Visayas exports to Mindanao
      } else if (preset === 'balanced') {
        if (sliderLV) sliderLV.value = 200;
        if (sliderVM) sliderVM.value = 150;
      }
      updateDispatch();
    });
  });

  // Map Mode Toggle (HVDC vs HVAC)
  const btnToggleHvdcMode = document.getElementById('btn-mode-hvdc');
  const btnToggleHvacMode = document.getElementById('btn-mode-hvac');

  if (btnToggleHvdcMode && btnToggleHvacMode) {
    btnToggleHvdcMode.addEventListener('click', () => {
      btnToggleHvdcMode.classList.add('bg-white', 'text-blue-700', 'shadow-xs');
      btnToggleHvdcMode.classList.remove('text-slate-600');
      btnToggleHvacMode.classList.remove('bg-white', 'text-rose-700', 'shadow-xs');
      btnToggleHvacMode.classList.add('text-slate-600');
      if (window.gridMap) window.gridMap.setMode('hvdc');
    });

    btnToggleHvacMode.addEventListener('click', () => {
      btnToggleHvacMode.classList.add('bg-white', 'text-rose-700', 'shadow-xs');
      btnToggleHvacMode.classList.remove('text-slate-600');
      btnToggleHvdcMode.classList.remove('bg-white', 'text-blue-700', 'shadow-xs');
      btnToggleHvdcMode.classList.add('text-slate-600');
      if (window.gridMap) window.gridMap.setMode('what-if-hvac');
    });
  }

  // Initial call
  updateDispatch();
}

/**
 * Calculates live island reserves and grid frequency based on dispatch
 */
function updateIslandTelemetry(lvMW, vmMW) {
  // Base generation & demand (MW)
  const luzonDemand = 10500;
  const visayasDemand = 2300;
  const mindanaoDemand = 2100;

  // Net imports / exports
  const luzonNet = lvMW; // if lvMW > 0, Luzon is importing
  const visayasNet = -lvMW - vmMW;
  const mindanaoNet = vmMW; // if vmMW > 0, Mindanao is importing

  const elLuzonNet = document.getElementById('telemetry-luzon-net');
  const elVisayasNet = document.getElementById('telemetry-visayas-net');
  const elMindanaoNet = document.getElementById('telemetry-mindanao-net');

  if (elLuzonNet) {
    elLuzonNet.innerText = `${luzonNet >= 0 ? '+' : ''}${luzonNet} MW (${luzonNet >= 0 ? 'Importing' : 'Exporting'})`;
    elLuzonNet.className = luzonNet >= 0 ? 'text-xs font-mono font-bold text-blue-600' : 'text-xs font-mono font-bold text-amber-600';
  }
  if (elVisayasNet) {
    elVisayasNet.innerText = `${visayasNet >= 0 ? '+' : ''}${visayasNet} MW (${visayasNet >= 0 ? 'Importing' : 'Exporting'})`;
    elVisayasNet.className = visayasNet >= 0 ? 'text-xs font-mono font-bold text-teal-600' : 'text-xs font-mono font-bold text-amber-600';
  }
  if (elMindanaoNet) {
    elMindanaoNet.innerText = `${mindanaoNet >= 0 ? '+' : ''}${mindanaoNet} MW (${mindanaoNet >= 0 ? 'Importing' : 'Exporting'})`;
    elMindanaoNet.className = mindanaoNet >= 0 ? 'text-xs font-mono font-bold text-emerald-600' : 'text-xs font-mono font-bold text-amber-600';
  }
}

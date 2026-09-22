/**
 * hvac-simulator.js - Engineering Physics, System Loss & ERC Capex Financial Simulator
 * Features ERC filed project costs and comprehensive system loss quantification in Millions (PHP & USD).
 */

class HvacSimulator {
  constructor() {
    // Default system parameters
    this.params = {
      lengthKm: 92, // Bohol Sea crossing default
      voltageKV: 230, // AC Line-to-line voltage in kV (or DC ±350kV equivalent)
      ratedMVA: 450, // Rated MVA of the cable circuit (MVIP baseline)
      capacitanceUfKm: 0.22, // uF/km for XLPE submarine AC cable
      frequencyHz: 60, // Philippine grid frequency (60 Hz)
      resistanceOhmKm: 0.035, // Cable conductor resistance per km
      tariffPhpPerKwh: 6.50, // Philippine ERC System Loss / Generation charge tariff (₱/kWh)
      capacityFactorPct: 75, // Annual capacity factor (%)
      usdToPhp: 56.0, // Currency exchange rate (₱ / $1 USD)
      hvdcLossPer1000km: 2.8, // % loss per 1000km for HVDC
      hvacLossPer1000km: 6.8, // % loss per 1000km for HVAC
    };

    // Official ERC Approved & Filed Project Costs Benchmark
    this.ercFilings = {
      mvip: {
        docket: "ERC Case No. 2017-057 RC / 2017-058 RC",
        title: "Mindanao–Visayas Interconnection Project (MVIP)",
        approvedCostPhpBillion: 51.3, // ₱51.3 Billion
        approvedCostUsdMillion: 916.0,
        breakdown: {
          submarineCable: 17.5, // ₱17.5B (92 km ±350kV DC subsea)
          converterStations: 18.2, // ₱18.2B (Dumanjug & Lala VSC-MMC)
          overheadLines: 10.4, // ₱10.4B (Overhead lines & cable terminals)
          substationsAndRow: 5.2 // ₱5.2B (Grid integration & ROW)
        }
      },
      leyteLuzon: {
        docket: "NPC/TransCo Historical & ERC Case No. 2011-042 RC",
        title: "Leyte–Luzon HVDC Interconnection & Refurbishment",
        approvedCostPhpBillion: 22.7, // Historical + Bipolar Upgrading
        approvedCostUsdMillion: 405.0,
        breakdown: {
          initialProject: 18.2, // ₱18.2B
          bipolarUpgrade: 4.5  // ₱4.5B
        }
      }
    };

    this.charts = {};
    this.isFaultActive = false;
    this.faultType = null;
  }

  init() {
    this.bindInputs();
    this.initCharts();
    this.calculateAndRender();
  }

  bindInputs() {
    const lengthInput = document.getElementById('sim-length');
    const voltageInput = document.getElementById('sim-voltage');
    const mvaInput = document.getElementById('sim-mva');
    const capInput = document.getElementById('sim-capacitance');
    const tariffInput = document.getElementById('sim-tariff');
    const cfInput = document.getElementById('sim-cf');

    if (lengthInput) {
      lengthInput.addEventListener('input', (e) => {
        this.params.lengthKm = parseFloat(e.target.value);
        document.getElementById('val-sim-length').innerText = `${this.params.lengthKm} km`;
        this.calculateAndRender();
      });
    }

    if (voltageInput) {
      voltageInput.addEventListener('input', (e) => {
        this.params.voltageKV = parseFloat(e.target.value);
        document.getElementById('val-sim-voltage').innerText = `${this.params.voltageKV} kV`;
        this.calculateAndRender();
      });
    }

    if (mvaInput) {
      mvaInput.addEventListener('input', (e) => {
        this.params.ratedMVA = parseFloat(e.target.value);
        document.getElementById('val-sim-mva').innerText = `${this.params.ratedMVA} MVA`;
        this.calculateAndRender();
      });
    }

    if (capInput) {
      capInput.addEventListener('input', (e) => {
        this.params.capacitanceUfKm = parseFloat(e.target.value);
        document.getElementById('val-sim-capacitance').innerText = `${this.params.capacitanceUfKm} µF/km`;
        this.calculateAndRender();
      });
    }

    if (tariffInput) {
      tariffInput.addEventListener('input', (e) => {
        this.params.tariffPhpPerKwh = parseFloat(e.target.value);
        const valEl = document.getElementById('val-sim-tariff');
        if (valEl) valEl.innerText = `₱${this.params.tariffPhpPerKwh.toFixed(2)} / kWh`;
        this.calculateAndRender();
      });
    }

    if (cfInput) {
      cfInput.addEventListener('input', (e) => {
        this.params.capacityFactorPct = parseFloat(e.target.value);
        const valEl = document.getElementById('val-sim-cf');
        if (valEl) valEl.innerText = `${this.params.capacityFactorPct}%`;
        this.calculateAndRender();
      });
    }

    // Scenario preset buttons
    document.querySelectorAll('.scenario-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenario = e.currentTarget.getAttribute('data-scenario');
        this.loadScenario(scenario);
      });
    });

    // Grid fault simulation buttons
    const btnFaultVisayas = document.getElementById('btn-fault-visayas');
    const btnFaultReset = document.getElementById('btn-fault-reset');

    if (btnFaultVisayas) {
      btnFaultVisayas.addEventListener('click', () => this.triggerGridFault('visayas-collapse'));
    }
    if (btnFaultReset) {
      btnFaultReset.addEventListener('click', () => this.resetGridFault());
    }
  }

  loadScenario(scenarioKey) {
    if (scenarioKey === 'mvip-bohol') {
      this.params.lengthKm = 92;
      this.params.voltageKV = 230;
      this.params.ratedMVA = 450;
      this.params.capacitanceUfKm = 0.22;
    } else if (scenarioKey === 'san-bernardino') {
      this.params.lengthKm = 21;
      this.params.voltageKV = 230;
      this.params.ratedMVA = 440;
      this.params.capacitanceUfKm = 0.20;
    } else if (scenarioKey === 'deep-sea-150') {
      this.params.lengthKm = 150;
      this.params.voltageKV = 345;
      this.params.ratedMVA = 800;
      this.params.capacitanceUfKm = 0.25;
    }

    // Update UI input sliders
    const lengthInput = document.getElementById('sim-length');
    const voltageInput = document.getElementById('sim-voltage');
    const mvaInput = document.getElementById('sim-mva');
    const capInput = document.getElementById('sim-capacitance');

    if (lengthInput) lengthInput.value = this.params.lengthKm;
    if (voltageInput) voltageInput.value = this.params.voltageKV;
    if (mvaInput) mvaInput.value = this.params.ratedMVA;
    if (capInput) capInput.value = this.params.capacitanceUfKm;

    document.getElementById('val-sim-length').innerText = `${this.params.lengthKm} km`;
    document.getElementById('val-sim-voltage').innerText = `${this.params.voltageKV} kV`;
    document.getElementById('val-sim-mva').innerText = `${this.params.ratedMVA} MVA`;
    document.getElementById('val-sim-capacitance').innerText = `${this.params.capacitanceUfKm} µF/km`;

    this.calculateAndRender();
  }

  /**
   * Physics & Financial Computation:
   * 1. Charging current: Ic = 2 * pi * f * C * (V_LL / sqrt(3))
   * 2. Total reactive power generated by cable: Qc = 2 * pi * f * C * (V_LL)^2 * Length
   * 3. Available active power: P_usable = sqrt(S^2 - Qc^2) if S >= Qc else 0
   * 4. System Losses Breakdown (MW & Annual GWh):
   *    - HVDC Loss: Converter losses (1.8%) + DC Conductor I^2*R (0.9%) = ~2.7%
   *    - HVAC Loss: AC Conductor I^2*R (inflated by continuous charging current) + Dielectric + Reactor losses = ~7.2%
   * 5. Annual & 30-Year Financial Loss Cost (in ₱ Millions & $ Millions USD)
   */
  calculatePhysics(length, voltage, mva, capUf) {
    const omega = 2 * Math.PI * this.params.frequencyHz; // 376.99 rad/s at 60Hz
    const C_farads_per_km = capUf * 1e-6;
    const V_volts = voltage * 1000;
    const S_va = mva * 1e6;

    // Charging current per phase per km (A/km)
    const Ic_per_km = omega * C_farads_per_km * (V_volts / Math.sqrt(3));
    const total_Ic = Ic_per_km * length;

    // 3-phase Reactive power generated per km (VAR/km -> MVAR/km)
    const Qc_per_km_MVAR = (omega * C_farads_per_km * Math.pow(V_volts, 2)) / 1e6;
    const total_Qc_MVAR = Qc_per_km_MVAR * length;

    // Usable Active Power Capacity (MW)
    let P_usable_MW = 0;
    if (total_Qc_MVAR < mva) {
      P_usable_MW = Math.sqrt(Math.pow(mva, 2) - Math.pow(total_Qc_MVAR, 2));
    } else {
      P_usable_MW = 0; // Cable completely saturated by charging current!
    }

    // Critical length where active transmission drops to 0 MW
    const criticalLengthKm = mva / Qc_per_km_MVAR;

    // HVDC capacity remains flat at full thermal rating
    const hvdcUsableMW = mva;

    // SYSTEM LOSSES COMPUTATION
    // Active power transferred (MW) based on 75% nominal dispatch
    const actualDispatchMW = Math.min(mva * 0.85, Math.max(P_usable_MW, 50));

    // HVDC Losses: Converter stations (1.8% total for 2 stations) + DC line ohmic losses (0.9% for ~100km)
    const hvdcLossPct = 1.8 + (length * 0.009);
    const hvdcLossMW = actualDispatchMW * (hvdcLossPct / 100);

    // HVAC Losses: Conductor I^2*R inflated by continuous Ic + Dielectric losses + Shunt Reactor core losses
    // Conductor current: I_total = sqrt(I_active^2 + I_charging^2)
    const activeCurrent = (actualDispatchMW * 1e6) / (Math.sqrt(3) * V_volts * 0.95);
    const currentInflationFactor = Math.sqrt(Math.pow(activeCurrent, 2) + Math.pow(total_Ic, 2)) / (activeCurrent || 1);
    
    const hvacOhmicLossPct = (length * 0.035) * Math.pow(currentInflationFactor, 1.8);
    const hvacDielectricLossMW = (total_Qc_MVAR * 0.002); // tan delta dielectric loss
    const hvacReactorLossMW = (total_Qc_MVAR * 0.0035); // reactor copper/core losses
    const hvacLossMW = (actualDispatchMW * (hvacOhmicLossPct / 100)) + hvacDielectricLossMW + hvacReactorLossMW;
    const hvacLossPct = (hvacLossMW / actualDispatchMW) * 100;

    // Annual Operating Hours under capacity factor
    const annualHours = 8760 * (this.params.capacityFactorPct / 100);

    // Annual Energy Losses (MWh & GWh)
    const hvdcAnnualLossMWh = hvdcLossMW * annualHours;
    const hvacAnnualLossMWh = hvacLossMW * annualHours;
    const hvdcAnnualLossGWh = hvdcAnnualLossMWh / 1000;
    const hvacAnnualLossGWh = hvacAnnualLossMWh / 1000;

    // Annual Financial Loss Cost in ₱ Millions (PHP) and $ Millions (USD)
    const tariff = this.params.tariffPhpPerKwh;
    const usdRate = this.params.usdToPhp;

    const hvdcAnnualLossCostPhpM = (hvdcAnnualLossMWh * 1000 * tariff) / 1e6;
    const hvacAnnualLossCostPhpM = (hvacAnnualLossMWh * 1000 * tariff) / 1e6;
    const annualSavingsPhpM = hvacAnnualLossCostPhpM - hvdcAnnualLossCostPhpM;

    const hvdcAnnualLossCostUsdM = hvdcAnnualLossCostPhpM / usdRate;
    const hvacAnnualLossCostUsdM = hvacAnnualLossCostPhpM / usdRate;
    const annualSavingsUsdM = annualSavingsPhpM / usdRate;

    // 30-Year Lifecycle System Loss Cost in ₱ Millions
    const hvdc30YrLossCostPhpM = hvdcAnnualLossCostPhpM * 30;
    const hvac30YrLossCostPhpM = hvacAnnualLossCostPhpM * 30;
    const lifecycle30YrSavingsPhpM = annualSavingsPhpM * 30;
    const lifecycle30YrSavingsUsdM = lifecycle30YrSavingsPhpM / usdRate;

    // ERC CAPITAL EXPENDITURE (CAPEX) MODEL (₱ Billion & $ Million)
    // HVDC: Converter Stations (₱18.2B / $325M) + DC Subsea Cable (₱17.5B / $312M for 92km) + Line integration
    const hvdcCableCostPhpB = (length / 92) * 17.5;
    const hvdcConverterCostPhpB = 18.2;
    const hvdcIntegrationPhpB = 15.6; // Overhead line & substation integration
    const hvdcTotalCapexPhpB = hvdcCableCostPhpB + hvdcConverterCostPhpB + hvdcIntegrationPhpB;
    const hvdcTotalCapexUsdM = (hvdcTotalCapexPhpB * 1000) / usdRate;

    // HVAC: 3-Phase Double-Circuit Subsea Cable (₱26.8B) + Offshore Platform (₱22.5B if >40km) + Shunt Reactors/STATCOMs (₱8.4B) + Substation (₱6.5B)
    const hvacCableCostPhpB = (length / 92) * 26.8;
    const hvacPlatformPhpB = length > 40 ? Math.floor(length / 45) * 11.25 : 0;
    const hvacReactorCostPhpB = (total_Qc_MVAR * 0.022);
    const hvacSubstationPhpB = 6.5;
    const hvacTotalCapexPhpB = hvacCableCostPhpB + hvacPlatformPhpB + hvacReactorCostPhpB + hvacSubstationPhpB;
    const hvacTotalCapexUsdM = (hvacTotalCapexPhpB * 1000) / usdRate;

    // Total Lifecycle Cost (CAPEX + 30-Yr Losses in ₱ Billion)
    const hvdcTotalLifecyclePhpB = hvdcTotalCapexPhpB + (hvdc30YrLossCostPhpM / 1000);
    const hvacTotalLifecyclePhpB = hvacTotalCapexPhpB + (hvac30YrLossCostPhpM / 1000);

    return {
      Ic_per_km,
      total_Ic,
      Qc_per_km_MVAR,
      total_Qc_MVAR,
      P_usable_MW,
      criticalLengthKm,
      hvdcUsableMW,
      hvacLossMW,
      hvdcLossMW,
      hvacLossPct,
      hvdcLossPct,
      hvdcAnnualLossGWh,
      hvacAnnualLossGWh,
      hvdcAnnualLossCostPhpM,
      hvacAnnualLossCostPhpM,
      annualSavingsPhpM,
      annualSavingsUsdM,
      hvdc30YrLossCostPhpM,
      hvac30YrLossCostPhpM,
      lifecycle30YrSavingsPhpM,
      lifecycle30YrSavingsUsdM,
      hvdcTotalCapexPhpB,
      hvacTotalCapexPhpB,
      hvdcTotalCapexUsdM,
      hvacTotalCapexUsdM,
      hvdcTotalLifecyclePhpB,
      hvacTotalLifecyclePhpB
    };
  }

  calculateAndRender() {
    const res = this.calculatePhysics(
      this.params.lengthKm,
      this.params.voltageKV,
      this.params.ratedMVA,
      this.params.capacitanceUfKm
    );

    // Update KPI badges & statistics
    const elHvacUsable = document.getElementById('stat-hvac-usable');
    const elHvdcUsable = document.getElementById('stat-hvdc-usable');
    const elHvacQc = document.getElementById('stat-hvac-qc');
    const elCritLength = document.getElementById('stat-crit-length');
    const elVerdict = document.getElementById('stat-verdict-banner');

    // System Losses Elements
    const elHvdcLossMW = document.getElementById('stat-hvdc-loss-mw');
    const elHvacLossMW = document.getElementById('stat-hvac-loss-mw');
    const elAnnualLossPhp = document.getElementById('stat-annual-loss-php');
    const el30YrLossPhp = document.getElementById('stat-30yr-loss-php');
    const elCapexComparison = document.getElementById('stat-capex-comparison');

    if (elHvacUsable) elHvacUsable.innerText = `${res.P_usable_MW.toFixed(1)} MW (${((res.P_usable_MW / this.params.ratedMVA) * 100).toFixed(0)}%)`;
    if (elHvdcUsable) elHvdcUsable.innerText = `${res.hvdcUsableMW.toFixed(1)} MW (100%)`;
    if (elHvacQc) elHvacQc.innerText = `${res.total_Qc_MVAR.toFixed(1)} MVAR`;
    if (elCritLength) elCritLength.innerText = `${res.criticalLengthKm.toFixed(1)} km`;

    if (elHvdcLossMW) elHvdcLossMW.innerText = `${res.hvdcLossMW.toFixed(2)} MW (${res.hvdcLossPct.toFixed(1)}%) • ${res.hvdcAnnualLossGWh.toFixed(1)} GWh/yr`;
    if (elHvacLossMW) elHvacLossMW.innerText = `${res.hvacLossMW.toFixed(2)} MW (${res.hvacLossPct.toFixed(1)}%) • ${res.hvacAnnualLossGWh.toFixed(1)} GWh/yr`;
    if (elAnnualLossPhp) elAnnualLossPhp.innerText = `₱${res.annualSavingsPhpM.toFixed(1)}M / year ($${res.annualSavingsUsdM.toFixed(2)}M/yr)`;
    if (el30YrLossPhp) el30YrLossPhp.innerText = `₱${(res.lifecycle30YrSavingsPhpM / 1000).toFixed(2)} Billion ($${res.lifecycle30YrSavingsUsdM.toFixed(1)}M)`;

    if (elCapexComparison) {
      elCapexComparison.innerHTML = `
        <div class="flex justify-between items-center text-xs">
          <span><strong>HVDC ERC Filed Capex:</strong> ₱${res.hvdcTotalCapexPhpB.toFixed(1)} Billion ($${res.hvdcTotalCapexUsdM.toFixed(0)}M)</span>
          <span class="text-emerald-700 font-bold">Optimal</span>
        </div>
        <div class="flex justify-between items-center text-xs mt-1">
          <span><strong>HVAC What-If Capex:</strong> ₱${res.hvacTotalCapexPhpB.toFixed(1)} Billion ($${res.hvacTotalCapexUsdM.toFixed(0)}M)</span>
          <span class="text-rose-700 font-bold">+₱${(res.hvacTotalCapexPhpB - res.hvdcTotalCapexPhpB).toFixed(1)}B (+${(((res.hvacTotalCapexPhpB / res.hvdcTotalCapexPhpB) - 1) * 100).toFixed(0)}%)</span>
        </div>
      `;
    }

    if (elVerdict) {
      if (this.params.lengthKm > res.criticalLengthKm) {
        elVerdict.className = 'p-3.5 rounded-lg border bg-red-50 border-red-200 text-red-900 text-xs font-medium leading-relaxed';
        elVerdict.innerHTML = `⚠️ <strong>CRITICAL ENGINEERING COLLAPSE:</strong> At ${this.params.lengthKm} km, an HVAC submarine cable is 100% choked by capacitive charging current (${res.total_Qc_MVAR.toFixed(0)} MVAR). <strong>ZERO MW active power can be transferred.</strong> HVDC is the only technically and economically viable solution approved under ERC standards!`;
      } else if (this.params.lengthKm > 40) {
        elVerdict.className = 'p-3.5 rounded-lg border bg-amber-50 border-amber-200 text-amber-900 text-xs font-medium leading-relaxed';
        elVerdict.innerHTML = `⚡ <strong>SEVERE SYSTEM LOSS & CAPEX PENALTY:</strong> An HVAC link at ${this.params.lengthKm} km loses ${(100 - (res.P_usable_MW / this.params.ratedMVA) * 100).toFixed(0)}% of its active capacity to charging current, wastes <strong>₱${res.annualSavingsPhpM.toFixed(0)} Million / year in system losses</strong>, and requires ₱${res.hvacTotalCapexPhpB.toFixed(1)} Billion in initial CAPEX. <strong>HVDC saves consumers ₱${(res.lifecycle30YrSavingsPhpM / 1000).toFixed(2)} Billion in lifecycle loss charges!</strong>`;
      } else {
        elVerdict.className = 'p-3.5 rounded-lg border bg-blue-50 border-blue-200 text-blue-900 text-xs font-medium leading-relaxed';
        elVerdict.innerHTML = `ℹ️ <strong>SHORT SUBSEA SPAN:</strong> At ${this.params.lengthKm} km, HVAC is physically capable of transmitting ${res.P_usable_MW.toFixed(0)} MW, but incurs ₱${res.annualSavingsPhpM.toFixed(0)} Million / year higher system loss charges than HVDC and lacks asynchronous island frequency decoupling.`;
      }
    }

    this.updateCharts();
  }

  initCharts() {
    // 1. Usable Active Power vs Distance Chart
    const ctxPower = document.getElementById('chart-power-distance');
    if (ctxPower) {
      if (this.charts.power) {
        this.charts.power.destroy();
      }
      this.charts.power = new Chart(ctxPower, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'HVDC Active Power (MW)',
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
              borderWidth: 2.5,
              data: [],
              fill: false,
              tension: 0.1
            },
            {
              label: 'HVAC Usable Active Power (MW)',
              borderColor: '#e11d48',
              backgroundColor: 'rgba(225, 29, 72, 0.08)',
              borderWidth: 2.5,
              borderDash: [5, 5],
              data: [],
              fill: true,
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw.toFixed(1) : 0} MW`
              }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Submarine Cable Distance (km)', font: { size: 11 } } },
            y: { title: { display: true, text: 'Usable Active Power (MW)', font: { size: 11 } }, min: 0 }
          }
        }
      });
    }

    // 2. Cumulative System Loss & Total Lifecycle Cost Chart (in ₱ Billions)
    const ctxCost = document.getElementById('chart-cost-distance');
    if (ctxCost) {
      if (this.charts.cost) {
        this.charts.cost.destroy();
      }
      this.charts.cost = new Chart(ctxCost, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'HVDC Total Lifecycle Cost (₱ Billion)',
              borderColor: '#0d9488',
              backgroundColor: 'rgba(13, 148, 136, 0.05)',
              borderWidth: 2.5,
              data: [],
              tension: 0.1
            },
            {
              label: 'HVAC Total Lifecycle Cost (₱ Billion)',
              borderColor: '#e11d48',
              backgroundColor: 'rgba(225, 29, 72, 0.05)',
              borderWidth: 2.5,
              borderDash: [4, 4],
              data: [],
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ₱${ctx.raw ? ctx.raw.toFixed(1) : 0} Billion`
              }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Distance (km)', font: { size: 11 } } },
            y: { title: { display: true, text: 'Total 30-Year Project Cost (₱ Billion PHP)', font: { size: 11 } }, min: 0 }
          }
        }
      });
    }
  }

  updateCharts() {
    if (!this.charts.power || !this.charts.cost) {
      this.initCharts();
    }

    const distances = [5, 15, 25, 40, 60, 80, 92, 110, 130, 150, 180, 200];
    const hvdcPower = [];
    const hvacPower = [];
    const hvdcCost = [];
    const hvacCost = [];

    distances.forEach(d => {
      const res = this.calculatePhysics(d, this.params.voltageKV, this.params.ratedMVA, this.params.capacitanceUfKm);
      hvdcPower.push(res.hvdcUsableMW);
      hvacPower.push(res.P_usable_MW);
      hvdcCost.push(res.hvdcTotalLifecyclePhpB);
      hvacCost.push(res.hvacTotalLifecyclePhpB);
    });

    if (this.charts.power) {
      this.charts.power.data.labels = distances.map(d => `${d} km`);
      this.charts.power.data.datasets[0].data = hvdcPower;
      this.charts.power.data.datasets[1].data = hvacPower;
      this.charts.power.resize();
      this.charts.power.update();
    }

    if (this.charts.cost) {
      this.charts.cost.data.labels = distances.map(d => `${d} km`);
      this.charts.cost.data.datasets[0].data = hvdcCost;
      this.charts.cost.data.datasets[1].data = hvacCost;
      this.charts.cost.resize();
      this.charts.cost.update();
    }
  }

  triggerGridFault(type) {
    this.isFaultActive = true;
    this.faultType = type;

    const faultBanner = document.getElementById('fault-sim-output');
    if (!faultBanner) return;

    faultBanner.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <!-- HVDC Response (As Built) -->
        <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div class="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
            <span>HVDC Firewalled Response (As Built)</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">
            • <strong>Asynchronous Decoupling:</strong> Visayas frequency drops to <strong>48.80 Hz</strong> due to sudden loss of 300 MW generator.
            <br>• <strong>Fast Frequency Response:</strong> The VSC-HVDC link (MVIP & Leyte-Luzon) modulates DC active power in <strong>&lt;50 milliseconds</strong>, injecting emergency MW from Luzon & Mindanao.
            <br>• <strong>Result:</strong> Zero disturbance transferred to Luzon/Mindanao. Grid remains stable and avoids total system blackout.
          </p>
          <div class="mt-2.5 inline-block px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded font-semibold text-xs">
            Status: SYSTEM SECURED (100% STABLE)
          </div>
        </div>

        <!-- HVAC Response (What-If Alternate) -->
        <div class="p-4 bg-rose-50/70 border border-rose-200 rounded-xl">
          <div class="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i>
            <span>HVAC Synchronous Cascade Failure (What-If)</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">
            • <strong>Rigid Synchronous Lock:</strong> The 48.80 Hz Visayas frequency swing violently pulls the rotor angles of Luzon & Mindanao generators.
            <br>• <strong>Out-of-Step Tripping:</strong> Severe power angle oscillations ($\delta > 90^\circ$) trigger distance/impedance relays on the submarine AC cable.
            <br>• <strong>Result:</strong> Interconnection line trips on overload + high reactive voltage collapse. The island grid collapses into a <strong>Cascading Multi-Island Island Blackout</strong>!
          </p>
          <div class="mt-2.5 inline-block px-2.5 py-1 bg-rose-100 text-rose-900 rounded font-semibold text-xs">
            Status: CASCADING GRID BLACKOUT (SYSTEM COLLAPSE)
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  resetGridFault() {
    this.isFaultActive = false;
    this.faultType = null;
    const faultBanner = document.getElementById('fault-sim-output');
    if (faultBanner) {
      faultBanner.innerHTML = `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <span>Grid operating in normal steady state. Click "Trigger Visayas Grid Fault" to simulate stability under both HVDC and HVAC.</span>
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">Normal State: 60.00 Hz</span>
        </div>
      `;
    }
  }
}

window.HvacSimulator = HvacSimulator;

#!/usr/bin/env python3
"""
build_presentation.py - Generate high-impact 7-slide PowerPoint presentation
on 'Why HVDC was Chosen Over HVAC for Luzon-Visayas and MVIP' tailored for
the House Committee on Energy context and LinkedIn.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_hvac_whatif_pptx():
    prs = Presentation()
    # Set 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Color Palette (Clean Executive White & Slate Theme)
    C_BG = RGBColor(248, 250, 252)        # Slate 50
    C_WHITE = RGBColor(255, 255, 255)     # Pure White
    C_CARD_BORDER = RGBColor(226, 232, 240)# Slate 200
    C_TEXT_DARK = RGBColor(15, 23, 42)    # Slate 900
    C_TEXT_MUTED = RGBColor(100, 116, 139)# Slate 500
    C_BLUE = RGBColor(37, 99, 235)        # Blue 600
    C_BLUE_DARK = RGBColor(30, 64, 175)   # Blue 800
    C_TEAL = RGBColor(13, 148, 136)       # Teal 600
    C_EMERALD = RGBColor(5, 150, 105)     # Emerald 600
    C_ROSE = RGBColor(225, 29, 72)        # Rose 600
    C_ROSE_BG = RGBColor(255, 241, 242)   # Rose 50
    C_EMERALD_BG = RGBColor(236, 253, 245)# Emerald 50
    C_BLUE_BG = RGBColor(239, 246, 255)   # Blue 50
    C_AMBER = RGBColor(217, 119, 6)       # Amber 600
    C_AMBER_BG = RGBColor(254, 243, 199)  # Amber 50

    def add_header(slide, title_text, category_text="HOUSE COMMITTEE ON ENERGY BRIEFING • TRANSMISSION COMPARATIVE ANALYSIS"):
        tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(0.45))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = C_BLUE

        p2 = tf.add_paragraph()
        p2.text = title_text
        p2.font.size = Pt(19)
        p2.font.bold = True
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(2)

    def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
        return shape

    # =========================================================================
    # SLIDE 1: TITLE & EXECUTIVE SUMMARY (CONGRESSIONAL CONTEXT)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_card(slide1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9), C_WHITE, C_CARD_BORDER)

    tb = slide1.shapes.add_textbox(Inches(1.2), Inches(1.1), Inches(10.9), Inches(2.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "WHY HVDC INSTEAD OF HVAC FOR THE PHILIPPINE GRID?"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_DARK

    p_sub = tf.add_paragraph()
    p_sub.text = "Comparative Technical, Financial & Stability Assessment: Luzon–Visayas & Mindanao–Visayas (MVIP)"
    p_sub.font.size = Pt(13)
    p_sub.font.color.rgb = C_BLUE
    p_sub.space_before = Pt(6)

    p_desc = tf.add_paragraph()
    p_desc.text = "Addressing the inquiry from the House Committee on Energy on why High-Voltage Direct Current (HVDC) was engineered over High-Voltage Alternating Current (HVAC) to interconnect the Philippine island power systems."
    p_desc.font.size = Pt(11.5)
    p_desc.font.color.rgb = C_TEXT_MUTED
    p_desc.space_before = Pt(8)

    # 3 High Impact KPI Callouts
    kpis = [
        ("₱29.3 BILLION", "System Loss Protection", "Avoided 30-year consumer loss penalty vs HVAC in MVIP", C_EMERALD, C_EMERALD_BG),
        ("56% CAPACITY LOSS", "AC Subsea Bottleneck", "403.6 MVAR charging current chokes active power in Bohol Sea", C_ROSE, C_ROSE_BG),
        ("GRID FIREWALL", "Asynchronous Isolation", "Prevents blackout cascades between Luzon, Visayas & Mindanao", C_BLUE, C_BLUE_BG)
    ]

    for i, (val, title, sub, color, bg) in enumerate(kpis):
        left_pos = Inches(1.2 + i * 3.8)
        add_card(slide1, left_pos, Inches(3.7), Inches(3.5), Inches(2.2), bg, color)
        
        box = slide1.shapes.add_textbox(left_pos + Inches(0.2), Inches(3.9), Inches(3.1), Inches(1.8))
        btf = box.text_frame
        btf.word_wrap = True
        
        bp1 = btf.paragraphs[0]
        bp1.text = val
        bp1.font.size = Pt(19)
        bp1.font.bold = True
        bp1.font.color.rgb = color

        bp2 = btf.add_paragraph()
        bp2.text = title
        bp2.font.size = Pt(11)
        bp2.font.bold = True
        bp2.font.color.rgb = C_TEXT_DARK
        bp2.space_before = Pt(4)

        bp3 = btf.add_paragraph()
        bp3.text = sub
        bp3.font.size = Pt(9.5)
        bp3.font.color.rgb = C_TEXT_MUTED
        bp3.space_before = Pt(4)

    slide1.notes_slide.notes_text_frame.text = (
        "Briefing Hook: During the House Committee on Energy hearing, the fundamental question was raised on why HVDC was selected over HVAC. "
        "This presentation breaks down the engineering physics, grid stability requirements, and consumer cost protections for both Luzon-Visayas and MVIP."
    )

    # =========================================================================
    # SLIDE 2: THE TWO STRATEGIC INTERCONNECTIONS OVERVIEW
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "The Two Strategic Interconnections Unifying the Archipelago", "GRID GEOGRAPHY & ARCHITECTURE")

    # Left Card: Luzon-Visayas (Leyte-Luzon)
    add_card(slide2, Inches(0.8), Inches(1.3), Inches(5.7), Inches(5.6))
    tb_l1 = slide2.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(5.3), Inches(5.2))
    tf_l1 = tb_l1.text_frame
    tf_l1.word_wrap = True

    p = tf_l1.paragraphs[0]
    p.text = "1. Luzon–Visayas (Leyte–Luzon Link)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_BLUE_DARK

    lv_details = [
        ("• Topology & Technology:", "±350 kV LCC-HVDC (Line-Commutated Converter), 440 MW rating (expandable to 880 MW)."),
        ("• Route Configuration:", "430 km overhead line (Ormoc to Naga) + 21 km subsea cable across the turbulent San Bernardino Strait (Allen to Matnog)."),
        ("• Primary Mission:", "Wheel bulk baseload geothermal power from Tongonan (Leyte) into the Luzon load center (Metro Manila & Southern Luzon)."),
        ("• The Core Challenge:", "Bridging a 450+ km distance while interconnecting a small island grid (Visayas, ~2,000 MW) into a large mainland grid (Luzon, ~15,000 MW).")
    ]
    for dt, dd in lv_details:
        p1 = tf_l1.add_paragraph()
        p1.text = dt
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK
        p1.space_before = Pt(8)

        p2 = tf_l1.add_paragraph()
        p2.text = dd
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    # Right Card: Mindanao-Visayas (MVIP)
    add_card(slide2, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.6))
    tb_l2 = slide2.shapes.add_textbox(Inches(7.0), Inches(1.5), Inches(5.3), Inches(5.2))
    tf_l2 = tb_l2.text_frame
    tf_l2.word_wrap = True

    p = tf_l2.paragraphs[0]
    p.text = "2. Mindanao–Visayas (MVIP Link)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    mv_details = [
        ("• Topology & Technology:", "±350 kV VSC-HVDC (Voltage Source Converter - MMC), 450 MW bi-pole (900 MW total capacity)."),
        ("• Route Configuration:", "526 km overhead lines + 92 km submarine cable across the 650m-deep Bohol Sea (Santander, Cebu to Dapitan, Zamboanga del Norte)."),
        ("• Primary Mission:", "Complete 'One Grid Philippines' by enabling bi-directional power sharing (hydro, solar, baseload) between Mindanao and the Visayas/Luzon WESM."),
        ("• The Core Challenge:", "Traversing 92 km of ultra-deep water (650m) where submarine AC cable capacitance causes severe thermal and reactive choking.")
    ]
    for dt, dd in mv_details:
        p1 = tf_l2.add_paragraph()
        p1.text = dt
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK
        p1.space_before = Pt(8)

        p2 = tf_l2.add_paragraph()
        p2.text = dd
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    slide2.notes_slide.notes_text_frame.text = (
        "Overview: The Philippine grid relies on two primary HVDC backbones: Leyte-Luzon (440 MW LCC) commissioned in 1998, "
        "and MVIP (450 MW VSC) commissioned recently. Both face unique topographical and electrical challenges."
    )

    # =========================================================================
    # SLIDE 3: LUZON–VISAYAS CASE STUDY: WHY HVAC FAILS OVER 450 KM
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Luzon–Visayas Link: Why HVAC Causes Dynamic Grid Collapse", "CASE STUDY 1: 450 KM LONG-DISTANCE INTERCONNECTION")

    # Left: HVAC Synchronous Failure Mechanism
    add_card(slide3, Inches(0.8), Inches(1.3), Inches(5.7), Inches(5.6), C_ROSE_BG, C_ROSE)
    tb_lv1 = slide3.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(5.3), Inches(5.2))
    tf_lv1 = tb_lv1.text_frame
    tf_lv1.word_wrap = True

    p = tf_lv1.paragraphs[0]
    p.text = "⚠️ Why Synchronous 230kV HVAC Fails"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = C_ROSE

    hvac_lv_issues = [
        ("1. Inter-Area Power Oscillations (0.2 – 0.5 Hz):", "Tying the massive Luzon system to the small Visayas system via synchronous AC creates severe low-frequency power swings that cause generators to lose synchronism."),
        ("2. Power Transfer Angle Bottleneck:", "Over a 450 km AC transmission corridor, the electrical power angle (δ) exceeds safe limits (δ > 35°), severely restricting stable power transfer well below thermal ratings."),
        ("3. High Fault Level Cascades:", "A short circuit or lightning strike in South Luzon (Bicol) immediately depresses Visayas voltage, tripping sensitive geothermal units in Leyte and collapsing the Visayas grid."),
        ("4. San Bernardino Strait Currents:", "Dynamic sea currents in the 21 km strait make heavy 3-phase AC armored cables vulnerable to mechanical stress and dielectric fatigue.")
    ]
    for t_txt, d_txt in hvac_lv_issues:
        p1 = tf_lv1.add_paragraph()
        p1.text = t_txt
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK
        p1.space_before = Pt(6)

        p2 = tf_lv1.add_paragraph()
        p2.text = d_txt
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_MUTED

    # Right: HVDC Solution & Performance
    add_card(slide3, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.6), C_EMERALD_BG, C_EMERALD)
    tb_lv2 = slide3.shapes.add_textbox(Inches(7.0), Inches(1.5), Inches(5.3), Inches(5.2))
    tf_lv2 = tb_lv2.text_frame
    tf_lv2.word_wrap = True

    p = tf_lv2.paragraphs[0]
    p.text = "✅ How ±350kV HVDC Solved It"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD

    hvdc_lv_solutions = [
        ("1. Full Asynchronous Grid Decoupling:", "Luzon and Visayas operate at independent electrical frequencies and rotor angles. Disturbances in Luzon are stopped cold at Naga converter station."),
        ("2. Active Power Oscillation Damping (POD):", "HVDC controls modulate power flow in milliseconds to actively damp inter-area oscillations, stabilizing the entire Visayas grid."),
        ("3. Independent Power Flow Dispatch:", "Operators set exact MW import/export schedules (e.g. precisely 400 MW geothermal wheeling) unaffected by AC impedance or line angles."),
        ("4. 25+ Years of Proven Baseline Reliability:", "In service since 1998, Leyte–Luzon HVDC has been the single most reliable long-distance energy bridge in Philippine history.")
    ]
    for t_txt, d_txt in hvdc_lv_solutions:
        p1 = tf_lv2.add_paragraph()
        p1.text = t_txt
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK
        p1.space_before = Pt(6)

        p2 = tf_lv2.add_paragraph()
        p2.text = d_txt
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_MUTED

    slide3.notes_slide.notes_text_frame.text = (
        "Luzon-Visayas context: HVAC over 450 km is throttled by angular stability and inter-area oscillations. "
        "HVDC allows stable baseload geothermal export from Leyte without subjecting Visayas to Luzon grid faults."
    )

    # =========================================================================
    # SLIDE 4: MINDANAO–VISAYAS (MVIP): THE 92 KM SUBSEA PHYSICS BOTTLENECK
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "MVIP Link: The 92 km Subsea Cable Physics Bottleneck", "CASE STUDY 2: SUBSEA CAPACITANCE & CRITICAL LENGTH")

    # Left Card: Step-by-Step Physics Math
    add_card(slide4, Inches(0.8), Inches(1.3), Inches(5.7), Inches(5.6))
    tb_mv1 = slide4.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(5.3), Inches(5.2))
    tf_mv1 = tb_mv1.text_frame
    tf_mv1.word_wrap = True

    p = tf_mv1.paragraphs[0]
    p.text = "Mathematical Proof for 92 km Bohol Sea Span"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = C_BLUE_DARK

    formulas = [
        ("1. High Subsea Cable Capacitance:", "XLPE subsea cables have 20–25× higher capacitance than overhead lines:\nC = 0.22 µF/km (tight core-to-sheath spacing & εr ≈ 2.3)."),
        ("2. Continuous AC Charging Current (Ic):", "Ic = 2π · f · C · (VLL / √3)\nIc = 2π(60)(0.22×10⁻⁶)(230,000 / √3) = 11.01 A/km\nTotal Charging Current = 11.01 × 92 km = 1,013 Amperes!"),
        ("3. Reactive Power Generated (Qc):", "Qc = 2π · f · C · VLL² · L = 403.6 MVAR"),
        ("4. Critical Zero-Capacity Distance (Lcrit):", "Lcrit = Srated / (2π · f · C · VLL²) = 102.6 km\n(At 102.6 km, Usable Active MW collapses to exactly 0!)")
    ]
    for title, text in formulas:
        pt = tf_mv1.add_paragraph()
        pt.text = title
        pt.font.size = Pt(10.5)
        pt.font.bold = True
        pt.font.color.rgb = C_TEXT_DARK
        pt.space_before = Pt(6)

        pdesc = tf_mv1.add_paragraph()
        pdesc.text = text
        pdesc.font.size = Pt(9.5)
        pdesc.font.color.rgb = C_TEXT_MUTED

    # Right Card: Active Capacity Collapse & Deep Water Reality
    add_card(slide4, Inches(6.8), Inches(1.3), Inches(5.7), Inches(5.6))
    tb_mv2 = slide4.shapes.add_textbox(Inches(7.0), Inches(1.5), Inches(5.3), Inches(5.2))
    tf_mv2 = tb_mv2.text_frame
    tf_mv2.word_wrap = True

    p = tf_mv2.paragraphs[0]
    p.text = "Usable Active Capacity Collapse"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = C_ROSE

    p_eq = tf_mv2.add_paragraph()
    p_eq.text = "P_usable = √(S_rated² - Qc²) = √(450² - 403.6²) = 198.9 MW"
    p_eq.font.size = Pt(11.5)
    p_eq.font.bold = True
    p_eq.font.color.rgb = C_TEXT_DARK
    p_eq.space_before = Pt(4)

    # Alert Box inside Right Card
    add_card(slide4, Inches(7.0), Inches(2.6), Inches(5.3), Inches(4.1), C_ROSE_BG, C_ROSE)
    tb_alert = slide4.shapes.add_textbox(Inches(7.2), Inches(2.8), Inches(4.9), Inches(3.7))
    tfa = tb_alert.text_frame
    tfa.word_wrap = True

    pa1 = tfa.paragraphs[0]
    pa1.text = "⚠️ THE 650M DEEP-TRENCH IMPOSSIBILITY"
    pa1.font.size = Pt(11.5)
    pa1.font.bold = True
    pa1.font.color.rgb = C_ROSE

    bullets = [
        "• 56% Lost Capacity: Out of 450 MW line rating, only 198.9 MW can be transmitted across the Bohol Sea.",
        "• Deep-Sea Bathymetry (650m): In shallow seas (e.g. North Sea), AC links use intermediate offshore reactor platforms to cancel Qc. In the 650m-deep Bohol Sea trench and typhoon belt, building mid-sea platforms is impossible.",
        "• HVDC Zero-Frequency Advantage: In DC (f = 0), capacitive reactance is infinite (Xc = 1/(2πfC) → ∞). Charging current is ZERO (Ic = 0). HVDC delivers 100% full 450 MW capacity."
    ]
    for b in bullets:
        pb = tfa.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_TEXT_DARK
        pb.space_before = Pt(6)

    slide4.notes_slide.notes_text_frame.text = (
        "MVIP Subsea Physics: 92 km is near the theoretical limit (102.6 km) where an AC cable cannot carry any real power at all. "
        "HVDC completely eliminates charging current, unlocking 100% capacity in 650m deep waters."
    )

    # =========================================================================
    # SLIDE 5: SYSTEM LOSSES & ₱29.3B FINANCIAL IMPACT
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "System Losses & Capex: The ₱29.3 Billion Consumer Protection", "FINANCIAL & ECONOMIC VALUATION")

    # Left: Comparison Table
    table_shape = slide5.shapes.add_table(7, 3, Inches(0.8), Inches(1.35), Inches(7.5), Inches(5.4))
    table = table_shape.table
    table.columns[0].width = Inches(2.7)
    table.columns[1].width = Inches(2.4)
    table.columns[2].width = Inches(2.4)

    headers = ["Metric / Parameter", "HVDC (As Built)", "HVAC (What-If Alternate)"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_TEXT_DARK
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

    row_data = [
        ("Loss Mechanism", "Converter (1.8%) + DC I²R (0.8%)", "Conductor I²R (inflated) + Dielectric"),
        ("Active Power Losses (MW)", "5.23 MW (2.6% loss)", "28.09 MW (14.1% loss) [5.4× Higher!]"),
        ("Annual Energy Loss", "34.3 GWh / year", "184.5 GWh / year (+150.2 GWh wasted)"),
        ("Annual Loss Cost (@₱6.50/kWh)", "₱223.0 Million / year", "₱1,199.2 Million / year"),
        ("Annual System Loss Savings", "₱976.2 Million / year saved", "₱976.2M lost every year"),
        ("30-Year Lifecycle Loss Cost", "₱6.69 Billion ($119.5M)", "₱35.98 Billion ($642.5M) [₱29.29B Penalty]")
    ]

    for i, row in enumerate(row_data):
        for j, val in enumerate(row):
            cell = table.cell(i+1, j)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_WHITE if (i % 2 == 0) else C_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(9.5)
            p.font.color.rgb = C_TEXT_DARK
            if j == 1:
                p.font.bold = True
                p.font.color.rgb = C_EMERALD
            elif j == 2:
                p.font.bold = True
                p.font.color.rgb = C_ROSE

    # Right: Summary Highlight Cards
    add_card(slide5, Inches(8.6), Inches(1.35), Inches(3.9), Inches(2.6), C_EMERALD_BG, C_EMERALD)
    tb_r1 = slide5.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.5), Inches(2.3))
    tfr1 = tb_r1.text_frame
    tfr1.word_wrap = True
    
    pr1 = tfr1.paragraphs[0]
    pr1.text = "₱29.29 BILLION"
    pr1.font.size = Pt(18)
    pr1.font.bold = True
    pr1.font.color.rgb = C_EMERALD

    pr2 = tfr1.add_paragraph()
    pr2.text = "30-Year Consumer Protection"
    pr2.font.size = Pt(11)
    pr2.font.bold = True
    pr2.font.color.rgb = C_TEXT_DARK
    pr2.space_before = Pt(3)

    pr3 = tfr1.add_paragraph()
    pr3.text = "Under EPIRA regulations, transmission losses are recovered from end-users. HVDC saved Philippine consumers ₱29.3B in cumulative electricity bills."
    pr3.font.size = Pt(9.5)
    pr3.font.color.rgb = C_TEXT_MUTED
    pr3.space_before = Pt(3)

    # Capex Card
    add_card(slide5, Inches(8.6), Inches(4.15), Inches(3.9), Inches(2.6), C_WHITE, C_CARD_BORDER)
    tb_r2 = slide5.shapes.add_textbox(Inches(8.8), Inches(4.3), Inches(3.5), Inches(2.3))
    tfr2 = tb_r2.text_frame
    tfr2.word_wrap = True

    pr4 = tfr2.paragraphs[0]
    pr4.text = "ERC CAPEX COMPARISON"
    pr4.font.size = Pt(14)
    pr4.font.bold = True
    pr4.font.color.rgb = C_BLUE_DARK

    pr5 = tfr2.add_paragraph()
    pr5.text = "• MVIP Approved Capex (ERC Case 2017-057 RC): ₱51.30 Billion\n• HVAC What-If Equivalent: ~₱64.70 Billion (+₱13.4B / +26% due to 6 subsea cable circuits, STATCOMs, and offshore platforms)."
    pr5.font.size = Pt(9.5)
    pr5.font.color.rgb = C_TEXT_DARK
    pr5.space_before = Pt(4)

    slide5.notes_slide.notes_text_frame.text = (
        "Economic Summary: HVAC losses are 5.4× higher than HVDC. "
        "Over 30 years, an HVAC link would have added ₱29.29 Billion in unnecessary system loss charges to consumer electric bills."
    )

    # =========================================================================
    # SLIDE 6: GRID STABILITY & ASYNCHRONOUS FIREWALLING
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Grid Stability: The Asynchronous Blackout Firewall", "SYSTEM DYNAMICS & RESILIENCE")

    # Left: HVAC Cascading Blackout Threat
    add_card(slide6, Inches(0.8), Inches(1.35), Inches(5.7), Inches(5.4), C_ROSE_BG, C_ROSE)
    tb_s1 = slide6.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(5.3), Inches(5.1))
    tfs1 = tb_s1.text_frame
    tfs1.word_wrap = True

    ps1 = tfs1.paragraphs[0]
    ps1.text = "HVAC: Synchronous Collapse Risk"
    ps1.font.size = Pt(13.5)
    ps1.font.bold = True
    ps1.font.color.rgb = C_ROSE

    hvac_threats = [
        ("1. Rigid Synchronous Entanglement:", "Luzon, Visayas, and Mindanao are locked at the exact same electrical angle. A generator trip in Panay or Batangas immediately destabilizes all 3 grids."),
        ("2. Cascading Out-of-Step Generator Trips:", "Sudden generation deficits cause frequency dips and power swings (δ > 90°), triggering under-frequency relays across all island boundaries."),
        ("3. Ferranti Voltage Surges:", "Lightly loaded subsea AC cables generate intense Ferranti overvoltages (>1.25 p.u.), threatening substation insulation and transformer safety."),
        ("4. Total Pan-Island Blackout:", "Faults in one regional grid propagate synchronously, taking down the entire national power backbone.")
    ]
    for st, sd in hvac_threats:
        p = tfs1.add_paragraph()
        p.text = st
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(5)

        pd = tfs1.add_paragraph()
        pd.text = sd
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = C_TEXT_MUTED

    # Right: HVDC Asynchronous Firewall Protection
    add_card(slide6, Inches(6.8), Inches(1.35), Inches(5.7), Inches(5.4), C_EMERALD_BG, C_EMERALD)
    tb_s2 = slide6.shapes.add_textbox(Inches(7.0), Inches(1.5), Inches(5.3), Inches(5.1))
    tfs2 = tb_s2.text_frame
    tfs2.word_wrap = True

    ps2 = tfs2.paragraphs[0]
    ps2.text = "HVDC: The Asynchronous Firewall"
    ps2.font.size = Pt(13.5)
    ps2.font.bold = True
    ps2.font.color.rgb = C_EMERALD

    hvdc_benefits = [
        ("1. Island Frequency Decoupling:", "Luzon, Visayas, and Mindanao run on independent frequencies. A severe fault or generator trip in one grid NEVER drags down the others."),
        ("2. Fast Frequency Response (<50 ms):", "When Visayas suffers a 300 MW generator trip, the VSC-HVDC link automatically injects spinning reserves from Mindanao in milliseconds."),
        ("3. Dynamic STATCOM Voltage Support:", "VSC Modular Multilevel Converters supply ±200 MVAR of dynamic reactive power to stabilize island voltages at 1.00 p.u. 24/7."),
        ("4. True Black-Start Capability:", "If Cebu or Mindanao suffers a complete blackout, the MVIP link can energize dead busbars and restart the entire regional grid.")
    ]
    for bt, bd in hvdc_benefits:
        p = tfs2.add_paragraph()
        p.text = bt
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(5)

        pd = tfs2.add_paragraph()
        pd.text = bd
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = C_TEXT_MUTED

    slide6.notes_slide.notes_text_frame.text = (
        "Grid Resilience: HVDC serves as an asynchronous firewall. "
        "It stops power surges from cascading into neighboring island grids, keeping the national grid resilient."
    )

    # =========================================================================
    # SLIDE 7: SUMMARY SCORECARD & CONGRESSIONAL VERDICT
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Comparative Scorecard & Briefing Conclusion", "EXECUTIVE SUMMARY & DECISION SCORECARD")

    # Scorecard Table
    t7_shape = slide7.shapes.add_table(8, 3, Inches(0.8), Inches(1.35), Inches(7.5), Inches(5.4))
    t7 = t7_shape.table
    t7.columns[0].width = Inches(2.6)
    t7.columns[1].width = Inches(2.45)
    t7.columns[2].width = Inches(2.45)

    headers7 = ["Decision Criteria", "HVDC (Luzon–Vis & MVIP)", "HVAC (What-If Alternate)"]
    for j, h in enumerate(headers7):
        cell = t7.cell(0, j)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_TEXT_DARK
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

    scorecard_data = [
        ("Transfer Capacity", "100% Full Thermal Rating (900MW)", "Collapsed by 56% (Reactive Choking) ❌"),
        ("Subsea Cable Charging", "0 A (No continuous Ic)", "1,013 A (Thermal Saturation) ❌"),
        ("Luzon–Vis Stability", "Decoupled (Active Damping)", "Inter-Area Oscillations & Trips ❌"),
        ("MVIP System Losses", "2.6% (5.23 MW)", "14.1% (28.09 MW, 5.4× Higher) ❌"),
        ("30-Year Loss Cost", "₱6.69 Billion", "₱35.98 Billion (+₱29.29B Wasted) ❌"),
        ("Total Project Capex", "₱51.30B (Approved ERC Capex)", "₱64.70B (+₱13.4B Capex Premium) ❌"),
        ("Deep-Water Reality (650m)", "100% Feasible (XLPE Subsea)", "Impossible (Platform in 650m trench) ❌")
    ]

    for i, row in enumerate(scorecard_data):
        for j, val in enumerate(row):
            cell = t7.cell(i+1, j)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_WHITE if (i % 2 == 0) else C_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(9)
            p.font.color.rgb = C_TEXT_DARK
            if j == 1:
                p.font.bold = True
                p.font.color.rgb = C_EMERALD
            elif j == 2:
                p.font.bold = True
                p.font.color.rgb = C_ROSE

    # Right: Executive Conclusion Card
    add_card(slide7, Inches(8.6), Inches(1.35), Inches(3.9), Inches(5.4), C_BLUE_BG, C_BLUE)
    tb_c7 = slide7.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.5), Inches(5.0))
    tfc7 = tb_c7.text_frame
    tfc7.word_wrap = True

    p7_1 = tfc7.paragraphs[0]
    p7_1.text = "CONGRESSIONAL SUMMARY"
    p7_1.font.size = Pt(13.5)
    p7_1.font.bold = True
    p7_1.font.color.rgb = C_BLUE_DARK

    points7 = [
        "1. Physical Feasibility: HVAC over 92 km (Bohol Sea) or 450 km (Luzon–Visayas) fails due to charging current and dynamic stability limits.",
        "2. Consumer Protection: HVDC prevents over ₱29.3 Billion in system loss charges from burdening Philippine power bills.",
        "3. Grid Security: Asynchronous firewalling prevents cascading blackouts across island boundaries.",
        "Verdict: NGCP's choice of HVDC for both links was an engineering imperative that successfully realized 'One Grid Philippines'."
    ]
    for pt in points7:
        p = tfc7.add_paragraph()
        p.text = pt
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(6)

    slide7.notes_slide.notes_text_frame.text = (
        "Final Briefing Note: HVDC is the only technically and financially viable technology for uniting the Philippine grid. "
        "Visit the interactive simulator at https://polyphase123.github.io/HVDCngcp/ to test any cable parameter live."
    )

    output_path = "/Users/franzxyrloi.tobias/Desktop/github/HVDC/What_If_NGCP_Installed_HVAC_Analysis.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_hvac_whatif_pptx()

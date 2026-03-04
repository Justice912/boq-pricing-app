import type { Industry } from "@/types";

export const INDUSTRIES: Industry[] = [
  // ─────────────────────────────────────────────────────────
  // 1. Building Construction
  // ─────────────────────────────────────────────────────────
  {
    id: "building-construction",
    name: "Building Construction",
    description:
      "New-build residential, commercial, and institutional building projects including all wet and dry trades.",
    icon: "building-2",
    standards: ["ASAQS Model Preambles for Building Works", "NRM2"],
    typicalPreliminariesPct: "12-15%",
    measurementNotes:
      "Measure in accordance with ASAQS Model Preambles. All dimensions are net in-place unless stated otherwise. Deductions for openings follow standard preamble rules.",
    trades: [
      {
        sectionNo: "A",
        name: "Earthworks",
        defaultItems: [
          { description: "Clear site of vegetation and debris", unit: "m²" },
          { description: "Excavate to reduce levels, average 300 mm deep, cart away", unit: "m³" },
          { description: "Excavate trenches for strip footings not exceeding 1.5 m deep", unit: "m³" },
          { description: "Backfill with selected excavated material and compact in 150 mm layers", unit: "m³" },
          { description: "Imported filling material (G5 quality) compacted to 93% Mod AASHTO", unit: "m³" },
          { description: "Cart away surplus excavated material to a dump (allow 12 km)", unit: "m³" },
        ],
      },
      {
        sectionNo: "B",
        name: "Concrete & Formwork",
        defaultItems: [
          { description: "Surface bed, 25 MPa/19 mm concrete, 100 mm thick on 250 micron DPM", unit: "m²" },
          { description: "Strip footings, 25 MPa/19 mm concrete", unit: "m³" },
          { description: "Pad bases, 30 MPa/19 mm concrete", unit: "m³" },
          { description: "Reinforced concrete suspended slab, 30 MPa/19 mm, 170 mm thick", unit: "m²" },
          { description: "Reinforced concrete columns, 30 MPa/19 mm, 300 x 300 mm", unit: "m" },
          { description: "Reinforced concrete beams, 30 MPa/19 mm, 230 x 450 mm", unit: "m" },
          { description: "Rough formwork to sides of strip footings, not exceeding 500 mm high", unit: "m²" },
          { description: "Smooth formwork to soffits of suspended slabs, 2.8–3.5 m high", unit: "m²" },
        ],
      },
      {
        sectionNo: "C",
        name: "Reinforcement",
        defaultItems: [
          { description: "High-tensile steel reinforcement, 10 mm diameter", unit: "kg" },
          { description: "High-tensile steel reinforcement, 12 mm diameter", unit: "kg" },
          { description: "High-tensile steel reinforcement, 16 mm diameter", unit: "kg" },
          { description: "High-tensile steel reinforcement, 20 mm diameter", unit: "kg" },
          { description: "Mild steel reinforcement, 8 mm diameter stirrups/links", unit: "kg" },
          { description: "Ref 193 mesh reinforcement in surface beds", unit: "m²" },
        ],
      },
      {
        sectionNo: "D",
        name: "Masonry",
        defaultItems: [
          { description: "Walls, one brick thick (220 mm), FBS facework one side", unit: "m²" },
          { description: "Walls, half brick thick (110 mm), NFP stock bricks", unit: "m²" },
          { description: "Walls, half brick thick (110 mm), FBS facework both sides", unit: "m²" },
          { description: "Extra over brickwork for facework, FBS imperial size", unit: "m²" },
          { description: "Precast concrete lintels, 110 x 75 mm, reinforced", unit: "m" },
          { description: "DPC, 375 micron polyethylene, 230 mm wide", unit: "m" },
          { description: "Cavity wall ties, galvanised, at 450 mm centres", unit: "nr" },
        ],
      },
      {
        sectionNo: "E",
        name: "Waterproofing",
        defaultItems: [
          { description: "Waterproofing membrane to roof slab, torch-on, two-layer system", unit: "m²" },
          { description: "Waterproofing to concrete basement walls, bituminous coating", unit: "m²" },
          { description: "Waterproofing to shower floors, cementitious slurry system", unit: "m²" },
          { description: "Aluminium flashing, 0.6 mm thick, 300 mm girth", unit: "m" },
          { description: "Vapour barrier, 250 micron polyethylene sheeting", unit: "m²" },
        ],
      },
      {
        sectionNo: "F",
        name: "Roofing",
        defaultItems: [
          { description: "Roof covering, concrete roof tiles on battens and counter-battens", unit: "m²" },
          { description: "Galvanised IBR sheeting, 0.5 mm thick, Chromadek finish", unit: "m²" },
          { description: "Ridge cappings to match sheeting", unit: "m" },
          { description: "Roof insulation, 135 mm aerolite or equivalent", unit: "m²" },
          { description: "Roof underlay, sisalation or breather membrane", unit: "m²" },
          { description: "uPVC half-round gutter, 112 mm diameter", unit: "m" },
          { description: "uPVC downpipe, 75 mm diameter including clips", unit: "m" },
        ],
      },
      {
        sectionNo: "G",
        name: "Carpentry & Joinery",
        defaultItems: [
          { description: "Roof trusses, SA pine, gang-nail type at 760 mm centres", unit: "m²" },
          { description: "SA pine brandering, 38 x 38 mm at 400 mm centres", unit: "m²" },
          { description: "Door frames, hardwood, 113 x 70 mm rebated", unit: "nr" },
          { description: "Hollow core flush door, 813 x 2 032 mm, painted finish", unit: "nr" },
          { description: "Solid core flush door, 813 x 2 032 mm, veneered finish", unit: "nr" },
          { description: "Kitchen cupboard units, melamine-faced chipboard, complete", unit: "m" },
          { description: "Built-in wardrobe, melamine-faced chipboard, full height", unit: "m" },
        ],
      },
      {
        sectionNo: "H",
        name: "Ironmongery",
        defaultItems: [
          { description: "Stainless steel butt hinges, 100 mm, one-and-a-half pair per door", unit: "set" },
          { description: "Lever handle set, aluminium, on rose", unit: "set" },
          { description: "Mortice lock, 3-lever", unit: "nr" },
          { description: "Cylindrical lockset, stainless steel", unit: "nr" },
          { description: "Door closer, overhead hydraulic, size 3", unit: "nr" },
          { description: "Cabin hook, stainless steel, 150 mm", unit: "nr" },
        ],
      },
      {
        sectionNo: "I",
        name: "Structural Steel",
        defaultItems: [
          { description: "Universal beams (UB), Grade 300W, mass 40-60 kg/m", unit: "t" },
          { description: "Universal columns (UC), Grade 300W, mass 40-80 kg/m", unit: "t" },
          { description: "Parallel flange channel (PFC), Grade 300W", unit: "t" },
          { description: "Equal angle sections, Grade 300W", unit: "t" },
          { description: "Base plates, 20 mm thick including 4nr HD bolts per plate", unit: "nr" },
          { description: "Holding down bolt assemblies, M20 x 600 mm long", unit: "nr" },
        ],
      },
      {
        sectionNo: "J",
        name: "Metalwork",
        defaultItems: [
          { description: "Mild steel balustrade, 1 000 mm high, with vertical balusters", unit: "m" },
          { description: "Mild steel handrail, 50 mm diameter", unit: "m" },
          { description: "Steel staircase, straight flight, 1 000 mm wide, complete", unit: "nr" },
          { description: "Expanded metal walkway grating, galvanised, 32 x 5 mm bearing bars", unit: "m²" },
          { description: "Burglar bars, mild steel, 12 mm square verticals at 100 mm centres", unit: "m²" },
        ],
      },
      {
        sectionNo: "K",
        name: "Plastering",
        defaultItems: [
          { description: "Plaster to walls, 12 mm cement plaster, floated finish", unit: "m²" },
          { description: "Plaster to soffits, 12 mm cement plaster, smooth finish", unit: "m²" },
          { description: "Dubbing out, average 12 mm thick to uneven surfaces", unit: "m²" },
          { description: "Plaster angle beads, galvanised, to external corners", unit: "m" },
          { description: "Coved cornice, fibrous plaster, 75 mm girth", unit: "m" },
          { description: "Skim coat, 3 mm thick on concrete surfaces", unit: "m²" },
        ],
      },
      {
        sectionNo: "L",
        name: "Tiling",
        defaultItems: [
          { description: "Ceramic floor tiles, 400 x 400 mm, fixed with adhesive on screed", unit: "m²" },
          { description: "Ceramic wall tiles, 200 x 300 mm, fixed with adhesive on plaster", unit: "m²" },
          { description: "Porcelain floor tiles, 600 x 600 mm, rectified, fixed with adhesive", unit: "m²" },
          { description: "Tile skirting, 100 mm high, cut from floor tiles", unit: "m" },
          { description: "Tile trim, stainless steel, to external edges", unit: "m" },
          { description: "Floor screed, 40 mm thick, 1:4 cement-sand mix, steel floated", unit: "m²" },
        ],
      },
      {
        sectionNo: "M",
        name: "Plumbing & Drainage",
        defaultItems: [
          { description: "110 mm uPVC drain pipe in trench, including bedding", unit: "m" },
          { description: "160 mm uPVC drain pipe in trench, including bedding", unit: "m" },
          { description: "Manhole, 600 x 450 mm internal, depth 750 mm, Class B engineering bricks", unit: "nr" },
          { description: "15 mm copper pipe, concealed in wall chase", unit: "m" },
          { description: "22 mm copper pipe, concealed in wall chase", unit: "m" },
          { description: "WC suite, close-coupled, white vitreous china, complete with seat", unit: "nr" },
          { description: "Wash hand basin, 550 x 400 mm, white vitreous china, with pedestal", unit: "nr" },
          { description: "150-litre electric geyser, complete with thermostat and safety valve", unit: "nr" },
        ],
      },
      {
        sectionNo: "N",
        name: "Glazing",
        defaultItems: [
          { description: "4 mm clear float glass to steel windows", unit: "m²" },
          { description: "6.38 mm laminated safety glass to aluminium frames", unit: "m²" },
          { description: "Aluminium window frames, powder coated, standard sections", unit: "m²" },
          { description: "Aluminium sliding door, 2-panel, 1 800 x 2 100 mm", unit: "nr" },
          { description: "Frameless glass shower door, 8 mm toughened, 900 mm wide", unit: "nr" },
        ],
      },
      {
        sectionNo: "O",
        name: "Painting",
        defaultItems: [
          { description: "Prepare and paint plastered walls, one mist coat and two coats PVA", unit: "m²" },
          { description: "Prepare and paint plastered ceilings, one mist coat and two coats PVA", unit: "m²" },
          { description: "Prepare and paint timber doors, one primer and two coats enamel", unit: "m²" },
          { description: "Prepare and paint steel windows, one primer and two coats enamel", unit: "m²" },
          { description: "External textured coating to plastered walls, two coats", unit: "m²" },
          { description: "Varnish to hardwood surfaces, three coats polyurethane", unit: "m²" },
        ],
      },
      {
        sectionNo: "P",
        name: "Electrical",
        defaultItems: [
          { description: "Distribution board, 12-way, single phase, with main switch", unit: "nr" },
          { description: "Single power point, complete with wiring back to DB", unit: "nr" },
          { description: "Double power point, complete with wiring back to DB", unit: "nr" },
          { description: "Light point, complete with wiring, switch, and LED downlight", unit: "nr" },
          { description: "Fluorescent fitting, 2 x 36 W, surface mounted", unit: "nr" },
          { description: "Earth leakage relay, 40 A, 30 mA sensitivity", unit: "nr" },
          { description: "Prepaid electricity meter, single phase", unit: "nr" },
        ],
      },
      {
        sectionNo: "Q",
        name: "External Works",
        defaultItems: [
          { description: "Paving, 50 mm interlocking concrete blocks on 25 mm sand bed", unit: "m²" },
          { description: "Concrete kerbing, fig. 2 standard kerb, including haunching", unit: "m" },
          { description: "Precast concrete palisade fencing, 1 800 mm high", unit: "m" },
          { description: "Galvanised steel driveway gate, 3 000 mm wide x 1 800 mm high", unit: "nr" },
          { description: "Topsoil, 150 mm thick, levelled and compacted", unit: "m²" },
          { description: "Instant lawn (roll-on turf), cultivated and laid", unit: "m²" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. Civil Engineering
  // ─────────────────────────────────────────────────────────
  {
    id: "civil-engineering",
    name: "Civil Engineering",
    description:
      "Infrastructure projects including roads, bridges, stormwater management, and bulk services reticulation.",
    icon: "construction",
    standards: [
      "ASAQS Model Preambles for Civil Engineering Works",
      "COLTO",
      "SANS",
    ],
    typicalPreliminariesPct: "15-20%",
    measurementNotes:
      "Measure in accordance with COLTO standard specifications and ASAQS Civil Preambles. Earthworks measured as compacted volumes unless stated otherwise. Pipe trenches measured by linear metre inclusive of bedding class.",
    trades: [
      {
        sectionNo: "A",
        name: "Site Clearance",
        defaultItems: [
          { description: "Clear and grub site of all vegetation, trees, and scrub", unit: "ha" },
          { description: "Remove existing structures and foundations, cart away debris", unit: "sum" },
          { description: "Strip topsoil, average 150 mm deep, stockpile for re-use", unit: "m³" },
          { description: "Removal of existing fencing", unit: "m" },
          { description: "Relocate existing services (provisional allowance)", unit: "sum" },
        ],
      },
      {
        sectionNo: "B",
        name: "Earthworks",
        defaultItems: [
          { description: "Cut to fill, all materials, haul distance not exceeding 1.0 km", unit: "m³" },
          { description: "Imported fill, G5 quality, compacted to 93% Mod AASHTO", unit: "m³" },
          { description: "Imported fill, G7 quality, compacted to 90% Mod AASHTO", unit: "m³" },
          { description: "Spoil, haul to approved spoil site (allow 15 km)", unit: "m³" },
          { description: "In-situ treatment of roadbed, rip, water and compact to 93% Mod AASHTO", unit: "m²" },
          { description: "Proof rolling of formation level", unit: "m²" },
        ],
      },
      {
        sectionNo: "C",
        name: "Roadworks",
        defaultItems: [
          { description: "Subbase layer, G4 natural gravel, 150 mm thick, compacted to 95% Mod AASHTO", unit: "m³" },
          { description: "Base layer, G2 crushed stone, 150 mm thick, compacted to 98% Mod AASHTO", unit: "m³" },
          { description: "Prime coat, MC-30 cutback bitumen at 0.7 l/m²", unit: "m²" },
          { description: "Asphalt surfacing, continuously graded medium, 40 mm thick", unit: "m²" },
          { description: "Tack coat, stable grade 60% emulsion at 0.3 l/m²", unit: "m²" },
          { description: "Concrete kerb and channel, fig. 2, cast in-situ", unit: "m" },
          { description: "Concrete sidewalk, 100 mm thick, 25 MPa, with 1.5 m width", unit: "m²" },
        ],
      },
      {
        sectionNo: "D",
        name: "Stormwater Drainage",
        defaultItems: [
          { description: "450 mm diameter HDPE stormwater pipe, including bedding and backfill", unit: "m" },
          { description: "600 mm diameter concrete stormwater pipe, Class 75D, including bedding", unit: "m" },
          { description: "900 mm diameter concrete stormwater pipe, Class 75D, including bedding", unit: "m" },
          { description: "Precast concrete manhole, 1 000 mm internal diameter, complete", unit: "nr" },
          { description: "Precast concrete catchpit, 900 x 600 mm, with grating", unit: "nr" },
          { description: "V-drain, precast concrete, 300 mm wide", unit: "m" },
          { description: "Stone pitching, 200 mm thick, grouted", unit: "m²" },
        ],
      },
      {
        sectionNo: "E",
        name: "Sewer Reticulation",
        defaultItems: [
          { description: "160 mm diameter uPVC sewer pipe, Class 34, including bedding", unit: "m" },
          { description: "200 mm diameter uPVC sewer pipe, Class 34, including bedding", unit: "m" },
          { description: "Precast concrete manhole, 750 mm internal diameter, complete", unit: "nr" },
          { description: "Precast concrete manhole, 1 000 mm internal diameter, complete", unit: "nr" },
          { description: "Connection to existing sewer main (provisional)", unit: "nr" },
          { description: "Pipe trench excavation in rock (if encountered)", unit: "m³" },
        ],
      },
      {
        sectionNo: "F",
        name: "Water Reticulation",
        defaultItems: [
          { description: "110 mm diameter HDPE water pipe, Class 12, including fittings", unit: "m" },
          { description: "160 mm diameter HDPE water pipe, Class 12, including fittings", unit: "m" },
          { description: "Fire hydrant assembly, complete with valve and concrete surround", unit: "nr" },
          { description: "Gate valve, 110 mm diameter, complete with valve chamber", unit: "nr" },
          { description: "Thrust blocks, 25 MPa concrete, at bends and tees", unit: "m³" },
          { description: "Connection to existing municipal main (provisional)", unit: "nr" },
          { description: "Pressure testing and sterilisation of completed pipeline", unit: "sum" },
        ],
      },
      {
        sectionNo: "G",
        name: "Concrete Structures",
        defaultItems: [
          { description: "Structural concrete, 30 MPa/19 mm, to culvert base slab", unit: "m³" },
          { description: "Structural concrete, 30 MPa/19 mm, to culvert walls", unit: "m³" },
          { description: "Structural concrete, 30 MPa/19 mm, to culvert top slab", unit: "m³" },
          { description: "High-tensile reinforcement, 16 mm and 20 mm diameter", unit: "kg" },
          { description: "Formwork to vertical surfaces, smooth finish", unit: "m²" },
          { description: "Precast concrete headwall, complete", unit: "nr" },
        ],
      },
      {
        sectionNo: "H",
        name: "Guardrails & Road Furniture",
        defaultItems: [
          { description: "W-beam guardrail, galvanised steel, including posts at 2 m centres", unit: "m" },
          { description: "Guardrail terminal end, flared type", unit: "nr" },
          { description: "Road studs (cat eyes), reflective, bi-directional", unit: "nr" },
          { description: "Road signs, Class 1 reflective, including post and foundation", unit: "nr" },
          { description: "Delineator posts, 1 200 mm high, reflective", unit: "nr" },
        ],
      },
      {
        sectionNo: "I",
        name: "Line Marking",
        defaultItems: [
          { description: "Continuous centre line, 100 mm wide, thermoplastic, white", unit: "m" },
          { description: "No-passing barrier line, 100 mm wide, thermoplastic, yellow", unit: "m" },
          { description: "Edge line, 100 mm wide, thermoplastic, yellow", unit: "m" },
          { description: "Stop line, 300 mm wide, thermoplastic, white", unit: "m" },
          { description: "Painted road markings, text and symbols", unit: "nr" },
        ],
      },
      {
        sectionNo: "J",
        name: "Landscaping & Rehabilitation",
        defaultItems: [
          { description: "Topsoil, imported, 150 mm thick spread and levelled", unit: "m²" },
          { description: "Hydro-seeding with indigenous grass mix", unit: "m²" },
          { description: "Erosion control blanket, biodegradable", unit: "m²" },
          { description: "Indigenous tree planting, 50-litre container size, including tree guard", unit: "nr" },
          { description: "Gabion basket retaining, 1 000 x 1 000 x 2 000 mm, stone-filled", unit: "m³" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. Plumbing & Drainage
  // ─────────────────────────────────────────────────────────
  {
    id: "plumbing-drainage",
    name: "Plumbing & Drainage",
    description:
      "Specialist plumbing installations including water reticulation, drainage, sanitary fittings, gas, and solar water heating.",
    icon: "droplets",
    standards: ["SANS 10252", "SANS 10254", "SANS 10400-P"],
    typicalPreliminariesPct: "10-14%",
    measurementNotes:
      "Measure pipe runs in linear metres, fittings enumerated separately. All pipe sizes refer to nominal bore unless stated otherwise. Sanitary fittings measured complete with waste, trap, and fixing accessories.",
    trades: [
      {
        sectionNo: "A",
        name: "Above-Ground Drainage",
        defaultItems: [
          { description: "50 mm diameter HDPE soil and waste pipe, fixed to wall with brackets", unit: "m" },
          { description: "110 mm diameter uPVC soil stack, fixed to wall with brackets", unit: "m" },
          { description: "110 mm uPVC vent pipe through roof, with cowl", unit: "nr" },
          { description: "50 mm bottle trap, chrome plated, 75 mm seal", unit: "nr" },
          { description: "110 x 50 mm boss connector, solvent weld", unit: "nr" },
          { description: "Floor drain, 110 mm, stainless steel grating, complete", unit: "nr" },
        ],
      },
      {
        sectionNo: "B",
        name: "Below-Ground Drainage",
        defaultItems: [
          { description: "110 mm diameter uPVC underground drain pipe in trench, 600 mm deep, including bedding", unit: "m" },
          { description: "160 mm diameter uPVC underground drain pipe in trench, 750 mm deep, including bedding", unit: "m" },
          { description: "Inspection eye, 110 mm, PVC, at ground level", unit: "nr" },
          { description: "Gully trap, 110 mm, PVC, with grid", unit: "nr" },
          { description: "Grease trap, precast concrete, 450 x 450 mm, complete", unit: "nr" },
          { description: "Break pressure manhole, brick, 450 x 450 mm internal", unit: "nr" },
        ],
      },
      {
        sectionNo: "C",
        name: "Cold Water Installation",
        defaultItems: [
          { description: "15 mm diameter copper pipe, Type B, concealed in chase", unit: "m" },
          { description: "22 mm diameter copper pipe, Type B, concealed in chase", unit: "m" },
          { description: "15 mm gate valve, brass, with handwheel", unit: "nr" },
          { description: "22 mm gate valve, brass, with handwheel", unit: "nr" },
          { description: "15 mm non-return valve, brass", unit: "nr" },
          { description: "Water meter, 20 mm, including connection to municipal supply", unit: "nr" },
          { description: "Pressure reducing valve, 22 mm, preset to 400 kPa", unit: "nr" },
        ],
      },
      {
        sectionNo: "D",
        name: "Hot Water Installation",
        defaultItems: [
          { description: "15 mm diameter copper pipe, Type B, concealed in chase, with lagging", unit: "m" },
          { description: "22 mm diameter copper pipe, Type B, concealed in chase, with lagging", unit: "m" },
          { description: "150-litre electric geyser, horizontal, including thermostat and T&P valve", unit: "nr" },
          { description: "200-litre electric geyser, vertical, including thermostat and T&P valve", unit: "nr" },
          { description: "Geyser drip tray, 600 x 600 mm, GRP, with overflow connection", unit: "nr" },
          { description: "Vacuum breaker, 15 mm, on geyser cold feed", unit: "nr" },
        ],
      },
      {
        sectionNo: "E",
        name: "Sanitary Fittings",
        defaultItems: [
          { description: "WC suite, close-coupled, white vitreous china, with seat and mechanism", unit: "nr" },
          { description: "Wall-hung WC pan with concealed cistern and flush plate", unit: "nr" },
          { description: "Wash hand basin, 550 x 400 mm, white vitreous china, pedestal mounted", unit: "nr" },
          { description: "Vanity basin, 600 mm, undermount, white vitreous china", unit: "nr" },
          { description: "Bath, 1 700 x 700 mm, pressed steel, white enamel", unit: "nr" },
          { description: "Shower mixer, single lever, chrome plated, with slide rail", unit: "nr" },
          { description: "Kitchen sink, stainless steel, single bowl with drainer, 900 x 500 mm", unit: "nr" },
          { description: "Basin mixer tap, single lever, chrome plated", unit: "nr" },
        ],
      },
      {
        sectionNo: "F",
        name: "Gas Installation",
        defaultItems: [
          { description: "22 mm diameter copper gas pipe, Type B, surface fixed with clips", unit: "m" },
          { description: "15 mm diameter copper gas pipe, Type B, concealed", unit: "m" },
          { description: "Gas meter box, external, complete with regulator", unit: "nr" },
          { description: "Gas hob point, including isolation valve", unit: "nr" },
          { description: "Gas geyser point, including isolation valve and flue connection", unit: "nr" },
          { description: "Pressure testing of gas installation and certification", unit: "sum" },
        ],
      },
      {
        sectionNo: "G",
        name: "Rainwater Installation",
        defaultItems: [
          { description: "uPVC half-round gutter, 112 mm diameter, with brackets at 900 mm centres", unit: "m" },
          { description: "uPVC downpipe, 75 mm diameter, with clips", unit: "m" },
          { description: "Gutter outlet, 112 mm gutter to 75 mm downpipe", unit: "nr" },
          { description: "Gutter stop end, 112 mm", unit: "nr" },
          { description: "Rainwater shoe, 75 mm, with spigot to drainage", unit: "nr" },
          { description: "Rainwater harvesting tank, 5 000 litres, polyethylene, with pump", unit: "nr" },
        ],
      },
      {
        sectionNo: "H",
        name: "Fire Sprinkler Systems",
        defaultItems: [
          { description: "25 mm diameter galvanised steel sprinkler pipe, SABS grade", unit: "m" },
          { description: "32 mm diameter galvanised steel sprinkler pipe, SABS grade", unit: "m" },
          { description: "Pendent sprinkler head, 68 deg C rating, chrome finish", unit: "nr" },
          { description: "Upright sprinkler head, 68 deg C rating, brass finish", unit: "nr" },
          { description: "Flow switch, with tamper-proof valve", unit: "nr" },
          { description: "Sprinkler alarm valve set, 100 mm, wet pipe system", unit: "nr" },
        ],
      },
      {
        sectionNo: "I",
        name: "Solar Geyser Installation",
        defaultItems: [
          { description: "Flat plate solar collector panel, 2 m², roof mounted", unit: "nr" },
          { description: "Solar geyser, 200-litre, high-pressure, roof-mounted", unit: "nr" },
          { description: "Solar geyser, 300-litre, high-pressure, split system (tank in ceiling)", unit: "nr" },
          { description: "Circulation pump, 12 V DC, for split system", unit: "nr" },
          { description: "Solar controller, differential temperature type, with sensors", unit: "nr" },
          { description: "Roof mounting frame, stainless steel, adjustable angle", unit: "set" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. Electrical Engineering
  // ─────────────────────────────────────────────────────────
  {
    id: "electrical",
    name: "Electrical Engineering",
    description:
      "Electrical installations including power distribution, lighting, fire detection, access control, and renewable energy systems.",
    icon: "zap",
    standards: ["SANS 10142", "IEC Standards"],
    typicalPreliminariesPct: "10-14%",
    measurementNotes:
      "Measure cable runs in linear metres along actual route. Points measured complete including wiring back to distribution board. DBs measured complete with all circuit breakers and busbars.",
    trades: [
      {
        sectionNo: "A",
        name: "Main Distribution Boards",
        defaultItems: [
          { description: "Main distribution board, 400 A, 3-phase, TPN, wall-mounted, fully populated", unit: "nr" },
          { description: "MCCB, 250 A, 3-pole, adjustable, in MDB", unit: "nr" },
          { description: "MCCB, 100 A, 3-pole, fixed, in MDB", unit: "nr" },
          { description: "Surge arrester, Type 2, 3-phase, in MDB", unit: "nr" },
          { description: "Metering CTs, 400/5 A ratio, set of 3", unit: "set" },
          { description: "Digital power meter, multi-function, panel-mounted", unit: "nr" },
        ],
      },
      {
        sectionNo: "B",
        name: "Sub-Distribution Boards",
        defaultItems: [
          { description: "Sub-distribution board, 125 A, single-phase, wall-mounted, 24-way", unit: "nr" },
          { description: "Sub-distribution board, 125 A, 3-phase, wall-mounted, 36-way", unit: "nr" },
          { description: "MCB, 20 A, single pole, C-curve", unit: "nr" },
          { description: "MCB, 32 A, 3-pole, C-curve", unit: "nr" },
          { description: "Earth leakage relay, 63 A, 30 mA, 4-pole", unit: "nr" },
          { description: "RCBO, 20 A, single pole, 30 mA, C-curve", unit: "nr" },
        ],
      },
      {
        sectionNo: "C",
        name: "Cable Reticulation",
        defaultItems: [
          { description: "2.5 mm² 3-core + earth PVC/SWA/PVC cable, laid in trench", unit: "m" },
          { description: "16 mm² 4-core + earth PVC/SWA/PVC cable, laid in trench", unit: "m" },
          { description: "70 mm² 4-core + earth XLPE/SWA/PVC cable, laid in trench", unit: "m" },
          { description: "Galvanised steel cable tray, 300 mm wide, with lid", unit: "m" },
          { description: "Heavy-duty PVC conduit, 25 mm diameter, surface mounted with saddles", unit: "m" },
          { description: "Cable ladder, 450 mm wide, hot-dip galvanised", unit: "m" },
          { description: "Draw pit, precast concrete, 450 x 450 mm, with cover", unit: "nr" },
        ],
      },
      {
        sectionNo: "D",
        name: "Lighting",
        defaultItems: [
          { description: "LED panel light, 600 x 600 mm, 40 W, 4 000 K, recessed", unit: "nr" },
          { description: "LED downlight, 15 W, 4 000 K, dimmable, recessed", unit: "nr" },
          { description: "LED bulkhead fitting, 18 W, IP65, oval, wall-mounted", unit: "nr" },
          { description: "LED high-bay fitting, 150 W, 5 000 K, chain suspended", unit: "nr" },
          { description: "External LED floodlight, 100 W, IP65, with photocell", unit: "nr" },
          { description: "Emergency LED bulkhead, self-contained, 3-hour battery, maintained", unit: "nr" },
          { description: "Exit sign, LED, self-contained, 3-hour battery, pictogram", unit: "nr" },
        ],
      },
      {
        sectionNo: "E",
        name: "Power Points & Switches",
        defaultItems: [
          { description: "Single switched socket outlet, 16 A, complete with wiring to DB", unit: "nr" },
          { description: "Double switched socket outlet, 16 A, complete with wiring to DB", unit: "nr" },
          { description: "Dedicated socket outlet, 16 A, red, for UPS, with wiring to DB", unit: "nr" },
          { description: "Floor box, stainless steel, 2 x power + 2 x data, flush", unit: "nr" },
          { description: "One-way light switch, complete with wiring", unit: "nr" },
          { description: "Two-way light switch, complete with wiring", unit: "nr" },
          { description: "Isolator switch, 60 A, 3-pole, wall-mounted", unit: "nr" },
        ],
      },
      {
        sectionNo: "F",
        name: "Earthing & Lightning Protection",
        defaultItems: [
          { description: "Earth electrode, copper clad steel rod, 16 mm x 2 400 mm, driven", unit: "nr" },
          { description: "Earth conductor, 50 mm² bare copper, in trench", unit: "m" },
          { description: "Earth bar, copper, 300 x 50 x 6 mm, in DB", unit: "nr" },
          { description: "Lightning conductor air terminal, copper, 300 mm high", unit: "nr" },
          { description: "Lightning down conductor, 50 mm² bare copper, surface fixed", unit: "m" },
          { description: "Test clamp, brass, for earthing system", unit: "nr" },
        ],
      },
      {
        sectionNo: "G",
        name: "Fire Detection & Alarm",
        defaultItems: [
          { description: "Addressable fire alarm control panel, 2-loop, with battery backup", unit: "nr" },
          { description: "Addressable smoke detector, optical type, with base", unit: "nr" },
          { description: "Addressable heat detector, rate-of-rise, with base", unit: "nr" },
          { description: "Manual call point, addressable, red, surface mounted", unit: "nr" },
          { description: "Electronic sounder, wall mounted, red", unit: "nr" },
          { description: "Sounder beacon, wall mounted, red, with strobe", unit: "nr" },
          { description: "Fire-rated cable, 1.5 mm², 2-core, in conduit", unit: "m" },
        ],
      },
      {
        sectionNo: "H",
        name: "Access Control & CCTV",
        defaultItems: [
          { description: "Access control panel, 4-door, with power supply and battery backup", unit: "nr" },
          { description: "Proximity card reader, IP65 rated, with keypad", unit: "nr" },
          { description: "Electromagnetic lock, 300 kg holding force, with bracket", unit: "nr" },
          { description: "IP bullet camera, 4 MP, IR 30 m range, IP67, with bracket", unit: "nr" },
          { description: "IP dome camera, 4 MP, IR 20 m range, IP67, vandal-resistant", unit: "nr" },
          { description: "NVR, 16-channel, with 4 TB HDD", unit: "nr" },
          { description: "Cat6 UTP cable, PVC sheathed, for CCTV and access control", unit: "m" },
        ],
      },
      {
        sectionNo: "I",
        name: "Solar PV & Inverters",
        defaultItems: [
          { description: "PV module, 550 Wp, monocrystalline, Tier 1, with mounting hardware", unit: "nr" },
          { description: "Hybrid inverter, 8 kW, single-phase, MPPT, grid-tied", unit: "nr" },
          { description: "Lithium-ion battery, 5.12 kWh, wall-mounted", unit: "nr" },
          { description: "DC combiner box, with surge protection and isolator", unit: "nr" },
          { description: "AC combiner box, with isolator and surge protection", unit: "nr" },
          { description: "Roof mounting rail system, aluminium, for tiled roof", unit: "m" },
          { description: "DC cable, 6 mm², solar rated, UV resistant", unit: "m" },
        ],
      },
      {
        sectionNo: "J",
        name: "Generator Installation",
        defaultItems: [
          { description: "Diesel generator, 100 kVA, 3-phase, silenced canopy, complete", unit: "nr" },
          { description: "Automatic transfer switch (ATS), 200 A, 4-pole", unit: "nr" },
          { description: "Generator base frame, concrete plinth, with anti-vibration mounts", unit: "nr" },
          { description: "Fuel tank, 500-litre, bunded, mild steel, with level gauge", unit: "nr" },
          { description: "Exhaust system, stainless steel, with silencer and rain cap", unit: "set" },
          { description: "Generator feeder cable, 70 mm² 4c+e XLPE/SWA, from genset to ATS", unit: "m" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. Mechanical / HVAC
  // ─────────────────────────────────────────────────────────
  {
    id: "mechanical-hvac",
    name: "Mechanical / HVAC",
    description:
      "Heating, ventilation, and air-conditioning systems including central plant, split systems, VRF, and building management controls.",
    icon: "wind",
    standards: ["SANS 10400-O", "ASHRAE"],
    typicalPreliminariesPct: "12-16%",
    measurementNotes:
      "Equipment measured as enumerated items, inclusive of all factory-supplied accessories. Ductwork measured in m² of sheet area. Pipework measured in linear metres by nominal bore. Insulation measured separately.",
    trades: [
      {
        sectionNo: "A",
        name: "Air Handling Units",
        defaultItems: [
          { description: "Air handling unit, 5 000 l/s, double-skin construction, with DX coil", unit: "nr" },
          { description: "Air handling unit, 10 000 l/s, double-skin, with chilled water coil and filters", unit: "nr" },
          { description: "Fan coil unit, ceiling concealed, 2.5 kW cooling capacity", unit: "nr" },
          { description: "Fan coil unit, ceiling concealed, 5.0 kW cooling capacity", unit: "nr" },
          { description: "Cassette unit, 4-way blow, ceiling mounted, 7.0 kW", unit: "nr" },
          { description: "Plenum box, galvanised steel, for AHU connection", unit: "nr" },
        ],
      },
      {
        sectionNo: "B",
        name: "Ductwork",
        defaultItems: [
          { description: "Galvanised steel rectangular duct, 0.8 mm gauge, up to 1 000 mm girth", unit: "m²" },
          { description: "Galvanised steel rectangular duct, 1.0 mm gauge, 1 001-2 000 mm girth", unit: "m²" },
          { description: "Galvanised steel circular duct, spiral wound, 250 mm diameter", unit: "m" },
          { description: "Flexible duct connection, 250 mm diameter, insulated", unit: "nr" },
          { description: "Supply air diffuser, square, 4-way, 600 x 600 mm, with plenum box", unit: "nr" },
          { description: "Return air grille, aluminium, 600 x 300 mm, with filter", unit: "nr" },
          { description: "Volume control damper, galvanised steel, 400 x 300 mm", unit: "nr" },
        ],
      },
      {
        sectionNo: "C",
        name: "Chilled Water Systems",
        defaultItems: [
          { description: "Air-cooled chiller, scroll compressor, 100 kW cooling capacity", unit: "nr" },
          { description: "Chilled water pump, end-suction, 5.5 kW, with variable speed drive", unit: "nr" },
          { description: "Chilled water pipe, carbon steel, 80 mm NB, including supports", unit: "m" },
          { description: "Chilled water pipe, carbon steel, 50 mm NB, including supports", unit: "m" },
          { description: "Expansion vessel, 200-litre, pre-charged, for chilled water system", unit: "nr" },
          { description: "Balancing valve, 50 mm, with drain and gauge ports", unit: "nr" },
        ],
      },
      {
        sectionNo: "D",
        name: "Split Units",
        defaultItems: [
          { description: "Split unit, wall-mounted indoor, 3.5 kW cooling, inverter type", unit: "nr" },
          { description: "Split unit, wall-mounted indoor, 7.0 kW cooling, inverter type", unit: "nr" },
          { description: "Outdoor condensing unit, matched to indoor unit, with bracket", unit: "nr" },
          { description: "Refrigerant pipework, insulated copper, 6/12 mm pair, including lagging", unit: "m" },
          { description: "Condensate drain pipe, 20 mm uPVC, including insulation", unit: "m" },
        ],
      },
      {
        sectionNo: "E",
        name: "VRF/VRV Systems",
        defaultItems: [
          { description: "VRF outdoor unit, heat recovery type, 45 kW cooling capacity", unit: "nr" },
          { description: "VRF indoor unit, ceiling concealed ducted, 5.6 kW", unit: "nr" },
          { description: "VRF indoor unit, wall-mounted, 3.6 kW", unit: "nr" },
          { description: "VRF branch selector box (BS box)", unit: "nr" },
          { description: "Refrigerant pipework, 3-pipe system, insulated copper", unit: "m" },
          { description: "Centralised VRF controller, touch screen, for up to 64 units", unit: "nr" },
        ],
      },
      {
        sectionNo: "F",
        name: "Extract Ventilation",
        defaultItems: [
          { description: "Roof-mounted extract fan, centrifugal, 2 000 l/s, weatherproof", unit: "nr" },
          { description: "Wall-mounted extract fan, axial, 500 l/s, with wall sleeve", unit: "nr" },
          { description: "Toilet extract fan, inline, 150 mm diameter, with timer", unit: "nr" },
          { description: "Kitchen canopy hood, stainless steel, 1 200 mm wide, with grease filters", unit: "nr" },
          { description: "Extract duct, galvanised steel, 300 mm diameter, spiral wound", unit: "m" },
        ],
      },
      {
        sectionNo: "G",
        name: "BMS Controls",
        defaultItems: [
          { description: "BMS central workstation, PC-based, with licensed software", unit: "nr" },
          { description: "DDC controller, 16 I/O points, with enclosure", unit: "nr" },
          { description: "Room temperature sensor, with LCD display and setpoint adjustment", unit: "nr" },
          { description: "Duct temperature sensor, immersion type, 200 mm probe", unit: "nr" },
          { description: "Motorised control valve, 2-way, 25 mm, with actuator", unit: "nr" },
          { description: "Pressure differential switch, for filter monitoring", unit: "nr" },
        ],
      },
      {
        sectionNo: "H",
        name: "Insulation",
        defaultItems: [
          { description: "Elastomeric pipe insulation, 25 mm wall thickness, to chilled water pipes", unit: "m" },
          { description: "Duct insulation, 25 mm glass fibre board, with foil face and pinned", unit: "m²" },
          { description: "Acoustic lining inside ductwork, 25 mm, perforated foil face", unit: "m²" },
          { description: "Pipe insulation, 50 mm mineral wool, with aluminium cladding (hot pipes)", unit: "m" },
          { description: "Insulation to AHU plenum and connections", unit: "m²" },
        ],
      },
      {
        sectionNo: "I",
        name: "Fire Dampers",
        defaultItems: [
          { description: "Fire damper, intumescent, 400 x 300 mm, 2-hour rated", unit: "nr" },
          { description: "Fire damper, intumescent, 600 x 400 mm, 2-hour rated", unit: "nr" },
          { description: "Smoke damper, motorised, 400 x 300 mm, with actuator", unit: "nr" },
          { description: "Fire/smoke combination damper, 600 x 400 mm, motorised, 2-hour rated", unit: "nr" },
          { description: "Fusible link, 72 deg C, for fire damper", unit: "nr" },
        ],
      },
      {
        sectionNo: "J",
        name: "Commissioning",
        defaultItems: [
          { description: "Commissioning of air handling units, including TAB report", unit: "nr" },
          { description: "Commissioning of chilled water system, including flow balancing", unit: "sum" },
          { description: "Commissioning of VRF system, including refrigerant charge check", unit: "sum" },
          { description: "Air balancing, testing and adjusting of all diffusers and grilles", unit: "sum" },
          { description: "BMS commissioning, point-to-point checkout and graphic setup", unit: "sum" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. Structural Steelwork
  // ─────────────────────────────────────────────────────────
  {
    id: "structural-steel",
    name: "Structural Steelwork",
    description:
      "Fabrication and erection of structural steel frames, portal frame buildings, roof structures, and associated cladding.",
    icon: "warehouse",
    standards: ["SANS 2001-CS1", "AISC"],
    typicalPreliminariesPct: "10-14%",
    measurementNotes:
      "Steelwork measured in tonnes for primary members. Cladding and sheeting measured in m². All steelwork measured as fabricated mass including weld material but excluding erection bolts. Surface treatment measured in m² of steel surface area.",
    trades: [
      {
        sectionNo: "A",
        name: "Portal Frames",
        defaultItems: [
          { description: "Portal frame columns, welded plate girder, Grade 300W", unit: "t" },
          { description: "Portal frame rafters, welded plate girder, Grade 300W", unit: "t" },
          { description: "Haunched knee connection, welded, complete", unit: "nr" },
          { description: "Apex connection, bolted, with splice plates", unit: "nr" },
          { description: "Base plates, 25 mm thick, Grade 300W, with 4nr HD bolts", unit: "nr" },
        ],
      },
      {
        sectionNo: "B",
        name: "Roof Trusses",
        defaultItems: [
          { description: "Roof truss, tubular construction, 18 m span, Grade 300W", unit: "t" },
          { description: "Roof truss, angle construction, 12 m span, Grade 300W", unit: "t" },
          { description: "Truss gusset plates, Grade 300W, various sizes", unit: "t" },
          { description: "Truss node connections, bolted with M20 Grade 8.8 bolts", unit: "nr" },
          { description: "Truss bearing connection to column, with seating cleat", unit: "nr" },
        ],
      },
      {
        sectionNo: "C",
        name: "Purlins & Girts",
        defaultItems: [
          { description: "Z-purlins, galvanised, 150 x 65 x 1.6 mm, Grade 550", unit: "m" },
          { description: "Z-purlins, galvanised, 200 x 75 x 2.0 mm, Grade 550", unit: "m" },
          { description: "Z-girts, galvanised, 200 x 75 x 2.0 mm, Grade 550", unit: "m" },
          { description: "Purlin cleats, hot-dip galvanised, bolted to rafter", unit: "nr" },
          { description: "Purlin sag rods, 12 mm diameter, galvanised, with struts", unit: "nr" },
        ],
      },
      {
        sectionNo: "D",
        name: "Bracing",
        defaultItems: [
          { description: "Roof bracing, equal angle sections, Grade 300W", unit: "t" },
          { description: "Column bracing, equal angle sections, Grade 300W", unit: "t" },
          { description: "Cross-bracing rods, 20 mm diameter, hot-dip galvanised, with turnbuckle", unit: "nr" },
          { description: "Bracing connection gusset plates, Grade 300W", unit: "t" },
        ],
      },
      {
        sectionNo: "E",
        name: "Connections",
        defaultItems: [
          { description: "M20 x 55 mm Grade 8.8 structural bolts, including nuts and washers", unit: "nr" },
          { description: "M24 x 65 mm Grade 8.8 structural bolts, including nuts and washers", unit: "nr" },
          { description: "Holding-down bolt assembly, M24 x 600 mm, Grade 4.6, cast-in", unit: "nr" },
          { description: "Moment end plate connection, fabricated and drilled", unit: "nr" },
          { description: "Fin plate shear connection, fabricated and drilled", unit: "nr" },
        ],
      },
      {
        sectionNo: "F",
        name: "Cladding",
        defaultItems: [
          { description: "IBR roof sheeting, 0.5 mm Chromadek, including fasteners", unit: "m²" },
          { description: "Corrugated wall cladding, 0.5 mm Chromadek, including fasteners", unit: "m²" },
          { description: "Insulated roof panel, 50 mm PIR core, 0.5/0.4 mm Chromadek skins", unit: "m²" },
          { description: "Insulated wall panel, 50 mm PIR core, micro-rib profile", unit: "m²" },
          { description: "Polycarbonate roof sheeting, 1.0 mm clear, for roof lights", unit: "m²" },
          { description: "Fascia sheeting, 0.5 mm Chromadek, 300 mm girth", unit: "m" },
        ],
      },
      {
        sectionNo: "G",
        name: "Flashings & Trim",
        defaultItems: [
          { description: "Ridge flashing, 0.5 mm Chromadek, 600 mm girth", unit: "m" },
          { description: "Barge flashing, 0.5 mm Chromadek, 450 mm girth", unit: "m" },
          { description: "Sidewall flashing, 0.5 mm Chromadek, 350 mm girth", unit: "m" },
          { description: "Valley gutter, 0.8 mm Chromadek, 600 mm girth", unit: "m" },
          { description: "Box gutter, 0.8 mm galvanised steel, 450 mm girth, with brackets", unit: "m" },
        ],
      },
      {
        sectionNo: "H",
        name: "Surface Treatment",
        defaultItems: [
          { description: "Hot-dip galvanising to SANS 121, structural members", unit: "t" },
          { description: "Blast clean to Sa 2.5 and apply primer coat, 75 microns DFT", unit: "m²" },
          { description: "Intermediate coat, high-build epoxy, 125 microns DFT", unit: "m²" },
          { description: "Finish coat, aliphatic polyurethane, 50 microns DFT, colour TBA", unit: "m²" },
          { description: "Intumescent fire protection coating, 60-minute rating", unit: "m²" },
        ],
      },
      {
        sectionNo: "I",
        name: "Erection",
        defaultItems: [
          { description: "Erection of structural steelwork, including crane hire and rigging", unit: "t" },
          { description: "Mobilisation and demobilisation of crane(s) to site", unit: "sum" },
          { description: "Temporary bracing during erection", unit: "sum" },
          { description: "Site bolting and alignment of all connections", unit: "sum" },
          { description: "Touch-up painting of site connections and damaged areas", unit: "sum" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. Landscaping & External Works
  // ─────────────────────────────────────────────────────────
  {
    id: "landscaping",
    name: "Landscaping & External Works",
    description:
      "Landscape design and construction including soft and hard landscaping, irrigation, sports surfaces, and site furniture.",
    icon: "trees",
    standards: ["SAPMA", "NRM2 Section 8"],
    typicalPreliminariesPct: "10-14%",
    measurementNotes:
      "Planting measured by enumerated items with container size stated. Hard landscaping measured in m². Irrigation measured in linear metres for pipework and enumerated for fittings. All levels and falls to be as per landscape architect drawings.",
    trades: [
      {
        sectionNo: "A",
        name: "Site Preparation",
        defaultItems: [
          { description: "Strip existing vegetation and topsoil, 150 mm deep, stockpile on site", unit: "m²" },
          { description: "Rip compacted subsoil to 300 mm depth, level and grade", unit: "m²" },
          { description: "Import topsoil, screened and certified, 200 mm thick, spread and level", unit: "m³" },
          { description: "Soil amelioration with compost, 50 mm layer, rotovate into top 200 mm", unit: "m²" },
          { description: "Fine grading to design levels, including compaction", unit: "m²" },
        ],
      },
      {
        sectionNo: "B",
        name: "Irrigation Systems",
        defaultItems: [
          { description: "Irrigation controller, 12-station, with rain sensor and Wi-Fi", unit: "nr" },
          { description: "25 mm LDPE irrigation mainline pipe, class 6", unit: "m" },
          { description: "20 mm LDPE irrigation lateral pipe, class 4", unit: "m" },
          { description: "Pop-up sprinkler, rotor type, 8 m radius, adjustable arc", unit: "nr" },
          { description: "Pop-up sprinkler, spray type, 4 m radius, fixed arc", unit: "nr" },
          { description: "Drip irrigation line, 16 mm, pressure-compensating, 2 l/h emitters at 300 mm", unit: "m" },
          { description: "Solenoid valve, 25 mm, with valve box and wiring to controller", unit: "nr" },
        ],
      },
      {
        sectionNo: "C",
        name: "Soft Landscaping",
        defaultItems: [
          { description: "Instant lawn, Kikuyu or LM Berea, cultivated and rolled", unit: "m²" },
          { description: "Indigenous tree, 100-litre container, planted with compost and mulch", unit: "nr" },
          { description: "Indigenous shrub, 20-litre container, planted with compost and mulch", unit: "nr" },
          { description: "Indigenous groundcover, 200 mm pot, planted at 5 per m²", unit: "nr" },
          { description: "Ornamental grass, 5-litre container, planted with compost", unit: "nr" },
          { description: "Bark mulch, 75 mm thick, applied to planting beds", unit: "m²" },
          { description: "Timber tree stake and tie set, 50 mm x 2 400 mm, two per tree", unit: "set" },
        ],
      },
      {
        sectionNo: "D",
        name: "Hard Landscaping",
        defaultItems: [
          { description: "Concrete paving, 50 mm interlocking blocks, on 25 mm sand bed on compacted sub-base", unit: "m²" },
          { description: "Natural stone paving, 40 mm thick, on mortar bed", unit: "m²" },
          { description: "Exposed aggregate concrete path, 100 mm thick, with steel edge", unit: "m²" },
          { description: "Precast concrete kerbing, 127 x 254 mm, bedded and haunched", unit: "m" },
          { description: "Timber decking, treated pine, 114 x 32 mm boards on 76 x 152 mm joists", unit: "m²" },
          { description: "Natural stone retaining wall, dry packed, 500 mm high", unit: "m²" },
        ],
      },
      {
        sectionNo: "E",
        name: "Street Furniture",
        defaultItems: [
          { description: "Park bench, hardwood slats on cast iron frame, 1 800 mm long", unit: "nr" },
          { description: "Litter bin, stainless steel, 80-litre, free-standing", unit: "nr" },
          { description: "Bollard, stainless steel, 900 mm high, concrete-filled", unit: "nr" },
          { description: "Cycle rack, stainless steel, 5-bike capacity, surface fixed", unit: "nr" },
          { description: "Outdoor LED luminaire, 4 m column, complete with foundation", unit: "nr" },
        ],
      },
      {
        sectionNo: "F",
        name: "Fencing & Gates",
        defaultItems: [
          { description: "Palisade fencing, 1 800 mm high, galvanised steel, with concrete posts", unit: "m" },
          { description: "Clearvu fencing (358 mesh), 2 400 mm high, galvanised and powder coated", unit: "m" },
          { description: "Timber post-and-rail fence, 1 200 mm high, treated pine", unit: "m" },
          { description: "Sliding gate, galvanised steel, motorised, 6 000 mm wide", unit: "nr" },
          { description: "Pedestrian gate, galvanised steel, 1 200 mm wide x 1 800 mm high", unit: "nr" },
          { description: "Gate motor, sliding type, including battery backup and remote controls", unit: "nr" },
        ],
      },
      {
        sectionNo: "G",
        name: "Signage",
        defaultItems: [
          { description: "Directional signage, aluminium composite panel, 600 x 400 mm, vinyl lettering", unit: "nr" },
          { description: "Building identification sign, illuminated, LED backlit, 1 200 x 600 mm", unit: "nr" },
          { description: "Way-finding totem, powder-coated steel, 2 400 mm high", unit: "nr" },
          { description: "Parking bay stencil marking, thermoplastic", unit: "nr" },
          { description: "Safety signage, reflective aluminium, 600 x 450 mm", unit: "nr" },
        ],
      },
      {
        sectionNo: "H",
        name: "Sports Surfaces",
        defaultItems: [
          { description: "Synthetic grass sports field, 50 mm pile, FIFA approved, including infill", unit: "m²" },
          { description: "Acrylic hard court surface (tennis/netball), 5-coat system", unit: "m²" },
          { description: "Rubber wet-pour safety surfacing, 50 mm thick, to playground", unit: "m²" },
          { description: "Sports field line marking, thermoplastic, white", unit: "m" },
          { description: "Sports field floodlight pole, 15 m, with 4 x LED floods", unit: "nr" },
        ],
      },
      {
        sectionNo: "I",
        name: "Playground Equipment",
        defaultItems: [
          { description: "Multi-play structure, for ages 5-12, powder coated, SANS 51176 compliant", unit: "nr" },
          { description: "Swing set, 2-bay, 4-seat, galvanised steel frame", unit: "nr" },
          { description: "Spring rider, animal figure, SANS 51176 compliant", unit: "nr" },
          { description: "Slide, stainless steel, 1 500 mm platform height", unit: "nr" },
          { description: "Outdoor gym equipment, 4-station unit, stainless steel", unit: "nr" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 8. Renovations & Alterations
  // ─────────────────────────────────────────────────────────
  {
    id: "renovations",
    name: "Renovations & Alterations",
    description:
      "Refurbishment, renovation, and alteration works to existing buildings including demolition, strip-out, asbestos removal, and making good.",
    icon: "hammer",
    standards: ["ASAQS Model Preambles (adapted)", "SANS"],
    typicalPreliminariesPct: "15-20%",
    measurementNotes:
      "Demolition measured by area or volume with disposal included. Temporary works measured separately. Making good and matching existing materials specified by description and measured in appropriate units. Allow for unknown conditions in provisional sums.",
    trades: [
      {
        sectionNo: "A",
        name: "Demolition & Strip-out",
        defaultItems: [
          { description: "Demolish brick wall, half brick thick, including carting away rubble", unit: "m²" },
          { description: "Demolish brick wall, one brick thick, including carting away rubble", unit: "m²" },
          { description: "Demolish concrete slab, 150 mm thick, including reinforcement", unit: "m²" },
          { description: "Strip floor tiles and screed, average 50 mm total depth", unit: "m²" },
          { description: "Strip existing ceiling and battens, including disposal", unit: "m²" },
          { description: "Remove existing door frame and door, make good reveals", unit: "nr" },
          { description: "Remove existing window frame, make good reveals", unit: "nr" },
          { description: "Skip hire and removal of builders' rubble (allow 6 m³ skip)", unit: "nr" },
        ],
      },
      {
        sectionNo: "B",
        name: "Temporary Protection",
        defaultItems: [
          { description: "Temporary dustproof partition, timber frame with polyethylene sheeting", unit: "m²" },
          { description: "Temporary protection to existing floors, 3 mm hardboard, taped joints", unit: "m²" },
          { description: "Temporary protection to existing joinery, polyethylene sheet and tape", unit: "m²" },
          { description: "Temporary bracing and shoring to openings during alteration", unit: "item" },
          { description: "Temporary weatherproofing to openings during works", unit: "m²" },
        ],
      },
      {
        sectionNo: "C",
        name: "Asbestos Removal",
        defaultItems: [
          { description: "Asbestos survey and air monitoring by accredited laboratory", unit: "sum" },
          { description: "Removal of asbestos cement roof sheeting, by licensed contractor", unit: "m²" },
          { description: "Removal of asbestos cement ceiling boards, by licensed contractor", unit: "m²" },
          { description: "Removal of asbestos-containing floor tiles, by licensed contractor", unit: "m²" },
          { description: "Disposal of asbestos waste at licensed hazardous waste site", unit: "t" },
          { description: "Clearance certificate on completion of asbestos removal", unit: "sum" },
        ],
      },
      {
        sectionNo: "D",
        name: "Structural Alterations",
        defaultItems: [
          { description: "Form new opening in brick wall, up to 1 200 mm wide, including lintel", unit: "nr" },
          { description: "Form new opening in brick wall, 1 201-2 400 mm wide, including lintel", unit: "nr" },
          { description: "Build up existing opening with matching brickwork, including toothing-in", unit: "m²" },
          { description: "Insert steel beam (UB), including padstones and grouting", unit: "t" },
          { description: "Underpin existing foundation, 1 m sections, 25 MPa concrete", unit: "m³" },
          { description: "Needle and prop existing wall during structural alteration", unit: "nr" },
        ],
      },
      {
        sectionNo: "E",
        name: "Finishes",
        defaultItems: [
          { description: "Replaster walls with 12 mm cement plaster to match existing", unit: "m²" },
          { description: "New suspended ceiling, 600 x 600 mm mineral fibre tiles on exposed grid", unit: "m²" },
          { description: "New floor screed, 40 mm thick, steel floated", unit: "m²" },
          { description: "New ceramic floor tiles, 300 x 300 mm, to match existing", unit: "m²" },
          { description: "New vinyl sheet flooring, 2 mm thick, commercial grade", unit: "m²" },
          { description: "Repaint walls and ceilings, two coats PVA over existing", unit: "m²" },
        ],
      },
      {
        sectionNo: "F",
        name: "Services Modifications",
        defaultItems: [
          { description: "Relocate existing single power point, including wiring extension", unit: "nr" },
          { description: "Relocate existing light fitting, including wiring extension", unit: "nr" },
          { description: "Cap off and seal existing water point", unit: "nr" },
          { description: "Extend existing water pipe to new position (per point)", unit: "nr" },
          { description: "Extend existing drainage to new position (per point)", unit: "nr" },
          { description: "Provisional sum for unforeseen services modifications", unit: "sum" },
        ],
      },
      {
        sectionNo: "G",
        name: "Making Good",
        defaultItems: [
          { description: "Make good plaster to walls at junction of new and existing work", unit: "m" },
          { description: "Make good floor finish at junction of new and existing work", unit: "m" },
          { description: "Make good ceiling at junction of new and existing work", unit: "m" },
          { description: "Make good external brickwork, toothing-in and pointing", unit: "m" },
          { description: "Make good paintwork to match existing, including preparation", unit: "m²" },
        ],
      },
      {
        sectionNo: "H",
        name: "Matching Existing",
        defaultItems: [
          { description: "Supply and fix matching face bricks to existing (sample approval required)", unit: "m²" },
          { description: "Supply and fix matching roof tiles to existing", unit: "m²" },
          { description: "Supply and fix matching timber skirting to existing profile", unit: "m" },
          { description: "Supply and fix matching architrave to existing profile", unit: "m" },
          { description: "Supply and fix matching cornice to existing profile", unit: "m" },
          { description: "Provisional sum for sourcing and matching specialist materials", unit: "sum" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 9. Mining & Industrial
  // ─────────────────────────────────────────────────────────
  {
    id: "mining-industrial",
    name: "Mining & Industrial",
    description:
      "Heavy industrial and mining infrastructure projects including processing plants, tankage, heavy structural steel, and high-voltage electrical installations.",
    icon: "factory",
    standards: ["EPCM Standards", "Mining Industry Specs"],
    typicalPreliminariesPct: "15-22%",
    measurementNotes:
      "Steelwork measured in tonnes. Piping measured in linear metres by NB and schedule. Mechanical equipment measured as enumerated items complete with drives and ancillaries. Electrical installations measured per point for LV and per metre for HV cable.",
    trades: [
      {
        sectionNo: "A",
        name: "Bulk Earthworks",
        defaultItems: [
          { description: "Bulk excavation in all materials, load and haul to spoil (1-5 km)", unit: "m³" },
          { description: "Engineered fill, G5 quality, compacted to 95% Mod AASHTO, in 150 mm layers", unit: "m³" },
          { description: "Rock excavation by drilling and blasting (if encountered)", unit: "m³" },
          { description: "Terrace formation, cut and fill, including surface drainage", unit: "m²" },
          { description: "Crusher run sub-base, 150 mm thick, compacted to 98% Mod AASHTO", unit: "m²" },
          { description: "Geotextile separation layer, non-woven, 200 g/m²", unit: "m²" },
        ],
      },
      {
        sectionNo: "B",
        name: "Concrete (Heavy Industrial)",
        defaultItems: [
          { description: "Mass concrete foundations, 25 MPa/26 mm, for equipment bases", unit: "m³" },
          { description: "Reinforced concrete raft foundation, 40 MPa/19 mm, 500 mm thick", unit: "m³" },
          { description: "Reinforced concrete plinths and piers, 35 MPa/19 mm", unit: "m³" },
          { description: "Reinforced concrete bund walls, 30 MPa/19 mm, 300 mm thick", unit: "m³" },
          { description: "High-tensile reinforcement, various diameters, cut, bent and fixed", unit: "t" },
          { description: "Holding-down bolt assemblies, M30 x 750 mm, cast in concrete", unit: "nr" },
          { description: "Chemical-resistant epoxy coating to concrete bund floors", unit: "m²" },
        ],
      },
      {
        sectionNo: "C",
        name: "Structural Steel (Heavy)",
        defaultItems: [
          { description: "Heavy structural steel columns, Grade 350W, mass 60-120 kg/m", unit: "t" },
          { description: "Heavy structural steel beams, Grade 350W, mass 40-100 kg/m", unit: "t" },
          { description: "Access platforms and walkways, galvanised, with handrails", unit: "t" },
          { description: "Steel stairways, galvanised, 1 000 mm wide, with handrails", unit: "t" },
          { description: "Grating, serrated, galvanised, 32 x 5 mm bearing bars, for platforms", unit: "m²" },
          { description: "Handrail, galvanised steel, 1 000 mm high, to platforms and stairs", unit: "m" },
        ],
      },
      {
        sectionNo: "D",
        name: "Mechanical Installation",
        defaultItems: [
          { description: "Conveyor belt system, 750 mm wide, 50 m long, including drive and idlers", unit: "nr" },
          { description: "Centrifugal pump, horizontal, end-suction, 55 kW, including coupling and baseplate", unit: "nr" },
          { description: "Positive displacement pump, progressive cavity, 15 kW", unit: "nr" },
          { description: "Agitator, top-entry, 30 kW, with shaft and impeller", unit: "nr" },
          { description: "Vibrating screen, 1 200 x 2 400 mm, double deck", unit: "nr" },
          { description: "Crusher, jaw type, 400 x 600 mm opening, 45 kW drive", unit: "nr" },
        ],
      },
      {
        sectionNo: "E",
        name: "Piping",
        defaultItems: [
          { description: "Carbon steel pipe, Schedule 40, 100 mm NB, including supports", unit: "m" },
          { description: "Carbon steel pipe, Schedule 40, 150 mm NB, including supports", unit: "m" },
          { description: "HDPE pipe, SDR 11, 110 mm, including fusion joints", unit: "m" },
          { description: "Stainless steel pipe, Schedule 10S, 50 mm NB, 316L grade", unit: "m" },
          { description: "Rubber-lined steel pipe, 150 mm NB, for slurry service", unit: "m" },
          { description: "Butterfly valve, wafer type, 150 mm, with handwheel operator", unit: "nr" },
          { description: "Pipe rack, structural steel, 6 m span, including columns", unit: "m" },
        ],
      },
      {
        sectionNo: "F",
        name: "Tankage",
        defaultItems: [
          { description: "Mild steel storage tank, flat bottom, 100 m³ capacity, with roof", unit: "nr" },
          { description: "Mild steel process tank, open top, 50 m³, with agitator nozzle", unit: "nr" },
          { description: "HDPE tank, 10 m³, chemical storage, with bund", unit: "nr" },
          { description: "GRP tank, 20 m³, for corrosive chemicals", unit: "nr" },
          { description: "Tank foundation, ring wall type, reinforced concrete", unit: "m³" },
          { description: "Tank internal coating, epoxy, 2-coat system, 300 microns DFT", unit: "m²" },
        ],
      },
      {
        sectionNo: "G",
        name: "Electrical (HV & LV)",
        defaultItems: [
          { description: "11 kV/400 V transformer, 500 kVA, oil-filled, outdoor type", unit: "nr" },
          { description: "11 kV ring main unit, SF6 insulated, 3-way", unit: "nr" },
          { description: "Motor control centre (MCC), 400 V, fully drawn-out type", unit: "nr" },
          { description: "Variable speed drive (VSD), 55 kW, 400 V, with bypass", unit: "nr" },
          { description: "11 kV XLPE cable, 3-core, 95 mm², armoured, in trench", unit: "m" },
          { description: "400 V power cable, 4-core + earth, 70 mm², SWA, in cable tray", unit: "m" },
          { description: "Cable termination, 11 kV, heat-shrink type, indoor", unit: "nr" },
        ],
      },
      {
        sectionNo: "H",
        name: "Instrumentation",
        defaultItems: [
          { description: "Pressure transmitter, 4-20 mA, with isolation valve and manifold", unit: "nr" },
          { description: "Electromagnetic flow meter, 100 mm, flanged, with converter", unit: "nr" },
          { description: "Level transmitter, guided wave radar, with nozzle", unit: "nr" },
          { description: "Temperature element, RTD Pt100, 200 mm insertion, with thermowell", unit: "nr" },
          { description: "Control valve, globe type, 50 mm, with pneumatic actuator and positioner", unit: "nr" },
          { description: "Instrument cable, 1.5 mm², 2-pair, screened, in conduit", unit: "m" },
        ],
      },
      {
        sectionNo: "I",
        name: "Insulation & Cladding",
        defaultItems: [
          { description: "Pipe insulation, 50 mm mineral wool, aluminium cladding, 100 mm NB", unit: "m" },
          { description: "Pipe insulation, 75 mm mineral wool, aluminium cladding, 150 mm NB", unit: "m" },
          { description: "Vessel insulation, 100 mm mineral wool, aluminium cladding", unit: "m²" },
          { description: "Personnel protection cage, galvanised, around hot pipes", unit: "m" },
          { description: "Cladding to structural steel building, 0.5 mm Chromadek IBR", unit: "m²" },
        ],
      },
      {
        sectionNo: "J",
        name: "Platework",
        defaultItems: [
          { description: "Fabricated mild steel chute, 10 mm plate, lined", unit: "t" },
          { description: "Fabricated mild steel hopper, 12 mm plate, with stiffeners", unit: "t" },
          { description: "Fabricated mild steel launder, 6 mm plate, half-round", unit: "m" },
          { description: "Wear liner, 400 BHN Hardox or equivalent, 12 mm thick", unit: "m²" },
          { description: "Rubber lining to chutes and hoppers, 12 mm thick, vulcanised", unit: "m²" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 10. Interior Fit-Out
  // ─────────────────────────────────────────────────────────
  {
    id: "interior-fitout",
    name: "Interior Fit-Out",
    description:
      "Commercial and retail interior fit-out works including partitioning, ceilings, finishes, bespoke joinery, AV systems, and furniture installation.",
    icon: "layout",
    standards: ["NRM2 (adapted for fit-out)"],
    typicalPreliminariesPct: "10-14%",
    measurementNotes:
      "Partitioning measured in m² stating height range and specification. Ceilings measured in m² with grid type stated. Joinery measured in linear metres or enumerated as items. All finishes measured net in-place. AV and IT measured per point or per item of equipment.",
    trades: [
      {
        sectionNo: "A",
        name: "Partitioning",
        defaultItems: [
          { description: "Drywalling, single side boarded, 12.5 mm gypsum board on 76 mm steel studs", unit: "m²" },
          { description: "Drywalling, double side boarded, 12.5 mm gypsum board on 76 mm steel studs", unit: "m²" },
          { description: "Drywalling, double boarded both sides (fire-rated), on 76 mm steel studs", unit: "m²" },
          { description: "Acoustic insulation, 50 mm glass fibre, in partition cavity", unit: "m²" },
          { description: "Frameless glass partition, 12 mm toughened clear glass, floor to ceiling", unit: "m²" },
          { description: "Frameless glass door in glass partition, 900 x 2 100 mm, with patch fittings", unit: "nr" },
          { description: "Demountable partition system, single glazed, 2 700 mm high", unit: "m²" },
        ],
      },
      {
        sectionNo: "B",
        name: "Suspended Ceilings",
        defaultItems: [
          { description: "Suspended ceiling, 600 x 600 mm mineral fibre tiles, on exposed T-bar grid", unit: "m²" },
          { description: "Suspended ceiling, 600 x 600 mm metal pan tiles, on concealed grid", unit: "m²" },
          { description: "Bulkhead, 12.5 mm gypsum board, on light steel frame, painted", unit: "m²" },
          { description: "Suspended ceiling, timber slat, 40 x 20 mm battens at 10 mm gaps", unit: "m²" },
          { description: "Shadow line detail at ceiling/wall junction", unit: "m" },
          { description: "Access panel, 600 x 600 mm, hinged, in ceiling grid", unit: "nr" },
        ],
      },
      {
        sectionNo: "C",
        name: "Flooring",
        defaultItems: [
          { description: "Carpet tiles, 500 x 500 mm, heavy commercial grade, stuck down", unit: "m²" },
          { description: "Luxury vinyl tiles (LVT), 3 mm thick, loose-lay or click system", unit: "m²" },
          { description: "Porcelain floor tiles, 600 x 600 mm, rectified, on adhesive", unit: "m²" },
          { description: "Polished concrete floor, grind and seal, 3-coat system", unit: "m²" },
          { description: "Raised access floor, 600 x 600 mm panels, 150 mm void, on pedestals", unit: "m²" },
          { description: "Entrance matting, aluminium frame, carpet insert, recessed", unit: "m²" },
          { description: "Vinyl skirting, 100 mm high, coved", unit: "m" },
        ],
      },
      {
        sectionNo: "D",
        name: "Joinery & Cabinetwork",
        defaultItems: [
          { description: "Reception desk, bespoke, solid surface top, veneer panels, complete", unit: "item" },
          { description: "Kitchen/tea point, complete with cabinets, worktop, sink and appliances", unit: "item" },
          { description: "Vanity unit to washrooms, solid surface top, concealed cisterns", unit: "m" },
          { description: "Built-in storage cupboard, melamine-faced board, with shelves and doors", unit: "m" },
          { description: "Feature wall panelling, veneer on MDF, including concealed fixings", unit: "m²" },
          { description: "Window sill board, 25 mm thick laminated timber, 200 mm wide", unit: "m" },
        ],
      },
      {
        sectionNo: "E",
        name: "Painting & Wallcovering",
        defaultItems: [
          { description: "Prepare and paint plasterboard walls, one mist coat and two coats PVA", unit: "m²" },
          { description: "Prepare and paint plasterboard ceilings, one mist coat and two coats PVA", unit: "m²" },
          { description: "Feature wall paint, accent colour, two coats washable acrylic", unit: "m²" },
          { description: "Wallpaper, commercial vinyl, fire-rated, on lining paper", unit: "m²" },
          { description: "Acoustic wall fabric, stretched on concealed track system", unit: "m²" },
          { description: "Whiteboard wall coating, 2-coat system, magnetic and writable", unit: "m²" },
        ],
      },
      {
        sectionNo: "F",
        name: "Signage & Branding",
        defaultItems: [
          { description: "Illuminated reception sign, 3D letters, LED backlit, on feature wall", unit: "item" },
          { description: "Vinyl lettering/graphics to glass partitions, frosted privacy film", unit: "m²" },
          { description: "Room identification sign, aluminium plate, engraved, 150 x 100 mm", unit: "nr" },
          { description: "Way-finding signage system, wall-mounted, complete", unit: "set" },
          { description: "Large format wall graphic, digitally printed vinyl, applied", unit: "m²" },
        ],
      },
      {
        sectionNo: "G",
        name: "AV & IT Infrastructure",
        defaultItems: [
          { description: "Cat6A data point, double outlet, including patch panel termination", unit: "nr" },
          { description: "Wireless access point, enterprise grade, ceiling mounted", unit: "nr" },
          { description: "Boardroom AV system, 75-inch display, video conferencing, complete", unit: "item" },
          { description: "Projector, ceiling mounted, 5 000 lumens, with motorised screen", unit: "set" },
          { description: "Digital signage display, 55-inch, wall mounted, with media player", unit: "nr" },
          { description: "Ceiling speaker system, per zone, including amplifier and wiring", unit: "nr" },
        ],
      },
      {
        sectionNo: "H",
        name: "Furniture",
        defaultItems: [
          { description: "Executive desk, 1 600 x 800 mm, with cable management", unit: "nr" },
          { description: "Workstation desk, 1 400 x 700 mm, with screen divider", unit: "nr" },
          { description: "Ergonomic task chair, adjustable arms, lumbar support", unit: "nr" },
          { description: "Boardroom table, 3 600 x 1 200 mm, with integrated power/data", unit: "nr" },
          { description: "Filing pedestal, mobile, 3-drawer, lockable", unit: "nr" },
          { description: "Sofa, 3-seater, commercial grade upholstery, for reception/breakout", unit: "nr" },
        ],
      },
      {
        sectionNo: "I",
        name: "Window Treatment",
        defaultItems: [
          { description: "Roller blind, blockout fabric, chain operated, to standard window", unit: "nr" },
          { description: "Roller blind, sunscreen fabric, chain operated, to standard window", unit: "nr" },
          { description: "Motorised roller blind, sunscreen fabric, with remote control", unit: "nr" },
          { description: "Venetian blind, 25 mm aluminium slats, to standard window", unit: "nr" },
          { description: "Curtain track, ceiling fixed, aluminium, with wave fold curtain", unit: "m" },
        ],
      },
    ],
  },
];

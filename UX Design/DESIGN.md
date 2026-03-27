# Design System Specification: The Executive Precision Framework

## 1. Overview & Creative North Star: "The Digital Architect"
The Creative North Star for this design system is **"The Digital Architect."** In the high-stakes world of B2B sales, productivity is driven by clarity and authoritative calm. We are moving away from the "busy" SaaS aesthetic of crowded dashboards and thin borders. Instead, we embrace a high-end editorial layout that prioritizes atmospheric depth and intentional whitespace.

By leveraging **"The Digital Architect"** philosophy, we break the grid through:
*   **Intentional Asymmetry:** Using large typography scales and wide margins to create a sense of bespoke luxury.
*   **Tonal Architecture:** Defining sections through shifting surface values rather than structural lines.
*   **Sophisticated Efficiency:** Interactive elements are bold and rounded, communicating a tactile, premium tool-set that feels "calibrated" for high performance.

---

### 2. Colors & Surface Philosophy
Our palette moves beyond simple blues into a spectrum of "Deep Navy" and "Vibrant Action."

#### The "No-Line" Rule
**Borders are a design failure.** This system prohibits the use of 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts. For example, a data table (using `surface_container_low`) should sit directly on a `surface` background without a stroke.

#### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
*   **Base:** `surface` (#f8f9fb)
*   **Level 1 (Sub-sections):** `surface_container_low` (#f2f4f6)
*   **Level 2 (Active Cards):** `surface_container_lowest` (#ffffff)
*   **High Priority Overlays:** `surface_bright` (#f8f9fb) with Glassmorphism.

#### The "Glass & Gradient" Rule
To elevate CTAs beyond "standard" UI, use a subtle **Signature Texture**. For primary buttons or Hero headers, apply a linear gradient from `primary` (#003ec7) to `primary_container` (#0052ff) at a 135-degree angle. Floating panels should use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur to create a "frosted glass" depth.

---

### 3. Typography: The Editorial Edge
We pair the structural authority of **Manrope** (Display/Headlines) with the clinical legibility of **Inter** (Body/Labels).

*   **Display (Manrope):** Use `display-lg` (3.5rem) with `-0.04em` letter spacing for hero metrics. It should feel massive, confident, and "Architectural."
*   **Headline (Manrope):** `headline-md` (1.75rem) defines the start of a new strategic section.
*   **Body (Inter):** `body-md` (0.875rem) is the workhorse. Use a line height of `1.6` to ensure readability during high-speed sales workflows.
*   **Labels (Inter):** `label-md` (0.75rem) in `on_surface_variant` (#434656) should be used for metadata, always in All Caps with `0.05em` tracking to maintain an "executive" feel.

---

### 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a modern B2B tool. We use **Ambient Shadows** and **Tonal Lifting**.

*   **The Layering Principle:** To highlight a specific Sale or Lead card, place a `surface_container_lowest` (#ffffff) card on a `surface_container` (#edeef0) background. The contrast in value provides all the "lift" required.
*   **Ambient Shadows:** For floating modals, use a shadow with a `40px` blur and `4%` opacity, tinted with `on_surface` (#191c1e). It should look like a soft glow of light, not a dark smudge.
*   **The Ghost Border Fallback:** If a boundary is strictly required for accessibility (e.g., input fields), use `outline_variant` (#c3c5d9) at **20% opacity**. Never use 100% opacity borders.

---

### 5. Components: The Sales Toolkit

#### Interactive Elements (Buttons & Inputs)
All interactive elements must use the **Roundedness Scale**:
*   **Buttons:** Use `full` (9999px) for a modern, pill-shaped "Action" feel.
*   **Cards/Containers:** Use `lg` (1rem) for a friendly yet professional enclosure.
*   **Inputs:** Use `md` (0.75rem) with `surface_container_highest` (#e1e2e4) as the background fill. No borders.

#### Status Badges (The Semantic Tier)
Badges must be highly visible but integrated. Use a "Soft Fill" approach:
*   **Success (Order):** `tertiary_fixed` (#b7eaff) background with `on_tertiary_fixed` (#001f28) text.
*   **Warning (Complaint):** `error_container` (#ffdad6) background with `on_error_container` (#93000a) text.
*   **Neutral (Visit):** `secondary_fixed` (#d7e2ff) background with `on_secondary_fixed` (#091b37) text.

#### Forbidding Dividers
**Lists and Tables** must never use horizontal divider lines. Instead, use:
1.  **Vertical Space:** Use the `spacing-6` (1.3rem) or `spacing-8` (1.75rem) tokens between items.
2.  **Zebra Toning:** Alternate between `surface` and `surface_container_low` for large data sets.

#### Custom Sales Component: "The Lead Pulse"
A specialized component for this app: A high-contrast card using a `surface_tint` (#004ced) subtle background glow to indicate an active, "hot" lead. Typography inside this card uses `on_primary` (#ffffff) to ensure total dominance in the visual hierarchy.

---

### 6. Do’s and Don’ts

#### Do:
*   **Do** use `spacing-16` (3.5rem) for page margins to create an "Editorial" feel.
*   **Do** use `primary` (#003ec7) sparingly for "Action Only" elements. If everything is blue, nothing is an action.
*   **Do** nest containers. A `surface_container_lowest` card inside a `surface_container` section is the hallmark of this system.

#### Don’t:
*   **Don’t** use pure black (#000000). Always use `on_surface` (#191c1e) for text to maintain a premium, navy-tinted depth.
*   **Don’t** use shadows on static elements. Shadows are reserved for elements that "float" above the logic (Modals, Tooltips, Popovers).
*   **Don’t** squeeze content. If you think there is enough whitespace, add one more `spacing-4` (0.9rem) unit. Efficiency comes from clarity, not density.
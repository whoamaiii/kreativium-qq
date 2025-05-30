# Plan to Improve Readability of sensory-storms.html

This plan outlines the steps to modify the `resurserrer til foreldre/sensory-storms.html` file to improve its readability, specifically by adjusting its visual styles (colors, backgrounds, transparency effects) to be more similar to the `resurserrer til foreldre/autisme-og-bilsyke.html` file.

**Objective:** Make the text content of `sensory-storms.html` easier to read by lightening the overall appearance and improving contrast, drawing inspiration from the styling of `autisme-og-bilsyke.html`.

**Steps:**

1.  **Modify the Hero Section:**
    *   Change the background of the `.hero` class from the dark gradient (`--gradient-dark`) to a lighter color or gradient. A suitable option might be a light background with subtle gradients or patterns, similar to the content page background in `autisme-og-bilsyke.html`.
    *   Ensure the title (`h1`) and lead text (`p.lead`) remain highly readable against the new background. This might involve keeping the text color white or adjusting it to a dark color with good contrast.

2.  **Adjust Text Colors:**
    *   Review and potentially lighten the main text color (`p`) and heading colors (`h1` to `h4`) within the main content area (`.container`). The current colors (`--gray-900` and `--gray-700`) are quite dark on the light background (`--light`). Adjusting these to slightly lighter shades of gray or using the primary/accent colors for headings might improve contrast and visual appeal, similar to how text colors are handled in `autisme-og-bilsyke.html`.

3.  **Update Card Styles:**
    *   Apply styles similar to the `.card` class from `autisme-og-bilsyke.html` to the `.card` elements in `sensory-storms.html`. This includes:
        *   Using a background gradient (e.g., `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.85) 100%)`).
        *   Adding `backdrop-filter: blur(20px);` and `-webkit-backdrop-filter: blur(20px);`.
        *   Adjusting `border`, `box-shadow`, `padding`, and `margin` to match the reference file's `.card` styles.
        *   Applying similar hover effects (`transform`, `box-shadow`).
    *   Apply similar styling principles to the `.info-box` elements, potentially using background gradients and backdrop filters based on their type (warning, success, danger), drawing inspiration from the `.callout` styles in `autisme-og-bilsyke.html`.

4.  **Update Table Styles:**
    *   Apply styles similar to the `.table-container` and `table` rules from `autisme-og-bilsyke.html` to the table in `sensory-storms.html`. This involves:
        *   Wrapping the table in a `.table-container` div with appropriate background, backdrop filter, border, border-radius, and box-shadow.
        *   Adjusting `th` styles (background, color, padding, text-align, font-weight, font-size, text-transform, letter-spacing).
        *   Adjusting `td` styles (padding, border-bottom, font-size, line-height, color).
        *   Applying hover effects to `tr` elements.

5.  **Review and Refine:**
    *   After applying all the CSS changes, open the modified `sensory-storms.html` file in a browser to visually inspect the changes.
    *   Check for readability of all text elements against their backgrounds.
    *   Ensure consistency in spacing, alignment, and overall visual style across different sections.
    *   Make any necessary minor adjustments to CSS properties to achieve the desired look and feel, matching the reference file as closely as possible.

**Implementation Mode:** Code Mode

```mermaid
graph TD
    A[Analyze User Request & Files] --> B{Identify Readability Issues};
    B --> C[Compare Styles with Reference File];
    C --> D[Formulate Plan];
    D --> E[Present Plan to User];
    E --> F{User Approves Plan?};
    F -- Yes --> G[Write Plan to Markdown File];
    G --> H[Switch to Code Mode for Implementation];
    F -- No --> D;
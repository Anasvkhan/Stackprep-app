module.exports = {
  slug: 'html-css',
  title: 'HTML & CSS',
  subtitle: 'Semantics, layout, responsive, a11y',
  description: 'HTML and CSS interview questions: semantic HTML, accessibility, box model, specificity, Flexbox, Grid, positioning, responsive design and modern CSS.',
  category: 'languages',
  roles: ['frontend', 'fullstack'],
  icon: 'css',
  color: '#E34F26',
  order: 13,
  topics: [
    {
      slug: 'html-a11y',
      title: 'Semantic HTML & Accessibility',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is semantic HTML and why does it matter?',
          e: `
**Semantic HTML** uses elements that describe their meaning: \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<aside>\`, \`<footer>\`, \`<button>\`, \`<form>\`, \`<label>\`.

**Why**
- **Accessibility:** screen readers understand structure and landmarks
- **SEO:** search engines understand content
- **Built-in behavior:** \`<button>\` is focusable and keyboard-operable; a \`<div onclick>\` is not
- Maintainability and readability`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which is the most accessible way to create a clickable control that performs an action?',
          o: ['<div onclick="...">', '<span class="btn">', '<button type="button">', '<a href="#">'],
          a: 2,
          e: 'Native buttons are focusable, announce their role, and respond to Enter/Space. Links are for navigation.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are key web accessibility (a11y) practices?',
          e: `
- Semantic elements and correct heading hierarchy (h1 -> h2 -> h3)
- **Alt text** for meaningful images (\`alt=""\` for decorative ones)
- Every form input has an associated \`<label>\`
- Full **keyboard navigation**, visible focus styles, logical tab order
- Sufficient **color contrast** (WCAG AA 4.5:1 for normal text); don't rely on color alone
- **ARIA** only when native HTML can't express it (\`aria-label\`, \`aria-expanded\`, \`role="dialog"\`) – "no ARIA is better than bad ARIA"
- Manage focus in modals (trap focus, return focus on close)
- Respect \`prefers-reduced-motion\`
- Test with screen readers (NVDA, VoiceOver) and axe/Lighthouse`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "defer" vs "async" attribute difference matter for?',
          o: ['CSS loading', 'Script execution order and timing relative to HTML parsing', 'Image loading', 'Font loading'],
          a: 1,
          e: 'defer: execute in order after parsing. async: execute as soon as downloaded, any order.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does <meta name="viewport" content="width=device-width, initial-scale=1"> do?',
          o: ['Sets the page title', 'Tells mobile browsers to use the device width as the layout viewport instead of a zoomed-out desktop width', 'Disables zoom', 'Improves SEO ranking only'],
          a: 1,
          e: 'Without it, mobile browsers render at ~980px wide and scale down, breaking responsive designs.',
        },
      ],
    },
    {
      slug: 'css-fundamentals',
      title: 'Box Model, Specificity & Positioning',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the CSS box model and box-sizing.',
          e: `
Every element is a box: **content -> padding -> border -> margin**.

- \`box-sizing: content-box\` (default): \`width\` applies to content only; padding and border are added on top.
- \`box-sizing: border-box\`: \`width\` includes padding and border – much easier to reason about.

~~~css
*, *::before, *::after { box-sizing: border-box; }
~~~
**Margin collapsing:** vertical margins of adjacent block elements collapse to the larger one (not in flex/grid containers).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which selector has the highest specificity?',
          o: ['.card .title', '#header', 'div p span', 'p.title'],
          a: 1,
          e: 'Specificity (ids, classes/attributes/pseudo-classes, elements): #header = (1,0,0) beats any number of classes. Inline styles beat ids; !important overrides normal declarations.',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain position values: static, relative, absolute, fixed and sticky.',
          e: `
- **static:** default, normal flow; top/left ignored.
- **relative:** stays in flow; offset relative to its normal position; becomes the containing block for absolute children.
- **absolute:** removed from flow; positioned relative to the nearest **positioned ancestor** (not static).
- **fixed:** relative to the viewport; stays on scroll (unless an ancestor has transform/filter).
- **sticky:** acts relative until a scroll threshold, then sticks (needs top/bottom and a scrollable ancestor without overflow hidden issues).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why might z-index: 9999 not bring an element above another?',
          o: ['z-index max is 999', 'The elements are in different stacking contexts (created by position+z-index, opacity < 1, transform, etc.)', 'z-index only works on images', 'It needs !important'],
          a: 1,
          e: 'z-index only compares elements within the same stacking context. A parent with a lower stacking context caps its children.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between display: none and visibility: hidden?',
          o: ['No difference', 'display:none removes the element from layout; visibility:hidden hides it but keeps its space', 'visibility:hidden removes it from the DOM', 'display:none keeps its space'],
          a: 1,
          e: 'Both hide it from screen readers. opacity: 0 keeps space and interactivity.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What do the CSS units rem, em, vh and % refer to?',
          o: ['All are pixels', 'rem: root font size; em: parent/element font size; vh: 1% of viewport height; %: relative to the parent property', 'rem: random; em: fixed', 'They are only for fonts'],
          a: 1,
          e: 'Use rem for scalable typography/spacing; dvh/svh units handle mobile browser UI bars better than vh.',
        },
      ],
    },
    {
      slug: 'layout-responsive',
      title: 'Flexbox, Grid & Responsive Design',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Flexbox vs Grid: when do you use each?',
          e: `
**Flexbox** – **one-dimensional** layout (row OR column). Content-driven sizing.
- Navbars, aligning items, toolbars, centering, distributing space in a row

**Grid** – **two-dimensional** layout (rows AND columns). Layout-driven.
- Page layouts, card galleries, dashboards, complex alignment

~~~css
.center { display: flex; justify-content: center; align-items: center; }
.cards  { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
~~~
They work great together: grid for the page, flex inside components.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'In a flex container with flex-direction: row, which property aligns items vertically?',
          o: ['justify-content', 'align-items', 'text-align', 'vertical-align'],
          a: 1,
          e: 'justify-content works along the main axis (horizontal in a row); align-items along the cross axis.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does flex: 1 mean?',
          o: ['width: 1px', 'flex-grow: 1, flex-shrink: 1, flex-basis: 0% – the item grows to fill available space equally with siblings', 'The item never shrinks', 'Only one item can be displayed'],
          a: 1,
          e: 'flex is shorthand for grow, shrink and basis.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you build a responsive website? Mobile-first vs desktop-first?',
          e: `
- **Fluid layouts** with flex/grid, %, \`minmax\`, \`clamp()\` for typography
- **Media queries** – **mobile-first**: base styles for small screens, then add \`@media (min-width: 768px)\` enhancements. Smaller CSS for mobile and simpler overrides.
- **Container queries** (\`@container\`) to style components based on their container width – great for reusable components
- **Responsive images:** \`srcset\`, \`sizes\`, \`<picture>\`, \`max-width: 100%\`
- Viewport meta tag, touch-friendly targets (>= 44px), test on real devices`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What does font-size: clamp(1rem, 2.5vw, 2rem) do?',
          o: ['Sets a fixed 2rem', 'Scales with viewport width but never below 1rem or above 2rem', 'Animates font size', 'Applies only on mobile'],
          a: 1,
          e: 'clamp(min, preferred, max) enables fluid typography without media queries.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which CSS properties are cheapest to animate for smooth 60fps animations?',
          o: ['width and height', 'top and left', 'transform and opacity', 'margin and padding'],
          a: 2,
          e: 'transform and opacity can be handled by the compositor without layout or paint.',
        },
      ],
    },
  ],
};

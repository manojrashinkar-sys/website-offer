// Lives outside the header component so hooks and pages can use it without
// importing the header (which would create an import cycle).
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

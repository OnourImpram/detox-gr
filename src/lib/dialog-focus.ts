/** Only the boundary is intercepted. Native Tab still visits intermediate controls normally. */
export function modalTabBoundary(index: number, count: number, reverse: boolean): number | null {
  if (count < 1) return null;
  if (index < 0) return reverse ? count - 1 : 0;
  if (reverse && index === 0) return count - 1;
  if (!reverse && index === count - 1) return 0;
  return null;
}

export function trapDialogTab(event: { key: string; shiftKey: boolean; currentTarget: HTMLElement; preventDefault: () => void }): void {
  if (event.key !== 'Tab') return;
  const panel = event.currentTarget;
  const controls = [...panel.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]')]
    .filter(element => element.tabIndex >= 0 && !element.matches(':disabled, [hidden], [inert]') && element.getClientRects().length > 0);
  const index = controls.indexOf(panel.ownerDocument.activeElement as HTMLElement);
  const next = modalTabBoundary(index, controls.length, event.shiftKey);
  if (next !== null) {
    event.preventDefault();
    controls[next].focus();
  }
}

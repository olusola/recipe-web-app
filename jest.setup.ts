import "@testing-library/jest-dom"

// Polyfills for Radix UI components in jsdom
if (typeof window !== "undefined") {
  // Pointer capture methods used by Radix primitives
  Element.prototype.hasPointerCapture =
    Element.prototype.hasPointerCapture || (() => false)
  Element.prototype.setPointerCapture =
    Element.prototype.setPointerCapture || (() => {})
  Element.prototype.releasePointerCapture =
    Element.prototype.releasePointerCapture || (() => {})

  // scrollIntoView is not implemented in jsdom
  Element.prototype.scrollIntoView =
    Element.prototype.scrollIntoView || (() => {})

  // ResizeObserver used by Radix popover/select positioning
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
}

// Suppress known Radix UI act() warnings in jsdom.
// @radix-ui/react-select's SelectItem triggers internal focus/state updates
// via requestAnimationFrame that escape act() boundaries in jsdom.
// This is an upstream limitation — not a bug in the tests or app code.
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : ""
  if (
    msg.includes("was not wrapped in act(") ||
    msg.includes("the `act` call was not awaited")
  ) {
    return
  }
  originalConsoleError(...args)
}

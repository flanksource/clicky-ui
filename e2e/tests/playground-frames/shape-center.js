(() => {
  const frame = document.querySelector('iframe[title="Page: frame-fixture"]');
  if (!(frame instanceof HTMLIFrameElement) || !frame.contentDocument) throw new Error("Fixture frame is unavailable");
  const shape = frame.contentDocument.querySelector("#shape");
  if (!shape) throw new Error("Fixture shape is unavailable");
  const outer = frame.getBoundingClientRect();
  const inner = shape.getBoundingClientRect();
  return {
    x: outer.left + inner.left + inner.width / 2,
    y: outer.top + inner.top + inner.height / 2,
    hostNavigation: performance.timeOrigin,
    frameNavigation: frame.contentWindow.performance.timeOrigin,
    fill: shape.getAttribute("fill"),
  };
})()

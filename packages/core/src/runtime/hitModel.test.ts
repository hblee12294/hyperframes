import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";

import { createPickerModule, elementPaints } from "./picker";

// jsdom lacks CSS.escape, which extractElementInfo's selector builder uses.
beforeAll(() => {
  const css = globalThis.CSS as { escape?: (input: string) => string } | undefined;
  if (!css || typeof css.escape !== "function") {
    (globalThis as { CSS?: { escape: (input: string) => string } }).CSS = {
      ...(css ?? {}),
      escape: (value: string) => value.replace(/([^\w-])/g, "\\$1"),
    };
  }
});

function div(style = "", html = ""): HTMLElement {
  const el = document.createElement("div");
  if (style) el.setAttribute("style", style);
  if (html) el.innerHTML = html;
  return el;
}

describe("elementPaints", () => {
  it("is true for a visible background color", () => {
    expect(elementPaints(div("background-color: red"), window)).toBe(true);
  });

  it("is true for a background image", () => {
    expect(elementPaints(div("background-image: url(x.png)"), window)).toBe(true);
  });

  it("is true for a visible border", () => {
    expect(elementPaints(div("border-top-style: solid; border-top-width: 2px"), window)).toBe(true);
  });

  it("is true for intrinsically painting media tags", () => {
    expect(elementPaints(document.createElement("img"), window)).toBe(true);
    expect(elementPaints(document.createElement("video"), window)).toBe(true);
  });

  it("is true for an element with its own non-whitespace text", () => {
    const el = document.createElement("p");
    el.textContent = "Hello";
    expect(elementPaints(el, window)).toBe(true);
  });

  it("is false for a bare grouping container (no paint, no own text)", () => {
    expect(elementPaints(div("", "<div>child</div>"), window)).toBe(false);
  });

  it("is false when the only text is whitespace", () => {
    const el = document.createElement("div");
    el.textContent = "   \n  ";
    expect(elementPaints(el, window)).toBe(false);
  });
});

describe("createPickerModule().getHitModel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("enumerates paintable elements with a paints flag, excluding the composition root", () => {
    document.body.innerHTML = `
      <div id="root" data-composition-id="root" data-width="1080" data-height="1920">
        <div id="group" data-hf-id="group"><p id="title" data-hf-id="title" style="background-color: blue">Hi</p></div>
      </div>`;
    const picker = createPickerModule({ postMessage: vi.fn() });

    const model = picker.getHitModel();
    const byId = Object.fromEntries(model.map((e) => [e.id, e]));

    // the composition root is never a selection target
    expect(byId.root).toBeUndefined();
    // the painting title is present and flagged as painting
    expect(byId.title).toBeDefined();
    expect(byId.title.paints).toBe(true);
    // the bare grouping wrapper is present but flagged as non-painting
    expect(byId.group).toBeDefined();
    expect(byId.group.paints).toBe(false);
    // every entry carries the picker element info shape
    expect(byId.title.boundingBox).toBeDefined();
    expect(byId.title.dataAttributes["data-hf-id"]).toBe("title");
  });
});

import { describe, expect, it } from "vitest";
import { validateEnvelope, validateFrameMessage, validateHostMessage } from "./validation.ts";

const image = { id: "badge", image: "data:image/webp;base64,UklGRg==", width: 120, height: 60 };
const reply = { type: "vocabulary-previews", images: [image] };

describe("vocabulary bridge validation", () => {
  it("accepts capture requests", () => {
    expect(validateHostMessage({ type: "capture-vocabulary" })).toEqual({ type: "capture-vocabulary" });
  });

  it("accepts preview replies correlated with a request", () => {
    const envelope = { bridge: "page-runtime-v1", session: "vocabulary-session", re: "capture-request", message: reply };
    expect(validateEnvelope(envelope, "frame")).toEqual(envelope);
  });

  it.each([0, 2000])("accepts %i images", (count) => {
    const message = { ...reply, images: Array.from({ length: count }, (_, index) => ({ ...image, id: `badge-${index}` })) };
    expect(validateFrameMessage(message)).toEqual(message);
  });

  it("rejects more than 2000 images", () => {
    expect(() => validateFrameMessage({ ...reply, images: Array.from({ length: 2001 }, (_, index) => ({ ...image, id: `badge-${index}` })) })).toThrow(/2000/);
  });

  it.each([null, {}, "images"])("rejects a non-array images value %j", (images) => {
    expect(() => validateFrameMessage({ ...reply, images })).toThrow();
  });

  it.each(["", null, 12, undefined])("rejects a non-string or empty id %j", (id) => {
    expect(() => validateFrameMessage({ ...reply, images: [{ ...image, id }] })).toThrow(/id/);
  });

  it.each(["", "data:image/png;base64,UklGRg==", "https://example.com/preview.webp", 12, null])("rejects an image without the WebP data URL prefix %j", (value) => {
    expect(() => validateFrameMessage({ ...reply, images: [{ ...image, image: value }] })).toThrow(/image/);
  });

  it.each(["width", "height"])("rejects a non-positive or non-finite %s", (dimension) => {
    for (const value of [0, -1, Infinity, -Infinity, NaN, "120", null, undefined]) {
      expect(() => validateFrameMessage({ ...reply, images: [{ ...image, [dimension]: value }] })).toThrow(new RegExp(dimension));
    }
  });

  it("accepts positive fractional dimensions and ids without extra length limits", () => {
    const message = { ...reply, images: [{ ...image, id: "b".repeat(5000), width: 0.5, height: 0.25 }] };
    expect(validateFrameMessage(message)).toEqual(message);
  });

  it("rejects duplicate ids", () => {
    expect(() => validateFrameMessage({ ...reply, images: [image, { ...image, width: 240 }] })).toThrow(/duplicate.*badge/);
  });

  it.each([
    { type: "capture-vocabulary", extra: true },
    { ...reply, extra: true },
    { ...reply, images: [{ ...image, extra: true }] },
  ])("rejects unexpected fields in $type", (message) => {
    expect(() => message.type === "capture-vocabulary" ? validateHostMessage(message) : validateFrameMessage(message)).toThrow();
  });
});

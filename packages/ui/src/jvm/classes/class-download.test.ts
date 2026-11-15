import { afterEach, describe, expect, it, vi } from "vitest";
import { base64ToBlob, classArtifactFilename, saveBlob } from "./class-download";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  Reflect.deleteProperty(URL, "createObjectURL");
  Reflect.deleteProperty(URL, "revokeObjectURL");
});

describe("classArtifactFilename", () => {
  it.each([
    ["com.example.orders.OrderService", "java", "com.example.orders.OrderService.java"],
    ["com.example.payments.PaymentClient$Retry", "class", "com.example.payments.PaymentClient$Retry.class"],
    ["com.example.Weird Name/..", "java", "com.example.Weird_Name_...java"],
  ] as const)("%s as .%s -> %s", (className, extension, expected) => {
    expect(classArtifactFilename(className, extension)).toBe(expected);
  });
});

describe("base64ToBlob", () => {
  it("decodes the class file bytes the agent sent", async () => {
    // 0xCAFEBABE is the class file magic number.
    const blob = base64ToBlob("yv66vg==", "application/java-vm");
    expect(blob.type).toBe("application/java-vm");
    // jsdom's Blob has no arrayBuffer().
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    expect([...new Uint8Array(bytes)]).toEqual([0xca, 0xfe, 0xba, 0xbe]);
  });

  it("rejects text that is not base64 instead of saving a corrupt class", () => {
    expect(() => base64ToBlob("not base64!!", "application/java-vm")).toThrow();
  });
});

describe("saveBlob", () => {
  it("clicks a download link for the blob and releases its URL afterwards", () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => "blob:class-file");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const clicked: Array<{ href: string; download: string }> = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push({ href: this.href, download: this.download });
    });
    const blob = new Blob(["class OrderService {}"], { type: "text/x-java-source" });

    saveBlob("OrderService.java", blob);

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clicked).toEqual([{ href: "blob:class-file", download: "OrderService.java" }]);
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:class-file");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});

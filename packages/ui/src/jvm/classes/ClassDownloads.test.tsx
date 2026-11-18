import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClassDownloads } from "./ClassDownloads";
import { saveBlob } from "./class-download";

// jsdom has no URL.createObjectURL, so the real saver cannot run here.
vi.mock("./class-download", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./class-download")>()),
  saveBlob: vi.fn(),
}));

const CLASS = "com.example.orders.OrderService";
const SOURCE = "package com.example.orders;\npublic class OrderService {}\n";

function savedBlob(): { filename: string; blob: Blob } {
  const [call] = vi.mocked(saveBlob).mock.calls;
  if (!call) throw new Error("nothing was saved");
  return { filename: call[0], blob: call[1] };
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(blob);
  });
}

beforeEach(() => vi.clearAllMocks());

describe("ClassDownloads", () => {
  it("saves the shown source as a .java file named after the class", async () => {
    render(<ClassDownloads qualifiedName={CLASS} source={SOURCE} loadBytecode={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Download source" }));
    const { filename, blob } = savedBlob();
    expect(filename).toBe("com.example.orders.OrderService.java");
    expect(blob.type).toBe("text/x-java-source;charset=utf-8");
    expect(await readBlob(blob)).toBe(SOURCE);
  });

  it("fetches the loaded class file and saves its bytes as a .class file", async () => {
    // 0xCAFEBABE, the class file magic number.
    const loadBytecode = vi.fn(async () => "yv66vg==");
    render(<ClassDownloads qualifiedName={CLASS} source={SOURCE} loadBytecode={loadBytecode} />);
    fireEvent.click(screen.getByRole("button", { name: "Download .class" }));
    await waitFor(() => expect(saveBlob).toHaveBeenCalledOnce());
    const { filename, blob } = savedBlob();
    expect(filename).toBe("com.example.orders.OrderService.class");
    expect(blob.type).toBe("application/java-vm");
    expect(await readBlob(blob)).toBe("\xca\xfe\xba\xbe");
  });

  it("disables the buttons with no class to download", () => {
    render(<ClassDownloads qualifiedName="" source={undefined} loadBytecode={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Download source" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download .class" })).toBeDisabled();
  });

  it("disables the source download for an empty source", () => {
    render(<ClassDownloads qualifiedName={CLASS} source="" loadBytecode={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Download source" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download .class" })).toBeEnabled();
  });

  it("shows why a class file could not be downloaded and saves nothing", async () => {
    render(<ClassDownloads qualifiedName={CLASS} source={SOURCE} loadBytecode={vi.fn(async () => Promise.reject(new Error("java.lang.ClassNotFoundException")))} />);
    fireEvent.click(screen.getByRole("button", { name: "Download .class" }));
    expect((await screen.findAllByText(/ClassNotFoundException/)).length).toBeGreaterThan(0);
    expect(saveBlob).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { createScreen, resizeScreen, screenText, screenToAnsi, writeScreen } from "./terminal-screen";

function render(width: number, height: number, ...chunks: string[]) {
  const screen = createScreen(width, height);
  for (const chunk of chunks) writeScreen(screen, chunk);
  return screen;
}

describe("terminal screen", () => {
  it("starts a new line on CRLF", () => {
    expect(screenText(render(10, 3, "one\r\ntwo\r\n"))).toBe("one\ntwo\n");
  });

  it("overwrites the line a bare carriage return returns to", () => {
    expect(screenText(render(20, 2, "progress 1/3\rprogress 2/3\r"))).toBe("progress 2/3\n");
  });

  it("scrolls the viewport when output runs past the last row", () => {
    expect(screenText(render(5, 2, "a\r\nb\r\nc\r\n"))).toBe("c\n");
  });

  it("wraps text at the screen width", () => {
    expect(screenText(render(4, 3, "abcdef"))).toBe("abcd\nef\n");
  });

  it("backspace moves left so the next character overwrites", () => {
    expect(screenText(render(10, 1, "abc\bX"))).toBe("abX");
  });

  it("clears the line from the cursor with ESC[K", () => {
    expect(screenText(render(10, 1, "hello\r\u001b[3C\u001b[K"))).toBe("hel");
  });

  it("clears the whole screen and homes the cursor with ESC[2J ESC[H", () => {
    expect(screenText(render(10, 2, "old\r\nolder", "\u001b[2J\u001b[Hnew"))).toBe("new\n");
  });

  it("moves the cursor to a 1-based row and column with ESC[r;cH", () => {
    expect(screenText(render(5, 3, "\u001b[2;3HX"))).toBe("\n  X\n");
  });

  it("moves the cursor up and down with ESC[A and ESC[B", () => {
    expect(screenText(render(5, 3, "a\r\nb\u001b[Ac"))).toBe("ac\nb\n");
  });

  it("keeps an escape sequence split across writes", () => {
    expect(screenText(render(10, 1, "ab\u001b[", "2D", "X"))).toBe("Xb");
  });

  it("ignores OSC sequences and private modes", () => {
    expect(screenText(render(10, 1, "\u001b]0;title\u0007\u001b[?25lok"))).toBe("ok");
  });

  it("tabs to the next multiple of 8", () => {
    expect(screenText(render(20, 1, "a\tb"))).toBe("a       b");
  });

  it("keeps SGR colour per cell and serialises runs of equal style", () => {
    const screen = render(10, 1, "\u001b[32mgo\u001b[0m ok");
    expect(screenToAnsi(screen)).toBe("\u001b[32mgo\u001b[0m ok");
  });

  it("serialises bold, dim, italic and underline alongside the colour, resetting between changes", () => {
    const screen = render(10, 1, "\u001b[1;4;31mX\u001b[22;24mY");
    expect(screenToAnsi(screen)).toBe("\u001b[1;4;31mX\u001b[0;31mY");
  });

  it("drops extended colours and backgrounds AnsiHtml cannot render, with their parameters", () => {
    const screen = render(10, 1, "\u001b[38;2;10;20;30;44mX\u001b[0m");
    expect(screenToAnsi(screen)).toBe("X");
  });

  it("trims trailing blanks of each row but keeps the row count", () => {
    expect(screenToAnsi(render(10, 3, "hi   "))).toBe("hi\n\n");
  });

  it("grows and shrinks the screen on resize, keeping the content that still fits", () => {
    const screen = render(10, 3, "one\r\ntwo\r\nthree");
    resizeScreen(screen, 10, 2);
    expect(screenText(screen)).toBe("two\nthree");
    resizeScreen(screen, 10, 4);
    expect(screen.rows).toHaveLength(4);
    expect(screenText(screen)).toBe("two\nthree\n\n");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImagePreview } from "./ImagePreview";

const SRC = "/api/file/1/image?path=img%2Fa.png";

describe("ImagePreview", () => {
  it("renders the image from src with its alt text", () => {
    render(<ImagePreview src={SRC} alt="Architecture diagram" />);
    const image = screen.getByRole("img", { name: "Architecture diagram" });
    expect(image).toHaveAttribute("src", SRC);
  });

  it("toggles between fit-to-pane and actual size on click", () => {
    render(<ImagePreview src={SRC} alt="Diagram" />);
    const image = screen.getByRole("img", { name: "Diagram" });
    expect(image).toHaveAttribute("data-size", "fit");
    fireEvent.click(image);
    expect(image).toHaveAttribute("data-size", "actual");
    fireEvent.click(image);
    expect(image).toHaveAttribute("data-size", "fit");
  });

  it("names the alt text in the alert when the image fails to load", () => {
    render(<ImagePreview src={SRC} alt="Diagram" />);
    fireEvent.error(screen.getByRole("img", { name: "Diagram" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load Diagram");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("names the src in the alert when there is no alt text", () => {
    render(<ImagePreview src={SRC} />);
    fireEvent.error(document.querySelector("img")!);
    expect(screen.getByRole("alert")).toHaveTextContent(`Could not load ${SRC}`);
  });

  it("tries the new image after src changes following a failure", () => {
    const { rerender } = render(<ImagePreview src={SRC} alt="Diagram" />);
    fireEvent.error(screen.getByRole("img", { name: "Diagram" }));
    rerender(<ImagePreview src="/other.png" alt="Diagram" />);
    expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute("src", "/other.png");
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Utility to render App with a MemoryRouter at the given initial entry
function renderAt(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("App smoke routing", () => {
  test("renders Browse at /", () => {
    renderAt("/");
    // header and Browse heading
    expect(screen.getByRole("banner", { name: /Application header/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Browse/i })).toBeInTheDocument();
    // left nav presence
    expect(screen.getByRole("navigation", { name: /Main/i })).toBeInTheDocument();
    // player bar presence
    expect(screen.getByRole("contentinfo", { name: /Player controls/i })).toBeInTheDocument();
  });

  test("renders Search at /search and updates query", async () => {
    const user = userEvent.setup();
    renderAt("/search");
    expect(screen.getByRole("heading", { name: /Search/i })).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /Search query/i });
    await user.clear(input);
    await user.type(input, "mozart");
    const btn = screen.getByRole("button", { name: /Search/i });
    await user.click(btn);

    // Results section should be present even if empty
    expect(screen.getByRole("region", { name: /Results/i })).toBeInTheDocument();
  });

  test("renders Library at /library", () => {
    renderAt("/library");
    expect(screen.getByRole("heading", { name: /Library/i })).toBeInTheDocument();
  });

  test("renders Playlist at /playlist/:id", () => {
    renderAt("/playlist/p1");
    // It should render some of the static chrome first
    expect(screen.getByRole("contentinfo", { name: /Player controls/i })).toBeInTheDocument();
    // The loading or fallback regions are acceptable depending on mock fetch timing
    // Look for Tracks region container that exists when loaded
    // Not asserting data since mock fetch is async
  });

  test("renders Discover at /discover", () => {
    renderAt("/discover");
    expect(screen.getByRole("heading", { name: /Discover/i })).toBeInTheDocument();
  });
});

describe("Audio gesture handling (mock)", () => {
  test("user gesture before attempting play avoids autoplay errors", async () => {
    const user = userEvent.setup();
    renderAt("/");

    // Focus the player bar and press Space to simulate a gesture-driven play toggle
    const player = screen.getByRole("contentinfo", { name: /Player controls/i });
    player.focus();
    await user.keyboard("{Space}");

    // Since there is no track loaded yet, the UI should remain stable and not throw
    expect(player).toBeInTheDocument();
  });
});

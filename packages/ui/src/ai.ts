// Public surface of the chat *application shell* — multi-window management,
// thread switching, context badges, tool preferences and a usage gauge — built
// on top of the lower-level `./chat` family. Kept in its own barrel so the
// optional `react-rnd` dependency (only loaded by ChatWindow) never enters the
// dependency/bundle path of consumers that import just `./chat`.
export * from "./data/ai";

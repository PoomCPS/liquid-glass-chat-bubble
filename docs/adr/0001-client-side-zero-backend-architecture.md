# 1. Zero-Backend Client-Side Architecture

We decided to build the chat overlay as a self-contained client-side web application loaded directly into OBS as a Browser Source, rather than requiring a local Node.js or Python background server. Twitch chat is consumed via an anonymous WebSocket IRC connection (`wss://irc-ws.chat.twitch.tv`), and YouTube Live Chat is polled directly via the YouTube Data API v3. This eliminates user installation friction, background process management, and port conflicts on streaming setups while keeping latency low.

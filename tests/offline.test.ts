import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

function harness(failInstall = false) {
  let source = "";
  // Exercise the actual generator and worker with an isolated fake build/cache.
  vm.runInNewContext(readFileSync("scripts/build-offline.cjs", "utf8"), {
    require: (id: string) =>
      id === "node:path"
        ? path
        : {
            readFileSync: () => "release-new",
            readdirSync: () => [{ name: "abc.js", isDirectory: () => false }],
            writeFileSync: (_file: string, value: string) => {
              source = value;
            },
          },
    console: { log: () => {} },
  });
  const handlers: Record<string, (event: any) => void> = {};
  const store = new Map<string, Map<string, Response>>([
    ["schedulehaw-public-oldest", new Map()],
    [
      "schedulehaw-public-previous",
      new Map([["/_next/static/old.js", new Response("old public code")]]),
    ],
  ]);
  let claimed = false,
    activated = false;
  const caches = {
    keys: async () => [...store.keys()],
    delete: async (key: string) => store.delete(key),
    open: async (key: string) => {
      if (!store.has(key)) store.set(key, new Map());
      const cache = store.get(key)!;
      return {
        addAll: async (urls: string[]) => {
          if (failInstall) throw new Error("network failure");
          for (const url of urls) cache.set(url, new Response("public:" + url));
        },
        match: async (url: string) => cache.get(url)?.clone(),
      };
    },
  };
  vm.runInNewContext(source, {
    caches,
    URL,
    fetch: async () => {
      throw new Error("offline");
    },
    self: {
      location: { origin: "https://schedule.test" },
      addEventListener: (type: string, handler: (event: any) => void) => {
        handlers[type] = handler;
      },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
      skipWaiting: () => {
        activated = true;
      },
    },
  });
  const lifecycle = async (name: string) => {
    let task: Promise<unknown> | undefined;
    handlers[name]({
      waitUntil: (promise: Promise<unknown>) => {
        task = promise;
      },
    });
    await task;
  };
  return {
    handlers,
    store,
    lifecycle,
    claimed: () => claimed,
    activated: () => activated,
  };
}
it("installs atomically, preserves the previous release and only activates an update explicitly", async () => {
  const h = harness();
  await h.lifecycle("install");
  expect(h.activated()).toBe(false);
  await h.lifecycle("activate");
  expect(h.claimed()).toBe(true);
  expect([...h.store.keys()]).toEqual([
    "schedulehaw-public-previous",
    "schedulehaw-public-release-new",
  ]);
  expect(
    await h.store
      .get("schedulehaw-public-previous")!
      .get("/_next/static/old.js")!
      .text(),
  ).toBe("old public code");
  h.handlers.message({ data: "untrusted" });
  expect(h.activated()).toBe(false);
  h.handlers.message({ data: "ACTIVATE_UPDATE" });
  expect(h.activated()).toBe(true);
  const failed = harness(true);
  await expect(failed.lifecycle("install")).rejects.toThrow("network failure");
  expect(failed.store.has("schedulehaw-public-release-new")).toBe(false);
  expect(failed.store.has("schedulehaw-public-previous")).toBe(true);
});
it("serves coherent offline documents and never intercepts private, query, RSC or external traffic", async () => {
  const h = harness();
  await h.lifecycle("install");
  for (const request of [
    { method: "POST", url: "https://schedule.test/progress" },
    { method: "GET", url: "https://schedule.test/api/pulse" },
    { method: "GET", url: "https://other.test/progress" },
    { method: "GET", url: "https://schedule.test/progress?profile=private" },
    { method: "GET", url: "https://schedule.test/progress", rsc: "1" },
  ]) {
    let intercepted = false;
    h.handlers.fetch({
      request: {
        ...request,
        headers: { get: () => ("rsc" in request ? request.rsc : null) },
      },
      respondWith: () => {
        intercepted = true;
      },
    });
    expect(intercepted).toBe(false);
  }
  let response: Promise<Response> | undefined;
  h.handlers.fetch({
    request: {
      method: "GET",
      mode: "navigate",
      url: "https://schedule.test/advisor",
      headers: { get: () => null },
    },
    respondWith: (r: Promise<Response>) => {
      response = r;
    },
  });
  expect(await (await response!).text()).toBe("public:/advisor");
});

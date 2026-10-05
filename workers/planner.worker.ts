import { generatePlans } from "@/lib/planner";
import type { WorkerRequest, WorkerResponse } from "@/lib/domain/types";
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
};
scope.onmessage = (event) => {
  if (event.data.type !== "generate") return;
  const { input, requestId, nodeBudget } = event.data;
  try {
    scope.postMessage({
      type: "result",
      result: generatePlans(input, requestId, nodeBudget, (n) =>
        scope.postMessage({ type: "progress", requestId, exploredNodes: n }),
      ),
    });
  } catch {
    scope.postMessage({ type: "error", requestId, code: "DATA_INVALID" });
  }
};

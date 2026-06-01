import { OrchestratorEvent } from "./orchestrator-types";
import { GatewayEvent } from "./events";
/**
 * Maps an internal OrchestratorEvent to a wire-protocol GatewayEvent.
 * This is used by the Gateway to broadcast events to the UI.
 */
export declare function mapOrchestratorEvent(e: OrchestratorEvent): GatewayEvent | null;
//# sourceMappingURL=event-mapper.d.ts.map
export interface AgentPreset {
    palette: number;
    name: string;
    role: string;
    description: string;
    personality: string;
    isLeader?: boolean;
}
/** 6 predefined agents: 1/3/5 male, 2/4/6 female */
export declare const AGENT_PRESETS: AgentPreset[];
/** Index of the default (and mandatory) team leader preset. */
export declare const LEADER_PRESET_INDEX: number;
//# sourceMappingURL=presets.d.ts.map
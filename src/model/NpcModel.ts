export interface NpcModel {
  actions: {
    fight: boolean;
    "join party": boolean;
    "run away": boolean;
    trade: boolean;
  };
  attributes: {
    anger: number;
    fear: number;
    seduced: number;
    trust: number;
  };
  player: {
    A: string;
    B: string;
    D: string;
    C: string;
  };
  info: {
    name: string | null;
  };
  creature: string;
}

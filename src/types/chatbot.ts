export interface ChatOption {
  label: string;
  next: string;
}

export interface InfoNode {
  id: string;
  type: "info";
  content: string;
  options?: ChatOption[];
}

export interface ChoiceNode {
  id: string;
  type: "choice";
  content: string;
  options: ChatOption[];
}

export interface InputNode {
  id: string;
  type: "input";
  content: string;
  dataKey: string;
  next: string;
}

export interface TerminalNode {
  id: string;
  type: "terminal";
  content: string;
}

export type ChatNode = InfoNode | ChoiceNode | InputNode | TerminalNode;

export interface KnowledgeGraph {
  root: string;
  nodes: Record<string, ChatNode>;
}

export interface HistoryItem {
  type: "bot" | "user";
  content: string;
}

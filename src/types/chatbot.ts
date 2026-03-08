export interface ChatOption {
  label: string;
  next: string;
}

export interface ChatNode {
  message: string;
  options: ChatOption[];
}

export interface ChatTree {
  [key: string]: ChatNode;
}

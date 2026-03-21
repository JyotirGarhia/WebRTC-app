export type ClientMessage =
  | { type: "create-room"; roomId: string; userId: string; name: string }
  | { type: "join-request"; roomId: string; userId: string; name: string }
  | { type: "join-response"; roomId: string; userId: string; approved: boolean }
  | { type: "leave-room"; roomId: string; userId: string }
  | { type: "end-room"; roomId: string };

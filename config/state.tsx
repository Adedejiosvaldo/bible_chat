interface Message {
  role: "user" | "ai";
  content: string;
}

interface ConversationState {
  messages: Message[];
}

const conversationStates: { [userId: string]: ConversationState } = {};

export const getConversationState = (userId: string): ConversationState => {
  return conversationStates[userId] || { messages: [] };
};

export const setConversationState = (
  userId: string,
  state: ConversationState
) => {
  conversationStates[userId] = state;
};

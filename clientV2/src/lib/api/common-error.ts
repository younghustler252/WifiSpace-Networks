export const COMMON_ERROR_MESSAGES: Record<string, string> = {
	IDEMPOTENCY_KEY_REUSED: "That request was already used with different details. Close this window and start again.",
	IDEMPOTENCY_KEY_IN_PROGRESS: "This is already being processed. Give it a moment, then check the details before trying again.",
	DUPLICATE_REQUEST: "That looks like a duplicate of a request you just sent. Wait a few seconds and check the details before trying again.",
};
/** Pixels from bottom of the scroll viewport treated as "at bottom" for UI state. */
export const NEAR_BOTTOM_THRESHOLD = 70;

/** Ancestor used to measure height for the active turn min-height (see README). */
export const CHAT_MESSAGES_CONTAINER_SELECTOR = ".chat-messages-container";

/** Added to measured `.chat-messages-container` height for the active turn min-height. */
export const ACTIVE_TURN_MIN_HEIGHT_OFFSET_PX = -30;

/** Viewport inset for the beginning of a newly submitted turn. */
export const TURN_TOP_INSET_PX = 16;

/** Spatial transition shared by new turns and jump-to-latest. */
export const TURN_TRANSITION_DURATION_MS = 240;
export const TURN_TRANSITION_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

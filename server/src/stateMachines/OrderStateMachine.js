/**
 * FarmConnect Order State Machine
 * Strict enforcement of the 13 valid lifecycle states for farm orders.
 * Prevents illegal jumps such as DELIVERED -> PROCESSING or PICKED_UP -> CREATED.
 */

export const ORDER_STATES = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  ACCEPTED: 'ACCEPTED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

// Map of permissible forward/terminal transitions
const VALID_TRANSITIONS = {
  [ORDER_STATES.CREATED]: [
    ORDER_STATES.PAYMENT_PENDING,
    ORDER_STATES.PAID,
    ORDER_STATES.CANCELLED,
  ],
  [ORDER_STATES.PAYMENT_PENDING]: [
    ORDER_STATES.PAID,
    ORDER_STATES.CANCELLED,
  ],
  [ORDER_STATES.PAID]: [
    ORDER_STATES.ACCEPTED,
    ORDER_STATES.CANCELLED,
    ORDER_STATES.REFUNDED,
  ],
  [ORDER_STATES.ACCEPTED]: [
    ORDER_STATES.PROCESSING,
    ORDER_STATES.CANCELLED,
  ],
  [ORDER_STATES.PROCESSING]: [
    ORDER_STATES.PACKED,
  ],
  [ORDER_STATES.PACKED]: [
    ORDER_STATES.READY_FOR_PICKUP,
  ],
  [ORDER_STATES.READY_FOR_PICKUP]: [
    ORDER_STATES.PICKED_UP,
  ],
  [ORDER_STATES.PICKED_UP]: [
    ORDER_STATES.IN_TRANSIT,
  ],
  [ORDER_STATES.IN_TRANSIT]: [
    ORDER_STATES.OUT_FOR_DELIVERY,
  ],
  [ORDER_STATES.OUT_FOR_DELIVERY]: [
    ORDER_STATES.DELIVERED,
  ],
  [ORDER_STATES.DELIVERED]: [], // Terminal state
  [ORDER_STATES.CANCELLED]: [
    ORDER_STATES.REFUNDED,
  ],
  [ORDER_STATES.REFUNDED]: [], // Terminal state
};

export class OrderStateMachine {
  /**
   * Validates whether a state transition from currentState to nextState is permitted.
   * Throws Error if illegal transition.
   */
  static validateTransition(currentState, nextState) {
    if (!ORDER_STATES[currentState]) {
      throw new Error(`Invalid current order state: '${currentState}'`);
    }
    if (!ORDER_STATES[nextState]) {
      throw new Error(`Invalid target order state: '${nextState}'`);
    }

    const allowedNextStates = VALID_TRANSITIONS[currentState] || [];
    if (!allowedNextStates.includes(nextState)) {
      throw new Error(
        `Illegal State Machine Transition: Cannot transition order from '${currentState}' to '${nextState}'. Permissible next states: [${allowedNextStates.join(', ') || 'None (Terminal)'}].`
      );
    }

    return true;
  }

  /**
   * Checks boolean validity without throwing
   */
  static canTransition(currentState, nextState) {
    try {
      return this.validateTransition(currentState, nextState);
    } catch {
      return false;
    }
  }

  /**
   * Returns list of allowed transitions from currentState
   */
  static getAllowedTransitions(currentState) {
    return VALID_TRANSITIONS[currentState] || [];
  }
}

export default OrderStateMachine;

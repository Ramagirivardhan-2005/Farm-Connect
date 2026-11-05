import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderStateMachine, ORDER_STATES } from '../stateMachines/OrderStateMachine.js';
import { encryptSensitive, decryptSensitive, maskSensitive } from '../utils/crypto.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.js';

test('Order State Machine - Valid forward transitions succeed', () => {
  // Test sequential forward flow: CREATED -> PAID -> ACCEPTED -> PROCESSING -> PACKED -> READY_FOR_PICKUP -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.CREATED, ORDER_STATES.PAID), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PAID, ORDER_STATES.ACCEPTED), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.ACCEPTED, ORDER_STATES.PROCESSING), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PROCESSING, ORDER_STATES.PACKED), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PACKED, ORDER_STATES.READY_FOR_PICKUP), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.READY_FOR_PICKUP, ORDER_STATES.PICKED_UP), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PICKED_UP, ORDER_STATES.IN_TRANSIT), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.IN_TRANSIT, ORDER_STATES.OUT_FOR_DELIVERY), true);
  assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.OUT_FOR_DELIVERY, ORDER_STATES.DELIVERED), true);
});

test('Order State Machine - Invalid transition DELIVERED -> PROCESSING strictly throws error (Instruction 97)', () => {
  assert.throws(
    () => {
      OrderStateMachine.validateTransition(ORDER_STATES.DELIVERED, ORDER_STATES.PROCESSING);
    },
    {
      name: 'Error',
      message: /Illegal State Machine Transition: Cannot transition order from 'DELIVERED' to 'PROCESSING'/,
    }
  );
});

test('Order State Machine - Invalid transition PICKED_UP -> CREATED strictly throws error', () => {
  assert.throws(
    () => {
      OrderStateMachine.validateTransition(ORDER_STATES.PICKED_UP, ORDER_STATES.CREATED);
    },
    {
      name: 'Error',
      message: /Illegal State Machine Transition/,
    }
  );
});

test('Cryptography - Authenticated AES-256-GCM encryption & decryption (Instruction 13)', () => {
  const secretAadhaar = '5482-9901-2241';
  const ciphertext = encryptSensitive(secretAadhaar);

  assert.notEqual(ciphertext, secretAadhaar);
  assert.ok(ciphertext.includes(':'));

  const decrypted = decryptSensitive(ciphertext);
  assert.equal(decrypted, secretAadhaar);

  const masked = maskSensitive(secretAadhaar);
  assert.equal(masked, 'XXXXXXXX2241');
});

test('Password Security - bcrypt 12-round hashing & verification (Instruction 12)', async () => {
  const plain = 'OrganicFarmer@2026';
  const hash = await hashPassword(plain);

  assert.notEqual(hash, plain);
  assert.ok(hash.startsWith('$2'));

  const isValid = await verifyPassword(plain, hash);
  assert.equal(isValid, true);

  const isInvalid = await verifyPassword('WrongPassword', hash);
  assert.equal(isInvalid, false);
});

test('JWT Authentication - Sign & verify 15-minute access token (Instruction 11)', () => {
  const user = {
    id: 'user-1234',
    userId: 'RV10241',
    role: 'CUSTOMER',
    email: 'vardhan@farmconnect.org',
  };

  const token = signAccessToken(user);
  assert.ok(token);

  const decoded = verifyAccessToken(token);
  assert.equal(decoded.userId, 'RV10241');
  assert.equal(decoded.role, 'CUSTOMER');
});

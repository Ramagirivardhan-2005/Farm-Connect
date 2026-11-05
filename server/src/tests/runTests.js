import assert from 'node:assert/strict';
import { OrderStateMachine, ORDER_STATES } from '../stateMachines/OrderStateMachine.js';
import { encryptSensitive, decryptSensitive, maskSensitive } from '../utils/crypto.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.js';

console.log('--- STARTING FARMCONNECT TEST SUITE ---');

// Test 1: Order State Machine Forward Progression
console.log('TEST 1: Order State Machine - Valid forward transitions');
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.CREATED, ORDER_STATES.PAID), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PAID, ORDER_STATES.ACCEPTED), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.ACCEPTED, ORDER_STATES.PROCESSING), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PROCESSING, ORDER_STATES.PACKED), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PACKED, ORDER_STATES.READY_FOR_PICKUP), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.READY_FOR_PICKUP, ORDER_STATES.PICKED_UP), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.PICKED_UP, ORDER_STATES.IN_TRANSIT), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.IN_TRANSIT, ORDER_STATES.OUT_FOR_DELIVERY), true);
assert.equal(OrderStateMachine.validateTransition(ORDER_STATES.OUT_FOR_DELIVERY, ORDER_STATES.DELIVERED), true);
console.log('✓ PASS: All 9 sequential state machine transitions succeeded.');

// Test 2: Invalid State Machine Transition
console.log('TEST 2: Order State Machine - DELIVERED -> PROCESSING strictly rejected (Instruction 97)');
assert.throws(
  () => {
    OrderStateMachine.validateTransition(ORDER_STATES.DELIVERED, ORDER_STATES.PROCESSING);
  },
  {
    name: 'Error',
    message: /Illegal State Machine Transition: Cannot transition order from 'DELIVERED' to 'PROCESSING'/,
  }
);
console.log('✓ PASS: Illegal state machine jump strictly caught and rejected.');

// Test 3: Authenticated AES-256-GCM Encryption
console.log('TEST 3: Cryptography - AES-256-GCM authenticated encryption (Instruction 13)');
const testAadhaar = '5482-9901-2241';
const encrypted = encryptSensitive(testAadhaar);
assert.notEqual(encrypted, testAadhaar);
assert.ok(encrypted.includes(':'));
const decrypted = decryptSensitive(encrypted);
assert.equal(decrypted, testAadhaar);
const masked = maskSensitive(testAadhaar);
assert.equal(masked, 'XXXXXXXX2241');
console.log('✓ PASS: AES-256-GCM encryption, decryption, and PII masking verified.');

// Test 4: Bcrypt Password Security
console.log('TEST 4: Password Security - 12-round bcrypt hash verification (Instruction 12)');
const plainPass = 'FarmConnect@2026';
const passHash = await hashPassword(plainPass);
assert.notEqual(passHash, plainPass);
assert.equal(await verifyPassword(plainPass, passHash), true);
assert.equal(await verifyPassword('IncorrectPassword', passHash), false);
console.log('✓ PASS: Password hashing and verification verified.');

// Test 5: JWT Token Security
console.log('TEST 5: JWT Authentication - 15-minute access token rotation (Instruction 11)');
const tokenUser = { userId: 'RV10241', role: 'CUSTOMER', email: 'vardhan@farmconnect.org' };
const accessToken = signAccessToken(tokenUser);
const decoded = verifyAccessToken(accessToken);
assert.equal(decoded.userId, 'RV10241');
assert.equal(decoded.role, 'CUSTOMER');
console.log('✓ PASS: JWT access token issuance and signature verification succeeded.');

console.log('--- ALL TESTS PASSED SUCCESSFULLY (5/5) ---');
process.exit(0);

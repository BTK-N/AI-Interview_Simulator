import { ALLOWED_TRANSITIONS } from '../sessionStore.ts';

// Standalone FSM verification engine replicating sessionStore validation logic
function testFSM() {
  console.log('--- RUNNING FSM TRANSITION VALIDATION AUDIT ---');

  let currentStage = 'idle';
  let lastError = null;

  function transitionTo(targetStage) {
    if (targetStage === currentStage) return true;
    const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
    if (!allowed.includes(targetStage)) {
      lastError = `[FSM Validation Error] Illegal state transition from "${currentStage}" to "${targetStage}". Allowed targets: [${allowed.join(', ')}]`;
      return false;
    }
    currentStage = targetStage;
    lastError = null;
    return true;
  }

  // TEST 1: Attempt invalid transition: idle -> report
  console.log('\n[TEST 1] Attempting illegal transition: idle -> report...');
  const test1Result = transitionTo('report');
  console.log('Result:', test1Result ? 'FAILED (Transition was allowed)' : 'PASSED (Rejected)');
  console.log('Current Stage:', currentStage);
  console.log('Error Message:', lastError);

  if (test1Result !== false || currentStage !== 'idle') {
    throw new Error('TEST 1 FAILED: idle -> report was not rejected!');
  }

  // TEST 2: Attempt illegal transition: question_asked -> report
  transitionTo('hardware_check');
  transitionTo('question_asked');
  console.log('\n[TEST 2] Current stage is "question_asked". Attempting illegal transition: question_asked -> report...');
  const test2Result = transitionTo('report');
  console.log('Result:', test2Result ? 'FAILED (Transition was allowed)' : 'PASSED (Rejected)');
  console.log('Current Stage:', currentStage);
  console.log('Error Message:', lastError);

  if (test2Result !== false || currentStage !== 'question_asked') {
    throw new Error('TEST 2 FAILED: question_asked -> report was not rejected!');
  }

  // TEST 3: Execute complete 9-stage valid sequence
  console.log('\n[TEST 3] Testing full valid 9-stage lifecycle sequence...');
  currentStage = 'idle';
  const validSequence = [
    'hardware_check',
    'question_asked',
    'recording',
    'transcribing',
    'analyzing',
    'feedback',
    'next_question',
    'report',
    'idle',
  ];

  for (const nextStage of validSequence) {
    const ok = transitionTo(nextStage);
    if (!ok) {
      throw new Error(`Valid transition to ${nextStage} failed unexpectedly! Error: ${lastError}`);
    }
    console.log(`  ✓ Transitioned to: ${currentStage}`);
  }

  console.log('\nALL FSM TRANSITION TESTS PASSED SUCCESSFULLY.');
}

testFSM();

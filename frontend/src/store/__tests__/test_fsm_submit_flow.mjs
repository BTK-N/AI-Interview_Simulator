// Comprehensive FSM Submit Flow & Warning Threshold Verification
const ALLOWED_TRANSITIONS = {
  idle: ['hardware_check', 'question_asked', 'idle'],
  hardware_check: ['question_asked', 'idle'],
  question_asked: ['recording', 'idle'],
  recording: ['transcribing', 'idle'],
  transcribing: ['analyzing', 'recording', 'idle'],
  analyzing: ['feedback', 'idle'],
  feedback: ['next_question', 'report', 'idle'],
  next_question: ['question_asked', 'report', 'idle'],
  report: ['idle'],
};

console.log('===============================================================');
console.log('FSM SUBMIT FLOW & ASYNC STAGE VERIFICATION AUDIT');
console.log('===============================================================');

let currentStage = 'recording';
const stageHistory = [currentStage];

function transitionTo(targetStage) {
  const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
  if (!allowed.includes(targetStage)) {
    throw new Error(`[FSM Violation] Illegal transition: ${currentStage} -> ${targetStage}`);
  }
  currentStage = targetStage;
  stageHistory.push(currentStage);
  return currentStage;
}

// Emulate AnswerControlsBar label selector
function getControlBarState(stage, elapsedSeconds) {
  let label = '';
  let warning = null;

  if (stage === 'transcribing') {
    label = 'TRANSCRIBING [WHISPER]...';
    if (elapsedSeconds >= 12) {
      warning = 'Local CPU transcription taking longer than expected...';
    }
  } else if (stage === 'analyzing') {
    label = 'EVALUATING [RUBRIC]...';
    if (elapsedSeconds >= 8) {
      warning = 'Remote evaluation taking longer than expected...';
    }
  } else if (stage === 'recording') {
    label = 'STOP RECORDING [SPACE]';
  } else {
    label = 'SUBMIT ANSWER [ENTER]';
  }

  return { label, warning };
}

// 1. Verify Submit Transition Sequence
console.log('\n[TEST 1] Testing Submit Flow Stage Sequencing:');
console.log('  Initial state:', currentStage);

// Candidate stops recording & clicks Submit
transitionTo('transcribing');
console.log('  -> Transition 1 (Audio recorded):', currentStage);
const transcribingState = getControlBarState(currentStage, 3);
console.log('     Label rendered:', transcribingState.label);
if (transcribingState.label !== 'TRANSCRIBING [WHISPER]...') {
  throw new Error('Label mismatch during transcribing stage!');
}

// Test Whisper warning threshold (<12s vs >=12s)
console.log('\n[TEST 2] Testing Whisper Stage Warning Thresholds (12s threshold):');
const sttNormal = getControlBarState('transcribing', 6);
console.log('  -> At 6s elapsed:', sttNormal.warning || 'No warning (Normal)');
if (sttNormal.warning !== null) throw new Error('Warning fired too early for STT!');

const sttDelayed = getControlBarState('transcribing', 13);
console.log('  -> At 13s elapsed:', sttDelayed.warning);
if (sttDelayed.warning !== 'Local CPU transcription taking longer than expected...') {
  throw new Error('Whisper warning failed to fire at 12s!');
}

// Whisper completes -> transitions to analyzing
transitionTo('analyzing');
console.log('\n[TEST 3] Testing Analyzing Stage Transition & Warning (8s threshold):');
console.log('  -> Transition 2 (Whisper STT complete):', currentStage);
const analyzingState = getControlBarState(currentStage, 2);
console.log('     Label rendered:', analyzingState.label);
if (analyzingState.label !== 'EVALUATING [RUBRIC]...') {
  throw new Error('Label mismatch during analyzing stage!');
}

const llmNormal = getControlBarState('analyzing', 4);
console.log('  -> At 4s elapsed:', llmNormal.warning || 'No warning (Normal)');
if (llmNormal.warning !== null) throw new Error('Warning fired too early for LLM!');

const llmDelayed = getControlBarState('analyzing', 9);
console.log('  -> At 9s elapsed:', llmDelayed.warning);
if (llmDelayed.warning !== 'Remote evaluation taking longer than expected...') {
  throw new Error('LLM warning failed to fire at 8s!');
}

// LLM evaluation completes -> transitions to feedback
transitionTo('feedback');
console.log('\n[TEST 4] Testing Feedback Stage Transition:');
console.log('  -> Transition 3 (Evaluation complete):', currentStage);

console.log('\n[TEST 5] Validating Full Trajectory:');
console.log('  Recorded Stage History:', stageHistory.join(' -> '));

const expectedHistory = ['recording', 'transcribing', 'analyzing', 'feedback'];
if (stageHistory.join(',') !== expectedHistory.join(',')) {
  throw new Error(`Stage history mismatch! Expected: ${expectedHistory.join(',')} got: ${stageHistory.join(',')}`);
}

console.log('\n===============================================================');
console.log('VERIFY AUDIT PASSED: FSM SEQUENCES TRANSCRIBING BEFORE ANALYZING');
console.log('PER-STAGE THRESHOLDS VERIFIED: WHISPER (12s) | LLM (8s)');
console.log('===============================================================');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'walkthrough-data.js'), 'utf8'), context);
const core = context.window.RuleWalkthroughCore;
assert.equal(core.steps.length, 11);
assert.deepEqual(Array.from(core.steps,step=>`${step.id}:${step.role}:${step.page}`),[
  'workspace:host:host-home',
  'competition:host:competition-settings',
  'rules:host:group-settings',
  'submit:school:application',
  'supplement:host:review',
  'roster-before:host:reports',
  'resubmit:school:application',
  'approve:host:review',
  'roster:host:reports',
  'closed:host:closed',
  'public:host:awards',
]);
assert.equal(core.normalize({ step: 99 }).step, 0);
const state = core.blank();
state.choices.submit = '一支隊伍（隊內可多人）';
state.remarks.submit = '先以團隊模式走查，仍待正式確認。';
state.issues.push({ stepId: 'supplement', kind: '流程不符', text: '要求補件後沒有截止日期', expected: '能看到期限' });
const report = core.feedback(state, 'ENG-001 · 待補件');
assert.match(report, /一支隊伍（隊內可多人）/);
assert.match(report, /ENG-001 · 待補件/);
assert.match(report, /要求補件後沒有截止日期/);
assert.match(report, /能看到期限/);
assert.match(report, /未選擇／待確認/);
assert.match(report, /不得當作正式需求/);
console.log('PASS: steps, invalid saved state, selected and pending decisions, issue export.');

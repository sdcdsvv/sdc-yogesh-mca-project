/**
 * Test cases for markdown cleaning
 * Run these to verify markdown is properly cleaned for speech
 */

import { cleanMarkdownForSpeech } from '../textToSpeech';

// Test cases
const testCases = [
  {
    name: 'Bold text',
    input: '**Kedarnath** is a famous temple',
    expected: 'Kedarnath is a famous temple'
  },
  {
    name: 'Italic text',
    input: 'This is *very* important',
    expected: 'This is very important'
  },
  {
    name: 'Bold + Italic',
    input: '***Important notice***',
    expected: 'Important notice'
  },
  {
    name: 'Code blocks',
    input: 'Use `npm install` to install',
    expected: 'Use to install'
  },
  {
    name: 'Headers',
    input: '## Best Places\nKedarnath is great',
    expected: 'Best Places Kedarnath is great'
  },
  {
    name: 'Links',
    input: 'Visit [Kedarnath](https://example.com) temple',
    expected: 'Visit Kedarnath temple'
  },
  {
    name: 'Lists',
    input: '- Item 1\n- Item 2\n- Item 3',
    expected: 'Item 1 Item 2 Item 3'
  },
  {
    name: 'Complex markdown',
    input: '**Kedarnath** is a *famous* temple. Visit [here](url).\n\n- Location: Uttarakhand\n- Altitude: `3,583m`',
    expected: 'Kedarnath is a famous temple. Visit here. Location: Uttarakhand Altitude:'
  },
  {
    name: 'Strikethrough',
    input: '~~Old price~~ New price',
    expected: 'Old price New price'
  },
  {
    name: 'Multiple formatting',
    input: '**Bold** and *italic* and `code` and [link](url)',
    expected: 'Bold and italic and and link'
  }
];

// Run tests
console.log('='.repeat(70));
console.log('MARKDOWN CLEANING TESTS');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = cleanMarkdownForSpeech(test.input);
  const success = result.trim() === test.expected.trim();
  
  console.log(`\nTest ${index + 1}: ${test.name}`);
  console.log(`Input:    "${test.input}"`);
  console.log(`Expected: "${test.expected}"`);
  console.log(`Got:      "${result}"`);
  console.log(`Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('='.repeat(70));

export { testCases };

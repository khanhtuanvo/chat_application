import { completePartialElements, getSafePartialContent } from './markdownUtils';

// Test cases for the markdown completion utility
const testCases = [
  {
    name: "Single unclosed backtick",
    input: "Here is some `code",
    expected: "Here is some `code`"
  },
  {
    name: "Unclosed bold text",
    input: "This is **bold text",
    expected: "This is **bold text**"
  },
  {
    name: "Unclosed italic text",
    input: "This is *italic text",
    expected: "This is *italic text*"
  },
  {
    name: "Unclosed underscore emphasis",
    input: "This is __bold text",
    expected: "This is __bold text__"
  },
  {
    name: "Unclosed triple asterisk",
    input: "This is ***bold italic",
    expected: "This is ***bold italic***"
  },
  {
    name: "Already closed elements (no change)",
    input: "This is `code` and **bold**",
    expected: "This is `code` and **bold**"
  },
  {
    name: "Mixed unclosed elements",
    input: "Here is `code and **bold text",
    expected: "Here is `code and **bold text**`"
  },
  {
    name: "Empty string",
    input: "",
    expected: ""
  }
];

// Function to run tests
function runTests() {
  console.log("🧪 Running Markdown Completion Tests...\n");
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = completePartialElements(testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${testCase.name}`);
      console.log(`   Input:    "${testCase.input}"`);
      console.log(`   Expected: "${testCase.expected}"`);
      console.log(`   Got:      "${result}"`);
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  // Test getSafePartialContent with streaming
  console.log("\n🔄 Testing getSafePartialContent with streaming:");
  const streamingTest = getSafePartialContent("Here is some `code", true);
  console.log(`Input: "Here is some \`code" (streaming: true)`);
  console.log(`Output: "${streamingTest}"`);
  
  return { passed, failed };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runMarkdownTests = runTests;
  console.log("🧪 Markdown tests available. Run 'runMarkdownTests()' in console to test.");
}

export { runTests, testCases }; 
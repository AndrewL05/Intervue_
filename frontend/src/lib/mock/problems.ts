import type { CodingProblem } from '../types'

export const problems: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.',
    ],
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass`,
      javascript: `function twoSum(nums, target) {\n  // Your solution here\n}`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n        return {};\n    }\n};`,
      go: `func twoSum(nums []int, target int) []int {\n    // Your solution here\n    return nil\n}`,
    },
    testCases: [
      { id: 'tc1', input: '[2,7,11,15], 9', expected: '[0,1]', passed: true, actual: '[0,1]' },
      { id: 'tc2', input: '[3,2,4], 6', expected: '[1,2]', passed: true, actual: '[1,2]' },
      { id: 'tc3', input: '[3,3], 6', expected: '[0,1]', passed: false, actual: 'Error: index out of bounds' },
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    constraints: [
      '0 ≤ s.length ≤ 5 × 10⁴',
      's consists of English letters, digits, symbols and spaces.',
    ],
    starterCode: {
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Your solution here\n    pass`,
      javascript: `function lengthOfLongestSubstring(s) {\n  // Your solution here\n}`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your solution here\n        return 0;\n    }\n};`,
      go: `func lengthOfLongestSubstring(s string) int {\n    // Your solution here\n    return 0\n}`,
    },
    testCases: [
      { id: 'tc1', input: '"abcabcbb"', expected: '3', passed: true, actual: '3' },
      { id: 'tc2', input: '"bbbbb"', expected: '1', passed: true, actual: '1' },
      { id: 'tc3', input: '"pwwkew"', expected: '3', passed: true, actual: '3' },
      { id: 'tc4', input: '""', expected: '0', passed: false, actual: 'null' },
    ],
  },
]

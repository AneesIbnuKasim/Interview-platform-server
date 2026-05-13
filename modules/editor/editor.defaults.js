const starterCode = {
  typescript: `// Welcome to your interview\nfunction twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n`,
  javascript: `// Welcome\nfunction add(a, b) { return a + b; }\n`,
  python: `# Welcome\ndef two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n`,
  go: `package main\n\nfunc main() {}\n`,
  java: `class Main {\n  public static void main(String[] args) {}\n}\n`,
  cpp: `#include <iostream>\nint main() { return 0; }\n`,
  rust: `fn main() {}\n`,
};

const defaultLanguage = "typescript";

const supportedLanguages = Object.keys(starterCode);

module.exports = {
  defaultLanguage,
  starterCode,
  supportedLanguages,
};

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'vue'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/html-indent': ['error', 2],
  },
}

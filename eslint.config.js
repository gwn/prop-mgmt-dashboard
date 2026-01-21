const
    globals = require('globals'),
    react = require('eslint-plugin-react')


module.exports = [
    {
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            'no-unused-vars': ['error'],
            'semi': ['error', 'never'],
            'quotes': ['error', 'single'],
            'max-len': ['error', {code: 80}],
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'object-curly-spacing': ['error', 'never'],
            'array-bracket-spacing': ['error', 'never'],
            'comma-dangle': ['error', 'always-multiline'],
        },
    },

    {
        files: ['backend/**/*.js'],
        languageOptions: {sourceType: 'commonjs'},
    },

    {
        files: ['**/*.{jsx,js}'],
        languageOptions: {
            sourceType: 'module',
            parserOptions: {ecmaFeatures: {jsx: true}},
        },
        plugins: {react},
        rules: {
            'react/jsx-uses-vars': 'error',
        },
    },
]

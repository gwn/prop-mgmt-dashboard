const
    {configs} = require('@eslint/js'),
    globals = require('globals')


module.exports = [
    configs.recommended,

    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {...globals.node},
        },

        rules: {
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
]

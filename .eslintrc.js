module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-tabs': 0, //禁止tab键
        'space-before-function-paren': 1, // 函数括号前面要有一个空格
        'no-multi-spaces': 0, //禁止多个空格
        'no-extra-semi': 1, // 禁止不必要的分号
        //'semi': [2, "always"], //自动补充分号
        'no-undef': 1 //不能有未定义的变量
    }
}
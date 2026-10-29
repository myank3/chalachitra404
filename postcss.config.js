export default {
  plugins: {
    'postcss-preset-env': {
      stage: 2,
      features: {
        'oklab-function': true,
        'color-function': true,
        'cascade-layers': true,
      },
      browsers: 'Android >= 5.0',
    },
  },
};
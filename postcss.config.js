import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'

export default {
  plugins: [
    postcssImport,
    postcssPresetEnv({
      stage: 1,
      browsers: [
        '>0.3%',
        'not dead',
        'not ie 11',
        'not op_mini all'
      ]
    })
  ]
}

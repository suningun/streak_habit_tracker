// babel.config.cjs
//
// The .cjs extension is mandatory, not stylistic. package.json declares
// "type": "module", so Node loads a .js file as ESM where `module.exports` is
// undefined. Babel's transformer then fails to construct and Metro dies with a
// misleading "Cannot read properties of undefined (reading 'transformFile')".
module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
  }
}

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeGlobal from 'rollup-plugin-node-globals'

export default ['popup', 'contents', 'options'].map((name, index) => ({
  input: `src/js/${name}.js`,
  output: {
    name,
    format: 'umd',
    dir: 'dist',
  },
  plugins: [commonjs(), resolve(), nodeGlobal(), json()]
}));

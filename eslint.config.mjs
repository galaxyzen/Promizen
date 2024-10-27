import { FlatCompat } from '@eslint/eslintrc'

export default [
  ...new FlatCompat().extends('eslint-config-standard')
]

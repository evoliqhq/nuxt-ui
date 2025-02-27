import { defu } from 'defu'
import type { ModuleOptions } from '../module'
import select from './select'

export default (options: Required<ModuleOptions>) => {
  return defu({
    slots: {
      value: 'truncate',
      placeholder: 'truncate text-[var(--ui-text-dimmed)]',
      input: 'border-b border-[var(--ui-border)]'
    }
  }, select(options))
}

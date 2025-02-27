<script lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'
import type { DropdownMenuRootProps, DropdownMenuRootEmits, DropdownMenuContentProps, DropdownMenuArrowProps } from 'radix-vue'
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '#build/ui/dropdown-menu'
import { extendDevtoolsMeta } from '../composables/extendDevtoolsMeta'
import type { AvatarProps, KbdProps, LinkProps } from '../types'
import type { DynamicSlots, PartialString } from '../types/utils'

const appConfig = _appConfig as AppConfig & { ui: { dropdownMenu: Partial<typeof theme> } }

const dropdownMenu = tv({ extend: tv(theme), ...(appConfig.ui?.dropdownMenu || {}) })

type DropdownMenuVariants = VariantProps<typeof dropdownMenu>

export interface DropdownMenuItem extends Omit<LinkProps, 'type' | 'raw' | 'custom'> {
  label?: string
  icon?: string
  color?: DropdownMenuVariants['color']
  avatar?: AvatarProps
  content?: Omit<DropdownMenuContentProps, 'as' | 'asChild' | 'forceMount'>
  kbds?: KbdProps['value'][] | KbdProps[]
  /**
   * The item type.
   * @defaultValue 'link'
   */
  type?: 'label' | 'separator' | 'link' | 'checkbox'
  slot?: string
  loading?: boolean
  disabled?: boolean
  checked?: boolean
  open?: boolean
  defaultOpen?: boolean
  children?: DropdownMenuItem[] | DropdownMenuItem[][]
  onSelect?(e: Event): void
  onUpdateChecked?(checked: boolean): void
}

export interface DropdownMenuProps<T> extends Omit<DropdownMenuRootProps, 'dir'> {
  size?: DropdownMenuVariants['size']
  items?: T[] | T[][]
  /**
   * The icon displayed when an item is checked.
   * @defaultValue appConfig.ui.icons.check
   */
  checkedIcon?: string
  /**
   * The icon displayed when an item is loading.
   * @defaultValue appConfig.ui.icons.loading
   */
  loadingIcon?: string
  /**
   * The content of the menu.
   * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8 }
   */
  content?: Omit<DropdownMenuContentProps, 'as' | 'asChild' | 'forceMount'>
  /**
   * Display an arrow alongside the menu.
   * @defaultValue false
   */
  arrow?: boolean | Omit<DropdownMenuArrowProps, 'as' | 'asChild'>
  /**
   * Render the menu in a portal.
   * @defaultValue true
   */
  portal?: boolean
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: string
  disabled?: boolean
  class?: any
  ui?: PartialString<typeof dropdownMenu.slots>
}

export interface DropdownMenuEmits extends DropdownMenuRootEmits {}

type SlotProps<T> = (props: { item: T, active?: boolean, index: number }) => any

export type DropdownMenuSlots<T extends { slot?: string }> = {
  'default'(props: { open: boolean }): any
  'item': SlotProps<T>
  'item-leading': SlotProps<T>
  'item-label': SlotProps<T>
  'item-trailing': SlotProps<T>
} & DynamicSlots<T, SlotProps<T>>

extendDevtoolsMeta({
  example: 'DropdownMenuExample',
  ignoreProps: ['items'],
  defaultProps: {
    items: [
      [{
        label: 'My account',
        avatar: {
          src: 'https://avatars.githubusercontent.com/u/739984?v=4'
        },
        type: 'label'
      }], [{
        label: 'Profile',
        icon: 'i-lucide-user',
        slot: 'custom'
      }, {
        label: 'Billing',
        icon: 'i-lucide-credit-card',
        kbds: ['meta', 'b']
      }, {
        label: 'Settings',
        icon: 'i-lucide-cog',
        kbds: ['?']
      }], [{
        label: 'Invite users',
        icon: 'i-lucide-user-plus',
        children: [[{
          label: 'Invite by email',
          icon: 'i-lucide-send-horizontal'
        }, {
          label: 'Invite by link',
          icon: 'i-lucide-link',
          kbds: ['meta', 'i']
        }]]
      }],
      [{
        label: 'GitHub',
        icon: 'i-simple-icons-github',
        to: 'https://github.com/nuxt/ui',
        target: '_blank'
      }, {
        label: 'Support',
        icon: 'i-lucide-life-buoy',
        to: '/components/dropdown-menu'
      }]
    ]
  }
})
</script>

<script setup lang="ts" generic="T extends DropdownMenuItem">
import { computed, toRef } from 'vue'
import { defu } from 'defu'
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuArrow, useForwardPropsEmits } from 'radix-vue'
import { reactivePick } from '@vueuse/core'
import { omit } from '../utils'
import UDropdownMenuContent from './DropdownMenuContent.vue'

const props = withDefaults(defineProps<DropdownMenuProps<T>>(), {
  portal: true,
  modal: true,
  labelKey: 'label'
})
const emits = defineEmits<DropdownMenuEmits>()
const slots = defineSlots<DropdownMenuSlots<T>>()

const rootProps = useForwardPropsEmits(reactivePick(props, 'defaultOpen', 'open', 'modal'), emits)
const contentProps = toRef(() => defu(props.content, { side: 'bottom', sideOffset: 8, collisionPadding: 8 }) as DropdownMenuContentProps)
const arrowProps = toRef(() => props.arrow as DropdownMenuArrowProps)
const proxySlots = omit(slots, ['default']) as Record<string, DropdownMenuSlots<T>[string]>

const ui = computed(() => dropdownMenu({
  size: props.size
}))
</script>

<template>
  <DropdownMenuRoot v-slot="{ open }" v-bind="rootProps">
    <DropdownMenuTrigger v-if="!!slots.default" as-child :class="props.class" :disabled="disabled">
      <slot :open="open" />
    </DropdownMenuTrigger>

    <UDropdownMenuContent
      :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })"
      :ui="ui"
      :ui-override="props.ui"
      v-bind="contentProps"
      :items="items"
      :portal="portal"
      :label-key="labelKey"
      :checked-icon="checkedIcon"
      :loading-icon="loadingIcon"
    >
      <template v-for="(_, name) in proxySlots" #[name]="slotData: any">
        <slot :name="name" v-bind="slotData" />
      </template>

      <DropdownMenuArrow v-if="!!arrow" v-bind="arrowProps" :class="ui.arrow({ class: props.ui?.arrow })" />
    </UDropdownMenuContent>
  </DropdownMenuRoot>
</template>

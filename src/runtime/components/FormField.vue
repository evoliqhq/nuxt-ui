<script lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'
import type { AppConfig } from '@nuxt/schema'
import _appConfig from '#build/app.config'
import theme from '#build/ui/form-field'
import { extendDevtoolsMeta } from '../composables/extendDevtoolsMeta'

const appConfig = _appConfig as AppConfig & { ui: { formField: Partial<typeof theme> } }

const formField = tv({ extend: tv(theme), ...(appConfig.ui?.formField || {}) })

type FormFieldVariants = VariantProps<typeof formField>

export interface FormFieldProps {
  /** The name of the FormField. Also used to match form errors. */
  name?: string
  /** A regular expression to match form error names. */
  errorPattern?: RegExp
  label?: string
  description?: string
  help?: string
  error?: string | boolean
  hint?: string
  size?: FormFieldVariants['size']
  required?: boolean
  eagerValidation?: boolean
  validateOnInputDelay?: number
  class?: any
  ui?: Partial<typeof formField.slots>
}

export interface FormFieldSlots {
  label(props: { label?: string }): any
  hint(props: { hint?: string }): any
  description(props: { description?: string }): any
  help(props: { help?: string }): any
  error(props: { error?: string | boolean }): any
  default(props: { error?: string | boolean }): any
}

extendDevtoolsMeta({ example: 'FormFieldExample', defaultProps: { label: 'Label' } })
</script>

<script setup lang="ts">
import { computed, ref, inject, provide, type Ref, useId } from 'vue'
import { Label } from 'radix-vue'
import { formFieldInjectionKey, inputIdInjectionKey } from '../composables/useFormField'
import type { FormError, FormFieldInjectedOptions } from '../types/form'

const props = defineProps<FormFieldProps>()
const slots = defineSlots<FormFieldSlots>()

const ui = computed(() => formField({
  size: props.size,
  required: props.required
}))

const formErrors = inject<Ref<FormError[]> | null>('form-errors', null)

const error = computed(() => props.error || formErrors?.value?.find(error => error.name === props.name || (props.errorPattern && error.name.match(props.errorPattern)))?.message)

const id = ref(useId())

provide(inputIdInjectionKey, id)

provide(formFieldInjectionKey, computed(() => ({
  error: error.value,
  name: props.name,
  size: props.size,
  eagerValidation: props.eagerValidation,
  validateOnInputDelay: props.validateOnInputDelay,
  errorPattern: props.errorPattern
}) as FormFieldInjectedOptions<FormFieldProps>))
</script>

<template>
  <div :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div :class="ui.wrapper({ class: props.ui?.wrapper })">
      <div v-if="label || !!slots.label" :class="ui.labelWrapper({ class: props.ui?.labelWrapper })">
        <Label :for="id" :class="ui.label({ class: props.ui?.label })">
          <slot name="label" :label="label">
            {{ label }}
          </slot>
        </Label>
        <span v-if="hint || !!slots.hint" :class="ui.hint({ class: props.ui?.hint })">
          <slot name="hint" :hint="hint">
            {{ hint }}
          </slot>
        </span>
      </div>

      <p v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
        <slot name="description" :description="description">
          {{ description }}
        </slot>
      </p>
    </div>

    <div :class="[(label || !!slots.label || description || !!slots.description) && ui.container({ class: props.ui?.container })]">
      <slot :error="error" />

      <p v-if="(typeof error === 'string' && error) || !!slots.error" :class="ui.error({ class: props.ui?.error })">
        <slot name="error" :error="error">
          {{ error }}
        </slot>
      </p>
      <p v-else-if="help || !!slots.help" :class="ui.help({ class: props.ui?.help })">
        <slot name="help" :help="help">
          {{ help }}
        </slot>
      </p>
    </div>
  </div>
</template>

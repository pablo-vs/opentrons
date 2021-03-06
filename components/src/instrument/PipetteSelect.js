// @flow
import * as React from 'react'
import groupBy from 'lodash/groupBy'

import {
  getAllPipetteNames,
  getPipetteNameSpecs,
  GEN1,
  GEN2,
} from '@opentrons/shared-data'
import { Select, CONTEXT_VALUE } from '../forms'
import styles from './PipetteSelect.css'

import type { SelectOption } from '../forms'
import type { PipetteNameSpecs } from '@opentrons/shared-data'

export type PipetteSelectProps = {|
  /** currently selected value, optional in case selecting triggers immediate action */
  pipetteName?: string | null,
  /** react-select change handler */
  onPipetteChange: (pipetteName: string | null) => mixed,
  /** list of pipette names to omit */
  nameBlacklist?: Array<string>,
  /** whether or not "None" shows up as the default option */
  enableNoneOption?: boolean,
  /** input tabIndex */
  tabIndex?: number,
  /** classes to apply to the top-level component */
  className?: string,
|}

// TODO(mc, 2019-10-14): i18n
const NONE = 'None'
const OPTION_NONE = { value: '', label: NONE }

const PIPETTE_SORT = ['maxVolume', 'channels']
const allPipetteNameSpecs: Array<PipetteNameSpecs> = getAllPipetteNames(
  ...PIPETTE_SORT
)
  .map(getPipetteNameSpecs)
  .filter(Boolean)

const specsByCategory = groupBy(allPipetteNameSpecs, 'displayCategory')

const specToOption = ({ name, displayName }: PipetteNameSpecs) => ({
  value: name,
  label: displayName,
})

export const PipetteSelect = (props: PipetteSelectProps) => {
  const { tabIndex, className, enableNoneOption, nameBlacklist = [] } = props
  const whitelist = ({ value }: SelectOption) => {
    return !nameBlacklist.some(n => n === value)
  }
  const gen2Options = specsByCategory[GEN2].map(specToOption).filter(whitelist)
  const gen1Options = specsByCategory[GEN1].map(specToOption).filter(whitelist)
  const groupedOptions = [
    ...(enableNoneOption ? [OPTION_NONE] : []),
    ...(gen2Options.length > 0 ? [{ options: gen2Options }] : []),
    ...(gen1Options.length > 0 ? [{ options: gen1Options }] : []),
  ]

  const defaultValue = enableNoneOption ? OPTION_NONE : null
  const value =
    allPipetteNameSpecs
      .filter(s => s.name === props.pipetteName)
      .map(specToOption)[0] || defaultValue

  return (
    <Select
      isSearchable={false}
      menuPosition="fixed"
      className={className}
      options={groupedOptions}
      value={value}
      defaultValue={defaultValue}
      tabIndex={tabIndex}
      onChange={option => {
        // TODO(mc, 2020-02-03):  change to `option?.value ?? null`
        // when we enable that babel functionality
        const value = option && option.value ? option.value : null
        props.onPipetteChange(value)
      }}
      formatOptionLabel={(option, { context }) => {
        const { value } = option
        const label = option.label || value
        const specs = allPipetteNameSpecs.find(s => s.name === value)

        return context === CONTEXT_VALUE || value === '' || !specs ? (
          label
        ) : (
          <PipetteNameItem {...specs} />
        )
      }}
    />
  )
}

const PipetteNameItem = (props: PipetteNameSpecs) => {
  const { channels, displayName, displayCategory } = props
  const volumeClassMaybeMatch = displayName && displayName.match(/P\d+/)
  const volumeClass = volumeClassMaybeMatch ? volumeClassMaybeMatch[0] : ''

  let displayChannels = ''
  if (channels === 1) {
    displayChannels = 'Single-Channel'
  } else if (channels === 8) {
    displayChannels = '8-Channel'
  }

  return (
    <>
      <div className={styles.pipette_volume_class}>{volumeClass}</div>
      <div className={styles.pipette_channels}>{displayChannels}</div>
      <div className={styles.pipette_category}>{displayCategory}</div>
    </>
  )
}

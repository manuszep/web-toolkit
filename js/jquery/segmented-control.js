/* global window */

import $ from 'jquery'
import registerPlugin from './register-plugin'
import resizeStream from './resize-stream'
import orientationchangeStream from './orientationchange-stream'

// Public class definition
class SegmentedControl {
  static DEFAULTS

  constructor(element, options) {
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.setRadioState = this.setRadioState.bind(this)
    this.stackControlsIfNeeded = this.stackControlsIfNeeded.bind(this)

    this.$element = $(element)
    const disabled = this.$element.is('[disabled=disabled]')

    // TODO: Do not depend on css classes
    this.$radios = this.$element.find('.segmented-control__item__radio')

    this.$radios.each(function () {
      const $radio = $(this)
      if (disabled) {
        $radio.prop('disabled', 'disabled')
      }

      $radio.data('item.element', $radio.closest('.segmented-control__item'))
    })

    this.options = options

    this.init()
  }

  init() {
    this.$radios.prop('tabindex', '-1')
    this.$element.prop('tabindex', '0')

    this.$element.addClass('segmented-control--js')

    this.setRadioState()

    this.$radios.on('change', this.setRadioState)

    this.$element.on('keyup', this.handleKeyUp)
      .on('keydown', this.handleKeyDown)

    this.stackControlsIfNeeded()

    const reorientStream = resizeStream.merge(orientationchangeStream)

    this.disposeReorient = reorientStream.debounce(100)
      .onValue(this.stackControlsIfNeeded)
  }

  stackControlsIfNeeded() {
    const $element = this.$element

    $element.removeClass('segmented-control--stacked')

    const availableWidth = $element.parent().innerWidth()
    const usedWidth = $element[0].scrollWidth

    if (usedWidth >= availableWidth) {
      $element.addClass('segmented-control--stacked')
    }
  }

  // Spacewar will activate first item if none is active
  handleKeyUp(e) {
    if (e.which === 32) {
      e.preventDefault()
      if (this.$radios.filter(':checked').length === 0) {
        const $first = $(this.$radios[0])

        $first.prop('checked', true)
        $first.change()
      }
    }
  }

  // Arrows will activate the next/previous radio
  handleKeyDown(e) {
    let $checked

    switch (e.which) {
      // prevent scrolling
      case 32:
        e.preventDefault()
        break
      // left / up
      case 37:
      // falls through
      case 38:
        e.preventDefault()

        $checked = $(this.$radios.filter(':checked'))

        if ($checked.length !== 0) {
          const $previous = $(this.$radios[this.$radios.index($checked) - 1])

          if (($previous != null) && $previous.length !== 0) {
            $previous.prop('checked', true)
            $previous.change()
          }
        }
        break

      // right / down
      case 39:
      // falls through
      case 40:
        e.preventDefault()

        $checked = $(this.$radios.filter(':checked'))

        // check second radio when none is checked
        if ($checked.length === 0) {
          const $first = $(this.$radios[1])

          if (($first != null) & $first.length !== 0) {
            $first.prop('checked', true)
            $first.change()
          }
        } else {
          const $next = $(this.$radios[this.$radios.index($checked) + 1])

          if (($next != null) && $next.length !== 0) {
            $next.prop('checked', true)
            $next.change()
          }
        }

        break

      // no default
    }
  }

  setRadioState() {
    this.$radios.each((index, element) => {
      const $radio = $(element)
      const $item = $radio.data('item.element')

      if ($radio.is(':checked')) {
        $item.addClass('is-active')
      } else {
        $item.removeClass('is-active')
      }
    })
  }
}

registerPlugin('segmented-control', SegmentedControl)

//! Copyright AXA Versicherungen AG 2015

import React, { PropTypes } from 'react'
import classNames from 'classnames'

export default class AsyncButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      asyncState: null,
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true
  }

  resetState() {
    this.setState({
      asyncState: null,
    })
  }

  handleClick(...args) {
    const clickHandler = this.props.onClick
    if (typeof clickHandler === 'function') {
      this.setState({
        asyncState: 'pending',
      })

      const returnFn = clickHandler(args)
      if (returnFn && typeof returnFn.then === 'function') {
        returnFn.then(() => {
          if (this.isUnmounted) {
            return
          }
          this.setState({
            asyncState: 'fulfilled',
          })
        }).catch((error) => {
          if (this.isUnmounted) {
            return
          }
          this.setState({
            asyncState: 'rejected',
          })
          throw error
        })
      } else {
        this.resetState()
      }
    }
  }

  render() {
    const {
      children,
      text,
      pendingText,
      fulFilledText,
      rejectedText,
      className,
      loadingClass,
      fulFilledClass,
      rejectedClass,
      disabled,
      ...attributes,
    } = this.props

    const { asyncState } = this.state
    const isPending = asyncState === 'pending'
    const isFulfilled = asyncState === 'fulfilled'
    const isRejected = asyncState === 'rejected'
    const isDisabled = disabled || isPending
    const btnClasses = classNames(className, {
      [loadingClass]: isPending,
      [fulFilledClass]: isFulfilled,
      [rejectedClass]: isRejected,
    })
    let buttonText

    if (isPending) {
      buttonText = pendingText
    } else if (isFulfilled) {
      buttonText = fulFilledText
    } else if (isRejected) {
      buttonText = rejectedText
    }
    buttonText = buttonText || text

    return (
      <button
        {...attributes}
        className={btnClasses}
        disabled={isDisabled}
        onClick={() => this.handleClick()}
      >
        {
          typeof children === 'function' ?
          children({
            buttonText,
            isPending,
            isFulfilled,
            isRejected,
          }) : children || buttonText
        }
      </button>
    )
  }
}

AsyncButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]),
  className: PropTypes.string,
  loadingClass: PropTypes.string,
  fulFilledClass: PropTypes.string,
  rejectedClass: PropTypes.string,
  disabled: PropTypes.bool,
  text: PropTypes.string,
  pendingText: PropTypes.string,
  fulFilledText: PropTypes.string,
  rejectedText: PropTypes.string,
  onClick: PropTypes.func,
}

AsyncButton.defaultProps = {
  loadingClass: 'AsyncButton--loading',
  fulFilledClass: 'AsyncButton--fulfilled',
  rejectedClass: 'AsyncButton--rejected',
}

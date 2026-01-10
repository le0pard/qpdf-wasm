export const screenSizeMinMedia = () => window.matchMedia('(max-width: 800px)')

const INITIAL_VISIBILITY = 'both'
const LEFT = 'left'
const RIGHT = 'right'
const initialValue = {
  visible: INITIAL_VISIBILITY
}

const createSplitState = () => {
  let stateObject = $state({...initialValue})

  const toggleFn = (state) => () => {
    if (screenSizeMinMedia().matches) {
      stateObject.visible = state
      return
    }
    if (stateObject.visible === INITIAL_VISIBILITY) {
      stateObject.visible = state
      return
    }

    stateObject.visible = INITIAL_VISIBILITY
  }

  const toggleForMobileFn = (state) => () => {
    stateObject.visible = screenSizeMinMedia().matches ? state : INITIAL_VISIBILITY
  }

  return {
    visibleLeft: () => stateObject.visible == LEFT,
    visibleRight: () => stateObject.visible == RIGHT,
    hideLeft: toggleFn(RIGHT),
    hideRight: toggleFn(LEFT),
    hideForceRight: () => stateObject.visible = LEFT,
    switchToRightOnMobile: toggleForMobileFn(RIGHT),
    switchToLeftOnMobile: toggleForMobileFn(LEFT),
    reset: () => stateObject = { ...initialValue }
  }
}

export const splitState = createSplitState()

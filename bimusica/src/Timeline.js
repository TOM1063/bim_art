import React from "react";
import { styled, alpha, Box } from "@mui/system";
import { Slider as BaseSlider, sliderClasses } from "@mui/base";
import classes from "./Timeline.module.scss";

function Timeline() {
  return (
    <div className={classes.container}>
      <div className={classes.slider}>
        <Slider defaultValue={10} />
      </div>
    </div>
  );
}

const Slider = styled(BaseSlider)(
  ({ theme }) => `
  color: white;
  height: 4px;
  width: 100%;
  padding: 16px 0;
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  touch-action: none;
  margin:0 auto;
  -webkit-tap-highlight-color: transparent;

  &.${sliderClasses.disabled} { 
    pointer-events: none;
    cursor: default;
    color: white ;
    opacity: 0.4;
  }

  & .${sliderClasses.rail} {
    display: block;
    position: absolute;
    width: 100%;
    height: 1px;
    border-radius: 6px;
    background-color: white;
    opacity: 0.3;
  }

  & .${sliderClasses.track} {
    display: block;
    position: absolute;
    height: 1px;
    border-radius: 6px;
    background-color: currentColor;
  }

  & .${sliderClasses.thumb} {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    margin-left: -6px;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border-radius: 50%;
    outline: 0;
    background-color: white;
    transition-property: box-shadow, transform;
    transition-timing-function: ease;
    transition-duration: 120ms;
    transform-origin: center;

    &:hover {
      box-shadow: 0 0 0 6px;
    }

    &.${sliderClasses.focusVisible} {
      box-shadow: 0 0 0 8px ;
      outline: none;
    }

    &.${sliderClasses.active} {
      box-shadow: 0 0 0 8px;
      outline: none;
      transform: scale(1.2);
    }
    
    &.${sliderClasses.disabled} {
      background-color: black;
    }
  }
`
);

export default Timeline;

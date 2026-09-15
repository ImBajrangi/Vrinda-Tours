import React from 'react';
import UseAnimations from 'react-useanimations';
import checkmark from 'react-useanimations/lib/checkmark';
import heart from 'react-useanimations/lib/heart';
import alertCircle from 'react-useanimations/lib/alertCircle';
import alertTriangle from 'react-useanimations/lib/alertTriangle';
import alertOctagon from 'react-useanimations/lib/alertOctagon';
import loading from 'react-useanimations/lib/loading';
import loading2 from 'react-useanimations/lib/loading2';
import loading3 from 'react-useanimations/lib/loading3';
import menu2 from 'react-useanimations/lib/menu2';
import searchToX from 'react-useanimations/lib/searchToX';
import plusToX from 'react-useanimations/lib/plusToX';
import copy from 'react-useanimations/lib/copy';
import share from 'react-useanimations/lib/share';
import star from 'react-useanimations/lib/star';
import bookmark from 'react-useanimations/lib/bookmark';
import info from 'react-useanimations/lib/info';
import help from 'react-useanimations/lib/help';
import lock from 'react-useanimations/lib/lock';
import mail from 'react-useanimations/lib/mail';
import notification from 'react-useanimations/lib/notification';
import visibility from 'react-useanimations/lib/visibility';
import checkBox from 'react-useanimations/lib/checkBox';
import toggle from 'react-useanimations/lib/toggle';

const ANIMATION_MAP = {
  checkmark,
  heart,
  alertCircle,
  alertTriangle,
  alertOctagon,
  loading,
  loading2,
  loading3,
  menu2,
  search: searchToX,
  searchToX,
  plusToX,
  copy,
  share,
  star,
  bookmark,
  info,
  help,
  lock,
  mail,
  notification,
  visibility,
  checkBox,
  toggle,
};

export default function AnimatedIcon({
  name = 'checkmark',
  size = 24,
  strokeColor = '#ffffff',
  fillColor,
  autoplay = true,
  loop = false,
  speed = 1,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const animation = ANIMATION_MAP[name] || checkmark;

  return (
    <span
      className={`vt-use-animation-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        verticalAlign: 'middle',
        cursor: onClick ? 'pointer' : 'inherit',
        ...style,
      }}
      onClick={onClick}
    >
      <UseAnimations
        animation={animation}
        size={size}
        strokeColor={strokeColor}
        fillColor={fillColor}
        autoplay={autoplay}
        loop={loop}
        speed={speed}
        {...props}
      />
    </span>
  );
}

import React from 'react';
import styled from 'styled-components';

import boldIcon from './icons/bold_btn_icon.svg';
import cursiveIcon from './icons/cursive_btn_icon.svg';
import underlineIcon from './icons/underline_btn_icon.svg';
import { inlineStylesType, INLINE_STYLES } from './InlineStyleControls';

interface StyledButtonProps {
  active: boolean,
  inlineStyle: inlineStylesType,
  onToggle: (inlineStyle : inlineStylesType) => void,
}

export const StyledButton = ({ active, inlineStyle, onToggle }: StyledButtonProps) => {
  let className = 'RichEditor-styleButton';

  if (active) {
    className += ' RichEditor-activeButton';
  }

  const toggleHandler = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    onToggle(inlineStyle);
  };

  return (
    <ButtonContainer onMouseDown={toggleHandler}>
      <Button
        className={className}
        type="button"
        inlineStyle={inlineStyle}
        active={active}
      />
    </ButtonContainer>
  );
};

const getIcon = (inlineStyle: inlineStylesType) => {
  if (inlineStyle === INLINE_STYLES.bold) {
    return boldIcon;
  }
  if (inlineStyle === INLINE_STYLES.italic) {
    return cursiveIcon;
  }
  return underlineIcon;
};

const ButtonContainer = styled.div`
  width: 22px;
  height: 22px;
  cursor: pointer;
  padding: 0;
  padding: 7px 4px;
  :hover {
    > button {
      background-color: #DEDEDE;
    }
  }
`;

const Button = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
  border-style: none;
  background: url(${({ inlineStyle }) => (getIcon(inlineStyle))}) no-repeat center;
  background-color: ${({ active }) => (active ? '#DEDEDE' : 'transparent')};
  :hover {
    background-color: #DEDEDE;
  }
`;

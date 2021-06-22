import React from 'react';
import styled from 'styled-components';

import { UnusedSpace } from './UnusedSpace';
import { StyledButton } from './StyledButton';

export const INLINE_STYLES = {
  bold: 'BOLD',
  italic: 'ITALIC',
  underline: 'UNDERLINE'
} as const;

export type inlineStylesType = 'BOLD' | 'ITALIC' | 'UNDERLINE';

interface InlineStyleControlsProps {
  currentInlineStyle: any,
  onToggle: (inlineStyle : inlineStylesType) => void,
  defaultControlsBar?: boolean,
}

export const InlineStyleControls = ({ currentInlineStyle, onToggle, defaultControlsBar = false }: InlineStyleControlsProps) => (
  <ButtonsContainer defaultControlsBar={defaultControlsBar}>
    {defaultControlsBar === false && (<UnusedSpace width="7px" />)}
    {Object.keys(INLINE_STYLES).map((inlineStyle) => (
      <StyledButton
        key={inlineStyle}
        active={currentInlineStyle.has(INLINE_STYLES[inlineStyle])}
        onToggle={onToggle}
        inlineStyle={INLINE_STYLES[inlineStyle]}
      />
    ))}
    <UnusedSpace />
  </ButtonsContainer>
);

const ButtonsContainer = styled.div`
  display: flex;
  border-bottom: ${({ defaultControlsBar }) => defaultControlsBar === false ? '1px solid #D6D6D6;' : 'none'};
  user-select: none;
`;

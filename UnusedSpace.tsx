import React from 'react';
import styled from 'styled-components';

interface UnusedSpaceProps {
  width?: string,
}

export const UnusedSpace = ({ width }: UnusedSpaceProps) => (
  <Container
    onMouseDown={(e: React.MouseEvent<HTMLElement>) => { e.preventDefault(); }}
    width={width}
  />
);

const Container = styled.div`
  width: ${({ width }) => (width || '100%')};
  height: 36px;
`;

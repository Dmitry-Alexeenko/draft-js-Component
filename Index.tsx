import React, { useState, useEffect } from 'react';
import {
  Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, ContentState, Modifier, DraftHandleValue, RawDraftContentState,
} from 'draft-js';
import styled from 'styled-components';
import 'draft-js/dist/Draft.css';

import {
  CancelButton, InputButtonContainer, SaveButton, ButtonsSeparator,
} from '../../styles';
import penIcon from './icons/pen.svg';
import { noop } from '../../../utils/helpers';
import { PageLoader } from '../../loaders';
import { InlineStyleControls, inlineStylesType } from './InlineStyleControls';

interface DraftInputProps {
  content: RawDraftContentState | null,
  changeHandler?: (value: RawDraftContentState | null, onSuccess: Function, onError: Function) => void,
  readOnly?: boolean,
  defaultInput?: boolean,
  defaultControlsBar?: boolean,
  maxLength?: number,
}

export const DraftInput = ({
  content,
  changeHandler = () => {},
  readOnly = false,
  defaultInput = false,
  defaultControlsBar = false,
  maxLength = 1000,
}: DraftInputProps) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editorState, setEditorState] = useState(updateEditorState());

  useEffect(() => {
    setEditorState(updateEditorState());
  }, [content]);

  function updateEditorState() {
    if (content?.blocks) {
      return EditorState.createWithContent(convertFromRaw(content));
    }
    return EditorState.createEmpty();
  }

  const handleKeyCommand = (command: string, editorST: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorST, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (inlineStyle: inlineStylesType) => {
    setEditorState(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle,
      ),
    );
  };

  const saveWithLoading = () => {
    if (isLoading) return;

    const onSuccess = () => {
      setIsLoading(false);
      changeEditMode();
    };
    const onError = () => {
      changeEditMode();
      setIsLoading(false);
    };

    const contentState = editorState.getCurrentContent();
    const text = contentState.getPlainText().trim();

    let newContent: RawDraftContentState | null = null;

    if (text.length !== 0) {
      newContent = convertToRaw(contentState);
    }

    setIsLoading(true);
    changeHandler(newContent, onSuccess, onError);
    setEditorState(editorState);
  };

  const save = () => {
    const contentState = editorState.getCurrentContent();

    changeHandler(convertToRaw(contentState), noop, noop);
  };

  const cancel = () => {
    setEditorState(updateEditorState());
    changeEditMode();
  };

  const changeEditMode = () => {
    setIsEditMode((prevValue) => {
      if (!prevValue) {
        setEditorState(EditorState.moveFocusToEnd(editorState));
      }
      return !prevValue;
    });
  };

  const changeState = (editorST: EditorState) => {
    const newEditorStateContent = editorST.getCurrentContent();

    if (newEditorStateContent.getPlainText().length <= maxLength) {
      setEditorState(editorST);
    } else {
      const eState = EditorState.undo(
        EditorState.push(
          editorState,
          ContentState.createFromText(newEditorStateContent.getPlainText().slice(0, maxLength)),
          'delete-character',
        ),
      );
      setEditorState(eState);
    }
  };

  const handlePastedText = (text: string): DraftHandleValue => {
    const editorStateContent = editorState.getCurrentContent();
    const editorStateSection = editorState.getSelection();
    const isCollapsed = editorStateSection.isCollapsed();

    if (Boolean(text) === false || isCollapsed === false) return 'not-handled';

    const existTextLength = editorStateContent.getPlainText().length;

    let newText = '';
    if ((maxLength - existTextLength) > text.length) {
      newText = text;
    } else {
      newText = text.slice(0, maxLength - existTextLength);
    }

    setEditorState(EditorState.push(
      editorState,
      Modifier.insertText(editorStateContent, editorStateSection, newText),
      'insert-characters',
    ));

    return 'handled';
  };

  if (defaultInput) {
    return (
      <DefaultEditorContainer>

        <InlineStyleControls
          defaultControlsBar={defaultControlsBar}
          currentInlineStyle={editorState.getCurrentInlineStyle()}
          onToggle={toggleInlineStyle}
        />

        <Editor
          editorState={editorState}
          onChange={changeState}
          onBlur={save}
          handleKeyCommand={handleKeyCommand}
          handlePastedText={handlePastedText}
          spellCheck
        />

      </DefaultEditorContainer>
    );
  }

  if (readOnly || !isEditMode) {
    return (
      <EditorContainer
        readOnly={readOnly}
        onClick={!readOnly ? changeEditMode : noop}
        isEditMode={isEditMode}
      >
        <Editor
          editorState={editorState}
          onChange={noop}
          placeholder="Нажмите для ввода условий"
          readOnly
        />
      </EditorContainer>
    );
  }

  return (
    <form onSubmit={saveWithLoading}>
      <EditorContainer isEditMode={isEditMode}>
        <PageLoader loading={isLoading} />

        <InlineStyleControls
          currentInlineStyle={editorState.getCurrentInlineStyle()}
          onToggle={toggleInlineStyle}
        />

        <Editor
          editorState={editorState}
          onChange={changeState}
          onBlur={saveWithLoading}
          handleKeyCommand={handleKeyCommand}
          handlePastedText={handlePastedText}
          spellCheck
        />

        <InputBtnContainer>
          <SaveButton type="button" />
          <ButtonsSeparator />
          <CancelButton type="button" onMouseDown={isLoading ? noop : cancel} />
        </InputBtnContainer>
      </EditorContainer>
    </form>
  );
};

const EditorContainer = styled.div`
  position: relative;
  border-radius: 6px;
  box-sizing: border-box;
  margin-left: -4px;
  border: 4px solid ${({ readOnly, isEditMode }) => (readOnly ? ' transparent' : isEditMode ? '#D2E9C4' : 'transparent')};
  height: auto;
  cursor: ${({ readOnly }) => (readOnly ? 'auto' : 'pointer')};
  &:after {
    content: '';
    position: absolute;
    display: none;
    right: -17px;
    top: 0;
    z-index: 1;
    width: 25px;
    height: 100%;
    background: url(${penIcon}) no-repeat center 8px #E4E4E4;
    border-radius: 0px 3px 3px 0px;
  }
  &:hover:after {
    display: ${({ readOnly, isEditMode }) => (readOnly ? 'none' : isEditMode ? 'none' : 'block')};
  }
  .DraftEditor-editorContainer {
    z-index: 0;
  }
  .public-DraftEditor-content {
    overflow: auto;
    font-family: Open Sans, sans-serif;
    font-size: 16px;
    line-height: 150%;
    color: #4A4A4A;
    padding: 12px 5px 12px 15px;
    margin-right: 5px;
    border-radius: 6px;
    min-height: ${({ readOnly, isEditMode }) => (readOnly ? 'auto' : isEditMode ? '100px' : 'auto')};
    max-height: ${({ readOnly, isEditMode }) => (readOnly ? 'auto' : isEditMode ? '380px' : 'auto')};
    background-color: ${({ readOnly, isEditMode }) => (readOnly ? '#F8F8F8' : isEditMode ? 'transparent' : '#F8F8F8')};
  }
  .public-DraftEditorPlaceholder-root {
    top: 12px;
    left: 15px;
    z-index: 1;
    font-family: Open Sans, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 150%;
    color: #B0B0B0;
  }
`;

const InputBtnContainer = styled(InputButtonContainer)`
  bottom: -45px;
`;

const DefaultEditorContainer = styled.div`
  font-family: Open Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 150%;

  color: #4A4A4A;
`;

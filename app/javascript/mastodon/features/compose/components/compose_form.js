import React from 'react';
import CharacterCounter from './character_counter';
import Button from '../../../components/button';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import ReplyIndicatorContainer from '../containers/reply_indicator_container';
import AutosuggestTextarea from '../../../components/autosuggest_textarea';
import UploadButtonContainer from '../containers/upload_button_container';
import { defineMessages, injectIntl } from 'react-intl';
import SpoilerButtonContainer from '../containers/spoiler_button_container';
import PrivacyDropdownContainer from '../containers/privacy_dropdown_container';
import DropdownMenuContainer from '../../../containers/dropdown_menu_container';
import SensitiveButtonContainer from '../containers/sensitive_button_container';
import EmojiPickerDropdown from '../containers/emoji_picker_dropdown_container';
import UploadFormContainer from '../containers/upload_form_container';
import WarningContainer from '../containers/warning_container';
import { isMobile } from '../../../is_mobile';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { length } from 'stringz';
import { countableText } from '../util/counter';

const allowedAroundShortCode = '><\u0085\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\u0009\u000a\u000b\u000c\u000d';

import AZURE_LANGS from '../../../locales/translate_languages_azure.json';
import GOOGLE_LANGS from '../../../locales/translate_languages_google.json';

const TRANSLATE_LANGS = process.env.TRANSLATE_SERVICE === 'azure' ? AZURE_LANGS : GOOGLE_LANGS;

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What is on your mind?' },
  spoiler_placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Write your warning here' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Toot' },
  publishLoud: { id: 'compose_form.publish_loud', defaultMessage: '{publish}!' },
  translate: { id: 'status.translate', defaultMessage: 'Translate' },
  publish_without_community: { id: 'compose_form.publish_without_community', defaultMessage: 'Toot without Local' },
});

@injectIntl
export default class ComposeForm extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    suggestion_token: PropTypes.string,
    suggestions: ImmutablePropTypes.list,
    spoiler: PropTypes.bool,
    privacy: PropTypes.string,
    spoiler_text: PropTypes.string,
    focusDate: PropTypes.instanceOf(Date),
    caretPosition: PropTypes.number,
    preselectDate: PropTypes.instanceOf(Date),
    is_submitting: PropTypes.bool,
    is_uploading: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClearSuggestions: PropTypes.func.isRequired,
    onFetchSuggestions: PropTypes.func.isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    onChangeSpoilerText: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    onInsertYomigana: PropTypes.func.isRequired,
    showSearch: PropTypes.bool,
    anyMedia: PropTypes.bool,
  };

  static defaultProps = {
    showSearch: false,
  };

  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      this.handleSubmit(false);
    } else if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit();
    }
  }

  handleSubmit = (withCommunity = true) => {
    if (this.props.text !== this.autosuggestTextarea.textarea.value) {
      // Something changed the text inside the textarea (e.g. browser extensions like Grammarly)
      // Update the state to match the current text
      this.props.onChange(this.autosuggestTextarea.textarea.value);
    }


    // Submit disabled:
    const { is_submitting, is_uploading, anyMedia } = this.props;
    const fulltext = [this.props.spoiler_text, countableText(this.props.text)].join('');

    if (is_submitting || is_uploading || length(fulltext) > 1000 || (fulltext.length !== 0 && fulltext.trim().length === 0 && !anyMedia)) {
      return;
    }

    this.props.onSubmit(withCommunity);
  }

  handleSubmitWithoutCommunity = () => {
    this.handleSubmit(false);
  }

  onSuggestionsClearRequested = () => {
    this.props.onClearSuggestions();
  }

  onSuggestionsFetchRequested = (token) => {
    this.props.onFetchSuggestions(token);
  }

  onSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value);
  }

  handleChangeSpoilerText = (e) => {
    this.props.onChangeSpoilerText(e.target.value);
  }

  componentDidUpdate (prevProps) {
    // This statement does several things:
    // - If we're beginning a reply, and,
    //     - Replying to zero or one users, places the cursor at the end of the textbox.
    //     - Replying to more than one user, selects any usernames past the first;
    //       this provides a convenient shortcut to drop everyone else from the conversation.
    if (this.props.focusDate !== prevProps.focusDate) {
      let selectionEnd, selectionStart;

      if (this.props.preselectDate !== prevProps.preselectDate) {
        selectionEnd = this.props.text.length;
        selectionStart = this.props.text.search(/\s/) + 1;
      } else if (typeof this.props.caretPosition === 'number') {
        selectionStart = this.props.caretPosition;
        selectionEnd   = this.props.caretPosition;
      } else {
        selectionEnd = this.props.text.length;
        selectionStart = selectionEnd;
      }

      this.autosuggestTextarea.textarea.setSelectionRange(selectionStart, selectionEnd);
      this.autosuggestTextarea.textarea.focus();
    } else if (prevProps.is_submitting && !this.props.is_submitting) {
      this.autosuggestTextarea.textarea.focus();
    }

    if (this.props.spoiler !== prevProps.spoiler) {
      if (this.props.spoiler) {
        this.spoilerText.focus();
      } else {
        this.autosuggestTextarea.textarea.focus();
      }
    }
  }

  setAutosuggestTextarea = (c) => {
    this.autosuggestTextarea = c;
  }

  setSpoilerText = (c) => {
    this.spoilerText = c;
  }

  handleEmojiPick = (data) => {
    const { text }     = this.props;
    const position     = this.autosuggestTextarea.textarea.selectionStart;
    const needsSpace   = data.custom && position > 0 && !allowedAroundShortCode.includes(text[position - 1]);

    this.props.onPickEmoji(position, data, needsSpace);
  }

  handleTranslate = (lang) => {
    this.props.onTranslate(this.autosuggestTextarea.textarea.value, lang);
  }

  handleRandomizeClick = () => {
    this.props.onRandomize(this.autosuggestTextarea.textarea.value);
  }

  handleYomiganaClick = () => {
    const selectionStart = this.autosuggestTextarea.textarea.selectionStart;
    const selectionEnd = this.autosuggestTextarea.textarea.selectionEnd;
    const text = this.autosuggestTextarea.textarea.value;
    this.props.onInsertYomigana(selectionStart, selectionEnd, text);
  }

  handleNarakuClick() {
    const textarea = document.querySelector('textarea.autosuggest-textarea__textarea');
    textarea.value = textarea.innerHTML
      // hiragana to katakana
      .replace(/[\u3041-\u3096]/g, s => String.fromCodePoint(s.charCodeAt(0) + 0x60))
      // katakana to naraku-moji
      .replace(/[\u30a1-\u30ef\u30f2\u30f3\u30fc]/g, s => '\u200b:nrk' + s.codePointAt(0).toString(16) + ':\u200b')
      // trim duplicate zero-width-space
      .replace(/\u200b+/g, '\u200b');
    return false;
  }

  handleOekakiClick() {
    window.open('https://mamemomonga.github.io/mastodon-custom-emoji-oekaki/#theboss.tech');
    return false;
  }

  render () {
    const { intl, onPaste, showSearch, anyMedia } = this.props;
    const disabled = this.props.is_submitting;
    const text     = [this.props.spoiler_text, countableText(this.props.text)].join('');
    const disabledButton = disabled || this.props.is_uploading || length(text) > 1000 || (text.length !== 0 && text.trim().length === 0 && !anyMedia);
    let publishText = '';

    if (this.props.privacy === 'private' || this.props.privacy === 'direct') {
      publishText = <span className='compose-form__publish-private'><i className='fa fa-lock' /> {intl.formatMessage(messages.publish)}</span>;
    } else {
      publishText = this.props.privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: intl.formatMessage(messages.publish) }) : intl.formatMessage(messages.publish);
    }

    const menu = [];
    Object.keys(TRANSLATE_LANGS).map(langCode => menu.push({ text: `${langCode} : ${TRANSLATE_LANGS[langCode]}`, action: () => this.handleTranslate(langCode) }));

    return (
      <div className='compose-form'>
        <WarningContainer />

        <ReplyIndicatorContainer />

        <div className={`spoiler-input ${this.props.spoiler ? 'spoiler-input--visible' : ''}`}>
          <label>
            <span style={{ display: 'none' }}>{intl.formatMessage(messages.spoiler_placeholder)}</span>
            <input placeholder={intl.formatMessage(messages.spoiler_placeholder)} value={this.props.spoiler_text} onChange={this.handleChangeSpoilerText} onKeyDown={this.handleKeyDown} type='text' className='spoiler-input__input'  id='cw-spoiler-input' ref={this.setSpoilerText} />
          </label>
        </div>

        <div className='compose-form__autosuggest-wrapper'>
          <AutosuggestTextarea
            ref={this.setAutosuggestTextarea}
            placeholder={intl.formatMessage(messages.placeholder)}
            disabled={disabled}
            value={this.props.text}
            onChange={this.handleChange}
            suggestions={this.props.suggestions}
            onKeyDown={this.handleKeyDown}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionSelected={this.onSuggestionSelected}
            onPaste={onPaste}
            autoFocus={!showSearch && !isMobile(window.innerWidth)}
          />

          <EmojiPickerDropdown onPickEmoji={this.handleEmojiPick} />
        </div>

        <div className='compose-form__modifiers'>
          <UploadFormContainer />
        </div>

        <div className='compose-form__buttons-wrapper'>
          <div className='compose-form__buttons'>
            <UploadButtonContainer />
            <PrivacyDropdownContainer />
            <SensitiveButtonContainer />
            <SpoilerButtonContainer />
            <DropdownMenuContainer items={menu} icon='language' size={18} direction='right' title={intl.formatMessage(messages.translate)} dropdownMenuClassName='scrollableDropdownMenu' />
          </div>
          <div className='character-counter__wrapper'><CharacterCounter max={1000} text={text} /></div>
        </div>

        <div className='compose-form__publish'>
          <div className='compose-form__publish-button-wrapper'><Button text={publishText} onClick={this.handleSubmit} disabled={disabledButton} block /></div>
        </div>

        <div className='compose-form__publish'>
          <div className='compose-form__publish-button-wrapper'><Button text={intl.formatMessage(messages.publish_without_community)} onClick={this.handleSubmitWithoutCommunity} disabled={disabledButton} block secondary /></div>
        </div>

        <div>
          <Button text='Randomize with Regex' onClick={this.handleRandomizeClick} block style={{ marginTop: '10px' }} />
          <Button text='読み仮名を挿入' onClick={this.handleYomiganaClick} block style={{ marginTop: '10px' }} />
          <Button text='奈落文字に変換する' onClick={this.handleNarakuClick} block style={{ marginTop: '10px' }} />
          <Button text='絵文字でお絵かきツールを開く' onClick={this.handleOekakiClick} block style={{ marginTop: '10px' }} />
        </div>
      </div>
    );
  }

}

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import StatusListContainer from '../../ui/containers/status_list_container';
import { expandPublicTimeline } from '../../../actions/timelines';
import Column from '../../../components/column';
import ColumnHeader from '../../../components/column_header';
import { defineMessages, injectIntl } from 'react-intl';
import { connectPublicStream } from '../../../actions/streaming';

const messages = defineMessages({
  public: { id: 'standalone.public_title', defaultMessage: 'A look inside...' },
  community: { id: 'standalone.community_title', defaultMessage: 'A look inside...' },
});

@connect()
@injectIntl
export default class PublicTimeline extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = { isCommunity : true };
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleHeaderClick = () => {
    this.setState({ isCommunity : !this.state.isCommunity });
    this.column.scrollTop();
  }

  setRef = c => {
    this.column = c;
  }

  componentDidMount () {
    const { dispatch } = this.props;

    dispatch(expandPublicTimeline());
    this.disconnect = dispatch(connectPublicStream());
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  handleLoadMore = maxId => {
    this.props.dispatch(expandPublicTimeline({ maxId }));
  }

  render () {
    const { intl } = this.props;

    return (
      <Column ref={this.setRef}>
        <ColumnHeader
          icon='globe'
          title={intl.formatMessage(this.state.isCommunity ? messages.community : messages.public)}
          onClick={this.handleHeaderClick}
        />

        <StatusListContainer
          timelineId='public'
          onLoadMore={this.handleLoadMore}
          scrollKey='standalone_public_timeline'
          trackScroll={false}
        />
      </Column>
    );
  }

}

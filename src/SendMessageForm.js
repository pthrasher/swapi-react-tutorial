import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { uniqueId, uniqBy } from 'lodash';

const updateQuery = gql`
  query UpdateMessagesMutationQuery {
    messages {
      id
      timestamp
      username
      messageBody
    }
  }
`;

// const markOptimistic = (obj) => {
//   return {
//     ...obj,
//     [IsOptimistic]: true,
//   }
// }

class SendMessageForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  };
  
  state = {
    username: '',
    messageBody: '',
  };
  
  onUsernameChange = (event) => {
    this.setState({username: event.target.value});
  }
  
  onMessageBodyChange = (event) => {
    this.setState({messageBody: event.target.value});
  }
  
  sendMessage = () => {
    this.props.onSubmit({
      optimisticResponse: {
        __typename: 'Mutation',
        addMessage: {
          __typename: 'Message',
          id: uniqueId('TEMPORARY'),
          timestamp: +new Date(),
          username: this.state.username,
          messageBody: this.state.messageBody,
        },
      },
      update: (proxy, { data: { addMessage } }) => {
        const data = proxy.readQuery({ query: updateQuery });
        
        data.messages = uniqBy([...data.messages, addMessage], 'id');
        
        proxy.writeQuery({ query: updateQuery, data });
      },
      variables: {
        username: this.state.username,
        messageBody: this.state.messageBody
      }
    });
  }
  
  render() {
    return (
      <div>
        <input type="text" placeholder="username..." value={this.state.username} onChange={this.onUsernameChange} />
        <input type="text" placeholder="message body..." value={this.state.messageBody} onChange={this.onMessageBodyChange} />
        <button onClick={this.sendMessage}>Send</button>
      </div>
    );
  }
}


export default SendMessageForm;

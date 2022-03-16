import {
  EthereumAccount,
  Field,
  Textarea,
  useWeb3
} from "@kleros/components";
import React from "react";
import { Alert, Form, Button, Input, Row, Space, Typography } from 'antd';
const { Link, Paragraph, Title } = Typography;
export default class PostSubmitTab extends React.Component {
  constructor(props) {
    super(props);
    console.log('Final steps props=', props);
  }
  render() {
    return (
    <Title>Final steps!</Title>
    )}
}
import { Typography } from "antd";

const { Title, Paragraph } = Typography;
export function Custom404() {
  return (
    <>
      <Title level={1}>404 - Page Not Found</Title>
      <Paragraph>
        The requested page does not exist. Please try again.
      </Paragraph>
    </>
  );
}

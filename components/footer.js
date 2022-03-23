import { Dropdown, Menu, message, Layout } from 'antd';
import { useTranslation } from 'react-i18next';

const { Header, Footer, Sider, Content } = Layout;

export default function AppFooter() {
  const { t, i18n } = useTranslation();


  return (
    <Footer>
      Footer
    </Footer>
  );
}

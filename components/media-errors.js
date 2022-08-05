import { Typography } from "antd";

const { Paragraph, Title } = Typography;

export default function MediaErrors({
  cameraPermission,
  userMediaError,
  i18n,
}) {
  const { t } = i18n;

  if (!cameraPermission) {
    return (
      <>
        <Title level={2}>{t("submit_profile_missing_permissions")}</Title>
        <Paragraph style={{ color: "black", whiteSpace: "pre-line" }}>
          {t("submit_profile_missing_permissions_description")}
        </Paragraph>
      </>
    );
  }
  if (userMediaError === "NoCamera") {
    return (
      <>
        <Title level={2}>{t("submit_profile_missing_camera")}</Title>
        <Paragraph style={{ color: "black", whiteSpace: "pre-line" }}>
          {t("submit_profile_missing_camera_description")}
        </Paragraph>
      </>
    );
  }
  if (userMediaError === "NoConstraints") {
    return (
      <>
        <Title level={2}>{t("submit_profile_missing_constraints")}</Title>
        <Paragraph style={{ color: "black", whiteSpace: "pre-line" }}>
          {t("submit_profile_missing_constraints_description")}
        </Paragraph>
      </>
    );
  }
  return null;
}
